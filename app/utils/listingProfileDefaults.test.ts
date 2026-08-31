import { describe, expect, it } from "vitest";
import {
  buildHousehelpListingDefaults,
  buildHouseholdJobDefaults,
  PROFILE_TO_LISTING_FIELD_CATALOGUE,
} from "./listingProfileDefaults";

describe("profile-to-listing defaults", () => {
  it("catalogues the profile fields reused by both listing types", () => {
    expect(PROFILE_TO_LISTING_FIELD_CATALOGUE.househelp.description).toContain("bio");
    expect(PROFILE_TO_LISTING_FIELD_CATALOGUE.household.location).toContain("location");
    expect(PROFILE_TO_LISTING_FIELD_CATALOGUE.household.catalogueChoices).toContain("user_profile_picks.feature_property_id");
  });

  it("prefills every compatible open-for-work field", () => {
    expect(buildHousehelpListingDefaults({
      live_in: true,
      day_worker: true,
      available_from: "2026-09-12T00:00:00Z",
      bio: "Experienced home professional",
      work_with_kids: true,
      work_with_pets: true,
      salary_expectation: 18000,
      salary_frequency: "monthly",
      languages: ["English", "Swahili"],
      skills: ["Cooking"],
      certifications: ["First Aid"],
    })).toEqual({
      jobTypes: ["live_in", "day_worker"],
      availableFrom: "2026-09-12T00:00:00Z",
      description: "Experienced home professional",
      canWorkWithKids: true,
      canWorkWithPets: true,
      salaryMin: 18000,
      salaryMax: 18000,
      salaryFrequency: "monthly",
      highlights: {
        languages: ["English", "Swahili"],
        skills: ["Cooking"],
        certifications: ["First Aid"],
      },
    });
  });

  it("fills open-for-work defaults from completed catalogue profile choices", () => {
    const features = [
      { feature: { name: "ServiceType" }, properties: [{ id: 1, name: "Live-in" }, { id: 2, name: "Dayburg (day worker)" }] },
      { feature: { name: "Language" }, properties: [{ id: 3, name: "Swahili" }] },
      { feature: { name: "Certification" }, properties: [{ id: 4, name: "First Aid" }] },
      { feature: { name: "Chore" }, properties: [{ id: 5, name: "Cooking" }] },
      { feature: { name: "SalaryRange" }, properties: [{ id: 6, name: "monthly: 15,000-25,000 KES" }] },
    ];
    const picks = [1, 2, 3, 4, 5, 6].map((featurePropertyId) => ({ feature_property_id: featurePropertyId }));

    expect(buildHousehelpListingDefaults({}, features, picks)).toMatchObject({
      jobTypes: ["live_in", "day_worker"],
      salaryMin: 15000,
      salaryMax: 25000,
      salaryFrequency: "monthly",
      highlights: {
        languages: ["Swahili"],
        skills: ["Cooking"],
        certifications: ["First Aid"],
      },
    });
  });

  it("prefills household text, location, preferences, pets, budget and catalogue choices", () => {
    expect(buildHouseholdJobDefaults({
      household_notes: "Three-bedroom family home",
      chores: ["Laundry", "Cooking"],
      house_size: "3 bedrooms",
      needs_live_in: true,
      needs_day_worker: true,
      available_from: "2026-09-20",
      budget_min: 15000,
      budget_max: 22000,
      salary_frequency: "monthly",
      location: { ward_id: 31, subcounty_id: 12, county_id: 1 },
    }, [{ pet_type: "Dog" }], [{ feature_property_id: 77 }])).toMatchObject({
      description: "Three-bedroom family home",
      chores: ["Laundry", "Cooking"],
      houseSize: "3 bedrooms",
      petTypes: ["Dog"],
      workArrangements: ["Live-in", "Day worker"],
      availableFrom: "2026-09-20",
      budgetMin: 15000,
      budgetMax: 22000,
      salaryFrequency: "monthly",
      location: { wardId: 31, subcountyId: 12, countyId: 1 },
      profilePropertyIds: [77],
    });
  });
});
