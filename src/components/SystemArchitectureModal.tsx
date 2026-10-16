import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import {
  ARCHITECTURE_LAYERS,
  ArchitectureLayer,
  SYSTEM_DATA_FLOW_STEPS,
  SCHOOL_INFRASTRUCTURE_SPECS
} from '../data/systemArchitectureData';
import { SchoolLogo } from './SchoolLogo';
import {
  Layers,
  Box,
  Cpu,
  Database,
  ShieldCheck,
  Globe,
  Cloud,
  GitBranch,
  Lock,
  Gauge,
  Zap,
  Activity,
  Server,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sliders,
  Sparkles,
  ExternalLink,
  Printer,
  ChevronRight,
  X,
  Info,
  Smartphone,
  Eye,
  Workflow
} from 'lucide-react';

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLayerId?: string;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({
  isOpen,
  onClose,
  initialLayerId
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'3d-stack' | 'matrix' | 'data-flow' | 'security'>('3d-stack');
  const [selectedLayerId, setSelectedLayerId] = useState<string>(initialLayerId || 'frontend');
  const [isExploded, setIsExploded] = useState<boolean>(true);
  const [rotationAngle, setRotationAngle] = useState<number>(-45);
  const [tiltAngle, setTiltAngle] = useState<number>(60);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const selectedLayer: ArchitectureLayer =
    ARCHITECTURE_LAYERS.find(l => l.id === selectedLayerId) || ARCHITECTURE_LAYERS[0];

  const filteredLayers = ARCHITECTURE_LAYERS.filter(l => {
    if (filterCategory === 'all') return true;
    return l.category === filterCategory;
  });

  const handlePrintBlueprint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-7xl max-h-[96vh] bg-[#07162c] border border-blue-900/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header Bar */}
        <div className="flex-shrink-0 bg-[#0b2244] border-b border-blue-800/60 px-4 sm:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl shadow-md border border-blue-400/30">
              <Layers className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'sw' ? 'Mifumo ya Wingu Inafanya Kazi' : 'Cloud Systems Operational'}
                </span>
                <span className="text-xs text-blue-300/80 hidden sm:inline">
                  • {SCHOOL_INFRASTRUCTURE_SPECS.institutionName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                {language === 'sw'
                  ? 'Miundombinu ya Kiteknolojia & Mfumo wa Kidijitali (System Architecture)'
                  : 'System Architecture & Cloud Engineering Stack'}
              </h2>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={handlePrintBlueprint}
              title={language === 'sw' ? 'Chapisha / Hifadhi Mchoro' : 'Print / Export Blueprint'}
              className="px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 text-xs font-semibold border border-blue-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'sw' ? 'Chapisha Muundo' : 'Export Blueprint'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
              aria-label="Funga"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex-shrink-0 bg-[#061426] px-4 sm:px-6 py-2 border-b border-blue-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('3d-stack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === '3d-stack'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-blue-950/40'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Mchoro wa Tabaka za 3D (Isometric Stack)' : '3D Isometric Stack'}</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-blue-950/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Kadi 12 za Teknolojia (Tech Matrix)' : '12-Tier Tech Matrix'}</span>
          </button>

          <button
            onClick={() => setActiveTab('data-flow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'data-flow'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-blue-950/40'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Mtiririko wa Data (Data Flow)' : 'End-to-End Data Flow'}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-blue-950/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Ulinzi wa Data & NECTA' : 'Security & NECTA Compliance'}</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-radial from-[#0c2448] via-[#07162c] to-[#040d1a]">

          {/* TAB 1: 3D ISOMETRIC STACK */}
          {activeTab === '3d-stack' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* 3D Visualizer Canvas (Left/Center) */}
              <div className="lg:col-span-7 bg-[#051122]/90 border border-blue-900/60 rounded-2xl p-4 sm:p-6 flex flex-col relative overflow-hidden min-h-[480px] sm:min-h-[560px]">
                {/* 3D Visualizer Controls Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {language === 'sw' ? 'Mfumo wa 3D wa Tabaka' : 'Interactive 3D Isometric Stack'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                      {isExploded ? (language === 'sw' ? 'Tabaka Wazi (Exploded)' : 'Exploded View') : (language === 'sw' ? 'Tabaka Zimeungana' : 'Compressed')}
                    </span>
                  </div>

                  {/* Visualizer Toolbar */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsExploded(!isExploded)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                        isExploded
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {isExploded ? (language === 'sw' ? 'Unganisha' : 'Collapse') : (language === 'sw' ? 'Tenganisha 3D' : 'Explode')}
                    </button>
                    <button
                      onClick={() => {
                        setRotationAngle(-45);
                        setTiltAngle(60);
                      }}
                      className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                      title={language === 'sw' ? 'Rudisha Mwonekano wa Awali' : 'Reset Angle'}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Perspective 3D Scene Viewport */}
                <div className="flex-1 flex items-center justify-center relative min-h-[380px] sm:min-h-[440px] select-none py-8">
                  {/* Background Cyber Grid Floor */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a15_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                  {/* 3D Stack Container */}
                  <div
                    className="relative transition-transform duration-500 ease-out"
                    style={{
                      perspective: '1200px',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div
                      className="relative transition-transform duration-500"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: `rotateX(${tiltAngle}deg) rotateZ(${rotationAngle}deg)`,
                        width: '260px',
                        height: '260px',
                      }}
                    >
                      {/* Base Reflection Shadow */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl -translate-z-10"
                        style={{ transform: 'translateZ(-40px)' }}
                      />

                      {/* 12 Isometric Stack Slabs */}
                      {ARCHITECTURE_LAYERS.map((layer, index) => {
                        const isSelected = layer.id === selectedLayerId;
                        const slabSpacing = isExploded ? 28 : 12;
                        // Calculate Z elevation for each layer from bottom (12) to top (1)
                        const zIndexOffset = (ARCHITECTURE_LAYERS.length - 1 - index) * slabSpacing;
                        const hoverElevate = isSelected ? 22 : 0;
                        const finalZ = zIndexOffset + hoverElevate;

                        return (
                          <div
                            key={layer.id}
                            onClick={() => setSelectedLayerId(layer.id)}
                            className="absolute inset-0 cursor-pointer transition-all duration-300 group"
                            style={{
                              transformStyle: 'preserve-3d',
                              transform: `translateZ(${finalZ}px)`,
                            }}
                          >
                            {/* Top Face of the 3D Slab */}
                            <div
                              className={`absolute inset-0 rounded-xl transition-all duration-300 border flex items-center justify-between p-3 select-none ${
                                isSelected
                                  ? 'border-white shadow-lg ring-2 ring-white/60 brightness-110'
                                  : 'border-white/20 hover:border-white/50 hover:brightness-105'
                              }`}
                              style={{
                                background: `linear-gradient(135deg, ${layer.color.boxFaceTop}ee, ${layer.color.boxFaceFront}dd)`,
                                boxShadow: isSelected
                                  ? `0 0 25px ${layer.color.primary}88, inset 0 0 15px rgba(255,255,255,0.4)`
                                  : `0 4px 10px rgba(0,0,0,0.5)`,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-black/40 text-white font-black text-[10px] flex items-center justify-center font-mono border border-white/20">
                                  {layer.number}
                                </span>
                                <span className="text-white text-xs font-bold truncate max-w-[150px] drop-shadow-sm">
                                  {language === 'sw' ? layer.titleSw.split('(')[0] : layer.titleEn}
                                </span>
                              </div>
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  isSelected ? 'bg-white animate-ping' : 'bg-white/70'
                                }`}
                              />
                            </div>

                            {/* Front Thickness Face (rotateX 90deg) */}
                            <div
                              className="absolute left-0 right-0 h-[10px] bottom-0 rounded-b-md origin-bottom border-b border-black/40"
                              style={{
                                transform: 'rotateX(-90deg)',
                                backgroundColor: layer.color.boxFaceFront,
                                filter: 'brightness(0.75)',
                              }}
                            />

                            {/* Right Thickness Face (rotateY 90deg) */}
                            <div
                              className="absolute top-0 bottom-0 w-[10px] right-0 rounded-r-md origin-right border-r border-black/40"
                              style={{
                                transform: 'rotateY(90deg)',
                                backgroundColor: layer.color.boxFaceSide,
                                filter: 'brightness(0.6)',
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Isometric Angle Slider Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-blue-900/40 text-xs text-slate-400 z-10">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    <span>{language === 'sw' ? 'Mzunguko wa 3D:' : '3D Rotation:'}</span>
                    <input
                      type="range"
                      min="-90"
                      max="0"
                      value={rotationAngle}
                      onChange={(e) => setRotationAngle(Number(e.target.value))}
                      className="w-20 accent-blue-500 cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-blue-300">{rotationAngle}°</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>{language === 'sw' ? 'Mwinuko:' : 'Tilt:'}</span>
                    <input
                      type="range"
                      min="40"
                      max="80"
                      value={tiltAngle}
                      onChange={(e) => setTiltAngle(Number(e.target.value))}
                      className="w-20 accent-blue-500 cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-blue-300">{tiltAngle}°</span>
                  </div>

                  <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                    {language === 'sw' ? 'Bofya tabaka lolote kuona maelezo yake kamili' : 'Click any layer to inspect technical details'}
                  </span>
                </div>
              </div>

              {/* Layer Detailed Inspector Card (Right Column) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-[#051122]/90 border border-blue-900/60 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                  {/* Colored header line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: selectedLayer.color.primary }}
                  />

                  {/* Layer Meta Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5"
                      style={{ backgroundColor: selectedLayer.color.primary }}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Layer #{selectedLayer.number}: {selectedLayer.color.name}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {selectedLayer.latencySla}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white mb-2">
                    {language === 'sw' ? selectedLayer.titleSw : selectedLayer.titleEn}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {language === 'sw' ? selectedLayer.descriptionSw : selectedLayer.descriptionEn}
                  </p>

                  {/* Core Technologies Badges */}
                  <div className="mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block mb-2">
                      {language === 'sw' ? 'Teknolojia Zinazotumika:' : 'Technologies & Libraries:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLayer.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-950/80 text-blue-200 border border-blue-800/60 flex items-center gap-1"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: selectedLayer.color.primary }}
                          />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Architecture Guarantees */}
                  <div className="mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block mb-2">
                      {language === 'sw' ? 'Vipengele vya Uendeshaji & Usalama:' : 'Architectural Specs & Hardening:'}
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {(language === 'sw' ? selectedLayer.detailsSw : selectedLayer.detailsEn).map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 mb-4">
                    {selectedLayer.metrics.map((m, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {language === 'sw' ? m.labelSw : m.labelEn}
                        </span>
                        <span className="text-xs font-black text-amber-300 font-mono mt-0.5">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Security Guarantee Banner */}
                  <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/50 flex items-center gap-2 text-xs text-rose-200">
                    <ShieldCheck className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>
                      <strong>{language === 'sw' ? 'Jukumu la Ulinzi:' : 'Security Role:'}</strong>{' '}
                      {language === 'sw' ? selectedLayer.securityRoleSw : selectedLayer.securityRoleEn}
                    </span>
                  </div>
                </div>

                {/* Quick Layer Switcher List */}
                <div className="bg-[#051122]/70 border border-blue-900/40 rounded-2xl p-3 flex flex-wrap gap-1.5 justify-center">
                  {ARCHITECTURE_LAYERS.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        layer.id === selectedLayerId
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: layer.color.primary }}
                      />
                      <span>#{layer.number}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TECH MATRIX (12 CARDS GRID) */}
          {activeTab === 'matrix' && (
            <div>
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'sw' ? 'Kadi 12 za Miundombinu ya Kiteknolojia' : '12-Tier Architecture Tech Matrix'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'sw'
                      ? 'Kila ngazi inajumuisha teknolojia za kiwango cha juu cha usalama na kasi'
                      : 'Comprehensive view of all layers from frontend client to cloud storage and telemetry'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', labelSw: 'Zote (12)', labelEn: 'All (12)' },
                    { id: 'frontend', labelSw: 'Kiolesura', labelEn: 'Frontend' },
                    { id: 'backend', labelSw: 'Mantiki', labelEn: 'Backend' },
                    { id: 'data', labelSw: 'Data', labelEn: 'Data' },
                    { id: 'security', labelSw: 'Usalama', labelEn: 'Security' },
                    { id: 'cloud', labelSw: 'Wingu', labelEn: 'Cloud' },
                    { id: 'operations', labelSw: 'Uendeshaji', labelEn: 'Operations' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        filterCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {language === 'sw' ? cat.labelSw : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of 12 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLayers.map((layer) => (
                  <div
                    key={layer.id}
                    onClick={() => {
                      setSelectedLayerId(layer.id);
                      setActiveTab('3d-stack');
                    }}
                    className="bg-[#051122]/90 border border-blue-900/60 hover:border-blue-500/80 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-black text-white"
                          style={{ backgroundColor: layer.color.primary }}
                        >
                          #{layer.number} • {layer.color.name}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400">
                          {layer.latencySla}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors mb-1.5">
                        {language === 'sw' ? layer.titleSw : layer.titleEn}
                      </h4>

                      <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                        {language === 'sw' ? layer.descriptionSw : layer.descriptionEn}
                      </p>

                      {/* Tech Chips */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {layer.technologies.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-950 text-blue-200 border border-blue-800/60"
                          >
                            {tech}
                          </span>
                        ))}
                        {layer.technologies.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                            +{layer.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-blue-950 flex items-center justify-between text-xs text-blue-400 group-hover:text-blue-300 font-semibold">
                      <span>{language === 'sw' ? 'Tazama kwenye 3D' : 'View in 3D'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DATA FLOW ARCHITECTURE */}
          {activeTab === 'data-flow' && (
            <div className="max-w-4xl mx-auto py-2">
              <div className="text-center mb-8">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60 uppercase tracking-wider">
                  {language === 'sw' ? 'Mzunguko Kamili wa Data' : 'End-to-End Packet Lifecycle'}
                </span>
                <h3 className="text-xl font-black text-white mt-2">
                  {language === 'sw'
                    ? 'Jinsi Data Inavyosafiri Kutoka kwa Mwanafunzi Hadi Google Cloud'
                    : 'How Data Flows Securely from Client to Google Cloud'}
                </h3>
                <p className="text-xs text-slate-300 max-w-xl mx-auto mt-1">
                  {language === 'sw'
                    ? 'Kila ombi linalotumwa kwenye mfumo wa Uomboni linapitia hatua 6 za usalama na uhakiki ili kuhakikisha alama za mitihani na ada ziko salama kabisa.'
                    : 'Every request passes through 6 hardened architectural stages ensuring 100% data integrity and zero security breaches.'}
                </p>
              </div>

              {/* Vertical Stepper */}
              <div className="space-y-4">
                {SYSTEM_DATA_FLOW_STEPS.map((step) => {
                  const targetLayer = ARCHITECTURE_LAYERS.find(l => l.id === step.targetLayer);
                  return (
                    <div
                      key={step.step}
                      className="bg-[#051122]/90 border border-blue-900/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-blue-500/60"
                    >
                      {/* Step Number Badge */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-lg border border-blue-400/30">
                        0{step.step}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-sm font-black text-white">
                            {language === 'sw' ? step.titleSw : step.titleEn}
                          </h4>
                          {targetLayer && (
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                              style={{ backgroundColor: targetLayer.color.primary }}
                            >
                              Layer #{targetLayer.number}: {targetLayer.titleEn}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {language === 'sw' ? step.descriptionSw : step.descriptionEn}
                        </p>
                      </div>

                      <div className="hidden sm:flex flex-col items-end text-xs font-mono text-emerald-400 flex-shrink-0">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          TLS 1.3 Active
                        </span>
                        <span className="text-[10px] text-slate-400">gRPC Encrypted</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & NECTA COMPLIANCE */}
          {activeTab === 'security' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-blue-950/60 border border-red-900/60 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-red-600 text-white shadow-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {language === 'sw'
                        ? 'Ulinzi wa Data za Wanafunzi & Kanuni za NECTA'
                        : 'Institutional Security & NECTA Compliance Standards'}
                    </h3>
                    <p className="text-xs text-rose-300">
                      Zero-Trust Architecture • Strict Data Isolation • Cryptographic Audit Trails
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'sw'
                    ? 'Kama Kituo Rasmi cha Mitihani cha NECTA (S0486), Uomboni Secondary School inazingatia viwango vikali vya kiusalama vya kitaifa na kimataifa. Mfumo huu unahakikisha kuwa alama za mitihani haziwezi kubadilishwa bila ruhusa, fedha za ada haziwezi kupotoshwa, na taarifa za kibinafsi za watoto zinalindwa kwa kiwango cha juu.'
                    : 'As an accredited NECTA Examination Centre (S0486), Uomboni Secondary School enforces strict cryptographic and institutional controls. Grade tampering is impossible due to declarative Firestore rules, financial receipts are dual-verified, and child privacy is unconditionally preserved.'}
                </p>
              </div>

              {/* 4 Security Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#051122]/90 border border-blue-900/60 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-amber-400">
                    <Lock className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {language === 'sw' ? '1. Ulinzi wa Alama za Mitihani (NECTA Integrity)' : '1. Examination & Grading Integrity'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {language === 'sw'
                      ? 'Walimu wanaweza kuweka alama za masomo waliyopangiwa pekee. Mara tu Mkuu wa Taaluma anapoidhinisha na kuchapisha, alama hizo zinalindwa na haziwezi kubadilishwa bila kibali cha Mkuu wa Shule.'
                      : 'Teachers only hold write access for their assigned subjects. Once approved and published by the Academic Master, records become immutable and tamper-evident.'}
                  </p>
                </div>

                <div className="bg-[#051122]/90 border border-blue-900/60 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {language === 'sw' ? '2. Stakabadhi za Ada zenye QR Code' : '2. QR-Coded Fee Verification'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {language === 'sw'
                      ? 'Kila ripoti ya maendeleo na stakabadhi ya ada inazalishwa ikiwa na QR Code ya kipekee inayoweza kukaguliwa mara moja na msimamizi yeyote ili kuzuia risiti bandia.'
                      : 'Every generated report card and financial receipt embeds a cryptographically signed QR code verifiable by school auditors in real-time.'}
                  </p>
                </div>

                <div className="bg-[#051122]/90 border border-blue-900/60 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-sky-400">
                    <Server className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {language === 'sw' ? '3. Hifadhi ya Wingu ya Google (GCP Resilience)' : '3. Google Cloud Resilience & SLA'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {language === 'sw'
                      ? 'Data zote zimehifadhiwa katika vituo vya Google Cloud (europe-west2) vyenye upatikanaji wa 99.999%. Nakala rudufu (backups) huchukuliwa kiotomatiki kila siku.'
                      : 'Data resides on Google Cloud Platform with 99.999% SLA availability and automated multi-zone geo-replication ensuring zero data loss.'}
                  </p>
                </div>

                <div className="bg-[#051122]/90 border border-blue-900/60 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-rose-400">
                    <ShieldCheck className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      {language === 'sw' ? '4. Mlango wa Kiutawala (Staff Security Gate)' : '4. Staff Security Gatekeeper'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {language === 'sw'
                      ? 'Milango ya kiutawala ya Mkuu wa Shule, Mhasibu na Mkuu wa Taaluma inalindwa dhidi ya umma kwa kutumia vibali vya kiotomatiki, uthibitishaji wa barua pepe na brute-force throttling.'
                      : 'Administrative interfaces are invisible to public visitors and guarded by strict cryptographic sessions, multi-factor barriers, and brute-force throttling.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar with Live Specs */}
        <div className="flex-shrink-0 bg-[#061426] border-t border-blue-900/60 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5 text-blue-300">
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              GCP: {SCHOOL_INFRASTRUCTURE_SPECS.primaryRegion}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Database className="w-3.5 h-3.5" />
              Cloud Firestore: Connected
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-400">
              Uptime SLA: {SCHOOL_INFRASTRUCTURE_SPECS.uptimeTarget}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md cursor-pointer"
            >
              {language === 'sw' ? 'Funga Mchoro' : 'Close Architecture'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
