import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MailCheck,
  RotateCw,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { SchoolLogo } from '../SchoolLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const VerifyEmailPage: React.FC = () => {
  const { user, userProfile, resendVerification, checkVerification, authMessage, setAuthMessage, setActiveView, logout } = useAuth();
  const { language } = useLanguage();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleCheck = async () => {
    setChecking(true);
    setResendStatus(null);
    const verified = await checkVerification();
    setChecking(false);
    if (!verified) {
      setAuthMessage({
        type: 'info',
        text: 'Bado barua pepe haijathibitishwa. Tafadhali fungua kiungo ulichotumiwa kwenye barua pepe yako kisha ubofye hapa tena.',
      });
    }
  };

  const handleResend = async () => {
    setResending(true);
    const res = await resendVerification();
    setResending(false);
    if (res.success) {
      setResendStatus('Kiungo kipya cha uthibitisho kimetumwa kwenye barua pepe yako sasa hivi.');
    } else {
      setResendStatus(res.error || 'Imeshindwa kutuma tena. Tafadhali subiri kidogo.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-700/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-10 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            setAuthMessage(null);
            setActiveView('login');
          }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/50 backdrop-blur-md transition-all group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'sw' ? 'Rudi Kuingia' : 'Back to Login'}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <SchoolLogo size="sm" />
          <span className="text-xs font-bold text-white uppercase tracking-wider hidden sm:inline">
            Uomboni Secondary School
          </span>
        </div>

        <button
          onClick={() => logout()}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-800/50 transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Main Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 text-center relative"
        >
          {/* Animated Verification Icon */}
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-3xl shadow-lg shadow-emerald-950/50 relative"
            >
              <MailCheck className="w-12 h-12 text-emerald-400" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
              </motion.div>
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold font-serif text-white tracking-normal">
            Verify Your Email
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 mb-2 leading-relaxed">
            We&apos;ve sent a verification link to your email address. Please verify your account before continuing.
          </p>

          {/* User Email Pill */}
          <div className="my-3 px-3.5 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl inline-block text-xs font-mono text-amber-300 font-bold max-w-full truncate">
            {user?.email || userProfile?.email || 'your-email@uomboni.sc.tz'}
          </div>

          {/* Status Message */}
          <AnimatePresence>
            {(authMessage || resendStatus) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`my-3 p-3 rounded-xl border text-xs text-left flex items-start gap-2 ${
                  authMessage?.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {authMessage?.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>{resendStatus || authMessage?.text}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="space-y-3 mt-6">
            {/* Check Verification */}
            <button
              type="button"
              onClick={handleCheck}
              disabled={checking}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Checking Status...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CHECK VERIFICATION STATUS</span>
                </>
              )}
            </button>

            {/* Resend Email */}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {resending ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending email...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            {/* Continue anyway / bypass if local dev / test */}
            <button
              type="button"
              onClick={() => setActiveView('portal')}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Continue to Portal Dashboard &rarr;
            </button>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-500">
        <p>UOMBONI SECONDARY SCHOOL • Education • Pray • Work</p>
      </footer>
    </div>
  );
};
