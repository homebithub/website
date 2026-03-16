import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { handleApiError } from '../utils/errorMessages';
import { profileService as grpcProfileService } from '~/services/grpc/authServices';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';
import { useOnboardingOptionsContext } from '~/contexts/OnboardingOptionsContext';

type WorkPreference = 'with_kids' | 'chores_only';
type AgeRange = '0-2' | '2-5' | '5-10' | '10+';
type ChildrenCapacity = '1-2' | '2-4' | '5+';

const WorkWithKids = () => {
    const { markDirty, markClean, updateStepData, profileData } = useProfileSetup();
    const { options, loading: optionsLoading } = useOnboardingOptionsContext();
    const [workPreference, setWorkPreference] = useState<WorkPreference | null>(null);
    const [selectedAges, setSelectedAges] = useState<AgeRange[]>([]);
    const [selectedCapacities, setSelectedCapacities] = useState<ChildrenCapacity[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Populate from context (instant on back-nav)
    useEffect(() => {
        const cached = profileData.workwithkids;
        if (cached) {
            if (cached.preference) setWorkPreference(cached.preference);
            else if (cached.can_work !== undefined) setWorkPreference(cached.can_work ? 'with_kids' : 'chores_only');
            else if (cached.can_work_with_kids !== undefined) setWorkPreference(cached.can_work_with_kids ? 'with_kids' : 'chores_only');
            if (cached.ages?.length) setSelectedAges(cached.ages);
            else if (cached.age_range) setSelectedAges(cached.age_range.split(',') as AgeRange[]);
        }
    }, [profileData.workwithkids]);

    // Load existing data from backend (fallback)
    useEffect(() => {
        const loadData = async () => {
            try {
                const token = getAccessTokenFromCookies();
                if (!token) return;

                const data = await grpcProfileService.getCurrentHousehelpProfile('');
                if (data?.can_work_with_kids !== undefined) {
                    setWorkPreference(data.can_work_with_kids ? 'with_kids' : 'chores_only');
                }
                if (data?.children_age_range) {
                    setSelectedAges(data.children_age_range.split(',') as AgeRange[]);
                }
                if (data?.number_of_concurrent_children) {
                    const capacity = data.number_of_concurrent_children;
                    if (capacity <= 2) setSelectedCapacities(['1-2']);
                    else if (capacity <= 4) setSelectedCapacities(['2-4']);
                    else setSelectedCapacities(['5+']);
                }
            } catch (err) {
                console.error('Failed to load work with kids data:', err);
            }
        };

        loadData();
    }, []);

    const ageRanges = options?.children_age_ranges.map(r => ({
        value: r.label as AgeRange,
        label: `${r.label} years`
    })) || [];

    const capacities = options?.children_capacities.map(c => ({
        value: c.label as ChildrenCapacity,
        label: `${c.label} children`
    })) || [];

    const autoSave = async (pref: WorkPreference, ages: AgeRange[], caps: ChildrenCapacity[]) => {
        if (pref === 'with_kids' && (ages.length === 0 || caps.length === 0)) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAccessTokenFromCookies();
            if (!token) throw new Error('Authentication token not found');

            const updates = {
                can_work_with_kid: pref === 'with_kids',
                children_age_range: pref === 'with_kids' ? ages.join(',') : '',
                number_of_concurrent_children: pref === 'with_kids' 
                    ? Math.max(...caps.map(c => c === '5+' ? 5 : parseInt(c.split('-')[1])))
                    : 0
            };

            await grpcProfileService.updateHousehelpFields('', 'househelp', updates,
                { step_id: 'workwithkids', step_number: 7, is_completed: true }
            );
            
            markClean();
            updateStepData('workwithkids', { preference: pref, ages });
            setSuccess('Your preferences have been saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(handleApiError(err, 'workWithKids', 'Failed to save your preferences. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceChange = async (pref: WorkPreference) => {
        setWorkPreference(pref);
        markDirty();
        if (pref === 'chores_only') {
            await autoSave(pref, [], []);
        }
    };

    const toggleAgeRange = async (age: AgeRange) => {
        const newAges = selectedAges.includes(age) ? selectedAges.filter(a => a !== age) : [...selectedAges, age];
        setSelectedAges(newAges);
        markDirty();
        if (workPreference === 'with_kids' && newAges.length > 0 && selectedCapacities.length > 0) {
            await autoSave('with_kids', newAges, selectedCapacities);
        }
    };

    const toggleCapacity = async (capacity: ChildrenCapacity) => {
        const newCaps = selectedCapacities.includes(capacity) ? selectedCapacities.filter(c => c !== capacity) : [...selectedCapacities, capacity];
        setSelectedCapacities(newCaps);
        markDirty();
        if (workPreference === 'with_kids' && selectedAges.length > 0 && newCaps.length > 0) {
            await autoSave('with_kids', selectedAges, newCaps);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">👶 Work with Kids</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Can you care for children?
            </p>
            {error && <ErrorAlert message={error} />}
            
            {success && <SuccessAlert message={success} />}
            
            <div className="space-y-8">
                <div>
                    <h2 className="text-sm font-medium text-gray-900 mb-3">Work Preference</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                            workPreference === 'with_kids' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="workPreference"
                                checked={workPreference === 'with_kids'}
                                onChange={() => handlePreferenceChange('with_kids')}
                                className="form-radio h-4 w-4 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <span>I can work with / have worked with children</span>
                        </label>
                        
                        <label className={`flex items-center justify-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                            workPreference === 'chores_only' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="workPreference"
                                checked={workPreference === 'chores_only'}
                                onChange={() => handlePreferenceChange('chores_only')}
                                className="form-radio h-4 w-4 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <span>I am only interested in chores</span>
                        </label>
                    </div>
                </div>

                {workPreference === 'with_kids' && (
                    <>
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-900">
                                What is the age range of the children you can/have worked with?
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {ageRanges.map((age) => (
                                    <label 
                                        key={age.value}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer shadow-sm text-sm font-medium ${
                                            selectedAges.includes(age.value) ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
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
                            <h3 className="text-sm font-medium text-gray-900">
                                How many children can you look after at the same time?
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {capacities.map((capacity) => (
                                    <label 
                                        key={capacity.value}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer shadow-sm text-sm font-medium ${
                                            selectedCapacities.includes(capacity.value) ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
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

            </div>
        </div>
    );
};

export default WorkWithKids;
