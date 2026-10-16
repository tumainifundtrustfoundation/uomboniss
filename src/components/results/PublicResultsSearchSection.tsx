import React, { useState } from 'react';
import {
  Search,
  Award,
  Sparkles,
  Calendar,
  Layers,
  BookOpen,
  Filter,
  CheckCircle2,
  Users,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StudentResult } from '../../types';
import { SchoolLogo } from '../SchoolLogo';

interface PublicResultsSearchSectionProps {
  studentResults: StudentResult[];
  selectedExam: string;
  setSelectedExam: (exam: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectStudent: (student: StudentResult) => void;
  activeResultId?: string;
}

export const PublicResultsSearchSection: React.FC<PublicResultsSearchSectionProps> = ({
  studentResults,
  selectedExam,
  setSelectedExam,
  selectedYear,
  setSelectedYear,
  searchQuery,
  setSearchQuery,
  onSelectStudent,
  activeResultId,
}) => {
  const { language } = useLanguage();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      // If query matches any student, select them
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const found = studentResults.find(
          (s) =>
            s.examNumber.toLowerCase().includes(q) ||
            s.studentName.toLowerCase().includes(q)
        );
        if (found) {
          onSelectStudent(found);
        }
      }
    }, 350);
  };

  // Top featured students from authentic noticeboard
  const quickStudents = studentResults.slice(0, 8);

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl overflow-hidden">
      {/* Official Uomboni Header Ribbon */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-emerald-950 p-6 sm:p-8 text-white relative">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <SchoolLogo className="w-full h-full object-contain" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30 uppercase tracking-widest">
                NECTA Center S0486 • Marangu, Moshi
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                UOMBONI SECONDARY SCHOOL
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold text-emerald-300">
                <span>&ldquo;Tujiendeleze Sisi Wenyewe&rdquo;</span>
                <span className="text-white/40">•</span>
                <span className="text-amber-200">&ldquo;Education | Pray | Work&rdquo;</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center sm:text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
              {language === 'sw' ? 'Tovuti ya Matokeo' : 'Results Publication Portal'}
            </span>
            <span className="text-base font-black text-amber-300 font-mono">
              OFFICIAL S0486
            </span>
            <div className="flex items-center justify-center sm:justify-end gap-1.5 mt-1 text-[11px] text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{language === 'sw' ? 'Matokeo Yaliyoidhinishwa' : 'Verified & Live'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Examination Search Controls */}
      <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
        <form onSubmit={handleSearchClick} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
            {/* SELECT EXAMINATION */}
            <div className="md:col-span-4 space-y-1.5">
              <label
                htmlFor="search-exam-type"
                className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                <span>{language === 'sw' ? 'CHAGUA MTIHANI (EXAMINATION)' : 'SELECT EXAMINATION'}</span>
              </label>
              <select
                id="search-exam-type"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-bold focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all cursor-pointer shadow-xs"
              >
                <option value="ALL">{language === 'sw' ? 'Mitihani Yote (All Exams)' : 'All Examinations'}</option>
                <option value="CSSC Joint Examination 2026">CSSC Joint Examination 2026 (Agosti 2026)</option>
                <option value="Annual Examination 2025">Annual Examination 2025</option>
                <option value="NECTA Mock 2025">NECTA Mock 2025</option>
                <option value="Mid-Term Exam 2025">Mid-Term Exam 2025</option>
                <option value="Terminal Examination 2025">Terminal Examination 2025</option>
              </select>
            </div>

            {/* SELECT YEAR */}
            <div className="md:col-span-3 space-y-1.5">
              <label
                htmlFor="search-exam-year"
                className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>{language === 'sw' ? 'CHAGUA MWAKA (YEAR)' : 'SELECT YEAR'}</span>
              </label>
              <select
                id="search-exam-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-bold focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer shadow-xs"
              >
                <option value="ALL">{language === 'sw' ? 'Miaka Yote' : 'All Years'}</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            {/* ENTER STUDENT NUMBER */}
            <div className="md:col-span-5 space-y-1.5">
              <label
                htmlFor="search-student-number"
                className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'sw' ? 'NAMBA YA MTAHINIWA, PREM AU JINA' : 'EXAM NO, PREM OR STUDENT NAME'}</span>
              </label>
              <div className="relative">
                <input
                  id="search-student-number"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'sw' ? 'Mfano: S.0486.0014, PREM au BENEDICT' : 'e.g. S.0486.0014, PREM or BENEDICT'}
                  className="w-full pl-4 pr-10 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-500">
              {language === 'sw'
                ? 'Weka namba ya mtihani, namba ya PREM / mtihani wa la saba, au jina la mwanafunzi kisha bofya kitufe cha kutafuta matokeo.'
                : 'Enter the candidate examination number, PREM / Std 7 exam number, or student name then click Search Results.'}
            </p>

            <button
              type="submit"
              id="btn-public-search-results"
              disabled={isSearching}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-800 hover:from-blue-800 hover:to-emerald-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-102"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'sw' ? 'Inatafuta Matokeo...' : 'Searching Results...'}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-amber-300" />
                  <span>{language === 'sw' ? 'TAFUTA MATOKEO (SEARCH RESULTS)' : 'SEARCH RESULTS'}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Select Candidates from Authentic Noticeboard */}
        <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'sw' ? 'Watahiniwa wa Mfano (Bofya Kuona Matokeo Papo Hapo):' : 'Quick Select Candidates (Click to View Instantly):'}</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {studentResults.length} {language === 'sw' ? 'Watahiniwa Hewani' : 'Published Candidates'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickStudents.map((st, idx) => {
              const isActive = activeResultId === st.id;
              const shortNum = st.examNumber.split('/')[1] || st.examNumber;

              return (
                <button
                  key={`${st.id}-${st.examNumber || idx}-${idx}`}
                  type="button"
                  id={`quick-student-${st.id}`}
                  onClick={() => onSelectStudent(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? 'bg-blue-900 text-amber-300 border-blue-900 shadow-md font-bold scale-102 ring-2 ring-blue-500/20'
                      : 'bg-white hover:bg-blue-50/70 text-slate-800 border-slate-200/90 shadow-2xs'
                  }`}
                >
                  <span className="font-mono text-[11px] text-blue-700 font-bold bg-blue-100/70 px-1.5 py-0.5 rounded-md">
                    {shortNum}
                  </span>
                  <span>{st.studentName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      st.division === 'Division I'
                        ? 'bg-emerald-100 text-emerald-800'
                        : st.division === 'Division II'
                        ? 'bg-blue-100 text-blue-800'
                        : st.division === 'Division III'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {st.division.replace('Division ', 'Div ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
