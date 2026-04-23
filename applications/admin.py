from django.contrib import admin

from .models import Application, ScreeningResult


class ScreeningResultInline(admin.StackedInline):
    model = ScreeningResult
    extra = 0
    readonly_fields = ('score', 'details', 'created_at')


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    inlines = [ScreeningResultInline]
    list_display = ('applicant', 'vacancy', 'status', 'created_at')
    list_filter = ('status',)
