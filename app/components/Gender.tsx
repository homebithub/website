import React, { useState, useEffect } from 'react';
import { handleApiError } from '../utils/errorMessages';
import { API_BASE_URL } from '~/config/api';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';

const Gender = () => {
    const { markDirty, markClean } = useProfileSetup();
    const [gender, setGender] = useState<'female' | 'male'>('female');
    const [dateOfBirth, setDateOfBirth] = useState<string>('');
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
                    if (data.gender) setGender(data.gender);
                    if (data.date_of_birth) {
                        const date = new Date(data.date_of_birth);
                        setDateOfBirth(date.toISOString().split('T')[0]);
                    }
                }
            } catch (err) {
                console.error('Failed to load gender data:', err);
            }
        };

        loadData();
    }, []);

    const calculateMaxDate = (): string => {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return maxDate.toISOString().split('T')[0];
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateOfBirth(e.target.value);
        markDirty();
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
            setError('Please select your date of birth');
            return;
        }
        
        const selectedDate = new Date(dateOfBirth);
        const maxDate = new Date(calculateMaxDate());
        if (selectedDate > maxDate) {
            setError('You must be at least 18 years old');
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

            const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    updates: {
                        gender: gender,
                        date_of_birth: dateOfBirth
                    },
                    _step_metadata: {
                        step_id: "gender",
                        step_number: 3,
                        is_completed: true
                    }
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }
            
            markClean();
            setSuccess('Your information has been saved successfully!');
            // router.push('/next-step'); // Uncomment and add navigation to next step if needed
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(handleApiError(err, 'gender', 'Failed to save your information. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">👤 Gender & Age</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Tell us about yourself
            </p>
            
            {error && <ErrorAlert message={error} />}
            
            {success && <SuccessAlert message={success} />}
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3">Gender</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                            gender === 'female' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={gender === 'female'}
                                onChange={() => { setGender('female'); markDirty(); }}
                                className="form-radio h-4 w-4 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <span>Female</span>
                        </label>
                        <label className={`flex items-center justify-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                            gender === 'male' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={gender === 'male'}
                                onChange={() => { setGender('male'); markDirty(); }}
                                className="form-radio h-4 w-4 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <span>Male</span>
                        </label>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                        🎂 Date of Birth
                    </label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        value={dateOfBirth}
                        onChange={handleDateChange}
                        max={calculateMaxDate()}
                        className="w-full h-10 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
                        required
                    />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        You must be at least 18 years old
                    </p>
                </div>
                
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
            </form>
        </div>
    );
};

export default Gender;
