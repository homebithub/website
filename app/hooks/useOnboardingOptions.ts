import { useState, useEffect } from 'react';
import { onboardingOptionsService } from '~/services/grpc/authServices';

// Type definitions for onboarding options
export interface Language {
  id: number;
  name: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

export interface Certification {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface Skill {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface Chore {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface HouseSize {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface Religion {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface ExperienceLevel {
  id: number;
  label: string;
  min_years: number | null;
  max_years: number | null;
  display_order: number;
  is_active: boolean;
}

export interface SalaryRange {
  id: number;
  frequency: string;
  label: string;
  min_amount: number | null;
  max_amount: number | null;
  is_negotiable: boolean;
  display_order: number;
  is_active: boolean;
}

export interface PetType {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface PetTrait {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface ChildrenAgeRange {
  id: number;
  label: string;
  min_age: number | null;
  max_age: number | null;
  display_order: number;
  is_active: boolean;
}

export interface ChildrenCapacity {
  id: number;
  label: string;
  min_count: number | null;
  max_count: number | null;
  display_order: number;
  is_active: boolean;
}

export interface HouseholdSizePreference {
  id: number;
  value: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

export interface LocationTypePreference {
  id: number;
  value: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

export interface FamilyTypePreference {
  id: number;
  value: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

export interface ReferenceRelationship {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface OnboardingStep {
  id: number;
  step_id: string;
  profile_type: string;
  title: string;
  description: string;
  step_number: number;
  is_skippable: boolean;
  is_active: boolean;
}

export interface OnboardingOptions {
  languages: Language[];
  certifications: Certification[];
  skills: Skill[];
  chores: Chore[];
  house_sizes: HouseSize[];
  religions: Religion[];
  experience_levels: ExperienceLevel[];
  salary_ranges: SalaryRange[];
  pet_types: PetType[];
  pet_traits: PetTrait[];
  children_age_ranges: ChildrenAgeRange[];
  children_capacities: ChildrenCapacity[];
  household_size_preferences: HouseholdSizePreference[];
  location_type_preferences: LocationTypePreference[];
  family_type_preferences: FamilyTypePreference[];
  reference_relationships: ReferenceRelationship[];
  onboarding_steps: OnboardingStep[];
}

interface UseOnboardingOptionsResult {
  options: OnboardingOptions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function normalizeSalaryRanges(
  ranges: SalaryRange[],
  frequency?: 'daily' | 'weekly' | 'monthly'
): SalaryRange[] {
  const normalizedFrequency = (frequency || '').toLowerCase();

  const filtered = normalizedFrequency
    ? ranges.filter((range) => String(range.frequency || '').toLowerCase() === normalizedFrequency)
    : ranges;

  const deduped = new Map<string, SalaryRange>();

  for (const range of filtered) {
    const key = [
      String(range.frequency || '').toLowerCase(),
      String(range.label || '').trim(),
      range.min_amount ?? 'null',
      range.max_amount ?? 'null',
      range.is_negotiable ? '1' : '0',
    ].join('|');

    const existing = deduped.get(key);
    if (!existing) {
      deduped.set(key, range);
      continue;
    }

    const existingHasTimestamps = Boolean((existing as any).created_at || (existing as any).updated_at);
    const currentHasTimestamps = Boolean((range as any).created_at || (range as any).updated_at);

    if (!existingHasTimestamps && currentHasTimestamps) {
      deduped.set(key, range);
      continue;
    }

    if (range.display_order < existing.display_order) {
      deduped.set(key, range);
    }
  }

  return Array.from(deduped.values()).sort((a, b) => {
    const orderDiff = (a.display_order || 0) - (b.display_order || 0);
    if (orderDiff !== 0) return orderDiff;
    return (a.min_amount || 0) - (b.min_amount || 0);
  });
}

/**
 * Hook to fetch all onboarding options from the backend
 * Uses the optimized GetAllOptions endpoint for a single request
 */
export function useOnboardingOptions(profileType: 'househelp' | 'household'): UseOnboardingOptionsResult {
  const [options, setOptions] = useState<OnboardingOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await onboardingOptionsService.getAllOptions(profileType);
      setOptions(data);
    } catch (err) {
      console.error('Error fetching onboarding options:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [profileType]);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions,
  };
}

/**
 * Hook to fetch salary ranges for a specific frequency
 */
export function useSalaryRanges(frequency?: 'daily' | 'weekly' | 'monthly') {
  const [ranges, setRanges] = useState<SalaryRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRanges = async () => {
      try {
        setLoading(true);
        setError(null);
        setRanges([]);

        const data = await onboardingOptionsService.getSalaryRanges(frequency || '');
        const rawRanges = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        if (!cancelled) {
          setRanges(normalizeSalaryRanges(rawRanges, frequency));
        }
      } catch (err) {
        console.error('Error fetching salary ranges:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch salary ranges');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRanges();

    return () => {
      cancelled = true;
    };
  }, [frequency]);

  return { ranges, loading, error };
}
