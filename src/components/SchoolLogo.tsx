import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export interface SchoolLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'auto';
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
  rounded?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  variant = 'color',
}) => {
  const { customLogoUrl } = useData();
  const [imageError, setImageError] = useState(false);

  // Official school logo path - 100% original, unaltered identity directly from uploaded asset
  const officialLogoPath = '/uomboni_official_logo.jpg';
  const logoSrc = (!imageError && customLogoUrl) ? customLogoUrl : officialLogoPath;

  const sizeMap: Record<string, string> = {
    xs: 'w-7 h-7 sm:w-8 sm:h-8',
    sm: 'w-9 h-9 sm:w-10 sm:h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
    '2xl': 'w-32 h-32 sm:w-36 sm:h-36',
    full: 'w-full h-full',
    auto: 'w-auto h-auto',
  };

  const isFullSized = size === 'full' || className.includes('w-full') || className.includes('h-full');

  return (
    <div className={`inline-flex items-center gap-3 shrink-0 ${className}`}>
      {/* Official Uomboni Secondary School Crest - Unmodified Original Identity */}
      <div
        className={`relative shrink-0 aspect-square flex items-center justify-center ${
          isFullSized ? 'w-full h-full' : (sizeMap[size] || sizeMap.md)
        }`}
      >
        <img
          src={logoSrc}
          alt="Official School Logo of Uomboni Secondary School (Catholic Diocese of Moshi — Prayer, Education, Work)"
          className="w-full h-full object-contain select-none"
          style={{ aspectRatio: '1 / 1' }}
          loading="eager"
          decoding="async"
          onError={() => {
            if (!imageError && customLogoUrl) {
              setImageError(true);
            }
          }}
        />
      </div>

      {showText && (
        <div className="shrink-0">
          <div className="flex items-center gap-1.5">
            <h1
              className={`font-serif font-bold tracking-tight leading-none ${
                size === 'lg' || size === 'xl' || size === '2xl'
                  ? 'text-lg sm:text-xl'
                  : 'text-sm sm:text-base'
              } ${variant === 'light' ? 'text-white' : 'text-[#102A43]'}`}
            >
              Uomboni Secondary School
            </h1>
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-[#C9A227] tracking-wider leading-tight mt-0.5">
            Tujendelee Sisi Wenyewe
          </p>
          <p
            className={`text-[9px] font-normal leading-none mt-0.5 ${
              variant === 'light' ? 'text-[#F5EBD7]/80' : 'text-slate-500'
            }`}
          >
            Catholic Diocese of Moshi · NECTA S0486
          </p>
        </div>
      )}
    </div>
  );
};
