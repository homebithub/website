# Bug tracker

Bugs found while testing HomeBit, and where each one has got to.

**Fixed** is mine to set — it means the change is written, builds, and is committed.
**Retested** is Sean's to set — a fix is not done until it has been confirmed against
a real deployment. Nothing moves to Retested on my say-so.

Bugs are numbered in the order they were reported. Area is included because these
span several repositories.

| # | Bug | Area | Fixed | Retested |
|---|-----|------|-------|----------|
| 1 | Household **Saved** page showed a bare heading over blank space when there was nothing to list — no empty state at all. | website | ✅ | ⬜ |

---

## 1. Household Saved page renders blank when empty

**Reported:** 2026-08-09 — `preprod.homebit.co.ke/household/shortlist`

**What was wrong.** The page did have an empty state, so the interesting part is why
it never appeared. It was conditioned on `items.length === 0` — every saved row
returned by the API — but the list below it only draws cards for rows whose
`profile_type` is `open_for_work`. A saved row of any other type (the backend also
returns `job`) left `items` non-empty while rendering nothing, so both the cards and
the empty state were suppressed and the page fell through to a heading over blank
space.

**Fix.** The rendered subset is computed once as `savedHousehelps`, and the empty
state now keys off that instead of the raw response, so the page always shows
something whether nothing was saved or nothing could be drawn. The panel was restyled
to match the homepage's no-results card, and it now offers a way back to browsing
rather than being a dead end.

`app/routes/household.shortlist.tsx`

**Not affected:** the househelp-side Saved page (`app/routes/shortlist.tsx`) filters
before storing, so its empty check already matches what it renders.

**To retest:** open Saved as a household with nothing saved — expect the "Nothing
saved yet" card. Then save a househelp and confirm the card list replaces it.
