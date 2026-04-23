from django.conf import settings
from django.db import models

from vacancies.models import Vacancy


class Application(models.Model):
    PENDING = 'pending'
    REVIEWING = 'reviewing'
    INTERVIEW = 'interview'
    REJECTED = 'rejected'
    ACCEPTED = 'accepted'
    STATUS_CHOICES = [
        (PENDING, 'На рассмотрении'),
        (REVIEWING, 'Изучается'),
        (INTERVIEW, 'Приглашён на собеседование'),
        (REJECTED, 'Отказ'),
        (ACCEPTED, 'Принят'),
    ]

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications',
        verbose_name='Соискатель',
    )
    vacancy = models.ForeignKey(
        Vacancy,
        on_delete=models.CASCADE,
        related_name='applications',
        verbose_name='Вакансия',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING, verbose_name='Статус')
    cover_letter = models.TextField(blank=True, verbose_name='Сопроводительное письмо')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата отклика')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлён')

    class Meta:
        ordering = ['-created_at']
        unique_together = [('applicant', 'vacancy')]
        verbose_name = 'Отклик'
        verbose_name_plural = 'Отклики'

    def __str__(self):
        return f'{self.applicant} → {self.vacancy}'


class ScreeningResult(models.Model):
    application = models.OneToOneField(
        Application,
        on_delete=models.CASCADE,
        related_name='screening_result',
        verbose_name='Отклик',
    )
    score = models.FloatField(verbose_name='Оценка соответствия (%)')
    details = models.JSONField(default=dict, blank=True, verbose_name='Детали')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создан')

    class Meta:
        verbose_name = 'Результат скрининга'
        verbose_name_plural = 'Результаты скрининга'

    def __str__(self):
        return f'Скрининг для {self.application} — {self.score:.2f}'
