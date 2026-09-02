type UnknownRecord = Record<string, any>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? value as UnknownRecord : {};

const asArray = (value: unknown): any[] => {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.picks)) return record.picks;
  return [];
};

const firstText = (...values: unknown[]): string => {
  const value = values.find((candidate) => typeof candidate === "string" && candidate.trim());
  return typeof value === "string" ? value.trim() : "";
};

const firstNumber = (...values: unknown[]): number | null => {
  for (const value of values) {
    const number = Number(value || 0);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return null;
};

const stringList = (value: unknown): string[] =>
  asArray(value).map((item) => String(item || "").trim()).filter(Boolean);

const propertyId = (value: unknown): number | null => {
  const record = asRecord(value);
  return firstNumber(
    record.feature_property_id,
    record.featurePropertyId,
    record.property_id,
    record.propertyId,
    asRecord(record.feature_property ?? record.featureProperty).id,
    asRecord(record.property).id,
  );
};

function selectedProfileChoices(featuresInput: unknown, picksInput: unknown) {
  const selectedIds = new Set(asArray(picksInput).map(propertyId).filter((id): id is number => id !== null));
  const selected = new Map<string, string[]>();

  asArray(featuresInput).forEach((bundleValue) => {
    const bundle = asRecord(bundleValue);
    const feature = asRecord(bundle.feature);
    const name = firstText(feature.name, bundle.name).replace(/\s+/g, "").toLowerCase();
    if (!name) return;
    const names = asArray(bundle.properties)
      .filter((property) => {
        const record = asRecord(property);
        return selectedIds.has(firstNumber(record.id, record.feature_property_id, record.featurePropertyId) || 0);
      })
      .map((property) => firstText(asRecord(property).name, asRecord(property).description))
      .filter(Boolean);
    if (names.length > 0) selected.set(name, names);
  });

  return selected;
}

function salaryChoice(value: string) {
  const [frequencyPart] = value.split(":");
  const frequency = /^(daily|weekly|monthly)$/i.test(frequencyPart.trim())
    ? frequencyPart.trim().toLowerCase()
    : "";
  const amounts = value.match(/[\d,]+/g)?.map((amount) => Number(amount.replace(/,/g, ""))) || [];
  return {
    frequency,
    minimum: amounts[0] || null,
    maximum: amounts[1] || amounts[0] || null,
  };
}

/**
 * Canonical profile fields reused by each listing form. Keeping this catalogue
 * beside the normalizers makes new profile fields visible to future listing
 * work instead of scattering one-off aliases through two large modals.
 */
export const PROFILE_TO_LISTING_FIELD_CATALOGUE = {
  serviceProvider: {
    jobTypes: ["live_in", "offers_live_in", "day_worker", "offers_day_worker", "job_types"],
    availableFrom: ["available_from"],
    description: ["bio", "work_environment_notes"],
    kids: ["work_with_kids", "can_work_with_kids", "can_work_with_kid"],
    pets: ["work_with_pets", "can_work_with_pets"],
    salary: ["salary_expectation", "salary_expectation_min", "salary_expectation_max", "salary_frequency"],
    highlights: ["languages", "skills", "certifications"],
  },
  household: {
    description: ["household_notes", "bio", "notes"],
    location: ["location", "location_ref", "primary_location", "ward_id", "subcounty_id", "county_id"],
    work: ["needs_live_in", "needs_day_worker", "available_from"],
    household: ["chores", "house_size", "pets"],
    budget: ["budget_min", "budget_max", "salary_frequency"],
    catalogueChoices: ["user_profile_picks.feature_property_id"],
  },
} as const;

export function buildServiceProviderListingDefaults(
  profileInput: unknown,
  featuresInput: unknown = [],
  picksInput: unknown = [],
) {
  const profile = asRecord(asRecord(profileInput).data ?? profileInput);
  const choices = selectedProfileChoices(featuresInput, picksInput);
  const explicitJobTypes = stringList(profile.job_types ?? profile.jobTypes);
  const serviceTypes = choices.get("servicetype") || [];
  const choiceJobTypes = serviceTypes.map((value) => {
    const normalized = value.toLowerCase();
    if (normalized.includes("live-in")) return "live_in";
    if (normalized.includes("day worker") || normalized.includes("dayburg")) return "day_worker";
    if (normalized.includes("part-time")) return "part_time";
    if (normalized.includes("full-time")) return "full_time";
    return "";
  }).filter(Boolean);
  const arrangements = [
    (profile.live_in ?? profile.offers_live_in) ? "live_in" : "",
    (profile.day_worker ?? profile.offers_day_worker) ? "day_worker" : "",
  ].filter(Boolean);
  const expectation = firstNumber(profile.salary_expectation);
  const selectedSalary = salaryChoice((choices.get("salaryrange") || [])[0] || "");
  const choiceLanguages = choices.get("language") || [];
  const choiceCertifications = choices.get("certification") || [];
  const choiceSkills = choices.get("chore") || [];

  return {
    jobTypes: Array.from(new Set([...explicitJobTypes, ...arrangements, ...choiceJobTypes])),
    availableFrom: firstText(profile.available_from),
    description: firstText(profile.bio, profile.work_environment_notes),
    canWorkWithKids: Boolean(
      profile.work_with_kids ?? profile.can_work_with_kids ?? profile.can_work_with_kid ??
      (choices.has("childrenagerange") || choices.has("childrencapacity")),
    ),
    canWorkWithPets: Boolean(
      profile.work_with_pets ?? profile.can_work_with_pets ?? choices.has("pettypeoption"),
    ),
    salaryMin: firstNumber(profile.salary_expectation_min, expectation, selectedSalary.minimum),
    salaryMax: firstNumber(profile.salary_expectation_max, expectation, selectedSalary.maximum),
    salaryFrequency: firstText(profile.salary_frequency, selectedSalary.frequency) || "monthly",
    highlights: {
      languages: Array.from(new Set([...stringList(profile.languages), ...choiceLanguages])),
      skills: Array.from(new Set([...stringList(profile.skills), ...choiceSkills])),
      certifications: Array.from(new Set([...stringList(profile.certifications), ...choiceCertifications])),
    },
  };
}

export function buildHouseholdJobDefaults(
  profileInput: unknown,
  petsInput: unknown = [],
  picksInput: unknown = [],
) {
  const profile = asRecord(asRecord(profileInput).data ?? profileInput);
  const location = asRecord(
    profile.location ?? profile.location_ref ?? profile.primary_location,
  );
  const ward = asRecord(location.ward);
  const subcounty = asRecord(location.subcounty);
  const county = asRecord(location.county);
  const pets = asArray(asRecord(petsInput).data ?? petsInput);
  const picks = asArray(asRecord(picksInput).data ?? picksInput);

  return {
    description: firstText(profile.household_notes, profile.bio, profile.notes),
    jobTypeId: firstNumber(profile.job_type_id, profile.jobTypeId),
    chores: stringList(profile.chores),
    houseSize: firstText(profile.house_size),
    petTypes: pets
      .map((pet) => {
        const record = asRecord(pet);
        return firstText(record.type, record.pet_type, record.name);
      })
      .filter(Boolean),
    workArrangements: [
      profile.needs_live_in ? "Live-in" : "",
      profile.needs_day_worker ? "Day worker" : "",
    ].filter(Boolean),
    availableFrom: firstText(profile.available_from),
    budgetMin: firstNumber(profile.budget_min),
    budgetMax: firstNumber(profile.budget_max),
    salaryFrequency: firstText(profile.salary_frequency),
    location: {
      wardId: firstNumber(location.ward_id, location.wardId, ward.id, profile.ward_id, profile.wardId),
      subcountyId: firstNumber(location.subcounty_id, location.subcountyId, subcounty.id, profile.subcounty_id, profile.subcountyId),
      countyId: firstNumber(location.county_id, location.countyId, county.id, profile.county_id, profile.countyId),
    },
    profilePropertyIds: Array.from(new Set(picks
      .map((pick) => {
        const record = asRecord(pick);
        return propertyId(record);
      })
      .filter((id): id is number => id !== null))),
  };
}
