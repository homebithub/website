export const SINGLE_SELECT_FEATURES = new Set([
  'SalaryRange', 'StartTiming', 'EngagementFrequency', 'EngagementDuration',
  'WorkArrangement', 'HouseSize', 'ExperienceLevel', 'Religion',
  'CleaningDepth', 'SuppliesProvided', 'LaundryVolume',
  'WashingMachineAvailable', 'MobilitySupportNeeded', 'MedicalSupportNeeded',
  'SpecialNeedsExperience', 'CareRecipientCount', 'Urgency', 'EventSize',
  'PropertyFloors',
]);

export const featureKey = (name: string) => name.replace(/\s+/g, '').toLowerCase();

export function isSingleSelectFeature(name: string) {
  return SINGLE_SELECT_FEATURES.has(name.replace(/\s+/g, ''));
}

export function allowedPropertyNames(featureName: string, arrangement?: string, frequency?: string): string[] | null {
  if (featureKey(featureName) === 'engagementfrequency') {
    if (arrangement === 'Live-in') return ['Daily'];
    if (arrangement === 'Day worker') return ['One-off', 'Daily', 'A few days a week', 'Once a week', 'As needed'];
    if (arrangement === 'Occasional') return ['One-off', 'Once a week', 'Fortnightly', 'Monthly', 'As needed'];
  }
  if (featureKey(featureName) === 'salaryrange') {
    if (arrangement === 'Live-in') return ['monthly:'];
    if (arrangement === 'Day worker' || arrangement === 'Occasional' || frequency === 'One-off') return ['daily:', 'weekly:'];
  }
  return null;
}

export function propertyAllowed(name: string, allowed: string[] | null) {
  if (!allowed) return true;
  const normalized = name.toLowerCase();
  return allowed.some((value) => normalized === value.toLowerCase() || normalized.startsWith(value.toLowerCase()));
}
