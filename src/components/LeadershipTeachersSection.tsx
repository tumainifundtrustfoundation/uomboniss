import React, { useState, useEffect, useRef } from 'react';
import { SAVED_TEACHERS } from '../data/savedSchoolMedia';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Teacher } from '../types';
import {
  Phone,
  Mail,
  MessageSquare,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  User
} from 'lucide-react';

// Official WhatsApp Brand Icon Component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.908.533 3.69 1.455 5.215L2.094 22l4.896-1.328a9.98 9.98 0 005.041 1.359h.005c5.534 0 10.029-4.495 10.029-10.031C22.065 6.495 17.568 2 12.031 2zm5.836 14.199c-.244.686-1.42 1.328-1.956 1.365-.506.035-1.164.05-3.376-.867-2.607-1.082-4.275-3.722-4.406-3.896-.13-.173-1.055-1.405-1.055-2.68 0-1.275.666-1.904.903-2.164.237-.26.518-.325.69-.325.174 0 .348.002.5.01.162.008.378-.061.591.45.22.527.75 1.83.816 1.963.065.133.109.289.022.463-.087.174-.13.283-.26.435-.13.152-.272.339-.389.455-.13.13-.266.272-.114.533.152.261.674 1.111 1.446 1.799.994.886 1.832 1.16 2.093 1.29.261.13.413.109.565-.065.152-.174.652-.761.826-1.022.174-.261.348-.217.587-.13.239.087 1.522.717 1.783.848.261.13.435.196.5.304.065.109.065.631-.179 1.317z" />
  </svg>
);

