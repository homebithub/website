# HomeBit end-to-end restoration checklist

Last updated: 2026-07-29

This is the executable checklist for the post-refactor HomeBit baseline. It
covers the website, gateway, shared protobuf package, auth, notifications, and
payments. The historical RPC audit is in
[`rpc-backend-compatibility.md`](./rpc-backend-compatibility.md).

## Implementation checklist

### Shared contracts and gateway

- [x] Restored Bureau, Open-for-work, Shortlist, Interest, Preferences,
  Profile Setup, and related compatibility contracts in the authoritative auth
  protobuf.
- [x] Restored `ProfileService.GetHousehelpsByBureau`.
- [x] Regenerated the shared Go protobuf and gRPC files.
- [x] Confirmed that the website's existing jspb clients contain the restored
  compatibility contracts.
- [x] Fixed the gateway module dependency state so it builds without a local
  `go.work` file.
- [x] Confirmed that the transparent gateway routes auth/profile,
  notifications, and payments packages to their owning services.

### Compact auth schema

- [x] Kept the reduced, domain-oriented schema introduced by the auth
  refactor.
- [x] Restored only the compact tables needed for lost behaviour:
  `profile_views`, `application_negotiations`, `marketplace_relationships`,
  `user_preferences`, `bureau_profiles`, and `bureau_househelp_links`.
- [x] Added the external provider subject needed by Google sign-in.
- [x] Removed the duplicate `shortlists` table. Shortlisting is represented by
  `applications.status = 'shortlisted'`.
- [x] Kept household membership and invitations.
- [x] Kept ward-based Kenya locations and profile location search.
- [x] Kept children and pets as profile catalogue features.
- [x] Kept engagements, optional employment contracts, reviews, device
  security, admin RBAC, waitlists, contact messages, tickets, and platform
  settings.
- [x] Kept notification preferences in notifications.
- [x] Verified migrations 1–48 against a newly created empty PostgreSQL
  database: version 48, `dirty = false`, 54 public tables.

### Seed data

- [x] Seeded two profile types: Household and Househelp.
- [x] Seeded 16 feature groups and 181 selectable properties.
- [x] Seeded required feature mappings independently for Household and
  Househelp profiles.
- [x] Seeded representative users, locations, a household member, a job,
  application/engagement, optional contract, reviews, device, admin RBAC,
  waitlist, contact message, and ticket.
- [x] Made seed operations repeatable and separate from normal service startup.

### Restored RPC tracks

- [x] RPC-001: Google auth URL and Google signup completion.
- [x] RPC-002: hire request create/read/list/accept/decline/cancel.
- [x] RPC-003: hire contract creation/list/read/complete/terminate.
- [x] RPC-004: hiring negotiation messages.
- [x] RPC-005: shortlist facade backed by applications.
- [x] RPC-006: interest lifecycle backed by compact marketplace relationships.
- [x] RPC-007: househelp open-for-work lifecycle backed by listings.
- [x] RPC-008: household/househelp preferences and catalogue compatibility.
- [x] RPC-009: computed profile completion and granular progress.
- [x] RPC-010: profile view recording, duration, listing, and analytics.
- [x] RPC-011: public reviews, statistics, helpful marks, owner responses, and
  "my reviews".
- [x] RPC-012: minimal bureau profile and OTP link compatibility.
- [x] Registered restored services on auth's gRPC server.
- [x] Added a registration test for the restored service surface.

### Website restoration

- [x] Removed hard-coded empty conversation, hire request, shortlist, interest,
  bureau, and profile-progress responses.
- [x] Removed browser-cached current-user data as the authoritative source.
- [x] Preserved visible job errors instead of converting an RPC failure into an
  empty jobs list.
- [x] Restored correct profile routing for househelps.
- [x] Connected household and househelp profile feature selections to the
  catalogue and computed progress.
