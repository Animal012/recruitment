from django.urls import path

from . import views
from . import api_views

urlpatterns = [
    path('', views.my_applications, name='my_applications'),
    path('apply/<int:pk>/', views.apply, name='apply'),
    path('vacancy/<int:pk>/', views.vacancy_applications, name='vacancy_applications'),
    path('<int:pk>/status/', views.change_status, name='change_status'),
]

api_urlpatterns = [
    path('', api_views.api_my_applications, name='api_my_applications'),
    path('apply/<int:pk>/', api_views.api_apply, name='api_apply'),
    path('vacancy/<int:pk>/', api_views.api_vacancy_applications, name='api_vacancy_applications'),
    path('<int:pk>/status/', api_views.api_change_status, name='api_change_status'),
]
