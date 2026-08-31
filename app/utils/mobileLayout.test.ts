import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('mobile layout guardrails', () => {
  it('keeps the document within the device viewport', () => {
    const css = source('app/tailwind.css');
    const root = source('app/root.tsx');
    expect(root).toContain('width=device-width, initial-scale=1');
    expect(css).toContain('-webkit-text-size-adjust: 100%');
    expect(css).toContain('overflow-x: clip');
  });

  it('prevents iOS from zooming when a mobile form control receives focus', () => {
    const css = source('app/tailwind.css');
    const root = source('app/root.tsx');
    expect(css).toContain("input:not([type='checkbox'])");
    expect(css).toContain("[contenteditable='true']");
    expect(css).toContain('gmp-place-autocomplete');
    expect(css).toContain('font-size: 16px !important');
    expect(css).toContain('textarea.hb-chat-composer {\n    font-size: 16px !important;');
    expect(root).not.toContain('user-scalable=no');
    expect(root).not.toContain('maximum-scale=1');
  });

  it('offers a discoverable PWA installation path on mobile browsers', () => {
    const prompt = source('app/components/PWAInstallPrompt.tsx');
    const root = source('app/root.tsx');
    const navigation = source('app/components/Navigation.tsx');
    expect(prompt).toContain("window.addEventListener('beforeinstallprompt'");
    expect(prompt).toContain("window.matchMedia('(display-mode: standalone)')");
    expect(prompt).toContain('Add to Home Screen');
    expect(prompt).toContain('Safari is required on iPhone and iPad');
    expect(prompt).toContain('Copy HomeBit link');
    expect(prompt).toContain('Chrome, Firefox, Edge, and other iOS browsers cannot install HomeBit');
    expect(prompt).toContain('DISMISSAL_COOLDOWN_MS');
    expect(prompt).toContain('pageViews >= 2 || isAppleMobileDevice()');
    expect(root).toContain('<PWAInstallPrompt />');
    expect(navigation).toContain('<PWAInstallMenuButton />');
  });

  it('bridges the installed PWA launch into the first interactive paint', () => {
    const root = source('app/root.tsx');
    const launch = source('app/components/AppLaunchScreen.tsx');
    const css = source('app/tailwind.css');
    expect(root).toContain('apple-touch-startup-image');
    expect(root).toContain('<AppLaunchScreen />');
    expect(launch).toContain("window.matchMedia('(display-mode: standalone)')");
    expect(launch).toContain('useState(false)');
    expect(css).toContain('@media (display-mode: standalone)');
    expect(css).toContain('.hb-launch-screen--leaving');
    expect(launch).toContain('setLeaving(true), 1200');
  });

  it('keeps admin access in the account menu and supports installed-admin handoff', () => {
    const navigation = source('app/components/Navigation.tsx');
    const mobileNavigation = source('app/components/MobileBottomNavigation.tsx');
    const launcher = source('app/utils/adminDashboard.ts');
    const manifest = source('public/manifest.webmanifest');
    expect(navigation).toContain('onClick={handleAdminDashboard}');
    expect(navigation).toContain('Admin Dashboard');
    expect(navigation).toContain('my-2 border-t border-gray-200');
    expect(mobileNavigation).toContain('onOpenAdminDashboard');
    expect(launcher).toContain('getInstalledRelatedApps');
    expect(launcher).toContain('window.location.assign(url)');
    expect(manifest).toContain('preprod-hba.homebit.co.ke/manifest.webmanifest');
  });

  it('lets the resolved client session override stale homepage cookies', () => {
    const home = source('app/routes/_index.tsx');
    expect(home).toContain('authLoading ? loaderAuth : Boolean(user)');
    expect(home).toContain('authLoading ? loaderUserType : null');
  });

  it('renders shared dialogs as bottom sheets on phones', () => {
    expect(source('app/components/ui/BaseModal.tsx')).toContain('rounded-t-2xl sm:rounded-2xl');
    expect(source('app/components/Modal.tsx')).toContain('rounded-t-3xl');
    expect(source('app/components/modals/OpenForWorkModal.tsx')).toContain('hb-modal-shell');
  });

  it('locks background scrolling while modal surfaces are open', () => {
    const lock = source('app/hooks/useBodyScrollLock.ts');
    const confirmation = source('app/components/ui/ConfirmDialog.tsx');
    expect(lock).toContain("document.body.style.position = 'fixed'");
    expect(lock).toContain('lockCount += 1');
    expect(source('app/components/ProfileViewsAnalytics.tsx')).toContain('useBodyScrollLock(isOpen)');
    // Headless UI Dialog already owns the document scroll lock. A second
    // global lock can leave html/body stuck at overflow:hidden after close.
    expect(source('app/components/ui/BaseModal.tsx')).not.toContain('useBodyScrollLock');
    expect(confirmation).toContain('useBodyScrollLock(isOpen)');
    expect(confirmation).toContain('createPortal(');
    expect(confirmation).toContain('document.body');
  });

  it('keeps the mobile inbox inside the dynamic viewport', () => {
    const inbox = source('app/routes/inbox.tsx');
    expect(inbox).toContain('hb-inbox-viewport');
    expect(inbox).toContain('overflow-x-hidden overflow-y-auto');
    expect(inbox).toContain('min-w-0 max-h-[150px] flex-1');
    expect(inbox).toContain('hb-chat-composer');
    expect(inbox).toContain("mine ? 'mr-9 lg:mr-0' : 'ml-9 lg:ml-0'");
    expect(inbox).toContain("'-right-9 lg:-right-2'");
  });

  it('uses one compact rail for navigation and discovery controls', () => {
    const css = source('app/tailwind.css');
    const navigation = source('app/components/Navigation.tsx');
    const househelpHome = source('app/components/HousehelpJobsHome.tsx');
    const householdHome = source('app/components/HouseholdJobsHome.tsx');
    expect(css).toContain('.hb-content-rail');
    expect(css).toContain('font-size: 14px');
    expect(navigation).toContain('hb-content-rail');
    expect(navigation).toContain('border-b border-primary-200/60');
    expect(househelpHome).toContain('hb-filter-panel');
    expect(householdHome).toContain('hb-filter-panel');
    expect(househelpHome).toContain('hb-content-rail flex flex-col');
    expect(householdHome).toContain('hb-content-rail flex flex-col');
  });

  it('keeps shared navigation available while every page scrolls', () => {
    const navigation = source('app/components/Navigation.tsx');
    expect(navigation).toContain('fixed inset-x-0 top-0 z-40');
    expect(navigation).toContain('min-h-[56px]');
    expect(navigation).toContain('sm:min-h-[60px]');
  });

  it('uses a role-aware bottom bar instead of a mobile hamburger', () => {
    const navigation = source('app/components/Navigation.tsx');
    const bottom = source('app/components/MobileBottomNavigation.tsx');
    expect(navigation).toContain('<MobileBottomNavigation');
    expect(navigation).toContain('<Menu as="div" className="hidden text-left">');
    expect(bottom).toContain("{ name: 'Services', href: '/services'");
    expect(bottom).toContain("item.name !== 'Blog'");
    expect(bottom).toContain('PWAInstallMenuButton');
    expect(bottom).toContain('Help & support');
  });

  it('keeps discovery filters open while choosing from portalled selects', () => {
    const customSelect = source('app/components/ui/CustomSelect.tsx');
    const househelpHome = source('app/components/HousehelpJobsHome.tsx');
    const householdHome = source('app/components/HouseholdJobsHome.tsx');
    expect(customSelect).toContain('data-custom-select-panel="true"');
    expect(househelpHome).toContain('insideSelectMenu');
    expect(householdHome).toContain('insideSelectMenu');
    expect(househelpHome).toContain("'filters'} applied`");
    expect(householdHome).toContain("'filters'} applied`");
  });

  it('gives mobile discovery filters an independent scrollport above the bottom bar', () => {
    const css = source('app/tailwind.css');
    const savedFilters = source('app/components/SavedFilterBar.tsx');
    const householdHome = source('app/components/HouseholdJobsHome.tsx');
    const househelpHome = source('app/components/HousehelpJobsHome.tsx');
    const navigation = source('app/components/Navigation.tsx');
    expect(css).toContain('touch-action: pan-y');
    expect(householdHome).toContain('<SidePanel');
    expect(househelpHome).toContain('<SidePanel');
    expect(householdHome).toContain('title="Filters"');
    expect(househelpHome).toContain('title="Filters"');
    expect(savedFilters).toContain('min-w-0 w-full');
    expect(navigation).toContain('lg:ml-3 lg:inline-flex');
    expect(navigation).toContain('left-[41%]');
  });

  it('shares the mobile contract action row between both actions', () => {
    const contract = source('app/routes/household/employment-contract.tsx');
    expect(contract).toContain('grid w-full grid-cols-2 gap-3 sm:flex');
    expect(contract).toContain('Preparing PDF…');
    expect(contract).toContain('Email Contract');
  });

  it('manages one open-for-work listing from househelp hiring', () => {
    const button = source('app/components/OpenForWorkButton.tsx');
    const hiring = source('app/routes/househelp/hiring-history.tsx');
    expect(button).toContain('readOnly={Boolean(listing) && !editing}');
    expect(button).toContain('onEdit={() => setEditing(true)}');
    expect(button).toContain('resolveListingId(listing)');
    expect(source('app/components/modals/OpenForWorkModal.tsx')).toContain('if (!id) throw new Error');
    expect(button).toContain('Turn Open for Work off?');
    expect(button).toContain('status: live ? "active" : "paused"');
    expect(button).toContain('saved listing details, profile, and applications stay intact');
    expect(button).toContain('daysRemaining');
    expect(hiring).toContain('<OpenForWorkButton showStatus');
  });

  it('constrains every open-for-work control to the mobile sheet', () => {
    const modal = source('app/components/modals/OpenForWorkModal.tsx');
    expect(modal).toContain('w-screen max-w-[100vw] overflow-x-hidden');
    expect(modal).toContain('hb-modal-panel min-w-0 overflow-x-hidden');
    expect(modal).toContain('grid min-w-0 grid-cols-2');
    expect(modal.match(/min-w-0 max-w-full w-full/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it('keeps homepage availability actions out of the mobile filter toolbar', () => {
    const home = source('app/components/HousehelpJobsHome.tsx');
    const button = source('app/components/OpenForWorkButton.tsx');
    expect(home).toMatch(/<OpenForWorkButton[^>]*className="hidden shrink-0 sm:flex"/);
    expect(home).toContain('mb-3 min-w-0 max-w-full sm:hidden');
    expect(button).toContain('max-w-full flex flex-col gap-2');
  });

  it('opens role listing modals directly from homepage setup actions', () => {
    const readiness = source('app/components/marketplace/MarketplaceReadiness.tsx');
    const householdHome = source('app/components/HouseholdJobsHome.tsx');
    const househelpHome = source('app/components/HousehelpJobsHome.tsx');
    const openForWork = source('app/components/OpenForWorkButton.tsx');
    expect(readiness).toContain('stepId === "listing" && onListingAction');
    expect(householdHome).toContain('onListingAction={() => setCreatingHouseholdJob(true)}');
    expect(householdHome).toContain('aria-label="Create a job listing"');
    expect(householdHome).toContain('isOpen={creatingHouseholdJob || Boolean(editingHouseholdJob)}');
    expect(househelpHome).toContain('onListingAction={() => openForWorkButtonRef.current?.open()}');
    expect(openForWork).toContain('useImperativeHandle(ref, () => ({ open: requestModal })');
  });

  it('keeps interacted jobs visible with statuses and one save action', () => {
    const home = source('app/components/HousehelpJobsHome.tsx');
    const navigation = source('app/components/Navigation.tsx');
    expect(home).toContain('matchesInteractionFilters(filters');
    expect(home).toContain('You applied for this job');
    expect(home).toContain('You two are in contact');
    expect(home).toContain('!hasApplied && (');
    expect(home).not.toContain('<Heart');
    expect(navigation).toContain("item.name === 'Saved' && renderBadge(savedCount)");
  });
});
