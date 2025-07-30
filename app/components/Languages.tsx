import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
            
            setSuccess('Your language preferences have been saved successfully!');
            // navigate('/next-step');
        } catch (err: any) {
            console.error('Error saving information:', err);
            setError(err.message || 'Failed to save your preferences. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Languages You Speak</h1>
            
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
                    <h2 className="text-lg font-medium text-gray-900">Select languages you're comfortable with</h2>
                    
                    {/* English */}
                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                        selectedLanguages.includes('English')
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}>
                        <input
                            type="checkbox"
                            checked={selectedLanguages.includes('English')}
                            onChange={() => toggleLanguage('English')}
                            className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span>English</span>
                    </label>
                    
                    {/* Swahili */}
                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                        selectedLanguages.includes('Swahili')
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}>
                        <input
                            type="checkbox"
                            checked={selectedLanguages.includes('Swahili')}
                            onChange={() => toggleLanguage('Swahili')}
                            className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span>Swahili</span>
                    </label>
                    
                    {/* Other Languages */}
                    <div className="relative" ref={dropdownRef}>
                        <label 
                            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                                selectedLanguages.some(lang => !['English', 'Swahili'].includes(lang))
                                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`} 
                            onClick={toggleOtherLanguages}
                        >
                            <input
                                type="checkbox"
                                checked={selectedLanguages.some(lang => !['English', 'Swahili'].includes(lang))}
                                readOnly
                                className="form-checkbox h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span>Other Languages</span>
                            <svg className={`ml-auto h-5 w-5 text-gray-400 transform transition-transform ${showOtherLanguages ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </label>
                        
                        {showOtherLanguages && (
                            <div className="mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
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
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                                                    <div key={language} className="px-4 py-2 hover:bg-gray-50">
                                                        <label className={`flex items-center space-x-3 cursor-pointer w-full p-2 rounded ${
                                                            selectedLanguages.includes(language)
                                                                ? 'bg-primary-50'
                                                                : 'hover:bg-gray-50'
                                                        }`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedLanguages.includes(language)}
                                                                onChange={() => toggleLanguage(language)}
                                                                className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-gray-900">{language}</span>
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500">No languages found</div>
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
                                                        <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 sticky top-0 z-10">
                                                            {groupName}
                                                        </div>
                                                        <div className="divide-y divide-gray-100">
                                                            {filtered.map((language) => (
                                                                <div key={language} className="px-4 py-2 hover:bg-gray-50">
                                                                    <label className={`flex items-center space-x-3 cursor-pointer w-full p-2 rounded ${
                                                                        selectedLanguages.includes(language)
                                                                            ? 'bg-primary-50'
                                                                            : 'hover:bg-gray-50'
                                                                    }`}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedLanguages.includes(language)}
                                                                            onChange={() => toggleLanguage(language)}
                                                                            className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                                        />
                                                                        <span className="text-gray-900">{language}</span>
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
                                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                                        <div className="text-xs font-medium text-gray-500 mb-2">SELECTED:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedLanguages
                                                .filter(lang => !['English', 'Swahili'].includes(lang))
                                                .map(lang => (
                                                    <span key={lang} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                                        {lang}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleLanguage(lang);
                                                            }}
                                                            className="ml-1.5 inline-flex items-center justify-center h-3.5 w-3.5 rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:outline-none"
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

export default Languages;
