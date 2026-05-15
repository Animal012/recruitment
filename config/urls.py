from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.shortcuts import render
from django.urls import include, path

from accounts.urls import api_urlpatterns as accounts_api
from applications.urls import api_urlpatterns as applications_api
from vacancies.urls import api_urlpatterns as vacancies_api


def home(request):
    return render(request, 'home.html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('vacancies/', include('vacancies.urls')),
    path('applications/', include('applications.urls')),

    # JSON API
    path('api/auth/', include((accounts_api, 'api_auth'))),
    path('api/vacancies/', include((vacancies_api, 'api_vacancies'))),
    path('api/applications/', include((applications_api, 'api_applications'))),

    path('', home, name='home'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
