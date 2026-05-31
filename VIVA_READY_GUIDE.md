# FYP1 Viva Ready Guide

## 1. Project in One Line
FYP1 is a full-stack babysitter booking system built with a Django REST backend and a React + Vite frontend, supporting three roles: `ADMIN`, `PARENT`, and `BABYSITTER`.

## 2. Main Goal of the System
The system allows:
- parents to register, manage child profiles, browse babysitters, send booking requests, view stories, and leave reviews
- babysitters to manage availability, accept/reject requests, complete bookings, and post live session stories
- admins to view, edit, activate/deactivate, and delete users

## 3. Full Tech Stack

### Backend
- `Django 5.2` for the main web framework
- `Django REST Framework` for API creation
- `Simple JWT` for token-based authentication
- `SQLite` as the current database
- `drf-spectacular` for API schema and Swagger/ReDoc docs
- `django-filter` for filtering and ordering API data
- `Pillow` for image/file handling
- `python-dotenv` listed for environment variable support
- `corsheaders` is used in `settings.py` but is not listed in `requirements.txt`

### Frontend
- `React 18` for the UI
- `Vite 5` for frontend dev server and build
- `React Router DOM` for page routing
- `TanStack React Query` for server-state fetching/caching
- `Axios` for HTTP requests
- `Tailwind CSS` for styling
- `Lucide React` for icons
- `PostCSS` and `Autoprefixer` for CSS tooling

## 4. High-Level Architecture

### Architecture Pattern
This project uses a classic client-server architecture:

1. React frontend handles UI, routing, and form submission
2. Axios sends HTTP requests to Django REST endpoints
3. Django views/viewsets receive requests
4. Serializers validate and transform data
5. Models read/write to SQLite
6. JSON response is returned to frontend
7. React Query updates the UI cache automatically

### Backend Apps
- `account/` handles authentication, user model, profile model, admin user management
- `parent/` handles the business domain: parent profiles, child profiles, requests, reviews, availability, stories
- `myproject/` contains global Django config and URL routing

### Frontend Folders
- `src/pages/` contains page-level screens
- `src/components/` contains reusable UI pieces
- `src/api/` contains Axios request functions and React Query hooks
- `src/auth/` contains auth context and login/logout logic
- `src/utils/` contains date, validation, booking, and availability helpers

## 5. Backend Data Model

### User Model
Custom user model in `account.models.User`:
- login is based on `email`, not username
- each user has a `role`
- roles are `ADMIN`, `PARENT`, `BABYSITTER`

### UserProfile
Stores common profile data:
- profile picture
- address
- bio
- citizenship document for babysitters

### ParentProfile
Extra parent-specific information:
- bio
- address, city, state, zip code
- verification status
- rating summary

### ChildProfile
Each parent can create multiple children with:
- name
- DOB
- gender
- special needs
- dietary restrictions
- emergency contacts

### BabysitterRequest
This is the main booking/request table:
- parent
- child
- babysitter
- status: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `COMPLETED`
- start/end datetime
- hourly rate
- total cost
- special requirements

### BabysitterReview
After a completed booking, a parent can review the babysitter:
- rating 1 to 5
- comment
- linked one-to-one with a booking

### BabysitterAvailability
Weekly recurring schedule per babysitter:
- day of week
- start time
- end time
- overlap protection is built in

### BabysitterStory
Live updates posted by a babysitter during an active accepted session:
- linked to booking
- text content
- optional image

## 6. Backend Request Flow

### A. Authentication Flow
1. User registers through `POST /api/account/register/`
2. Backend serializer creates `User`
3. Backend also creates `UserProfile`
4. User logs in through `POST /api/account/login/`
5. Backend validates credentials and returns `access` and `refresh` JWT tokens
6. Frontend stores tokens in `localStorage`
7. Frontend fetches current user from `GET /api/account/me/`
8. Protected pages use the returned role to control access

