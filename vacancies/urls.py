from django.urls import path

from . import api_views

api_urlpatterns = [
    path('', api_views.api_vacancy_list, name='api_vacancy_list'),
    path('my/', api_views.api_my_vacancies, name='api_my_vacancies'),
    path('create/', api_views.api_vacancy_create, name='api_vacancy_create'),
    path('<int:pk>/', api_views.api_vacancy_detail, name='api_vacancy_detail'),
    path('<int:pk>/edit/', api_views.api_vacancy_edit, name='api_vacancy_edit'),
    path('<int:pk>/close/', api_views.api_vacancy_close, name='api_vacancy_close'),
    path('<int:pk>/reopen/', api_views.api_vacancy_reopen, name='api_vacancy_reopen'),
    path('<int:pk>/delete/', api_views.api_vacancy_delete, name='api_vacancy_delete'),
    path('favorites/', api_views.api_favorites_list, name='api_favorites_list'),
    path('<int:pk>/favorite/', api_views.api_toggle_favorite, name='api_toggle_favorite'),
]
