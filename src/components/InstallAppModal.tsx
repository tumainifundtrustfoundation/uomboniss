import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Download,
  Smartphone,
  CheckCircle2,
  X,
  Share,
  PlusSquare,
  Sparkles,
  Zap,
  WifiOff,
  ShieldCheck,
  Laptop
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capture PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setActiveDeviceTab('ios');
    } else if (/android/.test(userAgent)) {
      setActiveDeviceTab('android');
    } else {
      setActiveDeviceTab('android');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      // If prompt not automatically triggered, switch to specific device instructions
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setActiveDeviceTab('ios');
      } else if (/android/.test(userAgent)) {
        setActiveDeviceTab('android');
      } else {
        setActiveDeviceTab('pc');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="pwa-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="pwa-install-modal-container"
        className="relative w-full max-w-xl bg-slate-900 border border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          id="btn-close-pwa-modal"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* App Branding Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="/pwa-icon.svg"
                alt="Uomboni Sec App Icon"
                className="w-16 h-16 rounded-2xl shadow-xl border-2 border-amber-400/80"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-950 font-black">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {language === 'sw' ? 'Sakinisha App ya Uomboni Sec' : 'Install Uomboni Sec Mobile App'}
                </h3>
              </div>
              <p className="text-xs text-amber-300 font-semibold">
                NECTA Centre S0486 • {language === 'sw' ? 'Moja kwa Moja Kwenye Simu Yako' : 'Direct Installation (PWA)'}
              </p>
            </div>
          </div>

          {/* Success Banner if Installed */}
          {installSuccess || isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-black text-white text-sm">
                  {language === 'sw' ? 'App Imejisakinisha Kikamilifu!' : 'App Successfully Installed!'}
                </p>
                <p className="text-emerald-300 font-medium">
                  {language === 'sw'
                    ? 'Sasa unaweza kuifungua moja kwa moja kutoka kwenye Skrini Kuu ya simu au kompyuta yako.'
                    : 'You can now launch Uomboni Sec directly from your Home Screen anytime.'}
                </p>
              </div>
            </div>
          ) : null}

          {/* Key Advantages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-amber-400">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-black">{language === 'sw' ? 'Kasi ya Juu' : 'Instant Speed'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'sw' ? 'Inafunguka papo hapo bila kusubiri' : 'Instant launch with zero load delays'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-black">{language === 'sw' ? 'Inafanya Kazi Offline' : 'Works Offline'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'sw' ? 'Tazama matokeo hata bila intaneti' : 'Access cached marks without data'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-black">{language === 'sw' ? 'Bila Play Store' : 'No Store Needed'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'sw' ? 'Inajisakinisha moja kwa moja hapa' : 'Direct install with zero MB wasted'}
              </p>
            </div>
          </div>

          {/* Direct Install Button (If supported by browser prompt) */}
          <button
            onClick={handleInstallClick}
            id="btn-trigger-direct-pwa-install"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl hover:scale-101 transition-all cursor-pointer flex items-center justify-center gap-3 border border-emerald-400/40"
          >
            <Download className="w-5 h-5 text-slate-950" />
            <span>
              {language === 'sw'
                ? '📲 SAKINISHA MOJA KWA MOJA KWENYE SIMU / KOMPYUTA'
                : '📲 INSTALL DIRECTLY ON PHONE / COMPUTER'}
            </span>
          </button>

          {/* Device Tabs for Step-by-Step Guidance */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {language === 'sw' ? 'Mwongozo kwa Kifaa Chako:' : 'Step-by-Step Installation Guide:'}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveDeviceTab('android')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    activeDeviceTab === 'android' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Android
                </button>
                <button
                  onClick={() => setActiveDeviceTab('ios')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    activeDeviceTab === 'ios' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  iPhone / iOS
                </button>
                <button
                  onClick={() => setActiveDeviceTab('pc')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    activeDeviceTab === 'pc' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Kompyuta (PC)
                </button>
              </div>
            </div>

            {/* Android Guide */}
            {activeDeviceTab === 'android' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2.5">
                <p className="font-bold text-emerald-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Kwenye Android (Chrome / Samsung Internet):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed font-medium">
                  <li>
                    Bonyeza kitufe kikubwa cha kijani cha <b>"SAKINISHA MOJA KWA MOJA"</b> hapo juu.
                  </li>
                  <li>
                    Au bonyeza alama ya vidoti vitatu <b>( ⋮ )</b> vilivyopo juu kulia kwenye kivinjari chako cha Chrome.
                  </li>
                  <li>
                    Chagua <b>"Install app"</b> au <b>"Add to Home screen"</b> (Weka kwenye Skrini ya Mwanzo).
                  </li>
                  <li>Bonyeza <b>"Install"</b> — ikoni ya Uomboni Sec itaonekana mara moja kwenye simu yako!</li>
                </ol>
              </div>
            )}

            {/* iOS Guide */}
            {activeDeviceTab === 'ios' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2.5">
                <p className="font-bold text-amber-300 flex items-center gap-2">
                  <Share className="w-4 h-4 text-amber-400" />
                  <span>Kwenye iPhone au iPad (Safari):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed font-medium">
                  <li>Fungua tovuti hii kupitia kivinjari cha <b>Safari</b>.</li>
                  <li>
                    Bonyeza ikoni ya <b>Share (Kushiriki)</b> iliyopo chini katikati ya skrini ya simu yako{' '}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">
                      [ 📤 mraba wenye mshale ]
                    </span>
                    .
                  </li>
                  <li>
                    Sogeza chini kidogo kisha chagua <b>"Add to Home Screen"</b> (Weka kwenye Skrini Kuu).
                  </li>
                  <li>
                    Bonyeza <b>"Add"</b> juu kulia. App itajisakinisha kwenye iPhone yako kama Application kamili!
                  </li>
                </ol>
              </div>
            )}

            {/* PC Guide */}
            {activeDeviceTab === 'pc' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2.5">
                <p className="font-bold text-blue-300 flex items-center gap-2">
                  <Laptop className="w-4 h-4" />
                  <span>Kwenye Kompyuta (Google Chrome / Microsoft Edge):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed font-medium">
                  <li>
                    Tazama sehemu ya juu kulia ya bar ya anwani (Address bar) kwenye Chrome/Edge.
                  </li>
                  <li>
                    Bonyeza ikoni ya <b>Kushusha/Kompyuta (📥 Install Uomboni Sec)</b>.
                  </li>
                  <li>
                    Chagua <b>"Install"</b> ili kuifungua kama programu inayojitegemea kwenye kompyuta yako bila vibandiko vya browser!
                  </li>
                </ol>
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer underline"
            >
              {language === 'sw' ? 'Funga Dirisha Hili' : 'Close This Window'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