- [x] Restored the post-OTP Household choice: creating a household records the
  signer as its owner, while joining keeps the signer pending until an owner
  or admin approves the request.
- [x] Made approved Household members resolve the shared household profile
  during the current session and after signing out and back in.
- [x] Restored 10-character Household joining codes, owner request badges, and
  pending/approved/rejected request states.
- [x] Made every required catalogue selection advance progress by one unit.
- [x] Added public profile review summaries, review lists, helpful toggles,
  responses, and review submission.
- [x] Enforced a real engagement before either side can review the other.
- [x] Added account review history at `/account/reviews`.
- [x] Added profile view tracking on public profiles and retained owner
  analytics on private profile pages.
- [x] Rebuilt settings in the existing purple/pink HomeBit design language.
- [x] Connected application preferences to auth and notification preferences
  to notifications.
- [x] Connected the KYC profile section to `GetMyKYC` so pending, approved, and
  rejected submissions are visible and duplicate uploads are avoided.
- [x] Restored trusted-device registration after sign-in, device confirmation,
  list, activity, revoke, and revoke-other-devices screens.
- [x] Kept admin-only management APIs out of the consumer website. Those APIs
  belong in the admin client and should not be exposed merely because the
  backend supports them.

## Automated verification

The following checks pass on this baseline:

| Repository | Command | Result |
| --- | --- | --- |
| Shared package | `go test -count=1 ./...` | Pass |
| Auth | `go test -count=1 ./...` | Pass |
| Notifications | `go test -count=1 ./...` | Pass |
| Payments | `go test -count=1 ./...` | Pass |
| Gateway | `go test -count=1 ./...` and `GOWORK=off go test -count=1 ./...` | Pass |
| Website | `npm run typecheck` | Pass |
| Website | `npm run build` | Pass, with existing bundle-size/import warnings |
| Fresh auth database | `make migrate-seed` | Pass through migration 48 and both seed phases |

The production build warnings are not RPC or CSS failures. They concern large
bundles, mixed static/dynamic imports, an unused signup icon, and the
third-party `google-protobuf` package's use of `eval`.

## Start the local stack

Use the service `.env` files for database names, ports, JWT keys, provider
keys, and NATS subjects. For a truly fresh local auth database:

```bash
cd /Users/sean/Projects/homebit/integration/auth
make migrate-seed
```

Start PostgreSQL and NATS first. Then use separate terminals in this order:

```bash
cd /Users/sean/Projects/homebit/integration/auth
make run
```

```bash
cd /Users/sean/Projects/homebit/notifications
make migrate
make run
```

```bash
cd /Users/sean/Projects/homebit/payments
make migrate
make run
```

```bash
cd /Users/sean/Projects/homebit/integration/gateway
make run
```

```bash
cd /Users/sean/Projects/homebit/integration/website
npm run dev
```

Expected local addresses are auth HTTP/gRPC `3000/5004`, notifications
`3001/5001`, payments `3002/5002`, gateway `3005`, and website `5173`.
The website should use `GATEWAY_API_BASE_URL=http://localhost:3005`.

New-user OTP delivery requires auth and notifications to share a reachable
NATS server and the chosen SMS/email provider credentials to be configured.
An unconfigured delivery provider is an environment failure, not a reason to
fall back to printing OTPs in the browser.

## Seed accounts

All three seed accounts use password `1234`.

| Role | Phone | Email |
| --- | --- | --- |
| Household | `254700000001` | `amina.household@example.test` |
| Househelp | `254700000002` | `wanjiku.househelp@example.test` |
| Second househelp | `254700000003` | `otieno.househelp@example.test` |

The seed also creates one job and one completed working relationship, so review
and contract screens have representative data immediately.

## Browser retest checklist

Use a normal window for one role and a private window or a second browser for
the other. After each action, refresh the destination page once to verify that
the result came from the backend rather than local component state.

### 1. Authentication and device security

