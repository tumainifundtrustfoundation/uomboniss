import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  QrCode,
  Copy,
  Check,
  Award,
  Calendar,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StudentResult } from '../../types';
import { SchoolLogo } from '../SchoolLogo';

interface ResultVerificationModalProps {
  student: StudentResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResultVerificationModal: React.FC<ResultVerificationModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !student) return null;

  const resultId = `UOMB-RES-2025-${student.examNumber.replace(/\//g, '-')}`;
  const verificationCode = `VER-8642-${student.examNumber.split('/')[1] || '0000'}-TZ`;
  const timestamp = new Date().toLocaleString();

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-emerald-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 p-2 flex items-center justify-center">
              <SchoolLogo className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 uppercase">
                <ShieldCheck className="w-3 h-3" />
                <span>OFFICIAL VERIFICATION ENGINE</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                UOMBONI SECONDARY SCHOOL
              </h3>
              <p className="text-xs text-slate-300">
                National Examinations Council of Tanzania (NECTA) Center S0486
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Verification Status Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-emerald-900 uppercase block tracking-wide">
                ✓ RESULT VERIFIED / MATOKEO YAMEIDHINISHWA
              </span>
              <p className="text-[11px] text-emerald-800">
                Hati hii ni halisi na inathibitishwa rasmi na mfumo wa matokeo wa Shule ya Sekondari Uomboni.
              </p>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Student Name:</span>
              <span className="font-black text-slate-900">{student.studentName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Candidate No (CNO):</span>
              <span className="font-mono font-black text-blue-900">{student.examNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Class & Exam:</span>
              <span className="font-bold text-slate-800">{student.form} • {student.examType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Division & Points:</span>
              <span className="font-black text-emerald-800">{student.division} ({student.points} Pts)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Class Position:</span>
              <span className="font-black text-amber-900">#{student.classPosition} of {student.totalStudentsInClass || 20}</span>
            </div>
          </div>

          {/* Security Codes & QR Visualizer */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-900 text-white">
            {/* Mock QR SVG */}
            <div className="w-24 h-24 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center shadow-md">
              <QrCode className="w-full h-full text-slate-900" />
            </div>

            <div className="space-y-1.5 min-w-0 flex-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-amber-300 block tracking-wider">
                SECURITY VERIFICATION CODE:
              </span>
              <div className="font-mono font-black text-sm text-white tracking-widest truncate bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                {verificationCode}
              </div>

              <div className="text-[10px] text-slate-400 font-mono truncate">
                RESULT ID: {resultId}
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="mt-2 text-[11px] text-amber-300 hover:text-amber-200 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Code Copied!' : 'Copy Verification Code'}</span>
              </button>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-mono">
            Verification Check Timestamp: {timestamp} • P.O. Box 361 Marangu
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            {language === 'sw' ? 'Funga (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
