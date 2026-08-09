import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Filters that survive leaving the page.
 *
 * The active set is written back as it changes, debounced — a filter panel
 * produces a burst of changes as someone works through it, and a request per
 * keystroke would be a request per thought.
 *
 * Reading is best effort. A page that cannot load saved filters should render
 * with none rather than fail, because the listings underneath are what the
 * person came for.
 */
export function useSavedFilters<T extends Record<string, unknown>>(
  userProfileId: string,
  defaults: T,
) {
  const [filters, setFilters] = useState<T>(defaults);
  const [saved, setSaved] = useState<Array<{ name: string; filters: T }>>([]);
  const [restored, setRestored] = useState(false);

  // Nothing is written until the stored set has been read. Otherwise the empty
  // defaults race the load and overwrite what the person had — the failure
  // would look like filters that silently reset themselves.
  const restoredRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!userProfileId) {
      setRestored(true);
      restoredRef.current = true;
      return;
    }
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(
          `/api/saved-filters?user_profile_id=${encodeURIComponent(userProfileId)}`,
        );
        const data = await response.json();
        if (cancelled) return;
        if (data?.active && Object.keys(data.active).length > 0) {
          setFilters((current) => ({ ...current, ...data.active }));
        }
        if (Array.isArray(data?.saved)) setSaved(data.saved);
      } catch {
        // Left with defaults.
      } finally {
        if (!cancelled) {
          setRestored(true);
          restoredRef.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userProfileId]);

  useEffect(() => {
    if (!userProfileId || !restoredRef.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void fetch('/api/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_profile_id: userProfileId, name: '', filters }),
      }).catch(() => {
        // The active set is a convenience; a failed write costs the person
        // nothing they can see, and nagging about it would be noise.
      });
    }, 600);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [filters, userProfileId]);

  const saveNamed = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!userProfileId || !trimmed) return;
      const response = await fetch('/api/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_profile_id: userProfileId, name: trimmed, filters }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Could not save that filter');
      }
      setSaved((current) => [
        { name: trimmed, filters },
        ...current.filter((item) => item.name !== trimmed),
      ]);
    },
    [filters, userProfileId],
  );

  const applySaved = useCallback((name: string) => {
    setSaved((current) => {
      const match = current.find((item) => item.name === name);
      if (match) setFilters((existing) => ({ ...existing, ...match.filters }));
      return current;
    });
  }, []);

  const deleteSaved = useCallback(
    async (name: string) => {
      if (!userProfileId) return;
      await fetch('/api/saved-filters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_profile_id: userProfileId, name }),
      });
      setSaved((current) => current.filter((item) => item.name !== name));
    },
    [userProfileId],
  );

  return { filters, setFilters, saved, saveNamed, applySaved, deleteSaved, restored };
}
