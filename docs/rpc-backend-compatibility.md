# Website RPC ↔ backend compatibility catalogue

Last audited: 2026-07-29

This document is the working source of truth for RPCs used by the HomeBit
website and whether the current integration backend can serve them.

## Restoration status

The compatibility work identified by this audit is now implemented. The
tables and counts below are retained as the **pre-restoration audit snapshot**
that explains what was lost and why it was restored.

| Outcome | Status |
| --- | --- |
| 40 invoked RPC gaps | Restored |
| 8 silent website shims | Replaced with live RPC calls |
| Missing shared contracts | Restored and Go clients regenerated |
| Missing auth service registrations | Restored and registration-tested |
| Duplicate legacy shortlist table | Removed; `applications.status` is canonical |
| Fresh database migration | Versions 1–48 clean, `dirty = false` |
| Core and catalogue seed | 3 users, 2 profile types, 16 features, 181 options |
| Website verification | Typecheck and production client/SSR build pass |

The executable completion checklist and browser scenarios are in
[`end-to-end-restoration-checklist.md`](./end-to-end-restoration-checklist.md).

## Audit baseline

| Repository | Branch | Audited commit |
| --- | --- | --- |
| Website | `integration/2026-07-28-website` | `07283a3` plus current working-tree fixes |
| Auth | `integration/2026-07-28-auth` | `26ae86d` plus current working-tree fixes |
| Shared protobuf package | `integration/2026-07-28-pkg` | `ebe4780` |
| Gateway | `integration/2026-07-28-gateway` | `48a958a` |
| Notifications | `master` | `7ad95ad` |
| Payments | `master` | `db4131e` |

The audit scanned:

- every generated-client invocation under `website/app`;
- every raw `/<package>.<Service>/<Method>` path under `website/app`;
- every wrapper method referenced by a route, component, hook, context, or
  utility outside the gRPC service modules;
- the protobuf services in `integration/pkg/proto`;
- service registrations and concrete handler methods in auth, notifications,
  and payments;
- Git history for removed auth services and deliberately stubbed website calls.

The gateway is not a contract bottleneck. Its transparent proxy sends `auth`,
`profile`, and `client_profile` packages to auth, `notifications` to
notifications, and `payments` to payments. An `unknown service` response
therefore means that the target backend did not register the service.

## Pre-restoration summary

| Measure | Count |
| --- | ---: |
| RPC methods represented by website adapters | 244 |
| Services represented by website adapters | 36 |
| RPC targets confirmed as invoked by current UI code | 164 |
| Invoked RPCs currently callable end-to-end | 124 |
| Invoked RPCs missing or unimplemented | 40 |
| Invoked operations replaced by local/hard-coded shims | 8 |

Status meanings:

- **Available** — protobuf exists, backend registers the service, and the
  concrete method is implemented.
- **Partial** — service is registered but one or more website methods fall
  through to the generated `Unimplemented` server.
- **Unregistered** — protobuf exists, but the backend does not register a
  server for it.
- **Contract removed** — the website's generated client still contains the
  service, but the current shared protobuf package does not.
- **Local shim** — the UI operation no longer performs an RPC and returns
  cached or hard-coded data.

## Resolved gap register

These were the 40 RPCs that current route/component code could attempt but the
refactored backend could not serve. Each track is now restored against the
compact schema.

