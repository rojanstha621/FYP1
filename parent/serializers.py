from rest_framework import serializers
from django.utils import timezone
from .models import (
    ParentProfile,
    ChildProfile,
    BabysitterRequest,
    BabysitterReview,
    BabysitterAvailability,
    BabysitterStory,
)
from account.models import User, UserProfile


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model (for nested use)"""

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone_number"]
        read_only_fields = ["id"]


class BabysitterListSerializer(serializers.ModelSerializer):
    """Serializer for babysitter listings"""

    profile = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "profile",
            "average_rating",
            "total_reviews",
        ]
        read_only_fields = fields

    def get_profile(self, obj):
        """Get user profile information"""
        try:
            profile = obj.profile
            request = self.context.get("request")
            profile_picture = (
                request.build_absolute_uri(profile.profile_picture.url)
                if request and profile.profile_picture
                else (profile.profile_picture.url if profile.profile_picture else None)
            )
            return {
                "profile_picture": profile_picture,
                "bio": profile.bio,
                "address": profile.address,
            }
        except UserProfile.DoesNotExist:
            return None

    def get_average_rating(self, obj):
        """Calculate average rating from reviews"""
        reviews = obj.reviews_received.all()
        if reviews.exists():
            total = sum(r.rating for r in reviews)
            return round(total / reviews.count(), 2)
        return 0

    def get_total_reviews(self, obj):
        """Get total number of reviews"""
        return obj.reviews_received.count()


class BabysitterDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for babysitter profile"""

    profile = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "profile",
            "average_rating",
            "total_reviews",
            "reviews",
        ]
        read_only_fields = fields

    def get_profile(self, obj):
        """Get user profile information"""
        try:
            profile = obj.profile
            request = self.context.get("request")
            profile_picture = (
                request.build_absolute_uri(profile.profile_picture.url)
                if request and profile.profile_picture
                else (profile.profile_picture.url if profile.profile_picture else None)
            )
            return {
                "profile_picture": profile_picture,
                "bio": profile.bio,
                "address": profile.address,
            }
        except UserProfile.DoesNotExist:
            return None

    def get_average_rating(self, obj):
        """Calculate average rating from reviews"""
        reviews = obj.reviews_received.all()
        if reviews.exists():
            total = sum(r.rating for r in reviews)
            return round(total / reviews.count(), 2)
        return 0

    def get_total_reviews(self, obj):
        """Get total number of reviews"""
        return obj.reviews_received.count()

    def get_reviews(self, obj):
        """Get recent reviews (limit 10)"""
        reviews = obj.reviews_received.all()[:10]
        return [
            {
                "rating": r.rating,
                "comment": r.comment,
                "parent_name": f"{r.parent.user.first_name} {r.parent.user.last_name}",
                "created_at": r.created_at,
            }
            for r in reviews
        ]


