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
  Users,
  BookOpen,
  Phone,
  KeyRound,
  Building,
  HelpCircle,
} from 'lucide-react';
import { SchoolLogo } from '../SchoolLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { sendResetPassword } from '../../lib/firebase';
import { checkServerSecurityStatus } from '../../services/authSecurityClient';
import { detectUserRoleFromIdentifier } from '../../utils/userRoleDetector';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogleAuth, loading: authLoading, setActiveView } = useAuth();
  const { language } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'all' | 'student' | 'parent' | 'teacher' | 'admin'>('all');

  // Forgot password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Real-time automatic identity and role recognition
  const detectedRole = detectUserRoleFromIdentifier(identifier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setErrorMessage(
        language === 'sw'
          ? 'Tafadhali jaza Kitambulisho/Barua Pepe na Nenosiri au PIN.'
          : 'Please enter your Identifier/Email and password/PIN.'
      );
      return;
    }

    // Pre-check rate-limiting from security server
    try {
      const securityCheck = await checkServerSecurityStatus(cleanIdentifier);
      if (securityCheck.isLocked) {
        setErrorMessage(
          language === 'sw'
            ? 'Majaribio mengi ya kuingia yameshindwa. Akaunti imefungwa kwa muda kwa usalama.'
            : 'Too many failed login attempts. Account temporarily locked for security.'
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
              ? err || 'Kitambulisho au Nenosiri/PIN si sahihi. Hakikisha taarifa zako ni sahihi.'
              : err || 'Invalid Identifier or Password/PIN. Please verify your credentials.'
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(
        language === 'sw'
          ? 'Hitilafu ya uthibitishaji imetokea. Tafadhali jaribu tena au wasiliana na utawala.'
          : 'Authentication error occurred. Please try again or contact administration.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogleAuth();
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

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setIsSendingReset(true);
    setResetFeedback(null);

    try {
      await sendResetPassword(resetEmail.trim());
      setResetFeedback({
        type: 'success',
        message:
          language === 'sw'
            ? 'Maelekezo ya kurejesha nenosiri yametumwa ikiwa akaunti hiyo ipo.'
            : 'Password reset instructions have been sent if an account with this email exists.',
      });
      setTimeout(() => {
        setResetEmail('');
      }, 3000);
    } catch (err: any) {
      setResetFeedback({
        type: 'success',
        message:
          language === 'sw'
            ? 'Maelekezo ya kurejesha nenosiri yametumwa ikiwa akaunti hiyo ipo.'
            : 'Password reset instructions have been sent if an account with this email exists.',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const isBusy = isSubmitting || authLoading;

  return (
    <div className="min-h-screen w-full bg-[#F4F6F8] flex flex-col justify-between selection:bg-[#102A43] selection:text-white font-sans">
      
      {/* Official Top Institutional Header */}
      <header className="w-full bg-[#102A43] text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b border-[#C9A227]/30 shadow-sm">
        <button
          onClick={() => setActiveView('website')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#FFFFF0] transition-colors cursor-pointer border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-[#C9A227]" />
          <span>{language === 'sw' ? 'Rudi Tovuti Kuu ya Shule' : 'Back to School Website'}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white shadow-xs">
            <SchoolLogo size="sm" />
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-black text-white tracking-tight leading-none">
              UOMBONI SECONDARY SCHOOL
            </div>
            <div className="text-[10px] text-[#C9A227] font-semibold mt-0.5">
              NECTA Centre S0486 · Marangu, Moshi
            </div>
          </div>
        </div>
      </header>

      {/* Main Center Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        
        {/* Institutional Title & Accreditation Badge */}
        <div className="text-center mb-6 max-w-xl px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mfumo Rasmi wenye Ulinzi wa Taarifa · NECTA Centre S0486</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight">
            Kuingia Kwenye Mfumo wa Shule
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium">
            Shule ya Sekondari Uomboni · Lango Salama la Wazazi, Wanafunzi, Walimu &amp; Utawala
          </p>
        </div>

        {/* Professional Institutional Login Card */}
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          {/* Top Card Banner */}
          <div className="bg-[#102A43] p-4 text-white flex items-center justify-between border-b border-[#C9A227]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-[#C9A227]/30">
                <Lock className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Uthibitisho wa Mtumiaji
                </h2>
                <p className="text-[10px] text-amber-200/80">
                  Ingiza taarifa zako zilizosajiliwa kisheria
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                🔒 SSL Secure
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-4">
            
            {/* Real-time Role Recognition Notification Banner (Visible when typing) */}
            {identifier.trim().length > 0 && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-xs transition-all ${detectedRole.bgLight} ${detectedRole.borderLight} ${detectedRole.textLight}`}
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

            {/* Error Alert Box (if any) */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2 shadow-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold leading-relaxed">{errorMessage}</div>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-rose-500 hover:text-rose-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Clean Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Field 1: Identifier */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Namba ya Mtihani, Simu, au Kitambulisho *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="mfano: S0486/0014/2026 au 0782558127"
                    disabled={isBusy}
                    className="w-full h-11 px-4 pr-10 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-all bg-slate-50/50"
                  />
                  <div className="absolute right-3.5 top-3 pointer-events-none text-slate-400">
                    {detectedRole.role === 'parent' ? (
                      <Phone className="w-4 h-4 text-amber-600" />
                    ) : detectedRole.role === 'teacher' ? (
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    ) : detectedRole.role === 'student' ? (
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Wanafunzi: Namba ya NECTA · Wazazi: Namba ya Simu · Walimu: Kitambulisho
                </p>
              </div>

              {/* Field 2: Password / PIN */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Nenosiri au PIN Binafsi *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetFeedback(null);
                      setIsForgotPasswordOpen(true);
                    }}
                    className="text-[11px] text-[#102A43] hover:text-[#C9A227] font-semibold transition-colors cursor-pointer"
                  >
                    Umesahau nenosiri?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Weka nenosiri au PIN yako"
                    disabled={isBusy}
                    className="w-full h-11 px-4 pr-10 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#102A43] focus:border-[#102A43] transition-all bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Ficha nenosiri' : 'Onyesha nenosiri'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isBusy}
                className="w-full py-3 px-4 rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isBusy ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" />
                    <span>Inathibitisha na Kuingia...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#C9A227]" />
                    <span>Ingia Kwenye Portal Rasmi</span>
                  </span>
                )}
              </button>

            </form>

            {/* Google Sign In Option for Authorized Staff */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isBusy}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
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
                <span>Ingia na Google (Akaunti ya Watumishi / Staff)</span>
              </button>
            </div>

            {/* Official Support & Anti-Fraud Hotline */}
            <div className="pt-3 border-t border-slate-100 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
                <HelpCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Msaada wa Kuingia (School IT &amp; Registry Hotline):</span>
              </div>
              <p className="text-[10px] text-amber-800 mt-1 leading-relaxed">
                Umekwama kuingia au unahitaji usaidizi wa nenosiri? Piga simu ofisi ya shule: <strong className="text-slate-900">+255 782 558 127</strong> au Mtaaluma Mkuu: <strong className="text-slate-900">+255 745 548 225</strong>.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Official Institutional Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 font-medium bg-white border-t border-slate-200">
        &copy; 2026 Uomboni Secondary School · Marangu, Moshi, Kilimanjaro · NECTA Centre S0486 · Wizara ya Elimu, Sayansi na Teknolojia
      </footer>

      {/* Password Reset Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-slate-800 relative border border-slate-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#102A43] flex items-center justify-center text-[#C9A227]">
                  <Lock className="w-4 h-4 text-[#C9A227]" />
                </div>
                <h3 className="text-sm font-bold text-[#102A43]">
                  Kurejesha Nenosiri (Password Reset)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="pt-4">
              {resetFeedback ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="font-semibold leading-relaxed">{resetFeedback.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-[#102A43] text-white text-xs font-bold cursor-pointer hover:bg-[#0A1C2E] transition-colors"
                  >
                    Funga Dirisha
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Weka barua pepe (email) iliyosajiliwa kwenye akaunti yako. Tutatuma kiungo rasmi cha kurejesha nenosiri lako.
                  </p>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700">
                      Barua Pepe (Email Address) *
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="mfano: mzazi@gmail.com au mwl@uombonisec.ac.tz"
                      className="w-full h-11 px-4 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:ring-2 focus:ring-[#102A43]"
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
                      className="px-5 py-2 rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-sm"
                    >
                      {isSendingReset ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Inatuma...</span>
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

    </div>
  );
};
