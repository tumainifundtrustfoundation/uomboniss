import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Phone,
  Copy,
  MapPin,
  Calendar,
  AlertCircle,
  Share2,
  X,
  CreditCard,
  Building,
  Check,
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { OFFICIAL_JOINING_INSTRUCTIONS_2027 } from '../data/officialJoiningInstructions2027Data';
import {
  downloadOfficialJoiningInstructions2027Pdf,
  printOfficialJoiningInstructions2027Directly,
} from '../utils/pdfService';

interface OfficialJoiningInstructions2027ViewerProps {
  initialParentName?: string;
  initialStudentName?: string;
  initialForm?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const OfficialJoiningInstructions2027Viewer: React.FC<OfficialJoiningInstructions2027ViewerProps> = ({
  initialParentName = '',
  initialStudentName = '',
  initialForm = '',
  isModal = false,
  onClose,
}) => {
  const { language } = useLanguage();
  const [parentName, setParentName] = useState(initialParentName);
  const [studentName, setStudentName] = useState(initialStudentName);
  const [formLevel, setFormLevel] = useState(initialForm);
  const [activePageTab, setActivePageTab] = useState<'both' | 'page1' | 'page2'>('both');
  const [copiedBankAcc, setCopiedBankAcc] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedBankAcc(label);
    setTimeout(() => setCopiedBankAcc(null), 2500);
  };

  const handleDownload = () => {
    downloadOfficialJoiningInstructions2027Pdf({
      parentName: parentName.trim(),
      studentName: studentName.trim(),
      formLevel: formLevel.trim(),
    });
  };

  const handlePrint = () => {
    printOfficialJoiningInstructions2027Directly({
      parentName: parentName.trim(),
      studentName: studentName.trim(),
      formLevel: formLevel.trim(),
    });
  };

  const info = OFFICIAL_JOINING_INSTRUCTIONS_2027;

