from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import AvailabilitySlot
from .serializers import AvailabilitySlotSerializer

# Create your views here.

class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AvailabilitySlot.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
