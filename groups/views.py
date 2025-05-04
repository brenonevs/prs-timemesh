from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Group, GroupMembership
from .serializers import GroupSerializer, GroupMembershipSerializer
from django.shortcuts import get_object_or_404

class GroupListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Group.objects.filter(
            members=self.request.user,
            memberships__accepted=True
        )

    def perform_create(self, serializer):
        group = serializer.save(owner=self.request.user)

        GroupMembership.objects.create(
            group=group,
            user=self.request.user,
            invited_by=self.request.user,
            accepted=True
        )

class GroupInviteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id, owner=request.user)
        username = request.data.get('username')
        user = get_object_or_404(User, username=username)
        if GroupMembership.objects.filter(group=group, user=user).exists():
            return Response({'detail': 'Usuário já foi convidado ou já é membro.'}, status=400)
        GroupMembership.objects.create(
            group=group,
            user=user,
            invited_by=request.user,
            accepted=False
        )
        return Response({'detail': f'Convite enviado para {username}.'})

class GroupAcceptInviteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        try:
            membership = GroupMembership.objects.get(
                group=group,
                user=request.user,
                accepted=False
            )
            membership.accepted = True
            membership.save()
            return Response({'detail': 'Convite aceito com sucesso!'})
        except GroupMembership.DoesNotExist:
            return Response(
                {'detail': 'Você não possui convites pendentes para este grupo.'},
                status=status.HTTP_400_BAD_REQUEST
            )

class GroupMembersListView(generics.ListAPIView):
    serializer_class = GroupMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        group = get_object_or_404(Group, id=group_id)
        if not GroupMembership.objects.filter(group=group, user=self.request.user, accepted=True).exists():
            return GroupMembership.objects.none()
        return GroupMembership.objects.filter(group=group, accepted=True)