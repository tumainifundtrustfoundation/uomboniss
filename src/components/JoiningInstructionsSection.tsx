import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { JoiningDocument } from '../types';
import { OfficialInvitationLetterViewer } from './OfficialInvitationLetterViewer';
import { OfficialJoiningInstructions2027Viewer } from './OfficialJoiningInstructions2027Viewer';
import { StudentEnrollmentProgressBar } from './StudentEnrollmentProgressBar';
import { SchoolLogo } from './SchoolLogo';
import { downloadJoiningInstructionsPdf } from '../utils/pdfService';
import {
  FileDown,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  Printer,
  X,
  ScrollText,
  Compass,
  PhoneCall,
  ExternalLink,
  School,
  BookOpen,
  GraduationCap
} from 'lucide-react';

interface JoiningInstructionsSectionProps {
  onOpenApply?: () => void;
}

export const JoiningInstructionsSection: React.FC<JoiningInstructionsSectionProps> = ({
  onOpenApply,
}) => {
  const { language, t } = useLanguage();
  const { joiningDocs, incrementDocDownload } = useData();

  const [activeAdmissionsTab, setActiveAdmissionsTab] = useState<'joining2027' | 'overview' | 'letter' | 'documents'>('joining2027');
  const [previewDoc, setPreviewDoc] = useState<JoiningDocument | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const handleDownload = (doc: JoiningDocument) => {
    incrementDocDownload(doc.id);
    downloadJoiningInstructionsPdf(doc);
    setDownloadSuccessMsg(
      language === 'sw'
        ? `Fomu ya "${doc.titleSw}" inapakuliwa moja kwa moja!`
        : `"${doc.titleEn}" is downloading successfully!`
    );
    setTimeout(() => {
      setDownloadSuccessMsg(null);
    }, 4000);
  };

  return (
    <section id="joining-instructions" className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0b2545] text-xs font-bold border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-800" />
            <span>{language === 'sw' ? 'Udahili & Fomu za Kujiunga 2026/2027' : 'Admissions & Joining Instructions 2026/2027'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {language === 'sw' ? 'Fomu & Barua Rasmi ya Mwaliko wa Kujiunga' : 'Application Forms & Official Invitation Letter'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {language === 'sw'
              ? 'Nafasi za Kidato cha 1 na 3 (2026–2027) ziko wazi. Pakua fomu na maelekezo ya kujiunga.'
              : 'Form 1 & 3 intake for 2026–2027 academic year is open. View and download official materials.'}
          </p>
        </div>

        {/* Visual Student Onboarding Progress Bar */}
        <StudentEnrollmentProgressBar
          onOpenApply={onOpenApply}
          onSelectLetterTab={() => setActiveAdmissionsTab('joining2027')}
          onSelectDocsTab={() => setActiveAdmissionsTab('documents')}
        />

        {/* Download Feedback Alert */}
        {downloadSuccessMsg && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-[#0b2545] flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
              <span>{downloadSuccessMsg}</span>
            </div>
            <button
              onClick={() => setDownloadSuccessMsg(null)}
              className="text-blue-700 hover:text-blue-950 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Switcher for Deep-Dive Views */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {language === 'sw' ? 'Nyaraka & Fomu za Shule' : 'School Official Prospectus & Forms'}
              </h3>
              <p className="text-xs text-slate-600">
                {language === 'sw'
                  ? 'Soma fomu rasmi ya kujiunga, barua ya mwaliko, au pakua nyaraka zote za udahili.'
                  : 'Read the official joining instructions form, invitation letter, or download admissions files.'}
              </p>
            </div>

            <div className="inline-flex flex-wrap justify-center items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner gap-1">
              <button
                id="btn-tab-joining-2027"
                onClick={() => setActiveAdmissionsTab('joining2027')}
                className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeAdmissionsTab === 'joining2027'
                    ? 'bg-[#0b2545] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <ScrollText className="w-4 h-4 text-amber-400" />
                <span>{language === 'sw' ? 'Fomu Rasmi ya Kujiunga 2027' : 'Joining Instructions 2027'}</span>
              </button>
              <button
                id="btn-tab-letter-viewer"
                onClick={() => setActiveAdmissionsTab('letter')}
                className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeAdmissionsTab === 'letter'
                    ? 'bg-[#0b2545] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{language === 'sw' ? 'Barua Rasmi ya Mwaliko' : 'Official Invitation Letter'}</span>
              </button>
              <button
                id="btn-tab-admissions-overview"
                onClick={() => setActiveAdmissionsTab('overview')}
                className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeAdmissionsTab === 'overview'
                    ? 'bg-[#0b2545] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{language === 'sw' ? 'Muhtasari wa Udahili 2026' : 'Admissions Overview'}</span>
              </button>
              <button
                id="btn-tab-documents-pack"
                onClick={() => setActiveAdmissionsTab('documents')}
                className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeAdmissionsTab === 'documents'
                    ? 'bg-[#0b2545] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <FileDown className="w-4 h-4" />
                <span>{language === 'sw' ? 'Fomu Zote za Kujiunga' : 'Joining Forms Pack'}</span>
              </button>
            </div>
          </div>

          {/* Tab 0: Admissions Overview Showcase */}
          {activeAdmissionsTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-[#0b2545] text-white rounded-xl p-6 sm:p-10 border border-blue-900 shadow-xs overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Left Column: Official School Identity & Values */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 to-[#06182c] border border-blue-700/60 rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-5">
                    <div className="flex items-center gap-3.5 pb-4 border-b border-blue-800/80">
                      <SchoolLogo size="md" />
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                          NECTA REG: S0486
                        </span>
                        <h4 className="font-serif text-lg font-bold text-white leading-tight">
                          Uomboni Secondary School
                        </h4>
                        <p className="text-xs text-blue-200">
                          Catholic Diocese of Moshi
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs text-blue-100">
                      <div className="p-3.5 rounded-xl bg-blue-900/40 border border-blue-700/50">
                        <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">Kaulimbiu Kuu:</span>
                        <p className="font-serif text-lg font-bold text-amber-300 mt-0.5">“ELIMU NI MAISHA”</p>
                        <p className="text-[11px] text-blue-200">Tujendelee Sisi Wenyewe: Prayer · Education · Work</p>
                      </div>

                      <div className="space-y-2 pt-1 text-[11px]">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Kidato cha 1 hadi 4 (Wavulana na Wasichana · Bweni &amp; Kutwa)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Ada nafuu inayolipwa kwa awamu</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Mazingira tulivu na salama ya kusomea Marangu, Kilimanjaro</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setActiveAdmissionsTab('letter')}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                      >
                        <ScrollText className="w-4 h-4" />
                        <span>{language === 'sw' ? 'Fungua Barua Rasmi ya Mwaliko (PDF)' : 'Open Official Invitation Letter'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Key Flyer Highlights */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800 text-blue-100 text-xs font-bold border border-blue-700">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'sw' ? 'TANGAZO RASMI LA UDAHILI 2026/2027' : 'OFFICIAL ADMISSIONS CALL 2026/2027'}</span>
                      </div>
                      <h3 className="text-xl sm:text-3xl font-bold text-white leading-tight">
                        {language === 'sw'
                          ? 'Udahili wa Kidato cha 1 & 3 Uko Wazi!'
                          : 'Admissions for Form 1 & 3 Are Now Open!'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {language === 'sw'
                          ? 'Shule ya Sekondari Uomboni (Marangu, Moshi Vijijini) inakaribisha maombi kwa wanafunzi wa bweni na kutwa. Mazingira safi ya Marangu chini ya Mlima Kilimanjaro na maadili thabiti ya Kikatoliki.'
                          : 'Uomboni Secondary School (Marangu, Moshi Rural) invites applications for boarding and day students. Serene Kilimanjaro foothills setting with strong Catholic foundational discipline.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800/80 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                          {language === 'sw' ? '🗓️ MUHULA WA MASOMO' : '🗓️ ACADEMIC YEAR'}
                        </span>
                        <p className="text-base font-bold text-white">2026 / 2027</p>
                        <p className="text-[11px] text-slate-300">
                          {language === 'sw' ? 'Udahili wa wanafunzi wapya wa kidato cha 1 na wanaohamia.' : 'Enrollment for new form one students and transfers.'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800/80 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-200 uppercase tracking-wider block">
                          {language === 'sw' ? '🏫 MADARASA YANAYOPOKEA' : '🏫 INTAKE LEVELS'}
                        </span>
                        <p className="text-base font-bold text-white">Kidato 1 &amp; 3</p>
                        <p className="text-[11px] text-slate-300">
                          {language === 'sw' ? 'Wavulana na Wasichana (Bweni na Kutwa)' : 'Boys & Girls (Boarding & Day)'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800/80 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                          {language === 'sw' ? '📍 UPATIKANAJI WA FOMU' : '📍 FORM DISTRIBUTION'}
                        </span>
                        <p className="text-sm font-bold text-white">
                          Ofisi ya Shule Marangu, Moshi Bookshop & Ngarenaro
                        </p>
                        <p className="text-[11px] text-slate-300">
                          {language === 'sw' ? 'Pia fomu zinapatikana mtandaoni hapa chini.' : 'Also available for digital download below.'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800/80 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-200 uppercase tracking-wider block">
                          {language === 'sw' ? '💰 ADA NAFUU' : '💰 AFFORDABLE TUITION'}
                        </span>
                        <p className="text-sm font-bold text-white">
                          Inalipwa kwa Awamu
                        </p>
                        <p className="text-[11px] text-slate-300">
                          {language === 'sw' ? 'Gharama zote ziko wazi na hakuna ada zilizofichika.' : 'Transparent fees payable in comfortable installments.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-900/60 border border-blue-700/60 space-y-2">
                      <span className="text-[11px] font-mono font-bold text-blue-100 block uppercase">
                        {language === 'sw' ? '📞 Mawasiliano Rasmi ya Udahili & Shuleni' : '📞 Official Admissions & Campus Contacts'}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {['+255 802 2000', '+255 000 0000', '0752 000 939', '0782 558 127', '0745 548 225', '0754 532 949'].map((ph, idx) => (
                          <a
                            key={idx}
                            href={`tel:${ph.replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0b2545] hover:bg-blue-950 text-white text-xs font-mono font-bold border border-blue-600 transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                            <span>{ph}</span>
                          </a>
                        ))}
                      </div>
                      <p className="text-[11px] text-blue-200 font-mono mt-1">
                        P.O. Box 90000 Marangu - Moshi · info@uomboniss.ac.tz · www.uomboniss.ac.tz
                      </p>
                    </div>

                    {/* Sifa 7 za Ubora wa Shule */}
                    <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-800 space-y-2 text-xs">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                        {language === 'sw' ? '✨ VIGEZO 7 VYA UBORA WA TAALUMA NA MALEZI (OUR FEATURES):' : '✨ 7 HALLMARK INSTITUTIONAL FEATURES:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-blue-100">
                        <span className="flex items-center gap-1.5">✓ Experienced &amp; Committed Teachers</span>
                        <span className="flex items-center gap-1.5">✓ Conducive Learning Environment</span>
                        <span className="flex items-center gap-1.5">✓ Modern Library &amp; Science Labs</span>
                        <span className="flex items-center gap-1.5">✓ High Academic Excellence</span>
                        <span className="flex items-center gap-1.5">✓ Spiritual &amp; Moral Guidance</span>
                        <span className="flex items-center gap-1.5">✓ Sports &amp; Extracurricular Activities</span>
                        <span className="flex items-center gap-1.5 col-span-full">✓ Computer &amp; ICT Studies</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {onOpenApply && (
                        <button
                          onClick={onOpenApply}
                          className="px-6 py-3 rounded-lg bg-white hover:bg-slate-100 text-[#0b2545] font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4 text-[#0b2545]" />
                          <span>{language === 'sw' ? 'Omba Udahili Mtandaoni Sasa' : 'Apply Online Now'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setActiveAdmissionsTab('documents')}
                        className="px-5 py-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm border border-blue-700 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>{language === 'sw' ? 'Tazama Fomu za Kupakua' : 'View Downloadable Forms'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Fomu Rasmi ya Kujiunga 2027 (Official Joining Instructions Form) */}
          {activeAdmissionsTab === 'joining2027' && (
            <div className="animate-in fade-in duration-300">
              <OfficialJoiningInstructions2027Viewer />
            </div>
          )}

          {/* Tab 1: Official Invitation Letter */}
          {activeAdmissionsTab === 'letter' && (
            <div className="animate-in fade-in duration-300">
              <OfficialInvitationLetterViewer />
            </div>
          )}

          {/* Tab 2: Documents Grid */}
          {activeAdmissionsTab === 'documents' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {joiningDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 hover:border-blue-500/40 transition-colors shadow-xs flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0b2545] flex items-center justify-center shadow-xs shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#0b2545] border border-blue-200">
                          {doc.targetGroup}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {language === 'sw' ? doc.titleSw : doc.titleEn}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                          {language === 'sw' ? doc.descriptionSw : doc.descriptionEn}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons & Metadata */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-500 font-mono">
                        <span>{doc.fileSize}</span> • <span>{doc.downloadCount} {language === 'sw' ? 'Wamepakua' : 'Downloads'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#0b2545]" />
                          <span>{t('joining.btnPreview')}</span>
                        </button>

                        <button
                          onClick={() => handleDownload(doc)}
                          className="px-4 py-2 rounded-lg bg-[#0b2545] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t('joining.btnDownload')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Important Admission Guidelines Callout */}
              <div className="bg-[#0b2545] text-white p-6 sm:p-8 rounded-xl border border-blue-900 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    <span>{language === 'sw' ? 'Ratiba Muhimu ya Kujiunga' : 'Important Admission Deadlines'}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {language === 'sw'
                      ? 'Tarehe ya Kuripoti Kidato cha Kwanza ni Tarehe 11 Januari 2026'
                      : 'Form One Reporting Date is January 11, 2026'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {language === 'sw'
                      ? 'Wanafunzi wote wanaoripoti wanatakiwa kuwasilisha fomu ya matibabu iliyopimwa hospitalini, fomu ya usajili iliyosainiwa na risiti ya malipo ya benki ya nusu au ada yote.'
                      : 'All incoming students must present an authenticated medical report, signed prospectus forms, and verified bank deposit slips.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
                  <button
                    onClick={() => {
                      if (joiningDocs[0]) handleDownload(joiningDocs[0]);
                    }}
                    className="w-full py-3 px-4 rounded-lg bg-white hover:bg-slate-100 text-[#0b2545] font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#0b2545]" />
                    <span>{language === 'sw' ? 'Pakua Fomu Kuu ya 2026' : 'Download Main 2026 Pack'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Online Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#0b2545] uppercase tracking-wide">
                  {language === 'sw' ? 'Mwonekano wa Fomu Mtandaoni' : 'Online Document Preview'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {language === 'sw' ? previewDoc.titleSw : previewDoc.titleEn}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content View */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 font-mono text-xs space-y-4 text-slate-800 whitespace-pre-line leading-relaxed">
              <div className="text-center font-bold text-slate-900 border-b border-slate-200 pb-3">
                {previewDoc.pdfContentPreview.header}
              </div>

              <div className="space-y-2">
                <div className="font-bold text-[#0b2545] uppercase">
                  {language === 'sw' ? '1. MAHITAJI MUHIMU YA KITAALUMA NA BWENI:' : '1. KEY ACADEMIC & BOARDING REQUIREMENTS:'}
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 font-sans">
                  {previewDoc.pdfContentPreview.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200 font-sans">
                <div className="font-bold text-[#0b2545] uppercase">
                  {language === 'sw' ? '2. MWONGOZO WA ADA NA MALIPO:' : '2. FEES & PAYMENT SCHEDULE:'}
                </div>
                <p className="text-slate-700">{previewDoc.pdfContentPreview.feesSummary}</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200 font-sans">
                <div className="font-bold text-[#0b2545] uppercase">
                  {language === 'sw' ? '3. TAREHE NA MUDA WA KURIPOTI:' : '3. REPORTING SCHEDULE:'}
                </div>
                <p className="text-slate-700">{previewDoc.pdfContentPreview.reportingDate}</p>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                {language === 'sw' ? 'Funga' : 'Close'}
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Chapisha' : 'Print'}</span>
              </button>

              <button
                onClick={() => {
                  handleDownload(previewDoc);
                  setPreviewDoc(null);
                }}
                className="px-5 py-2 rounded-lg bg-[#0b2545] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'sw' ? 'Pakua Fomu Sasa (PDF)' : 'Download PDF Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
