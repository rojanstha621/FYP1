# Babysitter Availability Feature

This feature allows babysitters to set their available time slots and ensures parents can only book during those times.

## Backend Implementation

### Model: BabysitterAvailability
- **Fields:**
  - `id` (UUID primary key)
  - `babysitter` (ForeignKey to User with role BABYSITTER)
  - `day_of_week` (Integer: 0=Monday, 6=Sunday)
  - `start_time` (TimeField)
  - `end_time` (TimeField)
  - `created_at` (DateTimeField)

### API Endpoints
- `GET /api/parent/babysitter/availability/` - List babysitter's availability
- `POST /api/parent/babysitter/availability/` - Create new availability slot
- `PATCH /api/parent/babysitter/availability/{id}/` - Update availability slot
- `DELETE /api/parent/babysitter/availability/{id}/` - Delete availability slot
- `GET /api/parent/listings/{id}/availability/` - View specific babysitter's availability

### Validation Features
1. **Time Validation:** Start time must be before end time
2. **Overlap Prevention:** No overlapping slots for same day
3. **Booking Validation:** Requests must fall within availability
4. **Double Booking Prevention:** Cannot accept overlapping bookings

## Frontend Implementation

### Pages
- **BabysitterAvailability** (`/babysitter/availability`) - Manage availability slots
- **BabysitterDetail** - Shows availability when viewing babysitter profiles

### Validation
- Client-side validation before sending requests
- Real-time availability checking
- Error handling for all validation scenarios

### Utility Functions (`utils/availability.js`)
- `validateBookingAvailability()` - Check if booking fits availability
- `groupAvailabilityByDay()` - Group slots by day of week
- `formatAvailabilityForDisplay()` - Format for UI display
- `checkTimeSlotOverlap()` - Check for overlapping time slots

## Usage Flow

### For Babysitters:
1. Go to **Availability** page
2. Add time slots for each day they're available
3. Edit or delete slots as needed
4. View availability in their profile

### For Parents:
1. Browse babysitters and view their availability
2. When sending a request, times are validated against availability
3. Get clear error messages if booking outside available times
4. Only book during confirmed available hours

## Error Messages
- "Babysitter is not available at this time"
- "This time slot overlaps with existing availability"
- "Babysitter already booked for this time slot"
- "Bookings cannot span multiple days"

## Installation & Setup

1. Ensure `django-filter` is installed:
   ```bash
   pip install django-filter
   ```

2. Add to INSTALLED_APPS in settings.py:
   ```python
   'django_filters',
   ```

3. Run migrations:
   ```bash
   python manage.py makemigrations parent
   python manage.py migrate
   ```

4. Create sample availability:
   ```bash
   python create_sample_availability.py
   ```

## Testing

The system prevents:
- ✅ Double bookings
- ✅ Bookings outside availability
- ✅ Overlapping availability slots
- ✅ Invalid time ranges
- ✅ Multi-day bookings

The system allows:
- ✅ Multiple slots per day
- ✅ Different schedules per babysitter
- ✅ Real-time availability updates
- ✅ Flexible time management