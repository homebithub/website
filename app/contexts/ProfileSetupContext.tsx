import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { API_ENDPOINTS } from '~/config/api';

interface ProfileSetupData {
  // Household fields
  location?: any;
  children?: any;
  nannytype?: any;
  chores?: any;
  pets?: any;
  budget?: any;
  religion?: any;
  housesize?: any;
  bio?: any;
  photos?: any;
  
  // Househelp fields
  gender?: any;
  experience?: any;
  workwithkids?: any;
  workwithpets?: any;
  languages?: any;
  mykids?: any;
  certifications?: any;
  salary?: any;
  skills?: any;
  traits?: any;
  availability?: any;
}

interface ProfileSetupContextType {
  profileData: ProfileSetupData;
  updateStepData: (stepId: string, data: any) => void;
  saveStepToBackend: (stepId: string, data: any) => Promise<void>;
  saveProfileToBackend: () => Promise<void>;
  loadProfileFromBackend: () => Promise<void>;
  clearProfileData: () => void;
  isLoading: boolean;
  error: string | null;
  lastCompletedStep: number;
}

const ProfileSetupContext = createContext<ProfileSetupContextType | undefined>(undefined);

export const ProfileSetupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileSetupData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCompletedStep, setLastCompletedStep] = useState<number>(0);

  const updateStepData = (stepId: string, data: any) => {
    setProfileData(prev => ({
      ...prev,
      [stepId]: data
    }));
  };

  // Save individual step to backend immediately
  const saveStepToBackend = async (stepId: string, data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const profileType = localStorage.getItem('profile_type');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Determine endpoint
      const endpoint = profileType === 'househelp' 
        ? API_ENDPOINTS.profile.househelp.me 
        : API_ENDPOINTS.profile.household.me;

      // Transform just this step's data
      const stepPayload = transformStepData(stepId, data);

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stepPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save step');
      }

      // Update local state
      updateStepData(stepId, data);
      
      console.log(`Step ${stepId} saved successfully`);
      
    } catch (err: any) {
      console.error(`Error saving step ${stepId}:`, err);
      setError(err.message || 'Failed to save step');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing profile data from backend
  const loadProfileFromBackend = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const profileType = localStorage.getItem('profile_type');
      
      if (!token) {
        console.log('No token found, skipping profile load');
        return;
      }

      const endpoint = profileType === 'househelp' 
        ? API_ENDPOINTS.profile.househelp.me 
        : API_ENDPOINTS.profile.household.me;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist yet, that's okay
          console.log('No existing profile found, starting fresh');
          return;
        }
        throw new Error('Failed to load profile');
      }

      const profile = await response.json();
      
      // Convert backend data back to step format
      const reconstructedData = reconstructProfileData(profile);
      setProfileData(reconstructedData);
      
      // Calculate last completed step
      const completedStep = calculateLastCompletedStep(reconstructedData);
      setLastCompletedStep(completedStep);
      
      console.log('Profile loaded successfully', { completedStep });
      
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfileToBackend = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const profileType = localStorage.getItem('profile_type');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Determine which endpoint to use based on profile type
      const endpoint = profileType === 'househelp' 
        ? API_ENDPOINTS.profile.househelp.me 
        : API_ENDPOINTS.profile.household.me;

      // Transform the data to match backend expectations
      const payload = transformProfileData(profileData);

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }

      const savedProfile = await response.json();
      console.log('Profile saved successfully:', savedProfile);
      
      // Clear the local data after successful save
      setProfileData({});
      
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
      throw err; // Re-throw to let the caller handle it
    } finally {
      setIsLoading(false);
    }
  };

  const clearProfileData = () => {
    setProfileData({});
    setError(null);
  };

  return (
    <ProfileSetupContext.Provider
      value={{
        profileData,
        updateStepData,
        saveStepToBackend,
        saveProfileToBackend,
        loadProfileFromBackend,
        clearProfileData,
        isLoading,
        error,
        lastCompletedStep
      }}
    >
      {children}
    </ProfileSetupContext.Provider>
  );
};

export const useProfileSetup = () => {
  const context = useContext(ProfileSetupContext);
  if (context === undefined) {
    throw new Error('useProfileSetup must be used within a ProfileSetupProvider');
  }
  return context;
};

