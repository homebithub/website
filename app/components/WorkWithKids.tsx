import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { handleApiError } from '../utils/errorMessages';
import { API_BASE_URL } from '~/config/api';

type WorkPreference = 'with_kids' | 'chores_only';
type AgeRange = '0-2' | '2-5' | '5-10' | '10+';
type ChildrenCapacity = '1-2' | '2-4' | '5+';

const WorkWithKids = () => {
    const [workPreference, setWorkPreference] = useState<WorkPreference | null>(null);
    const [selectedAges, setSelectedAges] = useState<AgeRange[]>([]);
    const [selectedCapacities, setSelectedCapacities] = useState<ChildrenCapacity[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const ageRanges = [
        { value: '0-2' as const, label: '0-2 years' },
        { value: '2-5' as const, label: '2-5 years' },
        { value: '5-10' as const, label: '5-10 years' },
        { value: '10+' as const, label: '10+ years' },
    ];

    const capacities = [
        { value: '1-2' as const, label: '1-2 children' },
        { value: '2-4' as const, label: '2-4 children' },
        { value: '5+' as const, label: '5+ children' },
    ];

    const toggleAgeRange = (age: AgeRange) => {
        setSelectedAges(prev => 
            prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
        );
    };

    const toggleCapacity = (capacity: ChildrenCapacity) => {
        setSelectedCapacities(prev => 
            prev.includes(capacity) ? prev.filter(c => c !== capacity) : [...prev, capacity]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (workPreference === null) {
            setError('Please select a work preference');
            return;
        }

        if (workPreference === 'with_kids' && selectedAges.length === 0) {
            setError('Please select at least one age range');
            return;
        }

        if (workPreference === 'with_kids' && selectedCapacities.length === 0) {
            setError('Please select at least one capacity option');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            const updates = {
                can_work_with_kid: workPreference === 'with_kids',
                children_age_range: workPreference === 'with_kids' ? selectedAges.join(',') : '',
                number_of_concurrent_children: workPreference === 'with_kids' 
                    ? Math.max(...selectedCapacities.map(c => c === '5+' ? 5 : parseInt(c.split('-')[1])))
                    : 0
            };

            const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ updates })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update profile');
            
            setSuccess('Your preferences have been saved successfully!');
            // navigate('/next-step');
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(handleApiError(err, 'workWithKids', 'Failed to save your preferences. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">👶 Work with Kids</h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                Can you care for children?
            </p>
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
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Work Preference</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                            workPreference === 'with_kids' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="workPreference"
                                checked={workPreference === 'with_kids'}
                                onChange={() => setWorkPreference('with_kids')}
                                className="form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <span>I can work with / have worked with children</span>
                        </label>
                        
                        <label className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                            workPreference === 'chores_only' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="workPreference"
                                checked={workPreference === 'chores_only'}
                                onChange={() => setWorkPreference('chores_only')}
                                className="form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <span>I am only interested in chores</span>
                        </label>
                    </div>
                </div>

                {workPreference === 'with_kids' && (
                    <>
                        <div className="space-y-4">
                            <h3 className="text-md font-medium text-gray-900">
                                What is the age range of the children you can/have worked with?
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {ageRanges.map((age) => (
                                    <label 
                                        key={age.value}
                                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                                            selectedAges.includes(age.value) ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                            selectedAges.includes(age.value) ? 'border-purple-500 bg-purple-500' : 'border-purple-300 dark:border-purple-500/50'
                                        }`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedAges.includes(age.value)}
                                                onChange={() => toggleAgeRange(age.value)}
                                                className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            />
                                        </div>
                                        <span>{age.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-md font-medium text-gray-900">
                                How many children can you look after at the same time?
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {capacities.map((capacity) => (
                                    <label 
                                        key={capacity.value}
                                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                                            selectedCapacities.includes(capacity.value) ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                            selectedCapacities.includes(capacity.value) ? 'border-purple-500 bg-purple-500' : 'border-purple-300 dark:border-purple-500/50'
                                        }`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCapacities.includes(capacity.value)}
                                                onChange={() => toggleCapacity(capacity.value)}
                                                className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                            />
                                        </div>
                                        <span>{capacity.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>
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
                                💾 Continue
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WorkWithKids;
