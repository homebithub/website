import { describe, expect, it } from "vitest";
import { canonicalizeServiceProviderPath } from "./serviceProviderRoutes";

describe("service-provider routes", () => {
  it("maps legacy role routes to the canonical namespace", () => {
    expect(canonicalizeServiceProviderPath("/househelp/profile")).toBe("/service-provider/profile");
    expect(canonicalizeServiceProviderPath("/househelp/public-profile")).toBe("/service-provider/public-profile");
  });

  it("does not rewrite the distinct househelp service waitlist", () => {
    expect(canonicalizeServiceProviderPath("/waitlist/househelp")).toBe("/waitlist/househelp");
  });
});
