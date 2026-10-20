import React from 'react';
import { ChevronDown, ArrowRight, FileText } from 'lucide-react';

interface HeroProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
  onOpenAdmissionDocuments?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, onOpenAdmin, onOpenAdmissionDocuments }) => {

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
        <div className="inline-flex items-center justify-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#FFFFF0]/10 border border-[#C9A227]/40 text-[#FFFFF0] text-[10px] sm:text-xs font-semibold tracking-normal sm:tracking-wider uppercase mb-5 backdrop-blur-xs max-w-full text-center leading-tight">
          <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse shrink-0" />
          <span className="break-words">NECTA S0486 · Catholic Diocese of Moshi · Marangu</span>
        </div>

        {/* Headline */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest text-[#C9A227] block">
            Kauli Mbiu: “Tujiendeleze sisi wenyewe.”
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] break-words">
            Uomboni Secondary School
          </h1>
          <p className="text-xs sm:text-base text-amber-200/90 font-medium max-w-2xl mx-auto leading-relaxed">
            To Provide Quality Education and Impressive Academic Performance
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 w-full">
          {onOpenAdmissionDocuments && (
            <button
              onClick={onOpenAdmissionDocuments}
              id="hero-student-admission-btn"
              className="liquid-btn liquid-btn-red w-full sm:w-auto px-6 sm:px-7 py-3 text-white font-black text-xs sm:text-sm cursor-pointer shadow-lg flex items-center justify-center gap-2 group transition-all"
              title="Fungua Hati na Fomu za Kujiunga na Shule"
            >
              <span className="relative z-10 flex items-center gap-2">
                <FileText className="w-4 h-4 text-white drop-shadow-xs" />
                <span className="tracking-wider">STUDENT ADMISSION</span>
                <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          )}

          <button
            onClick={() => onNavigate('about')}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#FFFFF0] text-[#102A43] font-semibold text-xs sm:text-sm hover:bg-white transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 group"
          >
            <span>Explore Our School</span>
            <ArrowRight className="w-4 h-4 text-[#C9A227] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#C9A227] text-slate-950 font-bold text-xs sm:text-sm hover:bg-amber-400 transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <span>Mawasiliano &amp; Mahali</span>
          </button>
        </div>

        {/* Key Institutional Facts */}
        <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-left max-w-4xl mx-auto w-full">
          <div className="border-l-2 border-[#C9A227] pl-2.5 sm:pl-3.5 min-w-0">
            <span className="block text-lg sm:text-xl font-bold text-white font-mono">S0486</span>
            <span className="text-[11px] sm:text-xs text-[#FFFFF0]/70 break-words leading-tight block mt-0.5">NECTA Registered Centre</span>
          </div>
          <div className="border-l-2 border-[#C9A227] pl-2.5 sm:pl-3.5 min-w-0">
            <span className="block text-lg sm:text-xl font-bold text-white">Forms 1–4</span>
            <span className="text-[11px] sm:text-xs text-[#FFFFF0]/70 break-words leading-tight block mt-0.5">Ordinary Level Secondary</span>
          </div>
          <div className="border-l-2 border-[#C9A227] pl-2.5 sm:pl-3.5 min-w-0">
            <span className="block text-lg sm:text-xl font-bold text-white">Day &amp; Boarding</span>
            <span className="text-[11px] sm:text-xs text-[#FFFFF0]/70 break-words leading-tight block mt-0.5">Co-Educational Facilities</span>
          </div>
          <div className="border-l-2 border-[#C9A227] pl-2.5 sm:pl-3.5 min-w-0">
            <span className="block text-lg sm:text-xl font-bold text-white">Marangu West</span>
            <span className="text-[11px] sm:text-xs text-[#FFFFF0]/70 break-words leading-tight block mt-0.5">Mount Kilimanjaro Slopes</span>
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
