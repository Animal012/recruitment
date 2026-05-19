from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    APPLICANT = 'applicant'
    EMPLOYER = 'employer'
    ROLE_CHOICES = [
        (APPLICANT, 'Соискатель'),
        (EMPLOYER, 'Работодатель'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, verbose_name='Роль')
    first_name = None
    last_name = None
    groups = None
    user_permissions = None

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def is_applicant(self):
        return self.role == self.APPLICANT

    def is_employer(self):
        return self.role == self.EMPLOYER


class ApplicantProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='applicant_profile')
    first_name = models.CharField(max_length=150, blank=True, verbose_name='Имя')
    last_name = models.CharField(max_length=150, blank=True, verbose_name='Фамилия')
    birth_date = models.DateField(blank=True, null=True, verbose_name='Дата рождения')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    city = models.CharField(max_length=100, blank=True, verbose_name='Город')
    about = models.TextField(blank=True, verbose_name='О себе')
    resume_data = models.BinaryField(blank=True, null=True, verbose_name='Файл резюме (байты)')
    resume_filename = models.CharField(max_length=255, blank=True, verbose_name='Имя файла резюме')
    resume_text = models.TextField(blank=True, verbose_name='Текст резюме')

    class Meta:
        verbose_name = 'Профиль соискателя'
        verbose_name_plural = 'Профили соискателей'

    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.user.username


class Education(models.Model):
    profile = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='educations')
    institution = models.CharField(max_length=255, verbose_name='Учебное заведение')
    degree = models.CharField(max_length=100, blank=True, verbose_name='Степень/квалификация')
    field_of_study = models.CharField(max_length=200, blank=True, verbose_name='Специальность')
    start_year = models.PositiveSmallIntegerField(verbose_name='Год начала')
    end_year = models.PositiveSmallIntegerField(blank=True, null=True, verbose_name='Год окончания')

    class Meta:
        verbose_name = 'Образование'
        verbose_name_plural = 'Образование'

    def __str__(self):
        return f'{self.institution} ({self.start_year}–{self.end_year or "н.в."})'


class WorkExperience(models.Model):
    profile = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=255, verbose_name='Организация')
    position = models.CharField(max_length=200, verbose_name='Должность')
    start_date = models.DateField(verbose_name='Дата начала')
    end_date = models.DateField(blank=True, null=True, verbose_name='Дата окончания')
    is_current = models.BooleanField(default=False, verbose_name='Текущее место работы')
    description = models.TextField(blank=True, verbose_name='Описание')

    class Meta:
        verbose_name = 'Опыт работы'
        verbose_name_plural = 'Опыт работы'

    def __str__(self):
        return f'{self.position} в {self.company}'


class EmployerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employer_profile')
    organization_name = models.CharField(max_length=255, verbose_name='Название организации')
    address = models.CharField(max_length=500, blank=True, verbose_name='Адрес')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    website = models.URLField(blank=True, verbose_name='Сайт')
    description = models.TextField(blank=True, verbose_name='Описание')

    class Meta:
        verbose_name = 'Профиль работодателя'
        verbose_name_plural = 'Профили работодателей'

    def __str__(self):
        return self.organization_name
