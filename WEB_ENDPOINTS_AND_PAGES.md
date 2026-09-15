# Web Endpoints and Pages

Generated from `web/app/routes.ts`, which uses `flatRoutes()` from `@react-router/fs-routes`.

Summary:

- Active route modules: 72
- Page routes: 59
- Web-owned API/data endpoints: 13
- Route-like files not registered by the current route config: 20

Notes:

- `loader` handles GET requests.
- `action` handles non-GET submissions; where route code narrows the allowed methods, the method list below reflects that.
- `:param` denotes a dynamic URL segment.
- The web app also calls backend/gateway and gRPC endpoints from components and services; those are outside this file-based route map.

## Web-Owned API/Data Endpoints

| Method | Endpoint | Source route module | Handler |
|---|---|---|---|
| GET | `/api/job-applications` | `web/app/routes/api.job-applications.ts` | `loader` |
| GET, POST, PATCH, DELETE | `/api/job-listings` | `web/app/routes/api.job-listings.ts` | `loader`, `action` |
| POST | `/api/job-shortlist` | `web/app/routes/api.job-shortlist.ts` | `action` |
| GET | `/api/job-types` | `web/app/routes/api.job-types.ts` | `loader` |
| POST | `/api/login` | `web/app/routes/api.login.ts` | `action` |
| GET | `/api/profile-features` | `web/app/routes/api.profile-features.ts` | `loader` |
| GET, POST | `/api/profile-picks` | `web/app/routes/api.profile-picks.ts` | `loader`, `action` |
| GET | `/api/profiles` | `web/app/routes/api.profiles.ts` | `loader` |
| POST | `/api/signup` | `web/app/routes/api.signup.ts` | `action` |
| POST | `/api/verify-otp` | `web/app/routes/api.verify-otp.ts` | `action` |
| GET | `/google/auth/callback` | `web/app/routes/google.auth.callback.tsx` | `loader` |
| GET | `/google/waitlist/callback` | `web/app/routes/google.waitlist.callback.tsx` | `loader` |
| GET | `/sitemap.xml` | `web/app/routes/sitemap[.]xml.tsx` | `loader` |

## Page Routes

