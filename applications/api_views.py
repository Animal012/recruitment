import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST

from vacancies.models import Vacancy

from .models import Application
from .screening import run_screening


@login_required
def api_my_applications(request):
    apps = Application.objects.filter(
        applicant=request.user, withdrawn=False
    ).select_related('vacancy__employer__employer_profile')
    results = []
    for app in apps:
        v = app.vacancy
        org = ''
        try:
            org = v.employer.employer_profile.organization_name
        except Exception:
            pass
        results.append({
            'id': app.id,
            'vacancy_id': v.id,
            'vacancy_title': v.title,
            'employer_name': org,
            'status': app.status,
            'status_display': app.get_status_display(),
            'created_at': app.created_at.strftime('%d.%m.%Y'),
        })
    return JsonResponse({'results': results})


@login_required
@require_POST
def api_apply(request, pk):
    if not request.user.is_applicant():
        return JsonResponse({'error': 'Только соискатели могут откликаться'}, status=403)
    vacancy = get_object_or_404(Vacancy, pk=pk, status=Vacancy.OPEN)
    if Application.objects.filter(applicant=request.user, vacancy=vacancy).exists():
        return JsonResponse({'error': 'Вы уже откликались на эту вакансию'}, status=400)
    try:
        if not request.user.applicant_profile.resume_data:
            return JsonResponse({'error': 'no_resume'}, status=400)
    except Exception:
        return JsonResponse({'error': 'no_resume'}, status=400)
    application = Application.objects.create(
        applicant=request.user,
        vacancy=vacancy,
    )
    run_screening(application)
    return JsonResponse({'id': application.id}, status=201)


@login_required
def api_all_employer_applications(request):
    if not request.user.is_employer():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    apps = Application.objects.filter(
        vacancy__employer=request.user
    ).select_related('applicant__applicant_profile', 'vacancy', 'screening_result').order_by('-created_at')
    results = []
    for app in apps:
        screening = None
        try:
            screening = {'score': app.screening_result.score}
        except Exception:
            pass
        city = ''
        try:
            city = app.applicant.applicant_profile.city
        except Exception:
            pass
        name = ''
        try:
            name = app.applicant.applicant_profile.full_name()
        except Exception:
            name = app.applicant.username
        results.append({
            'id': app.id,
            'applicant_id': app.applicant.id,
            'applicant_name': name,
            'applicant_city': city,
            'vacancy_id': app.vacancy.id,
            'vacancy_title': app.vacancy.title,
            'status': app.status,
            'status_display': app.get_status_display(),
            'created_at': app.created_at.strftime('%d.%m.%Y'),
            'screening': screening,
        })
    return JsonResponse({
        'results': results,
        'status_choices': [{'value': v, 'label': l} for v, l in Application.STATUS_CHOICES],
    })


@login_required
def api_vacancy_applications(request, pk):
    if not request.user.is_employer():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    vacancy = get_object_or_404(Vacancy, pk=pk, employer=request.user)
    apps = Application.objects.filter(
        vacancy=vacancy
    ).select_related('applicant__applicant_profile', 'screening_result').order_by(
        '-screening_result__score'
    )
    results = []
    for app in apps:
        screening = None
        try:
            screening = {'score': app.screening_result.score}
        except Exception:
            pass
        city = ''
        try:
            city = app.applicant.applicant_profile.city
        except Exception:
            pass
        results.append({
            'id': app.id,
            'applicant_id': app.applicant.id,
            'applicant_name': app.applicant.applicant_profile.full_name(),
            'applicant_city': city,
            'status': app.status,
            'status_display': app.get_status_display(),
            'created_at': app.created_at.strftime('%d.%m.%Y'),
            'screening': screening,
            'status_choices': [{'value': v, 'label': l} for v, l in Application.STATUS_CHOICES],
        })
    return JsonResponse({
        'vacancy_title': vacancy.title,
        'vacancy_id': vacancy.id,
        'results': results,
    })


@login_required
@require_POST
def api_withdraw_application(request, pk):
    application = get_object_or_404(Application, pk=pk, applicant=request.user)
    application.withdrawn = True
    application.save(update_fields=['withdrawn'])
    return JsonResponse({'ok': True})


@login_required
@require_POST
def api_change_status(request, pk):
    if not request.user.is_employer():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    application = get_object_or_404(Application, pk=pk, vacancy__employer=request.user)
    try:
        body = json.loads(request.body)
    except Exception:
        body = {}
    new_status = body.get('status')
    if new_status in dict(Application.STATUS_CHOICES):
        application.status = new_status
        application.save()
        return JsonResponse({'ok': True, 'status_display': application.get_status_display()})
    return JsonResponse({'error': 'Invalid status'}, status=400)
