import React, { useState } from 'react';

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
      // Here you would typically save the data to your backend
      console.log({
        certifications: selectedCerts,
        canHelpWith: selectedHelp
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Your information has been saved successfully!');
      
    } catch (err) {
      setError('Failed to save your information. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">What applies to you?</h1>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Certifications Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Certifications & Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CERTIFICATIONS.map((cert) => (
              <label 
                key={cert}
                className={`flex items-start p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedCerts.includes(cert)
                    ? 'border-primary-500 bg-primary-50 text-primary-900' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={selectedCerts.includes(cert)}
                    onChange={() => handleCertToggle(cert)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
                <span className="ml-3 text-gray-900">{cert}</span>
              </label>
            ))}
          </div>
        </div>

        {/* I Can Help With Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">I can help with</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HELP_WITH_OPTIONS.map((help) => (
              <label 
                key={help}
                className={`flex items-start p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedHelp.includes(help)
                    ? 'border-primary-500 bg-primary-50 text-primary-900' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={selectedHelp.includes(help)}
                    onChange={() => handleHelpToggle(help)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
                <span className="ml-3 text-gray-900">{help}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 text-white px-6 py-1.5 rounded-xl font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Information'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Certifications;
