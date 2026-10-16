import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  Calendar,
  User,
  Tag,
  Languages,
  X,
  ExternalLink,
  Flame,
  Volume2,
  Radio,
  Clock,
  Eye
} from 'lucide-react';
import { NewsItem } from '../types';

interface LiveNewsCardProps {
  onNavigate?: (sectionId: string) => void;
}

export const LiveNewsCard: React.FC<LiveNewsCardProps> = ({ onNavigate }) => {
  const { language, setLanguage } = useLanguage();
  const { news, alerts } = useData();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<NewsItem | null>(null);
  const [cardLangOverride, setCardLangOverride] = useState<'sw' | 'en' | null>(null);

  // Active language for this card (defaults to global language unless overridden locally)
  const activeLang = cardLangOverride || language;

  // Use dynamic news from DataContext (fallback to alert if empty)
  const newsList = news && news.length > 0 ? news : [
    {
      id: 'fallback-1',
      titleSw: 'Nafasi za Kidato cha Kwanza (2026) na Uhamisho Ziko Wazi Shule ya Sekondari Uomboni',
      titleEn: 'Form 1 (2026) Admissions and Transfers Now Open at Uomboni Secondary School',
      excerptSw: 'Uongozi wa Shule ya Sekondari Uomboni unakaribisha maombi ya udahili kwa wanafunzi wa bweni na kutwa.',
      excerptEn: 'Uomboni Secondary School management invites applications for boarding and day scholars.',
      contentSw: 'Uongozi wa Shule ya Sekondari Uomboni unakaribisha maombi ya udahili kwa wanafunzi wa bweni na kutwa kwa mwaka wa masomo 2026. Fomu za kujiunga zinapatikana mtandaoni au ofisini shuleni.',
      contentEn: 'The management of Uomboni Secondary School welcomes admission applications for boarding and day students for the 2026 academic year. Joining instructions are available online or at the school office.',
      category: 'Matangazo' as const,
      date: '2026-08-15',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      featured: true,
      author: 'Ofisi ya Mkuu wa Shule'
    }
  ];

  // Auto-slide effect with smooth fade-in / fade-out transitions
  useEffect(() => {
    if (isPaused || newsList.length <= 1) return;

    const interval = setInterval(() => {
      // Trigger fade out before switching
      setFadeState('out');
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % newsList.length);
        setFadeState('in');
      }, 350);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused, newsList.length]);

  const handleNext = () => {
    setFadeState('out');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % newsList.length);
      setFadeState('in');
    }, 200);
  };

  const handlePrev = () => {
    setFadeState('out');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + newsList.length) % newsList.length);
      setFadeState('in');
    }, 200);
  };

  const currentNews = newsList[currentIndex] || newsList[0];

  const toggleLanguage = () => {
    const nextLang = activeLang === 'sw' ? 'en' : 'sw';
    setCardLangOverride(nextLang);
  };

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-8">
      
      {/* 1. HORIZONTAL MARQUEE LIVE TICKER BAR */}
      <div className="bg-[#0b2545] text-white rounded-t-xl border-t border-x border-blue-900 px-3 sm:px-4 py-2 shadow-sm flex items-center gap-3 overflow-hidden">
        {/* Dignified Live Indicator */}
        <div className="flex items-center gap-1.5 shrink-0 bg-blue-800 text-white px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-blue-600">
          <Radio className="w-3.5 h-3.5" />
          <span>{activeLang === 'sw' ? 'TAARIFA MPYA' : 'LATEST NEWS'}</span>
        </div>

        {/* Continuous Horizontal Marquee Bar */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee flex items-center gap-8 text-xs sm:text-sm font-medium text-slate-200 hover:cursor-pointer">
            {newsList.map((item, idx) => (
              <span
                key={`marquee-${item.id}-${idx}`}
                onClick={() => setSelectedNewsDetail(item)}
                className="flex items-center gap-2 hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <strong className="text-amber-300 font-bold">[{item.category}]</strong>
                <span>{activeLang === 'sw' ? item.titleSw : item.titleEn}</span>
                <span className="text-[10px] text-slate-300 font-mono">({item.date})</span>
                <span className="text-blue-400 mx-2">•</span>
              </span>
            ))}
            {/* Duplicate for infinite marquee loop */}
            {newsList.map((item, idx) => (
              <span
                key={`marquee-dup-${item.id}-${idx}`}
                onClick={() => setSelectedNewsDetail(item)}
                className="flex items-center gap-2 hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <strong className="text-amber-300 font-bold">[{item.category}]</strong>
                <span>{activeLang === 'sw' ? item.titleSw : item.titleEn}</span>
                <span className="text-[10px] text-slate-300 font-mono">({item.date})</span>
                <span className="text-blue-400 mx-2">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Translation Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="shrink-0 px-2.5 py-1 rounded bg-[#07192f] hover:bg-blue-900 text-slate-200 hover:text-white font-bold text-[10px] sm:text-xs flex items-center gap-1.5 transition-all border border-blue-800 cursor-pointer"
          title="Tafsiri / Translate Card"
        >
          <Languages className="w-3 h-3 text-amber-400" />
          <span>{activeLang === 'sw' ? 'SW ➔ EN' : 'EN ➔ SW'}</span>
        </button>
      </div>

      {/* 2. NEWS HERO CARD */}
      <div className="bg-white rounded-b-xl border-b border-x border-slate-200 p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Col 1: Image Box */}
          <div className="lg:col-span-5 relative group overflow-hidden rounded-xl border border-slate-200">
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
              <img
                src={currentNews.imageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'}
                alt={activeLang === 'sw' ? currentNews.titleSw : currentNews.titleEn}
                className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
                  fadeState === 'in' ? 'opacity-100 scale-100' : 'opacity-40 scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07192f]/90 via-transparent to-transparent" />
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#0b2545]/90 text-white font-bold text-xs border border-blue-600/50 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span>{currentNews.category}</span>
                </span>
                {currentNews.featured && (
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px] uppercase">
                    Featured
                  </span>
                )}
              </div>

              {/* Date & Author on Image */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                <span className="flex items-center gap-1 font-mono text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {currentNews.date}
                </span>
                <span className="flex items-center gap-1 text-slate-200 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-300" />
                  {currentNews.author || 'Uongozi wa Shule'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Content Area */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            
            <div
              className={`transition-all duration-300 ease-in-out ${
                fadeState === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}
            >
              {/* Counter & Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#0b2545] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    Habari {currentIndex + 1} / {newsList.length}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Inabadilika kiotomatiki
                  </span>
                </div>

                <span className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <Languages className="w-3 h-3 text-blue-700" />
                  <span>{activeLang === 'sw' ? 'Kiswahili' : 'English'}</span>
                </span>
              </div>

              {/* Headline */}
              <h3
                onClick={() => setSelectedNewsDetail(currentNews)}
                className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 hover:text-blue-800 transition-colors cursor-pointer line-clamp-2 leading-snug"
              >
                {activeLang === 'sw' ? currentNews.titleSw : currentNews.titleEn}
              </h3>

              {/* Excerpt */}
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 sm:line-clamp-3 leading-relaxed mt-2 font-normal">
                {activeLang === 'sw'
                  ? currentNews.excerptSw || currentNews.contentSw
                  : currentNews.excerptEn || currentNews.contentEn}
              </p>
            </div>

            {/* Bottom Actions and Controls */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedNewsDetail(currentNews)}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-blue-500"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{activeLang === 'sw' ? 'Soma Habari Kamili' : 'Read Full Story'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('news')}
                    className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
                  >
                    <span>{activeLang === 'sw' ? 'Habari Zote →' : 'All News →'}</span>
                  </button>
                )}
              </div>

              {/* Carousel Controls (Prev / Next / Pause) */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                  title={isPaused ? 'Endelea (Play)' : 'Simamisha (Pause)'}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handlePrev}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                  title="Iliyopita"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-1 px-1">
                  {newsList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFadeState('out');
                        setTimeout(() => {
                          setCurrentIndex(idx);
                          setFadeState('in');
                        }, 200);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentIndex === idx
                          ? 'w-5 bg-[#0b2545]'
                          : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                  title="Inayofuata"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3. FULL NEWS DETAIL MODAL */}
      {selectedNewsDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs uppercase">
                  {selectedNewsDetail.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedNewsDetail.date}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1"
                >
                  <Languages className="w-3 h-3" />
                  <span>{activeLang === 'sw' ? 'English' : 'Kiswahili'}</span>
                </button>
                <button
                  onClick={() => setSelectedNewsDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {selectedNewsDetail.imageUrl && (
                <div className="rounded-2xl overflow-hidden max-h-64 w-full bg-slate-900">
                  <img
                    src={selectedNewsDetail.imageUrl}
                    alt={activeLang === 'sw' ? selectedNewsDetail.titleSw : selectedNewsDetail.titleEn}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {activeLang === 'sw' ? selectedNewsDetail.titleSw : selectedNewsDetail.titleEn}
              </h3>

              <div className="flex items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span>Mwandishi: <strong className="text-slate-800">{selectedNewsDetail.author || 'Uongozi wa Shule'}</strong></span>
                <span>•</span>
                <span>Tarehe: <strong className="text-slate-800">{selectedNewsDetail.date}</strong></span>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
                <p>
                  {activeLang === 'sw' ? selectedNewsDetail.contentSw : selectedNewsDetail.contentEn}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Shule ya Sekondari Uomboni • Marangu Magharibi
              </span>
              <button
                onClick={() => setSelectedNewsDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Funga
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
