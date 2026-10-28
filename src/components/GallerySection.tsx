import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { SAVED_GALLERY } from '../data/savedSchoolMedia';
import { SchoolVideo } from '../types';
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
} from '../utils/youtubeHelper';
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
  Video,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import { ResponsiveGalleryGrid } from './ResponsiveGalleryGrid';

export const GallerySection: React.FC = () => {
  const { language } = useLanguage();
  const { galleryPhotos, schoolVideos } = useData();

  const [mediaMode, setMediaMode] = useState<'photos' | 'videos'>('photos');
  const [selectedVideo, setSelectedVideo] = useState<SchoolVideo | null>(null);

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#102A43]/10 text-[#102A43] text-xs font-bold tracking-wider uppercase border border-[#102A43]/15">
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
            {mediaMode === 'photos' && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Media Switcher: Photos vs YouTube Videos */}
        <div className="flex items-center justify-center my-6 px-2">
          <div className="inline-flex flex-wrap items-center justify-center p-1 sm:p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm gap-1.5 sm:gap-2 max-w-full">
            <button
              onClick={() => setMediaMode('photos')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mediaMode === 'photos'
                  ? 'bg-[#102A43] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#102A43]'
              }`}
            >
              <Camera className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>{language === 'sw' ? '📸 Matunzio ya Picha' : '📸 Photos'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${mediaMode === 'photos' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {photos.length}
              </span>
            </button>

            <button
              onClick={() => setMediaMode('videos')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mediaMode === 'videos'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-red-600'
              }`}
            >
              <Video className="w-4 h-4 text-white shrink-0" />
              <span>{language === 'sw' ? '🎥 Video za Shule (YouTube & Drive)' : '🎥 School Videos'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${mediaMode === 'videos' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-700'}`}>
                {schoolVideos.length}
              </span>
            </button>
          </div>
        </div>

        {/* VIDEOS VIEW (YOUTUBE & GOOGLE DRIVE) */}
        {mediaMode === 'videos' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Official YouTube Channel & Facebook Banner */}
            <div className="bg-gradient-to-r from-red-600 via-rose-700 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6 text-red-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      Official YouTube Channel
                    </span>
                    <span className="text-xs text-red-200 font-mono">@uombonisecondaryschool</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    {language === 'sw' ? 'Channel Rasmi ya Video ya Shule ya Sekondari Uomboni' : 'Uomboni Secondary School Official YouTube Channel'}
                  </h4>
                  <p className="text-xs text-white/80 mt-0.5">
                    {language === 'sw' ? 'Tazama video kamili za mahafali, matukio ya Kikanisa, vipindi vya maabara na michezo.' : 'Watch full graduation videos, church services, science practicals, and sports.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                <a
                  href="https://www.youtube.com/@uombonisecondaryschool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:scale-105"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Fungua YouTube' : 'Open YouTube'}</span>
                </a>
                <a
                  href="https://web.facebook.com/profile.php?id=61596072835470"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:scale-105"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
            {schoolVideos.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-base">Hakuna video zilizowekwa bado</h4>
                <p className="text-xs text-slate-500 mt-1">Uongozi wa shule utachapisha video za matukio hivi karibuni kupitia YouTube au Google Drive.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schoolVideos.map((video) => {
                  const isDrive = video.videoSource === 'drive' || Boolean(video.driveFileId);
                  const thumb = video.thumbnailUrl || 
                    (isDrive && video.driveFileId 
                      ? `https://drive.google.com/thumbnail?id=${video.driveFileId}&sz=w600`
                      : getYouTubeThumbnail(video.youtubeId, 'hq'));
                  const externalUrl = isDrive 
                    ? (video.videoUrl || `https://drive.google.com/file/d/${video.driveFileId}/view?usp=sharing`)
                    : (video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`);

                  return (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={video.titleSw}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-slate-400">
                            {isDrive ? <FolderOpen className="w-12 h-12 text-blue-400 opacity-60" /> : <Video className="w-12 h-12 text-red-500 opacity-60" />}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${isDrive ? 'bg-blue-600' : 'bg-red-600'} text-white flex items-center justify-center shadow-xl group-hover:scale-115 transition-transform`}>
                            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                          </div>
                        </div>

                        {video.duration && (
                          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/85 text-white text-[10px] font-bold rounded-md">
                            {video.duration}
                          </span>
                        )}

                        {video.featured && (
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            <span>TEULE</span>
                          </span>
                        )}

                        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-xs ${isDrive ? 'bg-blue-600' : 'bg-red-600'}`}>
                          {isDrive ? 'Google Drive' : 'YouTube'}
                        </span>
                      </div>

                      {/* Video Info */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {video.category}
                            </span>
                            {video.date && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {video.date}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm sm:text-base text-[#102A43] group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                            {language === 'sw' ? video.titleSw : (video.titleEn || video.titleSw)}
                          </h4>
                          {(video.descriptionSw || video.descriptionEn) && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                              {language === 'sw' ? video.descriptionSw : (video.descriptionEn || video.descriptionSw)}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className={`font-bold ${isDrive ? 'text-blue-600' : 'text-red-600'} flex items-center gap-1`}>
                            <Play className={`w-3.5 h-3.5 ${isDrive ? 'fill-blue-600' : 'fill-red-600'}`} />
                            <span>{language === 'sw' ? 'Cheza Video' : 'Play Video'}</span>
                          </span>
                          <a
                            href={externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px]"
                          >
                            <span>{isDrive ? 'Google Drive' : 'YouTube'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
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

        {/* RESPONSIVE CSS GRID COMPONENT FOR PHOTO GALLERY */}
        <div className="mt-8">
          <ResponsiveGalleryGrid
            photos={filteredPhotos}
            language={language}
            onSelectPhoto={(_, index) => setSelectedPhotoIndex(index)}
          />
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
      </>
    )}

    {/* VIDEO PLAYER MODAL (YOUTUBE & GOOGLE DRIVE) */}
    {selectedVideo && (() => {
      const isSelectedDrive = selectedVideo.videoSource === 'drive' || Boolean(selectedVideo.driveFileId);
      const embedSource = isSelectedDrive
        ? (selectedVideo.embedUrl || (selectedVideo.driveFileId ? `https://drive.google.com/file/d/${selectedVideo.driveFileId}/preview` : ''))
        : getYouTubeEmbedUrl(selectedVideo.youtubeId, { autoplay: true });
      const externalUrl = isSelectedDrive
        ? (selectedVideo.videoUrl || `https://drive.google.com/file/d/${selectedVideo.driveFileId}/view?usp=sharing`)
        : (selectedVideo.youtubeUrl || `https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`);

      return (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-slate-950 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Modal Header */}
            <div className="p-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-8 h-8 rounded-lg ${isSelectedDrive ? 'bg-blue-600/20 text-blue-400' : 'bg-red-600/20 text-red-500'} flex items-center justify-center shrink-0`}>
                  {isSelectedDrive ? <FolderOpen className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                    {language === 'sw' ? selectedVideo.titleSw : (selectedVideo.titleEn || selectedVideo.titleSw)}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="text-amber-400 font-semibold">{selectedVideo.category}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isSelectedDrive ? 'bg-blue-900/50 text-blue-300' : 'bg-red-900/50 text-red-300'}`}>
                      {isSelectedDrive ? 'Google Drive' : 'YouTube'}
                    </span>
                    {selectedVideo.date && <span>• {selectedVideo.date}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={isSelectedDrive ? 'Fungua moja kwa moja Google Drive' : 'Fungua YouTube'}
                >
                  <span className="hidden sm:inline">{isSelectedDrive ? 'Drive' : 'YouTube'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Funga"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Player */}
            <div className="aspect-video w-full bg-black">
              {embedSource ? (
                <iframe
                  src={embedSource}
                  title={selectedVideo.titleSw}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                  <p>Haikuweza kupakia video moja kwa moja.</p>
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    Fungua Video
                  </a>
                </div>
              )}
            </div>

            {/* Video Footer */}
            {(selectedVideo.descriptionSw || selectedVideo.descriptionEn) && (
              <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 text-slate-300 text-xs leading-relaxed">
                <p>
                  {language === 'sw'
                    ? selectedVideo.descriptionSw
                    : (selectedVideo.descriptionEn || selectedVideo.descriptionSw)}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    })()}
  </div>
</section>
);
};
