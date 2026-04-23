from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.shortcuts import render
from django.urls import include, path


def home(request):
    return render(request, 'home.html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('vacancies/', include('vacancies.urls')),
    path('applications/', include('applications.urls')),
    path('', home, name='home'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
