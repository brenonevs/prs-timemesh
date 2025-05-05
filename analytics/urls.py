from django.urls import path
from .views import UserAvailabilityStatsView, GroupInviteStatsView

urlpatterns = [
    path('user-stats/', UserAvailabilityStatsView.as_view(), name='user-stats'),
    path('group/<int:group_id>/invite-stats/', GroupInviteStatsView.as_view(), name='group-invite-stats'),
]
