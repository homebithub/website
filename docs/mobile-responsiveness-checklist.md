# Mobile responsiveness checklist

Inventory commands:

```sh
rg --files app/routes | sort
rg -l "fixed inset-0" app/components app/routes --glob '*.tsx' | sort
rg -n "min-w-|w-\[[0-9]+px\]|whitespace-nowrap|overflow-x" app --glob '*.tsx'
```

Test widths: 320px, 360px, 390px, 430px, then 768px and desktop. Test both light and dark themes, browser text at 100% and 200%, and the on-screen keyboard where a form or composer exists.

## Global layout

- [x] Viewport uses device width.
- [x] Root elements cannot create document-level horizontal scrolling.
- [x] iOS text-size adjustment is predictable.
- [x] Shared page children may shrink (`min-width: 0`).
- [x] Safe-area bottom padding is available for modal and chat actions.
- [ ] Audit every route for fixed widths, unbroken text, oversized padding, and tables.
- [ ] Verify navigation drawer at every test width.
- [ ] Verify footer links and floating controls do not overlap content.

## Modals and drawers

- [x] Shared `BaseModal` is a full-width bottom sheet below `sm` and centred above it.
- [x] Shared `Modal` is a full-width bottom sheet below `sm` and centred above it.
- [x] Open-for-work uses the shared bottom-sheet dimensions and safe-area spacing.
- [ ] Migrate all remaining custom `fixed inset-0` overlays to `BaseModal` or `.hb-modal-shell` / `.hb-modal-panel`.
- [ ] Confirm every sheet has a visible close control, scrollable body, sticky actions where necessary, focus trap, and Escape/backdrop behavior.

## Messaging

- [x] Inbox uses dynamic viewport height and removes desktop padding on phones.
- [x] Message list, bubbles, and composer cannot exceed the viewport width.
- [x] Composer uses 16px mobile text to avoid iOS focus zoom.
- [x] Composer respects the bottom safe area.
- [ ] Test long URLs, long unbroken words, images, replies, reactions, menus, emoji picker, selection mode, and the software keyboard.

## Profiles and account

- [x] Account page reduces mobile padding and permits all inner content to shrink.
- [ ] Audit public household and househelp profiles.
- [ ] Audit profile preference sections, photo galleries, certifications, references, and account/security pages.

## Hiring and marketplace

- [x] Household hiring shell no longer exceeds the viewport.
- [x] Tabs use explicit horizontal scrolling and snap points.
- [x] Applicant cards use mobile padding, smaller avatars, and wrapping names.
- [ ] Audit job cards, job details, applications, offers, negotiations, contracts, and work history.
- [ ] Audit househelp hiring tabs and cards with the same rules.

## Remaining route groups

- [ ] Authentication, onboarding, verification, and password recovery.
- [ ] Homepage, search, filters, and listing detail pages.
- [ ] Subscriptions, pricing, wallet, and payment methods.
- [ ] Settings, notifications, household members, and bureau pages.
- [ ] Blog, contact, legal, referral, waitlist, and error/empty states.

## Definition of done per page

- No document-level horizontal scroll at 320px.
- No content requires pinch-to-zoom or zooming out.
- Text wraps without covering controls.
- Touch targets are at least 44px where practical.
- Forms remain usable with the software keyboard open.
- Mobile dialogs appear as bottom sheets; desktop dialogs remain centred.
- Sticky/fixed UI respects safe areas and does not hide content.
