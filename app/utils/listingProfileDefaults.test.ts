import { describe, expect, it } from "vitest";
import {
  buildServiceProviderListingDefaults,
  buildHouseholdJobDefaults,
  buildHouseholdListingFeatureBundles,
  PROFILE_TO_LISTING_FIELD_CATALOGUE,
} from "./listingProfileDefaults";

describe("profile-to-listing defaults", () => {
  it("catalogues the profile fields reused by both listing types", () => {
    expect(PROFILE_TO_LISTING_FIELD_CATALOGUE.serviceProvider.description).toContain("bio");
    expect(PROFILE_TO_LISTING_FIELD_CATALOGUE.household.location).toContain("location");
    expect(PROFILE_TO_LISTING_FIELD_CATALOGUE.household.catalogueChoices).toContain("user_profile_picks.feature_property_id");
  });

  it("prefills every compatible open-for-work field", () => {
    expect(buildServiceProviderListingDefaults({
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

    expect(buildServiceProviderListingDefaults({}, features, picks)).toMatchObject({
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

  it("carries selected household profile choices into a listing when its job type has no feature links", () => {
    const profileBundles = [
      {
        feature_id: 11,
        feature: { name: "Chore" },
        is_required: true,
        properties: [{ id: 101, name: "General Cleaning" }, { id: 102, name: "Cooking" }],
      },
      {
        feature_id: 12,
        feature: { name: "Language" },
        is_required: true,
        properties: [{ id: 201, name: "English" }, { id: 202, name: "Swahili" }],
      },
      {
        feature_id: 13,
        feature: { name: "Religion" },
        properties: [{ id: 301, name: "Christianity" }],
      },
    ];
    const picks = [
      { feature_id: 11, feature_property_id: 101 },
      { feature_id: 12, feature_property_id: 201 },
      { feature_id: 12, feature_property_id: 202 },
    ];

    expect(buildHouseholdListingFeatureBundles([], profileBundles, picks)).toEqual([
      expect.objectContaining({ feature_id: 11, is_required: false, properties: profileBundles[0].properties }),
      expect.objectContaining({ feature_id: 12, is_required: false, properties: profileBundles[1].properties }),
    ]);
  });

  it("keeps job-type requirements while adding editable profile-only choices", () => {
    const jobBundles = [{
      feature_id: 11,
      feature: { name: "Chore" },
      is_required: true,
      default_weight: 4,
      properties: [{ id: 101, name: "General Cleaning" }, { id: 103, name: "Laundry" }],
    }];
    const profileBundles = [
      { feature_id: 11, feature: { name: "Chore" }, properties: [{ id: 101, name: "General Cleaning" }, { id: 102, name: "Cooking" }] },
      { feature_id: 12, feature: { name: "Language" }, properties: [{ id: 201, name: "English" }] },
    ];
    const picks = [{ feature_id: 11, feature_property_id: 102 }, { feature_id: 12, feature_property_id: 201 }];

    const bundles = buildHouseholdListingFeatureBundles(jobBundles, profileBundles, picks);

    expect(bundles[0]).toMatchObject({ feature_id: 11, is_required: true, default_weight: 4 });
    expect(bundles[0].properties.map((property: { id: number }) => property.id)).toEqual([101, 103, 102]);
    expect(bundles[1]).toMatchObject({ feature_id: 12, is_required: false });
  });
});
