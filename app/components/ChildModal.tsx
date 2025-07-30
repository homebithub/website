import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

const TRAITS = [
  'Allergies', 'Special Needs', 'Disabled', 'Asthma', 'ADHD',
  'Autism', 'Diabetes', 'Epilepsy', 'Other'
];

interface ChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { gender: string; date_of_birth: string; traits: string[] }) => Promise<void>;
  initialData?: {
    gender?: string;
    date_of_birth?: string;
    dob?: string;
    traits?: string[];
  } | null;
}

const ChildModal: React.FC<ChildModalProps> = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [gender, setGender] = useState(initialData?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.date_of_birth || '');
  const [traits, setTraits] = useState<string[]>(initialData?.traits || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal is opened/closed or initialData changes
  useEffect(() => {
    if (isOpen) {
      setGender(initialData?.gender || '');
      setDateOfBirth(initialData?.date_of_birth || initialData?.dob || '');
      setTraits(initialData?.traits || []);
      setError('');
    }
  }, [isOpen, initialData]);

  const isUnder18 = (birthDate: string): boolean => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    
    // Calculate age
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age < 18;
  };

  const handleTraitChange = (trait: string) => {
    setTraits(prev => 
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : prev.length < 3 ? [...prev, trait] : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validate date of birth
      if (!dateOfBirth) {
        throw new Error('Please enter a valid date of birth');
      }
      
      if (!isUnder18(dateOfBirth)) {
        throw new Error('Child must be under 18 years old');
      }
      
      if (!gender) {
        throw new Error('Please select a gender');
      }
      
      if (traits.length === 0) {
        throw new Error('Please select at least one trait');
      }
      
      await onSave({
        gender,
        date_of_birth: dateOfBirth,
        traits
      });
      
      // Reset form
      setGender('');
      setDateOfBirth('');
      setTraits([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Child">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Gender</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-center justify-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
              gender === 'female' ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === 'female'}
                onChange={() => setGender('female')}
                className="sr-only"
              />
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Female</span>
            </label>
            <label className={`flex items-center justify-center gap-3 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${
              gender === 'male' ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === 'male'}
                onChange={() => setGender('male')}
                className="sr-only"
              />
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Male</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-lg font-medium text-gray-900">Date of Birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => {
              const selectedDate = e.target.value;
              setDateOfBirth(selectedDate);
              
              // Clear any previous error when changing the date
              if (error) setError('');
              
              // Validate date in real-time
              if (selectedDate && !isUnder18(selectedDate)) {
                setError('Child must be under 18 years old');
              }
            }}
            className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors text-gray-900"
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Traits <span className="text-xs text-gray-400">(Select up to 3)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {TRAITS.map(trait => (
              <button
                key={trait}
                type="button"
                onClick={() => handleTraitChange(trait)}
                disabled={traits.length === 3 && !traits.includes(trait)}
                className={`px-4 py-2 rounded-lg border text-base font-medium ${traits.includes(trait) ? 'bg-primary-100 border-primary-500 text-primary-800' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-primary-50'} ${traits.length === 3 && !traits.includes(trait) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {trait}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        <button 
          type="submit" 
          className="bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary-700 flex justify-center items-center h-10"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : 'Save Child'}
        </button>
      </form>
    </Modal>
  );
};

export default ChildModal;
