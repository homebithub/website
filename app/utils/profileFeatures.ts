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
  HouseSize: 'Bedrooms in this household',
  DwellingType: 'Type of home',
  HouseholdSizePreference: 'Largest number of adults you prefer to work for',
  LocationTypePreference: 'Preferred location type',
  FamilyTypePreference: 'Preferred family type',
  ReferenceRelationship: 'Reference relationships',
};

export function profileFeatureLabel(name: string, profileType?: string) {
  if (name === 'ChildrenCapacity') {
    return profileType === 'household'
      ? 'Children in this household'
      : 'Maximum number of children you are comfortable caring for';
  }
  return PROFILE_FEATURE_LABELS[name] || name;
}
