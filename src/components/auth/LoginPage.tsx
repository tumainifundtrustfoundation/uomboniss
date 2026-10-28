import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  X,
  GraduationCap,
  BookOpen,
  Phone,
  KeyRound,
  HelpCircle,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
} from 'lucide-react';
import { SchoolLogo } from '../SchoolLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { sendResetPassword, UserRole } from '../../lib/firebase';
import { checkServerSecurityStatus } from '../../services/authSecurityClient';
import { detectUserRoleFromIdentifier } from '../../utils/userRoleDetector';
import { GoogleAccountSelectModal } from '../GoogleAccountSelectModal';
import { TEACHER_AUTH_DIRECTORY, TeacherAuthProfile } from '../../services/teacherAuthDirectory';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogleAuth, loading: authLoading, setActiveView } = useAuth();
  const { language } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Account Select Modal state
  const [isGoogleSelectOpen, setIsGoogleSelectOpen] = useState(false);
  const [showTeacherRoster, setShowTeacherRoster] = useState(true);
  const [selectedTeacherFeedback, setSelectedTeacherFeedback] = useState<string | null>(null);

  // Forgot password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Real-time automatic identity and role recognition
  const detectedRole = detectUserRoleFromIdentifier(identifier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || authLoading) return;
    setErrorMessage('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setErrorMessage(
        language === 'sw'
          ? 'Tafadhali jaza Username/Kitambulisho na Nenosiri (Password).'
          : 'Please enter both Username/Identifier and Password.'
      );
      return;
    }

    // Pre-check rate-limiting from server security engine
    try {
      const securityCheck = await checkServerSecurityStatus(cleanIdentifier);
      if (securityCheck.isLocked) {
        setErrorMessage(
          language === 'sw'
            ? `Majaribio mengi ya kuingia yameshindwa. Akaunti na IP zimefungwa kwa sekunde ${securityCheck.remainingSeconds} kwa sababu za kiusalama.`
            : `Too many failed attempts. Account temporarily locked for ${securityCheck.remainingSeconds} seconds.`
        );
        return;
      }
    } catch {
      // Backend status precheck fallback
    }

    setIsSubmitting(true);

    try {
      const res = await login(cleanIdentifier, password);
      if (!res.success) {
        const err = res.error || '';
        if (err.includes('too-many-requests') || err.includes('Majaribio') || err.includes('imefungwa')) {
          setErrorMessage(err);
        } else {
          setErrorMessage(
            language === 'sw'
              ? err || 'Username au Nenosiri si sahihi. Hakikisha taarifa zako zimeandikwa kwa usahihi.'
              : err || 'Invalid Username or Password. Please verify your credentials and try again.'
          );
        }
      }
      // On success, AuthContext automatically navigates to setActiveView('portal')
    } catch (err: any) {
      setErrorMessage(
        language === 'sw'
          ? 'Hitilafu ya uthibitishaji wa akaunti. Tafadhali jaribu tena au wasiliana na ofisi ya shule.'
          : 'An authentication error occurred. Please try again or contact the school administration.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (isSubmitting || authLoading) return;
    setErrorMessage('');
    setIsGoogleSelectOpen(true);
  };

  const handleGoogleAccountSelected = async (
    email: string,
    name: string,
    role: UserRole,
    teacherId?: string
  ) => {
    setIsGoogleSelectOpen(false);
    if (isSubmitting || authLoading) return;
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      if (teacherId) {
        try {
          localStorage.setItem('uomboni_active_teacher_id', teacherId);
          localStorage.setItem('uomboni_selected_teacher_email', email.toLowerCase());
        } catch (e) {}
      }
      const res = await loginWithGoogleAuth(role, { email, name, role });
      if (!res.success) {
        setErrorMessage(
          language === 'sw'
            ? res.error || 'Imeshindwa kuingia na Google. Tafadhali jaribu tena.'
            : res.error || 'Failed to sign in with Google. Please try again.'
        );
      }
    } catch (err: any) {
      setErrorMessage(
        language === 'sw'
          ? 'Hitilafu ya uthibitishaji wa Google imetokea.'
          : 'A Google authentication error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectTeacherSelect = async (tch: TeacherAuthProfile, autoLogin = false) => {
    setIdentifier(tch.email);
    setPassword(tch.defaultPin);
    setErrorMessage('');
    setSelectedTeacherFeedback(`Umechagua: ${tch.name} (${tch.role}) - Masomo: ${tch.assignedSubjects.join(', ')}`);
    try {
      localStorage.setItem('uomboni_active_teacher_id', tch.id);
      localStorage.setItem('uomboni_selected_teacher_email', tch.email.toLowerCase());
    } catch (e) {}

    if (autoLogin) {
      setIsSubmitting(true);
      try {
        const res = await login(tch.email, tch.defaultPin);
        if (!res.success) {
          setErrorMessage(res.error || 'Hitilafu ya kuingia kwa mwalimu.');
        }
      } catch (err: any) {
        setErrorMessage('Hitilafu ya uthibitishaji.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim();
    if (!cleanEmail) return;

    setIsSendingReset(true);
    setResetFeedback(null);

    try {
      await sendResetPassword(cleanEmail);
      // Security best practice: Never disclose whether an account exists
      setResetFeedback({
        type: 'success',
        message:
          language === 'sw'
            ? 'Ikiwa barua pepe hii imesajiliwa kwenye mfumo wetu, maelekezo ya kurejesha nenosiri yametumwa sasa hivi.'
            : 'If an account associated with this email exists, password recovery instructions have been sent.',
      });
      setTimeout(() => {
        setResetEmail('');
      }, 3500);
    } catch (err: any) {
      // Return safe message without leaking enumeration
      setResetFeedback({
        type: 'success',
        message:
          language === 'sw'
            ? 'Ikiwa barua pepe hii imesajiliwa kwenye mfumo wetu, maelekezo ya kurejesha nenosiri yametumwa sasa hivi.'
            : 'If an account associated with this email exists, password recovery instructions have been sent.',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const isBusy = isSubmitting || authLoading;

  return (
    <div className="min-h-screen w-full bg-[#FFFFF0] flex flex-col justify-between selection:bg-[#102A43] selection:text-white font-sans">
      
      {/* Official Top Institutional Header */}
      <header className="w-full bg-[#102A43] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b-2 border-[#C9A227] shadow-md">
        <button
          type="button"
          onClick={() => setActiveView('website')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#FFFFF0] transition-colors cursor-pointer border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
        >
          <ArrowLeft className="w-4 h-4 text-[#C9A227]" />
          <span>{language === 'sw' ? 'Rudi Tovuti Kuu ya Shule' : 'Back to School Website'}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-black text-white tracking-wider leading-none">
              SHULE YA SEKONDARI UOMBONI
            </div>
            <div className="text-[10px] text-[#C9A227] font-semibold mt-0.5">
              NECTA Centre S0486 · Marangu, Moshi
            </div>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white shadow-sm border border-[#C9A227]/40">
            <SchoolLogo size="sm" />
          </div>
        </div>
      </header>

      {/* Main Center Form Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        
        {/* Institutional Identification Heading */}
        <div className="text-center mb-6 max-w-lg px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-[11px] font-bold mb-3 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#064e3b]" />
            <span>Lango Rasmi la Watumishi na Uongozi · Form I–IV</span>
          </div>

          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white p-1.5 shadow-md border border-[#102A43]/15 flex items-center justify-center">
            <SchoolLogo size="md" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#102A43] tracking-tight font-serif uppercase">
            SHULE YA SEKONDARI UOMBONI
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#064e3b] mt-0.5 tracking-wide uppercase">
            Uomboni Secondary School · NECTA Centre S0486
          </p>
          <p className="text-[11px] text-[#C9A227] font-semibold mt-1 italic">
            &ldquo;Elimu ni Maisha — Tujiendeleze Sisi Wenyewe&rdquo;
          </p>
        </div>

        {/* Secure Institutional Login Card */}
        <div className="w-full max-w-md bg-white rounded-2xl border-2 border-[#102A43]/15 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Card Top Title Banner */}
          <div className="bg-[#102A43] px-5 py-4 text-white flex items-center justify-between border-b-2 border-[#C9A227]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-[#C9A227]/40">
                <Lock className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Staff Portal Login
                </h2>
                <p className="text-[10px] text-amber-200/90 font-medium">
                  Uthibitisho Salama wa Watumishi na Walimu
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-600/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold">
                🔒 SSL Encrypted
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-4">
            
            {/* Real-time Role Recognition Notification Banner */}
            {identifier.trim().length > 0 && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-2xs transition-all ${detectedRole.bgLight} ${detectedRole.borderLight} ${detectedRole.textLight}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0 select-none">
                    {detectedRole.role === 'admin' && '👑'}
                    {detectedRole.role === 'teacher' && '👨‍🏫'}
                    {detectedRole.role === 'parent' && '👨‍👩‍👧'}
                    {detectedRole.role === 'student' && '🎓'}
                    {detectedRole.role === 'bursar' && '💳'}
                  </span>
                  <div className="min-w-0 text-left">
                    <div className="font-extrabold truncate text-xs">{detectedRole.labelSw}</div>
                    <div className="text-[10px] opacity-80 truncate">{detectedRole.descriptionSw}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/90 text-slate-800 shadow-2xs shrink-0">
                  Inatambuliwa
                </span>
              </div>
            )}

            {/* Error Alert Box */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-start gap-2.5 shadow-xs animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold leading-relaxed">{errorMessage}</div>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  aria-label="Funga ujumbe wa hitilafu"
                  className="text-rose-500 hover:text-rose-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Main Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Field 1: Username */}
              <div>
                <label
                  htmlFor="username-field"
                  className="block text-xs font-bold text-[#102A43] mb-1.5"
                >
                  Username / Kitambulisho cha Mtumishi <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="username-field"
                    type="text"
                    name="username"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Weka Username, Barua Pepe au Kitambulisho"
                    disabled={isBusy}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-[#102A43] placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-all disabled:opacity-50"
                  />
                  <div className="absolute right-3.5 top-3 pointer-events-none text-slate-400">
                    {detectedRole.role === 'teacher' ? (
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                    ) : detectedRole.role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Mifano: <span className="font-semibold text-slate-700">yohana.bahati@uombonisec.ac.tz</span> au barua pepe yako rasmi.
                </p>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password-field"
                    className="block text-xs font-bold text-[#102A43]"
                  >
                    Password / Nenosiri <span className="text-rose-600">*</span>
                  </label>
                  
                  {/* Functional Recover Password Link */}
                  <button
                    type="button"
                    onClick={() => {
                      setResetFeedback(null);
                      setIsForgotPasswordOpen(true);
                    }}
                    className="text-[11px] text-[#064e3b] hover:text-[#102A43] font-bold underline underline-offset-2 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#064e3b]"
                  >
                    Recover Password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password-field"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingiza nenosiri au PIN yako ya siri"
                    disabled={isBusy}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-[#102A43] placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-all disabled:opacity-50"
                  />
                  
                  {/* Functional Password Show/Hide Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ficha nenosiri' : 'Onyesha nenosiri'}
                    className="p-1.5 text-slate-400 hover:text-[#102A43] absolute right-2.5 top-2 cursor-pointer transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isBusy}
                className="w-full py-3 px-4 rounded-xl bg-[#102A43] hover:bg-[#064e3b] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              >
                {isBusy ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" />
                    <span>Inathibitisha na Kuingia...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#C9A227]" />
                    <span>Login / Ingia Kwenye Portal</span>
                  </span>
                )}
              </button>

            </form>

            {/* Google Authentication for Authorized Staff */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isBusy}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-[#102A43] text-xs font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <div className="w-4 h-4 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <span>Ingia na Google (Chagua Mwalimu / Mtumishi)</span>
              </button>
            </div>

            {/* Selected Teacher Feedback Banner */}
            {selectedTeacherFeedback && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-[11px] font-bold flex items-center justify-between gap-2 shadow-2xs">
                <span className="truncate">{selectedTeacherFeedback}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTeacherFeedback(null)}
                  className="text-amber-700 hover:text-amber-950 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Teacher Direct Quick Select Accordion */}
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowTeacherRoster(!showTeacherRoster)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#102A43] text-[#C9A227] flex items-center justify-center text-xs font-black">
                    👨‍🏫
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#102A43]">
                      Orodha ya Walimu Wote (Bonyeza Kuingia)
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Kila mwalimu ana masomo na akaunti yake binafsi
                    </p>
                  </div>
                </div>
                {showTeacherRoster ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showTeacherRoster && (
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                  {Object.values(TEACHER_AUTH_DIRECTORY)
                    .filter((t) => t.id !== 'tch-yohana-google') // Avoid duplicate Yohana
                    .map((tch) => (
                      <div
                        key={tch.id}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:border-[#102A43]/50 transition-all flex items-center justify-between gap-2 text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={tch.imageUrl || '/media/media_1.webp'}
                            alt={tch.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/media/media_1.webp';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {tch.name}
                              </span>
                              {tch.id === 'tch-003' && (
                                <span className="text-[9px] px-1 py-0.2 rounded font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Mtaaluma
                                </span>
                              )}
                              {tch.id === 'tch-001' && (
                                <span className="text-[9px] px-1 py-0.2 rounded font-black bg-amber-100 text-amber-800 border border-amber-200">
                                  Mkuu wa Shule
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">{tch.role}</div>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {tch.assignedSubjects.slice(0, 2).map((s) => (
                                <span
                                  key={s}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold"
                                >
                                  {s}
                                </span>
                              ))}
                              {tch.assignedSubjects.length > 2 && (
                                <span className="text-[9px] text-slate-400">
                                  +{tch.assignedSubjects.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDirectTeacherSelect(tch, false)}
                            className="px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-[10px] font-bold text-slate-700 transition cursor-pointer"
                            title="Jaza fomu kwa taarifa za mwalimu huyu"
                          >
                            Jaza
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDirectTeacherSelect(tch, true)}
                            disabled={isBusy}
                            className="px-2.5 py-1 rounded-lg bg-[#102A43] hover:bg-[#064e3b] text-white text-[10px] font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                            title="Ingia moja kwa moja kama mwalimu huyu"
                          >
                            ⚡ Ingia
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* School Helpdesk & Registry Hotline */}
            <div className="pt-2 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-950">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Msaada wa Watumishi (School IT Hotline):</span>
              </div>
              <p className="text-[10px] text-emerald-900 mt-1 leading-relaxed">
                Umesahau stakabadhi au akaunti imefungwa? Wasiliana na Ofisi ya Mkuu wa Shule: <strong className="text-slate-900">+255 782 558 127</strong> au Mtaaluma Mkuu: <strong className="text-slate-900">+255 745 548 225</strong>.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Official Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-600 font-semibold bg-white border-t border-slate-200">
        &copy; 2026 Uomboni Secondary School · Marangu, Moshi, Kilimanjaro · NECTA Centre S0486 · Wizara ya Elimu, Sayansi na Teknolojia
      </footer>

      {/* Recover Password Modal (Accessible & Secured against enumeration) */}
      {isForgotPasswordOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="recover-password-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-slate-800 relative border-2 border-[#102A43]/20">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#102A43] flex items-center justify-center text-[#C9A227]">
                  <KeyRound className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div>
                  <h3 id="recover-password-title" className="text-sm font-bold text-[#102A43]">
                    Recover Password / Kurejesha Nenosiri
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Uomboni Secondary School Portal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                aria-label="Funga dirisha la kurejesha nenosiri"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="pt-4">
              {resetFeedback ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="font-semibold leading-relaxed">{resetFeedback.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-[#102A43] hover:bg-[#064e3b] text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    Funga Dirisha (Close)
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Weka barua pepe (email) iliyosajiliwa kwenye akaunti yako. Tutatuma kiungo rasmi cha kurejesha nenosiri lako kupitia mfumo wa Firebase Authentication.
                  </p>

                  <div>
                    <label htmlFor="reset-email-input" className="block text-xs font-bold mb-1.5 text-slate-800">
                      Barua Pepe (Email Address) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="reset-email-input"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="mfano: mwl@uombonisec.ac.tz au mzazi@gmail.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-semibold text-[#102A43] outline-none focus:ring-2 focus:ring-[#102A43]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Ghairi
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReset}
                      className="px-5 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#064e3b] text-white text-xs font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-sm"
                    >
                      {isSendingReset ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A227]" />
                          <span>Inatuma kiungo...</span>
                        </>
                      ) : (
                        <span>Tuma Kiungo cha Kurejesha</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Google Account Select Modal for Staff and Faculty */}
      <GoogleAccountSelectModal
        isOpen={isGoogleSelectOpen}
        onClose={() => setIsGoogleSelectOpen(false)}
        onSelectAccount={handleGoogleAccountSelected}
        defaultRole="teacher"
      />

    </div>
  );
};
