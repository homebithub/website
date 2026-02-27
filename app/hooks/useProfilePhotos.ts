import { useEffect, useState, useRef, useMemo } from 'react';
import { transport, getGrpcMetadata } from '~/utils/grpcClient';
import { DocumentServiceClient } from '~/proto/auth/auth.client';
import { ListDocumentsByOwnerRequest } from '~/proto/auth/auth';

/**
 * Fetches the first profile_photo document URL for a list of user IDs.
 * Returns a map of userId → photoUrl. Caches results across renders.
 */

const globalCache: Record<string, string> = {};

export function useProfilePhotos(userIds: string[]): Record<string, string> {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const fetchedRef = useRef<Set<string>>(new Set());
  const client = useMemo(() => new DocumentServiceClient(transport), []);

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

    // Fetch each user's first profile photo in parallel via gRPC
    Promise.all(
      toFetch.map(async (userId) => {
        try {
          const request: ListDocumentsByOwnerRequest = {
            ownerId: userId,
            ownerType: 'user',
            documentType: 'profile_photo',
            limit: 1,
            offset: 0
          };

          const { response } = await client.listDocumentsByOwner(request, { metadata: getGrpcMetadata() });
          const fields = response.data?.fields || {};
          const docs = fields.data?.listValue?.values || [];
          
          if (docs.length > 0) {
            const first = docs[0].structValue?.fields || {};
            const url = first.public_url?.stringValue || first.signed_url?.stringValue || first.url?.stringValue;
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
  }, [userIds.join(','), client]);

  return photos;
}
