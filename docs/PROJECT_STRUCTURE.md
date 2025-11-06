# HomeXpert Project Structure

## Overview

This document describes the reorganized project structure following React Router v7 conventions and best practices for maintainability.

## Routes Structure

The routes are now organized into logical groups using React Router's flat-routes convention:

```
app/routes/
├── _index.tsx                          # Home page (/)
│
├── _auth/                              # Authentication routes (no shared layout)
│   ├── login.tsx                       # /login
│   ├── signup.tsx                      # /signup
│   ├── forgot-password.tsx             # /forgot-password
│   ├── reset-password.tsx              # /reset-password
│   ├── verify-email.tsx                # /verify-email
│   ├── verify-otp.tsx                  # /verify-otp
│   └── change-password.tsx             # /change-password
│
├── profile-setup/                      # Profile setup flows
│   ├── househelp.tsx                   # /profile-setup/househelp
│   └── household.tsx                   # /profile-setup/household
│
├── bureau/                             # Bureau dashboard with nested routes
│   ├── _layout.tsx                     # Shared layout with sidebar (Outlet)
│   ├── home.tsx                        # /bureau/home
│   ├── househelps.tsx                  # /bureau/househelps
│   ├── profile.tsx                     # /bureau/profile
│   └── commercials.tsx                 # /bureau/commercials
│
├── household/                          # Household dashboard
│   ├── _layout.tsx                     # Shared layout with sidebar
│   ├── profile.tsx                     # /household/profile
│   ├── employment.tsx                  # /household/employment
│   └── househelp/
│       ├── profile.tsx                 # /household/househelp/profile
│       └── contact.tsx                 # /household/househelp/contact
│
├── househelp/                          # Househelp dashboard
│   ├── profile.tsx                     # /househelp/profile
│   └── find-households.tsx             # /househelp/find-households
│
├── public/                             # Public pages
│   ├── about.tsx                       # /public/about
│   ├── contact.tsx                     # /public/contact
│   ├── services.tsx                    # /public/services
│   ├── pricing.tsx                     # /public/pricing
│   ├── privacy.tsx                     # /public/privacy
│   ├── terms.tsx                       # /public/terms
│   └── cookies.tsx                     # /public/cookies
│
├── profile.tsx                         # User profile page (/profile)
├── settings.tsx                        # Settings page (/settings)
├── unauthorized.tsx                    # Unauthorized page (/unauthorized)
├── loading-demo.tsx                    # Loading demo page (/loading-demo)
└── google.waitlist.callback.tsx        # Google OAuth callback
```

## Components Structure

Components are organized into logical folders:

