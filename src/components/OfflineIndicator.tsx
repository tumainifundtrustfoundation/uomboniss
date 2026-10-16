import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-950/95 border border-amber-500/80 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2"
    >
      <span className="flex h-2.5 w-2.5 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
      </span>
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Hali ya Nje ya Mtandao (Offline) &bull; Nyaraka zilizopakuliwa zipo salama.</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-2 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Jaribu</span>
      </button>
    </div>
  );
};
