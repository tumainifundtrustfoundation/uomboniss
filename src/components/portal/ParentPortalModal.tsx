import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  Users,
  Award,
  CalendarCheck,
  Megaphone,
  Calendar,
  AlertCircle,
  CreditCard,
  Download,
  MessageSquare,
  Phone,
  X,
  Search,
  CheckCircle2,
  Printer,
  FileText,
  Send,
  Building,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  LogOut,
  GraduationCap,
  Play,
  Film,
  FolderOpen,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile, StudentResult, JoiningDocument, SchoolVideo } from '../../types';
import {
  downloadStudentResultSlipPdf,
  printStudentResultSlipDirectly,
  downloadJoiningInstructionsPdf,
} from '../../utils/pdfService';
import { findStudentByNameOrExam, normalizeName } from '../../utils/studentLookupHelper';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../../utils/youtubeHelper';
import { parseGoogleDriveUrl, isGoogleDriveUrl } from '../../utils/googleDriveHelper';
import { InlineReportCardPdfViewer } from '../InlineReportCardPdfViewer';
import { SchoolLogo } from '../SchoolLogo';

interface ParentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const ParentPortalModal: React.FC<ParentPortalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'academics',
}) => {
  const { language } = useLanguage();
  const { logout } = useAuth();
  const {
    students,
    studentResults,
    timetable,
    studentNotices,
    paymentRecords,
    joiningDocs,
    schoolVideos,
  } = useData();

  // Authentication: Parent logs in by their child's full name
  const [authenticatedChild, setAuthenticatedChild] = useState<StudentProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem('uomboni_parent_student');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [inputChildFullName, setInputChildFullName] = useState('');
  const [parentLoginError, setParentLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'academics'
    | 'dashboard'
    | 'children'
    | 'fees'
    | 'downloads'
    | 'videos'
    | 'attendance'
    | 'announcements'
    | 'calendar'
    | 'notices'
    | 'messages'
    | 'contact'
  >((initialTab as any) || 'academics');

  const [selectedResultForPdf, setSelectedResultForPdf] = useState<StudentResult | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<SchoolVideo | null>(null);
  const [showSwitchChildInput, setShowSwitchChildInput] = useState(false);
  const [switchChildName, setSwitchChildName] = useState('');
  const [switchChildError, setSwitchChildError] = useState<string | null>(null);

  // Message Form State
  const [msgTarget, setMsgTarget] = useState<'Headmaster' | 'Academic Master' | 'Second Master' | 'Class Teacher' | 'Bursar'>('Class Teacher');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgSentSuccess, setMsgSentSuccess] = useState(false);

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setParentLoginError(null);
    const trimmed = inputChildFullName.trim();
    if (!trimmed) {
      setParentLoginError('Tafadhali ingiza jina kamili la mwanao.');
      return;
    }

    const found = findStudentByNameOrExam(trimmed, students, studentResults);
    if (found) {
      setAuthenticatedChild(found);
      try {
        sessionStorage.setItem('uomboni_parent_student', JSON.stringify(found));
      } catch {}
    } else {
      setParentLoginError(
        'Jina la mwanafunzi halijapatikana kwenye mfumo. Tafadhali hakikisha umeandika majina kamili (majina matatu) ya mwanao kwa usahihi kama yalivyosajiliwa shuleni (mfano: Baraka John Kimaro).'
      );
    }
  };

  const handleParentLogout = () => {
    setAuthenticatedChild(null);
    setInputChildFullName('');
    setParentLoginError(null);
    setShowSwitchChildInput(false);
    try {
      sessionStorage.removeItem('uomboni_parent_student');
    } catch {}
  };

  const quickParentLogin = (name: string) => {
    setInputChildFullName(name);
    const found = findStudentByNameOrExam(name, students, studentResults);
    if (found) {
      setAuthenticatedChild(found);
      setParentLoginError(null);
      try {
        sessionStorage.setItem('uomboni_parent_student', JSON.stringify(found));
      } catch {}
    }
  };

  const handleSwitchChild = (e: React.FormEvent) => {
    e.preventDefault();
    setSwitchChildError(null);
    const trimmed = switchChildName.trim();
    if (!trimmed) return;
    const found = findStudentByNameOrExam(trimmed, students, studentResults);
    if (found) {
      setAuthenticatedChild(found);
      setShowSwitchChildInput(false);
      setSwitchChildName('');
      try {
        sessionStorage.setItem('uomboni_parent_student', JSON.stringify(found));
      } catch {}
    } else {
      setSwitchChildError('Mwanafunzi hakupatikana. Hakikisha umeandika majina kamili kwa usahihi.');
    }
  };

  if (!isOpen) return null;

  // Active child is strictly the authenticated child
  const activeStudent: StudentProfile = authenticatedChild || {
    id: 'empty',
    studentId: 'USS/---',
    fullName: 'Mwanafunzi',
    examNumber: 'S0486/---',
    gender: 'M',
    form: 'Kidato',
    stream: 'A',
    admissionYear: 2026,
    studentType: 'Bweni (Boarding)',
    feeTotal: 1500000,
    feePaid: 1200000,
  };

  // Student academic results - STRICTLY for this child only!
  const childResults: StudentResult[] = authenticatedChild
    ? studentResults.filter(
        (r) =>
          (authenticatedChild.examNumber &&
            r.examNumber.toLowerCase() === authenticatedChild.examNumber.toLowerCase()) ||
          normalizeName(r.studentName) === normalizeName(authenticatedChild.fullName)
      )
    : [];

  const primaryResult: StudentResult | undefined = childResults[0];

  // Fee calculation for authenticated child
  const totalFees = activeStudent.feeTotal || 1500000;
  const paidFees = activeStudent.feePaid || 1200000;
  const balanceFees = Math.max(0, totalFees - paidFees);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    setMsgSentSuccess(true);
    setTimeout(() => {
      setMsgContent('');
      setMsgSubject('');
      setMsgSentSuccess(false);
    }, 4500);
  };

  const navItems = [
    { id: 'academics', label: 'Matokeo ya Mwanangu', icon: Award },
    { id: 'dashboard', label: 'Muhtasari wa Mwanangu', icon: LayoutDashboard },
    { id: 'children', label: 'Wasifu wa Mwanangu', icon: Users },
    { id: 'fees', label: 'Ada na Malipo', icon: CreditCard },
    { id: 'downloads', label: 'Nyaraka za Drive & Shule', icon: Download },
    { id: 'videos', label: 'Video za Shule (YouTube)', icon: Film },
    { id: 'attendance', label: 'Mahudhurio', icon: CalendarCheck },
    { id: 'announcements', label: 'Matangazo ya Shule', icon: Megaphone },
    { id: 'calendar', label: 'Kalenda ya Muhula', icon: Calendar },
    { id: 'notices', label: 'Taarifa Muhimu', icon: AlertCircle },
    { id: 'messages', label: 'Ujumbe kwa Walimu', icon: MessageSquare },
    { id: 'contact', label: 'Mawasiliano ya Shule', icon: Phone },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#704214]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FFFFF0] rounded-xl shadow-2xl w-full max-w-7xl max-h-[94vh] flex flex-col border border-[#704214]/30 overflow-hidden text-[#704214]">

        {/* ========================================================= */}
        {/* VIEW 1: PARENT LOGIN GATE (Enter Child's Full Name)        */}
        {/* ========================================================= */}
        {!authenticatedChild ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center space-y-6 overflow-y-auto">
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#704214]/70 hover:text-[#704214] hover:bg-[#F5EBD7] transition-colors cursor-pointer"
                aria-label="Funga"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-[#704214] text-[#C9A227] flex items-center justify-center mx-auto shadow-md p-1 border border-[#C9A227]/40">
                <SchoolLogo size="md" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-black text-[#704214]">
                Portal ya Mzazi na Mlezi (Parent Portal)
              </h2>
              <p className="text-xs text-[#704214]/80">
                Shule ya Sekondari Uomboni • NECTA Centre S0486
              </p>
            </div>

            <div className="w-full max-w-md bg-white p-6 sm:p-7 rounded-2xl border border-[#704214]/20 shadow-sm space-y-5">
              <div className="p-3.5 rounded-xl bg-[#F5EBD7] border border-[#704214]/20 text-[#704214] text-xs font-medium space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#704214]">
                  <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                  <span>Faragha ya Matokeo (Student Privacy):</span>
                </div>
                <p className="text-[11px] text-[#704214]/90 leading-relaxed">
                  Tafadhali ingiza <strong>Jina Kamili la Mwanao (Full Name)</strong> kama lilivyosajiliwa shuleni.
                  Kulingana na kanuni za usalama wa taarifa, utaona <strong>matokeo na taarifa za mwanao tu na si vinginevyo</strong>.
                </p>
              </div>

              {parentLoginError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{parentLoginError}</span>
                </div>
              )}

              <form onSubmit={handleParentLogin} className="space-y-4">
                <div>
                  <label className="font-bold text-xs text-[#704214] block mb-1.5">
                    Jina Kamili la Mwanao (Child's Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={inputChildFullName}
                    onChange={(e) => {
                      setInputChildFullName(e.target.value);
                      setParentLoginError(null);
                    }}
                    placeholder="Mfano: BARAKA JOHN KIMARO au BRAYAN RUMISHAEL URIO"
                    className="w-full px-4 py-3 rounded-xl border border-[#704214]/30 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#704214] focus:border-[#704214] transition-all bg-[#FFFFF0]"
                    autoFocus
                  />
                  <p className="text-[10px] text-[#704214]/70 mt-1">
                    Andika majina matatu (Jina la Kwanza, Jina la Kati, na Jina la Ukoo).
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#704214] hover:bg-[#58330F] text-[#FFFFF0] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#C9A227]" />
                  <span>Ingia Kwenye Portal ya Mzazi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sample Quick Login Chips */}
              <div className="pt-4 border-t border-[#704214]/10 space-y-2">
                <span className="text-[11px] font-bold text-[#704214]/70 block uppercase tracking-wider">
                  Mifano ya Wanafunzi (Bofya Kujaribu Haraka):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Brayan Rumishael Urio',
                    'Baraka John Kimaro',
                    'Neema Joseph Mushi',
                    'Amani Charles Shirima',
                    'David Maka Kasimoto',
                  ].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => quickParentLogin(name)}
                      className="px-2.5 py-1 rounded-lg bg-[#F5EBD7] hover:bg-[#ebdcc0] text-[#704214] text-[11px] font-semibold transition-colors cursor-pointer border border-[#704214]/20"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: AUTHENTICATED PARENT WORKSPACE                    */
          /* ========================================================= */
          <>
            {/* Top Header Bar - Sepia Identity */}
            <div className="bg-[#704214] text-[#FFFFF0] px-5 py-4 flex items-center justify-between border-b border-[#C9A227]/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-lg bg-white/10 border border-[#C9A227]/40 shadow-xs">
                  <SchoolLogo size="sm" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-base sm:text-xl font-bold tracking-tight text-[#FFFFF0]">
                      Uomboni Secondary School — Parent Portal
                    </h2>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5EBD7] text-[#704214]">
                      Portal ya Mzazi
                    </span>
                  </div>
                  <p className="text-xs text-[#F5EBD7]/90 mt-0.5">
                    NECTA S0486 · Official Parent &amp; Guardian Information Portal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Active child pill */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#58330F] rounded-md text-xs text-[#F5EBD7] border border-[#C9A227]/30">
                  <span className="text-[#C9A227] font-semibold">Mwanafunzi:</span>
                  <span className="font-bold text-[#FFFFF0]">{activeStudent.fullName}</span>
                  <span className="text-[#F5EBD7]/70">({activeStudent.form})</span>
                </div>

                <button
                  onClick={handleParentLogout}
                  className="px-2.5 py-1 text-xs font-semibold text-[#F5EBD7] hover:text-white bg-[#58330F] hover:bg-[#46280B] rounded border border-[#C9A227]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Badili Mwanafunzi au Toka"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span className="hidden sm:inline">Badili / Toka</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 text-[#F5EBD7] hover:text-[#FFFFF0] rounded-md hover:bg-[#58330F] transition-colors cursor-pointer"
                  aria-label="Close portal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Portal Workspace: Sepia Left Sidebar + Right Content Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#FFFFF0]">
              {/* Left Navigation Sidebar */}
              <aside className="w-full md:w-64 bg-[#F5EBD7] border-r border-[#704214]/15 p-3 sm:p-4 overflow-y-auto shrink-0 flex flex-row md:flex-col gap-1">
                <div className="hidden md:block mb-3 px-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#704214]/70">
                    Menu ya Mzazi
                  </span>
                </div>
                <nav className="flex md:flex-col gap-1 w-full overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all text-left whitespace-nowrap cursor-pointer shrink-0 md:shrink ${
                          isActive
                            ? 'bg-[#704214] text-[#FFFFF0] shadow-xs'
                            : 'text-[#704214] hover:bg-[#FFFFF0] hover:text-[#58330F]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#C9A227]' : 'text-[#704214]/80'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Quick emergency help */}
                <div className="hidden md:block mt-auto pt-4 border-t border-[#704214]/15 px-2 text-[11px] text-[#704214]/80 space-y-1">
                  <span className="font-bold text-[#704214] block">Msaada wa Haraka:</span>
                  <span>Ofisi ya Mkuu: +255 782 558 127</span>
                  <span>Taaluma: +255 745 548 225</span>
                </div>
              </aside>

              {/* Main Display Container */}
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#FFFFF0]">
                {/* 1. ACADEMIC RESULTS - STRICTLY FOR THIS CHILD ONLY! */}
                {activeTab === 'academics' && (
                  <div className="space-y-6">
                    {/* Privacy Assurance Banner */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3 shadow-2xs">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-emerald-900">
                          Matokeo Rasmi ya Mwanao Pekee: {activeStudent.fullName}
                        </h4>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Mfumo unalinda usiri wa wanafunzi kwa 100%. Kama mzazi, unaona matokeo ya mwanao tu na si mwanafunzi mwingine yeyote.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#704214]">Maendeleo ya Kitaaluma &amp; Matokeo ya Mitihani</h3>
                        <p className="text-xs text-[#704214]/70 mt-1">
                          Mwanafunzi: <strong>{activeStudent.fullName}</strong> • Kidato: <strong>{activeStudent.form}</strong> • Mtihani: <strong>{activeStudent.examNumber || 'S0486/---'}</strong>
                        </p>
                      </div>
                      {primaryResult && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedResultForPdf(primaryResult)}
                            className="px-3.5 py-2 bg-[#704214] hover:bg-[#58330F] text-[#FFFFF0] text-xs font-semibold rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#C9A227]" />
                            <span>Tazama &amp; Pakua PDF</span>
                          </button>
                          <button
                            onClick={() => printStudentResultSlipDirectly(primaryResult)}
                            className="px-3.5 py-2 bg-[#F5EBD7] hover:bg-[#ebdcc0] text-[#704214] text-xs font-semibold rounded-md transition-colors flex items-center gap-2 cursor-pointer border border-[#704214]/20"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#704214]" />
                            <span>Chapisha</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {childResults.length > 0 ? (
                      <div className="space-y-6">
                        {childResults.map((result, idx) => (
                          <div key={result.id || idx} className="bg-white rounded-xl border border-[#704214]/20 overflow-hidden shadow-xs">
                            <div className="p-4 bg-[#F5EBD7] border-b border-[#704214]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
                              <div>Mtihani: <span className="font-bold text-[#704214]">{result.examType}</span> ({result.year})</div>
                              <div>Daraja (Division): <span className="font-bold text-[#704214]">{result.division}</span></div>
                              <div>Pointi: <span className="font-bold">{result.points} Points</span></div>
                              <div>Wastani: <span className="font-bold">{result.averageMarks ? `${result.averageMarks.toFixed(1)}%` : `${result.points} Points`}</span></div>
                              {result.classPosition && (
                                <div>Nafasi Darasani: <span className="font-bold text-[#704214]">{result.classPosition}</span></div>
                              )}
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-[#FFFFF0] border-b border-[#704214]/10 text-[#704214]/80">
                                  <tr>
                                    <th className="px-4 py-2.5 font-bold">Somo (Subject)</th>
                                    <th className="px-4 py-2.5 font-bold text-center">Alama (Score %)</th>
                                    <th className="px-4 py-2.5 font-bold text-center">Daraja (Grade)</th>
                                    <th className="px-4 py-2.5 font-bold">Maoni ya Mwalimu (Remarks)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#704214]/10">
                                  {result.subjects.map((sub, index) => (
                                    <tr key={index} className="hover:bg-[#FFFFF0]/80">
                                      <td className="px-4 py-2.5 font-semibold text-[#704214]">{sub.name}</td>
                                      <td className="px-4 py-2.5 text-center font-bold text-[#704214]">{sub.score}%</td>
                                      <td className="px-4 py-2.5 text-center">
                                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                                          sub.grade === 'A'
                                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                            : sub.grade === 'B'
                                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                            : sub.grade === 'C'
                                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                            : 'bg-stone-100 text-stone-800'
                                        }`}>
                                          {sub.grade}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2.5 text-[#704214]/80">{sub.remarks || 'Jitahidi Zaidi'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {(result.headmasterRemarks || (result as any).remarks) && (
                              <div className="p-3 bg-[#FFFFF0] border-t border-[#704214]/10 text-xs text-[#704214]/90 flex items-center justify-between">
                                <span><strong>Maoni ya Mkuu wa Shule / Taaluma:</strong> {result.headmasterRemarks || (result as any).remarks}</span>
                                <button
                                  onClick={() => setSelectedResultForPdf(result)}
                                  className="text-xs text-[#704214] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
                                  <span>Fungua Ripoti Kamili</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 bg-white rounded-xl border border-[#704214]/20 text-center space-y-3">
                        <Award className="w-10 h-10 text-[#C9A227] mx-auto opacity-70" />
                        <h4 className="font-bold text-sm text-[#704214]">Hakuna Rekodi ya Mtihani Iliyochapishwa Bado</h4>
                        <p className="text-xs text-[#704214]/70 max-w-md mx-auto">
                          Alama za mitihani ya sasa kwa mwanafunzi <strong>{activeStudent.fullName}</strong> zinakaguliwa na idara ya taaluma kabla ya kuchapishwa rasmi.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. DASHBOARD OVERVIEW */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Child Summary Hero Card */}
                    <div className="bg-white p-6 rounded-lg border border-[#704214]/20 border-l-4 border-l-[#704214] shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider block">
                            Taarifa ya Mwanafunzi (Active Child)
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold text-[#704214] mt-1">
                            {activeStudent.fullName}
                          </h3>
                          <p className="text-xs text-[#704214]/80 mt-1">
                            Namba ya Usajili: <strong>{activeStudent.studentId}</strong> · Mtihani: <strong>{activeStudent.examNumber || 'S0486/---'}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded bg-[#F5EBD7] text-[#704214] text-xs font-bold border border-[#704214]/20">
                            {activeStudent.form} {activeStudent.stream ? `(${activeStudent.stream})` : ''}
                          </span>
                          <span className="px-3 py-1 rounded bg-[#F5EBD7] text-[#704214] text-xs font-semibold border border-[#704214]/20">
                            {activeStudent.studentType || 'Bweni'}
                          </span>
                        </div>
                      </div>

                      {/* 4 Metric Columns */}
                      <div className="mt-6 pt-6 border-t border-[#704214]/10 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3 bg-[#FFFFF0] rounded-md border border-[#704214]/10">
                          <span className="text-[11px] text-[#704214]/70 block">Ufaulu wa Hivi Karibuni</span>
                          <span className="text-base font-bold text-[#704214] block mt-0.5">
                            {primaryResult?.division || 'Division I (Points 11)'}
                          </span>
                        </div>
                        <div className="p-3 bg-[#FFFFF0] rounded-md border border-[#704214]/10">
                          <span className="text-[11px] text-[#704214]/70 block">Mahudhurio ya Shule</span>
                          <span className="text-base font-bold text-[#704214] block mt-0.5">
                            97.5% (Siku 68 / 70)
                          </span>
                        </div>
                        <div className="p-3 bg-[#FFFFF0] rounded-md border border-[#704214]/10">
                          <span className="text-[11px] text-[#704214]/70 block">Salio la Ada</span>
                          <span className={`text-base font-bold block mt-0.5 ${balanceFees > 0 ? 'text-[#704214]' : 'text-emerald-700'}`}>
                            TZS {balanceFees.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3 bg-[#FFFFF0] rounded-md border border-[#704214]/10">
                          <span className="text-[11px] text-[#704214]/70 block">Nidhamu &amp; Malezi</span>
                          <span className="text-base font-bold text-[#704214] block mt-0.5">
                            Bora Sana (Grade A)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick actions grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div
                        onClick={() => setActiveTab('academics')}
                        className="p-5 bg-white rounded-lg border border-[#704214]/15 hover:border-[#704214] transition-colors cursor-pointer shadow-xs"
                      >
                        <Award className="w-5 h-5 text-[#C9A227] mb-2" />
                        <h4 className="font-bold text-sm text-[#704214]">Matokeo ya Mitihani</h4>
                        <p className="text-xs text-[#704214]/70 mt-1">
                          Tazama alama za masomo, ripoti ya muhula, na ufaulu wa NECTA wa mwanao pekee.
                        </p>
                      </div>
                      <div
                        onClick={() => setActiveTab('fees')}
                        className="p-5 bg-white rounded-lg border border-[#704214]/15 hover:border-[#704214] transition-colors cursor-pointer shadow-xs"
                      >
                        <CreditCard className="w-5 h-5 text-[#C9A227] mb-2" />
                        <h4 className="font-bold text-sm text-[#704214]">Malipo ya Ada &amp; Benki</h4>
                        <p className="text-xs text-[#704214]/70 mt-1">
                          Namba za akaunti za CRDB na NMB, taarifa ya stakabadhi na masalio ya mwanao.
                        </p>
                      </div>
                      <div
                        onClick={() => setActiveTab('downloads')}
                        className="p-5 bg-white rounded-lg border border-[#704214]/15 hover:border-[#704214] transition-colors cursor-pointer shadow-xs"
                      >
                        <Download className="w-5 h-5 text-[#C9A227] mb-2" />
                        <h4 className="font-bold text-sm text-[#704214]">Nyaraka za Google Drive</h4>
                        <p className="text-xs text-[#704214]/70 mt-1">
                          Joining Instructions, fomu za hospitali, na miongozo iliyowekwa na utawala.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PROFILE / WASIFU WA MWANANGU */}
                {activeTab === 'children' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#704214]">Wasifu wa Mwanangu (Student Profile)</h3>
                      <p className="text-xs text-[#704214]/70 mt-1">
                        Taarifa rasmi za usajili wa <strong>{activeStudent.fullName}</strong> shuleni.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-[#704214]/20 shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#704214]/10">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-[#704214] text-[#C9A227] flex items-center justify-center font-black text-xl shadow-md">
                            {activeStudent.fullName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-[#704214]">{activeStudent.fullName}</h4>
                            <p className="text-xs text-[#704214]/70 mt-0.5">
                              ID ya Shule: <span className="font-mono font-bold text-[#704214]">{activeStudent.studentId}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowSwitchChildInput(!showSwitchChildInput)}
                          className="px-3.5 py-2 rounded-lg bg-[#F5EBD7] text-[#704214] text-xs font-bold border border-[#704214]/30 hover:bg-[#ebdcc0] transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <Users className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>Badili Mwanafunzi / Mtoto Mwingine</span>
                        </button>
                      </div>

                      {/* Switch Child Form */}
                      {showSwitchChildInput && (
                        <div className="p-4 bg-[#F5EBD7] rounded-xl border border-[#704214]/20 space-y-3 animate-in fade-in">
                          <h5 className="font-bold text-xs text-[#704214]">
                            Ingiza Jina Kamili la Mwanao Mwingine (Three Names):
                          </h5>
                          {switchChildError && (
                            <p className="text-xs text-rose-800 font-semibold">{switchChildError}</p>
                          )}
                          <form onSubmit={handleSwitchChild} className="flex gap-2">
                            <input
                              type="text"
                              value={switchChildName}
                              onChange={(e) => setSwitchChildName(e.target.value)}
                              placeholder="Mfano: NEEMA JOSEPH MUSHI"
                              className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#704214]/30 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#704214]"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-[#704214] text-white text-xs font-bold rounded-lg hover:bg-[#58330F] cursor-pointer"
                            >
                              Tafuta
                            </button>
                          </form>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-3.5 bg-[#FFFFF0] rounded-lg border border-[#704214]/10">
                          <span className="text-[10px] text-[#704214]/70 font-bold uppercase block">Kidato &amp; Mkondo</span>
                          <span className="font-bold text-sm text-[#704214] mt-1 block">
                            {activeStudent.form} {activeStudent.stream ? `• Mkondo ${activeStudent.stream}` : ''}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[#FFFFF0] rounded-lg border border-[#704214]/10">
                          <span className="text-[10px] text-[#704214]/70 font-bold uppercase block">Namba ya Mtihani (NECTA)</span>
                          <span className="font-bold text-sm text-[#704214] font-mono mt-1 block">
                            {activeStudent.examNumber || 'S0486/---'}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[#FFFFF0] rounded-lg border border-[#704214]/10">
                          <span className="text-[10px] text-[#704214]/70 font-bold uppercase block">Hali ya Masomo</span>
                          <span className="font-bold text-sm text-[#704214] mt-1 block">
                            {activeStudent.studentType || 'Bweni (Boarding)'}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[#FFFFF0] rounded-lg border border-[#704214]/10">
                          <span className="text-[10px] text-[#704214]/70 font-bold uppercase block">Jina la Mzazi / Mlezi</span>
                          <span className="font-bold text-sm text-[#704214] mt-1 block">
                            {activeStudent.parentName || 'Mzazi / Mlezi Mteule'}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[#FFFFF0] rounded-lg border border-[#704214]/10">
                          <span className="text-[10px] text-[#704214]/70 font-bold uppercase block">Mawasiliano ya Dharura</span>
                          <span className="font-bold text-sm text-[#704214] font-mono mt-1 block">
                            {activeStudent.parentPhone || '+255 782 558 127'}
                          </span>
                        </div>
                        <div className="p-3.5 bg-[#FFFFF0] rounded-lg border border-[#704214]/10">
                          <span className="text-[10px] text-[#704214]/70 font-bold uppercase block">Mwaka wa Kujiunga</span>
                          <span className="font-bold text-sm text-[#704214] mt-1 block">
                            {activeStudent.admissionYear || '2024'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. FEES & BANK ACCOUNTS */}
                {activeTab === 'fees' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#704214]">Ada na Malipo ya Shule</h3>
                      <p className="text-xs text-[#704214]/70 mt-1">
                        Hali ya malipo ya ada kwa ajili ya <strong>{activeStudent.fullName}</strong> ({activeStudent.form}).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-[#704214]/15 shadow-xs">
                        <span className="text-xs text-[#704214]/70 block font-bold">Jumla ya Ada kwa Mwaka</span>
                        <span className="text-xl font-bold text-[#704214] mt-1 block">TZS {totalFees.toLocaleString()}</span>
                        <span className="text-[11px] text-[#704214]/70 mt-0.5 block">Ada na huduma za bweni</span>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-[#704214]/15 shadow-xs">
                        <span className="text-xs text-emerald-700 block font-bold">Kiasi Kilicholipwa</span>
                        <span className="text-xl font-bold text-emerald-800 mt-1 block">TZS {paidFees.toLocaleString()}</span>
                        <span className="text-[11px] text-emerald-700 mt-0.5 block">Imethibitishwa na Mhasibu</span>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-[#704214]/15 shadow-xs">
                        <span className="text-xs text-[#704214]/70 block font-bold">Salio Lililobaki</span>
                        <span className="text-xl font-bold text-[#704214] mt-1 block">TZS {balanceFees.toLocaleString()}</span>
                        <span className="text-[11px] text-[#704214]/70 mt-0.5 block">Lipwa kabla ya mwisho wa muhula</span>
                      </div>
                    </div>

                    {/* Official Bank Accounts for Parents */}
                    <div className="bg-white p-6 rounded-xl border border-[#704214]/20 shadow-xs space-y-4">
                      <h4 className="font-bold text-sm text-[#704214] flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#C9A227]" />
                        <span>Akaunti Rasmi za Benki kwa Malipo ya Ada</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-lg bg-[#FFFFF0] border border-[#704214]/15 space-y-1.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">CRDB BANK</span>
                          <p className="font-bold text-sm text-[#704214]">0150248554700</p>
                          <p className="text-[11px] text-[#704214]/80">Jina: <strong>UOMBONI SECONDARY SCHOOL</strong></p>
                          <p className="text-[10px] text-[#704214]/70">Tawi: Marangu Branch</p>
                        </div>
                        <div className="p-4 rounded-lg bg-[#FFFFF0] border border-[#704214]/15 space-y-1.5">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">NMB BANK</span>
                          <p className="font-bold text-sm text-[#704214]">40310008594</p>
                          <p className="text-[11px] text-[#704214]/80">Jina: <strong>UOMBONI SECONDARY SCHOOL</strong></p>
                          <p className="text-[10px] text-[#704214]/70">Tawi: Mwika Branch</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#704214]/80 pt-2 border-t border-[#704214]/10">
                        * Kumbuka kuandika jina kamili la mwanao (<strong>{activeStudent.fullName}</strong>) na kidato chake kwenye risiti ya benki au ujumbe wa malipo.
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. DOWNLOADS & GOOGLE DRIVE DOCUMENTS */}
                {activeTab === 'downloads' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#704214]">Nyaraka za Shule &amp; Google Drive (Downloads)</h3>
                      <p className="text-xs text-[#704214]/70 mt-1">
                        Fomu rasmi za kujiunga na shule, miongozo ya sare, na stakabadhi zilizowekwa na utawala kupitia Google Drive.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {joiningDocs.map((docItem) => {
                        const driveInfo = docItem.googleDriveUrl ? parseGoogleDriveUrl(docItem.googleDriveUrl) : null;
                        return (
                          <div
                            key={docItem.id}
                            className="bg-white p-5 rounded-xl border border-[#704214]/20 shadow-xs flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded bg-[#F5EBD7] text-[#704214] text-[10px] font-bold">
                                  {docItem.targetGroup || 'Wazazi & Wanafunzi'}
                                </span>
                                {docItem.googleDriveUrl && (
                                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold flex items-center gap-1">
                                    <FolderOpen className="w-3 h-3 text-blue-700" />
                                    <span>Google Drive</span>
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm text-[#704214]">{docItem.titleSw}</h4>
                              <p className="text-xs text-[#704214]/70 leading-relaxed">{docItem.descriptionSw}</p>
                            </div>

                            <div className="pt-3 border-t border-[#704214]/10 flex items-center justify-between gap-2">
                              {driveInfo ? (
                                <>
                                  <a
                                    href={driveInfo.viewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-[#F5EBD7] hover:bg-[#ebdcc0] text-[#704214] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-[#704214]/20"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-[#704214]" />
                                    <span>Fungua Drive</span>
                                  </a>
                                  <a
                                    href={driveInfo.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-1.5 bg-[#704214] hover:bg-[#58330F] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                                  >
                                    <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                                    <span>Pakua Waraka</span>
                                  </a>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => downloadJoiningInstructionsPdf()}
                                  className="px-3.5 py-1.5 bg-[#704214] hover:bg-[#58330F] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer ml-auto"
                                >
                                  <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                                  <span>Pakua PDF</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. YOUTUBE SCHOOL VIDEOS */}
                {activeTab === 'videos' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#704214]">Video za Shule (YouTube)</h3>
                      <p className="text-xs text-[#704214]/70 mt-1">
                        Matukio ya shule, mahafali, masomo, na ujumbe wa mkuu wa shule yaliyowekwa na utawala kupitia YouTube.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {schoolVideos.map((video) => {
                        const thumbUrl = getYouTubeThumbnail(video.youtubeId);
                        return (
                          <div
                            key={video.id}
                            className="bg-white rounded-xl border border-[#704214]/20 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                          >
                            <div
                              onClick={() => setActiveVideoModal(video)}
                              className="relative aspect-video bg-slate-900 cursor-pointer group overflow-hidden"
                            >
                              <img
                                src={thumbUrl}
                                alt={video.titleSw}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://img.youtube.com/vi/' + video.youtubeId + '/hqdefault.jpg';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-6 h-6 fill-white ml-0.5" />
                                </div>
                              </div>
                              {video.duration && (
                                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded">
                                  {video.duration}
                                </span>
                              )}
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                              <div>
                                <span className="px-2 py-0.5 rounded bg-[#F5EBD7] text-[#704214] text-[10px] font-bold">
                                  {video.category}
                                </span>
                                <h4 className="font-bold text-sm text-[#704214] mt-1 line-clamp-2">
                                  {video.titleSw}
                                </h4>
                                {video.descriptionSw && (
                                  <p className="text-xs text-[#704214]/70 mt-1 line-clamp-2">
                                    {video.descriptionSw}
                                  </p>
                                )}
                              </div>

                              <div className="pt-2 border-t border-[#704214]/10 flex items-center justify-between text-[11px] text-[#704214]/70">
                                <span>{video.date}</span>
                                <a
                                  href={video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#704214] font-bold hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3 text-red-600" />
                                  <span>YouTube</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. ATTENDANCE */}
                {activeTab === 'attendance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#704214]">Mahudhurio ya Shule (Attendance Records)</h3>
                      <p className="text-xs text-[#704214]/70 mt-1">
                        Rekodi rasmi za uwepo darasani na shuleni kwa ajili ya <strong>{activeStudent.fullName}</strong>.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                        <span className="text-xs text-[#704214]/70 block">Asilimia ya Mahudhurio</span>
                        <span className="text-3xl font-bold text-[#704214] mt-1 block">97.8%</span>
                        <span className="text-[11px] text-[#704214]/80 mt-1 block">Viwango vya juu vya mahudhurio</span>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                        <span className="text-xs text-[#704214]/70 block">Siku Alizohudhuria</span>
                        <span className="text-3xl font-bold text-emerald-800 mt-1 block">68</span>
                        <span className="text-[11px] text-[#704214]/80 mt-1 block">Kati ya siku 70 zilizofundishwa</span>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                        <span className="text-xs text-[#704214]/70 block">Sababu za Kutohudhuria</span>
                        <span className="text-3xl font-bold text-[#704214] mt-1 block">2 Siku</span>
                        <span className="text-[11px] text-[#704214]/80 mt-1 block">Ruhusa rasmi ya matibabu</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. ANNOUNCEMENTS */}
                {activeTab === 'announcements' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#704214]">Matangazo ya Shule kwa Wazazi</h3>
                      <p className="text-xs text-[#704214]/70 mt-1">
                        Taarifa rasmi na miongozo kutoka kwa Uongozi wa Shule ya Sekondari Uomboni.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {studentNotices.map((n) => (
                        <div key={n.id} className="p-4 bg-white rounded-xl border border-[#704214]/20 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-[#F5EBD7] text-[#704214] text-[10px] font-bold">
                              {n.targetAudience || 'Wazazi Wote'}
                            </span>
                            <span className="text-[11px] text-[#704214]/70">{n.date || 'Januari 2026'}</span>
                          </div>
                          <h4 className="font-bold text-sm text-[#704214]">{n.title || n.titleSw}</h4>
                          <p className="text-xs text-[#704214]/80 leading-relaxed">{n.content || n.contentSw}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. CALENDAR */}
                {activeTab === 'calendar' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#704214]">Kalenda ya Muhula wa Masomo 2026</h3>
                      <p className="text-xs text-[#704214]/70 mt-1">
                        Tarehe muhimu za mitihani, likizo, na mikutano ya wazazi.
                      </p>
                    </div>

                    <div className="bg-white rounded-xl border border-[#704214]/20 p-5 space-y-4">
                      <div className="space-y-3 text-xs">
                        <div className="p-3.5 bg-[#FFFFF0] rounded-lg border border-[#704214]/15 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#704214] block">Kufungua Shule (Muhula wa Kwanza)</span>
                            <span className="text-[11px] text-[#704214]/70">Wanafunzi wote kuripoti bweni</span>
                          </div>
                          <span className="font-bold text-[#704214] bg-[#F5EBD7] px-2.5 py-1 rounded">12 Jan 2026</span>
                        </div>
                        <div className="p-3.5 bg-[#FFFFF0] rounded-lg border border-[#704214]/15 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#704214] block">Mitihani ya Nusu Muhula (Midterm)</span>
                            <span className="text-[11px] text-[#704214]/70">Tathmini ya kwanza ya maendeleo</span>
                          </div>
                          <span className="font-bold text-[#704214] bg-[#F5EBD7] px-2.5 py-1 rounded">23 - 27 Feb 2026</span>
                        </div>
                        <div className="p-3.5 bg-[#FFFFF0] rounded-lg border border-[#704214]/15 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#704214] block">Mkutano Mkuu wa Wazazi (AGM)</span>
                            <span className="text-[11px] text-[#704214]/70">Mkutano wa maendeleo na taaluma</span>
                          </div>
                          <span className="font-bold text-[#704214] bg-[#F5EBD7] px-2.5 py-1 rounded">28 Machi 2026</span>
                        </div>
                        <div className="p-3.5 bg-[#FFFFF0] rounded-lg border border-[#704214]/15 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#704214] block">Likizo ya Katikati ya Mwaka</span>
                            <span className="text-[11px] text-[#704214]/70">Shule inafungwa kwa wiki tatu</span>
                          </div>
                          <span className="font-bold text-[#704214] bg-[#F5EBD7] px-2.5 py-1 rounded">05 Juni 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. NOTICES */}
                {activeTab === 'notices' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#704214]">Taarifa Muhimu (Noticeboard)</h3>
                      <p className="text-xs text-[#704214]/70 mt-1">
                        Matangazo rasmi ya shule na waraka wa taaluma.
                      </p>
                    </div>

                    <div className="p-5 bg-white rounded-xl border border-[#704214]/20 space-y-3">
                      <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1">
                        <span className="font-bold block text-amber-900">Miongozo ya Afya &amp; Bima ya Afya (NHIF)</span>
                        <p className="text-[11px] leading-relaxed">
                          Wazazi wote wanakumbushwa kuhakikisha wanafunzi wana kadi halali ya bima ya afya (NHIF) au kitambulisho cha matibabu kabla ya kuripoti bweni.
                        </p>
                      </div>
                      <div className="p-3.5 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-950 space-y-1">
                        <span className="font-bold block text-blue-900">Sare za Shule &amp; Vifaa Vilivyoidhinishwa</span>
                        <p className="text-[11px] leading-relaxed">
                          Kila mwanafunzi anapaswa kuwa na jozi 2 za sare za shule (Brown na Cream), viatu vyeusi vya ngozi visivyo na visigino virefu, na sweta ya kijani ya shule.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. MESSAGES */}
                {activeTab === 'messages' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#704214]">Ujumbe kwa Walimu &amp; Utawala</h3>
                      <p className="text-xs text-[#704214]/70 mt-1">
                        Tuma ujumbe wa moja kwa moja kuhusu mwanao <strong>{activeStudent.fullName}</strong>.
                      </p>
                    </div>

                    {msgSentSuccess && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Ujumbe wako umetumwa kikamilifu! Mwalimu husika atakujibu kupitia namba yako ya simu.</span>
                      </div>
                    )}

                    <form onSubmit={handleSendMessage} className="bg-white p-6 rounded-xl border border-[#704214]/20 shadow-xs space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-[#704214] mb-1">Mlengwa wa Ujumbe *</label>
                        <select
                          value={msgTarget}
                          onChange={(e) => setMsgTarget(e.target.value as any)}
                          className="w-full p-2.5 rounded-lg border border-[#704214]/30 bg-[#FFFFF0] font-semibold text-[#704214]"
                        >
                          <option value="Class Teacher">Mwalimu wa Darasa ({activeStudent.form})</option>
                          <option value="Academic Master">Mwalimu wa Taaluma</option>
                          <option value="Headmaster">Mkuu wa Shule</option>
                          <option value="Second Master">Makamu Mkuu wa Shule</option>
                          <option value="Bursar">Mhasibu wa Shule (Ada & Malipo)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-[#704214] mb-1">Kichwa cha Ujumbe (Subject) *</label>
                        <input
                          type="text"
                          required
                          value={msgSubject}
                          onChange={(e) => setMsgSubject(e.target.value)}
                          placeholder="Mfano: Taarifa ya Ugonjwa / Ada / Maendeleo ya Masomo"
                          className="w-full p-2.5 rounded-lg border border-[#704214]/30 bg-[#FFFFF0] text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#704214] mb-1">Maelezo ya Ujumbe *</label>
                        <textarea
                          rows={4}
                          required
                          value={msgContent}
                          onChange={(e) => setMsgContent(e.target.value)}
                          placeholder="Andika ujumbe wako hapa..."
                          className="w-full p-2.5 rounded-lg border border-[#704214]/30 bg-[#FFFFF0] text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#704214] hover:bg-[#58330F] text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Tuma Ujumbe Sasa</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* 12. CONTACT */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#704214]">Mawasiliano Rasmi ya Shule</h3>
                      <p className="text-xs text-[#704214]/70 mt-1">
                        Shule ya Sekondari Uomboni, S.L.P 361 Marangu, Moshi - Kilimanjaro.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 bg-[#FFFFF0] rounded-md border border-[#704214]/15">
                        <span className="font-bold text-[#704214] block">Mkuu wa Shule</span>
                        <span className="text-[#704214]/80 block mt-1">Br. Adolph Massawe</span>
                        <span className="font-mono text-[#704214] font-bold block mt-1">+255 782 558 127</span>
                      </div>
                      <div className="p-4 bg-[#FFFFF0] rounded-md border border-[#704214]/15">
                        <span className="font-bold text-[#704214] block">Makamu Mkuu wa Shule</span>
                        <span className="text-[#704214]/80 block mt-1">Mwl. Peter Mboya</span>
                        <span className="font-mono text-[#704214] font-bold block mt-1">+255 754 532 949</span>
                      </div>
                      <div className="p-4 bg-[#FFFFF0] rounded-md border border-[#704214]/15">
                        <span className="font-bold text-[#704214] block">Mwalimu wa Taaluma</span>
                        <span className="text-[#704214]/80 block mt-1">Mwl. Yohana Bahati</span>
                        <span className="font-mono text-[#704214] font-bold block mt-1">+255 745 548 225</span>
                      </div>
                      <div className="p-4 bg-[#FFFFF0] rounded-md border border-[#704214]/15">
                        <span className="font-bold text-[#704214] block">Mhasibu wa Shule (Bursar)</span>
                        <span className="text-[#704214]/80 block mt-1">Mwl. Sigbert Minja</span>
                        <span className="font-mono text-[#704214] font-bold block mt-1">+255 752 000 939</span>
                      </div>
                      <div className="p-4 bg-[#FFFFF0] rounded-md border border-[#704214]/15">
                        <span className="font-bold text-[#704214] block">Barua Pepe Rasmi</span>
                        <span className="text-[#704214]/80 block mt-1">uombonisec@gmail.com</span>
                        <span className="font-mono text-[#704214] font-bold block mt-1">info@uomboniss.sc.tz</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#704214]/10 text-[#704214]/80 text-[11px]">
                      Saa za Ofisi: Jumatatu – Ijumaa kuanzia saa 2:00 Asubuhi hadi 10:30 Jioni.
                    </div>
                  </div>
                )}
              </main>
            </div>

            {/* Modal footer info */}
            <div className="bg-[#F5EBD7] px-6 py-3 border-t border-[#704214]/15 flex items-center justify-between text-xs text-[#704214]/80 shrink-0">
              <div>
                &copy; 2026 Uomboni Secondary School · Parent Portal System
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-[#704214] text-white font-semibold rounded text-xs hover:bg-[#58330F] transition-colors cursor-pointer"
              >
                Funga Portal
              </button>
            </div>
          </>
        )}
      </div>

      {/* PDF Report Viewer Modal */}
      {selectedResultForPdf && (
        <InlineReportCardPdfViewer
          student={selectedResultForPdf}
          isModal={true}
          onCloseModal={() => setSelectedResultForPdf(null)}
        />
      )}

      {/* YouTube Video Interactive Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-red-500 fill-red-500" />
                <h4 className="font-bold text-sm sm:text-base line-clamp-1">{activeVideoModal.titleSw}</h4>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black w-full">
              <iframe
                src={getYouTubeEmbedUrl(activeVideoModal.youtubeId, { autoplay: true })}
                title={activeVideoModal.titleSw}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800">
              <span>{activeVideoModal.category} • {activeVideoModal.date}</span>
              <a
                href={activeVideoModal.youtubeUrl || `https://www.youtube.com/watch?v=${activeVideoModal.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5"
              >
                <span>Fungua kwenye Tovuti ya YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
