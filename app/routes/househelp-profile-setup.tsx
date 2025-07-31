import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Import all the components
import Location from '../components/Location';
import Gender from '../components/Gender';
import NannyType from '../components/NanyType';
import YearsOfExperience from '../components/YearsOfExperience';
import WorkWithKids from '../components/WorkWithKids';
import WorkWithPets from '../components/WorkWithPets';
import Languages from '../components/Languages';
import MyKids from '../components/MyKids';
import Certifications from '../components/Certifications';
import SalaryExpectations from '../components/SalaryExpectations';
import Bio from '../components/Bio';
import Photos from '../components/Photos';

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
  { id: 'bio', title: 'Bio', component: Bio },
  { id: 'photos', title: 'Photos', component: Photos },
];

export default function HousehelpProfileSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Open modal automatically when page loads
    setIsModalOpen(true);
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Profile setup complete
      setIsModalOpen(false);
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

  if (!isModalOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header with Progress Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Complete Your Profile
            </h1>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Current Step Title */}
          <div className="mt-3">
            <h2 className="text-lg font-medium text-purple-900">
              {STEPS[currentStep].title}
            </h2>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="max-w-2xl mx-auto">
            <CurrentComponent />
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
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
                  className={`h-2 w-2 rounded-full transition-colors ${
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
  );
}
