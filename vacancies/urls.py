from django.urls import path

from . import views

urlpatterns = [
    path('', views.vacancy_list, name='vacancy_list'),
    path('<int:pk>/', views.vacancy_detail, name='vacancy_detail'),
    path('my/', views.my_vacancies, name='my_vacancies'),
    path('create/', views.vacancy_create, name='vacancy_create'),
    path('<int:pk>/edit/', views.vacancy_edit, name='vacancy_edit'),
    path('<int:pk>/close/', views.vacancy_close, name='vacancy_close'),
    path('save-search/', views.save_search, name='save_search'),
]
