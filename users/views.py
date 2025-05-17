from django.shortcuts import render
from rest_framework import generics, permissions
from .serializers import UserRegistrationSerializer, UserMeSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Usuário registrado com sucesso!",
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name
                }
            }, status=status.HTTP_201_CREATED)
        
        if 'email' in serializer.errors:
            return Response({
                "error": "Este e-mail já está cadastrado no sistema.",
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            "error": "Erro ao registrar usuário.",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class CustomLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier', '')
        password = request.data.get('password', '')

        if not identifier or not password:
            return Response({
                'error': 'Por favor, forneça o identificador e a senha.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=identifier)
            username = user.username
        except User.DoesNotExist:
            username = identifier

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })
        else:
            return Response({
                'error': 'Credenciais inválidas.'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data)
