# Homebit bug and acceptance tracker

Reported and audited: 2026-09-23. Scope: 18 original reports plus five follow-ups (HB-19–23). Target: **production, https://homebit.co.ke**, as confirmed by the user.

**Release update — 2026-09-25: 21 confirmed issues implemented, locally verified, and deployed to production (16 original reports plus HB-19–23). All four affected services are healthy. HB-14 (filters) and HB-18 (chat double ticks) remain under investigation. User acceptance is pending for every item.**

Audit baseline: 5 reproduced (4 live UI, 1 executable reproduction), 11 additional code-confirmed gaps, and 2 requiring reproduction.

This is the working record for fixing and verifying each item before the user performs a final retest. A source-code finding is not an end-to-end reproduction. No item is considered fixed merely because code was changed.

## Status definitions

- **Reproduced**: observed the reported behavior in the running UI or a focused executable reproduction.
- **Code-confirmed**: identified a definite mismatch in the active source; full UI reproduction may still be pending.
- **Investigating**: the report is recorded, but the cause or exact failing scenario is not established.
- **Implemented**: a change exists; verification is still pending.
- **Verified locally**: relevant checks pass; deployment and user acceptance remain separate.
- **Ready for user retest**: deployed to the agreed test environment and all acceptance checks pass.

## Issue register

| ID | Report / requested behavior | Finding | Fix status |
| --- | --- | --- | --- |
| HB-01 | Remove Join Waitlist links/pages | Reproduced on production waitlist page | Deployed; user retest pending |
| HB-02 | Show signed-out Log in / Sign up at the top on mobile | Reproduced on production at 390 × 844 | Deployed; user retest pending |
| HB-03 | Add Confirm password during password signup | Reproduced: signup has only one password input | Deployed; user retest pending |
| HB-04 | Stop automatic tours after the first Skip | Code-confirmed: dismissal is scoped to individual routes and tour versions | Deployed; user retest pending |
| HB-05 | Hide own listings across profile types and prevent self-hiring | Code-confirmed: discovery lacks account-level exclusion; hiring compares profile IDs | Deployed; user retest pending |
| HB-06 | Automatically extend the active trial to newly activated profile types | Code-confirmed: access is profile-scoped, but prior trial usage blocks the entire account | Deployed; user retest pending |
| HB-07 | Use Find help / Find work in signup profile choices | Reproduced: production labels are Household / Service provider | Deployed; user retest pending |
| HB-08 | Show provider location on Home, Saved, and other cards | Code-confirmed: provider cards omit top-level listing place fields | Deployed; user retest pending |
| HB-09 | Allow direct hiring from an open-to-work listing without first posting a job | Code-confirmed: hire modal requires an owned job and opens job creation when none exists | Deployed; user retest pending |
| HB-10 | Hide providers from other households after contract signing | Code-confirmed: signing activates employment but does not remove provider availability from discovery | Deployed; user retest pending |
| HB-11 | Make notifications navigate to the relevant action | Code-confirmed: clicking marks read and expands the body only | Deployed; user retest pending |
| HB-12 | Show a submitted rating immediately without refresh | Code-confirmed: submission does not reload the public reviews or rating statistics | Deployed; user retest pending |
| HB-13 | Allow reciprocal reviews after an offer is accepted; contract optional | Code-confirmed: UI and backend require an engagement; household profile/user IDs also need alignment | Deployed; user retest pending |
| HB-14 | Repair filters | Investigating: exact page/filter combination requested | Needs reproduction |
| HB-15 | Prevent crashes when switching subscription packages | Reproduced in executable harness: protobuf response causes Invalid time value | Deployed; user retest pending |
| HB-16 | Default desktop Home and Saved to compact view | Code-confirmed: shared view preference defaults to list | Deployed; user retest pending |
| HB-17 | Label fields that allow multiple selections | Code-confirmed: shared picker labels single-select only | Deployed; user retest pending |
| HB-18 | Repair chat double ticks / read receipts | Investigating: production branch already includes receipt fixes; two-account verification needed | Needs reproduction |
| HB-19 | Show phone keypad for phone fields on mobile | Code-confirmed: phone fields lacked explicit inputMode; alternate phone used a text input | Deployed; user retest pending |
| HB-20 | Respect dark theme throughout password recovery; remove Safaricom-only banner | User screenshots and source confirm missing dark input classes and obsolete banner | Deployed; user retest pending |
| HB-21 | Align hiring dialogs and primary actions with the purple theme for both profiles | User screenshot and source confirm inconsistent panel colors and primary button styles | Deployed; user retest pending |
| HB-22 | Match subscription primary buttons and modals to app theme | Screenshots and code confirm flat purple buttons and inconsistent modal surfaces | Deployed; user retest pending |
| HB-23 | Require payment before changing packages; preserve current coverage and queue the paid period | Code and executable PostgreSQL/M-Pesa adapter tests confirm old ChangePlan creates an uncharged payment and reports success without checkout | Deployed; user retest pending |

