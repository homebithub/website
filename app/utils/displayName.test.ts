import { describe, expect, it } from "vitest";

import { formatDisplayName } from "./displayName";

describe("marketplace display names", () => {
  it("shows at most two names when a full name contains three", () => {
    expect(formatDisplayName("Jane Wanjiku Doe")).toBe("Jane Doe");
  });

  it("uses the first given name and final family name from profile parts", () => {
    expect(formatDisplayName("Jane Wanjiku", "Doe Kamau")).toBe("Jane Kamau");
  });

  it("preserves single names and fallbacks", () => {
    expect(formatDisplayName("Akinyi")).toBe("Akinyi");
    expect(formatDisplayName("", undefined, "Homebit member")).toBe("Homebit member");
  });
});
