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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFF0]/10 border border-[#C9A227]/40 text-[#FFFFF0] text-xs font-semibold tracking-wider uppercase mb-5 backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
          <span>NECTA S0486 · Catholic Diocese of Moshi · Marangu, Kilimanjaro</span>
        </div>

        {/* Headline */}
        <div className="space-y-2.5 max-w-4xl mx-auto">
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
            Tujendelee Sisi Wenyewe: Prayer · Education · Work
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {onOpenAdmissionDocuments && (
            <button
              onClick={onOpenAdmissionDocuments}
              id="hero-student-admission-btn"
              className="liquid-btn liquid-btn-red w-full sm:w-auto px-7 py-3 text-white font-black text-xs sm:text-sm cursor-pointer shadow-lg flex items-center justify-center gap-2 group transition-all"
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
        <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-left max-w-4xl mx-auto">
          <div className="border-l-2 border-[#C9A227] pl-3.5">
            <span className="block text-xl font-bold text-white">S0486</span>
            <span className="text-xs text-[#FFFFF0]/70">NECTA Registered Centre</span>
          </div>
          <div className="border-l-2 border-[#C9A227] pl-3.5">
            <span className="block text-xl font-bold text-white">Forms 1–4</span>
            <span className="text-xs text-[#FFFFF0]/70">Ordinary Level Secondary</span>
          </div>
          <div className="border-l-2 border-[#C9A227] pl-3.5">
            <span className="block text-xl font-bold text-white">Day &amp; Boarding</span>
            <span className="text-xs text-[#FFFFF0]/70">Co-Educational Facilities</span>
          </div>
          <div className="border-l-2 border-[#C9A227] pl-3.5">
            <span className="block text-xl font-bold text-white">Marangu West</span>
            <span className="text-xs text-[#FFFFF0]/70">Mount Kilimanjaro Slopes</span>
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