```
app/components/
├── index.ts                            # Main exports file for easy imports
│
├── features/                           # Feature-specific components
│   ├── Bio.tsx
│   ├── Budget.tsx
│   ├── BudgetStep.tsx
│   ├── BureauSidebar.tsx
│   ├── Children.tsx
│   ├── Chores.tsx
│   ├── ChoresStep.tsx
│   ├── Dashboard.tsx
│   ├── Gender.tsx
│   ├── HousehelpSignupFlow.tsx
│   ├── HouseholdSidebar.tsx
│   ├── Location.tsx
│   ├── LocationStep.tsx
│   ├── Modal.tsx
│   ├── NanyType.tsx
│   ├── Photos.tsx
│   ├── ProtectedRoute.tsx
│   ├── ShortlistPlaceholderIcon.tsx
│   ├── SignupFlow.tsx
│   ├── Waitlist.tsx
│   ├── household/                      # Household-specific features
│   │   ├── BudgetStep.tsx
│   │   ├── ChildrenStep.tsx
│   │   ├── ChoresStep.tsx
│   │   ├── LocationStep.tsx
│   │   ├── NannyTypeStep.tsx
│   │   ├── RequirementsStep.tsx
│   │   ├── ScheduleStep.tsx
│   │   ├── index.ts
│   │   └── househelp/                  # Househelp profile components
│   │       ├── EducationHealthEditSection.tsx
│   │       ├── EducationHealthSection.tsx
│   │       ├── EmploymentSalaryEditSection.tsx
│   │       ├── EmploymentSalarySection.tsx
│   │       ├── ExpandedImageModal.tsx
│   │       ├── FamilyContactsEditSection.tsx
│   │       ├── FamilyContactsSection.tsx
│   │       ├── ImageLightbox.tsx
│   │       ├── ImageUploadModal.tsx
│   │       ├── PersonalDetailsEditSection.tsx
│   │       ├── PersonalDetailsSection.tsx
│   │       ├── ProfileOverviewSection.tsx
│   │       ├── ReadOnlyUserImageCarousel.tsx
│   │       ├── UserImageCarousel.tsx
│   │       └── index.ts
│   └── profile/                        # Profile-related components
│       ├── Bio.tsx
│       ├── Certifications.tsx
│       ├── EmergencyContact.tsx
│       ├── Languages.tsx
│       ├── Photos.tsx
│       └── index.ts
│
├── modals/                             # Modal components
│   ├── Certifications.tsx
│   ├── ChildModal.tsx
│   ├── Children.tsx
│   ├── Chores.tsx
│   ├── EmergencyContact.tsx
│   ├── ExpandedImageModal.tsx
│   ├── ExpectingModal.tsx
│   ├── Gender.tsx
│   ├── HouseSize.tsx
│   ├── HouseholdProfileModal.tsx
│   ├── ImageUploadModal.tsx
│   ├── Kids.tsx
│   ├── Languages.tsx
│   ├── Modal.tsx
│   ├── MyKids.tsx
│   ├── NannyTypeStep.tsx
│   ├── NanyType.tsx
│   ├── Pets.tsx
│   ├── Religion.tsx
│   ├── RequirementsStep.tsx
│   ├── SalaryExpectations.tsx
│   ├── ScheduleStep.tsx
│   ├── WorkWithKids.tsx
│   ├── WorkWithPets.tsx
│   ├── YearsOfExperience.tsx
│   └── index.ts
│
├── layout/                             # Layout components
│   ├── Footer.tsx
│   └── Navigation.tsx
│
├── ui/                                 # Reusable UI components
│   ├── HousehelpsTable.tsx
│   ├── ProfileCard.tsx
│   ├── SearchFilters.tsx
│   ├── ShortlistCard.tsx
│   ├── ShortlistModal.tsx
│   ├── ShortlistsTable.tsx
│   ├── StatCard.tsx
│   ├── Table.tsx
│   └── index.ts
│
├── forms/                              # Form components
│   ├── FormField.tsx
│   ├── index.ts
│   └── validation.ts
│
├── househelp/                          # Househelp-specific components (legacy)
│   ├── EducationHealthEditSection.tsx
│   ├── EducationHealthSection.tsx
│   ├── EmploymentSalaryEditSection.tsx
│   ├── EmploymentSalarySection.tsx
│   ├── ExpandedImageModal.tsx
│   ├── FamilyContactsEditSection.tsx
│   ├── FamilyContactsSection.tsx
│   ├── ImageLightbox.tsx
│   ├── ImageUploadModal.tsx
│   ├── PersonalDetailsEditSection.tsx
│   ├── PersonalDetailsSection.tsx
│   ├── ProfileOverviewSection.tsx
│   ├── ReadOnlyUserImageCarousel.tsx
│   └── UserImageCarousel.tsx
│
├── Bio.tsx                             # Re-export from features/Bio
├── Budget.tsx                          # Re-export from features/Budget
├── BureauSidebar.tsx                   # Re-export from features/BureauSidebar
├── Certifications.tsx
├── Children.tsx
├── Chores.tsx
├── EmergencyContact.tsx
├── Error.tsx                           # Error component
├── ExpectingModal.tsx
├── Footer.tsx                          # Re-export from layout/Footer
├── Gender.tsx
├── HousehelpSignupFlow.tsx
├── HouseholdProfileModal.tsx
├── HouseholdSidebar.tsx                # Re-export from features/HouseholdSidebar
├── HouseSize.tsx
├── Kids.tsx
├── Languages.tsx
├── Loading.tsx                         # Loading component with variants
├── Location.tsx
├── Modal.tsx
├── MyKids.tsx
├── NanyType.tsx
├── Navigation.tsx
├── Pets.tsx
├── Photos.tsx
├── ProtectedRoute.tsx
├── Religion.tsx
├── SalaryExpectations.tsx
├── ShortlistPlaceholderIcon.tsx
├── Waitlist.tsx
├── WorkWithKids.tsx
├── WorkWithPets.tsx
└── YearsOfExperience.tsx
```