- [ ] Sign up a new Household with a four-character-or-longer password.
- [ ] Confirm that the OTP arrives through the configured notification
  provider, verify it, and reach the Household home page.
- [ ] Repeat with a new Househelp account.
- [ ] Log in with each seed account and verify the role-specific home page.
- [ ] Use Google login if the Google client ID, secret, and callback URL are
  configured; complete any missing profile details.
- [ ] Open Settings → Trusted devices and confirm the current browser appears.
- [ ] Open a device's activity, revoke a different device, and then use
  "Revoke other devices".
- [ ] Open a valid `/devices/confirm?token=...` link and verify both success and
  invalid/expired-token states.

Expected: auth errors remain visible, device state survives refresh, and the
navbar Profile link opens `/househelp/profile` for a Househelp and
`/household/profile` for a Household.

### 2. Profile catalogue, location, media, and verification

- [ ] Open `/household/profile` and `/househelp/profile` with new accounts.
- [ ] Select one required feature and confirm the progress percentage
  increases; continue through every required feature.
- [ ] Select optional children and pet properties and confirm they appear on
  the profile without creating separate child/pet domain records.
- [ ] Search for a Kenya ward, select it, save, refresh, and confirm the
  county/subcounty/ward location persists.
- [ ] Upload profile photos and complete Househelp KYC where provider
  credentials are configured.
- [ ] Open the private profile page and confirm the profile completion summary
  agrees with the setup page.
- [ ] Compare the homepage completion banner with the private profile header;
  both must show the same completed/total requirements and percentage.
- [ ] Navigate from the homepage to the profile page and confirm the cached
  completion value appears immediately while any background refresh runs.

Expected: progress is computed from account details, each required catalogue
feature, location, photo, and Househelp KYC. It must never jump to 100% because
all catalogue features are selected while another requirement is missing, and
a failed progress request must not render as a fabricated `0 of 1`.

### 3. Household membership and invitations

- [ ] Sign up a new Household account, finish OTP verification, choose
  **Create a new household**, and confirm `/household/profile` opens.
- [ ] Refresh `/household/profile` and confirm the same household record and
  owner membership are still present.
- [ ] Generate a 10-character invitation code and copy it.
- [ ] In the other browser, sign up another Household account, finish OTP
  verification, choose **I have a joining code**, validate the code, and send
  the request.
- [ ] Confirm the second user remains on `/pending-approval` and cannot see the
  shared profile before approval.
- [ ] As the owner, open the request badge or `/household/requests`, inspect the
  requester's details, and approve it.
- [ ] In the second browser, refresh `/pending-approval` if the live event has
  not already redirected it. Confirm `/household/profile` now shows the
  owner's shared household.
- [ ] Sign the approved member out and back in; confirm the same shared
  household still opens and no empty signup profile replaces it.
- [ ] Repeat with a disposable account and reject the request; confirm the
  rejected user can return to `/household-choice` and try another code or
  create a separate household.
- [ ] Change a member role and refresh.
- [ ] Test leave household, remove member, and transfer ownership using
  non-production seed/test accounts.

Expected: membership belongs to the household profile, not merely the owner's
user ID; only an owner/admin can approve a request; approval survives refresh
and re-login; and all permission failures are visible.

### 4. Jobs, applications, shortlist, and interest

- [ ] As a Household, create a job with type, required feature properties,
  ward/location, schedule, and compensation.
- [ ] Edit it, close it, reopen it, and verify it survives refresh.
- [ ] As a Househelp, browse open jobs, change filters and sort order, and open
  the new job.
- [ ] Apply to the job and confirm application history reflects the status.
- [ ] As the Household, shortlist and unshortlist the Househelp.
- [ ] Test interest create, view, accept, decline, and remove.
- [ ] As the Househelp, create/update an open-for-work entry and verify it can
  be discovered.
- [ ] Delete a disposable job and confirm it disappears.

