import { useNavigation } from 'react-router';

export function RouteProgress() {
  const navigation = useNavigation();
  const active = navigation.state !== 'idle';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-150 ${active ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="h-full w-2/5 animate-[route-progress_900ms_ease-in-out_infinite] bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 shadow-[0_0_10px_rgba(192,38,211,0.8)]" />
    </div>
  );
}
