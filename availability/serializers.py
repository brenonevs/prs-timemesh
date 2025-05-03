from rest_framework import serializers
from .models import AvailabilitySlot

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'user', 'date', 'start_time', 'end_time']
        read_only_fields = ['id', 'user']

class CommonAvailabilityRequestSerializer(serializers.Serializer):
    users = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Lista de IDs dos usuários para encontrar horários em comum"
    )
    date = serializers.DateField(
        help_text="Data para encontrar horários em comum"
    )

class CommonAvailabilitySerializer(serializers.Serializer):
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    users = serializers.ListField(child=serializers.CharField())
