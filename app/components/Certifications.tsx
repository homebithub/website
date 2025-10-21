import React, { useState } from 'react';
import { API_BASE_URL } from '~/config/api';
import { handleApiError } from '../utils/errorMessages';

const CERTIFICATIONS = [
  'I have a valid driving license',
  'I have a Certificate of Good Conduct',
  'I have a First Aid certificate',
  'I am a non-smoker',
  'I have a Diploma in Housekeeping',
  'I have a Childcare certification',
  'I have experience with special needs care',
  'I have a Food Handling certificate'
];

const HELP_WITH_OPTIONS = [
  'Homework help',
  'Grocery shopping',
  'Cooking',
  'Household chores',
  'Laundry and ironing',
  'Childcare',
  'Elderly care',
  'Pet care',
  'Tutoring',
  'Running errands'
];

const Certifications: React.FC = () => {
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedHelp, setSelectedHelp] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCertToggle = (cert: string) => {
    setSelectedCerts(prev => 
      prev.includes(cert)
        ? prev.filter(c => c !== cert)
        : [...prev, cert]
    );
  };

  const handleHelpToggle = (help: string) => {
    setSelectedHelp(prev => 
      prev.includes(help)
        ? prev.filter(h => h !== help)
        : [...prev, help]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

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
            certifications: selectedCerts.join(','),
            can_help_with: selectedHelp.join(','),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save certifications');
      }

      console.log('Certifications saved successfully');
    } catch (err: any) {
      setError(handleApiError(err, 'certifications', 'Failed to save your information. Please try again.'));
      console.error(err);
    } finally{
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">📜 Certifications</h2>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
        Any relevant training or skills?
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Certifications Section */}
        <div className="space-y-6">
          <h3 className="text-base font-bold text-purple-700 dark:text-purple-400">Certifications & Skills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CERTIFICATIONS.map((cert) => (
              <label 
                key={cert}
                className={`flex items-start p-4 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                  selectedCerts.includes(cert)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                  selectedCerts.includes(cert) ? 'border-purple-500 bg-purple-500' : 'border-purple-300 dark:border-purple-500/50'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedCerts.includes(cert)}
                    onChange={() => handleCertToggle(cert)}
                    className="sr-only"
                  />
                  {selectedCerts.includes(cert) && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="ml-3 text-gray-900">{cert}</span>
              </label>
            ))}
          </div>
        </div>

        {/* What Can You Help With Section */}
        <div className="space-y-6">
          <h3 className="text-base font-bold text-purple-700 dark:text-purple-400">What can you help with?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HELP_WITH_OPTIONS.map((help) => (
              <label 
                key={help}
                className={`flex items-start p-4 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                  selectedHelp.includes(help)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                  selectedHelp.includes(help) ? 'border-purple-500 bg-purple-500' : 'border-purple-300 dark:border-purple-500/50'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedHelp.includes(help)}
                    onChange={() => handleHelpToggle(help)}
                    className="sr-only"
                  />
                  {selectedHelp.includes(help) && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="ml-3 text-gray-900">{help}</span>
              </label>
            ))}
          </div>
        </div>

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

export default Certifications;
