import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Navigation } from '~/components/Navigation';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from '../components/Footer';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';

// Import all the components
import Location from '../components/Location';
import Gender from '../components/modals/Gender';
import NannyType from '../components/features/NanyType';
import YearsOfExperience from '../components/modals/YearsOfExperience';
import WorkWithKids from '../components/modals/WorkWithKids';
import WorkWithPets from '../components/modals/WorkWithPets';
import Languages from '../components/modals/Languages';
import MyKids from '../components/modals/MyKids';
import Certifications from '../components/modals/Certifications';
import SalaryExpectations from '../components/modals/SalaryExpectations';
import Bio from '../components/Bio';
import Photos from '../components/features/Photos';
import Religion from '../components/modals/Religion';

const STEPS = [
  { id: 'nannytype', title: 'Service Type', component: NannyType },
  { id: 'location', title: 'Location', component: Location },
  { id: 'gender', title: 'Gender & Age', component: Gender },
  { id: 'experience', title: 'Experience', component: YearsOfExperience },
  { id: 'workwithkids', title: 'Work with Kids', component: WorkWithKids },
  { id: 'workwithpets', title: 'Work with Pets', component: WorkWithPets },
  { id: 'languages', title: 'Languages', component: Languages },
  { id: 'mykids', title: 'My Kids', component: MyKids },
  { id: 'certifications', title: 'Certifications', component: Certifications },
  { id: 'salary', title: 'Salary Expectations', component: SalaryExpectations },
  { id: 'religion', title: 'Religion & Beliefs', component: Religion },
  { id: 'bio', title: 'Bio', component: Bio },
  { id: 'photos', title: 'Photos', component: Photos },
];

function HousehelpProfileSetupContent() {
  const [currentStep, setCurrentStep] = useState(0);
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
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - save complete profile
      setIsSaving(true);
      setSaveError(null);
      
      try {
        await saveProfileToBackend();
        
        // Save progress tracking
        const token = localStorage.getItem('token');
        if (token) {
          await fetch('/api/v1/profile-setup-progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              profile_type: 'househelp',
              current_step: STEPS.length,
              last_completed_step: STEPS.length,
              completed_steps: STEPS.map((_, idx) => idx + 1),
              status: 'completed',
              completion_percentage: 100
            })
          });
        }
        
        // Profile setup complete
        navigate('/');
      } catch (err: any) {
        setSaveError(err.message || 'Failed to save profile');
        console.error('Error saving profile:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg border-2 border-purple-200 mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Complete Your Househelp Profile 👩‍💼
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
          <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-100 dark:border-purple-500/30 mb-6 sm:mb-8 transition-colors duration-300">
            <div className="px-4 sm:px-6 py-6 sm:py-8">
              <div className="max-w-2xl mx-auto">
                {STEPS[currentStep].id === 'bio' ? (
                  <CurrentComponent 
                    userType="househelp" 
                    data={profileData[STEPS[currentStep].id]}
                    onUpdate={handleStepDataUpdate}
                  />
                ) : STEPS[currentStep].id === 'photos' ? (
                  <CurrentComponent 
                    userType="househelp"
                    data={profileData[STEPS[currentStep].id]}
                    onUpdate={handleStepDataUpdate}
                  />
                ) : STEPS[currentStep].id === 'religion' ? (
                  <CurrentComponent 
                    userType="househelp"
                    data={profileData[STEPS[currentStep].id]}
                    onUpdate={handleStepDataUpdate}
                  />
                ) : (
                  <CurrentComponent 
                    data={profileData[STEPS[currentStep].id]}
                    onUpdate={handleStepDataUpdate}
                  />
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
                    disabled={isSaving}
                    className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isSaving}
                  className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === STEPS.length - 1 ? '🎉 Complete' : 'Next →'}
                  {currentStep !== STEPS.length - 1 && (
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

export default function HousehelpProfileSetup() {
  return <HousehelpProfileSetupContent />;
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
