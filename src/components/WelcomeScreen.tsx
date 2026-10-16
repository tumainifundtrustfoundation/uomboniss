import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Search,
  User as UserIcon,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  ExternalLink,
  Fingerprint,
  Scan,
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { sendResetPassword } from '../lib/firebase';
import { checkServerSecurityStatus } from '../services/authSecurityClient';

interface WelcomeScreenProps {
  onEnterWebsite?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnterWebsite }) => {
  const { login, loginWithGoogleAuth, loginWithDemoRole, loading: authLoading, setActiveView } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  // Forgot password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Demo accounts drawer
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Biometric / Fingerprint authentication state
  const [authMode, setAuthMode] = useState<'credentials' | 'fingerprint'>('credentials');
  const [fingerprintStatus, setFingerprintStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [fingerprintRole, setFingerprintRole] = useState<'student' | 'teacher' | 'parent' | 'admin'>('student');
  const [fingerprintProgress, setFingerprintProgress] = useState(0);
  const [fingerprintFeedback, setFingerprintFeedback] = useState('');
  const [isFingerprintPressed, setIsFingerprintPressed] = useState(false);
  const [isFingerprintModalOpen, setIsFingerprintModalOpen] = useState(false);

  const handleFingerprintScan = async (selectedRole = fingerprintRole) => {
    if (fingerprintStatus === 'scanning') return;
    setErrorMessage('');
    setFingerprintStatus('scanning');
    setFingerprintProgress(15);
    setFingerprintFeedback(
      language === 'sw'
        ? 'Inasoma alama ya kidole... Tafadhali shikilia kidole kwenye kitambuzi.'
        : 'Scanning fingerprint... Please hold your finger on the sensor.'
    );

    let currentProg = 15;
    const interval = setInterval(() => {
      currentProg += 20;
      setFingerprintProgress((p) => Math.min(p + 20, 92));
      if (currentProg >= 90) {
        clearInterval(interval);
      }
    }, 180);

    setTimeout(async () => {
      clearInterval(interval);
      setFingerprintProgress(100);
      setFingerprintStatus('success');

      const roleLabels: Record<string, { sw: string; en: string }> = {
        student: { sw: 'Mwanafunzi', en: 'Student' },
        teacher: { sw: 'Mwalimu', en: 'Teacher' },
        parent: { sw: 'Mzazi / Mlezi', en: 'Parent' },
        admin: { sw: 'Mkuu wa Shule', en: 'Headmaster' },
      };

      const roleLabel = roleLabels[selectedRole]
        ? language === 'sw'
          ? roleLabels[selectedRole].sw
          : roleLabels[selectedRole].en
        : selectedRole;

      setFingerprintFeedback(
        language === 'sw'
          ? `Alama ya kidole imethibitishwa kikamilifu! Karibu ${roleLabel}.`
          : `Biometric authentication verified! Welcome, ${roleLabel}.`
      );

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate?.([60, 40, 80]);
        } catch {}
      }

      setTimeout(async () => {
        try {
          await loginWithDemoRole(selectedRole);
          sessionStorage.setItem('uomboni_view', 'website');
        } catch {
          handleEnterWebsite();
        }
      }, 950);
    }, 1250);
  };

  const handleEnterWebsite = () => {
    try {
      sessionStorage.setItem('uomboni_view', 'website');
    } catch {}
    if (onEnterWebsite) {
      onEnterWebsite();
    } else {
      setActiveView('website');
      window.location.hash = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setErrorMessage(
        language === 'sw'
          ? 'Tafadhali jaza Username au Email na Nenosiri.'
          : 'Please enter Username or Email and Password.'
      );
      return;
    }

    try {
      const securityCheck = await checkServerSecurityStatus(cleanIdentifier);
      if (securityCheck.isLocked) {
        setErrorMessage(
          language === 'sw'
            ? 'Majaribio mengi yameshindwa. Tafadhali subiri kidogo kisha ujaribu tena.'
            : 'Too many failed attempts. Please wait a moment before trying again.'
        );
        return;
      }
    } catch {}

    setIsSubmitting(true);
    try {
      const res = await login(cleanIdentifier, password);
      if (!res.success) {
        setErrorMessage(
          language === 'sw'
            ? 'Username au Nenosiri si sahihi.'
            : 'Invalid Username or Password.'
        );
      } else {
        sessionStorage.setItem('uomboni_view', 'website');
      }
    } catch {
      setErrorMessage(
        language === 'sw'
          ? 'Username au Nenosiri si sahihi.'
          : 'Invalid Username or Password.'
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
            ? res.error || 'Imeshindwa kuingia na Google.'
            : res.error || 'Google Sign-In failed.'
        );
      } else {
        sessionStorage.setItem('uomboni_view', 'website');
      }
    } catch {
      setErrorMessage(
        language === 'sw'
          ? 'Hitilafu ya Google imetokea.'
          : 'Google authentication error.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'student' | 'teacher' | 'parent' | 'admin') => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await loginWithDemoRole(role);
      if (!res.success) {
        setErrorMessage(res.error || 'Kuingia kumeshindwa');
      } else {
        sessionStorage.setItem('uomboni_view', 'website');
      }
    } catch {
      setErrorMessage('Hitilafu ya kuingia');
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
            ? 'Maelekezo ya kurejesha nenosiri yametumwa kwa barua pepe.'
            : 'Password reset link sent to your email.',
      });
      setTimeout(() => {
        setResetEmail('');
      }, 3000);
    } catch {
      setResetFeedback({
        type: 'success',
        message:
          language === 'sw'
            ? 'Maelekezo ya kurejesha nenosiri yametumwa kwa barua pepe.'
            : 'Password reset link sent to your email.',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const isBusy = isSubmitting || authLoading;

  return (
    <div className="min-h-screen w-full neumorph-canvas flex flex-col justify-between selection:bg-[#2563eb] selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Top Header Icons (Exactly matching top row of user's screenshot with search and profile icon) */}
      <header className="w-full px-4 sm:px-8 pt-4 sm:pt-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={handleEnterWebsite}
            className="neumorph-pill-small px-3.5 py-1.5 inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#2563eb] transition-colors cursor-pointer"
            title="Tembelea Tovuti ya Shule"
          >
            <SchoolLogo size="sm" />
            <span className="hidden sm:inline">Uomboni Secondary School</span>
            <span className="text-[10px] text-slate-500 font-mono">(S0486)</span>
          </button>
        </div>

        {/* Right Corner Icons: Language, Fingerprint, Search & Profile Avatar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
            className="w-9 h-9 neumorph-circle flex items-center justify-center text-slate-600 hover:text-[#2563eb] transition-colors cursor-pointer text-xs font-bold"
            title="Badili Lugha / Toggle Language"
          >
            {language === 'sw' ? 'EN' : 'SW'}
          </button>

          <button
            onClick={() => {
              setAuthMode('fingerprint');
              handleFingerprintScan();
            }}
            className="w-9 h-9 neumorph-circle flex items-center justify-center text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            title={language === 'sw' ? 'Ingia kwa Alama ya Kidole' : 'Biometric Fingerprint Login'}
          >
            <Fingerprint className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={handleEnterWebsite}
            className="w-9 h-9 neumorph-circle flex items-center justify-center text-slate-600 hover:text-[#2563eb] transition-colors cursor-pointer"
            title="Search Website"
          >
            <Search className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="w-9 h-9 neumorph-circle flex items-center justify-center text-slate-600 hover:text-[#2563eb] transition-colors cursor-pointer"
            title="User Profile & Demo Roles"
          >
            <UserIcon className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Main Center Stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-8 z-10">
        
        {/* Title Exactly Matching User Screenshot: "Animated Embossed Login" */}
        <div className="text-center mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#d63031] tracking-wide drop-shadow-xs">
            Animated Embossed Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {language === 'sw'
              ? 'Karibu Shule ya Sekondari Uomboni · Marangu, Kilimanjaro'
              : 'Welcome to Uomboni Secondary School · Marangu, Kilimanjaro'}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="w-full max-w-sm mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 shadow-sm animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-rose-500 hover:text-rose-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Center Circular Embossed Disc (100% Matching User Graphic + Biometric Fingerprint Sensor) */}
        <div className="relative animate-float-gentle my-1">
          <div className="neumorph-circle w-[330px] h-[330px] sm:w-[400px] sm:h-[400px] md:w-[430px] md:h-[430px] flex flex-col items-center justify-center p-5 sm:p-7 select-none relative">
            
            {/* Top Auth Mode Switcher (Password vs Fingerprint) */}
            <div className="flex items-center gap-1.5 p-1 mb-2.5 rounded-full bg-[#cad5e2]/40 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('credentials');
                  setFingerprintStatus('idle');
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === 'credentials'
                    ? 'neumorph-switch-tab-active text-[#102A43] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3 h-3 text-[#2563eb]" />
                <span>{language === 'sw' ? 'Nenosiri' : 'Password'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('fingerprint');
                  if (fingerprintStatus === 'idle') {
                    handleFingerprintScan();
                  }
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === 'fingerprint'
                    ? 'neumorph-switch-tab-active text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'sw' ? 'Alama ya Kidole' : 'Fingerprint'}</span>
              </button>
            </div>

            {/* MODE 1: Standard Animated Embossed Login (Exact Match to User Graphic) */}
            {authMode === 'credentials' ? (
              <>
                {/* Header inside circle: SIGN IN */}
                <h2 className="text-lg sm:text-2xl font-black text-[#2d3748] tracking-widest uppercase mb-4 sm:mb-5">
                  SIGN IN
                </h2>

                {/* Embossed Form */}
                <form onSubmit={handleSubmit} className="w-full max-w-[240px] sm:max-w-[270px] space-y-3.5 sm:space-y-4">
                  {/* Username Input (Debossed Pill Shape) */}
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Username"
                      disabled={isBusy}
                      autoComplete="username"
                      className="neumorph-input w-full px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium tracking-wide"
                    />
                  </div>

                  {/* Password Input (Debossed Pill Shape) */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      disabled={isBusy}
                      autoComplete="current-password"
                      className="neumorph-input w-full px-5 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm font-medium tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Actions Row: Login Button + Quick Fingerprint Sensor Button */}
                  <div className="pt-1.5 relative flex items-center justify-between gap-2.5">
                    {/* Main Embossed Login Button with Hand Pointer */}
                    <div className="relative flex-1">
                      <button
                        type="submit"
                        disabled={isBusy}
                        onMouseDown={() => setIsButtonPressed(true)}
                        onMouseUp={() => setIsButtonPressed(false)}
                        onTouchStart={() => setIsButtonPressed(true)}
                        onTouchEnd={() => setIsButtonPressed(false)}
                        className={`neumorph-btn w-full py-2.5 sm:py-3 text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 relative ${
                          isButtonPressed ? 'neumorph-btn-pressed' : ''
                        }`}
                      >
                        {isBusy ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#2563eb]" />
                        ) : (
                          <span className="font-bold text-[#2563eb] text-sm sm:text-base">
                            Login
                          </span>
                        )}
                      </button>

                      {/* Hand Pointer Cursor Indicator (Exactly reproducing user's uploaded graphic) */}
                      <div
                        className="absolute -bottom-2.5 right-6 sm:right-10 pointer-events-none select-none drop-shadow-md animate-bounce"
                        style={{ animationDuration: '2s' }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="transform rotate-12"
                        >
                          <path
                            d="M10 2V13M10 13L7.707 10.707C7.316 10.316 6.684 10.316 6.293 10.707L6 11L11.5 16.5C12.826 17.826 14.624 18.571 16.5 18.571H18C20.209 18.571 22 16.78 22 14.571V8.5C22 7.672 21.328 7 20.5 7C19.672 7 19 7.672 19 8.5V11M16 11V6.5C16 5.672 15.328 5 14.5 5C13.672 5 13 5.672 13 6.5V11M13 11V3.5C13 2.672 12.328 2 11.5 2C10.672 2 10 2.672 10 3.5"
                            stroke="#2d3748"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="#ffffff"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Quick Tactile Fingerprint Button beside Login */}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('fingerprint');
                        handleFingerprintScan();
                      }}
                      className="w-11 h-11 sm:w-12 sm:h-12 neumorph-btn rounded-full flex items-center justify-center shrink-0 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer group shadow-sm"
                      title={language === 'sw' ? 'Ingia kwa Alama ya Kidole (Fingerprint)' : 'Login with Fingerprint'}
                    >
                      <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Direct Fingerprint Tap Prompt for Maximum Visibility */}
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('fingerprint');
                        handleFingerprintScan();
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors py-1 px-2.5 rounded-full hover:bg-emerald-50/80 cursor-pointer"
                    >
                      <Fingerprint className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>{language === 'sw' ? 'Au gusa Alama ya Kidole (Fingerprint)' : 'Or tap Fingerprint Scanner'}</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* MODE 2: BIOMETRIC FINGERPRINT EMBOSSED SENSOR */
              <div className="w-full max-w-[270px] sm:max-w-[300px] flex flex-col items-center justify-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center">
                  <h2 className="text-base sm:text-xl font-black text-[#2d3748] tracking-wider uppercase">
                    {language === 'sw' ? 'ALAMA YA KIDOLE' : 'FINGERPRINT LOGIN'}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
                    {language === 'sw'
                      ? 'Gusa kitambuzi kuthibitisha alama ya kidole'
                      : 'Touch sensor to verify fingerprint'}
                  </p>
                </div>

                {/* Role Switcher Chips for Biometric Unlock */}
                <div className="grid grid-cols-4 gap-1 w-full text-[9px] font-bold text-center">
                  {(
                    [
                      { role: 'student', labelSw: 'Mwanafunzi', labelEn: 'Student' },
                      { role: 'teacher', labelSw: 'Mwalimu', labelEn: 'Teacher' },
                      { role: 'parent', labelSw: 'Mzazi', labelEn: 'Parent' },
                      { role: 'admin', labelSw: 'Mkuu', labelEn: 'Admin' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => {
                        setFingerprintRole(item.role);
                        if (fingerprintStatus !== 'scanning') {
                          handleFingerprintScan(item.role);
                        }
                      }}
                      className={`py-1 px-1 rounded-lg border transition-all cursor-pointer ${
                        fingerprintRole === item.role
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-black'
                          : 'bg-[#cad5e2]/30 text-slate-600 border-transparent hover:bg-[#cad5e2]/60'
                      }`}
                    >
                      {language === 'sw' ? item.labelSw : item.labelEn}
                    </button>
                  ))}
                </div>

                {/* Tactile Embossed Biometric Fingerprint Sensor Disc */}
                <div className="relative my-1 flex items-center justify-center">
                  {/* Outer Pulsing Glow Ring */}
                  {fingerprintStatus === 'scanning' && (
                    <div className="absolute inset-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-emerald-400 animate-biometric-pulse-ring pointer-events-none" />
                  )}

                  {/* Main Tactile Sensor Pad */}
                  <button
                    type="button"
                    onClick={() => handleFingerprintScan()}
                    onMouseDown={() => setIsFingerprintPressed(true)}
                    onMouseUp={() => setIsFingerprintPressed(false)}
                    onTouchStart={() => setIsFingerprintPressed(true)}
                    onTouchEnd={() => setIsFingerprintPressed(false)}
                    className={`neumorph-fingerprint-sensor w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center relative cursor-pointer group ${
                      isFingerprintPressed || fingerprintStatus === 'scanning' ? 'scanning' : ''
                    } ${
                      fingerprintStatus === 'success'
                        ? 'border-2 border-emerald-500 bg-emerald-50/60'
                        : fingerprintStatus === 'scanning'
                        ? 'border-2 border-cyan-400 bg-cyan-50/40'
                        : 'border-2 border-slate-300/60 hover:border-emerald-400/80'
                    }`}
                  >
                    {/* Glowing Laser Scan Bar */}
                    {fingerprintStatus === 'scanning' && (
                      <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-2xs animate-laser-sweep pointer-events-none z-10" />
                    )}

                    {/* Sensor Center Icon */}
                    {fingerprintStatus === 'success' ? (
                      <div className="flex flex-col items-center animate-in zoom-in-75 duration-200 text-emerald-600">
                        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                        <span className="text-[9px] font-black uppercase tracking-wider mt-1 text-emerald-700">
                          {language === 'sw' ? 'Imethibitishwa!' : 'Verified!'}
                        </span>
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-center">
                        <Fingerprint
                          className={`w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 ${
                            fingerprintStatus === 'scanning'
                              ? 'text-cyan-600 scale-105'
                              : 'text-slate-500 group-hover:text-emerald-600'
                          }`}
                        />
                      </div>
                    )}
                  </button>
                </div>

                {/* Sensor Real-Time Status / Feedback */}
                <div className="text-center min-h-[30px] flex flex-col items-center justify-center">
                  <p
                    className={`text-[11px] sm:text-xs font-semibold leading-tight px-2 ${
                      fingerprintStatus === 'success'
                        ? 'text-emerald-700 font-bold'
                        : fingerprintStatus === 'scanning'
                        ? 'text-cyan-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {fingerprintFeedback ||
                      (language === 'sw'
                        ? 'Gusa kitambuzi hapo juu ili kuingia'
                        : 'Touch the sensor above to verify')}
                  </p>

                  {fingerprintStatus === 'scanning' && (
                    <div className="w-28 bg-slate-200 h-1 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-cyan-500 h-full transition-all duration-200"
                        style={{ width: `${fingerprintProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Back to Password Button */}
                <button
                  type="button"
                  onClick={() => setAuthMode('credentials')}
                  className="text-[11px] text-[#2563eb] hover:underline font-bold pt-1 cursor-pointer"
                >
                  {language === 'sw' ? '← Rudi kwenye Nenosiri' : '← Back to Password Login'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Navigation Buttons (Seamless Access to School Website & Portal) */}
        <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-sm text-center">
          
          {/* Direct Button: Enter School Website */}
          <button
            onClick={handleEnterWebsite}
            className="w-full py-3 px-5 rounded-2xl bg-[#102A43] hover:bg-[#06182c] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 group transition-all cursor-pointer"
          >
            <span>{language === 'sw' ? 'Ingia Kwenye Tovuti ya Shule' : 'Enter Official School Website'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Actions Row: Fingerprint, Demo Roles, Google, Forgot Password */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-1">
            <button
              onClick={() => {
                setAuthMode('fingerprint');
                handleFingerprintScan();
              }}
              className="neumorph-pill-small px-3 py-1.5 font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer flex items-center gap-1.5 border border-emerald-500/30 shadow-xs"
              title="Ingia kwa Alama ya Kidole (Biometric Fingerprint)"
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'sw' ? 'Alama ya Kidole' : 'Fingerprint'}</span>
            </button>

            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="neumorph-pill-small px-3 py-1.5 font-bold text-slate-700 hover:text-[#2563eb] cursor-pointer"
            >
              ⚡ {language === 'sw' ? 'Akaunti za Majaribio (Demo)' : 'Demo Roles'}
            </button>

            <button
              onClick={handleGoogleSignIn}
              disabled={isBusy}
              className="neumorph-pill-small px-3 py-1.5 font-bold text-slate-700 hover:text-[#2563eb] cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={() => setIsForgotPasswordOpen(true)}
              className="text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
            >
              {language === 'sw' ? 'Umesahau nenosiri?' : 'Forgot password?'}
            </button>
          </div>
        </div>

        {/* Demo Accounts Drawer */}
        {showDemoAccounts && (
          <div className="w-full max-w-md mt-5 p-4 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Jaribu Moja kwa Moja (Instant Demo Sign-In):</span>
              </span>
              <button
                onClick={() => setShowDemoAccounts(false)}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickDemoLogin('admin')}
                disabled={isBusy}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-[#102A43]">Mkuu wa Shule</div>
                <div className="text-[10px] text-slate-500">Headmaster (Admin)</div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('teacher')}
                disabled={isBusy}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-[#102A43]">Mwalimu</div>
                <div className="text-[10px] text-slate-500">Teacher Portal</div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('parent')}
                disabled={isBusy}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-[#102A43]">Mzazi / Mlezi</div>
                <div className="text-[10px] text-slate-500">Parent Portal</div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('student')}
                disabled={isBusy}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-[#102A43]">Mwanafunzi</div>
                <div className="text-[10px] text-slate-500">Student Portal</div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Subtle Footer Bar */}
      <footer className="w-full px-4 py-3 text-center text-[11px] text-slate-500 z-10 flex flex-wrap items-center justify-center gap-4">
        <span>© 2026 Uomboni Secondary School • NECTA S0486</span>
        <span>•</span>
        <button
          onClick={handleEnterWebsite}
          className="hover:text-[#2563eb] font-semibold underline cursor-pointer"
        >
          {language === 'sw' ? 'Fungua Tovuti Rasmi' : 'Visit Official Website'}
        </button>
      </footer>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'sw' ? 'Kurejesha Nenosiri' : 'Reset Password'}
              </h3>
              <button
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setResetFeedback(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {resetFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  resetFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordResetSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {language === 'sw' ? 'Barua Pepe ya Akaunti:' : 'Account Email:'}
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="mfano@uomboniss.ac.tz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#2563eb]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="px-5 py-2 bg-[#2563eb] text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {isSendingReset ? 'Inatuma...' : language === 'sw' ? 'Tuma Kiungo' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
