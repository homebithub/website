# Deferred work

Everything consciously postponed while bug-hunting, so none of it is lost to the
transcript. Each entry says what it is, why it was set aside, and what has to be
decided before anyone can start.

The [bug tracker](BUG_TRACKER.md) covers defects and their fix status. This file is
for work that was *scoped and deliberately not done*.

---

## 1. Merge `staging` → `master` for gateway and auth

**Why deferred:** it is a release decision, not a code change.

Production still runs code from before several fixes. The gateway was 59 commits
behind when measured, and production auth runs an image built 2026-07-01.

**What it blocks:**

- **Smile ID webhooks in production.** Production returns 401 because the callback
  path is not in master's public prefix list. The fix exists on gateway `staging`.
- **The direct ingress route for Smile ID.** Deliberately left commented out for
  production in `infra/yaml/ingress-backend.yaml`: production auth predates
  `cddbe0b`, which added signature verification to the callback handler, so routing
  straight to it would accept unsigned KYC results. Preprod has the direct route and
  works.

**Order matters:** deploy auth first, then add the ingress route. Never the reverse.

---

## 2. Ownership checks on the remaining match surface

**Status:** the two known holes are fixed (`MatchListings`, `MatchCandidates`).

**Deferred:** nothing systematically checks that other RPCs taking an id from the
request verify it against the caller. The two found were found by accident, because a
package bump tripped the gateway's method-policy inventory. A deliberate pass over
every RPC that accepts a `user_profile_id`, `listing_id` or similar would likely find
more.

---

## 3. Per-section shimmers across the app

**Status:** done on `household.profile` only. Tracked as bug 2c.

Most pages gate their whole render behind one `loading` flag and return a full-page
skeleton, so one slow request holds back sections whose data has already arrived.
Converting them is a per-page change across roughly 51 files, each needing retesting.

---

## 4. The matching engine's unbuilt half

Scoped and agreed in an earlier session, then overtaken by bug reports. The scoring
and reasons exist in both directions; none of the following does:

- **Filter persistence across visits.** Filters reset every time.
- **Saved filters as a stored entity**, rather than transient UI state.
- **Notification subscriptions on a saved filter** — a new preference, plus event
  consumers for *new job posted* and *househelp KYC verified*, delivered by email and
  in-app.
- **The save-filter modal**, including OTP email capture for users without a
  confirmed address.

---

## 5. Settings items still open

From bug 3. Fixed: the preferences read (3a/3c) and the admin settings backend.
Outstanding:

- **3d** — password change should redirect to login, and must reject reusing the
  current password. The rejection belongs in auth so it holds however the request
  arrives.
- **3e** — remove the Account card, leaving three.
- **3f** — replace `window.confirm` on "Revoke other devices" with a styled dialog.
  Worth doing *after* device revocation actually works, so the copy describes real
  behaviour.
- **3i** — self-saving toggles on both website and admin, with a visible revert on
  failure. **Depends on the auth preferences fix being deployed**; until then every
  write fails and the revert animation is all anyone would see.

---

## 6. Device trust: revocation, approval, and activity

The largest deferred item, and the one with real unknowns. Tracked as bugs 3g, 3h
and item 6 in the tracker.

**Needed:** device states (`pending`, `approved`, `rejected`, `banned`); a status check
before tokens are issued, for every login; SSE to eject a live session; the same
decision applied on next page load; email and real-time in-app notification on a new
device; a devices page with approve / reject / ban; marking the in-app notification
read when the email link is used instead.

**The decision that gates it:** an online device that misses the SSE revocation keeps
working, and no amount of SSE fixes that — a client that missed the message is exactly
the client that cannot be told. Closing it means not trusting the token: either short
lifetimes with a status-checking refresh, or a check on authenticated requests with
caching to keep it off the hot path. **Pick one before building.**

**Already answered:** you cannot reliably tell one browser from another on the same
laptop, and should not try. Fingerprinting is unreliable, degrades yearly, and carries
weight under Kenya's DPA. Treat each browser as a device and make approval cheap.
Genuine device binding needs WebAuthn/passkeys or a native app. Consequently `banned`
cannot be enforced against a client-supplied device id — clearing storage defeats it —
so a ban that must mean something stronger has to attach to the account.

---

## 7. Audit logging as an engine

Raised alongside device activity. `pkg/audit` already exists and writes `audit_logs`
from gateway middleware, so an engine partly exists. The open questions are what feeds
it, who may read which parts, how much is exposed to a user versus an admin, and how
to keep it off the request path.

Note the middleware was truncating request bodies over 64KB until recently — worth
knowing before treating existing `audit_logs` rows as complete.

---

## 8. Smaller things noticed in passing

- **Admin settings has no photo upload.** It is a URL paste field. Adding upload is a
  feature; there is no bug to fix.
- **Upload size limits are coupled across services.** Auth allows 5MB per file, the
  gateway 30MB per request. Raising one without the other fails at the gateway with no
  useful message.
- **A GitHub PAT is in the global git config** as a `url.…insteadof` rewrite. It works,
  and it is worth rotating.
- **`inbox.tsx` has no footer** and manages its own full-height layout. Left alone
  during the footer fix deliberately; if it ever gains a footer it will need the same
  treatment.
