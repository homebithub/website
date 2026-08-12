import { describe, expect, it } from "vitest";
import { matchScoreClasses } from "./matchScore";

describe("matchScoreClasses", () => {
  it.each([
    [0, "bg-gray-100"], [25, "bg-gray-100"],
    [26, "bg-amber-100"], [50, "bg-amber-100"],
    [51, "bg-emerald-100"], [75, "bg-emerald-100"],
    [76, "bg-gradient-to-r"], [100, "bg-gradient-to-r"],
  ])("maps %s%% to its visual band", (score, expectedClass) => {
    expect(matchScoreClasses(score)).toContain(expectedClass);
  });
});
