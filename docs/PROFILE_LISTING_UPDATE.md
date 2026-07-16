# Tasks To Be Undertaken

- [ ] Task 1: Go through the relevant files and showcase the endpoints to call for the user profile flow, including the user profile endpoint.
- [ ] Task 2: Update profile to show % from user profile. Automatically, user awarded 50 % if status is "ACTIVE"
- [ ] Task 3: If % is not 100, Showcase Complete profile. Profile changes to 100% once a user profile status is "VERIFIED"
- [ ] Task 4: Listing provided by the user profile should have a button to apply "Apply Now" for user profile with profile type ServiceProvider
- [ ] Task 5: Once they click appy it should show in the necessary tabs.

## User Profile And Listing Calls

| Area | Page | Source File | Web Endpoint | Backend/gRPC Call | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| User profile | `/profile` | `app/routes/profile.tsx` | None | `/profile.ProfileService/GetProfileFeatures`, `/profile.UserProfileService/ListPicks` | Shows selected profile features/picks for the current user profile. |
| Own household profile | `/household/profile` | `app/routes/household.profile.tsx` | None | `ProfileService.getCurrentHouseholdProfile` | Shows the signed-in household profile. |
| Own househelp profile | `/househelp/profile` | `app/routes/househelp.profile.tsx` | None | `ProfileService.getCurrentHousehelpProfile` | Shows the signed-in househelp profile. |
| Public household profile | `/household/public-profile?userId=<user_id>` | `app/routes/household.public-profile.tsx` | None | `ProfileService.getHouseholdByUserID` | Shows a household profile by user ID. |
| Public household profile | `/household/public-profile?profileId=<profile_id>` | `app/routes/household.public-profile.tsx` | None | `ProfileService.searchHouseholds` | Shows a household profile by profile ID fallback. |
| Public househelp profile | `/househelp/public-profile?profileId=<profile_id>` | `app/routes/househelp.public-profile.tsx` | None | `ProfileService.getHousehelpByID` | Shows a househelp profile by profile ID. |
| Profile photos | Profile pages | `app/routes/household.public-profile.tsx`, `app/routes/househelp.public-profile.tsx` | None | `DocumentService.getUserDocuments` | Loads profile photos for the displayed user. |
| Profile list/catalog | API route | `app/routes/api.profiles.ts` | `GET /api/profiles` | `/profile.ProfileService/ListProfiles` | Lists profile categories/options. |
| Household job listings | `/household/hiring?tab=jobs` | `app/routes/household/hiring-history.tsx` | `GET /api/job-listings?limit=<n>&offset=<n>&user_profile_id=<id>` | `/auth.ListingService/ListJobs` | Lists job postings created by the household. |
| Househelp job listings | `/househelp/hiring?tab=job-listings` | `app/routes/househelp/hiring-history.tsx` | `GET /api/job-listings?limit=<n>&offset=<n>` | `/auth.ListingService/ListJobs` | Lists available household job postings for househelps. |
| Single job listing | Listing detail usage | `app/services/grpc/authServices.ts` | `GET /api/job-listings?id=<listing_id>&hydrate=get` | `/auth.ListingService/GetJobListing` | Fetches one listing and hydrates details. |
| Create listing | Household hiring page | `app/routes/api.job-listings.ts` | `POST /api/job-listings` | `/auth.ListingService/CreateListing` | Creates a household job listing. |
| Update listing | Household hiring page | `app/routes/api.job-listings.ts` | `PATCH /api/job-listings` | `/auth.ListingService/UpdateJob` | Updates a household job listing title/description. |
| Close/reopen/delete listing | Household hiring page | `app/routes/api.job-listings.ts` | `DELETE /api/job-listings` | `/auth.ListingService/CloseListing`, `/auth.ListingService/ReopenListing`, `/auth.ListingService/DeleteJob` | Changes listing status or deletes a listing. |
| Listing feature details | Listing tables/cards | `app/routes/api.job-listings.ts` | Included in `GET /api/job-listings` response | `/client_profile.ClientProfileService/GetListingFeatureProperties`, `/client_profile.ClientProfileService/GetJobTypeFeatureBundles` | Enriches listings with feature groups shown in the UI. |
| Open-for-work listing | `/househelp/public-profile` and `/household/shortlist` | `app/routes/househelp.public-profile.tsx`, `app/routes/household.shortlist.tsx` | None | `OpenForWorkService.getOpenForWorkByHousehelp`, `OpenForWorkService.getOpenForWork` | Finds the househelp open-for-work listing used for shortlist/profile actions. |
