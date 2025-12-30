# Frontend (Vite + React + Tailwind v3)

This is a minimal starter for the frontend using:
- React (plain JavaScript)
- Vite
- Tailwind CSS v3
- Axios for API calls
- React Query for caching (ready to use)

## Setup

From `frontend/` run:

npm install
npm run dev

The dev server default port is 5173 which is already allowed in the backend CORS settings.

## Notes
- Login returns `access` and `refresh` tokens stored in localStorage under `access` and `refresh`.
- The Axios client attempts to refresh the access token at `/api/token/refresh/` if a 401 is encountered. The backend currently does not include a refresh view in `urls.py`. If you want automatic refresh, add SimpleJWT's token/refresh endpoint or a similar refresh endpoint:

  from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

  urlpatterns += [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
  ]

- Profile picture upload uses multipart uploads to `/api/account/me/profile-update/`.

- Accessibility: Keyboard navigation improvements added — there is a Skip to content link, form inputs have proper labels and focus styles, table headers include scope, and alerts use ARIA live regions for screen reader announcements.

- Authorization checks: `useMe` now only runs if an access token exists, and it no longer retries or refetches on window focus by default — this prevents repeated 401 requests when the user is logged out.

- Visual refresh: Applied a clean Indigo (primary) + Teal (accent) palette, consistent spacing, container and card components, standardized buttons (`.btn`, `.btn-primary`, `.btn-secondary`) and form input styles to improve alignment and padding.

Manual test checklist

1. Start Django backend (default: http://localhost:8000/) and run migrations.
2. Start frontend: `npm install` then `npm run dev` (dev server: http://localhost:5173).
3. Register a new user via `/register/` -> then `/login/`.
4. Visit `/profile` to edit profile, upload image, and change password.
5. If you have an ADMIN user, visit `/admin/users` to manage users.

Notes & troubleshooting

- CORS: backend `CORS_ALLOWED_ORIGINS` already includes `http://localhost:5173`. If you run on different host/port, add it to `myproject/settings.py`.
- Token refresh: backend needs a refresh endpoint for automatic refresh on 401. Add SimpleJWT views to `urls.py` if desired (see snippet above).

If you'd like, I can add basic scripts for running both servers together or prepare a small test script to exercise the main flows.