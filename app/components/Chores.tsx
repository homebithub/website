import React, { useState } from "react";
import { API_BASE_URL } from '~/config/api';

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
  "Pet care"
];

const Chores: React.FC = () => {
  const [selectedChores, setSelectedChores] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const toggleChore = (chore: string) => {
    setSelectedChores(prev =>
      prev.includes(chore)
        ? prev.filter(c => c !== chore)
        : [...prev, chore]
    );
  };

  const saveChores = async () => {
    if (selectedChores.length === 0) {
      setMessage("Please select at least one chore");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/househelp-preferences/chores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chores: selectedChores.map(chore => chore.toLowerCase())
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Chores saved successfully!");
        console.log('Saved chores:', data.chores);
      } else {
        const errorData = await response.json();
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
    <div className="w-full max-w-lg mx-auto bg-white border border-gray-100 p-8 rounded-xl shadow-lg flex flex-col gap-8">
      <h2 className="text-2xl font-extrabold text-primary mb-4 text-center">Select chores</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CHORES.map(chore => (
          <label key={chore} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer shadow-sm text-lg font-medium transition
            ${selectedChores.includes(chore) ? "border-primary-500 bg-primary-50 text-primary-900" : "border-gray-200 bg-white hover:bg-gray-50"}
          `}>
            <span className="relative">
              <input
                type="checkbox"
                checked={selectedChores.includes(chore)}
                onChange={() => toggleChore(chore)}
                className="h-5 w-5 appearance-none border border-purple-400 rounded bg-white checked:bg-purple-700 checked:border-purple-700 focus:outline-none transition"
              />
              {selectedChores.includes(chore) && (
                <svg className="w-5 h-5 absolute left-0 top-0 pointer-events-none" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span>{chore}</span>
          </label>
        ))}
      </div>
      <div className="mt-6 text-center">
        <span className="text-gray-700 font-semibold">Selected chores:</span>
        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          {selectedChores.length === 0 ? (
            <span className="text-gray-400">None</span>
          ) : (
            selectedChores.map(chore => (
              <span key={chore} className="px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-sm font-medium border border-primary-200">
                {chore}
              </span>
            ))
          )}
        </div>
      </div>
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      <button
        type="button"
        className="mt-8 w-full bg-primary-700 hover:bg-primary-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-sm transition"
        onClick={saveChores}
        disabled={isLoading || selectedChores.length === 0}
      >
        {isLoading ? 'Saving...' : 'Save Chores'}
      </button>
    </div>
  );
};

export default Chores;
