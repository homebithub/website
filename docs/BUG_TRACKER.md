# Bug tracker

Bugs found while testing HomeBit, and where each one has got to.

**Fixed** is mine to set — it means the change is written, builds, and is committed.
**Retested** is Sean's to set — a fix is not done until it has been confirmed against
a real deployment. Nothing moves to Retested on my say-so.

Bugs are numbered in the order they were reported. Area is included because these
span several repositories.

Work that was scoped and deliberately postponed lives in [DEFERRED_WORK.md](DEFERRED_WORK.md).

| # | Bug | Area | Fixed | Retested |
|---|-----|------|-------|----------|
| 1 | Household **Saved** page showed a bare heading over blank space when there was nothing to list — no empty state at all. | website | ✅ | ⬜ |
| 2a | "Loading the next experience…" overlay appeared on every navigation. | website | ✅ | ⬜ |
| 2b | Footer floated mid-screen instead of sitting at the bottom, at a different height on each route. | website | ✅ | ⬜ |
| 2c | Whole page waits for every request before anything renders, instead of each section clearing as its own data arrives. | website | 🟡 partial | ⬜ |
| 3a | Settings shows a permanent "We couldn't load your app preferences" error on load. | auth | ✅ | ⬜ |
| 3b | Admin settings shows a permanent "Platform settings are not available" error. | admin + auth | ✅ | ⬜ |
| 3c | App preferences do not work (same root cause as 3a). | auth | ✅ | ⬜ |
| 3d | Password change should redirect to login, and must reject reusing the current password. | website + auth | ⬜ | ⬜ |
| 3e | Remove the Account card from settings, leaving three. | website | ⬜ | ⬜ |
| 3f | "Revoke other devices" uses the browser's confirm dialog; should be our own, styled, explaining what happens. | website | ⬜ | ⬜ |
| 3g | Revoking a device does not sign it out — live sessions continue, and offline devices are not checked on return. | auth + website | ⬜ | ⬜ |
| 3h | Device activity is never logged, so "Recent activity" is always empty. | auth + admin | ⬜ | ⬜ |
| 3i | Preference toggles need a Save button; should persist on toggle and revert visibly on failure. Same for admin. | website + admin | ⬜ | ⬜ |
| 4 | Admin settings has no backend — build one. | admin + auth | ✅ | ⬜ |
| 5 | Image uploads: audited, see notes. Admin settings has no upload to fix. | website + admin | ✅ audit | ⬜ |
| 6 | New-device login approval: email + in-app notification, approve / reject / ban, SSE and refresh paths. | auth + notifications + website | ⬜ | ⬜ |

---

## 1. Household Saved page renders blank when empty

**Reported:** 2026-08-09 — `preprod.homebit.co.ke/household/shortlist`

**What was wrong.** The page did have an empty state, so the interesting part is why
it never appeared. It was conditioned on `items.length === 0` — every saved row
returned by the API — but the list below it only draws cards for rows whose
`profile_type` is `open_for_work`. A saved row of any other type (the backend also
returns `job`) left `items` non-empty while rendering nothing, so both the cards and
the empty state were suppressed and the page fell through to a heading over blank
space.

**Fix.** The rendered subset is computed once as `savedHousehelps`, and the empty
state now keys off that instead of the raw response, so the page always shows
something whether nothing was saved or nothing could be drawn. The panel was restyled
to match the homepage's no-results card, and it now offers a way back to browsing
rather than being a dead end.

`app/routes/household.shortlist.tsx`

**Not affected:** the househelp-side Saved page (`app/routes/shortlist.tsx`) filters
before storing, so its empty check already matches what it renders.

**To retest:** open Saved as a household with nothing saved — expect the "Nothing
saved yet" card. Then save a househelp and confirm the card list replaces it.

---

## 2. Shimmer loading: overlay, footer, and section granularity

**Reported:** 2026-08-09 — `preprod.homebit.co.ke/household/profile`

Three separate problems, all fallout from the earlier work to make shimmers uniform.

### 2a — the "Loading the next experience…" overlay ✅

`GlobalLoaderOverlay` was mounted in `root.tsx` and rendered a fixed panel on every
router transition. Removed: the mount, the component, and its CSS. It duplicated what
the per-page shimmers already say, and said it on top of them.

`app/root.tsx`, `app/components/ShimmerLoader.tsx`, `app/tailwind.css`

### 2b — the footer would not stay at the bottom ✅

Pages put `PurpleThemeWrapper` between a `Navigation` and a `Footer` inside a
`min-h-screen flex flex-col` column, and hang `flex-1` off the `<main>` inside the
wrapper. But `main` is not a child of that column — the wrapper is. Unless the wrapper
grew, nothing claimed the spare height and the footer stopped wherever the content
happened to end. Short pages, and any page mid-shimmer, put it at a different height
on every route.

43 of 61 call sites already passed `flex-1` by hand, which is exactly why some pages
looked right and others did not. It is now a default on the component, so no page can
reintroduce it. Measured on `/landing` at a viewport taller than the content: 474px of
dead space below the footer before, 0px after.

