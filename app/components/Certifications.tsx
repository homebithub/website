import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '~/config/api';
import { handleApiError } from '../utils/errorMessages';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';

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
  const { markDirty, markClean } = useProfileSetup();
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedHelp, setSelectedHelp] = useState<string[]>([]);
  const [otherCerts, setOtherCerts] = useState<string[]>(['']);
  const [otherHelp, setOtherHelp] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Parse certifications
          if (data.certifications) {
            const certs = data.certifications.split(',').map((c: string) => c.trim()).filter(Boolean);
            const predefined = certs.filter((c: string) => CERTIFICATIONS.includes(c));
            const custom = certs.filter((c: string) => !CERTIFICATIONS.includes(c));
            
            setSelectedCerts(predefined);
            if (custom.length > 0) {
              setOtherCerts(custom);
            }
          }

          // Parse can_help_with
          if (data.can_help_with) {
            const help = data.can_help_with.split(',').map((h: string) => h.trim()).filter(Boolean);
            const predefined = help.filter((h: string) => HELP_WITH_OPTIONS.includes(h));
            const custom = help.filter((h: string) => !HELP_WITH_OPTIONS.includes(h));
            
            setSelectedHelp(predefined);
            if (custom.length > 0) {
              setOtherHelp(custom);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load certifications data:', err);
      }
    };

    loadData();
  }, []);

  const handleCertToggle = (cert: string) => {
    markDirty();
    setSelectedCerts(prev => 
      prev.includes(cert)
        ? prev.filter(c => c !== cert)
        : [...prev, cert]
    );
  };

  const handleHelpToggle = (help: string) => {
    markDirty();
    setSelectedHelp(prev => 
      prev.includes(help)
        ? prev.filter(h => h !== help)
        : [...prev, help]
    );
  };

  const addOtherCert = () => {
    setOtherCerts([...otherCerts, '']);
  };

  const removeOtherCert = (index: number) => {
    setOtherCerts(otherCerts.filter((_, i) => i !== index));
  };

  const updateOtherCert = (index: number, value: string) => {
    const updated = [...otherCerts];
    updated[index] = value;
    setOtherCerts(updated);
  };

  const addOtherHelp = () => {
    setOtherHelp([...otherHelp, '']);
  };

  const removeOtherHelp = (index: number) => {
    setOtherHelp(otherHelp.filter((_, i) => i !== index));
  };

  const updateOtherHelp = (index: number, value: string) => {
    const updated = [...otherHelp];
    updated[index] = value;
    setOtherHelp(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Filter out empty other certifications and help options
      const validOtherCerts = otherCerts.filter(cert => cert.trim() !== '');
      const validOtherHelp = otherHelp.filter(help => help.trim() !== '');
      
      // Combine selected and other options
      const allCerts = [...selectedCerts, ...validOtherCerts];
      const allHelp = [...selectedHelp, ...validOtherHelp];
      
      const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          updates: {
            certifications: allCerts.join(','),
            can_help_with: allHelp.join(','),
          },
          _step_metadata: {
            step_id: "certifications",
            step_number: 5,
            is_completed: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save certifications');
      }

      markClean();
      setSuccess('Certifications saved successfully!');
    } catch (err: any) {
      setError(handleApiError(err, 'certifications', 'Failed to save your information. Please try again.'));
      console.error(err);
    } finally{
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">📜 Certifications</h2>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        Any relevant training or skills?
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Certifications Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">Certifications & Skills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CERTIFICATIONS.map((cert) => (
              <label 
                key={cert}
                className={`flex items-start p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                  selectedCerts.includes(cert)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
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
                <span className="ml-3 text-gray-900 dark:text-gray-100">{cert}</span>
              </label>
            ))}
          </div>
          
          {/* Other Certifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400">Other Certifications</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">Type and click the + button to add</span>
            </div>
            {otherCerts.map((cert, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => updateOtherCert(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && cert.trim()) {
                      e.preventDefault();
                      addOtherCert();
                    }
                  }}
                  placeholder="e.g., CPR Certified, Montessori Training..."
                  className="flex-1 h-10 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
                />
                {index === otherCerts.length - 1 && cert.trim() && (
                  <button
                    type="button"
                    onClick={addOtherCert}
                    className="px-4 py-1 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                    aria-label="Add certification"
                    title="Add another certification"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
                {otherCerts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOtherCert(index)}
                    className="px-4 py-1 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                    aria-label="Remove certification"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOtherCert}
              className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2 transition-colors"
            >
              <span className="text-lg">+</span> Add another certification
            </button>
          </div>
        </div>

        {/* What Can You Help With Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">What can you help with?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HELP_WITH_OPTIONS.map((help) => (
              <label 
                key={help}
                className={`flex items-start p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                  selectedHelp.includes(help)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
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
                <span className="ml-3 text-gray-900 dark:text-gray-100">{help}</span>
              </label>
            ))}
          </div>
          
          {/* Other Help Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400">Other Skills</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">Type and click the + button to add</span>
            </div>
            {otherHelp.map((help, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={help}
                  onChange={(e) => updateOtherHelp(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && help.trim()) {
                      e.preventDefault();
                      addOtherHelp();
                    }
                  }}
                  placeholder="e.g., Gardening, Pet grooming, Sewing..."
                  className="flex-1 h-10 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
                />
                {index === otherHelp.length - 1 && help.trim() && (
                  <button
                    type="button"
                    onClick={addOtherHelp}
                    className="px-4 py-1 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                    aria-label="Add skill"
                    title="Add another skill"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
                {otherHelp.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOtherHelp(index)}
                    className="px-4 py-1 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                    aria-label="Remove skill"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOtherHelp}
              className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2 transition-colors"
            >
              <span className="text-lg">+</span> Add another skill
            </button>
          </div>
        </div>

        {success && <SuccessAlert message={success} />}

        {error && <ErrorAlert message={error} />}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                💾 Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Certifications;
