import { describe, expect, it } from "vitest";
import {
  isServiceProviderProfileType,
  normalizeProfileType,
  profileTypesMatch,
  SERVICE_PROVIDER_PROFILE_TYPE,
} from "./profileType";

describe("service-provider profile vocabulary", () => {
  it.each(["househelp", "HOUSEHELP", "service_provider", "service-provider", "ServiceProvider", "SVC_PVD", "SVD_PDD"])(
    "normalizes the deployed alias %s",
    (alias) => {
      expect(normalizeProfileType(alias)).toBe(SERVICE_PROVIDER_PROFILE_TYPE);
      expect(isServiceProviderProfileType(alias)).toBe(true);
    },
  );

  it("compares legacy and canonical values as the same profile family", () => {
    expect(profileTypesMatch("househelp", "service_provider")).toBe(true);
  });
});