## Verification and release gate

- Record reproduction steps, actual behavior, expected behavior, source locations, changes, and checks below for every issue.
- Verify household and service-provider roles, including one account with both profile types.
- Use separate test accounts for hiring, reciprocal ratings, contracts, and chat receipts.
- Test desktop and mobile where relevant.
- Trial access must preserve the original trial expiry and must not create unintended charges.
- Direct hiring must preserve a valid hiring context without publishing an unwanted household job.
- Record the deployment/environment and commit references before declaring the full batch ready for retest.
- User acceptance is pending for all 18 items.

## Investigation evidence

Initial inspection found that `integration/` is checked out on **staging**, not production. After the user clarified the environment, all relevant findings were checked against freshly fetched `origin/master` snapshots in `production-bugfix-20260923/`. Existing working changes and branches were preserved. A temporary staging frontend was used only for initial exploration; it is not counted as production reproduction evidence.

| Service | Audited production branch commit |
| --- | --- |
| Website | `c68165feb567413daf159fa4e1f70db8a623d3e8` |
| Auth | `8a19c0d02aa15b79bcfd6ec702a3d7df18fad790` |
| Payments | `443387ecb10d2991f020909cb66dfb4370ab5b72` |
| Notifications | `9be6bbbfb17cca032b02762bbd0cba8b90374f5e` |

These are source baselines, not proof of the exact containers currently running. Live UI observations are identified separately below. Production was inspected signed out; no trial, payment, hiring, contract, chat, or review record was created or changed.

### HB-01 — Retire waitlist entry points

