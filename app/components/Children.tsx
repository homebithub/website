import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect } from 'react';
import { handleApiError } from '../utils/errorMessages';
import { UserGroupIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import Kids from "./Kids";
import { profileService as grpcProfileService, householdKidsService } from '~/services/grpc/authServices';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';

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
  const { markDirty, markClean, updateStepData, profileData } = useProfileSetup();
  const [selected, setSelected] = useState<string>("");
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Populate from context (instant on back-nav)
  useEffect(() => {
    const cached = profileData.children;
    if (cached) {
      if (cached.children === true) {
        setSelected('have_or_expecting');
        if (cached.kids?.length) setChildrenList(cached.kids);
      } else if (cached.children === false) {
        setSelected('no_children');
      } else if (cached.has_children !== undefined) {
        setSelected(cached.has_children ? 'have_or_expecting' : 'no_children');
      }
    }
  }, [profileData.children]);

  // Load existing children on mount
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const token = getAccessTokenFromCookies();
        
        // First, check if there are any kids via gRPC
        try {
          const kidsData = await householdKidsService.listHouseholdKids('');
          const kids = kidsData?.data?.data || kidsData?.data || [];
          if (Array.isArray(kids) && kids.length > 0) {
            setChildrenList(kids);
            setSelected("have_or_expecting");
            return;
          }
        } catch (err) {
          console.warn('Failed to load kids:', err);
        }
        
        // If no kids, check if user has progressed beyond this step
        try {
          const profile = await grpcProfileService.getCurrentHouseholdProfile('');
          if (profile?.chores || profile?.budget_min || profile?.religion || profile?.bio) {
            setSelected("no_children");
          }
        } catch (err) {
          console.warn('Failed to load profile:', err);
        }
      } catch (err) {
        console.error("Failed to load children:", err);
      }
    };
    
    loadChildren();
  }, []);

  const handleOptionChange = async (value: string) => {
    setSelected(value);
    markDirty();
    
    // If user selects "no children", save immediately
    if (value === "no_children") {
      await saveChildrenPreference(false);
    }
  };

  const saveChildrenPreference = async (hasChildren: boolean) => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const token = getAccessTokenFromCookies();
      await grpcProfileService.updateHouseholdProfile('', 'household', {
        has_children: hasChildren,
      });
      
      markClean();
      updateStepData('children', { children: hasChildren, kids: hasChildren ? childrenList : [] });
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
    if (children.length > 0) {
      updateStepData('children', { children: true, kids: children });
      markClean();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-8">
        <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">👶 Children</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Tell us about your children so we can find the perfect match
        </p>
        <div className="flex flex-col gap-4">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-xs font-medium transition-all ${
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
                className="form-radio h-4 w-4 text-purple-600 border-purple-300 focus:ring-purple-500"
              />
              <opt.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
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
          <div className="p-4 rounded-xl text-xs font-semibold border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30">
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
