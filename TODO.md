# Project TODO

## Current high-priority audit items

- Verify repo owner claim: admin is automatically logged out when opening `/admin/tickets`.
  - Current likely mechanism: `frontend/src/main.jsx` has a global axios 401 interceptor that clears `campus-jwt-token` and `campus-user`, then redirects to `/login`.
  - `AdminTicketsPage` calls `fetchAllTickets()` twice on load, hitting `GET /api/v1/tickets`.
  - If that endpoint returns 401 for any reason, the global interceptor makes it look like an automatic logout.
  - Need runtime confirmation with browser Network tab or backend logs to see exact failing request/status.

- Verify repo owner claim: Google login is not working.
  - Current likely mechanism: `OAuthCallback.jsx` stores the token in axios defaults and calls `GET /api/auth/me`.
  - `frontend/src/main.jsx` public path list does not include `/oauth/callback`.
  - If `/api/auth/me` returns 401 during callback, the global interceptor clears auth and redirects to `/login`.
  - Need runtime confirmation with Google callback URL and Network tab before changing behavior.

- Determine cause ownership.
  - 401 auto-logout behavior already exists in `origin/developer`.
  - Our integration work changed/cleaned token restoration in `main.jsx`, but did not originally create the response interceptor pattern.
  - Need compare actual deployed branch and exact failing response before saying this is caused by integration work or by existing team auth behavior.

## Shadcn migration focus

- Module A: `/admin/resources` is mostly migrated to shadcn primitives.
- Module B admin: `/admin/bookings` is mostly migrated to shadcn primitives.
- Module B user page: `/bookings` still uses old custom `HeroSection`, `ActionButton`, `StatusBanner`, `StatusBadge`, and `booking-*` CSS. This is the largest visible migration gap.
- `/booking-dashboard` is still a placeholder-style route and needs review if Module B includes booking manager role.

## Creative feature ideas

- Module A creative feature: resource utilization / health insights panel using resources plus booking/timetable data.
- Module B creative feature: smart alternate slot suggestions when a booking conflicts, or a polished booking availability heatmap if time is short.

## Branch safety notes

- `origin/integration/shadcn-developer-sync` is the safest current integration base.
- `origin/feature/shadcn-notification-dropdown` is small and reviewable.
- `origin/feature/shadcn-profile-page` is pushed, but profile still needs visual review.
- `origin/feature/frontend/ui` should not be merged as-is because it is broad and risky.
- Stash exists: `stash@{0}: wip-admin-layout-before-profile-branch`. Do not drop it without review.
