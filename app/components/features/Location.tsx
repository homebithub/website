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
    const [submitStatus, setSubmitStatus] = useState<{success: boolean; message: string} | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const baseUrl = API_BASE_URL
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
    };

    const handleSuggestionClick = (suggestion: LocationSuggestion) => {
        setInput(suggestion.name);
        setSelectedLocation(suggestion);
        setShowDropdown(false);
        setSuggestions([]);
        setSubmitStatus(null);
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
                    mapbox_id: selectedLocation.mapbox_id,
                    _step_metadata: {
                        step_id: "location",
                        step_number: 1,
                        is_completed: true
                    }
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setSubmitStatus({
                    success: true,
                    message: data.message || 'Location saved successfully!'
                });
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
        <div className="w-full max-w-md mx-auto relative">
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6 bg-white dark:bg-[#13131a] border border-gray-100 dark:border-purple-500/30 p-8 rounded-xl shadow-lg dark:shadow-glow-md transition-colors duration-300">
                <div className="relative">
                    <label htmlFor="location-input" className="block text-sm font-medium text-primary mb-1">
                        Location
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                        If your exact location isn't found, try searching for the nearest town or landmark
                    </p>
                    <input
                        id="location-input"
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        className="w-full h-12 text-base px-4 py-3 rounded-lg border bg-white text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition border-primary-200"
                        placeholder="Enter location..."
                    />
                    {showDropdown && suggestions.length > 0 && (
                        <div
                            ref={dropdownRef}
                            className="absolute left-0 w-full bg-white dark:bg-[#13131a] border border-gray-200 dark:border-purple-500/30 rounded-b-xl shadow-lg dark:shadow-glow-md z-10 max-h-56 overflow-y-auto transition-colors duration-300"
                            style={{ top: '100%' }}
                        >
                            {loading && (
                                <div className="px-4 py-3 text-gray-500">Loading...</div>
                            )}
                            {suggestions.map((s, idx) => (
                                <div
                                    key={s.mapbox_id}
                                    onClick={() => handleSuggestionClick(s)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`px-4 py-3 cursor-pointer font-medium border-b last:border-b-0 ${idx === selectedIndex ? 'bg-primary-50' : 'bg-white'} text-gray-900 hover:bg-primary-100`}
                                >
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {submitStatus && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${submitStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {submitStatus.message}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full ${submitting ? 'bg-primary-500' : 'bg-primary-700 hover:bg-primary-800'} text-white py-3 rounded-lg transition-colors duration-200 font-semibold text-lg disabled:opacity-60 flex items-center justify-center`}
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : 'Save Location'}
                </button>
            </form>
        </div>
    );
};

export default Location;
