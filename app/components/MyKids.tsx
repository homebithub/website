import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Kids from './Kids';
import type { Child } from './Children';
import { handleApiError } from '../utils/errorMessages';
import { API_BASE_URL } from '~/config/api';

const MyKids = () => {
    const [kidOption, setKidOption] = useState<string>('');
    const [children, setChildren] = useState<Child[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // Load existing children and profile data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                // Load children
                const kidsRes = await fetch(`${API_BASE_URL}/api/v1/househelp_kids`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (kidsRes.ok) {
                    const kids = await kidsRes.json();
                    if (kids && kids.length > 0) {
                        setChildren(kids);
                    }
                }
                
                // Load profile to get has_kids and needs_accommodation status
                const profileRes = await fetch(`${API_BASE_URL}/api/v1/househelps/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    if (profile.needs_accommodation) {
                        setKidOption('needs_accommodation');
                    } else if (profile.has_kids) {
                        setKidOption('has_kids_no_accommodation');
                    } else {
                        setKidOption('has_kids');
                    }
                }
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        };
        
        loadData();
    }, []);
    
    const handleChildrenUpdate = (updatedChildren: Child[]) => {
        setChildren(updatedChildren);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!kidOption) {
            setError('Please select an option');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            const updates = {
                has_kids: kidOption === 'has_kids' || kidOption === 'needs_accommodation',
                needs_accommodation: kidOption === 'needs_accommodation',
                ...(kidOption === 'needs_accommodation' && children.length > 0 ? { children: children } : {})
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
                        step_id: "mykids",
                        step_number: 10,
                        is_completed: true
                    }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update profile');
            
            setSuccess('Your preference has been saved successfully!');
            // navigate('/next-step');
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(handleApiError(err, 'myKids', 'Failed to save your preference. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">👨‍👩‍👧‍👦 My Kids</h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                Do you have children?
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">
                        Please select the option that best describes your situation:
                    </h2>
                    
                    {/* Option 1: I have kids and need accommodation */}
                    <div className="space-y-4">
                        <label className={`flex items-start gap-3 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                            kidOption === 'needs_accommodation'
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105'
                                : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="radio"
                                name="kidOption"
                                checked={kidOption === 'needs_accommodation'}
                                onChange={() => setKidOption('needs_accommodation')}
                                className="mt-1 form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                                <span>I have kids and need accommodation</span>
                                <p className="mt-1 text-sm font-normal text-gray-500">
                                    You'll need to provide accommodation for your kids
                                </p>
                            </div>
                        </label>
                        
                        {kidOption === 'needs_accommodation' && (
                            <div className="pl-8 pr-4 py-2">
                                <Kids 
                                    onChildrenUpdate={handleChildrenUpdate}
                                    initialChildren={children}
                                    className="mt-2"
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Option 2: I do not have kids */}
                    <label className={`flex items-start gap-3 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                        kidOption === 'has_kids'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105'
                            : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}>
                        <input
                            type="radio"
                            name="kidOption"
                            checked={kidOption === 'has_kids'}
                            onChange={() => setKidOption('has_kids')}
                            className="mt-1 form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
                        />
                        <span>I do not have kids</span>
                    </label>
                    
                    {/* Option 3: I do not need accommodation for my kids */}
                    <label className={`flex items-start gap-3 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                        kidOption === 'has_kids_no_accommodation'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105'
                            : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}>
                        <input
                            type="radio"
                            name="kidOption"
                            checked={kidOption === 'has_kids_no_accommodation'}
                            onChange={() => setKidOption('has_kids_no_accommodation')}
                            className="mt-1 form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                            <span>I do not need accommodation for my kids</span>
                            <p className="mt-1 text-sm font-normal text-gray-500">
                                You have kids but don't need accommodation for them
                            </p>
                        </div>
                    </label>
                </div>
                
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-8 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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

export default MyKids;
