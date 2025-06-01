from django.shortcuts import render
from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import AvailabilitySlot
from .serializers import (
    AvailabilitySlotSerializer, 
    CommonAvailabilitySerializer,
    CommonAvailabilityRequestSerializer,
    GroupCommonAvailabilityRequestSerializer,
    BatchAvailabilitySlotSerializer
)
from datetime import time, timedelta, datetime, date
from collections import defaultdict
from groups.models import Group, GroupMembership
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
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
        validated_data = {
            **serializer.validated_data,
            'user': self.request.user
        }

        if not validated_data.get('is_available', True):
            validated_data['title'] = 'Ocupado'

        serializer.create(validated_data)

    @action(detail=False, methods=['post'], url_path='batch_create')
    def batch_create(self, request):
        serializer = BatchAvailabilitySlotSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.create({'user': request.user, 'slots': serializer.validated_data['slots']})
            
            if result['errors']:
                return Response({
                    'created_slots': AvailabilitySlotSerializer(result['created_slots'], many=True).data,
                    'errors': result['errors']
                }, status=status.HTTP_207_MULTI_STATUS)
            
            return Response(
                AvailabilitySlotSerializer(result['created_slots'], many=True).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='batch_delete')
    def batch_delete(self, request):
        slots_data = request.data.get('slots', [])
        deleted_count = 0
        errors = []

        for slot_data in slots_data:
            try:
                slot = AvailabilitySlot.objects.get(
                    user=request.user,
                    date=slot_data['date'],
                    start_time=slot_data['start_time'],
                    end_time=slot_data['end_time']
                )
                slot.delete()
                deleted_count += 1
            except AvailabilitySlot.DoesNotExist:
                errors.append({
                    'slot': slot_data,
                    'error': 'Slot not found'
                })
            except Exception as e:
                errors.append({
                    'slot': slot_data,
                    'error': str(e)
                })

        return Response({
            'deleted_count': deleted_count,
            'errors': errors
        }, status=status.HTTP_200_OK if not errors else status.HTTP_207_MULTI_STATUS)

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

    def get_common_slots_for_date(self, date_obj, user_ids):
        """Helper method to find common slots for a specific date"""
        slots = AvailabilitySlot.objects.filter(
            user_id__in=user_ids,
            date=date_obj,
            is_available=True
        )
        
        user_slots = defaultdict(list)
        time_points = set()
        for slot in slots:
            user_slots[slot.user_id].append(slot)
            time_points.add(slot.start_time)
            time_points.add(slot.end_time)

        if len(user_slots) < 2:
            return []

        time_points = sorted(time_points)
        common_slots = []
        
        for i in range(len(time_points) - 1):
            interval_start = time_points[i]
            interval_end = time_points[i + 1]
            users_info = []
            all_available = True
            
            for uid in user_ids:
                slot = next(
                    (s for s in user_slots[uid] 
                     if s.start_time <= interval_start and s.end_time >= interval_end),
                    None
                )
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
                    'date': date_obj,
                    'start_time': interval_start,
                    'end_time': interval_end,
                    'users': users_info
                })
                
        return common_slots

    def post(self, request, group_id, *args, **kwargs):
        group = get_object_or_404(Group, id=group_id)
        
        if not GroupMembership.objects.filter(
            group=group,
            user=request.user,
            accepted=True
        ).exists():
            return Response(
                {'detail': 'You are not a member of this group.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_ids = list(GroupMembership.objects.filter(
            group=group,
            accepted=True
        ).values_list('user_id', flat=True))
        
        user_ids = list(dict.fromkeys(user_ids))

        all_common_slots = []
        
        if 'date' in serializer.validated_data:
            target_date = serializer.validated_data['date']
            common_slots = self.get_common_slots_for_date(target_date, user_ids)
            all_common_slots.extend(common_slots)
        else:
            start_date = serializer.validated_data['start_date']
            end_date = serializer.validated_data['end_date']
            current_date = start_date
            
            while current_date <= end_date:
                common_slots = self.get_common_slots_for_date(current_date, user_ids)
                all_common_slots.extend(common_slots)
                current_date += timedelta(days=1)

        return Response(all_common_slots)
