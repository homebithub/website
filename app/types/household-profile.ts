export interface HouseholdProfileData {
  location: {
    address: string;
    coordinates: [number, number];
  };
  children: {
    hasChildren: boolean;
    expecting: boolean;
    children: Array<{
      name: string;
      age: number;
      gender: string;
    }>;
    dueDate?: string;
  };
  nannyType: 'dayburg' | 'sleep-in' | null;
  schedule: {
    startDate: string;
    days?: string[]; // For dayburg
  };
  chores: {
    cleaning: boolean;
    cooking: boolean;
    childcare: boolean;
    laundry: boolean;
    other: string;
  };
  requirements: {
    hasPets: boolean;
    petDetails?: string;
    otherRequirements?: string;
  };
  budget: {
    type: 'daily' | 'weekly' | 'monthly';
    amount: number;
  };
  houseDetails: {
    size: 'bedsitter' | '1-bedroom' | '2-bedroom' | '3-bedroom' | '4+bedroom';
    hasSeparateSQ: boolean;
  };
}

// Re-export to ensure proper module resolution
export type { HouseholdProfileData as default };