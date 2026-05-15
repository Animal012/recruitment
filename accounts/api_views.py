import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from .forms import RegisterForm
from .models import ApplicantProfile, EmployerProfile
from .utils import extract_pdf_text


def json_body(request):
    try:
        return json.loads(request.body)
    except Exception:
        return {}


@ensure_csrf_cookie
def csrf_view(request):
    return JsonResponse({'csrfToken': get_token(request)})


@ensure_csrf_cookie
def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False}, status=401)
    u = request.user
    data = {
        'authenticated': True,
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'first_name': u.first_name,
        'last_name': u.last_name,
        'full_name': u.get_full_name(),
        'role': u.role,
    }
    return JsonResponse(data)


@require_http_methods(['POST'])
def api_login(request):
    body = json_body(request)
    username = body.get('username', '')
    password = body.get('password', '')
    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'error': 'Неверный логин или пароль'}, status=400)
    login(request, user)
    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'full_name': user.get_full_name(),
    })


@require_http_methods(['POST'])
def api_logout(request):
    logout(request)
    return JsonResponse({'ok': True})


@require_http_methods(['POST'])
def api_register(request):
    body = json_body(request)
    form = RegisterForm(body)
    if form.is_valid():
        user = form.save()
        if user.role == 'applicant':
            ApplicantProfile.objects.create(user=user)
        else:
            EmployerProfile.objects.create(user=user, organization_name='')
        login(request, user)
        return JsonResponse({'id': user.id, 'username': user.username, 'role': user.role})
    return JsonResponse({'errors': form.errors}, status=400)


def api_applicant_profile(request):
    if not request.user.is_authenticated or not request.user.is_applicant():
        return JsonResponse({'error': 'Forbidden'}, status=403)

    profile, _ = ApplicantProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        educations = list(profile.educations.values(
            'id', 'institution', 'degree', 'field_of_study', 'start_year', 'end_year'
        ))
        experiences = list(profile.experiences.values(
            'id', 'company', 'position', 'start_date', 'end_date', 'is_current', 'description'
        ))
        for e in experiences:
            if e['start_date']:
                e['start_date'] = str(e['start_date'])
            if e['end_date']:
                e['end_date'] = str(e['end_date'])
        return JsonResponse({
            'photo': profile.photo.url if profile.photo else None,
            'birth_date': str(profile.birth_date) if profile.birth_date else '',
            'phone': profile.phone,
            'city': profile.city,
            'about': profile.about,
            'resume_file': profile.resume_file.url if profile.resume_file else None,
            'educations': educations,
            'experiences': experiences,
        })

    if request.method == 'POST':
        data = request.POST
        profile.phone = data.get('phone', profile.phone)
        profile.city = data.get('city', profile.city)
        profile.about = data.get('about', profile.about)
        birth_date = data.get('birth_date', '')
        if birth_date:
            profile.birth_date = birth_date
        if 'photo' in request.FILES:
            profile.photo = request.FILES['photo']
        profile.save()

        # education
        edu_data = request.POST.getlist('educations')
        if edu_data:
            import json as _json
            edus = _json.loads(edu_data[0])
            existing_ids = {e['id'] for e in edus if e.get('id')}
            profile.educations.exclude(id__in=existing_ids).delete()
            for edu in edus:
                if edu.get('id'):
                    profile.educations.filter(id=edu['id']).update(
                        institution=edu.get('institution', ''),
                        degree=edu.get('degree', ''),
                        field_of_study=edu.get('field_of_study', ''),
                        start_year=edu.get('start_year') or 0,
                        end_year=edu.get('end_year') or None,
                    )
                else:
                    if edu.get('institution') and edu.get('start_year'):
                        profile.educations.create(
                            institution=edu.get('institution', ''),
                            degree=edu.get('degree', ''),
                            field_of_study=edu.get('field_of_study', ''),
                            start_year=edu.get('start_year') or 0,
                            end_year=edu.get('end_year') or None,
                        )

        exp_data = request.POST.getlist('experiences')
        if exp_data:
            import json as _json
            exps = _json.loads(exp_data[0])
            existing_ids = {e['id'] for e in exps if e.get('id')}
            profile.experiences.exclude(id__in=existing_ids).delete()
            for exp in exps:
                is_current = exp.get('is_current', False)
                end_date = exp.get('end_date') or None
                if is_current:
                    end_date = None
                if exp.get('id'):
                    profile.experiences.filter(id=exp['id']).update(
                        company=exp.get('company', ''),
                        position=exp.get('position', ''),
                        start_date=exp.get('start_date') or None,
                        end_date=end_date,
                        is_current=is_current,
                        description=exp.get('description', ''),
                    )
                else:
                    if exp.get('company') and exp.get('position') and exp.get('start_date'):
                        profile.experiences.create(
                            company=exp.get('company', ''),
                            position=exp.get('position', ''),
                            start_date=exp.get('start_date'),
                            end_date=end_date,
                            is_current=is_current,
                            description=exp.get('description', ''),
                        )

        return JsonResponse({'ok': True})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@require_http_methods(['POST'])
def api_upload_resume(request):
    if not request.user.is_authenticated or not request.user.is_applicant():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    profile, _ = ApplicantProfile.objects.get_or_create(user=request.user)
    pdf_file = request.FILES.get('resume_file')
    if not pdf_file:
        return JsonResponse({'error': 'Файл не передан'}, status=400)
    if not pdf_file.name.lower().endswith('.pdf'):
        return JsonResponse({'error': 'Только PDF'}, status=400)
    profile.resume_file = pdf_file
    profile.resume_text = extract_pdf_text(pdf_file)
    profile.save(update_fields=['resume_file', 'resume_text'])
    return JsonResponse({'url': profile.resume_file.url})


@require_http_methods(['POST'])
def api_delete_resume(request):
    if not request.user.is_authenticated or not request.user.is_applicant():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    profile = request.user.applicant_profile
    if profile.resume_file:
        profile.resume_file.delete(save=False)
    profile.resume_file = None
    profile.resume_text = ''
    profile.save(update_fields=['resume_file', 'resume_text'])
    return JsonResponse({'ok': True})


def api_employer_profile(request):
    if not request.user.is_authenticated or not request.user.is_employer():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    profile, _ = EmployerProfile.objects.get_or_create(
        user=request.user, defaults={'organization_name': ''}
    )
    if request.method == 'GET':
        return JsonResponse({
            'organization_name': profile.organization_name,
            'address': profile.address,
            'phone': profile.phone,
            'website': profile.website,
            'description': profile.description,
        })
    if request.method == 'POST':
        body = json_body(request)
        profile.organization_name = body.get('organization_name', profile.organization_name)
        profile.address = body.get('address', profile.address)
        profile.phone = body.get('phone', profile.phone)
        profile.website = body.get('website', profile.website)
        profile.description = body.get('description', profile.description)
        profile.save()
        return JsonResponse({'ok': True})
    return JsonResponse({'error': 'Method not allowed'}, status=405)
