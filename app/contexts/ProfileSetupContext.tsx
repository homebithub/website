import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from '~/config/api';

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
  saveStepToBackend: (stepId: string, data: any, stepNumber: number) => Promise<void>;
  saveProfileToBackend: () => Promise<void>;
  loadProfileFromBackend: () => Promise<void>;
  clearProfileData: () => void;
  isLoading: boolean;
  error: string | null;
  lastCompletedStep: number;
}

const ProfileSetupContext = createContext<ProfileSetupContextType | undefined>(undefined);

const fallbackProfileSetupContext: ProfileSetupContextType = {
  profileData: {},
  updateStepData: () => {},
  saveStepToBackend: async () => {},
  saveProfileToBackend: async () => {},
  loadProfileFromBackend: async () => {},
  clearProfileData: () => {},
  isLoading: false,
  error: null,
  lastCompletedStep: 0,
};

let hasWarnedMissingProfileSetupProvider = false;

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
  // Backend will handle saving to both profile and steps tracking tables
  const saveStepToBackend = async (stepId: string, data: any, stepNumber: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const profileType = localStorage.getItem('profile_type');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Single call to profile update endpoint - backend handles step tracking
      const endpoint = profileType === 'househelp' 
        ? API_ENDPOINTS.profile.househelp.update 
        : API_ENDPOINTS.profile.household.update;

      const stepPayload = transformStepData(stepId, data);
      
      // Househelp endpoint expects { updates: {...}, _step_metadata: {...} }
      // Household endpoint expects flat fields with _step_metadata
      const stepMetadata = {
        step_id: stepId,
        step_number: stepNumber,
        is_completed: true
      };

      const payload = profileType === 'househelp'
        ? { updates: stepPayload, _step_metadata: stepMetadata }
        : { ...stepPayload, _step_metadata: stepMetadata };

      const method = profileType === 'househelp' ? 'PATCH' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save step');
      }

      // Update local state
      updateStepData(stepId, data);
      setLastCompletedStep(stepNumber);
      
      console.log(`Step ${stepId} (${stepNumber}) saved successfully`);
      
    } catch (err: any) {
      console.error(`Error saving step ${stepId}:`, err);
      setError(err.message || 'Failed to save step');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing profile data from backend
  const loadProfileFromBackend = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const profileType = localStorage.getItem('profile_type');
      
      if (!token) {
        console.log('No token found, skipping profile load');
        return;
      }

      // Fetch step tracking data from new endpoint
      const stepsResponse = await fetch(`${API_BASE_URL}/api/v1/profile-setup-steps`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch progress tracking data
      const progressResponse = await fetch(`${API_BASE_URL}/api/v1/profile-setup-progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let lastCompleted = 0;
      if (progressResponse.ok) {
        const progressResponseBody = await progressResponse.json();
        const progressData = progressResponseBody?.data || progressResponseBody || {};
        lastCompleted = progressData.last_completed_step || 0;
      }

      if (stepsResponse.ok) {
        const responseData = await stepsResponse.json();
        const steps = Array.isArray(responseData.data?.data) ? responseData.data.data : [];
        console.log('Steps tracking data:', steps);
        
        // Set last completed step from tracking data if available, otherwise use progress
        setLastCompletedStep(lastCompleted);
        
        // Reconstruct profile data from steps
        const reconstructed: ProfileSetupData = {};
        steps.forEach((step: any) => {
          if (hasData(step.data) && (step.is_completed || step.is_skipped)) {
            reconstructed[step.step_id as keyof ProfileSetupData] = step.data;
          }
        });
        
        setProfileData(reconstructed);
        console.log('Profile loaded from steps tracking', { 
          lastCompletedStep: lastCompleted,
          profileData: reconstructed 
        });
      } else if (stepsResponse.status === 404) {
        // No steps tracked yet, try loading from profile (legacy)
        console.log('No steps tracking found, loading from profile');
        
        const endpoint = profileType === 'househelp' 
          ? API_ENDPOINTS.profile.househelp.me 
          : API_ENDPOINTS.profile.household.me;

        const profileResponse = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          console.log('Raw profile from backend:', profile);
          
          // Convert backend data back to step format
          const reconstructedData = reconstructProfileData(profile);
          console.log('Reconstructed profile data:', reconstructedData);
          
          setProfileData(reconstructedData);
          
          // Don't calculate - start from step 0 if no tracking exists
          setLastCompletedStep(0);
          console.log('Profile loaded successfully (legacy mode), starting from step 0');
        } else {
          console.log('No existing profile found, starting fresh');
          setLastCompletedStep(0);
        }
      }
      
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty deps - only created once

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
        ? API_ENDPOINTS.profile.househelp.update 
        : API_ENDPOINTS.profile.household.update;

      // Transform the data to match backend expectations
      const transformed = transformProfileData(profileData);

      // Househelp endpoint expects { updates: {...} }, household expects flat fields
      const payload = profileType === 'househelp'
        ? { updates: transformed }
        : transformed;

      const method = profileType === 'househelp' ? 'PATCH' : 'PUT';

      const response = await fetch(endpoint, {
        method,
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
    if (typeof window !== 'undefined' && !hasWarnedMissingProfileSetupProvider) {
      hasWarnedMissingProfileSetupProvider = true;
      console.error('useProfileSetup used outside ProfileSetupProvider. Falling back to no-op context.');
    }
    return fallbackProfileSetupContext;
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
    transformed.mapbox_id = data.location.mapbox_id;
    // Populate the location JSONB field so it persists in the DB
    transformed.location = {
      place: data.location.place || data.location.name || data.location.town || '',
      name: data.location.name || data.location.place || data.location.town || '',
      mapbox_id: data.location.mapbox_id || '',
      feature_type: data.location.feature_type || 'place',
    };
  }

  // Religion
  if (data.religion) {
    transformed.religion = data.religion.preference || data.religion;
  }

  // Bio
  if (data.bio) {
    transformed.bio = data.bio.text || data.bio;
  }

  // Photos — must always be an array for the text[] column
  if (data.photos) {
    const rawPhotos = data.photos.urls || data.photos;
    transformed.photos = Array.isArray(rawPhotos) ? rawPhotos : [];
  }

  // Household-specific fields
  if (profileType === 'household' || profileType === 'household') {
    // Children - stored in separate household_kids table, not in profile

    // Service Type / Nanny Type
    if (data.nannytype) {
      transformed.service_type = data.nannytype.type;
      transformed.live_in = data.nannytype.live_in;
    }

    // Chores
    if (data.chores) {
      transformed.chores = data.chores.list || data.chores;
    }

    // Pets - stored in separate pets table, not in profile

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
    if (hasData(data.nannytype)) {
      const househelpType = data.nannytype?.type || (typeof data.nannytype === 'string' ? data.nannytype : undefined);
      if (househelpType) {
        transformed.househelp_type = househelpType;
      }
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
    // Children - loaded separately from household_kids table

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

    // Pets - loaded separately from pets table

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

// Helper to check if a value has meaningful data
function hasData(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
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
    'location',       // Location
    'nannytype',      // Service Type
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
    const stepData = data[stepOrder[i] as keyof ProfileSetupData];
    if (hasData(stepData)) {
      lastStep = i + 1;
    } else {
      // Stop at first incomplete step
      break;
    }
  }

  console.log('Calculated last completed step:', lastStep, 'from data:', data);
  return lastStep;
}