| Track | Service | Restored RPCs used by UI | Resolution |
| --- | --- | --- | --- |
| RPC-001 | `auth.AuthService` | `GetGoogleAuthURL`, `CompleteGoogleSignup` | Compact Google identity compatibility handler. |
| RPC-002 | `auth.HireRequestService` | `CreateHireRequest`, `GetHireRequest`, `AcceptHireRequest`, `DeclineHireRequest`, `CancelHireRequest` | Backed by applications and application events. |
| RPC-003 | `auth.HireContractService` | `CreateFromHireRequest`, `ListHireContracts` | Application → engagement → optional employment contract. |
| RPC-004 | `auth.HireNegotiationService` | `AddNegotiationMessage`, `ListNegotiations` | Compact application negotiation records. |
| RPC-005 | `auth.ShortlistService` | `CreateShortlist`, `DeleteShortlist`, `ShortlistExists` | Facade over `applications.status = 'shortlisted'`; no duplicate table. |
| RPC-006 | `auth.InterestService` | `CreateInterest`, `DeleteInterest`, `ListByHousehelp`, `InterestExists`, `MarkViewed`, `AcceptInterest`, `DeclineInterest` | Compact typed marketplace relationships. |
| RPC-007 | `auth.OpenForWorkService` | `CreateOpenForWork`, `GetOpenForWork`, `GetOpenForWorkByHousehelp`, `UpdateOpenForWork` | Provider-owned entries in the consolidated listings model. |
| RPC-008 | `auth.HousehelpPreferencesService` | `AddChores`, `UpdateAvailability` | Catalogue picks plus compact structured user preferences. |
| RPC-009 | `auth.ProfileSetupService` | `GetSteps`, `GetProgress`, `UpdateProgress`, `UpdateStep` | Computed from required catalogue picks, location, photo, and househelp KYC. |
| RPC-010 | `auth.ProfileViewService` | `RecordView`, `GetAnalytics`, `UpdateViewDuration` | Compact profile-view store with owner-authorized analytics. |
| RPC-011 | `auth.ReviewService` | `GetPublicReviews`, `GetReviewStats`, `MarkHelpful` | Retained review schema with relationship validation, helpful marks, and owner responses. |
| RPC-012 | `auth.BureauService` | `GetCurrentBureauProfile`, `InitiateHousehelpLink`, `VerifyHousehelpLink`, `ResendHousehelpLinkOTP` | Minimal compatibility domain restored; larger bureau redesign remains future work. |

## Resolved website shims

These calls previously returned local empty or completed data. All now reach
their owning backend.

| Track | Website operation | Previous behaviour | Resolution |
| --- | --- | --- | --- |
| WEB-001 | `notificationsService.listConversations` | Always returned an empty list | Calls `ListConversations`. |
| WEB-002 | `hireRequestService.listHireRequests` | Always returned an empty list | Calls the applications-backed hire request service. |
| WEB-003 | `shortlistService.listByHousehold` | Always returned an empty list | Calls the applications-backed shortlist service. |
| WEB-004 | `interestService.listByHousehold` | Always returned an empty list | Calls the compact interest service. |
| WEB-005 | `profileSetupService.getProgress` | Always reported complete | Calls computed profile progress. |
| WEB-006 | `profileService.getHousehelpsByBureau` | Always returned deprecated/empty | Calls the restored bureau lookup. |
| WEB-007 | `authService.getCurrentUser` | Used browser cache as authority | Calls `GetCurrentUser`; browser state remains a cache. |
| WEB-008 | `getProfileSetupProgressOnServer` | Server loader always received complete | Uses the same computed backend source as the browser. |

## Pre-restoration UI call catalogue

This is the confirmed set of RPCs referenced by routes/components, after
resolving wrapper aliases and the current job-listing adapter.

### Available auth and catalogue services

