import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { handleApiError } from '../utils/errorMessages';
import { API_BASE_URL } from '~/config/api';

// List of languages organized by groups
const LANGUAGE_GROUPS = {
    kenyanBantu: [
        'Kikuyu (Gikuyu)',
        'Kamba (Kikamba)',
        'Meru',
        'Embu',
        'Mbeere',
        'Luhya',
        'Bukusu',
        'Maragoli',
        'Banyore',
        'Isukha',
        'Kisii (Ekegusii)',
        'Taita',
        'Chonyi',
        'Giriama',
        'Digo',
        'Rabai',
        'Kauma',
        'Duruma',
        'Pokomo',
        'Taveta'
    ],
    kenyanNilotic: [
        'Luo (Dholuo)',
        'Kalenjin',
        'Nandi',
        'Kipsigis',
        'Tugen',
        'Keiyo',
        'Marakwet',
        'Pokot',
        'Turkana',
        'Samburu',
        'Njemps (Ilchamus)',
        'Teso (Ateso)'
    ],
    kenyanCushitic: [
        'Somali',
        'Borana',
        'Rendille',
        'Gabra',
        'Orma'
    ],
    international: [
        'Mandarin Chinese',
        'Spanish',
        'Hindi',
        'Arabic',
        'Bengali',
        'Portuguese',
        'Russian',
        'Japanese',
        'Punjabi',
        'German',
        'French',
        'Italian',
        'Korean',
        'Vietnamese',
        'Thai',
        'Swedish',
        'Dutch',
        'Greek',
        'Hebrew',
        'Turkish'
    ]
};

// Flatten all languages into a single array for search
const COMMON_LANGUAGES = [
    ...LANGUAGE_GROUPS.kenyanBantu,
    ...LANGUAGE_GROUPS.kenyanNilotic,
    ...LANGUAGE_GROUPS.kenyanCushitic,
    ...LANGUAGE_GROUPS.international
].sort((a, b) => a.localeCompare(b));

const Languages = () => {
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [showOtherLanguages, setShowOtherLanguages] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLanguages, setFilteredLanguages] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Filter languages based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredLanguages(COMMON_LANGUAGES);
        } else {
            const filtered = COMMON_LANGUAGES.filter(lang =>
                lang.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLanguages(filtered);
        }
    }, [searchTerm]);

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

    const toggleLanguage = (language: string) => {
        setSelectedLanguages(prev => 
            prev.includes(language)
                ? prev.filter(lang => lang !== language)
                : [...prev, language]
        );
    };

    const toggleOtherLanguages = () => {
        setShowOtherLanguages(!showOtherLanguages);
        if (!showOtherLanguages) {
            setSearchTerm('');
            setFilteredLanguages(COMMON_LANGUAGES);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedLanguages.length === 0) {
            setError('Please select at least one language');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            const updates = {
                languages: selectedLanguages.join(',')
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
                        step_id: "languages",
                        step_number: 9,
                        is_completed: true
                    }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update profile');
            
            setSuccess('Your language preferences have been saved successfully!');
            // navigate('/next-step');
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(handleApiError(err, 'languages', 'Failed to save your preferences. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">🗣️ Languages</h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                What languages do you speak?
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Languages You Speak</h1>
            
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
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Select languages you're comfortable with</h2>
                    
                    {/* English */}
                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                        selectedLanguages.includes('English')
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100'
                            : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}>
                        <input
                            type="checkbox"
                            checked={selectedLanguages.includes('English')}
                            onChange={() => toggleLanguage('English')}
                            className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-900 dark:text-gray-100">English</span>
                    </label>
                    
                    {/* Swahili */}
                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                        selectedLanguages.includes('Swahili')
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100'
                            : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}>
                        <input
                            type="checkbox"
                            checked={selectedLanguages.includes('Swahili')}
                            onChange={() => toggleLanguage('Swahili')}
                            className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-900 dark:text-gray-100">Swahili</span>
                    </label>
                    
                    {/* Other Languages */}
                    <div className="relative" ref={dropdownRef}>
                        <div 
                            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                                selectedLanguages.some(lang => !['English', 'Swahili'].includes(lang))
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
                            <div className="mt-2 w-full bg-white dark:bg-[#0b0b10] rounded-lg shadow-lg border border-gray-200 dark:border-purple-500/30 overflow-hidden z-10">
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
                                            className="w-full h-14 pl-10 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
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
                                                    <div key={language} className="px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100">
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
                                                <div className="px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100">No languages found</div>
                                            )}
                                        </div>
                                    ) : (
                                        // Show grouped languages when not searching
                                        <div className="divide-y divide-gray-200">
                                            {Object.entries(LANGUAGE_GROUPS).map(([group, languages]) => {
                                                const filtered = languages.filter(lang => 
                                                    filteredLanguages.includes(lang)
                                                );
                                                
                                                if (filtered.length === 0) return null;
                                                
                                                const groupName = {
                                                    'kenyanBantu': 'Bantu Languages (Kenya)',
                                                    'kenyanNilotic': 'Nilotic Languages (Kenya)',
                                                    'kenyanCushitic': 'Cushitic Languages (Kenya)',
                                                    'international': 'International Languages'
                                                }[group as keyof typeof LANGUAGE_GROUPS];
                                                
                                                return (
                                                    <div key={group} className="py-1">
                                                        <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-[#11111a] sticky top-0 z-10">
                                                            {groupName}
                                                        </div>
                                                        <div className="divide-y divide-gray-100">
                                                            {filtered.map((language) => (
                                                                <div key={language} className="px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100">
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
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Selected languages */}
                                {selectedLanguages.some(lang => !['English', 'Swahili'].includes(lang)) && (
                                    <div className="border-t border-gray-200 p-3 bg-gray-50 dark:bg-[#13131a]">
                                        <div className="text-xs font-medium text-gray-500 mb-2">SELECTED:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedLanguages
                                                .filter(lang => !['English', 'Swahili'].includes(lang))
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

export default Languages;
