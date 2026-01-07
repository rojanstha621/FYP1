# Parent Management Subsystem

The Parent Management Subsystem provides comprehensive functionality for parents to manage their profiles, children, and babysitter bookings.

## Features

### 1. Parent Profile Management
- Create and manage parent profile information
- Store personal details (name, email, phone, address)
- Profile picture upload
- Bio/description
- Verification status
- Average rating from babysitters
- Complete profile management via `/api/parent/profile/`

### 2. Child Profile Management
- Create and manage multiple child profiles per parent
- Store child information:
  - Name and date of birth
  - Gender
  - Special needs and medical conditions
  - Dietary restrictions
  - Emergency contact information
- Easy access via `/api/parent/children/`

### 3. View Babysitter Listings
- Browse available babysitters in the system
- Search by:
  - Name (first or last)
  - Minimum rating
  - City/location
- View babysitter profiles and ratings
- Access via `/api/parent/listings/`

### 4. Send Babysitter Requests
- Request babysitter services with:
  - Specific date and time range
  - Selected child
  - Hourly rate proposal
  - Special requirements/notes
  - Automatic cost calculation based on duration
- Track request status (PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED)
- Cancel pending requests
- Access via `/api/parent/requests/`

### 5. View Booking History
- View completed and past bookings
- Access details of each booking:
  - Child information
  - Babysitter information
  - Booking dates and duration
  - Cost breakdown
  - Review information if available
- Filter and sort by various criteria
- Access via `/api/parent/history/`

## API Endpoints

### Parent Profile
- `GET/PUT /api/parent/profile/me/` - Get or update your profile
- `GET /api/parent/profile/` - List all parent profiles
- `POST /api/parent/profile/` - Create a parent profile

### Child Profiles
- `GET /api/parent/children/` - List all your children
- `POST /api/parent/children/` - Add a new child
- `GET /api/parent/children/{id}/` - View child details
- `PUT /api/parent/children/{id}/` - Update child profile
- `DELETE /api/parent/children/{id}/` - Delete child profile

### Babysitter Requests
- `GET /api/parent/requests/` - List all requests
- `POST /api/parent/requests/` - Send new request
- `GET /api/parent/requests/{id}/` - View request details
- `PUT /api/parent/requests/{id}/` - Update request
- `DELETE /api/parent/requests/{id}/` - Delete request
- `POST /api/parent/requests/{id}/cancel/` - Cancel request
- `GET /api/parent/requests/upcoming/` - Get upcoming bookings
- `GET /api/parent/requests/past/` - Get past bookings

### Babysitter Listings
- `GET /api/parent/listings/` - View all babysitters
- `GET /api/parent/listings/search/` - Search babysitters
  - Query params: `name`, `min_rating`, `city`

### Reviews
- `GET /api/parent/reviews/` - List your reviews
- `POST /api/parent/reviews/` - Create a review
- `GET /api/parent/reviews/{id}/` - View review details

### Booking History
- `GET /api/parent/history/` - View booking history
- `GET /api/parent/history/?child={child_id}` - Filter by child
- `GET /api/parent/history/?babysitter={babysitter_id}` - Filter by babysitter

## Models

### ParentProfile
Stores parent account information and ratings.

**Fields:**
- `id` - UUID primary key
- `user` - OneToOne relationship with User model
- `bio` - Biography text
- `address` - Street address
- `city` - City name
- `state` - State/Province
- `zip_code` - Postal code
- `profile_picture` - Image upload
- `verified` - Boolean verification status
- `average_rating` - Decimal rating (0-5)
- `total_ratings` - Count of ratings
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### ChildProfile
Stores information about children under parent care.

**Fields:**
- `id` - UUID primary key
- `parent` - ForeignKey to ParentProfile
- `name` - Child's name
- `date_of_birth` - Birth date
- `gender` - Gender choice (M/F/O)
- `special_needs` - Medical/special needs info
- `dietary_restrictions` - Dietary info
- `emergency_contact_name` - Emergency contact
- `emergency_contact_phone` - Emergency phone
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### BabysitterRequest
Stores babysitting requests/bookings.

**Fields:**
- `id` - UUID primary key
- `parent` - ForeignKey to ParentProfile
- `child` - ForeignKey to ChildProfile
- `babysitter` - ForeignKey to User (BABYSITTER role)
- `status` - Status choice (PENDING/ACCEPTED/REJECTED/CANCELLED/COMPLETED)
- `start_date` - Booking start datetime
- `end_date` - Booking end datetime
- `hourly_rate` - Proposed hourly rate
- `total_cost` - Calculated total cost
- `special_requirements` - Special notes
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### BabysitterReview
Stores parent reviews of babysitters.

**Fields:**
- `id` - UUID primary key
- `booking` - OneToOne to BabysitterRequest
- `parent` - ForeignKey to ParentProfile
- `babysitter` - ForeignKey to User
- `rating` - Rating choice (1-5)
- `comment` - Review text
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Usage Examples

### Create a Parent Profile
```bash
PUT /api/parent/profile/me/
Content-Type: application/json

{
  "bio": "Looking for reliable childcare",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001"
}
```

### Add a Child
```bash
POST /api/parent/children/
Content-Type: application/json

{
  "name": "Emma Johnson",
  "date_of_birth": "2018-05-15",
  "gender": "F",
  "special_needs": "None",
  "dietary_restrictions": "Nut allergy",
  "emergency_contact_name": "Sarah Johnson",
  "emergency_contact_phone": "555-1234"
}
```

### Send Babysitter Request
```bash
POST /api/parent/requests/
Content-Type: application/json

{
  "child": "uuid-of-child",
  "start_date": "2024-01-20T18:00:00Z",
  "end_date": "2024-01-20T22:00:00Z",
  "hourly_rate": "25.00",
  "special_requirements": "Kids go to bed at 8pm"
}
```

### Search Babysitters
```bash
GET /api/parent/listings/search/?name=jane&min_rating=4.0&city=New%20York
```

### Create a Review
```bash
POST /api/parent/reviews/
Content-Type: application/json

{
  "booking": "uuid-of-booking",
  "babysitter": "uuid-of-babysitter",
  "rating": 5,
  "comment": "Excellent babysitter! Highly recommended."
}
```

## Permissions

- **IsAuthenticated** - User must be logged in
- **IsParent** - User must have PARENT role

All endpoints require authentication and parent role verification.

## Serializers

- `ParentProfileSerializer` - Basic parent profile
- `ChildProfileSerializer` - Child profile with parent reference
- `ChildProfileDetailSerializer` - Detailed child profile with parent info
- `BabysitterRequestSerializer` - Basic babysitter request
- `BabysitterRequestDetailSerializer` - Detailed request with review info
- `BabysitterReviewSerializer` - Review with user information
- `BookingHistorySerializer` - Simplified booking history view

## Admin Interface

The parent app includes Django admin configuration for:
- Parent profile management
- Child profile management
- Babysitter request management
- Review management

Access via `/admin/parent/`

## Testing

Unit tests are included for:
- ParentProfile model
- ChildProfile model
- BabysitterRequest model
- BabysitterReview model

Run tests with:
```bash
python manage.py test parent
```
