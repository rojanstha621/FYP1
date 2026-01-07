from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ParentProfileViewSet,
    ChildProfileViewSet,
    BabysitterRequestViewSet,
    BabysitterListingView,
    BabysitterReviewViewSet,
    BookingHistoryViewSet,
)

router = DefaultRouter()
router.register(r"profile", ParentProfileViewSet, basename="parent-profile")
router.register(r"children", ChildProfileViewSet, basename="child-profile")
router.register(r"requests", BabysitterRequestViewSet, basename="babysitter-request")
router.register(r"listings", BabysitterListingView, basename="babysitter-listing")
router.register(r"reviews", BabysitterReviewViewSet, basename="babysitter-review")
router.register(r"history", BookingHistoryViewSet, basename="booking-history")

urlpatterns = [
    path("", include(router.urls)),
]
