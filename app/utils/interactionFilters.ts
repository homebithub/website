export type InteractionFilterState = {
  hideSaved?: boolean;
  hideContacted?: boolean;
  hideApplied?: boolean;
};

export type ListingInteractionState = {
  saved?: boolean;
  contacted?: boolean;
  applied?: boolean;
};

/** Keeps interaction filters composable so named saved filters can persist any combination. */
export function matchesInteractionFilters(
  filters: InteractionFilterState,
  interaction: ListingInteractionState,
): boolean {
  if (filters.hideSaved && interaction.saved) return false;
  if (filters.hideContacted && interaction.contacted) return false;
  if (filters.hideApplied && interaction.applied) return false;
  return true;
}
