import { describe, expect, it } from "vitest";
import { shouldHideMarketplaceReadiness } from "./MarketplaceReadiness";

const step = (completed: boolean) => ({
  id: "profile",
  label: "Profile",
  description: "",
  action_path: "/household/profile",
  status: completed ? "complete" : "incomplete",
  completed,
});

describe("shouldHideMarketplaceReadiness", () => {
  it("hides the section when the backend permits marketplace interaction", () => {
    expect(shouldHideMarketplaceReadiness({ interactionAllowed: true, steps: [step(true)] })).toBe(true);
  });

  it("hides the section when every returned action is complete", () => {
    expect(shouldHideMarketplaceReadiness({ interactionAllowed: false, steps: [step(true), step(true)] })).toBe(true);
  });

  it("keeps the section while at least one action remains", () => {
    expect(shouldHideMarketplaceReadiness({ interactionAllowed: false, steps: [step(true), step(false)] })).toBe(false);
  });

  it("does not mistake an empty or failed response for completion", () => {
    expect(shouldHideMarketplaceReadiness({ interactionAllowed: false, steps: [] })).toBe(false);
  });
});
