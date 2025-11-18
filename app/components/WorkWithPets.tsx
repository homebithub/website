import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { handleApiError } from '../utils/errorMessages';
import { API_BASE_URL } from '~/config/api';

type PetPreference = 'with_pets' | 'no_pets';
type PetType = 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'small_mammal' | 'other';

// Validation function for other pets input
const validateOtherPets = (input: string): boolean => {
    if (!input.trim()) return false;
    // Only allow letters, spaces, and hyphens
    return /^[a-zA-Z\s-]+$/.test(input);
};

const WorkWithPets = () => {
    const [petPreference, setPetPreference] = useState<PetPreference | null>(null);
    const [selectedPets, setSelectedPets] = useState<PetType[]>([]);
    const [otherPets, setOtherPets] = useState('');
    const [otherPetsError, setOtherPetsError] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOtherPetsInput, setShowOtherPetsInput] = useState(false);
    const navigate = useNavigate();

    const petTypes = [
        { value: 'dog' as const, label: 'Dogs' },
        { value: 'cat' as const, label: 'Cats' },
        { value: 'bird' as const, label: 'Birds' },
        { value: 'fish' as const, label: 'Fish' },
        { value: 'reptile' as const, label: 'Reptiles' },
        { value: 'small_mammal' as const, label: 'Small Mammals (hamsters, guinea pigs, etc.)' },
        { value: 'other' as const, label: 'Other Pets' },
    ];

    const togglePetType = (petType: PetType) => {
        const newSelectedPets = selectedPets.includes(petType)
            ? selectedPets.filter(p => p !== petType)
            : [...selectedPets, petType];
            
        setSelectedPets(newSelectedPets);
        
        // Handle showing/hiding other pets input
        if (petType === 'other') {
            setShowOtherPetsInput(!selectedPets.includes('other'));
            if (!newSelectedPets.includes('other')) {
                setOtherPets('');
                setOtherPetsError('');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (petPreference === null) {
            setError('Please select a pet work preference');
            return;
        }

        if (petPreference === 'with_pets') {
            if (selectedPets.length === 0) {
                setError('Please select at least one type of pet you can work with');
                return;
            }
            
            // Validate other pets input if 'other' is selected
            if (selectedPets.includes('other') && !validateOtherPets(otherPets)) {
                setOtherPetsError('Please enter valid pet types (letters, spaces, and hyphens only)');
                return;
            }
            
            setOtherPetsError('');
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            // Prepare the pet types, including the custom 'other' value if provided
            let petTypes: (PetType | string)[] = [...selectedPets];
            if (selectedPets.includes('other') && otherPets.trim()) {
                // Remove 'other' and add the custom value
                petTypes = [...selectedPets.filter((p): p is Exclude<PetType, 'other'> => p !== 'other'), otherPets.trim()];
            }
            
            const updates = {
                can_work_with_pets: petPreference === 'with_pets',
                pet_types: petPreference === 'with_pets' ? petTypes.join(',') : '',
            };

            const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    updates,
                    _step_metadata: {
                        step_id: "workwithpets",
                        step_number: 8,
                        is_completed: true
                    }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update profile');
            
            setSuccess('Your pet preferences have been saved successfully!');
            // navigate('/next-step');
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(handleApiError(err, 'workWithPets', 'Failed to save your preferences. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">🐾 Work with Pets</h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                Are you comfortable working with pets?
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Pet Work Preferences</h1>
            
            {error && (
                <div className="mb-6 p-4 rounded-xl text-sm font-semibold border-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30">
                    ⚠️ {error}
                </div>
            )}
            
            {success && (
                <div className="mb-6 p-4 rounded-xl text-sm font-semibold border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30">
                    ✓ {success}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Pet Work Preference</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                            petPreference === 'with_pets' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="petPreference"
                                checked={petPreference === 'with_pets'}
                                onChange={() => setPetPreference('with_pets')}
                                className="form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <span className="text-gray-900 dark:text-gray-100">I can work with pets</span>
                        </label>
                        
                        <label className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                            petPreference === 'no_pets' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="petPreference"
                                checked={petPreference === 'no_pets'}
                                onChange={() => setPetPreference('no_pets')}
                                className="form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <span className="text-gray-900 dark:text-gray-100">I prefer not to work with pets</span>
                        </label>
                    </div>
                </div>

                {petPreference === 'with_pets' && (
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-purple-700 dark:text-purple-400 mb-3">
                            What types of pets can you work with?
                        </h3>
                        <div className="space-y-3">
                            {petTypes.map(({ value, label }) => (
                                <div key={value}>
                                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                                        selectedPets.includes(value) ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                    }`}>
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
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
                                                className="w-full h-14 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
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

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            </form>
        </div>
    );
};

export default WorkWithPets;
