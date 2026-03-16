import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { handleApiError } from '../utils/errorMessages';
import { profileService as grpcProfileService } from '~/services/grpc/authServices';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';
import { useOnboardingOptionsContext } from '~/contexts/OnboardingOptionsContext';

// Languages are now fetched from backend via context

const Languages = () => {
    const { markDirty, markClean, updateStepData, profileData } = useProfileSetup();
    const { options, loading: optionsLoading } = useOnboardingOptionsContext();
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [showOtherLanguages, setShowOtherLanguages] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLanguages, setFilteredLanguages] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Populate from context (instant on back-nav)
    useEffect(() => {
        const cached = profileData.languages;
        if (cached) {
            if (cached.languages?.length) setSelectedLanguages(cached.languages);
            else if (typeof cached === 'string' && cached.length) setSelectedLanguages(cached.split(',').map((l: string) => l.trim()));
            else if (Array.isArray(cached) && cached.length) setSelectedLanguages(cached);
        }
    }, [profileData.languages]);

    // Get languages from backend options
    const allLanguages = options?.languages || [];
    const primaryLanguages = allLanguages.filter(l => l.category === 'international' && l.display_order <= 2);
    const otherLanguages = allLanguages.filter(l => !(l.category === 'international' && l.display_order <= 2));
    const commonLanguages = otherLanguages.map(l => l.name).sort((a, b) => a.localeCompare(b));

    // Filter languages based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredLanguages(commonLanguages);
        } else {
            const filtered = commonLanguages.filter(lang =>
                lang.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLanguages(filtered);
        }
    }, [searchTerm, commonLanguages]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowOtherLanguages(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const autoSave = async (langs: string[]) => {
        if (langs.length === 0) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAccessTokenFromCookies();
            if (!token) throw new Error('Authentication token not found');

            const updates = {
                languages: langs.join(',')
            };

            await grpcProfileService.updateHousehelpFields('', 'househelp', updates,
                { step_id: 'languages', step_number: 9, is_completed: true }
            );
            
            markClean();
            updateStepData('languages', { languages: langs });
            setSuccess('Your language preferences have been saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(handleApiError(err, 'languages', 'Failed to save your preferences. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const toggleLanguage = async (language: string) => {
        const newLangs = selectedLanguages.includes(language)
            ? selectedLanguages.filter(lang => lang !== language)
            : [...selectedLanguages, language];
        setSelectedLanguages(newLangs);
        markDirty();
        await autoSave(newLangs);
    };

    const toggleOtherLanguages = () => {
        setShowOtherLanguages(!showOtherLanguages);
        if (!showOtherLanguages) {
            setSearchTerm('');
            setFilteredLanguages(commonLanguages);
        }
    };

    if (optionsLoading) {
        return (
            <div className="max-w-2xl mx-auto text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading languages...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">🗣️ Languages</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                What languages do you speak?
            </p>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Languages You Speak</h1>
            
            {error && <ErrorAlert message={error} />}
            
            {success && <SuccessAlert message={success} />}
            
            <div className="space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Select languages you're comfortable with</h2>
                    
                    {/* Primary Languages (English, Swahili) */}
                    {primaryLanguages.map(lang => (
                        <label key={lang.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer shadow-sm text-sm font-medium ${
                            selectedLanguages.includes(lang.name)
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100'
                                : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}>
                            <input
                                type="checkbox"
                                checked={selectedLanguages.includes(lang.name)}
                                onChange={() => toggleLanguage(lang.name)}
                                className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-gray-900 dark:text-gray-100">{lang.name}</span>
                        </label>
                    ))}
                    
                    {/* Other Languages */}
                    <div className="relative" ref={dropdownRef}>
                        <div 
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer shadow-sm text-sm font-medium ${
                                selectedLanguages.some(lang => !primaryLanguages.some(p => p.name === lang))
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100'
                                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                            }`} 
                            onClick={(e) => {
                                e.preventDefault();
                                toggleOtherLanguages();
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedLanguages.some(lang => !['English', 'Swahili'].includes(lang))}
                                readOnly
                                className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 pointer-events-none"
                            />
                            <span className="text-gray-900 dark:text-gray-100">Other Languages</span>
                            <svg className={`ml-auto h-5 w-5 text-gray-400 transform transition-transform ${showOtherLanguages ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                        
                        {showOtherLanguages && (
                            <div className="mt-2 w-full bg-white dark:bg-[#0b0b10] rounded-xl shadow-lg border border-gray-200 dark:border-purple-500/30 overflow-hidden z-10">
                                {/* Search input */}
                                <div className="p-3 border-b border-gray-200">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full h-10 pl-10 pr-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
                                            placeholder="Search languages..."
                                        />
                                    </div>
                                </div>
                                
                                {/* Languages list */}
                                <div className="max-h-96 overflow-y-auto">
                                    {searchTerm ? (
                                        // Show flat list when searching
                                        <div className="py-1">
                                            {filteredLanguages.length > 0 ? (
                                                filteredLanguages.map((language) => (
                                                    <div key={language} className="px-4 py-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100">
                                                        <label className={`flex items-center space-x-3 cursor-pointer w-full p-2 rounded ${
                                                            selectedLanguages.includes(language)
                                                                ? 'bg-purple-50 dark:bg-purple-900/20'
                                                                : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                                        }`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedLanguages.includes(language)}
                                                                onChange={() => toggleLanguage(language)}
                                                                className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                            />
                                                            <span className="text-gray-900 dark:text-gray-100">{language}</span>
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100">No languages found</div>
                                            )}
                                        </div>
                                    ) : (
                                        // Show grouped languages when not searching
                                        <div className="divide-y divide-gray-200">
                                            {['kenyan_bantu', 'kenyan_nilotic', 'kenyan_cushitic', 'international'].map((category) => {
                                                const categoryLanguages = otherLanguages
                                                    .filter(l => l.category === category)
                                                    .filter(l => filteredLanguages.includes(l.name));
                                                
                                                if (categoryLanguages.length === 0) return null;
                                                
                                                const groupName = {
                                                    'kenyan_bantu': 'Bantu Languages (Kenya)',
                                                    'kenyan_nilotic': 'Nilotic Languages (Kenya)',
                                                    'kenyan_cushitic': 'Cushitic Languages (Kenya)',
                                                    'international': 'International Languages'
                                                }[category];
                                                
                                                return (
                                                    <div key={category} className="py-1">
                                                        <div className="px-4 py-1 text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-[#11111a] sticky top-0 z-10">
                                                            {groupName}
                                                        </div>
                                                        <div className="divide-y divide-gray-100">
                                                            {categoryLanguages.map((lang) => (
                                                                <div key={lang.id} className="px-4 py-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100">
                                                                    <label className={`flex items-center space-x-3 cursor-pointer w-full p-2 rounded ${
                                                                        selectedLanguages.includes(lang.name)
                                                                            ? 'bg-purple-50 dark:bg-purple-900/20'
                                                                            : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                                                    }`}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedLanguages.includes(lang.name)}
                                                                            onChange={() => toggleLanguage(lang.name)}
                                                                            className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                        />
                                                                        <span className="text-gray-900 dark:text-gray-100">{lang.name}</span>
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Selected languages */}
                                {selectedLanguages.some(lang => !primaryLanguages.some(p => p.name === lang)) && (
                                    <div className="border-t border-gray-200 p-3 bg-gray-50 dark:bg-[#13131a]">
                                        <div className="text-xs font-medium text-gray-500 mb-2">SELECTED:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedLanguages
                                                .filter(lang => !primaryLanguages.some(p => p.name === lang))
                                                .map(lang => (
                                                    <span key={lang} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-800/40 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold border border-purple-200 dark:border-purple-500/30">
                                                        {lang}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleLanguage(lang);
                                                            }}
                                                            className="ml-1.5 inline-flex items-center justify-center h-3.5 w-3.5 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                                                        >
                                                            <span className="sr-only">Remove {lang}</span>
                                                            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                                                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Languages;
