from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.shortcuts import redirect, render

from .forms import (
    ApplicantProfileForm,
    EducationFormSet,
    EmployerProfileForm,
    LoginForm,
    RegisterForm,
    ResumeUploadForm,
    WorkExperienceFormSet,
)
from .models import ApplicantProfile, EmployerProfile
from .utils import extract_pdf_text


def register(request):
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            if user.role == 'applicant':
                ApplicantProfile.objects.create(user=user)
            else:
                EmployerProfile.objects.create(user=user, organization_name='')
            login(request, user)
            messages.success(request, 'Регистрация прошла успешно!')
            return redirect('home')
    else:
        form = RegisterForm()
    return render(request, 'accounts/register.html', {'form': form})


class CustomLoginView(LoginView):
    form_class = LoginForm
    template_name = 'accounts/login.html'

    def get_success_url(self):
        return '/'


def logout_view(request):
    if request.user.is_authenticated:
        from vacancies.models import SearchHistory
        SearchHistory.objects.filter(user=request.user).delete()
    logout(request)
    return redirect('login')


@login_required
def profile(request):
    if request.user.is_applicant():
        return redirect('applicant_profile')
    return redirect('employer_profile')


@login_required
def applicant_profile(request):
    if not request.user.is_applicant():
        return redirect('home')

    profile_obj, _ = ApplicantProfile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        profile_form = ApplicantProfileForm(request.POST, request.FILES, instance=profile_obj)
        edu_formset = EducationFormSet(request.POST, instance=profile_obj, prefix='edu')
        exp_formset = WorkExperienceFormSet(request.POST, instance=profile_obj, prefix='exp')

        if profile_form.is_valid() and edu_formset.is_valid() and exp_formset.is_valid():
            profile_form.save()
            edu_formset.save()
            exp_formset.save()
            messages.success(request, 'Профиль обновлён.')
            return redirect('applicant_profile')
    else:
        profile_form = ApplicantProfileForm(instance=profile_obj)
        edu_formset = EducationFormSet(instance=profile_obj, prefix='edu')
        exp_formset = WorkExperienceFormSet(instance=profile_obj, prefix='exp')

    resume_form = ResumeUploadForm(instance=profile_obj)

    return render(request, 'accounts/applicant_profile.html', {
        'profile_form': profile_form,
        'edu_formset': edu_formset,
        'exp_formset': exp_formset,
        'resume_form': resume_form,
        'profile': profile_obj,
    })


@login_required
def upload_resume(request):
    if not request.user.is_applicant():
        return redirect('home')

    if request.method != 'POST':
        return redirect('applicant_profile')

    profile_obj, _ = ApplicantProfile.objects.get_or_create(user=request.user)
    pdf_file = request.FILES.get('resume_file')

    if not pdf_file:
        messages.error(request, 'Выберите PDF-файл для загрузки.')
        return redirect('applicant_profile')

    if not pdf_file.name.lower().endswith('.pdf'):
        messages.error(request, 'Допускается только PDF-файл.')
        return redirect('applicant_profile')

    profile_obj.resume_file = pdf_file
    profile_obj.resume_text = extract_pdf_text(pdf_file)
    profile_obj.save(update_fields=['resume_file', 'resume_text'])
    messages.success(request, 'Резюме загружено, текст извлечён.')
    return redirect('applicant_profile')


@login_required
def delete_resume(request):
    if not request.user.is_applicant() or request.method != 'POST':
        return redirect('applicant_profile')

    profile_obj = request.user.applicant_profile
    if profile_obj.resume_file:
        profile_obj.resume_file.delete(save=False)
    profile_obj.resume_file = None
    profile_obj.resume_text = ''
    profile_obj.save(update_fields=['resume_file', 'resume_text'])
    messages.success(request, 'Резюме удалено.')
    return redirect('applicant_profile')


@login_required
def employer_profile(request):
    if not request.user.is_employer():
        return redirect('home')

    profile_obj, _ = EmployerProfile.objects.get_or_create(user=request.user, defaults={'organization_name': ''})

    if request.method == 'POST':
        form = EmployerProfileForm(request.POST, instance=profile_obj)
        if form.is_valid():
            form.save()
            messages.success(request, 'Профиль организации обновлён.')
            return redirect('employer_profile')
    else:
        form = EmployerProfileForm(instance=profile_obj)

    return render(request, 'accounts/employer_profile.html', {'form': form, 'profile': profile_obj})
