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
)

urlpatterns = [
    path('', GroupListCreateView.as_view(), name='group-list-create'),  
    path('<int:group_id>/invite/', GroupInviteView.as_view(), name='group-invite'),
    path('<int:group_id>/accept/', GroupAcceptInviteView.as_view(), name='group-accept-invite'),
    path('<int:group_id>/reject/', GroupRejectInviteView.as_view(), name='group-reject-invite'),
    path('<int:group_id>/members/', GroupMembersListView.as_view(), name='group-members'),
    path('pending-invites/', PendingInvitesListView.as_view(), name='pending-invites'),
    path('<int:group_id>/', GroupDeleteView.as_view(), name='group-delete'),
    path('<int:group_id>/members/<str:username>/remove/', GroupRemoveMemberView.as_view(), name='group-remove-member'),
]