import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ChevronLeft, KeyRound } from 'lucide-react';
import { SchoolLogo } from '../SchoolLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, loading, authMessage, setAuthMessage, setActiveView } = useAuth();
  const { language } = useLanguage();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError(language === 'sw' ? 'Tafadhali ingiza barua pepe yako.' : 'Please enter your email address.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError(language === 'sw' ? 'Muundo wa barua pepe si sahihi.' : 'Invalid email address format.');
      return;
    }
    setEmailError('');
    setIsSubmitting(true);
    const res = await forgotPassword(email);
    setIsSubmitting(false);
    if (res.success) {
      setSentSuccess(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-700/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-10 w-96 h-96 bg-emerald-600/25 rounded-full blur-3xl" />
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
          <span>{language === 'sw' ? 'Rudi Kuingia (Login)' : 'Back to Sign In'}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <SchoolLogo size="sm" />
          <span className="text-xs font-bold text-white uppercase tracking-wider hidden sm:inline">
            Uomboni Secondary School
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 text-center relative"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
              <KeyRound className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold font-serif text-white tracking-normal">
            Forgot Your Password?
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 mb-6 leading-relaxed">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>

          <AnimatePresence>
            {authMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`mb-5 p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 text-left ${
                  authMessage.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {authMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 font-medium">{authMessage.text}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {sentSuccess ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs sm:text-sm leading-relaxed text-left">
                <p className="font-bold text-emerald-400 mb-1">✓ Reset Email Dispatched</p>
                Please check your inbox (and spam folder) for an email from Uomboni Secondary School with your password reset link.
              </div>

              <button
                type="button"
                onClick={() => {
                  setAuthMessage(null);
                  setActiveView('login');
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-[11px] text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending Instructions...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wide uppercase">SEND RESET LINK</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => {
                setAuthMessage(null);
                setActiveView('login');
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Remembered your password? <span className="text-amber-400 font-bold hover:underline">Sign In</span>
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
