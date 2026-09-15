import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ProfileDraft = Record<string, any>;

interface ProfileEditorContextValue {
  profileData: ProfileDraft;
  updateProfileDraft: (sectionId: string, data: any) => void;
  hasUnsavedChanges: boolean;
  markDirty: () => void;
  markClean: () => void;
}

const fallbackContext: ProfileEditorContextValue = {
  profileData: {},
  updateProfileDraft: () => {},
  hasUnsavedChanges: false,
  markDirty: () => {},
  markClean: () => {},
};

const ProfileEditorContext = createContext<ProfileEditorContextValue | undefined>(undefined);

/**
 * Local draft state shared by the profile-page edit modals.
 *
 * The old provider persisted numbered onboarding steps. Those steps no longer
 * exist: each editor saves its actual profile or catalogue data directly, and
 * completion is computed by the backend from that canonical data.
 */
export function ProfileEditorProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileDraft>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateProfileDraft = useCallback((sectionId: string, data: any) => {
    setProfileData((current) => ({ ...current, [sectionId]: data }));
  }, []);
  const markDirty = useCallback(() => setHasUnsavedChanges(true), []);
  const markClean = useCallback(() => setHasUnsavedChanges(false), []);

  const value = useMemo(() => ({
    profileData,
    updateProfileDraft,
    hasUnsavedChanges,
    markDirty,
    markClean,
  }), [hasUnsavedChanges, markClean, markDirty, profileData, updateProfileDraft]);

  return (
    <ProfileEditorContext.Provider value={value}>
      {children}
    </ProfileEditorContext.Provider>
  );
}

export function useProfileEditor(): ProfileEditorContextValue {
  return useContext(ProfileEditorContext) ?? fallbackContext;
}
