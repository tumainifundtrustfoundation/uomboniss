import React, { useState } from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  Award,
  TrendingUp,
  Search,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StudentResult } from '../../types';
import {
  UOMBONI_NOTICEBOARD_SUMMARY,
  AUTHENTIC_UOMBONI_NOTICEBOARD_STUDENTS,
  NoticeboardSummaryData,
} from '../../data/uomboniNoticeboardResults';
import {
  CSSC_FORM_FOUR_CENTRE_STATS_2026,
  CSSC_FORM_FOUR_JOINT_RESULTS_2026,
  CSSC_FORM_TWO_CENTRE_STATS_2026,
  CSSC_FORM_TWO_JOINT_RESULTS_2026,
} from '../../data/csscJointExamResults2026';
import { downloadClassBroadsheetPdf } from '../../utils/pdfService';
import { exportResultsToExcel } from '../../utils/excelService';

interface NoticeboardBroadsheetViewProps {
  onSelectStudent?: (student: StudentResult) => void;
}

export const NoticeboardBroadsheetView: React.FC<NoticeboardBroadsheetViewProps> = ({
  onSelectStudent,
}) => {
  const { language } = useLanguage();
  const [selectedExamType, setSelectedExamType] = useState<'cssc_f4_2026' | 'cssc_f2_2026' | 'annual_f4_2025'>('cssc_f4_2026');
  const [filterQuery, setFilterQuery] = useState('');

  // Determine active dataset based on selected examination
  let candidates: StudentResult[] = CSSC_FORM_FOUR_JOINT_RESULTS_2026;
  let summary: NoticeboardSummaryData = {
    classGpa: CSSC_FORM_FOUR_CENTRE_STATS_2026.centreGpa,
    classGpaGrade: 'D',
    classAverage: 43.8,
    classAverageGrade: 'D',
    totalStudents: CSSC_FORM_FOUR_CENTRE_STATS_2026.totalSat,
    boysCount: 11,
    girlsCount: 8,
    gradeSummary: [
      { grade: 'A', f: 0, m: 0, total: 0 },
      { grade: 'B', f: 0, m: 0, total: 0 },
      { grade: 'C', f: 1, m: 3, total: 4 },
      { grade: 'D', f: 7, m: 7, total: 14 },
      { grade: 'F', f: 0, m: 1, total: 1 },
    ],
    best5: [
      { position: 1, name: 'Daudi Inocent Massawe', sex: 'M', points: 19, division: 'Division II', average: 53.6 },
      { position: 1, name: 'Benedict Kimaro Xx', sex: 'F', points: 19, division: 'Division II', average: 53.6 },
      { position: 3, name: 'Meshaki Peter Olomi', sex: 'M', points: 20, division: 'Division II', average: 52.0 },
      { position: 4, name: 'Dminick Bonventure Masunga', sex: 'M', points: 21, division: 'Division II', average: 50.4 },
      { position: 5, name: 'Juliet Abeli Lyimo', sex: 'F', points: 22, division: 'Division III', average: 48.8 },
    ],
    last5: [
      { position: 15, name: 'Anita Miraji Muhamed', sex: 'F', points: 28, division: 'Division IV', average: 39.0 },
      { position: 16, name: 'David Dismas Vicent', sex: 'M', points: 28, division: 'Division IV', average: 37.7 },
      { position: 17, name: 'Isdory Wilhelim Kawishe', sex: 'M', points: 27, division: 'Division IV', average: 39.5 },
      { position: 18, name: 'Simon Narsis Mramba', sex: 'M', points: 30, division: 'Division IV', average: 34.6 },
      { position: 19, name: 'Wilbroad Peter Kiwale', sex: 'M', points: 32, division: 'Division IV', average: 30.9 },
    ],
  };
  let examTitle = 'FORM 4 • CSSC NORTHERN ZONE JOINT EXAM (NZJES) • AGOSTI 2026';
  let centreStats = CSSC_FORM_FOUR_CENTRE_STATS_2026;

  if (selectedExamType === 'cssc_f2_2026') {
    candidates = CSSC_FORM_TWO_JOINT_RESULTS_2026;
    centreStats = CSSC_FORM_TWO_CENTRE_STATS_2026 as any;
    examTitle = 'FORM 2 • CSSC NORTHERN ZONE JOINT EXAM (NZJES) • AGOSTI 2026';
    summary = {
      classGpa: CSSC_FORM_TWO_CENTRE_STATS_2026.centreGpa,
      classGpaGrade: 'D',
      classAverage: 39.4,
      classAverageGrade: 'D',
      totalStudents: CSSC_FORM_TWO_CENTRE_STATS_2026.totalSat,
      boysCount: 14,
      girlsCount: 10,
      gradeSummary: [
        { grade: 'A', f: 0, m: 0, total: 0 },
        { grade: 'B', f: 0, m: 2, total: 2 },
        { grade: 'C', f: 2, m: 3, total: 5 },
        { grade: 'D', f: 8, m: 9, total: 17 },
        { grade: 'F', f: 0, m: 0, total: 0 },
      ],
      best5: [
        { position: 1, name: 'Braiton Avelin Massawe', sex: 'M', points: 18, division: 'Division II', average: 56.4 },
        { position: 1, name: 'Nelson Martini Anzelimu', sex: 'M', points: 18, division: 'Division II', average: 56.4 },
        { position: 3, name: 'Cesilia Samson Ambros', sex: 'F', points: 19, division: 'Division II', average: 54.9 },
        { position: 4, name: 'Beatrice Ally Issa', sex: 'F', points: 20, division: 'Division II', average: 52.4 },
        { position: 5, name: 'Jovin Livin Priva', sex: 'M', points: 21, division: 'Division II', average: 51.1 },
      ],
      last5: [
        { position: 20, name: 'Devota Marco Ritte', sex: 'F', points: 31, division: 'Division IV', average: 30.0 },
        { position: 21, name: 'Jenipher Sebastian Kimario', sex: 'F', points: 31, division: 'Division IV', average: 30.0 },
        { position: 22, name: 'Princess Salvatory Mtui', sex: 'F', points: 31, division: 'Division IV', average: 32.0 },
        { position: 23, name: 'Paulo Benedict Jamara', sex: 'M', points: 31, division: 'Division IV', average: 30.0 },
        { position: 24, name: 'Vicent Deogratias Kimbi', sex: 'M', points: 31, division: 'Division IV', average: 31.0 },
      ],
    };
  } else if (selectedExamType === 'annual_f4_2025') {
    candidates = AUTHENTIC_UOMBONI_NOTICEBOARD_STUDENTS;
    summary = UOMBONI_NOTICEBOARD_SUMMARY;
    centreStats = null as any;
    examTitle = 'FORM 4 • ANNUAL EXAMINATION 2025 • MARANGU, MOSHI';
  }

  const filteredCandidates = candidates.filter(
    (c) =>
      c.studentName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.examNumber.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    downloadClassBroadsheetPdf(candidates, `${examTitle} - Uomboni Secondary School`);
  };

  const handleExportExcel = () => {
    exportResultsToExcel(candidates, `Uomboni_${selectedExamType}_Broadsheet`);
  };

  return (
    <div className="space-y-6">
      {/* Exam Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300 print:hidden">
        <button
          type="button"
          onClick={() => setSelectedExamType('cssc_f4_2026')}
          id="btn-switch-cssc-f4-2026"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            selectedExamType === 'cssc_f4_2026'
              ? 'bg-blue-950 text-amber-300 shadow-md scale-102 ring-2 ring-blue-500/20'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>CSSC Form 4 (Agosti 2026 • Watahiniwa 19)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedExamType('cssc_f2_2026')}
          id="btn-switch-cssc-f2-2026"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            selectedExamType === 'cssc_f2_2026'
              ? 'bg-blue-950 text-amber-300 shadow-md scale-102 ring-2 ring-blue-500/20'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>CSSC Form 2 (Agosti 2026 • Watahiniwa 24)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedExamType('annual_f4_2025')}
          id="btn-switch-annual-f4-2025"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            selectedExamType === 'annual_f4_2025'
              ? 'bg-blue-950 text-amber-300 shadow-md scale-102 ring-2 ring-blue-500/20'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>Form 4 Annual Examination 2025</span>
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase">
              {language === 'sw' ? 'Mbao ya Matokeo (Class Noticeboard Broadsheet)' : 'Official Noticeboard Broadsheet'}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              {examTitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filter */}
          <div className="relative">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={language === 'sw' ? 'Chuja jina/namba...' : 'Filter candidate...'}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-600 w-44"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={handlePrint}
            id="btn-print-noticeboard"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Chapa' : 'Print'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            id="btn-pdf-noticeboard"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>PDF Broadsheet</span>
          </button>

          <button
            onClick={handleExportExcel}
            id="btn-excel-noticeboard"
            className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
            <span>Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Noticeboard Physical Document Look */}
      <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-2xl p-6 sm:p-10 space-y-8 font-sans print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="text-center space-y-1.5 pb-4 border-b-2 border-slate-900">
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight font-serif">
            UOMBONI SECONDARY SCHOOL
          </h1>
          <div className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
            EXAMINATION RESULTS BROAD SHEET & NOTICEBOARD SUMMARY
          </div>
          <div className="text-xs text-blue-900 font-mono font-bold tracking-wide">
            {examTitle}
          </div>
        </div>

        {/* CSSC Official Rankings Strip (if viewing CSSC exam) */}
        {centreStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl shadow-md border border-blue-900/50">
            <div className="text-center space-y-0.5 border-r border-white/10 last:border-none">
              <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
                NAFASI KIKANDA (OVERALL)
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-300 font-mono">
                {centreStats.overallPosition}
              </span>
              <span className="text-[10px] text-slate-400 block">Kanda ya Kaskazini</span>
            </div>
            <div className="text-center space-y-0.5 border-r border-white/10 last:border-none">
              <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
                NAFASI KIMKOA (REGION)
              </span>
              <span className="text-lg sm:text-xl font-black text-cyan-300 font-mono">
                {centreStats.regionPosition}
              </span>
              <span className="text-[10px] text-slate-400 block">Mkoa wa Kilimanjaro</span>
            </div>
            <div className="text-center space-y-0.5 border-r border-white/10 last:border-none">
              <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
                NAFASI KIJIMBO (DIOCESE)
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-300 font-mono">
                {centreStats.diocesePosition}
              </span>
              <span className="text-[10px] text-slate-400 block">Jimbo Katoliki Moshi</span>
            </div>
            <div className="text-center space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
                KIWANGO CHA UMAHIRI
              </span>
              <span className="text-sm sm:text-base font-black text-white block truncate">
                {centreStats.competencyLevel}
              </span>
              <span className="text-[10px] text-amber-300 font-mono font-bold block">
                GPA {centreStats.centreGpa.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {/* Authentic Top Metrics Grid (GPA & CLASS AVERAGE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-blue-50/70 border-2 border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black text-blue-700 block tracking-wider">
                CLASS GPA
              </span>
              <div className="text-2xl sm:text-3xl font-black text-blue-950 font-mono">
                {summary.classGpa.toFixed(4)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">GRADE</span>
              <span className="text-2xl font-black px-3 py-0.5 rounded-xl bg-blue-900 text-white inline-block">
                {summary.classGpaGrade}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black text-emerald-700 block tracking-wider">
                CLASS AVERAGE
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
                {summary.classAverage}%
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">GRADE</span>
              <span className="text-2xl font-black px-3 py-0.5 rounded-xl bg-emerald-800 text-white inline-block">
                {summary.classAverageGrade}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Analytics Tables from the Photo: (1) Grades Summary, (2) Best 5, (3) Last 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table 1: STUDENTS AVERAGE GRADES PERFORMANCE SUMMARY */}
          <div className="rounded-2xl border-2 border-slate-300 overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white px-3.5 py-2.5 text-center">
              <h4 className="text-[11px] font-black uppercase tracking-wider">
                STUDENTS AVERAGE GRADES PERFOMANCE SUMMARY
              </h4>
            </div>
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-[11px] text-slate-700 border-b border-slate-300">
                  <th className="py-2 px-2 border-r border-slate-200">GRADE</th>
                  <th className="py-2 px-2 border-r border-slate-200">F</th>
                  <th className="py-2 px-2 border-r border-slate-200">M</th>
                  <th className="py-2 px-2">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                {summary.gradeSummary.map((row) => (
                  <tr key={row.grade} className="hover:bg-slate-50">
                    <td className="py-2 px-2 border-r border-slate-200 font-black">{row.grade}</td>
                    <td className="py-2 px-2 border-r border-slate-200">{row.f}</td>
                    <td className="py-2 px-2 border-r border-slate-200">{row.m}</td>
                    <td className="py-2 px-2 font-bold">{row.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200 font-black text-slate-900 text-xs border-t-2 border-slate-300">
                  <td className="py-2 px-2 border-r border-slate-300">TOTAL</td>
                  <td className="py-2 px-2 border-r border-slate-300">{summary.girlsCount}</td>
                  <td className="py-2 px-2 border-r border-slate-300">{summary.boysCount}</td>
                  <td className="py-2 px-2">{summary.totalStudents}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Table 2: BEST 05 STUDENTS */}
          <div className="rounded-2xl border-2 border-emerald-300 overflow-hidden shadow-xs">
            <div className="bg-emerald-900 text-white px-3.5 py-2.5 text-center">
              <h4 className="text-[11px] font-black uppercase tracking-wider">
                ★ BEST 05 STUDENTS ★
              </h4>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50 font-bold text-[10px] text-emerald-900 border-b border-emerald-200">
                  <th className="py-2 px-2 text-center">POS</th>
                  <th className="py-2 px-2">STUDENT NAME</th>
                  <th className="py-2 px-1 text-center">SEX</th>
                  <th className="py-2 px-1 text-center">PTS</th>
                  <th className="py-2 px-1 text-center">DIV</th>
                  <th className="py-2 px-2 text-center">AVG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100 font-semibold text-slate-800">
                {summary.best5.map((st) => (
                  <tr key={st.name} className="hover:bg-emerald-50/50">
                    <td className="py-2 px-2 text-center font-black text-emerald-800">
                      #{st.position}
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-900 truncate max-w-[120px]">
                      {st.name}
                    </td>
                    <td className="py-2 px-1 text-center text-slate-600">{st.sex}</td>
                    <td className="py-2 px-1 text-center font-mono font-bold">{st.points}</td>
                    <td className="py-2 px-1 text-center font-bold text-blue-800">{st.division}</td>
                    <td className="py-2 px-2 text-center font-black text-emerald-900">{st.average}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table 3: LAST 05 STUDENTS */}
          <div className="rounded-2xl border-2 border-amber-300 overflow-hidden shadow-xs">
            <div className="bg-amber-950 text-white px-3.5 py-2.5 text-center">
              <h4 className="text-[11px] font-black uppercase tracking-wider">
                LAST 05 STUDENTS (REMEDIAL CARE)
              </h4>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-amber-50 font-bold text-[10px] text-amber-900 border-b border-amber-200">
                  <th className="py-2 px-2 text-center">POS</th>
                  <th className="py-2 px-2">STUDENT NAME</th>
                  <th className="py-2 px-1 text-center">SEX</th>
                  <th className="py-2 px-1 text-center">PTS</th>
                  <th className="py-2 px-1 text-center">DIV</th>
                  <th className="py-2 px-2 text-center">AVG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 font-semibold text-slate-800">
                {summary.last5.map((st) => (
                  <tr key={st.name} className="hover:bg-amber-50/50">
                    <td className="py-2 px-2 text-center font-black text-amber-900">
                      #{st.position}
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-900 truncate max-w-[120px]">
                      {st.name}
                    </td>
                    <td className="py-2 px-1 text-center text-slate-600">{st.sex}</td>
                    <td className="py-2 px-1 text-center font-mono">{st.points}</td>
                    <td className="py-2 px-1 text-center font-bold text-orange-800">{st.division}</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-700">{st.average}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Master Student Scores Table (Matching Full Sheet from image.png) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {language === 'sw'
                ? 'Jedwali Kamili la Matokeo ya Watahiniwa (Complete Results Broadsheet)'
                : 'Complete Candidates Performance Matrix'}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Bofya jina lolote kuona ripoti binafsi ya mwanafunzi (Click any student to view report card)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-slate-300 shadow-sm">
            <table className="w-full text-left text-[11px] border-collapse font-sans whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-2 text-center w-8">POS</th>
                  <th className="py-2.5 px-3 min-w-[160px]">STUDENT NAME</th>
                  <th className="py-2.5 px-1 text-center w-8">SEX</th>
                  <th className="py-2.5 px-2 text-center">CIV</th>
                  <th className="py-2.5 px-2 text-center">HIST</th>
                  <th className="py-2.5 px-2 text-center">GEO</th>
                  <th className="py-2.5 px-2 text-center">KISW</th>
                  <th className="py-2.5 px-2 text-center">ENGL</th>
                  <th className="py-2.5 px-2 text-center">PHY</th>
                  <th className="py-2.5 px-2 text-center">CHEM</th>
                  <th className="py-2.5 px-2 text-center">BIO</th>
                  <th className="py-2.5 px-2 text-center">B/MATH</th>
                  <th className="py-2.5 px-2 text-center">LIT</th>
                  <th className="py-2.5 px-2 text-center">AVG%</th>
                  <th className="py-2.5 px-2 text-center">GRD</th>
                  <th className="py-2.5 px-2 text-center">PTS</th>
                  <th className="py-2.5 px-2 text-center">DIV</th>
                  <th className="py-2.5 px-2 text-center print:hidden">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredCandidates.map((st, idx) => {
                  const getSub = (code: string) => st.subjects.find((s) => s.code === code);
                  const civ = getSub('011');
                  const hist = getSub('012');
                  const geo = getSub('013');
                  const kisw = getSub('021');
                  const engl = getSub('022');
                  const phy = getSub('031');
                  const chem = getSub('032');
                  const bio = getSub('033');
                  const math = getSub('041');
                  const lit = getSub('024');

                  const formatSubCell = (sub?: any) => {
                    if (!sub || sub.remarks?.includes('ABS')) return <span className="text-slate-300">—</span>;
                    let color = 'text-slate-700';
                    if (sub.grade === 'A') color = 'text-emerald-700 font-black';
                    else if (sub.grade === 'B') color = 'text-blue-700 font-bold';
                    else if (sub.grade === 'F') color = 'text-red-600';

                    return (
                      <span className={color}>
                        {sub.score} <strong className="text-[10px] opacity-80">{sub.grade}</strong>
                      </span>
                    );
                  };

                  return (
                    <tr
                      key={`${st.id}-${st.examNumber || idx}-${idx}`}
                      className={`hover:bg-blue-50/60 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      <td className="py-2 px-2 text-center font-bold text-slate-800">
                        {st.classPosition}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        <button
                          type="button"
                          onClick={() => onSelectStudent && onSelectStudent(st)}
                          className="hover:text-blue-700 hover:underline text-left cursor-pointer"
                        >
                          {st.studentName}
                        </button>
                        <div className="text-[9px] text-slate-400 font-mono">{st.examNumber}</div>
                      </td>
                      <td className="py-2 px-1 text-center font-semibold text-slate-600">{st.gender}</td>
                      <td className="py-2 px-2 text-center">{formatSubCell(civ)}</td>
                      <td className="py-2 px-2 text-center">{formatSubCell(hist)}</td>
                      <td className="py-2 px-2 text-center">{formatSubCell(geo)}</td>
                      <td className="py-2 px-2 text-center">{formatSubCell(kisw)}</td>
                      <td className="py-2 px-2 text-center">{formatSubCell(engl)}</td>
                      <td className="py-2 px-2 text-center">{formatSubCell(phy)}</td>
                      <td className="py-2 px-2 text-center">{formatSubCell(chem)}</td>
                      <td className="py-2 px-2 text-center">{formatSubCell(bio)}</td>
                      <td className="py-2 px-2 text-center">{formatSubCell(math)}</td>
                      <td className="py-2 px-2 text-center">{formatSubCell(lit)}</td>
                      <td className="py-2 px-2 text-center font-black text-slate-900 font-mono">
                        {st.averageMarks}%
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-blue-900">
                        {st.averageMarks >= 75 ? 'A' : st.averageMarks >= 65 ? 'B' : st.averageMarks >= 45 ? 'C' : st.averageMarks >= 30 ? 'D' : 'F'}
                      </td>
                      <td className="py-2 px-2 text-center font-bold font-mono text-slate-800">
                        {st.points}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            st.division === 'Division II'
                              ? 'bg-blue-100 text-blue-800'
                              : st.division === 'Division III'
                              ? 'bg-amber-100 text-amber-800'
                              : st.division === 'Division IV'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {st.division.replace('Division ', 'DIV ')}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center print:hidden">
                        <button
                          type="button"
                          onClick={() => onSelectStudent && onSelectStudent(st)}
                          className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ripoti</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Circular Stamp & Footer Endorsement */}
        <div className="pt-6 border-t-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-bold text-slate-800">
              OFISI YA TAALUMA • SHULE YA SEKONDARI UOMBONI
            </div>
            <p className="text-[11px] text-slate-500 max-w-md">
              Matokeo haya yamekaguliwa na kuidhinishwa na Kamati ya Kitaaluma na Mkuu wa Shule kulingana na miongozo ya NECTA na Wizara ya Elimu.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center space-y-1">
              <div className="h-8 border-b border-dashed border-slate-400 w-32 flex items-end justify-center pb-0.5 font-serif italic text-xs">
                Fr. P. Mushi
              </div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">
                HEADMASTER SIGNATURE
              </span>
            </div>

            {/* Circular Stamp */}
            <div className="w-24 h-24 rounded-full border-3 border-emerald-700/80 p-1 flex flex-col items-center justify-center text-center text-emerald-800 font-bold rotate-[-8deg] select-none">
              <div className="text-[6.5px] uppercase">★ UOMBONI SEC. SCHOOL ★</div>
              <div className="text-[7.5px] font-black uppercase text-blue-900 my-0.5">HEADMASTER</div>
              <div className="text-[6.5px]">P.O. BOX 361</div>
              <div className="text-[6.5px] font-bold">MARANGU</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
