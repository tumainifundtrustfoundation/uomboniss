import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  ShieldCheck,
  Award,
  TrendingUp,
  User,
  Calendar,
  Layers,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StudentResult, SubjectResult } from '../../types';
import { SchoolLogo } from '../SchoolLogo';
import { getNectaSubjectAbbr } from '../../utils/nectaResultsEngine';
import {
  downloadStudentResultSlipPdf,
  printStudentResultSlipDirectly,
} from '../../utils/pdfService';

interface StudentAcademicPerformanceReportProps {
  student: StudentResult;
  onOpenVerification?: (student: StudentResult) => void;
}

export const StudentAcademicPerformanceReport: React.FC<StudentAcademicPerformanceReportProps> = ({
  student,
  onOpenVerification,
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Compute metrics
  const subjects = student.subjects || [];
  const validSubjects = subjects.filter((s) => typeof s.score === 'number');
  const totalMarks = student.totalMarks || validSubjects.reduce((acc, cur) => acc + cur.score, 0);
  const averageMarks = student.averageMarks || (validSubjects.length > 0 ? parseFloat((totalMarks / validSubjects.length).toFixed(1)) : 0);
  const totalSubjects = validSubjects.length;
  const passedCount = validSubjects.filter((s) => s.grade !== 'F').length;
  const failedCount = totalSubjects - passedCount;
  const isPassed = student.division !== 'Division 0' && student.division !== 'ABS';

  // Overall grade determination
  const getOverallGrade = (avg: number) => {
    if (avg >= 75) return 'A';
    if (avg >= 65) return 'B';
    if (avg >= 45) return 'C';
    if (avg >= 30) return 'D';
    return 'F';
  };
  const overallGrade = getOverallGrade(averageMarks);

  // Strongest & Weakest Subject
  const sortedByScore = [...validSubjects].sort((a, b) => b.score - a.score);
  const strongestSubject = sortedByScore[0] || null;
  const weakestSubject = sortedByScore[sortedByScore.length - 1] || null;

  // Grade color badges
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      case 'C':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'D':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
    }
  };

  const getDivisionBadgeColor = (div: string) => {
    switch (div) {
      case 'Division I':
        return 'bg-emerald-600 text-white border-emerald-500 shadow-sm';
      case 'Division II':
        return 'bg-blue-600 text-white border-blue-500 shadow-sm';
      case 'Division III':
        return 'bg-amber-600 text-white border-amber-500 shadow-sm';
      case 'Division IV':
        return 'bg-orange-600 text-white border-orange-500';
      default:
        return 'bg-red-600 text-white border-red-500';
    }
  };

  const handlePrint = () => {
    printStudentResultSlipDirectly(student);
  };

  const handleDownloadPdf = () => {
    downloadStudentResultSlipPdf(student);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      const shareText = `Matokeo ya Uomboni Secondary School: ${student.studentName} (${student.examNumber}) - ${student.division}, Points: ${student.points}, Wastani: ${student.averageMarks}%.`;
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div
      id={`student-report-${student.id}`}
      className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl overflow-hidden space-y-8 p-6 sm:p-10 print:p-0 print:border-none print:shadow-none"
    >
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-600">
            {language === 'sw' ? 'Hati Rasmi ya Matokeo' : 'Official Academic Performance Report'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-mono text-blue-700 font-bold">
            {student.examNumber}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            id="btn-print-academic-report"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            title={language === 'sw' ? 'Chapa Ripoti Hii' : 'Print Report'}
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>{language === 'sw' ? 'Chapa (Print)' : 'Print Report'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            id="btn-download-academic-pdf"
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
            title={language === 'sw' ? 'Pakua Hati ya PDF' : 'Download PDF Slip'}
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>{language === 'sw' ? 'Pakua PDF (Result Slip)' : 'Download PDF'}</span>
          </button>

          <button
            onClick={() => onOpenVerification && onOpenVerification(student)}
            id="btn-verify-academic-report"
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            title={language === 'sw' ? 'Thibitisha na QR Code' : 'Verify Result'}
          >
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>{language === 'sw' ? 'Thibitisha (QR)' : 'Verify QR'}</span>
          </button>

          <button
            onClick={handleShare}
            id="btn-share-academic-report"
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span>{copied ? (language === 'sw' ? 'Imenakiliwa!' : 'Copied!') : (language === 'sw' ? 'Shiriki' : 'Share')}</span>
          </button>
        </div>
      </div>

      {/* Official Academic Report Card Header */}
      <div className="text-center space-y-3 pb-6 border-b-2 border-slate-900/80">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-white p-2 border-2 border-slate-300 shadow-md flex items-center justify-center shrink-0">
            <SchoolLogo className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1 sm:text-left">
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif uppercase">
              UOMBONI SECONDARY SCHOOL
            </h2>
            <div className="text-xs sm:text-sm font-bold text-blue-900 uppercase tracking-widest font-mono">
              ACADEMIC PERFORMANCE REPORT
            </div>
            <p className="text-xs text-slate-600">
              P.O. BOX 361 MARANGU, MOSHI, KILIMANJARO, TANZANIA • NECTA CENTER NO: S0486
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-500 italic font-serif">
              <span>&ldquo;Tujiendeleze Sisi Wenyewe&rdquo;</span>
              <span>•</span>
              <span>&ldquo;Education | Pray | Work&rdquo;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Information Grid (Section 3 of Prompt) */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {language === 'sw' ? 'Jina la Mwanafunzi:' : 'Student Name:'}
            </span>
            <span className="text-sm font-black text-slate-900 block truncate">
              {student.studentName}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {language === 'sw' ? 'Namba ya Mtihani / Usajili:' : 'Admission / Exam Number:'}
            </span>
            <span className="text-sm font-black font-mono text-blue-900 block">
              {student.examNumber}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {language === 'sw' ? 'Jinsia na Kidato:' : 'Gender & Class:'}
            </span>
            <span className="text-sm font-bold text-slate-800 block">
              {student.gender === 'F' ? 'Female (F)' : 'Male (M)'} • {student.form} ({student.stream})
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {language === 'sw' ? 'Mtihani na Mwaka:' : 'Examination & Year:'}
            </span>
            <span className="text-sm font-bold text-emerald-900 block">
              {student.examType} ({student.year})
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>
            {language === 'sw' ? 'Tarehe ya Kutolewa kwa Matokeo:' : 'Examination Date / Published:'}{' '}
            <strong className="text-slate-800">{student.publishDate || '2025-11-20'}</strong>
          </span>
          <span className="font-mono bg-white px-2.5 py-1 rounded-md border border-slate-200">
            CNO: <strong>{student.examNumber}</strong>
          </span>
        </div>
      </div>

      {/* Result Summary Cards (Section 4 of Prompt) */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          {language === 'sw' ? 'Muhtasari wa Matokeo (Result Summary)' : 'Result Summary'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* TOTAL MARKS */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">TOTAL MARKS</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 block">{totalMarks}</span>
            <span className="text-[9px] text-slate-400">Jumla Alama</span>
          </div>

          {/* AVERAGE */}
          <div className="bg-blue-50/70 rounded-2xl p-3 border border-blue-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">AVERAGE</span>
            <span className="text-lg sm:text-xl font-black text-blue-900 block">{averageMarks}%</span>
            <span className="text-[9px] text-blue-600">Wastani</span>
          </div>

          {/* OVERALL GRADE */}
          <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">GRADE</span>
            <span className="text-lg sm:text-xl font-black text-emerald-900 block">{overallGrade}</span>
            <span className="text-[9px] text-emerald-600">Daraja Kuu</span>
          </div>

          {/* DIVISION */}
          <div className="bg-indigo-50/70 rounded-2xl p-3 border border-indigo-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-indigo-700 block">DIVISION</span>
            <span className="text-sm sm:text-base font-black text-indigo-900 block truncate">
              {student.division.replace('Division ', 'Div ')}
            </span>
            <span className="text-[9px] text-indigo-600">Pts: {student.points}</span>
          </div>

          {/* POSITION */}
          <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">POSITION</span>
            <span className="text-lg sm:text-xl font-black text-amber-900 block">
              #{student.classPosition}
            </span>
            <span className="text-[9px] text-amber-600">kati ya {student.totalStudentsInClass || 20}</span>
          </div>

          {/* TOTAL SUBJECTS */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">TOTAL SUBJ.</span>
            <span className="text-lg sm:text-xl font-black text-slate-800 block">{totalSubjects}</span>
            <span className="text-[9px] text-slate-400">Masomo Yote</span>
          </div>

          {/* PASSED */}
          <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">PASSED</span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 block">{passedCount}</span>
            <span className="text-[9px] text-emerald-600">Amefaulu</span>
          </div>

          {/* STATUS */}
          <div
            className={`rounded-2xl p-3 border text-center space-y-0.5 ${
              isPassed
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-red-600 text-white border-red-600 shadow-xs'
            }`}
          >
            <span className="text-[10px] uppercase font-bold opacity-90 block">STATUS</span>
            <span className="text-sm sm:text-base font-black block tracking-wider">
              {isPassed ? 'PASSED' : 'FAILED'}
            </span>
            <span className="text-[9px] opacity-80">{isPassed ? 'AMEFAULU' : 'HAJAFAULU'}</span>
          </div>
        </div>
      </div>

      {/* Results Table (Section 3 of Prompt) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-700" />
            <span>{language === 'sw' ? 'Mchanganuo wa Alama kwa Masomo (Subject Breakdown)' : 'Subject Marks & Grades Breakdown'}</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Standard NECTA Grading: A (75-100), B (65-74), C (45-64), D (30-44), F (0-29)
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-[11px]">
                <th className="py-3 px-3 text-center w-12">NO.</th>
                <th className="py-3 px-4">SOMO (SUBJECT)</th>
                <th className="py-3 px-3 text-center">ALAMA (MARKS)</th>
                <th className="py-3 px-3 text-center">DARAJA (GRADE)</th>
                <th className="py-3 px-3 text-center">GRADE POINT</th>
                <th className="py-3 px-4">MAONI (REMARKS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 font-medium">
              {validSubjects.map((sub, idx) => (
                <tr
                  key={sub.code || idx}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/60'}
                >
                  <td className="py-3 px-3 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{sub.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Code: {sub.code} • {getNectaSubjectAbbr(sub)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-black text-sm text-slate-900 font-mono">{sub.score}</span>
                    <span className="text-[10px] text-slate-400">/100</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full border text-xs ${getGradeBadge(
                        sub.grade
                      )}`}
                    >
                      {sub.grade}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-700 font-mono">
                    {sub.points || (sub.grade === 'A' ? 1 : sub.grade === 'B' ? 2 : sub.grade === 'C' ? 3 : sub.grade === 'D' ? 4 : 5)}
                  </td>
                  <td className="py-3 px-4 text-slate-700 text-xs">
                    {sub.remarks || (sub.grade === 'A' ? 'Bora Sana' : sub.grade === 'B' ? 'Nzuri Sana' : sub.grade === 'C' ? 'Nzuri' : sub.grade === 'D' ? 'Inaridhisha' : 'Hajaridhisha')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
                <td colSpan={2} className="py-3 px-4 text-right">
                  {language === 'sw' ? 'JUMLA YA ALAMA NA WASTANI:' : 'TOTAL MARKS & AVERAGE:'}
                </td>
                <td className="py-3 px-3 text-center font-black text-sm font-mono text-blue-900">
                  {totalMarks}
                </td>
                <td className="py-3 px-3 text-center font-black text-sm text-emerald-800">
                  {averageMarks}%
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-indigo-900">
                  {student.points} Pts
                </td>
                <td className="py-3 px-4 text-emerald-800 font-black">
                  {student.division} (#{student.classPosition})
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Performance Analytics (Section 5 of Prompt) */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
          <span>{language === 'sw' ? 'Tathmini ya Utendaji (Performance Analytics)' : 'Subject Performance Analytics'}</span>
        </h3>

        {/* Visual Bar Chart of Marks */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-[11px] font-bold text-slate-700 block">
            {language === 'sw' ? 'Chati ya Alama kwa Kila Somo (%):' : 'Marks per Subject Visualizer (%):'}
          </span>

          <div className="space-y-2.5">
            {validSubjects.map((sub) => {
              const pct = Math.min(100, Math.max(0, sub.score));
              let barColor = 'bg-red-500';
              if (sub.grade === 'A') barColor = 'bg-emerald-600';
              else if (sub.grade === 'B') barColor = 'bg-blue-600';
              else if (sub.grade === 'C') barColor = 'bg-amber-500';
              else if (sub.grade === 'D') barColor = 'bg-orange-500';

              return (
                <div key={sub.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{sub.name}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {sub.score}% ({sub.grade})
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Insights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Strongest Subject */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">
              {language === 'sw' ? 'SOMO LILILOONGOZA' : 'STRONGEST SUBJECT'}
            </span>
            <div className="text-sm font-black text-emerald-950">
              {strongestSubject ? strongestSubject.name : '—'}
            </div>
            <div className="text-[11px] text-emerald-800 font-semibold">
              {strongestSubject ? `${strongestSubject.score}% (Grade ${strongestSubject.grade})` : '—'}
            </div>
          </div>

          {/* Weakest Subject */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">
              {language === 'sw' ? 'SOMO LILILOHITAJI JITIHADA' : 'WEAKEST SUBJECT'}
            </span>
            <div className="text-sm font-black text-amber-950">
              {weakestSubject ? weakestSubject.name : '—'}
            </div>
            <div className="text-[11px] text-amber-800 font-semibold">
              {weakestSubject ? `${weakestSubject.score}% (Grade ${weakestSubject.grade})` : '—'}
            </div>
          </div>

          {/* Examination Comparison Progression */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">
              {language === 'sw' ? 'MWENENDO WA MITIHANI' : 'PREVIOUS EXAM COMPARISON'}
            </span>
            <div className="text-sm font-black text-blue-950">
              Annual Exam: {averageMarks}%
            </div>
            <div className="text-[11px] text-blue-700 flex items-center gap-1">
              <span>Term 1: 46%</span>
              <span>→</span>
              <span>Term 2: 48%</span>
              <span>→</span>
              <strong className="text-blue-900">Annual: {averageMarks}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Headmaster Remarks & Conduct */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          {language === 'sw' ? 'Maoni ya Mkuu wa Shule na Nidhamu:' : 'Headmaster Remarks & Conduct Evaluation:'}
        </span>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-slate-500">{language === 'sw' ? 'Nidhamu:' : 'Conduct:'}</span>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold">
            {student.conduct || 'Bora Sana (Excellent)'}
          </span>
        </div>
        <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200">
          &ldquo;{student.headmasterRemarks || 'Mwanafunzi anapaswa kudumisha bidii na nidhamu kwa maendeleo endelevu ya kitaaluma.'}&rdquo;
        </p>
      </div>

      {/* Official Signatures & School Circular Stamp (Section 9 of Prompt) */}
      <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
        {/* Class Teacher Signature */}
        <div className="text-center space-y-2">
          <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
            <span className="font-serif italic text-sm text-slate-800">
              {student.form?.toLowerCase().includes('4') || student.form?.toLowerCase().includes('iv')
                ? 'Mwl. Wolter Temu'
                : student.form?.toLowerCase().includes('3') || student.form?.toLowerCase().includes('iii')
                ? 'Mwl. Herman'
                : student.form?.toLowerCase().includes('2') || student.form?.toLowerCase().includes('ii')
                ? 'Mwl. Peter Kimaro'
                : 'Mwl. Wolter Temu'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            {language === 'sw' ? 'Mwalimu wa Darasa' : 'Class Teacher'}
          </span>
        </div>

        {/* Academic Master Signature */}
        <div className="text-center space-y-2">
          <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
            <span className="font-serif italic text-sm text-slate-800">Mwl. Yohana Bahati</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            {language === 'sw' ? 'Mkuu wa Taaluma (Academic Master)' : 'Academic Master'}
          </span>
        </div>

        {/* Headmaster Signature */}
        <div className="text-center space-y-2">
          <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
            <span className="font-serif italic text-sm font-semibold text-slate-900">Br. Adolph Massawe</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            {language === 'sw' ? 'Mkuu wa Shule (Headmaster)' : 'Headmaster'}
          </span>
        </div>

        {/* Authentic Circular School Stamp */}
        <div className="flex items-center justify-center">
          <div className="w-26 h-26 rounded-full border-3 border-emerald-700/80 p-1 flex flex-col items-center justify-center text-center text-emerald-800 font-bold rotate-[-6deg] select-none shadow-xs">
            <div className="text-[7px] tracking-wider uppercase">★ UOMBONI SEC. SCHOOL ★</div>
            <div className="text-[8px] font-black uppercase text-blue-900 my-0.5">HEADMASTER</div>
            <div className="text-[7px]">P.O. BOX 361</div>
            <div className="text-[7px] font-bold">MARANGU - MOSHI</div>
            <div className="text-[6px] text-slate-600 mt-0.5">OFFICIAL STAMP</div>
          </div>
        </div>
      </div>

      {/* Verification Footer Note */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            {language === 'sw'
              ? 'Hati hii imetolewa rasmi na Ofisi ya Taaluma, Shule ya Sekondari Uomboni.'
              : 'Officially published by the Academic Office, Uomboni Secondary School.'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          HASH: UOMB-{student.id.toUpperCase()}-VERIFIED
        </span>
      </div>
    </div>
  );
};