| Service | RPCs used by current UI | Backend status |
| --- | --- | --- |
| `auth.AdminAuthService` | `CheckIsAdmin` | Available |
| `auth.AuthService` | `Signup`, `Login`, `Logout`, `ForgotPassword`, `ResetPassword`, `ChangePassword`, `UpdateEmail`, `UpdatePhone`, `UpdateUser`, `ResendOTP`, `VerifyOTP` | Available. Google methods are listed separately in RPC-001. |
| `auth.ContactService` | `CreateContactMessage` | Available |
| `auth.DocumentService` | `GetUserDocuments`, `DeleteDocument` | Available |
| `auth.EmploymentService` | `ListByHousehold`, `ListByHousehelp` | Available |
| `auth.EmploymentContractService` | `CreateEmploymentContract`, `GetEmploymentContract`, `UpdateEmploymentContract`, `ListEmploymentContracts`, `SignByHousehold`, `SignByHousehelp`, `ForwardToHousehelp`, `GetDefaultClauses` | Available; backed by engagements and optional contracts. |
| `auth.HouseholdKidsService` | `CreateHouseholdKid`, `ListHouseholdKids`, `UpdateHouseholdKid`, `DeleteHouseholdKid` | Available compatibility facade. Longer term, converge duplicate UI state on catalogue picks. |
| `auth.HouseholdMemberService` | `ValidateInviteCode`, `GetOrCreateInvitationCode`, `CreateInvitation`, `ListInvitations`, `RevokeInvitation`, `JoinHousehold`, `GetJoinRequestStatus`, `ListPendingRequests`, `ApproveRequest`, `RejectRequest`, `ListMembers`, `UpdateMemberRole`, `RemoveMember`, `TransferOwnership`, `GetUserHouseholds`, `LeaveHousehold` | Available |
| `auth.ImageService` | `GetImagesByUserID` | Available |
| `auth.KYCService` | `SubmitKYC`, `GetSmileIDToken` | Available |
| `auth.ListingService` | `CreateListing`, `ListJobs`, `UpdateJob`, `DeleteJob`, `CloseListing`, `ReopenListing`, `InitiateListing`, `ShortlistListing`, `ListApplications` | Available after the JobService/ListingService website alignment. |
| `auth.LocationService` | `CreateLocation`, `GetLocationSuggestions`, `GetLocationByMapboxID` | Available ward-backed compatibility facade |
| `auth.OnboardingOptionsService` | `GetAllOptions`, `GetSalaryRanges` | Available catalogue-backed facade |
| `auth.PetsService` | `CreatePet`, `ListMyPets`, `DeletePet` | Available compatibility facade |
| `auth.ProfileService` | `GetCurrentHouseholdProfile`, `GetHouseholdByUserID`, `SearchHouseholds`, `CountHouseholds`, `UpdateHouseholdProfile`, `GetCurrentHousehelpProfile`, `GetHousehelpByID`, `GetHousehelpByUserID`, `GetHousehelpProfileWithUser`, `SearchHousehelps`, `CountHousehelps`, `SearchMultipleWithUser`, `UpdateHousehelpFields`, `SaveUserLocation` | Available compatibility facade |
| `auth.WaitlistService` | `CreateWaitlist` | Available |
| `client_profile.ClientProfileService` | `ListJobTypes`, `GetJobTypeFeatureBundles` | Available |
| `profile.ProfileService` | `ListProfiles`, `GetProfileFeatures` | Available |
| `profile.UserProfileService` | `ListPicks`, `ReplacePicks` | Available |

### Available notification, blog, and payment services

| Service | RPCs used by current UI | Backend status |
| --- | --- | --- |
| `notifications.NotificationsService` | `StartConversation`, `GetConversation`, `MarkConversationAsRead`, `ListMessages`, `SendMessage`, `EditMessage`, `ToggleReaction`, `SendEmail` | Available. `ListConversations` is available on the backend but bypassed by WEB-001. |
| `notifications.BlogService` | `TrackView`, `TrackShare`, `CreateComment`, `ListComments`, `LikePost`, `UnlikePost`, `GetLikeStatus`, `SubscribeToBlog`, `UnsubscribeFromBlog` | Available |
| `payments.PaymentsService` | `GetPlans`, `GetMySubscription`, `CheckSubscriptionAccess`, `CancelSubscription`, `PauseSubscription`, `ResumeSubscription`, `GetPauseStatus`, `CreateSubscriptionCheckout`, `InitiatePayment`, `CheckPaymentStatus`, `ListMyPayments`, `DownloadReceipt`, `EmailReceipt`, `PreviewProration`, `ChangePlan`, `GetCreditBalance`, `GetPaymentMethods`, `AddPaymentMethod`, `SetDefaultPaymentMethod`, `RemovePaymentMethod`, `UpdatePaymentMethodNickname` | Available |

### Services that were missing or partial before restoration

