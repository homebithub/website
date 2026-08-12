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
    expect(css).toContain('overflow-x: hidden');
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
    expect(source('app/components/ui/BaseModal.tsx')).toContain('useBodyScrollLock(isOpen)');
    expect(confirmation).toContain('useBodyScrollLock(isOpen)');
    expect(confirmation).toContain('createPortal(');
    expect(confirmation).toContain('document.body');
  });

  it('keeps the mobile inbox inside the dynamic viewport', () => {
    const inbox = source('app/routes/inbox.tsx');
    expect(inbox).toContain('h-[100dvh]');
    expect(inbox).toContain('overflow-x-hidden overflow-y-auto');
    expect(inbox).toContain('min-w-0 max-h-[150px] flex-1');
    expect(inbox).toContain('text-[16px]');
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
    expect(navigation).toContain('h-[56px] shrink-0 sm:h-[60px]');
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
    expect(button).toContain('Remove Open for Work');
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
    expect(home).toContain('<OpenForWorkButton className="hidden shrink-0 sm:flex"');
    expect(home).toContain('mb-3 min-w-0 max-w-full sm:hidden');
    expect(button).toContain('max-w-full flex flex-col gap-2');
  });

  it('keeps the jobs feed focused on unapplied opportunities with one save action', () => {
    const home = source('app/components/HousehelpJobsHome.tsx');
    const navigation = source('app/components/Navigation.tsx');
    expect(home).toContain('!appliedJobIds.has(jobKey(job)) && !job.has_applied');
    expect(home).not.toContain('<Heart');
    expect(navigation).toContain("item.name === 'Saved' && renderBadge(savedCount)");
  });
});
