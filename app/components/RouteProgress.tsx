import { useEffect, useRef } from 'react';
import { useLocation, useNavigation } from 'react-router';
import { reportPerformance } from '~/utils/webVitals';

export function RouteProgress() {
  const navigation = useNavigation();
  const location = useLocation();
  const active = navigation.state !== 'idle';
  const startedAt = useRef<number | null>(null);
  const fromPath = useRef(location.pathname);

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
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-150 ${active ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="h-full w-2/5 animate-[route-progress_900ms_ease-in-out_infinite] bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 shadow-[0_0_10px_rgba(192,38,211,0.8)]" />
    </div>
  );
}
