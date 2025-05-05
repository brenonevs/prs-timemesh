from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status
from django.db.models import Avg, Count, Sum, F, ExpressionWrapper, DurationField, Q
from django.db.models.functions import ExtractHour, ExtractWeekDay
from datetime import timedelta
from availability.models import AvailabilitySlot
from groups.models import GroupMembership, Group
from .serializers import UserAvailabilityStatsSerializer, GroupInviteStatsSerializer
from rest_framework.response import Response

WEEKDAYS = {
    1: 'Sunday',
    2: 'Monday',
    3: 'Tuesday',
    4: 'Wednesday',
    5: 'Thursday',
    6: 'Friday',
    7: 'Saturday'
}

class UserAvailabilityStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserAvailabilityStatsSerializer

    def get_object(self):
        user = self.request.user
        
        duration_expression = ExpressionWrapper(
            F('end_time') - F('start_time'),
            output_field=DurationField()
        )
        
        total_hours = AvailabilitySlot.objects.filter(
            user=user
        ).annotate(
            duration=duration_expression
        ).aggregate(
            total=Sum('duration')
        )['total'] or timedelta()

        average_duration = AvailabilitySlot.objects.filter(
            user=user
        ).annotate(
            duration=duration_expression
        ).aggregate(
            avg=Avg('duration')
        )['avg'] or timedelta()

        most_common_time = AvailabilitySlot.objects.filter(
            user=user
        ).annotate(
            hour=ExtractHour('start_time')
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('-count').first()

        most_common_weekday = AvailabilitySlot.objects.filter(
            user=user
        ).annotate(
            weekday=ExtractWeekDay('date')
        ).values('weekday').annotate(
            count=Count('id')
        ).order_by('-count').first()

        return {
            'total_hours': total_hours,
            'average_duration': average_duration,
            'most_common_time': most_common_time['hour'] if most_common_time else None,
            'most_common_weekday': WEEKDAYS.get(most_common_weekday['weekday']) if most_common_weekday else None,
        }

class GroupInviteStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupInviteStatsSerializer

    def get_object(self):
        user = self.request.user
        group_id = self.kwargs['group_id']
        
        # Verifica se o usuário é membro do grupo
        group = get_object_or_404(Group, id=group_id)
        if not GroupMembership.objects.filter(
            group=group,
            user=user,
            accepted=True
        ).exists():
            return Response(
                {'detail': 'Você não é membro deste grupo.'},
                status=status.HTTP_403_FORBIDDEN
            )
    
        invite_stats = GroupMembership.objects.filter(
            group=group,
            invited_by=user
        ).aggregate(
            total=Count('id'),
            accepted=Count('id', filter=Q(accepted=True))
        )

        avg_acceptance_time = GroupMembership.objects.filter(
            group=group,
            invited_by=user,
            accepted=True
        ).annotate(
            acceptance_time=ExpressionWrapper(
                F('accepted_at') - F('invited_at'),
                output_field=DurationField()
            )
        ).aggregate(
            avg=Avg('acceptance_time')
        )['avg'] or timedelta()

        return {
            'acceptance_rate': (invite_stats['accepted'] / invite_stats['total'] * 100) if invite_stats['total'] > 0 else 0,
            'average_acceptance_time': avg_acceptance_time,
        }
