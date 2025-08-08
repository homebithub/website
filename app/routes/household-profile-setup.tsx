import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';

// Import all the components
import Location from '../components/Location';
import Children from '../components/Children';
import NannyType from '../components/NanyType';
import Chores from '../components/Chores';
import Pets from '../components/Pets';
import Budget from '../components/Budget';
import HouseSize from '../components/HouseSize';
import Bio from '../components/Bio';
import Photos from '../components/Photos';

const STEPS = [
  { id: 'location', title: 'Location', component: Location },
  { id: 'children', title: 'Children', component: Children },
  { id: 'nannytype', title: 'Service Type', component: NannyType },
  { id: 'chores', title: 'Chores', component: Chores },
  { id: 'pets', title: 'Pets', component: Pets },
  { id: 'budget', title: 'Budget', component: Budget },
  { id: 'housesize', title: 'House Size', component: HouseSize },
  { id: 'bio', title: 'About Your Household', component: Bio },
  { id: 'photos', title: 'Photos', component: Photos },
];

export default function HouseholdProfileSetup() {
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-purple-900 mb-2">
                  Complete Your Household Profile
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
                  <CurrentComponent userType="household" />
                ) : STEPS[currentStep].id === 'photos' ? (
                  <CurrentComponent userType="household" />
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
      
      <Footer />
    </div>
  );
}
