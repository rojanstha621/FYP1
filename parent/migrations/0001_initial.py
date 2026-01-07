from django.db import migrations, models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("account", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ParentProfile",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "bio",
                    models.TextField(
                        blank=True, help_text="Brief bio about the parent", null=True
                    ),
                ),
                ("address", models.CharField(blank=True, max_length=255, null=True)),
                ("city", models.CharField(blank=True, max_length=100, null=True)),
                ("state", models.CharField(blank=True, max_length=100, null=True)),
                ("zip_code", models.CharField(blank=True, max_length=20, null=True)),
                (
                    "profile_picture",
                    models.ImageField(
                        blank=True,
                        help_text="Parent profile picture",
                        null=True,
                        upload_to="parent_profiles/",
                    ),
                ),
                (
                    "verified",
                    models.BooleanField(
                        default=False, help_text="Is parent profile verified"
                    ),
                ),
                (
                    "average_rating",
                    models.DecimalField(
                        decimal_places=2,
                        default=0,
                        max_digits=3,
                        validators=[
                            MinValueValidator(0),
                            MaxValueValidator(5),
                        ],
                    ),
                ),
                ("total_ratings", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=models.CASCADE,
                        related_name="parent_profile",
                        to="account.user",
                    ),
                ),
            ],
            options={
                "verbose_name": "Parent Profile",
                "verbose_name_plural": "Parent Profiles",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="ChildProfile",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("date_of_birth", models.DateField()),
                (
                    "gender",
                    models.CharField(
                        blank=True,
                        choices=[("M", "Male"), ("F", "Female"), ("O", "Other")],
                        max_length=1,
                        null=True,
                    ),
                ),
                (
                    "special_needs",
                    models.TextField(
                        blank=True,
                        help_text="Any special needs, allergies, or medical conditions",
                        null=True,
                    ),
                ),
                (
                    "dietary_restrictions",
                    models.TextField(
                        blank=True,
                        help_text="Dietary restrictions or preferences",
                        null=True,
                    ),
                ),
                (
                    "emergency_contact_name",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
                (
                    "emergency_contact_phone",
                    models.CharField(blank=True, max_length=15, null=True),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "parent",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="children",
                        to="parent.parentprofile",
                    ),
                ),
            ],
            options={
                "verbose_name": "Child Profile",
                "verbose_name_plural": "Child Profiles",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="BabysitterRequest",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("PENDING", "Pending"),
                            ("ACCEPTED", "Accepted"),
                            ("REJECTED", "Rejected"),
                            ("CANCELLED", "Cancelled"),
                            ("COMPLETED", "Completed"),
                        ],
                        default="PENDING",
                        max_length=20,
                    ),
                ),
                (
                    "start_date",
                    models.DateTimeField(help_text="When babysitting starts"),
                ),
                ("end_date", models.DateTimeField(help_text="When babysitting ends")),
                (
                    "hourly_rate",
                    models.DecimalField(
                        decimal_places=2,
                        help_text="Proposed hourly rate",
                        max_digits=10,
                    ),
                ),
                (
                    "total_cost",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        help_text="Total cost for the booking",
                        max_digits=10,
                        null=True,
                    ),
                ),
                (
                    "special_requirements",
                    models.TextField(
                        blank=True,
                        help_text="Special requirements or notes for the babysitter",
                        null=True,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "babysitter",
                    models.ForeignKey(
                        blank=True,
                        limit_choices_to={"role": "BABYSITTER"},
                        null=True,
                        on_delete=models.SET_NULL,
                        related_name="parent_requests_received",
                        to="account.user",
                    ),
                ),
                (
                    "child",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.SET_NULL,
                        related_name="babysitter_requests",
                        to="parent.childprofile",
                    ),
                ),
                (
                    "parent",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="babysitter_requests",
                        to="parent.parentprofile",
                    ),
                ),
            ],
            options={
                "verbose_name": "Babysitter Request",
                "verbose_name_plural": "Babysitter Requests",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="BabysitterReview",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "rating",
                    models.PositiveIntegerField(
                        choices=[
                            (1, "Poor"),
                            (2, "Fair"),
                            (3, "Good"),
                            (4, "Very Good"),
                            (5, "Excellent"),
                        ],
                        help_text="Rating from 1 to 5",
                    ),
                ),
                (
                    "comment",
                    models.TextField(blank=True, help_text="Review comment", null=True),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "babysitter",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="reviews_received",
                        to="account.user",
                    ),
                ),
                (
                    "booking",
                    models.OneToOneField(
                        on_delete=models.CASCADE,
                        related_name="review",
                        to="parent.babysitterrequest",
                    ),
                ),
                (
                    "parent",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="babysitter_reviews",
                        to="parent.parentprofile",
                    ),
                ),
            ],
            options={
                "verbose_name": "Babysitter Review",
                "verbose_name_plural": "Babysitter Reviews",
                "ordering": ["-created_at"],
                "unique_together": {("booking", "parent")},
            },
        ),
    ]
