import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { handleApiError } from '../utils/errorMessages';
import { API_BASE_URL } from '~/config/api';

const YearsOfExperience = () => {
    const [years, setYears] = useState<number>(0);
    const [customYears, setCustomYears] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Load existing data
    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.years_of_experience !== undefined) {
                        const totalYears = data.years_of_experience;
                        if (totalYears > 5) {
                            setYears(6);
                            setCustomYears(totalYears.toString());
                        } else {
                            setYears(Math.floor(totalYears));
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load experience data:', err);
            }
        };

        loadData();
    }, []);

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
                    },
                    _step_metadata: {
                        step_id: "experience",
                        step_number: 4,
                        is_completed: true
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
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">💼 Experience</h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                How many years of experience do you have?
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
                    <div className="grid grid-cols-2 gap-3">
                        {experienceOptions.map((option) => (
                            <label 
                                key={option.value}
                                className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                                    years === option.value 
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                                        : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="yearsOfExperience"
                                    value={option.value}
                                    checked={years === option.value}
                                    onChange={() => setYears(option.value)}
                                    className="form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>

                    {years === 6 && (
                        <div className="mt-4">
                            <label htmlFor="customYears" className="block text-base font-bold text-purple-700 dark:text-purple-400 mb-3">
                                Specify years of experience
                            </label>
                            <input
                                type="number"
                                id="customYears"
                                value={customYears}
                                onChange={(e) => setCustomYears(e.target.value)}
                                min="6"
                                max="50"
                                className="w-full h-14 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
                                placeholder="Enter years (6-50)"
                                required
                            />
                        </div>
                    )}
                </div>

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

export default YearsOfExperience;
