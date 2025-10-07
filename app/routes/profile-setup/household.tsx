import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Navigation } from '~/components/Navigation';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { Footer } from '../components/Footer';
import { ProfileSetupProvider, useProfileSetup } from '~/contexts/ProfileSetupContext';

// Import all the components
import Location from '../components/Location';
import Children from '../components/modals/Children';
import NannyType from '../components/features/NanyType';
import Chores from '../components/modals/Chores';
import Pets from '../components/modals/Pets';
import Budget from '../components/Budget';
import HouseSize from '../components/modals/HouseSize';
import Bio from '../components/Bio';
import Photos from '../components/features/Photos';
import Religion from '../components/modals/Religion';

const STEPS = [
  { id: 'location', title: 'Location', component: Location },
  { id: 'children', title: 'Children', component: Children },
  { id: 'nannytype', title: 'Service Type', component: NannyType },
  { id: 'chores', title: 'Chores', component: Chores },
  { id: 'pets', title: 'Pets', component: Pets },
  { id: 'budget', title: 'Budget', component: Budget },
  { id: 'religion', title: 'Religion & Beliefs', component: Religion },
  { id: 'housesize', title: 'House Size', component: HouseSize },
  { id: 'bio', title: 'About Your Household', component: Bio },
  { id: 'photos', title: 'Photos', component: Photos },
];

function HouseholdProfileSetupContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { saveProfileToBackend, loadProfileFromBackend, lastCompletedStep, profileData, error: setupError } = useProfileSetup();

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
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Profile setup complete - save all data to backend
      setSaving(true);
      try {
        await saveProfileToBackend();
        // Redirect to household dashboard after successful save
        navigate('/household/profile');
      } catch (error) {
        console.error('Failed to save profile:', error);
        // Show error but allow user to try again
        alert('Failed to save profile. Please try again.');
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg border-2 border-purple-200 mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Complete Your Household Profile 🏠
                </h1>
                <div className="text-sm font-semibold text-purple-600">
                  Step {currentStep + 1} of {STEPS.length}
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
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-purple-700">
                  {STEPS[currentStep].title}
                </h2>
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
                ) : STEPS[currentStep].id === 'religion' ? (
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
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-purple-900/20'
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
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
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
