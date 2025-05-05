from rest_framework import serializers
from .models import AvailabilitySlot

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'user', 'date', 'start_time', 'end_time', 'title']
        read_only_fields = ['id', 'user']

    def validate(self, attrs):
        start = attrs.get('start_time')
        end = attrs.get('end_time')
        if start and end and start >= end:
            raise serializers.ValidationError('O horário de início deve ser antes do horário de término.')
        return attrs

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('O título é obrigatório.')
        if len(value) > 100:
            raise serializers.ValidationError('O título deve ter no máximo 100 caracteres.')
        return value.strip()

class CommonAvailabilityRequestSerializer(serializers.Serializer):
    users = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Lista de IDs dos usuários para encontrar horários em comum"
    )
    date = serializers.DateField(
        help_text="Data para encontrar horários em comum"
    )

class GroupCommonAvailabilityRequestSerializer(serializers.Serializer):
    date = serializers.DateField(
        help_text="Data para encontrar horários em comum entre os membros do grupo"
    )

class CommonAvailabilitySerializer(serializers.Serializer):
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    users = serializers.ListField(child=serializers.DictField())
