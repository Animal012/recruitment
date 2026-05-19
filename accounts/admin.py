from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import ApplicantProfile, Education, EmployerProfile, User, WorkExperience


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Контакты', {'fields': ('email',)}),
        ('Роль', {'fields': ('role',)}),
        ('Права', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Даты', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('username', 'email', 'role', 'password1', 'password2')}),
    )
    filter_horizontal = ()
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')


class EducationInline(admin.TabularInline):
    model = Education
    extra = 0


class WorkExperienceInline(admin.TabularInline):
    model = WorkExperience
    extra = 0


@admin.register(ApplicantProfile)
class ApplicantProfileAdmin(admin.ModelAdmin):
    inlines = [EducationInline, WorkExperienceInline]
    list_display = ('user', 'city', 'phone')


@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ('organization_name', 'user', 'phone')
