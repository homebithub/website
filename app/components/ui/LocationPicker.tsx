import { useCallback, useEffect, useRef, useState } from 'react';
import CustomSelect from '~/components/ui/CustomSelect';
import { FIELD_LABEL_CLASS, RequiredMark } from '~/components/ui/formStyles';
import { locationService } from '~/services/grpc/authServices';

/** One level of the Kenya administrative hierarchy. */
type Place = {
  id: number;
  name: string;
};

export type LocationSelection = {
  countyId: number | null;
  countyName: string;
  subcountyId: number | null;
  subcountyName: string;
  wardId: number | null;
  wardName: string;
};

type LocationPickerProps = {
  /** Called on every change. wardId is null until the walk is finished. */
  onChange: (selection: LocationSelection) => void;
  /** Pre-select a known ward, for editing something already saved. */
  initialWardId?: number | null;
  initialSubcountyId?: number | null;
  initialCountyId?: number | null;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  /** Overrides the default three labels, e.g. for a filter bar. */
  labels?: { county?: string; subcounty?: string; ward?: string };
};

const EMPTY: LocationSelection = {
  countyId: null,
  countyName: '',
  subcountyId: null,
  subcountyName: '',
  wardId: null,
  wardName: '',
};

/**
 * Picks a location by walking county → subcounty → ward.
 *
 * The backend stores a ward, but almost nobody can name the ward they live in —
 * asking for one directly, or offering a search box over 1,450 ward names, puts
 * the burden of knowing the administrative hierarchy on the user. Everyone knows
 * their county, and recognises their subcounty on sight, so each step narrows
 * the next and the ward becomes a choice between a handful of familiar names.
 *
 * Each level loads only once its parent is chosen. That keeps every response to
 * a few dozen rows rather than shipping the whole hierarchy to a page that may
 * never open the dropdown.
 */
export function LocationPicker({
  onChange,
  initialWardId = null,
  initialSubcountyId = null,
  initialCountyId = null,
  required = false,
  disabled = false,
  size = 'md',
  labels,
}: LocationPickerProps) {
  const [counties, setCounties] = useState<Place[]>([]);
  const [subcounties, setSubcounties] = useState<Place[]>([]);
  const [wards, setWards] = useState<Place[]>([]);

  const [countyId, setCountyId] = useState<number | null>(initialCountyId);
  const [subcountyId, setSubcountyId] = useState<number | null>(initialSubcountyId);
  const [wardId, setWardId] = useState<number | null>(initialWardId);

  const [loadingLevel, setLoadingLevel] = useState<'county' | 'subcounty' | 'ward' | null>('county');
  const [error, setError] = useState<string | null>(null);

  // onChange is called from effects; holding it in a ref keeps a caller that
  // passes an inline function from re-running them on every render.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const readPlaces = (response: any): Place[] => {
    const rows = response?.data ?? response ?? [];
    if (!Array.isArray(rows)) return [];
    return rows
      .map((row: any) => ({ id: Number(row?.id), name: String(row?.name ?? '') }))
      .filter((place: Place) => Number.isFinite(place.id) && place.name !== '');
  };

  useEffect(() => {
    let active = true;
    setLoadingLevel('county');
    locationService
      .listCounties()
      .then((response) => {
        if (!active) return;
        setCounties(readPlaces(response));
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('We couldn’t load counties. Please try again.');
      })
      .finally(() => {
        if (active) setLoadingLevel(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!countyId) {
      setSubcounties([]);
      return;
    }
    let active = true;
    setLoadingLevel('subcounty');
    locationService
      .listSubcounties(countyId)
      .then((response) => {
        if (!active) return;
        setSubcounties(readPlaces(response));
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('We couldn’t load subcounties for that county.');
      })
      .finally(() => {
        if (active) setLoadingLevel(null);
      });
    return () => {
      active = false;
    };
  }, [countyId]);

  useEffect(() => {
    if (!subcountyId) {
      setWards([]);
      return;
    }
    let active = true;
    setLoadingLevel('ward');
    locationService
      .listWards(subcountyId)
      .then((response) => {
        if (!active) return;
        setWards(readPlaces(response));
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('We couldn’t load wards for that subcounty.');
      })
      .finally(() => {
        if (active) setLoadingLevel(null);
      });
    return () => {
      active = false;
    };
  }, [subcountyId]);

  const nameOf = (places: Place[], id: number | null) =>
    places.find((place) => place.id === id)?.name ?? '';

  // Report upward whenever any level moves, so a parent form always holds the
  // current selection rather than having to read it back out.
  useEffect(() => {
    onChangeRef.current({
      countyId,
      countyName: nameOf(counties, countyId),
      subcountyId,
      subcountyName: nameOf(subcounties, subcountyId),
      wardId,
      wardName: nameOf(wards, wardId),
    });
  }, [countyId, subcountyId, wardId, counties, subcounties, wards]);

  const handleCounty = useCallback((value: string) => {
    // Changing a level invalidates everything below it. Leaving a stale ward
    // selected would submit a location in a county the user just moved away
    // from — the field would look right and be wrong.
    setCountyId(value ? Number(value) : null);
    setSubcountyId(null);
    setWardId(null);
  }, []);

  const handleSubcounty = useCallback((value: string) => {
    setSubcountyId(value ? Number(value) : null);
    setWardId(null);
  }, []);

  const handleWard = useCallback((value: string) => {
    setWardId(value ? Number(value) : null);
  }, []);

  const toOptions = (places: Place[]) =>
    places.map((place) => ({ value: String(place.id), label: place.name }));

  const countyLabel = labels?.county ?? 'County';
  const subcountyLabel = labels?.subcounty ?? 'Subcounty';
  const wardLabel = labels?.ward ?? 'Ward';

  return (
    <div className="space-y-4">
      <div>
        <label className={FIELD_LABEL_CLASS}>
          {countyLabel}
          {required && <RequiredMark />}
        </label>
        <CustomSelect
          value={countyId ? String(countyId) : ''}
          onChange={handleCounty}
          options={toOptions(counties)}
          placeholder={loadingLevel === 'county' ? 'Loading counties…' : 'Select a county'}
          disabled={disabled || counties.length === 0}
          required={required}
          size={size}
          ariaLabel={countyLabel}
        />
      </div>

      <div>
        <label className={FIELD_LABEL_CLASS}>
          {subcountyLabel}
          {required && <RequiredMark />}
        </label>
        <CustomSelect
          value={subcountyId ? String(subcountyId) : ''}
          onChange={handleSubcounty}
          options={toOptions(subcounties)}
          placeholder={
            !countyId
              ? 'Choose a county first'
              : loadingLevel === 'subcounty'
                ? 'Loading subcounties…'
                : 'Select a subcounty'
          }
          disabled={disabled || !countyId || subcounties.length === 0}
          required={required}
          size={size}
          ariaLabel={subcountyLabel}
        />
      </div>

      <div>
        <label className={FIELD_LABEL_CLASS}>
          {wardLabel}
          {required && <RequiredMark />}
        </label>
        <CustomSelect
          value={wardId ? String(wardId) : ''}
          onChange={handleWard}
          options={toOptions(wards)}
          placeholder={
            !subcountyId
              ? 'Choose a subcounty first'
              : loadingLevel === 'ward'
                ? 'Loading wards…'
                : 'Select a ward'
          }
          disabled={disabled || !subcountyId || wards.length === 0}
          required={required}
          size={size}
          ariaLabel={wardLabel}
        />
        <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          Not sure of the ward? Pick the one nearest to you — it only needs to be
          close enough for people to judge the distance.
        </p>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default LocationPicker;