  const content = (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Top Controls Banner */}
      <div className="bg-[#102A43] text-white p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg border border-[#C9A227]/30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                MWAKA 2027
              </span>
              <span className="text-[10px] text-emerald-300 font-medium hidden sm:inline-block">
                Tarehe ya Kuripoti: 07/01/2027
              </span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-white mt-0.5">
              Fomu Rasmi ya Kujiunga na Shule 2027 (Joining Instructions)
            </h3>
            <p className="text-xs text-slate-300">
              Shule ya Sekondari Uomboni • Jimbo Katoliki Moshi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:inline-flex bg-white/10 p-1 rounded-xl border border-white/15 gap-1">
            <button
              onClick={() => setActivePageTab('both')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePageTab === 'both' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-200 hover:text-white'
              }`}
            >
              Kurasa Zote (1 &amp; 2)
            </button>
            <button
              onClick={() => setActivePageTab('page1')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePageTab === 'page1' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-200 hover:text-white'
              }`}
            >
              Ukurasa 1
            </button>
            <button
              onClick={() => setActivePageTab('page2')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePageTab === 'page2' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-200 hover:text-white'
              }`}
            >
              Ukurasa 2
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pakua Fomu Kamili (PDF)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Chapisha</span>
          </button>
        </div>
      </div>

      {/* Interactive Customization Bar for Parents (Optional) */}
      <div className="p-4 bg-amber-50/80 border border-amber-300/80 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-slate-700 font-bold block mb-1">Jina la Mzazi / Mlezi (Hiari):</label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Jaza jina la mzazi..."
            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 focus:ring-1 focus:ring-amber-500 text-xs"
          />
        </div>
        <div>
          <label className="text-slate-700 font-bold block mb-1">Jina la Mwanafunzi (Hiari):</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Jaza jina la mwanafunzi..."
            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 focus:ring-1 focus:ring-amber-500 text-xs"
          />
        </div>
        <div>
          <label className="text-slate-700 font-bold block mb-1">Kidato Anachojiunga:</label>
          <input
            type="text"
            value={formLevel}
            onChange={(e) => setFormLevel(e.target.value)}
            placeholder="Mfano: Kwanza (Form 1)"
            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 focus:ring-1 focus:ring-amber-500 text-xs font-mono"
          />
        </div>
      </div>

      {/* Quick Bank Accounts Strip (As shown on page 2) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900 uppercase">
              Akaunti Rasmi za Benki (Malipo Yote ya Ada &amp; Sare):
            </span>
          </div>
          <span className="text-[11px] font-medium text-rose-600 font-mono">
            * Hatupokei fedha taslimu shuleni
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {info.bankAccounts.map((b) => (
            <div
              key={b.bankName}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 hover:bg-slate-100/80 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">{b.bankName}</span>
                <span className="font-mono font-black text-sm text-[#102A43] tracking-wide block">{b.accountNumber}</span>
                <span className="text-[10px] text-slate-600">{b.accountName}</span>
              </div>
              <button
                onClick={() => copyToClipboard(b.accountNumber, b.bankName)}
                className="p-2 rounded-lg bg-white border border-slate-300 hover:border-[#102A43] text-slate-700 hover:text-[#102A43] transition-colors cursor-pointer shrink-0"
                title={`Nakili namba ya ${b.bankName}`}
              >
                {copiedBankAcc === b.bankName ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
         DOCUMENT PAPER SHEET (EXACT VISUAL REPLICA OF THE 2 UPLOADED PAGES)
         ========================================================================= */}
      <div className="space-y-8">
        
        {/* PAGE 1 REPLICA (IMG_20261009_123704_762.jpg) */}
        {(activePageTab === 'both' || activePageTab === 'page1') && (
          <div className="bg-white p-6 sm:p-12 rounded-3xl border-2 border-slate-300 shadow-xl max-w-4xl mx-auto font-sans relative overflow-hidden">
            {/* Page 1 Badge */}
            <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono font-bold border border-slate-200">
              Ukurasa 1 wa 2
            </div>

            {/* Header: Diocesan & School Logos + Institution Title */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
              <div className="shrink-0 p-1">
                <SchoolLogo size="md" />
              </div>

              <div className="text-center space-y-0.5 flex-1 px-3">
                <h2 className="font-serif text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                  JIMBO KATOLIKI MOSHI
                </h2>
                <h3 className="font-sans text-sm sm:text-base font-bold text-slate-800 uppercase tracking-tight">
                  SHULE YA SEKONDARI UOMBONI
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  S.L.P 361
                </p>
                <p className="text-xs font-bold text-slate-800 uppercase">
                  MARANGU- KILIMANJARO
                </p>
              </div>

              <div className="shrink-0 p-1">
                <SchoolLogo size="md" />
              </div>
            </div>

            {/* Contacts Sub-header */}
            <div className="pt-3 pb-3 border-b border-slate-200 text-xs sm:text-sm font-sans space-y-1">
              <div className="font-bold text-slate-900 tracking-wide uppercase text-[11px] text-amber-700">
                MAWASILIANO:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-slate-800">
                <div>
                  <span className="font-bold">MKUU WA SHULE:</span>{' '}
                  <span className="font-mono">{info.contacts.headmaster}</span>
                </div>
                <div>
                  <span className="font-bold">MAKAMU MKUU WA SHULE:</span>{' '}
                  <span className="font-mono">{info.contacts.deputyHeadmaster}</span>
                </div>
                <div>
                  <span className="font-bold">MHASIBU:</span>{' '}
                  <span className="font-mono">{info.contacts.bursar}</span>
                </div>
              </div>
            </div>

            {/* Recipient Parent / Guardian Line */}
            <div className="pt-4 text-xs sm:text-sm">
              <span className="font-bold">MZAZI/MLEZI WA </span>
              <strong className="border-b-2 border-dotted border-slate-600 pb-0.5 px-2 inline-block min-w-[280px] sm:min-w-[420px] text-slate-900 font-semibold">
                {parentName ? `${parentName} (wa ${studentName || 'Mwanafunzi'})` : '..................................................................................................................'}
              </strong>
            </div>

            {/* Subject Title */}
            <div className="text-center py-4 my-2 border-t border-b border-slate-300">
              <h3 className="font-serif text-base sm:text-xl font-black text-slate-900 uppercase tracking-wide">
                YAH: FOMU YA KUJIUNGA NA SHULE 2027
              </h3>
            </div>

            {/* Section A: Selection & Reporting date */}
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify text-slate-800">
              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 uppercase text-xs">
                  MAELEKEZO;
                </div>
                <p>
                  <strong>A. </strong>
                  Napenda kukujulisha kuwa mwanao{' '}
                  <strong className="border-b border-slate-700 px-1 font-black text-emerald-950">
                    {studentName || '...........................................'}
                  </strong>{' '}
                  amechaguliwa kujiunga na Shule ya Sekondari Uomboni, kidato cha{' '}
                  <strong className="border-b border-slate-700 px-1 font-black text-emerald-950">
                    {formLevel || '...................'}
                  </strong>{' '}
                  mwaka 2027. Shule itafunguliwa tarehe <strong>07/01/2027</strong>, Wanafunzi wafike shuleni tarehe{' '}
                  <strong className="text-amber-800 underline">07/01/2027</strong> na masomo yataanza rasmi baada ya usahili kukamilika.
                </p>
              </div>

              {/* Section B: Mahali Shule Ilipo */}
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-xs">
                  B. MAHALI SHULE ILIPO:
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {info.locationDescription}{' '}
                  {info.directions}
                </p>
              </div>

              {/* Section: Malipo ya Ada */}
              <div className="space-y-3 pt-2">
                <div className="font-black text-slate-900 uppercase text-sm border-b-2 border-slate-800 pb-1 flex items-center justify-between">
                  <span>MALIPO YA ADA;</span>
                  <span className="text-xs font-mono font-bold text-emerald-700">Mwaka wa Masomo 2027</span>
                </div>

                {/* Table a: Malipo ya Bweni */}
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-800">
                    a) Malipo ya Bweni (kulala)
                  </div>
                  <div className="overflow-x-auto border border-slate-300 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                          <th className="p-2 border-r border-slate-300">Maelezo ya Ada</th>
                          <th className="p-2 text-right">Kiasi (TZS)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-2 border-r border-slate-300">Ada muhula wa kwanza</td>
                          <td className="p-2 text-right font-mono font-bold">800,000/=</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-300">Ada muhula wa pili</td>
                          <td className="p-2 text-right font-mono font-bold">800,000/=</td>
                        </tr>
                        <tr className="bg-amber-50/80 font-black">
                          <td className="p-2 border-r border-slate-300 font-bold">Jumla ya Ada</td>
                          <td className="p-2 text-right font-mono font-black text-slate-950 text-sm">1,600,000/=</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table b: Sare za shule zinapatikana shuleni */}
                <div className="space-y-1 pt-2">
                  <div className="font-bold text-xs text-slate-800">
                    b) Sare za shule zinapatikana shuleni
                  </div>
                  <div className="overflow-x-auto border border-slate-300 rounded-lg">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                          <th className="p-2 w-12 border-r border-slate-300 text-center">Na</th>
                          <th className="p-2 border-r border-slate-300">Kifaa / Maelezo</th>
                          <th className="p-2 text-right">Bei (TZS)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {info.schoolProvidedItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-300 text-center font-mono">{item.itemNumber}</td>
                            <td className="p-2 border-r border-slate-300 font-medium">{item.name}</td>
                            <td className="p-2 text-right font-mono font-bold">{item.amount.toLocaleString()}/=</td>
                          </tr>
                        ))}
                        <tr className="bg-amber-50/80 font-black">
                          <td colSpan={2} className="p-2 border-r border-slate-300 text-right font-bold uppercase">
                            Jumla ya Sare na Vifaa Shuleni:
                          </td>
                          <td className="p-2 text-right font-mono font-black text-slate-950 text-sm">
                            {info.schoolProvidedItemsTotal.toLocaleString()}/=
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Combined Total Summary Callout */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-950">
                  <span>JUMLA KUU (Ada ya Bweni + Sare &amp; Vifaa Shuleni):</span>
                  <span className="font-mono text-base font-black text-emerald-900">
                    TZS {info.grandTotalBoarding.toLocaleString()}/=
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2 REPLICA (IMG_20261009_123715_796.jpg) */}
        {(activePageTab === 'both' || activePageTab === 'page2') && (
          <div className="bg-white p-6 sm:p-12 rounded-3xl border-2 border-slate-300 shadow-xl max-w-4xl mx-auto font-sans relative overflow-hidden space-y-6">
            {/* Page 2 Badge */}
            <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono font-bold border border-slate-200">
              Ukurasa 2 wa 2
            </div>

            {/* Bank Payment Instructions (Exact Words) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2 text-xs sm:text-sm leading-relaxed text-justify">
              <p className="font-medium text-slate-900">
                Malipo hayo yote yalipwe kupitia bank account{' '}
                <strong className="underline font-mono">Na 01J1079051400 CRDB</strong>,{' '}
                <strong className="underline font-mono">40302507439 NMB</strong>, na{' '}
                <strong className="underline font-mono">0051150397901 MKOMBOZI</strong>. Mwanafunzi aje na{' '}
                <strong>"pay -in- slip"</strong> yenye majina matatu na kidato anachosoma. Hatupokei fedha taslimu shuleni, fedha za kujikimu (pocket money) zikabidhiwe kwa mhasibu wa shule siku ya kuripoti shuleni.
              </p>
            </div>

            {/* Section: KWA WANAFUNZI WA BWENI (MZAZI AMNUNULIE MWANAFUNZI); */}
            <div className="space-y-3">
              <div className="font-black text-xs sm:text-sm text-slate-900 uppercase border-b-2 border-slate-800 pb-1.5 flex items-center justify-between">
                <span>KWA WANAFUNZI WA BWENI (MZAZI AMNUNULIE MWANAFUNZI);</span>
                <span className="text-[11px] text-amber-700 font-bold lowercase font-mono">orodha kamili</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-800">
                {info.parentProvidedBoardingItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 leading-snug">{item.item}</div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">{item.specification}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: NB (Special Notes) */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2 text-xs sm:text-sm text-amber-950">
              <div className="font-black text-xs text-amber-900 uppercase flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>NB:</span>
              </div>
              <ul className="space-y-1.5 list-disc pl-5 leading-relaxed text-slate-800">
                {info.importantNotes.map((note, idx) => (
                  <li key={idx} className="font-medium">
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sign-Off / Mkuu wa Shule */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6">
              <div className="space-y-2 text-xs sm:text-sm">
                <p className="font-serif italic text-base text-slate-900 font-bold">
                  {info.welcomeMessage}
                </p>
                <div className="pt-4 space-y-0.5 text-xs text-slate-700 font-mono">
                  <p>.......................................................................</p>
                  <p className="font-black text-sm uppercase text-slate-900 font-sans">
                    {info.headmasterTitle}
                  </p>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Shule ya Sekondari Uomboni • Marangu
                  </p>
                </div>
              </div>

              {/* Official Stamp Box Replica */}
              <div className="border-2 border-dashed border-slate-300 p-4 rounded-2xl text-center min-w-[210px] text-slate-400 text-xs bg-slate-50/50">
                <div className="font-black uppercase text-[11px] text-slate-500">MUHURI WA SHULE</div>
                <div className="text-[10px] text-slate-400 mt-1">(Official School Stamp)</div>
                <div className="text-[9px] text-slate-400 font-mono mt-3">S0486 • UOMBONI</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFF0] rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border-2 border-[#102A43]/20 overflow-hidden">
          <div className="bg-[#102A43] text-white p-4 flex items-center justify-between border-b border-[#C9A227]/30 shrink-0">
            <div className="flex items-center gap-2.5">
              <SchoolLogo size="sm" />
              <div>
                <span className="font-bold text-sm text-white block leading-tight">
                  Fomu Rasmi ya Kujiunga na Shule 2027
                </span>
                <span className="text-[10px] text-amber-300">
                  Uomboni Secondary School • NECTA S0486
                </span>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-300 hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
};
