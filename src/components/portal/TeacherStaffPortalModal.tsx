import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Search,
  Clock,
} from 'lucide-react';
import { SchoolLogo } from '../SchoolLogo';
import {
  verifyTeacherIndividualLogin,
  changeTeacherPinWithVerification,
  getTeacherLockoutStatus,
} from '../../services/teacherAuthDirectory';
import { ProfessionalStaffDashboard } from './ProfessionalStaffDashboard';

interface TeacherStaffPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPortal?: () => void;
  onOpenBursarPortal?: () => void;
  onOpenStaffGate?: () => void;
  onOpenAcademicPortal?: () => void;
}

export const TeacherStaffPortalModal: React.FC<TeacherStaffPortalModalProps> = ({
  isOpen,
  onClose,
  onOpenAcademicPortal,
}) => {
  const { language } = useLanguage();
  const { teachers } = useData();
  const { userProfile, user, setActiveView } = useAuth();

  // Teacher Identity State
  const [authenticatedTeacher, setAuthenticatedTeacher] = useState<any | null>(null);

  // Auto-connect logged in teacher or admin from AuthContext without forcing duplicate PIN login
  useEffect(() => {
    if (userProfile && ['teacher', 'staff', 'admin', 'academic_master'].includes(userProfile.role)) {
      const savedTeacherId = typeof window !== 'undefined' ? localStorage.getItem('uomboni_active_teacher_id') : null;
      const match =
        (savedTeacherId && (teachers || []).find((t: any) => t.id === savedTeacherId)) ||
        (teachers || []).find(
          (t: any) =>
            (user?.email && t.email?.toLowerCase() === user.email.toLowerCase()) ||
            (userProfile.email && t.email?.toLowerCase() === userProfile.email.toLowerCase()) ||
            (userProfile.fullName && (
              t.name.toLowerCase().includes(userProfile.fullName.toLowerCase()) ||
              userProfile.fullName.toLowerCase().includes(t.name.toLowerCase())
            ))
        ) ||
        (teachers || []).find((t: any) => t.id === 'tch-003') ||
        (teachers && teachers.length > 0 ? teachers[0] : null);

      if (match) {
        setAuthenticatedTeacher({
          ...match,
          subjects: match.subjects || ['Chemistry', 'Basic Mathematics'],
        });
      }
    }
  }, [userProfile, user, teachers]);

  const [selectedLoginTeacherId, setSelectedLoginTeacherId] = useState<string>(() => {
    return teachers && teachers.length > 0 ? teachers[0].id : 'tch-004';
  });
  const [teacherPinInput, setTeacherPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Handle PIN verification
  const handleTeacherLogin = () => {
    if (!teacherPinInput.trim()) {
      setPinError(language === 'sw' ? 'Tafadhali weka PIN ya siri' : 'Please enter your secret PIN');
      return;
    }

    const lockout = getTeacherLockoutStatus(selectedLoginTeacherId);
    if (lockout.isLocked) {
      setLockoutRemaining(lockout.lockTimeRemainingSeconds);
      setPinError(`Akaunti imefungwa kwa sekunde ${lockout.lockTimeRemainingSeconds}`);
      return;
    }

    const verification = verifyTeacherIndividualLogin(selectedLoginTeacherId, teacherPinInput.trim());

    if (verification.success && verification.teacher) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('uomboni_active_teacher_id', verification.teacher.id);
      }
      setAuthenticatedTeacher({
        id: verification.teacher.id,
        name: verification.teacher.name,
        role: verification.teacher.role,
        department: verification.teacher.department,
        email: verification.teacher.email,
        phone: verification.teacher.phone,
        subjects: verification.teacher.assignedSubjects || ['Chemistry', 'Basic Mathematics'],
      });
      setPinError('');
      setTeacherPinInput('');
    } else {
      setPinError(language === 'sw' ? (verification.errorSw || verification.error || 'PIN si sahihi') : (verification.error || 'Invalid PIN'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102A43]/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#F8FAFC] rounded-3xl shadow-2xl w-full max-w-7xl max-h-[94vh] flex flex-col border border-slate-200 overflow-hidden text-[#102A43]">
        {/* If user is authenticated, render the professional staff dashboard */}
        {authenticatedTeacher || (user && userProfile && ['teacher', 'admin', 'academic_master', 'staff'].includes(userProfile.role)) ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <ProfessionalStaffDashboard
              onClose={() => {
                setAuthenticatedTeacher(null);
                onClose();
              }}
              onOpenAcademicMasterPortal={onOpenAcademicPortal}
              isModal={true}
              initialTeacherId={authenticatedTeacher?.id}
            />
          </div>
        ) : (
          /* Secure Login Gate for unauthenticated guests trying to enter Staffroom */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#FFFFF0] flex items-center justify-center">
            <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#102A43] text-[#C9A227] flex items-center justify-center shadow-xs">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#102A43]">
                      Lango la Watumishi (Staff Portal)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Uomboni Secondary School (NECTA S0486)
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Select Faculty Member */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#102A43] uppercase tracking-wider block">
                  1. Chagua Jina Lako la Ualimu:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    placeholder="Tafuta jina lako la mwalimu..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#102A43] focus:outline-none focus:border-[#102A43]"
                  />
                </div>

                <select
                  value={selectedLoginTeacherId}
                  onChange={(e) => {
                    setSelectedLoginTeacherId(e.target.value);
                    setPinError('');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
                >
                  {(teachers || [])
                    .filter((t: any) => !facultySearch || t.name.toLowerCase().includes(facultySearch.toLowerCase()))
                    .map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {t.role}
                      </option>
                    ))}
                </select>
              </div>

              {/* Step 2: Secret PIN Entry */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#102A43] uppercase tracking-wider block">
                  2. Weka PIN Yako ya Siri ya Mwalimu:
                </label>

                {lockoutRemaining > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Akaunti imefungwa kwa muda ({lockoutRemaining}s). Subiri kidogo.</span>
                  </div>
                )}

                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={teacherPinInput}
                    disabled={lockoutRemaining > 0}
                    onChange={(e) => setTeacherPinInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTeacherLogin();
                    }}
                    placeholder="Weka tarakimu 4 za PIN..."
                    className="w-full px-4 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {pinError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}
              </div>

              {/* Login Button */}
              <button
                type="button"
                onClick={handleTeacherLogin}
                disabled={lockoutRemaining > 0}
                className="w-full py-3 bg-[#102A43] hover:bg-[#0A1C2E] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>Thibitisha &amp; Ingia kwenye Staff Portal</span>
                <ArrowRight className="w-4 h-4 text-[#C9A227]" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveView('login');
                  }}
                  className="text-xs text-[#064e3b] hover:text-[#102A43] font-bold underline transition cursor-pointer"
                >
                  Au ingia kwa Username &amp; Nenosiri (Full Staff Login Page) →
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ulinzi wa Alama za Mitihani (RBAC)</span>
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="hover:underline font-bold text-slate-600 cursor-pointer"
                >
                  Rudi Mwanzo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
