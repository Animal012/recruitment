from django.urls import path

from . import views

urlpatterns = [
    path('', views.my_applications, name='my_applications'),
    path('apply/<int:pk>/', views.apply, name='apply'),
    path('vacancy/<int:pk>/', views.vacancy_applications, name='vacancy_applications'),
    path('<int:pk>/status/', views.change_status, name='change_status'),
]
