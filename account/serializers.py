from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserProfile


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # IMPORTANT: authenticate uses username keyword (mapped to USERNAME_FIELD)
        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError({"detail": "Invalid credentials"})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "Account is disabled"})

        attrs["user"] = user
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        # just basic presence validation
        if not attrs.get("refresh"):
            raise serializers.ValidationError({"refresh": "Refresh token is required"})
        return attrs

    def save(self, **kwargs):
        refresh_token = self.validated_data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()  # requires token_blacklist app
        return {}


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "is_active", "created_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    citizenship_document = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = [
            "profile_picture",
            "address",
            "bio",
            "citizenship_document",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        for field in ["profile_picture", "citizenship_document"]:
            file_url = data.get(field)
            if file_url and request and not file_url.startswith("http"):
                data[field] = request.build_absolute_uri(file_url)

        return data


class MeSerializer(serializers.Serializer):
    """
    Combined 'me' response:
    - user fields
    - profile fields
    """

    user = UserBasicSerializer()
    profile = UserProfileSerializer()


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    For updating user's own basic info (NOT role, NOT is_active).
    """

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone_number",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save(update_fields=["password"])
        return {}


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )
    citizenship_document = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "password",
            "citizenship_document",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        citizenship_document = validated_data.pop("citizenship_document", None)

        # Create user
        user = User.objects.create(
            email=validated_data["email"],
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name"),
            phone_number=validated_data.get("phone_number"),
            role=validated_data["role"],
            is_active=True,
        )

        user.set_password(password)
        user.save()

        # Create profile with optional citizenship document
        profile = UserProfile.objects.create(user=user)
        if citizenship_document:
            profile.citizenship_document = citizenship_document
            profile.save()

        return user


class AdminUserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    citizenship_document = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            "profile_picture",
            "address",
            "bio",
            "citizenship_document",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_profile_picture(self, obj):
        if not obj.profile_picture:
            return None
        request = self.context.get("request")
        url = obj.profile_picture.url
        return request.build_absolute_uri(url) if request else url

    def get_citizenship_document(self, obj):
        if not obj.citizenship_document:
            return None
        request = self.context.get("request")
        url = obj.citizenship_document.url
        return request.build_absolute_uri(url) if request else url


class AdminUserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AdminUserDetailSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "is_active",
            "created_at",
            "updated_at",
            "profile",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "profile"]

    def get_profile(self, obj):
        profile = getattr(obj, "profile", None)
        if not profile:
            profile = UserProfile.objects.filter(user=obj).first()
        return (
            AdminUserProfileSerializer(profile, context=self.context).data
            if profile
            else None
        )


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "is_active",
        ]

    def validate_email(self, value):
        value = (value or "").strip().lower()
        if not value:
            raise serializers.ValidationError("Email is required")
        qs = User.objects.filter(email=value).exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("Email already exists")
        return value
