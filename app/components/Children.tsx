import React, { useState, useEffect } from 'react';
import { handleApiError } from '../utils/errorMessages';
import { UserGroupIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import Kids from "./Kids";
import { API_BASE_URL } from '~/config/api';

export interface Child {
  id?: string | number;
  gender: string;
  date_of_birth?: string;
  expected_date?: string;
  traits?: string[];
  isExpecting?: boolean;
  is_expecting?: boolean;
  dob?: string;
}

const options = [
  { value: "have_or_expecting", label: "I have/expecting a child", icon: UserGroupIcon },
  { value: "no_children", label: "I do not have children", icon: NoSymbolIcon },
];

const Children: React.FC = () => {
  const [selected, setSelected] = useState<string>("");
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [gender, setGender] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [traits, setTraits] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showExpectingModal, setShowExpectingModal] = useState(false);
  const [expectingDate, setExpectingDate] = useState("");
  const [expectingLoading, setExpectingLoading] = useState(false);
  const [expectingError, setExpectingError] = useState("");

  const handleOptionChange = (value: string) => {
    setSelected(value);
  };

  const handleTraitChange = (trait: string) => {
    if (traits.includes(trait)) {
      setTraits(traits.filter((t) => t !== trait));
    } else if (traits.length < 3) {
      setTraits([...traits, trait]);
    }
  };

  const handleChildrenUpdate = (children: Child[]) => {
    setChildrenList(children);
  };

  const handleChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender || !dob || traits.length === 0) {
      setError("Please fill all fields and select up to 3 traits.");
      return;
    }
    // Date of birth must be today or in the past
    const today = new Date();
    today.setHours(0,0,0,0);
    const dobDate = new Date(dob);
    dobDate.setHours(0,0,0,0);
    if (dobDate > today) {
      setError("Date of birth cannot be in the future.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/household_kids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          gender,
          date_of_birth: dob,
          traits,
        }),
      });
      if (!res.ok) throw new Error("Failed to save child. Please try again.");
      const saved = await res.json();
      setChildrenList([...childrenList, saved]);
      setShowModal(false);
      setGender("");
      setDob("");
      setTraits([]);
    } catch (err: any) {
      setError(handleApiError(err, 'children', 'An error occurred.'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting children data:", childrenList);
    // Handle form submission with childrenList
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/household_kids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(childrenList),
      });

      if (!response.ok) {
        throw new Error("Failed to save children data");
      }
      
      // Handle successful save
      const result = await response.json();
      console.log("Children data saved successfully:", result);
    } catch (error) {
      console.error("Error saving children data:", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">👶 Children</h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
          Tell us about your children so we can find the perfect match
        </p>
        <div className="flex flex-col gap-4">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                selected === opt.value
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105"
                  : "border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              }`}
            >
              <input
                type="radio"
                name="children"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => handleOptionChange(opt.value)}
                className="form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
              />
              <opt.icon className="h-8 w-8 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              <span className="flex-1">{opt.label}</span>
            </label>
          ))}

          {selected === "have_or_expecting" && (
            <Kids 
              onChildrenUpdate={handleChildrenUpdate} 
              initialChildren={childrenList}
              className="mt-4"
            />
          )}
        </div>

        {selected && (
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
                💾 Continue
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
};

export default Children;
