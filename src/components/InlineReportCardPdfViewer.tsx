import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StudentResult } from '../types';
import {
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Award,
  Layers,
  X
} from 'lucide-react';
import {
  downloadStudentResultSlipPdf,
  getStudentResultSlipPdfBlobUrl,
  printStudentResultSlipDirectly,
} from '../utils/pdfService';
import { SchoolLogo } from './SchoolLogo';

interface InlineReportCardPdfViewerProps {
  student: StudentResult;
  allStudents?: StudentResult[];
  onSelectStudent?: (student: StudentResult) => void;
  onCloseModal?: () => void;
  isModal?: boolean;
}

export const InlineReportCardPdfViewer: React.FC<InlineReportCardPdfViewerProps> = ({
  student,
  allStudents = [],
  onSelectStudent,
  onCloseModal,
  isModal = false,
}) => {
  const { language, t } = useLanguage();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewFormat, setViewFormat] = useState<'paper' | 'embeddedPdf'>('paper');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate / update blob URL when student changes or mode switches to embeddedPdf
  useEffect(() => {
    let url = '';
    try {
      url = getStudentResultSlipPdfBlobUrl(student);
      setPdfBlobUrl(url);
    } catch {
      // Fallback
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [student]);

  // Current student index in list for Next/Prev buttons
  const currentIndex = allStudents.findIndex((s) => s.id === student.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allStudents.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectStudent) {
      onSelectStudent(allStudents[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectStudent) {
      onSelectStudent(allStudents[currentIndex + 1]);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 15, 160));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 15, 70));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    try {
      printStudentResultSlipDirectly(student);
    } catch {
      window.print();
    } finally {
      setTimeout(() => setIsPrinting(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadStudentResultSlipPdf(student);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/?exam=${encodeURIComponent(student.examNumber)}#results`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getDivisionColor = (div: string) => {
    switch (div) {
      case 'Division I':
        return 'text-emerald-800 bg-emerald-100 border-emerald-300';
      case 'Division II':
        return 'text-blue-800 bg-blue-100 border-blue-300';
      case 'Division III':
        return 'text-amber-800 bg-amber-100 border-amber-300';
      case 'Division IV':
        return 'text-orange-800 bg-orange-100 border-orange-300';
      default:
        return 'text-red-800 bg-red-100 border-red-300';
    }
  };

  const getSubjectGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 font-black';
      case 'B':
        return 'text-blue-700 bg-blue-50 border-blue-200 font-bold';
      case 'C':
        return 'text-amber-700 bg-amber-50 border-amber-200 font-semibold';
      case 'D':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-red-700 bg-red-50 border-red-200 font-bold';
    }
  };

  return (
    <div
      ref={containerRef}
      id="report-card-pdf-viewer-container"
      className={`flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 transition-all ${
        isFullscreen || isModal
          ? 'fixed inset-2 sm:inset-6 z-50 shadow-2xl'
          : 'w-full my-4'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. VIEWER TOOLBAR (Controls for View Mode, Zoom, Print, Download & Paging) */}
      {/* ========================================================================= */}
      <div className="bg-slate-950 text-white p-3 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print select-none">
        {/* Left Side: Document Title & Verification Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center font-bold shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                {language === 'sw' ? 'Hati Rasmi ya Matokeo (Report Card)' : 'Official Report Card Viewer'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/90 text-emerald-300 border border-emerald-700 font-mono font-bold">
                NECTA S0486
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs block">
              {student.examNumber} • {student.studentName}
            </span>
          </div>
        </div>

        {/* Center: View Switcher (Paper Replica vs Native PDF Stream) */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewFormat('paper')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewFormat === 'paper'
                ? 'bg-emerald-800 text-amber-300 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Muonekano wa Karatasi Rasmi ya A4"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{language === 'sw' ? 'Karatasi ya Hati (A4)' : 'Official Paper'}</span>
          </button>

          <button
            onClick={() => setViewFormat('embeddedPdf')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewFormat === 'embeddedPdf'
                ? 'bg-emerald-800 text-amber-300 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Kiteja cha PDF cha Vector (Embedded PDF Viewer)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{language === 'sw' ? 'Vector PDF Viewer' : 'Vector PDF'}</span>
          </button>
        </div>

        {/* Right Side Controls: Zoom, Print, Download, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Previous / Next Student Nav */}
          {allStudents.length > 1 && onSelectStudent && (
            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5 text-xs mr-1">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Mwanafunzi Aliyetangulia"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 px-1 font-mono">
                {currentIndex + 1}/{allStudents.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Mwanafunzi Anayefuata"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Zoom controls (Active in Paper view) */}
          {viewFormat === 'paper' && (
            <div className="hidden sm:flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5 text-xs">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                title="Punguza Ukubwa (Zoom Out)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-1.5 text-[11px] font-mono text-slate-300 hover:text-white cursor-pointer"
                title="Rejesha 100%"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                title="Ongeza Ukubwa (Zoom In)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Direct Print Button */}
          <button
            onClick={handlePrint}
            id="btn-inline-pdf-print"
            disabled={isPrinting}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
            title="Chapa Hati Rasmi Moja kwa Moja Kwenye Printa"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isPrinting ? (language === 'sw' ? 'Inachapa...' : 'Printing...') : (language === 'sw' ? 'Chapa (Print)' : 'Print')}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            id="btn-inline-pdf-download"
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
            title="Pakua Faili la PDF kwenye Kifaa Chako"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'sw' ? 'Pakua PDF' : 'Download PDF'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Nakili Kiungo cha Matokeo"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen / Close Modal Button */}
          {isModal || onCloseModal ? (
            <button
              onClick={onCloseModal}
              className="p-2 text-slate-400 hover:text-white hover:bg-red-900/60 rounded-xl transition-colors cursor-pointer"
              title="Funga"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isFullscreen ? 'Toka kwenye Skrini Kamili' : 'Skrini Kamili'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VIEWER CANVAS / CONTENT BODY */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-auto bg-slate-900/90 p-3 sm:p-8 flex items-start justify-center min-h-[480px]">
        {/* VIEW 1: HIGH-FIDELITY OFFICIAL A4 PAPER REPORT CARD */}
        {viewFormat === 'paper' ? (
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            id="printable-official-report-card"
            className="w-full max-w-[800px] bg-white text-slate-900 p-6 sm:p-10 shadow-2xl rounded-2xl border-4 border-emerald-900 relative my-2 select-text"
          >
            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-[180px] font-black text-emerald-950 font-serif">✝️</span>
            </div>

            {/* Inner Border Accent */}
            <div className="border border-amber-600/30 rounded-xl p-4 sm:p-6 space-y-5 relative z-10 bg-white">
              {/* TOP HEADER: Diocese, School Name & Emblem */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-4 border-b-2 border-emerald-900 text-center sm:text-left">
                <div className="w-16 h-16 sm:w-20 sm:h-20 p-1 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                  <SchoolLogo size="lg" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] sm:text-xs font-black tracking-widest text-emerald-900 uppercase">
                    JIMBO KATOLIKI MOSHI • CATHOLIC DIOCESE OF MOSHI
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                    SHULE YA SEKONDARI UOMBONI • MARANGU
                  </h2>
                  <div className="text-[11px] text-slate-600">
                    S.L.P 361 MARANGU - MOSHI VIJIJINI, KILIMANJARO • KITUO CHA NECTA NA: <strong className="font-mono text-emerald-900">S0486</strong>
                  </div>

                  <div className="pt-1">
                    <div className="inline-block px-3 py-1 rounded-md bg-emerald-900 text-amber-300 text-xs font-black tracking-wide uppercase shadow-xs">
                      OFFICIAL STUDENT PERFORMANCE REPORT SLIP
                    </div>
                  </div>
                </div>
              </div>

              {/* STUDENT BIODATA GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    Jina la Mwanafunzi (Student Name)
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
                    {student.studentName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    Namba ya Mtihani (Exam No.)
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-900 block">
                    {student.examNumber}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    Jinsia (Gender)
                  </span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {student.gender === 'F' ? 'Female (Wasichana)' : 'Male (Wavulana)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    Kidato & Mkondo (Class & Stream)
                  </span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {student.form} ({student.stream})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    Mtihani & Mwaka (Exam & Year)
                  </span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {student.examType} ({student.year})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    Tarehe ya Kuchapishwa (Date)
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 block">
                    {student.publishDate || new Date().toISOString().split('T')[0]}
                  </span>
                </div>
              </div>

              {/* OVERALL PERFORMANCE METRICS (Division, Points, Average, Position) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] font-black uppercase text-emerald-800 block">
                    DARAJA (DIVISION)
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-950 block mt-0.5">
                    {student.division}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-[10px] font-black uppercase text-blue-800 block">
                    POINTI ZA NECTA
                  </span>
                  <span className="text-base sm:text-lg font-black text-blue-950 block mt-0.5 font-mono">
                    {student.points} Points
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[10px] font-black uppercase text-amber-800 block">
                    WASTANI (AVERAGE)
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-950 block mt-0.5 font-mono">
                    {student.averageMarks}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
                  <span className="text-[10px] font-black uppercase text-purple-800 block">
                    NAFASI DARASANI
                  </span>
                  <span className="text-base sm:text-lg font-black text-purple-950 block mt-0.5 font-mono">
                    {student.classPosition} / {student.totalStudentsInClass}
                  </span>
                </div>
              </div>

              {/* SUBJECT BREAKDOWN TABLE */}
              <div className="overflow-hidden rounded-xl border border-slate-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-900 text-white font-bold text-[11px]">
                      <th className="py-2.5 px-3 font-mono">CODE</th>
                      <th className="py-2.5 px-3">SOMO / SUBJECT NAME</th>
                      <th className="py-2.5 px-3 text-center">ALAMA (%)</th>
                      <th className="py-2.5 px-3 text-center">DARAJA</th>
                      <th className="py-2.5 px-3 text-center">POINTI</th>
                      <th className="py-2.5 px-3">TATHMINI / REMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {student.subjects.map((subj, idx) => (
                      <tr
                        key={subj.code}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-600">{subj.code}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{subj.name}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">{subj.score}</td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getSubjectGradeColor(
                              subj.grade
                            )}`}
                          >
                            {subj.grade}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-slate-700">{subj.points}</td>
                        <td className="py-2 px-3 text-[11px] text-slate-600">{subj.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* NECTA GRADING KEY FOOTNOTE */}
              <div className="p-2 rounded-lg bg-slate-100 text-[10px] text-slate-600 text-center font-medium border border-slate-200">
                <strong>VIWANGO VYA ALAMA (NECTA KEY):</strong> A (75-100% • Pts 1 - Bora Sana) | B (65-74% • Pts 2 - Nzuri Sana) | C (45-64% • Pts 3 - Nzuri) | D (30-44% • Pts 4 - Inaridhisha) | F (0-29% • Pts 5 - Feli)
              </div>

              {/* CONDUCT AND HEADMASTER REMARKS */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[10px] font-black uppercase text-amber-900 block mb-1">
                    TATHMINI YA TABIA NA NIDHAMU (CONDUCT & DISCIPLINE ASSESSMENT):
                  </span>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{student.conduct}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                    MAONI NA USHAURI WA MKUU WA SHULE (HEADMASTER REMARKS):
                  </span>
                  <p className="italic text-slate-800 font-serif">
                    &ldquo;{student.headmasterRemarks}&rdquo;
                  </p>
                </div>
              </div>

              {/* SIGNATURE & OFFICIAL EMBOSSED SEAL */}
              <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                {/* Headmaster Signature & Name */}
                <div className="text-center sm:text-left space-y-1">
                  <div className="font-black text-slate-900 text-sm">Br. Adolph Massawe</div>
                  <div className="text-[11px] text-slate-600">Mkuu wa Shule (Headmaster)</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Shule ya Sekondari Uomboni • Jimbo Katoliki Moshi
                  </div>
                </div>

                {/* Official Circular Stamp Replica */}
                <div className="w-48 h-20 rounded-2xl border-2 border-dashed border-emerald-700/80 bg-emerald-50/40 p-2 text-center flex flex-col justify-center items-center text-emerald-900 shadow-inner">
                  <span className="text-[9px] font-black uppercase tracking-wider block">
                    SHULE YA SEKONDARI UOMBONI
                  </span>
                  <span className="text-[10px] font-black text-emerald-800 block my-0.5">
                    ★ OFFICIAL EXAM SEAL ★
                  </span>
                  <span className="text-[8px] font-mono text-emerald-700 block">
                    S.L.P 361 MARANGU • NECTA S0486
                  </span>
                </div>
              </div>

              {/* Digital Verification Code & Security Token */}
              <div className="pt-2 text-center text-[10px] text-slate-400 font-mono border-t border-slate-100 flex items-center justify-between">
                <span>SECURITY VERIFIED • NECTA S0486</span>
                <span>DOC REF: {student.examNumber.replace('/', '-')}-2025</span>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: EMBEDDED NATIVE PDF VECTOR VIEWER (iframe / object) */
          <div className="w-full max-w-4xl h-[700px] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
            {pdfBlobUrl ? (
              <iframe
                src={`${pdfBlobUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                title={`Report Slip - ${student.studentName}`}
                className="w-full h-full border-none bg-slate-800"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-white text-xs">
                Inazalisha PDF...
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. FOOTER BAR WITH QUICK ACTIONS */}
      {/* ========================================================================= */}
      <div className="bg-slate-950 p-3 sm:p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0 no-print">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {language === 'sw'
              ? 'Hati hii inathibitishwa na Mfumo Rasmi wa Mitihani wa Shule ya Sekondari Uomboni.'
              : 'Official verifiable report card generated from authorized school records.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Chapa Hati Hii' : 'Print this Slip'}</span>
          </button>

          <span className="text-slate-700">|</span>

          <button
            onClick={handleDownload}
            className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Pakua PDF' : 'Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
