from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.forms import inlineformset_factory

from .models import ApplicantProfile, Education, EmployerProfile, User, WorkExperience


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True, label='Email')
    role = forms.ChoiceField(choices=User.ROLE_CHOICES, label='Роль')

    class Meta:
        model = User
        fields = ('username', 'email', 'role', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = 'Имя пользователя'
        self.fields['username'].help_text = 'Только буквы, цифры и символы @/./+/-/_. Не более 150 символов.'
        self.fields['password1'].label = 'Пароль'
        self.fields['password1'].help_text = 'Пароль должен содержать не менее 8 символов и не быть слишком простым.'
        self.fields['password2'].label = 'Подтверждение пароля'
        self.fields['password2'].help_text = 'Введите пароль повторно для подтверждения.'
        for f in self.fields.values():
            f.widget.attrs['class'] = 'form-control'


class LoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = 'Имя пользователя'
        self.fields['password'].label = 'Пароль'
        for field in self.fields.values():
            field.widget.attrs['class'] = 'form-control'


class ApplicantProfileForm(forms.ModelForm):
    class Meta:
        model = ApplicantProfile
        fields = ('first_name', 'last_name', 'birth_date', 'phone', 'city', 'about')
        widgets = {
            'birth_date': forms.DateInput(attrs={'type': 'date'}),
            'about': forms.Textarea(attrs={'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if isinstance(field.widget, forms.CheckboxInput):
                continue
            if isinstance(field.widget, forms.FileInput):
                field.widget.attrs['class'] = 'form-control'
            else:
                field.widget.attrs['class'] = 'form-control'


class ResumeUploadForm(forms.Form):
    resume_file = forms.FileField(
        required=False,
        widget=forms.FileInput(attrs={'class': 'form-control', 'accept': '.pdf'}),
    )


class EmployerProfileForm(forms.ModelForm):
    class Meta:
        model = EmployerProfile
        fields = ('organization_name', 'address', 'phone', 'website', 'description')
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs['class'] = 'form-control'


class EducationForm(forms.ModelForm):
    class Meta:
        model = Education
        fields = ('institution', 'degree', 'field_of_study', 'start_year', 'end_year')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs['class'] = 'form-control'


class WorkExperienceForm(forms.ModelForm):
    class Meta:
        model = WorkExperience
        fields = ('company', 'position', 'start_date', 'end_date', 'is_current', 'description')
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for f in self.fields.values():
            if isinstance(f.widget, forms.CheckboxInput):
                f.widget.attrs['class'] = 'form-check-input'
            else:
                f.widget.attrs['class'] = 'form-control'


EducationFormSet = inlineformset_factory(
    ApplicantProfile, Education,
    form=EducationForm,
    extra=0, can_delete=True,
)

WorkExperienceFormSet = inlineformset_factory(
    ApplicantProfile, WorkExperience,
    form=WorkExperienceForm,
    extra=0, can_delete=True,
)
