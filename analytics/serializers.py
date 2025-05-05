from rest_framework import serializers

class UserAvailabilityStatsSerializer(serializers.Serializer):
    total_hours = serializers.DurationField()
    average_duration = serializers.DurationField()
    most_common_time = serializers.IntegerField(allow_null=True)
    most_common_weekday = serializers.CharField(allow_null=True)

class GroupInviteStatsSerializer(serializers.Serializer):
    acceptance_rate = serializers.FloatField()
    average_acceptance_time = serializers.DurationField()
