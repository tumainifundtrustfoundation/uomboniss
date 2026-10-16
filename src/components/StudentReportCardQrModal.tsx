import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StudentResult } from '../types';
import {
  generateReportCardQrDataUrl,
  getReportCardDirectUrl,
  downloadQrCodeImage,
  printStudentQrVerificationSlip,
} from '../utils/qrCodeService';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  X,
  Share2,
  Sparkles,
  Smartphone,
  School,
  FileText
} from 'lucide-react';

interface StudentReportCardQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentResult | null;
  onOpenReportCard?: (student: StudentResult) => void;
}

export const StudentReportCardQrModal: React.FC<StudentReportCardQrModalProps> = ({
  isOpen,
  onClose,
  student,
  onOpenReportCard,
}) => {
  const { language } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [directUrl, setDirectUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !student) return;

    let isMounted = true;
    setLoading(true);

    const url = getReportCardDirectUrl(student.examNumber);
    setDirectUrl(url);

    generateReportCardQrDataUrl(url, {
      darkColor: '#064e3b', // Uomboni Dark Catholic Emerald
      lightColor: '#ffffff',
      width: 400,
    }).then((dataUrl) => {
      if (isMounted) {
        setQrDataUrl(dataUrl);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const cleanExam = student.examNumber.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanName = student.studentName.replace(/[^a-zA-Z0-9]/g, '_');
    downloadQrCodeImage(qrDataUrl, `QR_Ripoti_Uomboni_${cleanExam}_${cleanName}.png`);
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    printStudentQrVerificationSlip(student, qrDataUrl);
  };

  const handleShareWhatsApp = () => {
    const text = language === 'sw'
      ? `Tazama ripoti rasmi ya matokeo ya kidijitali ya mwanafunzi ${student.studentName} (${student.examNumber}) ya Shule ya Sekondari Uomboni hapa: ${directUrl}`
      : `View official digital report card for ${student.studentName} (${student.examNumber}) from Uomboni Secondary School here: ${directUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-lg rounded-3xl border border-emerald-800/30 shadow-2xl overflow-hidden my-auto"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Funga (Close)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold block">
                {language === 'sw' ? 'HATI YA KIDIJITALI YA UOMBONI' : 'UOMBONI DIGITAL CREDENTIAL'}
              </span>
              <h3 className="text-lg font-black text-white leading-snug">
                {language === 'sw' ? 'QR Code ya Ripoti ya Matokeo' : 'Report Card Quick Access QR Code'}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Student Profile Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="font-black text-sm text-slate-900">{student.studentName}</h4>
              <p className="text-xs text-emerald-800 font-mono font-bold">
                NECTA: {student.examNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                {student.form} ({student.stream}) • {student.examType} ({student.year})
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300 shadow-2xs">
                {student.division} ({student.points} Pts)
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Wastani: {student.averageMarks}%
              </p>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 bg-radial from-emerald-50/50 via-white to-slate-50 rounded-2xl border-2 border-dashed border-emerald-300 relative group">
            {loading ? (
              <div className="w-52 h-52 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">
                  {language === 'sw' ? 'Inazalisha QR Code...' : 'Generating QR Code...'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow relative">
                  <img
                    src={qrDataUrl}
                    alt={`QR Code ya ${student.studentName}`}
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain block rounded-lg"
                  />
                  {/* Central branding dot/badge overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-full bg-white border-2 border-emerald-700 shadow-md flex items-center justify-center">
                      <School className="w-4 h-4 text-emerald-800" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {language === 'sw'
                      ? 'Imethibitishwa na Mfumo Rasmi wa Uomboni (NECTA S0486)'
                      : 'Authentic & Verified Uomboni Credential (NECTA S0486)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Direct Link Box with Copy Button */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>{language === 'sw' ? 'Kiungo cha Moja kwa Moja cha Ripoti:' : 'Direct Report Card URL:'}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {language === 'sw' ? 'Hufungua ripoti bila kupitia hatua nyingi' : 'Opens report card instantly'}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 truncate select-all">
                {directUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'sw' ? 'Imenakiliwa!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{language === 'sw' ? 'Nakili' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Grid Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={handleDownload}
              disabled={loading || !qrDataUrl}
              className="px-3 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'sw' ? 'Pakua Picha (PNG)' : 'Download PNG'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={loading || !qrDataUrl}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{language === 'sw' ? 'Chapisha Kadi' : 'Print QR Pass'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>{language === 'sw' ? 'Tuma WhatsApp' : 'WhatsApp'}</span>
            </button>
          </div>

          {/* Live Open Action */}
          {onOpenReportCard && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {language === 'sw'
                  ? 'Unataka kuona ripoti kamili ya karatasi au PDF?'
                  : 'Want to view full paper format or official PDF?'}
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenReportCard(student);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'sw' ? 'Fungua Ripoti Kamili' : 'Open Full Report'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
