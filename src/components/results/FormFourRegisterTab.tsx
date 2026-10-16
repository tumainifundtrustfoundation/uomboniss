import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Printer,
  Download,
  Users,
  Award,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Filter,
  Eye,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  OFFICIAL_FORM_FOUR_REGISTER_DATA,
  FORM_FOUR_STUDENT_PROFILES,
} from '../../data/formFourStudents';
import { downloadClassBroadsheetPdf } from '../../utils/pdfService';
import { exportResultsToExcel } from '../../utils/excelService';
import { StudentResult } from '../../types';

interface FormFourRegisterTabProps {
  onSelectStudentResult?: (student: StudentResult) => void;
  onOpenStudentPortal?: () => void;
}

export const FormFourRegisterTab: React.FC<FormFourRegisterTabProps> = ({
  onSelectStudentResult,
  onOpenStudentPortal,
}) => {
  const { language } = useLanguage();
  const { studentResults, loginStudent } = useData();

  const [query, setQuery] = useState('');
  const [sexFilter, setSexFilter] = useState<'ALL' | 'F' | 'M'>('ALL');
  const [streamFilter, setStreamFilter] = useState<'ALL' | 'Science' | 'Arts'>('ALL');

  const total = OFFICIAL_FORM_FOUR_REGISTER_DATA.length;
  const females = OFFICIAL_FORM_FOUR_REGISTER_DATA.filter((c) => c.sex === 'F').length;
  const males = OFFICIAL_FORM_FOUR_REGISTER_DATA.filter((c) => c.sex === 'M').length;
  const science = OFFICIAL_FORM_FOUR_REGISTER_DATA.filter((c) => c.combination === 'Science').length;
  const arts = OFFICIAL_FORM_FOUR_REGISTER_DATA.filter((c) => c.combination === 'Arts').length;

  const filtered = OFFICIAL_FORM_FOUR_REGISTER_DATA.filter((c) => {
    const matchSex = sexFilter === 'ALL' || c.sex === sexFilter;
    const matchStream = streamFilter === 'ALL' || c.combination === streamFilter;
    const q = query.toLowerCase().trim();
    const matchQ =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.indexNumber.toLowerCase().includes(q) ||
      c.rollNo.toString() === q;
    return matchSex && matchStream && matchQ;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const f4Results = studentResults.filter((r) => r.form === 'Form 4');
    if (f4Results.length > 0) {
      downloadClassBroadsheetPdf(f4Results, 'Daftari la Watahiniwa Kidato cha Nne 2026 - Kituo S.0486');
    } else {
      window.print();
    }
  };

  const handleExportExcel = () => {
    const f4Results = studentResults.filter((r) => r.form === 'Form 4');
    exportResultsToExcel(f4Results, 'UOMBONI_FORM_FOUR_CANDIDATES_2026');
  };

  const handleViewPerformance = (candidateIndex: string) => {
    // Find matching result
    const cleanIndex = candidateIndex.toLowerCase().replace(/[\/\-_.]/g, '');
    const found = studentResults.find(
      (r) => r.examNumber.toLowerCase().replace(/[\/\-_.]/g, '') === cleanIndex
    );
    if (found && onSelectStudentResult) {
      onSelectStudentResult(found);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action and Info Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-700/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold border border-amber-400/30">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>NECTA CENTER S.0486 • CSEE CANDIDATE REGISTER 2026</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'sw'
                ? 'Daftari Rasmi la Watahiniwa Kidato cha Nne'
                : 'Official Form Four Candidates Register'}
            </h3>
            <p className="text-emerald-200/90 text-xs sm:text-sm max-w-2xl">
              {language === 'sw'
                ? 'Orodha rasmi ya wanafunzi 19 wa Kidato cha Nne waliosajiliwa kufanya mtihani wa Taifa (CSEE) Shule ya Sekondari Uomboni, Moshi Vijijini.'
                : 'Official roster of 19 Form Four candidates registered for national CSEE examinations at Uomboni Secondary School, Moshi Rural.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>{language === 'sw' ? 'Chapa' : 'Print'}</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Excel Export</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>Pakua PDF Broadsheet</span>
            </button>
          </div>
        </div>

        {/* Statistical Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <div className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Jumla Watahiniwa</div>
            <div className="text-2xl font-black text-white mt-0.5">{total}</div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">Watahiniwa Wote</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <div className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Wasichana (F)</div>
            <div className="text-2xl font-black text-pink-300 mt-0.5">{females}</div>
            <div className="text-[10px] text-pink-300/80 mt-0.5">{((females / total) * 100).toFixed(1)}% ya wote</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <div className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Wavulana (M)</div>
            <div className="text-2xl font-black text-blue-300 mt-0.5">{males}</div>
            <div className="text-[10px] text-blue-300/80 mt-0.5">{((males / total) * 100).toFixed(1)}% ya wote</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <div className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Mkondo wa Sayansi</div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">{science}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">PCM / PCB / CBG</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5 col-span-2 sm:col-span-1">
            <div className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Mkondo wa Sanaa</div>
            <div className="text-2xl font-black text-purple-300 mt-0.5">{arts}</div>
            <div className="text-[10px] text-purple-300/80 mt-0.5">HGL / HGK / Arts</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'sw' ? 'Tafuta kwa jina au namba ya mtihani...' : 'Search by name or exam number...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Sex Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSexFilter('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                sexFilter === 'ALL' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wote ({total})
            </button>
            <button
              onClick={() => setSexFilter('F')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                sexFilter === 'F' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wasichana ({females})
            </button>
            <button
              onClick={() => setSexFilter('M')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                sexFilter === 'M' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wavulana ({males})
            </button>
          </div>

          {/* Stream Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStreamFilter('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                streamFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mikondo Yote
            </button>
            <button
              onClick={() => setStreamFilter('Science')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                streamFilter === 'Science' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sayansi ({science})
            </button>
            <button
              onClick={() => setStreamFilter('Arts')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                streamFilter === 'Arts' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sanaa ({arts})
            </button>
          </div>
        </div>
      </div>

      {/* Candidates Official Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-3 text-center w-12">Roll</th>
                <th className="py-3.5 px-4">Jina Kamili la Mtahiniwa</th>
                <th className="py-3.5 px-3 text-center w-16">Jinsia</th>
                <th className="py-3.5 px-3 font-mono">Namba ya Mtihani (NECTA)</th>
                <th className="py-3.5 px-3">Mkondo / Masomo</th>
                <th className="py-3.5 px-3">Malazi & Bweni</th>
                <th className="py-3.5 px-3">Wadhifa Shuleni</th>
                <th className="py-3.5 px-3 text-right">Vitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((candidate) => {
                const profile = FORM_FOUR_STUDENT_PROFILES.find(
                  (p) => p.examNumber === candidate.indexNumber
                );
                const isF = candidate.sex === 'F';

                return (
                  <tr
                    key={candidate.indexNumber}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 inline-flex items-center justify-center text-[11px] font-mono font-bold group-hover:bg-emerald-100 group-hover:text-emerald-900 transition-colors">
                        {candidate.rollNo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                        {candidate.fullName}
                        {profile?.leadershipRole && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                            {profile.leadershipRole}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>ID: {profile?.studentId || `USS-2022-${candidate.rollNo.toString().padStart(4, '0')}`}</span>
                        <span>•</span>
                        <span>Mzazi: {profile?.parentGuardianName || 'Wazazi'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isF
                            ? 'bg-pink-100 text-pink-700 border border-pink-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {isF ? 'F (Ke)' : 'M (Me)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-900 text-xs">
                      <span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
                        {candidate.indexNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          candidate.combination === 'Science'
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : 'bg-purple-50 text-purple-900 border border-purple-200'
                        }`}
                      >
                        {candidate.combination === 'Science' ? 'Sayansi (Science)' : 'Sanaa (Arts)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                      <div className="font-semibold text-slate-800">
                        {profile?.boardingStatus || 'Bweni'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {profile?.dormitoryRoom || 'Bweni Kuu'}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                      {profile?.leadershipRole || (profile?.clubs && profile.clubs[0]) || '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewPerformance(candidate.indexNumber)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Angalia Matokeo ya Mtihani"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Matokeo</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">Hakuna Mwanafunzi Aliyepatikana</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Jaribu kubadilisha vigezo vya utafutaji.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