| Page URL | Source route module | Loader | Action | Meta |
|---|---|---:|---:|---:|
| `/` | `web/app/routes/_index.tsx` | yes | no | no |
| `/*` | `web/app/routes/$.tsx` | no | yes | no |
| `/about` | `web/app/routes/about.tsx` | no | no | yes |
| `/account/devices` | `web/app/routes/account.devices.tsx` | no | no | yes |
| `/account/payment-methods` | `web/app/routes/account.payment-methods.tsx` | no | no | no |
| `/add-phone` | `web/app/routes/add-phone.tsx` | no | no | yes |
| `/blog` | `web/app/routes/blog._index.tsx` | yes | no | yes |
| `/blog/:slug` | `web/app/routes/blog.$slug.tsx` | yes | no | yes |
| `/blog/unsubscribe` | `web/app/routes/blog.unsubscribe.tsx` | no | no | yes |
| `/change-password` | `web/app/routes/change-password.tsx` | yes | no | no |
| `/checkout` | `web/app/routes/checkout.tsx` | no | no | no |
| `/contact` | `web/app/routes/contact.tsx` | no | no | yes |
| `/cookies` | `web/app/routes/cookies.tsx` | no | no | yes |
| `/debug/device-auth` | `web/app/routes/debug.device-auth.tsx` | yes | no | no |
| `/devices/confirm` | `web/app/routes/devices.confirm.tsx` | no | no | yes |
| `/forgot-password` | `web/app/routes/forgot-password.tsx` | no | no | no |
| `/hiring` | `web/app/routes/hiring.tsx` | no | no | no |
| `/househelp/hire-requests` | `web/app/routes/househelp.hire-requests.tsx` | no | no | no |
| `/househelp/hiring` | `web/app/routes/househelp.hiring.tsx` | no | no | no |
| `/househelp/profile` | `web/app/routes/househelp.profile.tsx` | no | no | no |
| `/househelp/public-profile` | `web/app/routes/househelp.public-profile.tsx` | no | no | no |
| `/household-choice` | `web/app/routes/household-choice.tsx` | no | no | no |
| `/household/contracts` | `web/app/routes/household.contracts.tsx` | no | no | no |
| `/household/employment-contract` | `web/app/routes/household.employment-contract.tsx` | no | no | no |
| `/household/employment-contracts` | `web/app/routes/household.employment-contracts.tsx` | no | no | no |
| `/household/hire-request/:id` | `web/app/routes/household.hire-request.$id.tsx` | no | no | no |
| `/household/hiring` | `web/app/routes/household.hiring.tsx` | no | no | no |
| `/household/profile` | `web/app/routes/household.profile.tsx` | no | no | no |
| `/household/public-profile` | `web/app/routes/household.public-profile.tsx` | no | no | no |
| `/household/public-profile/:user_id` | `web/app/routes/household.public-profile.$user_id.tsx` | no | no | no |
| `/household/requests` | `web/app/routes/household.requests.tsx` | no | no | no |
| `/household/shortlist` | `web/app/routes/household.shortlist.tsx` | no | no | no |
| `/inbox` | `web/app/routes/inbox.tsx` | no | no | no |
| `/join-household` | `web/app/routes/join-household.tsx` | no | no | no |
| `/landing` | `web/app/routes/landing.tsx` | no | no | yes |
| `/loading-demo` | `web/app/routes/loading-demo.tsx` | no | no | no |
| `/login` | `web/app/routes/login.tsx` | no | no | yes |
| `/onboarding/features` | `web/app/routes/onboarding.features.tsx` | no | no | no |
| `/pending-approval` | `web/app/routes/pending-approval.tsx` | no | no | no |
| `/plans` | `web/app/routes/plans.tsx` | no | no | yes |
| `/pricing` | `web/app/routes/pricing.tsx` | no | no | yes |
| `/privacy` | `web/app/routes/privacy.tsx` | no | no | yes |
| `/profile` | `web/app/routes/profile.tsx` | no | no | no |
| `/reset-password` | `web/app/routes/reset-password.tsx` | no | no | no |
| `/services` | `web/app/routes/services.tsx` | no | no | yes |
| `/settings` | `web/app/routes/settings.tsx` | no | no | no |
| `/shortlist` | `web/app/routes/shortlist.tsx` | no | no | no |
| `/signup` | `web/app/routes/signup.tsx` | no | no | yes |
| `/smileid-test` | `web/app/routes/smileid-test.tsx` | no | no | no |
| `/subscriptions` | `web/app/routes/subscriptions.tsx` | no | no | no |
| `/terms` | `web/app/routes/terms.tsx` | no | no | yes |
| `/terms/hiring` | `web/app/routes/terms.hiring.tsx` | no | no | no |
| `/unauthorized` | `web/app/routes/unauthorized.tsx` | no | no | no |
| `/verify-email` | `web/app/routes/verify-email.tsx` | no | no | no |
| `/verify-otp` | `web/app/routes/verify-otp.tsx` | no | no | no |
| `/waitlist` | `web/app/routes/waitlist.tsx` | no | no | yes |

## Route-Like Files Not Registered

The current router is `flatRoutes()` with no custom nested-route config. The following files are present under `web/app/routes`, but are not in the active React Router manifest generated by `@react-router/fs-routes`.

| File |
|---|
| `web/app/routes/bureau/_layout.tsx` |
| `web/app/routes/bureau/commercials.tsx` |
| `web/app/routes/bureau/home.tsx` |
| `web/app/routes/bureau/househelps.tsx` |
| `web/app/routes/bureau/profile.tsx` |
| `web/app/routes/househelp/_layout.tsx` |
| `web/app/routes/househelp/find-households.tsx` |
| `web/app/routes/househelp/hire-requests.tsx` |
| `web/app/routes/househelp/hiring-history.tsx` |
| `web/app/routes/household/_layout.tsx` |
| `web/app/routes/household/contracts.tsx` |
| `web/app/routes/household/employment-contract.tsx` |
| `web/app/routes/household/employment-contracts.tsx` |
| `web/app/routes/household/employment.tsx` |
| `web/app/routes/household/hire-request.$id.tsx` |
| `web/app/routes/household/hiring-history.tsx` |
| `web/app/routes/household/hiring.tsx` |
| `web/app/routes/household/househelp/contact.tsx` |
| `web/app/routes/household/househelp/profile.tsx` |
| `web/app/routes/household/members.tsx` |
