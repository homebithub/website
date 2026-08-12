# Form UX checklist

Use this checklist for every customer-facing form and modal. The source inventory is generated with:

`rg -l "<(form|Form)([ >])|onSubmit=" app --glob '*.{tsx,jsx}'`

## Required behavior

- [x] Shared `Input` renders a required marker, field error, `aria-invalid`, and `aria-describedby`.
- [x] Shared `FieldError` and `FormError` provide consistent field and submission feedback.
- [x] Contract creation uses field-level validation and an actionable applicant-resolution message.
- [x] Submission errors appear immediately above the action buttons on the contract form.
- [x] Contract actions stack and fill the width on mobile.
- [ ] Authentication and account forms audited.
- [ ] Profile and preference forms audited.
- [ ] Hiring, listing, contract, and review forms audited.
- [ ] Waitlist, contact, and blog forms audited.
- [ ] Bureau forms audited.

## Rule for new and migrated forms

- Put human-readable validation directly below the affected control.
- Reserve the message above the submit button for server, network, or cross-field submission failures.
- Mark every required label with the shared `RequiredMark`, or use the shared `Input` with `required`.
- Connect errors with `aria-invalid` and `aria-describedby`.
- Use a single-column mobile layout; introduce columns only at `sm` or wider.
- Stack full-width actions on mobile and place the primary action first visually.
