import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

interface AnimatedRedRibbonBorderProps {
  className?: string;
}

export const AnimatedRedRibbonBorder: React.FC<AnimatedRedRibbonBorderProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-3 left-3 z-50 px-2.5 py-1.5 rounded-full bg-red-700/90 hover:bg-red-600 text-amber-300 text-[11px] font-bold shadow-lg border border-amber-400/80 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
        title="Washa Riboni Nyekundu ya Shule"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
        <span>Riboni ya Shule</span>
      </button>
    );
  }

  return (
    <div
      id="uomboni-animated-red-ribbon-frame"
      className={`fixed inset-0 z-40 pointer-events-none overflow-hidden select-none animate-thick-ribbon-glow ${className}`}
      aria-hidden="true"
    >
      {/* 1. TOP HORIZONTAL THICK RIBBON */}
      <div className="absolute top-0 left-0 right-0 h-3 sm:h-3.5 md:h-4.5 animate-thick-ribbon-h border-b-2 border-amber-400/90 shadow-lg shadow-red-900/60 flex items-center justify-center">
        {/* Inner gold thread dash accent */}
        <div className="w-full h-[1.5px] bg-repeat-x border-t border-dashed border-amber-300/80" />
      </div>

      {/* 2. BOTTOM HORIZONTAL THICK RIBBON */}
      <div className="absolute bottom-0 left-0 right-0 h-3 sm:h-3.5 md:h-4.5 animate-thick-ribbon-h border-t-2 border-amber-400/90 shadow-lg shadow-red-900/60 flex items-center justify-center">
        {/* Inner gold thread dash accent */}
        <div className="w-full h-[1.5px] bg-repeat-x border-b border-dashed border-amber-300/80" />
      </div>

      {/* 3. LEFT VERTICAL THICK RIBBON */}
      <div className="absolute top-0 bottom-0 left-0 w-3 sm:w-3.5 md:w-4.5 animate-thick-ribbon-v border-r-2 border-amber-400/90 shadow-lg shadow-red-900/60 flex items-center justify-center">
        {/* Inner gold thread dash accent */}
        <div className="h-full w-[1.5px] border-r border-dashed border-amber-300/80" />
      </div>

      {/* 4. RIGHT VERTICAL THICK RIBBON */}
      <div className="absolute top-0 bottom-0 right-0 w-3 sm:w-3.5 md:w-4.5 animate-thick-ribbon-v border-l-2 border-amber-400/90 shadow-lg shadow-red-900/60 flex items-center justify-center">
        {/* Inner gold thread dash accent */}
        <div className="h-full w-[1.5px] border-l border-dashed border-amber-300/80" />
      </div>

      {/* CORNER ROSETTES / GOLD MEDALLIONS (ANCHORS THE 4 CORNERS) */}
      {/* Top Left Rosette */}
      <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-br from-red-600 via-red-800 to-red-950 border-2 border-amber-400 rounded-br-2xl shadow-xl flex items-center justify-center">
        <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-400 border border-red-900 shadow-xs flex items-center justify-center">
          <span className="text-[7px] sm:text-[8px] font-black text-red-950">✝</span>
        </div>
      </div>

      {/* Top Right Rosette */}
      <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-bl from-red-600 via-red-800 to-red-950 border-2 border-amber-400 rounded-bl-2xl shadow-xl flex items-center justify-center">
        <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-400 border border-red-900 shadow-xs flex items-center justify-center">
          <span className="text-[7px] sm:text-[8px] font-black text-red-950">✝</span>
        </div>
      </div>

      {/* Bottom Left Rosette */}
      <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-tr from-red-600 via-red-800 to-red-950 border-2 border-amber-400 rounded-tr-2xl shadow-xl flex items-center justify-center">
        <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-400 border border-red-900 shadow-xs flex items-center justify-center">
          <span className="text-[7px] sm:text-[8px] font-black text-red-950">★</span>
        </div>
      </div>

      {/* Bottom Right Rosette */}
      <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-tl from-red-600 via-red-800 to-red-950 border-2 border-amber-400 rounded-tl-2xl shadow-xl flex items-center justify-center">
        <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-400 border border-red-900 shadow-xs flex items-center justify-center">
          <span className="text-[7px] sm:text-[8px] font-black text-red-950">★</span>
        </div>
      </div>

      {/* TOP-CENTER CEREMONIAL RIBBON MEDALLION BANNER */}
      <div className="absolute top-1 sm:top-1.5 left-1/2 -translate-x-1/2 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-0.5 rounded-b-xl bg-gradient-to-r from-red-950 via-red-800 to-red-950 border-x-2 border-b-2 border-amber-400 shadow-lg text-amber-300 text-[10px] font-black tracking-widest uppercase">
        <span className="text-amber-400">★</span>
        <span>UOMBONI SECONDARY SCHOOL</span>
        <span className="text-amber-400">★</span>
      </div>

      {/* FLOATING CONTROLS: ALLOWS USER TO TOGGLE RIBBON IF DESIRED (POINTER EVENTS ENABLED) */}
      <div className="absolute bottom-4 left-4 pointer-events-auto z-50 opacity-40 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsVisible(false)}
          className="p-1.5 rounded-full bg-slate-900/80 text-amber-300 hover:text-white border border-amber-400/40 text-[10px] shadow-sm flex items-center justify-center cursor-pointer"
          title="Ficha Riboni Nyekundu (Hide Ribbon)"
        >
          <EyeOff className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