// Helper function to transform profile data to backend format
function transformProfileData(data: ProfileSetupData): any {
  // This transforms the step data into the format your backend expects
  const transformed: any = {};
  const profileType = localStorage.getItem('profile_type');

  // Common fields
  // Location
  if (data.location) {
    transformed.town = data.location.town;
    transformed.area = data.location.area;
    transformed.address = data.location.address;
  }

  // Religion
  if (data.religion) {
    transformed.religion = data.religion.preference || data.religion;
  }

  // Bio
  if (data.bio) {
    transformed.bio = data.bio.text || data.bio;
  }

  // Photos
  if (data.photos) {
    transformed.photos = data.photos.urls || data.photos;
  }

  // Household-specific fields
  if (profileType === 'household' || profileType === 'household') {
    // Children
    if (data.children) {
      transformed.has_children = data.children.has_children;
      transformed.number_of_kids = data.children.number_of_kids;
      transformed.new_borns_under_one = data.children.new_borns_under_one;
      transformed.kids_ages = data.children.ages;
    }

    // Service Type / Nanny Type
    if (data.nannytype) {
      transformed.service_type = data.nannytype.type;
      transformed.live_in = data.nannytype.live_in;
    }

    // Chores
    if (data.chores) {
      transformed.chores = data.chores.list || data.chores;
    }

    // Pets
    if (data.pets) {
      transformed.has_pets = data.pets.has_pets;
      transformed.pet_types = data.pets.types;
    }

    // Budget
    if (data.budget) {
      transformed.budget_min = data.budget.min;
      transformed.budget_max = data.budget.max;
      transformed.salary_frequency = data.budget.frequency;
    }

    // House Size
    if (data.housesize) {
      transformed.house_size = data.housesize.size || data.housesize;
    }
  }

  // Househelp-specific fields
  if (profileType === 'househelp') {
    // Gender and Date of Birth
    if (data.gender) {
      transformed.gender = data.gender.gender;
      transformed.date_of_birth = data.gender.date_of_birth || data.gender.dateOfBirth;
    }

    // Nanny Type for househelp
    if (data.nannytype) {
      transformed.househelp_type = data.nannytype.type || data.nannytype;
    }

    // Years of Experience
    if (data.experience) {
      transformed.years_of_experience = data.experience.years || data.experience;
    }

    // Work with Kids
    if (data.workwithkids) {
      transformed.can_work_with_kids = data.workwithkids.can_work;
      transformed.children_age_range = data.workwithkids.age_range;
      transformed.talent_with_kids = data.workwithkids.talents || [];
    }

    // Work with Pets
    if (data.workwithpets) {
      transformed.can_work_with_pets = data.workwithpets.can_work;
      transformed.pets = data.workwithpets.pet_types || data.workwithpets.pets || [];
    }

    // Languages
    if (data.languages) {
      transformed.languages = Array.isArray(data.languages) ? data.languages : [data.languages];
    }

    // My Kids
    if (data.mykids) {
      transformed.my_child_preference = data.mykids.preference;
      transformed.number_of_concurrent_children = data.mykids.number || 0;
    }

    // Certifications
    if (data.certifications) {
      transformed.first_aid_certificate = data.certifications.first_aid || false;
      transformed.certificate_of_good_conduct = data.certifications.good_conduct || false;
      transformed.can_drive = data.certifications.can_drive || false;
    }

    // Salary Expectations
    if (data.salary) {
      transformed.salary_expectation = parseFloat(data.salary.amount || data.salary.expectation || 0);
      transformed.salary_frequency = data.salary.frequency || 'monthly';
    }

    // Skills
    if (data.skills) {
      transformed.skills = Array.isArray(data.skills) ? data.skills : [data.skills];
    }

    // Traits
    if (data.traits) {
      transformed.traits = Array.isArray(data.traits) ? data.traits : [data.traits];
    }

    // Availability
    if (data.availability) {
      transformed.available_from = data.availability.from || data.availability.available_from;
      transformed.availability = data.availability.schedule || data.availability;
    }
  }

  return transformed;
}

// Transform individual step data
function transformStepData(stepId: string, data: any): any {
  const fullData: ProfileSetupData = { [stepId]: data };
  return transformProfileData(fullData);
}

