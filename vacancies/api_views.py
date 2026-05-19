import json
import re

from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods, require_POST

from .models import Vacancy


def _ci_regex(s):
    parts = []
    for ch in s:
        lo, hi = ch.lower(), ch.upper()
        if lo != hi:
            parts.append(f'[{lo}{hi}]')
        else:
            parts.append(re.escape(ch))
    return ''.join(parts)


def _vacancy_dict(v, detail=False):
    org = ''
    try:
        org = v.employer.employer_profile.organization_name
    except Exception:
        pass
    d = {
        'id': v.id,
        'title': v.title,
        'city': v.city,
        'salary_from': v.salary_from,
        'salary_to': v.salary_to,
        'status': v.status,
        'employer_name': org,
        'created_at': v.created_at.strftime('%d.%m.%Y'),
    }
    if detail:
        d['description'] = v.description
        d['requirements'] = v.requirements
        d['conditions'] = v.conditions
        d['applications_count'] = v.applications.count()
    return d


def api_vacancy_list(request):
    qs = Vacancy.objects.filter(status=Vacancy.OPEN).select_related('employer__employer_profile')
    query = request.GET.get('q', '').strip()
    city = request.GET.get('city', '').strip()
    salary_from = request.GET.get('salary_from', '').strip()

    if query:
        pat = _ci_regex(query)
        qs = qs.filter(
            Q(title__regex=pat) | Q(description__regex=pat) | Q(requirements__regex=pat)
        )
    if city:
        qs = qs.filter(city__icontains=city)
    if salary_from.isdigit():
        qs = qs.filter(salary_from__gte=int(salary_from))

    paginator = Paginator(qs, 10)
    page = paginator.get_page(request.GET.get('page', 1))

    cities = list(
        Vacancy.objects.filter(status=Vacancy.OPEN)
        .exclude(city='')
        .values_list('city', flat=True)
        .distinct()
    )

    return JsonResponse({
        'results': [_vacancy_dict(v) for v in page],
        'count': paginator.count,
        'num_pages': paginator.num_pages,
        'page': page.number,
        'cities': sorted(set(cities)),
    })


def api_vacancy_detail(request, pk):
    vacancy = get_object_or_404(Vacancy, pk=pk)
    data = _vacancy_dict(vacancy, detail=True)
    already_applied = False
    if request.user.is_authenticated and request.user.is_applicant():
        already_applied = vacancy.applications.filter(applicant=request.user).exists()
    data['already_applied'] = already_applied
    data['is_open'] = vacancy.is_open()
    return JsonResponse(data)


@login_required
def api_my_vacancies(request):
    if not request.user.is_employer():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    vacancies = Vacancy.objects.filter(employer=request.user)
    return JsonResponse({'results': [_vacancy_dict(v, detail=True) for v in vacancies]})


@login_required
@require_http_methods(['POST'])
def api_vacancy_create(request):
    if not request.user.is_employer():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    try:
        body = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    title = body.get('title', '').strip()
    if not title:
        return JsonResponse({'errors': {'title': ['Обязательное поле']}}, status=400)
    vacancy = Vacancy.objects.create(
        employer=request.user,
        title=title,
        description=body.get('description', ''),
        requirements=body.get('requirements', ''),
        conditions=body.get('conditions', ''),
        city=body.get('city', ''),
        salary_from=body.get('salary_from') or None,
        salary_to=body.get('salary_to') or None,
    )
    return JsonResponse({'id': vacancy.id}, status=201)


@login_required
@require_http_methods(['PUT', 'POST'])
def api_vacancy_edit(request, pk):
    if not request.user.is_employer():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    vacancy = get_object_or_404(Vacancy, pk=pk, employer=request.user)
    try:
        body = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    vacancy.title = body.get('title', vacancy.title)
    vacancy.description = body.get('description', vacancy.description)
    vacancy.requirements = body.get('requirements', vacancy.requirements)
    vacancy.conditions = body.get('conditions', vacancy.conditions)
    vacancy.city = body.get('city', vacancy.city)
    vacancy.salary_from = body.get('salary_from') or None
    vacancy.salary_to = body.get('salary_to') or None
    vacancy.save()
    return JsonResponse({'ok': True})


@login_required
@require_POST
def api_vacancy_close(request, pk):
    if not request.user.is_employer():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    vacancy = get_object_or_404(Vacancy, pk=pk, employer=request.user)
    vacancy.status = Vacancy.CLOSED
    vacancy.save()
    return JsonResponse({'ok': True})


@login_required
@require_POST
def api_vacancy_reopen(request, pk):
    if not request.user.is_employer():
        return JsonResponse({'error': 'Forbidden'}, status=403)
    vacancy = get_object_or_404(Vacancy, pk=pk, employer=request.user)
    vacancy.status = Vacancy.OPEN
    vacancy.save()
    return JsonResponse({'ok': True})


