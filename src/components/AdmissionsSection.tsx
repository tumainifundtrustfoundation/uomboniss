import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  FileText,
  Download,
  CheckSquare,
  BookOpen,
  Shirt,
  BedDouble,
  FileCheck,
  AlertTriangle,
  Sparkles,
  Printer
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { downloadVituMuhimuPdf, downloadOfficialJoiningInstructions2027Pdf } from '../utils/pdfService';
import { VITU_MUHIMU_CATEGORIES, VITU_MUHIMU_LIST } from '../data/vituMuhimuData';

interface AdmissionsSectionProps {
  onOpenAdmissions?: () => void;
  onOpenVituMuhimu?: () => void;
  onOpenJoiningInstructions?: () => void;
}

export const AdmissionsSection: React.FC<AdmissionsSectionProps> = ({
  onOpenAdmissions,
  onOpenVituMuhimu,
  onOpenJoiningInstructions,
}) => {
  const [activeVituCategory, setActiveVituCategory] = useState<'academic' | 'uniform' | 'boarding' | 'documents'>('academic');

  const requirements = [
    'Primary School Leaving Examination (PSLE) Result Slip or Certificate',
    'Certified Copy of Official Birth Certificate (RITA)',
    'Official Transfer Letter & Academic Progress Report (for transfer applicants)',
    'Medical Examination Form signed and stamped by an authorized medical officer',
    'Four (4) recent passport-sized photographs (sky blue background)',
    'Signed School Rules and Discipline Acceptance Agreement by Parent/Guardian',
  ];

  const dates = [
    { event: 'Form One Admissions & Registration (2026/2027)', date: 'Inaendelea (Open Now)' },
    { event: 'Form 2 & 3 Transfer Applications Window', date: 'Inaendelea (Open Now)' },
    { event: 'Kuripoti Shuleni & Maandalizi ya Muhula Mpya', date: 'Januari 2026' },
  ];

  const categoryItems = VITU_MUHIMU_LIST.filter(item => item.category === activeVituCategory).slice(0, 4);

  return (
    <section id="admissions" className="py-12 sm:py-16 bg-[#FFFFF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black tracking-wider uppercase mb-2 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>TANGAZO RASMI LA UDAHILI 2026 - 2027</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
            Admissions 2026/2027
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-700 leading-[1.75] font-normal">
            Nafasi za kujiunga na Kidato cha Kwanza na Kidato cha Tatu kwa wavulana na wasichana (Bweni na Kutwa) zipo wazi. Shule ya Kikatoliki yenye malezi thabiti, maabara za kisasa, maktaba kubwa, na mazingira tulivu ya Marangu, Kilimanjaro.
          </p>
        </div>

        {/* 2 Main Entry Routes: Form 1 & Transfers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form One */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#102A43]/15 border-t-4 border-t-[#102A43] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#C9A227] tracking-wider uppercase">
                Direct Entry
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#102A43]">
                Form One Admissions
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-[1.6]">
                Wanafunzi waliohitimu Darasa la Saba (PSLE) wanakaribishwa kujiunga na Shule ya Sekondari Uomboni. Mazingira yenye utulivu wa kipekee na walimu waliojitolea.
              </p>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>Bweni na Kutwa (Wavulana &amp; Wasichana)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>Ada nafuu inayolipwa kwa awamu</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>Mazingira salama na malezi imara ya kimaadili</span>
              </li>
            </ul>
          </div>

          {/* Transfers Form 2 & 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#102A43]/15 border-t-4 border-t-[#C9A227] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#102A43] tracking-wider uppercase">
                Continuing Students
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#102A43]">
                Kidato cha 2 &amp; 3 (Transfers)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-[1.6]">
                Uhamisho kwa wanafunzi wa Kidato cha Pili na Tatu wenye maendeleo mazuri ya kitaaluma na tabia njema kutoka shule zilizosajiliwa.
              </p>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>Kipimo cha alama za mitihani ya awali</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>Mwendelezo mzuri wa masomo</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>Uzingatiaji wa nidhamu na sera za shule</span>
              </li>
            </ul>
          </div>
        </div>

        {/* VITU MUHIMU (ESSENTIAL JOINING CHECKLIST SHOWCASE) */}
        <div id="vitu-muhimu" className="bg-[#102A43] text-white rounded-3xl p-6 sm:p-10 border border-[#C9A227]/30 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black tracking-wider uppercase">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>ORODHA RASMI YA MAANDALIZI</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                Vitu Muhimu vya Kujiunga na Shule (Essential Checklist)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Mwongozo kamilifu wa vifaa vya masomo, sare rasmi, mahitaji ya bweni, nyaraka za usajili, na vitu vilivyopigwa marufuku ili mzazi na mwanafunzi wajiandae vyema kabla ya kuripoti Marangu.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => downloadVituMuhimuPdf()}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#102A43] text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#C9A227]" />
                <span>Pakua Orodha (PDF)</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenVituMuhimu) {
                    onOpenVituMuhimu();
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Fungua Orodha Kamilifu</span>
              </button>
            </div>
          </div>

          {/* Interactive Categories Bar */}
          <div className="pt-6 space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveVituCategory('academic')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeVituCategory === 'academic'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Taaluma &amp; Daftari</span>
              </button>

              <button
                onClick={() => setActiveVituCategory('uniform')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeVituCategory === 'uniform'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Shirt className="w-4 h-4" />
                <span>Sare za Shule</span>
              </button>

              <button
                onClick={() => setActiveVituCategory('boarding')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeVituCategory === 'boarding'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <BedDouble className="w-4 h-4" />
                <span>Bweni &amp; Sanduku</span>
              </button>

              <button
                onClick={() => setActiveVituCategory('documents')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeVituCategory === 'documents'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Nyaraka &amp; Vyeti</span>
              </button>
            </div>

            {/* Category Quick Preview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                        {item.quantity || 'Inahitajika'}
                      </span>
                      {item.mandatory && (
                        <span className="text-[9px] font-black uppercase text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                          Lazima
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-sm text-white leading-snug">
                      {item.nameSw}
                    </h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {item.specSw}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Uomboni Checklist</span>
                    <span className="text-amber-400">✓ Muhimu</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Angalizo la Shule:</strong> Simu za mkononi, hita za umeme na vifaa vyote vya kielektroniki vimepigwa marufuku kabisa.
                </span>
              </div>
              <button
                onClick={() => {
                  if (onOpenVituMuhimu) onOpenVituMuhimu();
                }}
                className="font-bold text-amber-300 hover:text-amber-200 underline shrink-0 cursor-pointer"
              >
                Tazama vitu vyote vilivyopigwa marufuku &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Requirements & Dates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Admission Requirements (7 cols) */}
          <div className="lg:col-span-7 bg-white p-7 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-base font-semibold text-[#102A43] mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C9A227]" />
              <span>Sifa &amp; Vigezo vya Udahili (Admission Criteria)</span>
            </h4>
            <div className="space-y-3">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-[#FFFFF0] border border-[#102A43]/20 flex items-center justify-center text-[11px] font-bold text-[#102A43] shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Dates & Application Info (5 cols) */}
          <div className="lg:col-span-5 bg-white p-7 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-[#102A43] mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C9A227]" />
                <span>Important Dates</span>
              </h4>
              <div className="space-y-3 text-xs sm:text-sm">
                {dates.map((d) => (
                  <div key={d.event} className="pb-2.5 border-b border-slate-100 last:border-b-0">
                    <span className="font-semibold text-[#102A43] block">{d.event}</span>
                    <span className="text-slate-500 text-xs">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <h5 className="text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1">
                Upatikanaji wa Fomu (Kwenye Tangazo la Shule)
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fomu za kujiunga zinapatikana: <strong>Ofisi ya Shule Marangu</strong>, <strong>Moshi Bookshop</strong>, na <strong>Ngarenaro</strong>. Pia unaweza kupakua mtandaoni hapa.
              </p>
              <div className="mt-2 text-[11px] text-slate-700 font-mono font-bold">
                Mawasiliano: 0752 000 939 | 0782 558 127 | 0745 548 225 | 0754 532 949
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Strip with School Logo */}
        <div className="p-6 rounded-2xl bg-white border border-[#102A43]/15 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="p-2 rounded-xl bg-[#FFFFF0] border border-[#C9A227]/40 shadow-xs shrink-0">
              <SchoolLogo size="md" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#102A43]">
                Ready to Apply for Uomboni Secondary School?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Review full joining instructions, fee structure, and complete your admission request.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                if (onOpenJoiningInstructions) {
                  onOpenJoiningInstructions();
                } else {
                  const el = document.getElementById('joining-instructions');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-[#102A43] hover:from-emerald-700 hover:to-[#0A1C2E] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 border border-emerald-600/40"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Fomu Rasmi ya Kujiunga 2027</span>
            </button>

            <button
              onClick={() => downloadOfficialJoiningInstructions2027Pdf()}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#102A43] font-bold text-xs sm:text-sm border border-slate-300 transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              title="Pakua Fomu Rasmi ya Kujiunga (PDF)"
            >
              <Download className="w-4 h-4 text-amber-600" />
              <span>Pakua Fomu (PDF)</span>
            </button>

            <button
              onClick={() => {
                if (onOpenVituMuhimu) onOpenVituMuhimu();
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Vitu Muhimu</span>
            </button>

            <button
              id="admissions-view-btn"
              onClick={onOpenAdmissions}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#102A43] text-white font-semibold text-xs sm:text-sm hover:bg-[#0A1C2E] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 group shrink-0"
            >
              <span>Omba Mtandaoni</span>
              <ArrowRight className="w-4 h-4 text-[#C9A227] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

