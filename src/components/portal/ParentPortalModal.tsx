import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile, StudentResult } from '../../types';
import {
  downloadStudentResultSlipPdf,
  printStudentResultSlipDirectly,
  downloadJoiningInstructionsPdf,
} from '../../utils/pdfService';
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
  initialTab = 'dashboard',
}) => {
  const { language } = useLanguage();
  const { logout } = useAuth();
  const {
    students,
    currentLoggedInStudent,
    loginStudent,
    studentResults,
    timetable,
    studentNotices,
    paymentRecords,
  } = useData();

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'children'
    | 'academics'
    | 'attendance'
    | 'announcements'
    | 'calendar'
    | 'notices'
    | 'fees'
    | 'downloads'
    | 'messages'
    | 'contact'
  >(initialTab as any || 'dashboard');

  const [selectedChildId, setSelectedChildId] = useState<string>(
    currentLoggedInStudent?.studentId || (students && students.length > 0 ? students[0].studentId : 'std-f2-0001')
  );

  const [searchStudentInput, setSearchStudentInput] = useState('');
  const [selectedResultForPdf, setSelectedResultForPdf] = useState<StudentResult | null>(null);

  // Message Form State
  const [msgTarget, setMsgTarget] = useState<'Headmaster' | 'Academic Master' | 'Second Master' | 'Class Teacher' | 'Bursar'>('Class Teacher');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgSentSuccess, setMsgSentSuccess] = useState(false);

  if (!isOpen) return null;

  // Active child resolution
  const activeStudent: StudentProfile =
    students.find((s) => s.studentId === selectedChildId || s.id === selectedChildId) ||
    currentLoggedInStudent ||
    students[0] || {
      id: 'std-demo-1',
      studentId: 'USS/2026/0486',
      fullName: 'Baraka J. Kimaro',
      gender: 'M',
      form: 'Form Four',
      stream: 'A',
      examNumber: 'S0486/0001/2026',
      enrollmentDate: '2023-01-12',
      parentPhone: '+255 782 558 127',
      parentName: 'Mzee J. Kimaro',
      studentType: 'Bweni (Boarding)',
      feeTotal: 1500000,
      feePaid: 1200000,
    };

  // Student academic results
  const childResults: StudentResult[] = studentResults.filter(
    (r) =>
      r.examNumber.toLowerCase() === (activeStudent.examNumber || '').toLowerCase() ||
      r.studentName.toLowerCase() === activeStudent.fullName.toLowerCase() ||
      r.id === activeStudent.id
  );

  const primaryResult: StudentResult | undefined = childResults[0];

  // Fee calculation
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
    { id: 'dashboard', label: 'Parent Dashboard', icon: LayoutDashboard },
    { id: 'children', label: 'My Child / Children', icon: Users },
    { id: 'academics', label: 'Academic Progress', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'announcements', label: 'School Announcements', icon: Megaphone },
    { id: 'calendar', label: 'School Calendar', icon: Calendar },
    { id: 'notices', label: 'Important Notices', icon: AlertCircle },
    { id: 'fees', label: 'Fees Information', icon: CreditCard },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'contact', label: 'Contact School', icon: Phone },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#704214]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FFFFF0] rounded-xl shadow-2xl w-full max-w-7xl max-h-[94vh] flex flex-col border border-[#704214]/30 overflow-hidden text-[#704214]">
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

          <div className="flex items-center gap-4">
            {/* Active child pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#58330F] rounded-md text-xs text-[#F5EBD7] border border-[#C9A227]/30">
              <span className="text-[#C9A227] font-semibold">Active Student:</span>
              <span className="font-bold text-[#FFFFF0]">{activeStudent.fullName}</span>
              <span className="text-[#F5EBD7]/70">({activeStudent.form})</span>
            </div>

            <button
              onClick={async () => {
                onClose();
                await logout();
              }}
              className="px-2.5 py-1 text-xs font-semibold text-[#F5EBD7] hover:text-white bg-[#58330F] hover:bg-[#46280B] rounded border border-[#C9A227]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Ondoka kwenye akaunti (Logout)"
            >
              <LogOut className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="hidden sm:inline">Logout</span>
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
            {/* 1. PARENT DASHBOARD OVERVIEW */}
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
                        Namba ya Usajili: <strong>{activeStudent.studentId}</strong> · Mtihani: <strong>{activeStudent.examNumber || 'S0486/0001'}</strong>
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
                      <span className={`text-base font-bold block mt-0.5 ${balanceFees > 0 ? 'text-[#704214]' : 'text-[#704214]'}`}>
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
                      Tazama alama za masomo, ripoti ya muhula, na ufaulu wa NECTA.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveTab('fees')}
                    className="p-5 bg-white rounded-lg border border-[#704214]/15 hover:border-[#704214] transition-colors cursor-pointer shadow-xs"
                  >
                    <CreditCard className="w-5 h-5 text-[#C9A227] mb-2" />
                    <h4 className="font-bold text-sm text-[#704214]">Malipo ya Ada &amp; Benki</h4>
                    <p className="text-xs text-[#704214]/70 mt-1">
                      Namba za akaunti za CRDB na NMB, taarifa ya stakabadhi na masalio.
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveTab('messages')}
                    className="p-5 bg-white rounded-lg border border-[#704214]/15 hover:border-[#704214] transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-5 h-5 text-[#C9A227] mb-2" />
                    <h4 className="font-bold text-sm text-[#704214]">Tuma Ujumbe Shuleni</h4>
                    <p className="text-xs text-[#704214]/70 mt-1">
                      Wasiliana moja kwa moja na Mwalimu wa Darasa au Mkuu wa Shule.
                    </p>
                  </div>
                </div>

                {/* Latest School Announcements for Parents */}
                <div className="bg-white p-6 rounded-lg border border-[#704214]/15 shadow-xs">
                  <h4 className="font-bold text-sm text-[#704214] uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Matangazo Muhimu ya Hivi Karibuni</span>
                    <button
                      onClick={() => setActiveTab('announcements')}
                      className="text-xs text-[#704214] hover:underline font-semibold"
                    >
                      Tazama Yote &rarr;
                    </button>
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-[#FFFFF0] rounded-md border border-[#704214]/10 text-xs text-[#704214]">
                      <span className="font-bold text-sm block text-[#704214]">
                        Kufungua Muhula wa Masomo &amp; Ratiba ya Kuripoti
                      </span>
                      <p className="mt-1 text-[#704214]/80">
                        Wanafunzi wote wa bweni wanatakiwa kuripoti kabla ya saa 10:00 jioni wakiwa na sare kamili na vifaa vilivyoidhinishwa kwenye Joining Instructions.
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#FFFFF0] rounded-md border border-[#704214]/10 text-xs text-[#704214]">
                      <span className="font-bold text-sm block text-[#704214]">
                        Jumapili ya Kuwatembelea Wanafunzi (Visiting Day)
                      </span>
                      <p className="mt-1 text-[#704214]/80">
                        Wazazi wanakaribishwa kuanzia saa 4:00 asubuhi hadi saa 10:00 jioni. Chakula cha nje kinapaswa kuzingatia kanuni za afya na usafi wa shule.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MY CHILD / CHILDREN */}
            {activeTab === 'children' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#704214]">Wanafunzi Wangu (My Children)</h3>
                  <p className="text-xs text-[#704214]/70 mt-1">
                    Chagua mwanafunzi unayetaka kuangalia maendeleo yake ya kitaaluma, mahudhurio, na ada.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {students.slice(0, 6).map((student) => {
                    const isSelected = student.studentId === activeStudent.studentId || student.id === activeStudent.id;
                    return (
                      <div
                        key={student.id}
                        onClick={() => setSelectedChildId(student.studentId || student.id)}
                        className={`p-5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-2 border-[#704214] shadow-md ring-2 ring-[#704214]/20'
                            : 'bg-white border-[#704214]/20 hover:border-[#704214] shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
                              {student.studentType || 'Mwanafunzi wa Bweni'}
                            </span>
                            <h4 className="text-base font-bold text-[#704214] mt-0.5">
                              {student.fullName}
                            </h4>
                            <p className="text-xs text-[#704214]/80 mt-1">
                              ID: {student.studentId} · Mtihani: {student.examNumber}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#704214] text-white">
                              Selected
                            </span>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#704214]/10 flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#704214]">{student.form} {student.stream}</span>
                          <span className="text-[#704214]/70">Mzazi: {student.parentPhone || '+255 782 558 127'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. ACADEMIC PROGRESS */}
            {activeTab === 'academics' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#704214]">Maendeleo ya Kitaaluma (Academic Progress)</h3>
                    <p className="text-xs text-[#704214]/70 mt-1">
                      Mwanafunzi: <strong>{activeStudent.fullName}</strong> ({activeStudent.form})
                    </p>
                  </div>

                  {primaryResult && (
                    <button
                      onClick={() => setSelectedResultForPdf(primaryResult)}
                      className="px-4 py-2 bg-[#704214] hover:bg-[#58330F] text-[#FFFFF0] text-xs font-semibold rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Pakua Ripoti ya Maendeleo (PDF)</span>
                    </button>
                  )}
                </div>

                {primaryResult ? (
                  <div className="bg-white rounded-lg border border-[#704214]/20 overflow-hidden shadow-xs">
                    <div className="p-4 bg-[#F5EBD7] border-b border-[#704214]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
                      <div>Mtihani: <span className="font-bold">{primaryResult.examType}</span></div>
                      <div>Daraja: <span className="font-bold text-[#704214]">{primaryResult.division}</span></div>
                      <div>Jumla ya Pointi: <span className="font-bold">{primaryResult.points} Points</span></div>
                      <div>Nafasi Darasani: <span className="font-bold">{primaryResult.classPosition || '5'} / 85</span></div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FFFFF0] border-b border-[#704214]/10 text-[#704214]/80">
                          <tr>
                            <th className="px-4 py-2.5 font-bold">Somo (Subject)</th>
                            <th className="px-4 py-2.5 font-bold text-center">Alama (Score)</th>
                            <th className="px-4 py-2.5 font-bold text-center">Daraja (Grade)</th>
                            <th className="px-4 py-2.5 font-bold">Maoni ya Mwalimu (Remarks)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#704214]/10">
                          {primaryResult.subjects.map((sub, index) => (
                            <tr key={index} className="hover:bg-[#FFFFF0]/80">
                              <td className="px-4 py-2.5 font-semibold text-[#704214]">{sub.name}</td>
                              <td className="px-4 py-2.5 text-center font-bold text-[#704214]">{sub.score}%</td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                  sub.grade === 'A' ? 'bg-[#F5EBD7] text-[#704214]' : 'bg-[#FFFFF0] text-[#704214]'
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
                  </div>
                ) : (
                  <div className="p-8 bg-white rounded-lg border border-[#704214]/15 text-center text-xs text-[#704214]/70">
                    Alama za mitihani ya hivi sasa zinakaguliwa na idara ya taaluma kabla ya kuchapishwa rasmi.
                  </div>
                )}
              </div>
            )}

            {/* 4. ATTENDANCE */}
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#704214]">Mahudhurio ya Shule (Attendance Records)</h3>
                  <p className="text-xs text-[#704214]/70 mt-1">
                    Rekodi rasmi za uwepo darasani, vipindi vya masomo, na gwaride la asubuhi.
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
                    <span className="text-3xl font-bold text-[#704214] mt-1 block">88 / 90</span>
                    <span className="text-[11px] text-[#704214]/80 mt-1 block">Muhula wa Kwanza 2026</span>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                    <span className="text-xs text-[#704214]/70 block">Kutokuwepo kwa Ruhusa</span>
                    <span className="text-3xl font-bold text-[#704214] mt-1 block">2 Siku</span>
                    <span className="text-[11px] text-[#704214]/80 mt-1 block">Ugonjwa / Matibabu (Zilizoidhinishwa)</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-[#704214]/15 shadow-xs">
                  <h4 className="text-sm font-bold text-[#704214] mb-3">Kanuni za Mahudhurio</h4>
                  <ul className="text-xs text-[#704214]/80 space-y-1.5 list-disc pl-5">
                    <li>Kila mwanafunzi anapaswa kufikia angalau 90% ya mahudhurio ya kila muhula.</li>
                    <li>Ruhusa za dharura au matibabu lazima ziwasilishwe kwa Mwalimu wa Nidhamu na kuthibitishwa na Matron/Patron.</li>
                    <li>Kukosa vipindi bila taarifa huhesabiwa kama utovu wa nidhamu chini ya sheria za shule.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 5. SCHOOL ANNOUNCEMENTS */}
            {activeTab === 'announcements' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#704214]">Matangazo ya Shule (School Announcements)</h3>
                  <p className="text-xs text-[#704214]/70 mt-1">
                    Waraka rasmi na taarifa za uongozi wa Shule ya Sekondari Uomboni.
                  </p>
                </div>

                <div className="space-y-4">
                  {studentNotices.slice(0, 5).map((n) => (
                    <div key={n.id} className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                      <div className="flex items-center justify-between text-xs text-[#704214]/70 mb-1">
                        <span className="font-semibold text-[#C9A227]">{n.targetGroup || n.targetAudience || 'Tangazo Kuu'}</span>
                        <span>{n.date}</span>
                      </div>
                      <h4 className="text-base font-bold text-[#704214]">{n.title}</h4>
                      <p className="text-xs text-[#704214]/85 mt-2 leading-relaxed">{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. SCHOOL CALENDAR */}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#704214]">Kalenda ya Shule (School Calendar 2026)</h3>
                  <p className="text-xs text-[#704214]/70 mt-1">
                    Mihula ya masomo, likizo, mitihani, na siku za wazazi kutembelea.
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-[#704214]/15 overflow-hidden shadow-xs">
                  <div className="divide-y divide-[#704214]/10 text-xs">
                    <div className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <span className="font-bold text-[#704214] text-sm block">Kufungua Muhula wa Kwanza</span>
                        <span className="text-[#704214]/70">Wanafunzi wote kuripoti shuleni</span>
                      </div>
                      <span className="font-semibold text-[#704214] bg-[#F5EBD7] px-2.5 py-1 rounded">Januari 2026</span>
                    </div>

                    <div className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <span className="font-bold text-[#704214] text-sm block">Mitihani ya Robo Muhula (Midterm)</span>
                        <span className="text-[#704214]/70">Tathmini ya kwanza ya maendeleo ya kitaaluma</span>
                      </div>
                      <span className="font-semibold text-[#704214] bg-[#F5EBD7] px-2.5 py-1 rounded">Februari 2026</span>
                    </div>

                    <div className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <span className="font-bold text-[#704214] text-sm block">Mkutano Mkuu wa Wazazi (PTA)</span>
                        <span className="text-[#704214]/70">Kujadili maendeleo ya wanafunzi na miradi ya shule</span>
                      </div>
                      <span className="font-semibold text-[#704214] bg-[#F5EBD7] px-2.5 py-1 rounded">Machi 2026</span>
                    </div>

                    <div className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <span className="font-bold text-[#704214] text-sm block">Mitihani ya Kumaliza Muhula wa Kwanza</span>
                        <span className="text-[#704214]/70">Utoaji wa ripoti rasmi za maendeleo kwa wazazi</span>
                      </div>
                      <span className="font-semibold text-[#704214] bg-[#F5EBD7] px-2.5 py-1 rounded">Mei 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. IMPORTANT NOTICES */}
            {activeTab === 'notices' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#704214]">Taarifa Muhimu &amp; Mwongozo wa Malezi</h3>
                  <p className="text-xs text-[#704214]/70 mt-1">
                    Maagizo ya malezi ya bweni, afya, na nidhamu ya wanafunzi.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                    <h4 className="font-bold text-sm text-[#704214] mb-2">1. Afya na Zahanati ya Shule</h4>
                    <p className="text-xs text-[#704214]/80 leading-relaxed">
                      Wanafunzi wenye magonjwa sugu au wanaotumia dawa maalumu lazima wazilete kwa Matron/Patron pamoja na cheti cha daktari. Zahanati ya shule inatoa huduma ya kwanza saa 24.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                    <h4 className="font-bold text-sm text-[#704214] mb-2">2. Mawasiliano na Simu</h4>
                    <p className="text-xs text-[#704214]/80 leading-relaxed">
                      Ni marufuku kwa mwanafunzi kumiliki simu ya mkononi shuleni. Wazazi wanaweza kuwapigia simu walimu wa malezi au Matron/Patron nyakati zilizoidhinishwa (Jumamosi &amp; Jumapili jioni).
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                    <h4 className="font-bold text-sm text-[#704214] mb-2">3. Mavazi na Sare za Shule</h4>
                    <p className="text-xs text-[#704214]/80 leading-relaxed">
                      Wanafunzi wanatakiwa kuvaa sare sahihi za shule wakati wote wa masomo na ibada. Nguo za michezo na kazi za jioni zinapaswa kuandikwa jina la mwanafunzi.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                    <h4 className="font-bold text-sm text-[#704214] mb-2">4. Safari na Likizo</h4>
                    <p className="text-xs text-[#704214]/80 leading-relaxed">
                      Wanafunzi wa bweni hawaruhusiwi kuondoka nje ya eneo la shule bila kibali maalum cha maandishi (Gate Pass) kilichosainiwa na Makamu Mkuu wa Shule.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 8. FEES INFORMATION */}
            {activeTab === 'fees' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#704214]">Taarifa za Ada &amp; Malipo (Fees Information)</h3>
                  <p className="text-xs text-[#704214]/70 mt-1">
                    Muhtasari wa ada ya mwaka na maelekezo ya benki rasmi za shule.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                    <span className="text-xs text-[#704214]/70 block">Ada ya Mwaka (Total Fee)</span>
                    <span className="text-xl font-bold text-[#704214] mt-1 block">
                      TZS {totalFees.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                    <span className="text-xs text-[#704214]/70 block">Kiasi Kilicholipwa (Paid)</span>
                    <span className="text-xl font-bold text-[#704214] mt-1 block">
                      TZS {paidFees.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-[#704214]/15 shadow-xs">
                    <span className="text-xs text-[#704214]/70 block">Salio Linalodaiwa (Balance)</span>
                    <span className="text-xl font-bold text-[#704214] mt-1 block">
                      TZS {balanceFees.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Official Bank Accounts */}
                <div className="bg-white p-6 rounded-lg border border-[#704214]/20 shadow-xs">
                  <h4 className="text-sm font-bold text-[#704214] uppercase tracking-wider mb-4">
                    Akaunti Rasmi za Benki za Shule
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-[#FFFFF0] rounded-md border border-[#704214]/15">
                      <span className="font-bold text-sm block text-[#704214]">CRDB Bank Plc</span>
                      <div className="mt-2 space-y-1 text-[#704214]/90 font-mono">
                        <div>Jina la Akaunti: <strong>UOMBONI SECONDARY SCHOOL</strong></div>
                        <div>Namba ya Akaunti: <strong>01J1079051400</strong></div>
                        <div>Tawi: <strong>Moshi Branch</strong></div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#FFFFF0] rounded-md border border-[#704214]/15">
                      <span className="font-bold text-sm block text-[#704214]">NMB Bank Plc</span>
                      <div className="mt-2 space-y-1 text-[#704214]/90 font-mono">
                        <div>Jina la Akaunti: <strong>UOMBONI SECONDARY SCHOOL</strong></div>
                        <div>Namba ya Akaunti: <strong>40302507439</strong></div>
                        <div>Tawi: <strong>Marangu Branch</strong></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#704214]/70 mt-4">
                    Kumbuka: Unapofanya malipo benki, andika jina kamili la mwanafunzi na namba yake ya usajili kwenye pay-in slip. Wasilisha nakala ya risiti kwa Mhasibu (Bursar).
                  </p>
                </div>
              </div>
            )}

            {/* 9. DOWNLOADS */}
            {activeTab === 'downloads' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#704214]">Nyaraka za Kupakua (Downloads)</h3>
                  <p className="text-xs text-[#704214]/70 mt-1">
                    Fomu rasmi za kujiunga na shule, miongozo ya sare, na stakabadhi.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-lg border border-[#704214]/15 flex items-center justify-between shadow-xs">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#704214]">Joining Instructions 2026 (PDF)</h4>
                      <p className="text-[11px] text-[#704214]/70 mt-0.5">Fomu kamili ya maelekezo ya kujiunga kidato cha 1 na uhamisho.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadJoiningInstructionsPdf()}
                      className="px-3 py-1.5 bg-[#704214] text-white text-xs font-semibold rounded hover:bg-[#58330F] transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Pakua</span>
                    </button>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-[#704214]/15 flex items-center justify-between shadow-xs">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#704214]">Medical Examination Form (PDF)</h4>
                      <p className="text-[11px] text-[#704214]/70 mt-0.5">Fomu ya upimaji wa afya ya hospitali kabla ya kuripoti shuleni.</p>
                    </div>
                    <button
                      onClick={() => downloadJoiningInstructionsPdf()}
                      className="px-3 py-1.5 bg-[#F5EBD7] text-[#704214] border border-[#704214]/20 text-xs font-semibold rounded hover:bg-white transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#704214]" />
                      <span>Pakua</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 10. MESSAGES */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#704214]">Ujumbe Moja kwa Moja Shuleni (Direct Messages)</h3>
                  <p className="text-xs text-[#704214]/70 mt-1">
                    Tuma ujumbe wa faragha kwa walimu au uongozi kuhusu mwanafunzi wako.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-[#704214]/20 shadow-xs">
                  {msgSentSuccess ? (
                    <div className="p-6 bg-[#FFFFF0] border border-[#C9A227]/40 rounded-lg text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-[#704214] mx-auto" />
                      <h4 className="text-sm font-bold text-[#704214]">Ujumbe Umetumwa Kikamilifu!</h4>
                      <p className="text-xs text-[#704214]/80">
                        Ujumbe wako umepokelewa kwenye ofisi ya {msgTarget}. Mwalimu atawasiliana nawe kupitia namba yako ya simu.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-[#704214] mb-1">
                            Mhusika wa Ujumbe (Recipient) *
                          </label>
                          <select
                            value={msgTarget}
                            onChange={(e) => setMsgTarget(e.target.value as any)}
                            className="w-full px-3.5 py-2 border border-[#704214]/25 rounded-md bg-white text-[#704214] focus:outline-none focus:border-[#704214]"
                          >
                            <option value="Class Teacher">Mwalimu wa Darasa (Class Teacher)</option>
                            <option value="Academic Master">Mwalimu wa Taaluma (Academic Master)</option>
                            <option value="Headmaster">Mkuu wa Shule (Headmaster)</option>
                            <option value="Second Master">Makamu Mkuu wa Shule (Second Master)</option>
                            <option value="Bursar">Mhasibu wa Shule (Bursar)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-[#704214] mb-1">
                            Kichwa cha Ujumbe (Subject) *
                          </label>
                          <input
                            type="text"
                            required
                            value={msgSubject}
                            onChange={(e) => setMsgSubject(e.target.value)}
                            placeholder="mfano: Maombi ya Ruhusa ya Kimatibabu"
                            className="w-full px-3.5 py-2 border border-[#704214]/25 rounded-md bg-white text-[#704214] focus:outline-none focus:border-[#704214]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#704214] mb-1">
                          Yaliyomo kwenye Ujumbe (Message Body) *
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={msgContent}
                          onChange={(e) => setMsgContent(e.target.value)}
                          placeholder="Andika maelezo yako hapa kwa kina..."
                          className="w-full px-3.5 py-2 border border-[#704214]/25 rounded-md bg-white text-[#704214] focus:outline-none focus:border-[#704214]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#704214] hover:bg-[#58330F] text-[#FFFFF0] font-semibold rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Tuma Ujumbe Sasa</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* 11. CONTACT SCHOOL */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#704214]">Mawasiliano ya Shule (Contact School)</h3>
                  <p className="text-xs text-[#704214]/70 mt-1">
                    Namba rasmi za viongozi na ofisi za Shule ya Sekondari Uomboni.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-[#704214]/20 shadow-xs space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#FFFFF0] rounded-md border border-[#704214]/15">
                      <span className="font-bold text-[#704214] block">Ofisi ya Mkuu wa Shule</span>
                      <span className="text-[#704214]/80 block mt-1">Br. Adolph Massawe</span>
                      <span className="font-mono text-[#704214] font-bold block mt-1">+255 782 558 127</span>
                    </div>

                    <div className="p-4 bg-[#FFFFF0] rounded-md border border-[#704214]/15">
                      <span className="font-bold text-[#704214] block">Makamu Mkuu wa Shule</span>
                      <span className="text-[#704214]/80 block mt-1">Mwl. Wolter Temu</span>
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
                  </div>

                  <div className="pt-3 border-t border-[#704214]/10 text-[#704214]/80 text-[11px]">
                    Saa za Ofisi: Jumatatu – Ijumaa kuanzia saa 2:00 Asubuhi hadi 10:30 Jioni.
                  </div>
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
      </div>

      {/* PDF Report Viewer Modal */}
      {selectedResultForPdf && (
        <InlineReportCardPdfViewer
          student={selectedResultForPdf}
          isModal={true}
          onCloseModal={() => setSelectedResultForPdf(null)}
        />
      )}
    </div>
  );
};