| Service | RPCs represented by website adapter | Contract | Registration/implementation |
| --- | --- | --- | --- |
| `auth.AuthService` | `ChangePassword`, `CompleteGoogleSignup`, `ForgotPassword`, `GetGoogleAuthURL`, `Login`, `Logout`, `ResendOTP`, `ResetPassword`, `SendOTP`, `Signup`, `UpdateEmail`, `UpdatePhone`, `UpdateUser`, `VerifyOTP` | Present | Partial: `GetGoogleAuthURL` and `CompleteGoogleSignup` are missing. |
| `auth.BureauService` | `GetBureau`, `GetCurrentBureauProfile`, `InitiateHousehelpLink`, `ResendHousehelpLinkOTP`, `VerifyHousehelpLink` | Removed | Not registered |
| `auth.HireRequestService` | `CreateHireRequest`, `GetHireRequest`, `AcceptHireRequest`, `DeclineHireRequest`, `CancelHireRequest` (`ListHireRequests` is a local shim) | Present | Not registered |
| `auth.HireContractService` | `CreateFromHireRequest`, `GetHireContract`, `ListHireContracts`, `CompleteHireContract`, `TerminateHireContract` | Present | Not registered |
| `auth.HireNegotiationService` | `AddNegotiationMessage`, `ListNegotiations` | Present | Not registered |
| `auth.HousehelpPreferencesService` | `CreateHousehelpPreference`, `GetHousehelpPreference`, `ListHousehelpPreferences`, `UpdateHousehelpPreference`, `DeleteHousehelpPreference`, `AddChores`, `UpdateBudget`, `UpdateAvailability` | Removed | Not registered |
| `auth.HouseholdPreferencesService` | `UpdateBudget`, `UpdateHouseSize` | Removed | Not registered; no confirmed current UI invocation |
| `auth.InterestService` | `CreateInterest`, `GetInterest`, `DeleteInterest`, `ListByHousehelp`, `InterestExists`, `MarkViewed`, `AcceptInterest`, `DeclineInterest` (`ListByHousehold` is a local shim) | Removed | Not registered |
| `auth.OpenForWorkService` | `CreateOpenForWork`, `GetOpenForWork`, `GetOpenForWorkByHousehelp`, `SearchOpenForWork`, `ListOpenForWork`, `UpdateOpenForWork`, `DeleteOpenForWork` | Removed | Not registered |
| `auth.PreferencesService` | `GetPreferences`, `UpdatePreferences`, `DeletePreferences`, `MigrateAnonymousToUser` | Removed | Not registered; no confirmed current UI invocation. Notification preferences belong in notifications. |
| `auth.ProfileSetupService` | `GetSteps`, `UpdateProgress`, `UpdateStep` (`GetProgress` is a local shim) | Removed | Not registered |
| `auth.ProfileViewService` | `RecordView`, `GetAnalytics`, `UpdateViewDuration`, `GetProfileViews` | Present | Not registered |
| `auth.ReviewService` | `CreateReview`, `GetHousehelpReviews`, `GetHouseholdReviews`, `GetHousehelpAverageRating`, `GetReview`, `GetPublicReviews`, `GetMyReviews`, `GetReviewStats`, `MarkHelpful`, `UnmarkHelpful`, `AddResponse` | Present | Partial. Current handler implements the first four catalogue-style operations, but not the seven enhanced review RPCs. Current UI calls three missing methods: `GetPublicReviews`, `GetReviewStats`, and `MarkHelpful`. |
| `auth.ShortlistService` | `CreateShortlist`, `GetShortlist`, `DeleteShortlist`, `ListByProfile`, `ShortlistExists`, `UnlockShortlist`, `GetUnlockedContact` (`ListByHousehold` is a local shim) | Removed | Not registered |

## Full adapter surface that is currently available

These adapters contain additional RPCs that are not confirmed in current
route/component call sites but still match live backend contracts.

