import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { signInWithGoogle, getUserProfile } from '../lib/firebase';
import { checkStaffAuthorization, logStaffAuthAttempt } from '../services/staffSecurityService';
import { GoogleSignInButton } from './GoogleSignInButton';
import { WorldClassLoginView, PortalLoginRole } from './WorldClassLoginView';
import { SchoolLogo } from './SchoolLogo';
import {
  StudentResult,
  UrgentAlert,
  ResultsPdfDocument,
  StudentProfile,
  SchoolAsset,
  TimetableSlot,
  StudentNotice,
  Teacher,
  OnlineApplication,
  GalleryPhoto,
  NewsItem,
} from '../types';
import {
  ShieldCheck,
  Lock,
  X,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Users,
  Award,
  CreditCard,
  MessageSquare,
  Bell,
  FileSpreadsheet,
  FileText,
  Upload,
  Download,
  Sparkles,
  LogOut,
  Save,
  Check,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  FileCheck,
  GraduationCap,
  PackageCheck,
  Calendar,
  Search,
  BookOpen,
  UserPlus,
  Package,
  Layers,
  ArrowRightLeft,
  RotateCcw,
  ClipboardCheck,
  UserCheck,
  Printer,
  PhoneCall,
  Send,
  ExternalLink,
  Filter,
  Mail,
  Phone,
  Briefcase,
  UserCog,
  Camera,
  Image,
  Loader2,
  Database,
  Radio,
  Megaphone,
} from 'lucide-react';
import { parseExcelResultsFile, downloadExcelTemplate, exportResultsToExcel } from '../utils/excelService';
import { downloadStudentResultSlipPdf, downloadClassBroadsheetPdf, downloadAdmissionVerificationLetterPdf } from '../utils/pdfService';
import { processImageFile } from '../utils/imageUploadHelper';
import { AdminStudentCouncilTab } from './admin/AdminStudentCouncilTab';
import { AdminSchoolProfileTab } from './admin/AdminSchoolProfileTab';
import { AdminBankAccountsTab } from './admin/AdminBankAccountsTab';
import { AdminEventsTab } from './admin/AdminEventsTab';
import { AdminAdmissionDocsTab } from './admin/AdminAdmissionDocsTab';
import { AdminSystemArchitectureTab } from './admin/AdminSystemArchitectureTab';
import { SystemArchitectureModal } from './SystemArchitectureModal';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBursar?: () => void;
  onOpenAcademic?: (role: 'teacher' | 'academic_master') => void;
  onOpenJoiningInstructions?: () => void;
  onOpenVituMuhimu?: () => void;
  onOpenAdmissions?: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  onOpenBursar,
  onOpenAcademic,
  onOpenJoiningInstructions,
  onOpenVituMuhimu,
  onOpenAdmissions,
}) => {
  const { language } = useLanguage();
  const {
    applications,
    submitOnlineApplication,
    updateApplicationStatus,
    deleteOnlineApplication,
    convertApplicationToStudent,
    studentResults,
    addStudentResult,
    bulkAddStudentResults,
    bulkReplaceStudentResults,
    deleteStudentResult,
    resultsPdfDocuments,
    addResultsPdfDoc,
    deleteResultsPdfDoc,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    schoolAssets,
    addSchoolAsset,
    updateSchoolAsset,
    deleteSchoolAsset,
    assignAssetToStudent,
    returnSchoolAsset,
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    timetable,
    addTimetableSlot,
    deleteTimetableSlot,
    studentNotices,
    addStudentNotice,
    deleteStudentNotice,
    news,
    addNews,
    updateNews,
    deleteNews,
    clearAllNews,
    resetNewsToDefaults,
    paymentRecords,
    updatePaymentStatus,
    parentInquiries,
    updateInquiryStatus,
    alerts,
    addAlert,
    dismissAlert,
    toggleAlert,
    deleteAlert,
    clearAllAlerts,
    resetAlertsToDefaults,
    customLogoUrl,
    setCustomLogoUrl,
    resetLogoToDefault,
    galleryPhotos,
    addGalleryPhoto,
    updateGalleryPhoto,
    deleteGalleryPhoto,
    resetGalleryToDefaults,
    resetAllDataToDefaults,
    studentCouncil,
    bankAccounts,
    events,
    seedSampleData,
    clearSampleData,
    isServerSyncing,
    syncAllWithServer,
    lastServerSyncTime,
    isAdminLoggedIn,
    adminGoogleUser,
    loginAdmin,
    loginAdminWithGoogle,
    logoutAdmin,
    joiningDocs,
  } = useData();

  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminLoggedIn || false);
  const [adminEmail, setAdminEmail] = useState(() => adminGoogleUser?.email || 'admin@uomboni.sc.tz');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'google'>('password');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<
    | 'applications'
    | 'admissionDocs'
    | 'students'
    | 'assets'
    | 'teachers'
    | 'studentCouncil'
    | 'schoolProfile'
    | 'bankAccounts'
    | 'events'
    | 'timetable'
    | 'news'
    | 'notices'
    | 'excelUpload'
    | 'results'
    | 'pdfLibrary'
    | 'payments'
    | 'feedback'
    | 'alerts'
    | 'galleryPhotos'
    | 'logoSettings'
    | 'systemArchitecture'
  >('applications');

  const [isAdminArchModalOpen, setIsAdminArchModalOpen] = useState(false);

  // Online Applications State
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<'ALL' | 'Inasubiri Uhakiki' | 'Imethibitishwa' | 'Imekataliwa'>('ALL');
  const [appClassFilter, setAppClassFilter] = useState<string>('ALL');
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<OnlineApplication | null>(null);
  const [adminNoteEdit, setAdminNoteEdit] = useState('');
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualGender, setManualGender] = useState<'M' | 'F'>('M');
  const [manualDob, setManualDob] = useState('2012-04-15');
  const [manualApplyingFor, setManualApplyingFor] = useState<'Form 1' | 'Form 2 Transfer' | 'Form 3 Transfer' | 'Pre-Form 1'>('Form 1');
  const [manualEntryType, setManualEntryType] = useState<'Bweni (Boarding)' | 'Kutwa (Day)'>('Bweni (Boarding)');
  const [manualParentName, setManualParentName] = useState('');
  const [manualParentPhone, setManualParentPhone] = useState('');
  const [manualParentEmail, setManualParentEmail] = useState('');
  const [manualParentAddress, setManualParentAddress] = useState('Marangu, Kilimanjaro');
  const [manualPrevSchool, setManualPrevSchool] = useState('');
  const [manualPremNumber, setManualPremNumber] = useState('');
  const [manualPrimaryResult, setManualPrimaryResult] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  // Student Management State
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFormFilter, setStudentFormFilter] = useState('ALL');
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingStudentOriginal, setEditingStudentOriginal] = useState<StudentProfile | null>(null);
  const [stFullName, setStFullName] = useState('');
  const [stId, setStId] = useState('');
  const [stExamNo, setStExamNo] = useState('');
  const [stPremNumber, setStPremNumber] = useState('');
  const [stPrevSchool, setStPrevSchool] = useState('');
  const [stForm, setStForm] = useState<'Form 1' | 'Form 2' | 'Form 3' | 'Form 4'>('Form 1');
  const [stStream, setStStream] = useState<'A' | 'B' | 'Science' | 'Arts' | 'Commercial'>('A');
  const [stGender, setStGender] = useState<'M' | 'F'>('M');
  const [stBoarding, setStBoarding] = useState<'Bweni' | 'Kutwa'>('Bweni');
  const [stParentName, setStParentName] = useState('');
  const [stParentPhone, setStParentPhone] = useState('');
  const [stAddress, setStAddress] = useState('Moshi, Kilimanjaro');
  const [stDorm, setStDorm] = useState('Bweni la Mt. Thomas (Room 4)');

  // Assets Management State
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('ALL');
  const [assetSearch, setAssetSearch] = useState('');
  const [showAddAssetForm, setShowAddAssetForm] = useState(false);
  const [newAssetNameSw, setNewAssetNameSw] = useState('');
  const [newAssetNameEn, setNewAssetNameEn] = useState('');
  const [newAssetCode, setNewAssetCode] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<'Vitabu vya Maktaba' | 'Vifaa vya Maabara' | 'Kompyuta & Tehama' | 'Vifaa vya Mabweni' | 'Samani & Madawati' | 'Michezo'>('Vitabu vya Maktaba');
  const [newAssetCondition, setNewAssetCondition] = useState<'Mpya' | 'Nzuri Sana' | 'Nzuri' | 'Inahitaji Matengenezo'>('Nzuri Sana');
  const [newAssetLocation, setNewAssetLocation] = useState('Maktaba Kuu');
  const [newAssetQty, setNewAssetQty] = useState(1);

  // Asset Assignment Modal / State
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<SchoolAsset | null>(null);
  const [assigneeStudentId, setAssigneeStudentId] = useState('');
  const [assigneeReturnDate, setAssigneeReturnDate] = useState('2025-11-30');

  // Teacher Management State
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherDeptFilter, setTeacherDeptFilter] = useState('ALL');
  
  // Add Teacher Form State
  const [trName, setTrName] = useState('');
  const [trRoleSw, setTrRoleSw] = useState('Mwalimu wa Somo');
  const [trRoleEn, setTrRoleEn] = useState('Subject Teacher');
  const [trDepartment, setTrDepartment] = useState<'Sayansi (Science)' | 'Lugha (Languages)' | 'Sanaa (Humanities)' | 'Biashara (Commercial)' | 'Utawala (Administration)'>('Sayansi (Science)');
  const [trSubjects, setTrSubjects] = useState('Basic Mathematics, Physics');
  const [trPhone, setTrPhone] = useState('+255 754 000 000');
  const [trEmail, setTrEmail] = useState('');
  const [trQualification, setTrQualification] = useState('B.Ed Science - UDSM');
  const [trImageUrl, setTrImageUrl] = useState('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400');
  const [trExperienceYears, setTrExperienceYears] = useState(8);

  // Edit Teacher Modal & Form State
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editTrName, setEditTrName] = useState('');
  const [editTrRoleSw, setEditTrRoleSw] = useState('');
  const [editTrRoleEn, setEditTrRoleEn] = useState('');
  const [editTrDepartment, setEditTrDepartment] = useState<string>('Sayansi (Science)');
  const [editTrSubjects, setEditTrSubjects] = useState('');
  const [editTrQualification, setEditTrQualification] = useState('');
  const [editTrPhone, setEditTrPhone] = useState('');
  const [editTrEmail, setEditTrEmail] = useState('');
  const [editTrImageUrl, setEditTrImageUrl] = useState('');
  const [editTrExperienceYears, setEditTrExperienceYears] = useState(10);

  // Teacher Image Upload State
  const [trUploading, setTrUploading] = useState(false);
  const [editTrUploading, setEditTrUploading] = useState(false);
  const [cardTrUploadingId, setCardTrUploadingId] = useState<string | null>(null);

  // Timetable Management State
  const [showAddTimetableForm, setShowAddTimetableForm] = useState(false);
  const [ttDay, setTtDay] = useState<'Jumatatu' | 'Jumanne' | 'Jumatano' | 'Alhamisi' | 'Ijumaa'>('Jumatatu');
  const [ttForm, setTtForm] = useState<'Form 1' | 'Form 2' | 'Form 3' | 'Form 4'>('Form 1');
  const [ttSubject, setTtSubject] = useState('Basic Mathematics');
  const [ttTeacher, setTtTeacher] = useState('Mwl. John Massawe');
  const [ttStart, setTtStart] = useState('08:00 AM');
  const [ttEnd, setTtEnd] = useState('08:45 AM');
  const [ttRoom, setTtRoom] = useState('Room 101');

  // Notice Management State
  const [showAddNoticeForm, setShowAddNoticeForm] = useState(false);
  const [ntTitleSw, setNtTitleSw] = useState('');
  const [ntTitleEn, setNtTitleEn] = useState('');
  const [ntContentSw, setNtContentSw] = useState('');
  const [ntContentEn, setNtContentEn] = useState('');
  const [ntAudience, setNtAudience] = useState<'All' | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4'>('All');
  const [ntPriority, setNtPriority] = useState<'High' | 'Normal'>('Normal');
  const [ntRole, setNtRole] = useState('Makamu Mkuu wa Shule');

  // News & Live Animation Ticker Management State
  const [newsSearch, setNewsSearch] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>('ALL');
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsTitleSw, setNewsTitleSw] = useState('');
  const [newsTitleEn, setNewsTitleEn] = useState('');
  const [newsCategory, setNewsCategory] = useState<'Taaluma' | 'Matangazo' | 'Michezo' | 'Kikanisa' | 'Uongozi'>('Matangazo');
  const [newsExcerptSw, setNewsExcerptSw] = useState('');
  const [newsExcerptEn, setNewsExcerptEn] = useState('');
  const [newsContentSw, setNewsContentSw] = useState('');
  const [newsContentEn, setNewsContentEn] = useState('');
  const [newsDate, setNewsDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [newsAuthor, setNewsAuthor] = useState('Ofisi ya Mkuu wa Shule');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [newsFeatured, setNewsFeatured] = useState(true);
  const [newsStatusMsg, setNewsStatusMsg] = useState<string | null>(null);
  const [newsErrorMsg, setNewsErrorMsg] = useState<string | null>(null);

  // Excel Upload State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<StudentResult[]>([]);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single Student Result Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newExamNumber, setNewExamNumber] = useState('');
  const [newForm, setNewForm] = useState<'Form 1' | 'Form 2' | 'Form 3' | 'Form 4'>('Form 4');
  const [newStream, setNewStream] = useState<'A' | 'B' | 'Science' | 'Arts' | 'Commercial'>('A');
  const [newDivision, setNewDivision] = useState<'Division I' | 'Division II' | 'Division III' | 'Division IV' | 'Division 0'>('Division I');
  const [newPoints, setNewPoints] = useState(7);
  const [newAvg, setNewAvg] = useState(88.5);

  // New PDF Document State
  const [newPdfTitleSw, setNewPdfTitleSw] = useState('');
  const [newPdfTitleEn, setNewPdfTitleEn] = useState('');
  const [newPdfForm, setNewPdfForm] = useState<'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'All Forms'>('Form 4');
  const [newPdfExamType, setNewPdfExamType] = useState('NECTA CSEE National Examination');
  const [newPdfCandidates, setNewPdfCandidates] = useState(145);
  const [newPdfSummary, setNewPdfSummary] = useState('Div I: 104, Div II: 33, Div III: 8');

  // New Alert State
  const [newAlertSw, setNewAlertSw] = useState('');
  const [newAlertEn, setNewAlertEn] = useState('');
  const [newAlertLink, setNewAlertLink] = useState('results');

  // Custom Logo Upload State
  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Gallery Management State
  const [photoSearch, setPhotoSearch] = useState('');
  const [photoCategoryFilter, setPhotoCategoryFilter] = useState('ALL');
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [photoTitleSw, setPhotoTitleSw] = useState('');
  const [photoTitleEn, setPhotoTitleEn] = useState('');
  const [photoCategory, setPhotoCategory] = useState<string>('Matukio ya Kikanisa');
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoFilePreview, setPhotoFilePreview] = useState<string | null>(null);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const galleryPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const swapPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [swapTargetPhoto, setSwapTargetPhoto] = useState<GalleryPhoto | null>(null);

  const handlePasswordLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(false);
    setAuthErrorMessage('');
    const success = loginAdmin(adminPasswordInput);
    if (success) {
      setIsAuthenticated(true);
      setAdminEmail('tumainifundtrustfoundation@gmail.com');
    } else {
      setAuthError(true);
      setAuthErrorMessage(
        language === 'sw'
          ? 'Nenosiri la utawala si sahihi. Wasiliana na Mkuu wa Shule au IT Unit.'
          : 'Invalid administrator passcode. Please contact the Headmaster or IT Unit.'
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setAuthError(false);
    setAuthErrorMessage('');
    try {
      const res = await signInWithGoogle('admin');
      if (res.success && res.user) {
        const email = res.user.email || '';
        let firestoreRole: string | null = res.profile?.role || null;
        if (!firestoreRole && res.user.uid) {
          try {
            const profile = await getUserProfile(res.user.uid);
            firestoreRole = profile?.role || null;
          } catch {
            firestoreRole = null;
          }
        }

        const authCheck = checkStaffAuthorization(email, 'admin', firestoreRole);

        await logStaffAuthAttempt({
          email,
          roleRequested: 'admin',
          success: authCheck.authorized,
          reason: authCheck.authorized ? 'Admin access authorized via Google SSO' : 'Unauthorized admin access attempt',
          uid: res.user.uid,
        });

        if (!authCheck.authorized) {
          setAuthError(true);
          setAuthErrorMessage(language === 'sw' ? authCheck.reasonSw : authCheck.reasonEn);
          return;
        }

        loginAdminWithGoogle(res.user);
        setIsAuthenticated(true);
        if (res.user.email) setAdminEmail(res.user.email);
      } else {
        setAuthError(true);
        setAuthErrorMessage(
          res.error ||
            (language === 'sw'
              ? 'Imeshindwa kuingia na akaunti ya Google. Tafadhali jaribu tena.'
              : 'Failed to sign in with Google account. Please try again.')
        );
      }
    } catch (err: any) {
      setAuthError(true);
      setAuthErrorMessage(err?.message || 'Hitilafu ya uthibitishaji wa Google.');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    logoutAdmin();
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setIsParsingExcel(true);
    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);

    try {
      const results = await parseExcelResultsFile(file);
      if (results.length === 0) {
        setUploadErrorMsg(language === 'sw' ? 'Hakuna rekodi za wanafunzi zilizopatikana kwenye faili hili la Excel.' : 'No valid student records parsed from the Excel file.');
        setParsedStudents([]);
      } else {
        setParsedStudents(results);
      }
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Hitilafu ya kusoma faili la Excel.');
      setParsedStudents([]);
    } finally {
      setIsParsingExcel(false);
    }
  };

  // Online Applications Handlers
  const handleCreateManualApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentName.trim() || !manualParentName.trim() || !manualParentPhone.trim()) {
      alert(language === 'sw' ? 'Tafadhali jaza taarifa zote za lazima (Jina la mwanafunzi na mzazi)' : 'Please fill all required fields');
      return;
    }

    const created = submitOnlineApplication({
      studentName: manualStudentName.trim().toUpperCase(),
      gender: manualGender,
      dob: manualDob,
      applyingFor: manualApplyingFor,
      entryType: manualEntryType,
      previousSchool: manualPrevSchool.trim() || undefined,
      premNumber: manualPremNumber.trim() || undefined,
      primaryResults: manualPrimaryResult.trim() || undefined,
      parentName: manualParentName.trim(),
      parentPhone: manualParentPhone.trim(),
      parentEmail: manualParentEmail.trim() || undefined,
      parentAddress: manualParentAddress.trim() || undefined,
      adminNotes: manualNotes.trim() || 'Maombi yamesajiliwa moja kwa moja ofisini (Walk-in application).',
    });

    setManualStudentName('');
    setManualParentName('');
    setManualParentPhone('');
    setManualParentEmail('');
    setManualPrevSchool('');
    setManualPremNumber('');
    setManualPrimaryResult('');
    setManualNotes('');
    setShowAddAppModal(false);

    alert(
      language === 'sw'
        ? `Ombi namba ${created.applicationNumber} la mwanafunzi ${created.studentName} limesajiliwa kikamilifu!`
        : `Application ${created.applicationNumber} registered successfully!`
    );
  };

  const handleVerifyAndEnroll = (app: OnlineApplication) => {
    const defaultForm = app.applyingFor.includes('Form 2') ? 'Form 2' : app.applyingFor.includes('Form 3') ? 'Form 3' : 'Form 1';
    const confirmed = confirm(
      language === 'sw'
        ? `Je, unathibitisha na kumsajili rasmi "${app.studentName}" kama mwanafunzi wa ${defaultForm} Uomboni Secondary School?`
        : `Confirm and enroll "${app.studentName}" as a registered student in ${defaultForm}?`
    );

    if (!confirmed) return;

    try {
      const studentProfile = convertApplicationToStudent(app.id, defaultForm, 'A');
      alert(
        language === 'sw'
          ? `Hongera! Mwanafunzi ${studentProfile.fullName} amethibitishwa na kupewa Student ID: ${studentProfile.studentId}. Wasifu wake sasa upo kwenye daftari la wanafunzi.`
          : `Success! Student ${studentProfile.fullName} enrolled with ID: ${studentProfile.studentId}.`
      );
      if (selectedAppForDetail?.id === app.id) {
        setSelectedAppForDetail((prev) => (prev ? { ...prev, status: 'Imethibitishwa', enrolledStudentId: studentProfile.studentId } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Hitilafu wakati wa kuthibitisha');
    }
  };

  const handleCommitExcelResults = () => {
    if (parsedStudents.length === 0) return;

    if (importMode === 'replace') {
      bulkReplaceStudentResults(parsedStudents);
    } else {
      bulkAddStudentResults(parsedStudents);
    }

    setUploadSuccessMsg(
      language === 'sw'
        ? `Hongera! Wanafunzi ${parsedStudents.length} wamesakinishwa kikamilifu kwenye tovuti na PDF zao zipo tayari kupakuliwa.`
        : `Success! ${parsedStudents.length} student results imported and live on the website!`
    );
    setParsedStudents([]);
    setExcelFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Student Profile Handlers
  const resetStudentForm = () => {
    setStFullName('');
    setStId('');
    setStExamNo('');
    setStPremNumber('');
    setStPrevSchool('');
    setStParentName('');
    setStParentPhone('');
    setStAddress('Moshi, Kilimanjaro');
    setStDorm('Bweni la Mt. Thomas (Room 4)');
    setStForm('Form 1');
    setStStream('A');
    setStGender('M');
    setStBoarding('Bweni');
    setEditingStudentId(null);
    setEditingStudentOriginal(null);
    setShowAddStudentForm(false);
  };

  const handleStartEditStudent = (st: StudentProfile) => {
    setEditingStudentId(st.id);
    setEditingStudentOriginal(st);
    setStFullName(st.fullName || '');
    setStId(st.studentId || '');
    setStExamNo(st.examNumber || '');
    setStPremNumber(st.premNumber || '');
    setStPrevSchool(st.previousSchool || '');
    setStForm((st.form as any) || 'Form 1');
    setStStream((st.stream as any) || 'A');
    setStGender((st.gender as any) || 'M');
    const isBweni = st.boardingStatus?.toLowerCase().includes('bweni') || st.studentType?.toLowerCase().includes('bweni');
    setStBoarding(isBweni ? 'Bweni' : 'Kutwa');
    setStDorm(st.dormitoryRoom || 'Bweni la Mt. Thomas (Room 4)');
    setStParentName(st.parentGuardianName || st.parentName || '');
    setStParentPhone(st.parentPhone || '');
    setStAddress(st.address || st.residence || 'Moshi, Kilimanjaro');
    setShowAddStudentForm(true);

    // Scroll to form smoothly if in view
    setTimeout(() => {
      const el = document.getElementById('admin-student-edit-form-anchor');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCreateStudentProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stFullName.trim() || !stId.trim()) return;

    if (editingStudentId && editingStudentOriginal) {
      // Updating existing student
      const updatedStudent: StudentProfile = {
        ...editingStudentOriginal,
        studentId: stId.trim().toUpperCase(),
        examNumber: stExamNo.trim().toUpperCase() || editingStudentOriginal.examNumber,
        premNumber: stPremNumber.trim() || undefined,
        previousSchool: stPrevSchool.trim() || undefined,
        fullName: stFullName.trim(),
        form: stForm,
        stream: stStream,
        gender: stGender,
        boardingStatus: stBoarding,
        studentType: stBoarding === 'Bweni' ? 'Bweni (Boarding)' : 'Kutwa (Day Scholar)',
        dormitoryRoom: stBoarding === 'Bweni' ? stDorm : undefined,
        parentGuardianName: stParentName.trim() || editingStudentOriginal.parentGuardianName || 'Mzazi/Mlezi wa Mwanafunzi',
        parentName: stParentName.trim() || editingStudentOriginal.parentName,
        parentPhone: stParentPhone.trim() || editingStudentOriginal.parentPhone || '+255 754 000 000',
        address: stAddress.trim() || editingStudentOriginal.address,
      };

      updateStudent(updatedStudent);
      resetStudentForm();
      alert(language === 'sw' ? `Taarifa za mwanafunzi ${updatedStudent.fullName} zimesasishwa kikamilifu!` : 'Student profile updated successfully!');
      return;
    }

    const newStudent: StudentProfile = {
      id: `std-${Date.now()}`,
      studentId: stId.trim().toUpperCase(),
      examNumber: stExamNo.trim().toUpperCase() || `S0486/${Math.floor(1000 + Math.random() * 9000)}`,
      premNumber: stPremNumber.trim() || undefined,
      previousSchool: stPrevSchool.trim() || undefined,
      fullName: stFullName.trim(),
      form: stForm,
      stream: stStream,
      gender: stGender,
      dateOfBirth: '2008-05-12',
      enrollmentDate: '2024-01-10',
      boardingStatus: stBoarding,
      dormitoryRoom: stBoarding === 'Bweni' ? stDorm : undefined,
      parentGuardianName: stParentName || 'Mzazi/Mlezi wa Mwanafunzi',
      parentPhone: stParentPhone || '+255 754 000 000',
      address: stAddress,
      photoUrl:
        stGender === 'M'
          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    };

    addStudent(newStudent);
    resetStudentForm();
    alert(language === 'sw' ? 'Mwanafunzi amesajiliwa kikamilifu kwenye mfumo!' : 'Student profile registered successfully!');
  };

  // Asset Creation Handler
  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetNameSw || !newAssetCode) return;

    const newAsset: SchoolAsset = {
      id: `ast-${Date.now()}`,
      assetCode: newAssetCode.trim().toUpperCase(),
      nameSw: newAssetNameSw.trim(),
      nameEn: newAssetNameEn.trim() || newAssetNameSw.trim(),
      category: newAssetCategory,
      condition: newAssetCondition,
      location: newAssetLocation,
      status: 'Inapatikana (Available)',
      assignedToType: 'General',
      quantity: Number(newAssetQty) || 1,
    };

    addSchoolAsset(newAsset);
    setNewAssetNameSw('');
    setNewAssetNameEn('');
    setNewAssetCode('');
    setShowAddAssetForm(false);
    alert(language === 'sw' ? 'Kifaa/Mali ya shule imeongezwa kwenye daftari!' : 'School asset added to inventory!');
  };

  // Asset Assignment Commit
  const handleCommitAssetAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForAssign || !assigneeStudentId) return;

    const targetStudent = students.find(
      (s) => s.studentId === assigneeStudentId || s.id === assigneeStudentId
    );

    if (!targetStudent) {
      alert('Tafadhali chagua mwanafunzi aliyepo.');
      return;
    }

    assignAssetToStudent(
      selectedAssetForAssign.id,
      targetStudent.studentId,
      targetStudent.fullName,
      assigneeReturnDate
    );

    setSelectedAssetForAssign(null);
    setAssigneeStudentId('');
    alert(
      language === 'sw'
        ? `Kifaa kimekabidhiwa kwa mwanafunzi ${targetStudent.fullName} kikamilifu!`
        : `Asset successfully assigned to student ${targetStudent.fullName}!`
    );
  };

  // Open Edit Teacher Modal
  const handleOpenEditTeacher = (tr: Teacher) => {
    setEditingTeacher(tr);
    setEditTrName(tr.name || '');
    setEditTrRoleSw(tr.roleSw || tr.role || '');
    setEditTrRoleEn(tr.roleEn || tr.role || '');
    setEditTrDepartment(tr.department || 'Sayansi (Science)');
    setEditTrSubjects((tr.subjects || []).join(', '));
    setEditTrQualification(tr.qualification || tr.qualifications || '');
    setEditTrPhone(tr.phone || '');
    setEditTrEmail(tr.email || '');
    setEditTrImageUrl(tr.imageUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400');
    setEditTrExperienceYears(tr.experienceYears || 8);
  };

  // Save Edited Teacher
  const handleSaveEditedTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !editTrName.trim()) return;

    const updatedTeacher: Teacher = {
      ...editingTeacher,
      name: editTrName.trim(),
      role: editTrRoleSw.trim() || editTrRoleEn.trim() || 'Mwalimu wa Somo',
      roleSw: editTrRoleSw.trim() || 'Mwalimu wa Somo',
      roleEn: editTrRoleEn.trim() || 'Subject Teacher',
      department: editTrDepartment.trim(),
      subjects: editTrSubjects.split(',').map((s) => s.trim()).filter(Boolean),
      qualification: editTrQualification.trim(),
      qualifications: editTrQualification.trim(),
      phone: editTrPhone.trim(),
      email: editTrEmail.trim() || 'info@uombonisec.sc.tz',
      imageUrl: editTrImageUrl.trim() || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      experienceYears: Number(editTrExperienceYears) || 0,
    };

    updateTeacher(updatedTeacher);
    setEditingTeacher(null);
    alert(
      language === 'sw'
        ? `Taarifa za mwalimu ${updatedTeacher.name} zimehifadhiwa kikamilifu!`
        : `Teacher profile for ${updatedTeacher.name} updated successfully!`
    );
  };

  // Direct Teacher Image Upload Handlers
  const handleDirectUploadAddTeacher = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert(language === 'sw' ? 'Tafadhali chagua faili halali la picha (JPG, PNG, WebP).' : 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    try {
      setTrUploading(true);
      const dataUrl = await processImageFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.80, maxSizeBytes: 160 * 1024 });
      setTrImageUrl(dataUrl);
    } catch (err) {
      console.error(err);
      alert(language === 'sw' ? 'Imeshindikana kusindika picha. Tafadhali jaribu tena.' : 'Failed to process image. Please try again.');
    } finally {
      setTrUploading(false);
    }
  };

  const handleDirectUploadEditTeacher = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert(language === 'sw' ? 'Tafadhali chagua faili halali la picha (JPG, PNG, WebP).' : 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    try {
      setEditTrUploading(true);
      const dataUrl = await processImageFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.80, maxSizeBytes: 160 * 1024 });
      setEditTrImageUrl(dataUrl);
    } catch (err) {
      console.error(err);
      alert(language === 'sw' ? 'Imeshindikana kusindika picha. Tafadhali jaribu tena.' : 'Failed to process image. Please try again.');
    } finally {
      setEditTrUploading(false);
    }
  };

  const handleDirectUploadForTeacherCard = async (teacher: Teacher, file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert(language === 'sw' ? 'Tafadhali chagua faili halali la picha (JPG, PNG, WebP).' : 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    try {
      setCardTrUploadingId(teacher.id);
      const dataUrl = await processImageFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.80, maxSizeBytes: 160 * 1024 });
      updateTeacher({ ...teacher, imageUrl: dataUrl });
      alert(
        language === 'sw'
          ? `Picha ya mwalimu ${teacher.name} imepakiwa na kuhifadhiwa moja kwa moja!`
          : `Photo for teacher ${teacher.name} has been directly uploaded and saved!`
      );
    } catch (err) {
      console.error(err);
      alert(language === 'sw' ? 'Imeshindikana kupakia picha. Tafadhali jaribu tena.' : 'Failed to upload photo. Please try again.');
    } finally {
      setCardTrUploadingId(null);
    }
  };

  // Teacher Creation Handler
  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trName.trim()) return;

    const newTeacher: Teacher = {
      id: `tch-${Date.now()}`,
      name: trName.trim(),
      role: trRoleSw.trim() || trRoleEn.trim() || 'Mwalimu wa Somo',
      roleSw: trRoleSw.trim() || 'Mwalimu wa Somo',
      roleEn: trRoleEn.trim() || 'Subject Teacher',
      department: trDepartment,
      subjects: trSubjects.split(',').map((s) => s.trim()).filter(Boolean),
      qualification: trQualification.trim(),
      qualifications: trQualification.trim(),
      phone: trPhone.trim(),
      email: trEmail.trim() || 'teacher@uombonisec.sc.tz',
      imageUrl: trImageUrl.trim() || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      experienceYears: Number(trExperienceYears) || 5,
    };

    addTeacher(newTeacher);
    setTrName('');
    setTrSubjects('Basic Mathematics, Physics');
    setTrQualification('B.Ed Science - UDSM');
    setTrPhone('+255 754 000 000');
    setTrEmail('');
    setShowAddTeacherForm(false);
    alert(language === 'sw' ? 'Mwalimu ameongezwa kikamilifu kwenye daftari!' : 'Teacher added successfully to roster!');
  };

  // Timetable Slot Handler
  const handleCreateTimetableSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttSubject || !ttTeacher) return;

    const newSlot: TimetableSlot = {
      id: `tt-${Date.now()}`,
      dayOfWeek: ttDay,
      form: ttForm,
      subject: ttSubject.trim(),
      teacherName: ttTeacher.trim(),
      startTime: ttStart.trim(),
      endTime: ttEnd.trim(),
      room: ttRoom.trim(),
    };

    addTimetableSlot(newSlot);
    setShowAddTimetableForm(false);
    alert(language === 'sw' ? 'Kipindi kimeongezwa kwenye ratiba!' : 'Class period added to timetable!');
  };

  // Notice Creation Handler
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ntTitleSw || !ntContentSw) return;

    const newNotice: StudentNotice = {
      id: `ntc-${Date.now()}`,
      titleSw: ntTitleSw.trim(),
      titleEn: ntContentEn ? ntTitleEn.trim() || ntTitleSw.trim() : ntTitleSw.trim(),
      contentSw: ntContentSw.trim(),
      contentEn: ntContentEn.trim() || ntContentSw.trim(),
      targetAudience: ntAudience,
      priority: ntPriority,
      authorRole: ntRole.trim(),
      publishDate: new Date().toISOString().split('T')[0],
    };

    addStudentNotice(newNotice);
    setNtTitleSw('');
    setNtTitleEn('');
    setNtContentSw('');
    setNtContentEn('');
    setShowAddNoticeForm(false);
    alert(language === 'sw' ? 'Tangazo la wanafunzi limetangazwa!' : 'Student circular published!');
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newExamNumber) return;

    const newResult: StudentResult = {
      id: `st-${Date.now()}`,
      examNumber: newExamNumber.trim().toUpperCase(),
      studentName: newStudentName.trim().toUpperCase(),
      gender: 'M',
      form: newForm,
      stream: newStream,
      examType: 'NECTA Mock 2025',
      year: 2025,
      division: newDivision,
      points: Number(newPoints),
      totalMarks: Math.round(Number(newAvg) * 9),
      averageMarks: Number(newAvg),
      classPosition: 1,
      totalStudentsInClass: studentResults.length + 1,
      publishDate: new Date().toISOString().split('T')[0],
      conduct: 'Bora Sana (Excellent)',
      headmasterRemarks: 'Mwanafunzi hodari na mwenye juhudi ya hali ya juu kitaaluma.',
      subjects: [
        { code: '011', name: 'Civics', nameEn: 'Civics', score: 88, grade: 'A', points: 1, remarks: 'Bora Sana' },
        { code: '012', name: 'History', nameEn: 'History', score: 85, grade: 'A', points: 1, remarks: 'Bora Sana' },
        { code: '013', name: 'Geography', nameEn: 'Geography', score: 90, grade: 'A', points: 1, remarks: 'Bora Sana' },
        { code: '021', name: 'Kiswahili', nameEn: 'Kiswahili', score: 92, grade: 'A', points: 1, remarks: 'Bora Sana' },
        { code: '022', name: 'English Language', nameEn: 'English Language', score: 86, grade: 'A', points: 1, remarks: 'Bora Sana' },
        { code: '031', name: 'Physics', nameEn: 'Physics', score: 82, grade: 'A', points: 1, remarks: 'Bora Sana' },
        { code: '032', name: 'Chemistry', nameEn: 'Chemistry', score: 89, grade: 'A', points: 1, remarks: 'Bora Sana' },
        { code: '033', name: 'Biology', nameEn: 'Biology', score: 94, grade: 'A', points: 1, remarks: 'Bora Sana' },
        { code: '041', name: 'Basic Mathematics', nameEn: 'Basic Mathematics', score: 80, grade: 'A', points: 1, remarks: 'Bora Sana' },
      ],
    };

    addStudentResult(newResult);
    setNewStudentName('');
    setNewExamNumber('');
    alert(language === 'sw' ? 'Matokeo ya mwanafunzi yamehifadhiwa kikamilifu!' : 'Student result added successfully!');
  };

  const handleCreatePdfDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPdfTitleSw) return;

    const doc: ResultsPdfDocument = {
      id: `pdf-res-${Date.now()}`,
      titleSw: newPdfTitleSw,
      titleEn: newPdfTitleEn || newPdfTitleSw,
      form: newPdfForm,
      examType: newPdfExamType,
      year: new Date().getFullYear(),
      datePublished: new Date().toISOString().split('T')[0],
      fileSize: '2.1 MB',
      totalCandidates: Number(newPdfCandidates),
      divisionSummary: newPdfSummary,
      descriptionSw: `Kitabu rasmi cha matokeo ya ${newPdfForm} kwa mtihani wa ${newPdfExamType}.`,
      descriptionEn: `Official published results booklet for ${newPdfForm} ${newPdfExamType}.`,
    };

    addResultsPdfDoc(doc);
    setNewPdfTitleSw('');
    setNewPdfTitleEn('');
    alert(language === 'sw' ? 'Nyaraka ya PDF imeongezwa kwenye maktaba!' : 'PDF Document published to library!');
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertSw) return;

    const newAlertObj: UrgentAlert = {
      id: `alert-${Date.now()}`,
      messageSw: newAlertSw,
      messageEn: newAlertEn || newAlertSw,
      priority: 'high',
      linkAction: newAlertLink,
      linkTextSw: 'Soma Taarifa',
      linkTextEn: 'Read Notice',
      active: true,
    };

    addAlert(newAlertObj);
    setNewAlertSw('');
    setNewAlertEn('');
    alert(language === 'sw' ? 'Tangazo jipya limetangazwa kwenye tovuti!' : 'Alert published on header banner!');
  };

  // Custom Logo Upload Handler (File selection: PNG, JPG, SVG, WebP)
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoUploadError(null);
    setLogoUploadSuccess(null);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoUploadError(language === 'sw' ? 'Tafadhali chagua faili la picha (PNG, JPG, SVG, WebP).' : 'Please select a valid image file.');
      return;
    }

    try {
      setLogoUploadError(null);
      setLogoUploadSuccess(null);
      const dataUrl = await processImageFile(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.85,
        maxSizeBytes: 150 * 1024,
      });

      if (dataUrl) {
        setCustomLogoUrl(dataUrl);
        setLogoUploadSuccess(
          language === 'sw'
            ? 'Nembo mpya ya shule imeboreshwa na kuhifadhiwa kikamilifu kwenye seva na tovuti!'
            : 'Custom school logo successfully optimized and saved across the system!'
        );
      }
    } catch (err: any) {
      setLogoUploadError(
        err?.message || (language === 'sw' ? 'Hitilafu imetokea wakati wa kusoma na kusindika nembo.' : 'Error reading and processing logo.')
      );
    }
  };

  // Custom Logo URL Submission Handler
  const handleLogoUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLogoUploadError(null);
    setLogoUploadSuccess(null);

    if (!logoInputUrl.trim()) return;

    try {
      new URL(logoInputUrl.trim());
      setCustomLogoUrl(logoInputUrl.trim());
      setLogoUploadSuccess(
        language === 'sw'
          ? 'Nembo mpya ya shule kutoka link imewekwa kikamilifu!'
          : 'Custom school logo from URL saved successfully!'
      );
      setLogoInputUrl('');
    } catch {
      setLogoUploadError(language === 'sw' ? 'Tafadhali weka kiungo (URL) sahihi cha picha ya nembo.' : 'Please enter a valid image URL.');
    }
  };

  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsPhotoProcessing(true);
    setPhotoUploadError(null);
    try {
      const dataUrl = await processImageFile(file, { maxWidth: 1024, maxHeight: 768, quality: 0.78, maxSizeBytes: 240 * 1024 });
      setPhotoFilePreview(dataUrl);
    } catch (err: any) {
      setPhotoUploadError(err?.message || 'Hitilafu imetokea wakati wa kupakia picha.');
    } finally {
      setIsPhotoProcessing(false);
    }
  };

  const handleCreateGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFilePreview) {
      setPhotoUploadError(language === 'sw' ? 'Tafadhali chagua picha ya kupakia.' : 'Please select an image to upload.');
      return;
    }
    if (!photoTitleSw.trim()) {
      setPhotoUploadError(language === 'sw' ? 'Tafadhali weka maelezo ya picha.' : 'Please enter photo caption.');
      return;
    }
    const newPhoto: GalleryPhoto = {
      id: `photo-admin-${Date.now()}`,
      titleSw: photoTitleSw.trim(),
      titleEn: photoTitleEn.trim() || photoTitleSw.trim(),
      category: photoCategory,
      imageUrl: photoFilePreview,
      date: photoDate,
    };
    addGalleryPhoto(newPhoto);
    setPhotoUploadSuccess(language === 'sw' ? 'Picha mpya imehifadhiwa kwenye matunzio!' : 'Photo added to gallery successfully!');
    setPhotoTitleSw('');
    setPhotoTitleEn('');
    setPhotoFilePreview(null);
    setShowAddPhotoModal(false);
  };

  const handleSwapPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !swapTargetPhoto) return;
    try {
      const dataUrl = await processImageFile(file, { maxWidth: 1024, maxHeight: 768, quality: 0.78, maxSizeBytes: 240 * 1024 });
      updateGalleryPhoto({ ...swapTargetPhoto, imageUrl: dataUrl });
      setPhotoUploadSuccess(language === 'sw' ? 'Picha imebadilishwa kikamilifu!' : 'Photo swapped successfully!');
      setSwapTargetPhoto(null);
    } catch (err: any) {
      setPhotoUploadError(err?.message || 'Hitilafu imetokea wakati wa kubadili picha.');
    }
  };

  // News Management Handlers
  const handleOpenAddNews = () => {
    setEditingNewsId(null);
    setNewsTitleSw('');
    setNewsTitleEn('');
    setNewsCategory('Matangazo');
    setNewsExcerptSw('');
    setNewsExcerptEn('');
    setNewsContentSw('');
    setNewsContentEn('');
    setNewsDate(new Date().toISOString().substring(0, 10));
    setNewsAuthor('Ofisi ya Mkuu wa Shule');
    setNewsImageUrl('');
    setNewsFeatured(true);
    setNewsStatusMsg(null);
    setNewsErrorMsg(null);
    setShowAddNewsModal(true);
  };

  const handleEditNews = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewsTitleSw(item.titleSw);
    setNewsTitleEn(item.titleEn);
    setNewsCategory(item.category);
    setNewsExcerptSw(item.excerptSw || '');
    setNewsExcerptEn(item.excerptEn || '');
    setNewsContentSw(item.contentSw || '');
    setNewsContentEn(item.contentEn || '');
    setNewsDate(item.date);
    setNewsAuthor(item.author || 'Ofisi ya Mkuu wa Shule');
    setNewsImageUrl(item.imageUrl || '');
    setNewsFeatured(!!item.featured);
    setNewsStatusMsg(null);
    setNewsErrorMsg(null);
    setShowAddNewsModal(true);
  };

  const handleNewsImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file, { maxWidth: 1000, maxHeight: 600, quality: 0.78, maxSizeBytes: 240 * 1024 });
      setNewsImageUrl(dataUrl);
      setNewsErrorMsg(null);
    } catch (err: any) {
      setNewsErrorMsg(err?.message || 'Hitilafu ya kupakia picha.');
    }
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitleSw.trim()) {
      setNewsErrorMsg('Tafadhali jaza kichwa cha habari.');
      return;
    }

    const newsObj: NewsItem = {
      id: editingNewsId || `news-${Date.now()}`,
      titleSw: newsTitleSw.trim(),
      titleEn: newsTitleEn.trim() || newsTitleSw.trim(),
      excerptSw: newsExcerptSw.trim() || newsTitleSw.trim(),
      excerptEn: newsExcerptEn.trim() || newsTitleEn.trim() || newsTitleSw.trim(),
      contentSw: newsContentSw.trim() || newsExcerptSw.trim() || newsTitleSw.trim(),
      contentEn: newsContentEn.trim() || newsExcerptEn.trim() || newsTitleEn.trim(),
      category: newsCategory,
      date: newsDate || new Date().toISOString().substring(0, 10),
      author: newsAuthor.trim() || 'Ofisi ya Mkuu wa Shule',
      imageUrl: newsImageUrl.trim() || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      featured: newsFeatured,
    };

    if (editingNewsId) {
      updateNews(newsObj);
      setNewsStatusMsg(language === 'sw' ? 'Habari imesasishwa kikamilifu!' : 'News updated successfully!');
    } else {
      addNews(newsObj);
      setNewsStatusMsg(language === 'sw' ? 'Habari mpya imeongezwa kwenye Live Animation Ticker!' : 'New article added to Live Animation Ticker!');
    }

    setShowAddNewsModal(false);
  };

  const handleClearAllNews = () => {
    const confirmMsg = language === 'sw'
      ? 'Je, una uhakika unataka KUFUTA HABARI NA TAARIFA ZOTE zilizopo kwenye Animation Ticker ili uanze upya kuweka zako?'
      : 'Are you sure you want to CLEAR ALL news and animation ticker items to start fresh with your own?';
    if (window.confirm(confirmMsg)) {
      clearAllNews();
      setNewsStatusMsg(language === 'sw' ? 'Habari zote zimefutwa. Sasa unaweza kuweka mpya zako pekee.' : 'All news cleared. You can now add your own announcements.');
    }
  };

  const handleResetNews = () => {
    const confirmMsg = language === 'sw'
      ? 'Je, unataka kurejesha taarifa za mfano?'
      : 'Do you want to restore default sample news?';
    if (window.confirm(confirmMsg)) {
      resetNewsToDefaults();
      setNewsStatusMsg(language === 'sw' ? 'Taarifa za mfano zimerejeshwa.' : 'Default news restored.');
    }
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-white relative animate-in zoom-in-95 duration-200">
          
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <SchoolLogo size="md" />
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-amber-300 uppercase tracking-wide">
                  UOMBONI SECONDARY SCHOOL
                </h2>
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'sw' ? 'Jopo Kuu la Utawala (Admin Console)' : 'Executive Administration Console'}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title={language === 'sw' ? 'Funga' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher: Classic Passcode (Nenosiri la Zamani) vs Google SSO */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              id="tab-login-classic"
              onClick={() => { setLoginMethod('password'); setAuthError(false); setAuthErrorMessage(''); }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginMethod === 'password'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{language === 'sw' ? '🔑 Nenosiri la Zamani (Passcode)' : '🔑 Classic Admin Passcode'}</span>
            </button>
            <button
              type="button"
              id="tab-login-google"
              onClick={() => { setLoginMethod('google'); setAuthError(false); setAuthErrorMessage(''); }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginMethod === 'google'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Google SSO</span>
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold">{language === 'sw' ? 'Hitilafu ya Kuingia' : 'Authentication Error'}</p>
                <p>{authErrorMessage}</p>
              </div>
            </div>
          )}

          {loginMethod === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {language === 'sw' ? 'Nenosiri la Utawala (Admin Passcode):' : 'Admin Passcode:'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    autoFocus
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {language === 'sw' ? 'Nenosiri la mfumo wa utawala: "admin" au "uomboni"' : 'Passcode for administration: "admin" or "uomboni"'}
                </p>
              </div>

              {/* Main Login Button */}
              <button
                type="submit"
                id="btn-admin-login-submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'sw' ? 'Ingia Kwenye Jopo la Admin (Login)' : 'Enter Admin Console'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'sw'
                  ? 'Ingia kwa kutumia barua pepe ya Google iliyoidhinishwa na Ofisi ya Mkuu wa Shule au IT Unit.'
                  : 'Sign in using an authorized Google Workspace account.'}
              </p>
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                isLoading={isGoogleSigningIn}
                label={language === 'sw' ? 'Ingia na Akaunti ya Google (Admin)' : 'Sign in with Google (Admin)'}
                sublabel="tumainifundtrustfoundation@gmail.com au @uomboni.sc.tz"
                theme="dark"
                id="btn-admin-google-sso"
              />
            </div>
          )}

          {/* Quick links to other school portals */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            {onOpenBursar && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenBursar(); }}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>💰 {language === 'sw' ? 'Jopo la Mhasibu (Bursar)' : 'Bursar Portal'}</span>
              </button>
            )}
            {onOpenAcademic && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenAcademic('academic_master'); }}
                className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>📚 {language === 'sw' ? 'Jopo la Taaluma (Academic)' : 'Academic Master'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 rounded-3xl max-w-7xl w-full h-[94vh] max-h-[900px] flex flex-col shadow-2xl border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Command Center Header */}
        <div className="bg-slate-950 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                  <span>{language === 'sw' ? 'Jopo Kuu la Utawala (Admin Console)' : 'Uomboni Admin Command Console'}</span>
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE • SECURE</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'sw'
                  ? 'Kusakinisha matokeo ya Excel, kutoa PDF, kusimamia ada, matangazo na taarifa za shule'
                  : 'Import Excel results, generate PDFs, manage fee approvals, news and school records'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
                {adminGoogleUser?.photoURL ? (
                  <img
                    src={adminGoogleUser.photoURL}
                    alt="Google Profile"
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-mono text-emerald-300 text-xs truncate max-w-[170px]">
                    {adminGoogleUser?.displayName || adminEmail || 'admin@uomboni.sc.tz'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                    {adminGoogleUser ? (
                      <>
                        <span className="text-emerald-400 font-bold">Google Verified</span>
                        <span>• Super Admin</span>
                      </>
                    ) : (
                      'Super Admin'
                    )}
                  </span>
                </div>
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={async () => {
                  const ok = await syncAllWithServer();
                  if (ok) {
                    alert(
                      language === 'sw'
                        ? '✅ Data zote zimesawazishwa na Seva Kuu! Mabadiliko yataonekana kwenye browser na vifaa vyote mara moja.'
                        : '✅ All school records synchronized to Main Server! Changes will appear across all browsers and devices.'
                    );
                  }
                }}
                disabled={isServerSyncing}
                className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 hover:text-emerald-100 text-xs font-bold flex items-center gap-1.5 border border-emerald-800/40 transition-colors cursor-pointer"
                title={language === 'sw' ? 'Sawazisha data zote na Seva Kuu ili zionekane kote' : 'Sync all data with main server across all browsers'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isServerSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                <span className="hidden sm:inline">
                  {isServerSyncing
                    ? (language === 'sw' ? 'Inasawazisha...' : 'Syncing...')
                    : (language === 'sw' ? 'Sawazisha Kote' : 'Sync Server')}
                </span>
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={handleAdminLogout}
                className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 text-xs font-bold flex items-center gap-1.5 border border-red-800/40 transition-colors cursor-pointer"
                title={language === 'sw' ? 'Funga kikao cha Admin' : 'End Admin Session'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'sw' ? 'Toka (Logout)' : 'Logout'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-850 rounded-xl cursor-pointer border border-transparent hover:border-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authenticated Dashboard with Distinct Dark Sidebar Navigation */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950">
            
            {/* Sidebar Navigation: Dark Dashboard Chassis */}
            <div className="w-full md:w-72 bg-slate-950 p-3 sm:p-4 border-r border-slate-800 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0 shadow-inner">
              
              <div className="hidden md:block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-2 pt-1 pb-1">
                {language === 'sw' ? 'UDADHILI & MAOMBI' : 'ADMISSIONS & INTAKE'}
              </div>

              <button
                onClick={() => setActiveTab('applications')}
                id="admin-tab-applications"
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'applications'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardCheck className={`w-4 h-4 ${activeTab === 'applications' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Maombi ya Mtandaoni' : 'Online Applications'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {applications.filter((a) => a.status === 'Inasubiri Uhakiki').length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black animate-pulse">
                      {applications.filter((a) => a.status === 'Inasubiri Uhakiki').length}
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                    activeTab === 'applications' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {applications.length}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('admissionDocs')}
                id="admin-tab-admission-docs"
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'admissionDocs'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${activeTab === 'admissionDocs' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Nyaraka za Udahili' : 'Admission Documents'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'admissionDocs' ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {joiningDocs.length}
                </span>
              </button>

              <div className="hidden md:block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-2 pt-3 pb-1 border-t border-slate-900 mt-1">
                {language === 'sw' ? 'WANAFUNZI & RASILIMALI' : 'STUDENTS & ASSETS'}
              </div>

              <button
                onClick={() => setActiveTab('students')}
                id="admin-tab-students"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'students'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className={`w-4 h-4 ${activeTab === 'students' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Wanafunzi & Wasifu' : 'Students Directory'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'students' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {students.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('assets')}
                id="admin-tab-assets"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'assets'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <PackageCheck className={`w-4 h-4 ${activeTab === 'assets' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Mali & Vifaa vya Shule' : 'Assets & Inventory'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'assets' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {schoolAssets.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('teachers')}
                id="admin-tab-teachers"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'teachers'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${activeTab === 'teachers' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Walimu & Wafanyakazi' : 'Teachers & Staff'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'teachers' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {teachers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('studentCouncil')}
                id="admin-tab-student-council"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'studentCouncil'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${activeTab === 'studentCouncil' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Serikali ya Wanafunzi' : 'Student Prefects'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'studentCouncil' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {studentCouncil.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('schoolProfile')}
                id="admin-tab-school-profile"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'schoolProfile'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${activeTab === 'schoolProfile' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Dira, Wasifu & Kaulimbiu' : 'Profile, Vision & Motto'}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px]">
                  LIVE
                </span>
              </button>

              <button
                onClick={() => setActiveTab('bankAccounts')}
                id="admin-tab-bank-accounts"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'bankAccounts'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className={`w-4 h-4 ${activeTab === 'bankAccounts' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Akaunti za Benki za Shule' : 'School Bank Accounts'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'bankAccounts' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {bankAccounts.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                id="admin-tab-events"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'events'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${activeTab === 'events' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Matukio Muhimu ya Shule' : 'School Events'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'events' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {events.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('timetable')}
                id="admin-tab-timetable"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'timetable'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${activeTab === 'timetable' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Ratiba za Masomo' : 'Class Timetables'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'timetable' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {timetable.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('notices')}
                id="admin-tab-notices"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'notices'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className={`w-4 h-4 ${activeTab === 'notices' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Matangazo ya Wanafunzi' : 'Student Notices'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'notices' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {studentNotices.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('news')}
                id="admin-tab-news"
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-black flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'news'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md ring-1 ring-amber-400'
                    : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${activeTab === 'news' ? 'text-slate-950 animate-bounce' : 'text-amber-400 animate-pulse'}`} />
                  <span>{language === 'sw' ? 'Habari & Animation Ticker' : 'Live News & Ticker'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-black ${
                  activeTab === 'news' ? 'bg-slate-950 text-amber-300' : 'bg-amber-400/20 text-amber-300'
                }`}>
                  {news.length}
                </span>
              </button>

              <div className="hidden md:block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-2 pt-3 pb-1 border-t border-slate-900 mt-2">
                {language === 'sw' ? 'MATOKEO & FEDHA' : 'ACADEMICS & FINANCE'}
              </div>

              <button
                onClick={() => setActiveTab('excelUpload')}
                id="admin-tab-excel"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-left border ${
                  activeTab === 'excelUpload'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'excelUpload' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{language === 'sw' ? 'Sakinisha Excel (.xlsx)' : 'Import Excel (.xlsx)'}</span>
              </button>

              <button
                onClick={() => setActiveTab('results')}
                id="admin-tab-results"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'results'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${activeTab === 'results' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Orodha ya Matokeo' : 'Student Results'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'results' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {studentResults.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('pdfLibrary')}
                id="admin-tab-pdf-library"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'pdfLibrary'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${activeTab === 'pdfLibrary' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Nyaraka za PDF' : 'PDF Booklets'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'pdfLibrary' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {resultsPdfDocuments.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                id="admin-tab-payments"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'payments'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className={`w-4 h-4 ${activeTab === 'payments' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Malipo ya Ada' : 'Fee Payments'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'payments' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {paymentRecords.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                id="admin-tab-feedback"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'feedback'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className={`w-4 h-4 ${activeTab === 'feedback' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Maoni ya Wazazi' : 'Parent Inquiries'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'feedback' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {parentInquiries.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                id="admin-tab-alerts"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-left border ${
                  activeTab === 'alerts'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <Bell className={`w-4 h-4 ${activeTab === 'alerts' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{language === 'sw' ? 'Matangazo ya Haraka' : 'Urgent Alerts'}</span>
              </button>

              <div className="hidden md:block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-2 pt-3 pb-1 border-t border-slate-900 mt-2">
                {language === 'sw' ? 'PICHA & NEMBO' : 'PHOTOS & BRANDING'}
              </div>

              <button
                onClick={() => setActiveTab('galleryPhotos')}
                id="admin-tab-gallery-photos"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'galleryPhotos'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Camera className={`w-4 h-4 ${activeTab === 'galleryPhotos' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{language === 'sw' ? 'Matunzio ya Picha' : 'Photo Gallery'}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  activeTab === 'galleryPhotos' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}>
                  {galleryPhotos.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('logoSettings')}
                id="admin-tab-logo-settings"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'logoSettings'
                    ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'text-amber-400/80 hover:text-amber-200 hover:bg-amber-950/30 border-amber-900/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span className="font-extrabold">{language === 'sw' ? 'Badili Nembo (Logo)' : 'Custom Logo'}</span>
                </div>
                {customLogoUrl && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-700 text-white font-mono">
                    Active
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('systemArchitecture')}
                id="admin-tab-system-architecture"
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left border ${
                  activeTab === 'systemArchitecture'
                    ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 text-blue-300 border-blue-500/40 shadow-sm'
                    : 'text-blue-400/80 hover:text-blue-200 hover:bg-blue-950/30 border-blue-900/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="font-extrabold">{language === 'sw' ? 'Miundombinu ya Wingu & 3D' : 'Cloud Architecture & 3D'}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-700 text-white font-mono">
                  12 Layers
                </span>
              </button>

              <div className="pt-3 mt-auto border-t border-slate-800/80 space-y-1.5">
                <button
                  onClick={() => {
                    if (confirm(language === 'sw' ? 'Onyo: Je, una uhakika unataka kufuta taarifa zote zilizopo ili kuanza na mfumo tupu?' : 'Warning: Are you sure you want to clear all records to start with an empty system?')) {
                      clearSampleData();
                      alert(language === 'sw' ? 'Mfumo umesafishwa kikamilifu. Sasa unaweza kuanza kuingiza taarifa zote mpya za shule mwanzo kabisa.' : 'System cleared completely. You can now input all new school records from scratch.');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl text-[11px] font-bold text-red-400 hover:text-red-200 bg-red-950/30 hover:bg-red-900/50 border border-red-900/40 flex items-center justify-between cursor-pointer transition-colors"
                  title="Futa taarifa zote kuanza upya"
                >
                  <span className="flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>{language === 'sw' ? 'Safisha Kuanza Upya' : 'Clear & Start Fresh'}</span>
                  </span>
                  <span className="text-[9px] bg-red-900/60 text-red-300 px-1.5 py-0.5 rounded font-mono">Tupu</span>
                </button>
              </div>
            </div>

            {/* Main Content Workspace Pane */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/95 text-slate-900">
              
              {/* TAB: ONLINE APPLICATIONS & ADMISSION VERIFICATION */}
              {activeTab === 'applications' && (
                <div className="space-y-6">
                  {/* Top Stats & Action Banner */}
                  <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 rounded-3xl shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>UHAKIKI WA MAOMBI YA KUJIUNGA NA SHULE (ONLINE ADMISSIONS 2026)</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {language === 'sw' ? 'Jopo la Uhakiki wa Maombi ya Wanafunzi' : 'Online Applications & Admissions Verification'}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {language === 'sw'
                          ? `Maombi yote yanayotumwa mtandaoni au kusajiliwa ofisini yanaingia hapa kwa ajili ya kukaguliwa, kuthibitishwa, kutoa barua ya kujiunga (PDF) na kuwasajili moja kwa moja kwenye daftari la wanafunzi.`
                          : `All online and walk-in applications are listed here for administrative review, verification, PDF letter issuance, and one-click student enrollment.`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowAddAppModal(true)}
                        className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-transform hover:scale-102 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{language === 'sw' ? 'Sajili Ombi la Mwanafunzi' : 'New Application Entry'}</span>
                      </button>

                      {onOpenJoiningInstructions && (
                        <button
                          onClick={onOpenJoiningInstructions}
                          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-transform hover:scale-102 cursor-pointer"
                          title="Fungua Fomu Rasmi ya Kujiunga 2027 (Joining Instructions)"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{language === 'sw' ? 'Fomu ya Kujiunga 2027' : 'Joining Instructions 2027'}</span>
                        </button>
                      )}

                      {onOpenVituMuhimu && (
                        <button
                          onClick={onOpenVituMuhimu}
                          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-2 shadow-md border border-amber-400/30 transition-transform hover:scale-102 cursor-pointer"
                          title="Orodha ya Vitu Muhimu (Essential Requirements Checklist)"
                        >
                          <PackageCheck className="w-4 h-4" />
                          <span>{language === 'sw' ? 'Vitu Muhimu (Mahitaji)' : 'Essential Requirements'}</span>
                        </button>
                      )}

                      {onOpenAdmissions && (
                        <button
                          onClick={onOpenAdmissions}
                          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-transform hover:scale-102 cursor-pointer"
                          title="Fomu ya Maombi ya Mtandaoni (Apply Online Form)"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{language === 'sw' ? 'Fomu ya Maombi Mtandaoni' : 'Online Application Form'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <button
                      onClick={() => setAppStatusFilter('ALL')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        appStatusFilter === 'ALL'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-600'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jumla ya Maombi</span>
                        <ClipboardCheck className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="text-2xl font-black mt-2">{applications.length}</div>
                      <span className="text-[10px] text-slate-400">Yote yaliyosajiliwa</span>
                    </button>

                    <button
                      onClick={() => setAppStatusFilter('Inasubiri Uhakiki')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        appStatusFilter === 'Inasubiri Uhakiki'
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-600 font-black'
                          : 'bg-amber-50/70 text-slate-800 border-amber-200/80 hover:bg-amber-50 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Inasubiri Uhakiki</span>
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-2xl font-black text-amber-950 mt-2">
                        {applications.filter((a) => a.status === 'Inasubiri Uhakiki').length}
                      </div>
                      <span className="text-[10px] text-amber-800">Yanahitaji uamuzi</span>
                    </button>

                    <button
                      onClick={() => setAppStatusFilter('Imethibitishwa')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        appStatusFilter === 'Imethibitishwa'
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500'
                          : 'bg-emerald-50/70 text-slate-800 border-emerald-200/80 hover:bg-emerald-50 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Imethibitishwa</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-black text-emerald-900 mt-2">
                        {applications.filter((a) => a.status === 'Imethibitishwa').length}
                      </div>
                      <span className="text-[10px] text-emerald-700">Wamepewa udahili</span>
                    </button>

                    <button
                      onClick={() => setAppStatusFilter('Imekataliwa')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        appStatusFilter === 'Imekataliwa'
                          ? 'bg-red-800 text-white border-red-900 shadow-md ring-2 ring-red-500'
                          : 'bg-red-50/70 text-slate-800 border-red-200/80 hover:bg-red-50 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">Imekataliwa</span>
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-2xl font-black text-red-900 mt-2">
                        {applications.filter((a) => a.status === 'Imekataliwa').length}
                      </div>
                      <span className="text-[10px] text-red-700">Vigezo havijakidhi</span>
                    </button>
                  </div>

                  {/* Filter & Search Toolbar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={appSearch}
                        onChange={(e) => setAppSearch(e.target.value)}
                        placeholder="Tafuta jina la mwanafunzi, namba ya ombi (APP-2026-...), simu ya mzazi au shule..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-colors"
                      />
                      {appSearch && (
                        <button
                          onClick={() => setAppSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs w-full md:w-auto">
                        <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                        <select
                          value={appClassFilter}
                          onChange={(e) => setAppClassFilter(e.target.value)}
                          className="bg-transparent text-slate-700 text-xs font-semibold px-2 py-1.5 focus:outline-hidden cursor-pointer"
                        >
                          <option value="ALL">Madarasa Yote</option>
                          <option value="Form 1">Kidato cha 1 (Form 1)</option>
                          <option value="Form 2 Transfer">Hamisho Form 2</option>
                          <option value="Form 3 Transfer">Hamisho Form 3</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs w-full md:w-auto">
                        <select
                          value={appStatusFilter}
                          onChange={(e) => setAppStatusFilter(e.target.value as any)}
                          className="bg-transparent text-slate-700 text-xs font-semibold px-2 py-1.5 focus:outline-hidden cursor-pointer"
                        >
                          <option value="ALL">Hali Zote za Uhakiki</option>
                          <option value="Inasubiri Uhakiki">Inasubiri Uhakiki</option>
                          <option value="Imethibitishwa">Imethibitishwa</option>
                          <option value="Imekataliwa">Imekataliwa</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Applications Cards List */}
                  {(() => {
                    const filteredApps = applications.filter((app) => {
                      const matchesSearch =
                        !appSearch.trim() ||
                        app.studentName.toLowerCase().includes(appSearch.toLowerCase()) ||
                        app.applicationNumber.toLowerCase().includes(appSearch.toLowerCase()) ||
                        app.parentName.toLowerCase().includes(appSearch.toLowerCase()) ||
                        app.parentPhone.toLowerCase().includes(appSearch.toLowerCase()) ||
                        (app.premNumber && app.premNumber.toLowerCase().includes(appSearch.toLowerCase())) ||
                        (app.previousSchool && app.previousSchool.toLowerCase().includes(appSearch.toLowerCase()));

                      const matchesStatus = appStatusFilter === 'ALL' || app.status === appStatusFilter;
                      const matchesClass = appClassFilter === 'ALL' || app.applyingFor === appClassFilter;

                      return matchesSearch && matchesStatus && matchesClass;
                    });

                    if (filteredApps.length === 0) {
                      return (
                        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                            <ClipboardCheck className="w-6 h-6" />
                          </div>
                          <h5 className="font-bold text-slate-800 text-sm">Hakuna maombi yanayolingana na vigezo vyako</h5>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Jaribu kubadilisha vigezo vya utafutaji au bonyeza kitufe hapa chini ili kusajili ombi jipya.
                          </p>
                          <button
                            onClick={() => {
                              setAppSearch('');
                              setAppStatusFilter('ALL');
                              setAppClassFilter('ALL');
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Ondoa Vichujio Vyote
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div className="text-xs font-bold text-slate-500 flex items-center justify-between px-1">
                          <span>Inaonyesha maombi {filteredApps.length} kati ya {applications.length}</span>
                          <span className="text-[11px] text-slate-400 font-normal">Imeundwa kwa mtindo wa wakati halisi</span>
                        </div>

                        {filteredApps.map((app) => {
                          const isPending = app.status === 'Inasubiri Uhakiki';
                          const isApproved = app.status === 'Imethibitishwa';
                          const isRejected = app.status === 'Imekataliwa';

                          // Clean phone for whatsapp
                          const cleanPhone = app.parentPhone.replace(/[^0-9]/g, '');
                          const waPhone = cleanPhone.startsWith('0') ? '255' + cleanPhone.substring(1) : cleanPhone;
                          const waMessage = encodeURIComponent(
                            `Habari Ndg. ${app.parentName}, Uongozi wa Shule ya Sekondari Uomboni (Marangu) unawasiliana nawe kuhusu maombi ya mwanafunzi ${app.studentName} (Namba ya Maombi: ${app.applicationNumber}). Hali ya maombi: ${app.status}.`
                          );

                          return (
                            <div
                              key={app.id}
                              className={`bg-white rounded-3xl border transition-all duration-200 shadow-xs hover:shadow-md p-5 space-y-4 ${
                                isPending
                                  ? 'border-amber-200/90 hover:border-amber-400'
                                  : isApproved
                                  ? 'border-emerald-200/90 hover:border-emerald-400'
                                  : 'border-red-200/90 hover:border-red-400'
                              }`}
                            >
                              {/* Card Header & Status */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs ${
                                    app.gender === 'M'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-pink-100 text-pink-800'
                                  }`}>
                                    {app.studentName.substring(0, 2).toUpperCase()}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                                        {app.studentName}
                                      </h4>
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                                        #{app.applicationNumber}
                                      </span>
                                      {app.premNumber && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200">
                                          PREM / La Saba: {app.premNumber}
                                        </span>
                                      )}
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                        app.gender === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                                      }`}>
                                        {app.gender === 'M' ? 'Mvulana' : 'Msichana'}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                      <span>Imewasilishwa: {app.submissionDate}</span>
                                      {app.dob && <span>• DOB: {app.dob}</span>}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
                                      isApproved
                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                        : isPending
                                        ? 'bg-amber-100 text-amber-950 border border-amber-300 animate-pulse'
                                        : 'bg-red-100 text-red-900 border border-red-300'
                                    }`}
                                  >
                                    {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                                    {isPending && <AlertCircle className="w-3.5 h-3.5 text-amber-700" />}
                                    {isRejected && <X className="w-3.5 h-3.5 text-red-700" />}
                                    <span>{app.status}</span>
                                  </span>

                                  {app.enrolledStudentId && (
                                    <span className="px-2.5 py-1 rounded-xl bg-emerald-900 text-amber-300 text-[11px] font-mono font-black shadow-xs">
                                      ID: {app.enrolledStudentId}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                                {/* Academic Info */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Darasa & Aina ya Masomo</span>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>{app.applyingFor}</span>
                                  </div>
                                  <div className="text-slate-600 text-[11px]">
                                    Aina: <strong className="text-slate-800">{app.entryType}</strong>
                                  </div>
                                  {app.premNumber && (
                                    <div className="text-emerald-800 font-mono text-[11px]">
                                      PREM / Mtihani La Saba: <strong className="text-emerald-950">{app.premNumber}</strong>
                                    </div>
                                  )}
                                  {app.previousSchool && (
                                    <div className="text-slate-500 text-[11px] truncate">
                                      Shule: <span className="text-slate-700">{app.previousSchool}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Examination / Primary Result */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Matokeo ya Awali / PSLE</span>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{app.primaryResults || 'Hakuna maelezo'}</span>
                                  </div>
                                  {app.verifiedBy && (
                                    <div className="text-[10px] text-emerald-800 font-semibold">
                                      Uhakiki: {app.verifiedBy} ({app.verifiedDate || '2026'})
                                    </div>
                                  )}
                                </div>

                                {/* Parent & Contact Info */}
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mzazi / Mlezi & Mawasiliano</span>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-slate-700" />
                                    <span>{app.parentName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <a
                                      href={`tel:${app.parentPhone}`}
                                      className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1"
                                    >
                                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                                      <span>{app.parentPhone}</span>
                                    </a>

                                    <a
                                      href={`sms:${app.parentPhone}?body=${waMessage}`}
                                      className="px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                                      title="Fungua Messenger ya Simu (SMS)"
                                    >
                                      <MessageSquare className="w-2.5 h-2.5" />
                                      <span>SMS</span>
                                    </a>

                                    <a
                                      href={`https://wa.me/${waPhone}?text=${waMessage}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-0.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                                    >
                                      <span>WhatsApp</span>
                                    </a>
                                  </div>
                                  {app.parentAddress && (
                                    <div className="text-[10px] text-slate-500 truncate">
                                      Makazi: {app.parentAddress}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Admin Notes Box */}
                              {app.adminNotes && (
                                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-[11px] text-slate-700 flex items-start gap-2">
                                  <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="text-amber-950">Maoni ya Utawala: </strong>
                                    <span>{app.adminNotes}</span>
                                  </div>
                                </div>
                              )}

                              {/* Action Controls Toolbar */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Download Official Verification Letter PDF */}
                                  <button
                                    onClick={() => downloadAdmissionVerificationLetterPdf(app)}
                                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Pakua Barua ya PDF</span>
                                  </button>

                                  {/* Fast Verify & Enroll as Student */}
                                  {!app.enrolledStudentId && (
                                    <button
                                      onClick={() => handleVerifyAndEnroll(app)}
                                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-102"
                                    >
                                      <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Thibitisha & Sajili kama Mwanafunzi</span>
                                    </button>
                                  )}

                                  {/* Edit Notes & Status */}
                                  <button
                                    onClick={() => {
                                      setSelectedAppForDetail(app);
                                      setAdminNoteEdit(app.adminNotes || '');
                                    }}
                                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Hariri / Weka Maoni</span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {isPending && (
                                    <>
                                      <button
                                        onClick={() => {
                                          updateApplicationStatus(app.id, 'Imethibitishwa', 'Ombi limethibitishwa na ofisi ya udahili.');
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check className="w-3 h-3" />
                                        <span>Idhinisha</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          const reason = prompt('Sababu ya kukataa ombi (Hiari):', 'Vigezo havijakamilika');
                                          updateApplicationStatus(app.id, 'Imekataliwa', reason || 'Ombi limekataliwa.');
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                      >
                                        <X className="w-3 h-3" />
                                        <span>Kataa</span>
                                      </button>
                                    </>
                                  )}

                                  {isApproved && (
                                    <button
                                      onClick={() => updateApplicationStatus(app.id, 'Inasubiri Uhakiki')}
                                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold cursor-pointer"
                                    >
                                      Rejesha 'Uhakiki'
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      if (confirm(`Je, una uhakika unataka kufuta ombi hili la "${app.studentName}"?`)) {
                                        deleteOnlineApplication(app.id);
                                      }
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                    title="Futa Ombi"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* MODAL: EDIT APPLICATION STATUS & NOTES */}
              {selectedAppForDetail && (
                <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">Uhakiki & Maelezo ya Ombi</h4>
                          <span className="text-[11px] text-slate-500 font-mono">#{selectedAppForDetail.applicationNumber}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedAppForDetail(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <div className="font-bold text-slate-900">{selectedAppForDetail.studentName}</div>
                        <div className="text-slate-600">
                          {selectedAppForDetail.applyingFor} • {selectedAppForDetail.entryType}
                        </div>
                        <div className="text-slate-500">
                          Mzazi: {selectedAppForDetail.parentName} ({selectedAppForDetail.parentPhone})
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Badilisha Hali ya Ombi (Status)</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateApplicationStatus(selectedAppForDetail.id, 'Inasubiri Uhakiki', adminNoteEdit);
                              setSelectedAppForDetail((prev) => (prev ? { ...prev, status: 'Inasubiri Uhakiki', adminNotes: adminNoteEdit } : null));
                            }}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                              selectedAppForDetail.status === 'Inasubiri Uhakiki'
                                ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Inasubiri Uhakiki
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateApplicationStatus(selectedAppForDetail.id, 'Imethibitishwa', adminNoteEdit);
                              setSelectedAppForDetail((prev) => (prev ? { ...prev, status: 'Imethibitishwa', adminNotes: adminNoteEdit } : null));
                            }}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                              selectedAppForDetail.status === 'Imethibitishwa'
                                ? 'bg-emerald-800 text-white border-emerald-900 font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Thibitisha (Approve)
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateApplicationStatus(selectedAppForDetail.id, 'Imekataliwa', adminNoteEdit);
                              setSelectedAppForDetail((prev) => (prev ? { ...prev, status: 'Imekataliwa', adminNotes: adminNoteEdit } : null));
                            }}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                              selectedAppForDetail.status === 'Imekataliwa'
                                ? 'bg-red-800 text-white border-red-900 font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Kataa (Reject)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Maoni ya Utawala / Maelezo ya Mkuu wa Shule</label>
                        <textarea
                          rows={3}
                          value={adminNoteEdit}
                          onChange={(e) => setAdminNoteEdit(e.target.value)}
                          placeholder="Andika maoni ya kiutawala, mfano: Mwanafunzi amekubaliwa kujiunga na bweni la Mt. Thomas, anatakiwa kuripoti tarehe 05/01/2026..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            downloadAdmissionVerificationLetterPdf({
                              ...selectedAppForDetail,
                              adminNotes: adminNoteEdit,
                            });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Pakua PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateApplicationStatus(selectedAppForDetail.id, selectedAppForDetail.status, adminNoteEdit);
                            setSelectedAppForDetail(null);
                            alert('Maoni yamehifadhiwa kikamilifu!');
                          }}
                          className="px-5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Hifadhi Mabadiliko</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL: MANUAL ENTRY FOR WALK-IN APPLICATION */}
              {showAddAppModal && (
                <div className="fixed inset-0 z-60 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                  <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">Sajili Ombi Jipya la Udahili (Admin Entry)</h4>
                          <p className="text-[11px] text-slate-500">Kwa ajili ya maombi yaliyofika ofisini au fomu za karatasi</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAddAppModal(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateManualApplication} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="font-bold text-slate-700 block mb-1">Jina Kamili la Mwanafunzi *</label>
                          <input
                            type="text"
                            required
                            value={manualStudentName}
                            onChange={(e) => setManualStudentName(e.target.value)}
                            placeholder="Mf. EMMANUEL PETER MOSHA"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 uppercase focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Jinsia *</label>
                          <select
                            value={manualGender}
                            onChange={(e) => setManualGender(e.target.value as 'M' | 'F')}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          >
                            <option value="M">Mvulana (Male)</option>
                            <option value="F">Msichana (Female)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Tarehe ya Kuzaliwa</label>
                          <input
                            type="date"
                            value={manualDob}
                            onChange={(e) => setManualDob(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Darasa Analoomba *</label>
                          <select
                            value={manualApplyingFor}
                            onChange={(e) => setManualApplyingFor(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          >
                            <option value="Form 1">Kidato cha Kwanza (Form 1)</option>
                            <option value="Form 2 Transfer">Hamisho Kidato cha Pili (Form 2)</option>
                            <option value="Form 3 Transfer">Hamisho Kidato cha Tatu (Form 3)</option>
                            <option value="Pre-Form 1">Pre-Form 1 Orientation</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Aina ya Mwanafunzi *</label>
                          <select
                            value={manualEntryType}
                            onChange={(e) => setManualEntryType(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          >
                            <option value="Bweni (Boarding)">Bweni (Boarding)</option>
                            <option value="Kutwa (Day)">Kutwa (Day Scholar)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Shule Aliyotoka (Primary / Sec)</label>
                          <input
                            type="text"
                            value={manualPrevSchool}
                            onChange={(e) => setManualPrevSchool(e.target.value)}
                            placeholder="Mf. Shule ya Msingi Marangu"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                            <span>Namba ya PREM au Mtihani wa La Saba (PSLE)</span>
                            <span className="text-[10px] text-emerald-700 font-normal">PREM / PSLE Reg</span>
                          </label>
                          <input
                            type="text"
                            value={manualPremNumber}
                            onChange={(e) => setManualPremNumber(e.target.value)}
                            placeholder="Mf. 2018-0486-1021 au PS020486-012"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Ufaulu / Matokeo ya Awali</label>
                          <input
                            type="text"
                            value={manualPrimaryResult}
                            onChange={(e) => setManualPrimaryResult(e.target.value)}
                            placeholder="Mf. Daraja A (Alama 230/300) au GPA 3.8"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Jina la Mzazi / Mlezi *</label>
                          <input
                            type="text"
                            required
                            value={manualParentName}
                            onChange={(e) => setManualParentName(e.target.value)}
                            placeholder="Mf. Peter Lyimo"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Simu ya Mzazi / Mlezi *</label>
                          <input
                            type="tel"
                            required
                            value={manualParentPhone}
                            onChange={(e) => setManualParentPhone(e.target.value)}
                            placeholder="Mf. +255 754 892 140"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Barua Pepe ya Mzazi (Hiari)</label>
                          <input
                            type="email"
                            value={manualParentEmail}
                            onChange={(e) => setManualParentEmail(e.target.value)}
                            placeholder="mzazi@gmail.com"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Makazi ya Mzazi / Anwani</label>
                          <input
                            type="text"
                            value={manualParentAddress}
                            onChange={(e) => setManualParentAddress(e.target.value)}
                            placeholder="Marangu Magharibi, Moshi"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-slate-700 block mb-1">Maoni ya Awali ya Ofisi</label>
                          <input
                            type="text"
                            value={manualNotes}
                            onChange={(e) => setManualNotes(e.target.value)}
                            placeholder="Mf. Fomu imeletwa ofisini na Mzazi, vielelezo vimekamilika..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowAddAppModal(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        >
                          Ghairi
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Hifadhi Ombi kwenye Mfumo</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB: ADMISSION DOCUMENTS MANAGEMENT */}
              {activeTab === 'admissionDocs' && (
                <AdminAdmissionDocsTab />
              )}

              {/* TAB: STUDENTS DIRECTORY & MANAGEMENT */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  {/* Top Stats & Action Card */}
                  <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>MFUMO WA WANAFUNZI NA REKODI ZA SHULE</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {language === 'sw' ? 'Daftari la Wanafunzi (Student Directory)' : 'Student Information System'}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {language === 'sw'
                          ? `Jumla ya wanafunzi ${students.length} waliosajiliwa. Wanafunzi wanaweza kuingia kwenye 'Portal ya Mwanafunzi' kwa kutumia Namba ya Usajili (Student ID) au Namba ya Mtihani.`
                          : `Total ${students.length} students enrolled. Students log into their portal using their Student ID or Exam Number.`}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (showAddStudentForm) {
                          resetStudentForm();
                        } else {
                          resetStudentForm();
                          setShowAddStudentForm(true);
                        }
                      }}
                      id="admin-btn-add-student-toggle"
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
                    >
                      {editingStudentId ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      <span>
                        {showAddStudentForm
                          ? editingStudentId
                            ? language === 'sw'
                              ? 'Ghairi Kuhariri'
                              : 'Cancel Edit'
                            : language === 'sw'
                              ? 'Funga Fomu'
                              : 'Close Form'
                          : language === 'sw'
                            ? 'Sajili Mwanafunzi Mpya'
                            : 'Add New Student'}
                      </span>
                    </button>
                  </div>

                  {/* Official Form 1, Form 2 & Form 3 Centre S.0486 Candidates Banners */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Form 1 Banner */}
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50/60 p-4 sm:p-5 rounded-3xl border border-blue-200/80 shadow-xs flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-900 text-amber-300 font-mono font-black text-[11px] tracking-wide">
                            CENTRE: S.0486
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                            Kidato cha Kwanza (Form 1)
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono font-bold text-[11px]">
                            25 Wanafunzi
                          </span>
                        </div>
                        <h5 className="font-black text-sm text-slate-900">
                          {language === 'sw' ? 'Wanafunzi wa Kidato cha Kwanza (S0486-0036 - S0486-0060)' : 'Form One Student Register (S0486-0036 - S0486-0060)'}
                        </h5>
                        <p className="text-xs text-slate-600">
                          Wasichana: <strong className="text-blue-900 font-bold">9</strong> (17-25) • Wavulana: <strong className="text-blue-900 font-bold">16</strong> (01-16)
                        </p>
                      </div>

                      <div className="pt-2 border-t border-blue-100/80">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentFormFilter('Form 1');
                            setStudentSearch('');
                          }}
                          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? 'Onyesha Wanafunzi 25 wa Form 1' : 'View 25 Form 1 Students'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Form 2 Banner */}
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50/60 p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-amber-300 font-mono font-black text-[11px] tracking-wide">
                            CENTRE: S.0486
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            Kidato cha Pili (Form 2)
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono font-bold text-[11px]">
                            24 Watahiniwa
                          </span>
                        </div>
                        <h5 className="font-black text-sm text-slate-900">
                          {language === 'sw' ? 'Watahiniwa wa Kidato cha Pili (S0486-0001 - S0486-0024)' : 'Form Two Candidate Register (S0486-0001 - S0486-0024)'}
                        </h5>
                        <p className="text-xs text-slate-600">
                          Wasichana: <strong className="text-emerald-900 font-bold">10</strong> (0001-0010) • Wavulana: <strong className="text-emerald-900 font-bold">14</strong> (0011-0024)
                        </p>
                      </div>

                      <div className="pt-2 border-t border-emerald-100/80">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentFormFilter('Form 2');
                            setStudentSearch('');
                          }}
                          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? 'Onyesha Wanafunzi 24 wa Form 2' : 'View 24 Form 2 Students'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Form 3 Banner */}
                    <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-amber-50/60 p-4 sm:p-5 rounded-3xl border border-teal-200/80 shadow-xs flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-800 text-amber-300 font-mono font-black text-[11px] tracking-wide">
                            CENTRE: S.0486
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px]">
                            Kidato cha Tatu (Form 3)
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono font-bold text-[11px]">
                            11 Watahiniwa
                          </span>
                        </div>
                        <h5 className="font-black text-sm text-slate-900">
                          {language === 'sw' ? 'Watahiniwa wa Kidato cha Tatu (S0486-0025 - S0486-0035)' : 'Form Three Candidate Register (S0486-0025 - S0486-0035)'}
                        </h5>
                        <p className="text-xs text-slate-600">
                          Wasichana: <strong className="text-teal-900 font-bold">4</strong> (0025-0028) • Wavulana: <strong className="text-teal-900 font-bold">7</strong> (0029-0035)
                        </p>
                      </div>

                      <div className="pt-2 border-t border-teal-100/80">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentFormFilter('Form 3');
                            setStudentSearch('');
                          }}
                          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-teal-900 hover:bg-teal-800 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? 'Onyesha Wanafunzi 11 wa Form 3' : 'View 11 Form 3 Students'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add / Edit Student Form */}
                  {showAddStudentForm && (
                    <div id="admin-student-edit-form-anchor" className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-6 animate-in slide-in-from-top-4 duration-200">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          {editingStudentId ? (
                            <>
                              <Edit className="w-4 h-4 text-amber-600" />
                              <span>{language === 'sw' ? `Hariri Taarifa za Mwanafunzi: ${stFullName || 'Mwanafunzi'}` : `Edit Student Details: ${stFullName || 'Student'}`}</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 text-emerald-700" />
                              <span>{language === 'sw' ? 'Sajili Mwanafunzi Mpya Katika Mfumo wa Uomboni' : 'Register New Student Profile'}</span>
                            </>
                          )}
                        </h4>
                        {editingStudentId && (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                              ID: {stId}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              {stForm} {stStream}
                            </span>
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleCreateStudentProfile} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Jina Kamili la Mwanafunzi *</label>
                          <input
                            type="text"
                            required
                            placeholder="Jina kamili la mwanafunzi..."
                            value={stFullName}
                            onChange={(e) => setStFullName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Namba ya Mwanafunzi (Student ID) *</label>
                          <input
                            type="text"
                            required
                            placeholder="mf. UMB-2024-001"
                            value={stId}
                            onChange={(e) => setStId(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Namba ya Mtihani (NECTA / Mock)</label>
                          <input
                            type="text"
                            placeholder="mf. S0486/0010"
                            value={stExamNo}
                            onChange={(e) => setStExamNo(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                            <span>Namba ya PREM au Mtihani wa La Saba (PSLE)</span>
                            <span className="text-[10px] text-emerald-700 font-normal">PREM / PSLE No.</span>
                          </label>
                          <input
                            type="text"
                            placeholder="mf. 2018-0486-1021 au PS020486-012"
                            value={stPremNumber}
                            onChange={(e) => setStPremNumber(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Shule Aliyotoka (Previous School)</label>
                          <input
                            type="text"
                            placeholder="mf. Shule ya Msingi Marangu"
                            value={stPrevSchool}
                            onChange={(e) => setStPrevSchool(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Kidato (Class Form)</label>
                          <select
                            value={stForm}
                            onChange={(e: any) => setStForm(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                          >
                            <option value="Form 1">Form 1 (Kidato cha Kwanza)</option>
                            <option value="Form 2">Form 2 (Kidato cha Pili)</option>
                            <option value="Form 3">Form 3 (Kidato cha Tatu)</option>
                            <option value="Form 4">Form 4 (Kidato cha Nne)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Mkondo / Mkondo wa Masomo</label>
                          <select
                            value={stStream}
                            onChange={(e: any) => setStStream(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          >
                            <option value="A">Stream A</option>
                            <option value="B">Stream B</option>
                            <option value="Science">Science (Sayansi)</option>
                            <option value="Arts">Arts (Sanaa)</option>
                            <option value="Commercial">Commercial (Biashara)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Jinsia (Gender)</label>
                          <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="stGender"
                                checked={stGender === 'M'}
                                onChange={() => setStGender('M')}
                              />
                              <span>Mvulana (Male)</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="stGender"
                                checked={stGender === 'F'}
                                onChange={() => setStGender('F')}
                              />
                              <span>Msichana (Female)</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Aina ya Malazi (Boarding Status)</label>
                          <select
                            value={stBoarding}
                            onChange={(e: any) => setStBoarding(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                          >
                            <option value="Bweni">Bweni (Boarding Student)</option>
                            <option value="Kutwa">Kutwa (Day Scholar)</option>
                          </select>
                        </div>

                        {stBoarding === 'Bweni' && (
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Bweni na Chumba (Dormitory)</label>
                            <input
                              type="text"
                              value={stDorm}
                              onChange={(e) => setStDorm(e.target.value)}
                              placeholder="mf. Bweni la Mt. Thomas (Room 4)"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                            />
                          </div>
                        )}

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Jina la Mzazi / Mlezi</label>
                          <input
                            type="text"
                            placeholder="mf. Joseph M. Lyimo"
                            value={stParentName}
                            onChange={(e) => setStParentName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Namba ya Simu ya Mzazi</label>
                          <input
                            type="text"
                            placeholder="mf. +255 754 123 456"
                            value={stParentPhone}
                            onChange={(e) => setStParentPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={resetStudentForm}
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer text-xs"
                          >
                            {editingStudentId ? (language === 'sw' ? 'Ghairi Kuhariri' : 'Cancel Edit') : (language === 'sw' ? 'Ghairi (Cancel)' : 'Cancel')}
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold shadow-md cursor-pointer flex items-center gap-2 text-xs"
                          >
                            <Save className="w-4 h-4" />
                            <span>
                              {editingStudentId
                                ? language === 'sw'
                                  ? 'Sasisha Taarifa za Mwanafunzi'
                                  : 'Update Student Profile'
                                : language === 'sw'
                                  ? 'Hifadhi Mwanafunzi Mpya'
                                  : 'Save Student'}
                            </span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Filter & Search Toolbar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tafuta kwa Jina, Student ID, Exam No, PREM au Mtihani wa La Saba..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-slate-50"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                      {['ALL', 'Form 1', 'Form 2', 'Form 3', 'Form 4'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setStudentFormFilter(f)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                            studentFormFilter === f
                              ? 'bg-emerald-900 text-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {f === 'ALL' ? 'Madarasa Yote' : f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Student Records Table */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">MWANAFUNZI</th>
                            <th className="py-3 px-3 font-mono">STUDENT ID</th>
                            <th className="py-3 px-3 font-mono">EXAM / PREM / LA SABA</th>
                            <th className="py-3 px-3">KIDATO & MKONDO</th>
                            <th className="py-3 px-3">MALAZI & BWENI</th>
                            <th className="py-3 px-3">VIFAA SHULENI</th>
                            <th className="py-3 px-3">MZAZI / SIMU</th>
                            <th className="py-3 px-3 text-right">VITENDO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(() => {
                            const filtered = students.filter((st) => {
                              const matchFilter = studentFormFilter === 'ALL' || st.form === studentFormFilter;
                              const matchSearch =
                                !studentSearch ||
                                st.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                st.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                st.examNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                (st.premNumber && st.premNumber.toLowerCase().includes(studentSearch.toLowerCase())) ||
                                (st.previousSchool && st.previousSchool.toLowerCase().includes(studentSearch.toLowerCase()));
                              return matchFilter && matchSearch;
                            });

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={8} className="py-12 text-center text-slate-500">
                                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                    <p className="font-bold text-slate-700">
                                      {language === 'sw' ? 'Hakuna Mwanafunzi Kwenye Daftari' : 'No Students in Directory'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {language === 'sw'
                                        ? 'Tumia fomu ya "Sajili Mwanafunzi Mpya" hapo juu kuongeza wanafunzi.'
                                        : 'Use the "Register New Student" form above to enroll students.'}
                                    </p>
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map((st, idx) => {
                              const assignedItems = schoolAssets.filter(
                                (a) => a.assignedToStudentId === st.studentId || a.assignedToStudentName === st.fullName
                              );

                              return (
                                <tr key={`${st.id}-${st.examNumber || idx}-${idx}`} className="hover:bg-emerald-50/40 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                                        {st.fullName.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-900">{st.fullName}</div>
                                        <div className="text-[10px] text-slate-500">
                                          {st.gender === 'M' ? 'Mvulana' : 'Msichana'} • Alijiunga: {st.enrollmentDate}
                                        </div>
                                        {st.previousSchool && (
                                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                            Shule: {st.previousSchool}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                                    {st.studentId}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-600">
                                    <div>{st.examNumber}</div>
                                    {st.premNumber && (
                                      <div className="text-[10px] text-emerald-700 font-bold font-mono">
                                        PREM / La Saba: {st.premNumber}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 font-bold text-slate-800">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                                      {st.form} {st.stream}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-slate-700">
                                    <div className="font-medium text-[11px]">{st.boardingStatus}</div>
                                    {st.dormitoryRoom && (
                                      <div className="text-[10px] text-slate-500">{st.dormitoryRoom}</div>
                                    )}
                                  </td>
                                  <td className="py-3 px-3">
                                    {assignedItems.length > 0 ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                                        <Package className="w-3 h-3" />
                                        <span>Vifaa {assignedItems.length}</span>
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-slate-400">Hakuna</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-slate-600">
                                    <div className="text-[11px] font-medium">{st.parentGuardianName}</div>
                                    <div className="text-[10px] font-mono">{st.parentPhone}</div>
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditStudent(st)}
                                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        title={language === 'sw' ? `Hariri taarifa za ${st.fullName}` : `Edit details of ${st.fullName}`}
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`Je, una uhakika unataka kufuta mwanafunzi ${st.fullName}?`)) {
                                            deleteStudent(st.id);
                                          }
                                        }}
                                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title={language === 'sw' ? `Futa ${st.fullName}` : `Delete ${st.fullName}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SCHOOL ASSETS & INVENTORY MANAGEMENT */}
              {activeTab === 'assets' && (
                <div className="space-y-6">
                  {/* Top Stats Card */}
                  <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>UTAWALA WA MALI NA VIFAA VYA SHULE</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {language === 'sw' ? 'Daftari la Mali & Vifaa (Assets & Inventory)' : 'School Assets & Custody System'}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {language === 'sw'
                          ? 'Kufuatilia vitabu vya maktaba, vifaa vya maabara, kompyuta, samani za madawati, na kukabidhi/kurejesha kwa wanafunzi.'
                          : 'Track textbooks, laboratory apparatus, computers, dorm assets, and student custody.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddAssetForm(!showAddAssetForm)}
                      id="admin-btn-add-asset-toggle"
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showAddAssetForm ? 'Funga Fomu' : 'Sajili Kifaa/Mali Mpya'}</span>
                    </button>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Jumla ya Vifaa</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">{schoolAssets.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
                      <div className="text-[11px] font-bold text-emerald-700 uppercase">Inapatikana Shuleni</div>
                      <div className="text-2xl font-black text-emerald-900 mt-1">
                        {schoolAssets.filter((a) => a.status.includes('Inapatikana')).length}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
                      <div className="text-[11px] font-bold text-blue-700 uppercase">Vimekabidhiwa Wanafunzi</div>
                      <div className="text-2xl font-black text-blue-900 mt-1">
                        {schoolAssets.filter((a) => a.status.includes('Imekabidhiwa')).length}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
                      <div className="text-[11px] font-bold text-amber-700 uppercase">Matengenezo</div>
                      <div className="text-2xl font-black text-amber-900 mt-1">
                        {schoolAssets.filter((a) => a.condition.includes('Matengenezo')).length}
                      </div>
                    </div>
                  </div>

                  {/* Add Asset Form */}
                  {showAddAssetForm && (
                    <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-6 animate-in slide-in-from-top-4 duration-200">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                        <Plus className="w-4 h-4 text-emerald-700" />
                        <span>Sajili Kifaa au Mali ya Shule Katika Daftari Kuu</span>
                      </h4>

                      <form onSubmit={handleCreateAsset} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Jina la Kifaa (Kiswahili) *</label>
                          <input
                            type="text"
                            required
                            placeholder="mf. Kitabu cha Baiolojia Form 4 (TIE)"
                            value={newAssetNameSw}
                            onChange={(e) => setNewAssetNameSw(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Jina la Kifaa (English)</label>
                          <input
                            type="text"
                            placeholder="mf. Biology for Secondary Schools Book 4"
                            value={newAssetNameEn}
                            onChange={(e) => setNewAssetNameEn(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Msimbo wa Kifaa (Asset Code) *</label>
                          <input
                            type="text"
                            required
                            placeholder="mf. UMB-BK-009"
                            value={newAssetCode}
                            onChange={(e) => setNewAssetCode(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Aina ya Mali (Category)</label>
                          <select
                            value={newAssetCategory}
                            onChange={(e: any) => setNewAssetCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                          >
                            <option value="Vitabu vya Maktaba">Vitabu vya Maktaba (Library Books)</option>
                            <option value="Vifaa vya Maabara">Vifaa vya Maabara (Laboratory Apparatus)</option>
                            <option value="Kompyuta & Tehama">Kompyuta & Tehama (ICT & Laptops)</option>
                            <option value="Vifaa vya Mabweni">Vifaa vya Mabweni (Dormitory Assets)</option>
                            <option value="Samani & Madawati">Samani & Madawati (Furniture & Desks)</option>
                            <option value="Michezo">Michezo (Sports & Games)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Hali ya Kifaa (Condition)</label>
                          <select
                            value={newAssetCondition}
                            onChange={(e: any) => setNewAssetCondition(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          >
                            <option value="Mpya">Mpya (Brand New)</option>
                            <option value="Nzuri Sana">Nzuri Sana (Very Good)</option>
                            <option value="Nzuri">Nzuri (Good)</option>
                            <option value="Inahitaji Matengenezo">Inahitaji Matengenezo (Maintenance Needed)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Eneo Kilipo (Location)</label>
                          <input
                            type="text"
                            placeholder="mf. Maktaba Kuu / Lab ya Kemia"
                            value={newAssetLocation}
                            onChange={(e) => setNewAssetLocation(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Idadi (Quantity)</label>
                          <input
                            type="number"
                            min="1"
                            value={newAssetQty}
                            onChange={(e) => setNewAssetQty(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowAddAssetForm(false)}
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                          >
                            Ghairi
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold shadow-md cursor-pointer flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Hifadhi Kifaa</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Assign Asset Modal / Dialog */}
                  {selectedAssetForAssign && (
                    <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-2xl border border-amber-400 animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft className="w-5 h-5 text-amber-300" />
                          <h4 className="font-black text-sm">
                            Kabidhi Kifaa: <span className="text-amber-300 font-mono">{selectedAssetForAssign.assetCode}</span> - {selectedAssetForAssign.nameSw}
                          </h4>
                        </div>
                        <button
                          onClick={() => setSelectedAssetForAssign(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleCommitAssetAssignment} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                        <div>
                          <label className="font-bold text-emerald-200 block mb-1">Chagua Mwanafunzi Anayekabidhiwa *</label>
                          <select
                            required
                            value={assigneeStudentId}
                            onChange={(e) => setAssigneeStudentId(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-700 bg-emerald-900 text-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-xs font-bold"
                          >
                            <option value="">-- Chagua Mwanafunzi kutoka Daftari --</option>
                            {students.map((st, idx) => (
                              <option key={`${st.id}-${st.studentId}-${idx}`} value={st.studentId}>
                                {st.fullName} ({st.studentId} • {st.form})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-emerald-200 block mb-1">Tarehe ya Kurejesha (Return Due Date)</label>
                          <input
                            type="date"
                            value={assigneeReturnDate}
                            onChange={(e) => setAssigneeReturnDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-700 bg-emerald-900 text-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-emerald-800">
                          <button
                            type="button"
                            onClick={() => setSelectedAssetForAssign(null)}
                            className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-slate-300 font-bold"
                          >
                            Ghairi
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black shadow-md flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>Thibitisha Kukabidhi Kifaa</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Filter & Search Toolbar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tafuta kifaa kwa jina, msimbo au eneo..."
                        value={assetSearch}
                        onChange={(e) => setAssetSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-slate-50"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                      {[
                        'ALL',
                        'Vitabu vya Maktaba',
                        'Vifaa vya Maabara',
                        'Kompyuta & Tehama',
                        'Vifaa vya Mabweni',
                        'Samani & Madawati',
                        'Michezo',
                      ].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setAssetCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                            assetCategoryFilter === cat
                              ? 'bg-emerald-900 text-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat === 'ALL' ? 'Kategoria Zote' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Asset Items Table */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4 font-mono">MSIMBO</th>
                            <th className="py-3 px-3">JINA LA KIFAA</th>
                            <th className="py-3 px-3">KATEGORIA</th>
                            <th className="py-3 px-3">ENEO KILIPO</th>
                            <th className="py-3 px-3">HALI & IDADI</th>
                            <th className="py-3 px-3">HALI YA UMILIKI (STATUS)</th>
                            <th className="py-3 px-3 text-right">VITENDO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {schoolAssets
                            .filter((ast) => {
                              const matchCat = assetCategoryFilter === 'ALL' || ast.category === assetCategoryFilter;
                              const matchSearch =
                                !assetSearch ||
                                ast.nameSw.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                ast.assetCode.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                ast.location.toLowerCase().includes(assetSearch.toLowerCase());
                              return matchCat && matchSearch;
                            })
                            .map((ast) => {
                              const isAssigned = ast.status.includes('Imekabidhiwa');

                              return (
                                <tr key={ast.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-3 px-4 font-mono font-black text-emerald-900">
                                    {ast.assetCode}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="font-bold text-slate-900">{ast.nameSw}</div>
                                    <div className="text-[10px] text-slate-500 italic">{ast.nameEn}</div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                                      {ast.category}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-slate-600 font-medium">
                                    {ast.location}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="font-medium text-slate-800">{ast.condition}</div>
                                    <div className="text-[10px] text-slate-500">Idadi: {ast.quantity || 1}</div>
                                  </td>
                                  <td className="py-3 px-3">
                                    {isAssigned ? (
                                      <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold">
                                          <ArrowRightLeft className="w-3 h-3" />
                                          <span>Imekabidhiwa</span>
                                        </span>
                                        <div className="text-[11px] font-bold text-slate-900">
                                          {ast.assignedToStudentName}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono">
                                          ID: {ast.assignedToStudentId} • Rejesha: {ast.returnDueDate}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                        <Check className="w-3 h-3" />
                                        <span>Inapatikana Shuleni</span>
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {isAssigned ? (
                                        <button
                                          onClick={() => {
                                            returnSchoolAsset(ast.id);
                                            alert(`Kifaa ${ast.nameSw} kimerejeshwa shuleni!`);
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                          title="Rejesha Kifaa hiki kwenye hifadhi"
                                        >
                                          <RotateCcw className="w-3 h-3" />
                                          <span>Rejesha</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setSelectedAssetForAssign(ast);
                                            if (students.length > 0) setAssigneeStudentId(students[0].studentId);
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                                        >
                                          <ArrowRightLeft className="w-3 h-3" />
                                          <span>Kabidhi</span>
                                        </button>
                                      )}

                                      <button
                                        onClick={() => {
                                          if (confirm(`Je, una uhakika unataka kufuta kifaa ${ast.nameSw}?`)) {
                                            deleteSchoolAsset(ast.id);
                                          }
                                        }}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Futa Kifaa"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
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

              {/* TAB: TEACHERS & STAFF */}
              {activeTab === 'teachers' && (
                <div className="space-y-6">
                  {/* Top Banner */}
                  <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-emerald-800/30">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black tracking-wide border border-emerald-500/30">
                        <Users className="w-3.5 h-3.5" />
                        <span>UTAWALA WA WALIMU NA WAFANYAKAZI WA SHULE</span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {language === 'sw' ? 'Daftari Rasmi la Walimu & Wafanyakazi' : 'Official Teachers & Staff Roster'}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        {language === 'sw'
                          ? `Simamia taarifa za walimu ${teachers.length}, sifa za kitaaluma, masomo wanayofundisha, idara zao, na maelezo ya mawasiliano kwa urahisi.`
                          : `Manage teaching faculty profiles, academic qualifications, teaching subjects, departments, and contact details.`}
                      </p>
                    </div>

                    <button
                      id="btn-add-new-teacher-toggle"
                      onClick={() => setShowAddTeacherForm(!showAddTeacherForm)}
                      className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shrink-0 cursor-pointer transition-transform active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showAddTeacherForm ? 'Funga Fomu' : 'Ongeza Mwalimu Mpya'}</span>
                    </button>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jumla ya Watumishi</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">{teachers.length}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Walimu & Utawala</div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Idara ya Sayansi</div>
                      <div className="text-2xl font-black text-emerald-700 mt-1">
                        {teachers.filter((t) => t.department?.includes('Sayansi') || t.department?.includes('Science')).length}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Physics, Chem, Bio, Math</div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Idara ya Lugha & Sanaa</div>
                      <div className="text-2xl font-black text-amber-600 mt-1">
                        {teachers.filter((t) => t.department?.includes('Lugha') || t.department?.includes('Sanaa')).length}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Kisw, Eng, Hist, Geog</div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Utawala & Malezi</div>
                      <div className="text-2xl font-black text-purple-700 mt-1">
                        {teachers.filter((t) => t.department?.includes('Utawala') || t.department?.includes('Administration')).length}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Mkuu wa Shule, Makamu</div>
                    </div>
                  </div>

                  {/* Search & Department Filters Toolbar */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          id="input-search-teachers"
                          type="text"
                          placeholder="Tafuta mwalimu, somo, elimu au simu..."
                          value={teacherSearch}
                          onChange={(e) => setTeacherSearch(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                        {[
                          { id: 'ALL', label: 'Idara Zote' },
                          { id: 'Sayansi', label: 'Sayansi' },
                          { id: 'Lugha', label: 'Lugha' },
                          { id: 'Sanaa', label: 'Sanaa' },
                          { id: 'Biashara', label: 'Biashara' },
                          { id: 'Utawala', label: 'Utawala' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            id={`btn-dept-filter-${d.id}`}
                            onClick={() => setTeacherDeptFilter(d.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              teacherDeptFilter === d.id
                                ? 'bg-emerald-900 text-amber-300 shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add Teacher Form */}
                  {showAddTeacherForm && (
                    <div className="bg-white rounded-3xl border-2 border-emerald-300 shadow-xl p-6 sm:p-8 animate-in slide-in-from-top-4 duration-200 space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                            <UserPlus className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">Sajili Mwalimu / Mfanyakazi Mpya</h4>
                            <p className="text-xs text-slate-500">Jaza fomu hii kuongeza mwalimu kwenye orodha ya shule na tovuti kuu</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAddTeacherForm(false)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Jina Kamili la Mwalimu *</label>
                            <input
                              type="text"
                              required
                              placeholder="mf. Mwl. Emmanuel Lyimo"
                              value={trName}
                              onChange={(e) => setTrName(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Cheo (Kiswahili)</label>
                            <input
                              type="text"
                              placeholder="mf. Mwalimu wa Taaluma / Mwalimu wa Kemia"
                              value={trRoleSw}
                              onChange={(e) => setTrRoleSw(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Cheo (English)</label>
                            <input
                              type="text"
                              placeholder="mf. Academic Master / Chemistry Teacher"
                              value={trRoleEn}
                              onChange={(e) => setTrRoleEn(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Idara ya Somo (Department)</label>
                            <select
                              value={trDepartment}
                              onChange={(e) => setTrDepartment(e.target.value as any)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                            >
                              <option value="Sayansi (Science)">Sayansi (Science)</option>
                              <option value="Lugha (Languages)">Lugha (Languages)</option>
                              <option value="Sanaa (Humanities)">Sanaa na Jamii (Humanities)</option>
                              <option value="Biashara (Commercial)">Biashara (Commercial)</option>
                              <option value="Utawala (Administration)">Utawala (Administration)</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Masomo Anayofundisha (Tenga kwa mkato)</label>
                            <input
                              type="text"
                              placeholder="mf. Chemistry, Biology"
                              value={trSubjects}
                              onChange={(e) => setTrSubjects(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Sifa za Kitaaluma (Qualifications)</label>
                            <input
                              type="text"
                              placeholder="mf. B.Ed Science (UDSM)"
                              value={trQualification}
                              onChange={(e) => setTrQualification(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Namba ya Simu</label>
                            <input
                              type="text"
                              placeholder="mf. +255 754 000 000"
                              value={trPhone}
                              onChange={(e) => setTrPhone(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Barua Pepe (Email)</label>
                            <input
                              type="email"
                              placeholder="mf. teacher@uombonisec.sc.tz"
                              value={trEmail}
                              onChange={(e) => setTrEmail(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Miaka ya Uzoefu (Experience)</label>
                            <input
                              type="number"
                              min={1}
                              max={45}
                              value={trExperienceYears}
                              onChange={(e) => setTrExperienceYears(Number(e.target.value))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                            />
                          </div>
                        </div>

                        {/* Direct Photo Upload & Preview Section */}
                        <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                          <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-emerald-950 font-black">
                              <Camera className="w-4 h-4 text-emerald-700" />
                              <span>Pakia Picha ya Mwalimu Moja kwa Moja (Direct Photo Upload) *</span>
                            </span>
                            {trUploading && (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Inachakata...</span>
                              </span>
                            )}
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            {/* Photo Preview */}
                            <div className="sm:col-span-3 flex flex-col items-center">
                              <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-700/30 shadow-md bg-white">
                                <img
                                  src={trImageUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover object-top"
                                />
                                {trUploading && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 mt-1">Muonekano</span>
                            </div>

                            {/* Dropzone & File Selector */}
                            <div className="sm:col-span-9 space-y-2">
                              <label
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const f = e.dataTransfer.files?.[0];
                                  if (f) handleDirectUploadAddTeacher(f);
                                }}
                                className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/50 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                              >
                                <Upload className="w-6 h-6 text-emerald-700 mb-1" />
                                <span className="text-xs font-bold text-slate-800">
                                  Bofya hapa au Buruta picha kutoka kwenye kifaa
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Inasaidia picha za simu, kamera, JPG, PNG, WebP
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleDirectUploadAddTeacher(f);
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {/* Manual Link Input */}
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Au Link ya Picha:</span>
                                <input
                                  type="url"
                                  placeholder="https://images.unsplash.com/..."
                                  value={trImageUrl}
                                  onChange={(e) => setTrImageUrl(e.target.value)}
                                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Quick Sample Avatars */}
                          <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Mifano ya Haraka:</span>
                            {[
                              { name: 'Kiongozi Mkuu', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
                              { name: 'Mwl Msaidizi', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
                              { name: 'Mwl Sayansi', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
                              { name: 'Mwl Lugha', url: 'https://images.unsplash.com/photo-1580894732488-b219010041d5?auto=format&fit=crop&w=400&q=80' },
                            ].map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setTrImageUrl(preset.url)}
                                className="px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-100 text-[10px] font-bold text-emerald-900 border border-emerald-200 cursor-pointer"
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowAddTeacherForm(false)}
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                          >
                            Ghairi
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-black shadow-md cursor-pointer flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Hifadhi Mwalimu</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Teachers Grid */}
                  {(() => {
                    const filteredTeachers = teachers.filter((tr) => {
                      const matchDept =
                        teacherDeptFilter === 'ALL' ||
                        (tr.department && tr.department.toLowerCase().includes(teacherDeptFilter.toLowerCase()));

                      const q = teacherSearch.toLowerCase().trim();
                      const matchSearch =
                        !q ||
                        tr.name.toLowerCase().includes(q) ||
                        (tr.role && tr.role.toLowerCase().includes(q)) ||
                        (tr.roleSw && tr.roleSw.toLowerCase().includes(q)) ||
                        (tr.qualification && tr.qualification.toLowerCase().includes(q)) ||
                        (tr.qualifications && tr.qualifications.toLowerCase().includes(q)) ||
                        (tr.email && tr.email.toLowerCase().includes(q)) ||
                        (tr.phone && tr.phone.toLowerCase().includes(q)) ||
                        (tr.subjects && tr.subjects.some((s) => s.toLowerCase().includes(q)));

                      return matchDept && matchSearch;
                    });

                    if (filteredTeachers.length === 0) {
                      return (
                        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                            <Users className="w-6 h-6" />
                          </div>
                          <h4 className="text-base font-bold text-slate-800">Hakuna walimu waliopatikana</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Hakuna mwalimu anayelingana na vigezo vya utafutaji ulivyochagua. Jaribu kubadilisha neno au chagua idara zote.
                          </p>
                          <button
                            onClick={() => {
                              setTeacherSearch('');
                              setTeacherDeptFilter('ALL');
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-900 text-amber-300 text-xs font-bold"
                          >
                            Onyesha Walimu Wote
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredTeachers.map((tr) => (
                          <div
                            key={tr.id}
                            id={`teacher-card-${tr.id}`}
                            className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all p-5 flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              {/* Card Header Badges */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-md">
                                  {tr.department ? tr.department.split(' ')[0] : 'Taaluma'}
                                </span>

                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {tr.experienceYears || 5} miaka ya uzoefu
                                </span>
                              </div>

                              {/* Teacher Info */}
                              <div className="flex items-center gap-3.5">
                                <label
                                  className="relative group w-14 h-18 rounded-xl overflow-hidden border-2 border-emerald-600/40 shadow-xs shrink-0 cursor-pointer bg-slate-100"
                                  title="Bofya kupakia picha mpya ya pasipoti (Admin)"
                                >
                                  <img
                                    src={tr.imageUrl}
                                    alt={tr.name}
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="absolute top-1 right-1 px-1 rounded bg-black/60 text-amber-300 text-[7px] font-mono font-bold">
                                    PASS
                                  </span>
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                    {cardTrUploadingId === tr.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                                    ) : (
                                      <Camera className="w-4 h-4 text-amber-300" />
                                    )}
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) handleDirectUploadForTeacherCard(tr, f);
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <h5 className="font-black text-slate-900 text-sm truncate leading-snug">{tr.name}</h5>
                                    <label
                                      className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/70 flex items-center gap-1 cursor-pointer"
                                      title="Badili Picha Moja kwa Moja"
                                    >
                                      <Upload className="w-2.5 h-2.5" />
                                      <span>Picha</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const f = e.target.files?.[0];
                                          if (f) handleDirectUploadForTeacherCard(tr, f);
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                  <div className="text-xs text-emerald-800 font-bold truncate">
                                    {tr.roleSw || tr.role}
                                  </div>
                                  {tr.roleEn && tr.roleEn !== tr.roleSw && (
                                    <div className="text-[10px] text-slate-400 truncate">{tr.roleEn}</div>
                                  )}
                                </div>
                              </div>

                              {/* Subjects Chips */}
                              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  Masomo Anayofundisha:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {tr.subjects && tr.subjects.length > 0 ? (
                                    tr.subjects.map((sub, idx) => (
                                      <span
                                        key={idx}
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200"
                                      >
                                        {sub}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400">Hakuna somo lililowekwa</span>
                                  )}
                                </div>
                              </div>

                              {/* Academic Qualification */}
                              <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                <div className="text-[11px] font-medium leading-tight text-slate-700">
                                  {tr.qualification || tr.qualifications || 'Mwalimu mwenye sifa stahiki'}
                                </div>
                              </div>

                              {/* Contact Info */}
                              <div className="space-y-1 text-xs text-slate-600">
                                <div className="flex items-center gap-2 text-[11px]">
                                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <a href={`tel:${tr.phone}`} className="font-mono text-emerald-800 hover:underline">
                                    {tr.phone}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 text-[11px]">
                                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <a href={`mailto:${tr.email}`} className="truncate text-slate-600 hover:underline">
                                    {tr.email}
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons: Edit and Delete */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                id={`btn-edit-teacher-${tr.id}`}
                                onClick={() => handleOpenEditTeacher(tr)}
                                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer shadow-xs"
                              >
                                <Edit className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Hariri Taarifa</span>
                              </button>

                              <button
                                id={`btn-delete-teacher-${tr.id}`}
                                onClick={() => {
                                  if (confirm(`Je, una uhakika unataka kumfuta mwalimu "${tr.name}" kwenye orodha?`)) {
                                    deleteTeacher(tr.id);
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                                title="Futa Mwalimu"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* EDIT TEACHER MODAL DIALOG */}
                  {editingTeacher && (
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={editTrImageUrl || editingTeacher.imageUrl}
                              alt={editingTeacher.name}
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                                Hariri Taarifa za Mwalimu
                              </h4>
                              <p className="text-xs text-emerald-300 font-semibold">{editingTeacher.name}</p>
                            </div>
                          </div>

                          <button
                            id="btn-close-edit-teacher-modal"
                            onClick={() => setEditingTeacher(null)}
                            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Modal Form Body */}
                        <form onSubmit={handleSaveEditedTeacher} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Jina Kamili la Mwalimu *</label>
                              <input
                                id="input-edit-tr-name"
                                type="text"
                                required
                                value={editTrName}
                                onChange={(e) => setEditTrName(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Idara ya Somo (Department) *</label>
                              <select
                                id="select-edit-tr-dept"
                                value={editTrDepartment}
                                onChange={(e) => setEditTrDepartment(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold text-slate-900"
                              >
                                <option value="Sayansi (Science)">Sayansi (Science)</option>
                                <option value="Lugha (Languages)">Lugha (Languages)</option>
                                <option value="Sanaa (Humanities)">Sanaa na Jamii (Humanities)</option>
                                <option value="Biashara (Commercial)">Biashara (Commercial)</option>
                                <option value="Utawala (Administration)">Utawala (Administration)</option>
                              </select>
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Cheo / Wadhifa (Kiswahili) *</label>
                              <input
                                id="input-edit-tr-role-sw"
                                type="text"
                                required
                                placeholder="mf. Mwalimu wa Taaluma / Mwalimu wa Kemia"
                                value={editTrRoleSw}
                                onChange={(e) => setEditTrRoleSw(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-semibold"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Cheo kwa Kiingereza (Role En)</label>
                              <input
                                id="input-edit-tr-role-en"
                                type="text"
                                placeholder="mf. Academic Master / Chemistry Teacher"
                                value={editTrRoleEn}
                                onChange={(e) => setEditTrRoleEn(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-semibold"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="font-bold text-slate-700 block mb-1">
                                Masomo Anayofundisha (Tenganisha kwa mkato) *
                              </label>
                              <input
                                id="input-edit-tr-subjects"
                                type="text"
                                required
                                placeholder="mf. Chemistry, Biology, Basic Mathematics"
                                value={editTrSubjects}
                                onChange={(e) => setEditTrSubjects(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-semibold"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="font-bold text-slate-700 block mb-1">
                                Sifa za Kitaaluma / Shahada / Stashahada *
                              </label>
                              <input
                                id="input-edit-tr-qualification"
                                type="text"
                                required
                                placeholder="mf. B.Ed Science with Education (Physics & Chemistry) - UDSM"
                                value={editTrQualification}
                                onChange={(e) => setEditTrQualification(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-semibold"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Namba ya Simu *</label>
                              <input
                                id="input-edit-tr-phone"
                                type="text"
                                required
                                placeholder="mf. +255 754 000 000"
                                value={editTrPhone}
                                onChange={(e) => setEditTrPhone(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Barua Pepe (Email) *</label>
                              <input
                                id="input-edit-tr-email"
                                type="email"
                                required
                                placeholder="mf. teacher@uombonisec.sc.tz"
                                value={editTrEmail}
                                onChange={(e) => setEditTrEmail(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Miaka ya Uzoefu Kazini</label>
                              <input
                                id="input-edit-tr-exp"
                                type="number"
                                min={0}
                                max={50}
                                value={editTrExperienceYears}
                                onChange={(e) => setEditTrExperienceYears(Number(e.target.value))}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                              />
                            </div>
                          </div>

                          {/* Direct Photo Upload in Edit Modal */}
                          <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                            <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-emerald-950 font-black">
                                <Camera className="w-4 h-4 text-emerald-700" />
                                <span>Badili Picha ya Mwalimu Moja kwa Moja (Upload Photo)</span>
                              </span>
                              {editTrUploading && (
                                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Inachakata...</span>
                                </span>
                              )}
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                              <div className="sm:col-span-3 flex flex-col items-center">
                                <div className="relative group w-24 h-32 rounded-2xl overflow-hidden border-2 border-emerald-700/30 shadow-md bg-slate-100">
                                  <img
                                    src={editTrImageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover object-top"
                                  />
                                  <span className="absolute top-1 right-1 px-1 rounded bg-black/60 text-amber-300 text-[8px] font-mono font-bold">
                                    PASSPORT
                                  </span>
                                  {editTrUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    </div>
                                  )}
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 mt-1">Picha ya Pasipoti</span>
                              </div>

                              <div className="sm:col-span-9 space-y-2">
                                <label
                                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const f = e.dataTransfer.files?.[0];
                                    if (f) handleDirectUploadEditTeacher(f);
                                  }}
                                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/50 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                                >
                                  <Upload className="w-6 h-6 text-emerald-700 mb-1" />
                                  <span className="text-xs font-bold text-slate-800">
                                    Bofya hapa au Buruta picha mpya kutoka kifaa chako
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    Inasaidia picha za simu, kamera, JPG, PNG, WebP
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) handleDirectUploadEditTeacher(f);
                                    }}
                                    className="hidden"
                                  />
                                </label>

                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Au Link ya Picha:</span>
                                  <input
                                    id="input-edit-tr-image"
                                    type="url"
                                    value={editTrImageUrl}
                                    onChange={(e) => setEditTrImageUrl(e.target.value)}
                                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Quick Preset Photo Picker */}
                            <div className="space-y-1.5 pt-2 border-t border-emerald-100">
                              <div className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                                <span>Au Chagua Picha ya Mfano (Sample Portrait Avatars):</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { name: 'Kiongozi Mkuu', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
                                  { name: 'Mwalimu Mkuu Msaidizi', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
                                  { name: 'Mwalimu wa Sayansi', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
                                  { name: 'Mwalimu wa Lugha', url: 'https://images.unsplash.com/photo-1580894732488-b219010041d5?auto=format&fit=crop&w=400&q=80' },
                                  { name: 'Mwalimu wa Biashara', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&q=80' },
                                  { name: 'Mwalimu wa Sanaa', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
                                ].map((preset, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setEditTrImageUrl(preset.url)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] border cursor-pointer transition-all ${
                                      editTrImageUrl === preset.url
                                        ? 'border-emerald-600 bg-emerald-100 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    <img
                                      src={preset.url}
                                      alt={preset.name}
                                      className="w-4 h-4 rounded-full object-cover"
                                    />
                                    <span>{preset.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Modal Actions */}
                          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                              type="button"
                              id="btn-cancel-edit-teacher"
                              onClick={() => setEditingTeacher(null)}
                              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                            >
                              Ghairi
                            </button>
                            <button
                              type="submit"
                              id="btn-submit-edit-teacher"
                              className="px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                            >
                              <Save className="w-4 h-4" />
                              <span>Hifadhi Mabadiliko</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: STUDENT COUNCIL MANAGEMENT */}
              {activeTab === 'studentCouncil' && (
                <AdminStudentCouncilTab />
              )}

              {/* TAB: SCHOOL PROFILE, VISION & MISSION */}
              {activeTab === 'schoolProfile' && (
                <AdminSchoolProfileTab />
              )}

              {/* TAB: BANK ACCOUNTS */}
              {activeTab === 'bankAccounts' && (
                <AdminBankAccountsTab />
              )}

              {/* TAB: SCHOOL EVENTS */}
              {activeTab === 'events' && (
                <AdminEventsTab />
              )}

              {/* TAB: TIMETABLE MANAGEMENT */}
              {activeTab === 'timetable' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>RATIBA ZA MASOMO NA VIPINDI</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {language === 'sw' ? 'Ratiba Kuu ya Shule (Class Timetable)' : 'Academic Schedule & Period Manager'}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {language === 'sw'
                          ? 'Kusimamia ratiba ya vipindi kwa kila kidato kuanzia Form 1 hadi Form 4.'
                          : 'Manage daily subject periods, assigned teachers, and lecture rooms.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddTimetableForm(!showAddTimetableForm)}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showAddTimetableForm ? 'Funga Fomu' : 'Ongeza Kipindi Kwenye Ratiba'}</span>
                    </button>
                  </div>

                  {/* Add Timetable Form */}
                  {showAddTimetableForm && (
                    <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-6 animate-in slide-in-from-top-4 duration-200">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                        <Plus className="w-4 h-4 text-emerald-700" />
                        <span>Weka Kipindi Kipya Kwenye Ratiba</span>
                      </h4>

                      <form onSubmit={handleCreateTimetableSlot} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Siku ya Juma (Day)</label>
                          <select
                            value={ttDay}
                            onChange={(e: any) => setTtDay(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                          >
                            <option value="Jumatatu">Jumatatu (Monday)</option>
                            <option value="Jumanne">Jumanne (Tuesday)</option>
                            <option value="Jumatano">Jumatano (Wednesday)</option>
                            <option value="Alhamisi">Alhamisi (Thursday)</option>
                            <option value="Ijumaa">Ijumaa (Friday)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Kidato (Form)</label>
                          <select
                            value={ttForm}
                            onChange={(e: any) => setTtForm(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                          >
                            <option value="Form 1">Form 1</option>
                            <option value="Form 2">Form 2</option>
                            <option value="Form 3">Form 3</option>
                            <option value="Form 4">Form 4</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Somo (Subject) *</label>
                          <input
                            type="text"
                            required
                            placeholder="mf. Basic Mathematics"
                            value={ttSubject}
                            onChange={(e) => setTtSubject(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Mwalimu wa Kipindi *</label>
                          <input
                            type="text"
                            required
                            placeholder="mf. Mwl. John Massawe"
                            value={ttTeacher}
                            onChange={(e) => setTtTeacher(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Muda wa Kuanza</label>
                          <input
                            type="text"
                            placeholder="mf. 08:00 AM"
                            value={ttStart}
                            onChange={(e) => setTtStart(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Muda wa Kumaliza</label>
                          <input
                            type="text"
                            placeholder="mf. 08:45 AM"
                            value={ttEnd}
                            onChange={(e) => setTtEnd(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-slate-700 block mb-1">Darasa / Chumba (Room)</label>
                          <input
                            type="text"
                            placeholder="mf. Room 101 au Science Lab 1"
                            value={ttRoom}
                            onChange={(e) => setTtRoom(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowAddTimetableForm(false)}
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                          >
                            Ghairi
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold shadow-md cursor-pointer flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Hifadhi Kipindi</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Timetable Table */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">SIKU YA JUMA</th>
                            <th className="py-3 px-3">KIDATO</th>
                            <th className="py-3 px-3">MUDA WA KIPINDI</th>
                            <th className="py-3 px-3">SOMO</th>
                            <th className="py-3 px-3">MWALIMU</th>
                            <th className="py-3 px-3">DARASA / CHUMBA</th>
                            <th className="py-3 px-3 text-right">VITENDO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {timetable.map((tt) => (
                            <tr key={tt.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-bold text-slate-900">{tt.dayOfWeek}</td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  {tt.form}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-medium text-slate-700">
                                {tt.startTime} - {tt.endTime}
                              </td>
                              <td className="py-3 px-3 font-bold text-slate-900">{tt.subject}</td>
                              <td className="py-3 px-3 text-slate-700">{tt.teacherName}</td>
                              <td className="py-3 px-3 text-slate-500 font-mono">{tt.room}</td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => {
                                    if (confirm('Je, una uhakika unataka kufuta kipindi hiki?')) {
                                      deleteTimetableSlot(tt.id);
                                    }
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: STUDENT NOTICES */}
              {activeTab === 'notices' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        <Bell className="w-3.5 h-3.5" />
                        <span>MATANGAZO NA WARAKA ZA WANAFUNZI</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {language === 'sw' ? 'Ubao wa Matangazo ya Wanafunzi' : 'Student Notice Board Circulars'}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {language === 'sw'
                          ? 'Matangazo haya yataonekana moja kwa moja kwenye dashibodi ya kila mwanafunzi aliyelogi kwenye mfumo.'
                          : 'Notices published here appear immediately in logged-in students dashboard.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddNoticeForm(!showAddNoticeForm)}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{showAddNoticeForm ? 'Funga Fomu' : 'Chapisha Tangazo Jipya'}</span>
                    </button>
                  </div>

                  {/* Add Notice Form */}
                  {showAddNoticeForm && (
                    <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-6 animate-in slide-in-from-top-4 duration-200">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                        <Bell className="w-4 h-4 text-emerald-700" />
                        <span>Chapisha Tangazo Rasmi kwa Wanafunzi</span>
                      </h4>

                      <form onSubmit={handleCreateNotice} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Kichwa cha Habari (Swahili) *</label>
                          <input
                            type="text"
                            required
                            placeholder="mf. Maandalizi ya Mitihani ya Nusu Muhula"
                            value={ntTitleSw}
                            onChange={(e) => setNtTitleSw(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Kichwa cha Habari (English)</label>
                          <input
                            type="text"
                            placeholder="mf. Mid-Term Examination Preparations"
                            value={ntTitleEn}
                            onChange={(e) => setNtTitleEn(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Walengwa wa Tangazo (Audience)</label>
                          <select
                            value={ntAudience}
                            onChange={(e: any) => setNtAudience(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                          >
                            <option value="All">Wanafunzi Wote (Kidato cha 1 - 4)</option>
                            <option value="Form 1">Wanafunzi wa Form 1 Tu</option>
                            <option value="Form 2">Wanafunzi wa Form 2 Tu</option>
                            <option value="Form 3">Wanafunzi wa Form 3 Tu</option>
                            <option value="Form 4">Wanafunzi wa Form 4 Tu</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Kipaumbele (Priority) & Mtoaji</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={ntPriority}
                              onChange={(e: any) => setNtPriority(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs font-bold"
                            >
                              <option value="Normal">Kawaida (Normal)</option>
                              <option value="High">Muhimu Sana (High)</option>
                            </select>
                            <input
                              type="text"
                              value={ntRole}
                              onChange={(e) => setNtRole(e.target.value)}
                              placeholder="Cheo cha Mtoaji"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-slate-700 block mb-1">Ujumbe Kamili (Swahili) *</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Andika maelekezo kamili ya tangazo hapa..."
                            value={ntContentSw}
                            onChange={(e) => setNtContentSw(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowAddNoticeForm(false)}
                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                          >
                            Ghairi
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold shadow-md cursor-pointer flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Chapisha Tangazo</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Notices List */}
                  <div className="space-y-3">
                    {studentNotices.map((nt) => (
                      <div key={nt.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              nt.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {nt.priority === 'High' ? 'Muhimu Sana' : 'Kawaida'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-600">
                              Walengwa: {nt.targetAudience === 'All' ? 'Wanafunzi Wote' : nt.targetAudience}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">{nt.publishDate}</span>
                            <button
                              onClick={() => {
                                if (confirm('Je, una uhakika unataka kufuta tangazo hili?')) {
                                  deleteStudentNotice(nt.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h5 className="font-bold text-slate-900 text-sm">{nt.titleSw}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{nt.contentSw}</p>
                        <div className="text-[10px] text-slate-400 font-medium pt-1">
                          Limewekwa na: {nt.authorRole}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: LIVE NEWS & ANIMATION TICKER MANAGEMENT */}
              {activeTab === 'news' && (
                <div className="space-y-6">
                  {/* Status / Feedback Alert */}
                  {newsStatusMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{newsStatusMsg}</span>
                      </div>
                      <button
                        onClick={() => setNewsStatusMsg(null)}
                        className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {newsErrorMsg && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <span>{newsErrorMsg}</span>
                      </div>
                      <button
                        onClick={() => setNewsErrorMsg(null)}
                        className="text-red-700 hover:text-red-950 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-amber-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-black tracking-wider uppercase shadow-sm animate-pulse">
                        <Radio className="w-3.5 h-3.5" />
                        <span>LIVE ANIMATION TICKER & HABARI</span>
                      </div>
                      <h4 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                        <span>{language === 'sw' ? 'Usimamizi wa Habari na Matangazo ya Shule' : 'Live News & Animation Ticker Management'}</span>
                      </h4>
                      <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                        {language === 'sw'
                          ? 'Hapa Admin unaweza kuweka habari mpya zako rasmi, kupakia picha, kuhariri, au kufuta habari zilizopo ili kwenye tovuti zionekane habari zako halisi pekee.'
                          : 'Manage all live news articles rotating in the horizontal marquee ticker and interactive hero card. Add new articles, upload custom photos, or clear existing items.'}
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-amber-300 font-mono">
                        <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-amber-400/20">
                          {news.length} {language === 'sw' ? 'Habari zilizopo' : 'Articles active'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300">
                          {language === 'sw' ? 'Zinazunguka kwenye Live Marquee Ticker' : 'Rotating on Website Marquee'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        onClick={handleOpenAddNews}
                        id="admin-btn-add-news"
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-2 shadow-lg hover:shadow-amber-400/20 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{language === 'sw' ? '+ Weka Habari Mpya' : '+ Add New News'}</span>
                      </button>

                      {news.length > 0 && (
                        <button
                          onClick={handleClearAllNews}
                          id="admin-btn-clear-all-news"
                          className="px-3.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Futa habari zote zilizopo ili uanze na zako"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? 'Futa Zote' : 'Clear All'}</span>
                        </button>
                      )}

                      <button
                        onClick={handleResetNews}
                        id="admin-btn-reset-news"
                        className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Rejesha habari za mfano"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{language === 'sw' ? 'Za Mfano' : 'Defaults'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Add / Edit News Modal Drawer */}
                  {showAddNewsModal && (
                    <div className="bg-white rounded-3xl border-2 border-emerald-600/30 shadow-2xl p-5 sm:p-7 space-y-5 animate-in slide-in-from-top-4 duration-200">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-xs">
                            <Radio className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">
                              {editingNewsId
                                ? (language === 'sw' ? 'Hariri Habari / Tangazo' : 'Edit News Article')
                                : (language === 'sw' ? 'Weka Habari / Tangazo Jipya kwenye Tovuti' : 'Create New Live Announcement')}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {language === 'sw'
                                ? 'Habari hii itaonekana moja kwa moja kwenye mkanda wa habari zinazosogea na Kadi ya Uhuishaji ya ukurasa mkuu.'
                                : 'This news item will immediately rotate on the live marquee ticker and home cards.'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowAddNewsModal(false)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveNews} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Title Swahili */}
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">
                              Kichwa cha Habari (Kiswahili) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={newsTitleSw}
                              onChange={(e) => setNewsTitleSw(e.target.value)}
                              placeholder="Mf. Udahili wa Wanafunzi wa Kidato cha Kwanza 2026 Umeanza Rasmi..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-bold text-slate-900"
                            />
                          </div>

                          {/* Title English */}
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">
                              Kichwa cha Habari (English)
                            </label>
                            <input
                              type="text"
                              value={newsTitleEn}
                              onChange={(e) => setNewsTitleEn(e.target.value)}
                              placeholder="E.g. Form One 2026 Admissions Officially Commenced..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Category */}
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">
                              Kategoria / Idara <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={newsCategory}
                              onChange={(e: any) => setNewsCategory(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-bold text-slate-900"
                            >
                              <option value="Matangazo">Matangazo (Announcements)</option>
                              <option value="Taaluma">Taaluma (Academics & NECTA)</option>
                              <option value="Michezo">Michezo (Sports & UMISETA)</option>
                              <option value="Kikanisa">Kikanisa (Catholic Church / Diocese)</option>
                              <option value="Uongozi">Uongozi (School Administration)</option>
                            </select>
                          </div>

                          {/* Date */}
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">
                              Tarehe ya Habari
                            </label>
                            <input
                              type="date"
                              value={newsDate}
                              onChange={(e) => setNewsDate(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono text-slate-900"
                            />
                          </div>

                          {/* Author */}
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">
                              Mwandishi / Mtoaji wa Taarifa
                            </label>
                            <input
                              type="text"
                              value={newsAuthor}
                              onChange={(e) => setNewsAuthor(e.target.value)}
                              placeholder="Mf. Ofisi ya Mkuu wa Shule"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Excerpts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">
                              Muhtasari Mfupi (Kiswahili) <span className="text-red-500">*</span>
                              <span className="font-normal text-slate-500 ml-1">(Huu ndio unaosogea kwenye mkanda wa animation)</span>
                            </label>
                            <textarea
                              rows={2}
                              required
                              value={newsExcerptSw}
                              onChange={(e) => setNewsExcerptSw(e.target.value)}
                              placeholder="Andika muhtasari mfupi wa maneno machache utakaopita kwenye live marquee ticker..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-800 block mb-1">
                              Muhtasari Mfupi (English)
                            </label>
                            <textarea
                              rows={2}
                              value={newsExcerptEn}
                              onChange={(e) => setNewsExcerptEn(e.target.value)}
                              placeholder="Brief summary shown on ticker in English..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Full Contents */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">
                              Maelezo Kamili ya Habari (Kiswahili)
                            </label>
                            <textarea
                              rows={4}
                              value={newsContentSw}
                              onChange={(e) => setNewsContentSw(e.target.value)}
                              placeholder="Maelezo yote ya kina ya habari au tangazo hili..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-800 block mb-1">
                              Maelezo Kamili ya Habari (English)
                            </label>
                            <textarea
                              rows={4}
                              value={newsContentEn}
                              onChange={(e) => setNewsContentEn(e.target.value)}
                              placeholder="Full detailed content of the article in English..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Image Upload & Preview Section */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <label className="font-bold text-slate-800 block">
                            Picha ya Habari / Tangazo (Photo)
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            {/* File Upload Button */}
                            <div className="space-y-2">
                              <label className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-emerald-600">
                                <Camera className="w-4 h-4" />
                                <span>Pakia Picha kutoka Simu / Kompyuta</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleNewsImageFile}
                                  className="hidden"
                                />
                              </label>
                              <div className="text-[11px] text-slate-500">
                                Au weka kiungo cha picha mtandaoni:
                              </div>
                              <input
                                type="url"
                                value={newsImageUrl}
                                onChange={(e) => setNewsImageUrl(e.target.value)}
                                placeholder="https://mfano.com/picha.jpg"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                              />
                            </div>

                            {/* Preview Thumbnail */}
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner flex items-center justify-center shrink-0">
                                {newsImageUrl ? (
                                  <img
                                    src={newsImageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] text-slate-400 text-center px-1">Hakuna Picha (Itatumia ya mfumo)</span>
                                )}
                              </div>
                              {newsImageUrl && (
                                <button
                                  type="button"
                                  onClick={() => setNewsImageUrl('')}
                                  className="text-xs text-red-600 hover:text-red-800 font-bold underline cursor-pointer"
                                >
                                  Ondoa Picha
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Featured Checkbox */}
                        <div className="flex items-center gap-2.5 pt-1">
                          <input
                            type="checkbox"
                            id="newsFeaturedCheck"
                            checked={newsFeatured}
                            onChange={(e) => setNewsFeatured(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <label htmlFor="newsFeaturedCheck" className="font-bold text-slate-800 cursor-pointer">
                            Weka kama Habari Kuu (Featured) - Ionekane kwanza kwenye mkanda na kadi ya animation
                          </label>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => setShowAddNewsModal(false)}
                            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            Ghairi
                          </button>
                          <button
                            type="submit"
                            id="admin-btn-save-news"
                            className="px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-black text-xs flex items-center gap-2 shadow-md cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            <span>{editingNewsId ? 'Sasisha Habari' : 'Chapisha Habari Kwenye Tovuti'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Filter and Search Bar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={newsSearch}
                        onChange={(e) => setNewsSearch(e.target.value)}
                        placeholder={language === 'sw' ? 'Tafuta habari kwa kichwa au maelezo...' : 'Search news by title or content...'}
                        className="w-full sm:w-64 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {['ALL', 'Matangazo', 'Taaluma', 'Michezo', 'Kikanisa', 'Uongozi'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setNewsCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                            newsCategoryFilter === cat
                              ? 'bg-emerald-900 text-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat === 'ALL' ? (language === 'sw' ? 'Zote' : 'All') : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* News Articles Grid */}
                  <div className="space-y-4">
                    {news
                      .filter((item) => {
                        const matchCat = newsCategoryFilter === 'ALL' || item.category === newsCategoryFilter;
                        const matchSearch =
                          !newsSearch.trim() ||
                          item.titleSw.toLowerCase().includes(newsSearch.toLowerCase()) ||
                          item.titleEn.toLowerCase().includes(newsSearch.toLowerCase()) ||
                          (item.excerptSw && item.excerptSw.toLowerCase().includes(newsSearch.toLowerCase())) ||
                          (item.contentSw && item.contentSw.toLowerCase().includes(newsSearch.toLowerCase()));
                        return matchCat && matchSearch;
                      })
                      .map((item, idx) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                        >
                          {/* Left: Image & Category */}
                          <div className="flex items-start gap-4 w-full md:w-auto">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 relative">
                              <img
                                src={item.imageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'}
                                alt={item.titleSw}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-1 left-1">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-900/90 text-amber-300 font-bold text-[9px] uppercase shadow-xs">
                                  {item.category}
                                </span>
                              </div>
                            </div>

                            {/* Middle Details */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                                  #{idx + 1}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {item.date}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  • {item.author || 'Ofisi ya Mkuu wa Shule'}
                                </span>
                                {item.featured && (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase">
                                    ★ Featured
                                  </span>
                                )}
                              </div>

                              <h5 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
                                {item.titleSw}
                              </h5>
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                {item.excerptSw || item.contentSw}
                              </p>
                              {item.titleEn && (
                                <p className="text-[11px] text-slate-400 italic line-clamp-1">
                                  En: {item.titleEn}
                                </p>
                              )}
                              
                              <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                                <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                                <span>Inazunguka kwenye Live Marquee Ticker & Hero Card</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                            <button
                              onClick={() => handleEditNews(item)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Hariri habari hii"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Hariri</span>
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(language === 'sw' ? 'Je, una uhakika unataka kufuta habari hii?' : 'Are you sure you want to delete this article?')) {
                                  deleteNews(item.id);
                                  setNewsStatusMsg(language === 'sw' ? 'Habari imefutwa kikamilifu.' : 'News article deleted.');
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Futa habari hii"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Futa</span>
                            </button>
                          </div>
                        </div>
                      ))}

                    {/* Empty State */}
                    {news.length === 0 && (
                      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                          <Radio className="w-6 h-6 animate-pulse" />
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">
                          {language === 'sw' ? 'Hakuna Habari Zilizopo kwa Sasa' : 'No News Articles Currently'}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          {language === 'sw'
                            ? 'Umekwisha kufuta habari za mfano. Bonyeza kitufe cha "+ Weka Habari Mpya" kuweka matangazo yako rasmi yatakayozunguka kwenye animation ya tovuti.'
                            : 'All sample news cleared. Click "+ Add New News" to publish your own official announcements on the live ticker.'}
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={handleOpenAddNews}
                            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs inline-flex items-center gap-2 shadow-md cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{language === 'sw' ? 'Weka Habari Yako ya Kwanza Sasa' : 'Add Your First Announcement Now'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: EXCEL IMPORTER */}
              {activeTab === 'excelUpload' && (
                <div className="space-y-6">
                  {/* Top Excel Info Card */}
                  <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>KUSAKINISHA MATOKEO YA EXCEL KWENYE WEB & PDF</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {language === 'sw' ? 'Pakia Faili la Matokeo ya Excel (.xlsx)' : 'Upload Excel Examination Spreadsheet (.xlsx)'}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {language === 'sw'
                          ? 'Mfumo utachakata alama za masomo, kukokotoa Division (I, II, III, IV, 0), Pointi, na kutengeneza Hati za Matokeo (PDF) kwa kila mwanafunzi kiotomatiki.'
                          : 'The engine parses all subject columns, automatically computes NECTA Divisions & Points, and generates PDF slips.'}
                      </p>
                    </div>

                    <button
                      onClick={downloadExcelTemplate}
                      id="admin-btn-download-template"
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{language === 'sw' ? 'Pakua Kiolezo cha Excel' : 'Download Excel Template'}</span>
                    </button>
                  </div>

                  {/* Feedback Banners */}
                  {uploadSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{uploadSuccessMsg}</span>
                    </div>
                  )}

                  {uploadErrorMsg && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center gap-2 shadow-xs">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <span>{uploadErrorMsg}</span>
                    </div>
                  )}

                  {/* Drag and Drop / File Input Box */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-dashed border-emerald-800/30 hover:border-emerald-700 transition-all text-center space-y-4 bg-slate-50/50">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                      <Upload className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-base font-bold text-slate-900">
                        {excelFile ? excelFile.name : (language === 'sw' ? 'Bofya au Vuta Faili la Excel Hapa' : 'Select or Drag & Drop Excel File Here')}
                      </h5>
                      <p className="text-xs text-slate-500">
                        Inasaidia faili za <strong className="font-mono">.xlsx</strong>, <strong className="font-mono">.xls</strong> au <strong className="font-mono">.csv</strong> zenye orodha ya wanafunzi na alama za masomo ya NECTA.
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="excel-file-input"
                    />

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                        <span>{language === 'sw' ? 'Chagua Faili la Excel' : 'Browse Excel File'}</span>
                      </button>

                      {excelFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setExcelFile(null);
                            setParsedStudents([]);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Futa Faili
                        </button>
                      )}
                    </div>

                    {isParsingExcel && (
                      <div className="text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Inasoma na kukokotoa alama za wanafunzi kutoka Excel...</span>
                      </div>
                    )}
                  </div>

                  {/* Parsed Students Preview */}
                  {parsedStudents.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-emerald-700" />
                            <span>Wanafunzi {parsedStudents.length} Wametambuliwa Tayari Kusakinishwa</span>
                          </h4>
                          <p className="text-xs text-slate-500">
                            Tathmini ya kiotomatiki: Div I: {parsedStudents.filter((s) => s.division === 'Division I').length}, Div II: {parsedStudents.filter((s) => s.division === 'Division II').length}, Div III: {parsedStudents.filter((s) => s.division === 'Division III').length}
                          </p>
                        </div>

                        {/* Import Mode Options */}
                        <div className="flex items-center gap-3">
                          <label className="text-xs flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="importMode"
                              checked={importMode === 'merge'}
                              onChange={() => setImportMode('merge')}
                            />
                            <span>Ongeza / Unganisha (Merge)</span>
                          </label>

                          <label className="text-xs flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="importMode"
                              checked={importMode === 'replace'}
                              onChange={() => setImportMode('replace')}
                            />
                            <span>Badilisha Yote (Replace All)</span>
                          </label>
                        </div>
                      </div>

                      {/* Preview Table */}
                      <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-100">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                            <tr>
                              <th className="py-2 px-3">#</th>
                              <th className="py-2 px-3">NAMBA YA MTIHANI</th>
                              <th className="py-2 px-3">JINA LA MWANAFUNZI</th>
                              <th className="py-2 px-3">KIDATO</th>
                              <th className="py-2 px-3 text-center">WASTANI</th>
                              <th className="py-2 px-3 text-center">POINTI</th>
                              <th className="py-2 px-3 text-center">DARAJA</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parsedStudents.map((st, i) => (
                              <tr key={st.id || i} className="hover:bg-slate-50">
                                <td className="py-2 px-3 text-slate-400 font-mono">{i + 1}</td>
                                <td className="py-2 px-3 font-mono font-bold text-emerald-900">{st.examNumber}</td>
                                <td className="py-2 px-3 font-bold text-slate-900">{st.studentName}</td>
                                <td className="py-2 px-3 text-slate-600">{st.form}</td>
                                <td className="py-2 px-3 text-center font-bold">{st.averageMarks}%</td>
                                <td className="py-2 px-3 text-center font-mono text-blue-900">{st.points}</td>
                                <td className="py-2 px-3 text-center font-bold text-emerald-800">{st.division}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Commit Button */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={handleCommitExcelResults}
                          id="btn-commit-excel-publish"
                          className="px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 transition-all"
                        >
                          <Save className="w-4 h-4" />
                          <span>Sakinisha Matokeo Haya Kwenye Tovuti & PDF Sasa</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: STUDENT RESULTS LIST & INDIVIDUAL PDF SLIP */}
              {activeTab === 'results' && (
                <div className="space-y-6">
                  {/* Action Bar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Orodha ya Wanafunzi ({studentResults.length})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Tazama, pakua hati ya PDF ya mwanafunzi mmoja mmoja au pakua broadsheet nzima.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadClassBroadsheetPdf(studentResults)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>Pakua Broadsheet (PDF)</span>
                      </button>

                      <button
                        onClick={() => exportResultsToExcel(studentResults)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Hamisha Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* Create New Result Form Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-700" />
                        <span>{language === 'sw' ? 'Ongeza Matokeo ya Mwanafunzi Mmoja' : 'Add Single Student Result'}</span>
                      </h4>
                    </div>

                    <form onSubmit={handleCreateStudent} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Jina Kamili la Mwanafunzi</label>
                        <input
                          type="text"
                          required
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                          placeholder="Mf. REHEMA JOSEPHAT KIMARO"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Namba ya Mtihani</label>
                        <input
                          type="text"
                          required
                          value={newExamNumber}
                          onChange={(e) => setNewExamNumber(e.target.value)}
                          placeholder="S0486/0099/2025"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Kidato</label>
                        <select
                          value={newForm}
                          onChange={(e) => setNewForm(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <option value="Form 1">Form 1</option>
                          <option value="Form 2">Form 2</option>
                          <option value="Form 3">Form 3</option>
                          <option value="Form 4">Form 4</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Daraja (Division)</label>
                        <select
                          value={newDivision}
                          onChange={(e) => setNewDivision(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <option value="Division I">Division I</option>
                          <option value="Division II">Division II</option>
                          <option value="Division III">Division III</option>
                          <option value="Division IV">Division IV</option>
                          <option value="Division 0">Division 0</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Pointi za NECTA</label>
                        <input
                          type="number"
                          value={newPoints}
                          onChange={(e) => setNewPoints(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Wastani wa Alama (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newAvg}
                          onChange={(e) => setNewAvg(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3 pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{language === 'sw' ? 'Hifadhi Matokeo Haya' : 'Save Student Result'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Existing Results List Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex justify-between items-center">
                      <span>Wanafunzi Walio Kwenye Mfumo ({studentResults.length})</span>
                      <span className="font-mono text-emerald-800">NECTA S0486</span>
                    </div>

                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">NAMBA YA MTIHANI</th>
                            <th className="py-2.5 px-3">JINA LA MWANAFUNZI</th>
                            <th className="py-2.5 px-3">KIDATO</th>
                            <th className="py-2.5 px-3 text-center">DARAJA</th>
                            <th className="py-2.5 px-3 text-center">POINTI</th>
                            <th className="py-2.5 px-3 text-center">WASTANI</th>
                            <th className="py-2.5 px-3 text-center">KITENDO (PDF)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {studentResults.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-emerald-900">{s.examNumber}</td>
                              <td className="py-2.5 px-3 text-slate-900 font-semibold">{s.studentName}</td>
                              <td className="py-2.5 px-3">{s.form} ({s.stream})</td>
                              <td className="py-2.5 px-3 text-center font-bold text-emerald-800">{s.division}</td>
                              <td className="py-2.5 px-3 text-center font-mono">{s.points}</td>
                              <td className="py-2.5 px-3 text-center font-mono">{s.averageMarks}%</td>
                              <td className="py-2.5 px-3 text-center flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => downloadStudentResultSlipPdf(s)}
                                  className="px-2 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                  title="Pakua Hati ya PDF"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>PDF Slip</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Unataka kufuta matokeo ya ${s.studentName}?`)) {
                                      deleteStudentResult(s.id);
                                    }
                                  }}
                                  className="p-1 rounded-md text-red-500 hover:bg-red-50"
                                  title="Futa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PDF RESULTS BOOKLETS LIBRARY */}
              {activeTab === 'pdfLibrary' && (
                <div className="space-y-6">
                  {/* Add New PDF Document Form */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-700" />
                      <span>Ongeza Kitabu cha Matokeo ya PDF (Published Results Document)</span>
                    </h4>

                    <form onSubmit={handleCreatePdfDoc} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Jina la Nyaraka (Kiswahili)</label>
                        <input
                          type="text"
                          required
                          value={newPdfTitleSw}
                          onChange={(e) => setNewPdfTitleSw(e.target.value)}
                          placeholder="Mf. Matokeo Rasmi ya NECTA CSEE 2024"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Jina la Nyaraka (English)</label>
                        <input
                          type="text"
                          value={newPdfTitleEn}
                          onChange={(e) => setNewPdfTitleEn(e.target.value)}
                          placeholder="Official NECTA CSEE 2024 Results"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Kidato</label>
                        <select
                          value={newPdfForm}
                          onChange={(e) => setNewPdfForm(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <option value="Form 4">Kidato cha Nne (Form 4)</option>
                          <option value="Form 3">Kidato cha Tatu (Form 3)</option>
                          <option value="Form 2">Kidato cha Pili (Form 2)</option>
                          <option value="Form 1">Kidato cha Kwanza (Form 1)</option>
                          <option value="All Forms">Madarasa Yote (All Forms)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Muhtasari wa Madaraja</label>
                        <input
                          type="text"
                          value={newPdfSummary}
                          onChange={(e) => setNewPdfSummary(e.target.value)}
                          placeholder="Div I: 104, Div II: 33, Div III: 8"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Weka Nyaraka Hii Kwenye Maktaba ya PDF</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* List of Current PDF Documents */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-700">Nyaraka za PDF Zilizochapishwa</h5>
                    {resultsPdfDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs"
                      >
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 text-sm block">{doc.titleSw}</span>
                          <span className="text-[11px] text-slate-500 block">
                            {doc.form} • {doc.year} • Watahiniwa {doc.totalCandidates} • {doc.divisionSummary}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => downloadClassBroadsheetPdf(studentResults, doc.titleSw)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Pakua PDF</span>
                          </button>
                          <button
                            onClick={() => deleteResultsPdfDoc(doc.id)}
                            className="p-1.5 rounded-xl text-red-500 hover:bg-red-50"
                            title="Futa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: PAYMENT APPROVALS */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {language === 'sw' ? 'Orodha ya Miamala ya Malipo ya Ada' : 'Fee Payments Audit Log'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Thibitisha miamala iliyowasilishwa na wazazi kupitia benki na mitandao ya simu.
                      </p>
                    </div>

                    {onOpenBursar && (
                      <button
                        type="button"
                        onClick={onOpenBursar}
                        className="px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-amber-300 text-xs font-bold flex items-center gap-2 border border-emerald-700 shadow-xs cursor-pointer shrink-0"
                      >
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        <span>{language === 'sw' ? 'Fungua Portal Kamili ya Mhasibu (Bursar) →' : 'Launch Full Bursar Portal →'}</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {paymentRecords.map((pay) => (
                      <div
                        key={pay.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{pay.studentName}</span>
                            <span className="font-mono text-emerald-800">({pay.form})</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                pay.status === 'Imethibitishwa'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : pay.status === 'Inakaguliwa'
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {pay.status}
                            </span>
                          </div>

                          <div className="text-slate-600 space-x-2">
                            <span className="font-bold text-emerald-900">TZS {(pay.amount ?? 0).toLocaleString()} /=</span>
                            <span>•</span>
                            <span className="font-mono">{pay.paymentMethod || 'Bank / Mobile'}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">Ref: {pay.transactionReference || pay.id}</span>
                          </div>

                          <div className="text-[11px] text-slate-400">
                            Risiti No: <span className="font-mono">{pay.receiptNumber}</span> • Simu: {pay.parentPhone} • Tarehe: {pay.paymentDate}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {pay.status !== 'Imethibitishwa' && (
                            <button
                              onClick={() => updatePaymentStatus(pay.id, 'Imethibitishwa')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Thibitisha</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: PARENT FEEDBACK INBOX */}
              {activeTab === 'feedback' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900">
                      {language === 'sw' ? 'Kikasha cha Maoni na Maswali ya Wazazi' : 'Parent Feedback Inbox'}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {parentInquiries.map((fb) => (
                      <div
                        key={fb.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{fb.parentName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{fb.phone}</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 text-[10px] font-bold">
                              {fb.category}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              fb.status === 'Imejibiwa'
                                ? 'bg-emerald-100 text-emerald-900'
                                : fb.status === 'Inashughulikiwa'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {fb.status}
                          </span>
                        </div>

                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                          {fb.message}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                          <span>Tarehe: {fb.createdAt}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateInquiryStatus(fb.id, 'Inashughulikiwa')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                            >
                              Inashughulikiwa
                            </button>
                            <button
                              onClick={() => updateInquiryStatus(fb.id, 'Imejibiwa')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                            >
                              Weka 'Imejibiwa'
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: URGENT ALERTS */}
              {activeTab === 'alerts' && (
                <div className="space-y-6">
                  {/* Top Alert Header Banner */}
                  <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
                        <Megaphone className="w-3.5 h-3.5 animate-bounce" />
                        <span>MATANGAZO YA HARAKA (TOP FLOATING BANNER)</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {language === 'sw' ? 'Matangazo ya Haraka ya Juu ya Tovuti' : 'Top Floating Urgent Announcements'}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {language === 'sw'
                          ? 'Matangazo haya yanaonekana juu kabisa ya tovuti yote kwenye utepe wa rangi ya dhahabu na kijani.'
                          : 'These alerts display on top of the entire website across all pages.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {alerts.length > 0 && (
                        <button
                          onClick={() => {
                            if (window.confirm(language === 'sw' ? 'Je, una uhakika unataka kufuta matangazo yote ya haraka?' : 'Clear all urgent alerts?')) {
                              clearAllAlerts();
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? 'Futa Zote' : 'Clear All'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(language === 'sw' ? 'Rejesha matangazo ya mfano?' : 'Restore default alerts?')) {
                            resetAlertsToDefaults();
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{language === 'sw' ? 'Za Mfano' : 'Defaults'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Create New Alert Form */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-700" />
                      <span>{language === 'sw' ? 'Tengeneza Tangazo Jipya la Juu' : 'Create Floating Header Alert'}</span>
                    </h4>

                    <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Ujumbe wa Tangazo (Kiswahili) *</label>
                        <input
                          type="text"
                          required
                          value={newAlertSw}
                          onChange={(e) => setNewAlertSw(e.target.value)}
                          placeholder="Mf. Shule itafunguliwa rasmi tarehe 12 Januari 2026..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Ujumbe wa Tangazo (English)</label>
                        <input
                          type="text"
                          value={newAlertEn}
                          onChange={(e) => setNewAlertEn(e.target.value)}
                          placeholder="E.g. School officially opens on January 12th, 2026..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Bell className="w-4 h-4" />
                        <span>Tangaza Sasa kwenye Tovuti</span>
                      </button>
                    </form>
                  </div>

                  {/* Active Alerts List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-700">Matangazo Yaliyopo ({alerts.length})</h5>
                    </div>

                    {alerts.map((al) => (
                      <div
                        key={al.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-all shadow-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              al.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {al.active ? '● Liko Hewani (Active)' : '○ Limezuiwa (Inactive)'}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 block text-sm">{al.messageSw}</span>
                          {al.messageEn && (
                            <span className="text-[11px] text-slate-500 italic block">{al.messageEn}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => toggleAlert(al.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition-colors ${
                              al.active
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                            }`}
                          >
                            {al.active ? 'Sitisha' : 'Washa Tena'}
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(language === 'sw' ? 'Futa tangazo hili?' : 'Delete this alert?')) {
                                deleteAlert(al.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Futa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {alerts.length === 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                        Hakuna matangazo ya haraka kwa sasa. Tumia fomu ya juu kuongeza.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: GALLERY PHOTOS MANAGEMENT */}
              {activeTab === 'galleryPhotos' && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  {photoUploadSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold">{photoUploadSuccess}</span>
                      </div>
                      <button onClick={() => setPhotoUploadSuccess(null)} className="text-xs font-bold text-emerald-800 hover:underline">
                        {language === 'sw' ? 'Funga' : 'Dismiss'}
                      </button>
                    </div>
                  )}

                  {photoUploadError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="text-xs font-semibold">{photoUploadError}</span>
                      </div>
                      <button onClick={() => setPhotoUploadError(null)} className="text-xs font-bold text-red-800 hover:underline">
                        {language === 'sw' ? 'Funga' : 'Dismiss'}
                      </button>
                    </div>
                  )}

                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{language === 'sw' ? 'USIMAMIZI WA MATUNZIO YA PICHA (ADMIN ONLY)' : 'PHOTO GALLERY MANAGEMENT (ADMIN ONLY)'}</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {language === 'sw' ? 'Usimamizi wa Picha na Matunzio ya Shule' : 'School Photo Gallery & Media Admin'}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {language === 'sw'
                          ? 'Wewe pekee kama Mkuu/Admin unaruhusiwa kuongeza picha mpya, kubadilisha picha zilizopo, kuhariri maelezo, au kufuta picha kwenye tovuti.'
                          : 'As Admin, only you are authorized to upload new photos, swap existing images, edit captions, or delete photos across the website.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setShowAddPhotoModal(true);
                          setPhotoUploadError(null);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-transform active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{language === 'sw' ? 'Pakia Picha Mpya' : 'Add New Photo'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(language === 'sw' ? 'Je, unataka kurejesha picha zote za asili za shule?' : 'Reset all photos to default collection?')) {
                            resetGalleryToDefaults();
                            setPhotoUploadSuccess(language === 'sw' ? 'Picha za asili zimepakiwa upya!' : 'Default gallery restored!');
                          }
                        }}
                        className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        title="Rejesha picha za awali"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{language === 'sw' ? 'Rejesha za Awali' : 'Reset Defaults'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Add New Photo Modal / Card */}
                  {showAddPhotoModal && (
                    <div className="bg-white p-6 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-900">
                              {language === 'sw' ? 'Pakia Picha Mpya kwenye Matunzio' : 'Upload New Photo to Gallery'}
                            </h5>
                            <p className="text-[11px] text-slate-500">
                              {language === 'sw' ? 'Chagua faili la picha kutoka kwenye kifaa chako kisha weka maelezo yake.' : 'Select image file and fill in description.'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowAddPhotoModal(false);
                            setPhotoFilePreview(null);
                          }}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleCreateGalleryPhoto} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Photo File Selector & Preview */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 block">
                              {language === 'sw' ? 'Chagua Faili la Picha' : 'Choose Photo File'} *
                            </label>
                            
                            <div
                              onClick={() => galleryPhotoInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[160px] ${
                                photoFilePreview ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-300 hover:border-emerald-600 hover:bg-slate-50'
                              }`}
                            >
                              {photoFilePreview ? (
                                <div className="space-y-2">
                                  <img
                                    src={photoFilePreview}
                                    alt="Preview"
                                    className="max-h-36 rounded-xl object-contain shadow-sm mx-auto"
                                  />
                                  <span className="text-[11px] font-bold text-emerald-800 block">
                                    {language === 'sw' ? '✓ Picha ipo tayari (Bofya kubadili)' : '✓ Image ready (Click to change)'}
                                  </span>
                                </div>
                              ) : isPhotoProcessing ? (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
                                  <span className="text-xs font-bold text-slate-600">
                                    {language === 'sw' ? 'Inashughulikia picha...' : 'Processing image...'}
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-2 text-slate-500">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                                    <Camera className="w-5 h-5" />
                                  </div>
                                  <div className="text-xs font-bold text-slate-800">
                                    {language === 'sw' ? 'Bofya hapa kuchagua picha' : 'Click to browse image'}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    PNG, JPG, JPEG, WebP
                                  </div>
                                </div>
                              )}
                            </div>

                            <input
                              type="file"
                              ref={galleryPhotoInputRef}
                              accept="image/*"
                              onChange={handleGalleryFileSelect}
                              className="hidden"
                            />
                          </div>

                          {/* Info Fields */}
                          <div className="space-y-3 text-xs">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">
                                {language === 'sw' ? 'Maelezo / Kichwa cha Picha (Kiswahili)' : 'Photo Title (Swahili)'} *
                              </label>
                              <input
                                type="text"
                                required
                                value={photoTitleSw}
                                onChange={(e) => setPhotoTitleSw(e.target.value)}
                                placeholder="Mf. Wanafunzi wakiwa kwenye maabara ya Kemia..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-700 outline-none"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">
                                {language === 'sw' ? 'Kichwa cha Picha (English)' : 'Photo Title (English)'}
                              </label>
                              <input
                                type="text"
                                value={photoTitleEn}
                                onChange={(e) => setPhotoTitleEn(e.target.value)}
                                placeholder="E.g. Students inside the Modern Science Laboratory..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-700 outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">
                                  {language === 'sw' ? 'Kategoria / Sekta' : 'Category'}
                                </label>
                                <select
                                  value={photoCategory}
                                  onChange={(e) => setPhotoCategory(e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:border-emerald-700 outline-none"
                                >
                                  <option value="Matukio ya Kikanisa">Matukio ya Kikanisa</option>
                                  <option value="Maabara na Sayansi">Maabara na Sayansi</option>
                                  <option value="Mazingira ya Marangu">Mazingira ya Marangu</option>
                                  <option value="Michezo na Sanaa">Michezo na Sanaa</option>
                                  <option value="Taaluma na Maktaba">Taaluma na Maktaba</option>
                                  <option value="Mahafali (Graduation)">Mahafali (Graduation)</option>
                                  <option value="Uongozi na Malezi">Uongozi na Malezi</option>
                                </select>
                              </div>

                              <div>
                                <label className="font-bold text-slate-700 block mb-1">
                                  {language === 'sw' ? 'Tarehe ya Tukio' : 'Event Date'}
                                </label>
                                <input
                                  type="date"
                                  value={photoDate}
                                  onChange={(e) => setPhotoDate(e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:border-emerald-700 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddPhotoModal(false);
                              setPhotoFilePreview(null);
                            }}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                          >
                            {language === 'sw' ? 'Ghairi' : 'Cancel'}
                          </button>
                          <button
                            type="submit"
                            disabled={!photoFilePreview}
                            className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs ${
                              photoFilePreview
                                ? 'bg-emerald-800 hover:bg-emerald-700 text-white'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Save className="w-4 h-4 text-amber-300" />
                            <span>{language === 'sw' ? 'Hifadhi Picha Mpya' : 'Save Photo'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Filters & Search Controls */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={photoSearch}
                          onChange={(e) => setPhotoSearch(e.target.value)}
                          placeholder={language === 'sw' ? 'Tafuta kwa maelezo au jina...' : 'Search by caption...'}
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-start md:justify-end">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">
                        {language === 'sw' ? 'Kategoria:' : 'Filter:'}
                      </span>
                      {['ALL', 'Matukio ya Kikanisa', 'Maabara na Sayansi', 'Mazingira ya Marangu', 'Michezo na Sanaa', 'Taaluma na Maktaba', 'Mahafali (Graduation)'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setPhotoCategoryFilter(cat)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            photoCategoryFilter === cat
                              ? 'bg-emerald-900 text-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat === 'ALL' ? (language === 'sw' ? 'Zote' : 'All') : cat.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photo Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryPhotos
                      .filter((p) => {
                        const matchesCat = photoCategoryFilter === 'ALL' || p.category === photoCategoryFilter;
                        const matchesSearch =
                          !photoSearch.trim() ||
                          p.titleSw.toLowerCase().includes(photoSearch.toLowerCase()) ||
                          p.titleEn.toLowerCase().includes(photoSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(photoSearch.toLowerCase());
                        return matchesCat && matchesSearch;
                      })
                      .map((photo) => (
                        <div
                          key={photo.id}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                          {/* Image Thumbnail with Swap Trigger */}
                          <div className="relative group aspect-video bg-slate-100 overflow-hidden">
                            <img
                              src={photo.imageUrl}
                              alt={photo.titleSw}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            
                            <div className="absolute top-2 left-2">
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 text-amber-300 backdrop-blur-xs">
                                {photo.category}
                              </span>
                            </div>

                            {/* Quick Swap Overlay */}
                            <button
                              onClick={() => {
                                setSwapTargetPhoto(photo);
                                swapPhotoInputRef.current?.click();
                              }}
                              className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-white cursor-pointer"
                              title="Bofya kubadilisha picha hii"
                            >
                              <Camera className="w-6 h-6 text-amber-400 mb-1" />
                              <span className="text-xs font-bold text-amber-300">
                                {language === 'sw' ? 'Badili Picha Hii' : 'Swap Image File'}
                              </span>
                              <span className="text-[10px] text-slate-300">
                                {language === 'sw' ? 'Bofya kupakia picha mpya' : 'Click to upload new'}
                              </span>
                            </button>
                          </div>

                          {/* Details & Controls */}
                          <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                                {language === 'sw' ? photo.titleSw : photo.titleEn}
                              </h5>
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>{photo.date}</span>
                                <span className="font-mono text-[9px] text-slate-400">ID: {photo.id.slice(-6)}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSwapTargetPhoto(photo);
                                  swapPhotoInputRef.current?.click();
                                }}
                                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                              >
                                <Upload className="w-3 h-3 text-emerald-600" />
                                <span>{language === 'sw' ? 'Badili Picha' : 'Replace File'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(language === 'sw' ? `Je, una uhakika unataka kufuta picha hii: "${photo.titleSw}"?` : 'Delete this photo from gallery?')) {
                                    deleteGalleryPhoto(photo.id);
                                    setPhotoUploadSuccess(language === 'sw' ? 'Picha imefutwa.' : 'Photo deleted.');
                                  }
                                }}
                                className="p-1 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Futa picha"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Hidden Swap File Input */}
                  <input
                    type="file"
                    ref={swapPhotoInputRef}
                    accept="image/*"
                    onChange={handleSwapPhotoFile}
                    className="hidden"
                  />
                </div>
              )}

              {/* TAB: CUSTOM LOGO SETTINGS */}
              {activeTab === 'logoSettings' && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  {logoUploadSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold">{logoUploadSuccess}</span>
                    </div>
                  )}

                  {logoUploadError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-3 animate-in fade-in">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <span className="text-xs font-semibold">{logoUploadError}</span>
                    </div>
                  )}

                  {/* Current Active Logo Preview */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-xs">
                        <SchoolLogo size="xl" className="w-full h-full object-contain" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {customLogoUrl ? 'Nembo Maalum (Custom Active)' : 'Nembo Rasmi ya Shule (Official Uomboni Crest)'}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            customLogoUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {customLogoUrl ? 'Custom Active' : 'Official Identity'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                          {customLogoUrl
                            ? 'Nembo hii maalum uliyoiweka inatumika sasa kwenye vichwa vya habari, PDF, fomu za kujiunga na ukurasa mzima wa tovuti.'
                            : 'Nembo rasmi ya asili ya Shule ya Sekondari Uomboni (Jimbo Katoliki Moshi, Mlima Kilimanjaro, Msalaba, Biblia, Wanafunzi na Kaulimbiu "Prayer, Education, Work").'}
                        </p>
                      </div>
                    </div>

                    {customLogoUrl && (
                      <button
                        onClick={() => {
                          if (confirm('Je, una uhakika unataka kuondoa nembo uliyoweka na kurudi kwenye nembo ya asili?')) {
                            resetLogoToDefault();
                            setLogoUploadSuccess('Nembo imerejeshwa kwenye muundo asili wa shule.');
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Rejesha Nembo ya Asili</span>
                      </button>
                    )}
                  </div>

                  {/* Upload Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Method 1: Direct File Upload */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          <Upload className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-bold text-slate-900">
                          {language === 'sw' ? 'Njia ya 1: Pakia Faili la Picha kutoka Kifaa Chako' : 'Option 1: Upload Image from Device'}
                        </h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {language === 'sw'
                            ? 'Chagua picha ya nembo iliyopo kwenye simu au kompyuta yako (PNG, JPG, SVG, WebP). Inashauriwa kuwa na mandhari safi au transparent background.'
                            : 'Select a logo image directly from your phone or computer (PNG, JPG, SVG, WebP). Recommended transparent background.'}
                        </p>
                      </div>

                      <div>
                        <input
                          type="file"
                          ref={logoFileInputRef}
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-transform active:scale-[0.99]"
                        >
                          <Camera className="w-4 h-4 text-amber-400" />
                          <span>{language === 'sw' ? 'Chagua Picha ya Nembo (Browse File)' : 'Browse & Upload Logo'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Method 2: Image URL / Web Link */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <h5 className="text-sm font-bold text-slate-900">
                          {language === 'sw' ? 'Njia ya 2: Weka Kiungo (Image URL)' : 'Option 2: Paste Image URL'}
                        </h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {language === 'sw'
                            ? 'Kama picha ya nembo ipo mtandaoni (Google Drive, Imgur, au tovuti nyingine), bandika kiungo hapa chini.'
                            : 'If your school crest is hosted online, paste the public direct image URL below.'}
                        </p>
                      </div>

                      <form onSubmit={handleLogoUrlSubmit} className="space-y-2">
                        <input
                          type="url"
                          value={logoInputUrl}
                          onChange={(e) => setLogoInputUrl(e.target.value)}
                          placeholder="https://example.com/uomboni-logo.png"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-700 outline-none"
                        />
                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Save className="w-4 h-4 text-amber-300" />
                          <span>{language === 'sw' ? 'Hifadhi Kutoka Link' : 'Save from URL'}</span>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Helpful Guidelines */}
                  <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl text-xs space-y-2">
                    <h6 className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Vidokezo vya Picha Bora ya Nembo:</span>
                    </h6>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      <li>Umbo la duara au mraba (1:1 aspect ratio) linapendeza zaidi.</li>
                      <li>Inapendekezwa kutumia faili lenye uwazi (PNG yenye transparent background).</li>
                      <li>Ukubwa wa picha unaopendekezwa ni <strong>500x500 pixels</strong> hadi <strong>1000x1000 pixels</strong> kwa ubora wa juu kwenye hati zote za PDF.</li>
                    </ul>
                  </div>

                  {/* Clean Slate Management Section */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
                          <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-slate-900">
                            {language === 'sw' ? 'Usafishaji na Kuanza Upya Taarifa (Clean Slate)' : 'Clean Slate & Reset Registry'}
                          </h5>
                          <p className="text-xs text-slate-500">
                            {language === 'sw'
                              ? 'Futa taarifa zote zilizopo ili kuanza mfumo tupu na kuweka taarifa zote mpya za shule kuanzia mwanzo kabisa.'
                              : 'Clear all existing records to start with a blank database and enter your official school data from scratch.'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {language === 'sw' ? 'Mfumo Halisi' : 'Production Ready'}
                      </span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(language === 'sw' ? 'Onyo: Je, una uhakika unataka kusafisha taarifa zote ili uweze kuanza kuingiza taarifa mpya mwanzo kabisa?' : 'Warning: Are you sure you want to clear all records to start entering new data from scratch?')) {
                            clearSampleData();
                            alert(language === 'sw' ? 'Taarifa zimesafishwa kikamilifu. Sasa unaweza kuanza kuingiza taarifa zote za shule mwanzo kabisa.' : 'All records have been cleared. You can now input all records from scratch.');
                          }
                        }}
                        className="py-3 px-5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span>{language === 'sw' ? 'Safisha Taarifa Zote Kuanza Upya (Clear All to Blank)' : 'Clear All Records to Blank Slate'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SYSTEM ARCHITECTURE & 3D TECH STACK */}
              {activeTab === 'systemArchitecture' && (
                <AdminSystemArchitectureTab
                  onOpenFullModal={() => setIsAdminArchModalOpen(true)}
                />
              )}
            </div>
          </div>
      </div>

      {/* Embedded Full Architecture 3D Modal */}
      {isAdminArchModalOpen && (
        <SystemArchitectureModal
          isOpen={isAdminArchModalOpen}
          onClose={() => setIsAdminArchModalOpen(false)}
        />
      )}
    </div>
  );
};
