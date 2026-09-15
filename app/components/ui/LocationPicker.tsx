import { useCallback, useEffect, useRef, useState } from 'react';
import CustomSelect from '~/components/ui/CustomSelect';
import { FIELD_LABEL_CLASS, RequiredMark } from '~/components/ui/formStyles';
import { locationService } from '~/services/grpc/authServices';
import { GoogleLocationPicker, type PreciseLocation } from '~/components/ui/GoogleLocationPicker';

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
  precise?: PreciseLocation;
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
  /**
   * 'stack' is a form field: three stacked selects with a helper note.
   *
   * 'contents' drops the wrapper from layout entirely, so the three selects
   * become direct children of the parent's grid and flow with its other
   * filters. Used by the filter bar, which owns its own columns.
   */
  layout?: 'stack' | 'contents';
  /** Label shown for "no preference". Only meaningful when filtering. */
  anyLabel?: string;
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
  layout = 'stack',
  anyLabel,
}: LocationPickerProps) {
  const [counties, setCounties] = useState<Place[]>([]);
  const [subcounties, setSubcounties] = useState<Place[]>([]);
  const [wards, setWards] = useState<Place[]>([]);

  const [countyId, setCountyId] = useState<number | null>(initialCountyId);
  const [subcountyId, setSubcountyId] = useState<number | null>(initialSubcountyId);
  const [wardId, setWardId] = useState<number | null>(initialWardId);

  const [loadingLevel, setLoadingLevel] = useState<'county' | 'subcounty' | 'ward' | null>('county');
  const [error, setError] = useState<string | null>(null);
  const [precise, setPrecise] = useState<PreciseLocation | undefined>();

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

  const confirmPreciseLocation = async (next: PreciseLocation) => {
    setPrecise(next);
    const hint = next.wardHint || next.subcountyHint || next.countyHint;
    if (!hint) return;
    try {
      const response = await locationService.searchLocations(hint);
      const rows = response?.data ?? response ?? [];
      const countyHint = (next.countyHint || '').toLowerCase().replace(/\s+county$/, '');
      const row = Array.isArray(rows)
        ? rows.find((item: any) => !countyHint || String(item.county || '').toLowerCase().includes(countyHint)) || rows[0]
        : null;
      if (!row) return;
      setCountyId(Number(row.county_id) || null);
      setSubcountyId(Number(row.subcounty_id) || null);
      setWardId(Number(row.id) || null);
    } catch {
      // Google remains useful for the pin even when no administrative row can
      // be inferred. The three canonical fields below stay editable.
    }
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
      precise,
    });
  }, [countyId, subcountyId, wardId, counties, subcounties, wards, precise]);

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

  // An "any" entry makes the level clearable, which a filter needs and a
  // required form field must not have.
  const toOptions = (places: Place[]) => {
    const options = places.map((place) => ({ value: String(place.id), label: place.name }));
    return anyLabel ? [{ value: '', label: anyLabel }, ...options] : options;
  };

  const countyLabel = labels?.county ?? 'County';
  const subcountyLabel = labels?.subcounty ?? 'Subcounty';
  const wardLabel = labels?.ward ?? 'Ward';

  const asFilter = layout === 'contents';
  // In the filter bar the labels have to match the controls beside them, which
  // are uppercase micro-labels rather than form field labels.
  const labelClass = asFilter
    ? 'flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'
    : undefined;

  const field = (
    label: string,
    value: string,
    onChangeValue: (next: string) => void,
    options: { value: string; label: string }[],
    placeholder: string,
    disabledField: boolean,
  ) => {
    const select = (
      <CustomSelect
        value={value}
        onChange={onChangeValue}
        options={options}
        placeholder={placeholder}
        disabled={disabledField}
        required={required}
        size={asFilter ? 'sm' : size}
        ariaLabel={label}
        className={asFilter ? 'w-full' : undefined}
      />
    );

    if (asFilter) {
      return (
        <label className={labelClass}>
          {label}
          {select}
        </label>
      );
    }

    return (
      <div>
        <label className={FIELD_LABEL_CLASS}>
          {label}
          {required && <RequiredMark />}
        </label>
        {select}
      </div>
    );
  };

  const fields = (
    <>
      {field(
        countyLabel,
        countyId ? String(countyId) : '',
        handleCounty,
        toOptions(counties),
        loadingLevel === 'county' ? 'Loading counties…' : anyLabel ?? 'Select a county',
        disabled || counties.length === 0,
      )}

      {field(
        subcountyLabel,
        subcountyId ? String(subcountyId) : '',
        handleSubcounty,
        toOptions(subcounties),
        !countyId
          ? 'Choose a county first'
          : loadingLevel === 'subcounty'
            ? 'Loading subcounties…'
            : anyLabel ?? 'Select a subcounty',
        disabled || !countyId || subcounties.length === 0,
      )}

      {field(
        wardLabel,
        wardId ? String(wardId) : '',
        handleWard,
        toOptions(wards),
        !subcountyId
          ? 'Choose a subcounty first'
          : loadingLevel === 'ward'
            ? 'Loading wards…'
            : anyLabel ?? 'Select a ward',
        disabled || !subcountyId || wards.length === 0,
      )}
    </>
  );

  // display:contents removes this wrapper from layout, so the three selects
  // become grid items of whatever laid out the parent.
  if (asFilter) {
    return (
      <div className="contents">
        {fields}
        {error && (
          <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <GoogleLocationPicker onConfirm={confirmPreciseLocation} />
      {fields}
      <p className="-mt-2 text-[11px] text-gray-500 dark:text-gray-400">
        Not sure of the ward? Pick the one nearest to you — it only needs to be
        close enough for people to judge the distance.
      </p>
      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default LocationPicker;
