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
  const startX = useRef<number | null>(null);
  const eligible = useRef(false);
  const pulling = useRef(false);
  const distanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // An embedded profile has its own scroll surface inside the parent inbox.
    // Installing another document-level gesture handler in the iframe makes
    // iOS arbitrate two pull gestures and can leave the inner page unscrollable.
    if (!isInstalledPWA() || window.self !== window.top) return;
    const renderDistance = (next: number) => {
      distanceRef.current = next;
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        setDistance(distanceRef.current);
      });
    };
    const start = (event: TouchEvent) => {
      if (refreshingRef.current || event.touches.length !== 1) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      const scroller = scrollContainer(target);
      eligible.current = (scroller ? scroller.scrollTop : window.scrollY) <= 0;
      startY.current = eligible.current ? event.touches[0].clientY : null;
      startX.current = eligible.current ? event.touches[0].clientX : null;
      pulling.current = false;
    };
    const move = (event: TouchEvent) => {
      if (!eligible.current || startY.current === null || startX.current === null || event.touches.length !== 1) return;
      const delta = event.touches[0].clientY - startY.current;
      const horizontalDelta = Math.abs(event.touches[0].clientX - startX.current);
      if (!pulling.current) {
        if (delta <= 10 || horizontalDelta > delta) return;
        pulling.current = true;
      }
      if (delta <= 0) { renderDistance(0); return; }
      event.preventDefault();
      renderDistance(Math.min(104, delta * 0.55));
    };
    const end = () => {
      if (pulling.current && distanceRef.current >= TRIGGER) {
        refreshingRef.current = true;
        setRefreshing(true);
        renderDistance(TRIGGER);
        reportPWAEvent('refresh');
        window.setTimeout(() => window.location.reload(), 220);
      } else renderDistance(0);
      startY.current = null;
      startX.current = null;
      eligible.current = false;
      pulling.current = false;
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
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  if (!distance && !refreshing) return null;
  const ready = distance >= TRIGGER;
  return <div className="fixed left-1/2 z-[10000] flex h-11 items-center gap-2 rounded-full border border-purple-400/50 bg-[#15131d]/95 px-4 text-sm text-white shadow-xl backdrop-blur" style={{ top: `calc(env(safe-area-inset-top) + ${Math.max(8, distance - 48)}px)`, transform: 'translateX(-50%)' }} aria-live="polite">
    {refreshing ? <LoaderCircle className="h-4 w-4 animate-spin text-fuchsia-400" /> : <ArrowDown className={`h-4 w-4 text-fuchsia-400 transition-transform ${ready ? 'rotate-180' : ''}`} />}
    {refreshing ? 'Refreshing…' : ready ? 'Release to refresh' : 'Pull to refresh'}
  </div>;
}
