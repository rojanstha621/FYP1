Frontend manual test checklist

- [ ] Start backend and frontend
- [ ] Register user -> expect 201 and message
- [ ] Login with user -> expect tokens returned and redirect to dashboard
- [ ] Visit profile: update name, phone -> expect changes reflected
- [ ] Upload profile picture -> expect preview and API call (check backend media folder)
- [ ] Change password -> login with new password
- [ ] Admin flows (as ADMIN role): visit /admin/users, view detail, edit, delete
- [ ] Token refresh: manually drop access token and trigger a request returning 401 -> Axios should attempt refresh and retry
- [ ] Accessibility: Keyboard navigation (Tab) reaches Skip link, main controls, and form inputs; forms have labels and focus rings; alert messages are announced by screen readers

Notes: Use browser devtools Network panel to inspect API requests and responses.