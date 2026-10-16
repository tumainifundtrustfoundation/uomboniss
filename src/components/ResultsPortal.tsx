import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { StudentResult, ResultsPdfDocument } from '../types';
import {
  Award,
  Search,
  Printer,
  FileText,
  User,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Download,
  Share2,
  FileSpreadsheet,
  Layers,
  Upload,
  BookOpen,
  ArrowRight,
  Filter,
  Check,
  Eye,
  ExternalLink,
  Maximize2,
  Wifi,
  WifiOff,
  RefreshCw,
  HardDrive,
  Lock,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Link2,
  X,
  Copy
} from 'lucide-react';
import { downloadClassBroadsheetPdf } from '../utils/pdfService';
import { exportResultsToExcel, downloadExcelTemplate } from '../utils/excelService';
import { PublicResultsSearchSection } from './results/PublicResultsSearchSection';
import { StudentAcademicPerformanceReport } from './results/StudentAcademicPerformanceReport';
import { NoticeboardBroadsheetView } from './results/NoticeboardBroadsheetView';
import { SchoolResultsDashboardView } from './results/SchoolResultsDashboardView';
import { SubjectPerformanceView } from './results/SubjectPerformanceView';
import { ResultVerificationModal } from './results/ResultVerificationModal';
import { DistributedWorkflowBanner } from './results/DistributedWorkflowBanner';
import { FormFourRegisterTab } from './results/FormFourRegisterTab';

interface ResultsPortalProps {
  initialSearchQuery?: string;
  onOpenAdmin?: () => void;
  onOpenAcademicPortal?: () => void;
  onOpenParentPortal?: () => void;
  onOpenStudentPortal?: () => void;
  onOpenTeacherStation?: () => void;
  onOpenAcademicMasterDesk?: () => void;
}

