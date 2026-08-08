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
| 2a | "Loading the next experience…" overlay appeared on every navigation. | website | ✅ | ⬜ |
| 2b | Footer floated mid-screen instead of sitting at the bottom, at a different height on each route. | website | ✅ | ⬜ |
| 2c | Whole page waits for every request before anything renders, instead of each section clearing as its own data arrives. | website | 🟡 partial | ⬜ |

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

---

## 2. Shimmer loading: overlay, footer, and section granularity

**Reported:** 2026-08-09 — `preprod.homebit.co.ke/household/profile`

Three separate problems, all fallout from the earlier work to make shimmers uniform.

### 2a — the "Loading the next experience…" overlay ✅

`GlobalLoaderOverlay` was mounted in `root.tsx` and rendered a fixed panel on every
router transition. Removed: the mount, the component, and its CSS. It duplicated what
the per-page shimmers already say, and said it on top of them.

`app/root.tsx`, `app/components/ShimmerLoader.tsx`, `app/tailwind.css`

### 2b — the footer would not stay at the bottom ✅

Pages put `PurpleThemeWrapper` between a `Navigation` and a `Footer` inside a
`min-h-screen flex flex-col` column, and hang `flex-1` off the `<main>` inside the
wrapper. But `main` is not a child of that column — the wrapper is. Unless the wrapper
grew, nothing claimed the spare height and the footer stopped wherever the content
happened to end. Short pages, and any page mid-shimmer, put it at a different height
on every route.

43 of 61 call sites already passed `flex-1` by hand, which is exactly why some pages
looked right and others did not. It is now a default on the component, so no page can
reintroduce it. Measured on `/landing` at a viewport taller than the content: 474px of
dead space below the footer before, 0px after.

`blog.unsubscribe` needed a separate fix — it uses the wrapper as the page root, so
there was no `min-h-screen` parent to inherit height from.

`app/components/layout/PurpleThemeWrapper.tsx`, `app/routes/blog.unsubscribe.tsx`

### 2c — per-section shimmers 🟡 partial

Done on the reported page: the household profile's members and profile-choices
sections now shimmer independently, shaped like the content they stand in for, rather
than showing a lone dot.

Still outstanding, and the larger half: most pages gate their whole render behind a
single `loading` flag and return a full-page skeleton, so one slow request holds back
sections whose data has already arrived. Undoing that is a per-page change across
roughly 51 files — worth doing, but not a one-line fix, and each page needs retesting
after.

`app/routes/household.profile.tsx`

**To retest:** navigate between pages and confirm no overlay panel appears. Check the
footer sits at the bottom on a short page — the household profile mid-load is the
case that started this. Confirm nothing looks squashed on long pages.
