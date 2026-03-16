import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect } from 'react';
import { handleApiError } from '../utils/errorMessages';
import { profileService as grpcProfileService } from '~/services/grpc/authServices';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';

const Gender = () => {
    const { markDirty, markClean, updateStepData, profileData } = useProfileSetup();
    const [gender, setGender] = useState<'female' | 'male'>('female');
    const [dateOfBirth, setDateOfBirth] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Populate from context (instant on back-nav, also fires after loadProfileFromBackend)
    useEffect(() => {
        const cached = profileData.gender;
        if (cached) {
            if (cached.gender) setGender(cached.gender);
            const dob = cached.dateOfBirth || cached.date_of_birth;
            if (dob) {
                const date = new Date(dob);
                if (!isNaN(date.getTime())) setDateOfBirth(date.toISOString().split('T')[0]);
            }
        }
    }, [profileData.gender]);

    // Load existing data from backend (fallback)
    useEffect(() => {
        const loadData = async () => {
            try {
                const token = getAccessTokenFromCookies();
                if (!token) return;

                const data = await grpcProfileService.getCurrentHousehelpProfile('');
                if (data?.gender) setGender(data.gender);
                if (data?.date_of_birth) {
                    const date = new Date(data.date_of_birth);
                    setDateOfBirth(date.toISOString().split('T')[0]);
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

    const isValidDOB = (dob: string): boolean => {
        if (!dob || isNaN(Date.parse(dob))) return false;
        const selectedDate = new Date(dob);
        const maxDate = new Date(calculateMaxDate());
        return selectedDate <= maxDate;
    };

    const autoSave = async (genderVal: 'female' | 'male', dobVal: string) => {
        if (!isValidDOB(dobVal)) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAccessTokenFromCookies();
            if (!token) {
                throw new Error('Authentication token not found');
            }

            await grpcProfileService.updateHousehelpFields('', 'househelp',
                { gender: genderVal, date_of_birth: dobVal },
                { step_id: 'gender', step_number: 3, is_completed: true }
            );
            
            markClean();
            updateStepData('gender', { gender: genderVal, dateOfBirth: dobVal });
            setSuccess('Your information has been saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(handleApiError(err, 'gender', 'Failed to save your information. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handleGenderChange = async (value: 'female' | 'male') => {
        setGender(value);
        markDirty();
        await autoSave(value, dateOfBirth);
    };

    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDob = e.target.value;
        setDateOfBirth(newDob);
        markDirty();
        if (error) setError('');
        
        if (!newDob || isNaN(Date.parse(newDob))) return;
        const selectedDate = new Date(newDob);
        const maxDate = new Date(calculateMaxDate());
        if (selectedDate > maxDate) {
            setError('You must be at least 18 years old');
            return;
        }
        await autoSave(gender, newDob);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">👤 Gender & Age</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Tell us about yourself
            </p>
            
            {error && <ErrorAlert message={error} />}
            
            {success && <SuccessAlert message={success} />}
            
            <div className="space-y-8">
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
                                onChange={() => handleGenderChange('female')}
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
                                onChange={() => handleGenderChange('male')}
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
                
            </div>
        </div>
    );
};

export default Gender;
