from django.urls import path
from .views import (
    GroupListCreateView,
    GroupInviteView,
    GroupAcceptInviteView,
    GroupMembersListView,
    PendingInvitesListView,
    GroupDeleteView,
    GroupRejectInviteView,
    GroupRemoveMemberView,
    GroupTransferOwnershipView,
)

urlpatterns = [
    path('pending-invites/', PendingInvitesListView.as_view(), name='pending-invites'),
    path('remove-member/', GroupRemoveMemberView.as_view(), name='group-remove-member'),
    path('transfer-ownership/', GroupTransferOwnershipView.as_view(), name='group-transfer-ownership'),
    path('<int:group_id>/invite/', GroupInviteView.as_view(), name='group-invite'),
    path('<int:group_id>/accept/', GroupAcceptInviteView.as_view(), name='group-accept-invite'),
    path('<int:group_id>/reject/', GroupRejectInviteView.as_view(), name='group-reject-invite'),
    path('<int:group_id>/members/', GroupMembersListView.as_view(), name='group-members'),
    path('<int:group_id>/', GroupDeleteView.as_view(), name='group-delete'),
    path('', GroupListCreateView.as_view(), name='group-list-create'),
]