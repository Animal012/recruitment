from django.urls import path

from . import api_views

api_urlpatterns = [
    path('', api_views.api_my_applications, name='api_my_applications'),
    path('employer/', api_views.api_all_employer_applications, name='api_all_employer_applications'),
    path('apply/<int:pk>/', api_views.api_apply, name='api_apply'),
    path('vacancy/<int:pk>/', api_views.api_vacancy_applications, name='api_vacancy_applications'),
    path('<int:pk>/status/', api_views.api_change_status, name='api_change_status'),
    path('<int:pk>/withdraw/', api_views.api_withdraw_application, name='api_withdraw_application'),
]
