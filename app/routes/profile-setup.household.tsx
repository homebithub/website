import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '~/contexts/useAuth';
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
  { id: 'nannytype', title: 'Service Type', component: NannyType, description: 'What type of help do you need?' },
  { id: 'children', title: 'Children', component: Children, description: 'Tell us about your children' },
  { id: 'housesize', title: 'House Size', component: HouseSize, description: 'Tell us about your home' },
  { id: 'chores', title: 'Chores & Duties', component: Chores, description: 'What tasks need to be done?' },
  { id: 'budget', title: 'Budget', component: Budget, description: 'What\'s your budget range?', skippable: false },
  { id: 'pets', title: 'Pets', component: Pets, description: 'Do you have any pets?', skippable: true },
  { id: 'religion', title: 'Religion & Beliefs', component: Religion, description: 'Share your religious preferences' },
  { id: 'bio', title: 'About Your Household', component: Bio, description: 'Share your story and preferences' },
  { id: 'photos', title: 'Photos', component: Photos, description: 'Add photos of your home', skippable: true },
];

function HouseholdProfileSetupContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { saveProfileToBackend, loadProfileFromBackend, updateStepData, saveStepToBackend, lastCompletedStep, profileData, error: setupError } = useProfileSetup();
  
  const currentStepData = STEPS[currentStep];

  const handleLocationSaved = async (location: any) => {
    const locationData = {
      place: location.name,
      name: location.name,
      mapbox_id: location.mapbox_id,
      feature_type: location.feature_type || 'place',
    };
    
    // Update local state
    updateStepData('location', locationData);
    
    // Also save to backend step tracking
    try {
      // Find the step index for 'location'
      const locationStepIndex = STEPS.findIndex(step => step.id === 'location');
      await saveStepToBackend('location', locationData, locationStepIndex);
    } catch (error) {
      console.error('Failed to save location step data:', error);
    }
  };
  
  // Check if user is editing from profile page using location state (secure, can't be manipulated)
  const isEditMode = location.state?.fromProfile === true;
  
  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      }
    }
  }, [authLoading, user, navigate]);
  
  // Clean up URL on mount - remove any query parameters or hash
  useEffect(() => {
    const currentPath = window.location.pathname;
    const cleanPath = '/profile-setup/household';
    if (currentPath !== cleanPath || window.location.search || window.location.hash) {
      window.history.replaceState({}, '', cleanPath);
    }
  }, []);
  
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
    // If editing a specific section from profile page, navigate to that step
    if (isEditMode && location.state?.editSection) {
      const sectionId = location.state.editSection;
      const stepIndex = STEPS.findIndex(step => step.id === sectionId);
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
      }
    } else if (lastCompletedStep > 0 && lastCompletedStep < STEPS.length) {
      // Jump to last completed step if returning user (not in edit mode)
      setCurrentStep(lastCompletedStep);
      console.log(`Resuming from step ${lastCompletedStep + 1}`);
    }
  }, [lastCompletedStep, isEditMode, location.state]);

  const handleNext = async () => {
    // Save progress before moving to next step
    await saveProgressToBackend(currentStep, timeSpent);
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeSpent(0); // Reset timer for new step
    } else {
      // Last step - show disclaimer before completing
      setDisclaimerChecked(false);
      setShowDisclaimer(true);
    }
  };
  
  const handleSkip = async () => {
    // Save that user skipped this step
    await saveProgressToBackend(currentStep, timeSpent, false, true);
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeSpent(0);
    } else {
      // Last step - show disclaimer before completing
      setDisclaimerChecked(false);
      setShowDisclaimer(true);
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
  
  const finishSetup = async () => {
    setSaving(true);
    try {
      await saveProfileToBackend();
      await markAllStepsComplete();
      setShowDisclaimer(false);
      setShowCongratulations(true);
      setTimeout(() => {
        navigate('/household/profile');
      }, 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const markAllStepsComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Mark ALL steps as completed in profile-setup-steps
      for (let i = 0; i < STEPS.length; i++) {
        await fetch(`${API_BASE_URL}/api/v1/profile-setup-steps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            step_id: STEPS[i].id,
            step_number: i,
            is_completed: true,
            is_skipped: false,
            data: {}
          })
        });
      }
      
      // Also update progress tracking to mark as complete
      await fetch(`${API_BASE_URL}/api/v1/profile-setup-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_step: STEPS.length,
          last_completed_step: STEPS.length,
          completed_steps: STEPS.map(s => s.id),
          step_id: 'completed',
          time_spent_seconds: 0
        })
      });
    } catch (error) {
      console.error('Failed to mark steps as complete:', error);
    }
  };
  
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
      
      // Handle case when step is beyond STEPS array (completion)
      const actualStep = Math.min(step, STEPS.length - 1);
      // Backend expects step IDs (strings), not step numbers
      const completedSteps = Array.from({ length: actualStep + 1 }, (_, i) => STEPS[i].id);
      
      // Save progress tracking
      await fetch(`${API_BASE_URL}/api/v1/profile-setup-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_step: actualStep + 1,
          last_completed_step: actualStep + 1,
          completed_steps: completedSteps,
          step_id: STEPS[actualStep]?.id || 'completed',
          time_spent_seconds: timeOnStep
        })
      });
      
      // Mark step as completed in profile-setup-steps (required for is_complete check)
      if (isComplete || !isAutoSave) {
        await fetch(`${API_BASE_URL}/api/v1/profile-setup-steps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            step_id: STEPS[actualStep]?.id || 'completed',
            step_number: actualStep,
            is_completed: isComplete || !skipped,
            is_skipped: skipped,
            data: {}
          })
        });
      }
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
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header Card - Hide in edit mode */}
          {!isEditMode && (
          <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-200 dark:border-purple-500/30 mb-6 sm:mb-8 transition-colors duration-300">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center mb-4">
                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
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
              <div className="w-full bg-purple-100 rounded-full h-2.5 mb-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full transition-all duration-300 ease-out shadow-md"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              {/* Current Step Title */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold text-purple-700 dark:text-purple-400">
                  {STEPS[currentStep].title}
                </h2>
              </div>
            </div>
          </div>
          )}

          {/* Edit Mode Header - Show only in edit mode */}
          {isEditMode && (
            <div className="mb-6">
              <button
                onClick={() => navigate('/household/profile')}
                className="flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mb-4"
              >
                ← Back to Profile
              </button>
              <h2 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-2">
                Edit {STEPS[currentStep].title}
              </h2>
            </div>
          )}

          {/* Content Area */}
          <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 mb-6 sm:mb-8 transition-colors duration-300">
            <div className="px-4 sm:px-6 py-6 sm:py-8">
              <div className="max-w-2xl mx-auto">
                {STEPS[currentStep].id === 'bio' ? (
                  <CurrentComponent userType="household" />
                ) : STEPS[currentStep].id === 'photos' ? (
                  <CurrentComponent userType="household" onComplete={async () => {
                    console.log('Photos onComplete callback triggered!');
                    // Show disclaimer modal before completing
                    setDisclaimerChecked(false);
                    setShowDisclaimer(true);
                  }} />
                ) : STEPS[currentStep].id === 'nannytype' ? (
                  <CurrentComponent userType="household" />
                ) : STEPS[currentStep].id === 'location' ? (
                  <CurrentComponent onSaved={handleLocationSaved} />
                ) : (
                  <CurrentComponent />
                )}
              </div>
            </div>
          </div>

          {/* Navigation Footer - Hide in edit mode */}
          {!isEditMode && (
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
                    className={`flex items-center px-4 py-1 rounded-xl text-sm font-medium transition-colors ${
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
                    disabled={saving}
                    className={`flex items-center px-6 py-1.5 rounded-xl text-white font-bold shadow-lg transition-all ${
                      saving 
                        ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                    }`}
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
                  className={`flex items-center px-4 py-1 rounded-xl text-sm font-medium transition-colors ${
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
                  className={`flex items-center px-6 py-1.5 rounded-xl text-white font-bold shadow-lg transition-all ${
                    saving 
                      ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                  }`}
                >
                  {saving ? '✨ Saving...' : (currentStep === STEPS.length - 1 ? '🎉 Complete' : 'Next →')}
                  {currentStep !== STEPS.length - 1 && !saving && (
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </main>
      
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="disclaimer-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={() => { setShowDisclaimer(false); setDisclaimerChecked(false); }}></div>

            <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border-2 border-purple-500/50">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white" id="disclaimer-title">
                    Almost There!
                  </h3>
                </div>
              </div>

              <div className="px-6 py-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Before we finalize your profile, please confirm the following:
                </p>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={disclaimerChecked}
                      onChange={(e) => setDisclaimerChecked(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="h-5 w-5 rounded border-2 border-purple-400 dark:border-purple-500 bg-white dark:bg-gray-800 peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-colors flex items-center justify-center">
                      {disclaimerChecked && (
                        <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                    I confirm that all the information I have provided is accurate and truthful to the best of my knowledge. I understand that providing false or misleading information may result in account suspension.
                  </span>
                </label>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => { setShowDisclaimer(false); setDisclaimerChecked(false); }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm"
                >
                  Go Back
                </button>
                <button
                  onClick={finishSetup}
                  disabled={!disclaimerChecked || saving}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-700 text-white font-bold shadow-lg hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Finishing...
                    </>
                  ) : (
                    'Finish'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2" id="modal-title">
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
                    You can now start browsing and connecting with qualified househelps in your area.
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
