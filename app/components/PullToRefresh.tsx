import { useEffect, useRef, useState } from 'react';
import { ArrowDown, LoaderCircle } from 'lucide-react';
import { isInstalledPWA, reportPWAEvent } from '~/utils/pwaTelemetry';

const TRIGGER = 72;

function scrollContainer(target: EventTarget | null): HTMLElement | null {
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return null;
}

export function PullToRefresh() {
  const startY = useRef<number | null>(null);
  const eligible = useRef(false);
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isInstalledPWA()) return;
    const start = (event: TouchEvent) => {
      if (refreshing || event.touches.length !== 1) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      const scroller = scrollContainer(target);
      eligible.current = (scroller ? scroller.scrollTop : window.scrollY) <= 0;
      startY.current = eligible.current ? event.touches[0].clientY : null;
    };
    const move = (event: TouchEvent) => {
      if (!eligible.current || startY.current === null) return;
      const delta = event.touches[0].clientY - startY.current;
      if (delta <= 0) { setDistance(0); return; }
      event.preventDefault();
      setDistance(Math.min(104, delta * 0.55));
    };
    const end = () => {
      if (distance >= TRIGGER) {
        setRefreshing(true); setDistance(TRIGGER); reportPWAEvent('refresh');
        window.setTimeout(() => window.location.reload(), 220);
      } else setDistance(0);
      startY.current = null; eligible.current = false;
    };
    document.addEventListener('touchstart', start, { passive: true });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', end, { passive: true });
    document.addEventListener('touchcancel', end, { passive: true });
    return () => {
      document.removeEventListener('touchstart', start);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
      document.removeEventListener('touchcancel', end);
    };
  }, [distance, refreshing]);

  if (!distance && !refreshing) return null;
  const ready = distance >= TRIGGER;
  return <div className="fixed left-1/2 z-[10000] flex h-11 items-center gap-2 rounded-full border border-purple-400/50 bg-[#15131d]/95 px-4 text-sm text-white shadow-xl backdrop-blur" style={{ top: `calc(env(safe-area-inset-top) + ${Math.max(8, distance - 48)}px)`, transform: 'translateX(-50%)' }} aria-live="polite">
    {refreshing ? <LoaderCircle className="h-4 w-4 animate-spin text-fuchsia-400" /> : <ArrowDown className={`h-4 w-4 text-fuchsia-400 transition-transform ${ready ? 'rotate-180' : ''}`} />}
    {refreshing ? 'Refreshing…' : ready ? 'Release to refresh' : 'Pull to refresh'}
  </div>;
}
