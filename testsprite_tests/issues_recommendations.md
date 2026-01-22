# Homebit Website Review Notes (Manual)

## Scope
- Code inspection only (no runtime test results included yet)
- Focused on current codebase behavior for:
  - Public/unauthenticated experience
  - Household vs househelp authenticated experience (structure + risks)
  - Navigation, validations, flows, responsiveness, a11y, performance

## High-impact issues / irregularities (fix first)

### 1) API base URL inconsistency (likely bug)
- **Where**
  - `app/components/Waitlist.tsx`
- **What**
  - Code computes `baseUrl` from `window.ENV.AUTH_API_BASE_URL` but still calls `fetch(`${API_BASE_URL}/...`)`.
  - Same pattern appears in Google OAuth waitlist flow (`/api/v1/auth/google/url`).
- **Impact**
  - Waitlist and Google waitlist flows may hit the wrong environment/backend.
  - Harder to run staging/dev reliably.
- **Recommendation**
  - Ensure calls use the resolved base URL (env-driven) consistently.

### 2) Duplicated / suspicious role checks (typo risk)
- **Where**
  - `app/components/Navigation.tsx`
  - `app/contexts/AuthContext.tsx`
- **What**
  - Condition repeats the same value:
    - `profileType === "household" || profileType === "household"`
- **Impact**
  - Household/househelp routing decisions can become wrong or incomplete.
- **Recommendation**
  - Normalize profile type checks and centralize role constants.

### 3) Public-route / exempt-route lists duplicated in multiple modules
- **Where**
  - `app/contexts/AuthContext.tsx` (public paths)
  - `app/contexts/ThemeContext.tsx` (public paths)
  - `app/components/ProfileSetupGuard.tsx` (exempt routes)
- **Impact**
  - Route list drift leads to inconsistent behavior (theme fetching, auth verification, setup gating).
- **Recommendation**
  - Create a single source of truth for route categories (public/auth/setup-exempt).

### 4) Excessive `console.log` in production paths
- **Where**
  - `app/config/api.ts` (logs base URLs)
  - `app/hooks/useWebSocket.ts`, `app/contexts/WebSocketContext.tsx`
  - `app/components/Navigation.tsx`
- **Impact**
  - Noisy console, hides real issues, possible information leakage.
- **Recommendation**
  - Gate logs behind `NODE_ENV !== 'production'` or a logger utility.

## Medium-impact issues / improvements

### 5) Very large route/component files (maintainability + performance)
- **Where** (examples)
  - `app/routes/inbox.tsx` (~85KB)
  - `app/routes/household.profile.tsx` (~52KB)
  - `app/routes/househelp.public-profile.tsx` (~50KB)
  - `app/components/Navigation.tsx` (~60KB)
- **Impact**
  - Slower dev iteration, harder debugging, larger bundles, higher re-render cost.
- **Recommendation**
  - Split into smaller components; consider route-level lazy loading for heavy screens.

### 6) Navigation fetch patterns can cause redundant calls
- **Where**
  - `app/components/Navigation.tsx`
- **What**
  - Fetches shortlist count, inbox count, hire request count via separate requests.
- **Impact**
  - Increased network overhead, potential UI jank.
- **Recommendation**
  - Add lightweight caching/throttling; optionally a consolidated backend “counts” endpoint later.

### 7) Theme logic complexity and possible flicker edge cases
- **Where**
  - `app/root.tsx` (pre-hydration theme script)
  - `app/contexts/ThemeContext.tsx` (mounted gate, backend sync)
- **Impact**
  - Potential theme inconsistencies on route changes, especially if backend preferences fails.
- **Recommendation**
  - Ensure SSR + client agree on initial theme. Consider storing theme in cookie for SSR alignment.

### 8) Hardcoded fallback Google Client ID
- **Where**
  - `app/root.tsx`
- **Impact**
  - Risk deploying with wrong OAuth client.
- **Recommendation**
  - Require env var in production; remove fallback or make it explicitly dev-only.

## Frontend UX / responsiveness recommendations

### 9) Responsive regression testing
- **What to validate**
  - Navbar: desktop links vs mobile dropdown, waitlist button visibility.
  - Large marketing sections in `app/routes/_index.tsx` and image cards.
  - Forms: signup/login flows and input spacing on small screens.
- **Recommendation**
  - Add a small set of responsive tests at common breakpoints (mobile 375px, tablet 768px, desktop 1280px).

### 10) Accessibility (a11y)
- **What to validate**
  - Focus management in modals (Waitlist), keyboard navigation in menus.
  - Link/button semantics for clickable elements.
  - Color contrast (especially gradient text on dark backgrounds).
- **Recommendation**
  - Add automated a11y checks (TestSprite should catch basics) and manual keyboard walkthrough.

## Performance / optimization recommendations

### 11) Bundle and route-level optimization
- **Where**
  - `vite.config.ts` already uses `manualChunks`.
- **Next improvements**
  - Lazy-load heavy feature modules (inbox, editor, charts) behind routes.
  - Audit and reduce duplicate UI libraries where possible.

### 12) Network resilience
- **Where**
  - Various `fetch` calls throughout routes/components.
- **Recommendation**
  - Standardize API error handling (timeouts, retries where appropriate, consistent user-facing errors).

## Notes on authentication testing
- You mentioned you’ll provide credentials later.
- I’m **not generating credentials automatically** right now because that would create real accounts on your backend (external side effects) and may require your approval and a running auth API.

---

## Next step
- After TestSprite execution completes, I’ll append:
  - UI failures
  - console errors
  - broken navigation
  - responsiveness and a11y issues detected