// Reconstruct profile data from backend format
function reconstructProfileData(profile: any): ProfileSetupData {
  const data: ProfileSetupData = {};
  const profileType = localStorage.getItem('profile_type');

  // Common fields
  // Location
  if (profile.town || profile.area || profile.address) {
    data.location = {
      town: profile.town,
      area: profile.area,
      address: profile.address
    };
  }

  // Religion
  if (profile.religion) {
    data.religion = profile.religion;
  }

  // Bio
  if (profile.bio) {
    data.bio = profile.bio;
  }

  // Photos
  if (profile.photos) {
    data.photos = profile.photos;
  }

  // Household-specific fields
  if (profileType === 'household' || profileType === 'household') {
    // Children
    if (profile.has_children !== undefined || profile.number_of_kids) {
      data.children = {
        has_children: profile.has_children,
        number_of_kids: profile.number_of_kids,
        new_borns_under_one: profile.new_borns_under_one,
        ages: profile.kids_ages
      };
    }

    // Service Type
    if (profile.service_type || profile.live_in !== undefined) {
      data.nannytype = {
        type: profile.service_type,
        live_in: profile.live_in
      };
    }

    // Chores
    if (profile.chores) {
      data.chores = profile.chores;
    }

    // Pets
    if (profile.has_pets !== undefined || profile.pet_types) {
      data.pets = {
        has_pets: profile.has_pets,
        types: profile.pet_types
      };
    }

    // Budget
    if (profile.budget_min || profile.budget_max) {
      data.budget = {
        min: profile.budget_min,
        max: profile.budget_max,
        frequency: profile.salary_frequency
      };
    }

    // House Size
    if (profile.house_size) {
      data.housesize = profile.house_size;
    }
  }

  // Househelp-specific fields
  if (profileType === 'househelp') {
    // Gender
    if (profile.gender || profile.date_of_birth) {
      data.gender = {
        gender: profile.gender,
        date_of_birth: profile.date_of_birth
      };
    }

    // Househelp Type
    if (profile.househelp_type) {
      data.nannytype = profile.househelp_type;
    }

    // Years of Experience
    if (profile.years_of_experience !== undefined) {
      data.experience = profile.years_of_experience;
    }

    // Work with Kids
    if (profile.can_work_with_kids !== undefined) {
      data.workwithkids = {
        can_work: profile.can_work_with_kids,
        age_range: profile.children_age_range,
        talents: profile.talent_with_kids || []
      };
    }

    // Work with Pets
    if (profile.can_work_with_pets !== undefined || profile.pets) {
      data.workwithpets = {
        can_work: profile.can_work_with_pets,
        pets: profile.pets || []
      };
    }

    // Languages
    if (profile.languages) {
      data.languages = profile.languages;
    }

    // My Kids
    if (profile.my_child_preference || profile.number_of_concurrent_children) {
      data.mykids = {
        preference: profile.my_child_preference,
        number: profile.number_of_concurrent_children
      };
    }

    // Certifications
    if (profile.first_aid_certificate !== undefined || profile.certificate_of_good_conduct !== undefined || profile.can_drive !== undefined) {
      data.certifications = {
        first_aid: profile.first_aid_certificate,
        good_conduct: profile.certificate_of_good_conduct,
        can_drive: profile.can_drive
      };
    }

    // Salary
    if (profile.salary_expectation || profile.salary_frequency) {
      data.salary = {
        expectation: profile.salary_expectation,
        frequency: profile.salary_frequency
      };
    }

    // Skills
    if (profile.skills) {
      data.skills = profile.skills;
    }

    // Traits
    if (profile.traits) {
      data.traits = profile.traits;
    }

    // Availability
    if (profile.available_from || profile.availability) {
      data.availability = {
        available_from: profile.available_from,
        schedule: profile.availability
      };
    }
  }

  return data;
}

// Calculate which step was last completed based on available data
function calculateLastCompletedStep(data: ProfileSetupData): number {
  const profileType = localStorage.getItem('profile_type');
  
  // Household step order
  const householdStepOrder = [
    'location',
    'children', 
    'nannytype',
    'chores',
    'pets',
    'budget',
    'religion',
    'housesize',
    'bio',
    'photos'
  ];

  // Househelp step order (based on the 13 steps in househelp.tsx)
  const househelpStepOrder = [
    'nannytype',      // Service Type
    'location',       // Location
    'gender',         // Gender & Age
    'experience',     // Experience
    'workwithkids',   // Work with Kids
    'workwithpets',   // Work with Pets
    'languages',      // Languages
    'mykids',         // My Kids
    'certifications', // Certifications
    'salary',         // Salary Expectations
    'religion',       // Religion & Beliefs
    'bio',            // Bio
    'photos'          // Photos
  ];

  const stepOrder = profileType === 'househelp' ? househelpStepOrder : householdStepOrder;

  let lastStep = 0;
  for (let i = 0; i < stepOrder.length; i++) {
    if (data[stepOrder[i] as keyof ProfileSetupData]) {
      lastStep = i + 1;
    }
  }

  return lastStep;
}
