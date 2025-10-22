import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Navigation } from '~/components/Navigation';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from '~/components/Footer';
import { ProfileSetupProvider, useProfileSetup } from '~/contexts/ProfileSetupContext';
import { API_BASE_URL } from '~/config/api';

// Import all the components
import Location from '~/components/Location';
import Children from '~/components/Children';
import NannyType from '~/components/NanyType';
import Chores from '~/components/Chores';
import Pets from '~/components/Pets';
import Budget from '~/components/Budget';
import HouseSize from '~/components/HouseSize';
import Bio from '~/components/Bio';
import Photos from '~/components/Photos';
import Religion from '~/components/Religion';

const STEPS = [
  { id: 'location', title: 'Location', component: Location, description: 'Where is your household located?' },
  { id: 'children', title: 'Children', component: Children, description: 'Tell us about your children' },
  { id: 'nannytype', title: 'Service Type', component: NannyType, description: 'What type of help do you need?' },
  { id: 'budget', title: 'Budget', component: Budget, description: 'What\'s your budget range?', skippable: false },
  { id: 'chores', title: 'Chores & Duties', component: Chores, description: 'What tasks need to be done?' },
  { id: 'pets', title: 'Pets', component: Pets, description: 'Do you have any pets?', skippable: true },
  { id: 'housesize', title: 'House Size', component: HouseSize, description: 'Tell us about your home' },
  { id: 'bio', title: 'About Your Household', component: Bio, description: 'Share your story and preferences' },
  { id: 'photos', title: 'Photos', component: Photos, description: 'Add photos of your home', skippable: true },
];

function HouseholdProfileSetupContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const navigate = useNavigate();
  const { saveProfileToBackend, loadProfileFromBackend, lastCompletedStep, profileData, error: setupError } = useProfileSetup();
  
  // Track time spent on each step
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(interval);
      const timeOnStep = Math.floor((Date.now() - startTime) / 1000);
      // Save time spent when leaving step
      saveProgressToBackend(currentStep, timeOnStep);
    };
  }, [currentStep]);

  useEffect(() => {
    // Load existing profile data on mount
    const loadData = async () => {
      await loadProfileFromBackend();
    };
    loadData();
  }, [loadProfileFromBackend]);

  useEffect(() => {
    // Jump to last completed step + 1 (or stay at 0 if starting fresh)
    if (lastCompletedStep > 0 && lastCompletedStep < STEPS.length) {
      setCurrentStep(lastCompletedStep);
      console.log(`Resuming from step ${lastCompletedStep + 1}`);
    }
  }, [lastCompletedStep]);

  const handleNext = async () => {
    // Save progress before moving to next step
    await saveProgressToBackend(currentStep, timeSpent);
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeSpent(0); // Reset timer for new step
    } else {
      // Profile setup complete - save all data to backend
      setSaving(true);
      try {
        await saveProfileToBackend();
        // Mark as completed
        await saveProgressToBackend(STEPS.length, timeSpent, true);
        // Redirect to household dashboard after successful save
        navigate('/household/profile');
      } catch (error) {
        console.error('Failed to save profile:', error);
        alert('Failed to save profile. Please try again.');
        setSaving(false);
      }
    }
  };
  
  const handleSkip = async () => {
    // Save that user skipped this step
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
          profile_type: 'household',
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
      // Save current progress before going back
      await saveProgressToBackend(currentStep, timeSpent);
      setCurrentStep(currentStep - 1);
      setTimeSpent(0);
    }
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
          <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-200 dark:border-purple-500/30 mb-6 sm:mb-8 transition-colors duration-300">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Complete Your Household Profile 🏠
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

          {/* Content Area */}
          <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-100 dark:border-purple-500/30 mb-6 sm:mb-8 transition-colors duration-300">
            <div className="px-4 sm:px-6 py-6 sm:py-8">
              <div className="max-w-2xl mx-auto">
                {STEPS[currentStep].id === 'bio' ? (
                  <CurrentComponent userType="household" />
                ) : STEPS[currentStep].id === 'photos' ? (
                  <CurrentComponent userType="household" />
                ) : STEPS[currentStep].id === 'nannytype' ? (
                  <CurrentComponent userType="household" />
                ) : (
                  <CurrentComponent />
                )}
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-100 dark:border-purple-500/30 transition-colors duration-300">
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
                    className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all"
                  >
                    {currentStep === STEPS.length - 1 ? '🎉 Complete' : 'Next →'}
                    {currentStep !== STEPS.length - 1 && (
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
                  disabled={saving}
                  className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {saving ? '✨ Saving...' : (currentStep === STEPS.length - 1 ? '🎉 Complete' : 'Next →')}
                  {currentStep !== STEPS.length - 1 && !saving && (
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

// Wrap with ProfileSetupProvider
export default function HouseholdProfileSetup() {
  return (
    <ProfileSetupProvider>
      <HouseholdProfileSetupContent />
    </ProfileSetupProvider>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
