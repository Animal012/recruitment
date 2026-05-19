from django.urls import path

from . import api_views

api_urlpatterns = [
    path('csrf/', api_views.csrf_view, name='api_csrf'),
    path('me/', api_views.me, name='api_me'),
    path('login/', api_views.api_login, name='api_login'),
    path('logout/', api_views.api_logout, name='api_logout'),
    path('register/', api_views.api_register, name='api_register'),
    path('profile/applicant/', api_views.api_applicant_profile, name='api_applicant_profile'),
    path('profile/applicant/resume/', api_views.api_upload_resume, name='api_upload_resume'),
    path('profile/applicant/resume/delete/', api_views.api_delete_resume, name='api_delete_resume'),
    path('profile/applicant/resume/download/', api_views.api_download_resume, name='api_download_resume'),
    path('profile/employer/', api_views.api_employer_profile, name='api_employer_profile'),
    path('settings/', api_views.api_account_settings, name='api_account_settings'),
    path('applicant/<int:pk>/', api_views.api_applicant_view, name='api_applicant_view'),
    path('applicant/<int:pk>/resume/', api_views.api_applicant_resume, name='api_applicant_resume'),
]
