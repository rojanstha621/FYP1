from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import ParentProfile, ChildProfile, BabysitterRequest, BabysitterReview
from .serializers import (
    ParentProfileSerializer,
    ChildProfileSerializer,
    ChildProfileDetailSerializer,
    BabysitterRequestSerializer,
    BabysitterRequestDetailSerializer,
    BabysitterReviewSerializer,
    BookingHistorySerializer,
)
from account.models import User
from account.permissions import IsParent


class ParentProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for parent profile management.
    Allows parents to view and manage their profile information.
    """

    queryset = ParentProfile.objects.all()
    serializer_class = ParentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter profiles based on user role"""
        if self.request.user.role == "PARENT":
            return ParentProfile.objects.filter(user=self.request.user)
        return ParentProfile.objects.none()

    @action(detail=False, methods=["get", "put"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get or update current user's parent profile"""
        try:
            parent_profile = request.user.parent_profile
        except ParentProfile.DoesNotExist:
            return Response(
                {"detail": "Parent profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == "PUT":
            serializer = self.get_serializer(
                parent_profile, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        serializer = self.get_serializer(parent_profile)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Create parent profile for current user"""
        serializer.save(user=self.request.user)


class ChildProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for child profile management.
    Allows parents to create, view, and manage their children's profiles.
    """

    queryset = ChildProfile.objects.all()
    serializer_class = ChildProfileSerializer
    permission_classes = [IsAuthenticated, IsParent]

    def get_queryset(self):
        """Filter children based on parent"""
        user = self.request.user
        if user.role == "PARENT":
            try:
                parent_profile = user.parent_profile
                return parent_profile.children.all()
            except ParentProfile.DoesNotExist:
                return ChildProfile.objects.none()
        return ChildProfile.objects.none()

    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == "retrieve":
            return ChildProfileDetailSerializer
        return ChildProfileSerializer

    def perform_create(self, serializer):
        """Create child profile for current user's parent profile"""
        try:
            parent_profile = self.request.user.parent_profile
            serializer.save(parent=parent_profile)
        except ParentProfile.DoesNotExist:
            return Response(
                {"detail": "Parent profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


class BabysitterRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for babysitter requests/bookings.
    Allows parents to send babysitter requests and manage bookings.
    """

    queryset = BabysitterRequest.objects.all()
    serializer_class = BabysitterRequestSerializer
    permission_classes = [IsAuthenticated, IsParent]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "child"]
    ordering_fields = ["start_date", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Filter requests based on parent"""
        user = self.request.user
        if user.role == "PARENT":
            try:
                parent_profile = user.parent_profile
                return parent_profile.babysitter_requests.all()
            except ParentProfile.DoesNotExist:
                return BabysitterRequest.objects.none()
        return BabysitterRequest.objects.none()

    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == "retrieve":
            return BabysitterRequestDetailSerializer
        return BabysitterRequestSerializer

    def perform_create(self, serializer):
        """Create request for current user's parent profile"""
        try:
            parent_profile = self.request.user.parent_profile
            serializer.save(parent=parent_profile)
        except ParentProfile.DoesNotExist:
            return Response(
                {"detail": "Parent profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        """Cancel a babysitter request"""
        babysitter_request = self.get_object()

        if babysitter_request.status in ["COMPLETED", "REJECTED", "CANCELLED"]:
            return Response(
                {
                    "detail": f"Cannot cancel request with status {babysitter_request.status}."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        babysitter_request.status = "CANCELLED"
        babysitter_request.save()

        serializer = self.get_serializer(babysitter_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def upcoming(self, request):
        """Get upcoming babysitter bookings"""
        now = timezone.now()
        bookings = (
            self.get_queryset()
            .filter(start_date__gt=now, status__in=["ACCEPTED", "PENDING"])
            .order_by("start_date")
        )

        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def past(self, request):
        """Get past/completed babysitter bookings"""
        now = timezone.now()
        bookings = self.get_queryset().filter(end_date__lt=now).order_by("-end_date")

        serializer = BookingHistorySerializer(bookings, many=True)
        return Response(serializer.data)


class BabysitterListingView(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing available babysitters.
    Allows parents to view babysitter profiles and ratings.
    """

    queryset = User.objects.filter(role="BABYSITTER", is_active=True)
    serializer_class = ParentProfileSerializer  # We'll customize this
    permission_classes = [IsAuthenticated, IsParent]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "email"]
    ordering_fields = ["first_name", "babysitter_profile__average_rating"]
    ordering = ["-babysitter_profile__average_rating"]

    def get_serializer_context(self):
        """Add request context to serializer"""
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def search(self, request):
        """Search for babysitters by name, location, or rating"""
        queryset = self.get_queryset()

        # Filter by name
        name = request.query_params.get("name")
        if name:
            queryset = queryset.filter(first_name__icontains=name) | queryset.filter(
                last_name__icontains=name
            )

        # Filter by minimum rating
        min_rating = request.query_params.get("min_rating")
        if min_rating:
            try:
                min_rating = float(min_rating)
                queryset = queryset.filter(
                    babysitter_profile__average_rating__gte=min_rating
                )
            except (ValueError, TypeError):
                pass

        # Filter by city
        city = request.query_params.get("city")
        if city:
            queryset = queryset.filter(babysitter_profile__city__icontains=city)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class BabysitterReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for babysitter reviews.
    Allows parents to create and view reviews after completed bookings.
    """

    queryset = BabysitterReview.objects.all()
    serializer_class = BabysitterReviewSerializer
    permission_classes = [IsAuthenticated, IsParent]

    def get_queryset(self):
        """Filter reviews by parent"""
        user = self.request.user
        if user.role == "PARENT":
            try:
                parent_profile = user.parent_profile
                return parent_profile.babysitter_reviews.all()
            except ParentProfile.DoesNotExist:
                return BabysitterReview.objects.none()
        return BabysitterReview.objects.none()

    def perform_create(self, serializer):
        """Create review for current parent"""
        try:
            parent_profile = self.request.user.parent_profile
            serializer.save(parent=parent_profile)
        except ParentProfile.DoesNotExist:
            return Response(
                {"detail": "Parent profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


class BookingHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing booking history.
    Shows completed and past bookings with details.
    """

    queryset = BabysitterRequest.objects.filter(status="COMPLETED")
    serializer_class = BookingHistorySerializer
    permission_classes = [IsAuthenticated, IsParent]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["child", "babysitter"]
    ordering_fields = ["start_date", "created_at"]
    ordering = ["-start_date"]

    def get_queryset(self):
        """Filter history based on parent"""
        user = self.request.user
        if user.role == "PARENT":
            try:
                parent_profile = user.parent_profile
                return parent_profile.babysitter_requests.filter(status="COMPLETED")
            except ParentProfile.DoesNotExist:
                return BabysitterRequest.objects.none()
        return BabysitterRequest.objects.none()
