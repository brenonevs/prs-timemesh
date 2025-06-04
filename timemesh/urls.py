"""
URL configuration for timemesh project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.middleware.csrf import get_token
from django.http import JsonResponse

@api_view(['GET'])
@permission_classes([AllowAny])
def welcome_view(request):
    """
    View pública que retorna informações sobre a API
    """
    return Response({
        "status": "online",
        "message": "Bem-vindo à API do TimeMesh! 🚀",
        "version": "1.0.0",
        "auth": {
            "instructions": "Para usar a API, primeiro obtenha um token JWT fazendo POST para /api/token/ com username e password",
            "example": {
                "request": {
                    "method": "POST",
                    "url": "/api/token/",
                    "body": {
                        "username": "seu_usuario",
                        "password": "sua_senha"
                    }
                },
                "response": {
                    "access": "seu_token_jwt",
                    "refresh": "seu_token_refresh"
                }
            }
        },
        "endpoints": {
            "auth": {
                "login": "/api/token/",
                "refresh": "/api/token/refresh/"
            },
            "api": {
                "availability": "/api/availability/",
                "users": "/api/users/",
                "groups": "/api/groups/",
                "analytics": "/api/analytics/"
            },
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('', welcome_view, name='welcome'),
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/availability/', include('availability.urls')),
    path('api/users/', include('users.urls')),
    path('api/groups/', include('groups.urls')),
    path('api/analytics/', include('analytics.urls')),
]
