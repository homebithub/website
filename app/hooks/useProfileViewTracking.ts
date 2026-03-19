import { useEffect, useRef } from 'react';
import { profileViewService } from '~/services/grpc/profileView.service';

interface UseProfileViewTrackingOptions {
  profileId: string;
  profileType: 'household' | 'househelp';
  viewerUserId?: string;
  enabled?: boolean;
}

/**
 * Hook to track profile views with YouTube-style deduplication
 * Automatically records view on mount and updates duration on unmount
 */
export function useProfileViewTracking({
  profileId,
  profileType,
  viewerUserId,
  enabled = true,
}: UseProfileViewTrackingOptions) {
  const viewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const isRecordedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || !profileId || isRecordedRef.current) return;

    const recordView = async () => {
      try {
        const result = await profileViewService.recordView(
          profileId,
          profileType,
          viewerUserId
        );
        
        viewIdRef.current = result.viewId;
        startTimeRef.current = Date.now();
        isRecordedRef.current = true;

        console.log('[ProfileView] View recorded:', {
          viewId: result.viewId,
          isUnique: result.isUnique,
          profileId,
          profileType,
        });
      } catch (error) {
        console.error('[ProfileView] Failed to record view:', error);
      }
    };

    recordView();

    // Update duration on unmount or visibility change
    const updateDuration = () => {
      if (viewIdRef.current) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (duration > 0) {
          profileViewService.updateViewDuration(viewIdRef.current, duration).catch(console.error);
          console.log('[ProfileView] Duration updated:', duration, 'seconds');
        }
      }
    };

    // Handle page visibility changes (user switches tabs)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateDuration();
      } else {
        // Reset start time when user returns to tab
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updateDuration();
    };
  }, [profileId, profileType, viewerUserId, enabled]);

  return {
    viewId: viewIdRef.current,
  };
}
