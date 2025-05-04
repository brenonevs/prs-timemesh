from rest_framework import serializers
from .models import Group, GroupMembership
from django.contrib.auth.models import User

class GroupSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    members = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='username'
    )

    class Meta:
        model = Group
        fields = ['id', 'name', 'owner', 'created_at', 'members']

class GroupMembershipSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    group = serializers.SlugRelatedField(slug_field='name', queryset=Group.objects.all())
    invited_by = serializers.SlugRelatedField(slug_field='username', read_only=True)

    class Meta:
        model = GroupMembership
        fields = ['id', 'group', 'user', 'invited_by', 'accepted', 'invited_at']