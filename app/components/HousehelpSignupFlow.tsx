import { Fragment, useState, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

type UserType = 'househelp' | 'household';
type HousehelpStep = 'userType' | 'location' | 'personal' | 'type' | 'experience' | 'kids' | 'kidsDetails' | 'pets' | 'petTypes' | 'languages' | 'availability' | 'children' | 'childrenDetails' | 'offDay' | 'skills' | 'availableFrom' | 'salary' | 'traits' | 'photos' | 'bio' | 'emergencyContact';
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
  petTypes: string[];
  languages: string[];
  otherLanguage: string;
  availableDays: string[];
  hasChildren: 'yes' | 'no' | '';
  childrenNames: string;
  childrenAges: string;
  offDay: string;
  skills: string[];
  otherSkills: string;
  availableFrom: string;
  salaryExpectation: string;
  customSalary: string;
  traits: string[];
  photos: File[];
  bio: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  needs: string[];
  schedule: string;
  preferences: string;
}

interface SignupFlowProps {
  isOpen: boolean;
  onClose: () => void;
  initialUserType?: UserType;
}

const SignupFlow = ({ isOpen, onClose, initialUserType }: SignupFlowProps) => {
  // State management
  const [userType, setUserType] = useState<UserType | null>(initialUserType || null);
  const [currentStep, setCurrentStep] = useState<Step>(initialUserType ? 'location' : 'userType');
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
    petTypes: [],
    languages: [],
    otherLanguage: '',
    availableDays: [],
    hasChildren: '',
    childrenNames: '',
    childrenAges: '',
    offDay: '',
    skills: [],
    otherSkills: '',
    availableFrom: '',
    salaryExpectation: '',
    customSalary: '',
    traits: [],
    photos: [],
    bio: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
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
      const arrayFields = ['needs', 'petTypes', 'languages', 'availableDays', 'skills', 'traits'];
      
      if (arrayFields.includes(name)) {
        setFormData(prev => ({
          ...prev,
          [name]: checked
            ? [...(prev[name as keyof FormData] as string[] || []), value]
            : (prev[name as keyof FormData] as string[] || []).filter((item: string) => item !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked ? value : ''
        }));
      }
    } else if (type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      if (files && name === 'photos') {
        setFormData(prev => ({
          ...prev,
          photos: Array.from(files)
        }));
      }
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
    
    // Redirect to appropriate dashboard based on user type
    if (userType === 'househelp') {
      window.location.href = '/househelp/profile';
    } else if (userType === 'household') {
      window.location.href = '/household/dashboard';
    }
    
    onClose();
  };

  // Helper functions for step navigation
  const getNextStep = (current: Step): Step | null => {
    if (!userType) return null;
    
    if (userType === 'househelp') {
      switch (current) {
        case 'userType': return 'location';
        case 'location': return 'personal';
        case 'personal': return 'type';
        case 'type': return formData.helpType === 'sleeper' ? 'experience' : 'kids';
        case 'experience': return 'kids';
        case 'kids': return formData.canWorkWithKids === 'yes' ? 'kidsDetails' : 'pets';
        case 'kidsDetails': return 'pets';
        case 'pets': return formData.canLookAfterPets === 'yes' ? 'petTypes' : 'languages';
        case 'petTypes': return 'languages';
        case 'languages': return formData.helpType === 'dayburg' ? 'availability' : 'children';
        case 'availability': return 'offDay';
        case 'children': return formData.hasChildren === 'yes' ? 'childrenDetails' : 'offDay';
        case 'childrenDetails': return 'offDay';
        case 'offDay': return 'skills';
        case 'skills': return 'availableFrom';
        case 'availableFrom': return 'salary';
        case 'salary': return 'traits';
        case 'traits': return 'photos';
        case 'photos': return 'bio';
        case 'bio': return 'emergencyContact';
        case 'emergencyContact': return null;
        default: return null;
      }
    } else {
      // Household flow remains the same
      const householdFlow: Step[] = ['userType', 'location', 'personal', 'needs', 'schedule', 'preferences'];
      const currentIndex = householdFlow.indexOf(current);
      return householdFlow[currentIndex + 1] || null;
    }
  };

  const getPreviousStep = (current: Step): Step | null => {
    if (!userType) return null;
    
    if (userType === 'househelp') {
      switch (current) {
        case 'location': return 'userType';
        case 'personal': return 'location';
        case 'type': return 'personal';
        case 'experience': return 'type';
        case 'kids': return formData.helpType === 'sleeper' ? 'experience' : 'type';
        case 'kidsDetails': return 'kids';
        case 'pets': return formData.canWorkWithKids === 'yes' ? 'kidsDetails' : 'kids';
        case 'petTypes': return 'pets';
        case 'languages': return formData.canLookAfterPets === 'yes' ? 'petTypes' : 'pets';
        case 'availability': return 'languages';
        case 'children': return 'languages';
        case 'childrenDetails': return 'children';
        case 'offDay': 
          if (formData.helpType === 'dayburg') return 'availability';
          return formData.hasChildren === 'yes' ? 'childrenDetails' : 'children';
        case 'skills': return 'offDay';
        case 'availableFrom': return 'skills';
        case 'salary': return 'availableFrom';
        case 'traits': return 'salary';
        case 'photos': return 'traits';
        case 'bio': return 'photos';
        case 'emergencyContact': return 'bio';
        default: return null;
      }
    } else {
      // Household flow remains the same
      const householdFlow: Step[] = ['userType', 'location', 'personal', 'needs', 'schedule', 'preferences'];
      const currentIndex = householdFlow.indexOf(current);
      return householdFlow[currentIndex - 1] || null;
    }
  };

  const isLastStep = () => {
    if (userType === 'househelp') {
      return currentStep === 'emergencyContact';
    } else {
      return currentStep === 'preferences';
    }
  };

  // Define step titles based on user type
  const getStepTitles = (): Record<Step, string> => {
    if (userType === 'househelp') {
      return {
        userType: 'Join as',
        location: 'Location',
        personal: 'Personal Information',
        type: 'Type of Help',
        experience: 'Experience',
        kids: 'Work with Children',
        kidsDetails: 'Children Details',
        pets: 'Pet Care',
        petTypes: 'Pet Types',
        languages: 'Languages',
        availability: 'Available Days',
        children: 'Your Children',
        childrenDetails: 'Children Details',
        offDay: 'Off Day',
        skills: 'Skills & Certifications',
        availableFrom: 'Available From',
        salary: 'Salary Expectation',
        traits: 'Traits & Talents',
        photos: 'Upload Photos',
        bio: 'About You',
        emergencyContact: 'Emergency Contact'
      } as Record<Step, string>;
    } else {
      return {
        userType: 'Join as',
        location: 'Location',
        personal: 'Personal Information',
        needs: 'Your Needs',
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
      
      case 'petTypes':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">What types of pets can you work with?</h3>
            <div className="space-y-2">
              {['Cats', 'Dogs', 'Birds', 'Fish', 'Rabbits'].map((pet) => (
                <label key={pet} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="petTypes"
                    value={pet.toLowerCase()}
                    checked={formData.petTypes.includes(pet.toLowerCase())}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span>{pet}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'languages':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">What languages do you understand?</h3>
            <div className="space-y-2">
              {['English', 'Swahili', 'Kikuyu', 'Luo', 'Kamba'].map((language) => (
                <label key={language} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="languages"
                    value={language.toLowerCase()}
                    checked={formData.languages.includes(language.toLowerCase())}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span>{language}</span>
                </label>
              ))}
              <div className="mt-2">
                <input
                  type="text"
                  name="otherLanguage"
                  value={formData.otherLanguage}
                  onChange={handleChange}
                  placeholder="Other language..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
            </div>
          </div>
        );
      
      case 'availability':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Which days are you available to work?</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <label key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="availableDays"
                    value={day.toLowerCase()}
                    checked={formData.availableDays.includes(day.toLowerCase())}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'children':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Do you have children?</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="hasChildren"
                  value="yes"
                  checked={formData.hasChildren === 'yes'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="hasChildren"
                  value="no"
                  checked={formData.hasChildren === 'no'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span>No</span>
              </label>
            </div>
          </div>
        );
      
      case 'childrenDetails':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Tell us about your children</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Children's names</label>
              <input
                type="text"
                name="childrenNames"
                value={formData.childrenNames}
                onChange={handleChange}
                placeholder="e.g., John, Mary"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Children's ages</label>
              <input
                type="text"
                name="childrenAges"
                value={formData.childrenAges}
                onChange={handleChange}
                placeholder="e.g., 5, 8"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
          </div>
        );
      
      case 'offDay':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">What is your preferred off day?</h3>
            <select
              name="offDay"
              value={formData.offDay}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              required
            >
              <option value="">Select your off day</option>
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
            </select>
          </div>
        );
      
      case 'skills':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">What are your skills and certifications?</h3>
            <div className="space-y-2">
              {['Cooking', 'Cleaning', 'Laundry', 'Childcare', 'Elderly Care', 'Pet Care', 'Gardening', 'Security'].map((skill) => (
                <label key={skill} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="skills"
                    value={skill.toLowerCase()}
                    checked={formData.skills.includes(skill.toLowerCase())}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Other skills or certifications</label>
              <textarea
                name="otherSkills"
                value={formData.otherSkills}
                onChange={handleChange}
                rows={2}
                placeholder="List any additional skills, certifications, or training..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
          </div>
        );
      
      case 'availableFrom':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">When can you start working?</h3>
            <input
              type="date"
              name="availableFrom"
              value={formData.availableFrom}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              required
            />
          </div>
        );
      
      case 'salary':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">What is your salary expectation?</h3>
            <div className="space-y-2">
              {[
                { value: '15000-20000', label: 'KSH 15,000 - 20,000' },
                { value: '20000-30000', label: 'KSH 20,000 - 30,000' },
                { value: '30000-40000', label: 'KSH 30,000 - 40,000' },
                { value: '40000+', label: 'KSH 40,000+' },
                { value: 'custom', label: 'Custom amount' }
              ].map((range) => (
                <label key={range.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="salaryExpectation"
                    value={range.value}
                    checked={formData.salaryExpectation === range.value}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
            {formData.salaryExpectation === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Enter your expected salary (KSH)</label>
                <input
                  type="number"
                  name="customSalary"
                  value={formData.customSalary}
                  onChange={handleChange}
                  placeholder="e.g., 25000"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  required
                />
              </div>
            )}
          </div>
        );
      
      case 'traits':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select your traits and talents</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Reliable', 'Honest', 'Hardworking', 'Patient', 'Organized', 'Friendly', 'Experienced', 'Flexible', 'Trustworthy'].map((trait) => (
                <label key={trait} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="traits"
                    value={trait.toLowerCase()}
                    checked={formData.traits.includes(trait.toLowerCase())}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm">{trait}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'photos':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Upload at least 3 photos</h3>
            <p className="text-sm text-gray-500">Upload clear photos of yourself to help employers get to know you better.</p>
            <input
              type="file"
              name="photos"
              multiple
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              required
            />
            {formData.photos.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">{formData.photos.length} photo(s) selected</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {Array.from(formData.photos).slice(0, 6).map((file, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-500 text-center p-1">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'emergencyContact':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Emergency Contact Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Name</label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Relationship</label>
              <input
                type="text"
                name="emergencyContactRelation"
                value={formData.emergencyContactRelation}
                onChange={handleChange}
                placeholder="e.g., Mother, Brother, Friend"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              />
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
