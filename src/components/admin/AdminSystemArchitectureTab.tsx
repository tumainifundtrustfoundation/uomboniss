import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ARCHITECTURE_LAYERS,
  SCHOOL_INFRASTRUCTURE_SPECS,
  SYSTEM_DATA_FLOW_STEPS
} from '../../data/systemArchitectureData';
import {
  Layers,
  Box,
  Cpu,
  Database,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  Server,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
  Printer,
  Sparkles,
  Activity,
  HardDrive
} from 'lucide-react';

interface AdminSystemArchitectureTabProps {
  onOpenFullModal?: () => void;
}

export const AdminSystemArchitectureTab: React.FC<AdminSystemArchitectureTabProps> = ({
  onOpenFullModal
}) => {
  const { language } = useLanguage();
  const [selectedLayerId, setSelectedLayerId] = useState<string>('database');

  const selectedLayer = ARCHITECTURE_LAYERS.find(l => l.id === selectedLayerId) || ARCHITECTURE_LAYERS[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-blue-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-amber-300 shadow-md">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {language === 'sw' ? 'Mifumo ya Wingu Inafanya Kazi' : 'Cloud Systems 100% Operational'}
              </span>
              <span className="text-xs text-blue-300 font-mono">
                Region: {SCHOOL_INFRASTRUCTURE_SPECS.primaryRegion}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {language === 'sw'
                ? 'Miundombinu ya Kiteknolojia & Mfumo wa Kidijitali (System Architecture)'
                : 'Digital Architecture & Enterprise Cloud Stack'}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              {language === 'sw'
                ? 'Muundo kamili wa kiteknolojia wa Shule ya Sekondari Uomboni (NECTA S0486) kuanzia kiolesura cha mkononi hadi hifadhidata ya wingu na usalama wa taarifa.'
                : 'Full architectural stack of Uomboni Secondary School (NECTA S0486) from client-side PWA to Google Cloud Firestore and automated grading engines.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenFullModal && (
            <button
              onClick={onOpenFullModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 border border-blue-400/50 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Box className="w-4 h-4 text-amber-300" />
              <span>{language === 'sw' ? 'Fungua Mchoro wa 3D Skrini Nzima' : 'Open 3D Stack Explorer'}</span>
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title={language === 'sw' ? 'Chapisha Muundo' : 'Print Specification'}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cloud Health Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{language === 'sw' ? 'Hifadhidata ya Wingu' : 'Cloud Database'}</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-base font-black text-slate-900">Google Firestore</span>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected & Syncing
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{language === 'sw' ? 'Kituo cha Wingu' : 'GCP Region'}</span>
            <Cloud className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-base font-black text-slate-900">europe-west2</span>
          <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1 mt-1">
            <Activity className="w-3.5 h-3.5" />
            London High-Availability
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{language === 'sw' ? 'Ulinzi wa Alama' : 'Security Model'}</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-base font-black text-slate-900">RBAC + Rules</span>
          <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1 mt-1">
            <Lock className="w-3.5 h-3.5" />
            6-Tier Gatekeeper
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{language === 'sw' ? 'Utayari wa Mtandao' : 'Service SLA'}</span>
            <Zap className="w-4 h-4 text-violet-600" />
          </div>
          <span className="text-base font-black text-slate-900">99.98% Uptime</span>
          <span className="text-[11px] text-violet-700 font-bold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            NECTA Compliant
          </span>
        </div>
      </div>

      {/* Layer Interactive Explorer */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-600" />
              <span>{language === 'sw' ? 'Uchambuzi wa Tabaka Zote 12 za Mfumo' : 'The 12 Architecture Slices'}</span>
            </h4>
            <p className="text-xs text-slate-500">
              {language === 'sw'
                ? 'Bofya tabaka lolote kuona maelezo ya kina ya kiufundi na kanuni za usalama'
                : 'Select any layer to inspect technical blueprints and operational roles'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {ARCHITECTURE_LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  layer.id === selectedLayerId
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: layer.color.primary }}
                />
                <span>0{layer.number}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Layer Card Detail */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-md text-xs font-black text-white"
                style={{ backgroundColor: selectedLayer.color.primary }}
              >
                Layer #{selectedLayer.number}: {selectedLayer.color.name}
              </span>
              <h5 className="text-sm font-black text-slate-900">
                {language === 'sw' ? selectedLayer.titleSw : selectedLayer.titleEn}
              </h5>
            </div>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
              {selectedLayer.latencySla}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {language === 'sw' ? selectedLayer.descriptionSw : selectedLayer.descriptionEn}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Tech badges */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                {language === 'sw' ? 'Teknolojia Zinazotumika:' : 'Technologies:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedLayer.technologies.map(t => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-xs font-medium bg-white text-slate-800 border border-slate-300 shadow-2xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                {language === 'sw' ? 'Vigezo vya Utendaji:' : 'Key Metrics:'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {selectedLayer.metrics.map((m, i) => (
                  <div key={i} className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block truncate">
                      {language === 'sw' ? m.labelSw : m.labelEn}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="pt-3 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              {language === 'sw' ? 'Miongozo ya Uendeshaji & Usalama:' : 'Architectural Specs:'}
            </span>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-slate-700">
              {(language === 'sw' ? selectedLayer.detailsSw : selectedLayer.detailsEn).map((d, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* GLOBAL SEO & SEARCH ENGINE INDEXING CONTROL PANEL */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>GLOBAL SEO &amp; CRAWLER ENGINE (NECTA S0486)</span>
            </div>
            <h4 className="text-lg font-black text-[#102A43]">
              {language === 'sw' ? 'Uonekanaji wa Shule Kwenye Injini za Utafutaji (Search Engine Visibility)' : 'Search Engine Optimization & Indexing Hub'}
            </h4>
            <p className="text-xs text-slate-600 max-w-2xl">
              {language === 'sw'
                ? 'Mfumo wa kisasa wa SEO unaowezesha Google, Microsoft Bing, Yahoo, DuckDuckGo na mitandao ya kijamii kuitambua na kuiorodhesha Shule ya Sekondari Uomboni mtandaoni.'
                : 'Automated SEO, server-side pre-rendering, sitemap generation, and IndexNow protocols for immediate indexing on Google, Bing, and major search engines.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300"
            >
              <span>sitemap.xml</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300"
            >
              <span>robots.txt</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>

        {/* SEO Technical Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#FFFFF0] border border-amber-200/80 space-y-1.5">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              1. Anwani Rasmi ya Tovuti (Canonical URL)
            </span>
            <div className="font-mono font-bold text-xs text-[#102A43] truncate">
              https://www.uomboniss.sc.tz/
            </div>
            <p className="text-[11px] text-slate-600">
              {language === 'sw'
                ? 'Mifumo yote ya HTTP na domain isiyo na www inaelekezwa kiotomatiki (301 redirect) kuzuia migongano.'
                : 'Automatic 301 redirects enforce canonical HTTPS and www domain without redirect loops.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              2. Data Zilizopangwa (Schema.org JSON-LD)
            </span>
            <div className="font-bold text-xs text-emerald-950">
              HighSchool, WebSite &amp; BreadcrumbList
            </div>
            <p className="text-[11px] text-slate-600">
              {language === 'sw'
                ? 'Ina namba ya NECTA S0486, kuratibu za kijiografia za Marangu Moshi (-3.2842, 37.5218) na taarifa za kikanisa.'
                : 'Verified NECTA S0486 ID, GPS coordinates in Marangu, Moshi, curriculum details, and school contacts.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              3. Ulinzi wa Data Binafsi (Data Privacy)
            </span>
            <div className="font-bold text-xs text-blue-950">
              Dashibodi za Ndani Zimezuiwa (Noindex)
            </div>
            <p className="text-[11px] text-slate-600">
              {language === 'sw'
                ? 'Robots.txt inazuia roboti kuingia kwenye akaunti za wanafunzi, dashibodi za walimu au lango la utawala.'
                : 'Sensitive portals, admin controls, and internal marks are strictly disallowed in robots.txt.'}
            </p>
          </div>
        </div>

        {/* IndexNow Ping Action Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">
                IndexNow Protocol for Microsoft Bing, Yandex &amp; Yahoo
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {language === 'sw'
                ? 'Bonyeza kitufe hiki kutuma arifa kwa injini za utafutaji pindi unaposasisha matangazo, hati za udahili au matokeo.'
                : 'Notify search engines immediately of newly published admission documents, announcements, or results.'}
            </p>
          </div>

          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/seo/indexnow', { method: 'POST' });
                const data = await res.json();
                alert(data?.message || 'IndexNow notification sent!');
              } catch (err: any) {
                alert('IndexNow ping error: ' + (err?.message || err));
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-md flex items-center gap-2 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-slate-950" />
            <span>{language === 'sw' ? 'Tuma Arifa kwa Injini (IndexNow)' : 'Ping Search Engines (IndexNow)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
