import { useEffect, useState } from 'react';

export function AppLaunchScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    if (!standalone) {
      setVisible(false);
      return;
    }

    // Keep the hand-off from the native launch image smooth, but never hold up
    // an already interactive app for the sake of an artificial animation.
    const fadeTimer = window.setTimeout(() => setLeaving(true), 350);
    const removeTimer = window.setTimeout(() => setVisible(false), 600);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`hb-launch-screen ${leaving ? 'hb-launch-screen--leaving' : ''}`}
      role="status"
      aria-label="HomeBit is loading"
    >
      <div className="hb-launch-glow" aria-hidden="true" />
      <div className="relative flex flex-col items-center">
        <div className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Home<span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Bit</span>
        </div>
        <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.24em] text-purple-200 sm:text-xs">
          Trusted help, closer to home
        </p>
        <div className="mt-10 h-1 w-28 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div className="hb-launch-progress h-full w-1/2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
        </div>
      </div>
    </div>
  );
}
