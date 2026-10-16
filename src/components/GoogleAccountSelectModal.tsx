import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../lib/firebase';
import { X, CheckCircle2, User, Shield, GraduationCap, Users, Plus, Mail } from 'lucide-react';

export interface GoogleAccountChoice {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isOwner?: boolean;
}

interface GoogleAccountSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string, role: UserRole) => void;
  defaultRole?: UserRole;
}

export const GoogleAccountSelectModal: React.FC<GoogleAccountSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  defaultRole = 'admin',
}) => {
  const { language } = useLanguage();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  // Preset Google Accounts available to choose from
  const savedGoogleAccounts: GoogleAccountChoice[] = [
    {
      email: 'yohanabahati665@gmail.com',
      name: 'Mwl. Yohana Bahati (Academic Master & Admin)',
      role: 'admin',
      isOwner: true,
      avatar: '/media/media_3.webp',
    },
    {
      email: 'tumainifundtrustfoundation@gmail.com',
      name: 'Tumaini Fund Trust Foundation (Owner)',
      role: 'admin',
      isOwner: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      email: 'adolphmassawe@gmail.com',
      name: 'Br. Adolph Massawe (Mkuu wa Shule)',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    {
      email: 'uombonisecondary@gmail.com',
      name: 'Uomboni Secondary School Official',
      role: 'staff',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    },
    {
      email: 'parent.uomboni@gmail.com',
      name: 'Mzazi / Mlezi (Parent Account)',
      role: 'parent',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    },
    {
      email: 'student.uomboni@gmail.com',
      name: 'Mwanafunzi (Student Account)',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const derivedName = customName.trim() || customEmail.split('@')[0].replace('.', ' ');
    onSelectAccount(customEmail.trim().toLowerCase(), derivedName, selectedRole);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Google Header bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 p-1.5 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center">
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
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'sw' ? 'Chagua Akaunti ya Google' : 'Choose a Google Account'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'sw'
                  ? 'Ili kuendelea na Shule ya Sekondari Uomboni'
                  : 'to continue to Uomboni Secondary School'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account List */}
        <div className="p-4 sm:p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {!showCustomInput ? (
            <>
              {savedGoogleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => onSelectAccount(acc.email, acc.name, acc.role)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/80 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {acc.name}
                        </span>
                        {acc.isOwner && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {acc.email}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 ml-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {acc.role}
                  </span>
                </button>
              ))}

              {/* Use another Google account button */}
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full mt-3 flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    {language === 'sw' ? 'Tumia barua pepe nyingine ya Google' : 'Use another Google account'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'sw' ? 'Weka anwani yako ya Gmail' : 'Enter your custom Gmail address'}
                  </p>
                </div>
              </button>
            </>
          ) : (
            /* Custom Email Input View */
            <form onSubmit={handleCustomSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'sw' ? 'Anwani ya Barua Pepe ya Google' : 'Google Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="mfano@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'sw' ? 'Jina Kamili (Hiari)' : 'Full Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Jina lako kamili"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'sw' ? 'Wajibu / Cheo Kwenye Shule' : 'School Role'}
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="student">{language === 'sw' ? 'Mwanafunzi (Student)' : 'Student'}</option>
                  <option value="parent">{language === 'sw' ? 'Mzazi / Mlezi (Parent)' : 'Parent'}</option>
                  <option value="teacher">{language === 'sw' ? 'Mwalimu (Teacher)' : 'Teacher'}</option>
                  <option value="staff">{language === 'sw' ? 'Mtumishi (Staff)' : 'Staff'}</option>
                  <option value="academic_master">{language === 'sw' ? 'Mtaaluma (Academic Master)' : 'Academic Master'}</option>
                  <option value="bursar">{language === 'sw' ? 'Mhasibu (Bursar)' : 'Bursar'}</option>
                  <option value="admin">{language === 'sw' ? 'Mkuu wa Shule / Admin' : 'Headmaster / Admin'}</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {language === 'sw' ? 'Rudi Nyuma' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {language === 'sw' ? 'Ingia na Hii' : 'Sign In with This'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Policy notice */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>{language === 'sw' ? 'Kuingia kunathibitisha kukubali' : 'By signing in you agree to our'}{' '}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline">
            Privacy Policy & Terms
          </span>
        </div>
      </div>
    </div>
  );
};
