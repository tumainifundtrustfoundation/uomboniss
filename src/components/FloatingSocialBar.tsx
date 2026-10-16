import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  MessageCircle,
  MessageSquareText,
  Phone,
  ArrowUp,
} from 'lucide-react';

export const FloatingSocialBar: React.FC = () => {
  const { language } = useLanguage();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-xl bg-slate-900/90 text-amber-300 hover:bg-slate-800 hover:text-white border border-slate-700 shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer animate-in fade-in zoom-in"
          title={language === 'sw' ? 'Rudi Juu' : 'Back to Top'}
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Floating Action Buttons: SMS Messenger, WhatsApp, Call */}
      <div className="bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-1.5">
        {/* SMS / Native Phone Messenger Button */}
        <a
          href="sms:+255782558127?body=Habari%20Shule%20ya%20Sekondari%20Uomboni%2C%20ninaomba%20msaada%20wa..."
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md transition-transform hover:scale-105"
          title={language === 'sw' ? 'Fungua Messenger ya Simu (Tuma SMS)' : 'Open Phone Messenger (Send SMS)'}
          aria-label="SMS Messenger"
        >
          <MessageSquareText className="w-4 h-4 text-white" />
          <span className="text-xs font-bold font-mono">SMS</span>
        </a>

        {/* WhatsApp Official Contact */}
        <a
          href="https://wa.me/255754889001?text=Habari%2C%20ninaomba%20taarifa%20kuhusu%20Uomboni%20Secondary%20School%20Marangu"
          target="_blank"
          rel="noopener noreferrer"
          className="relative px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md transition-transform hover:scale-105"
          title="WhatsApp Uomboni Secondary (+255 754 889 001)"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-bold font-mono">WhatsApp</span>
          <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </a>

        {/* Direct Call */}
        <a
          href="tel:+255782558127"
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center justify-center shadow-xs transition-transform hover:scale-110"
          title={language === 'sw' ? 'Piga Simu (+255 782 558 127)' : 'Call School (+255 782 558 127)'}
          aria-label="Phone"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
