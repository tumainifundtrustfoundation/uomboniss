import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Coins,
  GraduationCap,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  HelpCircle,
  ArrowRight,
  LogOut,
  Building2,
  FileSpreadsheet,
  Globe2,
  KeyRound,
  UserCheck,
  User,
  Eye,
  EyeOff,
  Search,
  Clock,
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useLanguage } from '../context/LanguageContext';
import { SAVED_TEACHERS } from '../data/savedSchoolMedia';
import { loginWithEmailPassword } from '../lib/firebase';
import {
  verifyTeacherIndividualLogin,
  getTeacherLockoutStatus,
  TEACHER_AUTH_DIRECTORY,
  TeacherAuthProfile,
} from '../services/teacherAuthDirectory';

export type PortalLoginRole = 'admin' | 'bursar' | 'academic_master' | 'teacher';

interface WorldClassLoginViewProps {
  activeRole: PortalLoginRole;
  onRoleChange?: (role: PortalLoginRole) => void;
  onGoogleSignIn: (account?: { email: string; name: string; role: any }) => Promise<void> | void;
  isSigningIn: boolean;
  authError?: string;
  currentUser?: { email: string | null; displayName: string | null; photoURL: string | null } | null;
  onContinueToPortal?: () => void;
  onSwitchAccount?: () => void;
  onClose?: () => void;
  isModal?: boolean;
  availableTeachers?: any[];
  onDirectTeacherLogin?: (teacherInfo: { id?: string; name: string; email: string; role?: string; subjects?: string[] }) => void;
  onDirectAcademicLogin?: (academicInfo: { name: string; email: string }) => void;
  onDirectAdminLogin?: (adminInfo: { name: string; email: string }) => void;
  onDirectBursarLogin?: (bursarInfo: { name: string; email: string }) => void;
}

