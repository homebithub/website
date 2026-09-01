import React, { useEffect, useState } from "react";
import { handleApiError } from '../utils/errorMessages';
import { locationService, profileService as grpcProfileService } from '~/services/grpc/authServices';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileEditor } from '~/contexts/ProfileEditorContext';
import { notifyProfileProgressChanged } from '~/utils/profileProgress';
import LocationPicker, { type LocationSelection } from '~/components/ui/LocationPicker';
import { isServiceProviderProfileType } from '~/utils/profileType';

/** What a saved location looks like to the pages that consume this. */
interface LocationSuggestion {
    name: string;
    mapbox_id: string;
    feature_type: string;
}

interface LocationProps {
    onSelect?: (suggestion: LocationSuggestion) => void;
    onSaved?: (location: LocationSuggestion) => void;
}

/**
 * Captures where a househelp is based, by walking county → subcounty → ward.
 *
 * Households search for househelps by area, so a househelp who has not said
 * where they are cannot be found. This is a househelp field only: nothing
 * searches for households, and a job listing carries its own location.
 *
 * This replaced a free-text search box, which was wrong in three ways. It asked
 * people to name their ward, which most cannot. The search response returns
 * ward/subcounty/county columns while the dropdown read `name` and `mapbox_id`,
 * so every suggestion rendered blank and keyed on undefined. And the save sent
 * `{place, mapbox_id}` where CreateLocation requires `ward_id`, so it was
 * rejected every time — location could not actually be completed.
 */
const Location: React.FC<LocationProps> = ({ onSelect, onSaved }) => {
    const { markDirty, markClean, profileData } = useProfileEditor();
    const [selection, setSelection] = useState<LocationSelection | null>(null);
    const [savedWardId, setSavedWardId] = useState<number | null>(null);
    const [initial, setInitial] = useState<{
        wardId: number | null;
        subcountyId: number | null;
        countyId: number | null;
    }>({ wardId: null, subcountyId: null, countyId: null });
    const [submitting, setSubmitting] = useState(false);
    const [travelRadiusKm, setTravelRadiusKm] = useState(15);
    const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

    // Prime the picker from the editor context, so coming back to this section
    // shows the existing choice rather than an empty form.
    useEffect(() => {
        const cached: any = profileData.location;
        if (!cached || typeof cached !== 'object') return;
        const wardId = Number(cached.ward_id ?? cached.wardId ?? 0) || null;
        if (!wardId) return;
        setInitial({
            wardId,
            subcountyId: Number(cached.subcounty_id ?? cached.subcountyId ?? 0) || null,
            countyId: Number(cached.county_id ?? cached.countyId ?? 0) || null,
        });
        setSavedWardId(wardId);
    }, [profileData.location]);

    // Fall back to the profile record when the context holds nothing.
    useEffect(() => {
        let active = true;
        const loadLocation = async () => {
            try {
                const profileType = localStorage.getItem('profile_type');
                const raw = isServiceProviderProfileType(profileType)
                    ? await grpcProfileService.getServiceProviderProfileWithUser('')
                    : await grpcProfileService.getCurrentHouseholdProfile('');
                if (!active) return;

                const data = raw?.data || raw || {};
                const loc = data?.location;
                if (!loc || typeof loc !== 'object') return;

                const wardId = Number(loc.ward_id ?? loc.wardId ?? 0) || null;
                if (!wardId) return;
                setInitial({
                    wardId,
                    subcountyId: Number(loc.subcounty_id ?? loc.subcountyId ?? 0) || null,
                    countyId: Number(loc.county_id ?? loc.countyId ?? 0) || null,
                });
                setSavedWardId(wardId);
            } catch (err) {
                console.error('Failed to load location:', err);
            }
        };
        loadLocation();
        return () => {
            active = false;
        };
    }, []);

    const handleChange = (next: LocationSelection) => {
        setSelection(next);
        if ((next.wardId && next.wardId !== savedWardId) || next.precise) {
            markDirty();
            setSubmitStatus(null);
        }
        if (next.wardId) {
            onSelect?.({
                name: next.wardName,
                mapbox_id: String(next.wardId),
                feature_type: 'ward',
            });
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selection?.wardId) {
            setSubmitStatus({ success: false, message: 'Choose your location down to the ward.' });
            return;
        }

        setSubmitting(true);
        setSubmitStatus(null);

        try {
            const profileType = localStorage.getItem('profile_type') || '';

            // ward_id is what profile_locations stores; the names below are
            // context so the profile page can show the place without a join.
            await locationService.createLocation('', {
                ward_id: selection.wardId,
                location_type: 'primary',
                label: selection.precise?.label || selection.wardName,
                address: selection.precise?.label,
                latitude: selection.precise?.latitude,
                longitude: selection.precise?.longitude,
                google_place_id: selection.precise?.googlePlaceId,
                location_provider: selection.precise?.provider || 'administrative',
                accuracy_metres: selection.precise?.accuracyMetres,
                travel_radius_km: travelRadiusKm,
            });

            try {
                await grpcProfileService.saveUserLocation('', {
                    town: selection.wardName,
                    profile_type: profileType,
                    location: {
                        ward_id: selection.wardId,
                        ward: selection.wardName,
                        subcounty_id: selection.subcountyId,
                        subcounty: selection.subcountyName,
                        county_id: selection.countyId,
                        county: selection.countyName,
                        place: [selection.wardName, selection.subcountyName].filter(Boolean).join(', '),
                        name: selection.wardName,
                        feature_type: 'ward',
                    },
                });
            } catch (profileErr) {
                console.warn('[Location] Failed to update profile location:', profileErr);
            }

            // Location counts toward a househelp's completion, so invalidate the
            // cached progress or the checklist keeps listing it as outstanding.
            notifyProfileProgressChanged();

            setSubmitStatus({ success: true, message: 'Location saved successfully!' });
            markClean();
            setSavedWardId(selection.wardId);

            onSaved?.({
                name: selection.wardName,
                mapbox_id: String(selection.wardId),
                feature_type: 'ward',
            });

            setTimeout(() => setSubmitStatus(null), 3000);
        } catch (error) {
            console.error('Error saving location:', error);
            setSubmitStatus({
                success: false,
                message: handleApiError(error, 'location', 'An error occurred while saving location'),
            });
        } finally {
            setSubmitting(false);
        }
    };

    const unchanged = savedWardId !== null && selection?.wardId === savedWardId;

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
                <div>
                    <h3 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">
                        📍 Where are you based?
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                        Households search by area, so this is how they find you.
                    </p>
                    <LocationPicker
                        onChange={handleChange}
                        initialWardId={initial.wardId}
                        initialSubcountyId={initial.subcountyId}
                        initialCountyId={initial.countyId}
                        required
                        size="sm"
                    />
                    <label className="mt-4 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Comfortable travel distance: {travelRadiusKm} km
                        <input type="range" min="1" max="60" step="1" value={travelRadiusKm} onChange={(event) => { setTravelRadiusKm(Number(event.target.value)); markDirty(); }} className="mt-2 w-full accent-purple-600" />
                    </label>
                </div>

                {submitStatus?.success && <SuccessAlert message={submitStatus.message} />}
                {submitStatus && !submitStatus.success && <ErrorAlert message={submitStatus.message} />}

                <button
                    type="submit"
                    disabled={submitting || !selection?.wardId || unchanged}
                    className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>💾 Save Location</>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Location;