- **Evidence:** Opened [production indoor-cleaning waitlist](https://homebit.co.ke/waitlist/indoor-cleaning). It shows an “Indoor Cleaning Waitlist” page, contact form, and “Join Waitlist” button. The main landing page already uses signup calls to action, so this finding is specifically about the remaining legacy pages.
- **Source:** `website/app/components/ServiceWaitlistPage.tsx:707`, `website/app/routes/waitlist*.tsx`, and `website/app/routes/google.waitlist.callback.tsx` in the production snapshot.
- **Fix acceptance:** Remove obsolete waitlist links and calls to action. Existing waitlist URLs must lead to an appropriate live service/signup destination, with no dead links. Preserve existing collected records.
- **Retest:** Follow Services and legacy waitlist URLs on mobile and desktop; confirm there is no Join Waitlist action and signup is reachable.

### HB-02 — Mobile authentication links

- **Reproduction:** On production Home at 390 × 844, the header contains only the HomeBit link. Open **More**: Log in and Sign up are inside that sheet.
- **Source:** `website/app/components/Navigation.tsx` uses desktop-only visibility for the signed-out links; `MobileBottomNavigation.tsx:161` supplies them in More.
- **Fix acceptance:** Signed-out mobile users see both actions in the top header without opening a menu; signed-in users receive the appropriate account navigation.
- **Retest:** Test narrow and wide phones, desktop, signup/login pages, and the transition after signing in/out.

### HB-03 — Confirm password

- **Evidence:** Production `/signup` renders First Name, Last Name, Password, and Phone, with no confirmation input. Observed without submitting registration or accepting terms.
- **Source:** `website/app/routes/signup.tsx`, password input and form validation.
- **Fix acceptance:** Password-based signup includes a required Confirm password field and a clear mismatch error. Google signup does not require a local password confirmation. Confirmation must not be persisted as an extra credential.
- **Retest:** Empty confirmation, mismatched values, matching values, editing the original password, and Google signup.

### HB-04 — Respect Skip across tours

- **Evidence:** `GuidedRouteTour.tsx:69` keys progress by user, version, and route tour. `finish('skipped')` at line 165 saves only that route's key. A skip on Home therefore does not suppress automatic tours on Profile, Hiring, Inbox, or Subscriptions.
- **Nuance:** Reopening the same tour is already guarded; the confirmed gap is an account-wide opt-out across routes. Cross-device behavior needs a signed-in test.
- **Fix acceptance:** One Skip suppresses subsequent automatic tours for that account, including after profile switching and login. A deliberate “start tour” action may remain available.
- **Retest:** Skip the first tour, visit all toured routes, refresh, sign in again, and switch profile types.

### HB-05 — Own listings and self-hiring

- **Evidence:** `auth/internal/hire/repository.go:282` filters listing type and prior applications but does not exclude all profiles belonging to the viewing account. `auth/internal/hire/service.go`, `Initiate`, compares the listing owner's profile ID against the applicant's profile ID, which differs for two profiles on the same account.
- **Scope:** This confirms the account-versus-profile gap in discovery and this hiring path; a successful self-hire was not attempted in production.
- **Fix acceptance:** Public discovery excludes every listing owned by the current account, for either active profile. Backend hiring rejects equal canonical user IDs even when profile IDs differ. The owner can still manage their own posts in the appropriate management screen.
- **Retest:** One account with both profiles plus a separate account: verify discovery, Saved actions, direct profile links, and server rejection of a self-hire.

### HB-06 — Share the remaining trial across profile types

- **Evidence:** Payments reads accessible subscriptions by user **and profile type**. `payments/internal/grpc/svc_subscription.go:75` rejects trial creation whenever any subscription for the account has `is_trial_used = TRUE`. The signup consumer subscribes to `auth.user.signed_up` and creates the original profile's trial; adding another profile does not automatically grant the remaining period through that flow.
- **Fix acceptance:** Creating the second profile during a trial automatically supplies its appropriate access, ending at the original trial expiry. No payment request, renewed full trial, or duplicate subscription should result. Repeated activation/events must be safe.
- **Retest:** Provider → household and household → provider; repeated switches; trial expiry; already expired trial; an account with paid subscriptions.

### HB-07 — Find help / Find work

- **Reproduction:** Production signup account-type dialog displays “Household” and “Service provider.”
- **Source:** `website/app/utils/signupProfiles.ts` and the signup account-type dialog.
- **Fix acceptance:** Primary choice labels become **Find help** and **Find work**, with descriptions explaining the corresponding roles. The canonical role IDs remain compatible with backend profile creation.
- **Retest:** Both phone and Google signup, including catalogue-loaded and fallback options.

### HB-08 — Provider card locations

- **Evidence:** Backend listings expose resolved `ward`, `subcounty`, and `county` at the top level. `HouseholdJobsHome.tsx:365` constructs a provider summary from flat owner fields without carrying the listing's location. Home then formats only provider location/town. `household.shortlist.tsx:425` similarly formats provider location/town and listing town, omitting listing ward/subcounty.
- **Nuance:** Cards with a fully hydrated nested location can already work. The confirmed failure is the flat listing response shape; no particular production person's data was inspected.
- **Fix acceptance:** A shared formatter/normalizer uses valid nested or listing location fields consistently across Home, Saved, and card detail surfaces. “Location not specified” appears only when the record really lacks usable location data.
- **Retest:** Flat listing, nested profile location, older town text, county-only data, and genuinely missing location; do not display raw catalogue IDs.

### HB-09 — Direct hiring without posting a job

- **Evidence:** `HireRequestModal.tsx:57` loads the household's active listings, opens job creation if none exist, and requires a selected listing to send. A provider-owned availability listing cannot become that selected household listing. The Home invite action sends a conversation message rather than creating the requested direct hire and navigating to Hiring.
- **Source:** `website/app/components/modals/HireRequestModal.tsx`, `hiring/ConversationHire.tsx`, and `HouseholdJobsHome.tsx` invite actions.
- **Fix acceptance:** Hire from a provider's open-to-work card with no existing household job. Prefill details from that record, allow the household to confirm/edit them, preserve source provenance and a valid hiring context, and navigate to the created request in Hiring. No public household job is required. Do not reassign ownership of the provider's listing.
- **Retest:** No household jobs; existing jobs; changed/closed provider listing; repeated click; accepted/declined request; details stay consistent in Hiring and Inbox.

### HB-10 — Availability after contract signing

- **Evidence:** `auth/grpc/employment.go:519` activates the contract, engagement, and application after both signatures. It does not close the provider's open-to-work listing. Discovery in `auth/internal/hire/repository.go:282` does not exclude providers with an active signed contract. Closing the household's filled job elsewhere does not close the provider's separate availability post.
- **Fix acceptance:** Once the contract is fully signed, other households no longer see that provider as available or initiate a conflicting hire. The hiring household keeps access to their hiring record. Existing contracts/listings need consideration, not only newly signed contracts.
- **Retest:** Before signing, one signature, both signatures, a second household, stale saved/profile links, and concurrent attempts. Record the intended reavailability behavior after termination/completion when implementing.

### HB-11 — Notification destinations

- **Evidence:** `website/app/components/notifications/NotificationsModal.tsx:93` marks read then toggles expansion; it never navigates.
- **Fix acceptance:** Notification type/metadata resolves to the relevant Inbox conversation, hiring record, subscription page, or other supported destination. Navigation is accessible by keyboard, closes the panel, and handles deleted targets and malformed/external URLs safely.
- **Retest:** Message, hire, subscription, already-read, missing-target, and informational notifications.

### HB-12 — Reviews update immediately

- **Evidence:** `ProfileReviews.tsx:277` submits the review, clears the form, and says it was published, but only calls `loadMyPendingReview()`. It neither inserts the returned review nor invokes the existing public `loadReviews()` routine, which loads reviews and statistics.
- **Fix acceptance:** A successful submission immediately updates the displayed review list, count, and average; failed submissions do not display a phantom review. Pending/moderated responses must be represented truthfully.
- **Retest:** Submit on page one and another review page; verify review/count/average without refresh; failed submission and duplicate submission.

### HB-13 — Reciprocal reviews after acceptance

- **Evidence:** `ProfileReviews.tsx:160` checks only active/completed/terminated employment rows. `auth/internal/review/review_repository.go:412` requires a corresponding engagement in those states. `CreateEngagementForApplication` creates that relationship on approval, not initial acceptance. Household public profiles pass a household profile ID, while the UI eligibility comparison uses party user-ID fields, creating an additional mismatch to resolve for provider → household reviews.
- **Nuance:** A signed contract is not universally required today: approval already creates an active engagement. The confirmed gap is the requested **accepted-offer** threshold and consistent identity resolution in both directions.
- **Fix acceptance:** Both parties can independently rate one another once the offer is accepted, without signing a contract and without requiring the other party to review first. Preserve authorization, self-review prevention, and one review per author per eligible relationship.
- **Retest:** Both directions after acceptance; no contract; one side reviews first; unrelated account; pending/declined offer; duplicate review; repeat legitimate engagement.

### HB-14 — Filters

- **Status:** Exact reported failure remains unconfirmed. The user confirmed production but has not specified a page/filter/value pair.
- **Evidence inspected:** Frontend search serializes job type and property IDs; the API encodes them and the repository applies them. This does not establish that every filter works. Minimum-rating and interaction filters are applied to loaded cards in the browser; test them across pagination, where matching results can be missed or appear late. Catalogue-ID mapping and saved-filter restoration also need data-backed checks.
- **Source:** `HouseholdJobsHome.tsx`, `ServiceProviderJobsHome.tsx`, `marketplace.service.ts`, `api.job-listings.ts`, and `auth/internal/hire/repository.go`.
- **Fix acceptance / retest:** Build known matching and nonmatching records. Check each exposed filter individually and in combinations, clearing, persistence, both roles, mobile/desktop, and matches beyond page one. Record the exact failing value and expected listing IDs before declaring this fixed.

### HB-15 — Subscription switching crash

- **Reproduced without payment:** The billing service returns a generated protobuf `PreviewProrationResponse`. `subscriptions.tsx:370` uses `preview.proration || preview`, but the response exposes `getProration()`. The modal expects snake-case fields; even `toObject()` supplies camel-case fields. `ChangePlanModal.tsx:231` calculates a date using undefined `days_remaining` and calls `toISOString()`.
- **Observed result:** `RangeError: Invalid time value` using a real generated response with 12 days remaining.
- **Evidence:** [Reproduction harness](production-bugfix-20260923/evidence/reproduce-plan-switch.cjs). It adapts only module loading and executes the current handler/date calculation against the actual generated classes; it is not a live billing transaction or a full UI reproduction.
- **Fix acceptance:** Normalize the response into the modal's data model, validate numeric/date values, and show recoverable errors for bad/failed previews. Confirm must remain disabled without a valid current preview. Verify server outcomes for supported upgrades/downgrades rather than only preventing the render crash.
- **Retest:** Upgrade, downgrade, unchanged plan, trial plan, malformed/failed preview, closing/reopening, and rapid plan selection. Any paid transaction needs an agreed test environment/flow.

### HB-16 — Compact desktop default

- **Evidence:** `website/app/components/listing/ListingViewToggle.tsx:7` initializes the shared preference to `list`; Home and both Saved views use it.
- **Interpretation for implementation:** Treat “compact” as the existing grid/card layout unless a different design is specified. Keep deliberate saved user preferences.
- **Fix acceptance:** Fresh desktop users receive compact/grid cards on Home and Saved; switching views persists correctly and mobile layouts remain usable.
- **Retest:** No preference, saved list preference, saved grid preference, both profile types, and mobile/desktop resizing.

### HB-17 — Multi-select instructions

- **Evidence:** `FeatureOptionPicker.tsx:77` displays “Choose one option” when `multiple` is false and no equivalent instruction when true. This shared picker is used in onboarding and job detail forms. Some legacy forms already say “Select all that apply,” so the gap is inconsistent coverage.
- **Fix acceptance:** Every multi-select field clearly says “Select all that apply” or equivalent before selection; single-select fields remain distinguishable and actual selection limits match the helper text.
- **Retest:** Skills/chores and other multi-select profile fields, search-based pickers, job details, single-choice fields, and selection/deselection on mobile.

### HB-18 — Chat ticks / read receipts

- **Status:** Not reproduced in a live two-account conversation. Do not classify the existing implementation as completely missing.
- **Evidence:** Production source includes commit `b0b349f` (“Fix inbox sending, unread badges and live read receipts”, 2026-09-16). `inbox.tsx:1034` marks newly arrived messages read while the conversation is visible; its WebSocket handler applies conversation-wide read receipts. Notifications publishes such receipts. The SSE handler has a different, message-ID-based contract, so transport/fallback behavior needs tracing if the report persists.
- **Fix acceptance:** Agree and verify sent/delivered/read meanings. The sender sees the correct ticks live when the recipient receives/reads messages; hidden tabs must not falsely mark messages read. Reconnects and refreshes preserve status.
- **Retest:** Two separate authenticated sessions; recipient already viewing the conversation; recipient opens it later; background tab; offline/reconnect; sender refresh; WebSocket and supported fallback path. Record both account roles, message time, and observed status without posting messages to real users as an audit side effect.

## Fix sequence and completion log

Suggested sequence: **HB-15**, then **HB-01/02/03/04/07/11/12/16/17**; address the related marketplace and hiring rules **HB-05/06/08/09/10/13** with integration coverage; investigate **HB-14/18** using controlled accounts/data. Work through one tracked change at a time and record dependencies where a fix spans services.

| Date | Change | Validation | Deployment | User retest |
| --- | --- | --- | --- | --- |
| 2026-09-23 | Baseline audit and tracker created; no application changes | Four production UI findings; one executable crash reproduction; production source review | None | Pending |

For each subsequent fix, append the issue ID, changed repository/commit, relevant checks and results, remaining limitations, deployed environment/build, and user acceptance result. **The 21 deployed fixes are ready for user retest; HB-14 and HB-18 remain open and require reproduction.**

## Fix batch — 2026-09-24

The user authorized implementation of confirmed issues and production deployment for all affected services. Changes are isolated in `production-bugfix-20260923/`; the original integration checkouts and existing changes are preserved.

| IDs | Implemented behavior | Verification |
| --- | --- | --- |
| HB-01, 02, 03, 07 | Retired waitlist routes redirect to signup. Signed-out auth links are visible in the top navigation. Password signup requires a matching confirmation. Profile choices say Find help / Find work. | Production frontend build; local browser confirms signup options, confirmation field and mismatch error, disabled submission, and waitlist redirect preserving profile selection. |
| HB-04 | A Skip suppresses automatic tours account-wide across pages and versions, with immediate browser storage and server persistence. Explicit replay remains available. | Auth and frontend checks; account-level skipped-event lookup reviewed. |
| HB-05, 10 | Discovery excludes all profiles owned by the viewer and providers with active fully signed contracts. Hiring compares account identities. Provider account locks serialize signing and new hire requests; availability returns after termination. | PostgreSQL tests for self-hiring rejection, both signature transitions, and availability after termination. |
| HB-06 | First access check for a newly activated marketplace profile automatically grants the remaining live account trial. It uses the original expiry, creates no payment, and does not restart expired/cancelled trials or share paid subscriptions. | Payments full test suite plus PostgreSQL test with 8 concurrent activation checks: one grant, same expiry, no duplicate subscription. |
| HB-08 | Cards accept flat listing ward/subcounty/county fields and nested profile location; county is used when no more specific place exists. | Frontend tests, typecheck, build. Records with no stored location still show the honest fallback. |
| HB-09 | Hire opens directly from provider cards or the shared hire modal. Advertised details and feature values are copied into a private household brief, which is excluded from job discovery. The provider post is unchanged; retries reuse the request. Sending opens Hiring. | PostgreSQL gRPC test creates a hire with no household listing, checks feature snapshot, owner, private visibility, retry identity and unchanged source status. |
| HB-11 | Notification click marks it read and navigates to Inbox, Hiring, subscriptions or reviews when identifiable. Notification records now preserve event type and action URL. External/unsafe links are rejected. | Website routing tests and notifications full Go suite. |
| HB-12, 13 | Review submission refreshes reviews and rating statistics. Accepted offers establish review eligibility in both directions without a contract. Household account IDs are normalized to profile IDs for Review back. | PostgreSQL tests for reciprocal eligibility after acceptance, no eligibility before acceptance, idempotency, and withdrawal. Auth migration 93 backfills existing accepted offers. |
| HB-15 | Proration responses are normalized from actual protobuf fields before rendering. Invalid billing values show a recoverable error; stale modal requests are ignored. | Regression uses generated protobuf response; invalid input is rejected. |
| HB-16, 17 | Home/Saved default to compact grid when there is no saved preference. Multi-select controls say Select all that apply. Existing explicit view choices are preserved. | Shared component review, frontend tests, typecheck and build. |

### Validation record

- Website: 42 test files, 194 tests passed; TypeScript and production build passed.
- Auth: full Go suite passed without optional integration database; affected PostgreSQL suites (`grpc`, `internal/hire`, `internal/review`) passed on a fresh migrated database with local seed data.
- Payments: full Go suite passed, including shared-trial PostgreSQL regression.
- Notifications: full Go suite passed.
- Full optional Auth PostgreSQL run identified a pre-existing saved-filter test fixture that assumes job type ID 1; the current catalogue has no such ID. This unrelated fixture is not counted as a passed check and was not changed.
- No production accounts, charges, hires, contracts, messages or reviews were created for testing.

### Retest checklist

1. Signed out on mobile: confirm Log in and Sign up are in the header; More no longer contains them.
2. Follow an old waitlist link; check Find help / Find work and matching password confirmation.
3. Skip a tour, navigate to other sections and sign in on another device: no automatic tour.
4. With both profile types on one account, verify your provider card is absent from your own discovery and self-hiring is rejected.
5. During a provider trial, add/switch to a household profile: access is automatic and the original expiry is preserved.
6. Verify provider locations on Home and Saved, then hire from a provider card with no household job listing. Confirm the advertised details and the request in Hiring.
7. Accept the offer: both sides can review, and a new review appears immediately. Sign both contract sides: the provider disappears from other households' discovery.
8. Click hiring, chat and billing notifications; change subscription plan; verify compact default and multi-select labels.
9. HB-14 and HB-18 still require the exact failing filter scenario and a two-account chat receipt reproduction before fixes can be claimed.

### Deployment record

Production rollout verified on 2026-09-24 at approximately 09:33 EAT (06:33 UTC).

| Service | Fix commit | Production image | Result |
| --- | --- | --- | --- |
| Auth | `192ee2c` | `ghcr.io/homebithub/auth:20260923213222` | 1/1 ready and available; migration 93 clean (`dirty=false`) |
| Payments | `af391a7` | `ghcr.io/homebithub/payments:20260923213227` | 2/2 ready and available |
| Notifications | `1e5d33c` | `ghcr.io/homebithub/notifications:20260923213238` | 2/2 ready and available |
| Website | `ee39e5c` | `ghcr.io/homebithub/website:20260924062811` | 1/1 ready and available |

All changes were pushed to the services' `master` branches. Deployment-tag commits: auth `84d772b`, payments `efee22e`, notifications `d8b6ba3`, website `0644535`. No changes were required in the gateway, shared package or admin service for this batch.

**Deployment recovery:** Auth initially failed to start because the checked-in manifest referenced the removed database `homebit_auth_v20260915`. The previously healthy ReplicaSet used `homebit_auth`. After verifying that database at clean migration 92, the manifest was corrected in `fbdcf64` and the tested image redeployed. It applied migration 93 and became healthy. A temporary diagnostic pod was removed. The singleton website rollout briefly returned HTTP 503 while replacing its pod; it subsequently became healthy.

**Live smoke checks:** `https://homebit.co.ke/waitlist?profile=household` redirects to `/signup?profile_type=household`. The live signup page displays Find help, Confirm password, and top-navigation Log in / Sign up. Local browser verification additionally checked Find work and mismatched-password rejection. Authenticated business flows have automated/database coverage; user end-to-end acceptance remains pending.

**Remaining open reports:** HB-14 filters and HB-18 chat double ticks were not changed because the failing scenarios still need reproduction. This release does not claim that all 18 reports are fixed.


## UI follow-up — 2026-09-24 (HB-19–21)

- **HB-19:** Phone inputs explicitly use `type="tel"`, `inputMode="tel"` and telephone autofill across signup, login, recovery, account/profile editing, references, bureau registration and billing. The OTP target editor switches between telephone and email hints; the OTP code retains its numeric keypad. Phone values remain strings so leading zeros and `+` are preserved.
- **HB-20:** Recovery phone/password inputs, labels, helper text and success feedback support dark mode. Removed the obsolete Safaricom-only banner from recovery and Add phone. The verification phone editor uses the same dark surface and gradient primary action.
- **HB-21:** Hiring panels use the shared `#13131a` dark surface, purple borders and purple-to-pink primary actions, including Chat, accepting offers, confirming interest and contract actions. Destructive and status colors retain their meaning. Checked household Jobs, Applicants, Shortlisted, Needs your reply, Contracts and Closed; provider Offers, Applications, Requests, Contracts and Work History. Related job details, confirmation/decline/termination, contract signing/email and chat hire details dialogs were included in the source audit.

**Verification:** 194 existing tests passed. Final TypeScript and production build checks passed. Local browser visually verified recovery phone and both password inputs in dark mode, light reset fields, and the shared hiring modal in light/dark using a temporary fixture route (removed before release). Browser DOM confirms `type="tel"` and `inputmode="tel"`; a desktop browser cannot confirm a physical phone's keyboard. Authenticated hiring tabs were source-reviewed; live two-profile acceptance remains with the user. No OTPs, messages, hires, contracts or payments were submitted.

**Retest:** On a phone, tap the phone field on login, signup and recovery; confirm the telephone keypad. Switch light/dark through recovery and verify readable inputs with no carrier banner. As each profile, visit every Hiring tab, open details and available action dialogs, and check purple primary buttons (especially Chat) and consistent dark surfaces.

**Deployment:** Website source `fa29255` pushed to `master`; deployment tag commit `895e490`, image `ghcr.io/homebithub/website:20260924142902`. Rollout verified healthy (1/1 ready and available) on 2026-09-24 at 17:33 EAT. Auth, payments and notifications remain healthy on their previous images; no backend changes were required. Live browser verification confirms the recovery banner is absent, the phone field has `inputmode="tel"`, and recovery/reset inputs use `rgb(19, 19, 26)` dark backgrounds with white text. User acceptance remains pending.


## Subscription follow-up — 2026-09-24 (HB-22–23)

- **HB-22:** Pay, checkout/retry and related subscription primary buttons use the purple-to-pink theme. Subscription change/cancellation/payment/transaction dialogs use the standard dark surface and purple borders; credit balance follows the same theme.
- **HB-23:** Choosing a package opens a price/date preview and then phone-number checkout. No plan-change write or payment record is made merely by opening/cancelling the preview. The full plan price is charged through the M-Pesa adapter only on explicit payment. After provider confirmation, a separate paid period starts at the end of current coverage (including already paid queued packages), and expires one purchased billing period later. Current plan/trial stays intact until then. Failed or abandoned payment does not migrate the user. Duplicate callbacks are idempotent, failed voluntary checkout is not automatically retried, and old ChangePlan calls reject without mutation.
- **History and dates:** Paid upcoming packages show their actual start/expiry dates. History and queued coverage are refreshed after payment; success copy distinguishes a queued purchase from immediate activation.
- **Existing report:** Read-only production audit found one phantom pending UPGRADE payment, with no phone, M-Pesa transaction, receipt or paid timestamp. The account already has its original plan. Migration 36 marked this one uncharged record cancelled while preserving the audit history; it did not change that subscription.

**Validation:** Website: 198 tests across 43 files; TypeScript and production build. Payments: full Go suite with isolated PostgreSQL and fake M-Pesa HTTP provider. Coverage includes active/trial preservation, no-phone rejection with zero payments/prompts, prompt reuse, failed payment, late success, eight simultaneous callbacks, stale processing update, multiple paid periods, activation at expiry, STK provider failure and recovery of payments confirmed by an older replica during rollout. Migration smoke test cancels a synthetic phantom record while preserving a real-phone pending record. Local browser checks confirmed light/dark preview, full price and dates (16 October + quarterly = 16 January), Not now and Continue to payment. Temporary preview route removed. No real charges or payment messages were sent in testing.

**Retest:** Select a different package, confirm the full price and start/expiry dates, then cancel: plan/history unchanged. Continue: confirm phone and receive the M-Pesa prompt; reject it and confirm current plan/expiry unchanged. Pay successfully: current plan remains until expiry, history says completed, and the new package appears under Paid upcoming packages with the appended expiry. Repeat for both profile types and check subscription dialogs in light/dark mode.

**Deployment:** Verified on 2026-09-25 at 06:45 EAT. Payments source commits `c232100` and `1191d14`, deployment tag commit `4d45209`, image `ghcr.io/homebithub/payments:20260924194436` (2/2 ready and available). Website source `3dcd686`, deployment tag commit `83e4e22`, image `ghcr.io/homebithub/website:20260924194441` (1/1 ready and available). Both pushed to `master`; payments migration 36 completed before website release. Auth (1/1) and notifications (2/2) remain healthy on their previous images; no other services required changes.

**Live checks:** Both deployments successfully rolled out; production homepage HTTP 200. Read-only database audit confirms migration 36 with `dirty=false`, zero uncharged pending UPGRADE records, one cancelled uncharged record, and zero completed checkouts awaiting scheduling. Actual phone/M-Pesa acceptance remains with the user; no production payment was made for testing.


## Theme collections — 2026-09-25 (local review only)

Status: user approved production release after local review. Final validation and rollout in progress; default collection is Vivid and default mode follows the device. Existing explicit account choices are preserved.

- **Vivid:** the existing purple/pink gradient and glow collection, still the default.
- **Refined:** solid homepage-brand purple (`#7E22CE`) actions, neutral white/charcoal surfaces, subtle borders and neutral shadows. Both collections support Light, Dark and Use device setting.
- Settings now includes an Appearance section. Collection (`theme_collection`) and mode (`theme`) save through the existing authenticated account preferences API; no backend schema change is required. Account preferences reload on navigation and when the app regains focus. Serialized saves protect rapid changes; failed synchronization is shown with an explicit retry.
- The initial page script restores the local cached collection/mode before paint. Refined overrides apply at the document root, including portal dialogs. Semantic error/success colors remain distinct.
- A development-only comparison page at `http://127.0.0.1:4181/theme-preview` uses the actual settings control and hiring dialog with sample content. It saves to this browser only and never writes account settings or sends hires/payments. This route returns 404 in production builds.
- Local service-worker registration is disabled during development to prevent outdated cached components during design review.

Validation: 207 tests in 45 files passed; typecheck and production build passed. New tests cover appearance bootstrap, invalid defaults, blocked storage, account API saving, restoration in a simulated fresh device, account-default isolation, anonymous choices and failure propagation. Browser checks cover Refined light/dark, actual hiring modal surfaces/actions, recovery page, reload persistence and restoring Vivid gradients. A live two-device authenticated account acceptance check remains pending; no production preferences were changed during this preview.

Review: switch collections and Light/Dark, open Preview modal, and follow the real recovery-page link. Approve the appearance before deployment.

### Local theme review revision — SVG brand purple

Refined now uses the exact `#7e22ce` accent found in `public/shopping.svg`, `public/man-trash.svg` and `public/mtoi.svg`. Updated primary actions, palette shades, hover color and collection swatch. Neutral surfaces and no-gradient treatment remain.

Audited signed-in Home/Saved, Settings, Hiring, Inbox and subscriptions styling. Expanded root-scoped compatibility rules for older dark surfaces, Inbox composer, arbitrary glow shadows and emoji picker. The theme provider wraps the authenticated app and portal dialogs, so the collection is not restricted to public pages. Signed-in users choose Refined in Settings → Appearance; their existing saved account choice remains authoritative.

Local preview now includes an Inbox style sample and the actual subscription change dialog using sample data, in addition to the real hiring modal and settings chooser. Browser computed-style checks confirm primary/Chat buttons `rgb(126, 34, 206)` with no background image, neutral chat composer/shadow, white hiring dialog in light mode and neutral subscription portal in dark mode. Typecheck and production build passed after this revision. Actual authenticated account navigation has not been exercised in this browser; it is currently signed out. No push or deployment.

### Theme release approval — 2026-09-25

User authorized production deployment after confirming Vivid + device light/dark as the defaults. Added bootstrap regressions for both device modes with empty and blocked browser storage; existing saved choices remain respected. The account defaults already use `theme_collection=vivid` and `theme=system`. No backend changes or database migrations are required. Release validation passed: 210 tests in 45 files, TypeScript and production build. Production deployment pending.
