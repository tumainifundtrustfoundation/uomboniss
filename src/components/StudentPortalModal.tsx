import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { StudentProfile, StudentResult, SchoolVideo, JoiningDocument } from '../types';
import { findStudentByNameOrExam, normalizeName } from '../utils/studentLookupHelper';
import { downloadStudentResultSlipPdf, printStudentResultSlipDirectly, downloadJoiningInstructionsPdf } from '../utils/pdfService';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/youtubeHelper';
import { parseGoogleDriveUrl } from '../utils/googleDriveHelper';
import { SchoolLogo } from './SchoolLogo';
import {
  GraduationCap,
  Award,
  Calendar,
  BookOpen,
  Bell,
  User,
  X,
  LogOut,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  FileText,
  Play,
  Film,
  FolderOpen,
  ExternalLink,
} from 'lucide-react';

interface StudentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const StudentPortalModal: React.FC<StudentPortalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'results',
}) => {
  const { language } = useLanguage();
  const { students, studentResults, timetable, studentNotices, schoolVideos, joiningDocs } = useData();

  // Authentication state for student
  const [authenticatedStudent, setAuthenticatedStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = sessionStorage.getItem('uomboni_student_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [inputThreeNames, setInputThreeNames] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'timetable' | 'subjects' | 'documents' | 'videos' | 'notices' | 'profile'>(
    (initialTab as any) || 'results'
  );
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<SchoolVideo | null>(null);

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const trimmed = inputThreeNames.trim();
    if (!trimmed) {
      setLoginError('Tafadhali ingiza majina yako matatu.');
      return;
    }

    // Strictly enforce 3 names (First Name, Middle Name, Surname)
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    if (tokens.length < 3) {
      setLoginError(
        'Tafadhali ingiza majina yako yote matatu kamili (Jina la Kwanza, Jina la Kati, na Jina la Ukoo - mfano: Baraka John Kimaro).'
      );
      return;
    }

    const found = findStudentByNameOrExam(trimmed, students, studentResults);
    if (found) {
      setAuthenticatedStudent(found);
      try {
        sessionStorage.setItem('uomboni_student_session', JSON.stringify(found));
      } catch {}
    } else {
      setLoginError(
        'Majina hayajapatikana kwenye daftari la wanafunzi. Hakikisha umeandika majina yako matatu sahihi kama yalivyosajiliwa shuleni (mfano: Jina la Kwanza, la Kati, na Ukoo).'
      );
    }
  };

  const handleStudentLogout = () => {
    setAuthenticatedStudent(null);
    setInputThreeNames('');
    setLoginError(null);
    try {
      sessionStorage.removeItem('uomboni_student_session');
    } catch {}
  };

  const quickLogin = (name: string) => {
    setInputThreeNames(name);
    const found = findStudentByNameOrExam(name, students, studentResults);
    if (found) {
      setAuthenticatedStudent(found);
      setLoginError(null);
      try {
        sessionStorage.setItem('uomboni_student_session', JSON.stringify(found));
      } catch {}
    }
  };

  // When logged in, fetch results strictly for this student
  const studentResultsList = useMemo(() => {
    if (!authenticatedStudent) return [];
    return studentResults.filter(
      (r) =>
        (authenticatedStudent.examNumber &&
          r.examNumber.toLowerCase() === authenticatedStudent.examNumber.toLowerCase()) ||
        normalizeName(r.studentName) === normalizeName(authenticatedStudent.fullName)
    );
  }, [authenticatedStudent, studentResults]);

  const activeResult: StudentResult | undefined = studentResultsList[0];

  // Filter timetable for this student's form
  const studentTimetable = useMemo(() => {
    if (!authenticatedStudent) return [];
    const studentForm = authenticatedStudent.form.toLowerCase();
    return timetable.filter((t) => {
      const tForm = t.form.toLowerCase();
      return (
        tForm.includes(studentForm) ||
        studentForm.includes(tForm) ||
        (studentForm.includes('1') && tForm.includes('1')) ||
        (studentForm.includes('2') && tForm.includes('2')) ||
        (studentForm.includes('3') && tForm.includes('3')) ||
        (studentForm.includes('4') && tForm.includes('4'))
      );
    });
  }, [authenticatedStudent, timetable]);

  // Filter notices
  const relevantNotices = useMemo(() => {
    if (!authenticatedStudent) return [];
    const formNum = authenticatedStudent.form;
    return studentNotices.filter((n) => {
      const target = (n.targetAudience || n.targetGroup || '').toLowerCase();
      return (
        target.includes('all') ||
        target.includes('wote') ||
        target.includes(formNum.toLowerCase())
      );
    });
  }, [authenticatedStudent, studentNotices]);

  const handleDownloadSlip = () => {
    if (!activeResult) return;
    downloadStudentResultSlipPdf(activeResult);
    setDownloadSuccessToast('Ripoti ya matokeo inapakuliwa kwenye kifaa chako!');
    setTimeout(() => setDownloadSuccessToast(null), 3500);
  };

  const handlePrintSlip = () => {
    if (!activeResult) return;
    printStudentResultSlipDirectly(activeResult);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102A43]/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FFFFF0] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col border border-[#102A43]/20 overflow-hidden text-[#102A43]">

        {/* ========================================================= */}
        {/* VIEW 1: STUDENT LOGIN GATE (Enter Three Names to Login)   */}
        {/* ========================================================= */}
        {!authenticatedStudent ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center space-y-6 overflow-y-auto">
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Funga"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-[#102A43] text-[#C9A227] flex items-center justify-center mx-auto shadow-md p-1 border border-[#C9A227]/40">
                <SchoolLogo size="md" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-black text-[#102A43]">
                Portal ya Mwanafunzi (Student Academic Portal)
              </h2>
              <p className="text-xs text-slate-600">
                Shule ya Sekondari Uomboni • NECTA Centre S0486
              </p>
            </div>

            <div className="w-full max-w-md bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs font-medium space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Kuingia Lango la Mwanafunzi:</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Tafadhali ingiza <strong>majina yako matatu (Majina Kamili)</strong> kama yalivyosajiliwa shuleni kuangalia matokeo yako, ratiba, na taarifa zako za kimasomo.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{loginError}</span>
                </div>
              )}

              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="font-bold text-xs text-slate-800 block mb-1.5">
                    Majina Yako Matatu (Three Full Names) *
                  </label>
                  <input
                    type="text"
                    required
                    value={inputThreeNames}
                    onChange={(e) => {
                      setInputThreeNames(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="Mfano: BARAKA JOHN KIMARO"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-all bg-[#FFFFF0]/40"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Ingiza Jina la Kwanza, Jina la Kati, na Ukoo (mfano: Baraka John Kimaro au Rehema Peter Temu).
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-[#C9A227]" />
                  <span>Ingia Kwenye Portal Yangu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Demo / Sample Students Helper */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                  Mifano ya Wanafunzi (Bonyeza Kujaribu):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Baraka John Kimaro',
                    'Brayan Rumishael Urio',
                    'Neema Joseph Mushi',
                    'Amani Charles Shirima',
                    'David Maka Kasimoto',
                  ].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => quickLogin(name)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
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
          /* VIEW 2: AUTHENTICATED STUDENT DASHBOARD                    */
          /* ========================================================= */
          <>
            {/* Top Student Header Bar */}
            <div className="bg-[#102A43] text-white px-5 py-4 flex items-center justify-between border-b border-[#C9A227]/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C9A227] to-amber-200 text-slate-950 font-black text-base flex items-center justify-center shadow-md">
                  {authenticatedStudent.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      {authenticatedStudent.fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#C9A227] text-slate-950">
                      {authenticatedStudent.form}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    Namba ya Mtihani: <span className="text-amber-300 font-bold">{authenticatedStudent.examNumber || 'S0486/---'}</span> • ID: {authenticatedStudent.studentId || 'USS-STD'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStudentLogout}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Ondoka kwenye portal ya mwanafunzi"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span className="hidden sm:inline">Toka</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200 px-5 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
              {[
                { id: 'results', label: 'Matokeo Yangu', icon: Award },
                { id: 'timetable', label: 'Ratiba ya Masomo', icon: Calendar },
                { id: 'subjects', label: 'Masomo & Walimu', icon: BookOpen },
                { id: 'documents', label: 'Nyaraka za Drive', icon: FolderOpen },
                { id: 'videos', label: 'Video za Masomo', icon: Film },
                { id: 'notices', label: 'Matangazo ya Shule', icon: Bell },
                { id: 'profile', label: 'Taarifa Zangu', icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'border-[#102A43] text-[#102A43] bg-slate-50'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C9A227]' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Toast */}
            {downloadSuccessToast && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{downloadSuccessToast}</span>
                </div>
                <button onClick={() => setDownloadSuccessToast(null)}>✕</button>
              </div>
            )}

            {/* Body Contents */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: RESULTS */}
              {activeTab === 'results' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="font-bold text-sm text-[#102A43] flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#C9A227]" />
                        <span>Ripoti Rasmi ya Matokeo Yako (NECTA Standard)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Matokeo haya yanahusu <strong>{authenticatedStudent.fullName}</strong> pekee.
                      </p>
                    </div>

                    {activeResult && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownloadSlip}
                          className="px-3 py-1.5 rounded-lg bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>Pakua Slip (PDF)</span>
                        </button>
                        <button
                          onClick={handlePrintSlip}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Chapisha</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {studentResultsList.length > 0 ? (
                    <div className="space-y-4">
                      {studentResultsList.map((result) => (
                        <div key={result.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                          {/* Summary Row */}
                          <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Mtihani</span>
                              <span className="font-bold text-[#102A43]">{result.examType}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Daraja (Division)</span>
                              <span className="font-bold text-[#102A43]">{result.division}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Pointi</span>
                              <span className="font-bold text-[#102A43]">{result.points} Points</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Nafasi Darasani</span>
                              <span className="font-bold text-[#102A43]">{result.classPosition || '5 / 85'}</span>
                            </div>
                          </div>

                          {/* Subjects Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100/60 text-slate-600 border-b border-slate-200">
                                <tr>
                                  <th className="p-3 font-bold">Somo (Subject)</th>
                                  <th className="p-3 font-bold text-center">Alama (%)</th>
                                  <th className="p-3 font-bold text-center">Daraja</th>
                                  <th className="p-3 font-bold">Maoni</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {result.subjects.map((sub, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="p-3 font-semibold text-[#102A43]">{sub.name}</td>
                                    <td className="p-3 text-center font-bold text-[#102A43]">{sub.score}%</td>
                                    <td className="p-3 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                        sub.grade === 'A'
                                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                          : sub.grade === 'B'
                                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                          : sub.grade === 'C'
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}>
                                        {sub.grade}
                                      </span>
                                    </td>
                                    <td className="p-3 text-slate-600">{sub.remarks || 'Vizuri Sana'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {(result.headmasterRemarks || (result as any).remarks) && (
                            <div className="p-3 bg-amber-50/50 border-t border-slate-200 text-xs text-slate-700">
                              <strong>Maoni ya Mkuu wa Shule:</strong> {result.headmasterRemarks || (result as any).remarks}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                      <Award className="w-8 h-8 text-slate-400 mx-auto" />
                      <h5 className="font-bold text-sm text-[#102A43]">Hakuna Matokeo Yaliyopatikana</h5>
                      <p className="text-xs text-slate-500">
                        Matokeo ya mtihani wa sasa yatakapochapishwa na Idara ya Taaluma yataonekana hapa moja kwa moja.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TIMETABLE */}
              {activeTab === 'timetable' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#102A43] flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Calendar className="w-4 h-4 text-[#C9A227]" />
                    <span>Ratiba Rasmi ya Masomo Darasani — {authenticatedStudent.form}</span>
                  </h4>
                  {studentTimetable.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      Ratiba ya darasa hili inakamilishwa.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {studentTimetable.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 text-[10px] font-bold">
                              {slot.day || slot.dayOfWeek || 'Jumatatu'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {slot.time || `${slot.startTime || '08:00'} - ${slot.endTime || '08:45'}`}
                            </span>
                          </div>
                          <h5 className="font-bold text-sm text-[#102A43]">{slot.subject}</h5>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>Mwalimu: {slot.teacherName}</span>
                            <span className="font-mono">Chumba: {slot.room}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SUBJECTS */}
              {activeTab === 'subjects' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#102A43] flex items-center gap-2 pb-2 border-b border-slate-200">
                    <BookOpen className="w-4 h-4 text-[#C9A227]" />
                    <span>Masomo ya Mtaala wa NECTA — {authenticatedStudent.form}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { code: '011', name: 'Civics (Uraia)', teacher: 'Madam Grace Lyimo' },
                      { code: '012', name: 'History (Historia)', teacher: 'Mr. Emmanuel Shirima' },
                      { code: '013', name: 'Geography (Jiografia)', teacher: 'Mr. Peter Mboya' },
                      { code: '014', name: 'Kiswahili', teacher: 'Mwl. Asha Bakari' },
                      { code: '021', name: 'English Language', teacher: 'Madam Sarah Massawe' },
                      { code: '031', name: 'Physics (Fizikia)', teacher: 'Mr. Kelvin Temu' },
                      { code: '032', name: 'Chemistry (Kemia)', teacher: 'Dr. Joseph Kavishe' },
                      { code: '033', name: 'Biology (Biolojia)', teacher: 'Madam Elizabeth Moshi' },
                      { code: '041', name: 'Basic Mathematics (Hisabati)', teacher: 'Mr. David Tarimo' },
                    ].map((s) => (
                      <div key={s.code} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">NECTA CODE {s.code}</span>
                        <h5 className="font-bold text-xs sm:text-sm text-[#102A43]">{s.name}</h5>
                        <p className="text-[11px] text-slate-500">Mwalimu: {s.teacher}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: GOOGLE DRIVE DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#102A43] flex items-center gap-2 pb-2 border-b border-slate-200">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                    <span>Nyaraka za Shule &amp; Google Drive (Kupakua &amp; Kujisomea)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {joiningDocs.map((docItem) => {
                      const driveInfo = docItem.googleDriveUrl ? parseGoogleDriveUrl(docItem.googleDriveUrl) : null;
                      return (
                        <div key={docItem.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 text-[10px] font-bold">
                                {docItem.targetGroup || 'Wanafunzi Wote'}
                              </span>
                              {docItem.googleDriveUrl && (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                                  Google Drive
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-sm text-[#102A43]">{docItem.titleSw}</h5>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{docItem.descriptionSw}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                            {driveInfo ? (
                              <>
                                <a
                                  href={driveInfo.viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Tazama Drive</span>
                                </a>
                                <a
                                  href={driveInfo.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs font-semibold flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3 text-[#C9A227]" />
                                  <span>Pakua</span>
                                </a>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => downloadJoiningInstructionsPdf()}
                                className="px-3 py-1.5 rounded-lg bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs font-semibold flex items-center gap-1"
                              >
                                <Download className="w-3 h-3 text-[#C9A227]" />
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

              {/* TAB 5: YOUTUBE VIDEOS */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#102A43] flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Film className="w-4 h-4 text-red-500" />
                    <span>Video za Shule &amp; Masomo ya YouTube</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schoolVideos.map((video) => (
                      <div key={video.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
                        <div
                          onClick={() => setActiveVideoModal(video)}
                          className="relative aspect-video bg-black cursor-pointer group overflow-hidden"
                        >
                          <img
                            src={getYouTubeThumbnail(video.youtubeId)}
                            alt={video.titleSw}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                              <Play className="w-5 h-5 fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 block">{video.category}</span>
                            <h5 className="font-bold text-xs text-[#102A43] line-clamp-2 mt-0.5">{video.titleSw}</h5>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{video.date}</span>
                            <a
                              href={video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>YouTube</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: NOTICES */}
              {activeTab === 'notices' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#102A43] flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Bell className="w-4 h-4 text-[#C9A227]" />
                    <span>Matangazo &amp; Taarifa Rasmi za Shule</span>
                  </h4>
                  {relevantNotices.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      Hakuna matangazo mapya kwa sasa.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {relevantNotices.map((n) => (
                        <div key={n.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 text-[10px] font-bold">
                              {n.targetAudience || n.targetGroup || 'Wanafunzi Wote'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{n.date || n.publishDate}</span>
                          </div>
                          <h5 className="font-bold text-sm text-[#102A43]">{n.title || n.titleSw}</h5>
                          <p className="text-xs text-slate-600 leading-relaxed">{n.content || n.contentSw}</p>
                          {n.author && (
                            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                              Imetolewa na: {n.author} {n.authorRole ? `(${n.authorRole})` : ''}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#102A43] flex items-center gap-2 pb-2 border-b border-slate-200">
                    <User className="w-4 h-4 text-[#C9A227]" />
                    <span>Wasifu &amp; Taarifa Rasmi za Usajili wa Mwanafunzi</span>
                  </h4>
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Jina Kamili</span>
                        <p className="font-bold text-[#102A43] text-sm">{authenticatedStudent.fullName}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Kidato &amp; Mkondo</span>
                        <p className="font-bold text-[#102A43] text-sm">{authenticatedStudent.form} • Stream {authenticatedStudent.stream || 'A'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Namba ya Mtihani (NECTA)</span>
                        <p className="font-bold text-[#102A43] text-sm font-mono">{authenticatedStudent.examNumber || 'S0486/---'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Hali ya Masomo</span>
                        <p className="font-bold text-[#102A43] text-sm">{authenticatedStudent.studentType || 'Bweni (Boarding)'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Jina la Mzazi / Mlezi</span>
                        <p className="font-bold text-[#102A43] text-sm">{authenticatedStudent.parentName || 'Mzazi / Mlezi'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Simu ya Mzazi</span>
                        <p className="font-bold text-[#102A43] text-sm font-mono">{authenticatedStudent.parentPhone || '+255 782 558 127'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Video Modal Player */}
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
