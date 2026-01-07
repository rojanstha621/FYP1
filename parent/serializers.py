from rest_framework import serializers
from .models import ParentProfile, ChildProfile, BabysitterRequest, BabysitterReview
from account.models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model (for nested use)"""

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone_number"]
        read_only_fields = ["id"]


class ParentProfileSerializer(serializers.ModelSerializer):
    """Serializer for parent profile management"""

    user = UserSerializer(read_only=True)

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
        """Validate start date is before end date"""
        if data.get("start_date") and data.get("end_date"):
            if data["start_date"] >= data["end_date"]:
                raise serializers.ValidationError("Start date must be before end date.")
        return data

    def create(self, validated_data):
        """Create request and calculate total cost"""
        request_obj = BabysitterRequest.objects.create(**validated_data)
        request_obj.calculate_total_cost()
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
