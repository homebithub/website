import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { handleApiError } from '../../utils/errorMessages';
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
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm">
                    {success}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Work Preference</h2>
                    <div className="space-y-4">
                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer shadow-sm text-lg font-medium ${
                            workPreference === 'with_kids' 
                                ? 'border-primary-500 bg-primary-50 text-primary-900' 
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                            <input
                                type="radio"
                                name="workPreference"
                                checked={workPreference === 'with_kids'}
                                onChange={() => setWorkPreference('with_kids')}
                                className="form-radio h-5 w-5 text-primary-600 border-gray-300"
                            />
                            <span>I can work with / have worked with children</span>
                        </label>
                        
                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer shadow-sm text-lg font-medium ${
                            workPreference === 'chores_only' 
                                ? 'border-primary-500 bg-primary-50 text-primary-900' 
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                            <input
                                type="radio"
                                name="workPreference"
                                checked={workPreference === 'chores_only'}
                                onChange={() => setWorkPreference('chores_only')}
                                className="form-radio h-5 w-5 text-primary-600 border-gray-300"
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
                                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer shadow-sm text-lg font-medium ${
                                            selectedAges.includes(age.value)
                                                ? 'border-primary-500 bg-primary-50 text-primary-900'
                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAges.includes(age.value)}
                                            onChange={() => toggleAgeRange(age.value)}
                                            className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
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
                                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer shadow-sm text-lg font-medium ${
                                            selectedCapacities.includes(capacity.value)
                                                ? 'border-primary-500 bg-primary-50 text-primary-900'
                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCapacities.includes(capacity.value)}
                                            onChange={() => toggleCapacity(capacity.value)}
                                            className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
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
                        className={`w-full flex justify-center py-1.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${
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

export default WorkWithKids;
