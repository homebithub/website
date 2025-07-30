import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

            const response = await fetch(`http://localhost:8080/api/v1/househelps/me/fields`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ updates })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update profile');
            
            setSuccess('Your pet preferences have been saved successfully!');
            // navigate('/next-step');
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(err.message || 'Failed to save your preferences. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pet Work Preferences</h1>
            
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md text-sm">
                    {success}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Pet Work Preference</h2>
                    <div className="space-y-4">
                        <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                            petPreference === 'with_pets' 
                                ? 'border-primary-500 bg-primary-50 text-primary-900' 
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                            <input
                                type="radio"
                                name="petPreference"
                                checked={petPreference === 'with_pets'}
                                onChange={() => setPetPreference('with_pets')}
                                className="form-radio h-5 w-5 text-primary-600 border-gray-300"
                            />
                            <span>I can work with pets</span>
                        </label>
                        
                        <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                            petPreference === 'no_pets' 
                                ? 'border-primary-500 bg-primary-50 text-primary-900' 
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                            <input
                                type="radio"
                                name="petPreference"
                                checked={petPreference === 'no_pets'}
                                onChange={() => setPetPreference('no_pets')}
                                className="form-radio h-5 w-5 text-primary-600 border-gray-300"
                            />
                            <span>I prefer not to work with pets</span>
                        </label>
                    </div>
                </div>

                {petPreference === 'with_pets' && (
                    <div className="space-y-4">
                        <h3 className="text-md font-medium text-gray-900">
                            What types of pets can you work with? (Select all that apply)
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {petTypes.map((pet) => (
                                <div key={pet.value}>
                                    <label 
                                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                                            selectedPets.includes(pet.value)
                                                ? 'border-primary-500 bg-primary-50 text-primary-900'
                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPets.includes(pet.value)}
                                            onChange={() => togglePetType(pet.value)}
                                            className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />                                  
                                        <span>{pet.label}</span>
                                    </label>
                                    
                                    {pet.value === 'other' && showOtherPetsInput && (
                                        <div className="mt-4 w-full">
                                            <input
                                                type="text"
                                                value={otherPets}
                                                onChange={(e) => setOtherPets(e.target.value)}
                                                placeholder="Please specify the types of pets"
                                                className={`w-full p-4 rounded-lg border text-lg font-medium ${
                                                    otherPetsError 
                                                        ? 'border-red-500 bg-red-50 text-red-900' 
                                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                                } shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                                            />
                                            {otherPetsError && (
                                                <p className="mt-1 text-sm text-red-600">{otherPetsError}</p>
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
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
                            loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Saving...' : 'Continue'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WorkWithPets;
