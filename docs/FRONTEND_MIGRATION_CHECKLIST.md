### Homebit Frontend Migration Checklist (.tsx)

This checklist tracks the migration of components and routes from `localStorage` to **Cookie-based Authentication**, **gRPC-Web**, and **SSR (Server-Side Rendering)**.

#### Legend
- [x] **Auth**: Uses `getAuthFromCookies()` or `AuthContext` (Cookies).
- [x] **Protocol**: Uses `gRPC-Web` (Protobuf) or `apiClient` (Cookie-aware REST).
- [x] **SSR**: Implements server-side `loader` for pre-fetching/auth.

| File Path | Auth | Protocol | SSR | Notes |
| :--- | :---: | :---: | :---: | :--- |
| `app/root.tsx` | [x] | [x] | [x] | Global layout & cookie sync. |
| `app/routes/_index.tsx` | [x] | [x] | [x] | Zero-flash redirect & Auth check. |
| `app/routes/login.tsx` | [x] | [x] | [x] | gRPC-Web Login & Server-side cookies. |
| `app/routes/signup.tsx` | [x] | [x] | [x] | gRPC-Web Signup. |
| `app/routes/inbox.tsx` | [x] | [x] | [x] | gRPC-Web Messaging & SSR Pre-fetch. |
| `app/routes/profile.tsx` | [x] | [x] | [x] | Cookie-based profile loading. |
| `app/routes/household.profile.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/househelp.profile.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/google.auth.callback.tsx` | [x] | [x] | [x] | Server-side gRPC exchange & Cookies. |
| `app/routes/verify-otp.tsx` | [x] | [x] | [x] | Cookie-based verification. |
| `app/routes/forgot-password.tsx" | [x] | [x] | [x] | gRPC-Web flow. |
| `app/routes/reset-password.tsx" | [x] | [x] | [x] | gRPC-Web flow. |
| `app/routes/verify-email.tsx" | [x] | [x] | [x] | gRPC-Web flow. |
| `app/routes/household/members.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/household/setup.tsx` | [x] | [x] | [x] | Cookie-based Setup. |
| `app/routes/househelp/find-households.tsx`| [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/household.public-profile.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/househelp.public-profile.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/shortlist.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/household.shortlist.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/household/employment-contracts.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/household/househelp/profile.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/pricing.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/subscriptions.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/household.requests.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/bureau/home.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/bureau/househelps.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/household.contracts.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/household/employment.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/household/hiring-history.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/househelp/hiring-history.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/househelp.hire-requests.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/checkout.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/change-password.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/routes/contact.tsx` | [x] | [x] | [x] | Migrated to gRPC-Web & SSR. |
| `app/contexts/AuthContext.tsx` | [x] | [x] | [-] | Core cookie management. |
| `app/contexts/ProfileSetupContext.tsx` | [x] | [x] | [-] | gRPC-Web onboarding. |
| `app/components/Navigation.tsx` | [x] | [x] | [x] | Cookie-based user state. |
| `app/components/ProfileSetupGuard.tsx` | [x] | [x] | [x] | Cookie-based route guard. |
| `app/components/HousehelpHome.tsx` | [x] | [x] | [x] | Optimized Image (WebP). |
| `app/components/AuthenticatedHome.tsx` | [x] | [x] | [x] | Optimized Image (WebP). |
| `app/components/KYCUpload.tsx` | [x] | [x] | [x] | Cookie-based uploads. |
| `app/components/ui/HousehelpsTable.tsx` | [x] | [x] | [x] | Cookie-based list loading. |

#### Core Infrastructure (Support all .tsx)
- [x] `app/utils/cookie.ts`: Centralized cookie management.
- [x] `app/utils/grpcClient.ts`: gRPC-Web transport with auto-refresh.
- [x] `app/hooks/useNotifications.ts`: Real-time gRPC-Web notifications.
- [x] `app/hooks/useProfileSetupStatus.ts`: gRPC-Web status tracking.
- [x] `app/hooks/useProfilePhotos.ts`: Parallel gRPC-Web image fetching.

#### Bulk Migration Status
Total `.tsx` files: **~289**
- **Auth (Cookies)**: 100% (All routes & components).
- **gRPC-Web**: 100% (No more REST bridge dependencies in browser).
- **SSR**: 100% (All primary dashboards, profiles, and functional entry points).

*Checklist generated on 2026-02-28.*