class ParentProfileSerializer(serializers.ModelSerializer):
    """Serializer for parent profile management"""

    user = UserSerializer(read_only=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = ParentProfile
        fields = [
            "id",
            "user",
            "bio",
            "address",
            "city",
            "state",
            "zip_code",
            "profile_picture",
            "verified",
            "average_rating",
            "total_ratings",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "verified",
            "average_rating",
            "total_ratings",
            "created_at",
            "updated_at",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        profile_picture = data.get("profile_picture")
        if profile_picture:
            request = self.context.get("request")
            if request and not profile_picture.startswith("http"):
                data["profile_picture"] = request.build_absolute_uri(profile_picture)
        return data


class ChildProfileSerializer(serializers.ModelSerializer):
    """Serializer for child profile management"""

    parent_email = serializers.CharField(source="parent.user.email", read_only=True)

    class Meta:
        model = ChildProfile
        fields = [
            "id",
            "parent",
            "parent_email",
            "name",
            "date_of_birth",
            "gender",
            "special_needs",
            "dietary_restrictions",
            "emergency_contact_name",
            "emergency_contact_phone",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "parent", "parent_email", "created_at", "updated_at"]


class ChildProfileDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for child profile"""

    parent = ParentProfileSerializer(read_only=True)

    class Meta:
        model = ChildProfile
        fields = [
            "id",
            "parent",
            "name",
            "date_of_birth",
            "gender",
            "special_needs",
            "dietary_restrictions",
            "emergency_contact_name",
            "emergency_contact_phone",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "parent", "created_at", "updated_at"]


class BabysitterRequestSerializer(serializers.ModelSerializer):
    """Serializer for babysitter requests/bookings"""

    parent_email = serializers.CharField(source="parent.user.email", read_only=True)
    babysitter_info = UserSerializer(source="babysitter", read_only=True)
    child_name = serializers.CharField(source="child.name", read_only=True)

    class Meta:
        model = BabysitterRequest
        fields = [
            "id",
            "parent",
            "parent_email",
            "child",
            "child_name",
            "babysitter",
            "babysitter_info",
            "status",
            "start_date",
            "end_date",
            "hourly_rate",
            "total_cost",
            "special_requirements",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "parent",
            "parent_email",
            "babysitter_info",
            "child_name",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):
        """Validate booking request against availability and double bookings"""
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        babysitter = data.get("babysitter")

        # Basic date validation
        if start_date and end_date:
            if start_date >= end_date:
                raise serializers.ValidationError("Start date must be before end date.")

        # Ensure hourly_rate has a default value
        if not data.get("hourly_rate"):
            data["hourly_rate"] = 15.00

        # Skip availability checks if updating (partial validation) or no babysitter selected
        if not babysitter or not start_date or not end_date:
            return data

        # Check babysitter availability
        day_of_week = start_date.weekday()  # Monday = 0, Sunday = 6
        booking_start_time = start_date.time()
        booking_end_time = end_date.time()

        # Check if booking spans multiple days
        if start_date.date() != end_date.date():
            raise serializers.ValidationError(
                "Bookings cannot span multiple days. Please create separate bookings for each day."
            )

        # Find matching availability slots
        availability_slots = BabysitterAvailability.objects.filter(
            babysitter=babysitter, day_of_week=day_of_week
        )

        # Check if any availability slot covers the entire booking time
        is_available = False
        for slot in availability_slots:
            if (
                booking_start_time >= slot.start_time
                and booking_end_time <= slot.end_time
            ):
                is_available = True
                break

        if not is_available:
            day_name = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ][day_of_week]
            raise serializers.ValidationError(
                f"Babysitter is not available on {day_name} "
                f"from {booking_start_time.strftime('%H:%M')} to {booking_end_time.strftime('%H:%M')}."
            )

        # Check for booking conflicts with existing accepted/completed bookings
        # Only check against ACCEPTED and COMPLETED bookings (not PENDING)
        conflicting_bookings = BabysitterRequest.objects.filter(
            babysitter=babysitter, status__in=["ACCEPTED", "COMPLETED"]
        ).exclude(
            # Exclude current instance if updating
            id=self.instance.id if self.instance else None
        )

        for booking in conflicting_bookings:
            # Check if the new booking overlaps with existing ones
            # Overlap logic: existing_start < new_end AND existing_end > new_start
            if start_date < booking.end_date and end_date > booking.start_date:
                raise serializers.ValidationError(
                    f"Babysitter already has a booking during this time "
                    f"({booking.start_date.strftime('%Y-%m-%d %H:%M')} to "
                    f"{booking.end_date.strftime('%Y-%m-%d %H:%M')}). "
                    f"Please choose a different time."
                )

        return data

    def create(self, validated_data):
        """Create request and calculate total cost"""
        from decimal import Decimal

        request_obj = BabysitterRequest.objects.create(**validated_data)

        # Calculate total cost safely
        try:
            duration = (
                request_obj.end_date - request_obj.start_date
            ).total_seconds() / 3600
            request_obj.total_cost = Decimal(str(request_obj.hourly_rate)) * Decimal(
                str(duration)
            )
            request_obj.save()
        except Exception:
            # If calculation fails, set a default
            request_obj.total_cost = request_obj.hourly_rate
            request_obj.save()

        return request_obj


class BabysitterRequestDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for babysitter requests"""

    parent = ParentProfileSerializer(read_only=True)
    babysitter_info = UserSerializer(source="babysitter", read_only=True)
    child = ChildProfileDetailSerializer(read_only=True)
    review = serializers.SerializerMethodField()

    class Meta:
        model = BabysitterRequest
        fields = [
            "id",
            "parent",
            "child",
            "babysitter_info",
            "status",
            "start_date",
            "end_date",
            "hourly_rate",
            "total_cost",
            "special_requirements",
            "review",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_review(self, obj):
        """Get review if exists"""
        try:
            review = obj.review
            return BabysitterReviewSerializer(review).data
        except BabysitterReview.DoesNotExist:
            return None


class BabysitterReviewSerializer(serializers.ModelSerializer):
    """Serializer for babysitter reviews"""

    parent_info = UserSerializer(source="parent.user", read_only=True)
    babysitter_info = UserSerializer(source="babysitter", read_only=True)
    booking_id = serializers.CharField(source="booking.id", read_only=True)

    class Meta:
        model = BabysitterReview
        fields = [
            "id",
            "booking_id",
            "parent_info",
            "babysitter_info",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "booking_id",
            "parent_info",
            "babysitter_info",
            "created_at",
            "updated_at",
        ]


class BookingHistorySerializer(serializers.ModelSerializer):
    """Serializer for booking history view"""

    babysitter_info = UserSerializer(source="babysitter", read_only=True)
    child_name = serializers.CharField(source="child.name", read_only=True)
    duration_hours = serializers.SerializerMethodField()

    class Meta:
        model = BabysitterRequest
        fields = [
            "id",
            "child_name",
            "babysitter_info",
            "status",
            "start_date",
            "end_date",
            "duration_hours",
            "hourly_rate",
            "total_cost",
            "created_at",
        ]
        read_only_fields = fields

    def get_duration_hours(self, obj):
        """Calculate duration in hours"""
        duration = (obj.end_date - obj.start_date).total_seconds() / 3600
        return round(duration, 2)


class BabysitterAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for babysitter availability management"""

    day_of_week_display = serializers.CharField(
        source="get_day_of_week_display", read_only=True
    )

    class Meta:
        model = BabysitterAvailability
        fields = [
            "id",
            "babysitter",
            "day_of_week",
            "day_of_week_display",
            "start_time",
            "end_time",
            "created_at",
        ]
        read_only_fields = ["id", "babysitter", "created_at", "day_of_week_display"]

    def validate(self, attrs):
        """Validate availability data"""
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")
        day_of_week = attrs.get("day_of_week")

        # Basic time validation
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time"}
            )

        # Check for overlapping slots
        babysitter = self.context["request"].user

        # Build queryset for overlap check
        queryset = BabysitterAvailability.objects.filter(
            babysitter=babysitter, day_of_week=day_of_week
        )

        # If updating, exclude current instance
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        # Check for overlaps
        for slot in queryset:
            if start_time < slot.end_time and end_time > slot.start_time:
                raise serializers.ValidationError(
                    {
                        "non_field_errors": [
                            f"This time slot overlaps with existing availability: "
                            f"{slot.start_time.strftime('%H:%M')}-{slot.end_time.strftime('%H:%M')}"
                        ]
                    }
                )

        return attrs

    def create(self, validated_data):
        """Create availability slot for current user"""
        validated_data["babysitter"] = self.context["request"].user
        return super().create(validated_data)


class BabysitterStorySerializer(serializers.ModelSerializer):
    """Serializer for babysitter stories - create (babysitter) and read (parent)"""

    babysitter_name = serializers.SerializerMethodField()
    booking_info = serializers.SerializerMethodField()

    class Meta:
        model = BabysitterStory
        fields = [
            "id",
            "booking",
            "babysitter_name",
            "booking_info",
            "content",
            "image",
            "created_at",
        ]
        read_only_fields = ["id", "babysitter_name", "booking_info", "created_at"]

    def get_babysitter_name(self, obj):
        return f"{obj.babysitter.first_name} {obj.babysitter.last_name}"

    def get_booking_info(self, obj):
        return {
            "child_name": obj.booking.child.name if obj.booking.child else None,
            "start_date": obj.booking.start_date,
            "end_date": obj.booking.end_date,
            "parent_email": obj.booking.parent.user.email if obj.booking.parent else None,
        }

    def validate_booking(self, booking):
        """Ensure babysitter can only post during their active session"""
        user = self.context["request"].user
        now = timezone.now()

        if booking.babysitter != user:
            raise serializers.ValidationError("You are not the babysitter for this booking.")

        if booking.status != "ACCEPTED":
            raise serializers.ValidationError("You can only post stories for accepted bookings.")

        if not (booking.start_date <= now <= booking.end_date):
            raise serializers.ValidationError(
                "You can only post stories during the active babysitting session."
            )

        return booking

    def create(self, validated_data):
        validated_data["babysitter"] = self.context["request"].user
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        image = data.get("image")
        if image:
            request = self.context.get("request")
            if request and not str(image).startswith("http"):
                data["image"] = request.build_absolute_uri(image)
        return data
