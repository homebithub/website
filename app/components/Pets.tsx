import React, { useState, useEffect } from 'react';
import { handleApiError } from '../utils/errorMessages';
import { API_BASE_URL } from '~/config/api';

interface Pet {
  id: string;
  type: string;
  requiresCare: boolean;
  careDetails: string;
  traits: string[];
}

const PET_TYPES = [
  "Dog",
  "Cat", 
  "Bird",
  "Fish",
  "Rabbit",
  "Hamster",
  "Guinea Pig",
  "Turtle",
  "Snake",
  "Lizard",
  "Other"
];

const PET_TRAITS = [
  "Aggressive",
  "Calm",
  "Playful",
  "Shy",
  "Friendly",
  "Energetic",
  "Lazy",
  "Protective",
  "Curious",
  "Independent",
  "Affectionate",
  "Noisy",
  "Quiet"
];

const Pets: React.FC = () => {
  const [hasPet, setHasPet] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  
  // Modal form state
  const [petType, setPetType] = useState("");
  const [requiresCare, setRequiresCare] = useState(false);
  const [careDetails, setCareDetails] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAddPet = () => {
    setShowModal(true);
    // Reset form
    setPetType("");
    setRequiresCare(false);
    setCareDetails("");
    setSelectedTraits([]);
  };

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits(prev => {
      if (prev.includes(trait)) {
        return prev.filter(t => t !== trait);
      } else if (prev.length < 3) {
        return [...prev, trait];
      }
      return prev;
    });
  };

  const handleSubmitPet = async () => {
    if (!petType) {
      setError("Please select a pet type");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/v1/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pet_type: petType.toLowerCase(),
          requires_care: requiresCare,
          care_details: requiresCare ? careDetails : "",
          traits: selectedTraits.map(trait => trait.toLowerCase())
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to add pet. Please try again.");
      }
      
      const newPet = await response.json();
      
      // Add the pet to local state with the response data
      const petForDisplay: Pet = {
        id: newPet.id,
        type: newPet.pet_type,
        requiresCare: newPet.requires_care,
        careDetails: newPet.care_details || "",
        traits: newPet.traits || []
      };
      
      setPets(prev => [...prev, petForDisplay]);
      setShowModal(false);
      
      // Reset form
      setPetType("");
      setRequiresCare(false);
      setCareDetails("");
      setSelectedTraits([]);
      
    } catch (err: any) {
      setError(handleApiError(err, 'pets', 'An error occurred while adding the pet.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePet = (pet: Pet) => {
    setPetToDelete(pet);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePet = async () => {
    if (!petToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(``${API_BASE_URL}/api/v1/pets/${petToDelete.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete pet. Please try again.");
      }
      
      // Remove pet from local state
      setPets(prev => prev.filter(pet => pet.id !== petToDelete.id));
      setShowDeleteConfirm(false);
      setPetToDelete(null);
      
    } catch (err: any) {
      setError(handleApiError(err, 'pets', 'An error occurred while deleting the pet.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPetToDelete(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-gray-100 p-8 rounded-xl shadow-lg flex flex-col gap-8">
      <h2 className="text-2xl font-extrabold text-primary mb-4 text-center">Pets</h2>
      
      <div className="flex flex-col gap-5">
        <label className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${hasPet === "no" ? "border-primary-500 bg-primary-50 text-primary-900" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
          <input
            type="radio"
            name="hasPet"
            value="no"
            checked={hasPet === "no"}
            onChange={() => setHasPet("no")}
            className="form-radio h-5 w-5 text-primary-600 border-gray-300 mr-2"
          />
          <span>I do not have a pet</span>
        </label>
        
        <label className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${hasPet === "yes" ? "border-primary-500 bg-primary-50 text-primary-900" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
          <input
            type="radio"
            name="hasPet"
            value="yes"
            checked={hasPet === "yes"}
            onChange={() => setHasPet("yes")}
            className="form-radio h-5 w-5 text-primary-600 border-gray-300 mr-2"
          />
          <span>I do have pet</span>
        </label>
      </div>

      {/* Pet Table - Show if user has pets */}
      {hasPet === "yes" && pets.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Pets</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Pet Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Traits</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Care Required</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet, index) => (
                  <tr key={pet.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                    <td className="px-4 py-3 text-sm text-gray-800 border-b capitalize">{pet.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 border-b">
                      {pet.traits.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {pet.traits.map(trait => (
                            <span key={trait} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full capitalize">
                              {trait}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      {pet.requiresCare ? (
                        <div>
                          <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full mb-1">Yes</span>
                          {pet.careDetails && (
                            <p className="text-xs text-gray-600 mt-1">{pet.careDetails}</p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center border-b">
                      <button
                        onClick={() => handleRemovePet(pet)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Delete pet"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasPet === "yes" && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleAddPet}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded-lg shadow-sm transition"
          >
            Add pet
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add Pet</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Pet Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select pet type</option>
                  {PET_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Requires Care Checkbox */}
              <div>
                <label className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={requiresCare}
                      onChange={(e) => setRequiresCare(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      onClick={() => setRequiresCare(!requiresCare)}
                      className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${
                        requiresCare
                          ? 'bg-purple-700 border-purple-700'
                          : 'bg-white border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {requiresCare && (
                        <svg className="w-3 h-3" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Requires Care</span>
                </label>
              </div>

              {/* Care Details Textarea */}
              {requiresCare && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Care Details
                  </label>
                  <textarea
                    value={careDetails}
                    onChange={(e) => setCareDetails(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe the care requirements..."
                  />
                </div>
              )}

              {/* Pet Traits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traits <span className="text-gray-500">(Select up to 3)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PET_TRAITS.map(trait => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handleTraitToggle(trait)}
                      disabled={!selectedTraits.includes(trait) && selectedTraits.length >= 3}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        selectedTraits.includes(trait)
                          ? 'bg-purple-100 border-purple-500 text-purple-700'
                          : selectedTraits.length >= 3
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPet}
                disabled={!petType || loading}
                className="flex-1 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Pet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && petToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Pet</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <span className="font-semibold capitalize">{petToDelete.type}</span>? This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePet}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pets;
