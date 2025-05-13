from django.urls import path
from .views import UserRegistrationView, UserMeView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('me/', UserMeView.as_view(), name='user-me'),
] 