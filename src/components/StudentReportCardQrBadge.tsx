import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StudentResult } from '../types';
import {
  generateReportCardQrDataUrl,
  getReportCardDirectUrl,
  downloadQrCodeImage,
} from '../utils/qrCodeService';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Maximize2,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface StudentReportCardQrBadgeProps {
  student: StudentResult;
  onEnlarge?: () => void;
  compact?: boolean;
}

export const StudentReportCardQrBadge: React.FC<StudentReportCardQrBadgeProps> = ({
  student,
  onEnlarge,
  compact = false,
}) => {
  const { language } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const url = getReportCardDirectUrl(student.examNumber);

    generateReportCardQrDataUrl(url, {
      darkColor: '#064e3b',
      lightColor: '#ffffff',
      width: 260,
    }).then((res) => {
      if (isMounted) setQrDataUrl(res);
    });

    return () => {
      isMounted = false;
    };
  }, [student.examNumber]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getReportCardDirectUrl(student.examNumber);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!qrDataUrl) return;
    const cleanExam = student.examNumber.replace(/[^a-zA-Z0-9]/g, '_');
    downloadQrCodeImage(qrDataUrl, `QR_Uomboni_${cleanExam}.png`);
  };

  if (compact) {
    return (
      <div
        onClick={onEnlarge}
        className="group relative cursor-pointer bg-white p-2 rounded-xl border border-emerald-300 shadow-2xs hover:shadow-md transition-all flex items-center gap-3"
        title={language === 'sw' ? 'Bonyeza kuona QR Code kamili' : 'Click to view full QR Code'}
      >
        <div className="w-12 h-12 bg-white rounded-lg p-0.5 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
          ) : (
            <QrCode className="w-6 h-6 text-emerald-800" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-emerald-900 block truncate">
            {language === 'sw' ? 'Digital Report QR' : 'Digital Report QR'}
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">
            {student.examNumber}
          </span>
        </div>
        <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors shrink-0" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-emerald-500/30 shadow-lg space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-emerald-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-black text-white">
              {language === 'sw' ? 'QR Code ya Ripoti ya Kidijitali' : 'Digital Report Card QR Pass'}
            </h5>
            <span className="text-[10px] text-amber-300 font-mono">
              NECTA: {student.examNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-slate-200 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1"
            title="Copy direct link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-slate-200 hover:text-white transition-colors cursor-pointer text-[10px]"
            title="Download QR code image"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          {onEnlarge && (
            <button
              onClick={onEnlarge}
              className="p-1.5 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
              title="Enlarge QR Code"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div
          onClick={onEnlarge}
          className="bg-white p-2.5 rounded-xl shadow-md cursor-pointer hover:scale-102 transition-transform shrink-0 border-2 border-amber-400/80"
        >
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code - ${student.studentName}`}
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {language === 'sw'
              ? 'Changanua (scan) kwa kamera ya simu kufungua mara moja ripoti rasmi ya matokeo ya mtoto wako popote ulipo.'
              : 'Scan with your mobile camera to instantly access and verify official academic report card from anywhere.'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/90 text-emerald-300 font-bold border border-emerald-700">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>{language === 'sw' ? 'Imethibitishwa S0486' : 'Verified S0486'}</span>
            </span>
            {onEnlarge && (
              <button
                onClick={onEnlarge}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                {language === 'sw' ? 'Kuza & Chapisha Kadi' : 'Enlarge & Print Pass'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