`blog.unsubscribe` needed a separate fix — it uses the wrapper as the page root, so
there was no `min-h-screen` parent to inherit height from.

`app/components/layout/PurpleThemeWrapper.tsx`, `app/routes/blog.unsubscribe.tsx`

### 2c — per-section shimmers 🟡 partial

Done on the reported page: the household profile's members and profile-choices
sections now shimmer independently, shaped like the content they stand in for, rather
than showing a lone dot.

Still outstanding, and the larger half: most pages gate their whole render behind a
single `loading` flag and return a full-page skeleton, so one slow request holds back
sections whose data has already arrived. Undoing that is a per-page change across
roughly 51 files — worth doing, but not a one-line fix, and each page needs retesting
after.

`app/routes/household.profile.tsx`

**To retest:** navigate between pages and confirm no overlay panel appears. Check the
footer sits at the bottom on a short page — the household profile mid-load is the
case that started this. Confirm nothing looks squashed on long pages.

---

## 3. Settings (website and admin)

**Reported:** 2026-08-09 — `preprod.homebit.co.ke/settings`, admin `/settings`

### 3a — "We couldn't load your app preferences" ✅ and 3c — app preferences do not work ✅

One bug, two symptoms. `GetPreferences` read the JSON column with
`query.Scan(&encoded)` into a `datatypes.JSON`, which is a `[]byte`. GORM takes the
destination of `Scan` to be the result set, so it tried to fill each row into a single
`uint8` and failed:

```
Scan error on column index 0, name "data": converting driver.Value type []uint8 to a uint8
```

It only failed once a row existed — preferences appeared to work until the first save
and were unreadable from then on, which is why the banner looked permanent and why
nothing you toggled ever came back. Preprod auth logged this on every settings load.

Fixed by scanning into a struct and treating "no row" as empty rather than an error.
`MigrateAnonymousToUser` had the identical defect and is fixed with it — that path
mattered for exactly one case, an anonymous visitor who had set something, and failed
on exactly that case.

`auth/grpc/preferences.go` — **needs an auth deploy to take effect.**

### 3b — admin "Platform settings are not available" ❓ needs a decision

Not the same bug, and not strictly a malfunction: `getPlatformSettings` throws on
purpose because no service implements platform settings, and the code argues that
failing loudly beats a stub that looks like it saves and silently does nothing. That
reasoning is sound.

What is wrong is the result: a red error sits on **My Profile**, a tab that has
nothing to do with platform settings and whose own save works. Options, in increasing
order of work:

1. Only show the notice on tabs that actually read platform settings, and as
   information rather than an error. Smallest change; the tabs still do nothing.
2. Remove the tabs that have no backend, keeping the ones that work. Honest, and
   removes dead controls.
3. Build the platform-settings backend. Most work; only worth it if those settings
   are actually wanted.

I did not pick one — the right answer depends on whether those settings are planned
or abandoned.

### 3d — password change ⬜

Two parts: redirect to the login page after a successful change, and reject a new
password equal to the current one. The rejection belongs in auth, so it holds however
the request arrives, not only in the form.

### 3e — remove the Account card ⬜

Leaves Password, Trusted devices, My reviews.

### 3f — our own revoke confirmation ⬜

Replace `window.confirm` with a styled dialog that says what actually happens: which
devices end, that this browser stays signed in, and that a revoked device is signed
out rather than merely delisted. Worth doing *after* 3g, so the copy describes real
behaviour.

### 3g — revoking a device does not actually sign it out ⬜

The substantial one. Needed:

- a status on the devices table (`active`, `revoked`, …) so a device has a state
  rather than being inferred from presence
- **every login checks device status before issuing tokens** — for all users
- live sessions: push a revocation over SSE and have the client sign out
- returning offline devices: check status on load, not only at login

The gap you already identified — an online device that misses the SSE message keeps
working — is real and cannot be closed by SSE alone, because a client that missed one
message is exactly the client that cannot be told. The usual fix is to stop trusting
the token: have the revoked state checked server-side on request, so a revoked device
fails on its next call regardless of what it did or did not receive. That means either
short token lifetimes with a refresh that checks status, or a status check on
authenticated requests, which costs a lookup per request and needs caching to stay off
the hot path. **This needs a design decision before implementation.**

### 3h — device activity logging ⬜

"Recent activity" is empty because nothing writes to it. You framed this as part of a
wider audit-logging engine for the website and admin, and that is the right framing —
a gateway audit middleware already exists (`pkg/audit`) and writes `audit_logs`, so
the engine partly exists and the question is what feeds it, who may read what, and how
to keep it off the request path. Worth its own conversation rather than a bug fix.

### 3i — toggles should save themselves ⬜

Drop the Save buttons on both website and admin. Toggle writes immediately, confirms
on success, and on failure animates back to its previous position slowly enough to be
seen, with the reason. Note this needs 3a deployed first — until then every write
fails, and the revert animation would be all anyone ever saw.

**To retest 3a/3c:** after auth deploys, open Settings — no error banner, and toggles
survive a reload.

---

## 5. Image uploads — audit

Asked for a check across both apps before the next upload bug surfaces.

