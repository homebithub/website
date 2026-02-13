export type UserRole = 'household' | 'househelp' | 'agency' | 'admin';

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
  unlockedProfiles: string[]; // IDs of unlocked househelp profiles
}

export interface Househelp extends BaseUser {
  role: 'househelp';
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
  managedHousehelps: string[]; // IDs of managed househelp profiles
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