### B. Parent Booking Flow
1. Parent logs in
2. Parent creates child profiles
3. Parent searches babysitters from `GET /api/parent/listings/` or `/search/`
4. Parent opens babysitter detail page
5. Frontend fetches:
- babysitter detail
- babysitter availability
- babysitter bookings for selected date
6. Parent submits a booking request through `POST /api/parent/requests/`
7. `BabysitterRequestSerializer` validates:
- start must be before end
- booking must be within one day
- babysitter must be available at that time
- time must not overlap accepted/completed bookings
8. Request is stored with status `PENDING`
9. Total cost is calculated from hours x hourly rate

### C. Babysitter Response Flow
1. Babysitter opens incoming requests page
2. Frontend calls `GET /api/parent/babysitter/requests/`
3. Babysitter accepts or rejects
4. On accept, backend checks conflicts again before changing status to `ACCEPTED`
5. On reject, status becomes `REJECTED`

### D. Booking Completion Flow
1. Accepted bookings appear in babysitter "My Bookings"
2. Babysitter can mark booking as `COMPLETED`
3. Completed bookings appear in history pages
4. Parent can then leave a review

### E. Story Flow
1. Babysitter can only post a story if:
- the booking belongs to them
- booking status is `ACCEPTED`
- current time is between booking `start_date` and `end_date`
2. Story is stored with optional image
3. Parent sees stories related to their bookings only
4. Parent story UI refreshes every 30 seconds

## 7. Frontend Flow

### App Startup Flow
1. `frontend/src/main.jsx` creates the React app
2. App is wrapped with:
- `QueryClientProvider`
- `BrowserRouter`
- `AuthProvider`
3. Mutation success/error toasts are globally handled from React Query mutation cache

### Authentication State Flow
1. `AuthContext` calls `useMe()`
2. If `access` token exists, frontend fetches `/account/me/`
3. Returned user is stored in context
4. `ProtectedRoute` checks:
- user exists
- role matches route restriction
5. Navbar changes links based on role

### API Communication Flow
1. Axios base URL is `http://localhost:8000/api/`
2. Request interceptor attaches JWT access token
3. Response interceptor tries token refresh on `401`
4. If refresh works, original request is retried
5. If refresh fails, tokens are cleared

### Parent UI Flow
- `Dashboard` shows quick stats and actions
- `Children` manages child CRUD
- `Babysitters` lists/searches babysitters
- `BabysitterDetail` shows profile, availability, reviews, and booking form
- `Requests` shows request list and cancellation
- `RequestDetail` shows full booking details and edit/cancel
- `BookingHistory` shows completed bookings
- `Reviews` lets parent submit ratings after completed bookings
- `ParentStories` shows live story groups by booking

### Babysitter UI Flow
- `IncomingRequests` shows pending requests
- `MyBookings` shows accepted/current/past bookings
- `BabysitterAvailability` manages weekly schedule
- `BabysitterStories` posts live updates during active sessions
- `BabysitterReviews` shows reviews received
- `BabysitterBookingHistory` shows completed job history

### Admin UI Flow
- `AdminUsers` and `AdminUserDetail` use `/api/account/users/`
- admin can list, edit, activate/deactivate, or delete users

## 8. Role-Based Access Control

### Backend Permissions
Custom permission classes:
- `IsAdminRole`
- `IsParent`
- `IsBabysitter`

These are checked in Django viewsets/views before business logic runs.

### Frontend Route Guards
`ProtectedRoute` supports:
- `adminOnly`
- `parentOnly`
- `babysitterOnly`

So authorization exists in both frontend and backend, but backend is the final authority.

## 9. Important API Endpoints

### Account
- `POST /api/account/register/`
- `POST /api/account/login/`
- `POST /api/account/logout/`
- `GET/PATCH /api/account/me/`
- `PATCH /api/account/me/profile-update/`
- `POST /api/account/change-password/`
- `GET /api/account/users/`
- `GET/PATCH/DELETE /api/account/users/<uuid:id>/`

