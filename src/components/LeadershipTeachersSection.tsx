import React, { useState, useRef } from 'react';
import { SAVED_TEACHERS } from '../data/savedSchoolMedia';
import { useLanguage } from '../context/LanguageContext';
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
  GraduationCap
} from 'lucide-react';

// Official WhatsApp Brand Icon Component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.908.533 3.69 1.455 5.215L2.094 22l4.896-1.328a9.98 9.98 0 005.041 1.359h.005c5.534 0 10.029-4.495 10.029-10.031C22.065 6.495 17.568 2 12.031 2zm5.836 14.199c-.244.686-1.42 1.328-1.956 1.365-.506.035-1.164.05-3.376-.867-2.607-1.082-4.275-3.722-4.406-3.896-.13-.173-1.055-1.405-1.055-2.68 0-1.275.666-1.904.903-2.164.237-.26.518-.325.69-.325.174 0 .348.002.5.01.162.008.378-.061.591.45.22.527.75 1.83.816 1.963.065.133.109.289.022.463-.087.174-.13.283-.26.435-.13.152-.272.339-.389.455-.13.13-.266.272-.114.533.152.261.674 1.111 1.446 1.799.994.886 1.832 1.16 2.093 1.29.261.13.413.109.565-.065.152-.174.652-.761.826-1.022.174-.261.348-.217.587-.13.239.087 1.522.717 1.783.848.261.13.435.196.5.304.065.109.065.631-.179 1.317z" />
  </svg>
);

