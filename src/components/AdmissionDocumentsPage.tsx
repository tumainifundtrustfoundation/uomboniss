import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { JoiningDocument } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { downloadJoiningInstructionsPdf } from '../utils/pdfService';
import { PWAInstallButton } from './PWAInstallButton';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  Printer,
  X,
  Search,
  Filter,
  ArrowLeft,
  ShieldCheck,
  Building2,
  FileCheck,
  HeartPulse,
  Scale,
  Users,
  CheckSquare,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Send
} from 'lucide-react';

interface AdmissionDocumentsPageProps {
  onBackToHome: () => void;
  onOpenApplyNow?: () => void;
  onOpenAdminPortal?: () => void;
}

export const AdmissionDocumentsPage: React.FC<AdmissionDocumentsPageProps> = ({
  onBackToHome,
  onOpenApplyNow,
  onOpenAdminPortal,
}) => {
  const { language, t } = useLanguage();
  const { joiningDocs, incrementDocDownload, isAdminLoggedIn } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<JoiningDocument | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const categories = [
    { id: 'all', labelSw: 'Nyaraka Zote', labelEn: 'All Documents', icon: FileText },
    { id: 'admission', labelSw: 'Fomu za Maombi', labelEn: 'Application Forms', icon: FileCheck },
    { id: 'joining', labelSw: 'Maelekezo ya Kujiunga', labelEn: 'Joining Instructions', icon: BookOpen },
    { id: 'medical', labelSw: 'Uchunguzi wa Afya', labelEn: 'Medical Examination', icon: HeartPulse },
    { id: 'rules', labelSw: 'Kanuni za Shule', labelEn: 'School Rules', icon: Scale },
    { id: 'parent', labelSw: 'Wazazi & Walezi', labelEn: 'Parent Forms', icon: Users },
    { id: 'checklist', labelSw: 'Orodha ya Vitu & Mahitaji', labelEn: 'Reporting Checklist', icon: CheckSquare },
  ];

  // Filtered documents list
  const filteredDocs = useMemo(() => {
    return joiningDocs.filter((doc) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        doc.titleSw.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.descriptionSw.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.targetGroup.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'admission') {
        return (
          doc.titleSw.toLowerCase().includes('maombi') ||
          doc.titleSw.toLowerCase().includes('uhamisho') ||
          doc.id === 'doc-flyer-2026' ||
          doc.id === 'doc-002'
        );
      }
      if (selectedCategory === 'joining') {
        return doc.titleSw.toLowerCase().includes('kujiunga') || doc.id === 'doc-001';
      }
      if (selectedCategory === 'medical') {
        return doc.titleSw.toLowerCase().includes('afya') || doc.id === 'doc-003';
      }
      if (selectedCategory === 'rules') {
        return doc.titleSw.toLowerCase().includes('sheria') || doc.titleSw.toLowerCase().includes('kanuni') || doc.id === 'doc-004';
      }
      if (selectedCategory === 'parent') {
        return doc.titleSw.toLowerCase().includes('mzazi') || doc.id === 'doc-005';
      }
      if (selectedCategory === 'checklist') {
        return doc.titleSw.toLowerCase().includes('orodha') || doc.titleSw.toLowerCase().includes('mahitaji') || doc.id === 'doc-006';
      }
      return true;
    });
  }, [joiningDocs, searchQuery, selectedCategory]);

  const handleDownload = (doc: JoiningDocument) => {
    incrementDocDownload(doc.id);
    downloadJoiningInstructionsPdf(doc);
    setDownloadSuccessMsg(
      language === 'sw'
        ? `Hati ya "${doc.titleSw}" inapakuliwa moja kwa moja kwenye kifaa chako!`
        : `"${doc.titleEn}" is downloading to your device successfully!`
    );
    setTimeout(() => {
      setDownloadSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#102A43] flex flex-col font-sans">
      {/* Top Banner Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#102A43] text-white border-b border-[#C9A227]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              id="btn-back-to-home"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFFFF0] text-xs font-bold flex items-center gap-2 border border-white/15 transition-all cursor-pointer"
              title="Rudi kwenye Ukurasa Mkuu (Back to Home)"
            >
              <ArrowLeft className="w-4 h-4 text-[#C9A227]" />
              <span className="hidden sm:inline">{language === 'sw' ? 'Rudi Mwanzo' : 'Home'}</span>
            </button>

            <div className="flex items-center gap-2.5 border-l border-white/15 pl-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 p-1 border border-[#C9A227]/40 flex items-center justify-center shrink-0">
                <SchoolLogo className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-black tracking-wide text-white leading-tight">
                  SHULE YA SEKONDARI UOMBONI
                </h1>
                <p className="text-[10px] text-[#C9A227] font-semibold tracking-wider uppercase">
                  NECTA CENTRE S0486 &bull; ADMISSION PORTAL
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <PWAInstallButton variant="navbar" />

            {isAdminLoggedIn && onOpenAdminPortal && (
              <button
                onClick={onOpenAdminPortal}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dhibiti Nyaraka (Admin)</span>
              </button>
            )}

            {onOpenApplyNow && (
              <button
                onClick={onOpenApplyNow}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Omba Mtandaoni</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Header Area */}
      <section className="bg-gradient-to-b from-[#102A43] via-[#153557] to-[#0A1C2E] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#C9A227]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C9A227]/50 text-[#FFFFF0] text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>{language === 'sw' ? 'Hati Rasmi za Kujiunga 2026/2027' : 'Official Admission Documents 2026/2027'}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            {language === 'sw'
              ? 'Nyaraka & Fomu Rasmi za Udahili'
              : 'Official Student Admission Documents'}
          </h2>

          <p className="max-w-3xl mx-auto text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            {language === 'sw'
              ? 'Pakua fomu zote zilizoidhinishwa za kujiunga na Kidato cha Kwanza na Uhamisho wa Kidato cha Pili na Tatu. Hati hizi zimeidhinishwa na Uongozi wa Shule ya Sekondari Uomboni na Jimbo Katoliki la Moshi.'
              : 'Download approved admissions forms, joining instructions, medical report templates, and official school regulations for Form 1 and transfer entrants.'}
          </p>

          {/* Quick Notice Pill */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-amber-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Nyaraka Rasmi za PDF (Bila Malipo)</span>
            </span>
            <span className="hidden sm:inline text-white/30">&bull;</span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#C9A227]" />
              <span>Akaunti za Benki: CRDB, NMB, Mkombozi</span>
            </span>
            <span className="hidden sm:inline text-white/30">&bull;</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Kuripoti Shuleni: Januari 2026 / 2027</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        {/* Download Feedback Banner */}
        {downloadSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{downloadSuccessMsg}</span>
            </div>
            <button
              onClick={() => setDownloadSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'sw'
                    ? 'Tafuta fomu (mfano: afya, joining, sheria, ada)...'
                    : 'Search documents (e.g., medical, joining, rules)...'
                }
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#102A43] focus:border-transparent outline-none bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
              <FileText className="w-4 h-4 text-[#C9A227]" />
              <span>
                {filteredDocs.length} {language === 'sw' ? 'Nyaraka zimepatikana' : 'Documents available'}
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C9A227]' : 'text-slate-500'}`} />
                  <span>{language === 'sw' ? cat.labelSw : cat.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">
              {language === 'sw' ? 'Hakuna nyaraka inayofanana na utafutaji' : 'No documents matched your search'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {language === 'sw'
                ? 'Tafadhali badili maneno ya utafutaji au chagua aina nyingine ya nyaraka.'
                : 'Please refine your keywords or select another category filter.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              {language === 'sw' ? 'Onyesha Nyaraka Zote' : 'Show All Documents'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc, idx) => {
              const isPrimaryJoining = doc.id === 'doc-001' || doc.id === 'doc-flyer-2026';
              return (
                <div
                  key={doc.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isPrimaryJoining ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                  }`}
                >
                  {/* Top Color Accent Band */}
                  <div className={`h-1.5 w-full ${isPrimaryJoining ? 'bg-gradient-to-r from-red-600 via-amber-500 to-[#102A43]' : 'bg-[#102A43]'}`} />

                  <div className="p-5 sm:p-6 space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Meta badges row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>{doc.targetGroup}</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {doc.fileSize}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-base sm:text-lg text-[#102A43] leading-snug">
                        {language === 'sw' ? doc.titleSw : doc.titleEn}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {language === 'sw' ? doc.descriptionSw : doc.descriptionEn}
                      </p>

                      {/* Key highlights preview */}
                      {doc.pdfContentPreview?.requirements && doc.pdfContentPreview.requirements.length > 0 && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Muhtasari wa Mahitaji:
                          </span>
                          <ul className="space-y-1 text-[11px] text-slate-700">
                            {doc.pdfContentPreview.requirements.slice(0, 2).map((req, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-1.5 line-clamp-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="truncate">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Stats & Actions */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Download className="w-3 h-3 text-slate-400" />
                          <span>{doc.downloadCount.toLocaleString()} downloads</span>
                        </span>
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          ✓ PDF Imeidhinishwa
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#102A43] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          title="Tazama maelezo kamili ya hati hii"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Tazama</span>
                        </button>

                        <button
                          onClick={() => handleDownload(doc)}
                          className="px-3 py-2 rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          title="Pakua fomu hii katika muundo wa PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>Pakua PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Banking and Verified Payment Channel Notice */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>Njia Rasmi za Malipo ya Ada &amp; Usajili</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#102A43]">
                Akaunti za Benki Zilizoidhinishwa (Official Bank Accounts)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Malipo yote ya ada hufanyika benki kupitia akaunti za shule. Hatupokei fedha taslimu shuleni.
              </p>
            </div>
            <div className="shrink-0">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                ✓ Salama &amp; Zilizoidhinishwa
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Benki ya Kwanza</span>
              <h4 className="font-bold text-sm text-[#102A43]">CRDB BANK</h4>
              <p className="font-mono text-xs font-black text-amber-700">01J1079051400</p>
              <p className="text-[11px] text-slate-600">Jina: Uomboni Secondary School</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Benki ya Pili</span>
              <h4 className="font-bold text-sm text-[#102A43]">NMB BANK</h4>
              <p className="font-mono text-xs font-black text-amber-700">40302507439</p>
              <p className="text-[11px] text-slate-600">Jina: Uomboni Secondary School</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Benki ya Tatu</span>
              <h4 className="font-bold text-sm text-[#102A43]">MKOMBOZI COMMERCIAL BANK</h4>
              <p className="font-mono text-xs font-black text-amber-700">0051150397901</p>
              <p className="text-[11px] text-slate-600">Tawi: Moshi Branch / Kilimanjaro</p>
            </div>
          </div>
        </section>
      </main>

      {/* Document Detail Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#102A43] text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 border border-[#C9A227]/40 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-snug">
                    {language === 'sw' ? previewDoc.titleSw : previewDoc.titleEn}
                  </h3>
                  <p className="text-xs text-amber-300 font-mono">
                    {previewDoc.targetGroup} &bull; {previewDoc.fileSize}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1.5">
                  Maelezo Kamili ya Hati
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {language === 'sw' ? previewDoc.descriptionSw : previewDoc.descriptionEn}
                </p>
              </div>

              {previewDoc.pdfContentPreview && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                    <h5 className="font-bold text-amber-950 text-xs uppercase tracking-wider mb-2">
                      Kichwa cha Hati Rasmi
                    </h5>
                    <pre className="font-mono text-xs text-amber-900 whitespace-pre-wrap leading-relaxed">
                      {previewDoc.pdfContentPreview.header}
                    </pre>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                      Vipengele &amp; Masharti ya Lazima
                    </h5>
                    <ul className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {previewDoc.pdfContentPreview.requirements.map((req, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Ada &amp; Malipo:</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {previewDoc.pdfContentPreview.feesSummary}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Tarehe ya Kuripoti:</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {previewDoc.pdfContentPreview.reportingDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Funga / Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleDownload(previewDoc);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#C9A227]" />
                  <span>Pakua Hati Kamili (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#102A43] text-white py-6 border-t border-[#C9A227]/30 text-center text-xs text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} Shule ya Sekondari Uomboni (NECTA S0486). Jimbo Katoliki la Moshi, Kilimanjaro.
        </p>
      </footer>
    </div>
  );
};
