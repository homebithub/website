import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Navigation } from '~/components/Navigation';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { Footer } from '../components/Footer';

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

export default function HousehelpProfileSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // [DEV ONLY] Authentication check temporarily disabled for direct access
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   navigate('/login');
    //   return;
    // }
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Profile setup complete
      navigate('/'); // Redirect to home page
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-purple-900 mb-2">
                  Complete Your Househelp Profile
                </h1>
                <div className="text-sm text-gray-500">
                  Step {currentStep + 1} of {STEPS.length}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              {/* Current Step Title */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-purple-900">
                  {STEPS[currentStep].title}
                </h2>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 py-6 sm:py-8">
              <div className="max-w-2xl mx-auto">
                {STEPS[currentStep].id === 'bio' ? (
                  <CurrentComponent userType="househelp" />
                ) : STEPS[currentStep].id === 'photos' ? (
                  <CurrentComponent userType="househelp" />
                ) : STEPS[currentStep].id === 'religion' ? (
                  <CurrentComponent userType="househelp" />
                ) : (
                  <CurrentComponent />
                )}
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    Back
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    {currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
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
                  className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  {currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
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

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
