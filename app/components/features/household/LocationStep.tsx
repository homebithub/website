import React, { useState } from 'react';
import type { HouseholdProfileData } from '../../../types/household-profile';
import { locationService } from '~/services/grpc/authServices';

interface LocationStepProps {
  data: HouseholdProfileData;
  onUpdate: (data: Partial<HouseholdProfileData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function LocationStep({ data, onUpdate, onNext }: LocationStepProps) {
  const [address, setAddress] = useState(data.location.address);
  const [coordinates, setCoordinates] = useState<[number, number]>(data.location.coordinates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddressSearch = async (searchAddress: string) => {
    if (!searchAddress.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const suggestions = await locationService.getLocationSuggestions(searchAddress);
      const results = Array.isArray(suggestions) ? suggestions : [];
      const feature = results[0];

      if (feature?.name) {
        const locationRecord = feature.mapbox_id
          ? await locationService.getLocationByMapboxID(feature.mapbox_id)
          : null;
        const lat = Number(locationRecord?.latitude ?? 0);
        const lng = Number(locationRecord?.longitude ?? 0);

        setCoordinates([lat, lng]);
        setAddress(feature.name);
        
        onUpdate({
          location: {
            address: feature.name,
            coordinates: [lat, lng]
          }
        });
      } else {
        setError('No location found. Please try a different address.');
      }
    } catch (err) {
      setError('Failed to search location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address && coordinates[0] !== 0 && coordinates[1] !== 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Where are you located?</h3>
        <p className="text-gray-600">Help us find househelp near you</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Your Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={(e) => handleAddressSearch(e.target.value)}
              placeholder="Enter your address (e.g., Westlands, Nairobi)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
          {error && (
            <p className="text-red-600 text-xs mt-1">{error}</p>
          )}
        </div>

        {coordinates[0] !== 0 && coordinates[1] !== 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-green-800">
                  Location confirmed: {address}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Coordinates: {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!address || coordinates[0] === 0 || coordinates[1] === 0}
            className="px-6 py-1 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
} 
