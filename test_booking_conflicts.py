# Test script to verify booking conflict prevention
import os
import django
from datetime import datetime, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from account.models import User
from parent.models import ParentProfile, BabysitterRequest, ChildProfile

def test_booking_conflicts():
    print("=== Testing Booking Conflict Prevention ===\n")
    
    # Find or create test users
    try:
        parent_user = User.objects.filter(role='PARENT').first()
        babysitter_user = User.objects.filter(role='BABYSITTER').first()
        
        if not parent_user:
            print("Creating test parent...")
            parent_user = User.objects.create_user(
                email='testparent@example.com',
                password='testpass123',
                first_name='Test',
                last_name='Parent',
                role='PARENT'
            )
        
        if not babysitter_user:
            print("Creating test babysitter...")
            babysitter_user = User.objects.create_user(
                email='testbabysitter@example.com',
                password='testpass123',
                first_name='Test',
                last_name='Babysitter',
                role='BABYSITTER'
            )
        
        # Get or create parent profile and child
        parent_profile, _ = ParentProfile.objects.get_or_create(user=parent_user)
        child, _ = ChildProfile.objects.get_or_create(
            parent=parent_profile,
            name='Test Child',
            defaults={'date_of_birth': '2020-01-01'}
        )
        
        # Clear existing test bookings
        BabysitterRequest.objects.filter(
            babysitter=babysitter_user,
            start_date__date=datetime.now().date() + timedelta(days=1)
        ).delete()
        
        print(f"✓ Test users ready:")
        print(f"  Parent: {parent_user.email}")
        print(f"  Babysitter: {babysitter_user.email}")
        print(f"  Child: {child.name}")
        print()
        
        # Test Case 1: Create first booking (should succeed)
        tomorrow = datetime.now().date() + timedelta(days=1)
        start_time1 = datetime.combine(tomorrow, datetime.strptime('09:00', '%H:%M').time())
        end_time1 = datetime.combine(tomorrow, datetime.strptime('12:00', '%H:%M').time())
        
        booking1 = BabysitterRequest.objects.create(
            parent=parent_profile,
            child=child,
            babysitter=babysitter_user,
            start_date=start_time1,
            end_date=end_time1,
            hourly_rate=15.00,
            status='ACCEPTED'
        )
        print(f"✓ Test 1 PASSED: Created first booking {start_time1.strftime('%H:%M')} - {end_time1.strftime('%H:%M')}")
        
        # Test Case 2: Try to create overlapping booking (should fail)
        start_time2 = datetime.combine(tomorrow, datetime.strptime('10:00', '%H:%M').time())
        end_time2 = datetime.combine(tomorrow, datetime.strptime('13:00', '%H:%M').time())
        
        try:
            booking2 = BabysitterRequest.objects.create(
                parent=parent_profile,
                child=child,
                babysitter=babysitter_user,
                start_date=start_time2,
                end_date=end_time2,
                hourly_rate=15.00,
                status='PENDING'
            )
            # If we get here, validation didn't work
            print(f"✗ Test 2 FAILED: Overlapping booking was allowed!")
            booking2.delete()
        except Exception as e:
            print(f"✓ Test 2 PASSED: Overlapping booking prevented - {str(e)}")
        
        # Test Case 3: Create non-overlapping booking (should succeed)
        start_time3 = datetime.combine(tomorrow, datetime.strptime('14:00', '%H:%M').time())
        end_time3 = datetime.combine(tomorrow, datetime.strptime('17:00', '%H:%M').time())
        
        try:
            booking3 = BabysitterRequest.objects.create(
                parent=parent_profile,
                child=child,
                babysitter=babysitter_user,
                start_date=start_time3,
                end_date=end_time3,
                hourly_rate=15.00,
                status='ACCEPTED'
            )
            print(f"✓ Test 3 PASSED: Non-overlapping booking created {start_time3.strftime('%H:%M')} - {end_time3.strftime('%H:%M')}")
        except Exception as e:
            print(f"✗ Test 3 FAILED: Non-overlapping booking was prevented - {str(e)}")
        
        # Test Case 4: Try to create booking that touches existing booking (should succeed)
        start_time4 = datetime.combine(tomorrow, datetime.strptime('12:00', '%H:%M').time())
        end_time4 = datetime.combine(tomorrow, datetime.strptime('14:00', '%H:%M').time())
        
        try:
            booking4 = BabysitterRequest.objects.create(
                parent=parent_profile,
                child=child,
                babysitter=babysitter_user,
                start_date=start_time4,
                end_date=end_time4,
                hourly_rate=15.00,
                status='ACCEPTED'
            )
            print(f"✓ Test 4 PASSED: Adjacent booking created {start_time4.strftime('%H:%M')} - {end_time4.strftime('%H:%M')}")
        except Exception as e:
            print(f"✗ Test 4 FAILED: Adjacent booking was prevented - {str(e)}")
        
        # Show final schedule
        print(f"\n=== Final Schedule for {tomorrow} ===")
        final_bookings = BabysitterRequest.objects.filter(
            babysitter=babysitter_user,
            start_date__date=tomorrow,
            status__in=['ACCEPTED', 'COMPLETED']
        ).order_by('start_date')
        
        for booking in final_bookings:
            print(f"  {booking.start_date.strftime('%H:%M')} - {booking.end_date.strftime('%H:%M')} ({booking.status})")
        
        print(f"\nTotal bookings: {final_bookings.count()}")
        
    except Exception as e:
        print(f"Error in testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_booking_conflicts()