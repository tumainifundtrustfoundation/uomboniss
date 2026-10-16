import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  ARCHITECTURE_LAYERS,
  SCHOOL_INFRASTRUCTURE_SPECS
} from '../data/systemArchitectureData';
import {
  Layers,
  Box,
  Cpu,
  Database,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Server,
  Zap,
  Globe,
  ExternalLink,
  Workflow
} from 'lucide-react';

interface SystemArchitectureSectionProps {
  onOpenArchitectureModal: (layerId?: string) => void;
}

export const SystemArchitectureSection: React.FC<SystemArchitectureSectionProps> = ({
  onOpenArchitectureModal
}) => {
  const { language } = useLanguage();

  return (
    <section id="architecture" className="py-20 bg-gradient-to-b from-[#07192f] via-[#092244] to-[#07192f] text-white relative overflow-hidden border-t border-b border-blue-900/60">
      {/* Background Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e40af10_1px,transparent_1px),linear-gradient(to_bottom,#1e40af10_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/70 border border-blue-600/50 text-blue-300 text-xs font-bold uppercase tracking-widest shadow-md mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'sw' ? 'MIUNDOMBINU YA KISASA YA WINGU' : 'ENTERPRISE CLOUD ARCHITECTURE'}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
            {language === 'sw'
              ? 'Mfumo wa Kiteknolojia & Usalama wa Data (System Architecture)'
              : 'School Digital Architecture & Cloud Engineering Stack'}
          </h2>

          <p className="text-sm sm:text-base text-blue-200/90 leading-relaxed">
            {language === 'sw'
              ? 'Shule ya Sekondari Uomboni inatumia mfumo imara wa kidijitali uliojengwa juu ya Google Cloud Platform. Hii inahakikisha alama za mitihani ya NECTA, malipo ya ada, na taarifa za wanafunzi zinalindwa kwa viwango vya juu vya kimataifa bila kukatika.'
              : 'Uomboni Secondary School operates on a modern, high-resilience cloud infrastructure deployed on Google Cloud Platform, delivering 99.98% uptime, instantaneous NECTA grading, and military-grade student data privacy.'}
          </p>
        </div>

        {/* Interactive 3D Stack Showcase & Highlights Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* 3D Stack Graphic Visualizer Teaser (Left 6 cols) */}
          <div className="lg:col-span-6 bg-[#041122]/90 border border-blue-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/15 blur-3xl rounded-full pointer-events-none" />

            <div className="flex items-center justify-between gap-2 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {language === 'sw' ? 'Tabaka Zote 12 Ziko Hewani' : '12 Architectural Layers Active'}
              </span>
              <span className="text-xs text-blue-300 font-mono">
                {SCHOOL_INFRASTRUCTURE_SPECS.primaryRegion}
              </span>
            </div>

            {/* Stylized Isometric Stack Visual */}
            <div className="py-6 flex flex-col items-center justify-center relative select-none">
              <div
                className="relative cursor-pointer transition-transform duration-500 group-hover:scale-105"
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => onOpenArchitectureModal()}
              >
                <div
                  className="relative"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(58deg) rotateZ(-42deg)',
                    width: '220px',
                    height: '220px',
                  }}
                >
                  {/* Visual Slabs representing the 12-layer stack */}
                  {ARCHITECTURE_LAYERS.slice(0, 8).map((layer, idx) => {
                    const z = (8 - idx) * 18;
                    return (
                      <div
                        key={layer.id}
                        className="absolute inset-0 rounded-xl border border-white/30 shadow-md transition-all duration-300 flex items-center justify-between p-3"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: `translateZ(${z}px)`,
                          background: `linear-gradient(135deg, ${layer.color.boxFaceTop}ee, ${layer.color.boxFaceFront}dd)`,
                        }}
                      >
                        <span className="text-[11px] font-black text-white font-mono bg-black/40 px-1.5 py-0.5 rounded">
                          0{layer.number}
                        </span>
                        <span className="text-[11px] font-bold text-white drop-shadow-sm truncate max-w-[130px]">
                          {layer.titleEn}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="text-xs text-slate-400 block mb-1">
                  {language === 'sw' ? 'Bofya mchoro kuchunguza kila tabaka kwa 3D' : 'Click the 3D model to inspect all layers interactively'}
                </span>
                <button
                  onClick={() => onOpenArchitectureModal()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 border border-blue-400/50 inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Box className="w-4 h-4 text-amber-300" />
                  <span>{language === 'sw' ? 'Fungua Mchoro Kamili wa 3D' : 'Open Interactive 3D Stack Explorer'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Core Architectural Pillars (Right 6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-[#051428]/90 border border-blue-900/60 rounded-2xl p-5 hover:border-blue-600/60 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'sw' ? '1. Kiolesura cha Kisasa & Offline PWA' : '1. Modern Frontend & Offline PWA'}
                  </h3>
                  <span className="text-xs text-blue-300">React 19 • TypeScript • Tailwind v4 • Service Workers</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'sw'
                  ? 'Tovuti inapakia chini ya sekunde moja hata kwenye mitandao hafifu ya vijijini Kilimanjaro. Wazazi wanaweza kuisanikisha kwenye simu kama programu kamili (PWA) na kufungua matokeo hata nje ya mtandao.'
                  : 'Sub-second first paint optimized for rural mobile networks. Can be installed directly as an offline-capable Progressive Web App on Android and iOS.'}
              </p>
            </div>

            <div className="bg-[#051428]/90 border border-blue-900/60 rounded-2xl p-5 hover:border-blue-600/60 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'sw' ? '2. Hifadhidata ya Wingu ya Google Cloud Firestore' : '2. Google Cloud Firestore Realtime DB'}
                  </h3>
                  <span className="text-xs text-blue-300">NoSQL Multi-Region • Sub-15ms Reads • Automated Nightly Backups</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'sw'
                  ? 'Kumbukumbu za wanafunzi zaidi ya 1,200 na rekodi za NECTA tangu miaka ya nyuma zimehifadhiwa salama kwa usimbaji fiche wa AES-256 bila hofu ya kupotea au kuharibika.'
                  : 'Enterprise NoSQL document database with multi-region replication, live WebSocket snapshots, and continuous disaster-recovery backups.'}
              </p>
            </div>

            <div className="bg-[#051428]/90 border border-blue-900/60 rounded-2xl p-5 hover:border-blue-600/60 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'sw' ? '3. Ulinzi wa Ngazi 6 za Majukumu (RBAC)' : '3. 6-Tier Role-Based Security (RBAC)'}
                  </h3>
                  <span className="text-xs text-blue-300">Staff Gatekeeper • Field-level Firestore Rules • JWT Sessions</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'sw'
                  ? 'Mkuu wa Shule, Mhasibu, Mkuu wa Taaluma na Walimu wa Masomo wana mipaka madhubuti ya kiusalama. Hakuna mtu anayeweza kuona au kubadilisha taarifa asizoidhinishwa.'
                  : 'Rigorous role-based scoping ensuring only verified staff can access grading stations or financial ledgers, backed by declarative Firestore security rules.'}
              </p>
            </div>
          </div>
        </div>

        {/* 12 Architecture Slices Summary Cards */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <span>{language === 'sw' ? 'Tabaka Zote 12 za Mfumo wa Kiteknolojia' : 'The 12 Architecture Engineering Layers'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'sw'
                  ? 'Muundo thabiti kuanzia kiolesura cha mtumiaji hadi seva, ulinzi na kumbukumbu za mfumo'
                  : 'End-to-end cloud composition from client UI to edge caching, load balancing, and observability'}
              </p>
            </div>

            <button
              onClick={() => onOpenArchitectureModal()}
              className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{language === 'sw' ? 'Tazama Uchambuzi Kamili wa Kina' : 'View Full Technical Specs'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ARCHITECTURE_LAYERS.map((layer) => (
              <div
                key={layer.id}
                onClick={() => onOpenArchitectureModal(layer.id)}
                className="bg-[#051122]/90 border border-blue-900/60 hover:border-blue-400/80 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className="w-5 h-5 rounded text-[10px] font-black text-white flex items-center justify-center font-mono"
                      style={{ backgroundColor: layer.color.primary }}
                    >
                      {layer.number}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {layer.latencySla.split(' ')[0]}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 mb-1">
                    {language === 'sw' ? layer.titleSw.split('(')[0] : layer.titleEn}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {layer.technologies.slice(0, 2).join(', ')}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-blue-950 flex items-center justify-between text-[10px] text-blue-400 font-semibold">
                  <span>{language === 'sw' ? 'Chunguza' : 'Inspect'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live SLA & Institutional Compliance Banner */}
        <div className="p-6 rounded-2xl bg-[#061830] border border-blue-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-200 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                {language === 'sw' ? 'Viwango Rasmi vya Utendaji wa Mfumo' : 'Official Platform Operational Status'}
              </div>
              <div className="text-slate-300">
                Google Cloud Platform europe-west2 • High Availability Cluster • TLS 1.3 Certified • NECTA S0486 Compliant
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenArchitectureModal()}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold transition-all shadow-md cursor-pointer border border-blue-500"
            >
              {language === 'sw' ? 'Tazama Mtiririko wa Data (Data Flow)' : 'Explore Data Flow Diagram'}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
