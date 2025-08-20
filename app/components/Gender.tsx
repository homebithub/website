import React, { useState } from 'react';
import { handleApiError } from '../utils/errorMessages';

const Gender = () => {
    const [gender, setGender] = useState<'female' | 'male'>('female');
    const [dateOfBirth, setDateOfBirth] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const calculateMaxDate = (): string => {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return maxDate.toISOString().split('T')[0];
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateOfBirth(e.target.value);
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

            const response = await fetch(`http://localhost:8080/api/v1/househelps/me/fields`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    updates: {
                        gender: gender,
                        date_of_birth: dateOfBirth
                    }
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }
            
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
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Gender</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                            gender === 'female' ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={gender === 'female'}
                                onChange={() => setGender('female')}
                                className="form-radio h-5 w-5 text-primary-600 border-gray-300"
                            />
                            <span>Female</span>
                        </label>
                        <label className={`flex items-center justify-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                            gender === 'male' ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={gender === 'male'}
                                onChange={() => setGender('male')}
                                className="form-radio h-5 w-5 text-primary-600 border-gray-300"
                            />
                            <span>Male</span>
                        </label>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={dateOfBirth}
                        onChange={handleDateChange}
                        max={calculateMaxDate()}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                            error && (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) 
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                : 'border-purple-300 hover:border-purple-400'
                        } [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
                        required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                        You must be at least 18 years old to register.
                    </p>
                </div>
                
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${
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

export default Gender;
