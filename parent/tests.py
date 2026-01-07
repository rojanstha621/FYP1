from django.test import TestCase
from django.utils import timezone
from account.models import User
from .models import ParentProfile, ChildProfile, BabysitterRequest, BabysitterReview
from datetime import timedelta


class ParentProfileTests(TestCase):
    """Tests for parent profile model and functionality"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="parent@test.com",
            first_name="John",
            last_name="Doe",
            role="PARENT",
            password="testpass123",
        )
        self.parent_profile = ParentProfile.objects.create(
            user=self.user, bio="Test bio", city="Test City", verified=True
        )

    def test_create_parent_profile(self):
        self.assertEqual(self.parent_profile.user, self.user)
        self.assertEqual(self.parent_profile.bio, "Test bio")
        self.assertTrue(self.parent_profile.verified)

    def test_parent_str_representation(self):
        expected = f"Parent Profile - {self.user.first_name} {self.user.last_name}"
        self.assertEqual(str(self.parent_profile), expected)


class ChildProfileTests(TestCase):
    """Tests for child profile model"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="parent@test.com",
            first_name="John",
            last_name="Doe",
            role="PARENT",
            password="testpass123",
        )
        self.parent_profile = ParentProfile.objects.create(user=self.user)
        self.child = ChildProfile.objects.create(
            parent=self.parent_profile,
            name="Jane Doe",
            date_of_birth="2015-01-01",
            gender="F",
        )

    def test_create_child_profile(self):
        self.assertEqual(self.child.parent, self.parent_profile)
        self.assertEqual(self.child.name, "Jane Doe")
        self.assertEqual(self.child.gender, "F")

    def test_child_str_representation(self):
        expected = f"Jane Doe (Child of {self.user.first_name} {self.user.last_name})"
        self.assertEqual(str(self.child), expected)


class BabysitterRequestTests(TestCase):
    """Tests for babysitter request model"""

    def setUp(self):
        # Create parent
        self.parent_user = User.objects.create_user(
            email="parent@test.com",
            first_name="John",
            last_name="Doe",
            role="PARENT",
            password="testpass123",
        )
        self.parent_profile = ParentProfile.objects.create(user=self.parent_user)

        # Create babysitter
        self.babysitter = User.objects.create_user(
            email="babysitter@test.com",
            first_name="Jane",
            last_name="Smith",
            role="BABYSITTER",
            password="testpass123",
        )

        # Create child
        self.child = ChildProfile.objects.create(
            parent=self.parent_profile, name="Test Child", date_of_birth="2015-01-01"
        )

        # Create request
        self.start_date = timezone.now() + timedelta(days=1)
        self.end_date = self.start_date + timedelta(hours=4)
        self.request = BabysitterRequest.objects.create(
            parent=self.parent_profile,
            child=self.child,
            babysitter=self.babysitter,
            start_date=self.start_date,
            end_date=self.end_date,
            hourly_rate=25.00,
        )

    def test_create_babysitter_request(self):
        self.assertEqual(self.request.parent, self.parent_profile)
        self.assertEqual(self.request.status, "PENDING")

    def test_calculate_total_cost(self):
        self.request.calculate_total_cost()
        # 4 hours * 25 = 100
        self.assertEqual(self.request.total_cost, 100.00)


class BabysitterReviewTests(TestCase):
    """Tests for babysitter review model"""

    def setUp(self):
        # Create parent
        self.parent_user = User.objects.create_user(
            email="parent@test.com",
            first_name="John",
            last_name="Doe",
            role="PARENT",
            password="testpass123",
        )
        self.parent_profile = ParentProfile.objects.create(user=self.parent_user)

        # Create babysitter
        self.babysitter = User.objects.create_user(
            email="babysitter@test.com",
            first_name="Jane",
            last_name="Smith",
            role="BABYSITTER",
            password="testpass123",
        )

        # Create child
        self.child = ChildProfile.objects.create(
            parent=self.parent_profile, name="Test Child", date_of_birth="2015-01-01"
        )

        # Create completed request
        self.start_date = timezone.now() - timedelta(days=1)
        self.end_date = self.start_date + timedelta(hours=4)
        self.booking = BabysitterRequest.objects.create(
            parent=self.parent_profile,
            child=self.child,
            babysitter=self.babysitter,
            start_date=self.start_date,
            end_date=self.end_date,
            status="COMPLETED",
            hourly_rate=25.00,
        )

        # Create review
        self.review = BabysitterReview.objects.create(
            booking=self.booking,
            parent=self.parent_profile,
            babysitter=self.babysitter,
            rating=5,
            comment="Excellent babysitter!",
        )

    def test_create_review(self):
        self.assertEqual(self.review.rating, 5)
        self.assertEqual(self.review.parent, self.parent_profile)
        self.assertEqual(self.review.babysitter, self.babysitter)
