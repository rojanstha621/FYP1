from django.contrib import admin
from .models import ParentProfile, ChildProfile, BabysitterRequest, BabysitterReview


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "verified", "average_rating", "created_at")
    list_filter = ("verified", "created_at")
    search_fields = ("user__email", "user__first_name", "user__last_name")
    readonly_fields = (
        "id",
        "average_rating",
        "total_ratings",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        ("User Information", {"fields": ("id", "user")}),
        (
            "Profile Information",
            {
                "fields": (
                    "bio",
                    "address",
                    "city",
                    "state",
                    "zip_code",
                    "profile_picture",
                )
            },
        ),
        (
            "Verification & Rating",
            {"fields": ("verified", "average_rating", "total_ratings")},
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(ChildProfile)
class ChildProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "date_of_birth", "created_at")
    list_filter = ("gender", "created_at")
    search_fields = ("name", "parent__user__email")
    readonly_fields = ("id", "created_at", "updated_at")

    fieldsets = (
        (
            "Child Information",
            {"fields": ("id", "parent", "name", "date_of_birth", "gender")},
        ),
        (
            "Health & Dietary Information",
            {"fields": ("special_needs", "dietary_restrictions")},
        ),
        (
            "Emergency Contact",
            {"fields": ("emergency_contact_name", "emergency_contact_phone")},
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(BabysitterRequest)
class BabysitterRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "parent", "babysitter", "status", "start_date", "created_at")
    list_filter = ("status", "start_date", "created_at")
    search_fields = ("parent__user__email", "babysitter__email")
    readonly_fields = ("id", "total_cost", "created_at", "updated_at")

    fieldsets = (
        (
            "Request Information",
            {"fields": ("id", "parent", "child", "babysitter", "status")},
        ),
        (
            "Booking Details",
            {"fields": ("start_date", "end_date", "hourly_rate", "total_cost")},
        ),
        ("Additional Information", {"fields": ("special_requirements",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(BabysitterReview)
class BabysitterReviewAdmin(admin.ModelAdmin):
    list_display = ("babysitter", "parent", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("babysitter__email", "parent__user__email")
    readonly_fields = ("id", "created_at", "updated_at")

    fieldsets = (
        ("Review Information", {"fields": ("id", "booking", "parent", "babysitter")}),
        ("Review Content", {"fields": ("rating", "comment")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
