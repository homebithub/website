# Frontend Testing Phase 3 - Plan

## Current Status
- **Phase 1 Complete**: 7 components, 310+ tests ✅
- **Phase 2 Complete**: 8 authentication pages, 232 tests ✅
- **Total**: 542+ tests passing

## Phase 3 Goals
Focus on high-impact, user-facing pages and components that are critical to the core user experience.

## Priority 1: Public Pages (High Traffic)
These pages are the first impression for users and need to be rock solid.

### Landing & Marketing Pages
1. **_index.tsx** - Landing page (homepage)
   - Hero section
   - Features showcase
   - Call-to-action buttons
   - Testimonials
   - Mobile responsive

2. **pricing.tsx** - Pricing page
   - Pricing tiers
   - Feature comparison
   - CTA buttons
   - Mobile responsive

3. **about.tsx** - About page
   - Company information
   - Team section
   - Mission/vision

4. **contact.tsx** - Contact page
   - Contact form
   - Form validation
   - Success/error states

5. **services.tsx** - Services page
   - Service listings
   - Feature descriptions

### Legal Pages (Lower Priority)
- privacy.tsx
- terms.tsx
- cookies.tsx
- terms.hiring.tsx

## Priority 2: Profile Setup Flow (Critical User Journey)
These pages are essential for user onboarding and must work flawlessly.

1. **household-choice.tsx** - Choose household type
   - Selection UI
   - Navigation to next step

2. **profile-setup.household.tsx** - Household onboarding
   - Multi-step form
   - Progress indicator
   - Form validation
   - Image upload

3. **profile-setup.househelp.tsx** - Househelp onboarding
   - Multi-step form
   - Progress indicator
   - Form validation
   - Document upload

## Priority 3: Core Dashboard Pages
Main pages users interact with daily.

### Household Dashboard
1. **household.profile.tsx** - Household profile
   - Profile display
   - Edit functionality
   - Image gallery

2. **household.shortlist.tsx** - Shortlist page
   - List of shortlisted househelps
   - Remove from shortlist
   - Contact actions

3. **household.requests.tsx** - Hire requests
   - Request list
   - Status indicators
   - Actions (accept/reject)

### Househelp Dashboard
1. **househelp.profile.tsx** - Househelp profile
   - Profile display
   - Edit functionality
   - Document management

2. **househelp.hire-requests.tsx** - Hire requests
   - Request list
   - Status indicators
   - Actions (accept/reject)

3. **househelp/find-households.tsx** - Find households
   - Search/filter
   - Results display
   - Show interest action

## Priority 4: Critical UI Components
Components used across multiple pages.

### High-Impact Components
1. **ui/ErrorAlert.tsx** - Error messages
2. **ui/SuccessAlert.tsx** - Success messages
3. **ui/PurpleCard.tsx** - Card component
4. **ui/ThemeToggle.tsx** - Dark mode toggle
5. **ui/ProtectedRoute.tsx** - Route protection

### Form Components (Most Used)
1. **Bio.tsx** - Biography input
2. **Photos.tsx** - Photo upload
3. **Languages.tsx** - Language selection
4. **YearsOfExperience.tsx** - Experience input
5. **SalaryExpectations.tsx** - Salary input

## Priority 5: Subscription & Payment
Critical for business revenue.

1. **subscriptions.tsx** - Subscriptions page
   - Current plan display
   - Upgrade/downgrade options
   - Cancel flow

2. **checkout.tsx** - Checkout page
   - Payment form
   - Validation
   - Success/error handling

3. **subscriptions/ChangePlanModal.tsx** - Change plan
4. **subscriptions/CancelSubscriptionFlow.tsx** - Cancel flow
5. **subscriptions/PauseSubscriptionModal.tsx** - Pause subscription

## Priority 6: Communication
Essential for user engagement.

1. **inbox.tsx** - Messaging inbox
   - Message list
   - Read/unread states
   - Send message

2. **hiring.tsx** - Hiring communication
   - Conversation view
   - Message sending
   - File attachments

## Recommended Testing Order

### Week 1: Public Pages (5 pages, ~150 tests)
- Landing page
- Pricing page
- About page
- Contact page
- Services page

### Week 2: Profile Setup (3 pages, ~120 tests)
- Household choice
- Household onboarding
- Househelp onboarding

### Week 3: Dashboard Pages (6 pages, ~200 tests)
- Household profile
- Household shortlist
- Household requests
- Househelp profile
- Househelp hire requests
- Find households

### Week 4: UI Components (10 components, ~150 tests)
- Alert components
- Card components
- Form components
- Theme toggle
- Protected route

### Week 5: Subscriptions & Payment (5 pages/components, ~100 tests)
- Subscriptions page
- Checkout page
- Change plan modal
- Cancel flow
- Pause modal

### Week 6: Communication (2 pages, ~80 tests)
- Inbox
- Hiring communication

## Success Metrics

### Coverage Goals
- **Public Pages**: 80%+ coverage
- **Profile Setup**: 90%+ coverage (critical flow)
- **Dashboard Pages**: 85%+ coverage
- **UI Components**: 90%+ coverage
- **Subscriptions**: 95%+ coverage (revenue critical)
- **Communication**: 80%+ coverage

### Quality Goals
- 100% test pass rate
- Zero accessibility violations
- All forms properly validated
- All error states handled
- Mobile responsive verified

## Testing Patterns to Apply

From Phase 1 & 2, we've established:
1. ✅ Accessibility-first testing with `getByLabelText()`
2. ✅ Comprehensive test categories (9-11 per page)
3. ✅ Mobile responsiveness testing (3 viewports)
4. ✅ Theme consistency verification
5. ✅ Form validation testing
6. ✅ Loading and error state testing
7. ✅ Edge case coverage

## Next Steps

1. **Start with Priority 1**: Public pages (high visibility, high impact)
2. **Fix bugs as found**: Document and fix immediately
3. **Maintain quality**: 100% pass rate, no skipped tests
4. **Document patterns**: Update guides as new patterns emerge

---

**Status**: READY TO START
**Estimated Duration**: 6 weeks for all priorities
**Expected Total Tests**: Phase 3 could add 800+ tests
**Combined Total**: 1,300+ tests across the application