export const ResultsPortal: React.FC<ResultsPortalProps> = ({
  initialSearchQuery = '',
  onOpenAdmin,
  onOpenAcademicPortal,
  onOpenParentPortal,
  onOpenStudentPortal,
  onOpenTeacherStation,
  onOpenAcademicMasterDesk,
}) => {
  const { language, t } = useLanguage();
  const {
    studentResults,
    searchResult,
    resultsPdfDocuments,
    addResultsPdfDoc,
    updateResultsPdfDoc,
    deleteResultsPdfDoc,
    isOffline,
    offlineCachedCount,
    syncResultsToOfflineStorage,
    loadInitialResults,
  } = useData();

  const [activeTab, setActiveTab] = useState<
    'search' | 'noticeboard' | 'formFourRegister' | 'dashboard' | 'subjects' | 'links' | 'individual' | 'broadsheet' | 'excelSync'
  >('search');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedForm, setSelectedForm] = useState<string>('ALL');
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [activeResult, setActiveResult] = useState<StudentResult | null>(() => {
    return studentResults[0] || null;
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewPdfDoc, setPreviewPdfDoc] = useState<ResultsPdfDocument | null>(null);

  // Verification Modal state
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationStudent, setVerificationStudent] = useState<StudentResult | null>(null);

  const handleOpenVerification = (student: StudentResult) => {
    setVerificationStudent(student);
    setIsVerificationModalOpen(true);
  };

  // States for Results Links tab
  const [linksSearchQuery, setLinksSearchQuery] = useState('');
  const [linksSelectedForm, setLinksSelectedForm] = useState<string>('ALL');
  const [linksSelectedYear, setLinksSelectedYear] = useState<string>('ALL');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Add/Edit Results Link Modal State
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [linkFormData, setLinkFormData] = useState<{
    titleSw: string;
    titleEn: string;
    form: 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'All Forms';
    examType: string;
    year: number;
    externalUrl: string;
    totalCandidates: number;
    divisionSummary: string;
    descriptionSw: string;
    adminPasscode: string;
  }>({
    titleSw: '',
    titleEn: '',
    form: 'Form 4',
    examType: 'NECTA CSEE National Examination',
    year: new Date().getFullYear(),
    externalUrl: '',
    totalCandidates: 28,
    divisionSummary: '',
    descriptionSw: '',
    adminPasscode: '',
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const [isSyncingOffline, setIsSyncingOffline] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Handlers for Results Links
  const handleOpenAddModal = () => {
    setEditingDocId(null);
    setLinkFormData({
      titleSw: '',
      titleEn: '',
      form: 'Form 4',
      examType: 'NECTA CSEE National Examination',
      year: new Date().getFullYear(),
      externalUrl: '',
      totalCandidates: 28,
      divisionSummary: '',
      descriptionSw: '',
      adminPasscode: '',
    });
    setModalError(null);
    setModalSuccess(null);
    setIsAddLinkModalOpen(true);
  };

  const handleOpenEditModal = (doc: ResultsPdfDocument) => {
    setEditingDocId(doc.id);
    setLinkFormData({
      titleSw: doc.titleSw,
      titleEn: doc.titleEn,
      form: doc.form,
      examType: doc.examType,
      year: doc.year,
      externalUrl: doc.externalUrl || '',
      totalCandidates: doc.totalCandidates || 0,
      divisionSummary: doc.divisionSummary || '',
      descriptionSw: doc.descriptionSw || '',
      adminPasscode: '',
    });
    setModalError(null);
    setModalSuccess(null);
    setIsAddLinkModalOpen(true);
  };

  const handleTestUrl = () => {
    let url = linkFormData.externalUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveResultsLink = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!linkFormData.titleSw.trim()) {
      setModalError(language === 'sw' ? 'Tafadhali weka jina la mtihani/matokeo' : 'Please provide exam title');
      return;
    }

    if (!linkFormData.externalUrl.trim()) {
      setModalError(language === 'sw' ? 'Tafadhali weka kiungo / link ya matokeo' : 'Please provide the results URL');
      return;
    }

    let formattedUrl = linkFormData.externalUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    // Passcode check
    if (linkFormData.adminPasscode !== 'uomboni2025' && linkFormData.adminPasscode !== 'admin') {
      setModalError(
        language === 'sw'
          ? 'Neno la siri la uongozi si sahihi (tumia neno la siri la shule: uomboni2025)'
          : 'Invalid admin passcode (use school passcode: uomboni2025)'
      );
      return;
    }

    const docToSave: ResultsPdfDocument = {
      id: editingDocId || `pdf-res-${Date.now()}`,
      titleSw: linkFormData.titleSw.trim(),
      titleEn: linkFormData.titleEn.trim() || linkFormData.titleSw.trim(),
      form: linkFormData.form,
      examType: linkFormData.examType.trim() || 'NECTA Exam',
      year: Number(linkFormData.year) || new Date().getFullYear(),
      datePublished: new Date().toISOString().split('T')[0],
      fileSize: 'Online Web Link',
      totalCandidates: Number(linkFormData.totalCandidates) || 0,
      divisionSummary:
        linkFormData.divisionSummary.trim() ||
        (language === 'sw' ? 'Matokeo Rasmi Mtandaoni' : 'Official Online Results'),
      descriptionSw:
        linkFormData.descriptionSw.trim() ||
        (language === 'sw' ? 'Bofya kiungo hiki kufungua matokeo rasmi mtandaoni.' : 'Click this link to access official results online.'),
      descriptionEn:
        linkFormData.descriptionSw.trim() ||
        'Click this link to access official results online.',
      externalUrl: formattedUrl,
    };

    if (editingDocId) {
      updateResultsPdfDoc(docToSave);
    } else {
      addResultsPdfDoc(docToSave);
    }

    setModalSuccess(
      language === 'sw'
        ? 'Kiungo cha matokeo kimewekwa kikamilifu! Wazazi sasa wanaweza kubofya na kufungua matokeo mara moja.'
        : 'Results link published successfully! Parents can now click and view results instantly.'
    );

    setTimeout(() => {
      setIsAddLinkModalOpen(false);
      setEditingDocId(null);
      setModalSuccess(null);
    }, 1200);
  };

  const handleDeleteResultsLink = (id: string, title: string) => {
    const confirmMsg =
      language === 'sw'
        ? `Una uhakika unataka kufuta kiungo cha matokeo: "${title}"?`
        : `Are you sure you want to delete the results link: "${title}"?`;
    if (window.confirm(confirmMsg)) {
      deleteResultsPdfDoc(id);
    }
  };

  const handleCopyResultsLink = (url: string, id: string) => {
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 3000);
    }
  };

  // Filtered links for the Links tab
  const filteredResultsLinks = resultsPdfDocuments.filter((doc) => {
    const query = linksSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      doc.titleSw.toLowerCase().includes(query) ||
      doc.titleEn.toLowerCase().includes(query) ||
      doc.examType.toLowerCase().includes(query) ||
      (doc.descriptionSw && doc.descriptionSw.toLowerCase().includes(query)) ||
      (doc.divisionSummary && doc.divisionSummary.toLowerCase().includes(query));

    const matchesForm =
      linksSelectedForm === 'ALL' ||
      doc.form === linksSelectedForm ||
      doc.form === 'All Forms';

    const matchesYear =
      linksSelectedYear === 'ALL' ||
      doc.year.toString() === linksSelectedYear.toString();

    return matchesSearch && matchesForm && matchesYear;
  });

  const handleOpenParent = () => {
    if (onOpenParentPortal) {
      onOpenParentPortal();
    } else if (onOpenStudentPortal) {
      onOpenStudentPortal();
    } else if (onOpenAcademicPortal) {
      onOpenAcademicPortal();
    }
  };

  const handleManualOfflineSync = async () => {
    setIsSyncingOffline(true);
    try {
      const res = await syncResultsToOfflineStorage();
      if (res && res.success) {
        setSyncFeedback(
          language === 'sw'
            ? `Matokeo yote ${res.count} yamehifadhiwa kikamilifu kwenye kifaa chako kwa matumizi bila intaneti!`
            : `All ${res.count} examination results are securely cached offline for instant access!`
        );
      } else {
        setSyncFeedback(
          language === 'sw'
            ? 'Kuna changamoto wakati wa kuhifadhi data nje ya mtandao.'
            : 'Error while saving data offline.'
        );
      }
    } catch {
      setSyncFeedback(language === 'sw' ? 'Hitilafu ya uhifadhi' : 'Sync error');
    } finally {
      setIsSyncingOffline(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  const filteredResults = searchResult(searchQuery, selectedForm, selectedExam);

  const getDivisionBadgeColor = (div: string) => {
    switch (div) {
      case 'Division I':
        return 'bg-emerald-600 text-white border-emerald-500 shadow-xs';
      case 'Division II':
        return 'bg-blue-600 text-white border-blue-500 shadow-xs';
      case 'Division III':
        return 'bg-amber-600 text-white border-amber-500 shadow-xs';
      case 'Division IV':
        return 'bg-orange-600 text-white border-orange-500';
      default:
        return 'bg-red-600 text-white border-red-500';
    }
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      case 'C':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'D':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const handleDownloadBroadsheet = () => {
    const title = `MATOKEO YA ${selectedForm === 'ALL' ? 'WANAFUNZI WOTE' : selectedForm} - ${selectedExam === 'ALL' ? '2025' : selectedExam}`;
    downloadClassBroadsheetPdf(filteredResults, title);
  };

  const handleExportExcel = () => {
    const filename = `UOMBONI_MATOKEO_${selectedForm}_${new Date().getFullYear()}.xlsx`;
    exportResultsToExcel(filteredResults, filename);
  };

  const handleShareResult = (student: StudentResult) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Matokeo ya Uomboni Secondary School: ${student.studentName} (${student.examNumber}) - ${student.division}, Points: ${student.points}, Wastani: ${student.averageMarks}%. Tembelea tovuti ya shule kuona matokeo kamili.`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <section id="results" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0b2545] text-xs font-bold border border-blue-200">
            <Award className="w-3.5 h-3.5 text-[#0b2545]" />
            <span>{language === 'sw' ? 'Tovuti ya Matokeo ya Mitihani (NECTA S0486)' : 'Examination Results & PDF Portal (NECTA S0486)'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {t('results.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {language === 'sw'
              ? 'Tafuta matokeo kwa namba ya mtihani au jina, pakua Hati za Matokeo (PDF Result Slips), pakua Broadsheet za Madarasa, au pakua faili la Excel.'
              : 'Search individual results, download official PDF Result Slips, download Class Broadsheets, or export to Excel spreadsheet.'}
          </p>

          {/* Official NECTA CSEE 2025 Link */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://onlinesys.necta.go.tz/results/2025/csee/results/s0486.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#0b2545] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm shadow-xs border border-blue-900 transition-all group"
              title="Fungua Matokeo Rasmi ya NECTA CSEE 2025 (Kituo S0486) kwenye Server ya NECTA"
            >
              <ExternalLink className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
              <span>
                {language === 'sw'
                  ? 'Matokeo Rasmi NECTA CSEE 2025 (Kituo S0486)'
                  : 'Official NECTA CSEE 2025 Results (Center S0486)'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-200 text-[10px] font-mono border border-blue-800">
                onlinesys.necta.go.tz
              </span>
            </a>
          </div>
        </div>

        {/* Top Feature Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-xl max-w-5xl mx-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('search')}
            id="tab-results-search"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{language === 'sw' ? 'Tafuta Matokeo (Search & Report)' : 'Search & Performance Report'}</span>
          </button>

          <button
            onClick={() => setActiveTab('noticeboard')}
            id="tab-results-noticeboard"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'noticeboard'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'sw' ? 'Mbao ya Matokeo (Noticeboard Sheet)' : 'Noticeboard Broadsheet'}</span>
          </button>

          <button
            onClick={() => setActiveTab('formFourRegister')}
            id="tab-results-form4-register"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'formFourRegister'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{language === 'sw' ? 'Watahiniwa Kidato 4' : 'Form 4 Register'}</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            id="tab-results-dashboard"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'sw' ? 'Dashibodi ya Shule' : 'School Dashboard'}</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            id="tab-results-subjects"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'sw' ? 'Uchambuzi wa Masomo' : 'Subject Analytics'}</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            id="tab-results-links"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'links'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'sw' ? 'Viungo & NECTA' : 'Results Links'}</span>
          </button>

          <button
            onClick={() => setActiveTab('broadsheet')}
            id="tab-results-broadsheet"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'broadsheet'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{language === 'sw' ? 'Broadsheet ya Darasa' : 'Class Matrix'}</span>
          </button>

          <button
            onClick={() => setActiveTab('excelSync')}
            id="tab-results-excel-sync"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'excelSync'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{language === 'sw' ? 'Excel Import' : 'Excel Import'}</span>
          </button>
        </div>

        {/* OFFLINE ACCESS & SERVICE WORKER CACHE STATUS BAR */}
        <div className="max-w-4xl mx-auto space-y-2">
          <div
            className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isOffline
                ? 'bg-amber-500/10 border-amber-400/50 text-amber-950'
                : 'bg-emerald-500/10 border-emerald-300/60 text-emerald-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isOffline
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-emerald-800 text-white shadow-sm'
                }`}
              >
                {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm">
                    {isOffline
                      ? language === 'sw'
                        ? 'Hali ya Nje ya Mtandao (Offline Access Inafanya Kazi)'
                        : 'Offline Mode Active'
                      : language === 'sw'
                      ? 'Mtandaoni na Hali ya Nje ya Mtandao Imetayarishwa'
                      : 'Online & Service Worker Cache Ready'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOffline
                        ? 'bg-amber-200 text-amber-900 border border-amber-300'
                        : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {isOffline
                      ? language === 'sw'
                        ? 'Bila Mtandao'
                        : 'Offline'
                      : language === 'sw'
                      ? 'Live'
                      : 'Live'}
                  </span>
                </div>
                <p className="text-xs opacity-85">
                  {isOffline
                    ? language === 'sw'
                      ? `Unaangalia matokeo yaliyohifadhiwa (${studentResults.length} wanafunzi). Unaweza kutafuta kwa namba ya mtihani na kupakua slip bila mtandao!`
                      : `Viewing cached results (${studentResults.length} students). Searching and slip downloads work offline!`
                    : language === 'sw'
                    ? `Matokeo ${studentResults.length} yamesawazishwa kikamilifu na kuhifadhiwa kwenye kumbukumbu ya kifaa kwa ajili ya kufunguka bila intaneti.`
                    : `${studentResults.length} student results cached in Service Worker storage for instant offline viewing.`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                onClick={handleManualOfflineSync}
                disabled={isSyncingOffline}
                title={language === 'sw' ? 'Hifadhi matokeo yote kwenye kifaa' : 'Cache all results offline'}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300/80 shadow-xs hover:border-emerald-500 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncingOffline ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncingOffline
                    ? language === 'sw'
                      ? 'Inahifadhi...'
                      : 'Caching...'
                    : language === 'sw'
                    ? 'Sawazisha Nje ya Mtandao'
                    : 'Sync Offline'}
                </span>
              </button>

              {studentResults.length === 0 && (
                <button
                  onClick={loadInitialResults}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{language === 'sw' ? 'Pakia Matokeo Mfano S0486' : 'Load Sample Results'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Sync Success Feedback Toast */}
          {syncFeedback && (
            <div className="p-3 rounded-xl bg-emerald-800 text-white text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
              <button
                onClick={() => setSyncFeedback(null)}
                className="text-[11px] text-emerald-200 hover:text-white underline cursor-pointer ml-3 shrink-0"
              >
                {language === 'sw' ? 'Funga' : 'Close'}
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: SEARCH & DETAILED ACADEMIC PERFORMANCE REPORT */}
        {activeTab === 'search' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Distributed Workflow Launcher Banner */}
            <DistributedWorkflowBanner
              onOpenTeacherStation={() => {
                if (onOpenTeacherStation) {
                  onOpenTeacherStation();
                } else if (onOpenAcademicPortal) {
                  onOpenAcademicPortal();
                }
              }}
              onOpenAcademicMasterDesk={() => {
                if (onOpenAcademicMasterDesk) {
                  onOpenAcademicMasterDesk();
                } else if (onOpenAcademicPortal) {
                  onOpenAcademicPortal();
                }
              }}
            />

            {/* Public Examination Search Section */}
            <PublicResultsSearchSection
              studentResults={studentResults}
              selectedExam={selectedExam}
              setSelectedExam={setSelectedExam}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectStudent={(st) => setActiveResult(st)}
              activeResultId={activeResult?.id}
            />

            {/* Active Student Academic Performance Report */}
            {activeResult ? (
              <StudentAcademicPerformanceReport
                student={activeResult}
                onOpenVerification={handleOpenVerification}
              />
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-300 space-y-2">
                <Search className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">
                  {language === 'sw' ? 'Tafuta mwanafunzi kuona ripoti ya kitaaluma' : 'Search for a candidate to view their academic report'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'sw' ? 'Weka namba ya mtihani au jina kwenye kisanduku hapo juu.' : 'Enter candidate number or student name above.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NOTICEBOARD BROADSHEET (DIRECT FROM PHOTO image.png) */}
        {activeTab === 'noticeboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <NoticeboardBroadsheetView
              onSelectStudent={(st) => {
                setActiveResult(st);
                setActiveTab('search');
              }}
            />
          </div>
        )}

        {/* TAB 2B: OFFICIAL FORM FOUR CANDIDATES REGISTER */}
        {activeTab === 'formFourRegister' && (
          <FormFourRegisterTab
            onSelectStudentResult={(st) => {
              setActiveResult(st);
              setActiveTab('search');
            }}
            onOpenStudentPortal={onOpenStudentPortal}
          />
        )}

        {/* TAB 3: SCHOOL RESULTS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SchoolResultsDashboardView
              studentResults={studentResults}
              onSelectStudent={(st) => {
                setActiveResult(st);
                setActiveTab('search');
              }}
            />
          </div>
        )}

        {/* TAB 4: SUBJECT PERFORMANCE ANALYTICS */}
        {activeTab === 'subjects' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SubjectPerformanceView studentResults={studentResults} />
          </div>
        )}

        {/* TAB 5: VIUNGO RASMI VYA MATOKEO (OFFICIAL RESULTS LINKS DIRECTORY) */}
        {activeTab === 'links' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Control Bar: Filters, Search & Add Link Action */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {language === 'sw' ? 'Orodha ya Viungo Rasmi vya Matokeo' : 'Official Results Links Directory'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'sw'
                      ? 'Bofya kitufe cha kiungo husika kufungua matokeo mara moja mtandaoni (NECTA, Mock, au Shule).'
                      : 'Click any link below to open verified examination results online instantly.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleOpenAddModal}
                    id="btn-add-result-link"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 hover:text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-102"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>{language === 'sw' ? 'Weka Kiungo Kipya' : 'Add Results Link'}</span>
                  </button>
                </div>
              </div>

              {/* Filter Pills & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="links-search-input"
                    type="text"
                    value={linksSearchQuery}
                    onChange={(e) => setLinksSearchQuery(e.target.value)}
                    placeholder={language === 'sw' ? 'Tafuta mtihani au kidato (mfano: CSEE, Kidato cha Nne, Mock)...' : 'Search exam link (e.g. CSEE, Form 4, Mock)...'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-medium"
                  />
                  {linksSearchQuery && (
                    <button
                      onClick={() => setLinksSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
                    >
                      Futa
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <select
                    id="links-filter-form"
                    value={linksSelectedForm}
                    onChange={(e) => setLinksSelectedForm(e.target.value)}
                    aria-label={language === 'sw' ? 'Chuja kwa Kidato' : 'Filter by Class'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="ALL">{language === 'sw' ? 'Madarasa Yote' : 'All Classes'}</option>
                    <option value="Form 4">Kidato cha 4 (Form Four)</option>
                    <option value="Form 3">Kidato cha 3 (Form Three)</option>
                    <option value="Form 2">Kidato cha 2 (Form Two)</option>
                    <option value="Form 1">Kidato cha 1 (Form One)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    id="links-filter-year"
                    value={linksSelectedYear}
                    onChange={(e) => setLinksSelectedYear(e.target.value)}
                    aria-label={language === 'sw' ? 'Chuja kwa Mwaka' : 'Filter by Year'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="ALL">{language === 'sw' ? 'Miaka Yote' : 'All Years'}</option>
                    <option value="2026">Mwaka 2026</option>
                    <option value="2025">Mwaka 2025</option>
                    <option value="2024">Mwaka 2024</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Links Cards Grid */}
            {filteredResultsLinks.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                  <Globe className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">
                    {language === 'sw' ? 'Hakuna viungo vilivyopatikana' : 'No results links found'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {language === 'sw'
                      ? 'Jaribu kubadilisha neno la kutafuta au bonyeza kitufe cha "Weka Kiungo Kipya" kuongeza kiungo cha matokeo.'
                      : 'Try adjusting your filters or click "Add Results Link" to publish a new examination link.'}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setLinksSearchQuery('');
                      setLinksSelectedForm('ALL');
                      setLinksSelectedYear('ALL');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    {language === 'sw' ? 'Onyesha Vyote' : 'Reset Filters'}
                  </button>
                  <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {language === 'sw' ? '+ Weka Kiungo cha Kwanza' : '+ Add First Link'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredResultsLinks.map((doc) => {
                  const targetUrl = doc.externalUrl || `https://onlinesys.necta.go.tz/results/${doc.year}/csee/results/s0486.htm`;

                  return (
                    <div
                      key={doc.id}
                      id={`result-card-${doc.id}`}
                      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3.5">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-200 font-mono">
                            {doc.form} • {doc.year}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{language === 'sw' ? 'Kiungo Kiko Hewani' : 'Active Link'}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                          {language === 'sw' ? doc.titleSw : doc.titleEn}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {language === 'sw' ? doc.descriptionSw : doc.descriptionEn}
                        </p>

                        {/* Summary Metrics Box */}
                        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-500 font-medium">
                            <span>{language === 'sw' ? 'Aina ya Mtihani:' : 'Exam Type:'}</span>
                            <span className="font-bold text-slate-800 font-mono text-[11px]">{doc.examType}</span>
                          </div>
                          {doc.totalCandidates > 0 && (
                            <div className="flex items-center justify-between text-slate-500 font-medium">
                              <span>{language === 'sw' ? 'Watahiniwa:' : 'Candidates:'}</span>
                              <span className="font-bold text-slate-800">{doc.totalCandidates} Wanafunzi</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-slate-500 font-medium">
                            <span>{language === 'sw' ? 'Ufaulu wa Jumla:' : 'Performance Summary:'}</span>
                            <span className="font-black text-emerald-800">{doc.divisionSummary}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400 text-[10px]">
                            <span>{language === 'sw' ? 'Tarehe ya Kutolewa:' : 'Published Date:'}</span>
                            <span className="font-mono">{doc.datePublished}</span>
                          </div>
                        </div>
                      </div>

                      {/* Primary Link Action Button & Utilities */}
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        {/* Direct Parent Click Button */}
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          id={`link-open-results-${doc.id}`}
                          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-amber-300 hover:text-amber-200 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01] cursor-pointer"
                          aria-label={`${language === 'sw' ? 'Bofya kufungua matokeo ya' : 'Click to open results of'} ${doc.titleSw}`}
                        >
                          <ExternalLink className="w-5 h-5 text-amber-300" />
                          <span>{language === 'sw' ? 'Bofya Hapa Kufungua Matokeo' : 'Click Here to Open Results'}</span>
                        </a>

                        <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5 font-mono truncate px-2">
                          <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{targetUrl}</span>
                        </p>

                        {/* Action buttons (Copy, WhatsApp, Edit, Delete) */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyResultsLink(targetUrl, doc.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title={language === 'sw' ? 'Nakili kiungo hiki' : 'Copy link'}
                            >
                              {copiedLinkId === doc.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 font-bold">{language === 'sw' ? 'Kimenakiliwa!' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{language === 'sw' ? 'Nakili' : 'Copy'}</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                const shareTxt = encodeURIComponent(
                                  `Matokeo Rasmi ya ${doc.titleSw} - Shule ya Sekondari Uomboni (S0486):\nBofya kiungo hiki kufungua matokeo mtandaoni: ${targetUrl}`
                                );
                                window.open(`https://wa.me/?text=${shareTxt}`, '_blank', 'noopener,noreferrer');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Shiriki kwenye WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(doc)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                              title={language === 'sw' ? 'Hariri Kiungo' : 'Edit Link'}
                              aria-label={language === 'sw' ? 'Hariri Kiungo' : 'Edit Link'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteResultsLink(doc.id, doc.titleSw)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                              title={language === 'sw' ? 'Futa Kiungo' : 'Delete Link'}
                              aria-label={language === 'sw' ? 'Futa Kiungo' : 'Delete Link'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INDIVIDUAL STUDENT RESULT SLIP */}
        {activeTab === 'individual' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search & Filter Controls */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search Input (Col 6) */}
                <div className="md:col-span-6 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="results-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('results.searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-semibold"
                    >
                      Futa
                    </button>
                  )}
                </div>

                {/* Class Filter (Col 3) */}
                <div className="md:col-span-3">
                  <select
                    id="results-form-filter"
                    value={selectedForm}
                    onChange={(e) => setSelectedForm(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    <option value="ALL">{language === 'sw' ? 'Kidato Chote (Form 1-4)' : 'All Classes (Form 1-4)'}</option>
                    <option value="Form 1">Kidato cha Kwanza (Form 1)</option>
                    <option value="Form 2">Kidato cha Pili (Form 2)</option>
                    <option value="Form 3">Kidato cha Tatu (Form 3)</option>
                    <option value="Form 4">Kidato cha Nne (Form 4)</option>
                  </select>
                </div>

                {/* Exam Type Filter (Col 3) */}
                <div className="md:col-span-3">
                  <select
                    id="results-exam-filter"
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    <option value="ALL">{language === 'sw' ? 'Mitihani Yote' : 'All Exam Types'}</option>
                    <option value="NECTA Mock 2025">NECTA Mock 2025</option>
                    <option value="Annual Examination 2025">Annual Examination 2025</option>
                    <option value="Mid-Term Exam 2025">Mid-Term Exam 2025</option>
                  </select>
                </div>
              </div>

              {/* Quick Click Sample Students List (Only shown if results exist) */}
              {studentResults.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-emerald-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {language === 'sw' ? 'Wanafunzi wa Mfano / Orodha:' : 'Quick Select:'}
                  </span>
                  {studentResults.slice(0, 6).map((student, sIdx) => (
                    <button
                      key={`${student.id}-${student.examNumber || sIdx}-${sIdx}`}
                      onClick={() => {
                        setActiveResult(student);
                        setSearchQuery(student.examNumber);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                        activeResult?.id === student.id
                          ? 'bg-emerald-800 text-white border-emerald-900 font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {student.studentName.split(' ')[0]} ({student.examNumber.split('/')[1] || student.examNumber})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results Presentation Grid */}
            {filteredResults.length === 0 ? (
              <div className="bg-white p-10 sm:p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8 text-emerald-700" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {studentResults.length === 0
                      ? language === 'sw'
                        ? 'Hakuna Matokeo Yaliyochapishwa Mtandaoni kwa Sasa'
                        : 'No Published Examination Results Yet'
                      : language === 'sw'
                      ? 'Hakuna Matokeo Yaliyopatikana'
                      : 'No Matching Student Results'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {studentResults.length === 0
                      ? language === 'sw'
                        ? 'Matokeo rasmi ya mitihani ya ndani na ya NECTA yatachapishwa hapa baada ya mitihani kukamilika.'
                        : 'Official school and NECTA exam results will be published here once examinations are concluded.'
                      : language === 'sw'
                      ? 'Hakikisha namba ya mtihani imeandikwa kwa usahihi kama ilivyo kwenye fomu ya mtihani (mfano S0486/0001/2025).'
                      : 'Please verify the exam number format matches school records (e.g., S0486/0001/2025).'}
                  </p>
                </div>
                
                {studentResults.length === 0 ? (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={loadInitialResults}
                      className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-md inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{language === 'sw' ? 'Pakia Matokeo Rasmi ya Mfano (Kituo S0486)' : 'Load Sample Examination Results (Center S0486)'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedForm('ALL');
                        setSelectedExam('ALL');
                        setActiveResult(studentResults[0]);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      {language === 'sw' ? 'Onyesha Wanafunzi Wote' : 'Show All Students'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: List of Found Students (Col 4) */}
                <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">
                      {language === 'sw' ? 'Wanafunzi Waliopatikana' : 'Matched Students'} ({filteredResults.length})
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">NECTA S0486</span>
                  </div>

                  <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                    {filteredResults.map((st, fIdx) => (
                      <div
                        key={`${st.id}-${st.examNumber || fIdx}-${fIdx}`}
                        onClick={() => setActiveResult(st)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                          activeResult?.id === st.id
                            ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                            : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-emerald-900">
                            {st.examNumber}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDivisionBadgeColor(
                                st.division
                              )}`}
                            >
                              {st.division}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">
                          {st.studentName}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 pt-1 border-t border-slate-200/50">
                          <span>{st.form} • {st.stream}</span>
                          <span className="font-semibold text-emerald-800">{st.averageMarks}% (Pts: {st.points})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Protected Parent-Only Access Panel (Col 8) */}
                {activeResult && (
                  <div className="lg:col-span-8 space-y-4">
                    {/* Security Notice & Parent Access Gate */}
                    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white border-2 border-emerald-500/30 shadow-xl relative overflow-hidden">
                      <div className="absolute right-4 -bottom-6 opacity-10 text-9xl font-black select-none pointer-events-none">
                        🔒
                      </div>

                      <div className="relative z-10 space-y-5">
                        {/* Security Tag */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                            <Lock className="w-3.5 h-3.5" />
                            <span>{language === 'sw' ? 'TAARIFA YA FARAGHA YA MWANAFUNZI' : 'STUDENT DATA PRIVACY & ACCESS'}</span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-300 font-bold">
                            NECTA S0486 • SHULE YA SEKONDARI UOMBONI
                          </span>
                        </div>

                        {/* Title & Explanation */}
                        <div className="space-y-2">
                          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                            {language === 'sw'
                              ? 'Ripoti Rasmi ya Mwanafunzi (Report Card) Inapatikana kwa Mzazi Pekee'
                              : 'Official Student Report Card is Private to Parents & Guardians'}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                            {language === 'sw'
                              ? 'Kwa mujibu wa taratibu za shule na kanuni za ulinzi wa taarifa na faragha ya mwanafunzi (Student Privacy Policy), ripoti kamili ya maendeleo (Report Card) yenye alama za kina za masomo, mwenendo wa tabia, na maoni ya Mkuu wa Shule haionekani hadharani kwenye ukurasa huu wa mwanzo. Mzazi au mlezi anapaswa kuingia kwenye Ukurasa wa Mzazi / Mlezi kutazama na kupakua ripoti hii.'
                              : 'In accordance with school policy and student privacy regulations, comprehensive terminal and annual report cards containing detailed subject marks, conduct assessments, and headmaster endorsements are not displayed on the public home page. Parents and guardians must access the dedicated Parent Portal to view and download official report cards.'}
                          </p>
                        </div>

                        {/* Verified Student Confirmation Badge */}
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                              {language === 'sw' ? 'Mwanafunzi' : 'Student Name'}
                            </span>
                            <span className="font-bold text-white text-sm truncate block mt-0.5">
                              {activeResult.studentName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                              {language === 'sw' ? 'Namba ya Mtihani' : 'Exam Number'}
                            </span>
                            <span className="font-bold font-mono text-amber-300 text-sm block mt-0.5">
                              {activeResult.examNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                              {language === 'sw' ? 'Kidato & Mkondo' : 'Class & Stream'}
                            </span>
                            <span className="font-bold text-white text-sm block mt-0.5">
                              {activeResult.form} ({activeResult.stream})
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                              {language === 'sw' ? 'Ufaulu wa Jumla' : 'Overall Division'}
                            </span>
                            <span className="font-black text-emerald-300 text-sm block mt-0.5">
                              {activeResult.division}
                            </span>
                          </div>
                        </div>

                        {/* Primary Action CTA: Open Parent Portal */}
                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <button
                            type="button"
                            onClick={handleOpenParent}
                            id="btn-open-parent-portal-from-results"
                            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer border border-amber-300"
                          >
                            <Lock className="w-4 h-4 text-emerald-950" />
                            <span>
                              {language === 'sw'
                                ? 'Fungua Ukurasa wa Mzazi Kutazama Report Card'
                                : 'Open Parent Portal to View Report Card'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-emerald-950" />
                          </button>

                          <a
                            href="https://wa.me/255745548225?text=Habari%20Mtaaluma%2C%20ninaomba%20msaada%20wa%20kufungua%20Report%20Card%20ya%20mwanafunzi%20kupitia%20ukurasa%20wa%20mzazi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-white/15 transition-colors"
                          >
                            <span>{language === 'sw' ? 'Msaada wa Mtaaluma (0745548225)' : 'Academic Master (0745548225)'}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Guide for Parents */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>
                          {language === 'sw'
                            ? 'Jinsi Mzazi Anavyoweza Kupata & Kupakua Report Card:'
                            : 'How Parents & Guardians Access the Official Report Card:'}
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-xs">
                            1
                          </div>
                          <span className="font-bold text-slate-900 block">
                            {language === 'sw' ? 'Bofya "Portal ya Mzazi"' : 'Click "Parent Portal"'}
                          </span>
                          <p className="text-slate-600 leading-relaxed">
                            {language === 'sw'
                              ? 'Bofya kitufe cha Portal ya Mzazi kilichopo juu ya ukurasa au hapo kwenye bango.'
                              : 'Click the Parent Portal button in the top navigation or banner above.'}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-xs">
                            2
                          </div>
                          <span className="font-bold text-slate-900 block">
                            {language === 'sw' ? 'Weka Namba ya Simu au Mtoto' : 'Enter Phone or Student ID'}
                          </span>
                          <p className="text-slate-600 leading-relaxed">
                            {language === 'sw'
                              ? `Ingiza namba yako ya simu au namba ya mtihani ya mwanafunzi (${activeResult.examNumber}).`
                              : `Enter your registered phone number or student examination number (${activeResult.examNumber}).`}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-xs">
                            3
                          </div>
                          <span className="font-bold text-slate-900 block">
                            {language === 'sw' ? 'Pakua Report Card (PDF)' : 'Download Report Card (PDF)'}
                          </span>
                          <p className="text-slate-600 leading-relaxed">
                            {language === 'sw'
                              ? 'Fungua kichupo cha "Matokeo & Taaluma" kupakua au kuchapisha Report Card rasmi.'
                              : 'Open the "Results & Academics" tab to view, print, or download the official stamped PDF.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLASS BROADSHEET & EXCEL/PDF EXPORT */}
        {activeTab === 'broadsheet' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Broadsheet Controls & Action Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {language === 'sw' ? 'Chagua Kidato' : 'Select Class'}
                  </label>
                  <select
                    value={selectedForm}
                    onChange={(e) => setSelectedForm(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                  >
                    <option value="ALL">Wanafunzi Wote (Form 1 - 4)</option>
                    <option value="Form 1">Form 1 (Kidato cha 1)</option>
                    <option value="Form 2">Form 2 (Kidato cha 2)</option>
                    <option value="Form 3">Form 3 (Kidato cha 3)</option>
                    <option value="Form 4">Form 4 (Kidato cha 4)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {language === 'sw' ? 'Aina ya Mtihani' : 'Exam Type'}
                  </label>
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                  >
                    <option value="ALL">Mitihani Yote</option>
                    <option value="NECTA Mock 2025">NECTA Mock 2025</option>
                    <option value="Annual Examination 2025">Annual Examination 2025</option>
                    <option value="Mid-Term Exam 2025">Mid-Term Exam 2025</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons for Broadsheet */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleDownloadBroadsheet}
                  id="btn-download-class-broadsheet-pdf"
                  className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{language === 'sw' ? 'Pakua Broadsheet (PDF)' : 'Download Broadsheet (PDF)'}</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  id="btn-export-broadsheet-excel"
                  className="px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'sw' ? 'Hamisha Excel (.xlsx)' : 'Export Excel (.xlsx)'}</span>
                </button>
              </div>
            </div>

            {/* Division Counters Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-600 text-white shadow-sm text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">DIVISION I</span>
                <span className="text-xl font-black block mt-0.5">
                  {filteredResults.filter((r) => r.division === 'Division I').length}
                </span>
                <span className="text-[10px] opacity-80">
                  ({((filteredResults.filter((r) => r.division === 'Division I').length / (filteredResults.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-sm text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">DIVISION II</span>
                <span className="text-xl font-black block mt-0.5">
                  {filteredResults.filter((r) => r.division === 'Division II').length}
                </span>
                <span className="text-[10px] opacity-80">
                  ({((filteredResults.filter((r) => r.division === 'Division II').length / (filteredResults.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-600 text-white shadow-sm text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">DIVISION III</span>
                <span className="text-xl font-black block mt-0.5">
                  {filteredResults.filter((r) => r.division === 'Division III').length}
                </span>
                <span className="text-[10px] opacity-80">
                  ({((filteredResults.filter((r) => r.division === 'Division III').length / (filteredResults.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-600 text-white shadow-sm text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">DIVISION IV</span>
                <span className="text-xl font-black block mt-0.5">
                  {filteredResults.filter((r) => r.division === 'Division IV').length}
                </span>
                <span className="text-[10px] opacity-80">
                  ({((filteredResults.filter((r) => r.division === 'Division IV').length / (filteredResults.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800 text-white shadow-sm text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">JUMLA YA WANAFUNZI</span>
                <span className="text-xl font-black block mt-0.5">{filteredResults.length}</span>
                <span className="text-[10px] text-emerald-300 font-bold">Ufaulu wa Juu</span>
              </div>
            </div>

            {/* Broadsheet Tabular Data Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[11px]">
                      <th className="py-3 px-3 text-center">NAFASI</th>
                      <th className="py-3 px-3">NAMBA YA MTIHANI</th>
                      <th className="py-3 px-3">JINA LA MWANAFUNZI</th>
                      <th className="py-3 px-2 text-center">JINSIA</th>
                      <th className="py-3 px-2 text-center">KIDATO</th>
                      <th className="py-3 px-2 text-center">CIV</th>
                      <th className="py-3 px-2 text-center">HIST</th>
                      <th className="py-3 px-2 text-center">GEO</th>
                      <th className="py-3 px-2 text-center">KISW</th>
                      <th className="py-3 px-2 text-center">ENG</th>
                      <th className="py-3 px-2 text-center">PHY</th>
                      <th className="py-3 px-2 text-center">CHEM</th>
                      <th className="py-3 px-2 text-center">BIO</th>
                      <th className="py-3 px-2 text-center">BAM</th>
                      <th className="py-3 px-2 text-center">RE</th>
                      <th className="py-3 px-3 text-center">WASTANI</th>
                      <th className="py-3 px-2 text-center">POINTI</th>
                      <th className="py-3 px-3 text-center">DARAJA</th>
                      <th className="py-3 px-3 text-center">HATI (PDF)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredResults.map((st, idx) => {
                      const getSubStr = (code: string) => {
                        const s = st.subjects.find((sub) => sub.code === code || sub.code.includes(code));
                        if (!s) return '-';
                        return `${s.score}${s.grade}`;
                      };

                      return (
                        <tr
                          key={st.id}
                          className="hover:bg-emerald-50/50 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                            #{st.classPosition || idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-900">
                            {st.examNumber}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {st.studentName}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-600 font-semibold">{st.gender}</td>
                          <td className="py-2.5 px-2 text-center text-slate-600">{st.form.replace('Form ', 'F.')}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px]">{getSubStr('011')}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px]">{getSubStr('012')}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px]">{getSubStr('013')}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px] font-bold text-emerald-800">{getSubStr('021')}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px]">{getSubStr('022')}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px]">{getSubStr('031')}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px]">{getSubStr('032')}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px]">{getSubStr('033')}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px] font-bold">{getSubStr('041')}</td>
                          <td className="py-2.5 px-2 text-center font-mono text-[11px] text-purple-800">{getSubStr('071')}</td>
                          <td className="py-2.5 px-3 text-center font-black text-slate-900">{st.averageMarks}%</td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-900">{st.points}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDivisionBadgeColor(
                                st.division
                              )}`}
                            >
                              {st.division}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={handleOpenParent}
                              className="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-slate-900 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer border border-amber-300"
                              title={language === 'sw' ? 'Report Card inapatikana kwenye Ukurasa wa Mzazi' : 'Report card is accessible in Parent Portal'}
                            >
                              <Lock className="w-3 h-3 text-amber-800" />
                              <span>{language === 'sw' ? 'Mzazi' : 'Parent'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXCEL WORKFLOW & IMPORT GUIDE */}
        {activeTab === 'excelSync' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {language === 'sw'
                      ? 'Mfumo wa Kusakinisha Matokeo Kutoka Excel kwenda Website & PDF'
                      : 'Excel to Web & PDF Examination Publishing Workflow'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {language === 'sw'
                      ? 'Walimu na Wakuu wa Idara wanaweza kuandaa matokeo kwenye Excel na kuingiza moja kwa moja kwenye tovuti.'
                      : 'Teachers and Exam Officers can prepare marksheets in Excel and publish directly to the live portal.'}
                  </p>
                </div>
              </div>

              {/* 3 Step Visual Guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'sw' ? 'Pakua Kiolezo cha Excel' : 'Download Excel Template'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'sw'
                      ? 'Tumia kiolezo rasmi chenye safuwima za namba ya mtihani, jina, jinsia na alama za masomo ya NECTA.'
                      : 'Download our standard template with columns for exam number, names, gender, and NECTA subject scores.'}
                  </p>
                  <button
                    onClick={downloadExcelTemplate}
                    id="btn-download-excel-template-tab"
                    className="mt-2 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>{language === 'sw' ? 'Pakua Kiolezo (.xlsx)' : 'Download Template (.xlsx)'}</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-800 text-white flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'sw' ? 'Jaza Alama za Wanafunzi' : 'Fill Student Marksheets'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'sw'
                      ? 'Weka alama (0-100) kwa kila somo. Mfumo utakokotoa madaraja (A-F), pointi, na division kiotomatiki.'
                      : 'Input scores (0-100). The engine automatically calculates grades (A-F), NECTA points, and divisions.'}
                  </p>
                  <div className="text-[11px] text-blue-700 font-semibold pt-2">
                    ✓ Huondoa makosa ya ukokotoaji
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-emerald-950 flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'sw' ? 'Pakia & Sakinisha Kwenye Tovuti' : 'Upload & Publish Live'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'sw'
                      ? 'Baada ya kupakia faili la Excel, mfumo unazalisha matokeo rasmi ya kila mwanafunzi na ripoti za madaraja kiotomatiki.'
                      : 'Once the Excel spreadsheet is uploaded by the administration, student result slips and broadsheets generate automatically.'}
                  </p>
                </div>
              </div>

              {/* Security and Accuracy Notice */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>
                    {language === 'sw'
                      ? 'Uthibitishaji na Usalama wa Matokeo ya Shule'
                      : 'Data Verification & Security Guaranteed'}
                  </span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  {language === 'sw'
                    ? 'Kila hati ya matokeo (PDF Result Slip) inayozalishwa inakuwa na muhuri rasmi wa kielektroniki, namba ya kituo NECTA S0486, na maoni rasmi ya Mkuu wa Shule kuzuia uhariri au kughushi.'
                    : 'Every student PDF slip generated includes our official institutional seal, NECTA S0486 center code, and Headmaster signature.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal for PDF Doc Preview */}
        {previewPdfDoc && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <h4 className="text-sm font-bold text-slate-900">Nyaraka Rasmi ya Matokeo</h4>
                </div>
                <button
                  onClick={() => setPreviewPdfDoc(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'sw' ? previewPdfDoc.titleSw : previewPdfDoc.titleEn}
                </h3>
                <p>{language === 'sw' ? previewPdfDoc.descriptionSw : previewPdfDoc.descriptionEn}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-medium">
                    <span>Kidato:</span>
                    <span className="font-bold text-slate-800">{previewPdfDoc.form}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Aina ya Mtihani:</span>
                    <span className="font-bold text-slate-800">{previewPdfDoc.examType}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Jumla ya Watahiniwa:</span>
                    <span className="font-bold text-emerald-800">{previewPdfDoc.totalCandidates} Wanafunzi</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Ufaulu wa Madaraja:</span>
                    <span className="font-bold text-emerald-800">{previewPdfDoc.divisionSummary}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setPreviewPdfDoc(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Funga
                </button>
                {previewPdfDoc.externalUrl && (
                  <a
                    href={previewPdfDoc.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                    <span>Fungua NECTA Live</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    handleDownloadBroadsheet();
                    setPreviewPdfDoc(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pakua PDF Sasa</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT RESULTS LINK */}
        {isAddLinkModalOpen && (
          <div
            id="modal-add-results-link"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          >
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-700/60 border border-emerald-400/30 flex items-center justify-center text-amber-300">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editingDocId
                        ? (language === 'sw' ? 'Hariri Kiungo cha Matokeo' : 'Edit Results Link')
                        : (language === 'sw' ? 'Weka Kiungo Kipya cha Matokeo' : 'Add New Results Link')}
                    </h3>
                    <p className="text-[11px] text-emerald-200 font-medium">
                      {language === 'sw'
                        ? 'Wazazi wakibonyeza, kiungo hiki kitafungua matokeo mara moja.'
                        : 'Parents can click this link to open results instantly.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddLinkModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Funga"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveResultsLink} className="p-6 overflow-y-auto space-y-4 flex-1">
                {modalError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{modalError}</span>
                  </div>
                )}

                {modalSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{modalSuccess}</span>
                  </div>
                )}

                {/* Exam Title (Swahili) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    {language === 'sw' ? 'Jina la Mtihani / Matokeo *' : 'Examination Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={linkFormData.titleSw}
                    onChange={(e) => setLinkFormData({ ...linkFormData, titleSw: e.target.value })}
                    placeholder={language === 'sw' ? 'Mfano: Matokeo ya NECTA CSEE 2025 - Kidato cha Nne' : 'e.g. NECTA CSEE 2025 Form Four Results'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Results URL / Link */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    {language === 'sw' ? 'Kiungo / Link ya Matokeo (URL) *' : 'Results URL / Link *'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={linkFormData.externalUrl}
                        onChange={(e) => setLinkFormData({ ...linkFormData, externalUrl: e.target.value })}
                        placeholder="https://onlinesys.necta.go.tz/results/2025/csee/results/s0486.htm"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    {linkFormData.externalUrl && (
                      <button
                        type="button"
                        onClick={handleTestUrl}
                        className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Jaribu kufungua kiungo hiki kwenye dirisha jipya"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Jaribu</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {language === 'sw'
                      ? 'Unaweza kuweka link ya NECTA, Google Drive, au tovuti yoyote rasmi ya matokeo.'
                      : 'You can paste links from NECTA, Google Drive, or any official results web page.'}
                  </p>
                </div>

                {/* Class & Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      {language === 'sw' ? 'Kidato / Darasa' : 'Class / Form'}
                    </label>
                    <select
                      value={linkFormData.form}
                      onChange={(e) => setLinkFormData({ ...linkFormData, form: e.target.value as any })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Form 4">Kidato cha 4 (Form Four)</option>
                      <option value="Form 3">Kidato cha 3 (Form Three)</option>
                      <option value="Form 2">Kidato cha 2 (Form Two)</option>
                      <option value="Form 1">Kidato cha 1 (Form One)</option>
                      <option value="All Forms">Madarasa Yote (All Forms)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      {language === 'sw' ? 'Mwaka wa Mtihani' : 'Exam Year'}
                    </label>
                    <input
                      type="number"
                      value={linkFormData.year}
                      onChange={(e) => setLinkFormData({ ...linkFormData, year: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Exam Type & Total Candidates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      {language === 'sw' ? 'Aina ya Mtihani' : 'Exam Category'}
                    </label>
                    <input
                      type="text"
                      value={linkFormData.examType}
                      onChange={(e) => setLinkFormData({ ...linkFormData, examType: e.target.value })}
                      placeholder="NECTA CSEE / Mock / Midterm"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      {language === 'sw' ? 'Idadi ya Watahiniwa' : 'Candidates Count'}
                    </label>
                    <input
                      type="number"
                      value={linkFormData.totalCandidates}
                      onChange={(e) => setLinkFormData({ ...linkFormData, totalCandidates: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Performance / Division Summary */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    {language === 'sw' ? 'Muhtasari wa Ufaulu' : 'Performance Summary'}
                  </label>
                  <input
                    type="text"
                    value={linkFormData.divisionSummary}
                    onChange={(e) => setLinkFormData({ ...linkFormData, divisionSummary: e.target.value })}
                    placeholder={language === 'sw' ? 'Mfano: Wanafunzi 28 Wamefaulu Wote (100% Pass)' : 'e.g. 100% Pass Rate'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    {language === 'sw' ? 'Maelekezo kwa Wazazi (Hiari)' : 'Note for Parents (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={linkFormData.descriptionSw}
                    onChange={(e) => setLinkFormData({ ...linkFormData, descriptionSw: e.target.value })}
                    placeholder={language === 'sw' ? 'Bofya kiungo hiki kufungua matokeo rasmi ya mtihani huu mtandaoni...' : 'Click link to access official results...'}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Security Passcode Confirmation */}
                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-1.5">
                  <label className="text-xs font-black text-amber-900 block flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{language === 'sw' ? 'Neno la Siri la Uongozi wa Shule *' : 'School Admin Passcode *'}</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={linkFormData.adminPasscode}
                    onChange={(e) => setLinkFormData({ ...linkFormData, adminPasscode: e.target.value })}
                    placeholder="Weka neno la siri: uomboni2025"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-slate-900 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-amber-800">
                    {language === 'sw'
                      ? 'Kulinda usalama na uadilifu wa mfumo, tumia neno la siri la shule: uomboni2025'
                      : 'For website security & compliance, enter school passcode: uomboni2025'}
                  </p>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddLinkModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {language === 'sw' ? 'Ghairi' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>{language === 'sw' ? 'Hifadhi Kiungo cha Matokeo' : 'Publish Results Link'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Result Verification Modal with QR Code */}
        <ResultVerificationModal
          student={verificationStudent}
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
        />
      </div>
    </section>
  );
};