## Key Conventions

### Route Naming

1. **Underscore prefix (`_`)**: Creates a layout route without adding to the URL
   - `_layout.tsx` - Shared layout for nested routes
   - `_auth/` - Route group without affecting URL structure

2. **Dot notation (legacy)**: Converted to folder structure
   - `bureau.home.tsx` → `bureau/home.tsx`
   - `household.househelp.profile.tsx` → `household/househelp/profile.tsx`

3. **Index routes**: `_index.tsx` represents the root path of its folder

### Component Organization

1. **Re-exports**: Root-level component files are re-exports for backward compatibility
2. **Features**: Domain-specific components grouped by feature
3. **Modals**: All modal/dialog components in one place
4. **UI**: Reusable, generic UI components
5. **Layout**: Navigation, Footer, and other layout components

## Import Patterns

### Recommended Imports

```typescript
// From components index
import { Navigation, Footer, Loading, Error } from '~/components';

// From specific folders
import { BureauSidebar } from '~/components/features/BureauSidebar';
import { HouseholdProfileModal } from '~/components/modals/HouseholdProfileModal';

// From React Router
import { useNavigate, useLocation, Outlet, Link } from 'react-router';
```

### Path Aliases

- `~/` - Points to `app/` directory (configured in tsconfig.json)

## Configuration Files

### `app/routes.ts`
Defines route configuration using flat-routes convention:
```typescript
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes() satisfies RouteConfig;
```

### `react-router.config.ts`
React Router configuration:
```typescript
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
} satisfies Config;
```

### `vite.config.ts`
Vite configuration with React Router plugin and path resolution:
```typescript
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
  // ... build config
});
```

## Benefits of New Structure

1. **Better Organization**: Routes and components are grouped by feature/domain
2. **Easier Navigation**: Clear hierarchy makes it easy to find related files
3. **Scalability**: Easy to add new features without cluttering root folders
4. **Maintainability**: Related code is co-located
5. **Type Safety**: React Router v7 generates types for each route
6. **Convention Over Configuration**: Follows React Router best practices

## Migration Notes

### Removed Routes

The following individual step routes were removed as they were just thin wrappers:
- `bio.tsx`, `budget.tsx`, `certifications.tsx`, `children.tsx`, `chores.tsx`
- `emergency-contact.tsx`, `experience.tsx`, `gender.tsx`, `health.tsx`
- `house-size.tsx`, `househelps.types.tsx`, `languages.tsx`, `location.tsx`
- `my-kids.tsx`, `pets.tsx`, `photos.tsx`, `salary-expectations.tsx`
- `work-with-kids.tsx`, `work-with-pets.tsx`

These components are now imported directly in the profile setup flows.

### Layout Routes

Dashboard layouts now use `_layout.tsx` convention:
- `bureau.tsx` → `bureau/_layout.tsx`
- `household.tsx` → `household/_layout.tsx`

## Development Workflow

### Adding a New Route

1. Create file in appropriate folder: `app/routes/[folder]/[name].tsx`
2. Export default component
3. React Router automatically picks it up (no config needed)

### Adding a New Component

1. Create component in appropriate folder
2. Add export to folder's `index.ts` if needed
3. Import using path alias: `import { Component } from '~/components/[folder]'`

### Running the Application

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Type checking
npm run typecheck
```

## Next Steps

1. **Clean up duplicate components**: Remove or consolidate duplicate component files
2. **Add route-level code splitting**: Implement lazy loading for large routes
3. **Improve type safety**: Leverage React Router v7's generated types
4. **Add tests**: Organize tests alongside components
5. **Documentation**: Add JSDoc comments to complex components

## Resources

- [React Router v7 Documentation](https://reactrouter.com)
- [File Route Conventions](https://reactrouter.com/how-to/file-route-conventions)
- [Flat Routes](https://github.com/kiliman/remix-flat-routes)