export const LeadershipTeachersSection: React.FC = () => {
  const { language } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const teachers: Teacher[] = SAVED_TEACHERS;

  // Clean phone number utilities
  const getCleanPhoneDigits = (phone?: string) => {
    if (!phone) return '255782558127';
    return phone.replace(/[^\d]/g, '');
  };

  const getCleanPhoneTel = (phone?: string) => {
    if (!phone) return '+255782558127';
    return phone.replace(/\s+/g, '');
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  /**
   * Teacher Card Component:
   * Contains ONLY:
   * 1. Teacher Photograph (Picha)
   * 2. Teacher Name and Role/Subject
   * 3. The 4 Contact Action Buttons: WhatsApp, Piga (Call), Message (SMS), and Email.
   * No other buttons or links are shown ("basi zingine zisionekane").
   */
  const renderTeacherCard = (teacher: Teacher, keySuffix = '') => {
    const cleanPhoneDigits = getCleanPhoneDigits(teacher.phone);
    const cleanPhoneTel = getCleanPhoneTel(teacher.phone);
    const teacherEmail = teacher.email || 'info@uomboniss.ac.tz';
    const whatsappGreeting = encodeURIComponent(
      language === 'sw'
        ? `Habari ${teacher.name}, ninawasiliana nawe kutoka Tovuti Rasmi ya Shule ya Sekondari Uomboni.`
        : `Hello ${teacher.name}, contacting you from Uomboni Secondary School official website.`
    );
    const smsGreeting = encodeURIComponent(
      language === 'sw'
        ? `Habari ${teacher.name}, nina ujumbe kutoka tovuti ya Uomboni.`
        : `Hello ${teacher.name}, message from Uomboni school website.`
    );
    const emailSubject = encodeURIComponent(
      `Mawasiliano na ${teacher.name} - Shule ya Sekondari Uomboni`
    );

    const teacherRoleDisplay = language === 'sw' 
      ? teacher.roleSw || teacher.role 
      : teacher.roleEn || teacher.role;

    return (
      <div
        key={`${teacher.id}${keySuffix}`}
        className="w-[280px] sm:w-[310px] shrink-0 bg-white rounded-2xl border border-[#102A43]/15 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between group"
      >
        {/* 1. Picha ya Mwalimu (Teacher Photograph) */}
        <div className="aspect-4/3 w-full overflow-hidden bg-slate-100 relative">
          <img
            src={teacher.imageUrl}
            alt={teacher.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* 2. Jina la Mwalimu na Cheo / Masomo (Anti-slop: clean unboxed typography) */}
        <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-bold text-base text-[#102A43] group-hover:text-amber-800 transition-colors leading-snug">
              {teacher.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
              {teacherRoleDisplay}
            </p>
          </div>

          {/* 3. Vifungo 4 Rasmi vya Mawasiliano: WhatsApp, Piga, Message na Email pekee ("basi zingine zisionekane") */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {/* Mstari wa Kwanza: WhatsApp na Piga Simu */}
            <div className="grid grid-cols-2 gap-2">
              {/* Button ya WhatsApp */}
              <a
                href={`https://wa.me/${cleanPhoneDigits}?text=${whatsappGreeting}`}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-btn liquid-btn-emerald py-2.5 px-3 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                title={`WhatsApp: ${teacher.name}`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>WhatsApp</span>
                </span>
              </a>

              {/* Button ya Kupiga Simu (Mtu akitaka kupiga anabonyeza batton ya kupiga) */}
              <a
                href={`tel:${cleanPhoneTel}`}
                className="liquid-btn liquid-btn-navy py-2.5 px-3 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                title={`Piga Simu: ${teacher.name} (${teacher.phone || 'Piga'})`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{language === 'sw' ? 'Piga' : 'Call'}</span>
                </span>
              </a>
            </div>

            {/* Mstari wa Pili: Message (SMS) na Email */}
            <div className="grid grid-cols-2 gap-2">
              {/* Button ya Message (Mtu akitaka message anabonyeza hapa) */}
              <a
                href={`sms:${cleanPhoneTel}?body=${smsGreeting}`}
                className="liquid-btn liquid-btn-pearl py-2 px-2.5 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                title={`Tuma Ujumbe (SMS): ${teacher.name}`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#102A43] shrink-0" />
                  <span>Message</span>
                </span>
              </a>

              {/* Button ya Email */}
              <a
                href={`mailto:${teacherEmail}?subject=${emailSubject}`}
                className="liquid-btn liquid-btn-pearl py-2 px-2.5 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                title={`Tuma Barua Pepe (Email): ${teacherEmail}`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Email</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="teachers" className="py-10 sm:py-14 bg-[#FFFFF0] border-b border-[#102A43]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header with Clearswahili Copy & Flow Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#102A43]/10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black tracking-wider uppercase border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'sw' ? 'WALIMU & UONGOZI WA TAALUMA' : 'FACULTY & ACADEMIC STAFF'}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
              {language === 'sw' ? 'Walimu Wetu wa Uomboni' : 'Meet Our Teachers'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {language === 'sw'
                ? 'Walimu wenye weledi na malezi thabiti. Bonyeza kitufe cha WhatsApp, Piga, Message au Email kuwasiliana na mwalimu yeyote moja kwa moja.'
                : 'Dedicated and qualified educators. Tap WhatsApp, Call, Message, or Email to connect directly with any teacher.'}
            </p>
          </div>

          {/* Interactive Navigation & Flow Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Flow Pause / Play & Manual Nudge Arrows */}
            <div className="inline-flex items-center gap-1.5 bg-white/80 p-1.5 rounded-full border border-slate-300 shadow-xs backdrop-blur-xs">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="liquid-btn liquid-btn-pearl px-3.5 py-1.5 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title={isPaused ? 'Endelea kutiririka' : 'Sitisha mtiririko'}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                      <span>{language === 'sw' ? 'Endelea' : 'Play'}</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                      <span>{language === 'sw' ? 'Sitisha' : 'Pause'}</span>
                    </>
                  )}
                </span>
              </button>

              <div className="h-4 w-px bg-slate-200 mx-0.5" />

              <button
                onClick={() => handleManualScroll('left')}
                className="liquid-btn liquid-btn-pearl p-2 text-slate-700 cursor-pointer"
                title="Sogeza Kushoto"
                aria-label="Sogeza Kushoto"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4" />
                </span>
              </button>

              <button
                onClick={() => handleManualScroll('right')}
                className="liquid-btn liquid-btn-pearl p-2 text-slate-700 cursor-pointer"
                title="Sogeza Kulia"
                aria-label="Sogeza Kulia"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ANIMATED FLOW KUTOKA KULIA KWENDA KUSHOTO (SEHEMU MOJA RASMI)
            Walimu wote wapo sehemu moja katika mtiririko usio na mwisho kutoka kulia kwenda kushoto.
            ========================================================================= */}
        <div className="relative w-full overflow-hidden py-4">
          {/* Left Fade Gradient Mask */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-[#FFFFF0] via-[#FFFFF0]/80 to-transparent z-20 pointer-events-none" />
          {/* Right Fade Gradient Mask */}
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-[#FFFFF0] via-[#FFFFF0]/80 to-transparent z-20 pointer-events-none" />

          {/* The Infinite Animated Flowing Track (Moves from Right to Left Seamlessly) */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-none py-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div className="flex gap-6 shrink-0 w-max">
              {/* Set A: Moving Right-to-Left */}
              <div
                className={`flex gap-6 shrink-0 animate-teachers-flow ${
                  isPaused ? 'paused' : ''
                }`}
              >
                {teachers.map((teacher) => renderTeacherCard(teacher, '-a'))}
              </div>

              {/* Set B (Duplicate for 100% gapless continuous infinite loop) */}
              <div
                className={`flex gap-6 shrink-0 animate-teachers-flow ${
                  isPaused ? 'paused' : ''
                }`}
                aria-hidden="true"
              >
                {teachers.map((teacher) => renderTeacherCard(teacher, '-b'))}
              </div>
            </div>
          </div>

          {/* Quick Flow Guide & Indicator */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {language === 'sw'
                  ? 'Mtiririko wa moja kwa moja kutoka kulia kwenda kushoto (Weka kidole au kipanya juu kusimamisha)'
                  : 'Continuous animated right-to-left flow (Touch or hover to pause and tap actions)'}
              </span>
            </span>
            <span className="font-mono text-slate-600 font-bold hidden sm:inline">
              {teachers.length} {language === 'sw' ? 'Walimu Rasmi' : 'Official Faculty'}
            </span>
          </div>
        </div>

        {/* Footer Commitment Note */}
        <div className="p-4 rounded-2xl bg-white border border-[#102A43]/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              {language === 'sw'
                ? 'Walimu wa Uomboni wapo tayari kutoa ushauri wa kitaaluma, malezi, na maendeleo ya mwanafunzi wakati wote kupitia WhatsApp, simu, SMS au Email.'
                : 'Uomboni faculty are available to provide continuous academic guidance, moral mentorship, and student progress monitoring via WhatsApp, phone, SMS, or Email.'}
            </span>
          </div>

          <span className="text-[11px] font-mono font-bold text-[#102A43] shrink-0">
            NECTA S0486 • MARANGU
          </span>
        </div>
      </div>
    </section>
  );
};
