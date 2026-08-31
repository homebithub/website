import { describe, expect, it } from "vitest";
import { crossedProfileCompletionThreshold } from "./useProfileCompletionTransition";

describe("crossedProfileCompletionThreshold", () => {
  it.each([
    [75, 100],
    [99, 100],
    [50, 125],
  ])("detects an incomplete-to-complete transition from %s to %s", (previous, current) => {
    expect(crossedProfileCompletionThreshold(previous, current)).toBe(true);
  });

  it.each([
    [null, 100],
    [undefined, 100],
    [100, 100],
    [100, 75],
    [75, 99],
    ["not-a-number", 100],
  ])("does not celebrate for %s to %s", (previous, current) => {
    expect(crossedProfileCompletionThreshold(previous, current)).toBe(false);
  });
});
