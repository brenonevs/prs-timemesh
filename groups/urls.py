from django.urls import path
from .views import (
    GroupListCreateView,
    GroupInviteView,
    GroupAcceptInviteView,
    GroupMembersListView,
)

urlpatterns = [
    path('', GroupListCreateView.as_view(), name='group-list-create'),  
    path('<int:group_id>/invite/', GroupInviteView.as_view(), name='group-invite'),
    path('<int:group_id>/accept/', GroupAcceptInviteView.as_view(), name='group-accept-invite'),
    path('<int:group_id>/members/', GroupMembersListView.as_view(), name='group-members'),
]