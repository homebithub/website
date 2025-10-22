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
    } finally {
      setLoading(false);
    }
  };

  // No form submit handler needed - parent layout handles navigation
  // Individual children are saved immediately via handleChildSubmit

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-8">
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
      </div>
    </div>
  );
};

export default Children;
