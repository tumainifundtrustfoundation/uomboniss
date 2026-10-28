import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../lib/firebase';
import { X, Search, CheckCircle2, User, Shield, GraduationCap, Users, Plus, Mail, BookOpen, Sparkles } from 'lucide-react';
import { TEACHER_AUTH_DIRECTORY } from '../services/teacherAuthDirectory';

export interface GoogleAccountChoice {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isOwner?: boolean;
  department?: string;
  subjects?: string[];
  teacherId?: string;
}

interface GoogleAccountSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string, role: UserRole, teacherId?: string) => void;
  defaultRole?: UserRole;
}

export const GoogleAccountSelectModal: React.FC<GoogleAccountSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  defaultRole = 'teacher',
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'teachers' | 'admin' | 'students_parents'>('teachers');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Comprehensive accounts directory including all Uomboni Secondary School teachers & staff
  const allGoogleAccounts: GoogleAccountChoice[] = useMemo(() => [
    // 1. Mwl. Yohana Bahati (Academic Master & Physics/Maths)
    {
      email: 'yohanabahati665@gmail.com',
      name: 'Mwl. Yohana Bahati',
      role: 'academic_master',
      avatar: '/media/media_3.webp',
      department: 'Sayansi na Utawala',
      subjects: ['Physics', 'Basic Mathematics'],
      teacherId: 'tch-003',
    },
    {
      email: 'yohana.bahati@uombonisec.ac.tz',
      name: 'Mwl. Yohana Bahati (Taaluma)',
      role: 'academic_master',
      avatar: '/media/media_3.webp',
      department: 'Sayansi & Utawala wa Mitihani',
      subjects: ['Physics', 'Basic Mathematics'],
      teacherId: 'tch-003',
    },
    // 2. Mwl. Wolter Temu (Second Master & Kiswahili)
    {
      email: 'wolter.temu@uombonisec.ac.tz',
      name: 'Mwl. Wolter Temu',
      role: 'teacher',
      avatar: '/media/media_2.jpg',
      department: 'Lugha & Utawala',
      subjects: ['Kiswahili'],
      teacherId: 'tch-002',
    },
    // 3. Mwl. Endrew Benson (Biology & Chemistry)
    {
      email: 'endrew.benson@uombonisec.ac.tz',
      name: 'Mwl. Endrew Benson',
      role: 'teacher',
      avatar: '/media/media_5.jpg',
      department: 'Sayansi & Maabara',
      subjects: ['Biology', 'Chemistry'],
      teacherId: 'tch-005',
    },
    // 4. Madam Adela Manyanga (Academic Mistress, Biology & Kiswahili)
    {
      email: 'adela.manyanga@uombonisec.ac.tz',
      name: 'Madam Adela Manyanga',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      department: 'Sayansi & Lugha',
      subjects: ['Biology', 'Kiswahili'],
      teacherId: 'tch-011',
    },
    // 5. Mwl. Peter Kimaro (HOD Languages - English Language)
    {
      email: 'peter.kimaro@uombonisec.ac.tz',
      name: 'Mwl. Peter Kimaro',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      department: 'Lugha (Languages)',
      subjects: ['English Language'],
      teacherId: 'tch-006',
    },
    // 6. Madam Witness (Civics, History, Geography)
    {
      email: 'witness@uombonisec.ac.tz',
      name: 'Madam Witness',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      department: 'Sanaa (Humanities)',
      subjects: ['Civics', 'History', 'Geography'],
      teacherId: 'tch-007',
    },
    // 7. Mwl. Herman (Nidhamu - Chemistry & Mathematics)
    {
      email: 'herman@uombonisec.ac.tz',
      name: 'Mwl. Herman',
      role: 'teacher',
      avatar: '/media/media_4.jpg',
      department: 'Sayansi & Nidhamu',
      subjects: ['Chemistry', 'Basic Mathematics'],
      teacherId: 'tch-004',
    },
    // 8. Mwl. Christopher Mtei (Mathematics & ICT)
    {
      email: 'christopher.mtei@uombonisec.ac.tz',
      name: 'Mwl. Christopher Mtei',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      department: 'Sayansi & Michezo',
      subjects: ['Basic Mathematics'],
      teacherId: 'tch-009',
    },
    // 9. Mwl. Sigbert Minja (Bursar & Commerce)
    {
      email: 'sigminja@gmail.com',
      name: 'Mwl. Sigbert Minja (Mhasibu)',
      role: 'bursar',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      department: 'Biashara & Uhasibu',
      subjects: ['Commerce', 'Bookkeeping'],
      teacherId: 'tch-010',
    },
    // 10. Madam Rosemary Temba (Matron & Religious Education)
    {
      email: 'rosemary.temba@uombonisec.ac.tz',
      name: 'Madam Rosemary Temba',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
      department: 'Utawala & Malezi',
      subjects: ['Religious Education'],
      teacherId: 'tch-008',
    },
    // 11. Br. Adolph Massawe (Headmaster)
    {
      email: 'adolphmassawe@gmail.com',
      name: 'Br. Adolph Massawe (Mkuu wa Shule)',
      role: 'admin',
      avatar: '/media/media_1.webp',
      department: 'Utawala Mkuu',
      subjects: ['Civics', 'Religious Education'],
      teacherId: 'tch-001',
    },
    // 12. Tumaini Fund Trust Foundation
    {
      email: 'tumainifundtrustfoundation@gmail.com',
      name: 'Tumaini Fund Trust Foundation',
      role: 'admin',
      isOwner: true,
      avatar: '/public/assets/aistudio/Uomboni_School_Emblem_Logo_d6e1fa1f.png',
      department: 'Bodi ya Wadhamini',
      subjects: ['All Subjects'],
      teacherId: 'tch-uomboni-admin',
    },
    // 13. Parent & Student quick access
    {
      email: 'mzazi.uomboni@gmail.com',
      name: 'Mzazi / Mlezi (Parent Account)',
      role: 'parent',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      department: 'Wazazi na Walezi',
    },
    {
      email: 'mwanafunzi.uomboni@gmail.com',
      name: 'Mwanafunzi (Student Account)',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      department: 'Kidato cha I - IV',
    },
  ], []);

  const filteredAccounts = useMemo(() => {
    return allGoogleAccounts.filter((acc) => {
      // Category tab filtering
      if (activeTab === 'teachers') {
        if (!['teacher', 'academic_master', 'bursar'].includes(acc.role)) return false;
      } else if (activeTab === 'admin') {
        if (acc.role !== 'admin' && acc.role !== 'academic_master') return false;
      } else if (activeTab === 'students_parents') {
        if (!['student', 'parent'].includes(acc.role)) return false;
      }

      // Query search filtering
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inName = acc.name.toLowerCase().includes(q);
      const inEmail = acc.email.toLowerCase().includes(q);
      const inDept = acc.department?.toLowerCase().includes(q);
      const inSubjects = acc.subjects?.some((s) => s.toLowerCase().includes(q));
      return inName || inEmail || inDept || inSubjects;
    });
  }, [allGoogleAccounts, activeTab, searchQuery]);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const derivedName = customName.trim() || customEmail.split('@')[0].replace('.', ' ');
    onSelectAccount(customEmail.trim().toLowerCase(), derivedName, selectedRole);
  };

  const handleSelect = (acc: GoogleAccountChoice) => {
    if (acc.teacherId) {
      try {
        localStorage.setItem('uomboni_active_teacher_id', acc.teacherId);
        localStorage.setItem('uomboni_selected_teacher_email', acc.email.toLowerCase());
      } catch (e) {}
    }
    onSelectAccount(acc.email, acc.name, acc.role, acc.teacherId);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Google Header bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 p-2 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
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
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{language === 'sw' ? 'Chagua Akaunti ya Mwalimu au Mtumishi' : 'Select Teacher or Staff Account'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'sw'
                  ? 'Kila mwalimu anatambuliwa kwa jina, masomo na majukumu yake'
                  : 'Every teacher is recognized with their personal subjects & role'}
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

        {/* Tab Filters */}
        {!showCustomInput && (
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'sw' ? 'Tafuta mwalimu kwa jina au somo...' : 'Search teacher or subject...'}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              />
            </div>

            {/* Role Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('teachers')}
                className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'teachers'
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                👨‍🏫 Walimu Wote ({allGoogleAccounts.filter(a => ['teacher', 'academic_master', 'bursar'].includes(a.role)).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                👑 Utawala / Mkuu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Orodha Yote
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('students_parents')}
                className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'students_parents'
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                🎓 Wanafunzi/Wazazi
              </button>
            </div>
          </div>
        )}

        {/* Account List */}
        <div className="p-3 sm:p-4 space-y-2.5 overflow-y-auto flex-1">
          {!showCustomInput ? (
            <>
              {filteredAccounts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Hakuna mwalimu aliyepatikana kwa utafutaji &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredAccounts.map((acc) => (
                  <button
                    key={acc.email + acc.name}
                    type="button"
                    onClick={() => handleSelect(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-all text-left group cursor-pointer hover:border-[#102A43]/40 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={acc.avatar || '/media/media_1.webp'}
                          alt={acc.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/media/media_1.webp';
                          }}
                        />
                        {acc.role === 'academic_master' && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px]">
                            ★
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                            {acc.name}
                          </span>
                          {acc.isOwner && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-600 border border-amber-500/30 shrink-0">
                              Owner
                            </span>
                          )}
                          {acc.role === 'academic_master' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 shrink-0">
                              Mtaaluma
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {acc.email}
                        </p>
                        {acc.subjects && acc.subjects.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-medium">Masomo:</span>
                            {acc.subjects.slice(0, 3).map((sub) => (
                              <span
                                key={sub}
                                className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-[#102A43]/10 text-[#102A43] dark:bg-white/10 dark:text-slate-200"
                              >
                                {sub}
                              </span>
                            ))}
                            {acc.subjects.length > 3 && (
                              <span className="text-[9px] text-slate-400 font-semibold">
                                +{acc.subjects.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right ml-2">
                      <span className="inline-block text-[10px] uppercase font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-[#102A43] group-hover:text-white transition-colors">
                        Ingia
                      </span>
                    </div>
                  </button>
                ))
              )}

              {/* Use another Google account button */}
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full mt-2 flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#102A43] dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    {language === 'sw' ? 'Weka barua pepe nyingine ya Google / Gmail' : 'Use another Google / Gmail account'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {language === 'sw' ? 'Ingia na anwani yako binafsi ya barua pepe' : 'Sign in with your personal email address'}
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
                    placeholder="mfano: mwalimu@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'sw' ? 'Jina Kamili la Mwalimu / Mtumishi' : 'Full Name of Teacher / Staff'}
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="mfano: Mwl. Jina Lako"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'sw' ? 'Wajibu / Cheo Kwenye Shule' : 'School Role'}
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                >
                  <option value="teacher">{language === 'sw' ? 'Mwalimu wa Somo (Teacher)' : 'Teacher'}</option>
                  <option value="academic_master">{language === 'sw' ? 'Mtaaluma Mkuu (Academic Master)' : 'Academic Master'}</option>
                  <option value="bursar">{language === 'sw' ? 'Mhasibu (Bursar)' : 'Bursar'}</option>
                  <option value="staff">{language === 'sw' ? 'Mtumishi (Staff)' : 'Staff'}</option>
                  <option value="admin">{language === 'sw' ? 'Mkuu wa Shule / Admin' : 'Headmaster / Admin'}</option>
                  <option value="student">{language === 'sw' ? 'Mwanafunzi (Student)' : 'Student'}</option>
                  <option value="parent">{language === 'sw' ? 'Mzazi / Mlezi (Parent)' : 'Parent'}</option>
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
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#102A43] hover:bg-[#064e3b] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {language === 'sw' ? 'Ingia na Akaunti Hii' : 'Sign In with This'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Policy notice */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>{language === 'sw' ? 'Shule ya Sekondari Uomboni · Lango Salama la Watumishi' : 'Uomboni Secondary School · Secure Staff Portal'}</span>
        </div>
      </div>
    </div>
  );
};
