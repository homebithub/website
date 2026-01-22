# TestSprite Run Summary (localhost:5173)

## Document Metadata
- **Project:** Homebit website
- **Run date:** 2026-01-22
- **Base URL tested:** http://localhost:5173
- **Test plan file:** `testsprite_tests/testsprite_frontend_test_plan.json`
- **Raw report:** `testsprite_tests/tmp/raw_report.md`
- **Structured results:** `testsprite_tests/tmp/test_results.json`

## Executive Summary
- **Total tests generated:** 15
- **Passed:** 0
- **Failed:** 15

**Important interpretation:** The failures are not 15 independent product failures. The test run is dominated by a small set of repeated console/network errors that occur early and break most cases. Many test cases also require authenticated household/househelp credentials and live backend services.

## Primary Root Causes Observed (from console logs)

### 1) Preferences API calls failing in dev environment
- **Evidence (repeated across tests):**
  - `Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON` (from `app/utils/preferencesApi.ts`)
  - `Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences)`
  - `Failed to update preferences` (from `app/utils/preferencesApi.ts`)
- **Likely cause:**
  - `app/utils/preferencesApi.ts` uses `API_BASE_URL` from `app/config/api.ts`.
  - In this run, `API_BASE_URL` resolves to a production-like origin (e.g. `https://homebit.co.ke/auth`) instead of a local auth service.
  - The endpoint may not support the methods used (e.g. PUT) or returns non-JSON (HTML error page), causing JSON parse failures.
- **Impact on UX:**
  - Theme + preference-related features will be noisy and may break expected behavior.
  - Automated tests interpret these console errors as failures.
- **Recommendation:**
  - Ensure dev `.env` is configured so `AUTH_API_BASE_URL` points to a local auth service that supports `/api/v1/preferences`.
  - If preferences are optional for public routes, ensure public routes don’t call backend preferences at all (or fail silently without console error spam).

### 2) SSR hydration mismatch on `<html className>`
- **Evidence:**
  - `Warning: Prop '%s' did not match... className "h-full dark" "h-full"` (from `app/root.tsx`)
- **Likely cause:**
  - Server renders with `dark` class present, while client initial render/hydration computes a different class set.
  - The inline theme script and ThemeProvider initialization order may not perfectly align with SSR.
- **Impact:**
  - Potential theme flash or hydration warnings in console.
  - Tests treat it as console error noise.
- **Recommendation:**
  - Align SSR and client initial theme (commonly via cookie-based theme and setting class server-side).

### 3) Asset load errors observed once
- **Evidence:**
  - `net::ERR_EMPTY_RESPONSE` for `http://localhost:5173/shopping.svg` and `http://localhost:5173/mtoi.svg`.
- **Notes:**
  - The files exist under `public/` (`public/mtoi.svg`, `public/shopping.svg`).
  - This can be intermittent (dev server hiccup) or a transient networking artifact from headless test execution.
- **Recommendation:**
  - Re-run after addressing the preferences issues to see if this persists.

## Test Case Grouping (what failed and why)

### A) Auth-dependent flows (expected to fail without credentials/backends)
- **TC001** Login with valid credentials
- **TC002** Login with invalid credentials
- **TC003** Token session persistence
- **TC004** Profile setup gating
- **TC005** Profile setup completion unlocks access
- **TC007** Role-based navigation and counts
- **TC008** Hiring request workflow
- **TC009** Inbox + WebSocket notifications
- **TC010** Subscription checkout workflow
- **TC014** Protected route enforcement

**Primary blockers:**
- No test credentials for household/househelp.
- Likely no local auth/notifications/payments services running with expected endpoints.

### B) Public flows (should be stable; still failed due to global console errors)
- **TC006** Theme toggle persistence
- **TC011** Public marketing pages accessibility
- **TC012** Web vitals logging
- **TC013** SSR server route/asset serving
- **TC015** API wrapper error handling

**Primary blocker:**
- Global console/network errors from preferences calls and hydration mismatch.

## Concrete Action List (highest ROI)

### 1) Fix environment configuration for local dev
- Ensure `AUTH_API_BASE_URL`, `NOTIFICATIONS_API_BASE_URL`, `PAYMENTS_API_BASE_URL` in `.env` (or runtime env) point to reachable services.
- If you don’t want these services required for public pages, ensure public routes do not call them.

### 2) Reduce console noise and fail-safe external calls
- Avoid throwing/parsing JSON on HTML error responses; detect `Content-Type` before `response.json()`.
- Gate logs behind dev mode.

### 3) Make tests meaningful for your current phase
- Split tests into:
  - **Public-only smoke suite** (home/about/services/contact/pricing/terms/privacy/cookies + waitlist modal open/validation)
  - **Authenticated household suite** (requires creds)
  - **Authenticated househelp suite** (requires creds)

## What I need from you next (for household/househelp end-to-end)
- **Household test credentials** (email/phone + password)
- **Househelp test credentials** (email/phone + password)
- Confirm whether local backend services are expected to be running during frontend tests, and their URLs.

---

## Files created during this work
- `testsprite_tests/issues_recommendations.md` (manual code-review notes)
- `testsprite_tests/testsprite_run_summary.md` (this file)
