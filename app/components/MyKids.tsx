import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Kids from './Kids';
import { Child } from './Children';

const MyKids = () => {
    const [kidOption, setKidOption] = useState<string>('');
    const [children, setChildren] = useState<Child[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
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
            
            setSuccess('Your preference has been saved successfully!');
            // navigate('/next-step');
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(err.message || 'Failed to save your preference. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Do You Have Kids?</h1>
            
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">
                        Please select the option that best describes your situation:
                    </h2>
                    
                    {/* Option 1: I have kids and need accommodation */}
                    <div className="space-y-4">
                        <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                            kidOption === 'needs_accommodation'
                                ? 'border-primary-500 bg-primary-50 text-primary-900'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}>
                            <input
                                type="radio"
                                name="kidOption"
                                checked={kidOption === 'needs_accommodation'}
                                onChange={() => setKidOption('needs_accommodation')}
                                className="mt-1 form-radio h-5 w-5 text-primary-600 border-gray-300"
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
                    <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                        kidOption === 'no_kids'
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}>
                        <input
                            type="radio"
                            name="kidOption"
                            checked={kidOption === 'no_kids'}
                            onChange={() => setKidOption('no_kids')}
                            className="mt-1 form-radio h-5 w-5 text-primary-600 border-gray-300"
                        />
                        <span>I do not have kids</span>
                    </label>
                    
                    {/* Option 3: I do not need accommodation for my kids */}
                    <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                        kidOption === 'has_kids_no_accommodation'
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}>
                        <input
                            type="radio"
                            name="kidOption"
                            checked={kidOption === 'has_kids_no_accommodation'}
                            onChange={() => setKidOption('has_kids_no_accommodation')}
                            className="mt-1 form-radio h-5 w-5 text-primary-600 border-gray-300"
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

export default MyKids;
