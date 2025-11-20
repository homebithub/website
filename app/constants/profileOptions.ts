/**
 * Centralized Profile Options
 * 
 * This file contains all the dropdown options, lists, and constants used across
 * the application for profile setup, search filters, and forms.
 * 
 * Update these arrays once and they will reflect throughout the entire website.
 */

// ============================================================================
// LOCATION OPTIONS
// ============================================================================

export const TOWNS = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Malindi',
  'Kitale',
  'Garissa',
  'Kakamega',
  'Machakos',
  'Meru',
  'Nyeri',
  'Kericho',
  'Naivasha'
] as const;

// ============================================================================
// SERVICE TYPE / HOUSEHELP TYPE OPTIONS
// ============================================================================

export const SERVICE_TYPES = {
  LIVE_IN: 'live_in',
  DAY_WORKER: 'day_worker',
} as const;

export const SERVICE_TYPE_LABELS = {
  [SERVICE_TYPES.LIVE_IN]: 'Live-in',
  [SERVICE_TYPES.DAY_WORKER]: 'Day worker',
} as const;

// ============================================================================
// LANGUAGE OPTIONS
// ============================================================================

export const LANGUAGE_GROUPS = {
  kenyanBantu: [
    'Kikuyu (Gikuyu)',
    'Kamba (Kikamba)',
    'Meru',
    'Embu',
    'Mbeere',
    'Luhya',
    'Bukusu',
    'Maragoli',
    'Banyore',
    'Isukha',
    'Kisii (Ekegusii)',
    'Taita',
    'Chonyi',
    'Giriama',
    'Digo',
    'Rabai',
    'Kauma',
    'Duruma',
    'Pokomo',
    'Taveta'
  ],
  kenyanNilotic: [
    'Luo (Dholuo)',
    'Kalenjin',
    'Nandi',
    'Kipsigis',
    'Tugen',
    'Keiyo',
    'Marakwet',
    'Pokot',
    'Turkana',
    'Samburu',
    'Njemps (Ilchamus)',
    'Teso (Ateso)'
  ],
  kenyanCushitic: [
    'Somali',
    'Borana',
    'Rendille',
    'Gabra',
    'Orma'
  ],
  international: [
    'Mandarin Chinese',
    'Spanish',
    'Hindi',
    'Arabic',
    'Bengali',
    'Portuguese',
    'Russian',
    'Japanese',
    'Punjabi',
    'German',
    'French',
    'Italian',
    'Korean',
    'Vietnamese',
    'Thai',
    'Swedish',
    'Dutch',
    'Greek',
    'Hebrew',
    'Turkish'
  ]
} as const;

// Flatten all languages into a single array
export const ALL_LANGUAGES = [
  ...LANGUAGE_GROUPS.kenyanBantu,
  ...LANGUAGE_GROUPS.kenyanNilotic,
  ...LANGUAGE_GROUPS.kenyanCushitic,
  ...LANGUAGE_GROUPS.international
] as const;

// Primary languages (shown as checkboxes)
export const PRIMARY_LANGUAGES = ['English', 'Swahili'] as const;

// ============================================================================
// SKILLS / HELP WITH OPTIONS
// ============================================================================

export const SKILLS = [
  'Homework help',
  'Grocery shopping',
  'Cooking',
  'Household chores',
  'Laundry and ironing',
  'Childcare',
  'Elderly care',
  'Pet care',
  'Tutoring',
  'Running errands',
  'Gardening',
  'Driving',
  'Cleaning',
  'Dishwashing',
  'Meal preparation',
  'Baby care',
  'Special needs care'
] as const;

// ============================================================================
// CERTIFICATION OPTIONS
// ============================================================================

export const CERTIFICATIONS = [
  'I have a valid driving license',
  'I have a Certificate of Good Conduct',
  'I have a First Aid certificate',
  'I am a non-smoker',
  'I have a Diploma in Housekeeping',
  'I have a Childcare certification',
  'I have experience with special needs care',
  'I have a Food Handling certificate'
] as const;

// ============================================================================
// EXPERIENCE LEVELS
// ============================================================================

export const EXPERIENCE_LEVELS = [
  { value: '0-1', label: 'Less than 1 year' },
  { value: '1-2', label: '1-2 years' },
  { value: '2-5', label: '2-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' }
] as const;

// ============================================================================
// GENDER OPTIONS
// ============================================================================

export const GENDERS = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say'
] as const;

// ============================================================================
// AVAILABILITY / SCHEDULE OPTIONS
// ============================================================================

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

export const TIME_SLOTS = [
  'morning',
  'afternoon',
  'evening'
] as const;

// ============================================================================
// STATUS OPTIONS
// ============================================================================

export const PROFILE_STATUS = [
  'active',
  'inactive',
  'pending'
] as const;

// ============================================================================
// SALARY FREQUENCY OPTIONS
// ============================================================================

export const SALARY_FREQUENCIES = [
  'hourly',
  'daily',
  'weekly',
  'monthly'
] as const;

export const SALARY_FREQUENCY_LABELS = {
  hourly: 'Per Hour',
  daily: 'Per Day',
  weekly: 'Per Week',
  monthly: 'Per Month'
} as const;

// ============================================================================
// CHILDREN AGE RANGES
// ============================================================================

export const CHILDREN_AGE_RANGES = [
  '0-1 years (Infant)',
  '1-3 years (Toddler)',
  '3-5 years (Preschool)',
  '5-12 years (School age)',
  '12+ years (Teenager)'
] as const;

// ============================================================================
// PET TYPES
// ============================================================================

export const PET_TYPES = [
  'Dogs',
  'Cats',
  'Birds',
  'Fish',
  'Rabbits',
  'Hamsters',
  'Guinea pigs',
  'Reptiles',
  'Other'
] as const;

// ============================================================================
// RELIGION / BELIEFS OPTIONS
// ============================================================================

export const RELIGIONS = [
  'Christianity',
  'Islam',
  'Hinduism',
  'Buddhism',
  'Judaism',
  'Traditional African Religion',
  'Atheist',
  'Agnostic',
  'Prefer not to say',
  'Other'
] as const;

// ============================================================================
// HOUSE SIZE OPTIONS
// ============================================================================

export const HOUSE_SIZES = [
  'Studio/Bedsitter',
  '1 Bedroom',
  '2 Bedrooms',
  '3 Bedrooms',
  '4 Bedrooms',
  '5+ Bedrooms',
  'Mansion/Estate'
] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get label for service type
 */
export function getServiceTypeLabel(type: string): string {
  return SERVICE_TYPE_LABELS[type as keyof typeof SERVICE_TYPE_LABELS] || type;
}

/**
 * Get label for salary frequency
 */
export function getSalaryFrequencyLabel(frequency: string): string {
  return SALARY_FREQUENCY_LABELS[frequency as keyof typeof SALARY_FREQUENCY_LABELS] || frequency;
}

/**
 * Check if a language is a primary language
 */
export function isPrimaryLanguage(language: string): boolean {
  return PRIMARY_LANGUAGES.includes(language as any);
}

/**
 * Get all languages except primary ones
 */
export function getSecondaryLanguages(): readonly string[] {
  return ALL_LANGUAGES.filter(lang => !isPrimaryLanguage(lang));
}
