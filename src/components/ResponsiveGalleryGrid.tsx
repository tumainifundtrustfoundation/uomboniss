import React, { useState } from 'react';
import { GalleryPhoto } from '../types';
import {
  Calendar,
  Eye,
  ZoomIn,
  Grid2X2,
  Grid3X3,
  Columns4,
  List,
  Sparkles,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

export type GalleryGridLayoutMode = 'adaptive' | 'compact' | 'comfortable' | 'editorial';

export interface ResponsiveGalleryGridProps {
  photos: GalleryPhoto[];
  language: 'sw' | 'en';
  onSelectPhoto: (photo: GalleryPhoto, index: number) => void;
  defaultLayoutMode?: GalleryGridLayoutMode;
  showLayoutControls?: boolean;
  className?: string;
}

interface GalleryCardProps {
  photo: GalleryPhoto;
  index: number;
  language: 'sw' | 'en';
  isFeatured?: boolean;
  layoutMode: GalleryGridLayoutMode;
  onSelect: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  photo,
  index,
  language,
  isFeatured = false,
  layoutMode,
  onSelect,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = language === 'sw' ? photo.titleSw : (photo.titleEn || photo.titleSw);
  const description = language === 'sw' ? photo.descriptionSw : (photo.descriptionEn || photo.descriptionSw);

  // Fallback image source if the primary fails
  const imageSrc = imageError
    ? photo.fallbackUrl || '/public/assets/aistudio/IMG_20260914_162903_462_1__c2d97788.jpg'
    : photo.imageUrl;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${photo.category}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 active:scale-[0.99] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2 ${
        isFeatured && layoutMode === 'editorial'
          ? 'sm:col-span-2 sm:row-span-2'
          : ''
      }`}
    >
      {/* Photo Container */}
      <div
        className={`relative w-full overflow-hidden bg-slate-900 ${
          isFeatured && layoutMode === 'editorial'
            ? 'aspect-4/3 sm:aspect-16/10'
            : 'aspect-4/3'
        }`}
      >
        {/* Shimmer loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
            <Camera className="w-8 h-8 text-slate-700 animate-bounce" />
          </div>
        )}

        {/* Real or Fallback Image */}
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-108 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        />

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <span className="p-3 rounded-full bg-white/95 text-slate-950 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <ZoomIn className="w-5 h-5 text-[#102A43]" />
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2.5 py-1 rounded-md bg-[#102A43]/85 text-[#FFFFF0] text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs border border-white/10 shadow-xs">
            {photo.category}
          </span>
        </div>

        {/* Editorial Star Indicator for First Item */}
        {isFeatured && layoutMode === 'editorial' && (
          <div className="absolute top-2.5 right-2.5 z-10 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#C9A227] text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 fill-slate-950" />
            <span>{language === 'sw' ? 'Picha Kuu' : 'Featured'}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 bg-white flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h4
            className={`font-bold text-[#102A43] group-hover:text-amber-700 transition-colors leading-snug line-clamp-2 ${
              isFeatured && layoutMode === 'editorial'
                ? 'text-sm sm:text-base lg:text-lg min-h-[2.5rem] sm:min-h-[3rem]'
                : 'text-xs sm:text-sm min-h-[2.4rem] sm:min-h-[2.75rem]'
            }`}
          >
            {title}
          </h4>

          {description && (
            <p
              className={`text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed ${
                isFeatured && layoutMode === 'editorial' ? 'block' : 'hidden md:line-clamp-1'
              }`}
            >
              {description}
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <Calendar className="w-3 h-3 text-[#C9A227] shrink-0" />
            <span>{photo.date || '2026'}</span>
          </span>

          <span className="text-[#102A43] font-bold text-[11px] group-hover:text-amber-700 flex items-center gap-1">
            <span>{language === 'sw' ? 'Tazama' : 'View'}</span>
            <Eye className="w-3 h-3 text-[#C9A227]" />
          </span>
        </div>
      </div>
    </div>
  );
};

export const ResponsiveGalleryGrid: React.FC<ResponsiveGalleryGridProps> = ({
  photos,
  language,
  onSelectPhoto,
  defaultLayoutMode = 'adaptive',
  showLayoutControls = true,
  className = '',
}) => {
  const [layoutMode, setLayoutMode] = useState<GalleryGridLayoutMode>(defaultLayoutMode);

  if (!photos || photos.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-[#C9A227] flex items-center justify-center">
          <ImageIcon className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-slate-800 text-base">
          {language === 'sw' ? 'Hakuna picha zilizopatikana' : 'No photos found'}
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {language === 'sw'
            ? 'Hakuna picha zilizoorodheshwa katika kundi hili kwa sasa. Tafadhali chagua kundi jingine au picha zote.'
            : 'No photos are listed in this category at the moment. Please select another category or view all.'}
        </p>
      </div>
    );
  }

  // CSS Grid class mapping based on layoutMode
  const getGridClasses = () => {
    switch (layoutMode) {
      case 'comfortable':
        // 1 column on mobile, 2 on tablet, 3 on desktop
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6';

      case 'compact':
        // 2 columns on mobile, 3 on tablet, 4 on desktop
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5';

      case 'editorial':
        // Magazine layout: 1 col on xs, 2 on sm, 3 on lg, 4 on xl
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6';

      case 'adaptive':
      default:
        // Optimal standard: 1 col on mobile, 2 on tablet, 3 on desktop, 4 on wide desktop
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Grid Sub-header with Density & Column Controls */}
      {showLayoutControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1">
          {/* Photos count */}
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>
              {language === 'sw'
                ? `Inaonyesha picha ${photos.length}`
                : `Showing ${photos.length} photos`}
            </span>
          </div>

          {/* Density & Layout Switcher */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
            {/* Adaptive / Standard */}
            <button
              type="button"
              onClick={() => setLayoutMode('adaptive')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'adaptive'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-50'
              }`}
              title={language === 'sw' ? 'Mpangilio wa Kawaida' : 'Standard Grid'}
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'sw' ? 'Kawaida' : 'Standard'}
              </span>
            </button>

            {/* Comfortable / 3 Columns */}
            <button
              type="button"
              onClick={() => setLayoutMode('comfortable')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'comfortable'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-50'
              }`}
              title={language === 'sw' ? 'Mpangilio Mpana' : 'Spacious Grid'}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'sw' ? 'Mpana' : 'Spacious'}
              </span>
            </button>

            {/* Compact / 4 Columns */}
            <button
              type="button"
              onClick={() => setLayoutMode('compact')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'compact'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-50'
              }`}
              title={language === 'sw' ? 'Mpangilio Mdogo (Picha Nyingi)' : 'Compact Grid'}
            >
              <Columns4 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'sw' ? 'Mdogo' : 'Compact'}
              </span>
            </button>

            {/* Editorial / Magazine */}
            <button
              type="button"
              onClick={() => setLayoutMode('editorial')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'editorial'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#102A43] hover:bg-slate-50'
              }`}
              title={language === 'sw' ? 'Mtindo wa Gazeti / Picha Kuu' : 'Editorial / Featured'}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="hidden sm:inline">
                {language === 'sw' ? 'Picha Kuu' : 'Featured'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Responsive CSS Grid Container */}
      <div className={`grid ${getGridClasses()}`}>
        {photos.map((photo, index) => (
          <GalleryCard
            key={photo.id || `photo-${index}`}
            photo={photo}
            index={index}
            language={language}
            isFeatured={index === 0}
            layoutMode={layoutMode}
            onSelect={() => onSelectPhoto(photo, index)}
          />
        ))}
      </div>
    </div>
  );
};
