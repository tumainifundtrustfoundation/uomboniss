import React from 'react';
import { ChevronDown, ArrowRight, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';

interface HeroProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
  onOpenAdmissionDocuments?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, onOpenAdmin, onOpenAdmissionDocuments }) => {
  const { schoolProfile } = useData();

  const schoolName = schoolProfile?.name || 'Uomboni Secondary School';
  const slogan = schoolProfile?.slogan || schoolProfile?.sloganSw || 'Tujiendeleze sisi wenyewe.';
  const vision = schoolProfile?.vision || schoolProfile?.visionEn || 'To Provide Quality Education and Impressive Academic Performance';
  const nectaCode = schoolProfile?.nectaCode || 'S0486';
  const location = schoolProfile?.location || 'Marangu, Kilimanjaro';

  return (
    <section id="home" className="relative w-full min-h-[82vh] lg:min-h-[88vh] flex items-center justify-center overflow-hidden bg-[#102A43]">
      {/* Real Uomboni Secondary School Photograph */}
      <div className="absolute inset-0 z-0">
        <img
          src="/media/media_14.webp"
          alt="Uomboni Secondary School Campus, Marangu Kilimanjaro"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Subtle Deep Navy Overlay */}
        <div className="absolute inset-0 bg-[#102A43]/82 backdrop-brightness-90" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center animate-in fade-in duration-700">
        {/* Institutional Kicker */}
        <p className="text-xs sm:text-sm font-semibold text-[#C9A227] tracking-wider uppercase mb-3">
          Jimbo Katoliki la Moshi · Marangu Magharibi
        </p>

        {/* Headline */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] text-balance">
            {schoolName}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 font-normal max-w-xl mx-auto leading-relaxed">
            Elimu bora, maadili mema ya Kikristo na ufaulu wa kiwango cha juu kwa vijana wa Kidato cha Kwanza hadi cha Nne.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
          {onOpenAdmissionDocuments && (
            <button
              onClick={onOpenAdmissionDocuments}
              id="hero-student-admission-btn"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C9A227] text-slate-950 font-bold text-xs sm:text-sm hover:bg-amber-400 transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2 group"
            >
              <FileText className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Fomu za Udahili 2026/2027</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          )}

          <button
            onClick={() => onNavigate('about')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Kuhusu Shule</span>
          </button>
        </div>

        {/* Key Institutional Facts */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center max-w-3xl mx-auto">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="block text-lg sm:text-xl font-bold text-[#C9A227] font-mono">S0486</span>
            <span className="text-[11px] text-slate-300">Kituo cha NECTA</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="block text-lg sm:text-xl font-bold text-[#C9A227]">Kidato 1–4</span>
            <span className="text-[11px] text-slate-300">O-Level (Wavulana & Wasichana)</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="block text-lg sm:text-xl font-bold text-[#C9A227]">Bweni & Kutwa</span>
            <span className="text-[11px] text-slate-300">Malazi na Chakula Bora</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="block text-lg sm:text-xl font-bold text-[#C9A227]">Marangu</span>
            <span className="text-[11px] text-slate-300">Mteremko wa Mlima Kilimanjaro</span>
          </div>
        </div>
      </div>

      {/* Gentle Scroll Hint */}
      <button
        onClick={() => onNavigate('about')}
        aria-label="Scroll to About section"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-[#FFFFF0]/60 hover:text-white transition-colors cursor-pointer"
      >
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
};
