import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Navigation } from '~/components/Navigation';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from '~/components/Footer';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';
import { API_BASE_URL } from '~/config/api';

// Import all the components
import Location from '~/components/Location';
import Gender from '~/components/Gender';
import NannyType from '~/components/NanyType';
import YearsOfExperience from '~/components/YearsOfExperience';
import WorkWithKids from '~/components/WorkWithKids';
import WorkWithPets from '~/components/WorkWithPets';
import Languages from '~/components/Languages';
import MyKids from '~/components/MyKids';
import Certifications from '~/components/Certifications';
import SalaryExpectations from '~/components/SalaryExpectations';
import Bio from '~/components/Bio';
import Photos from '~/components/Photos';
import PreferredWorkEnvironment from '~/components/PreferredWorkEnvironment';
import References from '~/components/References';
import BackgroundCheckConsent from '~/components/BackgroundCheckConsent';

const STEPS = [
  // Step 1: Location
  { id: 'location', title: 'Location', component: Location, description: 'Where are you located?', skippable: false },
  
  // Step 2: Service Type & Availability
  { id: 'nannytype', title: 'Service Type & Availability', component: NannyType, description: 'What type of work do you offer?', skippable: false },
  
  // Step 3: Personal Info (Gender & Age)
  { id: 'gender', title: 'Personal Info', component: Gender, description: 'Tell us about yourself', skippable: false },
  
  // Step 4: Experience & Certifications (Combined)
  { id: 'experience', title: 'Experience & Certifications', component: YearsOfExperience, description: 'Your professional background', skippable: false },
  { id: 'certifications', title: 'Certifications & Skills', component: Certifications, description: 'Your qualifications', skippable: false },
  
  // Step 5: Salary Expectations
  { id: 'salary', title: 'Salary Expectations', component: SalaryExpectations, description: 'What are your salary requirements?', skippable: false },
  
  // Step 6: Work with Kids (Required - Yes/No)
  { id: 'workwithkids', title: 'Work with Kids', component: WorkWithKids, description: 'Can you care for children?', skippable: false },
  
  // Step 7: Work with Pets (Required - Yes/No)
  { id: 'workwithpets', title: 'Work with Pets', component: WorkWithPets, description: 'Comfortable with pets?', skippable: false },
  
  // Step 8: Languages
  { id: 'languages', title: 'Languages', component: Languages, description: 'What languages do you speak?', skippable: false },
  
  // Step 9: My Kids & Preferred Work Environment (Combined, Optional)
  { id: 'mykids', title: 'Personal Preferences', component: MyKids, description: 'Do you have children?', skippable: true },
  { id: 'workenvironment', title: 'Work Environment', component: PreferredWorkEnvironment, description: 'Your ideal workplace', skippable: true },
  
  // Step 10: References (Optional)
  { id: 'references', title: 'References', component: References, description: 'Professional references', skippable: true },
  
  // Step 11: Background Check Consent (Optional)
  { id: 'backgroundcheck', title: 'Background Check', component: BackgroundCheckConsent, description: 'Verification consent', skippable: true },
  
  // Step 12: About You / Bio
  { id: 'bio', title: 'About You', component: Bio, description: 'Tell your story', skippable: false },
  
  // Step 13: Photos (Optional but Recommended)
  { id: 'photos', title: 'Photos', component: Photos, description: 'Add your profile photos', skippable: true },
];

function HousehelpProfileSetupContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const navigate = useNavigate();
  const { 
    profileData, 
    updateStepData, 
    saveProfileToBackend, 
    loadProfileFromBackend,
    lastCompletedStep,
    isLoading, 
    error 
  } = useProfileSetup();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Track time spent on each step
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(interval);
      const timeOnStep = Math.floor((Date.now() - startTime) / 1000);
      saveProgressToBackend(currentStep, timeOnStep);
    };
  }, [currentStep]);

  useEffect(() => {
    // Load existing profile data on mount
    loadProfileFromBackend();
  }, []);

  useEffect(() => {
    // Jump to last completed step if returning user
    if (lastCompletedStep > 0 && lastCompletedStep < STEPS.length) {
      setCurrentStep(lastCompletedStep);
    }
  }, [lastCompletedStep]);

  const handleNext = async () => {
    await saveProgressToBackend(currentStep, timeSpent);
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeSpent(0);
    } else {
      // Last step - save complete profile
      setIsSaving(true);
      setSaveError(null);
      
      try {
        await saveProfileToBackend();
        await saveProgressToBackend(STEPS.length, timeSpent, true);
        // Show congratulations modal
        setShowCongratulations(true);
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/househelp/profile');
        }, 3000);
      } catch (err: any) {
        setSaveError(err.message || 'Failed to save profile');
        console.error('Error saving profile:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  const handleSkip = async () => {
    await saveProgressToBackend(currentStep, timeSpent, false, true);
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeSpent(0);
    }
  };
  
  // Auto-save progress every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      setAutoSaving(true);
      await saveProgressToBackend(currentStep, timeSpent, false, false, true);
      setAutoSaving(false);
      setLastSaved(new Date());
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [currentStep, timeSpent]);
  
  const saveProgressToBackend = async (
    step: number, 
    timeOnStep: number, 
    isComplete: boolean = false,
    skipped: boolean = false,
    isAutoSave: boolean = false
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const completedSteps = Array.from({ length: step + 1 }, (_, i) => i + 1);
      
      await fetch(`${API_BASE_URL}/api/v1/profile-setup-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profile_type: 'househelp',
          current_step: step + 1,
          last_completed_step: step + 1,
          completed_steps: completedSteps,
          step_id: STEPS[step].id,
          time_spent_seconds: timeOnStep,
          status: isComplete ? 'completed' : 'in_progress',
          skipped: skipped,
          is_auto_save: isAutoSave
        })
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleBack = async () => {
    if (currentStep > 0) {
      await saveProgressToBackend(currentStep, timeSpent);
      setCurrentStep(currentStep - 1);
      setTimeSpent(0);
    }
  };

  const handleStepDataUpdate = (data: any) => {
    const stepId = STEPS[currentStep].id;
    updateStepData(stepId, data);
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;
  const CurrentComponent = STEPS[currentStep].component;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={true} bubbleDensity="low" className="flex-1">
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200 dark:border-purple-500/30 mb-6 sm:mb-8 transition-colors duration-300">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Complete Your Househelp Profile 👩‍💼
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {STEPS[currentStep].description}
                </p>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    Step {currentStep + 1} of {STEPS.length}
                  </span>
                  {autoSaving && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span className="animate-pulse">💾</span> Auto-saving...
                    </span>
                  )}
                  {lastSaved && !autoSaving && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ✓ Saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s ago
                    </span>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-purple-100 rounded-full h-4 mb-4 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-300 ease-out shadow-md"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              {/* Current Step Title */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-400">
                  {STEPS[currentStep].title}
                </h2>
                {STEPS[currentStep].skippable && (
                  <button
                    onClick={handleSkip}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 underline"
                  >
                    Skip for now
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {(error || saveError) && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error || saveError}</p>
            </div>
          )}

          {/* Loading Display */}
          {(isLoading || isSaving) && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <p className="text-blue-600 text-sm">
                {isSaving ? 'Saving your profile...' : 'Loading...'}
              </p>
            </div>
          )}

          {/* Content Area */}
          <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 mb-6 sm:mb-8 transition-colors duration-300">
            <div className="px-4 sm:px-6 py-6 sm:py-8">
              <div className="max-w-2xl mx-auto">
                {/* Components that need userType prop */}
                {STEPS[currentStep].id === 'photos' ? (
                  <CurrentComponent 
                    userType="househelp" 
                    onComplete={async () => {
                      console.log('Photos onComplete callback triggered!');
                      // Show congratulations modal when photos are skipped/uploaded
                      console.log('Setting showCongratulations to true');
                      setShowCongratulations(true);
                      setTimeout(() => {
                        console.log('Navigating to profile');
                        navigate('/househelp/profile');
                      }, 3000);
                    }}
                  />
                ) : ['bio', 'nannytype'].includes(STEPS[currentStep].id) ? (
                  <CurrentComponent userType="househelp" />
                ) : (
                  <CurrentComponent />
                )}
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 transition-colors duration-300">
            <div className="px-4 sm:px-6 py-4">
              {/* Mobile: Stack buttons vertically with dots in between */}
              <div className="sm:hidden space-y-4">
                {/* Progress dots */}
                <div className="flex justify-center space-x-2">
                  {STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={`h-3 w-3 rounded-full transition-colors ${
                        index <= currentStep ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Navigation buttons */}
                <div className="flex justify-between items-center gap-4">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentStep === 0
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    Back
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={isSaving}
                    className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSaving ? '✨ Saving...' : (currentStep === STEPS.length - 1 ? '🎉 Complete' : 'Next →')}
                    {currentStep !== STEPS.length - 1 && !isSaving && (
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    )}
                  </button>
                </div>
              </div>

              {/* Desktop: Original horizontal layout */}
              <div className="hidden sm:flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentStep === 0
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back
                </button>

                <div className="flex space-x-2">
                  {STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={`h-3 w-3 rounded-full transition-colors ${
                        index <= currentStep ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={isSaving}
                  className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSaving ? '✨ Saving...' : (currentStep === STEPS.length - 1 ? '🎉 Complete' : 'Next →')}
                  {currentStep !== STEPS.length - 1 && !isSaving && (
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Congratulations Modal */}
      {showCongratulations && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity"></div>

            {/* Modal panel */}
            <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 text-center shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border-4 border-purple-500">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white mb-4 animate-bounce">
                  <span className="text-5xl">🎉</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2" id="modal-title">
                  Congratulations!
                </h3>
                <p className="text-xl text-purple-100">
                  Welcome to Homebit!
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 px-6 py-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      Your profile is complete!
                    </p>
                  </div>
                  
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    You can now start connecting with households looking for qualified help.
                  </p>
                  
                  <div className="pt-4">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Redirecting to your profile...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export default function HousehelpProfileSetup() {
  return <HousehelpProfileSetupContent />;
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
