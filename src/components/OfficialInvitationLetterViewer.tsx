import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Share2,
  X,
  User,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import {
  downloadOfficialAdmissionInvitationLetterPdf,
  printOfficialAdmissionInvitationLetter,
} from '../utils/pdfService';

interface OfficialInvitationLetterViewerProps {
  initialParentName?: string;
  initialStudentName?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const OfficialInvitationLetterViewer: React.FC<OfficialInvitationLetterViewerProps> = ({
  initialParentName = '',
  initialStudentName = '',
  isModal = false,
  onClose,
}) => {
  const { language } = useLanguage();
  const [parentName, setParentName] = useState(initialParentName);
  const [studentName, setStudentName] = useState(initialStudentName);
  const [dateStr, setDateStr] = useState(new Date().toLocaleDateString('sw-TZ', { day: '2-digit', month: '2-digit', year: 'numeric' }));
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = () => {
    downloadOfficialAdmissionInvitationLetterPdf({
      parentName: parentName.trim(),
      studentName: studentName.trim(),
      dateStr: dateStr ? `Tarehe: ${dateStr}` : 'Tarehe: _____ / _____ / 2026',
    });
  };

  const handlePrint = () => {
    printOfficialAdmissionInvitationLetter({
      parentName: parentName.trim(),
      studentName: studentName.trim(),
      dateStr: dateStr ? `Tarehe: ${dateStr}` : 'Tarehe: _____ / _____ / 2026',
    });
  };

  const content = (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">
              {language === 'sw' ? 'Barua Rasmi ya Mwaliko wa Kujiunga' : 'Official Admission Invitation Letter'}
            </h4>
            <p className="text-xs text-amber-300">
              Shule ya Sekondari Uomboni • NECTA S0486
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Pakua Barua (PDF)' : 'Download Letter (PDF)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{language === 'sw' ? 'Chapisha' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Parent & Student Input (Optional customization) */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-slate-700 font-bold block mb-1">Jina la Mzazi / Mlezi (Hiari):</label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Mfano: Mhe. Emmanuel Moshi"
            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 focus:ring-1 focus:ring-amber-500 text-xs"
          />
        </div>
        <div>
          <label className="text-slate-700 font-bold block mb-1">Jina la Mwanafunzi (Hiari):</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder={language === 'sw' ? 'Weka jina kamili la mwanafunzi...' : 'Enter student full name...'}
            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 focus:ring-1 focus:ring-amber-500 text-xs"
          />
        </div>
        <div>
          <label className="text-slate-700 font-bold block mb-1">Tarehe ya Barua:</label>
          <input
            type="text"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            placeholder="16/08/2026"
            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
          />
        </div>
      </div>

      {/* OFFICIAL LETTERHEAD PAPER PREVIEW (Exact match to uploaded document) */}
      <div className="bg-white p-6 sm:p-12 rounded-3xl border-2 border-slate-300 shadow-2xl max-w-3xl mx-auto text-slate-900 font-sans relative">
        
        {/* Top Crop Mark corners */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-slate-700" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-slate-700" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-slate-700" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-slate-700" />

        {/* Header Grid */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-3">
          
          {/* Left Title & Motto */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <SchoolLogo size="sm" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight leading-none uppercase">
                  UOMBONI SECONDARY SCHOOL
                </h2>
                <p className="text-xs text-amber-600 font-medium">
                  Marangu, Moshi - Kilimanjaro
                </p>
              </div>
            </div>
            <div className="text-[11px] pt-1">
              <span className="font-bold text-amber-700">MOTTO: TUJIENDELEZE SISI WENYEWE</span>{' '}
              <span className="text-slate-600">(Education • Pray • Work)</span>
            </div>
          </div>

          {/* Right Contacts */}
          <div className="text-right text-[11px] text-amber-600 space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-4">
            <p className="font-mono">+255 782 558 127</p>
            <p className="font-mono">+255 755 238 838</p>
            <p className="font-mono">+255 752 717 191</p>
            <p className="text-amber-700 font-semibold hover:underline">www.uombonisecondary.ac.tz</p>
            <p className="text-amber-700 font-semibold">info@uombonisecondary.ac.tz</p>
          </div>
        </div>

        {/* Center Banner Slogan */}
        <div className="my-4 border-t-2 border-b-2 border-amber-400 py-1.5 text-center">
          <span className="text-base sm:text-lg font-black italic tracking-wide text-slate-900 font-serif">
            Elimu Bora, Maendeleo Yako!
          </span>
        </div>

        {/* Date & Salutation */}
        <div className="space-y-4 text-xs sm:text-sm mt-6">
          <div className="text-right font-medium">
            <span>Tarehe: </span>
            <strong className="underline underline-offset-4 font-mono">{dateStr || '_____ / _____ / 2026'}</strong>
          </div>

          <div>
            <span>Ndugu Mzazi/Mlezi wa, </span>
            <strong className="border-b border-slate-700 pb-0.5 px-2 inline-block min-w-[240px]">
              {parentName || '__________________________________________'}
            </strong>
          </div>

          {/* Subject Heading */}
          <div className="text-center py-2">
            <h3 className="font-black text-sm sm:text-base uppercase tracking-wide inline-block border-b-2 border-slate-900 pb-0.5">
              YAH: MWALIKO WA KUJIUNGA NA UOMBONI SECONDARY SCHOOL
            </h3>
          </div>

          {/* Body */}
          <div className="space-y-4 leading-relaxed text-justify">
            <p>
              Kwa heshima kubwa, uongozi wa Uomboni Secondary School unakutaarifu kuwa mtoto wako,{' '}
              <strong className="border-b border-slate-700 pb-0.5 px-2 inline-block min-w-[200px] text-center text-emerald-950 font-black">
                {studentName || '__________________________'}
              </strong>{' '}
              amefaulu usaili (interview) wa kujiunga na shule yetu.
            </p>

            <p>
              Tunamkaribisha kujiunga na familia ya Uomboni Sekondari ili kupata elimu bora, mazingira mazuri ya kujifunzia, nidhamu, maadili na maendeleo ya kitaaluma.
            </p>

            {/* Faida za Kujiunga Nasi */}
            <div className="pt-2">
              <h4 className="font-bold text-xs sm:text-sm mb-2 text-slate-950">
                Faida za Kujiunga Nasi:
              </h4>

              <div className="border border-slate-400 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-400">
                  <div className="p-3 space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block" />
                      <span>Walimu wenye sifa na uzoefu</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block" />
                      <span>Maabara na vifaa vya kisasa</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block" />
                      <span>Nidhamu na maadili mema</span>
                    </p>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block" />
                      <span>Mazingira bora ya kujifunzia</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block" />
                      <span>Maktaba na huduma za TEHAMA</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block" />
                      <span>Michezo na shughuli za maendeleo</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p>
              Tafadhali fika shuleni kwa ajili ya kukamilisha usajili na kupata maelekezo muhimu ya masomo.
            </p>

            <p>
              Tunakupongeza kwa mafanikio ya mtoto wako na tunatarajia ushirikiano wako. Karibu sana Uomboni Secondary School.
            </p>
          </div>

          {/* Signature and Stamp */}
          <div className="pt-8 flex flex-col sm:flex-row items-end justify-between gap-6">
            <div className="space-y-1 text-xs">
              <p>(Sahihi) __________________________</p>
              <p className="font-black text-sm uppercase text-slate-900">BR. ADOLPH MASSAWE</p>
              <p className="font-bold text-xs uppercase text-slate-700">MKUU WA SHULE</p>
              <p className="text-[11px] text-slate-500">Shule ya Sekondari Uomboni</p>
            </div>

            {/* Official Stamp Box */}
            <div className="border border-slate-400 p-4 rounded-xl text-center min-w-[200px] text-slate-400 text-xs">
              <span className="font-bold block uppercase text-[11px] text-slate-500">MUHURI WA SHULE</span>
              <span className="text-[10px] block mt-0.5">(Official Stamp)</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="bg-slate-100 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
          <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <SchoolLogo size="sm" />
              <span className="font-black text-sm text-white">
                {language === 'sw' ? 'Barua Rasmi ya Mwaliko (Admission Letter)' : 'Official Invitation Letter'}
              </span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
};
