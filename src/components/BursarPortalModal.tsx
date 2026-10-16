import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { SchoolLogo } from './SchoolLogo';
import { downloadFeePaymentReceiptPdf } from '../utils/pdfService';
import { signInWithGoogle, getUserProfile } from '../lib/firebase';
import { checkStaffAuthorization, logStaffAuthAttempt } from '../services/staffSecurityService';
import { GoogleSignInButton } from './GoogleSignInButton';
import { WorldClassLoginView, PortalLoginRole } from './WorldClassLoginView';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  DollarSign,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  FileText,
  Printer,
  Download,
  PlusCircle,
  Edit3,
  Trash2,
  RefreshCw,
  Send,
  MessageSquare,
  MessageCircle,
  Check,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Receipt,
  PiggyBank,
  Wallet,
  Coins,
  FileCheck,
  Phone,
  Mail,
  User,
  GraduationCap,
  Calendar,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { StudentProfile, FeePaymentRecord } from '../types';

interface BursarPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
  onOpenAcademic?: (role: 'teacher' | 'academic_master') => void;
}

export const BursarPortalModal: React.FC<BursarPortalModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onOpenAcademic,
}) => {
  const { language } = useLanguage();
  const {
    students,
    paymentRecords,
    isBursarLoggedIn,
    bursarGoogleUser,
    loginBursar,
    loginBursarWithGoogle,
    logoutBursar,
    updateStudentFee,
    recordBursarPayment,
    clearStudentDebt,
    batchUpdateFeesByClass,
    updatePaymentStatus,
    bankAccounts,
    mobilePaymentMethods,
  } = useData();

  // Login Email and PIN state
  const [bursarEmail, setBursarEmail] = useState(() => bursarGoogleUser?.email || 'bursar@uomboni.sc.tz');
  const [bursarPinInput, setBursarPinInput] = useState('');
  const [bursarLoginMethod, setBursarLoginMethod] = useState<'pin' | 'google'>('pin');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  const handlePinLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    const success = loginBursar(bursarPinInput);
    if (success) {
      setBursarEmail('tumainifundtrustfoundation@gmail.com');
    } else {
      setAuthError(
        language === 'sw'
          ? 'PIN / Nenosiri si sahihi. Wasiliana na Mkuu wa Shule au Mhasibu Mkuu.'
          : 'Invalid PIN / Passcode. Please contact the Headmaster or Lead Bursar.'
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setAuthError('');
    try {
      const res = await signInWithGoogle('bursar');
      if (res.success && res.user) {
        const email = res.user.email || '';
        let firestoreRole: string | null = res.profile?.role || null;
        if (!firestoreRole && res.user.uid) {
          try {
            const profile = await getUserProfile(res.user.uid);
            firestoreRole = profile?.role || null;
          } catch {
            firestoreRole = null;
          }
        }

        const authCheck = checkStaffAuthorization(email, 'bursar', firestoreRole);

        await logStaffAuthAttempt({
          email,
          roleRequested: 'bursar',
          success: authCheck.authorized,
          reason: authCheck.authorized ? 'Bursar access granted via Google SSO' : 'Unauthorized bursar access attempt',
          uid: res.user.uid,
        });

        if (!authCheck.authorized) {
          setAuthError(language === 'sw' ? authCheck.reasonSw : authCheck.reasonEn);
          return;
        }

        loginBursarWithGoogle(res.user);
        if (res.user.email) setBursarEmail(res.user.email);
      } else {
        setAuthError(
          res.error ||
            (language === 'sw'
              ? 'Imeshindwa kuingia na akaunti ya Google. Tafadhali jaribu tena.'
              : 'Failed to sign in with Google account. Please try again.')
        );
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Hitilafu ya uthibitishaji wa Google.');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  // Active Tab
  type BursarTab = 'debtors' | 'overview' | 'new_payment' | 'online_verify' | 'fee_structure' | 'reports';
  const [activeTab, setActiveTab] = useState<BursarTab>('debtors');

  // Filters for Student Debtors List
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OWING' | 'CLEARED' | 'HIGH_DEBT'>('ALL');
  const [formFilter, setFormFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'balance_desc' | 'balance_asc' | 'name' | 'form'>('balance_desc');

  // Editing Student Fee Modal / Drawer
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [editFeeTotal, setEditFeeTotal] = useState('');
  const [editFeePaid, setEditFeePaid] = useState('');

  // Direct Payment Desk State
  const [selectedStudentIdForPay, setSelectedStudentIdForPay] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Fedha Taslimu (Cash / Bursar Desk)');
  const [payReference, setPayReference] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payParentPhone, setPayParentPhone] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [recentGeneratedReceipt, setRecentGeneratedReceipt] = useState<FeePaymentRecord | null>(null);

  // Batch Fee Update State
  const [batchForm, setBatchForm] = useState('Form 1');
  const [batchType, setBatchType] = useState<'Bweni' | 'Kutwa' | 'Wote'>('Bweni');
  const [batchFeeAmount, setBatchFeeAmount] = useState('1200000');
  const [batchSuccessMsg, setBatchSuccessMsg] = useState('');

  // Receipt Modal State (For printing)
  const [printingReceipt, setPrintingReceipt] = useState<FeePaymentRecord | null>(null);
  const [printingClearanceStudent, setPrintingClearanceStudent] = useState<StudentProfile | null>(null);

  // Feedback notifications
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const triggerSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Calculations for Overview & Analytics
  const stats = useMemo(() => {
    let totalExpected = 0;
    let totalPaid = 0;
    let owingCount = 0;
    let clearedCount = 0;
    let highDebtCount = 0;

    students.forEach((s) => {
      const total = s.feeTotal || 1200000;
      const paid = s.feePaid || 0;
      const balance = Math.max(0, total - paid);

      totalExpected += total;
      totalPaid += paid;

      if (balance > 0) {
        owingCount++;
        if (balance >= total * 0.5) {
          highDebtCount++;
        }
      } else {
        clearedCount++;
      }
    });

    const totalDebt = Math.max(0, totalExpected - totalPaid);
    const collectionPercentage = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;

    return {
      totalStudents: students.length,
      totalExpected,
      totalPaid,
      totalDebt,
      owingCount,
      clearedCount,
      highDebtCount,
      collectionPercentage,
    };
  }, [students]);

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const total = s.feeTotal || 1200000;
        const paid = s.feePaid || 0;
        const balance = Math.max(0, total - paid);

        // Search query
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.examNumber.toLowerCase().includes(q) ||
          (s.parentName || '').toLowerCase().includes(q) ||
          (s.parentPhone || '').includes(q) ||
          (s.residence || '').toLowerCase().includes(q);

        // Status filter
        let matchStatus = true;
        if (statusFilter === 'OWING') matchStatus = balance > 0;
        if (statusFilter === 'CLEARED') matchStatus = balance === 0;
        if (statusFilter === 'HIGH_DEBT') matchStatus = balance >= total * 0.5 && balance > 0;

        // Form filter
        const matchForm = formFilter === 'ALL' || s.form === formFilter;

        // Type filter
        const sType = s.studentType || s.boardingStatus || 'Bweni';
        const matchType =
          typeFilter === 'ALL' ||
          (typeFilter === 'Bweni' && sType.includes('Bweni')) ||
          (typeFilter === 'Kutwa' && sType.includes('Kutwa'));

        return matchSearch && matchStatus && matchForm && matchType;
      })
      .sort((a, b) => {
        const balA = Math.max(0, (a.feeTotal || 1200000) - (a.feePaid || 0));
        const balB = Math.max(0, (b.feeTotal || 1200000) - (b.feePaid || 0));

        if (sortBy === 'balance_desc') return balB - balA;
        if (sortBy === 'balance_asc') return balA - balB;
        if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'form') return a.form.localeCompare(b.form);
        return 0;
      });
  }, [students, searchQuery, statusFilter, formFilter, typeFilter, sortBy]);


  // Handle Save Student Fee Edit
  const handleSaveStudentFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const total = Number(editFeeTotal);
    const paid = Number(editFeePaid);

    if (isNaN(total) || isNaN(paid)) {
      alert(language === 'sw' ? 'Tafadhali weka tarakimu sahihi za ada.' : 'Please enter valid numbers for fee amounts.');
      return;
    }

    updateStudentFee(editingStudent.id, total, paid);
    triggerSuccess(
      language === 'sw'
        ? `Taarifa za ada za ${editingStudent.fullName} zimesasishwa kikamilifu.`
        : `Fee details for ${editingStudent.fullName} updated successfully.`
    );
    setEditingStudent(null);
  };

  // Handle Quick Clear Debt
  const handleQuickClearDebt = (student: StudentProfile) => {
    if (
      window.confirm(
        language === 'sw'
          ? `Je, unathibitisha kuweka ada ya mwanafunzi ${student.fullName} kuwa imelipwa kikamilifu (0 Deni)?`
          : `Confirm marking ${student.fullName} as fully cleared with 0 balance?`
      )
    ) {
      clearStudentDebt(student.id);
      triggerSuccess(
        language === 'sw'
          ? `Mwanafunzi ${student.fullName} amesajiliwa kuwa hana deni (Amekamilisha Ada).`
          : `${student.fullName} has been marked as fully cleared.`
      );
    }
  };

  // Handle Direct Payment Submit
  const handleDirectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentIdForPay) {
      alert(language === 'sw' ? 'Tafadhali chagua mwanafunzi anayelipiwa.' : 'Please select a student.');
      return;
    }
    const amountNum = Number(payAmount);
    if (!amountNum || amountNum <= 0) {
      alert(language === 'sw' ? 'Tafadhali weka kiasi sahihi cha fedha.' : 'Please enter a valid amount.');
      return;
    }

    const rec = recordBursarPayment({
      studentId: selectedStudentIdForPay,
      amount: amountNum,
      paymentMethod: payMethod,
      transactionReference: payReference || `CASH-${Date.now().toString().slice(-6)}`,
      paymentDate: payDate,
      parentPhone: payParentPhone,
      notes: payNotes,
    });

    setRecentGeneratedReceipt(rec);
    triggerSuccess(
      language === 'sw'
        ? `Malipo ya TZS ${amountNum.toLocaleString()} yamesajiliwa na stakabadhi ${rec.receiptNumber} imetolewa!`
        : `Payment of TZS ${amountNum.toLocaleString()} recorded and receipt ${rec.receiptNumber} generated!`
    );

    // Reset fields
    setPayAmount('');
    setPayReference('');
    setPayNotes('');
  };

  // Batch fee submit
  const handleBatchFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(batchFeeAmount);
    if (!amount || amount <= 0) {
      alert('Tafadhali weka kiasi sahihi cha ada.');
      return;
    }

    const count = batchUpdateFeesByClass(batchForm, batchType, amount);
    setBatchSuccessMsg(
      language === 'sw'
        ? `Wanafunzi ${count} wa ${batchForm} (${batchType}) wamewekewa kiwango cha ada cha TZS ${amount.toLocaleString()}!`
        : `Updated ${count} students in ${batchForm} (${batchType}) with standard fee TZS ${amount.toLocaleString()}!`
    );
    setTimeout(() => setBatchSuccessMsg(''), 5000);
  };

  if (!isOpen) return null;

  if (!isBursarLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-white relative animate-in zoom-in-95 duration-200">
          
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <SchoolLogo size="md" />
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-amber-300 uppercase tracking-wide">
                  UOMBONI SECONDARY SCHOOL
                </h2>
                <p className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{language === 'sw' ? 'Jopo la Mhasibu wa Shule (Bursar)' : 'Bursar & Accounts Console'}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title={language === 'sw' ? 'Funga' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => { setBursarLoginMethod('pin'); setAuthError(''); }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                bursarLoginMethod === 'pin'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{language === 'sw' ? '🔑 PIN / Nenosiri (Classic)' : '🔑 Classic Bursar PIN'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setBursarLoginMethod('google'); setAuthError(''); }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                bursarLoginMethod === 'google'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Google SSO</span>
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-bold">{language === 'sw' ? 'Hitilafu ya Kuingia' : 'Authentication Error'}</p>
                <p>{authError}</p>
              </div>
            </div>
          )}

          {bursarLoginMethod === 'pin' ? (
            <form onSubmit={handlePinLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {language === 'sw' ? 'PIN ya Mhasibu / Passcode:' : 'Bursar PIN / Passcode:'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={bursarPinInput}
                    onChange={(e) => setBursarPinInput(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              {/* Main Login Button */}
              <button
                type="submit"
                id="btn-bursar-login-submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'sw' ? 'Ingia Jopo la Mhasibu' : 'Enter Bursar Portal'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'sw'
                  ? 'Ingia kwa kutumia barua pepe ya Google ya ofisi ya uhasibu.'
                  : 'Sign in using an authorized Google Workspace accounts email.'}
              </p>
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                isLoading={isGoogleSigningIn}
                label={language === 'sw' ? 'Ingia na Akaunti ya Google (Bursar)' : 'Sign in with Google (Bursar)'}
                sublabel="tumainifundtrustfoundation@gmail.com au @uomboni.sc.tz"
                theme="dark"
                id="btn-bursar-google-sso"
              />
            </div>
          )}

          {/* Quick links to Admin */}
          {onOpenAdmin && (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => { onClose(); onOpenAdmin(); }}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>🛡️ {language === 'sw' ? 'Fungua Jopo Kuu la Utawala (Admin)' : 'Admin Console'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 text-slate-100 w-full max-w-7xl rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-slate-700/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{language === 'sw' ? 'Portal ya Mhasibu wa Shule (Bursar Portal)' : 'School Bursar & Fee Management Portal'}</span>
                </h3>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Uomboni Sec S0486
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'sw'
                  ? 'Mfumo Maalum wa Mhasibu: Usimamizi wa Madai ya Ada, Wanafunzi Wanaodaiwa na Wasiodaiwa, Risiti na Mipangilio'
                  : 'Official Bursar Console: Student Fee Ledger, Debt Clearance, Direct Receipts & Tariffs'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isBursarLoggedIn && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-[11px] text-amber-300 font-medium">
                {bursarGoogleUser?.photoURL ? (
                  <img
                    src={bursarGoogleUser.photoURL}
                    alt="Bursar Profile"
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-amber-400"
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-mono text-amber-300 text-xs truncate max-w-[170px]">
                    {bursarGoogleUser?.displayName || bursarEmail || 'bursar@uomboni.sc.tz'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                    {bursarGoogleUser ? (
                      <>
                        <span className="text-emerald-400 font-bold">Google Verified</span>
                        <span>• Bursar</span>
                      </>
                    ) : (
                      'Bursar Office'
                    )}
                  </span>
                </div>
              </div>
            )}

            {isBursarLoggedIn && (
              <button
                onClick={logoutBursar}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Toka kwenye mfumo wa Mhasibu"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'sw' ? 'Toka (Logout)' : 'Logout'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              aria-label="Funga"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Success Toast */}
        {actionSuccessMsg && (
          <div className="bg-emerald-600/90 text-white px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 justify-center shadow-lg animate-fade-in border-b border-emerald-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* BURSAR DASHBOARD TABS & CONTENT */}
          <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
                <button
                  onClick={() => setActiveTab('debtors')}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'debtors'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Wanafunzi & Madai ya Ada' : 'Student Balances & Debts'}</span>
                  {stats.owingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-black bg-rose-500 text-white">
                      {stats.owingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Muhtasari & Takwimu' : 'Financial Overview'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('new_payment')}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'new_payment'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Sajili Malipo (Bursar Desk)' : 'Record Payment'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('online_verify')}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'online_verify'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Uhakiki wa Malipo Mtandaoni' : 'Verify Online Payments'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-700 text-slate-300">
                    {paymentRecords.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('fee_structure')}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'fee_structure'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Viwango vya Ada kwa Darasa' : 'Class Fee Rates'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'reports'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Ripoti za Madai & Risiti' : 'Debt Reports & Printing'}</span>
                </button>
              </div>

              {/* TAB 1: STUDENT BALANCES & DEBT CLEARANCE (Primary Feature) */}
              {activeTab === 'debtors' && (
                <div className="space-y-5">
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {language === 'sw' ? 'Jumla ya Wanafunzi' : 'Total Students'}
                      </span>
                      <p className="text-xl font-black text-white font-mono">{stats.totalStudents}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/50 space-y-1">
                      <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                        {language === 'sw' ? 'Wanaodaiwa (Debtors)' : 'Owing Students'}
                      </span>
                      <p className="text-xl font-black text-rose-400 font-mono">
                        {stats.owingCount}{' '}
                        <span className="text-xs font-normal text-rose-300">
                          ({stats.totalStudents > 0 ? Math.round((stats.owingCount / stats.totalStudents) * 100) : 0}%)
                        </span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                        {language === 'sw' ? 'Waliokamilisha Ada' : 'Fully Cleared'}
                      </span>
                      <p className="text-xl font-black text-emerald-400 font-mono">
                        {stats.clearedCount}{' '}
                        <span className="text-xs font-normal text-emerald-300">
                          ({stats.totalStudents > 0 ? Math.round((stats.clearedCount / stats.totalStudents) * 100) : 0}%)
                        </span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/50 space-y-1">
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                        {language === 'sw' ? 'Jumla ya Madai (Deni)' : 'Total Debt Balance'}
                      </span>
                      <p className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                        TZS {stats.totalDebt.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Filters and Controls */}
                  <div className="bg-slate-800/90 rounded-3xl p-4 sm:p-5 border border-slate-700/80 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Search */}
                      <div className="md:col-span-4 relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={
                            language === 'sw'
                              ? 'Tafuta Jina, Student ID, Simu ya Mzazi...'
                              : 'Search Name, ID, Parent Phone...'
                          }
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      </div>

                      {/* Status Tabs */}
                      <div className="md:col-span-4 flex rounded-xl bg-slate-900 p-1 border border-slate-700">
                        <button
                          onClick={() => setStatusFilter('ALL')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            statusFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {language === 'sw' ? 'Wote' : 'All'}
                        </button>
                        <button
                          onClick={() => setStatusFilter('OWING')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            statusFilter === 'OWING' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:text-white'
                          }`}
                        >
                          {language === 'sw' ? 'Wanaodaiwa' : 'Owing'}
                        </button>
                        <button
                          onClick={() => setStatusFilter('CLEARED')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            statusFilter === 'CLEARED'
                              ? 'bg-emerald-600 text-white'
                              : 'text-emerald-400 hover:text-white'
                          }`}
                        >
                          {language === 'sw' ? 'Wasiodaiwa' : 'Cleared'}
                        </button>
                      </div>

                      {/* Form Filter */}
                      <div className="md:col-span-2">
                        <select
                          value={formFilter}
                          onChange={(e) => setFormFilter(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          <option value="ALL">{language === 'sw' ? 'Vidato Vyote' : 'All Forms'}</option>
                          <option value="Form 1">Form 1</option>
                          <option value="Form 2">Form 2</option>
                          <option value="Form 3">Form 3</option>
                          <option value="Form 4">Form 4</option>
                        </select>
                      </div>

                      {/* Sort Filter */}
                      <div className="md:col-span-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          <option value="balance_desc">{language === 'sw' ? 'Deni Kubwa Kwanza' : 'Highest Debt'}</option>
                          <option value="balance_asc">{language === 'sw' ? 'Deni Dogo Kwanza' : 'Lowest Debt'}</option>
                          <option value="name">{language === 'sw' ? 'Alfabeti (Jina)' : 'Name (A-Z)'}</option>
                          <option value="form">{language === 'sw' ? 'Kwa Kidato' : 'By Form'}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Students Table / Grid */}
                  <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-3.5 font-bold">Mwanafunzi / Namba</th>
                            <th className="px-4 py-3.5 font-bold">Kidato & Aina</th>
                            <th className="px-4 py-3.5 font-bold">Mzazi / Mawasiliano</th>
                            <th className="px-4 py-3.5 font-bold">Ada Kamili</th>
                            <th className="px-4 py-3.5 font-bold">Iliyolipwa</th>
                            <th className="px-4 py-3.5 font-bold">Salio Linalodaiwa</th>
                            <th className="px-4 py-3.5 font-bold text-right">Vitendo vya Mhasibu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="font-bold text-sm">
                                  {language === 'sw'
                                    ? 'Hakuna mwanafunzi aliyepatikana kwa vigezo hivi.'
                                    : 'No students found matching filters.'}
                                </p>
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((s, idx) => {
                              const total = s.feeTotal || 1200000;
                              const paid = s.feePaid || 0;
                              const balance = Math.max(0, total - paid);
                              const isCleared = balance === 0;
                              const pctPaid = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 100;

                              const parentName = s.parentName || s.parentGuardianName || 'Mzazi / Mlezi';
                              const parentPhone = s.parentPhone || '+255 782 558 127';

                              const debtMessage = encodeURIComponent(
                                `HABARI YA SHULE YA SEKONDARI UOMBONI:\nNdg. ${parentName}, Ofisi ya Mhasibu inakukumbusha salio la ada la mwanafunzi ${s.fullName} (${s.form}).\nAda Kamili: TZS ${total.toLocaleString()}\nIliyolipwa: TZS ${paid.toLocaleString()}\nSalio Linalodaiwa: TZS ${balance.toLocaleString()}\n\nTafadhali fanya malipo kupitia CRDB Bank: 01J1079051400 au NMB Bank: 40302507439. Asante.`
                              );

                              return (
                                <tr key={`${s.id}-${s.examNumber || idx}-${idx}`} className="hover:bg-slate-800/50 transition-colors">
                                  {/* Student Name & ID */}
                                  <td className="px-4 py-3.5">
                                    <div className="font-bold text-white text-xs sm:text-sm">{s.fullName}</div>
                                    <div className="font-mono text-[11px] text-amber-400 flex items-center gap-1.5 mt-0.5">
                                      <span>{s.studentId}</span>
                                      <span className="text-slate-600">•</span>
                                      <span className="text-slate-400">{s.examNumber}</span>
                                    </div>
                                  </td>

                                  {/* Form & Type */}
                                  <td className="px-4 py-3.5">
                                    <div className="font-bold text-slate-200">
                                      {s.form} {s.stream ? `(${s.stream})` : ''}
                                    </div>
                                    <span
                                      className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        (s.studentType || '').includes('Bweni')
                                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/40'
                                          : 'bg-teal-950 text-teal-300 border border-teal-800/40'
                                      }`}
                                    >
                                      {s.studentType || s.boardingStatus || 'Bweni'}
                                    </span>
                                  </td>

                                  {/* Parent Info */}
                                  <td className="px-4 py-3.5">
                                    <div className="font-medium text-slate-200">{parentName}</div>
                                    <div className="font-mono text-[11px] text-slate-400">{parentPhone}</div>
                                  </td>

                                  {/* Fee Total */}
                                  <td className="px-4 py-3.5 font-mono text-slate-300 font-bold">
                                    TZS {total.toLocaleString()}
                                  </td>

                                  {/* Fee Paid */}
                                  <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">
                                    TZS {paid.toLocaleString()}
                                    <div className="w-16 h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${pctPaid}%` }}
                                      />
                                    </div>
                                  </td>

                                  {/* Balance / Debt Status */}
                                  <td className="px-4 py-3.5">
                                    {isCleared ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Amekamilisha (0 Deni)</span>
                                      </span>
                                    ) : (
                                      <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-black font-mono border border-rose-500/30">
                                          <AlertCircle className="w-3.5 h-3.5" />
                                          <span>Deni: TZS {balance.toLocaleString()}</span>
                                        </span>
                                        <p className="text-[10px] text-slate-500">Imebaki {100 - pctPaid}%</p>
                                      </div>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                                    {/* Record Payment CTA */}
                                    <button
                                      onClick={() => {
                                        setSelectedStudentIdForPay(s.id);
                                        setPayParentPhone(s.parentPhone || '+255 782 558 127');
                                        setActiveTab('new_payment');
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                      title="Weka Malipo ya Mwanafunzi Huyu"
                                    >
                                      <PlusCircle className="w-3 h-3" />
                                      <span>Lipa</span>
                                    </button>

                                    {/* Edit Fee / Balance */}
                                    <button
                                      onClick={() => {
                                        setEditingStudent(s);
                                        setEditFeeTotal(String(s.feeTotal || 1200000));
                                        setEditFeePaid(String(s.feePaid || 0));
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                                      title="Hariri Ada au Malipo ya Mwanafunzi"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Fast Clear Debt Button */}
                                    {!isCleared && (
                                      <button
                                        onClick={() => handleQuickClearDebt(s)}
                                        className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/40 transition-all cursor-pointer"
                                        title="Weka kuwa Amekamilisha Deni (0 Balance)"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {/* Send SMS Reminder */}
                                    {!isCleared && (
                                      <a
                                        href={`sms:${parentPhone}?body=${debtMessage}`}
                                        className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition-all inline-flex items-center justify-center cursor-pointer"
                                        title="Tuma Kikumbusho cha SMS kwa Mzazi"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                      </a>
                                    )}

                                    {/* Send WhatsApp Reminder */}
                                    {!isCleared && (
                                      <a
                                        href={`https://wa.me/${parentPhone.replace(/\D/g, '')}?text=${debtMessage}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-all inline-flex items-center justify-center cursor-pointer"
                                        title="Tuma Kikumbusho cha WhatsApp"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                      </a>
                                    )}

                                    {/* Print Clearance Certificate */}
                                    {isCleared && (
                                      <button
                                        onClick={() => setPrintingClearanceStudent(s)}
                                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-all cursor-pointer"
                                        title="Toa Hati ya Uthibitisho wa Kumaliza Ada (Clearance Certificate)"
                                      >
                                        <FileCheck className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OVERVIEW & METRICS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* High Level Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {language === 'sw' ? 'Jumla ya Ada Inayotarajiwa' : 'Expected School Fees'}
                        </span>
                        <PiggyBank className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                        TZS {stats.totalExpected.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {language === 'sw'
                          ? `Kutoka kwa wanafunzi ${stats.totalStudents} waliosajiliwa.`
                          : `Based on ${stats.totalStudents} enrolled students.`}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 rounded-3xl p-6 border border-emerald-700/50 shadow-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                          {language === 'sw' ? 'Jumla Iliyokusanywa (Paid)' : 'Collected Fees'}
                        </span>
                        <Coins className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                        TZS {stats.totalPaid.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${stats.collectionPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-300">
                          {stats.collectionPercentage}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-rose-950/60 to-slate-900 rounded-3xl p-6 border border-rose-700/50 shadow-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                          {language === 'sw' ? 'Jumla ya Madai (Deni Shuleni)' : 'Total Outstanding Debt'}
                        </span>
                        <Wallet className="w-6 h-6 text-rose-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                        TZS {stats.totalDebt.toLocaleString()}
                      </p>
                      <p className="text-xs text-rose-300/80">
                        {language === 'sw'
                          ? `Wanafunzi ${stats.owingCount} wanadaiwa ada kwa sasa.`
                          : `${stats.owingCount} students currently have balances.`}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown by Form */}
                  <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 space-y-4">
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-400" />
                      <span>{language === 'sw' ? 'Mgawanyo wa Madai kwa Vidato (Form Breakdown)' : 'Class Fee Breakdown'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {['Form 1', 'Form 2', 'Form 3', 'Form 4'].map((frm) => {
                        const classStudents = students.filter((s) => s.form === frm);
                        const cExpected = classStudents.reduce((acc, s) => acc + (s.feeTotal || 1200000), 0);
                        const cPaid = classStudents.reduce((acc, s) => acc + (s.feePaid || 0), 0);
                        const cDebt = Math.max(0, cExpected - cPaid);
                        const cPct = cExpected > 0 ? Math.round((cPaid / cExpected) * 100) : 0;
                        const cDebtors = classStudents.filter((s) => (s.feeTotal || 1200000) > (s.feePaid || 0)).length;

                        return (
                          <div key={frm} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/60 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="font-black text-white text-sm">{frm}</span>
                              <span className="text-xs text-slate-400 font-mono">{classStudents.length} Wanafunzi</span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Iliyolipwa:</span>
                                <span className="font-mono font-bold text-emerald-400">TZS {cPaid.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Deni:</span>
                                <span className="font-mono font-bold text-rose-400">TZS {cDebt.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Wanaodaiwa:</span>
                                <span className="font-mono font-bold text-amber-300">{cDebtors} wanafunzi</span>
                              </div>
                            </div>

                            <div className="pt-1">
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>Kiwango</span>
                                <span>{cPct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${cPct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RECORD DIRECT PAYMENT DESK */}
              {activeTab === 'new_payment' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                      <div>
                        <h4 className="text-lg font-black text-white flex items-center gap-2">
                          <PlusCircle className="w-5 h-5 text-emerald-400" />
                          <span>{language === 'sw' ? 'Dawati la Malipo ya Mhasibu (Bursar Payment Desk)' : 'Record Student Fee Payment'}</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {language === 'sw'
                            ? 'Sajili malipo ya ada ya mwanafunzi (taslimu, benki au mitandao ya simu) na utoe stakabadhi rasmi.'
                            : 'Record cash, bank deposit or mobile money payment and issue an official Bursar receipt.'}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleDirectPaymentSubmit} className="space-y-4">
                      {/* Select Student */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          {language === 'sw' ? 'Chagua Mwanafunzi Anayelipiwa:*' : 'Select Student:*'}
                        </label>
                        <select
                          value={selectedStudentIdForPay}
                          onChange={(e) => {
                            setSelectedStudentIdForPay(e.target.value);
                            const found = students.find((s) => s.id === e.target.value);
                            if (found && found.parentPhone) {
                              setPayParentPhone(found.parentPhone);
                            }
                          }}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                          <option value="">-- Chagua Mwanafunzi kwenye Orodha --</option>
                          {students.map((s, idx) => {
                            const total = s.feeTotal || 1200000;
                            const paid = s.feePaid || 0;
                            const bal = Math.max(0, total - paid);
                            return (
                              <option key={`${s.id}-${s.studentId}-${idx}`} value={s.id}>
                                {s.fullName} ({s.form}) — Deni: TZS {bal.toLocaleString()} | ID: {s.studentId}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Selected Student Quick Card */}
                      {selectedStudentIdForPay && (
                        (() => {
                          const s = students.find((item) => item.id === selectedStudentIdForPay);
                          if (!s) return null;
                          const total = s.feeTotal || 1200000;
                          const paid = s.feePaid || 0;
                          const bal = Math.max(0, total - paid);
                          return (
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-slate-500 block">Jina:</span>
                                <span className="font-bold text-white">{s.fullName}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Kidato:</span>
                                <span className="font-bold text-slate-300">{s.form}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Iliyolipwa:</span>
                                <span className="font-bold text-emerald-400 font-mono">TZS {paid.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Deni Lililopo:</span>
                                <span className="font-bold text-rose-400 font-mono">TZS {bal.toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })()
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Amount */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            {language === 'sw' ? 'Kiasi Kinacholipwa (TZS):*' : 'Payment Amount (TZS):*'}
                          </label>
                          <input
                            type="number"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder="e.g. 300000"
                            required
                            min="1000"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </div>

                        {/* Payment Method */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            {language === 'sw' ? 'Njia ya Malipo:*' : 'Payment Method:*'}
                          </label>
                          <select
                            value={payMethod}
                            onChange={(e) => setPayMethod(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                          >
                            <option value="CRDB Bank - 01J1079051400">CRDB Bank (01J1079051400)</option>
                            <option value="NMB Bank - 40302507439">NMB Bank (40302507439)</option>
                            <option value="Fedha Taslimu (Cash / Bursar Desk)">Fedha Taslimu (Cash / Bursar Desk)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Transaction Reference / Slip No */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            {language === 'sw' ? 'Kumbukumbu ya Muamala / Slip No:' : 'Reference / Slip No:'}
                          </label>
                          <input
                            type="text"
                            value={payReference}
                            onChange={(e) => setPayReference(e.target.value)}
                            placeholder="e.g. CRDB-990142 au CASH"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </div>

                        {/* Payment Date */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            {language === 'sw' ? 'Tarehe ya Malipo:' : 'Payment Date:'}
                          </label>
                          <input
                            type="date"
                            value={payDate}
                            onChange={(e) => setPayDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </div>

                        {/* Parent Phone */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            {language === 'sw' ? 'Namba ya Simu ya Mzazi:' : 'Parent Phone:'}
                          </label>
                          <input
                            type="text"
                            value={payParentPhone}
                            onChange={(e) => setPayParentPhone(e.target.value)}
                            placeholder="+255 782 558 127"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          {language === 'sw' ? 'Maelezo ya Ziada / Maoni ya Mhasibu:' : 'Bursar Remarks / Notes:'}
                        </label>
                        <input
                          type="text"
                          value={payNotes}
                          onChange={(e) => setPayNotes(e.target.value)}
                          placeholder="e.g. Malipo ya Ada Awamu ya Pili 2025"
                          className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{language === 'sw' ? 'Sajili Malipo & Toa Risiti Rasmi' : 'Confirm Payment & Issue Official Receipt'}</span>
                      </button>
                    </form>

                    {/* Recently Generated Receipt Card */}
                    {recentGeneratedReceipt && (
                      <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-emerald-300 text-xs flex items-center gap-1.5">
                            <Receipt className="w-4 h-4" />
                            <span>Stakabadhi Mpya ya Malipo: {recentGeneratedReceipt.receiptNumber}</span>
                          </span>
                          <button
                            onClick={() => setPrintingReceipt(recentGeneratedReceipt)}
                            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Chapa Stakabadhi (Print Receipt)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: VERIFY ONLINE / BANK PAYMENTS */}
              {activeTab === 'online_verify' && (
                <div className="space-y-4">
                  <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700/80 space-y-2">
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-amber-400" />
                      <span>{language === 'sw' ? 'Uhakiki wa Risiti na Malipo ya Wazazi' : 'Verify Online & Bank Submissions'}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {language === 'sw'
                        ? 'Orodha ya risiti na miamala iliyowasilishwa na wazazi mtandaoni. Ukithibitisha, salio la mwanafunzi litasasishwa moja kwa moja.'
                        : 'Review payment slips submitted by parents. Approving automatically updates the student ledger.'}
                    </p>
                  </div>

                  <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3 font-bold">Namba ya Risiti</th>
                          <th className="px-4 py-3 font-bold">Mwanafunzi</th>
                          <th className="px-4 py-3 font-bold">Kiasi</th>
                          <th className="px-4 py-3 font-bold">Njia & Kumbukumbu</th>
                          <th className="px-4 py-3 font-bold">Tarehe</th>
                          <th className="px-4 py-3 font-bold">Hali</th>
                          <th className="px-4 py-3 font-bold text-right">Hatua</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {paymentRecords.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/50">
                            <td className="px-4 py-3 font-mono font-bold text-amber-400">{p.receiptNumber}</td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-white">{p.studentName}</div>
                              <div className="text-slate-400 text-[11px] font-mono">{p.examNumber} • {p.form}</div>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                              TZS {p.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-slate-300">{p.paymentMethod}</div>
                              <div className="text-slate-500 font-mono text-[10px]">{p.transactionReference}</div>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-400">{p.paymentDate}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status === 'Imethibitishwa'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                                    : p.status === 'Inakaguliwa'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                                    : 'bg-rose-950 text-rose-300 border border-rose-800/40'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                              {p.status !== 'Imethibitishwa' && (
                                <button
                                  onClick={() => {
                                    updatePaymentStatus(p.id, 'Imethibitishwa');
                                    triggerSuccess(`Malipo ${p.receiptNumber} yamethibitishwa na kuingizwa kwa mwanafunzi!`);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                                >
                                  Thibitisha
                                </button>
                              )}
                              {p.status !== 'Imekataliwa' && (
                                <button
                                  onClick={() => updatePaymentStatus(p.id, 'Imekataliwa')}
                                  className="px-2 py-1 rounded-lg bg-rose-800/60 hover:bg-rose-700 text-rose-200 font-bold text-xs"
                                >
                                  Kataa
                                </button>
                              )}
                              <button
                                onClick={() => setPrintingReceipt(p)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Chapa Stakabadhi"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: CLASS FEE RATES & BATCH SETUP */}
              {activeTab === 'fee_structure' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Current Tariff Cards */}
                  <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 space-y-4">
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-400" />
                      <span>{language === 'sw' ? 'Muundo Rasmi wa Ada ya Shule (Tariffs)' : 'School Fee Structure'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-2">
                        <span className="font-bold text-indigo-300 text-xs uppercase tracking-wider block">
                          Wanafunzi wa Bweni (Boarding Students)
                        </span>
                        <p className="text-2xl font-black text-white font-mono">TZS 1,200,000 / Mwaka</p>
                        <p className="text-xs text-slate-400">Inajumuisha: Bweni, Chakula mara 3, Taaluma, Michezo, Afya na Matumizi ya Maabara.</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-teal-950/40 border border-teal-800/40 space-y-2">
                        <span className="font-bold text-teal-300 text-xs uppercase tracking-wider block">
                          Wanafunzi wa Kutwa (Day Scholars)
                        </span>
                        <p className="text-2xl font-black text-white font-mono">TZS 600,000 / Mwaka</p>
                        <p className="text-xs text-slate-400">Inajumuisha: Taaluma, Chakula cha Mchana, Mitihani, Michezo na Maktaba.</p>
                      </div>
                    </div>
                  </div>

                  {/* Batch Setup Form */}
                  <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-4">
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-emerald-400" />
                      <span>{language === 'sw' ? 'Weka Ada kwa Darasa Zima kwa Pamoja (Batch Update)' : 'Batch Update Fee by Class'}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {language === 'sw'
                        ? 'Chagua kidato na aina ya mwanafunzi ili kuweka kiwango cha ada kwa wanafunzi wote wa darasa hilo mara moja.'
                        : 'Select class and category to apply standard fee rate to all students in that class simultaneously.'}
                    </p>

                    {batchSuccessMsg && (
                      <div className="p-3 rounded-xl bg-emerald-600/90 text-white text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{batchSuccessMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleBatchFeeSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Kidato:</label>
                        <select
                          value={batchForm}
                          onChange={(e) => setBatchForm(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                        >
                          <option value="Wote (All Forms)">Vidato Vyote (All Forms)</option>
                          <option value="Form 1">Form 1</option>
                          <option value="Form 2">Form 2</option>
                          <option value="Form 3">Form 3</option>
                          <option value="Form 4">Form 4</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Aina ya Mwanafunzi:</label>
                        <select
                          value={batchType}
                          onChange={(e) => setBatchType(e.target.value as any)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                        >
                          <option value="Wote">Wote (Bweni na Kutwa)</option>
                          <option value="Bweni">Wanafunzi wa Bweni Tu</option>
                          <option value="Kutwa">Wanafunzi wa Kutwa Tu</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Kiwango cha Ada (TZS):</label>
                        <input
                          type="number"
                          value={batchFeeAmount}
                          onChange={(e) => setBatchFeeAmount(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold"
                          placeholder="e.g. 1200000"
                        />
                      </div>

                      <div className="sm:col-span-3 pt-2">
                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Sasisha Ada za Wanafunzi Wote wa Darasa Hilo</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 6: PRINTABLE REPORTS & CERTIFICATES */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 space-y-4">
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <Printer className="w-5 h-5 text-amber-400" />
                      <span>{language === 'sw' ? 'Orodha na Ripoti Rasmi za Madai ya Ada' : 'Printable Debt Lists & Reports'}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {language === 'sw'
                        ? 'Chapa au pakua orodha ya wanafunzi wanaodaiwa ada kwa ajili ya Mkuu wa Shule, Kamati ya Fedha, au Bodi ya Shule.'
                        : 'Print or export the official list of student debtors for the Headmaster and School Board.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={() => window.print()}
                        className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-left space-y-2 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-white text-sm">
                            {language === 'sw' ? 'Chapa Orodha ya Wanaodaiwa (Defaulters List)' : 'Print Debtors List'}
                          </span>
                          <Printer className="w-5 h-5 text-rose-400" />
                        </div>
                        <p className="text-xs text-slate-400">
                          Inajumuisha: Jina la Mwanafunzi, Kidato, Ada Kamili, Iliyolipwa, Deni, na Simu ya Mzazi.
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          setStatusFilter('CLEARED');
                          setActiveTab('debtors');
                        }}
                        className="p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-left space-y-2 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-white text-sm">
                            {language === 'sw' ? 'Orodha ya Waliokamilisha (Clearance List)' : 'Fee Clearance List'}
                          </span>
                          <FileCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-xs text-slate-400">
                          Wanafunzi {stats.clearedCount} ambao hawadaiwi ada yoyote kwa mwaka huu wa masomo.
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* MODAL 1: EDIT STUDENT FEE MODAL */}
        {editingStudent && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-700 max-w-lg w-full shadow-2xl space-y-5 animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">Hariri Ada ya Mwanafunzi</h4>
                    <p className="text-xs text-slate-400">{editingStudent.fullName} ({editingStudent.form})</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStudentFee} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Jumla ya Ada Inayotakiwa (Fee Total - TZS):
                  </label>
                  <input
                    type="number"
                    value={editFeeTotal}
                    onChange={(e) => setEditFeeTotal(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Kiasi Kilicholipwa Hadi Sasa (Fee Paid - TZS):
                  </label>
                  <input
                    type="number"
                    value={editFeePaid}
                    onChange={(e) => setEditFeePaid(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Salio Linalodaiwa Baada ya Mabadiliko:</span>
                  <span className="font-black font-mono text-amber-400">
                    TZS {Math.max(0, (Number(editFeeTotal) || 0) - (Number(editFeePaid) || 0)).toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Ghairi
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md"
                  >
                    Hifadhi Mabadiliko
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: PRINTABLE OFFICIAL RECEIPT */}
        {printingReceipt && (
          <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white text-slate-950 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-scale-in">
              <div className="text-center space-y-2 border-b border-slate-200 pb-4">
                <div className="flex justify-center">
                  <SchoolLogo size="lg" />
                </div>
                <h4 className="font-black text-base uppercase text-emerald-950 tracking-tight">
                  Shule ya Sekondari Uomboni - Marangu
                </h4>
                <p className="text-[11px] text-slate-600 font-mono">
                  Ofisi ya Mhasibu wa Shule (Bursar) • S.L.P 361 Marangu • NECTA S0486 • Simu: +255 752 000 939
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono font-black text-xs">
                  STAKABADHI RASMI YA MALIPO YA ADA (BURSAR RECEIPT)
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Namba ya Risiti:</span>
                  <span className="font-mono font-bold text-slate-900">{printingReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Jina la Mwanafunzi:</span>
                  <span className="font-bold text-slate-900">{printingReceipt.studentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Kidato:</span>
                  <span className="font-bold text-slate-900">{printingReceipt.form}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Kiasi Kilicholipwa:</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">
                    TZS {printingReceipt.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Njia ya Malipo:</span>
                  <span className="font-medium text-slate-900">{printingReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Kumbukumbu / Slip:</span>
                  <span className="font-mono text-slate-800">{printingReceipt.transactionReference}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tarehe ya Malipo:</span>
                  <span className="font-mono text-slate-800">{printingReceipt.paymentDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Hali:</span>
                  <span className="font-bold text-emerald-700">Imethibitishwa na Mhasibu</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-600">
                <div>
                  <p className="border-b border-slate-400 pb-4 font-serif italic text-slate-800">Sigbert Minja</p>
                  <p className="pt-1 font-bold">Mwl. Sigbert Minja (Mhasibu wa Shule / Bursar)</p>
                </div>
                <div>
                  <p className="border-b border-slate-400 pb-4 font-serif italic text-slate-800">Uomboni Sec</p>
                  <p className="pt-1 font-bold">Muhuri Rasmi wa Shule</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPrintingReceipt(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                >
                  Funga
                </button>
                <button
                  type="button"
                  onClick={() => downloadFeePaymentReceiptPdf(printingReceipt)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-950" />
                  <span>Pakua PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Chapa (Print)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: PRINTABLE FEE CLEARANCE CERTIFICATE */}
        {printingClearanceStudent && (
          <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white text-slate-950 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-scale-in border-4 border-emerald-800">
              <div className="text-center space-y-2 border-b border-slate-200 pb-4">
                <div className="flex justify-center">
                  <SchoolLogo size="lg" />
                </div>
                <h4 className="font-black text-base uppercase text-emerald-950 tracking-tight">
                  Shule ya Sekondari Uomboni
                </h4>
                <p className="text-[11px] text-slate-600 font-mono">
                  P.O. BOX 246 MARANGU, MOSHI, KILIMANJARO • NECTA CENTER S0486
                </p>
                <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-700 text-white font-mono font-black text-xs tracking-wider">
                  HATI YA UTHIBITISHO WA KUMALIZA ADA (FEE CLEARANCE)
                </div>
              </div>

              <div className="text-xs space-y-3 leading-relaxed text-slate-800">
                <p>
                  Hati hii inathibitisha kuwa mwanafunzi aliyetajwa hapa chini amekamilisha malipo yote ya ada ya shule na michango yote inayotakiwa kwa mwaka wa masomo 2025/2026:
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jina Kamili:</span>
                    <span className="font-black text-slate-950">{printingClearanceStudent.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student ID / Namba:</span>
                    <span className="font-mono font-bold">{printingClearanceStudent.studentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Namba ya Mtihani:</span>
                    <span className="font-mono">{printingClearanceStudent.examNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kidato:</span>
                    <span className="font-bold">{printingClearanceStudent.form}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jumla Iliyolipwa:</span>
                    <span className="font-mono font-bold text-emerald-800">
                      TZS {(printingClearanceStudent.feePaid || 1200000).toLocaleString()} (100%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Salio Linalodaiwa:</span>
                    <span className="font-mono font-black text-emerald-700">TZS 0 (CLEARED)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 italic">
                  Mwanafunzi huyu anaruhusiwa kufanya mitihani ya muhula/NECTA na kuendelea na masomo bila kizuizi cha kifedha.
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-600">
                <div>
                  <p className="border-b border-slate-400 pb-4 font-serif italic text-slate-800">Sigbert Minja</p>
                  <p className="pt-1 font-bold">Mwl. Sigbert Minja (Mhasibu wa Shule / Bursar)</p>
                </div>
                <div>
                  <p className="border-b border-slate-400 pb-4 font-serif italic text-slate-800">Headmaster Sign</p>
                  <p className="pt-1 font-bold">Mkuu wa Shule (Headmaster)</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setPrintingClearanceStudent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                >
                  Funga
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Chapa Hati (Print)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
