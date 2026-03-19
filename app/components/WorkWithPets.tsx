import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { handleApiError } from '../utils/errorMessages';
import { profileService as grpcProfileService } from '~/services/grpc/authServices';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';
import { useOnboardingOptionsContext } from '~/contexts/OnboardingOptionsContext';

type PetPreference = 'with_pets' | 'no_pets';
type PetType = 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'small_mammal' | 'other';

// Validation function for other pets input
const validateOtherPets = (input: string): boolean => {
    if (!input.trim()) return false;
    // Only allow letters, spaces, and hyphens
    return /^[a-zA-Z\s-]+$/.test(input);
};

const WorkWithPets = () => {
    const { markDirty, markClean, updateStepData, profileData } = useProfileSetup();
    const { options, loading: optionsLoading } = useOnboardingOptionsContext();
    const [petPreference, setPetPreference] = useState<PetPreference | null>(null);
    const [selectedPets, setSelectedPets] = useState<PetType[]>([]);
    const [otherPets, setOtherPets] = useState('');
    const [otherPetsError, setOtherPetsError] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOtherPetsInput, setShowOtherPetsInput] = useState(false);
    const navigate = useNavigate();

    const petTypes = options?.pet_types.map(pt => ({
        value: pt.name.toLowerCase().replace(/\s+/g, '_') as PetType,
        label: pt.name
    })) || [];

    // Populate from context (instant on back-nav)
    useEffect(() => {
        const cached = profileData.workwithpets;
        if (cached) {
            if (cached.preference) setPetPreference(cached.preference);
            else if (cached.can_work !== undefined) setPetPreference(cached.can_work ? 'with_pets' : 'no_pets');
            else if (cached.can_work_with_pets !== undefined) setPetPreference(cached.can_work_with_pets ? 'with_pets' : 'no_pets');
            if (cached.pets?.length) setSelectedPets(cached.pets);
        }
    }, [profileData.workwithpets]);

    const autoSave = async (pref: PetPreference, pets: PetType[], otherValue?: string) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAccessTokenFromCookies();
            if (!token) throw new Error('Authentication token not found');

            let petTypesList: (PetType | string)[] = [...pets];
            if (pets.includes('other') && otherValue?.trim()) {
                petTypesList = [...pets.filter((p): p is Exclude<PetType, 'other'> => p !== 'other'), otherValue.trim()];
            }
            
            const updates = {
                can_work_with_pets: pref === 'with_pets',
                pet_types: pref === 'with_pets' ? petTypesList.join(',') : '',
            };

            await grpcProfileService.updateHousehelpFields('', 'househelp', updates,
                { step_id: 'workwithpets', step_number: 8, is_completed: true }
            );
            
            markClean();
            updateStepData('workwithpets', { preference: pref, pets });
            setSuccess('Your pet preferences have been saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(handleApiError(err, 'workWithPets', 'Failed to save your preferences. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceChange = async (pref: PetPreference) => {
        setPetPreference(pref);
        markDirty();
        if (pref === 'no_pets') {
            await autoSave(pref, []);
        }
    };

    const togglePetType = async (petType: PetType) => {
        const newSelectedPets = selectedPets.includes(petType)
            ? selectedPets.filter(p => p !== petType)
            : [...selectedPets, petType];
            
        setSelectedPets(newSelectedPets);
        markDirty();
        
        // Handle showing/hiding other pets input
        if (petType === 'other') {
            setShowOtherPetsInput(!selectedPets.includes('other'));
            if (!newSelectedPets.includes('other')) {
                setOtherPets('');
                setOtherPetsError('');
            }
        }

        // Auto-save if we have pets selected and 'other' is not selected (no text input needed)
        if (petPreference === 'with_pets' && newSelectedPets.length > 0 && !newSelectedPets.includes('other')) {
            await autoSave('with_pets', newSelectedPets);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedPets.includes('other') && !validateOtherPets(otherPets)) {
            setOtherPetsError('Please enter valid pet types (letters, spaces, and hyphens only)');
            return;
        }
        setOtherPetsError('');
        await autoSave('with_pets', selectedPets, otherPets);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">🐾 Work with Pets</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Are you comfortable working with pets?
            </p>
            
            {error && <ErrorAlert message={error} />}
            
            {success && <SuccessAlert message={success} />}
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Pet Work Preference</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                            petPreference === 'with_pets' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="petPreference"
                                checked={petPreference === 'with_pets'}
                                onChange={() => handlePreferenceChange('with_pets')}
                                className="form-radio h-4 w-4 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <span className="text-gray-900 dark:text-gray-100">I can work with pets</span>
                        </label>
                        
                        <label className={`flex items-center justify-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                            petPreference === 'no_pets' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="petPreference"
                                checked={petPreference === 'no_pets'}
                                onChange={() => handlePreferenceChange('no_pets')}
                                className="form-radio h-4 w-4 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <span className="text-gray-900 dark:text-gray-100">I prefer not to work with pets</span>
                        </label>
                    </div>
                </div>

                {petPreference === 'with_pets' && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                            What types of pets can you work with?
                        </h3>
                        <div className="space-y-3">
                            {petTypes.map(({ value, label }) => (
                                <div key={value}>
                                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                                        selectedPets.includes(value) ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                    }`}>
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                            selectedPets.includes(value) ? 'border-purple-500 bg-purple-500' : 'border-purple-300 dark:border-purple-500/50'
                                        }`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedPets.includes(value)}
                                                onChange={() => togglePetType(value)}
                                                className="sr-only"
                                            />
                                            {selectedPets.includes(value) && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-gray-900 dark:text-gray-100">{label}</span>
                                    </label>
                                    {value === 'other' && showOtherPetsInput && (
                                        <div className="mt-3 ml-10">
                                            <input
                                                type="text"
                                                value={otherPets}
                                                onChange={(e) => setOtherPets(e.target.value)}
                                                placeholder="e.g., Rabbits, Ferrets"
                                                className="w-full h-10 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
                                            />
                                            {otherPetsError && (
                                                <p className="text-red-600 dark:text-red-400 text-sm font-semibold mt-1">⚠️ {otherPetsError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showOtherPetsInput && (
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    💾 Save
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default WorkWithPets;
