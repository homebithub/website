import React, { useState, useEffect } from 'react';
import { handleApiError } from '../utils/errorMessages';
import { UserGroupIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import Kids from "./Kids";
import { API_BASE_URL } from '~/config/api';
import { ErrorAlert } from '~/components/ui/ErrorAlert';

export interface Child {
  id?: string | number;
  gender: string;
  date_of_birth?: string;
  expected_date?: string;
  notes?: string;
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
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Load existing children on mount
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // First, check if there are any kids
        const kidsRes = await fetch(`${API_BASE_URL}/api/v1/household_kids`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (kidsRes.ok) {
          const kidsResponse = await kidsRes.json();
          const kids = kidsResponse.data?.data || [];
          console.log('Loaded children response:', kidsResponse);
          console.log('Extracted kids array:', kids);
          if (kids && kids.length > 0) {
            setChildrenList(kids);
            setSelected("have_or_expecting");
            return; // Exit early if we have kids
          }
        }
        
        // If no kids, check if user has progressed beyond this step
        const profileRes = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (profileRes.ok) {
          const profile = await profileRes.json();
          // If they have data in steps beyond children (like chores, budget, religion, bio)
          // but no children, assume they selected "no children"
          if (profile.chores || profile.budget_min || profile.religion || profile.bio) {
            setSelected("no_children");
          }
        }
      } catch (err) {
        console.error("Failed to load children:", err);
      }
    };
    
    loadChildren();
  }, []);

  const handleOptionChange = async (value: string) => {
    setSelected(value);
    
    // If user selects "no children", save immediately
    if (value === "no_children") {
      await saveChildrenPreference(false);
    }
  };

  const saveChildrenPreference = async (hasChildren: boolean) => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          has_children: hasChildren,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to save preference");
      
      setSaveMessage({ type: 'success', text: 'Preference saved successfully' });
      // Note: Step completion is tracked server-side when kids are added
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: handleApiError(err, 'children', 'Failed to save preference') });
    } finally {
      setSaving(false);
    }
  };

  const handleChildrenUpdate = (children: Child[]) => {
    setChildrenList(children);
  };

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

        {/* Save Status Message */}
        {saveMessage && saveMessage.type === 'success' && (
          <div className="p-4 rounded-xl text-sm font-semibold border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30">
            ✓ {saveMessage.text}
          </div>
        )}
        {saveMessage && saveMessage.type !== 'success' && (
          <ErrorAlert message={saveMessage.text} />
        )}
      </div>
    </div>
  );
};

export default Children;
