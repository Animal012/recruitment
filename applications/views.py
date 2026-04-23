from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from vacancies.models import Vacancy

from .models import Application
from .screening import run_screening


@login_required
def apply(request, pk):
    if not request.user.is_applicant():
        return redirect('home')

    vacancy = get_object_or_404(Vacancy, pk=pk, status=Vacancy.OPEN)

    if Application.objects.filter(applicant=request.user, vacancy=vacancy).exists():
        messages.warning(request, 'Вы уже откликались на эту вакансию.')
        return redirect('vacancy_detail', pk=pk)

    if request.method == 'POST':
        cover_letter = request.POST.get('cover_letter', '').strip()
        application = Application.objects.create(
            applicant=request.user,
            vacancy=vacancy,
            cover_letter=cover_letter,
        )
        run_screening(application)
        messages.success(request, 'Отклик отправлен! Результат скрининга появится в разделе «Мои отклики».')
        return redirect('vacancy_list')

    return render(request, 'applications/apply.html', {'vacancy': vacancy})


@login_required
def my_applications(request):
    applications = Application.objects.filter(
        applicant=request.user
    ).select_related('vacancy', 'screening_result')
    return render(request, 'applications/my_applications.html', {'applications': applications})


@login_required
def vacancy_applications(request, pk):
    if not request.user.is_employer():
        return redirect('home')

    vacancy = get_object_or_404(Vacancy, pk=pk, employer=request.user)
    applications = Application.objects.filter(
        vacancy=vacancy
    ).select_related('applicant__applicant_profile', 'screening_result').order_by('-screening_result__score')

    return render(request, 'applications/vacancy_applications.html', {
        'vacancy': vacancy,
        'applications': applications,
    })


@login_required
def change_status(request, pk):
    if not request.user.is_employer():
        return redirect('home')

    application = get_object_or_404(Application, pk=pk, vacancy__employer=request.user)

    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in dict(Application.STATUS_CHOICES):
            application.status = new_status
            application.save()
            messages.success(request, 'Статус отклика обновлён.')

    return redirect('vacancy_applications', pk=application.vacancy.pk)
