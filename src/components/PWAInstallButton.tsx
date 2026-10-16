import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'compact' | 'prominent' | 'mobile';
  onInstallClickFallback?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'navbar',
  onInstallClickFallback,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as a standalone PWA, suppress button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else if (onInstallClickFallback) {
      onInstallClickFallback();
    } else {
      setShowIOSGuide(true);
    }
  };

  const label = language === 'sw' ? 'Sakinisha App' : 'Install App';

  return (
    <>
      {variant === 'navbar' && (
        <button
          onClick={handleInstallClick}
          id="nav-pwa-install-btn"
          className={`liquid-btn liquid-btn-emerald inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black text-white cursor-pointer shadow-sm transition-all hover:scale-105 ${className}`}
          title={language === 'sw' ? 'Sakinisha App ya Uomboni Sec kwenye simu au kompyuta yako' : 'Install Uomboni Sec App'}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-emerald-100" />
            <span>{label}</span>
          </span>
        </button>
      )}

      {variant === 'mobile' && (
        <button
          onClick={handleInstallClick}
          id="mobile-pwa-install-btn"
          className={`liquid-btn liquid-btn-emerald w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-black text-white cursor-pointer shadow-md ${className}`}
        >
          <span className="relative z-10 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-100" />
            <span>{language === 'sw' ? 'Sakinisha App kwenye Simu (PWA)' : 'Install App on Phone (PWA)'}</span>
          </span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition shadow-xs ${className}`}
        >
          <Download className="w-3 h-3" />
          <span>{label}</span>
        </button>
      )}

      {variant === 'prominent' && (
        <button
          onClick={handleInstallClick}
          className={`px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>{language === 'sw' ? 'Sakinisha App (PWA)' : 'Install Progressive App'}</span>
        </button>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#102A43] flex items-center justify-center text-white">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#102A43]">
                  {language === 'sw' ? 'Sakinisha kwenye iPhone / iPad' : 'Install on iPhone / iPad'}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <strong>Hatua ya 1:</strong> Bonyeza kitufe cha <strong>Share</strong> (Kushiriki) kilicho chini kwenye kivinjari cha Safari.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <strong>Hatua ya 2:</strong> Shuka chini kisha bonyeza <strong>"Add to Home Screen"</strong> (Weka kwenye Skrini ya Mwanzo).
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <strong>Hatua ya 3:</strong> Bonyeza <strong>"Add"</strong> juu kulia. App itatokea kama programu rasmi ya simu!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] py-2.5 text-xs font-bold text-white transition cursor-pointer"
            >
              Nimeelewa / Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
