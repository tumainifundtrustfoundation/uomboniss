import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Lock,
  Unlock,
  Eye,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { StudentResult } from '../types';
import {
  computeDivisionPerformanceSummary,
  formatCno,
  formatNectaDetailedSubjects,
} from '../utils/nectaResultsEngine';
import { downloadClassBroadsheetPdf, downloadStudentResultSlipPdf, printStudentResultSlipDirectly } from '../utils/pdfService';

interface NectaResultsOfficialViewProps {
  initialExamNumber?: string;
  onOpenReportCard?: (student: StudentResult) => void;
  isAcademicMasterView?: boolean;
}

export const NectaResultsOfficialView: React.FC<NectaResultsOfficialViewProps> = ({
  initialExamNumber = '',
  onOpenReportCard,
  isAcademicMasterView = false,
}) => {
  const { language } = useLanguage();
  const {
    studentResults,
    isResultsPublishedToParents,
    publishResultsToParents,
    recomputeNectaDivisions,
  } = useData();

  // Filters
  const [selectedForm, setSelectedForm] = useState<string>('Form 4');
  const [selectedExam, setSelectedExam] = useState<string>('NECTA Mock 2025');
  const [parentChildQuery, setParentChildQuery] = useState<string>(initialExamNumber);
  const [showAllNamesAdminToggle, setShowAllNamesAdminToggle] = useState<boolean>(isAcademicMasterView);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentResult | null>(null);

  // Available Forms & Exams from studentResults
  const availableForms = useMemo(() => {
    const set = new Set(studentResults.map((r) => r.form));
    return Array.from(set);
  }, [studentResults]);

  const availableExams = useMemo(() => {
    const set = new Set(studentResults.map((r) => r.examType));
    return Array.from(set);
  }, [studentResults]);

  // Filtered list for the selected class and exam
  const currentResults = useMemo(() => {
    return studentResults.filter((r) => {
      const matchForm = !selectedForm || selectedForm === 'ALL' || r.form === selectedForm;
      const matchExam = !selectedExam || selectedExam === 'ALL' || r.examType === selectedExam;
      return matchForm && matchExam;
    });
  }, [studentResults, selectedForm, selectedExam]);

  // Clean matched child query
  const matchedChildResult = useMemo(() => {
    const q = parentChildQuery.trim().toLowerCase();
    if (!q) return null;
    return currentResults.find(
      (r) =>
        r.examNumber.toLowerCase().includes(q) ||
        formatCno(r.examNumber).toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.id.toLowerCase() === q
    ) || null;
  }, [parentChildQuery, currentResults]);

  // Division summary computed in NECTA / CSSC exact format
  const divisionSummary = useMemo(() => {
    return computeDivisionPerformanceSummary(currentResults);
  }, [currentResults]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadBroadsheet = () => {
    const title = `MATOKEO YA ${selectedForm.toUpperCase()} - ${selectedExam.toUpperCase()} (KITUO S0486)`;
    downloadClassBroadsheetPdf(currentResults, title);
  };

  // Helper for division cell styling (Ivory & Red theme)
  const getDivColor = (div: string) => {
    const d = (div || '').toUpperCase();
    if (d.includes('I') && !d.includes('II') && !d.includes('III') && !d.includes('IV')) {
      return 'font-black text-red-700 bg-red-100/90';
    }
    if (d.includes('II') && !d.includes('III')) {
      return 'font-black text-red-800 bg-red-50';
    }
    if (d.includes('III')) {
      return 'font-bold text-stone-800 bg-[#FAF7EE]';
    }
    if (d.includes('IV')) {
      return 'font-semibold text-stone-700 bg-[#FAF7EE]';
    }
    if (d.includes('ABS')) {
      return 'font-bold text-red-900 bg-red-100';
    }
    return 'font-bold text-red-800 bg-red-50/70';
  };

  return (
    <div className="bg-[#FFFDF8] rounded-3xl border-2 border-red-200/80 shadow-md overflow-hidden space-y-6 print:border-none print:shadow-none print:p-0">
      {/* 1. TOP CONTROLS & FILTER BAR */}
      <div className="p-4 bg-[#FAF7EE] text-stone-900 border-b-2 border-red-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-stone-600 block mb-1">
              {language === 'sw' ? 'Chagua Kidato' : 'Select Form'}
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FFFDF8] border border-red-300 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-red-600 cursor-pointer"
            >
              {availableForms.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
              <option value="ALL">{language === 'sw' ? 'Vidato Vyote' : 'All Forms'}</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-stone-600 block mb-1">
              {language === 'sw' ? 'Aina ya Mtihani' : 'Exam Type'}
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FFFDF8] border border-red-300 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-red-600 cursor-pointer"
            >
              {availableExams.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
              <option value="ALL">{language === 'sw' ? 'Mitihani Yote' : 'All Exams'}</option>
            </select>
          </div>

          {/* Academic Master Controls if authorized */}
          {isAcademicMasterView && (
            <div className="pt-3 sm:pt-0">
              <label className="text-[10px] uppercase font-bold text-red-800 block mb-1">
                {language === 'sw' ? 'Usimamizi wa Mkuu wa Taaluma' : 'Academic Master Control'}
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#FFFDF8] text-red-900 border border-red-300"
                  title="Majina ya wanafunzi yanaonekana wazi kwenye orodha zote za portal"
                >
                  <Eye className="w-3.5 h-3.5 text-red-700" />
                  <span>
                    {language === 'sw'
                      ? 'Majina Yote Yanaonekana Kwenye Portal'
                      : 'All Names Visible in Portals'}
                  </span>
                </div>

                <button
                  onClick={() => publishResultsToParents(!isResultsPublishedToParents)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer border shadow-sm ${
                    isResultsPublishedToParents
                      ? 'bg-red-700 hover:bg-red-800 text-[#FFFFF0] border-red-800'
                      : 'bg-stone-800 hover:bg-stone-900 text-[#FFFFF0] border-stone-800'
                  }`}
                >
                  {isResultsPublishedToParents ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FFFFF0]" />
                      <span>{language === 'sw' ? 'Yameruhusiwa kwa Wazazi' : 'Live to Parents'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-[#FFFFF0]" />
                      <span>{language === 'sw' ? 'Ruhusu Matokeo kwa Wazazi' : 'Publish to Parents'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons: Download & Print */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadBroadsheet}
            className="px-3.5 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            title="Pakua Broadsheet ya Matokeo PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Broadsheet</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF7EE] text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-red-300 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-red-700" />
            <span>{language === 'sw' ? 'Chapisha' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* 2. PARENT SEARCH & CHILD IDENTIFICATION GATE */}
      <div className="px-6 pt-2 print:hidden">
        <div className="p-4 rounded-3xl bg-[#FAF7EE] border-2 border-red-200/80 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-red-950 font-black text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span>
                {language === 'sw'
                  ? 'UTAMBUZI WA MTOTO WAKO NA ORODHA YA MATOKEO:'
                  : 'IDENTIFY YOUR CHILD & RESULTS LIST:'}
              </span>
            </div>
            <span className="text-[11px] text-stone-600 font-medium">
              {language === 'sw'
                ? 'Majina yote ya wanafunzi yanaonekana wazi; weka jina au namba kuangazia mtoto wako'
                : 'All candidate names are clearly displayed; search name or exam number to highlight your child'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-red-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={parentChildQuery}
                onChange={(e) => setParentChildQuery(e.target.value)}
                placeholder={
                  language === 'sw'
                    ? 'Weka namba ya mtihani au jina la mtoto wako (mfano: S0486/0002 au Baraka)...'
                    : 'Enter candidate number or student name (e.g. S0486/0002 or Baraka)...'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFDF8] border border-red-300 text-xs font-bold text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-red-600 shadow-xs"
              />
            </div>

            {/* Quick selector of sample students for convenience */}
            {currentResults.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-stone-500 text-[10px] uppercase font-bold shrink-0">
                  {language === 'sw' ? 'Mifano:' : 'Quick Select:'}
                </span>
                {currentResults.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setParentChildQuery(formatCno(c.examNumber))}
                    className="px-2 py-1 rounded-lg bg-[#FFFDF8] hover:bg-red-50 text-red-900 text-[11px] font-mono font-bold border border-red-200 transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    {formatCno(c.examNumber)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Matched Child Notification Banner */}
          {matchedChildResult ? (
            <div className="p-3 bg-red-700 text-[#FFFFF0] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFFFF0] text-red-700 font-black flex items-center justify-center text-sm shadow-xs">
                  ★
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-red-100 tracking-wider">
                      {language === 'sw' ? 'MTOTO WAKO AMETAMBULIKA:' : 'YOUR CHILD IDENTIFIED:'}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#FFFFF0]">
                      {formatCno(matchedChildResult.examNumber)}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-[#FFFFF0]">
                    {matchedChildResult.studentName} ({matchedChildResult.form} - {matchedChildResult.division}, Pts: {matchedChildResult.points}, {matchedChildResult.averageMarks}%)
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onOpenReportCard) {
                      onOpenReportCard(matchedChildResult);
                    } else {
                      setSelectedStudentForModal(matchedChildResult);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FFFFF0] hover:bg-red-50 text-red-900 text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-red-700" />
                  <span>{language === 'sw' ? 'Tazama Ripoti Rasmi (PDF)' : 'Official PDF Slip'}</span>
                </button>
                <button
                  onClick={() => setParentChildQuery('')}
                  className="px-2.5 py-1.5 rounded-xl bg-red-800 hover:bg-red-900 text-[#FFFFF0] text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            parentChildQuery.trim() && (
              <div className="p-2.5 bg-red-50 text-red-950 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                <span>
                  {language === 'sw'
                    ? `Hakuna mwanafunzi aliyelingana na "${parentChildQuery}" katika ${selectedForm} - ${selectedExam}. Tafadhali thibitisha namba ya mtihani.`
                    : `No student matched "${parentChildQuery}" in ${selectedForm} - ${selectedExam}. Please verify candidate number.`}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* 3. UNPUBLISHED WARNING IF ACADEMIC MASTER HAS NOT APPROVED YET */}
      {!isResultsPublishedToParents && (
        <div className="mx-6 p-4 rounded-3xl bg-[#FAF7EE] border-2 border-red-300 text-stone-900 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-700" />
            <h4 className="text-sm font-black uppercase tracking-wide text-red-900">
              {language === 'sw'
                ? 'MATOKEO YANAFANYIWA UCHAKATAJI NA UHAKIKI WA MWISHO NA OFISI YA MKUU WA TAALUMA'
                : 'RESULTS PENDING FINAL VERIFICATION & AUTHORIZATION BY THE ACADEMIC MASTER'}
            </h4>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            {language === 'sw'
              ? 'Walimu wameingiza alama za masomo, na matokeo haya yanachakatwa na kuhakikiwa na Wakuu wa Taaluma (Mwl. Yohana Bahati na Madam Adela Manyanga). Yakishathibitishwa na kuruhusiwa, yataonekana rasmi hapa kwa wazazi wote.'
              : 'Subject teachers have entered marks and the results are undergoing official compilation and review by the Academic Masters (Mwl. Yohana Bahati & Madam Adela Manyanga). Once approved and unlocked, they will immediately be accessible to parents.'}
          </p>
          {isAcademicMasterView && (
            <div className="pt-2">
              <button
                onClick={() => publishResultsToParents(true)}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Unlock className="w-4 h-4 text-[#FFFFF0]" />
                <span>{language === 'sw' ? 'Ruhusu Matokeo Haya Yaende kwa Wazazi Sasa' : 'Authorize & Release to Parents Now'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. OFFICIAL NECTA / CSSC BRANDED RESULTS SHEET (EXACT SCREENSHOT LAYOUT) */}
      <div className="p-6 md:p-8 space-y-6 print:p-0 font-sans">
        {/* Exact NECTA Header Layout from Screenshot */}
        <div className="text-center font-serif text-[#002244] py-2 space-y-1 border-b border-slate-200 pb-5">
          <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-700">
            BARAZA LA MITIHANI LA TANZANIA (NECTA) / CSSC
          </h2>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900">
            SHULE YA SEKONDARI UOMBONI • MATOKEO YA MTIHANI
          </h1>
          <h3 className="text-sm md:text-base font-bold uppercase text-slate-800">
            {selectedExam.toUpperCase()} RESULTS • {selectedForm.toUpperCase()} ({new Date().getFullYear()})
          </h3>
          <p className="text-xs md:text-sm font-mono font-bold text-emerald-900 tracking-wide">
            KITUO CHA MTIHANI: S0486 UOMBONI SECONDARY SCHOOL CENTRE
          </p>
        </div>

        {/* 5. DIVISION PERFORMANCE SUMMARY BOX (EXACT FORMAT FROM SCREENSHOT) */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-black uppercase text-[#002244] tracking-wider text-center">
            DIVISION PERFORMANCE SUMMARY
          </h4>
          <div className="max-w-2xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse border border-slate-400 text-center text-xs font-mono">
              <thead>
                <tr className="bg-[#eef2f7] text-[#002244] font-bold border-b border-slate-400">
                  <th className="py-2 px-3 border-r border-slate-400 text-left font-black">SEX</th>
                  <th className="py-2 px-3 border-r border-slate-400">I</th>
                  <th className="py-2 px-3 border-r border-slate-400">II</th>
                  <th className="py-2 px-3 border-r border-slate-400">III</th>
                  <th className="py-2 px-3 border-r border-slate-400">IV</th>
                  <th className="py-2 px-3 border-r border-slate-400">0</th>
                  <th className="py-2 px-3 border-r border-slate-400">ABS</th>
                  <th className="py-2 px-3 font-black bg-[#e2e8f0]">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {/* Female Row */}
                <tr className="hover:bg-slate-50 font-bold text-slate-800">
                  <td className="py-1.5 px-3 border-r border-slate-400 text-left font-black">F</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.F.div1}</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.F.div2}</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.F.div3}</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.F.div4}</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.F.div0}</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.F.abs}</td>
                  <td className="py-1.5 px-3 font-black bg-slate-100">{divisionSummary.F.total}</td>
                </tr>
                {/* Male Row */}
                <tr className="hover:bg-slate-50 font-bold text-slate-800">
                  <td className="py-1.5 px-3 border-r border-slate-400 text-left font-black">M</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.M.div1}</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.M.div2}</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.M.div3}</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.M.div4}</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.M.div0}</td>
                  <td className="py-1.5 px-3 border-r border-slate-400">{divisionSummary.M.abs}</td>
                  <td className="py-1.5 px-3 font-black bg-slate-100">{divisionSummary.M.total}</td>
                </tr>
                {/* Total Row */}
                <tr className="bg-[#f8fafc] font-black text-slate-900 border-t-2 border-slate-400">
                  <td className="py-2 px-3 border-r border-slate-400 text-left font-black">T</td>
                  <td className="py-2 px-3 border-r border-slate-400 text-emerald-800">{divisionSummary.T.div1}</td>
                  <td className="py-2 px-3 border-r border-slate-400 text-blue-800">{divisionSummary.T.div2}</td>
                  <td className="py-2 px-3 border-r border-slate-400 text-amber-800">{divisionSummary.T.div3}</td>
                  <td className="py-2 px-3 border-r border-slate-400 text-orange-800">{divisionSummary.T.div4}</td>
                  <td className="py-2 px-3 border-r border-slate-400 text-red-800">{divisionSummary.T.div0}</td>
                  <td className="py-2 px-3 border-r border-slate-400 text-red-900">{divisionSummary.T.abs}</td>
                  <td className="py-2 px-3 font-black bg-[#e2e8f0] text-slate-950">{divisionSummary.T.total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. DETAILED RESULTS TABLE (EXACT NECTA / CSSC LAYOUT FROM SCREENSHOT) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <h4 className="text-sm font-serif font-black uppercase text-[#002244]">
              ORODHA YA WATAHINIWA NA MATOKEO YA KINA (DETAILED RESULTS)
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              Watahiniwa: {currentResults.length}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-400 rounded-lg">
            <table className="w-full border-collapse text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#eef2f7] text-[#002244] uppercase font-bold border-b border-slate-400">
                  <th className="py-2.5 px-3 border-r border-slate-300 w-48 sm:w-64">CNO / JINA LA MWANAFUNZI</th>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-center w-12">SEX</th>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-center w-14">AGGT</th>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-center w-16">DIV</th>
                  <th className="py-2.5 px-3">DETAILED SUBJECTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-[11px] sm:text-xs">
                {currentResults.length > 0 ? (
                  currentResults.map((st) => {
                    const cnoFormatted = formatCno(st.examNumber);
                    const isMyChild =
                      matchedChildResult &&
                      (matchedChildResult.id === st.id ||
                        formatCno(matchedChildResult.examNumber) === cnoFormatted);

                    // Names are always visible across all portal views
                    const showNameInThisRow = true;

                    // Compute clean aggregate
                    const divUpper = (st.division || '').toUpperCase();
                    let divRoman = '0';
                    if (divUpper.includes('I') && !divUpper.includes('II') && !divUpper.includes('III') && !divUpper.includes('IV')) {
                      divRoman = 'I';
                    } else if (divUpper.includes('II') && !divUpper.includes('III')) {
                      divRoman = 'II';
                    } else if (divUpper.includes('III')) {
                      divRoman = 'III';
                    } else if (divUpper.includes('IV')) {
                      divRoman = 'IV';
                    } else if (divUpper.includes('ABS')) {
                      divRoman = 'ABS';
                    } else {
                      divRoman = '0';
                    }

                    const aggtDisplay =
                      divRoman === '0' || divRoman === 'ABS' ? (st.points >= 34 ? st.points : '-') : st.points;

                    const detailedString =
                      st.detailedSubjectsString || formatNectaDetailedSubjects(st.subjects);

                    return (
                      <tr
                        key={st.id}
                        id={`row-${cnoFormatted.replace('/', '-')}`}
                        className={`transition-colors ${
                          isMyChild
                            ? 'bg-amber-100/90 hover:bg-amber-100 border-y-2 border-amber-500 font-bold text-amber-950 shadow-inner'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        {/* CNO Column with Candidate Number and Student Name */}
                        <td className="py-2 px-3 border-r border-slate-300 align-top">
                          <div className="font-mono font-bold text-slate-900">{cnoFormatted}</div>
                          <div className="mt-0.5 font-sans font-bold text-xs flex flex-wrap items-center gap-1.5">
                            {isMyChild && <span className="text-amber-600 font-black">★</span>}
                            <span className={isMyChild ? 'text-emerald-950 font-black' : 'text-slate-900 font-semibold'}>
                              {st.studentName}
                            </span>
                            {isMyChild && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                                {language === 'sw' ? 'Mtoto Wako' : 'Your Child'}
                              </span>
                            )}
                          </div>
                          {isMyChild && (
                            <div className="mt-1.5 print:hidden">
                              <button
                                onClick={() => {
                                  if (onOpenReportCard) {
                                    onOpenReportCard(st);
                                  } else {
                                    setSelectedStudentForModal(st);
                                  }
                                }}
                                className="px-2 py-1 rounded-md bg-emerald-800 hover:bg-emerald-700 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <FileText className="w-3 h-3 text-amber-300" />
                                <span>{language === 'sw' ? 'Fungua Ripoti (PDF)' : 'View Slip'}</span>
                              </button>
                            </div>
                          )}
                        </td>

                        {/* SEX */}
                        <td className="py-2 px-2 border-r border-slate-300 text-center font-bold align-top">
                          {st.gender}
                        </td>

                        {/* AGGT */}
                        <td className="py-2 px-2 border-r border-slate-300 text-center font-bold text-blue-950 align-top">
                          {aggtDisplay}
                        </td>

                        {/* DIV */}
                        <td
                          className={`py-2 px-2 border-r border-slate-300 text-center font-bold align-top ${getDivColor(
                            st.division
                          )}`}
                        >
                          {divRoman}
                        </td>

                        {/* DETAILED SUBJECTS */}
                        <td className="py-2 px-3 font-mono leading-relaxed text-slate-900 align-top">
                          {detailedString}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                      {language === 'sw'
                        ? 'Hakuna matokeo yaliyopatikana kwa darasa hili na mtihani huu.'
                        : 'No results found for this class and examination.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. OFFICIAL ENDORSEMENT FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 font-serif gap-3">
          <div>
            <strong>Mkuu wa Shule:</strong> Br. Adolph Massawe • Shule ya Sekondari Uomboni
          </div>
          <div>
            <strong>Wakuu wa Taaluma:</strong> Mwl. Yohana Bahati na Madam Adela Manyanga (Ofisi ya Taaluma & Mitihani)
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            S0486 UOMBONI • NECTA REGISTRATION
          </div>
        </div>
      </div>

      {/* 8. QUICK INLINE MODAL FOR FULL REPORT CARD IF CLICKED */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-black text-slate-900">
                  {language === 'sw' ? 'Hati Rasmi ya Matokeo (Report Slip)' : 'Official Student Report Card'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <span className="text-slate-500 block">{language === 'sw' ? 'Jina la Mwanafunzi:' : 'Student Name:'}</span>
                  <strong className="text-slate-900 text-sm font-sans">{selectedStudentForModal.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">{language === 'sw' ? 'Namba ya Mtihani:' : 'Exam Number:'}</span>
                  <strong className="text-emerald-800 text-sm font-mono">{formatCno(selectedStudentForModal.examNumber)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">{language === 'sw' ? 'Kidato & Mkondo:' : 'Class & Stream:'}</span>
                  <strong className="text-slate-800">{selectedStudentForModal.form} ({selectedStudentForModal.stream})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">{language === 'sw' ? 'Daraja & Pointi:' : 'Division & Points:'}</span>
                  <strong className="text-blue-900 text-sm">{selectedStudentForModal.division} ({selectedStudentForModal.points} Points)</strong>
                </div>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase">
                {language === 'sw' ? 'Alama za Masomo (Subject Grades):' : 'Subject Scores & Grades:'}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedStudentForModal.subjects.map((s, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Score: {s.score}% • Pts: {s.points}</div>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 font-black font-mono text-xs border border-emerald-300">
                      {s.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks */}
            {selectedStudentForModal.headmasterRemarks && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                <strong>{language === 'sw' ? 'Maoni ya Mkuu wa Shule:' : 'Headmaster Remarks:'}</strong> &ldquo;{selectedStudentForModal.headmasterRemarks}&rdquo;
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => downloadStudentResultSlipPdf(selectedStudentForModal)}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{language === 'sw' ? 'Pakua Hati ya PDF' : 'Download PDF Slip'}</span>
              </button>
              <button
                onClick={() => printStudentResultSlipDirectly(selectedStudentForModal)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-300"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'sw' ? 'Chapisha (Print)' : 'Print'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
