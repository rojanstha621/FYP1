from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ParentProfileViewSet,
    ChildProfileViewSet,
    BabysitterRequestViewSet,
    BabysitterListingView,
    BabysitterReviewViewSet,
    BookingHistoryViewSet,
    BabysitterIncomingRequestsViewSet,
    BabysitterBookingsViewSet,
    BabysitterReviewsReceivedViewSet,
    BabysitterHistoryViewSet,
)

# Parent routes
parent_router = DefaultRouter()
parent_router.register(r"profile", ParentProfileViewSet, basename="parent-profile")
parent_router.register(r"children", ChildProfileViewSet, basename="child-profile")
parent_router.register(r"requests", BabysitterRequestViewSet, basename="babysitter-request")
parent_router.register(r"listings", BabysitterListingView, basename="babysitter-listing")
parent_router.register(r"reviews", BabysitterReviewViewSet, basename="babysitter-review")
parent_router.register(r"history", BookingHistoryViewSet, basename="booking-history")

# Babysitter routes
babysitter_router = DefaultRouter()
babysitter_router.register(r"requests", BabysitterIncomingRequestsViewSet, basename="babysitter-incoming-requests")
babysitter_router.register(r"bookings", BabysitterBookingsViewSet, basename="babysitter-bookings")
babysitter_router.register(r"reviews", BabysitterReviewsReceivedViewSet, basename="babysitter-reviews-received")
babysitter_router.register(r"history", BabysitterHistoryViewSet, basename="babysitter-history")

urlpatterns = [
    path("", include(parent_router.urls)),
    path("babysitter/", include(babysitter_router.urls)),
]
