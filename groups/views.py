from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Group, GroupMembership
from .serializers import GroupSerializer, GroupMembershipSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
import requests
import os
from requests.auth import HTTPBasicAuth
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
        
        payload = {
            "grupo": group.name,
            "convidado": user.username,
            "email_convidado": user.email,
            "convidado_por": request.user.username,
            "link_aceite": f"https://your-site.com/groups/{group.id}/accept/"
        }
        N8N_BASIC_USER = os.getenv("N8N_BASIC_USER")
        N8N_BASIC_PASSWORD = os.getenv("N8N_BASIC_PASSWORD")
        auth = HTTPBasicAuth(N8N_BASIC_USER, N8N_BASIC_PASSWORD)

        try:
            response = requests.post(
                "http://n8n:5678/webhook/group-invite",
                json=payload,
                auth=auth,
                timeout=5
            )
            if response.status_code >= 200 and response.status_code < 300:
                print(f"[n8n] E-mail enviado para {user.email} com sucesso!", flush=True)
            else:
                print(f"[n8n] Falha ao enviar e-mail para {user.email}. Status: {response.status_code}", flush=True)
        except Exception as e:
            print(f"[n8n] Erro ao notificar n8n para {user.email}: {e}", flush=True)

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
            membership.accepted_at = timezone.now()
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

class PendingInvitesListView(generics.ListAPIView):
    serializer_class = GroupMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GroupMembership.objects.filter(
            user=self.request.user,
            accepted=False
        ).select_related('group', 'invited_by')

class GroupDeleteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        
        if group.owner != request.user:
            return Response(
                {'detail': 'Apenas o dono do grupo pode deletá-lo.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        group.delete()
        return Response({'detail': 'Grupo deletado com sucesso.'}, status=status.HTTP_202_ACCEPTED)

class GroupRejectInviteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        try:
            membership = GroupMembership.objects.get(
                group=group,
                user=request.user,
                accepted=False
            )
            membership.delete() 
            return Response({'detail': 'Convite recusado com sucesso!'}, status=status.HTTP_200_OK)
        except GroupMembership.DoesNotExist:
            return Response(
                {'detail': 'Você não possui convite pendente para este grupo.'},
                status=status.HTTP_404_NOT_FOUND
            )