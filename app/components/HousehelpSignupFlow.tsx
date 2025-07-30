import { Fragment, useState, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

type UserType = 'househelp' | 'household';
type HousehelpStep = 'userType' | 'location' | 'personal' | 'type' | 'experience' | 'kids' | 'kidsDetails' | 'pets' | 'bio';
type HouseholdStep = 'userType' | 'location' | 'personal' | 'needs' | 'schedule' | 'preferences';
type Step = HousehelpStep | HouseholdStep;

interface FormData {
  location: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  helpType: 'sleeper' | 'dayburg' | '';
  yearsExperience: string;
  canWorkWithKids: 'yes' | 'no' | '';
  kidsAgeRange: string;
  numberOfKids: string;
  canLookAfterPets: 'yes' | 'no' | '';
  bio: string;
  needs: string[];
  schedule: string;
  preferences: string;
}

const SignupFlow = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  // State management
  const [userType, setUserType] = useState<UserType | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('userType');
  const [formData, setFormData] = useState<FormData>({
    location: '',
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    helpType: '',
    yearsExperience: '',
    canWorkWithKids: '',
    kidsAgeRange: '',
    numberOfKids: '',
    canLookAfterPets: '',
    bio: '',
    needs: [],
    schedule: '',
    preferences: ''
  });

  // Handlers
  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setCurrentStep('location');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        needs: checked
          ? [...(prev.needs || []), value]
          : (prev.needs || []).filter((item: string) => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNext = useCallback(() => {
    const nextStep = getNextStep(currentStep);
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  }, [currentStep, userType, formData.helpType, formData.canWorkWithKids]);

  const handleBack = useCallback(() => {
    const prevStep = getPreviousStep(currentStep);
    if (prevStep) {
      setCurrentStep(prevStep);
    } else {
      onClose();
    }
  }, [currentStep, onClose, userType, formData.helpType, formData.canWorkWithKids]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', { userType, ...formData });
    onClose();
  };

  // Helper functions for step navigation
  const getNextStep = (current: Step): Step | null => {
    if (!userType) return null;
    
    const househelpFlow: Step[] = ['userType', 'location', 'personal', 'type'];
    if (formData.helpType === 'sleeper') househelpFlow.push('experience');
    househelpFlow.push('kids');
    if (formData.canWorkWithKids === 'yes') househelpFlow.push('kidsDetails');
    househelpFlow.push('pets', 'bio');
    
    const householdFlow: Step[] = ['userType', 'location', 'personal', 'needs', 'schedule', 'preferences'];
    
    const flow = userType === 'househelp' ? househelpFlow : householdFlow;
    const currentIndex = flow.indexOf(current);
    return flow[currentIndex + 1] || null;
  };

  const getPreviousStep = (current: Step): Step | null => {
    if (!userType) return null;
    
    const househelpFlow: Step[] = ['userType', 'location', 'personal', 'type'];
    if (formData.helpType === 'sleeper') househelpFlow.push('experience');
    househelpFlow.push('kids');
    if (formData.canWorkWithKids === 'yes') househelpFlow.push('kidsDetails');
    househelpFlow.push('pets', 'bio');
    
    const householdFlow: Step[] = ['userType', 'location', 'personal', 'needs', 'schedule', 'preferences'];
    
    const flow = userType === 'househelp' ? househelpFlow : householdFlow;
    const currentIndex = flow.indexOf(current);
    return flow[currentIndex - 1] || null;
  };

  const isLastStep = () => {
    const nextStep = getNextStep(currentStep);
    return !nextStep;
  };

  // Define step titles based on user type
  const getStepTitles = (): Record<Step, string> => {
    const baseTitles = {
      userType: 'Join as',
      location: 'Location',
      personal: userType === 'househelp' ? 'Personal Info' : 'Your Info',
    };

    if (userType === 'househelp') {
      return {
        ...baseTitles,
        type: 'Service Type',
        experience: 'Experience',
        kids: 'Childcare',
        kidsDetails: 'Childcare Details',
        pets: 'Pets',
        bio: 'About You'
      } as Record<Step, string>;
    } else {
      return {
        ...baseTitles,
        needs: 'Service Needs',
        schedule: 'Schedule',
        preferences: 'Preferences'
      } as Record<Step, string>;
    }
  };

  const stepTitles = getStepTitles();

  // Render step content based on current step
  const renderStep = () => {
    if (!userType) return null;
    
    switch (currentStep) {
      case 'userType':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Join as</h3>
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => handleUserTypeSelect('househelp')}
                className={`p-6 border-2 rounded-lg text-left transition-colors ${
                  userType === 'househelp' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                }`}
              >
                <span className="block text-lg font-semibold">Househelp</span>
                <p className="mt-1 text-sm text-gray-500">
                  Looking for work. I want to offer househelp services.
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeSelect('household')}
                className={`p-6 border-2 rounded-lg text-left transition-colors ${
                  userType === 'household' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                }`}
              >
                <span className="block text-lg font-semibold">Household</span>
                <p className="mt-1 text-sm text-gray-500">
                  Looking to hire help. I need househelp services.
                </p>
              </button>
            </div>
          </div>
        );
      
      case 'location':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {userType === 'househelp' 
                ? 'Where are you located?' 
                : 'Where do you need househelp?'}
            </h3>
            <p className="text-sm text-gray-500">
              {userType === 'househelp'
                ? 'We\'ll use this to match you with potential employers in your area.'
                : 'We\'ll show you available househelp in your area.'}
            </p>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              required
            />
          </div>
        );
      
      case 'personal':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {userType === 'househelp' 
                ? 'Tell us about yourself' 
                : 'Your Information'}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>

            {userType === 'househelp' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    required
                  />
                </div>
              </>
            )}
          </div>
        );
      
      case 'type':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">What type of househelp are you?</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="helpType"
                  value="sleeper"
                  checked={formData.helpType === 'sleeper'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span>Live-in Househelp (Sleeper)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="helpType"
                  value="dayburg"
                  checked={formData.helpType === 'dayburg'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span>Day Worker (Dayburg)</span>
              </label>
            </div>
          </div>
        );
      
      case 'experience':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Years of Experience</h3>
            <p className="text-sm text-gray-500">How many years of experience do you have as a live-in househelp?</p>
            <input
              type="number"
              name="yearsExperience"
              min="0"
              max="50"
              value={formData.yearsExperience}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              required
            />
          </div>
        );
      
      case 'kids':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Can you work with children?</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="canWorkWithKids"
                  value="yes"
                  checked={formData.canWorkWithKids === 'yes'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="canWorkWithKids"
                  value="no"
                  checked={formData.canWorkWithKids === 'no'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span>No</span>
              </label>
            </div>
          </div>
        );
      
      case 'kidsDetails':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Childcare Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">What age range can you work with?</label>
              <select
                name="kidsAgeRange"
                value={formData.kidsAgeRange}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              >
                <option value="">Select age range</option>
                <option value="newborn">Newborn (0-12 months)</option>
                <option value="toddler">Toddler (1-3 years)</option>
                <option value="preschool">Preschool (3-5 years)</option>
                <option value="school-age">School Age (5+ years)</option>
                <option value="all-ages">All ages</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum number of children you can look after at once</label>
              <input
                type="number"
                name="numberOfKids"
                min="1"
                max="10"
                value={formData.numberOfKids}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
          </div>
        );
      
      case 'pets':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Can you look after pets?</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="canLookAfterPets"
                  value="yes"
                  checked={formData.canLookAfterPets === 'yes'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="canLookAfterPets"
                  value="no"
                  checked={formData.canLookAfterPets === 'no'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span>No</span>
              </label>
            </div>
          </div>
        );
      
      case 'bio':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Tell us about yourself</h3>
            <p className="text-sm text-gray-500">Share your experience, skills, and what makes you a great househelp.</p>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Describe your experience, skills, and what you're looking for..."
              required
            />
          </div>
        );
      
      case 'needs':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">What services do you need?</h3>
            <div className="space-y-2">
              {['Cleaning', 'Cooking', 'Laundry', 'Childcare', 'Pet care', 'Elderly care'].map((service) => (
                <label key={service} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="needs"
                    value={service.toLowerCase()}
                    checked={formData.needs.includes(service.toLowerCase())}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'schedule':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">What's your preferred schedule?</h3>
            <div className="space-y-2">
              {['Full-time live-in', 'Part-time', 'Weekends only', 'Flexible'].map((schedule) => (
                <label key={schedule} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="schedule"
                    value={schedule.toLowerCase().replace(' ', '-')}
                    checked={formData.schedule === schedule.toLowerCase().replace(' ', '-')}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    required
                  />
                  <span>{schedule}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'preferences':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Any specific preferences?</h3>
            <textarea
              name="preferences"
              value={formData.preferences}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Tell us about any specific requirements, preferences, or additional information..."
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center">
                  <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                    {stepTitles[currentStep] || 'Sign Up'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="mt-4">
                  {currentStep !== 'userType' && (
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${((Object.keys(stepTitles).indexOf(currentStep)) / (Object.keys(stepTitles).length - 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        Step {Object.keys(stepTitles).indexOf(currentStep)} of {Object.keys(stepTitles).length - 1}
                      </p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    {renderStep()}
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      >
                        {currentStep === 'userType' ? 'Cancel' : 'Back'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (isLastStep()) {
                            handleSubmit();
                          } else {
                            handleNext();
                          }
                        }}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        disabled={!userType && currentStep === 'userType'}
                      >
                        {isLastStep() ? 'Complete Profile' : 'Next'}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SignupFlow;
