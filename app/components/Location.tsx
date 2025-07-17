import React, {useState, useRef, useEffect} from "react";

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
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const baseUrl = 'http://localhost:8080'
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
        setShowDropdown(false);
        setSuggestions([]);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowDropdown(false);
        // Optionally handle submit logic here
    };

    return (
        <div className="w-full max-w-md relative">
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6 bg-white border border-gray-100 p-8 rounded-xl shadow-lg">
                <div className="relative">
                    <label htmlFor="location-input" className="block text-sm font-medium text-primary mb-1">
                        Location
                    </label>
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
                            className="absolute left-0 w-full bg-white border border-gray-200 rounded-b-xl shadow-lg z-10 max-h-56 overflow-y-auto"
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
                <button
                    type="submit"
                    className="w-full bg-primary-700 text-white py-3 rounded-lg hover:bg-primary-800 transition-colors duration-200 font-semibold text-lg disabled:opacity-60"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default Location;
