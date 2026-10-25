import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ChevronLeft, KeyRound, ShieldCheck } from 'lucide-react';
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
    const res = await forgotPassword(email.trim());
    setIsSubmitting(false);
    if (res.success) {
      setSentSuccess(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFF0] flex flex-col justify-between selection:bg-[#102A43] selection:text-white font-sans">
      {/* Top Header */}
      <header className="w-full bg-[#102A43] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b-2 border-[#C9A227] shadow-md">
        <button
          type="button"
          onClick={() => {
            setAuthMessage(null);
            setActiveView('login');
          }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#FFFFF0] transition-colors cursor-pointer border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
        >
          <ChevronLeft className="w-4 h-4 text-[#C9A227]" />
          <span>{language === 'sw' ? 'Rudi Kuingia (Login)' : 'Back to Login'}</span>
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

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white border-2 border-[#102A43]/15 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 text-center relative">
          
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#064e3b] shadow-xs">
            <KeyRound className="w-7 h-7 text-[#064e3b]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#102A43] tracking-tight">
            {language === 'sw' ? 'Kurejesha Nenosiri' : 'Recover Password'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
            {language === 'sw'
              ? 'Weka barua pepe yako iliyosajiliwa kwenye mfumo wa shule ili kupokea kiungo cha kurejesha nenosiri lako.'
              : 'Enter your registered school email address to receive password reset instructions.'}
          </p>

          {authMessage && (
            <div
              className={`mb-5 p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 text-left ${
                authMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              {authMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <span className="font-semibold leading-relaxed">{authMessage.text}</span>
            </div>
          )}

          {emailError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold text-left">
              {emailError}
            </div>
          )}

          {sentSuccess ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs text-left">
                <p className="font-bold mb-1">
                  {language === 'sw' ? '✅ Kiungo cha Kurejesha Kimeagizwa!' : '✅ Reset Instructions Dispatched!'}
                </p>
                <p className="leading-relaxed">
                  {language === 'sw'
                    ? 'Ikiwa barua pepe hiyo ipo kwenye mfumo, maelekezo ya kurejesha nenosiri yametumwa kwa usalama. Tafadhali fungua kikasha chako cha barua pepe.'
                    : 'If that email address exists in our system, recovery instructions have been sent securely. Please check your inbox.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAuthMessage(null);
                  setActiveView('login');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#102A43] hover:bg-[#064e3b] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                {language === 'sw' ? 'Rudi Kwenye Ukurasa wa Kuingia' : 'Return to Login Page'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-bold text-[#102A43] mb-1.5">
                  {language === 'sw' ? 'Barua Pepe (Email Address)' : 'Email Address'} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mwl@uombonisec.ac.tz"
                    disabled={isSubmitting}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-[#102A43] placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#102A43] transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#102A43] hover:bg-[#064e3b] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" />
                    <span>{language === 'sw' ? 'Inatuma kiungo...' : 'Sending link...'}</span>
                  </>
                ) : (
                  <span>{language === 'sw' ? 'Tuma Kiungo cha Kurejesha' : 'Send Reset Link'}</span>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setAuthMessage(null);
                setActiveView('login');
              }}
              className="text-xs text-[#064e3b] hover:text-[#102A43] font-bold underline transition-colors cursor-pointer"
            >
              {language === 'sw' ? '← Kumbuka Nenosiri? Ingia Sasa' : '← Remember Password? Sign In'}
            </button>
          </div>

        </div>
      </main>

      {/* Official Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-600 font-semibold bg-white border-t border-slate-200">
        &copy; 2026 Uomboni Secondary School · Marangu, Moshi, Kilimanjaro · NECTA Centre S0486
      </footer>
    </div>
  );
};
