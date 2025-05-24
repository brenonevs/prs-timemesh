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
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'detail': f'User "{username}" not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if GroupMembership.objects.filter(group=group, user=user).exists():
            return Response({'detail': 'User already invited or is a member.'}, status=400)
            
        GroupMembership.objects.create(
            group=group,
            user=user,
            invited_by=request.user,
            accepted=False
        )
        
        payload = {
            "group": group.name,
            "invited_user": user.username,
            "invited_email": user.email,
            "invited_by": request.user.username,
            "accept_link": f"https://your-site.com/groups/{group.id}/accept/"
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
                print(f"[n8n] Email sent to {user.email} successfully!", flush=True)
            else:
                print(f"[n8n] Failed to send email to {user.email}. Status: {response.status_code}", flush=True)
        except Exception as e:
            print(f"[n8n] Error notifying n8n for {user.email}: {e}", flush=True)

        return Response({'detail': f'Invite sent to {username}.'})

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
            return Response({'detail': 'Invite accepted successfully!'})
        except GroupMembership.DoesNotExist:
            return Response(
                {'detail': 'You have no pending invites for this group.'},
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
                {'detail': 'Only the group owner can delete it.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        group.delete()
        return Response({'detail': 'Group deleted successfully.'}, status=status.HTTP_202_ACCEPTED)

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
            return Response({'detail': 'Invite rejected successfully!'}, status=status.HTTP_200_OK)
        except GroupMembership.DoesNotExist:
            return Response(
                {'detail': 'You have no pending invite for this group.'},
                status=status.HTTP_404_NOT_FOUND
            )

class GroupTransferOwnershipView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        group_id = request.data.get('group_id')
        if not group_id:
            return Response(
                {'detail': 'É necessário especificar o ID do grupo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        group = get_object_or_404(Group, id=group_id)
        
        if group.owner != request.user:
            return Response(
                {'detail': 'Apenas o dono do grupo pode transferir a propriedade.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_owner_username = request.data.get('new_owner_username')
        if not new_owner_username:
            return Response(
                {'detail': 'É necessário especificar o novo dono do grupo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_owner = User.objects.get(username=new_owner_username)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Usuário não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verifica se o novo dono é membro do grupo
        if not GroupMembership.objects.filter(
            group=group,
            user=new_owner,
            accepted=True
        ).exists():
            return Response(
                {'detail': 'O novo dono deve ser um membro do grupo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Transfere a propriedade
        group.owner = new_owner
        group.save()
        
        return Response(
            {'detail': f'Propriedade do grupo transferida para {new_owner_username} com sucesso.'},
            status=status.HTTP_200_OK
        )

class GroupRemoveMemberView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        group_id = request.data.get('group_id')
        if not group_id:
            return Response(
                {'detail': 'É necessário especificar o ID do grupo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        group = get_object_or_404(Group, id=group_id)
        
        # Verifica se o usuário é membro do grupo
        if not GroupMembership.objects.filter(
            group=group,
            user=request.user,
            accepted=True
        ).exists():
            return Response(
                {'detail': 'Você não é membro deste grupo.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        username = request.data.get('username')
        if not username:
            return Response(
                {'detail': 'É necessário especificar o username do usuário.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user_to_remove = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Usuário não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Se o usuário está tentando remover a si mesmo
        if user_to_remove == request.user:
            # Se for o dono do grupo
            if group.owner == request.user:
                # Conta quantos outros membros existem
                other_members = GroupMembership.objects.filter(
                    group=group,
                    accepted=True
                ).exclude(user=request.user).count()
                
                if other_members == 0:
                    # Se não houver outros membros, deleta o grupo
                    group.delete()
                    return Response(
                        {'detail': 'Grupo deletado com sucesso pois não havia outros membros.'},
                        status=status.HTTP_200_OK
                    )
                elif other_members == 1:
                    # Se houver apenas um outro membro, transfere a propriedade automaticamente
                    new_owner = GroupMembership.objects.filter(
                        group=group,
                        accepted=True
                    ).exclude(user=request.user).first().user
                    
                    group.owner = new_owner
                    group.save()
                    
                    # Remove o antigo dono
                    membership = GroupMembership.objects.get(
                        group=group,
                        user=request.user,
                        accepted=True
                    )
                    membership.delete()
                    
                    return Response(
                        {'detail': f'Propriedade transferida automaticamente para {new_owner.username} e você saiu do grupo.'},
                        status=status.HTTP_200_OK
                    )
                else:
                    # Se houver múltiplos membros, retorna erro informando que precisa transferir a propriedade primeiro
                    return Response(
                        {
                            'detail': 'Você precisa transferir a propriedade do grupo antes de sair.',
                            'requires_ownership_transfer': True,
                            'other_members_count': other_members
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Se não for o dono, pode sair normalmente
            membership = GroupMembership.objects.get(
                group=group,
                user=request.user,
                accepted=True
            )
            membership.delete()
            return Response(
                {'detail': 'Você saiu do grupo com sucesso.'},
                status=status.HTTP_200_OK
            )
        
        # Se o usuário está tentando remover outro membro
        if group.owner != request.user:
            return Response(
                {'detail': 'Apenas o dono do grupo pode remover outros membros.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Se o usuário a ser removido for o dono do grupo
        if user_to_remove == group.owner:
            return Response(
                {'detail': 'Não é possível remover o dono do grupo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            membership = GroupMembership.objects.get(
                group=group,
                user=user_to_remove,
                accepted=True
            )
            membership.delete()
            return Response(
                {'detail': f'Usuário {username} removido do grupo com sucesso.'},
                status=status.HTTP_200_OK
            )
        except GroupMembership.DoesNotExist:
            return Response(
                {'detail': 'Usuário não é membro deste grupo.'},
                status=status.HTTP_404_NOT_FOUND
            )