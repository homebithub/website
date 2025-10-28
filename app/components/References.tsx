import React, { useState } from 'react';
import { API_BASE_URL } from '~/config/api';
import { handleApiError } from '../utils/errorMessages';

interface Reference {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  duration: string;
}

const RELATIONSHIPS = [
  'Previous Employer',
  'Current Employer',
  'Supervisor',
  'Family Friend',
  'Professional Reference',
  'Other'
];

const References: React.FC = () => {
  const [references, setReferences] = useState<Reference[]>([
    { name: '', relationship: '', phone: '', email: '', duration: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addReference = () => {
    if (references.length < 3) {
      setReferences([...references, { name: '', relationship: '', phone: '', email: '', duration: '' }]);
    }
  };

  const removeReference = (index: number) => {
    if (references.length > 1) {
      setReferences(references.filter((_, i) => i !== index));
    }
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[index][field] = value;
    setReferences(updated);
  };

  const validatePhone = (phone: string): boolean => {
    // Kenyan phone number validation (starts with 07 or 01, or +254)
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Validate references
    const validReferences = references.filter(ref => 
      ref.name.trim() !== '' || ref.phone.trim() !== ''
    );

    // Validate phone numbers and emails
    for (const ref of validReferences) {
      if (ref.phone && !validatePhone(ref.phone)) {
        setError(`Invalid phone number for ${ref.name || 'reference'}. Please use format: 0712345678 or +254712345678`);
        setIsSubmitting(false);
        return;
      }
      if (ref.email && !validateEmail(ref.email)) {
        setError(`Invalid email address for ${ref.name || 'reference'}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          updates: {
            references: JSON.stringify(validReferences),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save references');
      }

      setSuccess('References saved successfully!');
    } catch (err: any) {
      setError(handleApiError(err, 'references', 'Failed to save your references. Please try again.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">📞 References</h2>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
        Provide contact information for people who can vouch for your work (Optional but recommended)
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {references.map((reference, index) => (
          <div 
            key={index} 
            className="p-6 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] space-y-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400">
                Reference {index + 1}
              </h3>
              {references.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeReference(index)}
                  className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-sm font-semibold"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-purple-700 dark:text-purple-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={reference.name}
                onChange={(e) => updateReference(index, 'name', e.target.value)}
                placeholder="Enter reference's full name"
                className="w-full h-12 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-sm font-bold text-purple-700 dark:text-purple-400 mb-2">
                Relationship
              </label>
              <select
                value={reference.relationship}
                onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                className="w-full h-12 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
              >
                <option value="">Select relationship</option>
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-purple-700 dark:text-purple-400 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={reference.phone}
                onChange={(e) => updateReference(index, 'phone', e.target.value)}
                placeholder="0712345678 or +254712345678"
                className="w-full h-12 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-purple-700 dark:text-purple-400 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={reference.email}
                onChange={(e) => updateReference(index, 'email', e.target.value)}
                placeholder="email@example.com"
                className="w-full h-12 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-bold text-purple-700 dark:text-purple-400 mb-2">
                How long did you work together?
              </label>
              <input
                type="text"
                value={reference.duration}
                onChange={(e) => updateReference(index, 'duration', e.target.value)}
                placeholder="e.g., 2 years, 6 months"
                className="w-full h-12 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
              />
            </div>
          </div>
        ))}

        {references.length < 3 && (
          <button
            type="button"
            onClick={addReference}
            className="w-full py-3 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all font-semibold"
          >
            + Add Another Reference
          </button>
        )}

        {success && (
          <div className="p-4 rounded-xl text-sm font-semibold border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl text-sm font-semibold border-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30">
            ⚠️ {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                💾 Continue
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default References;