### Parent
- `GET/PUT /api/parent/profile/me/`
- `CRUD /api/parent/children/`
- `CRUD /api/parent/requests/`
- `POST /api/parent/requests/<id>/cancel/`
- `GET /api/parent/requests/upcoming/`
- `GET /api/parent/requests/past/`
- `GET /api/parent/listings/`
- `GET /api/parent/listings/search/`
- `GET /api/parent/listings/<id>/availability/`
- `GET /api/parent/listings/<id>/bookings/?date=YYYY-MM-DD`
- `CRUD /api/parent/reviews/`
- `GET /api/parent/history/`
- `GET /api/parent/stories/`

### Babysitter
- `GET /api/parent/babysitter/requests/`
- `POST /api/parent/babysitter/requests/<id>/accept/`
- `POST /api/parent/babysitter/requests/<id>/reject/`
- `GET /api/parent/babysitter/bookings/`
- `POST /api/parent/babysitter/bookings/<id>/complete/`
- `GET /api/parent/babysitter/availability/`
- `POST/PATCH/DELETE /api/parent/babysitter/availability/`
- `GET/POST/DELETE /api/parent/babysitter/stories/`
- `GET /api/parent/babysitter/stories/active_bookings/`

## 10. Validation and Business Rules

### Booking Rules
- booking start must be before end
- booking cannot span multiple days
- babysitter must have availability covering the full selected time
- accepted/completed bookings cannot overlap
- conflict logic used is:
  `existing_start < new_end && existing_end > new_start`

### Availability Rules
- start time must be before end time
- babysitter cannot create overlapping availability slots on the same day
- serializer and model both validate overlaps

### Story Rules
- only babysitter assigned to the booking can post
- booking must be `ACCEPTED`
- story can only be posted during active session time

## 11. How React Query Is Used
- `useQuery` is used for fetching pages like users, profile, requests, history, reviews, availability
- `useMutation` is used for create/update/delete actions
- cache invalidation happens after mutations, so UI refresh is automatic
- success and failure toasts are centralized in `main.jsx`

This is a strong design choice because it reduces manual state management.

## 12. Media and File Handling
- Django serves media files in debug mode
- users can upload:
  - profile pictures
  - babysitter citizenship document
  - story images
- serializers convert file paths into absolute URLs when request context is present

## 13. API Documentation Support
- Swagger UI is served at `/`
- raw schema is at `/api/schema/`
- ReDoc is at `/api/docs/redoc/`

This comes from `drf-spectacular`.

## 14. Current Strengths of the Project
- custom user model with role-based system
- clean split between `account` and booking domain
- React Query usage is good for async data management
- booking conflict prevention exists in both frontend and backend
- availability management is implemented clearly
- live stories make the project more unique than a basic CRUD app
- UUIDs are used as primary keys, which is better for public APIs than integer IDs

## 15. Important Limitations / Honest Viva Points

### 1. Refresh endpoint mismatch
Frontend Axios tries to call:
- `POST /api/token/refresh/`

But this route is not registered in `myproject/urls.py`.

Meaning:
- login works
- logout works
- automatic token refresh may fail unless this endpoint is added

### 2. Missing dependency entry
`corsheaders` is present in `settings.py` and middleware, but it is not in `requirements.txt`.

Meaning:
- a fresh setup may fail until `django-cors-headers` is installed manually

### 3. README mentions `frontend_mis/`
The root `README.md` mentions a separate `frontend_mis/` admin interface, but that folder is not in this repo.

Meaning:
- current admin UI is actually inside the main `frontend/`

### 4. Some frontend pages allow generic error fallbacks
Some screens display broad messages like "Failed to create request" instead of always showing field-level backend errors.

Meaning:
- functionality is present, but UX can still be improved

### 5. SQLite is fine for development, not ideal for production
For real deployment, PostgreSQL would be a better choice.

