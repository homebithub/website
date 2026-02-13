import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '~/config/api';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';

const CHORES = [
  "Laundry",
  "Cooking",
  "Dishwashing",
  "Sweeping",
  "Mopping",
  "Ironing clothes",
  "Grocery shopping",
  "Window cleaning",
  "Bathroom cleaning",
  "Pet care",
  "Other"
];

const Chores: React.FC = () => {
  const [selectedChores, setSelectedChores] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherChore, setOtherChore] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.chores && Array.isArray(data.chores)) {
            setSelectedChores(data.chores);
            // Check if any chore starts with "Other:"
            const hasOther = data.chores.some((c: string) => c.startsWith('Other:'));
            if (hasOther) {
              setShowOtherInput(true);
              const otherChore = data.chores.find((c: string) => c.startsWith('Other:'));
              if (otherChore) {
                setOtherChore(otherChore.replace('Other: ', ''));
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load chores:', err);
      }
    };
    loadData();
  }, []);

  const toggleChore = (chore: string) => {
    if (chore === "Other") {
      setShowOtherInput(!showOtherInput);
      if (showOtherInput) {
        // If unchecking "Other", remove it and clear the input
        setSelectedChores(prev => prev.filter(c => !c.startsWith("Other:")));
        setOtherChore("");
      }
      return;
    }
    
    setSelectedChores(prev =>
      prev.includes(chore)
        ? prev.filter(c => c !== chore)
        : [...prev, chore]
    );
  };

  const handleOtherChoreAdd = () => {
    if (otherChore.trim()) {
      const customChore = `Other: ${otherChore.trim()}`;
      setSelectedChores(prev => {
        // Remove any existing "Other:" entries and add the new one
        const filtered = prev.filter(c => !c.startsWith("Other:"));
        return [...filtered, customChore];
      });
    }
  };

  const saveChores = async () => {
    if (selectedChores.length === 0) {
      setMessage("Please select at least one chore");
      return;
    }

    if (showOtherInput && !selectedChores.some(c => c.startsWith("Other:"))) {
      setMessage("Please add your custom chore or uncheck 'Other'");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          chores: selectedChores,
          _step_metadata: {
            step_id: "chores",
            step_number: 4,
            is_completed: true
          }
        }),
      });

      if (response.ok) {
        setMessage("Chores saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(errorData.message || "Failed to save chores");
      }
    } catch (error) {
      console.error('Error saving chores:', error);
      setMessage("An error occurred while saving chores");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">🧹 Chores & Duties <span className="text-red-500">*</span></h2>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        What tasks do you need help with? (Select at least one)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHORES.map(chore => {
          const isOther = chore === "Other";
          const isChecked = isOther 
            ? showOtherInput || selectedChores.some(c => c.startsWith("Other:"))
            : selectedChores.includes(chore);
          
          return (
            <label key={chore} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all
              ${isChecked ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105" : "border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20"}
            `}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                isChecked
                  ? 'border-purple-500 bg-purple-500' 
                  : 'border-purple-300 dark:border-purple-500/50'
              }`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleChore(chore)}
                  className="sr-only"
                />
                {isChecked && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>{chore}</span>
            </label>
          );
        })}
      </div>
      
      {/* Other Chore Input */}
      {showOtherInput && (
        <div className="space-y-3 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-500/30">
          <label htmlFor="otherChore" className="block text-sm font-semibold text-purple-700 dark:text-purple-400">
            ✏️ Specify Other Chore <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              id="otherChore"
              type="text"
              value={otherChore}
              onChange={(e) => setOtherChore(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleOtherChoreAdd();
                }
              }}
              placeholder="e.g., Gardening, Car washing, etc."
              className="flex-1 h-10 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 text-sm"
            />
            <button
              type="button"
              onClick={handleOtherChoreAdd}
              disabled={!otherChore.trim()}
              className="px-6 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-sm shadow-md hover:bg-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Type your custom chore and click "Add" or press Enter
          </p>
        </div>
      )}
      
      {selectedChores.length > 0 && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-500/30">
          <span className="text-purple-700 dark:text-purple-400 font-bold text-sm">✓ Selected ({selectedChores.length}):</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedChores.map(chore => (
              <span key={chore} className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-800/40 text-purple-800 dark:text-purple-200 text-sm font-semibold border border-purple-200 dark:border-purple-500/30">
                {chore}
              </span>
            ))}
          </div>
        </div>
      )}
      {message && message.includes('successfully') && <SuccessAlert message={message} />}
      {message && !message.includes('successfully') && (
        <ErrorAlert message={message} />
      )}
      <button
        type="button"
        className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        onClick={saveChores}
        disabled={isLoading || selectedChores.length === 0}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  );
};

export default Chores;
