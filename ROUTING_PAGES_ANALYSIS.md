# ROUTING & PAGES ANALYSIS

## Current Page Structure
- All routes are defined in `app/routes/` as `.tsx` files.
- Each file represents a page or endpoint in the app.
- Example pages:
  - `/about`, `/bio`, `/budget`, `/children`, `/chores`, `/contact`, `/househelp`, `/household`, `/login`, `/profile`, `/services`, `/signup`, `/terms`, `/verify-email`, etc.
- Nested and namespaced routes:
  - `bureau.*.tsx` (e.g., `bureau.commercials.tsx`, `bureau.home.tsx`)
  - `househelp.*.tsx`, `household.*.tsx`
  - Special flows: `househelp-profile-setup.tsx`, `household-profile-setup.tsx`
- Index route: `_index.tsx` (serves as the root/home page).

## Route Organization
- Flat file-based routing structure, following Remix conventions.
- Namespaced files (e.g., `bureau.*`, `household.*`, `househelp.*`) group related flows.
- Auth and utility routes: `login.tsx`, `signup.tsx`, `reset-password.tsx`, `unauthorized.tsx`, `verify-email.tsx`.
- Informational/static routes: `about.tsx`, `privacy.tsx`, `terms.tsx`, `services.tsx`, `pricing.tsx`.
- Profile and settings: `profile.tsx`, `settings.tsx`, `change-password.tsx`.

## Layout Usage Patterns
- Layout components are likely imported into page files as needed.
- Common layouts include navigation (`layout/Navigation.tsx`) and footer (`layout/Footer.tsx`).
- Pages use container and flex utilities for consistent structure.
- Some routes may share sidebar or stepper layouts for multi-step flows (e.g., onboarding, profile setup).

---
