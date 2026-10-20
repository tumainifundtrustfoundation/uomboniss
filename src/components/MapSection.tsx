import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  Car,
  Bus,
  Clock,
  Phone,
  Copy,
  Check,
  Layers,
  Sparkles,
  Mountain,
  Building,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MapSectionProps {
  onOpenAdmissions?: () => void;
}

export const MapSection: React.FC<MapSectionProps> = ({ onOpenAdmissions }) => {
  const { language } = useLanguage();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'osm'>('roadmap');
  const [copied, setCopied] = useState(false);
  const [activeRouteTab, setActiveRouteTab] = useState<'moshi' | 'himo' | 'marangu'>('moshi');

  const schoolCoordinates = '-3.2844, 37.5256';
  const googleMapsSearchUrl = 'https://www.google.com/maps/search/?api=1&query=Uomboni+Secondary+School+Marangu+Kilimanjaro';
  const googleMapsDirectionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=Uomboni+Secondary+School+Marangu+Kilimanjaro';
  const appleMapsUrl = 'https://maps.apple.com/?q=Uomboni+Secondary+School&ll=-3.2844,37.5256';

  let embedUrl = 'https://maps.google.com/maps?q=-3.2844,37.5256+(Uomboni+Secondary+School)&t=&z=15&ie=UTF8&iwloc=&output=embed';
  if (mapType === 'satellite') {
    embedUrl = 'https://maps.google.com/maps?q=-3.2844,37.5256+(Uomboni+Secondary+School)&t=k&z=16&ie=UTF8&iwloc=&output=embed';
  } else if (mapType === 'osm') {
    embedUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=37.5000%2C-3.3050%2C37.5500%2C-3.2650&layer=mapnik&marker=-3.2844%2C37.5256';
  }

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(schoolCoordinates);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="location" data-section="ramani" className="py-14 sm:py-20 bg-[#FFFFF0] border-t border-[#102A43]/10 relative overflow-hidden">
      {/* Decorative Kilimanjaro ambient background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#102A43]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102A43]/10 border border-[#102A43]/15 text-[#102A43] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>{language === 'sw' ? '📍 Eneo & Ramani Rasmi ya Shule' : '📍 Campus Location & Official Map'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#102A43] tracking-tight">
            {language === 'sw'
              ? 'Ramani ya Shule ya Sekondari Uomboni'
              : 'Uomboni Secondary School Location Map'}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {language === 'sw'
              ? 'Shule ipo kwenye mazingira tulivu, yenye hewa safi na mandhari ya kijani kibichi ya miteremko ya Mlima Kilimanjaro, Marangu Magharibi, Wilaya ya Moshi Vijijini.'
              : 'The school is located on the serene, lush green slopes of Mount Kilimanjaro in Marangu West, Moshi Rural District, Kilimanjaro Region, Tanzania.'}
          </p>
        </div>

        {/* Quick Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-8">
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-[#102A43]/15 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#102A43]/10 text-[#102A43] flex items-center justify-center shrink-0">
              <Mountain className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A227]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase block truncate">
                {language === 'sw' ? 'Mwinuko' : 'Elevation'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#102A43] truncate block">
                1,450m ASL
              </span>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-[#102A43]/15 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#102A43]/10 text-[#102A43] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A227]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase block truncate">
                {language === 'sw' ? 'Eneo' : 'District'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#102A43] truncate block">
                Marangu, Moshi
              </span>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-[#102A43]/15 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#102A43]/10 text-[#102A43] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A227]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase block truncate">
                {language === 'sw' ? 'Muda' : 'Duration'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#102A43] truncate block">
                ~45m Moshi
              </span>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-white border border-[#102A43]/15 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#102A43]/10 text-[#102A43] flex items-center justify-center shrink-0">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A227]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase block truncate">
                {language === 'sw' ? 'NECTA' : 'NECTA'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#102A43] truncate block font-mono">
                S0486
              </span>
            </div>
          </div>
        </div>

        {/* Main Map + Directions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left: Interactive Google Map Embed Card (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#102A43]/15 shadow-lg overflow-hidden flex flex-col">
            {/* Map Top Bar Controls */}
            <div className="bg-[#102A43] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold tracking-wide">
                  Uomboni Secondary School — Google Maps Live
                </span>
              </div>

              {/* View Switchers & App Link */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setMapType('roadmap')}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    mapType === 'roadmap'
                      ? 'bg-[#C9A227] text-[#102A43] shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Mtazamo wa Ramani ya Barabara (Google Maps)"
                >
                  {language === 'sw' ? 'Barabara' : 'Roadmap'}
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('satellite')}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    mapType === 'satellite'
                      ? 'bg-[#C9A227] text-[#102A43] shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Mtazamo wa Picha za Satelaiti (Satellite View)"
                >
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{language === 'sw' ? 'Satelaiti' : 'Satellite'}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('osm')}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    mapType === 'osm'
                      ? 'bg-[#C9A227] text-[#102A43] shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="OpenStreetMap (Mchoro wa Ramani ya Wazi)"
                >
                  <span>OpenStreetMap</span>
                </button>
              </div>
            </div>

            {/* Embedded Responsive Iframe */}
            <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] bg-slate-100">
              <iframe
                title="Ramani ya Shule ya Sekondari Uomboni"
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />

              {/* Floating Floating GPS Pill Overlay */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-300 shadow-md flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span className="font-mono font-bold text-slate-800">{schoolCoordinates}</span>
                <button
                  type="button"
                  onClick={handleCopyCoordinates}
                  className="ml-1 p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Nakili viwianishi vya GPS (Copy Coordinates)"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <strong className="text-slate-800">
                  {language === 'sw' ? 'Anwani Rasmi:' : 'Physical Address:'}
                </strong>{' '}
                S.L.P 361 au S.L.P 293 Marangu, Moshi Vijijini, Mkoani Kilimanjaro.
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[40px]"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                  <span>{language === 'sw' ? 'Maelekezo (Directions)' : 'Get Directions'}</span>
                </a>

                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-xl bg-[#C9A227] hover:bg-[#b08d20] text-[#102A43] text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[40px]"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>

                <a
                  href={appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer min-h-[40px]"
                  title="Fungua kwenye Apple Maps (iOS / Mac)"
                >
                  <span>Apple Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Driving & Travel Guide Accordion / Card (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Route Selection Tabs */}
            <div className="bg-white p-5 rounded-2xl border border-[#102A43]/15 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-[#C9A227]" />
                <span>{language === 'sw' ? 'Mwongozo wa Njia (How to Reach Us)' : 'Travel Directions'}</span>
              </h3>

              {/* Route Buttons */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveRouteTab('moshi')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeRouteTab === 'moshi'
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Moshi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRouteTab('himo')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeRouteTab === 'himo'
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Himo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRouteTab('marangu')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeRouteTab === 'marangu'
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mtoni
                </button>
              </div>

              {/* Tab 1: Kutoka Moshi Mjini */}
              {activeRouteTab === 'moshi' && (
                <div className="space-y-3 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#102A43] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <p>
                      <strong>Kuanzia Moshi Mjini:</strong> Panda gari au chukua barabara ya lami ya Moshi – Himo (takriban kilomita 20).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#102A43] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <p>
                      <strong>Njia panda ya Himo:</strong> Pinda kushoto kuingia barabara ya lami inayoelekea Marangu Gate.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#102A43] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <p>
                      <strong>Kufika Uomboni:</strong> Fuata vibao vya Shule ya Sekondari Uomboni (Marangu Magharibi).
                    </p>
                  </div>
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                    ⏱️ <strong>Muda:</strong> Dakika 45 - 55 kwa gari binafsi au daladala za Marangu.
                  </div>
                </div>
              )}

              {/* Tab 2: Kutoka Himo */}
              {activeRouteTab === 'himo' && (
                <div className="space-y-3 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#C9A227] text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <p>
                      Kutoka Mji wa Himo, panda kuelekea mlima Kilimanjaro kwa barabara kuu ya lami ya Marangu.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#C9A227] text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <p>
                      Umbali ni takriban kilomita 18 kupitia mandhari nzuri za migomba na mashamba ya kahawa.
                    </p>
                  </div>
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                    ⏱️ <strong>Muda:</strong> Dakika 20 - 25 tu kufika lango kuu la shule.
                  </div>
                </div>
              )}

              {/* Tab 3: Kutoka Kituo cha Marangu Mtoni */}
              {activeRouteTab === 'marangu' && (
                <div className="space-y-3 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <p>
                      Kutoka kituo kikuu cha daladala Marangu Mtoni, Uomboni ipo umbali wa kilomita 3.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <p>
                      Usafiri wa bajaji au bodaboda unapatikana saa zote kwa gharama nafuu ya Shilingi 1,000 - 2,000.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Assistance Hotline Card */}
            <div className="bg-[#102A43] text-white p-5 rounded-2xl shadow-md space-y-3 border border-[#C9A227]/30">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Phone className="w-4 h-4" />
                <span>{language === 'sw' ? 'Je, Unahitaji Msaada wa Kufika?' : 'Need Help Getting Here?'}</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                {language === 'sw'
                  ? 'Ikiwa unasafiri kuja shuleni na unahitaji mwongozo wa njia, wasiliana nasi moja kwa moja:'
                  : 'If you are visiting our campus and need assistance with directions, contact our desk:'}
              </p>
              <div className="space-y-1.5 pt-1 font-mono text-xs font-bold text-white">
                <a
                  href="tel:+255782558127"
                  className="block hover:text-[#C9A227] transition-colors"
                >
                  📞 +255 782 558 127 (Mkuu wa Shule)
                </a>
                <a
                  href="tel:+255754532949"
                  className="block hover:text-[#C9A227] transition-colors"
                >
                  📞 +255 754 532 949 (Makamu Mkuu wa Shule)
                </a>
                <a
                  href="tel:+255752000939"
                  className="block hover:text-[#C9A227] transition-colors"
                >
                  📞 +255 752 000 939 (Ofisi ya Udahili)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
