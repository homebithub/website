import { useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '~/config/api';

/**
 * Fetches the first profile_photo document URL for a list of user IDs.
 * Returns a map of userId → photoUrl. Caches results across renders.
 */

const globalCache: Record<string, string> = {};

export function useProfilePhotos(userIds: string[]): Record<string, string> {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const fetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userIds || userIds.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Filter to IDs we haven't fetched yet
    const toFetch = userIds.filter(
      (id) => id && !globalCache[id] && !fetchedRef.current.has(id)
    );

    if (toFetch.length === 0) {
      // All cached — just sync state
      const cached: Record<string, string> = {};
      for (const id of userIds) {
        if (globalCache[id]) cached[id] = globalCache[id];
      }
      setPhotos((prev) => {
        const merged = { ...prev, ...cached };
        if (JSON.stringify(merged) === JSON.stringify(prev)) return prev;
        return merged;
      });
      return;
    }

    // Mark as in-flight
    toFetch.forEach((id) => fetchedRef.current.add(id));

    // Fetch each user's first profile photo in parallel
    Promise.all(
      toFetch.map(async (userId) => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/v1/documents/user/${userId}?document_type=profile_photo`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) return;
          const json = await res.json();
          const docs = json.data?.data || json.data || [];
          const arr = Array.isArray(docs) ? docs : [];
          const url = arr[0]?.public_url || arr[0]?.signed_url || arr[0]?.url;
          if (url) {
            globalCache[userId] = url;
          }
        } catch {
          // silently ignore
        }
      })
    ).then(() => {
      const result: Record<string, string> = {};
      for (const id of userIds) {
        if (globalCache[id]) result[id] = globalCache[id];
      }
      setPhotos((prev) => ({ ...prev, ...result }));
    });
  }, [userIds.join(',')]);

  return photos;
}
