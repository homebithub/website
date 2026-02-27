import React, { useState } from 'react';

type Relationship = 'Father' | 'Mother' | 'Sibling' | 'Other';

interface Reference {
  name: string;
  phone: string;
}

const EmergencyContact: React.FC = () => {
  // Emergency Contact State
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('Father');
  
  // References State
  const [references, setReferences] = useState<Reference[]>([{ name: '', phone: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddReference = () => {
    setReferences([...references, { name: '', phone: '' }]);
  };

  const handleReferenceChange = (index: number, field: keyof Reference, value: string) => {
    const updatedReferences = [...references];
    updatedReferences[index] = {
      ...updatedReferences[index],
      [field]: value
    };
    setReferences(updatedReferences);
  };

  const handleRemoveReference = (index: number) => {
    if (references.length > 1) {
      const updatedReferences = references.filter((_, i) => i !== index);
      setReferences(updatedReferences);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically save the data to your backend
      console.log({
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship
        },
        references: references.filter(ref => ref.name.trim() && ref.phone.trim())
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccess('Your emergency contact information has been saved successfully!');
      
    } catch (err) {
      setError('Failed to save your information. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Emergency Contact Information</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Emergency Contact Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h2>
            <p className="text-sm text-gray-500 mb-4">
              We will not share this information with anyone. This is for emergency purposes only.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="emergencyName"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="block w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="block w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-4">
                  Relationship <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {(['Father', 'Mother', 'Sibling', 'Other'] as Relationship[]).map((rel) => (
                    <label 
                      key={rel}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer shadow-sm text-lg font-medium ${
                        relationship === rel
                          ? 'border-primary-500 bg-primary-50 text-primary-900' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="relationship"
                        checked={relationship === rel}
                        onChange={() => setRelationship(rel)}
                        className="h-4 w-4 rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>{rel}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* References Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">References (Optional)</h2>
              <button
                type="button"
                onClick={handleAddReference}
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                + Add Reference
              </button>
            </div>
            
            <div className="space-y-4">
              {references.map((ref, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Reference {index + 1}</h3>
                    {references.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveReference(index)}
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor={`refName${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id={`refName${index}`}
                      value={ref.name}
                      onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`refPhone${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id={`refPhone${index}`}
                      value={ref.phone}
                      onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm">
            {success}
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

export default EmergencyContact;