Expected: there is no `unknown service auth.JobService`, no silent empty job
list, and shortlist state is stored in applications rather than a
`shortlists` table.

### 5. Inbox and hiring lifecycle

- [ ] Start a conversation from a public profile or job/application.
- [ ] Refresh `/inbox` and confirm the conversation is still listed.
- [ ] Send, edit, and react to a message; mark the conversation read.
- [ ] Create a hire request from the Household.
- [ ] As the Househelp, accept one request and decline another.
- [ ] As the Household, cancel a disposable pending request.
- [ ] Exchange negotiation messages and refresh both browsers.
- [ ] Finalize the accepted request into an engagement.

Expected: conversation and hiring lists are backend data, not empty shims, and
each transition rejects an unauthorized role or invalid prior state.

### 6. Optional employment contracts

- [ ] Create a contract from the accepted hire only when the arrangement needs
  one.
- [ ] Update terms, forward to the Househelp, and sign as each party.
- [ ] Complete one test contract and terminate another disposable one.
- [ ] Verify a day-work engagement can exist without an employment contract.

Expected: the engagement is the working relationship; the employment contract
is optional.

### 7. Public profiles, views, and reviews

- [ ] Open a Househelp public profile from the Household browser.
- [ ] Open a Household public profile from the Househelp browser.
- [ ] Spend several seconds on each page, leave, and check profile analytics as
  the profile owner.
- [ ] Submit a review for the seeded completed engagement.
- [ ] Attempt to review a profile with no engagement and confirm rejection.
- [ ] Mark and unmark a public review helpful.
- [ ] As the reviewed profile owner, add a response.
- [ ] Open Settings → My reviews and confirm submitted/received reviews.

Expected: Househelp ratings target the Househelp user; Household ratings target
the shared household profile. Self-views are not added to owner analytics.

### 8. Settings, notifications, and account data

- [ ] Change application preferences, refresh, and confirm persistence.
- [ ] Change notification channel preferences, refresh, and confirm
  persistence.
- [ ] Confirm a first-time notification preferences read creates sensible
  defaults instead of returning not found.
- [ ] Change password and log in with the new password.
- [ ] Test user-owned document list/delete flows where documents exist.

Expected: application preferences are owned by auth; notification preferences
are owned by notifications.

### 9. Payments and subscriptions

- [ ] View plans and the current subscription.
- [ ] Start a checkout or test-provider payment.
- [ ] Poll payment status and inspect payment history/receipt.
- [ ] Test pause/resume/cancel and plan change using the provider's test mode.
- [ ] Test payment method add/default/nickname/remove where supported by the
  configured provider.

Expected: payments go through the payments service, and provider/environment
errors remain visible.

### 10. Public support surfaces

- [ ] Submit the waitlist form with phone-only and email-inclusive variants.
- [ ] Submit the contact form.
- [ ] Verify blog comments, likes, subscription, and unsubscribe.
- [ ] In the admin application, verify waitlists, contact messages, tickets,
  platform settings, admin identity, and RBAC. These are deliberately not
  public website management screens.

### 11. Bureau compatibility

- [ ] With a bureau test identity, load the current bureau profile.
- [ ] Initiate a Househelp link, receive the OTP, verify the link, and test
  resend/expiry.
- [ ] Confirm an unrelated bureau cannot read or modify the link.

Expected: the compact compatibility flow works. Bureau-managed staffing,
placements, fees, and organizational workflows remain part of the later,
full bureau redesign.

## Regression signals to report

When a scenario fails, capture:

- the browser route and visible message;
- the browser console and failed network/gRPC method;
- gateway, owning service, and NATS logs for the same timestamp;
- the account role and whether it was a seed or newly signed-up user;
- whether refresh changes the result;
- the migration version from `SELECT version, dirty FROM schema_migrations`.

Do not hide `unknown service`, permission, validation, migration, NATS, or
provider errors behind an empty UI state. They are the most useful signals for
the next repair.
