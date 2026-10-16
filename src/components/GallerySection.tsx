import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { SAVED_GALLERY } from '../data/savedSchoolMedia';
import {
  Camera,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Sparkles,
  Calendar,
  Grid3X3,
  Film,
  ZoomIn,
} from 'lucide-react';

export const GallerySection: React.FC = () => {
  const { language } = useLanguage();
  const { galleryPhotos } = useData();

  // Combine photos from context and saved fallbacks
  const photos = useMemo(() => {
    if (Array.isArray(galleryPhotos) && galleryPhotos.length > 0) {
      return galleryPhotos;
    }
    return SAVED_GALLERY;
  }, [galleryPhotos]);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const [isHeroPaused, setIsHeroPaused] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
  const [lightboxPlaying, setLightboxPlaying] = useState<boolean>(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'ALL') return photos;
    return photos.filter((p) => p.category === activeCategory);
  }, [photos, activeCategory]);

  // Auto-advance hero carousel
  useEffect(() => {
    if (!isAutoPlaying || isHeroPaused || photos.length <= 1) return;
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % photos.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHeroPaused, photos.length]);

  // Auto-advance modal lightbox if active
  useEffect(() => {
    if (!lightboxPlaying || selectedPhotoIndex === null || filteredPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedPhotoIndex((prev) =>
        prev === null ? 0 : (prev + 1) % filteredPhotos.length
      );
    }, 3500);
    return () => clearInterval(interval);
  }, [lightboxPlaying, selectedPhotoIndex, filteredPhotos.length]);

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
        setLightboxPlaying(false);
      } else if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) =>
          prev === null ? 0 : (prev + 1) % filteredPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) =>
          prev === null
            ? 0
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    },
    [selectedPhotoIndex, filteredPhotos.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const activePhoto =
    selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  const heroPhoto = photos[heroSlideIndex] || photos[0];

  return (
    <section
      id="gallery"
      className="py-16 sm:py-24 bg-[#FFFFF0] border-t border-b border-[#102A43]/10 relative overflow-hidden"
    >
      {/* Decorative ambient background lights */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#102A43]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#102A43]/15">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102A43]/10 text-[#102A43] text-xs font-bold tracking-wider uppercase border border-[#102A43]/15">
              <Camera className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>{language === 'sw' ? 'Matunzio ya Shule' : 'Campus Photo Gallery'}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight">
              {language === 'sw' ? 'Maisha ya Shule kwa Picha' : 'Life at Uomboni in Pictures'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl">
              {language === 'sw'
                ? 'Tazama picha halisi za mazingira ya shule, maabara za sayansi, masomo ya vitendo, michezo, na matukio ya kikanisa mlimani Kilimanjaro, Marangu Magharibi.'
                : 'Explore authentic high-resolution photography showcasing our learning environment, science labs, classroom study, sports, and church celebrations in Marangu.'}
            </p>
          </div>

          {/* View Mode & Slideshow Toggle Controls */}
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#102A43]'
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Picha Zote' : 'Grid'}</span>
              </button>

              <button
                onClick={() => setViewMode('slideshow')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'slideshow'
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#102A43]'
                }`}
                title="Slideshow View"
              >
                <Film className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Onyesho (Slider)' : 'Slideshow'}</span>
              </button>
            </div>

            <button
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#102A43] hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title={isAutoPlaying ? 'Sitisha uhuishaji (Pause)' : 'Cheza uhuishaji (Play)'}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* FEATURED ANIMATED HERO SLIDER (Shown in slideshow view or top feature) */}
        {viewMode === 'slideshow' && heroPhoto && (
          <div
            className="mt-8 relative rounded-3xl overflow-hidden shadow-xl border border-[#102A43]/15 bg-slate-950 text-white transition-all duration-700 animate-in fade-in zoom-in-98"
            onMouseEnter={() => setIsHeroPaused(true)}
            onMouseLeave={() => setIsHeroPaused(false)}
          >
            {/* Background image with subtle zoom animation */}
            <div className="relative h-[380px] sm:h-[480px] lg:h-[520px] w-full overflow-hidden">
              <img
                key={heroPhoto.id}
                src={heroPhoto.imageUrl}
                alt={language === 'sw' ? heroPhoto.titleSw : heroPhoto.titleEn}
                className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out hover:scale-105 animate-in fade-in"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>

            {/* Slider Navigation Controls */}
            <button
              onClick={() =>
                setHeroSlideIndex((prev) => (prev - 1 + photos.length) % photos.length)
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/70 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-md group"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() =>
                setHeroSlideIndex((prev) => (prev + 1) % photos.length)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/70 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-md group"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Slide Details Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#C9A227] text-slate-950 text-[11px] font-black uppercase tracking-wider">
                    {heroPhoto.category}
                  </span>
                  <span className="text-xs text-white/80 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    {heroPhoto.date}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {language === 'sw' ? heroPhoto.titleSw : heroPhoto.titleEn}
                </h3>
                {(heroPhoto.descriptionSw || heroPhoto.descriptionEn) && (
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                    {language === 'sw'
                      ? heroPhoto.descriptionSw
                      : heroPhoto.descriptionEn}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedPhotoIndex(heroSlideIndex)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4 text-slate-950" />
                  <span>{language === 'sw' ? 'Fungua Kubwa (HD)' : 'View Fullscreen'}</span>
                </button>
              </div>
            </div>

            {/* Animated Progress Bar */}
            {isAutoPlaying && !isHeroPaused && (
              <div className="absolute top-0 inset-x-0 h-1 bg-white/20">
                <div
                  key={heroSlideIndex}
                  className="h-full bg-gradient-to-r from-amber-400 to-[#C9A227] animate-[progress_4.5s_linear]"
                  style={{ animation: 'progressBar 4.5s linear infinite' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Category Filter Tabs with Animated Active Indicator */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const count =
              cat === 'ALL'
                ? photos.length
                : photos.filter((p) => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                  isActive
                    ? 'bg-[#102A43] text-white border-[#102A43] shadow-sm ring-2 ring-[#C9A227]/40 scale-102'
                    : 'bg-white text-slate-700 hover:text-[#102A43] hover:bg-slate-50 border-slate-200'
                }`}
              >
                <span>
                  {cat === 'ALL'
                    ? language === 'sw'
                      ? 'Picha Zote'
                      : 'All Photos'
                    : cat}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive
                      ? 'bg-[#C9A227] text-slate-950 font-black'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* PHOTO GRID WITH SMOOTH HOVER & ENTRANCE ANIMATIONS */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPhotos.map((photo, index) => {
            const title = language === 'sw' ? photo.titleSw : photo.titleEn;

            return (
              <div
                key={photo.id}
                onClick={() => setSelectedPhotoIndex(index)}
                className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Photo container with zoom on hover */}
                <div className="aspect-4/3 overflow-hidden bg-slate-900 relative">
                  <img
                    src={photo.imageUrl}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                  />

                  {/* Animated Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <span className="p-3 rounded-full bg-white/90 text-slate-950 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                      <ZoomIn className="w-5 h-5 text-[#102A43]" />
                    </span>
                  </div>

                  {/* Category Pill Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-[#102A43]/85 text-[#FFFFF0] text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs border border-white/10 shadow-xs">
                      {photo.category}
                    </span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-4 bg-white space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#102A43] group-hover:text-amber-700 transition-colors leading-snug line-clamp-2">
                      {title}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Calendar className="w-3 h-3 text-[#C9A227]" />
                      {photo.date || '2026'}
                    </span>
                    <span className="text-[#102A43] font-bold text-[11px] group-hover:underline flex items-center gap-1">
                      <span>{language === 'sw' ? 'Tazama' : 'View'}</span>
                      <Eye className="w-3 h-3 text-[#C9A227]" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* LIGHTBOX MODAL PREVIEW (With Animations & Thumbnails) */}
        {activePhoto && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
            onClick={() => {
              setSelectedPhotoIndex(null);
              setLightboxPlaying(false);
            }}
          >
            <div
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Top Header Bar */}
              <div className="p-4 sm:px-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#C9A227] text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    {activePhoto.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    {selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : 1} / {filteredPhotos.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLightboxPlaying((p) => !p)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 cursor-pointer"
                    title="Toggle Lightbox Auto-Slideshow"
                  >
                    {lightboxPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Slideshow</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPhotoIndex(null);
                      setLightboxPlaying(false);
                    }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title="Funga (Close)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Photo Display Area */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[460px]">
                <img
                  key={activePhoto.id}
                  src={activePhoto.imageUrl}
                  alt={language === 'sw' ? activePhoto.titleSw : activePhoto.titleEn}
                  className="max-h-[65vh] w-auto max-w-full object-contain mx-auto animate-in fade-in duration-300"
                />

                {/* Left & Right navigation buttons */}
                <button
                  onClick={() =>
                    setSelectedPhotoIndex(
                      (prev) =>
                        prev === null
                          ? 0
                          : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-lg"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() =>
                    setSelectedPhotoIndex(
                      (prev) =>
                        prev === null ? 0 : (prev + 1) % filteredPhotos.length
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 shadow-lg"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Photo Title & Description Bar */}
              <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 text-white">
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {language === 'sw' ? activePhoto.titleSw : activePhoto.titleEn}
                </h3>
                {(activePhoto.descriptionSw || activePhoto.descriptionEn) && (
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {language === 'sw'
                      ? activePhoto.descriptionSw
                      : activePhoto.descriptionEn}
                  </p>
                )}

                {/* Bottom thumbnail strip for direct jumping */}
                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {filteredPhotos.map((thumb, idx) => (
                    <button
                      key={thumb.id}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedPhotoIndex === idx
                          ? 'border-amber-400 scale-105 ring-2 ring-amber-400/50'
                          : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={thumb.imageUrl}
                        alt="thumb"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
