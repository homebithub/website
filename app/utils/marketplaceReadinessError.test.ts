import { describe, expect, it } from "vitest";
import { marketplaceReadinessErrorMessage } from "./marketplaceReadinessError";

describe("marketplaceReadinessErrorMessage", () => {
  it("explains a generic missing household profile response", () => {
    expect(marketplaceReadinessErrorMessage(new Error("We could not find that."), "household"))
      .toBe("We could not find a household profile for this account. Switch profiles, or sign out and sign in again.");
  });

  it("preserves useful service errors", () => {
    expect(marketplaceReadinessErrorMessage(new Error("The service is temporarily unavailable."), "service_provider"))
      .toBe("The service is temporarily unavailable.");
  });
});
