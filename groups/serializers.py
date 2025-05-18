from rest_framework import serializers
from .models import Group, GroupMembership
from django.contrib.auth.models import User

class GroupSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    owner_id = serializers.ReadOnlyField(source='owner.id')
    members = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'owner', 'owner_id', 'created_at', 'members']

    def get_members(self, obj):
        return [
            membership.user.username
            for membership in obj.memberships.filter(accepted=True)
        ]

class GroupMembershipSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    group = serializers.SlugRelatedField(slug_field='name', queryset=Group.objects.all())
    invited_by = serializers.SlugRelatedField(slug_field='username', read_only=True)
    group_id = serializers.IntegerField(source='group.id', read_only=True)

    class Meta:
        model = GroupMembership
        fields = ['id', 'group', 'group_id', 'user', 'invited_by', 'accepted', 'invited_at']