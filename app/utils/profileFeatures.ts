const PROFILE_FEATURE_LABELS: Record<string, string> = {
  ServiceType: 'Service type',
  Chore: 'Chores and services',
  ExperienceLevel: 'Experience',
  Language: 'Languages',
  SalaryRange: 'Salary or budget range',
  Certification: 'Certifications',
  ChildrenAgeRange: 'Children age groups',
  ChildrenCapacity: 'Number of children',
  PetTypeOption: 'Pet types',
  PetTraitOption: 'Pet traits',
  Religion: 'Religion',
  HouseSize: 'House size',
  HouseholdSizePreference: 'Preferred household size',
  LocationTypePreference: 'Preferred location type',
  FamilyTypePreference: 'Preferred family type',
  ReferenceRelationship: 'Reference relationships',
};

export function profileFeatureLabel(name: string) {
  return PROFILE_FEATURE_LABELS[name] || name;
}
