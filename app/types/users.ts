export type UserRole = 'household' | 'service_provider' | 'agency' | 'admin';

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  profileImage?: string;
}

export interface Household extends BaseUser {
  role: 'household';
  location: string;
  preferences: {
    liveIn: boolean;
    ageRange: {
      min: number;
      max: number;
    };
    languages: string[];
    skills: string[];
  };
  subscriptionStatus: 'none' | 'basic' | 'premium';
  subscriptionValidUntil?: string;
  unlockedProfiles: string[]; // Legacy shortlist-lock field retained for compatibility
}

export interface ServiceProvider extends BaseUser {
  role: 'service_provider';
  location: string;
  agencyId?: string;
  skills: string[];
  languages: string[];
  experience: number; // in years
  certifications: {
    name: string;
    url: string;
    verifiedAt?: string;
  }[];
  preferences: {
    liveIn: boolean;
    salary: {
      amount: number;
      currency: string;
      period: 'monthly' | 'weekly';
    };
    workingHours: {
      start: string;
      end: string;
    };
  };
  availability: 'available' | 'hired' | 'unavailable';
  backgroundCheck?: {
    status: 'pending' | 'approved' | 'rejected';
    completedAt?: string;
    expiresAt?: string;
    documentUrl?: string;
  };
  rating: number;
  reviewCount: number;
}

/** @deprecated Use ServiceProvider; retained while imports migrate. */
export type Househelp = ServiceProvider;

export interface Agency extends BaseUser {
  role: 'agency';
  businessName: string;
  businessRegistrationNumber: string;
  businessDocuments: {
    name: string;
    url: string;
    verifiedAt?: string;
  }[];
  location: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  managedServiceProviders: string[]; // IDs of managed service provider profiles
  rating: number;
  reviewCount: number;
  commissionRate: number;
}

export interface Admin extends BaseUser {
  role: 'admin';
  permissions: {
    manageUsers: boolean;
    managePayments: boolean;
    manageVerifications: boolean;
    viewAnalytics: boolean;
    manageContent: boolean;
  };
}
