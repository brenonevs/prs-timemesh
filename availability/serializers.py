from rest_framework import serializers
from .models import AvailabilitySlot
from datetime import datetime, timedelta, date
from typing import List

class RecurrenceOptionsSerializer(serializers.Serializer):
    repeat_type = serializers.ChoiceField(
        choices=['none', 'daily', 'weekly', 'specific_days'],
        default='none',
        help_text="How the slot should repeat"
    )
    end_date = serializers.DateField(
        required=False,
        help_text="Date until which the slot should repeat"
    )
    weekdays = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=6),
        required=False,
        help_text="List of weekdays (0=Monday, 6=Sunday) when repeat_type is 'specific_days'"
    )

    def validate(self, attrs):
        repeat_type = attrs.get('repeat_type')
        end_date = attrs.get('end_date')
        weekdays = attrs.get('weekdays', [])

        if repeat_type != 'none' and not end_date:
            raise serializers.ValidationError({
                'end_date': 'End date is required for recurring slots'
            })

        if repeat_type == 'specific_days' and not weekdays:
            raise serializers.ValidationError({
                'weekdays': 'Weekdays are required when using specific_days repeat type'
            })

        if end_date and end_date < date.today():
            raise serializers.ValidationError({
                'end_date': 'End date cannot be in the past'
            })

        return attrs

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    recurrence = RecurrenceOptionsSerializer(required=False)

    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'user', 'date', 'start_time', 'end_time', 'title', 'is_available', 'recurrence']
        read_only_fields = ['id', 'user']

    def validate(self, attrs):
        start = attrs.get('start_time')
        end = attrs.get('end_time')
        if start and end and start >= end:
            raise serializers.ValidationError('Start time must be before end time.')
        return attrs

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Title is required.')
        if len(value) > 100:
            raise serializers.ValidationError('Title must be 100 characters or less.')
        return value.strip()

    def _get_recurrence_dates(self, start_date: date, recurrence: dict) -> List[date]:
        """Helper method to generate dates based on recurrence options"""
        if not recurrence or recurrence['repeat_type'] == 'none':
            return [start_date]

        dates = []
        current_date = start_date
        end_date = recurrence['end_date']

        while current_date <= end_date:
            if recurrence['repeat_type'] == 'daily':
                dates.append(current_date)
            elif recurrence['repeat_type'] == 'weekly':
                if current_date.weekday() == start_date.weekday():
                    dates.append(current_date)
            elif recurrence['repeat_type'] == 'specific_days':
                if current_date.weekday() in recurrence['weekdays']:
                    dates.append(current_date)
            current_date += timedelta(days=1)

        return dates

    def _handle_overlapping_slots(self, user, date, start_time, end_time):
        """Helper method to handle overlapping slots"""
        existing_slots = AvailabilitySlot.objects.filter(
            user=user,
            date=date,
            start_time__lt=end_time,
            end_time__gt=start_time
        )

        for slot in existing_slots:
            if slot.start_time < start_time:
                AvailabilitySlot.objects.create(
                    user=user,
                    date=date,
                    start_time=slot.start_time,
                    end_time=start_time,
                    title=slot.title,
                    is_available=slot.is_available
                )

            if slot.end_time > end_time:
                AvailabilitySlot.objects.create(
                    user=user,
                    date=date,
                    start_time=end_time,
                    end_time=slot.end_time,
                    title=slot.title,
                    is_available=slot.is_available
                )

            slot.delete()

    def create(self, validated_data):
        recurrence = validated_data.pop('recurrence', None)
        start_date = validated_data['date']
        user = validated_data['user']
        start_time = validated_data['start_time']
        end_time = validated_data['end_time']
        
        dates = self._get_recurrence_dates(start_date, recurrence)
        
        slots = []
        for slot_date in dates:
            self._handle_overlapping_slots(user, slot_date, start_time, end_time)
            
            slot_data = {**validated_data, 'date': slot_date}
            slots.append(AvailabilitySlot.objects.create(**slot_data))
            
        return slots[0] if len(slots) == 1 else slots

class CommonAvailabilityRequestSerializer(serializers.Serializer):
    users = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of user IDs to find common availability for"
    )
    date = serializers.DateField(
        help_text="Date to find common availability for"
    )

class GroupCommonAvailabilityRequestSerializer(serializers.Serializer):
    date = serializers.DateField(
        required=False,
        help_text="Specific date to find common availability for"
    )
    start_date = serializers.DateField(
        required=False,
        help_text="Start date of the range to find common availability for"
    )
    end_date = serializers.DateField(
        required=False,
        help_text="End date of the range to find common availability for"
    )

    def validate(self, attrs):
        has_date = 'date' in attrs
        has_range = 'start_date' in attrs and 'end_date' in attrs

        if not has_date and not has_range:
            raise serializers.ValidationError(
                "Either 'date' or both 'start_date' and 'end_date' must be provided"
            )

        if has_date and has_range:
            raise serializers.ValidationError(
                "Cannot provide both 'date' and date range ('start_date', 'end_date')"
            )

        if has_range:
            start_date = attrs['start_date']
            end_date = attrs['end_date']

            if start_date > end_date:
                raise serializers.ValidationError("Start date must be before or equal to end date")

            date_diff = end_date - start_date
            if date_diff.days > 31:
                raise serializers.ValidationError("Date range cannot exceed 31 days")

        return attrs

class CommonAvailabilitySerializer(serializers.Serializer):
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    users = serializers.ListField(child=serializers.DictField())