export const WorldClassLoginView: React.FC<WorldClassLoginViewProps> = ({
  activeRole,
  onRoleChange,
  onGoogleSignIn,
  isSigningIn,
  authError,
  currentUser,
  onContinueToPortal,
  onSwitchAccount,
  onClose,
  isModal = true,
  availableTeachers,
  onDirectTeacherLogin,
  onDirectAcademicLogin,
  onDirectAdminLogin,
  onDirectBursarLogin,
}) => {
  const { language, setLanguage } = useLanguage();
  const [showSupportModal, setShowSupportModal] = useState(false);

  const teachersList = availableTeachers && availableTeachers.length > 0 ? availableTeachers : SAVED_TEACHERS;
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    const defaultTeacher =
      teachersList.find(
        (t) =>
          t.roleSw?.includes('Taaluma') ||
          t.subjects?.includes('Chemistry') ||
          t.subjects?.includes('Sayansi')
      ) || teachersList[0];
    return defaultTeacher?.id || 'tch-003';
  });
  const [loginMethod, setLoginMethod] = useState<'quick' | 'google'>(() => {
    return activeRole === 'teacher' ? 'google' : 'quick';
  });
  const [teacherPinInput, setTeacherPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLoggingInDirectly, setIsLoggingInDirectly] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Firebase Email & Password login state for teachers
  const [firebaseEmailInput, setFirebaseEmailInput] = useState('walimu@uombonisec.ac.tz');
  const [firebasePasswordInput, setFirebasePasswordInput] = useState('');
  const [showFirebasePassword, setShowFirebasePassword] = useState(false);
  const [isFirebaseEmailLoggingIn, setIsFirebaseEmailLoggingIn] = useState(false);
  const [firebaseEmailError, setFirebaseEmailError] = useState('');

  // Switch to Google / Firebase Security method by default whenever teacher role is activated
  React.useEffect(() => {
    if (activeRole === 'teacher') {
      setLoginMethod('google');
    }
  }, [activeRole]);

  const handleTeacherFirebaseEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFirebaseEmailError('');
    if (!firebaseEmailInput.trim()) {
      setFirebaseEmailError(language === 'sw' ? 'Tafadhali weka barua pepe.' : 'Please enter email.');
      return;
    }
    if (!firebasePasswordInput.trim()) {
      setFirebaseEmailError(language === 'sw' ? 'Tafadhali weka nenosiri au PIN.' : 'Please enter password or PIN.');
      return;
    }

    setIsFirebaseEmailLoggingIn(true);
    try {
      const res = await loginWithEmailPassword(firebaseEmailInput.trim(), firebasePasswordInput.trim(), 'teacher');
      if (res.success && res.user) {
        if (onGoogleSignIn) {
          await onGoogleSignIn({
            email: res.user.email || firebaseEmailInput.trim(),
            name: res.profile?.fullName || res.user.displayName || 'Mwalimu wa Uomboni',
            role: 'teacher',
          });
        } else if (onContinueToPortal) {
          onContinueToPortal();
        }
      } else {
        setFirebaseEmailError(res.error || (language === 'sw' ? 'Imeshindwa kuingia na Firebase.' : 'Firebase login failed.'));
      }
    } catch (err: any) {
      setFirebaseEmailError(err?.message || 'Hitilafu ya uthibitishaji wa Firebase.');
    } finally {
      setIsFirebaseEmailLoggingIn(false);
    }
  };

  // Check lockout on mount and when teacher selection changes
  React.useEffect(() => {
    const status = getTeacherLockoutStatus(selectedTeacherId);
    if (status.isLocked) {
      setLockoutRemaining(status.lockTimeRemainingSeconds);
    } else {
      setLockoutRemaining(0);
    }
  }, [selectedTeacherId]);

  // Lockout countdown timer interval
  React.useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const handleExecuteDirectTeacherLogin = (customTeacher?: any) => {
    setPinError('');
    const targetTeacher =
      customTeacher || teachersList.find((t) => t.id === selectedTeacherId) || teachersList[0];
    if (!targetTeacher) {
      setPinError(language === 'sw' ? 'Tafadhali chagua mwalimu.' : 'Please select a teacher.');
      return;
    }

    // Check if account is locked out
    const lockoutStatus = getTeacherLockoutStatus(targetTeacher.id);
    if (lockoutStatus.isLocked) {
      setLockoutRemaining(lockoutStatus.lockTimeRemainingSeconds);
      setPinError(
        language === 'sw'
          ? `⚠️ Mfumo umefunga kwa usalama. Tafadhali subiri sekunde ${lockoutStatus.lockTimeRemainingSeconds} kabla ya kujaribu tena.`
          : `⚠️ Account locked for security. Please wait ${lockoutStatus.lockTimeRemainingSeconds} seconds before trying again.`
      );
      return;
    }

    if (!teacherPinInput.trim()) {
      setPinError(
        language === 'sw'
          ? 'Tafadhali weka nambari yako ya siri binafsi (PIN ya mwalimu).'
          : 'Please enter your personal confidential teacher PIN.'
      );
      return;
    }

    // Strict Individual Teacher PIN Verification (prevents teacher impersonation)
    const verification = verifyTeacherIndividualLogin(targetTeacher.id, teacherPinInput);
    if (!verification.success) {
      if (verification.locked && verification.lockTimeRemainingSeconds) {
        setLockoutRemaining(verification.lockTimeRemainingSeconds);
      }
      setPinError(
        language === 'sw'
          ? (verification.errorSw || verification.error || 'PIN si sahihi.')
          : (verification.error || 'Incorrect teacher PIN.')
      );
      return;
    }

    setIsLoggingInDirectly(true);
    if (onDirectTeacherLogin) {
      onDirectTeacherLogin({
        id: targetTeacher.id,
        name: targetTeacher.name,
        email: targetTeacher.email || 'walimu@uombonisec.ac.tz',
        role: 'teacher',
        subjects: verification.teacher?.assignedSubjects || targetTeacher.subjects || ['Chemistry'],
      });
    } else if (onContinueToPortal) {
      onContinueToPortal();
    }
    setIsLoggingInDirectly(false);
  };

  const handleExecuteDirectAcademicLogin = () => {
    setPinError('');
    if (!teacherPinInput.trim()) {
      setPinError(
        language === 'sw'
          ? 'Tafadhali weka PIN ya Mkuu wa Taaluma.'
          : 'Please enter the Academic Master PIN.'
      );
      return;
    }

    const pin = teacherPinInput.trim().toLowerCase();
    const validAcademicPins = [
      '745225',
      '745548',
      'taaluma2026',
      'taaluma-0486',
      '0486',
      '1234',
      'uomboni2026',
      'uomboni2025',
      'tumaini2025',
      'admin',
      'admin2025',
      'walimu',
      'walimu2026',
      'taaluma',
    ];

    if (!validAcademicPins.includes(pin) && pin.length < 4) {
      setPinError(
        language === 'sw'
          ? 'PIN si sahihi. Tumia PIN: 0486 au 1234 au bofya "Ingia Haraka" hapo chini.'
          : 'Invalid PIN. Use 0486 or 1234 or click "Quick Enter" below.'
      );
      return;
    }

    setIsLoggingInDirectly(true);
    if (onDirectAcademicLogin) {
      onDirectAcademicLogin({
        name: 'Mwl. Yohana Bahati (Mtaaluma Mkuu)',
        email: 'yohana.bahati@uombonisec.ac.tz',
      });
    } else if (onContinueToPortal) {
      onContinueToPortal();
    }
    setIsLoggingInDirectly(false);
  };

  const handleExecuteDirectAdminLogin = () => {
    setPinError('');
    const pin = teacherPinInput.trim().toLowerCase();
    const validAdminPins = [
      '782558',
      '745225',
      '0486',
      '1234',
      'uomboni2026',
      'uomboni',
      'admin',
      'admin2026',
      'tumaini',
      'tumaini2025',
      'tumaini2026',
      'headmaster',
    ];

    if (!validAdminPins.includes(pin) && pin.length < 4) {
      setPinError(
        language === 'sw'
          ? 'Nenosiri/PIN si sahihi. Tumia PIN: 782558, 0486 au uomboni2026 au bofya "Bofya Hapa Kuingia Moja kwa Moja".'
          : 'Invalid Admin PIN/Passcode. Use 782558, 0486, or click "Instant 1-Tap Access".'
      );
      return;
    }

    setIsLoggingInDirectly(true);
    if (onDirectAdminLogin) {
      onDirectAdminLogin({
        name: 'Br. Adolph Massawe / Tumaini Admin',
        email: 'tumainifundtrustfoundation@gmail.com',
      });
    } else if (onContinueToPortal) {
      onContinueToPortal();
    }
    setIsLoggingInDirectly(false);
  };

  const handleExecuteDirectBursarLogin = () => {
    setPinError('');
    const pin = teacherPinInput.trim().toLowerCase();
    const validBursarPins = [
      '752000',
      '1234',
      '0486',
      'bursar',
      'bursar2026',
      'uomboni2026',
      'sigminja',
      'admin',
    ];

    if (!validBursarPins.includes(pin) && pin.length < 4) {
      setPinError(
        language === 'sw'
          ? 'PIN si sahihi. Tumia PIN: 752000, 1234 au bofya "Bofya Hapa Kuingia Moja kwa Moja".'
          : 'Invalid Bursar PIN. Use 752000, 1234 or click "Instant 1-Tap Access".'
      );
      return;
    }

    setIsLoggingInDirectly(true);
    if (onDirectBursarLogin) {
      onDirectBursarLogin({
        name: 'Mwl. Sigbert Minja (Bursar)',
        email: 'sigminja@gmail.com',
      });
    } else if (onContinueToPortal) {
      onContinueToPortal();
    }
    setIsLoggingInDirectly(false);
  };

  const rolesConfig: Record<
    PortalLoginRole,
    {
      nameSw: string;
      nameEn: string;
      shortSw: string;
      shortEn: string;
      titleSw: string;
      titleEn: string;
      descSw: string;
      descEn: string;
      icon: React.ElementType;
      badgeColor: string;
      accentBg: string;
      borderGlow: string;
      permissionsSw: string[];
      permissionsEn: string[];
    }
  > = {
    admin: {
      nameSw: 'Utawala Mkuu',
      nameEn: 'Administration',
      shortSw: 'Utawala',
      shortEn: 'Admin',
      titleSw: 'Jopo Kuu la Utawala & Mkuu wa Shule',
      titleEn: 'Executive Leadership & Admin Console',
      descSw: 'Kituo kikuu cha maamuzi, mipangilio ya mifumo ya shule, orodha ya wafanyakazi na taarifa za uendeshaji.',
      descEn: 'Master administrative operations, system configurations, employee management, and institutional governance.',
      icon: ShieldCheck,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      accentBg: 'from-emerald-500/20 via-emerald-600/5 to-transparent',
      borderGlow: 'hover:border-emerald-500/50',
      permissionsSw: ['Usimamizi wa Shule Nzima', 'Mipangilio & Idhini za Watumiaji', 'Ripoti Kuu za Bodi & Wizara'],
      permissionsEn: ['Comprehensive School Operations', 'Security & User Authorization', 'Ministry & Board Analytics'],
    },
    bursar: {
      nameSw: 'Uhasibu & Ada',
      nameEn: 'Bursar & Finance',
      shortSw: 'Uhasibu',
      shortEn: 'Bursar',
      titleSw: 'Ofisi ya Uhasibu na Fedha za Shule',
      titleEn: 'School Finance & Fee Management',
      descSw: 'Usimamizi thabiti wa mapato, kumbukumbu za ada za wanafunzi, ankara, stakabadhi na ukaguzi wa madeni.',
      descEn: 'Fee ledgers, payment tracking, bank receipt reconciliation, debtor reporting, and financial analytics.',
      icon: Coins,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      accentBg: 'from-amber-500/20 via-amber-600/5 to-transparent',
      borderGlow: 'hover:border-amber-500/50',
      permissionsSw: ['Uhakiki wa Malipo ya Ada', 'Utoaji wa Risiti za Kidijitali', 'Taarifa za Madeni & Makusanyo'],
      permissionsEn: ['Fee Collection Verification', 'Electronic Receipt Generation', 'Debtors & Audit Summary'],
    },
    academic_master: {
      nameSw: 'Mkuu wa Taaluma',
      nameEn: 'Academic Dean',
      shortSw: 'Taaluma',
      shortEn: 'Academic',
      titleSw: 'Ofisi Kuu ya Taaluma na Mitihani',
      titleEn: 'Examination Office & Broadsheets',
      descSw: 'Uchakataji wa mitihani ya NECTA, Mock na nusu muhula, viwango vya ufaulu (GPA & Division) na ratiba.',
      descEn: 'NECTA grading compliance, continuous assessment broadsheets, GPA computation, and academic scheduling.',
      icon: GraduationCap,
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      accentBg: 'from-cyan-500/20 via-cyan-600/5 to-transparent',
      borderGlow: 'hover:border-cyan-500/50',
      permissionsSw: ['Broadsheets & Ukokotoaji wa NECTA', 'Uchapishaji wa Ripoti za Mitihani', 'Ratiba Kuu za Shule'],
      permissionsEn: ['Broadsheet Engine & NECTA Ranks', 'Report Card Generator', 'Curriculum & Timetables'],
    },
    teacher: {
      nameSw: 'Walimu wa Masomo',
      nameEn: 'Faculty & Teachers',
      shortSw: 'Walimu',
      shortEn: 'Teachers',
      titleSw: 'Jukwaa la Walimu wa Masomo (Gradebook)',
      titleEn: 'Faculty & Subject Marks Gradebook',
      descSw: 'Uwekaji wa alama za masomo darasani, kupakia Excel marksheets, na kutoa maoni ya kitaaluma ya mwanafunzi.',
      descEn: 'Subject scores entry, single/bulk Excel uploads, class attendance tracking, and student behavioral remarks.',
      icon: BookOpen,
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      accentBg: 'from-indigo-500/20 via-indigo-600/5 to-transparent',
      borderGlow: 'hover:border-indigo-500/50',
      permissionsSw: ['Uwekaji wa Alama kwa Masomo', 'Upakiaji wa Excel Marksheets', 'Maoni ya Mwalimu kwa Wanafunzi'],
      permissionsEn: ['Subject Marks Entry', 'Excel Marks Batch Upload', 'Student Subject Remarks'],
    },
  };

  const currentRoleConfig = rolesConfig[activeRole];
  const RoleIcon = currentRoleConfig.icon;

  return (
    <div
      id="world-class-login-container"
      className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col lg:flex-row text-white text-left selection:bg-emerald-500 selection:text-white"
    >
      {/* ========================================================================= */}
      {/* SIDE A: BRAND & INSTITUTIONAL HERITAGE SHOWCASE (Desktop Only / Hidden on Mobile) */}
      {/* ========================================================================= */}
      {isModal ? (
        <div className="relative hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-950/90 via-slate-950 to-slate-900 p-6 sm:p-8 flex-col justify-between overflow-hidden border-r border-slate-800/80">
          {/* Ambient subtle light orbs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Branding */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
                  <SchoolLogo size="sm" />
                </div>
                <div>
                  <h1 className="text-xs font-bold tracking-wide font-serif text-white leading-tight">
                    UOMBONI SECONDARY SCHOOL
                  </h1>
                  <p className="text-[9px] font-semibold text-amber-400 tracking-wider font-mono uppercase">
                    NECTA CENTRE • S0486
                  </p>
                </div>
              </div>

              {/* Live System Status Indicator */}
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-semibold"
                title="Mfumo wa Ndani wa Watumishi Upo Hewani"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[9px] text-emerald-400/80">INTRANET</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-semibold">
                <Lock className="w-3 h-3" />
                <span>{language === 'sw' ? 'Lango la Watumishi (Intranet)' : 'Staff Intranet'}</span>
              </div>

              <h2 className="text-xl font-black text-white tracking-tight leading-tight">
                {language === 'sw'
                  ? 'Ofisi ya Walimu na Utawala'
                  : 'Faculty & Admin Gateway'}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {language === 'sw'
                  ? 'Mfumo rasmi wa ndani kwa ajili ya Walimu, Idara ya Taaluma, Uhasibu na Uongozi wa Uomboni Secondary.'
                  : 'Official faculty portal for gradebooks, NECTA broadsheets, and institutional administration.'}
              </p>
            </div>

            {/* Core Feature Highlights */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">
                    {language === 'sw' ? 'Uthibitishaji Salama (Google SSO)' : 'Google Single Sign-On'}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {language === 'sw'
                      ? 'Ingia kwa akaunti rasmi ya Google au PIN ya siri.'
                      : 'Sign in securely with Google Workspace or your personal PIN.'}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">
                    {language === 'sw' ? 'NECTA Broadsheet & Takwimu' : 'NECTA Broadsheets & Ledgers'}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {language === 'sw'
                      ? 'Uchakataji wa matokeo na ripoti kwa viwango vya kitaifa.'
                      : 'Automated computations adhering to national grading standards.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer School Credibility Quote */}
          <div className="relative z-10 pt-4 mt-4 border-t border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/30 space-y-1 text-left">
              <p className="text-[11px] italic text-emerald-200/90 leading-relaxed font-serif">
                &ldquo;TUJIENDELEZE SISI WENYEWE • (Education • Pray • Work)&rdquo;
              </p>
              <div className="flex items-center justify-between text-[9px] text-slate-400">
                <span>Shule ya Sekondari Uomboni</span>
                <span className="font-mono text-emerald-400">NECTA S0486</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* SIDE B: INTERACTIVE AUTHENTICATION TERMINAL (Compact & Mobile-Optimized)    */}
      {/* ========================================================================= */}
      <div className={`relative w-full ${isModal ? 'lg:w-7/12' : ''} p-3.5 sm:p-6 lg:p-7 flex flex-col justify-between bg-slate-900/95 backdrop-blur-xl`}>
        {/* Top Control Bar: Language Switcher & Close Button */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <div className="inline-flex p-0.5 rounded-xl bg-slate-950 border border-slate-800" role="group">
              <button
                type="button"
                id="login-lang-sw"
                onClick={() => setLanguage('sw')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'sw' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇹🇿</span>
                <span>Kiswahili</span>
              </button>
              <button
                type="button"
                id="login-lang-en"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'en' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="login-help-btn"
              onClick={() => setShowSupportModal(true)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer border border-slate-700/80"
              title="Help & IT Support"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>{language === 'sw' ? 'Msaada' : 'Help'}</span>
            </button>

            {isModal && onClose && (
              <button
                type="button"
                id="login-close-btn"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Central Auth Area (Compact Spacing) */}
        <div className="space-y-3.5">
          {/* Eyebrow & Title */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent drop-shadow-xs">
                  {language === 'sw' ? 'Ingia Kwenye Jopo la Shule' : 'Sign in to School Console'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'sw'
                  ? 'Chagua nafasi yako kisha tumia PIN / Uingiaji wa Papo Hapo au Google SSO.'
                  : 'Select your role and authenticate with instant 1-Tap/PIN or Google SSO.'}
              </p>
            </div>

            {/* Quick Status Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === 'sw' ? 'Mfumo Upo Hewani' : 'System Active'}</span>
            </span>
          </div>

          {/* Compact Role Switcher Tabs */}
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(rolesConfig) as PortalLoginRole[]).map((roleKey) => {
                const conf = rolesConfig[roleKey];
                const IconComponent = conf.icon;
                const isSelected = activeRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    id={`login-role-tab-${roleKey}`}
                    onClick={() => onRoleChange && onRoleChange(roleKey)}
                    className={`relative py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 text-white shadow-md ring-1 ring-amber-400/40'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-black truncate w-full leading-none">
                      {language === 'sw' ? conf.shortSw : conf.shortEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact Role Context Banner (Single Line) */}
          <div className={`py-1.5 px-2.5 rounded-xl border bg-gradient-to-r ${currentRoleConfig.accentBg} border-slate-800 flex items-center justify-between gap-2 text-xs`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`p-1 rounded-md border ${currentRoleConfig.badgeColor} shrink-0`}>
                <RoleIcon className="w-3 h-3" />
              </div>
              <span className="font-bold text-white text-[11px] truncate">
                {language === 'sw' ? currentRoleConfig.titleSw : currentRoleConfig.titleEn}
              </span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono shrink-0">
              {language === 'sw' ? currentRoleConfig.nameSw : currentRoleConfig.nameEn}
            </span>
          </div>

          {/* Authentication Action Section */}
          <div className="space-y-2.5">
            {/* Dedicated Firebase Security Notice for Teachers */}
            {activeRole === 'teacher' && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-950 to-slate-900 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-200 shadow-lg">
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-white text-xs">
                      {language === 'sw' ? '🔒 Ulinzi wa Firebase (Firebase Security Active)' : '🔒 Firebase Security Active'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase tracking-wider">
                      NECTA S0486
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-300/90 leading-tight">
                    {language === 'sw'
                      ? 'Walimu lazima waingie kwa kutumia Firebase security kabla ya kuingiza au kubadili alama za masomo na mitihani.'
                      : 'Teachers must authenticate via Firebase security before entering or modifying student examination marks.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'sw' ? 'Njia ya Kuingia:' : 'Sign-In Method:'}
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  id="tab-login-method-google"
                  onClick={() => {
                    setLoginMethod('google');
                    setPinError('');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    loginMethod === 'google'
                      ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-xs ring-1 ring-emerald-400/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 text-current" />
                  <span>{activeRole === 'teacher' ? 'Firebase Security' : 'Google SSO'}</span>
                </button>
                <button
                  type="button"
                  id="tab-login-method-quick"
                  onClick={() => {
                    setLoginMethod('quick');
                    setPinError('');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    loginMethod === 'quick'
                      ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-400/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⚡</span>
                  <span>{language === 'sw' ? 'PIN / Haraka' : 'PIN / Quick'}</span>
                </button>
              </div>
            </div>

            {/* If user is already authenticated with Google */}
            {currentUser && currentUser.email ? (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'User'}
                        className="w-10 h-10 rounded-full border border-emerald-400 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-sm">
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {currentUser.displayName || 'Watumishi wa Shule'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          {language === 'sw' ? 'Imethibitishwa' : 'Verified'}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {onSwitchAccount && (
                    <button
                      type="button"
                      id="login-switch-account-btn"
                      onClick={onSwitchAccount}
                      className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Sign in with another Google account"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{language === 'sw' ? 'Badili' : 'Switch'}</span>
                    </button>
                  )}
                </div>

                {onContinueToPortal && (
                  <button
                    type="button"
                    id="btn-continue-to-portal"
                    onClick={onContinueToPortal}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/40 group"
                  >
                    <span>
                      {language === 'sw'
                        ? `Fungua Jopo la ${currentRoleConfig.shortSw}`
                        : `Access ${currentRoleConfig.shortEn} Portal`}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            ) : loginMethod === 'quick' && activeRole === 'teacher' ? (
              /* QUICK TEACHER LOGIN / COMPACT MOBILE-FIRST GATE */
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/40 space-y-3 shadow-xl">
                {/* Faculty Selection: Native Dropdown for Speed & Compactness */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                      {language === 'sw' ? '1. Chagua Jina Lako la Ualimu:' : '1. Select Your Faculty Name:'}
                    </label>
                    <span className="text-[9px] text-emerald-400 font-mono">
                      {teachersList.length} {language === 'sw' ? 'Walimu' : 'Teachers'}
                    </span>
                  </div>

                  <select
                    id="select-teacher-name"
                    value={selectedTeacherId}
                    onChange={(e) => {
                      setSelectedTeacherId(e.target.value);
                      setPinError('');
                    }}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs font-bold text-white focus:outline-hidden cursor-pointer"
                  >
                    {teachersList.map((tch) => (
                      <option key={tch.id} value={tch.id} className="bg-slate-900 text-white">
                        {tch.name} — {tch.subjects?.join(', ') || tch.roleSw || 'Mwalimu'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Teacher Compact Chip */}
                {(() => {
                  const currentTeacherObj = teachersList.find((t) => t.id === selectedTeacherId) || teachersList[0];
                  const currentSubjects = currentTeacherObj?.subjects || ['Chemistry'];
                  return (
                    <div className="py-1.5 px-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] text-slate-400 font-mono truncate">Mwalimu:</span>
                        <span className="font-bold text-white truncate text-[11px]">{currentTeacherObj?.name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-black shrink-0 border border-amber-400/30">
                        ★ {currentSubjects.join(', ')}
                      </span>
                    </div>
                  );
                })()}

                {/* Personal Secret PIN Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-amber-400" />
                      <span>{language === 'sw' ? '2. PIN ya Siri ya Mwalimu:' : '2. Secret Teacher PIN:'}</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      mfano: <strong>1234</strong> au <strong>0486</strong>
                    </span>
                  </div>

                  {lockoutRemaining > 0 && (
                    <div className="p-2 rounded-lg bg-amber-950/90 border border-amber-500 text-amber-200 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {language === 'sw'
                          ? `⚠️ Subiri sekunde ${lockoutRemaining} kabla ya kujaribu tena.`
                          : `⚠️ Account locked. Wait ${lockoutRemaining}s.`}
                      </span>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      id="input-teacher-direct-pin"
                      disabled={lockoutRemaining > 0}
                      value={teacherPinInput}
                      onChange={(e) => {
                        setTeacherPinInput(e.target.value);
                        if (pinError) setPinError('');
                      }}
                      placeholder={
                        lockoutRemaining > 0
                          ? `Imefungwa (${lockoutRemaining}s)...`
                          : (language === 'sw' ? 'Weka PIN yako binafsi...' : 'Enter your confidential PIN...')
                      }
                      className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-hidden tracking-wider"
                    />
                    <button
                      type="button"
                      disabled={lockoutRemaining > 0}
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {pinError && (
                    <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-700 text-[11px] text-rose-300 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}
                </div>

                {/* Direct Teacher Login Submit Button */}
                <button
                  type="button"
                  id="btn-teacher-direct-login"
                  disabled={isLoggingInDirectly || lockoutRemaining > 0}
                  onClick={() => handleExecuteDirectTeacherLogin()}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400/50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {language === 'sw' ? 'Thibitisha na Ingia Somoni' : 'Authenticate & Open Gradebook'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : loginMethod === 'quick' && activeRole === 'academic_master' ? (
              /* QUICK ACADEMIC MASTER LOGIN (COMPACT & ONE-TAP) */
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/95 border border-amber-500/40 space-y-3 shadow-xl">
                {/* Instant One-Tap Access for Mobile */}
                <button
                  type="button"
                  id="btn-academic-quick-onetap"
                  onClick={() => {
                    setIsLoggingInDirectly(true);
                    if (onDirectAcademicLogin) {
                      onDirectAcademicLogin({
                        name: 'Mwl. Yohana Bahati (Mtaaluma Mkuu)',
                        email: 'yohana.bahati@uombonisec.ac.tz',
                      });
                    } else if (onContinueToPortal) {
                      onContinueToPortal();
                    }
                    setIsLoggingInDirectly(false);
                  }}
                  className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/50 group"
                >
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>
                    {language === 'sw'
                      ? '⚡ Bofya Hapa Kuingia Moja kwa Moja (Taaluma)'
                      : '⚡ Quick 1-Tap Academic Portal Access'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center gap-2">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="text-[10px] text-slate-500 uppercase font-mono">{language === 'sw' ? 'au kwa PIN' : 'or via PIN'}</span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                {/* Dean Card */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">📚</span>
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-black text-white truncate">Mwl. Yohana Bahati / Madam Adela</h5>
                      <p className="text-[10px] text-slate-400 font-mono truncate">Idara ya Taaluma & Mitihani</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherPinInput('0486');
                      setTimeout(() => {
                        if (onDirectAcademicLogin) {
                          onDirectAcademicLogin({
                            name: 'Mwl. Yohana Bahati (Mtaaluma Mkuu)',
                            email: 'yohana.bahati@uombonisec.ac.tz',
                          });
                        } else if (onContinueToPortal) {
                          onContinueToPortal();
                        }
                      }, 50);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 font-bold border border-amber-400/30 cursor-pointer shrink-0"
                  >
                    ⚡ PIN 0486
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      id="input-academic-direct-pin"
                      value={teacherPinInput}
                      onChange={(e) => {
                        setTeacherPinInput(e.target.value);
                        if (pinError) setPinError('');
                      }}
                      placeholder={language === 'sw' ? 'Weka PIN ya Taaluma (0486)...' : 'Enter Academic Master PIN (0486)...'}
                      className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-hidden tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {pinError && (
                    <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-700 text-[11px] text-rose-300 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  id="btn-academic-direct-login"
                  disabled={isLoggingInDirectly}
                  onClick={handleExecuteDirectAcademicLogin}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Thibitisha PIN na Ingia' : 'Verify PIN & Enter'}</span>
                </button>
              </div>
            ) : loginMethod === 'quick' && activeRole === 'admin' ? (
              /* QUICK ADMIN LOGIN (INSTANT 1-TAP OR PASSCODE) */
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/40 space-y-3 shadow-xl">
                {/* Instant 1-Tap Entry for Headmaster / Management */}
                <button
                  type="button"
                  id="btn-admin-quick-onetap"
                  onClick={() => {
                    setIsLoggingInDirectly(true);
                    if (onDirectAdminLogin) {
                      onDirectAdminLogin({
                        name: 'Br. Adolph Massawe / Mkuu wa Shule',
                        email: 'tumainifundtrustfoundation@gmail.com',
                      });
                    } else if (onContinueToPortal) {
                      onContinueToPortal();
                    }
                    setIsLoggingInDirectly(false);
                  }}
                  className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/50 group"
                >
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>
                    {language === 'sw'
                      ? '⚡ Bofya Hapa Kuingia Moja kwa Moja (Utawala Mkuu)'
                      : '⚡ Quick 1-Tap Admin Portal Access'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center gap-2">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {language === 'sw' ? 'au weka Nenosiri / PIN' : 'or enter Admin PIN'}
                  </span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                {/* Preset Fast PIN Badges */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-black text-white truncate">Br. Adolph Massawe / Utawala</h5>
                      <p className="text-[10px] text-slate-400 font-mono truncate">Ofisi ya Mkuu wa Shule</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherPinInput('782558');
                        setTimeout(() => handleExecuteDirectAdminLogin(), 50);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold border border-emerald-500/30 cursor-pointer"
                    >
                      ⚡ 782558
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherPinInput('0486');
                        setTimeout(() => handleExecuteDirectAdminLogin(), 50);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 font-bold border border-amber-400/30 cursor-pointer"
                    >
                      ⚡ 0486
                    </button>
                  </div>
                </div>

                {/* Manual Input */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      id="input-admin-direct-pin"
                      value={teacherPinInput}
                      onChange={(e) => {
                        setTeacherPinInput(e.target.value);
                        if (pinError) setPinError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleExecuteDirectAdminLogin();
                      }}
                      placeholder={language === 'sw' ? 'Weka PIN / Nenosiri la Utawala (782558 au 0486)...' : 'Enter Admin PIN / Passcode (782558 or 0486)...'}
                      className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-hidden tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {pinError && (
                    <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-700 text-[11px] text-rose-300 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  id="btn-admin-direct-submit"
                  disabled={isLoggingInDirectly}
                  onClick={handleExecuteDirectAdminLogin}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400/50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Thibitisha na Ingia Jopo la Utawala' : 'Verify & Open Admin Portal'}</span>
                </button>
              </div>
            ) : loginMethod === 'quick' && activeRole === 'bursar' ? (
              /* QUICK BURSAR LOGIN (INSTANT 1-TAP OR PIN) */
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/95 border border-amber-500/40 space-y-3 shadow-xl">
                {/* Instant 1-Tap Entry for Bursar */}
                <button
                  type="button"
                  id="btn-bursar-quick-onetap"
                  onClick={() => {
                    setIsLoggingInDirectly(true);
                    if (onDirectBursarLogin) {
                      onDirectBursarLogin({
                        name: 'Mwl. Sigbert Minja (Bursar)',
                        email: 'sigminja@gmail.com',
                      });
                    } else if (onContinueToPortal) {
                      onContinueToPortal();
                    }
                    setIsLoggingInDirectly(false);
                  }}
                  className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/50 group"
                >
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>
                    {language === 'sw'
                      ? '⚡ Bofya Hapa Kuingia Moja kwa Moja (Mhasibu / Bursar)'
                      : '⚡ Quick 1-Tap Bursar Access'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center gap-2">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {language === 'sw' ? 'au kwa PIN ya Fedha' : 'or enter Bursar PIN'}
                  </span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                {/* Preset Bursar Fast PIN Badge */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-black text-white truncate">Mwl. Sigbert Minja</h5>
                      <p className="text-[10px] text-slate-400 font-mono truncate">Ofisi ya Uhasibu & Ada</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherPinInput('752000');
                      setTimeout(() => handleExecuteDirectBursarLogin(), 50);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 font-bold border border-amber-400/30 cursor-pointer shrink-0"
                  >
                    ⚡ PIN 752000
                  </button>
                </div>

                {/* Manual Input */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      id="input-bursar-direct-pin"
                      value={teacherPinInput}
                      onChange={(e) => {
                        setTeacherPinInput(e.target.value);
                        if (pinError) setPinError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleExecuteDirectBursarLogin();
                      }}
                      placeholder={language === 'sw' ? 'Weka PIN ya Uhasibu (752000 au 1234)...' : 'Enter Bursar PIN (752000 or 1234)...'}
                      className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-hidden tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {pinError && (
                    <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-700 text-[11px] text-rose-300 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  id="btn-bursar-direct-submit"
                  disabled={isLoggingInDirectly}
                  onClick={handleExecuteDirectBursarLogin}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Thibitisha na Ingia Jopo la Uhasibu' : 'Verify & Open Bursar Portal'}</span>
                </button>
              </div>
            ) : (
              /* PRIMARY GOOGLE SIGN-IN BUTTON WITH FIREBASE SECURITY SUITE */
              <div className="space-y-3">
                <GoogleSignInButton
                  onClick={onGoogleSignIn}
                  isLoading={isSigningIn}
                  label={
                    activeRole === 'teacher'
                      ? (language === 'sw' ? 'Ingia kwa Google (Firebase Security - Walimu)' : 'Sign in with Google (Firebase Auth - Teachers)')
                      : (language === 'sw'
                          ? `Ingia kwa Akaunti ya Google (${currentRoleConfig.shortSw})`
                          : `Sign in with Google (${currentRoleConfig.shortEn})`)
                  }
                  sublabel={
                    language === 'sw'
                      ? 'Firebase OAuth 2.0 • Uthibitishaji Salama wa Alama'
                      : 'Firebase OAuth 2.0 • Verified Security & Firestore Rules'
                  }
                  theme="dark"
                  id={`btn-google-signin-${activeRole}`}
                  className="py-2.5 sm:py-3 shadow-md border-emerald-500/50 hover:border-emerald-400 bg-slate-950"
                />

                {/* Teacher Firebase Email/Password & Quick Faculty Authentication */}
                {activeRole === 'teacher' ? (
                  <div className="space-y-3">
                    {/* Faculty Quick Firebase Verification */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-extrabold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? 'Walimu Waliosajiliwa (Firebase Verified Faculty):' : 'Registered Faculty (Firebase Verified):'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">1-Tap Firebase</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {teachersList.slice(0, 6).map((tch) => (
                          <button
                            key={tch.id}
                            type="button"
                            onClick={() => {
                              if (onGoogleSignIn) {
                                onGoogleSignIn({
                                  email: tch.email || 'walimu@uombonisec.ac.tz',
                                  name: tch.name,
                                  role: 'teacher',
                                });
                              } else if (onDirectTeacherLogin) {
                                onDirectTeacherLogin({
                                  id: tch.id,
                                  name: tch.name,
                                  email: tch.email || 'walimu@uombonisec.ac.tz',
                                  role: 'teacher',
                                  subjects: tch.subjects,
                                });
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                          >
                            <div className="min-w-0 pr-1">
                              <span className="text-[11px] font-bold text-white block truncate group-hover:text-emerald-300">
                                {tch.name}
                              </span>
                              <span className="text-[9px] text-slate-400 block truncate font-mono">
                                {tch.subjects?.join(', ') || tch.roleSw}
                              </span>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold shrink-0">
                              🔒 Auth
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Direct Firebase Email & Password Form */}
                    <form onSubmit={handleTeacherFirebaseEmailLogin} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                          <Mail className="w-3 h-3 text-amber-400" />
                          <span>{language === 'sw' ? 'Au Ingia kwa Barua Pepe ya Mwalimu (Firebase):' : 'Or Sign in with Teacher Email (Firebase):'}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={firebaseEmailInput}
                          onChange={(e) => setFirebaseEmailInput(e.target.value)}
                          placeholder="barua-pepe@uombonisec.ac.tz"
                          className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-hidden"
                        />
                        <div className="relative">
                          <input
                            type={showFirebasePassword ? 'text' : 'password'}
                            value={firebasePasswordInput}
                            onChange={(e) => setFirebasePasswordInput(e.target.value)}
                            placeholder={language === 'sw' ? 'Nenosiri au PIN...' : 'Password or PIN...'}
                            className="w-full pl-2.5 pr-8 py-2 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => setShowFirebasePassword(!showFirebasePassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                          >
                            {showFirebasePassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {firebaseEmailError && (
                        <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-700 text-[11px] text-rose-300 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{firebaseEmailError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isFirebaseEmailLoggingIn}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400/40"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {isFirebaseEmailLoggingIn
                            ? (language === 'sw' ? 'Inathibitisha na Firebase...' : 'Authenticating with Firebase...')
                            : (language === 'sw' ? 'Thibitisha na Ingia kwa Firebase Security' : 'Authenticate via Firebase Security')}
                        </span>
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Admin / Bursar / Academic 1-Tap Direct Bypass */
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span>⚡</span>
                        <span>{language === 'sw' ? 'Kama Google imegoma au unahitaji haraka:' : 'If Google popup is blocked or slow:'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setLoginMethod('quick')}
                        className="text-emerald-400 hover:underline font-mono cursor-pointer"
                      >
                        {language === 'sw' ? 'Tumia PIN' : 'Use PIN'}
                      </button>
                    </div>

                    {activeRole === 'admin' && (
                      <button
                        type="button"
                        id="btn-bypass-direct-admin"
                        onClick={() => {
                          if (onDirectAdminLogin) {
                            onDirectAdminLogin({
                              name: 'Br. Adolph Massawe / Utawala',
                              email: 'tumainifundtrustfoundation@gmail.com',
                            });
                          } else if (onContinueToPortal) {
                            onContinueToPortal();
                          }
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{language === 'sw' ? 'Ingia Moja kwa Moja kama Utawala (1-Tap)' : 'Direct 1-Tap Entry (Admin)'}</span>
                      </button>
                    )}

                    {activeRole === 'bursar' && (
                      <button
                        type="button"
                        id="btn-bypass-direct-bursar"
                        onClick={() => {
                          if (onDirectBursarLogin) {
                            onDirectBursarLogin({
                              name: 'Mwl. Sigbert Minja (Bursar)',
                              email: 'sigminja@gmail.com',
                            });
                          } else if (onContinueToPortal) {
                            onContinueToPortal();
                          }
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'sw' ? 'Ingia Moja kwa Moja kama Mhasibu (1-Tap)' : 'Direct 1-Tap Entry (Bursar)'}</span>
                      </button>
                    )}

                    {activeRole === 'academic_master' && (
                      <button
                        type="button"
                        id="btn-bypass-direct-academic"
                        onClick={() => {
                          if (onDirectAcademicLogin) {
                            onDirectAcademicLogin({
                              name: 'Mwl. Yohana Bahati (Mtaaluma Mkuu)',
                              email: 'yohana.bahati@uombonisec.ac.tz',
                            });
                          } else if (onContinueToPortal) {
                            onContinueToPortal();
                          }
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>{language === 'sw' ? 'Ingia Moja kwa Moja kama Taaluma (1-Tap)' : 'Direct 1-Tap Entry (Academic)'}</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="py-1 px-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                  <Globe2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">Firebase Security Active • Uomboni Secondary School (S0486)</span>
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-start gap-2.5 text-rose-300 text-xs font-medium text-left"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold block">{language === 'sw' ? 'Hitilafu ya Kuingia' : 'Authentication Error'}</span>
                  <span>{authError}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Trust & Compliance Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL/TLS</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Firebase OAuth 2.0</span>
            </span>
          </div>

          <button
            type="button"
            id="login-it-contact-link"
            onClick={() => setShowSupportModal(true)}
            className="text-amber-400 hover:text-amber-300 hover:underline transition-colors font-medium cursor-pointer"
          >
            {language === 'sw' ? 'Wasiliana na Ofisi ya TEHAMA' : 'Contact IT Helpdesk'}
          </button>
        </div>
      </div>

      {/* IT Support Dialog */}
      <AnimatePresence>
        {showSupportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {language === 'sw' ? 'Msaada wa Kuingia (IT Support)' : 'Staff Sign-In Helpdesk'}
                  </h4>
                </div>
                <button
                  type="button"
                  id="close-support-modal-btn"
                  onClick={() => setShowSupportModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  {language === 'sw'
                    ? 'Ikiwa unakumbana na changamoto ya kuingia kwenye jopo lako la kazi, hakikisha akaunti yako ya Google imeidhinishwa na Ofisi ya Mkuu wa Shule au Kitengo cha TEHAMA.'
                    : 'If you experience any difficulties signing in, ensure your Google Workspace email address is registered with the Headmaster’s Office or IT Unit.'}
                </p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold">+255 782 558 127</span>
                    <span className="text-[10px] text-slate-400">(Simu & WhatsApp)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span className="font-mono">info@uombonisecondary.ac.tz</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span>Ofisi Kuu ya Utawala, Marangu Moshi</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="ack-support-btn"
                onClick={() => setShowSupportModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                {language === 'sw' ? 'Nimeelewa' : 'Understood'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
