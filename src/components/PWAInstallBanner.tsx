import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';

interface PWAInstallBannerProps {
  onOpenInstallModal: () => void;
}

export function PWAInstallBanner({ onOpenInstallModal }: PWAInstallBannerProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running inside installed standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    // Check if user dismissed banner previously
    const dismissed = localStorage.getItem('uomboni_pwa_banner_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('uomboni_pwa_banner_dismissed', 'true');
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div
      id="pwa-install-floating-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/70 rounded-3xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src="/pwa-icon.svg"
              alt="Uomboni Sec"
              className="w-11 h-11 rounded-2xl border border-amber-400/80 shadow-md"
            />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{language === 'sw' ? 'Sakinisha App ya Uomboni Sec' : 'Install Uomboni Sec App'}</span>
            </h4>
            <p className="text-[11px] text-slate-300 line-clamp-1">
              {language === 'sw'
                ? 'Pakia matokeo, angalia madaraja moja kwa moja!'
                : 'Direct installation for results & marksheet'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenInstallModal}
            id="btn-banner-install-now"
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Sakinisha' : 'Install'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Funga tangazo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
