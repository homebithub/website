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
      <form className="bg-white border p-8 rounded-xl shadow-lg flex flex-col gap-8" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-extrabold text-primary mb-4 text-center">Children</h2>
        <div className="flex flex-col gap-5">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
                selected === opt.value
                  ? "border-primary-500 bg-primary-50 text-primary-900"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="children"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => handleOptionChange(opt.value)}
                className="form-radio h-5 w-5 text-primary-600 border-gray-300"
              />
              <opt.icon className="h-7 w-7 text-primary-500" aria-hidden="true" />
              <span>{opt.label}</span>
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Children;
