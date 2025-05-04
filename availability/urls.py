from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AvailabilitySlotViewSet, CommonAvailabilityView, GroupCommonAvailabilityView

router = DefaultRouter()
router.register(r'slots', AvailabilitySlotViewSet, basename='availability-slot')

urlpatterns = [
    path('', include(router.urls)),
    path('match/', CommonAvailabilityView.as_view(), name='common-availability'),
    path('group/<int:group_id>/match/', GroupCommonAvailabilityView.as_view(), name='group-common-availability'),
]


