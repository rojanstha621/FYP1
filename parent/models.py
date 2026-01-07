from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
import uuid


class ParentProfile(models.Model):
    """Model for parent profile information"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="parent_profile",
    )
    bio = models.TextField(
        blank=True, null=True, help_text=_("Brief bio about the parent")
    )
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to="parent_profiles/",
        blank=True,
        null=True,
        help_text=_("Parent profile picture"),
    )
    verified = models.BooleanField(
        default=False, help_text=_("Is parent profile verified")
    )
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    total_ratings = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Parent Profile")
        verbose_name_plural = _("Parent Profiles")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Parent Profile - {self.user.first_name} {self.user.last_name}"


class ChildProfile(models.Model):
    """Model for child profile information"""

    GENDER_CHOICES = [
        ("M", _("Male")),
        ("F", _("Female")),
        ("O", _("Other")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(
        ParentProfile, on_delete=models.CASCADE, related_name="children"
    )
    name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(
        max_length=1, choices=GENDER_CHOICES, blank=True, null=True
    )
    special_needs = models.TextField(
        blank=True,
        null=True,
        help_text=_("Any special needs, allergies, or medical conditions"),
    )
    dietary_restrictions = models.TextField(
        blank=True, null=True, help_text=_("Dietary restrictions or preferences")
    )
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Child Profile")
        verbose_name_plural = _("Child Profiles")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} (Child of {self.parent.user.first_name} {self.parent.user.last_name})"


class BabysitterRequest(models.Model):
    """Model for babysitter requests/bookings"""

    STATUS_CHOICES = [
        ("PENDING", _("Pending")),
        ("ACCEPTED", _("Accepted")),
        ("REJECTED", _("Rejected")),
        ("CANCELLED", _("Cancelled")),
        ("COMPLETED", _("Completed")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(
        ParentProfile, on_delete=models.CASCADE, related_name="babysitter_requests"
    )
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="babysitter_requests",
    )
    babysitter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "BABYSITTER"},
        related_name="parent_requests_received",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    start_date = models.DateTimeField(help_text=_("When babysitting starts"))
    end_date = models.DateTimeField(help_text=_("When babysitting ends"))
    hourly_rate = models.DecimalField(
        max_digits=10, decimal_places=2, help_text=_("Proposed hourly rate")
    )
    total_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text=_("Total cost for the booking"),
    )
    special_requirements = models.TextField(
        blank=True,
        null=True,
        help_text=_("Special requirements or notes for the babysitter"),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Babysitter Request")
        verbose_name_plural = _("Babysitter Requests")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Babysitting Request - {self.parent.user.email} - {self.status}"

    def calculate_total_cost(self):
        """Calculate total cost based on hourly rate and duration"""
        duration = (self.end_date - self.start_date).total_seconds() / 3600
        self.total_cost = self.hourly_rate * duration
        return self.total_cost


class BabysitterReview(models.Model):
    """Model for parent reviews of babysitters"""

    RATING_CHOICES = [
        (1, _("Poor")),
        (2, _("Fair")),
        (3, _("Good")),
        (4, _("Very Good")),
        (5, _("Excellent")),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(
        BabysitterRequest, on_delete=models.CASCADE, related_name="review"
    )
    parent = models.ForeignKey(
        ParentProfile, on_delete=models.CASCADE, related_name="babysitter_reviews"
    )
    babysitter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_received",
    )
    rating = models.PositiveIntegerField(
        choices=RATING_CHOICES, help_text=_("Rating from 1 to 5")
    )
    comment = models.TextField(blank=True, null=True, help_text=_("Review comment"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Babysitter Review")
        verbose_name_plural = _("Babysitter Reviews")
        ordering = ["-created_at"]
        unique_together = ("booking", "parent")

    def __str__(self):
        return f"Review by {self.parent.user.email} for Booking {self.booking.id}"
