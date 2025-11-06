import React, {useState, useRef, useEffect} from "react";
import { handleApiError } from '../utils/errorMessages';
import { API_BASE_URL } from '~/config/api';

interface LocationSuggestion {
    name: string;
    mapbox_id: string;
    feature_type: string;
}

interface LocationProps {
    onSelect?: (suggestion: LocationSuggestion) => void;
}

const Location: React.FC<LocationProps> = ({onSelect}) => {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
    const [savedLocation, setSavedLocation] = useState<LocationSuggestion | null>(null);
    const [submitStatus, setSubmitStatus] = useState<{success: boolean; message: string} | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const baseUrl = API_BASE_URL

    // Load existing location data
    useEffect(() => {
        const loadLocation = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const response = await fetch(`${baseUrl}/api/v1/household/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.location && data.location.place) {
                        setInput(data.location.place);
                        setSavedLocation({
                            name: data.location.place,
                            mapbox_id: data.location.mapbox_id || '',
                            feature_type: data.location.feature_type || 'place'
                        });
                        setSelectedLocation({
                            name: data.location.place,
                            mapbox_id: data.location.mapbox_id || '',
                            feature_type: data.location.feature_type || 'place'
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to load location:', err);
            }
        };
        loadLocation();
    }, [baseUrl]);

    useEffect(() => {
        if (input.length > 2) {
            setLoading(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                const token = localStorage.getItem('token');
                fetch(`${baseUrl}/api/v1/location?q=${encodeURIComponent(input)}`, {
                  headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                  },
                })
                  .then((res) => res.json())
                  .then((data: LocationSuggestion[]) => {
                    setSuggestions(data);
                    setShowDropdown(true);
                  })
                  .catch(() => setSuggestions([]))
                  .finally(() => setLoading(false));
            }, 1000);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [input, baseUrl]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setSelectedIndex(-1);
        // Reset saved location when user starts typing again (only if they're actually changing it)
        if (savedLocation && input !== savedLocation.name) {
            setSavedLocation(null);
        }
    };

    const handleSuggestionClick = (suggestion: LocationSuggestion) => {
        setInput(suggestion.name);
        setSelectedLocation(suggestion);
        setShowDropdown(false);
        setSuggestions([]);
        setSubmitStatus(null);
        
        // Clear the timeout to prevent dropdown from reappearing
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        // Blur the input to prevent refocus triggering search
        if (inputRef.current) {
            inputRef.current.blur();
        }
        
        if (onSelect) onSelect(suggestion);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            setSelectedIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            handleSuggestionClick(suggestions[selectedIndex]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowDropdown(false);
        
        if (!selectedLocation) {
            setSubmitStatus({
                success: false,
                message: 'Please select a location from the suggestions'
            });
            return;
        }

        setSubmitting(true);
        setSubmitStatus(null);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${baseUrl}/api/v1/location/save-user-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    mapbox_id: selectedLocation.mapbox_id
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setSubmitStatus({
                    success: true,
                    message: data.message || 'Location saved successfully!'
                });
                // Save the location to disable button
                setSavedLocation(selectedLocation);
                // Clear the status after 3 seconds
                setTimeout(() => setSubmitStatus(null), 3000);
            } else {
                throw new Error(data.message || 'Failed to save location');
            }
        } catch (error) {
            console.error('Error saving location:', error);
            setSubmitStatus({
                success: false,
                message: handleApiError(error, 'location', 'An error occurred while saving location')
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
                <div className="relative z-10">
                    <label htmlFor="location-input" className="block text-xl font-bold text-purple-700 dark:text-purple-400 mb-3">
                        📍 Location <span className="text-red-500">*</span>
                    </label>
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                        If your exact location isn't found, try searching for the nearest town or landmark
                    </p>
                    <input
                        ref={inputRef}
                        id="location-input"
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        className="w-full h-14 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 shadow-sm"
                        placeholder="Enter location..."
                    />
                    {showDropdown && suggestions.length > 0 && (
                        <div
                            ref={dropdownRef}
                            className="absolute left-0 w-full bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-xl dark:shadow-glow-md z-50 max-h-56 overflow-y-auto mt-2"
                            style={{ top: '100%' }}
                        >
                            {loading && (
                                <div className="px-4 py-3 text-gray-500 dark:text-gray-400">🔍 Loading...</div>
                            )}
                            {suggestions.map((s, idx) => (
                                <div
                                    key={s.mapbox_id}
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent input blur
                                        handleSuggestionClick(s);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`px-4 py-3 cursor-pointer font-medium border-b border-purple-100 dark:border-purple-500/20 last:border-b-0 transition-colors ${
                                        idx === selectedIndex 
                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100' 
                                            : 'bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100'
                                    } hover:bg-purple-100 dark:hover:bg-purple-900/40`}
                                >
                                    📍 {s.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {submitStatus && (
                    <div className={`p-4 rounded-xl text-sm font-semibold border-2 ${
                        submitStatus.success 
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30' 
                            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30'
                    }`}>
                        {submitStatus.success ? '✓ ' : '⚠️ '}{submitStatus.message}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={submitting || !selectedLocation || (savedLocation?.mapbox_id === selectedLocation?.mapbox_id)}
                    className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            💾 Save Location
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Location;
