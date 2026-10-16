import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  FileText,
  FileDown,
  CheckCircle2,
  X,
  Phone,
  Mail,
  User,
  School,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  Printer
} from 'lucide-react';
import { downloadJoiningInstructionsPdf, downloadAdmissionVerificationLetterPdf } from '../utils/pdfService';
import { OnlineApplication } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface ApplyNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyNowModal: React.FC<ApplyNowModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const { joiningDocs, submitOnlineApplication } = useData();

  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [dob, setDob] = useState('');
  const [applyingFor, setApplyingFor] = useState<'Form 1' | 'Form 2 Transfer' | 'Form 3 Transfer' | 'Pre-Form 1'>('Form 1');
  const [entryType, setEntryType] = useState<'Bweni (Boarding)' | 'Kutwa (Day)'>('Bweni (Boarding)');
  const [previousSchool, setPreviousSchool] = useState('');
  const [premNumber, setPremNumber] = useState('');
  const [primaryResults, setPrimaryResults] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentAddress, setParentAddress] = useState('');

  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [latestApp, setLatestApp] = useState<OnlineApplication | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!studentName.trim() || !parentName.trim() || !parentPhone.trim()) {
      setFormError(language === 'sw' ? 'Tafadhali jaza taarifa zote muhimu zenye alama ya (*).' : 'Please fill all required fields marked with (*).');
      return;
    }

    const createdApp = submitOnlineApplication({
      studentName: studentName.trim().toUpperCase(),
      gender,
      dob: dob || undefined,
      applyingFor,
      entryType,
      previousSchool: previousSchool.trim() || undefined,
      premNumber: premNumber.trim() || undefined,
      primaryResults: primaryResults.trim() || undefined,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim() || undefined,
      parentAddress: parentAddress.trim() || undefined,
      adminNotes: language === 'sw'
        ? `Maombi ya ${applyingFor} (${entryType}) yamewasilishwa mtandaoni tarehe ${new Date().toLocaleDateString('sw-TZ')}.${premNumber.trim() ? ` PREM/Namba ya Mtihani La Saba: ${premNumber.trim()}.` : ''}`
        : `Online application for ${applyingFor} (${entryType}) submitted on ${new Date().toLocaleDateString('en-GB')}.${premNumber.trim() ? ` PREM/Std 7 Exam No: ${premNumber.trim()}.` : ''}`,
    });

    setSubmittedRef(createdApp.applicationNumber);
    setLatestApp(createdApp);
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setLatestApp(null);
    setStudentName('');
    setDob('');
    setPreviousSchool('');
    setPremNumber('');
    setPrimaryResults('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setParentAddress('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-5 sm:p-6 rounded-t-3xl border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-white/10 border border-[#C9A227]/40 shadow-xs shrink-0">
              <SchoolLogo size="sm" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                {language === 'sw' ? 'Maombi ya Kujiunga na Shule (2026)' : 'Online Admission Application (2026)'}
              </h3>
              <p className="text-xs text-amber-300">
                Shule ya Sekondari Uomboni • Marangu, Kilimanjaro
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Funga"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 space-y-6">
          {submittedRef ? (
            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-200 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                  {language === 'sw' ? 'Ombi Limewasilishwa Kikamilifu!' : 'Application Successfully Submitted!'}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900">
                  Namba ya Maombi: <span className="text-emerald-700 font-mono">#{submittedRef}</span>
                </h4>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                {language === 'sw'
                  ? `Asante sana kwa kuomba kujiunga na Shule ya Sekondari Uomboni kwa niaba ya ${studentName}. Maombi yako yameingizwa kwenye mfumo wa usajili wa mwaka 2026. Uongozi utawasiliana nawe kupitia namba ya simu ${parentPhone}.`
                  : `Thank you for applying to Uomboni Secondary on behalf of ${studentName}. Your application is registered for 2026 intake. The admissions office will contact you at ${parentPhone}.`}
              </p>

              {/* Action buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {latestApp && (
                  <button
                    onClick={() => downloadAdmissionVerificationLetterPdf(latestApp)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-md transition-transform hover:scale-102 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{language === 'sw' ? 'Pakua Barua ya Uhakiki (PDF)' : 'Download Verification Letter (PDF)'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const doc = joiningDocs[0] || {
                      id: 'doc-f1',
                      title: 'Joining Instructions Form One 2026',
                      year: '2026',
                      form: 'Form 1',
                      fileSize: '1.4 MB',
                      publishDate: '2026-01-05',
                      downloadUrl: '#',
                      descriptionSw: 'Muongozo kamili wa ada na mahitaji ya kidato cha kwanza 2026',
                      category: 'Joining Instructions'
                    };
                    downloadJoiningInstructionsPdf(doc);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-amber-300" />
                  <span>{language === 'sw' ? 'Pakua Fomu Rasmi ya PDF' : 'Download Official PDF Form'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'sw' ? 'Wasilisha Ombi Lingine' : 'Submit Another Application'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 cursor-pointer" onClick={() => setFormError(null)} />
                  <div className="flex-1 font-semibold text-xs leading-relaxed">
                    {formError}
                  </div>
                </div>
              )}

              {/* Top Announcement Alert */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2 text-slate-800">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-amber-950 text-xs">
                        {language === 'sw' ? 'Udahili wa Kidato cha 1 & 3 (2026–2027)' : 'Form 1 & 3 Admissions (2026–2027)'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                        {language === 'sw' ? 'Ada Nafuu kwa Awamu' : 'Installment Fees'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {language === 'sw'
                        ? 'Fomu zinapatikana pia: 1. Ofisi ya Shule (Uomboni Sekondari), 2. Bookshop ya Kanisa Katoliki - Moshi, 3. Kanisa Katoliki Roman Ngarenaro. Simu: +255 782 558 127 | +255 752 717 191.'
                        : 'Physical forms available at: 1. School Office (Uomboni), 2. Catholic Bookshop Moshi, 3. Roman Catholic Church Ngarenaro. Tel: +255 782 558 127 | +255 752 717 191.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1: Student Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'sw' ? '1. Taarifa za Mwanafunzi' : '1. Student Information'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Jina Kamili la Mwanafunzi' : 'Student Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mfano: Juma Ally Mushi"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'sw' ? 'Jinsia' : 'Gender'}
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      >
                        <option value="M">{language === 'sw' ? 'Mvulana (Male)' : 'Male'}</option>
                        <option value="F">{language === 'sw' ? 'Msichana (Female)' : 'Female'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'sw' ? 'Tarehe ya Kuzaliwa' : 'Birth Date'}
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Darasa analoomba' : 'Applying For'}
                    </label>
                    <select
                      value={applyingFor}
                      onChange={(e) => setApplyingFor(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    >
                      <option value="Form 1">Kidato cha 1 (Form One 2026)</option>
                      <option value="Form 2 Transfer">Uhamisho Kidato cha 2 (Form 2 Transfer)</option>
                      <option value="Form 3 Transfer">Uhamisho Kidato cha 3 (Form 3 Transfer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Aina ya Masomo' : 'Enrollment Type'}
                    </label>
                    <select
                      value={entryType}
                      onChange={(e) => setEntryType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    >
                      <option value="Bweni (Boarding)">Bweni (Boarding Student)</option>
                      <option value="Kutwa (Day)">Kutwa (Day Student)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Shule Aliyotoka' : 'Previous School'}
                    </label>
                    <input
                      type="text"
                      placeholder="Mfano: Marangu Primary"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>{language === 'sw' ? 'Namba ya PREM au Namba ya Mtihani wa Darasa la Saba' : 'PREM Number or Std 7 Exam Number (PSLE)'}</span>
                      <span className="text-[10px] text-emerald-700 font-normal">{language === 'sw' ? 'PREM / Namba ya La Saba' : 'PREM / PSLE Index'}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'sw' ? 'Mfano: 2018-0486-1021 au PS020486-012' : 'e.g. 2018-0486-1021 or PS020486-012'}
                      value={premNumber}
                      onChange={(e) => setPremNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {language === 'sw'
                        ? 'Weka namba ya usajili ya shule ya msingi (PREM) au namba ya mtihani wa darasa la saba (PSLE).'
                        : 'Enter the primary school PREM number or Standard 7 PSLE examination index.'}
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Ufaulu wa Darasa la 7 / Wastani' : 'Primary Grade / Average'}
                    </label>
                    <input
                      type="text"
                      placeholder="Mfano: Daraja A (Alama 240)"
                      value={primaryResults}
                      onChange={(e) => setPrimaryResults(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Parent / Guardian Information */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'sw' ? '2. Taarifa za Mzazi / Mlezi' : '2. Parent / Guardian Details'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Jina la Mzazi / Mlezi' : 'Parent Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jina lako kamili"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Namba ya Simu (WhatsApp/Call)' : 'Phone Number'} *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+255 7..."
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Barua Pepe' : 'Email Address'} (Hiari)
                    </label>
                    <input
                      type="email"
                      placeholder="mzazi@gmail.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Makazi / Mkoa & Wilaya' : 'Residence Location'}
                    </label>
                    <input
                      type="text"
                      placeholder="Mfano: Moshi, Kilimanjaro / Arusha / Dar"
                      value={parentAddress}
                      onChange={(e) => setParentAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  id="btn-submit-apply-online"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{language === 'sw' ? 'Wasilisha Maombi Sasa' : 'Submit Admission Application'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyNowModal;
