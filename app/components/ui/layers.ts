/**
 * Stacking order for the layers that escape the page and portal to the body.
 *
 * Tailwind's z-* scale only orders elements within their own stacking context,
 * so it says nothing about two portalled siblings of <body>. Those need real
 * numbers, and the numbers only mean something next to each other — which is
 * why they live together here rather than inline at each use.
 *
 * A dropdown opened from inside a modal has to paint above that modal's
 * backdrop. Otherwise the list opens behind it: invisible, and the next click
 * lands on the backdrop and dismisses it, so the control reads as broken.
 */

/** Open list of a CustomSelect. The topmost layer — it can open from anywhere. */
export const SELECT_PANEL_Z_INDEX = 2147483646;

/** Modal backdrop and panel. Above the app, below any dropdown it contains. */
export const MODAL_Z_INDEX = SELECT_PANEL_Z_INDEX - 1;
