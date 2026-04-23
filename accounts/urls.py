from django.urls import path

from . import views

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
