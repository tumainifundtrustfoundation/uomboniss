import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface GoogleSignInButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  sublabel?: string;
  theme?: 'dark' | 'light';
  className?: string;
  id?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  label = 'Ingia kwa Akaunti ya Google',
  sublabel,
  theme = 'dark',
  className = '',
  id = 'google-signin-btn',
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative w-full group overflow-hidden rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
        isDark
          ? 'bg-slate-900 hover:bg-slate-850 text-white border border-slate-700/80 hover:border-slate-500 hover:shadow-lg hover:shadow-slate-950/40'
          : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow'
      } p-3 sm:p-3.5 flex items-center justify-center gap-3 ${className}`}
    >
      {/* Subtle hover gradient flare */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-emerald-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-blue-500 shrink-0" />
      ) : (
        <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-white rounded-full p-1 shadow-xs border border-slate-200/60">
          <svg className="w-full h-full" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </div>
      )}

      <div className="text-left flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-bold text-sm leading-tight tracking-tight">
          <span className="truncate">{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-medium hidden sm:inline-block">
            OAuth 2.0
          </span>
        </div>
        {sublabel ? (
          <p className="text-[11px] opacity-70 truncate mt-0.5">{sublabel}</p>
        ) : (
          <p className="text-[10px] opacity-60 truncate">Salama kupitia Google Firebase Auth</p>
        )}
      </div>

      <div className="hidden sm:flex items-center text-emerald-400 text-xs font-semibold shrink-0 gap-1 opacity-80 group-hover:opacity-100">
        <ShieldCheck className="w-4 h-4" />
      </div>
    </button>
  );
};
