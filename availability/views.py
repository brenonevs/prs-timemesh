from django.shortcuts import render
from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import AvailabilitySlot
from .serializers import (
    AvailabilitySlotSerializer, 
    CommonAvailabilitySerializer,
    CommonAvailabilityRequestSerializer,
    GroupCommonAvailabilityRequestSerializer
)
from datetime import time, timedelta
from collections import defaultdict
from groups.models import Group, GroupMembership
from django.shortcuts import get_object_or_404
from rest_framework import status
import datetime

class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = AvailabilitySlot.objects.filter(user=self.request.user)
        
        date = self.request.query_params.get('date')
        start_time = self.request.query_params.get('start_time')
        end_time = self.request.query_params.get('end_time')
        
        if date:
            queryset = queryset.filter(date=date)
        
        if start_time:
            queryset = queryset.filter(start_time__gte=start_time)
            
        if end_time:
            queryset = queryset.filter(end_time__lte=end_time)
            
        return queryset
    
    def perform_create(self, serializer):
        user = self.request.user
        date = serializer.validated_data['date']
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data['end_time']
        title = serializer.validated_data['title']
        is_available = serializer.validated_data.get('is_available', True)

        current_time = start_time
        while current_time < end_time:
            next_time = (datetime.datetime.combine(datetime.date.today(), current_time) + 
                        datetime.timedelta(hours=1)).time()
            
            if next_time > end_time:
                next_time = end_time

            existing_slots = AvailabilitySlot.objects.filter(
                user=user,
                date=date
            )

            overlapping_slots = []
            for slot in existing_slots:
                if (current_time <= slot.end_time and next_time >= slot.start_time):
                    overlapping_slots.append(slot)

            if overlapping_slots:
                for slot in overlapping_slots:
                    slot.delete()
                    
                    if slot.start_time < current_time:
                        AvailabilitySlot.objects.create(
                            user=user,
                            date=date,
                            start_time=slot.start_time,
                            end_time=current_time,
                            title=slot.title,
                            is_available=slot.is_available
                        )
                    if slot.end_time > next_time:
                        AvailabilitySlot.objects.create(
                            user=user,
                            date=date,
                            start_time=next_time,
                            end_time=slot.end_time,
                            title=slot.title,
                            is_available=slot.is_available
                        )

            AvailabilitySlot.objects.create(
                user=user,
                date=date,
                start_time=current_time,
                end_time=next_time,
                title=title,
                is_available=is_available
            )

            current_time = next_time

class CommonAvailabilityView(generics.CreateAPIView):
    serializer_class = CommonAvailabilityRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_ids = serializer.validated_data['users']
        date = serializer.validated_data['date']
        user_ids.append(request.user.id)
        user_ids = list(dict.fromkeys(user_ids))

        slots = AvailabilitySlot.objects.filter(
            user_id__in=user_ids,
            date=date
        )
        
        user_slots = defaultdict(list)
        time_points = set()
        for slot in slots:
            user_slots[slot.user_id].append(slot)
            time_points.add(slot.start_time)
            time_points.add(slot.end_time)

        if len(user_slots) < 2:
            return Response([])

        time_points = sorted(time_points)
        common_slots = []
        for i in range(len(time_points) - 1):
            interval_start = time_points[i]
            interval_end = time_points[i + 1]
            users_info = []
            all_available = True
            for uid in user_ids:
                slot = next((s for s in user_slots[uid] if s.start_time <= interval_start and s.end_time >= interval_end), None)
                if slot:
                    user = User.objects.get(id=uid)
                    users_info.append({
                        'username': user.username,
                        'title': slot.title
                    })
                else:
                    all_available = False
                    break
            if all_available:
                common_slots.append({
                    'date': date,
                    'start_time': interval_start,
                    'end_time': interval_end,
                    'users': users_info
                })
        return Response(common_slots)

class GroupCommonAvailabilityView(generics.CreateAPIView):
    serializer_class = GroupCommonAvailabilityRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id, *args, **kwargs):
        group = get_object_or_404(Group, id=group_id)
        
        if not GroupMembership.objects.filter(
            group=group,
            user=request.user,
            accepted=True
        ).exists():
            return Response(
                {'detail': 'Você não é membro deste grupo.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        date = serializer.validated_data['date']
        
        user_ids = list(GroupMembership.objects.filter(
            group=group,
            accepted=True
        ).values_list('user_id', flat=True))
        user_ids = list(dict.fromkeys(user_ids))

        slots = AvailabilitySlot.objects.filter(
            user_id__in=user_ids,
            date=date
        )
        
        user_slots = defaultdict(list)
        time_points = set()
        for slot in slots:
            user_slots[slot.user_id].append(slot)
            time_points.add(slot.start_time)
            time_points.add(slot.end_time)

        if len(user_slots) < 2:
            return Response([])

        time_points = sorted(time_points)
        common_slots = []
        for i in range(len(time_points) - 1):
            interval_start = time_points[i]
            interval_end = time_points[i + 1]
            users_info = []
            all_available = True
            for uid in user_ids:
                slot = next((s for s in user_slots[uid] if s.start_time <= interval_start and s.end_time >= interval_end), None)
                if slot:
                    user = User.objects.get(id=uid)
                    users_info.append({
                        'username': user.username,
                        'title': slot.title
                    })
                else:
                    all_available = False
                    break
            if all_available:
                common_slots.append({
                    'date': date,
                    'start_time': interval_start,
                    'end_time': interval_end,
                    'users': users_info
                })
        return Response(common_slots)
