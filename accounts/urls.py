from django.urls import path

from . import views
from . import api_views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('profile/applicant/', views.applicant_profile, name='applicant_profile'),
    path('profile/applicant/resume/', views.upload_resume, name='upload_resume'),
    path('profile/applicant/resume/delete/', views.delete_resume, name='delete_resume'),
    path('profile/employer/', views.employer_profile, name='employer_profile'),
]

api_urlpatterns = [
    path('csrf/', api_views.csrf_view, name='api_csrf'),
    path('me/', api_views.me, name='api_me'),
    path('login/', api_views.api_login, name='api_login'),
    path('logout/', api_views.api_logout, name='api_logout'),
    path('register/', api_views.api_register, name='api_register'),
    path('profile/applicant/', api_views.api_applicant_profile, name='api_applicant_profile'),
    path('profile/applicant/resume/', api_views.api_upload_resume, name='api_upload_resume'),
    path('profile/applicant/resume/delete/', api_views.api_delete_resume, name='api_delete_resume'),
    path('profile/employer/', api_views.api_employer_profile, name='api_employer_profile'),
]
