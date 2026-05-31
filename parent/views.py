from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import F
from .models import ParentProfile, ChildProfile, BabysitterRequest, BabysitterReview, BabysitterAvailability, BabysitterStory
from .serializers import (
    ParentProfileSerializer,
    ChildProfileSerializer,
    ChildProfileDetailSerializer,
    BabysitterRequestSerializer,
    BabysitterRequestDetailSerializer,
    BabysitterReviewSerializer,
    BookingHistorySerializer,
    BabysitterListSerializer,
    BabysitterDetailSerializer,
    BabysitterAvailabilitySerializer,
    BabysitterStorySerializer,
)
from account.models import User
from account.permissions import IsParent, IsBabysitter


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
        parent_profile, _ = ParentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(parent=parent_profile)


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
        parent_profile, _ = ParentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(parent=parent_profile)

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
    serializer_class = BabysitterListSerializer
    permission_classes = [IsAuthenticated, IsParent]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "email"]
    ordering = ["first_name"]

    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == "retrieve":
            return BabysitterDetailSerializer
        return BabysitterListSerializer

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
            queryset = queryset.filter(
                first_name__icontains=name
            ) | queryset.filter(last_name__icontains=name)

        # Filter by city - search in profile address
        city = request.query_params.get("city")
        if city:
            queryset = queryset.filter(profile__address__icontains=city)

        # Note: Rating filter removed since it requires annotation
        # Can be implemented with queryset annotation if needed

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def availability(self, request, pk=None):
        """Get availability for a specific babysitter"""
        babysitter = self.get_object()
        availability_slots = BabysitterAvailability.objects.filter(
            babysitter=babysitter
        ).order_by('day_of_week', 'start_time')
        
        serializer = BabysitterAvailabilitySerializer(availability_slots, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def bookings(self, request, pk=None):
        """Get existing bookings for a babysitter on a specific date"""
        babysitter = self.get_object()
        date_param = request.query_params.get('date')
        
        if not date_param:
            return Response(
                {"detail": "Date parameter is required (format: YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from datetime import datetime
            target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get bookings for the specific date with ACCEPTED or COMPLETED status
        bookings = BabysitterRequest.objects.filter(
            babysitter=babysitter,
            start_date__date=target_date,
            status__in=['ACCEPTED', 'COMPLETED']
        ).order_by('start_date')
        
        # Return simplified booking data showing time conflicts
        booking_data = [
            {
                'id': booking.id,
                'start_time': booking.start_date.strftime('%H:%M'),
                'end_time': booking.end_date.strftime('%H:%M'),
                'start_date': booking.start_date.isoformat(),
                'end_date': booking.end_date.isoformat(),
                'status': booking.status,
                'parent_name': f"{booking.parent.user.first_name} {booking.parent.user.last_name}" if booking.parent else None
            }
            for booking in bookings
        ]
        
        return Response(booking_data)


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
            booking = serializer.validated_data["booking"]
            serializer.save(
                parent=parent_profile,
                babysitter=booking.babysitter,
            )
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found.")


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


# ============================================
# BABYSITTER VIEWSETS
# ============================================


class BabysitterIncomingRequestsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for babysitters to view and manage incoming requests.
    Babysitters can view requests sent to them and accept/reject them.
    """

    queryset = BabysitterRequest.objects.all()
    serializer_class = BabysitterRequestSerializer
    permission_classes = [IsAuthenticated, IsBabysitter]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status"]
    ordering_fields = ["start_date", "created_at"]
    ordering = ["-created_at"]
    http_method_names = ["get", "patch", "post"]

    def get_queryset(self):
        """Filter requests sent to current babysitter"""
        return BabysitterRequest.objects.filter(
            babysitter=self.request.user
        ).exclude(status__in=["COMPLETED", "CANCELLED"])

    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == "retrieve":
            return BabysitterRequestDetailSerializer
        return BabysitterRequestSerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsBabysitter])
    def accept(self, request, pk=None):
        """Accept a babysitter request with double booking validation"""
        booking_request = self.get_object()

        if booking_request.status != "PENDING":
            return Response(
                {"detail": f"Cannot accept request with status {booking_request.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for conflicting bookings before accepting
        # Check against both ACCEPTED and COMPLETED bookings
        conflicting_bookings = BabysitterRequest.objects.filter(
            babysitter=request.user,
            status__in=['ACCEPTED', 'COMPLETED']
        ).exclude(id=booking_request.id)

        for booking in conflicting_bookings:
            # Check if the new booking overlaps with existing ones
            # Overlap logic: existing_start < new_end AND existing_end > new_start
            if (booking_request.start_date < booking.end_date and 
                booking_request.end_date > booking.start_date):
                return Response(
                    {
                        "detail": "Babysitter already has a booking during this time. "
                                 f"Conflicting booking: {booking.start_date.strftime('%Y-%m-%d %H:%M')} to "
                                 f"{booking.end_date.strftime('%Y-%m-%d %H:%M')}."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        booking_request.status = "ACCEPTED"
        booking_request.save()

        return Response(
            {"detail": "Request accepted successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsBabysitter])
    def reject(self, request, pk=None):
        """Reject a babysitter request"""
        booking_request = self.get_object()

        if booking_request.status != "PENDING":
            return Response(
                {"detail": f"Cannot reject request with status {booking_request.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking_request.status = "REJECTED"
        booking_request.save()

        return Response(
            {"detail": "Request rejected."},
            status=status.HTTP_200_OK,
        )


class BabysitterBookingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for babysitters to view their accepted/ongoing bookings.
    """

    queryset = BabysitterRequest.objects.all()
    serializer_class = BabysitterRequestSerializer
    permission_classes = [IsAuthenticated, IsBabysitter]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status"]
    ordering_fields = ["start_date", "created_at"]
    ordering = ["start_date"]
    http_method_names = ["get", "post"]

    def get_queryset(self):
        """Filter bookings for current babysitter"""
        return BabysitterRequest.objects.filter(
            babysitter=self.request.user,
            status="ACCEPTED"
        )

    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == "retrieve":
            return BabysitterRequestDetailSerializer
        return BabysitterRequestSerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsBabysitter])
    def complete(self, request, pk=None):
        """Mark a booking as completed"""
        booking = self.get_object()

        if booking.status != "ACCEPTED":
            return Response(
                {"detail": f"Cannot complete booking with status {booking.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = "COMPLETED"
        booking.save()

        return Response(
            {"detail": "Booking marked as completed."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated, IsBabysitter])
    def upcoming(self, request):
        """Get upcoming accepted bookings"""
        now = timezone.now()
        bookings = self.get_queryset().filter(start_date__gt=now).order_by("start_date")
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated, IsBabysitter])
    def past(self, request):
        """Get past bookings"""
        now = timezone.now()
        bookings = BabysitterRequest.objects.filter(
            babysitter=request.user,
            end_date__lt=now
        ).order_by("-end_date")
        serializer = BookingHistorySerializer(bookings, many=True)
        return Response(serializer.data)


class BabysitterReviewsReceivedViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for babysitters to view reviews they've received.
    """

    queryset = BabysitterReview.objects.all()
    serializer_class = BabysitterReviewSerializer
    permission_classes = [IsAuthenticated, IsBabysitter]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Filter reviews received by current babysitter"""
        return BabysitterReview.objects.filter(babysitter=self.request.user)


class BabysitterHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing babysitter's completed booking history.
    """

    queryset = BabysitterRequest.objects.filter(status="COMPLETED")
    serializer_class = BookingHistorySerializer
    permission_classes = [IsAuthenticated, IsBabysitter]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["parent"]
    ordering_fields = ["start_date", "created_at"]
    ordering = ["-start_date"]

    def get_queryset(self):
        """Filter history for current babysitter"""
        return BabysitterRequest.objects.filter(
            babysitter=self.request.user,
            status="COMPLETED"
        )


class BabysitterAvailabilityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for babysitter availability management.
    Allows babysitters to create, view, update, and delete their availability slots.
    """

    serializer_class = BabysitterAvailabilitySerializer
    permission_classes = [IsAuthenticated, IsBabysitter]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["day_of_week"]
    ordering_fields = ["day_of_week", "start_time"]
    ordering = ["day_of_week", "start_time"]

    def get_queryset(self):
        """Filter availability slots for current babysitter"""
        return BabysitterAvailability.objects.filter(babysitter=self.request.user)

    def perform_create(self, serializer):
        """Create availability slot for current babysitter"""
        serializer.save(babysitter=self.request.user)


# ============================================
# STORY VIEWSETS
# ============================================


class BabysitterStoryViewSet(viewsets.ModelViewSet):
    """
    Babysitter can POST stories only during an active (ongoing) ACCEPTED booking.
    Babysitter can also GET/DELETE their own stories.
    """

    serializer_class = BabysitterStorySerializer
    permission_classes = [IsAuthenticated, IsBabysitter]
    http_method_names = ["get", "post", "delete"]

    def get_queryset(self):
        return BabysitterStory.objects.filter(babysitter=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(babysitter=self.request.user)

    @action(detail=False, methods=["get"])
    def active_bookings(self, request):
        """Return babysitter's currently ongoing ACCEPTED bookings (for story posting UI)"""
        now = timezone.now()
        bookings = BabysitterRequest.objects.filter(
            babysitter=request.user,
            status="ACCEPTED",
            start_date__lte=now,
            end_date__gte=now,
        )
        serializer = BabysitterRequestSerializer(bookings, many=True)
        return Response(serializer.data)


class ParentStoriesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Parents can GET stories from their hired babysitters.
    Only stories created within the booking's start_date–end_date window are returned.
    Optionally filter by ?booking_id=<uuid>.
    """

    serializer_class = BabysitterStorySerializer
    permission_classes = [IsAuthenticated, IsParent]

    def get_queryset(self):
        user = self.request.user
        try:
            parent_profile = user.parent_profile
        except ParentProfile.DoesNotExist:
            return BabysitterStory.objects.none()

        queryset = BabysitterStory.objects.filter(
            booking__parent=parent_profile,
            booking__status__in=["ACCEPTED", "COMPLETED"],
        ).filter(
            created_at__gte=F("booking__start_date"),
            created_at__lte=F("booking__end_date"),
        )

        booking_id = self.request.query_params.get("booking_id")
        if booking_id:
            queryset = queryset.filter(booking_id=booking_id)

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
