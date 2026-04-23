from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import ApplicantProfile, Education, EmployerProfile, User, WorkExperience


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Роль', {'fields': ('role',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Роль', {'fields': ('role',)}),
    )
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role',) + BaseUserAdmin.list_filter


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
