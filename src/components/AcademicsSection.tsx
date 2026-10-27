import React from 'react';
import { GraduationCap, Users, ShieldCheck, Lock } from 'lucide-react';

interface AcademicsSectionProps {
  onOpenAdmissions?: () => void;
  onOpenResults?: () => void;
  onOpenAcademicPortal?: () => void;
  onOpenParentPortal?: () => void;
}

export const AcademicsSection: React.FC<AcademicsSectionProps> = ({
  onOpenAdmissions,
  onOpenResults,
  onOpenAcademicPortal,
  onOpenParentPortal,
}) => {
  const forms = [
    {
      form: 'Form One',
      description: 'Foundational secondary stage introducing secondary science subjects, advanced mathematics, English communication, and disciplined study habits.',
      focus: 'Foundations & Transition',
    },
    {
      form: 'Form Two',
      description: 'Core subject deepening and intensive preparation for the National Form Two Assessment (FTNA) administered by NECTA.',
      focus: 'FTNA National Assessment',
    },
    {
      form: 'Form Three',
      description: 'Specialized subject concentration, extensive practical laboratory experiments, and coursework mastery across arts and sciences.',
      focus: 'Specialization & Practicals',
    },
    {
      form: 'Form Four',
      description: 'Comprehensive academic revision, mock examination series, and preparation for the Certificate of Secondary Education Examination (CSEE).',
      focus: 'NECTA CSEE Preparation',
    },
  ];

  const departments = [
    {
      name: 'Science',
      subjects: 'Physics, Chemistry & Biology',
      description: 'Rigorous theoretical instruction reinforced with hands-on laboratory experiments, scientific reasoning, and practical test readiness.',
    },
    {
      name: 'Mathematics',
      subjects: 'Basic Mathematics',
      description: 'Focus on logical deduction, problem solving, algebraic methods, geometry, trigonometry, and statistical analysis.',
    },
    {
      name: 'Languages',
      subjects: 'English & Kiswahili',
      description: 'Comprehensive grammatical instruction, literature comprehension, essay composition, and spoken communication fluency.',
    },
    {
      name: 'Humanities',
      subjects: 'History, Geography & Civics',
      description: 'Critical exploration of national heritage, governance, environmental geography, global affairs, and social responsibility.',
    },
    {
      name: 'ICT',
      subjects: 'Computer Studies & Digital Literacy',
      description: 'Practical computer laboratory sessions teaching digital literacy, document preparation, internet research, and computational principles.',
    },
  ];

  return (
    <section id="academics" className="py-12 sm:py-16 bg-white border-t border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold text-[#C9A227] tracking-wider block mb-2 uppercase">
              Curriculum &amp; Learning
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
              Academics
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-700 leading-[1.75] font-normal">
              Uomboni Secondary School follows the official Tanzanian national curriculum accredited by the Ministry of Education, Science and Technology and the National Examinations Council of Tanzania (NECTA).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenResults && (
              <button
                onClick={onOpenResults}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#102A43] text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer border border-[#102A43]/20"
                title="Tazama Matokeo ya Mitihani (Faragha ya Mzazi: Majina ya Wengine Yamefichwa)"
              >
                <span>📊 Matokeo ya Mitihani</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Faragha ya Mzazi</span>
                </span>
              </button>
            )}
            {onOpenAcademicPortal && (
              <button
                onClick={onOpenAcademicPortal}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer border border-amber-500/60"
              >
                <GraduationCap className="w-4 h-4 text-slate-950" />
                <span>🎓 Portal ya Taaluma</span>
              </button>
            )}
            {onOpenParentPortal && (
              <button
                onClick={onOpenParentPortal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#704214] hover:bg-[#58330F] text-[#FFFFF0] text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer border border-[#C9A227]/40"
                title="Portal ya Mzazi: Tazama matokeo ya mwanao pekee"
              >
                <Users className="w-4 h-4 text-[#C9A227]" />
                <span>👨‍👩‍👧 Portal ya Mzazi</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Academic Levels (Forms 1–4) */}
        <div className="mt-12">
          <h3 className="text-base font-semibold text-[#102A43] mb-6 flex items-center gap-2">
            <span>Academic Levels</span>
            <span className="h-px bg-slate-200 flex-grow max-w-xs" />
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {forms.map((item) => (
              <div
                key={item.form}
                className="bg-[#FFFFF0] p-6 rounded-lg border border-[#102A43]/10 border-t-2 border-t-[#102A43] flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-semibold text-[#C9A227] tracking-wider uppercase">
                    {item.focus}
                  </div>
                  <h4 className="text-lg font-semibold text-[#102A43] mt-1">
                    {item.form}
                  </h4>
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-[1.7] font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Core Academic Departments */}
        <div className="mt-16">
          <h3 className="text-base font-semibold text-[#102A43] mb-6 flex items-center gap-2">
            <span>Core Subject Departments</span>
            <span className="h-px bg-slate-200 flex-grow max-w-xs" />
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="bg-white p-6 rounded-lg border border-slate-200 border-l-4 border-l-[#C9A227] shadow-xs"
              >
                <h4 className="text-base font-semibold text-[#102A43]">
                  {dept.name}
                </h4>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  {dept.subjects}
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-[1.7] font-normal">
                  {dept.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info strip — Student Privacy & Parental Results Notice */}
        <div className="mt-12 p-6 rounded-2xl bg-[#FFFFF0] border-2 border-[#C9A227]/40 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ulinzi wa Faragha: Mzazi Anaona Matokeo ya Mwanae Tu</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                NECTA S0486
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-[#102A43]">
              Majina ya Wanafunzi Wengine Yamefichwa Kulinda Faragha ya Mtoto
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Katika shule ya sekondari Uomboni, kila mzazi au mlezi anapofungua ripoti za mitihani ataona taarifa kamili na matokeo ya mwanafunzi wake pekee. Majina ya watahiniwa wengine hufichwa kwenye orodha zote za mitihani ili kulinda faragha ya watoto kwa mujibu wa miongozo ya elimu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
            {onOpenParentPortal && (
              <button
                onClick={onOpenParentPortal}
                className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-bold text-[#FFFFF0] bg-[#704214] hover:bg-[#58330F] rounded-xl transition-all cursor-pointer shadow-sm border border-[#C9A227]/40 flex items-center justify-center gap-2"
              >
                <Users className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Fungua Portal ya Mzazi (Mwanao Tu)</span>
              </button>
            )}
            {onOpenResults && (
              <button
                onClick={onOpenResults}
                className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#102A43] border border-[#102A43]/20 bg-white hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Tazama Matokeo (Search)</span>
              </button>
            )}
            {onOpenAcademicPortal && (
              <button
                onClick={onOpenAcademicPortal}
                className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shadow-xs border border-amber-500/50 flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Portal ya Taaluma</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