| Service | Adapter RPCs |
| --- | --- |
| `auth.ContactService` | `CreateContactMessage`, `GetContactMessages`, `GetContactMessageByID` |
| `auth.DeviceService` | `RegisterDevice`, `ConfirmDevice`, `GetUserDevices`, `RevokeDevice`, `RevokeAllDevices`, `GetDeviceActivity` |
| `auth.DocumentService` | `GetUserDocuments`, `GetDocumentByID`, `DeleteDocument`, `GetDocumentDownloadURL` |
| `auth.EmploymentService` | `ListByHousehold`, `ListByHousehelp`, `GetCurrentStatus`, `GetLatestByProfileID` |
| `auth.EmploymentContractService` | `CreateEmploymentContract`, `GetEmploymentContract`, `UpdateEmploymentContract`, `DeleteEmploymentContract`, `ListEmploymentContracts`, `SignByHousehold`, `SignByHousehelp`, `ForwardToHousehelp`, `GetDefaultClauses` |
| `auth.HouseholdKidsService` | `CreateHouseholdKid`, `GetHouseholdKid`, `ListHouseholdKids`, `UpdateHouseholdKid`, `DeleteHouseholdKid` |
| `auth.HouseholdMemberService` | All 16 current contract methods |
| `auth.ImageService` | `GetImagesByUser`, `GetImagesByUserID` |
| `auth.KYCService` | `SubmitKYC`, `GetMyKYC`, `GetSmileIDToken` |
| `auth.LocationService` | `CreateLocation`, `GetLocationSuggestions`, `SearchLocations`, `GetLocationByID`, `GetLocationByMapboxID`, `DeleteLocation` |
| `auth.OnboardingOptionsService` | `GetAllOptions`, `GetOnboardingSteps`, `GetSalaryRanges` |
| `auth.PetsService` | `CreatePet`, `GetPetByID`, `ListMyPets`, `UpdatePet`, `DeletePet` |
| `auth.ProfileService` | All 22 methods represented by the website adapter except the locally deprecated bureau lookup |
| `auth.WaitlistService` | `CreateWaitlist`, `GetAllWaitlists`, `GetWaitlistByID` |
| `client_profile.ClientProfileService` | `ListJobTypes`, `GetJobTypeFeatureBundles`, `GetListingFeatureProperties` |
| `profile.ProfileService` | `ListProfiles`, `GetProfileFeatures` |
| `profile.UserProfileService` | `AddPicks`, `ListPicks`, `ReplacePicks` |
| `notifications.NotificationsService` | `StartConversation`, `GetConversation`, `MarkConversationAsRead`, `ListMessages`, `SendMessage`, `EditMessage`, `DeleteMessage`, `ToggleReaction`, `ListReactions`, `ListNotificationsByUser`, `MarkNotificationAsClicked`, `MarkAllNotificationsAsClicked`, `SendEmail` |
| `notifications.BlogService` | All 9 methods used by the website adapter |
| `payments.PaymentsService` | All 27 methods represented by the website adapter |

## Where the auth RPCs were lost

| Commit | Author/date | Effect |
| --- | --- | --- |
| `a0b9354` | Job Owino, 2026-05-23 | “Refactor auth process in a pkg.” Deleted approximately 12,600 lines, including hire request/contract/negotiation, interest, open-for-work, preferences, profile setup, profile views, legacy job, employment, household membership, and their repositories/services. |
| `7402ea3` | Job Owino, 2026-05-25 | Deleted the full profile-view and enhanced-review gRPC handlers while fixing KYC/Smile ID. |
| `65b39b6` in `pkg` | Job Owino, 2026-05-28 | Introduced `ListingService` and removed many old service definitions: `JobService`, `OpenForWorkService`, `ShortlistService`, `InterestService`, preference services, `ProfileSetupService`, and several compatibility surfaces. It retained hire and profile-view contracts even though their auth implementations had already been deleted. |
| `eece4d3` in website | Job Owino, 2026-06-11 | Added silent empty/completed shims for conversations, hire requests, shortlists, interests, and profile progress. |
| `ebe4780` in `pkg` | Sean, 2026-07-28 | Restored the compact compatibility contracts required by the agreed product baseline: profiles, employment, ward locations, pets/kids, household membership, onboarding options, and employment contracts. Bureau and the old table-heavy matching services remained out. |
| Current working tree | 2026-07-29 | Moved remaining live job search/apply/shortlist/application-history calls from deleted `auth.JobService` to `auth.ListingService`. |

## Recoverable legacy sources

