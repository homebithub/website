import React, { useState } from 'react';
import { Modal } from '../features/Modal';
import { LocationStep } from './household/LocationStep';
import { ChildrenStep } from './household/ChildrenStep';
import { NannyTypeStep } from './household/NannyTypeStep';
import { ScheduleStep } from './household/ScheduleStep';
import { ChoresStep } from './household/ChoresStep';
import { RequirementsStep } from './household/RequirementsStep';
import { BudgetStep } from './household/BudgetStep';
import { HouseholdProfileData } from '../../types/household-profile';

interface HouseholdProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: HouseholdProfileData) => void;
}

const STEPS = [
  { id: 'location', title: 'Location', component: LocationStep },
  { id: 'children', title: 'Children', component: ChildrenStep },
  { id: 'nannyType', title: 'Nanny Type', component: NannyTypeStep },
  { id: 'schedule', title: 'Schedule', component: ScheduleStep },
  { id: 'chores', title: 'Chores', component: ChoresStep },
  { id: 'requirements', title: 'Requirements', component: RequirementsStep },
  { id: 'budget', title: 'Budget & House', component: BudgetStep },
];

export function HouseholdProfileModal({ isOpen, onClose, onComplete }: HouseholdProfileModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<HouseholdProfileData>({
    location: { address: '', coordinates: [0, 0] },
    children: { hasChildren: false, expecting: false, children: [] },
    nannyType: null,
    schedule: { startDate: '', days: [] },
    chores: { cleaning: false, cooking: false, childcare: false, laundry: false, other: '' },
    requirements: { hasPets: false },
    budget: { type: 'daily', amount: 0 },
    houseDetails: { size: 'bedsitter', hasSeparateSQ: false },
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(profileData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepData: Partial<HouseholdProfileData>) => {
    setProfileData(prev => ({ ...prev, ...stepData }));
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Profile">
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
          </p>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          <CurrentStepComponent
            data={profileData}
            onUpdate={handleStepData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === STEPS.length - 1}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            {currentStep === STEPS.length - 1 ? 'Complete Profile' : 'Next'}
          </button>
        </div>
      </div>
    </Modal>
  );
} 