# Test script to create sample availability data
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from account.models import User, UserProfile
from parent.models import BabysitterAvailability

# Find or create a babysitter
babysitter = User.objects.filter(role='BABYSITTER').first()
if not babysitter:
    print("No babysitter found. Creating one...")
    babysitter = User.objects.create_user(
        email='testbabysitter@example.com',
        password='testpass123',
        first_name='Test',
        last_name='Babysitter',
        role='BABYSITTER'
    )
    UserProfile.objects.create(
        user=babysitter,
        bio='Test babysitter for availability testing',
        address='Test City'
    )

# Create sample availability slots
sample_availability = [
    {'day_of_week': 0, 'start_time': '09:00', 'end_time': '17:00'},  # Monday
    {'day_of_week': 1, 'start_time': '10:00', 'end_time': '16:00'},  # Tuesday
    {'day_of_week': 2, 'start_time': '09:00', 'end_time': '15:00'},  # Wednesday
    {'day_of_week': 3, 'start_time': '11:00', 'end_time': '18:00'},  # Thursday
    {'day_of_week': 4, 'start_time': '09:00', 'end_time': '17:00'},  # Friday
    {'day_of_week': 5, 'start_time': '10:00', 'end_time': '14:00'},  # Saturday
]

# Delete existing availability for this babysitter
BabysitterAvailability.objects.filter(babysitter=babysitter).delete()

# Create new availability slots
for slot_data in sample_availability:
    try:
        slot = BabysitterAvailability.objects.create(
            babysitter=babysitter,
            **slot_data
        )
        print(f"✓ Created availability: {slot}")
    except Exception as e:
        print(f"✗ Error creating slot {slot_data}: {e}")

print(f"\nCreated availability for babysitter: {babysitter.email}")
print("Total availability slots:", BabysitterAvailability.objects.filter(babysitter=babysitter).count())