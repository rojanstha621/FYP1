# Booking Conflict Prevention Feature

This feature ensures that babysitters cannot have overlapping bookings, preventing double-booking scenarios and maintaining schedule integrity.

## Implementation Overview

### Backend Implementation

#### 1. Validation Logic
- **Location**: `parent/serializers.py` - `BabysitterRequestSerializer.validate()`
- **Trigger Points**: 
  - When creating new booking requests
  - When babysitters accept booking requests
- **Validation Rules**:
  - Only check conflicts with `ACCEPTED` and `COMPLETED` bookings
  - Use overlap detection: `existing_start < new_end AND existing_end > new_start`
  - Return appropriate error messages

#### 2. Enhanced Accept Method
- **Location**: `parent/views.py` - `BabysitterIncomingRequestsViewSet.accept()`
- **Features**:
  - Double-checks for conflicts before accepting requests
  - Prevents acceptance if conflict exists
  - Returns clear error messages

#### 3. API Endpoints
- **New Endpoint**: `GET /api/parent/listings/{id}/bookings/?date=YYYY-MM-DD`
- **Purpose**: Fetch existing bookings for a babysitter on a specific date
- **Response**: Array of booking objects with time information

### Frontend Implementation

#### 1. Enhanced Error Handling
- **Files**: `BabysitterDetail.jsx`, `Requests.jsx`
- **Features**:
  - Specific error messages for booking conflicts
  - Client-side validation before API calls
  - Real-time conflict checking when dates are selected

#### 2. Booking Conflict Display
- **Location**: `BabysitterDetail.jsx`
- **Features**:
  - Shows existing bookings when user selects a date
  - Visual warnings for time conflicts
  - Prevents form submission for obvious conflicts

#### 3. Utility Functions
- **File**: `utils/booking.js`
- **Functions**:
  - `checkBookingConflicts()` - Detect overlapping bookings
  - `validateBookingRequest()` - Comprehensive booking validation
  - `formatConflictErrorMessage()` - Standardized error messages
  - `getUnavailableTimeSlots()` - Get blocked time ranges

## Validation Rules

### Conflict Detection Logic
```javascript
// Two bookings overlap if:
existing_start < new_end && existing_end > new_start

// Examples:
// Booking 1: 09:00 - 12:00
// Booking 2: 10:00 - 13:00
// Result: CONFLICT (10:00 < 12:00 AND 13:00 > 09:00)

// Booking 1: 09:00 - 12:00  
// Booking 2: 12:00 - 15:00
// Result: NO CONFLICT (12:00 = 12:00, no overlap)
```

### Status Considerations
- **PENDING**: Not considered for conflicts (allows multiple pending requests)
- **ACCEPTED**: Blocks new bookings
- **COMPLETED**: Blocks new bookings (historical data protection)
- **REJECTED/CANCELLED**: Ignored for conflict checking

### Additional Validations
1. **Future Bookings Only**: Start date must be in the future
2. **Same Day Only**: Bookings cannot span multiple days
3. **Reasonable Duration**: 1-12 hours maximum
4. **Time Order**: Start time must be before end time

## Error Messages

### Backend Error Messages
- `"Babysitter already has a booking during this time (YYYY-MM-DD HH:MM to YYYY-MM-DD HH:MM). Please choose a different time."`
- `"Babysitter already has a booking during this time. Conflicting booking: YYYY-MM-DD HH:MM to YYYY-MM-DD HH:MM."`

### Frontend Error Messages
- `"Selected time is already booked. Please choose another time."`
- `"Booking date must be in the future"`
- `"End time must be after start time"`
- `"Bookings cannot span multiple days"`

## API Usage Examples

### Check Existing Bookings
```javascript
// Get babysitter's bookings for a specific date
const bookings = await getBabysitterBookings(babysitterId, '2024-03-15')

// Response format:
[
  {
    "id": "booking-uuid",
    "start_time": "09:00",
    "end_time": "12:00", 
    "start_date": "2024-03-15T09:00:00Z",
    "end_date": "2024-03-15T12:00:00Z",
    "status": "ACCEPTED",
    "parent_name": "John Doe"
  }
]
```

### Handle Booking Conflicts
```javascript
try {
  await createRequest.mutateAsync(bookingData)
} catch (error) {
  if (error.response?.data?.detail?.includes('booking during this time')) {
    setMessage('Selected time is already booked. Please choose another time.')
  }
}
```

## Testing

### Test Scenarios Covered
1. ✅ **First Booking**: Creates successfully
2. ✅ **Overlapping Booking**: Prevented with error message
3. ✅ **Adjacent Booking**: Allowed (no overlap)
4. ✅ **Multiple Conflicts**: All detected and prevented
5. ✅ **Status Filtering**: Only ACCEPTED/COMPLETED bookings block

### Running Tests
```bash
# Backend validation tests
python test_booking_conflicts.py

# Manual testing scenarios
1. Create booking as parent
2. Try to create overlapping booking
3. Accept booking as babysitter
4. Try to accept overlapping request
```

## Security Considerations

### Race Conditions
- Database-level validation prevents race conditions
- Atomic operations for booking creation/acceptance
- Proper transaction handling

### Data Integrity
- Cannot modify booking times after acceptance
- Historical booking data preserved
- Audit trail for booking changes

## Performance Optimizations

### Database Queries
- Efficient filtering by babysitter and date range
- Indexed queries on start_date and end_date fields
- Minimal data transfer for conflict checking

### Frontend Optimizations
- Client-side validation reduces server load
- Debounced API calls for real-time checking
- Cached booking data for repeated checks

## Future Enhancements

1. **Buffer Time**: Optional gaps between bookings
2. **Recurring Bookings**: Handle weekly/monthly patterns  
3. **Bulk Operations**: Conflict checking for multiple bookings
4. **Calendar Integration**: Visual conflict detection
5. **Automatic Rescheduling**: Suggest alternative times

## File Changes Summary

### Backend Files
- `parent/models.py` - Model validation
- `parent/serializers.py` - Enhanced validation logic  
- `parent/views.py` - Accept method improvements
- `parent/urls.py` - New booking endpoint

### Frontend Files
- `pages/BabysitterDetail.jsx` - Enhanced booking form
- `pages/Requests.jsx` - Improved error handling
- `api/availability.js` - New booking API function
- `api/hooks.js` - React Query integration
- `utils/booking.js` - Conflict detection utilities

### Test Files
- `test_booking_conflicts.py` - Backend validation tests
- Sample data creation scripts

The booking conflict prevention system is now fully comprehensive, providing both frontend and backend validation with clear error messages and robust conflict detection.