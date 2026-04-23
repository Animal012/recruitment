from django.contrib import admin

from .models import Vacancy


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'employer', 'city', 'status', 'created_at')
    list_filter = ('status', 'city')
    search_fields = ('title', 'description')