export const LeadershipTeachersSection: React.FC = () => {
  const { language } = useLanguage();
  const { teachers: liveTeachers } = useData();
  const teachers: Teacher[] = Array.isArray(liveTeachers) && liveTeachers.length > 0 ? liveTeachers : SAVED_TEACHERS;

  // View Mode: 'individual' (Mtu Mmojammoja - Default) or 'grid' (Orodha ya Wote)
  const [viewMode, setViewMode] = useState<'individual' | 'grid'>('individual');
  
  // Individual teacher selection state (Stable - starts with teacher 0)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Auto-play is OFF by default so the page stays 100% stable without unexpected jumping
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);

  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const DURATION_MS = 6000;

  // Clean phone number utilities
  const getCleanPhoneDigits = (phone?: string) => {
    if (!phone) return '255782558127';
    return phone.replace(/[^\d]/g, '');
  };

  const getCleanPhoneTel = (phone?: string) => {
    if (!phone) return '+255782558127';
    return phone.replace(/\s+/g, '');
  };

  // Step to Next teacher (mtu mmojammoja)
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % teachers.length);
  };

  // Step to Previous teacher
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + teachers.length) % teachers.length);
  };

  // Direct selection of an individual teacher
  const handleSelectTeacher = (index: number) => {
    setCurrentIndex(index);
    if (viewMode === 'grid') {
      setViewMode('individual');
    }
  };

  // Controlled optional auto-play (ONLY runs if user explicitly presses play)
  useEffect(() => {
    if (!isAutoPlay || viewMode !== 'individual') return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % teachers.length);
    }, DURATION_MS);

    return () => clearInterval(timer);
  }, [isAutoPlay, viewMode, teachers.length]);

  // Safely scroll ONLY the local horizontal thumbnail container without touching window viewport
  useEffect(() => {
    const container = thumbScrollRef.current;
    if (container && container.children[currentIndex]) {
      const activeBtn = container.children[currentIndex] as HTMLElement;
      if (activeBtn) {
        const targetScrollLeft =
          activeBtn.offsetLeft - container.offsetWidth / 2 + activeBtn.offsetWidth / 2;
        container.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
      }
    }
  }, [currentIndex]);

  const currentTeacher = teachers[currentIndex] || teachers[0];
  const currentCleanPhoneDigits = getCleanPhoneDigits(currentTeacher.phone);
  const currentCleanPhoneTel = getCleanPhoneTel(currentTeacher.phone);
  const currentTeacherEmail = currentTeacher.email || 'info@uomboniss.ac.tz';
  const whatsappGreeting = encodeURIComponent(
    language === 'sw'
      ? `Habari ${currentTeacher.name}, ninawasiliana nawe kutoka Tovuti Rasmi ya Shule ya Sekondari Uomboni.`
      : `Hello ${currentTeacher.name}, contacting you from Uomboni Secondary School official website.`
  );
  const smsGreeting = encodeURIComponent(
    language === 'sw'
      ? `Habari ${currentTeacher.name}, nina ujumbe kutoka tovuti ya Uomboni.`
      : `Hello ${currentTeacher.name}, message from Uomboni school website.`
  );
  const emailSubject = encodeURIComponent(
    `Mawasiliano na ${currentTeacher.name} - Shule ya Sekondari Uomboni`
  );

  return (
    <section id="teachers" className="py-12 sm:py-16 bg-[#FFFFF0] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[#102A43]/10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 text-amber-900 text-xs font-bold tracking-wider uppercase border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'sw' ? 'WALIMU WETU' : 'OUR TEACHERS'}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
              {language === 'sw' ? 'Walimu Wetu wa Uomboni' : 'Meet Our Teachers'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {language === 'sw'
                ? 'Picha, majina na mawasiliano ya moja kwa moja ya walimu wetu mmoja mmoja kupitia WhatsApp, Simu, SMS au Barua Pepe.'
                : 'Photographs, names, and direct contact options for our teachers one by one via WhatsApp, Call, SMS, or Email.'}
            </p>
          </div>

          {/* View Mode Switcher & Navigation Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View Switcher: Individual vs Grid */}
            <div className="inline-flex items-center p-1 bg-white rounded-lg border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('individual')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'individual'
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Mtu Mmoja Mmoja' : 'One by One'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Orodha ya Wote' : 'All Teachers'}</span>
              </button>
            </div>

            {/* Individual Stepper Controls */}
            {viewMode === 'individual' && (
              <div className="inline-flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
                {/* Optional Auto-Play Toggle (User Controlled) */}
                <button
                  type="button"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isAutoPlay
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={isAutoPlay ? 'Simamisha (Pause)' : 'Anza Mtiririko (Auto-Play)'}
                >
                  {isAutoPlay ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
                      <span className="hidden sm:inline">{language === 'sw' ? 'Simamisha' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                      <span className="hidden sm:inline">{language === 'sw' ? 'Mtiririko' : 'Auto'}</span>
                    </>
                  )}
                </button>

                <div className="h-4 w-px bg-slate-200" />

                {/* Previous Teacher */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Mwalimu Aliyetangulia"
                  aria-label="Previous Teacher"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Counter */}
                <span className="text-xs font-mono font-bold text-slate-700 px-1.5">
                  {currentIndex + 1} / {teachers.length}
                </span>

                {/* Next Teacher */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Mwalimu Anayefuata"
                  aria-label="Next Teacher"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================================
            MODE 1: INDIVIDUAL SPOTLIGHT (STABLE & CLEAN)
            - Picha ya Mwalimu
            - Jina Tu la Mwalimu (No bio, no qualifications, no department)
            - Mawasiliano Pekee (WhatsApp, Piga Simu, SMS, Email)
            ===================================================================== */}
        {viewMode === 'individual' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#102A43]/15 shadow-xl overflow-hidden max-w-4xl mx-auto transition-all duration-300">
              <div className="p-6 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[380px]">
                
                {/* 1. Picha ya Mwalimu Pekee (Stable frame, no layout shifting) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 border border-[#102A43]/15 shadow-md">
                    <img
                      key={currentTeacher.imageUrl}
                      src={currentTeacher.imageUrl}
                      alt={currentTeacher.name}
                      className="w-full h-full object-cover object-top transition-opacity duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                </div>

                {/* 2. Jina Tu na Mawasiliano Pekee */}
                <div className="md:col-span-7 flex flex-col justify-center space-y-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest">
                      {language === 'sw' ? `Mwalimu #${currentIndex + 1}` : `Teacher #${currentIndex + 1}`}
                    </span>
                    {/* Jina Tu la Mwalimu */}
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-snug mt-1">
                      {currentTeacher.name}
                    </h3>
                  </div>

                  {/* 3. Mawasiliano Pekee */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {language === 'sw' ? 'Mawasiliano ya Moja kwa Moja:' : 'Direct Contact Options:'}
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/${currentCleanPhoneDigits}?text=${whatsappGreeting}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="liquid-btn liquid-btn-emerald py-3.5 px-3 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md"
                        title={`WhatsApp: ${currentTeacher.name}`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <WhatsAppIcon className="w-4 h-4 shrink-0" />
                          <span>WhatsApp</span>
                        </span>
                      </a>

                      {/* Piga Simu Button */}
                      <a
                        href={`tel:${currentCleanPhoneTel}`}
                        className="liquid-btn liquid-btn-navy py-3.5 px-3 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md"
                        title={`Piga Simu: ${currentTeacher.name}`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{language === 'sw' ? 'Piga Simu' : 'Call'}</span>
                        </span>
                      </a>

                      {/* SMS Button */}
                      <a
                        href={`sms:${currentCleanPhoneTel}?body=${smsGreeting}`}
                        className="liquid-btn liquid-btn-pearl py-3.5 px-3 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md border border-slate-200"
                        title={`Tuma Ujumbe (SMS): ${currentTeacher.name}`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#102A43] shrink-0" />
                          <span>SMS</span>
                        </span>
                      </a>

                      {/* Email Button */}
                      <a
                        href={`mailto:${currentTeacherEmail}?subject=${emailSubject}`}
                        className="liquid-btn liquid-btn-pearl py-3.5 px-3 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md border border-slate-200"
                        title={`Barua Pepe: ${currentTeacherEmail}`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Email</span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selector Bar ya Walimu (Picha ndogo na Jina Tu - Stable local container scroll) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    {language === 'sw'
                      ? 'Chagua mwalimu kumtazama (Mtu Mmoja Mmoja):'
                      : 'Select any teacher (One by One):'}
                  </span>
                </span>
                <span className="font-mono font-bold text-slate-500">
                  {teachers.length} {language === 'sw' ? 'Walimu' : 'Teachers'}
                </span>
              </div>

              <div
                ref={thumbScrollRef}
                className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none pt-1"
              >
                {teachers.map((tch, idx) => {
                  const isSelected = idx === currentIndex;
                  return (
                    <button
                      key={tch.id}
                      type="button"
                      onClick={() => handleSelectTeacher(idx)}
                      className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border ${
                        isSelected
                          ? 'bg-[#102A43] text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-white/50">
                        <img
                          src={tch.imageUrl}
                          alt={tch.name}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                      <span className={`text-xs font-bold truncate max-w-[140px] ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {tch.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* =====================================================================
              MODE 2: ORODHA YA WOTE (GRID - STABLE)
              - Picha ya Mwalimu
              - Jina Tu
              - Mawasiliano Pekee
              ===================================================================== */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teachers.map((teacher, idx) => {
              const cleanPhoneDigits = getCleanPhoneDigits(teacher.phone);
              const cleanPhoneTel = getCleanPhoneTel(teacher.phone);
              const email = teacher.email || 'info@uomboniss.ac.tz';

              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-2xl border border-[#102A43]/15 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Picha ya Mwalimu */}
                  <div className="aspect-4/3 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={teacher.imageUrl}
                      alt={teacher.name}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSelectTeacher(idx)}
                      className="absolute top-2 right-2 bg-[#102A43]/85 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs hover:bg-[#102A43] transition-colors cursor-pointer"
                    >
                      {language === 'sw' ? 'Tazama' : 'View'}
                    </button>
                  </div>

                  {/* Jina Tu na Mawasiliano Pekee */}
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                    <div>
                      <h3
                        onClick={() => handleSelectTeacher(idx)}
                        className="font-bold text-base text-[#102A43] hover:text-amber-800 transition-colors leading-snug cursor-pointer"
                      >
                        {teacher.name}
                      </h3>
                    </div>

                    {/* Mawasiliano Pekee */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`https://wa.me/${cleanPhoneDigits}?text=${whatsappGreeting}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="liquid-btn liquid-btn-emerald py-2 px-2 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          title={`WhatsApp: ${teacher.name}`}
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${cleanPhoneTel}`}
                          className="liquid-btn liquid-btn-navy py-2 px-2 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          title={`Piga Simu: ${teacher.name}`}
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{language === 'sw' ? 'Piga' : 'Call'}</span>
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`sms:${cleanPhoneTel}?body=${smsGreeting}`}
                          className="liquid-btn liquid-btn-pearl py-1.5 px-2 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                          title={`SMS: ${teacher.name}`}
                        >
                          <MessageSquare className="w-3 h-3 text-[#102A43] shrink-0" />
                          <span>SMS</span>
                        </a>

                        <a
                          href={`mailto:${email}?subject=${emailSubject}`}
                          className="liquid-btn liquid-btn-pearl py-1.5 px-2 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                          title={`Email: ${email}`}
                        >
                          <Mail className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