## 16. Typical End-to-End Demo Flow for Viva

### Best Demo Sequence
1. Register one parent and one babysitter
2. Babysitter logs in and adds weekly availability
3. Parent logs in and creates a child profile
4. Parent searches babysitters
5. Parent opens babysitter profile and sends booking request
6. Babysitter logs in and accepts request
7. During active session, babysitter posts a story
8. Parent opens Stories page and views the update
9. Babysitter completes the booking
10. Parent opens Reviews and submits rating

This flow demonstrates almost every major module in one story.

## 17. Likely Viva Questions with Ready Answers

### Q1. Why did you create a custom user model?
Because the system needs role-based behavior and email-based login. A custom user model makes `email` the login field and stores `ADMIN`, `PARENT`, and `BABYSITTER` roles directly.

### Q2. Why split backend into `account` and `parent` apps?
`account` handles generic authentication and user management, while `parent` handles the business domain like children, bookings, reviews, availability, and stories. This separation improves maintainability.

### Q3. How do you prevent double booking?
At booking creation and again at acceptance time, the backend checks existing accepted/completed bookings for overlap using:
`existing_start < new_end && existing_end > new_start`.
The frontend also performs an early conflict check for better UX.

### Q4. Why use React Query?
It simplifies fetching, caching, mutation handling, and cache invalidation. It reduces boilerplate and keeps UI synchronized with backend changes.

### Q5. How is security handled?
JWT-based authentication is used. Backend permission classes enforce role access. Protected frontend routes improve UX, but backend permissions are the real security layer.

### Q6. Why use serializers?
Serializers validate input, enforce business rules, and convert model instances to JSON responses. They are the main validation layer in DRF.

### Q7. Why use UUID primary keys?
UUIDs are harder to guess than sequential integers and are better for public APIs where IDs are exposed to clients.

### Q8. What makes this project more than simple CRUD?
The project includes role-based flows, booking conflict prevention, recurring availability logic, live session stories, review flow, and admin management.

### Q9. What would you improve next?
- add token refresh route properly
- add stronger automated tests for serializers/viewsets
- move to PostgreSQL
- improve error reporting UX
- add payments/notifications if expanding the product

## 18. Short “Backend Flow” Answer for Viva
The backend starts in Django URL routing, sends requests to DRF views/viewsets, validates data using serializers, checks permissions and business rules, saves data through models into SQLite, and returns JSON responses. The most important backend logic is booking validation, availability validation, role permissions, and story posting restrictions.

## 19. Short “Frontend Flow” Answer for Viva
The frontend starts in `main.jsx`, wraps the app with Router, AuthContext, and React Query, then `App.jsx` maps routes by role. Pages call API hooks, hooks call Axios, Axios attaches JWT tokens, and React Query caches responses and refreshes UI after mutations. Parent, babysitter, and admin each see different screens through protected routes.

## 20. Files Most Important to Mention in Viva
- `myproject/settings.py`
- `myproject/urls.py`
- `account/models.py`
- `account/views.py`
- `account/serializers.py`
- `parent/models.py`
- `parent/views.py`
- `parent/serializers.py`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/auth/AuthContext.jsx`
- `frontend/src/api/axios.js`
- `frontend/src/api/hooks.js`
- `frontend/src/pages/BabysitterDetail.jsx`
- `frontend/src/pages/BabysitterAvailability.jsx`
- `frontend/src/pages/BabysitterStories.jsx`
- `frontend/src/pages/ParentStories.jsx`

## 21. One-Minute Project Summary
This project is a babysitter booking platform with three user roles. Django REST provides authentication, profile management, booking requests, reviews, availability scheduling, and live story APIs. React consumes those APIs using Axios and React Query, while route guards and permissions separate parent, babysitter, and admin workflows. The main technical focus is preventing booking conflicts, enforcing role-based access, and supporting a real booking lifecycle from request to review.
