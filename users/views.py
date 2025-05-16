from django.shortcuts import render
from rest_framework import generics, permissions
from .serializers import UserRegistrationSerializer, UserMeSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework import serializers


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
    
class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data)
