import { useEffect, useRef, useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { getPublicFeatureFlag } from '~/services/grpc/notifications.service';

export type PreciseLocation = {
  latitude: number; longitude: number; label: string;
  googlePlaceId?: string; provider: 'google' | 'device' | 'manual'; accuracyMetres?: number;
  wardHint?: string; subcountyHint?: string; countyHint?: string;
};

declare global { interface Window { ENV?: Record<string, string>; google?: any } }
let mapsPromise: Promise<any> | null = null;

function loadMaps(key: string): Promise<any> {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const callback = `homebitMapsReady_${Date.now()}`;
    (window as any)[callback] = () => { delete (window as any)[callback]; resolve(window.google!.maps); };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places,marker&v=weekly&callback=${callback}`;
    script.async = true;
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

function componentName(components: any[], type: string): string {
  const component = components?.find((item) => item.types?.includes(type));
  return component?.longText || component?.long_name || '';
}

export function GoogleLocationPicker({ onConfirm }: { onConfirm: (value: PreciseLocation) => void }) {
  const searchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState<PreciseLocation | null>(null);

  useEffect(() => {
    let active = true;
    getPublicFeatureFlag('location.google_maps')
      .then((enabled) => active && setAvailable(enabled && Boolean(window.ENV?.GOOGLE_MAPS_API_KEY)))
      .catch(() => undefined)
      .finally(() => active && setReady(true));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!available || !searchRef.current || !mapRef.current) return;
    let disposed = false;
    loadMaps(window.ENV?.GOOGLE_MAPS_API_KEY || '').then(async (maps) => {
      if (disposed || !searchRef.current || !mapRef.current) return;
      const { PlaceAutocompleteElement } = await maps.importLibrary('places');
      const { AdvancedMarkerElement } = await maps.importLibrary('marker');
      const center = { lat: -1.286389, lng: 36.817223 };
      const map = new maps.Map(mapRef.current, { center, zoom: 11, mapId: window.ENV?.GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID', streetViewControl: false, mapTypeControl: false, fullscreenControl: false });
      const marker = new AdvancedMarkerElement({ map, position: center, gmpDraggable: true });
      const autocomplete = new PlaceAutocompleteElement({ includedRegionCodes: ['ke'], placeholder: 'Search estate, landmark, road or town' });
      searchRef.current.replaceChildren(autocomplete);
      const select = (latitude: number, longitude: number, extra: Partial<PreciseLocation> = {}) => {
        marker.position = { lat: latitude, lng: longitude };
        map.panTo({ lat: latitude, lng: longitude }); map.setZoom(16);
        setSelection({ latitude, longitude, label: extra.label || 'Dropped pin', provider: 'google', ...extra });
      };
      autocomplete.addEventListener('gmp-select', async (event: any) => {
        const place = event.placePrediction.toPlace();
        await place.fetchFields({ fields: ['id', 'displayName', 'formattedAddress', 'location', 'addressComponents'] });
        if (!place.location) return;
        const components = place.addressComponents || [];
        select(place.location.lat(), place.location.lng(), {
          label: place.formattedAddress || place.displayName || 'Selected place', googlePlaceId: place.id,
          wardHint: componentName(components, 'administrative_area_level_4') || componentName(components, 'sublocality_level_1'),
          subcountyHint: componentName(components, 'administrative_area_level_3') || componentName(components, 'locality'),
          countyHint: componentName(components, 'administrative_area_level_1'),
        });
      });
      map.addListener('click', (event: any) => select(event.latLng.lat(), event.latLng.lng(), { provider: 'manual' }));
      marker.addListener('dragend', () => {
        const position = marker.position;
        if (position) select(Number(position.lat), Number(position.lng), { provider: 'manual' });
      });
    }).catch(() => setError('Google Maps is temporarily unavailable. Use the county and ward fields below.'));
    return () => { disposed = true; };
  }, [available]);

  if (!ready || !available) return null;
  return <div className="space-y-3 rounded-xl border border-purple-200 bg-white/60 p-3 dark:border-purple-500/30 dark:bg-purple-950/10">
    <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Find your exact area</p><p className="text-xs text-gray-500 dark:text-gray-400">Search a landmark or move the pin. Your exact address is never shown publicly.</p></div>
    <div ref={searchRef} className="min-h-11" />
    <div ref={mapRef} className="h-56 overflow-hidden rounded-xl border border-purple-200 dark:border-purple-500/30" />
    {selection && <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="flex min-w-0 items-center gap-2 text-xs text-gray-600 dark:text-gray-300"><MapPinIcon className="h-4 w-4 shrink-0 text-purple-500"/><span className="truncate">{selection.label}</span></p><button type="button" onClick={() => onConfirm(selection)} className="shrink-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white hover:from-purple-700 hover:to-pink-700">Confirm this pin</button></div>}
    {error && <p className="text-xs text-amber-600 dark:text-amber-300">{error}</p>}
  </div>;
}
