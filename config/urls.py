from django.contrib import admin
from django.urls import include, path

from accounts.urls import api_urlpatterns as accounts_api
from applications.urls import api_urlpatterns as applications_api
from vacancies.urls import api_urlpatterns as vacancies_api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include((accounts_api, 'api_auth'))),
    path('api/vacancies/', include((vacancies_api, 'api_vacancies'))),
    path('api/applications/', include((applications_api, 'api_applications'))),
]