**Admin settings has no photo upload.** It is a "Profile picture URL" text field that
takes a pasted URL (`app/(dashboard)/settings/page.tsx`). There is nothing there to
fix — adding an upload is a feature, not a repair. Flagging because the request
assumed one existed.

**The paths that do exist, and what they do:**

| Path | Encoding | Route |
|---|---|---|
| Website documents, KYC, profile photos | multipart `FormData` | gateway reverse-proxy → auth `/api/v1/documents/upload` |
| Admin blog featured + inline images | multipart `FormData` | gateway → `/api/v1/blog/admin/images` |

**Findings.**

- Both are multipart, which matters: the gateway's audit middleware skips multipart
  body capture, so the truncation bug fixed in homebit-pkg v1.48.1 never affected
  uploads. Had any of these posted base64 inside JSON, every upload over 64KB would
  have been silently corrupted. Worth keeping multipart for that reason alone.
- Size limits line up rather than fight: 5MB per file in auth, 30MB request body at
  the gateway, which is documented there as five files plus overhead.
- `profile_id` on upload is **not** an IDOR. `resolveOwnedProfileID` checks
  `id = ? AND user_id = ?`, with a separate path for household members. I went looking
  for the same hole found in the match RPCs and it is not there.

Nothing broken found. The most likely future failure is a limit mismatch — if the
per-file 5MB in auth is ever raised without raising the gateway's 30MB, uploads fail
at the gateway with no useful message.

---

## 6. New-device login approval

A feature, not a bug, and a large one. Recorded so it is not mistaken for a small
change. Roughly: device states (`pending`, `approved`, `rejected`, `banned`); an email
and a real-time in-app notification on first sight of a device; a devices page with
approve / reject / ban; SSE to admit or eject a live session, and the same decision
applied on next page load or login; marking the in-app notification read when the
email link is used instead.

It depends on **3g**, which is the same underlying gap — right now a device state
would be advisory, because nothing checks it on a request.

### On "how do we stop a different browser on the same laptop"

Short answer: you cannot, reliably, and it is worth deciding not to try.

A browser is the only unit of identity available to a website. Cookies and
localStorage are per-browser and per-profile by design, and a private window starts
clean. Fingerprinting (canvas, fonts, screen, UA) identifies a *browser* imperfectly,
degrades every year as browsers add protections, and carries real data-protection
weight in Kenya's DPA and GDPR — it is consent-worthy, and unreliable enough that you
would be blocking real users while a determined one walks around it.

So treat each browser as a device. That is what every trusted-device system does in
practice, and it is why signing in to Gmail from a new browser prompts you even on a
laptop you have used for years. The user-visible cost is one approval; the fix is to
make approving cheap, which the email and in-app flows already do.

If you genuinely need "this physical device", it has to come from outside the browser:

- **WebAuthn / passkeys** bind a key to a platform authenticator, in the secure
  enclave. This is the real mechanism, and it also replaces the password. Note that
  passkeys now sync across a user's devices through iCloud and Google Password
  Manager, which deliberately reintroduces multi-device — but they sync to *that
  person's* devices, which is usually what you actually wanted.
- **A native app**, where the OS gives a per-vendor device id.

One consequence worth being deliberate about: **`banned` cannot be enforced against a
client-supplied device id**, because clearing storage produces a new one. A ban on a
device record only stops that browser profile as it stands. If a ban needs to mean
something stronger it has to attach to the account, and the real protection remains
that any unknown browser needs approval regardless.

**Recommendation:** build states and approval on the browser-as-device model, keep
`banned` as a record-level state, and treat WebAuthn as the upgrade path if device
binding ever needs to be genuine.

---

## 4. Admin settings backend ✅

**Built.** The page now reads and writes real settings.

The storage already existed. `platform_settings` and a seeded `app_settings` row have
been there since migration 34, in exactly the shape the admin expects — general,
notifications, security, features. Nothing could reach them: `getPlatformSettings`
called a `PlatformSettingsService` that appears in no proto and is implemented by
nothing, so it threw, and the page showed an error over controls that could never
save.

I nearly added a second `platform_settings` table before validating the migration
against the real database and finding the first. Worth remembering as an argument for
checking the schema rather than the repository.

- `pkg` v1.53.0 — `AdminGetPlatformSettings` / `AdminUpdatePlatformSettings` on
  AdminService, carrying a Struct so new settings do not need a proto change, a
  package release and three bumps before anyone can see a checkbox.
- `auth` — handlers plus migration 66 adding `updated_by`, taken from the caller's
  token rather than the request body.
- `gateway` — pkg bump; both methods resolve to `admin` through the existing
  `/auth.AdminService/` prefix rule.
- `admin` — real calls, merging over defaults so a stored document that predates a new
  setting does not hand the form `undefined`.

Verified against the live preprod schema inside a rolled-back transaction: migration
applies, the read returns `Homebit`, the upsert writes `updated_by`, and the other
three unrelated keys in the table are untouched.

**To retest:** open admin Settings — no error banner. Change something on General,
save, reload, confirm it persisted. Confirm the System page's feature flags are
unaffected: they are a separate store on purpose.
