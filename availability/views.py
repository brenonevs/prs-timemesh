from django.shortcuts import render
from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import AvailabilitySlot
from .serializers import (
    AvailabilitySlotSerializer, 
    CommonAvailabilitySerializer,
    CommonAvailabilityRequestSerializer
)
from datetime import time, timedelta
from collections import defaultdict

class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AvailabilitySlot.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        user = self.request.user
        date = serializer.validated_data['date']
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data['end_time']

        # Buscar slots existentes no mesmo dia
        existing_slots = AvailabilitySlot.objects.filter(
            user=user,
            date=date
        )

        # Verificar sobreposições
        overlapping_slots = []
        for slot in existing_slots:
            if (start_time <= slot.end_time and end_time >= slot.start_time):
                overlapping_slots.append(slot)

        if overlapping_slots:
            # Verifica se o novo horário está totalmente contido em todos os slots sobrepostos
            is_fully_contained = all(
                slot.start_time <= start_time and slot.end_time >= end_time
                for slot in overlapping_slots
            )
            # Se sim, atualiza o slot original (primeiro sobreposto) para os novos horários
            if is_fully_contained:
                main_slot = overlapping_slots[0]
                main_slot.start_time = start_time
                main_slot.end_time = end_time
                main_slot.save()
                # Deleta os outros slots sobrepostos, se houver
                for slot in overlapping_slots[1:]:
                    slot.delete()
            else:
                # Caso contrário, funde normalmente
                new_start_time = min(start_time, *[slot.start_time for slot in overlapping_slots])
                new_end_time = max(end_time, *[slot.end_time for slot in overlapping_slots])
                main_slot = overlapping_slots[0]
                main_slot.start_time = new_start_time
                main_slot.end_time = new_end_time
                main_slot.save()
                # Deleta os outros slots sobrepostos, se houver
                for slot in overlapping_slots[1:]:
                    slot.delete()
        else:
            # Se não houver sobreposição, salvar normalmente
            serializer.save(user=user)

class CommonAvailabilityView(generics.CreateAPIView):
    serializer_class = CommonAvailabilityRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_ids = serializer.validated_data['users']
        date = serializer.validated_data['date']
        user_ids.append(request.user.id)

        slots = AvailabilitySlot.objects.filter(
            user_id__in=user_ids,
            date=date
        )
        
        user_slots = defaultdict(list)
        for slot in slots:
            user_slots[slot.user_id].append(slot)

        common_slots = []
        if len(user_slots) < 2:
            return Response(common_slots)

        base_slots = user_slots[user_ids[0]]
        
        for base_slot in base_slots:
            overlapping_slots = []
            for user_id in user_ids[1:]:
                user_overlaps = []
                for slot in user_slots[user_id]:
                    if (base_slot.start_time <= slot.end_time and 
                        base_slot.end_time >= slot.start_time):
                        overlap_start = max(base_slot.start_time, slot.start_time)
                        overlap_end = min(base_slot.end_time, slot.end_time)
                        user_overlaps.append((overlap_start, overlap_end))
                
                if not user_overlaps:
                    break
                overlapping_slots.append(user_overlaps)
            
            if len(overlapping_slots) == len(user_ids) - 1:
                common_start = base_slot.start_time
                common_end = base_slot.end_time
                
                for user_overlaps in overlapping_slots:
                    user_start = max(overlap[0] for overlap in user_overlaps)
                    user_end = min(overlap[1] for overlap in user_overlaps)
                    common_start = max(common_start, user_start)
                    common_end = min(common_end, user_end)
                
                if common_start < common_end:
                    users = User.objects.filter(id__in=user_ids).values_list('username', flat=True)
                    common_slots.append({
                        'date': date,
                        'start_time': common_start,
                        'end_time': common_end,
                        'users': list(users)
                    })

        return Response(common_slots)
