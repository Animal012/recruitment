from django.urls import path

from . import views
from . import api_views

urlpatterns = [
    path('', views.vacancy_list, name='vacancy_list'),
    path('<int:pk>/', views.vacancy_detail, name='vacancy_detail'),
    path('my/', views.my_vacancies, name='my_vacancies'),
    path('create/', views.vacancy_create, name='vacancy_create'),
    path('<int:pk>/edit/', views.vacancy_edit, name='vacancy_edit'),
    path('<int:pk>/close/', views.vacancy_close, name='vacancy_close'),
    path('save-search/', views.save_search, name='save_search'),
]

api_urlpatterns = [
    path('', api_views.api_vacancy_list, name='api_vacancy_list'),
    path('my/', api_views.api_my_vacancies, name='api_my_vacancies'),
    path('create/', api_views.api_vacancy_create, name='api_vacancy_create'),
    path('<int:pk>/', api_views.api_vacancy_detail, name='api_vacancy_detail'),
    path('<int:pk>/edit/', api_views.api_vacancy_edit, name='api_vacancy_edit'),
    path('<int:pk>/close/', api_views.api_vacancy_close, name='api_vacancy_close'),
    path('save-search/', api_views.api_save_search, name='api_save_search'),
]