Do not cherry-pick these files blindly. Their constructors, repositories,
models, response types, and database tables target the pre-refactor schema.
Use them as behavioural references while implementing against the compact
schema.

| Domain | Best reference |
| --- | --- |
| Hire requests | `a0b9354^:grpc/svc_hire_request.go`, `a0b9354^:internal/domain/service/hire_request_service.go`, and the corresponding repository |
| Hire contracts | `a0b9354^:grpc/svc_hire_contract.go` and `a0b9354^:internal/domain/service/hire_contract_service.go` |
| Hire negotiation | `a0b9354^:grpc/svc_hire_negotiation.go` |
| Interests | `a0b9354^:grpc/svc_interest.go` and `a0b9354^:internal/domain/service/interest_service.go` |
| Open for work | `a0b9354^:grpc/svc_open_for_work.go`; later behaviour also appears in commits `9183b70`, `f5d0d9b`, and `336a604` |
| Profile setup | `a0b9354^:grpc/svc_profile_setup.go`; historical bug fixes include `853b842`, `04ea865`, and `1cb14bc` |
| Profile views | `7402ea3^:grpc/svc_profile_view.go` and the pre-deletion profile-view repository/service |
| Enhanced reviews | `7402ea3^:grpc/svc_review.go`; original feature commit `7a9cfba` |
| Shortlists | Pre-`65b39b6` protobuf plus pre-refactor shortlist service/repository; translate behaviour to `applications` |
| Google signup/auth URL | The legacy domain implementation remains visible in `a0b9354^:internal/domain/service/auth_service.go`; a complete gRPC compatibility handler still needs to be written |
| Bureau link flow | `15d3932:grpc/svc_bureau.go` and its bureau-link service/repositories, for future redesigned bureau work |
| Old complete contract | `65b39b6^:proto/auth/auth.proto` |

## Completed implementation order

- [x] **P0 / WEB-001:** Restore `ListConversations` in the website wrapper. The
  backend already supports it, so this is low-risk and immediately repairs
  inbox history.
- [x] **P0 / RPC-009:** Replace hard-coded profile completion with computed
  catalogue progress. Use one source of truth for profile cards, guards, and
  setup pages.
- [x] **P0 / RPC-002–RPC-003:** Define the application → engagement → optional
  contract compatibility flow and port the hiring screens.
- [x] **P0 / RPC-005–RPC-007:** Consolidate shortlist, interest, and open-for-work
  behaviours onto listings/applications without restoring duplicate tables.
- [x] **P0 / RPC-008:** Move chores and availability controls to profile
  catalogue selections/structured properties.
- [x] **P1 / RPC-011:** Restore enhanced review reads, statistics, helpful
  marks, and responses against the retained review schema.
- [x] **P1 / RPC-001:** Restore Google authentication RPCs.
- [x] **P1 / RPC-004:** Restore compact application negotiations.
- [x] **P2 / RPC-010:** Restore profile-view tracking with compact storage and
  owner-only analytics.
- [x] **Compatibility / RPC-012:** Restore the minimal bureau profile and OTP
  link contract without reviving bureau-managed househelp tables. The larger
  bureau operating model remains a separate redesign.
- [x] Regenerate Go protobuf clients from `integration/pkg`. The existing
  website jspb clients already contained the restored compatibility services
  and were verified by typecheck and production build.

## Verification checklist for each restored track

- [x] RPC exists in the authoritative `integration/pkg` protobuf.
- [x] Generated Go clients are refreshed; existing website jspb clients were
  contract-checked and production-built.
- [x] Auth/notifications/payments registers the service.
- [x] Handler overrides every RPC used by the website; no relied-on method is
  inherited from `Unimplemented...Server`.
- [x] Gateway routes the protobuf package to the correct backend.
- [x] Website wrapper contains no hard-coded empty/success response.
- [x] Unit test verifies service registration and method presence.
- [ ] Integration test exercises the RPC through the gateway.
- [ ] Browser flow verifies success, empty state, validation failure, and
  permission failure.
- [x] The implementation uses the compact canonical tables and does not
  introduce a duplicate legacy table without an explicit schema decision.
