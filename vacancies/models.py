from django.conf import settings
from django.db import models


class SearchHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='search_history',
    )
    query = models.CharField(max_length=255, blank=True, verbose_name='Запрос')
    city = models.CharField(max_length=100, blank=True, verbose_name='Город')
    salary_from = models.PositiveIntegerField(blank=True, null=True, verbose_name='Зарплата от')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата поиска')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'История поиска'
        verbose_name_plural = 'История поиска'

    def __str__(self):
        parts = []
        if self.query:
            parts.append(f'«{self.query}»')
        if self.city:
            parts.append(self.city)
        if self.salary_from:
            parts.append(f'от {self.salary_from} ₽')
        return ', '.join(parts) if parts else '(пустой поиск)'


class Vacancy(models.Model):
    OPEN = 'open'
    CLOSED = 'closed'
    STATUS_CHOICES = [
        (OPEN, 'Открыта'),
        (CLOSED, 'Закрыта'),
    ]

    employer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vacancies',
    )
    title = models.CharField(max_length=255, verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    requirements = models.TextField(blank=True, verbose_name='Требования')
    conditions = models.TextField(blank=True, verbose_name='Условия')
    city = models.CharField(max_length=100, blank=True, verbose_name='Город')
    salary_from = models.PositiveIntegerField(blank=True, null=True, verbose_name='Зарплата от (₽)')
    salary_to = models.PositiveIntegerField(blank=True, null=True, verbose_name='Зарплата до (₽)')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=OPEN, verbose_name='Статус')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создана')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлена')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Вакансия'
        verbose_name_plural = 'Вакансии'

    def __str__(self):
        return self.title

    def is_open(self):
        return self.status == self.OPEN
