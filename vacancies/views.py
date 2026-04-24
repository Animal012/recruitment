import re

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .forms import VacancyForm
from .models import SearchHistory, Vacancy


def _ci_regex(s):
    """Build a case-insensitive regex pattern without relying on locale."""
    parts = []
    for ch in s:
        lo, hi = ch.lower(), ch.upper()
        if lo != hi:
            parts.append(f'[{lo}{hi}]')
        else:
            parts.append(re.escape(ch))
    return ''.join(parts)


def vacancy_list(request):
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
    page = paginator.get_page(request.GET.get('page'))
    cities = Vacancy.objects.filter(status=Vacancy.OPEN).exclude(city='').values_list('city', flat=True).distinct()

    recent_queries = []
    if request.user.is_authenticated and request.user.is_applicant():
        recent_queries = list(
            SearchHistory.objects
            .filter(user=request.user)
            .exclude(query='')
            .values_list('query', flat=True)
            .distinct()[:20]
        )

    return render(request, 'vacancies/list.html', {
        'page_obj': page,
        'query': query,
        'city': city,
        'salary_from': salary_from,
        'cities': sorted(set(cities)),
        'recent_queries': recent_queries,
    })


def vacancy_detail(request, pk):
    vacancy = get_object_or_404(Vacancy, pk=pk)
    already_applied = False
    if request.user.is_authenticated and request.user.is_applicant():
        already_applied = vacancy.applications.filter(applicant=request.user).exists()
    return render(request, 'vacancies/detail.html', {
        'vacancy': vacancy,
        'already_applied': already_applied,
    })


@login_required
def my_vacancies(request):
    if not request.user.is_employer():
        return redirect('home')
    vacancies = Vacancy.objects.filter(employer=request.user)
    return render(request, 'vacancies/my_vacancies.html', {'vacancies': vacancies})


@login_required
def vacancy_create(request):
    if not request.user.is_employer():
        return redirect('home')
    if request.method == 'POST':
        form = VacancyForm(request.POST)
        if form.is_valid():
            vacancy = form.save(commit=False)
            vacancy.employer = request.user
            vacancy.save()
            messages.success(request, 'Вакансия создана.')
            return redirect('my_vacancies')
    else:
        form = VacancyForm()
    return render(request, 'vacancies/form.html', {'form': form, 'title': 'Создать вакансию'})


@login_required
def vacancy_edit(request, pk):
    vacancy = get_object_or_404(Vacancy, pk=pk, employer=request.user)
    if request.method == 'POST':
        form = VacancyForm(request.POST, instance=vacancy)
        if form.is_valid():
            form.save()
            messages.success(request, 'Вакансия обновлена.')
            return redirect('my_vacancies')
    else:
        form = VacancyForm(instance=vacancy)
    return render(request, 'vacancies/form.html', {'form': form, 'title': 'Редактировать вакансию'})


@login_required
def vacancy_close(request, pk):
    vacancy = get_object_or_404(Vacancy, pk=pk, employer=request.user)
    vacancy.status = Vacancy.CLOSED
    vacancy.save()
    messages.success(request, 'Вакансия закрыта.')
    return redirect('my_vacancies')


@require_POST
@login_required
def save_search(request):
    if not request.user.is_applicant():
        return JsonResponse({'ok': False})
    query = request.POST.get('query', '').strip()
    if query:
        SearchHistory.objects.create(user=request.user, query=query)
    return JsonResponse({'ok': True})
