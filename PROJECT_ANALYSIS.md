# PROJECT_ANALYSIS.md

## CURRENT TECH STACK

### Framework and Version
- **Framework:** [Remix](https://remix.run/) (core packages: `@remix-run/react`, `@remix-run/node`, `@remix-run/express`, etc.)
- **Version:** ^2.6.0 (from `package.json`)
- **Language:** TypeScript (`.ts`, `.tsx` files throughout codebase)

### Styling Solution
- **Primary:** Tailwind CSS (`tailwindcss` ^3.4.17, see `tailwind.config.ts`)
- **Custom Styles:** Additional CSS files (e.g., `app/app.css`, `app/tailwind.css`, `app/styles/glow-card.css`)
- **Typography Plugin:** `@tailwindcss/typography`

### UI Libraries Used
- **@headlessui/react** (UI primitives)
- **@heroicons/react** (icon set)
- **lucide-react** (icon set)
- **react-icons** (icon set)
- **framer-motion** (animation)
- **canvas-confetti** (animation)
- **@tinymce/tinymce-react** (rich text editor)
- **chart.js**, **react-chartjs-2**, **chartjs-plugin-datalabels** (charts)
- **react-dropzone** (file uploads)
- **qrcode.react** (QR code generation)

### State Management
- **React Context:** Used (see `app/contexts/AuthContext.tsx`)
- **React Local State:** Extensive use of `useState`, `useEffect` throughout components
- **No Redux, Recoil, Zustand, or MobX detected**

### Routing Solution
- **Remix Routing:** File-based routing (see `/app/routes` directory)
- **@remix-run/react:** Used for navigation and route hooks
- **remix-flat-routes:** Present in dev dependencies but not actively configured in `remix.config.js`

### Build Tools
- **Vite:** (see `vite.config.ts`) as the build tool/bundler
- **Remix:** (`remix build`, `remix dev` scripts)
- **TypeScript:** (`typescript` ^5.8.3)
- **PostCSS:** (`postcss`, `postcss-cli`)
- **ESLint:** (`eslint` and plugins)
- **Docker:** (multi-stage Dockerfile for build and production)

### Dependencies Analysis
#### Key Production Dependencies
- **React**: ^18.2.0
- **Remix**: ^2.6.0+ (multiple packages)
- **Express**: ^4.21.2
- **Tailwind CSS**: ^3.4.17
- **UI/UX**: @headlessui/react, @heroicons/react, lucide-react, framer-motion, react-icons
- **Charts**: chart.js, react-chartjs-2, chartjs-plugin-datalabels
- **Rich Text**: @tinymce/tinymce-react
- **Validation**: joi
- **Other**: axios, lodash.debounce, dompurify, socket.io-client, sharp, moment-timezone

#### Key Dev Dependencies
- **@remix-run/dev**: ^2.6.0
- **TypeScript**: ^5.8.3
- **ESLint**: ^8.38.0 (+ plugins)
- **Tailwind Plugins**: @tailwindcss/typography
- **PostCSS**: ^8.5.3
- **remix-flat-routes**: ^0.8.5
- **Autoprefixer**: ^10.4.21

#### Node Version
- **Node.js >=18.0.0** (see `engines` in package.json)

---

## SUMMARY
- **Modern React/Remix app with Vite bundler and TypeScript.**
- **Tailwind CSS** is the primary styling solution, with custom themes and plugins.
- **UI** is built with HeadlessUI, Heroicons, Lucide, Framer Motion, and other modern libraries.
- **State** is managed with React Context and local state; no third-party global state library.
- **Routing** is handled by Remix's file-based approach.
- **Build pipeline** uses Vite, Remix, Docker, and PostCSS.
- **Dependencies** are up-to-date and focused on modern frontend engineering best practices.

This analysis provides a neutral, factual baseline for future technical planning or architectural changes.

## COMPONENT INVENTORY

### Features Components
- **Files:**  
  - `features/Bio.tsx`
  - `features/Budget.tsx`
  - `features/BudgetStep.tsx`
  - `features/BureauSidebar.tsx`
  - `features/ChoresStep.tsx`
  - `features/Dashboard.tsx`
  - `features/HousehelpSignupFlow.tsx`
  - `features/HouseholdSidebar.tsx`
  - `features/Location.tsx`
  - `features/LocationStep.tsx`
  - `features/Modal.tsx`
  - `features/NanyType.tsx`
  - `features/Photos.tsx`
  - `features/ProtectedRoute.tsx`
  - `features/ShortlistPlaceholderIcon.tsx`
  - `features/SignupFlow.tsx`
  - `features/Waitlist.tsx`
- **Types:**  
  - Mostly UI, Form, and Page logic components.
  - Sidebar and Modal are likely reusable, others may be flow-specific.
- **Patterns:**  
  - Naming is consistent; "Step" and "Flow" indicate multi-step forms or wizards.
  - "Sidebar", "Modal", and "ProtectedRoute" suggest reusable layout/utilities.

### Layout Components
- **Files:**  
  - `layout/Footer.tsx`
  - `layout/Navigation.tsx`
- **Types:**  
  - Layout (site-wide navigation/footer).
- **Patterns:**  
  - Standard for site-wide layout, likely reusable.

### Modals Components
- **Files:**  
  - Includes: `modals/Certifications.tsx`, `modals/ChildModal.tsx`, `modals/Children.tsx`, `modals/Chores.tsx`, `modals/EmergencyContact.tsx`, `modals/ExpandedImageModal.tsx`, `modals/ExpectingModal.tsx`, `modals/Gender.tsx`, `modals/HouseSize.tsx`, `modals/HouseholdProfileModal.tsx`, `modals/ImageUploadModal.tsx`, `modals/Kids.tsx`, `modals/Languages.tsx`, `modals/Modal.tsx`, `modals/MyKids.tsx`, `modals/NannyTypeStep.tsx`, `modals/NanyType.tsx`, `modals/Pets.tsx`, `modals/Religion.tsx`, `modals/RequirementsStep.tsx`, `modals/SalaryExpectations.tsx`, `modals/ScheduleStep.tsx`, `modals/WorkWithKids.tsx`, `modals/WorkWithPets.tsx`, `modals/YearsOfExperience.tsx`
- **Types:**  
  - Modal/dialog UI, Form steps, and selection popups.
- **Patterns:**  
  - Consistent naming for modal and step-based forms.
  - Likely a mix of reusable (e.g., `Modal.tsx`, `ImageUploadModal.tsx`) and one-time (e.g., `ChildModal.tsx`) components.

### UI Components
- **Files:**  
  - `ui/AnimatedStatCard.tsx`
  - `ui/Error.tsx`
  - `ui/HousehelpsTable.tsx`
  - `ui/Loading.tsx`
  - `ui/OfferCard.tsx`
  - `ui/ProtectedRoute.tsx`
  - `ui/ShortlistPlaceholderIcon.tsx`
- **Types:**  
  - UI widgets, error/loading states, data tables, cards.
- **Patterns:**  
  - These are generally reusable, atomic UI elements.

---

#### Reusability & Consistency
- **Reusable Components:**  
  - Layout (`Footer`, `Navigation`), UI (`Loading`, `Error`, `OfferCard`, `AnimatedStatCard`, `HousehelpsTable`), modal base (`Modal.tsx`), and utility (`ProtectedRoute.tsx`, `ShortlistPlaceholderIcon.tsx`).
- **One-Time Components:**  
  - Step-specific forms, flow controllers, or domain-specific modals (e.g., `HousehelpSignupFlow.tsx`, `ChoresStep.tsx`, `SalaryExpectations.tsx`).
- **Patterns Observed:**  
  - Consistent folder-based organization: features, layout, modals, ui.
  - Naming conventions are clear and descriptive.
  - Step-based and modal-based forms are common, suggesting a wizard-driven UX.

---

#### Summary
- The codebase is organized by function (features, modals, layout, ui).
- There is a clear separation between reusable UI/layout and flow-specific logic.
- Naming and file structure are consistent, which will help future refactoring.

---

### Component Variants
- **Button:**
  - `.btn-primary`: Solid purple, white text, rounded, shadow, hover/dark mode.
  - `.btn-secondary`: White background, purple text, border, hover/focus.
- **Input:**
  - `.input-primary`: Rounded, border, shadow, focus ring.
- **Card:**
  - `.card`, `.glow-card`, `.offer-glow-card`: White/dark backgrounds, rounded, shadow, animated glow.
- **Other:**
  - `link`, `responsive-button`, sidebar, and container variants for layout/navigation.

---

## DESIGN SYSTEM ANALYSIS

### Color Scheme
- **Primary:**
  - Purple shades: 50–900 (`#faf5ff` to `#581c87`)
  - Accent: `#ede9fe`, Text: `#18181b`, White: `#ffffff`, Gray: 50–900
- **CSS/Custom Colors:**
  - Button: `#3992ff`, Card: `#111827`, Link: `#8a5fa6`/`#6d4887`, Border: `#a020f0`, Gold: `#eeb004`, Red: `#f44250`

### Typography Usage
- **Font Families:**
  - Tailwind: `Inter`, `ui-sans-serif`, `system-ui`
  - CSS fallback: `-apple-system, BlinkMacSystemFont, ...`
  - Code: `source-code-pro, Menlo, ...`
- **Font Sizes/Weights:**
  - Tailwind: `text-lg`, `text-sm`, `font-bold`, `font-medium`, etc.
  - Headings: `font-bold`, Body: `font-normal`
- **Other:**
  - Antialiasing and smoothing enabled for body text.

### Spacing and Layout Patterns
- **Spacing:**
  - Tailwind spacing utilities: `py-8`, `mt-16`, `px-4`, `mb-4`, `gap-1`, etc.
  - Consistent padding/margin for sections, cards, containers.
- **Layout:**
  - Flexbox: `flex`, `flex-col`, `items-center`, `justify-between`
  - Grid/container: `container`, `mx-auto`
  - Responsive: `md:flex-row`, `sm:gap-2`, etc.
- **Border/Radius/Shadow:**
  - Rounded: `rounded-lg`, `rounded-xl`, `border-radius: 1rem`
  - Shadows: `shadow-card`, `shadow-sm`, `hover:shadow-md`
  - Borders: subtle, purple or gray.


---

