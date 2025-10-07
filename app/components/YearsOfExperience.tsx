import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleApiError } from '../utils/errorMessages';
import { API_BASE_URL } from '~/config/api';

const YearsOfExperience = () => {
    const [years, setYears] = useState<number | null>(null);
    const [customYears, setCustomYears] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const experienceOptions = [
        { value: 0, label: 'I have no experience' },
        { value: 1, label: '1 Year' },
        { value: 2, label: '2 Years' },
        { value: 3, label: '3 Years' },
        { value: 4, label: '4 Years' },
        { value: 5, label: '5 Years' },
        { value: 6, label: 'More than 5 years' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (years === null) {
            setError('Please select your years of experience');
            return;
        }

        // If "More than 5 years" is selected but no custom value provided
        if (years === 6 && !customYears) {
            setError('Please specify your years of experience');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const finalYears = years === 6 ? parseInt(customYears, 10) : years;
            
            const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    updates: {
                        years_of_experience: finalYears
                    }
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }
            
            setSuccess('Your information has been saved successfully!');
            // Navigate to next step or show success message
            // navigate('/next-step');
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(handleApiError(err, 'yearsOfExperience', 'Failed to save your information. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
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
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Years of Experience</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {experienceOptions.map((option) => (
                            <label 
                                key={option.value}
                                className={`flex items-center justify-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                                    years === option.value 
                                        ? 'border-primary-500 bg-primary-50 text-primary-900' 
                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="yearsOfExperience"
                                    value={option.value}
                                    checked={years === option.value}
                                    onChange={() => setYears(option.value)}
                                    className="form-radio h-5 w-5 text-primary-600 border-gray-300"
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>

                    {years === 6 && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                How many years of experience do you have?
                            </label>
                            <input
                                type="number"
                                min="6"
                                value={customYears}
                                onChange={(e) => setCustomYears(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Enter years of experience"
                            />
                        </div>
                    )}
                </div>

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

export default YearsOfExperience;
