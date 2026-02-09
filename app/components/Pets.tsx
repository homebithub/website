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
  const [otherPetType, setOtherPetType] = useState("");
  const [requiresCare, setRequiresCare] = useState(false);
  const [careDetails, setCareDetails] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load existing pets on mount
  useEffect(() => {
    const loadPets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/v1/pets`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (res.ok) {
          const petsData = await res.json();
          if (petsData && petsData.length > 0) {
            // Map backend response to frontend Pet interface
            const mappedPets = petsData.map((p: any) => ({
              id: p.id,
              type: p.pet_type,
              requiresCare: p.requires_care,
              careDetails: p.care_details || "",
              traits: p.traits || []
            }));
            setPets(mappedPets);
            setHasPet("yes");
          }
        }
      } catch (err) {
        console.error("Failed to load pets:", err);
      }
    };
    
    loadPets();
  }, []);

  const handleAddPet = () => {
    setShowModal(true);
    // Reset form
    setPetType("");
    setOtherPetType("");
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
    
    if (petType === "Other" && !otherPetType.trim()) {
      setError("Please specify the pet type");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const finalPetType = petType === "Other" ? otherPetType.trim() : petType;
      
      const response = await fetch(`${API_BASE_URL}/api/v1/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pet_type: finalPetType.toLowerCase(),
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
      setOtherPetType("");
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
      const response = await fetch(`${API_BASE_URL}/api/v1/pets/${petToDelete.id}`, {
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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">🐾 Pets</h2>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
        Do you have any pets that need care?
      </p>
      
      <div className="flex flex-col gap-4">
        <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${hasPet === "no" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105" : "border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
          <input
            type="radio"
            name="hasPet"
            value="no"
            checked={hasPet === "no"}
            onChange={() => setHasPet("no")}
            className="form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
          />
          <span className="flex-1">❌ I do not have pets</span>
        </label>
        
        <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${hasPet === "yes" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105" : "border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
          <input
            type="radio"
            name="hasPet"
            value="yes"
            checked={hasPet === "yes"}
            onChange={() => setHasPet("yes")}
            className="form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"
          />
          <span className="flex-1">✅ I have pets</span>
        </label>
      </div>

      {/* Pet Table - Show if user has pets */}
      {hasPet === "yes" && pets.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-4">Your Pets</h3>
          <div className="overflow-x-auto rounded-xl border-2 border-purple-200 dark:border-purple-500/30">
            <table className="w-full">
              <thead className="bg-purple-50 dark:bg-purple-900/20">
                <tr>
                  <th className="px-4 py-1.5 text-left text-sm font-bold text-purple-700 dark:text-purple-400 border-b-2 border-purple-200 dark:border-purple-500/30">Pet Type</th>
                  <th className="px-4 py-1.5 text-left text-sm font-bold text-purple-700 dark:text-purple-400 border-b-2 border-purple-200 dark:border-purple-500/30">Traits</th>
                  <th className="px-4 py-1.5 text-left text-sm font-bold text-purple-700 dark:text-purple-400 border-b-2 border-purple-200 dark:border-purple-500/30">Care Required</th>
                  <th className="px-4 py-1.5 text-center text-sm font-bold text-purple-700 dark:text-purple-400 border-b-2 border-purple-200 dark:border-purple-500/30">Action</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet, index) => (
                  <tr key={pet.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-[#13131a]' : 'bg-purple-50/50 dark:bg-purple-900/10'} hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors`}>
                    <td className="px-4 py-1.5 text-sm text-gray-900 dark:text-gray-100 border-b border-purple-100 dark:border-purple-500/20 capitalize font-medium">{pet.type}</td>
                    <td className="px-4 py-3 text-sm border-b border-purple-100 dark:border-purple-500/20">
                      {pet.traits.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {pet.traits.map(trait => (
                            <span key={trait} className="inline-block bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full capitalize font-medium border border-purple-200 dark:border-purple-500/30">
                              {trait}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-purple-100 dark:border-purple-500/20">
                      {pet.requiresCare ? (
                        <div>
                          <span className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs px-2 py-1 rounded-full mb-1 font-medium">Yes</span>
                          {pet.careDetails && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{pet.careDetails}</p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center border-b border-purple-100 dark:border-purple-500/20">
                      <button
                        onClick={() => handleRemovePet(pet)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
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
        <button
          type="button"
          onClick={handleAddPet}
          className="w-full px-8 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center gap-2"
        >
          ➕ Add Pet
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl border-2 border-purple-200 dark:border-purple-500/30 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl">🐾</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add Pet</h3>
            </div>

            <div className="space-y-4">
              {/* Pet Type Dropdown */}
              <div>
                <label className="block text-base font-bold text-purple-700 dark:text-purple-400 mb-2">
                  Pet Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={petType}
                  onChange={(e) => {
                    setPetType(e.target.value);
                    if (e.target.value !== "Other") {
                      setOtherPetType("");
                    }
                  }}
                  className="w-full h-12 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
                  required
                >
                  <option value="">Select pet type</option>
                  {PET_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Other Pet Type Input */}
              {petType === "Other" && (
                <div>
                  <label className="block text-base font-bold text-purple-700 dark:text-purple-400 mb-2">
                    Specify Pet Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otherPetType}
                    onChange={(e) => setOtherPetType(e.target.value)}
                    placeholder="e.g., Parrot, Ferret, Iguana..."
                    className="w-full h-12 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
                    maxLength={50}
                    required
                  />
                </div>
              )}

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
                          ? 'bg-purple-600 border-purple-600'
                          : 'bg-white dark:bg-[#13131a] border-purple-300 dark:border-purple-500/50 hover:border-purple-400'
                      }`}
                    >
                      {requiresCare && (
                        <svg className="w-3 h-3" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-base font-bold text-purple-700 dark:text-purple-400">Requires Care</span>
                </label>
              </div>

              {/* Care Details Textarea */}
              {requiresCare && (
                <div>
                  <label className="block text-base font-bold text-purple-700 dark:text-purple-400 mb-2">
                    Care Details
                  </label>
                  <textarea
                    value={careDetails}
                    onChange={(e) => setCareDetails(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 resize-none"
                    placeholder="Describe the care requirements..."
                  />
                </div>
              )}

              {/* Pet Traits */}
              <div>
                <label className="block text-base font-bold text-purple-700 dark:text-purple-400 mb-2">
                  Traits <span className="text-sm text-gray-500 dark:text-gray-400">(Select up to 3)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PET_TRAITS.map(trait => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handleTraitToggle(trait)}
                      disabled={!selectedTraits.includes(trait) && selectedTraits.length >= 3}
                      className={`px-4 py-1 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedTraits.includes(trait)
                          ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-900 dark:text-purple-100'
                          : selectedTraits.length >= 3
                          ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-white dark:bg-[#13131a] border-purple-200 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10'
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
              <div className="mt-4 p-4 rounded-xl text-sm font-semibold border-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30">
                ⚠️ {error}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-6 py-1.5 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPet}
                disabled={!petType || (petType === "Other" && !otherPetType.trim()) || loading}
                className="flex-1 px-6 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Adding..." : "Add Pet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && petToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-purple-200 dark:border-purple-500/30">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Pet</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete <span className="font-semibold capitalize text-purple-700 dark:text-purple-400">{petToDelete.type}</span>? This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-xl text-sm font-semibold border-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleteLoading}
                className="flex-1 px-6 py-1.5 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePet}
                disabled={deleteLoading}
                className="flex-1 px-6 py-1.5 rounded-xl bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
