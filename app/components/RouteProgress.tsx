import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigation } from 'react-router';
import { ListPageSkeleton } from '~/components/ShimmerLoader';
import { isFullPageNavigation } from '~/utils/routeTransitions';
import { reportPerformance } from '~/utils/webVitals';

const PAGE_VEIL_DELAY_MS = 70;

export function RouteProgress() {
  const navigation = useNavigation();
  const location = useLocation();
  const active = navigation.state !== 'idle';
  const changingPage = isFullPageNavigation(
    location.pathname,
    navigation.location?.pathname,
    navigation.state,
  );
  const [showPageVeil, setShowPageVeil] = useState(false);
  const startedAt = useRef<number | null>(null);
  const fromPath = useRef(location.pathname);

  useEffect(() => {
    if (!changingPage) {
      setShowPageVeil(false);
      return;
    }

    // Very fast navigations should feel instant, not flash a loader. Once the
    // old page would be visible long enough to look broken, replace it with a
    // stable page-shaped shimmer until the destination commits.
    const timer = window.setTimeout(() => setShowPageVeil(true), PAGE_VEIL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [changingPage, navigation.location?.pathname]);

  useEffect(() => {
    if (active && startedAt.current === null) {
      startedAt.current = performance.now();
      fromPath.current = location.pathname;
      return;
    }
    if (!active && startedAt.current !== null) {
      reportPerformance({
        name: 'route-navigation',
        value: Math.round(performance.now() - startedAt.current),
        from: fromPath.current,
        to: location.pathname,
      });
      startedAt.current = null;
    }
  }, [active, location.pathname]);

  return (
    <>
      <div
        aria-hidden="true"
        data-route-progress={active ? 'active' : 'idle'}
        className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-150 ${active ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="h-full w-2/5 animate-[route-progress_900ms_ease-in-out_infinite] bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 shadow-[0_0_10px_rgba(192,38,211,0.8)]" />
      </div>

      <div
        aria-hidden={!showPageVeil}
        aria-busy={showPageVeil}
        data-route-veil={showPageVeil ? 'visible' : changingPage ? 'pending' : 'idle'}
        className={`hb-route-veil fixed inset-x-0 bottom-0 top-[calc(56px+env(safe-area-inset-top,0px))] z-[39] overflow-hidden bg-white/95 transition-opacity duration-150 dark:bg-[#0a0a0f]/95 sm:top-[calc(60px+env(safe-area-inset-top,0px))] ${
          showPageVeil ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {showPageVeil && (
          <div className="hb-content-rail py-6 sm:py-8">
            <span className="sr-only" role="status">Loading the next page</span>
            <ListPageSkeleton items={3} />
          </div>
        )}
      </div>
    </>
  );
}
