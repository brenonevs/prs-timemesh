from rest_framework import serializers
from .models import AvailabilitySlot
from datetime import datetime, timedelta

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'user', 'date', 'start_time', 'end_time', 'title', 'is_available']
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
