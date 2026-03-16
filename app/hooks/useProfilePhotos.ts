import { getAccessTokenFromCookies } from '~/utils/cookie';
import { useEffect, useState, useRef } from 'react';
import { documentService } from '~/services/grpc/authServices';

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

    const token = getAccessTokenFromCookies();
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

    // Fetch each user's first profile photo in parallel via gRPC
    Promise.all(
      toFetch.map(async (userId) => {
        try {
          const data = await documentService.getUserDocuments(userId, 'profile_photo');
          const docs = data?.data || [];
          
          if (Array.isArray(docs) && docs.length > 0) {
            const first = docs[0];
            const url = first?.public_url || first?.signed_url || first?.url;
            if (url) {
              globalCache[userId] = url;
            }
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
