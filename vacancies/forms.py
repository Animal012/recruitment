from django import forms

from .models import Vacancy


class VacancyForm(forms.ModelForm):
    class Meta:
        model = Vacancy
        fields = ('title', 'description', 'requirements', 'conditions', 'city', 'salary_from', 'salary_to')
        widgets = {
            'description': forms.Textarea(attrs={'rows': 5}),
            'requirements': forms.Textarea(attrs={'rows': 4}),
            'conditions': forms.Textarea(attrs={'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['city'].required = True
        self.fields['salary_from'].required = True
        self.fields['salary_to'].required = True
        for field in self.fields.values():
            field.widget.attrs['class'] = 'form-control'
