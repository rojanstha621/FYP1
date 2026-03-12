# Babysitter Booking System (FYP1)

A comprehensive Django REST API and React frontend application for managing babysitter bookings with advanced availability management and conflict prevention.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication (Parent, Babysitter, Admin)
- **Babysitter Listings**: Search and filter available babysitters
- **Booking System**: Request and manage babysitting services
- **Review System**: Rate and review babysitters
- **Profile Management**: Comprehensive user profiles

### Advanced Features ✨
- **🗓️ Availability Management**: Babysitters can set their available time slots
- **🚫 Booking Conflict Prevention**: Prevents overlapping bookings automatically
- **📊 Dashboard**: Personalized dashboards for all user types
- **💬 Admin Panel**: User management and system controls

## 🛠️ Technology Stack

### Backend
- **Django 5.2**: Web framework
- **Django REST Framework**: API development
- **SQLite**: Database (development)
- **JWT Authentication**: Secure token-based auth
- **Python 3.x**: Programming language

### Frontend
- **React 18**: Modern UI library
- **Vite**: Fast build tool and dev server
- **TanStack React Query**: Data fetching and state management
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client

## 📋 Project Structure

```
FYP1/
├── manage.py                    # Django management script
├── requirements.txt             # Python dependencies
├── db.sqlite3                   # SQLite database
├── create_babysitter.py         # Sample data creation
├── BOOKING_CONFLICTS.md         # Conflict prevention docs
├── PARENT_SUBSYSTEM_SETUP.md    # Setup documentation
│
├── myproject/                   # Django project settings
│   ├── settings.py              # Project configuration
│   ├── urls.py                  # URL routing
│   └── wsgi.py                  # WSGI configuration
│
├── account/                     # User authentication app
│   ├── models.py                # User model and profiles
│   ├── views.py                 # Authentication views
│   ├── serializers.py           # User serializers
│   └── permissions.py           # Custom permissions
│
├── parent/                      # Core booking app
│   ├── models.py                # Booking and availability models
│   ├── views.py                 # API endpoints
│   ├── serializers.py           # Data validation and serialization
│   └── urls.py                  # App URL patterns
│
├── frontend/                    # React application (Parent/Babysitter)
│   ├── src/
│   │   ├── pages/               # React page components
│   │   ├── components/          # Reusable UI components
│   │   ├── api/                 # API integration
│   │   ├── auth/                # Authentication context
│   │   └── utils/               # Utility functions
│   ├── package.json             # Node.js dependencies
│   └── vite.config.js           # Vite configuration
│
└── frontend_mis/               # Admin interface
    └── src/                    # Admin React components
```

## 🔧 Installation and Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd FYP1

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver 8000
```

### Frontend Setup
```bash
# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev  # Usually runs on port 5173

# In another terminal for admin interface
cd frontend_mis
npm install
npm run dev
```

## 📖 API Documentation

### Authentication Endpoints
```
POST /api/account/auth/register/    # User registration
POST /api/account/auth/login/       # User login
GET  /api/account/auth/user/        # Get current user
PUT  /api/account/auth/user/        # Update current user
```

### Booking Management
```
GET    /api/parent/babysittings/           # List all babysitters
POST   /api/parent/babysittings/           # Create booking request
GET    /api/parent/listings/{id}/          # Get babysitter details
GET    /api/parent/listings/{id}/bookings/ # Get babysitter bookings
POST   /api/parent/incoming-requests/{id}/accept/ # Accept booking request
```

### Availability Management
```
GET    /api/parent/babysitter-availability/     # List availabilities
POST   /api/parent/babysitter-availability/     # Create availability
PUT    /api/parent/babysitter-availability/{id}/ # Update availability
DELETE /api/parent/babysitter-availability/{id}/ # Delete availability
```

## 🎯 Key Features Details

### Availability Management
- Babysitters can set weekly recurring availability slots
- Flexible time range configuration (start/end times)
- Day-of-week selection (Monday through Sunday)
- Real-time availability display on booking forms

### Booking Conflict Prevention
- **Multi-layer Validation**: Backend serializers + frontend checks
- **Real-time Conflict Detection**: Immediate feedback on booking conflicts
- **Status-aware Logic**: Only considers ACCEPTED/COMPLETED bookings
- **Comprehensive Error Messages**: Clear conflict descriptions

#### Validation Rules:
- Overlapping time detection: `existing_start < new_end && existing_end > new_start`
- Future booking requirement
- Same-day booking limitation
- Reasonable duration constraints (1-12 hours)

### User Roles and Permissions
- **Parents**: Create booking requests, manage children profiles, write reviews
- **Babysitters**: Set availability, accept/reject requests, view earnings
- **Admins**: Full system access, user management, system monitoring

## 🧪 Testing

### Run Backend Tests
```bash
python manage.py test
python test_booking_conflicts.py  # Conflict prevention tests
```

### Manual Testing
1. Register as both parent and babysitter
2. Create babysitter availability
3. Book babysitter as parent
4. Test conflict prevention by creating overlapping bookings

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Permission-based Access**: Role-specific API access
- **Input Validation**: Comprehensive data validation
- **Race Condition Prevention**: Atomic booking operations
- **XSS Protection**: React's built-in XSS prevention

## 🚀 Deployment Notes

### Environment Variables
```bash
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-domain.com
```

### Production Recommendations
- Use PostgreSQL instead of SQLite
- Configure proper CORS settings
- Set up proper logging
- Use environment variables for sensitive data
- Enable HTTPS

## 📚 Additional Documentation

- [Booking Conflict Prevention](BOOKING_CONFLICTS.md) - Detailed conflict prevention implementation
- [Parent Subsystem Setup](PARENT_SUBSYSTEM_SETUP.md) - Parent module documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of a Final Year Project (FYP1) and is intended for academic purposes.

---

**Status**: ✅ Core features complete with availability management and conflict prevention
**Last Updated**: December 2024
