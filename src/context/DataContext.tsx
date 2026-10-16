import React, { createContext, useContext, useState, useEffect } from 'react';
import { logOutFromFirebase } from '../lib/firebase';
import {
  StudentResult,
  NewsItem,
  SchoolEvent,
  AcademicCalendarEvent,
  Teacher,
  BankAccount,
  MobilePaymentMethod,
  FeePaymentRecord,
  JoiningDocument,
  GalleryPhoto,
  EnrollmentStat,
  NectaPerformanceStat,
  SubjectStat,
  UrgentAlert,
  ParentInquiry,
  ResultsPdfDocument,
  StudentProfile,
  SchoolAsset,
  TimetableSlot,
  StudentNotice,
  OnlineApplication,
  StudentCouncilMember,
  SchoolProfile,
  AcademicDirective,
  ExamTypeConfig,
} from '../types';
import {
  saveAcademicDirectiveToFirestore,
  getAcademicDirectivesFromFirestore,
  getDirectivesFromLocalStorage,
  saveExamTypeToFirestore,
  deleteExamTypeFromFirestore,
  getExamTypesFromFirestore,
} from '../services/academicFirestoreService';
import { isTeacherAuthorizedForSubject } from '../services/teacherAuthDirectory';
import {
  INITIAL_STUDENT_RESULTS,
  INITIAL_EXAM_TYPES,
  SAMPLE_MOCK_STUDENT_RESULTS,
  INITIAL_NEWS,
  INITIAL_EVENTS,
  INITIAL_ACADEMIC_CALENDAR,
  INITIAL_TEACHERS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_MOBILE_METHODS,
  INITIAL_PAYMENT_RECORDS,
  SAMPLE_MOCK_PAYMENT_RECORDS,
  INITIAL_JOINING_DOCUMENTS,
  INITIAL_GALLERY,
  INITIAL_ENROLLMENT_STATS,
  INITIAL_NECTA_TRENDS,
  INITIAL_SUBJECT_STATS,
  INITIAL_ALERTS,
  INITIAL_RESULTS_PDF_DOCUMENTS,
  INITIAL_STUDENTS,
  SAMPLE_MOCK_STUDENTS,
  INITIAL_SCHOOL_ASSETS,
  INITIAL_TIMETABLE,
  INITIAL_STUDENT_NOTICES,
  INITIAL_APPLICATIONS,
  SAMPLE_MOCK_APPLICATIONS,
  INITIAL_STUDENT_COUNCIL,
  SCHOOL_PROFILE_INFO,
} from '../data/initialData';
import { DEFAULT_UOMBONI_STUDENT_RESULTS } from '../data/defaultStudentResults';
import { FORM_FOUR_STUDENT_PROFILES } from '../data/formFourStudents';
import {
  calculateNectaDivision,
  formatNectaDetailedSubjects,
  scoreToNectaGrade,
} from '../utils/nectaResultsEngine';
import {
  cacheStudentResultsOffline,
  getCachedStudentResultsOffline,
  setupOfflineResultsListener,
} from '../services/offlineResultsService';

interface DataContextType {
  // Offline Service Worker & Cached Results Status
  isOffline: boolean;
  offlineCachedCount: number;
  lastResultsOfflineSync: number | null;
  syncResultsToOfflineStorage: () => Promise<{ success: boolean; count: number }>;
  loadInitialResults: () => void;

  // Online Applications & Admissions
  applications: OnlineApplication[];
  submitOnlineApplication: (app: Omit<OnlineApplication, 'id' | 'applicationNumber' | 'submissionDate' | 'status'>) => OnlineApplication;
  updateApplicationStatus: (id: string, status: OnlineApplication['status'], adminNotes?: string, verifiedBy?: string) => void;
  deleteOnlineApplication: (id: string) => void;
  convertApplicationToStudent: (appId: string, form?: string, stream?: string) => StudentProfile;

  // Results & Academic Master Administration
  studentResults: StudentResult[];
  isResultsPublishedToParents: boolean;
  publishResultsToParents: (published: boolean, author?: string) => void;
  recomputeNectaDivisions: (formFilter?: string, examFilter?: string) => void;
  submitTeacherSubjectMarks: (
    subject: string,
    form: string,
    examType: string,
    teacherName: string,
    marksDraft: { [examNumber: string]: { score: number; remarks: string } }
  ) => { updatedCount: number };
  subjectSubmissions: Record<string, { teacherName: string; submittedAt: string; status: 'submitted' | 'pending'; count: number }>;
  searchResult: (query: string, formFilter?: string, examFilter?: string) => StudentResult[];
  addStudentResult: (result: StudentResult) => void;
  bulkAddStudentResults: (results: StudentResult[]) => void;
  bulkReplaceStudentResults: (results: StudentResult[]) => void;
  updateStudentResult: (result: StudentResult) => void;
  deleteStudentResult: (id: string) => void;

  // Official PDF Results Documents Library
  resultsPdfDocuments: ResultsPdfDocument[];
  addResultsPdfDoc: (doc: ResultsPdfDocument) => void;
  updateResultsPdfDoc: (doc: ResultsPdfDocument) => void;
  deleteResultsPdfDoc: (id: string) => void;

  // Academic Directives & Teacher Mark Entry Permissions
  academicDirectives: AcademicDirective[];
  sendAcademicDirective: (directive: Omit<AcademicDirective, 'id' | 'timestamp'>) => AcademicDirective;
  updateAcademicDirective: (id: string, updates: Partial<AcademicDirective>) => void;
  deleteAcademicDirective: (id: string) => void;
  toggleMarkEntryAuthorization: (
    form: string,
    examType: string,
    isOpen: boolean,
    directiveMessage?: string,
    deadlineDate?: string,
    authorName?: string
  ) => void;
  checkMarkEntryPermission: (
    form: string,
    examType: string
  ) => { isAllowed: boolean; directive?: AcademicDirective; reason: string; deadlineDate?: string };

  // Exam Types Management (Aina za Mitihani - Mtaaluma / Academic Master)
  examTypes: ExamTypeConfig[];
  addExamType: (examType: Omit<ExamTypeConfig, 'id'>) => ExamTypeConfig;
  updateExamType: (id: string, updates: Partial<ExamTypeConfig>) => void;
  deleteExamType: (id: string) => void;
  toggleExamTypeEntryStatus: (id: string, isOpen: boolean) => void;

  // Students Directory & Profiles Management
  students: StudentProfile[];
  addStudent: (student: StudentProfile) => void;
  updateStudent: (student: StudentProfile) => void;
  deleteStudent: (id: string) => void;

  // Student Auth & Session
  currentLoggedInStudent: StudentProfile | null;
  loginStudent: (identifier: string) => boolean;
  logoutStudent: () => void;

  // School Assets & Inventory Management
  schoolAssets: SchoolAsset[];
  addSchoolAsset: (asset: SchoolAsset) => void;
  updateSchoolAsset: (asset: SchoolAsset) => void;
  deleteSchoolAsset: (id: string) => void;
  assignAssetToStudent: (assetId: string, studentId: string, studentName: string, returnDate?: string) => void;
  returnSchoolAsset: (assetId: string) => void;

  // Timetable
  timetable: TimetableSlot[];
  addTimetableSlot: (slot: TimetableSlot) => void;
  updateTimetableSlot: (slot: TimetableSlot) => void;
  deleteTimetableSlot: (id: string) => void;

  // Student Notices
  studentNotices: StudentNotice[];
  addStudentNotice: (notice: StudentNotice) => void;
  deleteStudentNotice: (id: string) => void;

  // News
  news: NewsItem[];
  addNews: (item: NewsItem) => void;
  updateNews: (item: NewsItem) => void;
  deleteNews: (id: string) => void;
  clearAllNews: () => void;
  resetNewsToDefaults: () => void;

  // Events
  events: SchoolEvent[];
  addEvent: (item: SchoolEvent) => void;
  updateEvent: (item: SchoolEvent) => void;
  deleteEvent: (id: string) => void;
  resetEventsToDefaults: () => void;

  // Academic Calendar & Term Dates
  academicCalendar: AcademicCalendarEvent[];
  addAcademicCalendarEvent: (item: AcademicCalendarEvent) => void;
  updateAcademicCalendarEvent: (item: AcademicCalendarEvent) => void;
  deleteAcademicCalendarEvent: (id: string) => void;
  resetAcademicCalendarToDefaults: () => void;

  // Teachers
  teachers: Teacher[];
  addTeacher: (item: Teacher) => void;
  updateTeacher: (item: Teacher) => void;
  deleteTeacher: (id: string) => void;

  // Student Council (Serikali ya Wanafunzi)
  studentCouncil: StudentCouncilMember[];
  addStudentCouncilMember: (member: StudentCouncilMember) => void;
  updateStudentCouncilMember: (member: StudentCouncilMember) => void;
  deleteStudentCouncilMember: (id: string) => void;
  resetStudentCouncilToDefaults: () => void;

  // School Profile & History
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (updates: Partial<SchoolProfile>) => void;

  // Payments & Accounts
  bankAccounts: BankAccount[];
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (account: BankAccount) => void;
  deleteBankAccount: (id: string) => void;
  mobilePaymentMethods: MobilePaymentMethod[];
  paymentRecords: FeePaymentRecord[];
  submitPaymentRecord: (record: Omit<FeePaymentRecord, 'id' | 'status' | 'receiptNumber'>) => FeePaymentRecord;
  updatePaymentStatus: (id: string, status: 'Imethibitishwa' | 'Inakaguliwa' | 'Imekataliwa') => void;

  // Google Auth Profile state for Admin and Bursar
  adminGoogleUser: { email: string | null; displayName: string | null; photoURL: string | null } | null;
  bursarGoogleUser: { email: string | null; displayName: string | null; photoURL: string | null } | null;
  loginAdminWithGoogle: (profile: { email: string | null; displayName: string | null; photoURL: string | null }) => void;
  loginBursarWithGoogle: (profile: { email: string | null; displayName: string | null; photoURL: string | null }) => void;

  // Bursar (Mhasibu wa Shule) Portal Methods
  isBursarLoggedIn: boolean;
  loginBursar: (pin: string) => boolean;
  logoutBursar: () => void;
  updateStudentFee: (studentId: string, feeTotal: number, feePaid: number) => void;
  recordBursarPayment: (data: {
    studentId: string;
    amount: number;
    paymentMethod: string;
    transactionReference: string;
    paymentDate?: string;
    parentPhone?: string;
    notes?: string;
  }) => FeePaymentRecord;
  clearStudentDebt: (studentId: string) => void;
  batchUpdateFeesByClass: (form: string, studentType: 'Bweni' | 'Kutwa' | 'Wote', feeTotal: number) => number;

  // Joining Documents
  joiningDocs: JoiningDocument[];
  incrementDocDownload: (id: string) => void;
  addJoiningDoc: (doc: JoiningDocument) => void;
  updateJoiningDoc: (doc: JoiningDocument) => void;
  deleteJoiningDoc: (id: string) => void;

  // Gallery
  galleryPhotos: GalleryPhoto[];
  addGalleryPhoto: (photo: GalleryPhoto) => void;
  updateGalleryPhoto: (photo: GalleryPhoto) => void;
  bulkReplaceGalleryPhotos: (photos: GalleryPhoto[]) => void;
  resetGalleryToDefaults: () => void;
  deleteGalleryPhoto: (id: string) => void;

  // Inquiries
  parentInquiries: ParentInquiry[];
  submitInquiry: (inquiry: Omit<ParentInquiry, 'id' | 'createdAt' | 'status'>) => ParentInquiry;
  updateInquiryStatus: (id: string, status: 'Inashughulikiwa' | 'Imejibiwa' | 'Mpya', notes?: string) => void;

  // School Logo Settings
  customLogoUrl: string | null;
  setCustomLogoUrl: (url: string | null) => void;
  resetLogoToDefault: () => void;

  // Alerts
  alerts: UrgentAlert[];
  dismissAlert: (id: string) => void;
  addAlert: (alert: UrgentAlert) => void;
  toggleAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
  clearAllAlerts: () => void;
  resetAlertsToDefaults: () => void;

  // Analytics
  enrollmentStats: EnrollmentStat[];
  updateEnrollmentStats: (stats: EnrollmentStat[]) => void;
  nectaTrends: NectaPerformanceStat[];
  subjectStats: SubjectStat[];

  // Admin Auth
  isAdminLoggedIn: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  resetAllDataToDefaults: () => void;
  seedSampleData: () => void;
  clearSampleData: () => void;

  // Live Multi-Device Server Sync
  isServerSyncing: boolean;
  lastServerSyncTime: number | null;
  syncAllWithServer: () => Promise<boolean>;
  forceRefreshFromServer: () => Promise<void>;
}

// Safe storage helper to prevent uncaught JSON parse crashes
function safeGetStorage<T>(key: string, fallback: T, isSession = false): T {
  try {
    const storage = isSession ? window.sessionStorage : window.localStorage;
    const item = storage?.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`Error reading storage key "${key}":`, err);
    return fallback;
  }
}

function safeSetStorage(key: string, value: any, isSession = false): void {
  try {
    const storage = isSession ? window.sessionStorage : window.localStorage;
    storage?.setItem(key, JSON.stringify(value));
  } catch (err: any) {
    console.warn(`Storage write warning for key "${key}":`, err);
    try {
      if (typeof window !== 'undefined' && !isSession) {
        // Free quota by removing large cache buffers if quota exceeded
        window.localStorage.removeItem('uomboni_results_pdfs');
        window.localStorage.removeItem('uomboni_offline_results');
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {}
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Clean slate migration: Ensure any prior mock data is cleared from browser cache
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('uomboni_fresh_clean_slate_cssc_aug2026_v1') !== 'true') {
      const keysToClear = [
        'uomboni_results',
        'uomboni_students',
        'uomboni_academic_subject_submissions',
        'uomboni_applications',
        'uomboni_assets',
        'uomboni_timetable',
        'uomboni_student_notices',
        'uomboni_news',
        'uomboni_events',
        'uomboni_calendar',
        'uomboni_teachers',
        'uomboni_payments',
        'uomboni_inquiries',
        'uomboni_alerts',
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));
      sessionStorage.removeItem('uomboni_active_student');
      localStorage.setItem('uomboni_fresh_clean_slate_cssc_aug2026_v1', 'true');
    }
  } catch {
    // Storage access restricted in some iframe contexts
  }
}

const DEFAULT_ACADEMIC_DIRECTIVES: AcademicDirective[] = [
  {
    id: 'dir-form4-mock-2025',
    title: 'Ufunguzi wa Dirisha la Kuingiza Alama za NECTA Mock 2025 (Kidato cha IV)',
    message: 'Walimu wote wanaofundisha Kidato cha Nne mnatakiwa kukamilisha uingizaji wa alama za mtihani wa Mock 2025 kabla ya tarehe 30 Machi 2026. Hakikisheni alama zote ziko katika mfumo wa 0-100 na maoni ya kitaaluma yamewekwa kwa ukamilifu.',
    senderName: 'Mwl. Yohana Bahati',
    senderRole: 'Mkuu wa Taaluma (Academic Master)',
    targetForm: 'Form 4',
    examType: 'NECTA Mock 2025',
    deadlineDate: '2026-03-30',
    isOpenForEntry: true,
    allowLateSubmissions: false,
    priority: 'urgent',
    dateIssued: '2026-03-12',
    timestamp: 1773300000000,
    status: 'active',
  },
  {
    id: 'dir-form2-midterm-2025',
    title: 'Ruhusa ya Kuingiza Alama za Mid-Term Exam 2025 (Kidato cha II)',
    message: 'Dirisha la kuingiza alama za mtihani wa nusu muhula kwa Kidato cha Pili limefunguliwa rasmi. Walimu wa masomo yote (Sayansi na Sanaa) tafadhali wasilisheni alama kwa wakati.',
    senderName: 'Madam Adela Manyanga',
    senderRole: 'Msaidizi wa Taaluma (Assistant Academic Master)',
    targetForm: 'Form 2',
    examType: 'Mid-Term Exam 2025',
    deadlineDate: '2026-04-05',
    isOpenForEntry: true,
    allowLateSubmissions: true,
    priority: 'high',
    dateIssued: '2026-03-14',
    timestamp: 1773400000000,
    status: 'active',
  },
  {
    id: 'dir-all-general-instructions',
    title: 'Mwongozo Rasmi wa Viwango vya Ufaulu (NECTA Grading Guidelines)',
    message: 'Kila mwalimu anapoweka alama, mfumo utapiga mahesabu ya Madaraja (A, B, C, D, F) na pointi kiotomatiki. Ni marufuku kuingiza alama zilizo nje ya 0-100 au kuacha mwanafunzi aliyesajiliwa bila alama bila maelezo.',
    senderName: 'Mwl. Yohana Bahati',
    senderRole: 'Mkuu wa Taaluma (Academic Master)',
    targetForm: 'ALL',
    examType: 'ALL',
    deadlineDate: '2026-04-30',
    isOpenForEntry: true,
    allowLateSubmissions: true,
    priority: 'normal',
    dateIssued: '2026-03-10',
    timestamp: 1773200000000,
    status: 'active',
  },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentResults, setStudentResults] = useState<StudentResult[]>(() => {
    const loaded = safeGetStorage<StudentResult[]>('uomboni_results', DEFAULT_UOMBONI_STUDENT_RESULTS);
    let base = Array.isArray(loaded) && loaded.length > 0 ? loaded : DEFAULT_UOMBONI_STUDENT_RESULTS;

    // Deduplicate base by examKey (form + examType + normalized examNumber) and ensure unique IDs
    const seenExamKeys = new Set<string>();
    const seenResultIds = new Set<string>();
    const deduplicatedResults: StudentResult[] = [];

    for (const r of base) {
      if (!r || !r.examNumber) continue;

      // Enforce strict Form 4 cohort: only authentic Form 4 candidates or CSSC Joint exam results allowed
      if (r.form === 'Form 4' && r.examType !== 'CSSC Joint Examination 2026') {
        const cleanNum = r.examNumber.toLowerCase().replace(/[\/\-_.\s]/g, '');
        const cleanName = (r.studentName || '').toLowerCase().replace(/\s+/g, ' ').trim();
        const isAuthentic = FORM_FOUR_STUDENT_PROFILES.some(
          (f) =>
            f.examNumber.toLowerCase().replace(/[\/\-_.\s]/g, '') === cleanNum ||
            f.fullName.toLowerCase().replace(/\s+/g, ' ').trim() === cleanName
        );
        if (!isAuthentic) continue;
      }

      const cleanNum = r.examNumber.toLowerCase().replace(/[\/\-_.\s]/g, '');
      const key = `${r.form}_${r.examType}_${cleanNum}`;
      if (seenExamKeys.has(key)) continue;
      seenExamKeys.add(key);

      let rId = r.id;
      if (!rId || seenResultIds.has(rId)) {
        rId = `res-${r.form.toLowerCase().replace(/\s+/g, '')}-${cleanNum}`;
        if (seenResultIds.has(rId)) {
          rId = `${rId}-${Math.random().toString(36).substring(2, 6)}`;
        }
      }
      seenResultIds.add(rId);

      const detailedStr = r.detailedSubjectsString || formatNectaDetailedSubjects(r.subjects);
      deduplicatedResults.push({
        ...r,
        id: rId,
        approvalStatus: r.approvalStatus || 'published_to_parents',
        detailedSubjectsString: detailedStr,
      });
    }

    // Ensure all default results (including Form 1, Form 3 & Form 4) exist
    for (const def of DEFAULT_UOMBONI_STUDENT_RESULTS) {
      const cleanNum = def.examNumber.toLowerCase().replace(/[\/\-_.\s]/g, '');
      const defKey = `${def.form}_${def.examType}_${cleanNum}`;
      if (!seenExamKeys.has(defKey)) {
        seenExamKeys.add(defKey);
        let defId = def.id;
        if (seenResultIds.has(defId)) {
          defId = `${def.id}-${Math.random().toString(36).substring(2, 6)}`;
        }
        seenResultIds.add(defId);
        const detailedStr = def.detailedSubjectsString || formatNectaDetailedSubjects(def.subjects);
        deduplicatedResults.push({
          ...def,
          id: defId,
          approvalStatus: def.approvalStatus || 'published_to_parents',
          detailedSubjectsString: detailedStr,
        });
      }
    }

    safeSetStorage('uomboni_results', deduplicatedResults);
    return deduplicatedResults;
  });

  const [isResultsPublishedToParents, setIsResultsPublishedToParents] = useState<boolean>(() => {
    return safeGetStorage<boolean>('uomboni_academic_published_to_parents', true);
  });

  const [subjectSubmissions, setSubjectSubmissions] = useState<Record<string, { teacherName: string; submittedAt: string; status: 'submitted' | 'pending'; count: number }>>(() => {
    return safeGetStorage<Record<string, any>>('uomboni_academic_subject_submissions', {
      'Form 4_NECTA Mock 2025_Chemistry': { teacherName: 'Mwl. Endrew Benson', submittedAt: '2025-08-01 10:00', status: 'submitted', count: 19 },
      'Form 4_NECTA Mock 2025_Civics': { teacherName: 'Madam Witness', submittedAt: '2025-08-01 11:30', status: 'submitted', count: 19 },
      'Form 4_NECTA Mock 2025_Biology': { teacherName: 'Mwl. Endrew Benson', submittedAt: '2025-08-01 09:15', status: 'submitted', count: 19 },
      'Form 4_NECTA Mock 2025_Basic Mathematics': { teacherName: 'Mwl. Yohana Bahati', submittedAt: '2025-08-01 14:20', status: 'submitted', count: 19 },
      'Form 4_NECTA Mock 2025_Kiswahili': { teacherName: 'Mwl. Wolter Temu', submittedAt: '2025-08-01 15:00', status: 'submitted', count: 19 },
      'Form 4_NECTA Mock 2025_English Language': { teacherName: 'Mwl. Peter Kimaro', submittedAt: '2025-08-01 16:10', status: 'submitted', count: 19 },
      'Form 4_NECTA Mock 2025_History': { teacherName: 'Madam Witness', submittedAt: '2025-08-01 11:45', status: 'submitted', count: 19 },
      'Form 4_NECTA Mock 2025_Geography': { teacherName: 'Madam Adela Manyanga', submittedAt: '2025-08-01 13:00', status: 'submitted', count: 19 },
      'Form 4_NECTA Mock 2025_Physics': { teacherName: 'Mwl. Yohana Bahati', submittedAt: '2025-08-01 14:40', status: 'submitted', count: 19 },
      'Form 4_NECTA Mock 2025_Religious Education': { teacherName: 'Fr. Michael Assenga', submittedAt: '2025-08-01 08:30', status: 'submitted', count: 19 },
    });
  });

  const [academicDirectives, setAcademicDirectives] = useState<AcademicDirective[]>(() => {
    const loaded = safeGetStorage<AcademicDirective[]>('uomboni_academic_directives', DEFAULT_ACADEMIC_DIRECTIVES);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : DEFAULT_ACADEMIC_DIRECTIVES;
  });

  // Sync directives from Firestore on mount
  useEffect(() => {
    getAcademicDirectivesFromFirestore()
      .then((remoteList) => {
        if (remoteList && remoteList.length > 0) {
          setAcademicDirectives(remoteList);
          safeSetStorage('uomboni_academic_directives', remoteList);
        }
      })
      .catch((err) => console.warn('Could not load academic directives from Firestore on mount:', err));
  }, []);

  // Exam Types (Aina za Mitihani) state for Academic Master
  const [examTypes, setExamTypes] = useState<ExamTypeConfig[]>(() => {
    const loaded = safeGetStorage<ExamTypeConfig[]>('uomboni_exam_types', INITIAL_EXAM_TYPES);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : INITIAL_EXAM_TYPES;
  });

  // Sync exam types from Firestore on mount
  useEffect(() => {
    getExamTypesFromFirestore()
      .then((remoteList) => {
        if (remoteList && remoteList.length > 0) {
          setExamTypes(remoteList);
          safeSetStorage('uomboni_exam_types', remoteList);
        }
      })
      .catch((err) => console.warn('Could not load exam types from Firestore on mount:', err));
  }, []);

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });

  const [offlineCachedCount, setOfflineCachedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('uomboni_offline_results_count');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [lastResultsOfflineSync, setLastResultsOfflineSync] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('uomboni_offline_results_synced_at');
      return saved ? parseInt(saved, 10) || null : null;
    } catch {
      return null;
    }
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const loaded = safeGetStorage<NewsItem[]>('uomboni_news', INITIAL_NEWS);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      return INITIAL_NEWS;
    }
    return loaded;
  });

  const [events, setEvents] = useState<SchoolEvent[]>(() => {
    const loaded = safeGetStorage<SchoolEvent[]>('uomboni_events', INITIAL_EVENTS);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      return INITIAL_EVENTS;
    }
    return loaded;
  });

  const [academicCalendar, setAcademicCalendar] = useState<AcademicCalendarEvent[]>(() => {
    return safeGetStorage<AcademicCalendarEvent[]>('uomboni_calendar', INITIAL_ACADEMIC_CALENDAR);
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const loaded = safeGetStorage<Teacher[]>('uomboni_teachers', INITIAL_TEACHERS);
    if (Array.isArray(loaded) && loaded.length > 0) {
      const updatedList = loaded.map((t) => {
        if (t.id === 'tch-001' || t.role.toLowerCase().includes('mkuu wa shule') || t.role.toLowerCase().includes('headmaster')) {
          return { ...t, name: 'Br. Adolph Massawe' };
        }
        if (t.id === 'tch-002') {
          return {
            ...t,
            name: 'Mwl. Wolter Temu',
            role: 'Makamu Mkuu wa Shule (Second Master)',
            roleSw: 'Makamu Mkuu wa Shule',
            roleEn: 'Second Master / Deputy Head',
            department: 'Utawala & Malezi',
            email: 'wolter.temu@uombonisec.ac.tz'
          };
        }
        if (t.id === 'tch-003') {
          return {
            ...t,
            name: 'Mwl. Yohana Bahati',
            role: 'Mtaaluma Mkuu (Academic Master)',
            roleSw: 'Mtaaluma Mkuu wa Shule',
            roleEn: 'Academic Master',
            phone: '+255 745 548 225',
            email: 'yohana.bahati@uombonisec.ac.tz'
          };
        }
        if (t.id === 'tch-005') {
          return {
            ...t,
            name: 'Mwl. Endrew Benson',
            role: 'Mwalimu wa Maabara na Sayansi (Lab Teacher)',
            roleSw: 'Mwalimu wa Maabara na Sayansi',
            roleEn: 'Laboratory In-Charge & Science Teacher',
            email: 'endrew.benson@uombonisec.ac.tz'
          };
        }
        if (t.id === 'tch-007') {
          return {
            ...t,
            name: 'Madam Witness',
            role: 'Mwalimu wa Masomo ya Jamii na Uraia (Social Studies & Civics)',
            roleSw: 'Mwalimu wa Masomo ya Jamii (Social Studies)',
            roleEn: 'Social Studies, Civics & History Teacher',
            subjects: ['Social Studies', 'Civics', 'History'],
            email: 'witness@uombonisec.ac.tz'
          };
        }
        if (t.id === 'tch-010') {
          return {
            ...t,
            name: 'Mwl. Sigbert Minja',
            role: 'Mhasibu wa Shule / Bursar (School Bursar)',
            roleSw: 'Mhasibu wa Shule (Bursar)',
            roleEn: 'School Bursar & Commercial Studies Teacher',
            phone: '+255 752 000 939',
            email: 'sigminja@gmail.com'
          };
        }
        return t;
      });

      // Ensure Madam Adela Manyanga (tch-011) exists
      if (!updatedList.some((t) => t.id === 'tch-011' || t.name.includes('Adela Manyanga'))) {
        const adela = INITIAL_TEACHERS.find((t) => t.id === 'tch-011');
        if (adela) updatedList.push(adela);
      }

      return updatedList;
    }
    return INITIAL_TEACHERS;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    return safeGetStorage<BankAccount[]>('uomboni_bank_accounts', INITIAL_BANK_ACCOUNTS);
  });
  const [mobilePaymentMethods] = useState<MobilePaymentMethod[]>(INITIAL_MOBILE_METHODS);

  const [studentCouncil, setStudentCouncil] = useState<StudentCouncilMember[]>(() => {
    return safeGetStorage<StudentCouncilMember[]>('uomboni_student_council', INITIAL_STUDENT_COUNCIL);
  });

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const loaded = safeGetStorage<SchoolProfile>('uomboni_school_profile', SCHOOL_PROFILE_INFO);
    if (loaded && Array.isArray(loaded.phones)) {
      const cleanPhones = loaded.phones
        .filter((p) => !p.includes('743') && !p.includes('549'))
        .filter((p) => !p.includes('745') && !p.includes('548'));
      const cleanFormatted = (loaded.phonesFormatted || [])
        .filter((p) => !p.includes('743') && !p.includes('549'))
        .filter((p) => !p.includes('745') && !p.includes('548'));

      return {
        ...loaded,
        phones: [...cleanPhones, '0745 548 225'],
        phonesFormatted: [...cleanFormatted, '+255 745 548 225'],
      };
    }
    return loaded || SCHOOL_PROFILE_INFO;
  });

  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStat[]>(() => {
    return safeGetStorage<EnrollmentStat[]>('uomboni_enrollment_stats', INITIAL_ENROLLMENT_STATS);
  });

  const [paymentRecords, setPaymentRecords] = useState<FeePaymentRecord[]>(() => {
    const loaded = safeGetStorage<FeePaymentRecord[]>('uomboni_payments', INITIAL_PAYMENT_RECORDS);
    if (Array.isArray(loaded) && loaded.some((p) => p.id === 'pay-001' || p.id === 'pay-002')) {
      safeSetStorage('uomboni_payments', []);
      return [];
    }
    return loaded;
  });

  const [joiningDocs, setJoiningDocs] = useState<JoiningDocument[]>(() => {
    return safeGetStorage<JoiningDocument[]>('uomboni_docs', INITIAL_JOINING_DOCUMENTS);
  });

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(() => {
    const parsed = safeGetStorage<GalleryPhoto[]>('uomboni_gallery', INITIAL_GALLERY);
    if (Array.isArray(parsed) && parsed.length >= 8) {
      return parsed;
    }
    return INITIAL_GALLERY;
  });

  const [parentInquiries, setParentInquiries] = useState<ParentInquiry[]>(() => {
    return safeGetStorage<ParentInquiry[]>('uomboni_inquiries', []);
  });

  const [alerts, setAlerts] = useState<UrgentAlert[]>(() => {
    const loaded = safeGetStorage<UrgentAlert[]>('uomboni_alerts', INITIAL_ALERTS);
    const source = (Array.isArray(loaded) && loaded.length > 0) ? loaded : INITIAL_ALERTS;
    return source.filter((a) => a.id !== 'alert-flyer-001' && !a.messageSw?.toLowerCase().includes('pre-form'));
  });

  const [resultsPdfDocuments, setResultsPdfDocuments] = useState<ResultsPdfDocument[]>(() => {
    return safeGetStorage<ResultsPdfDocument[]>('uomboni_results_pdfs', INITIAL_RESULTS_PDF_DOCUMENTS);
  });

  // Strict deduplication helper to ensure 100% unique students across ID, studentId, and form+exam/name
  const deduplicateStudentProfiles = (list: StudentProfile[]): StudentProfile[] => {
    if (!Array.isArray(list)) return [];
    const seenIds = new Set<string>();
    const seenStudentIds = new Set<string>();
    const seenFormExam = new Set<string>();
    const seenFormName = new Set<string>();
    const result: StudentProfile[] = [];

    const cleanExam = (val?: string) => (val || '').toLowerCase().replace(/[\/\-_.\s]/g, '');
    const cleanName = (val?: string) => (val || '').toLowerCase().replace(/\s+/g, ' ').trim();

    for (const s of list) {
      if (!s) continue;
      const sId = (s.id || '').trim();
      const sid = (s.studentId || '').trim();
      const formExam = s.examNumber ? `${s.form}_${cleanExam(s.examNumber)}` : '';
      const formName = s.fullName ? `${s.form}_${cleanName(s.fullName)}` : '';

      if (sId && seenIds.has(sId)) continue;
      if (sid && seenStudentIds.has(sid)) continue;
      if (formExam && seenFormExam.has(formExam)) continue;
      if (formName && seenFormName.has(formName)) continue;

      if (sId) seenIds.add(sId);
      if (sid) seenStudentIds.add(sid);
      if (formExam) seenFormExam.add(formExam);
      if (formName) seenFormName.add(formName);

      result.push(s);
    }

    return result;
  };

  // Students Directory & Profiles
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    const loaded = safeGetStorage<StudentProfile[]>('uomboni_students', INITIAL_STUDENTS);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      safeSetStorage('uomboni_students', INITIAL_STUDENTS);
      return deduplicateStudentProfiles(INITIAL_STUDENTS);
    }

    const cleanExam = (val?: string) => (val || '').toLowerCase().replace(/[\/\-_.\s]/g, '');
    const cleanName = (val?: string) => (val || '').toLowerCase().replace(/\s+/g, ' ').trim();

    // Map official students by canonical identification keys
    const officialById = new Map<string, StudentProfile>();
    const officialByFormExam = new Map<string, StudentProfile>();
    const officialByFormName = new Map<string, StudentProfile>();

    for (const off of INITIAL_STUDENTS) {
      officialById.set(off.id, off);
      officialByFormExam.set(`${off.form}_${cleanExam(off.examNumber)}`, off);
      officialByFormName.set(`${off.form}_${cleanName(off.fullName)}`, off);
    }

    const matchedOfficialIds = new Set<string>();
    const resolvedStudents: StudentProfile[] = [];
    const usedIds = new Set<string>();

    // Process loaded students: match with official or preserve custom, eliminating duplicates
    for (const item of loaded) {
      if (!item) continue;

      // Match against official student definitions: by form+exam first, then form+name, then id
      const officialMatch =
        officialByFormExam.get(`${item.form}_${cleanExam(item.examNumber)}`) ||
        officialByFormName.get(`${item.form}_${cleanName(item.fullName)}`) ||
        (item.id && officialById.get(item.id));

      if (officialMatch) {
        // If this official student was already resolved, this is a duplicate lingering from earlier storage. Skip it.
        if (matchedOfficialIds.has(officialMatch.id)) {
          continue;
        }

        matchedOfficialIds.add(officialMatch.id);
        usedIds.add(officialMatch.id);

        resolvedStudents.push({
          ...officialMatch,
          ...item,
          id: officialMatch.id,
          examNumber: officialMatch.examNumber,
          fullName: officialMatch.fullName,
          gender: officialMatch.gender,
          form: officialMatch.form,
          stream: officialMatch.stream || item.stream,
          parentName: item.parentName || officialMatch.parentName,
          parentGuardianName: item.parentGuardianName || officialMatch.parentGuardianName,
          parentEmail: item.parentEmail || officialMatch.parentEmail,
        });
      } else {
        // Enforce Form Four strict cohort: only the 19 registered Form 4 students are allowed
        if (item.form === 'Form 4') {
          continue;
        }
        // User-added custom student not in initial roster
        let uniqueId = item.id;
        if (!uniqueId || usedIds.has(uniqueId)) {
          uniqueId = `std-custom-${Math.random().toString(36).substring(2, 9)}`;
        }
        usedIds.add(uniqueId);
        resolvedStudents.push({
          ...item,
          id: uniqueId,
        });
      }
    }

    // Add any official students not yet in the resolved list
    for (const off of INITIAL_STUDENTS) {
      if (!matchedOfficialIds.has(off.id)) {
        matchedOfficialIds.add(off.id);
        usedIds.add(off.id);
        resolvedStudents.push(off);
      }
    }

    // Strict safety pass: guarantee 100% unique IDs and records across the entire array
    const finalStudents = deduplicateStudentProfiles(resolvedStudents);

    safeSetStorage('uomboni_students', finalStudents);
    return finalStudents;
  });

  // Student Auth
  const [currentLoggedInStudent, setCurrentLoggedInStudent] = useState<StudentProfile | null>(() => {
    const loaded = safeGetStorage<StudentProfile | null>('uomboni_active_student', null, true);
    if (loaded && (loaded.id === 'std-001' || loaded.studentId === 'USS-2022-0042')) {
      safeSetStorage('uomboni_active_student', null, true);
      return null;
    }
    return loaded;
  });

  // School Assets & Inventory
  const [schoolAssets, setSchoolAssets] = useState<SchoolAsset[]>(() => {
    return safeGetStorage<SchoolAsset[]>('uomboni_assets', INITIAL_SCHOOL_ASSETS);
  });

  // Timetable
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    return safeGetStorage<TimetableSlot[]>('uomboni_timetable', INITIAL_TIMETABLE);
  });

  // Student Notices
  const [studentNotices, setStudentNotices] = useState<StudentNotice[]>(() => {
    return safeGetStorage<StudentNotice[]>('uomboni_student_notices', INITIAL_STUDENT_NOTICES);
  });

  // Online Applications & Admissions
  const [applications, setApplications] = useState<OnlineApplication[]>(() => {
    const loaded = safeGetStorage<OnlineApplication[]>('uomboni_applications', INITIAL_APPLICATIONS);
    if (Array.isArray(loaded) && loaded.some((a) => a.id === 'app-001' || a.applicationNumber === 'APP-2026-1048')) {
      safeSetStorage('uomboni_applications', []);
      return [];
    }
    return loaded;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('uomboni_admin_logged') === 'true';
    } catch {
      return false;
    }
  });

  const [isBursarLoggedIn, setIsBursarLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('uomboni_bursar_logged') === 'true';
    } catch {
      return false;
    }
  });

  const [adminGoogleUser, setAdminGoogleUser] = useState<{ email: string | null; displayName: string | null; photoURL: string | null } | null>(() => {
    try {
      const saved = localStorage.getItem('uomboni_admin_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [bursarGoogleUser, setBursarGoogleUser] = useState<{ email: string | null; displayName: string | null; photoURL: string | null } | null>(() => {
    try {
      const saved = localStorage.getItem('uomboni_bursar_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customLogoUrl, setCustomLogoUrlState] = useState<string | null>(() => {
    return safeGetStorage<string | null>('uomboni_custom_logo', null);
  });

  const setCustomLogoUrl = (url: string | null) => {
    setCustomLogoUrlState(url);
    safeSetStorage('uomboni_custom_logo', url);
    pushEntityToServer('customLogoUrl', url);
  };

  const resetLogoToDefault = () => {
    setCustomLogoUrlState(null);
    safeSetStorage('uomboni_custom_logo', null);
    pushEntityToServer('customLogoUrl', null);
  };

  const [isServerSyncing, setIsServerSyncing] = useState<boolean>(false);
  const [lastServerSyncTime, setLastServerSyncTime] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('uomboni_server_last_sync');
      return saved ? parseInt(saved, 10) || null : null;
    } catch {
      return null;
    }
  });

  const lastServerSyncRef = React.useRef<number>(lastServerSyncTime || 0);
  const isReceivingFromServerRef = React.useRef<boolean>(false);
  const initialLoadedRef = React.useRef<boolean>(false);
  const syncDebounceTimers = React.useRef<Record<string, any>>({});
  const localEditTimestamps = React.useRef<Record<string, number>>({});

  // BroadcastChannel for instant multi-tab sync in same browser
  const syncChannelRef = React.useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('uomboni_school_sync');
        syncChannelRef.current = channel;
        channel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_DATA') {
            fetchSchoolDataFromServer(true);
          }
        };
        return () => {
          channel.close();
        };
      } catch {}
    }
  }, []);

  // Helper to push modified entities to backend persistent store (visible on all other browsers/devices)
  const pushEntityToServer = (key: string, data: any) => {
    // Record local edit timestamp to protect against stale overwrite during background polls
    localEditTimestamps.current[key] = Date.now();

    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    if (syncDebounceTimers.current[key]) {
      clearTimeout(syncDebounceTimers.current[key]);
    }

    syncDebounceTimers.current[key] = setTimeout(async () => {
      try {
        setIsServerSyncing(true);
        const res = await fetch('/api/school-data/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, data }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.lastUpdated) {
            lastServerSyncRef.current = json.lastUpdated;
            setLastServerSyncTime(json.lastUpdated);
            try {
              localStorage.setItem('uomboni_server_last_sync', String(json.lastUpdated));
            } catch {}
          }
          // Broadcast to other open tabs AFTER the server confirmed the write
          try {
            syncChannelRef.current?.postMessage({ type: 'SYNC_DATA', key, timestamp: Date.now() });
          } catch {}
        } else {
          console.warn(`[Sync Warning] Failed to update ${key} on server (HTTP ${res.status}). Retrying...`);
          // Retry once after 700ms
          setTimeout(async () => {
            try {
              const retryRes = await fetch('/api/school-data/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, data }),
              });
              if (retryRes.ok) {
                const json = await retryRes.json();
                if (json.lastUpdated) {
                  lastServerSyncRef.current = json.lastUpdated;
                  setLastServerSyncTime(json.lastUpdated);
                }
                try {
                  syncChannelRef.current?.postMessage({ type: 'SYNC_DATA', key, timestamp: Date.now() });
                } catch {}
              }
            } catch (retryErr) {
              console.error(`[Sync Error] Retry for ${key} failed:`, retryErr);
            }
          }, 700);
        }
      } catch (err) {
        console.warn(`Sync ${key} to server error:`, err);
      } finally {
        setIsServerSyncing(false);
      }
    }, 60);
  };

  // Fetch full live school database from server
  const fetchSchoolDataFromServer = async (silent = false) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    try {
      if (!silent) setIsServerSyncing(true);
      // Cache-busting timestamp ensures browsers and proxies always get latest data from Express
      const res = await fetch(`/api/school-data?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload && payload.success && payload.data) {
          const d = payload.data;
          isReceivingFromServerRef.current = true;

          lastServerSyncRef.current = payload.lastUpdated || Date.now();
          setLastServerSyncTime(lastServerSyncRef.current);
          try {
            localStorage.setItem('uomboni_server_last_sync', String(lastServerSyncRef.current));
          } catch {}

          const isRecentEdit = (k: string) => {
            const ts = localEditTimestamps.current[k] || 0;
            return Date.now() - ts < 4500;
          };

          React.startTransition(() => {
            if (Array.isArray(d.studentResults) && !isRecentEdit('studentResults')) {
              setStudentResults(d.studentResults);
              safeSetStorage('uomboni_results', d.studentResults);
              cacheStudentResultsOffline(d.studentResults);
            }
            if (Array.isArray(d.news) && !isRecentEdit('news')) {
              setNews(d.news);
              safeSetStorage('uomboni_news', d.news);
            }
            if (Array.isArray(d.alerts) && !isRecentEdit('alerts')) {
              setAlerts(d.alerts);
              safeSetStorage('uomboni_alerts', d.alerts);
            }
            if (Array.isArray(d.events) && !isRecentEdit('events')) {
              setEvents(d.events);
              safeSetStorage('uomboni_events', d.events);
            }
            if (Array.isArray(d.academicCalendar) && !isRecentEdit('academicCalendar')) {
              setAcademicCalendar(d.academicCalendar);
              safeSetStorage('uomboni_calendar', d.academicCalendar);
            }
            if (Array.isArray(d.teachers) && !isRecentEdit('teachers')) {
              setTeachers(d.teachers);
              safeSetStorage('uomboni_teachers', d.teachers);
            }
            if (Array.isArray(d.joiningDocs) && !isRecentEdit('joiningDocs')) {
              setJoiningDocs(d.joiningDocs);
              safeSetStorage('uomboni_docs', d.joiningDocs);
            }
            if (Array.isArray(d.galleryPhotos) && !isRecentEdit('galleryPhotos')) {
              setGalleryPhotos(d.galleryPhotos);
              safeSetStorage('uomboni_gallery', d.galleryPhotos);
            }
            if (Array.isArray(d.students) && !isRecentEdit('students')) {
              const cleanStudents = deduplicateStudentProfiles(d.students);
              setStudents(cleanStudents);
              safeSetStorage('uomboni_students', cleanStudents);
            }
            if (Array.isArray(d.paymentRecords) && !isRecentEdit('paymentRecords')) {
              setPaymentRecords(d.paymentRecords);
              safeSetStorage('uomboni_payments', d.paymentRecords);
            }
            if (Array.isArray(d.applications) && !isRecentEdit('applications')) {
              setApplications(d.applications);
              safeSetStorage('uomboni_applications', d.applications);
            }
            if (Array.isArray(d.parentInquiries) && !isRecentEdit('parentInquiries')) {
              setParentInquiries(d.parentInquiries);
              safeSetStorage('uomboni_inquiries', d.parentInquiries);
            }
            if (Array.isArray(d.resultsPdfDocuments) && !isRecentEdit('resultsPdfDocuments')) {
              setResultsPdfDocuments(d.resultsPdfDocuments);
              safeSetStorage('uomboni_results_pdfs', d.resultsPdfDocuments);
            }
            if (Array.isArray(d.schoolAssets) && !isRecentEdit('schoolAssets')) {
              setSchoolAssets(d.schoolAssets);
              safeSetStorage('uomboni_assets', d.schoolAssets);
            }
            if (Array.isArray(d.timetable) && !isRecentEdit('timetable')) {
              setTimetable(d.timetable);
              safeSetStorage('uomboni_timetable', d.timetable);
            }
            if (Array.isArray(d.studentNotices) && !isRecentEdit('studentNotices')) {
              setStudentNotices(d.studentNotices);
              safeSetStorage('uomboni_student_notices', d.studentNotices);
            }
            if (Array.isArray(d.bankAccounts) && !isRecentEdit('bankAccounts')) {
              setBankAccounts(d.bankAccounts);
              safeSetStorage('uomboni_bank_accounts', d.bankAccounts);
            }
            if (Array.isArray(d.studentCouncil) && !isRecentEdit('studentCouncil')) {
              setStudentCouncil(d.studentCouncil);
              safeSetStorage('uomboni_student_council', d.studentCouncil);
            }
            if (d.schoolProfile && typeof d.schoolProfile === 'object' && !isRecentEdit('schoolProfile')) {
              setSchoolProfile(d.schoolProfile);
              safeSetStorage('uomboni_school_profile', d.schoolProfile);
            }
            if (Array.isArray(d.enrollmentStats) && !isRecentEdit('enrollmentStats')) {
              setEnrollmentStats(d.enrollmentStats);
              safeSetStorage('uomboni_enrollment_stats', d.enrollmentStats);
            }
            if (d.customLogoUrl !== undefined && !isRecentEdit('customLogoUrl')) {
              setCustomLogoUrlState(d.customLogoUrl);
              if (d.customLogoUrl) {
                safeSetStorage('uomboni_custom_logo', d.customLogoUrl);
              } else {
                try {
                  localStorage.removeItem('uomboni_custom_logo');
                } catch {}
              }
            }
          });

          setTimeout(() => {
            isReceivingFromServerRef.current = false;
            initialLoadedRef.current = true;
          }, 150);
        }
      }
    } catch (e) {
      if (!silent) console.warn('Fetch school data from server warning:', e);
      initialLoadedRef.current = true;
    } finally {
      if (!silent) setIsServerSyncing(false);
    }
  };

  const syncAllWithServer = async (): Promise<boolean> => {
    try {
      setIsServerSyncing(true);
      const updates = {
        studentResults,
        news,
        alerts,
        events,
        academicCalendar,
        teachers,
        students,
        paymentRecords,
        joiningDocs,
        galleryPhotos,
        applications,
        parentInquiries,
        resultsPdfDocuments,
        schoolAssets,
        timetable,
        studentNotices,
        customLogoUrl,
        bankAccounts,
        studentCouncil,
        schoolProfile,
        enrollmentStats,
      };
      const res = await fetch('/api/school-data/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.lastUpdated) {
          lastServerSyncRef.current = json.lastUpdated;
          setLastServerSyncTime(json.lastUpdated);
          try {
            localStorage.setItem('uomboni_server_last_sync', String(json.lastUpdated));
          } catch {}
        }
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsServerSyncing(false);
    }
  };

  const forceRefreshFromServer = async (): Promise<void> => {
    await fetchSchoolDataFromServer(false);
  };

  // Sync studentResults to localStorage and Service Worker Cache
  useEffect(() => {
    safeSetStorage('uomboni_results', studentResults);

    // Cache to Service Worker and Cache Storage API
    if (studentResults.length > 0) {
      cacheStudentResultsOffline(studentResults).then((res) => {
        if (res && res.success) {
          setOfflineCachedCount(res.count);
          setLastResultsOfflineSync(res.timestamp);
        }
      });
    }
  }, [studentResults]);

  // Initial load and live background polling/tab focus listener
  useEffect(() => {
    const unsubscribe = setupOfflineResultsListener((status) => {
      setIsOffline(status.isOffline);
      if (status.cachedCount > 0) {
        setOfflineCachedCount(status.cachedCount);
      }
      if (status.lastSyncedAt) {
        setLastResultsOfflineSync(status.lastSyncedAt);
      }
    });

    // 1. Initial live sync on mount directly from backend
    fetchSchoolDataFromServer(false);

    // 2. Poll server version every 3 seconds to detect updates made from any browser/device immediately
    const checkServerVersion = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      try {
        const res = await fetch(`/api/school-data/version?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        if (res.ok) {
          const ver = await res.json();
          if (ver.lastUpdated && ver.lastUpdated !== lastServerSyncRef.current) {
            fetchSchoolDataFromServer(true);
          }
        }
      } catch {}
    };

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      checkServerVersion();
    }, 8000);

    // 3. Check immediately when user switches tabs, focuses window, or regains network
    const handleFocus = () => {
      checkServerVersion();
    };

    const handleOnline = () => {
      fetchSchoolDataFromServer(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    safeSetStorage('uomboni_results_pdfs', resultsPdfDocuments);
  }, [resultsPdfDocuments]);

  useEffect(() => {
    safeSetStorage('uomboni_students', students);
  }, [students]);

  useEffect(() => {
    safeSetStorage('uomboni_applications', applications);
  }, [applications]);

  useEffect(() => {
    safeSetStorage('uomboni_assets', schoolAssets);
  }, [schoolAssets]);

  useEffect(() => {
    safeSetStorage('uomboni_timetable', timetable);
  }, [timetable]);

  useEffect(() => {
    safeSetStorage('uomboni_student_notices', studentNotices);
  }, [studentNotices]);

  useEffect(() => {
    safeSetStorage('uomboni_news', news);
  }, [news]);

  useEffect(() => {
    safeSetStorage('uomboni_events', events);
  }, [events]);

  useEffect(() => {
    safeSetStorage('uomboni_calendar', academicCalendar);
  }, [academicCalendar]);

  useEffect(() => {
    safeSetStorage('uomboni_teachers', teachers);
  }, [teachers]);

  useEffect(() => {
    safeSetStorage('uomboni_payments', paymentRecords);
  }, [paymentRecords]);

  useEffect(() => {
    safeSetStorage('uomboni_docs', joiningDocs);
  }, [joiningDocs]);

  useEffect(() => {
    safeSetStorage('uomboni_gallery', galleryPhotos);
  }, [galleryPhotos]);

  useEffect(() => {
    safeSetStorage('uomboni_inquiries', parentInquiries);
  }, [parentInquiries]);

  useEffect(() => {
    safeSetStorage('uomboni_alerts', alerts);
  }, [alerts]);

  useEffect(() => {
    safeSetStorage('uomboni_bank_accounts', bankAccounts);
  }, [bankAccounts]);

  useEffect(() => {
    safeSetStorage('uomboni_student_council', studentCouncil);
  }, [studentCouncil]);

  useEffect(() => {
    safeSetStorage('uomboni_school_profile', schoolProfile);
  }, [schoolProfile]);

  useEffect(() => {
    safeSetStorage('uomboni_enrollment_stats', enrollmentStats);
  }, [enrollmentStats]);

  // Methods
  const searchResult = (query: string, formFilter?: string, examFilter?: string) => {
    const q = query.trim().toLowerCase();
    const cleanQ = q.replace(/[\/\-_.\s]/g, '');
    return studentResults.filter((item) => {
      const cleanExam = item.examNumber.toLowerCase().replace(/[\/\-_.\s]/g, '');
      const cleanName = item.studentName.toLowerCase();
      // Also match if query matches candidate's PREM / Std 7 exam number in student roster
      const matchRosterPrem =
        cleanQ.length >= 3 &&
        students.some((st) => {
          const stPrem = (st.premNumber || '').toLowerCase().replace(/[\/\-_.\s]/g, '');
          const stCleanExam = (st.examNumber || '').toLowerCase().replace(/[\/\-_.\s]/g, '');
          const stCleanName = st.fullName.toLowerCase();
          const isSameStudent =
            cleanExam === stCleanExam ||
            cleanName === stCleanName ||
            cleanName.includes(stCleanName) ||
            stCleanName.includes(cleanName);
          return isSameStudent && (stPrem.includes(cleanQ) || cleanQ.includes(stPrem));
        });

      const matchQuery =
        !q ||
        item.examNumber.toLowerCase().includes(q) ||
        cleanExam.includes(cleanQ) ||
        cleanName.includes(q) ||
        matchRosterPrem;
      const matchForm = !formFilter || formFilter === 'ALL' || item.form === formFilter;
      const matchExam = !examFilter || examFilter === 'ALL' || item.examType === examFilter;
      return matchQuery && matchForm && matchExam;
    });
  };

  const addStudentResult = (result: StudentResult) => {
    setStudentResults((prev) => {
      const updated = [result, ...prev];
      pushEntityToServer('studentResults', updated);
      return updated;
    });
  };

  const bulkAddStudentResults = (results: StudentResult[]) => {
    // Avoid duplicate exam numbers
    setStudentResults((prev) => {
      const existingExamNos = new Set(prev.map((p) => p.examNumber));
      const newItems = results.filter((r) => !existingExamNos.has(r.examNumber));
      const updatedExisting = prev.map((p) => {
        const replacement = results.find((r) => r.examNumber === p.examNumber);
        return replacement || p;
      });
      const updated = [...newItems, ...updatedExisting];
      pushEntityToServer('studentResults', updated);
      return updated;
    });
  };

  const bulkReplaceStudentResults = (results: StudentResult[]) => {
    setStudentResults(results);
    pushEntityToServer('studentResults', results);
  };

  const updateStudentResult = (result: StudentResult) => {
    setStudentResults((prev) => {
      const updated = prev.map((r) => (r.id === result.id ? result : r));
      pushEntityToServer('studentResults', updated);
      return updated;
    });
  };

  const deleteStudentResult = (id: string) => {
    setStudentResults((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      pushEntityToServer('studentResults', updated);
      return updated;
    });
  };

  const publishResultsToParents = (published: boolean, author = 'Mkuu wa Taaluma') => {
    setIsResultsPublishedToParents(published);
    safeSetStorage('uomboni_academic_published_to_parents', published);

    setStudentResults((prev) => {
      const updated = prev.map((st) => ({
        ...st,
        approvalStatus: published ? ('published_to_parents' as const) : ('submitted_to_academic' as const),
      }));
      safeSetStorage('uomboni_results', updated);
      pushEntityToServer('studentResults', updated);
      return updated;
    });
  };

  const recomputeNectaDivisions = (formFilter?: string, examFilter?: string) => {
    setStudentResults((prev) => {
      const updated = prev.map((st) => {
        const matchesForm = !formFilter || formFilter === 'ALL' || st.form === formFilter;
        const matchesExam = !examFilter || examFilter === 'ALL' || st.examType === examFilter;
        if (!matchesForm || !matchesExam) return st;

        const calc = calculateNectaDivision(st.subjects);
        const detailedStr = formatNectaDetailedSubjects(st.subjects);

        return {
          ...st,
          division: calc.divisionFull,
          points: calc.points,
          averageMarks: calc.averageMarks,
          detailedSubjectsString: detailedStr,
        };
      });

      // Recalculate class ranks for each form & exam group
      const groups: Record<string, typeof updated> = {};
      updated.forEach((st) => {
        const key = `${st.form}_${st.examType}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(st);
      });

      const finalRanked: StudentResult[] = [];
      Object.values(groups).forEach((groupList) => {
        groupList.sort((a, b) => {
          if (a.points !== b.points) return a.points - b.points;
          return b.averageMarks - a.averageMarks;
        });
        groupList.forEach((item, idx) => {
          item.classPosition = idx + 1;
          item.totalStudentsInClass = groupList.length;
          finalRanked.push(item);
        });
      });

      safeSetStorage('uomboni_results', finalRanked);
      pushEntityToServer('studentResults', finalRanked);
      return finalRanked;
    });
  };

  const submitTeacherSubjectMarks = (
    subject: string,
    form: string,
    examType: string,
    teacherName: string,
    marksDraft: { [examNumber: string]: { score: number; remarks: string } }
  ): { updatedCount: number; unauthorized?: boolean; error?: string } => {
    // SECURITY RESTRICTION: Ensure teacher cannot enter marks for an unassigned subject
    const isAcademicMasterTeacher =
      !teacherName ||
      teacherName.toLowerCase().includes('mtaaluma') ||
      teacherName.toLowerCase().includes('yohana bahati') ||
      teacherName.toLowerCase().includes('adela') ||
      teacherName.toLowerCase().includes('admin') ||
      teacherName.toLowerCase().includes('headmaster') ||
      teacherName.toLowerCase().includes('taaluma');

    if (!isAcademicMasterTeacher && teacherName) {
      const authorized = isTeacherAuthorizedForSubject(teacherName, subject);
      if (!authorized) {
        console.warn(`[SECURITY PREVENTED] Mwalimu "${teacherName}" hana idhini ya kuingiza alama za somo la "${subject}".`);
        return {
          updatedCount: 0,
          unauthorized: true,
          error: `Huna idhini ya kuingiza au kubadilisha matokeo ya somo la ${subject}. Ni mwalimu aliyepangiwa somo hili au Mkuu wa Taaluma pekee anayeweza kujaza alama hizi.`,
        };
      }
    }

    let count = 0;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

    setStudentResults((prev) => {
      const updated = prev.map((st) => {
        const entry = marksDraft[st.examNumber];
        if (!entry && st.form !== form) return st;

        const score = entry ? entry.score : null;
        if (score === null || isNaN(score)) return st;

        count++;
        const gradeInfo = scoreToNectaGrade(score);

        const existingSubjectIdx = st.subjects.findIndex(
          (sub) => sub.name.toLowerCase() === subject.toLowerCase() || sub.code === subject
        );

        const newSubjects = [...st.subjects];
        const newSubjectObj = {
          code: existingSubjectIdx >= 0 ? st.subjects[existingSubjectIdx].code : 'SUBJ',
          name: subject,
          nameEn: subject,
          score,
          grade: gradeInfo.grade,
          points: gradeInfo.points,
          remarks: entry.remarks || gradeInfo.remarks,
        };

        if (existingSubjectIdx >= 0) {
          newSubjects[existingSubjectIdx] = newSubjectObj;
        } else {
          newSubjects.push(newSubjectObj);
        }

        const calc = calculateNectaDivision(newSubjects);
        const detailedStr = formatNectaDetailedSubjects(newSubjects);

        return {
          ...st,
          subjects: newSubjects,
          division: calc.divisionFull,
          points: calc.points,
          averageMarks: calc.averageMarks,
          detailedSubjectsString: detailedStr,
          approvalStatus: 'submitted_to_academic' as const,
        };
      });

      // Also add any registered students from marksDraft who were not in prev yet
      const existingExamNumbers = new Set(updated.map((s) => s.examNumber.toLowerCase()));
      Object.keys(marksDraft).forEach((examNo) => {
        if (!existingExamNumbers.has(examNo.toLowerCase())) {
          const entry = marksDraft[examNo];
          if (entry && entry.score !== null && !isNaN(entry.score)) {
            const registered = students.find((st) => st.examNumber.toLowerCase() === examNo.toLowerCase() || st.studentId.toLowerCase() === examNo.toLowerCase());
            const score = entry.score;
            const gradeInfo = scoreToNectaGrade(score);
            const newSubjectObj = {
              code: 'SUBJ',
              name: subject,
              nameEn: subject,
              score,
              grade: gradeInfo.grade,
              points: gradeInfo.points,
              remarks: entry.remarks || gradeInfo.remarks,
            };
            const calc = calculateNectaDivision([newSubjectObj]);
            const detailedStr = formatNectaDetailedSubjects([newSubjectObj]);
            count++;
            updated.push({
              id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              studentId: registered?.studentId || examNo,
              examNumber: examNo,
              studentName: registered?.fullName || examNo,
              gender: (registered?.gender as 'M' | 'F') || 'F',
              form: (form as any) || registered?.form || 'Form 4',
              stream: (registered?.stream as any) || 'Science',
              examType: examType as any,
              year: 2026,
              subjects: [newSubjectObj],
              totalMarks: newSubjectObj.score,
              division: calc.divisionFull,
              points: calc.points,
              averageMarks: calc.averageMarks,
              classPosition: updated.length + 1,
              totalStudentsInClass: updated.length + 1,
              conduct: 'Bora Sana (Excellent)',
              headmasterRemarks: 'Matokeo yameidhinishwa kitaaluma.',
              publishDate: '2026-03-15',
              detailedSubjectsString: detailedStr,
              approvalStatus: 'submitted_to_academic' as const,
            });
            existingExamNumbers.add(examNo.toLowerCase());
          }
        }
      });

      safeSetStorage('uomboni_results', updated);
      pushEntityToServer('studentResults', updated);
      return updated;
    });

    const key = `${form}_${examType}_${subject}`;
    const newSubmissionRecord = {
      teacherName,
      submittedAt: now,
      status: 'submitted' as const,
      count,
    };
    setSubjectSubmissions((prev) => {
      const updated = { ...prev, [key]: newSubmissionRecord };
      safeSetStorage('uomboni_academic_subject_submissions', updated);
      return updated;
    });

    return { updatedCount: count };
  };

  const sendAcademicDirective = (directiveData: Omit<AcademicDirective, 'id' | 'timestamp'>): AcademicDirective => {
    const newDirective: AcademicDirective = {
      ...directiveData,
      id: `dir-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
    };
    setAcademicDirectives((prev) => {
      const next = [newDirective, ...prev];
      safeSetStorage('uomboni_academic_directives', next);
      saveAcademicDirectiveToFirestore(newDirective);
      return next;
    });
    return newDirective;
  };

  const updateAcademicDirective = (id: string, updates: Partial<AcademicDirective>) => {
    setAcademicDirectives((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...updates, timestamp: Date.now() } : d));
      safeSetStorage('uomboni_academic_directives', next);
      const updated = next.find((d) => d.id === id);
      if (updated) saveAcademicDirectiveToFirestore(updated);
      return next;
    });
  };

  const deleteAcademicDirective = (id: string) => {
    setAcademicDirectives((prev) => {
      const next = prev.filter((d) => d.id !== id);
      safeSetStorage('uomboni_academic_directives', next);
      return next;
    });
  };

  const toggleMarkEntryAuthorization = (
    form: string,
    examType: string,
    isOpen: boolean,
    directiveMessage?: string,
    deadlineDate?: string,
    authorName: string = 'Mwl. Yohana Bahati'
  ) => {
    const existing = academicDirectives.find(
      (d) => (d.targetForm === form || (form === 'ALL' && d.targetForm === 'ALL')) && (d.examType === examType || d.examType === 'ALL')
    );

    const updatedDirective: AcademicDirective = {
      id: existing ? existing.id : `dir-${form.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`,
      title: isOpen
        ? `Ufunguzi wa Dirisha la Kuingiza Matokeo (${form} - ${examType})`
        : `Kufungwa kwa Dirisha la Kuingiza Matokeo (${form} - ${examType})`,
      message:
        directiveMessage ||
        (isOpen
          ? `Mkuu wa Taaluma amefungua rasmi dirisha la kuingiza alama kwa ajili ya ${form} (${examType}). Walimu wote mnakumbushwa kukamilisha uingizaji kabla ya tarehe ya mwisho.`
          : `Dirisha la kuingiza alama za ${form} (${examType}) limefungwa na Mkuu wa Taaluma. Hakuna mabadiliko zaidi yanayoruhusiwa bila kibali rasmi cha Mkuu wa Taaluma.`),
      senderName: authorName,
      senderRole: 'Mkuu wa Taaluma (Academic Master)',
      targetForm: form,
      examType: examType,
      deadlineDate: deadlineDate || (existing?.deadlineDate || '2026-03-30'),
      isOpenForEntry: isOpen,
      allowLateSubmissions: false,
      priority: isOpen ? 'high' : 'urgent',
      dateIssued: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      status: isOpen ? 'active' : 'closed',
    };

    setAcademicDirectives((prev) => {
      const filtered = prev.filter((d) => d.id !== updatedDirective.id);
      const next = [updatedDirective, ...filtered];
      safeSetStorage('uomboni_academic_directives', next);
      saveAcademicDirectiveToFirestore(updatedDirective);
      return next;
    });
  };

  const checkMarkEntryPermission = (
    form: string,
    examType: string
  ): { isAllowed: boolean; directive?: AcademicDirective; reason: string; deadlineDate?: string } => {
    // Specific match first, then fallback to form match, then 'ALL'
    const matching =
      academicDirectives.find((d) => d.targetForm === form && d.examType === examType) ||
      academicDirectives.find((d) => d.targetForm === form && d.examType === 'ALL') ||
      academicDirectives.find((d) => d.targetForm === 'ALL' && d.examType === examType) ||
      academicDirectives.find((d) => d.targetForm === 'ALL' && d.examType === 'ALL');

    if (!matching) {
      return {
        isAllowed: true,
        reason: 'Ruhusa ya uingizaji matokeo iko wazi.',
        deadlineDate: '2026-03-30',
      };
    }

    if (!matching.isOpenForEntry) {
      return {
        isAllowed: false,
        directive: matching,
        reason: `Dirisha la kuingiza alama za ${form} limefungwa na Mkuu wa Taaluma (${matching.senderName}).`,
        deadlineDate: matching.deadlineDate,
      };
    }

    const nowStr = new Date().toISOString().split('T')[0];
    if (matching.deadlineDate && matching.deadlineDate < nowStr && !matching.allowLateSubmissions) {
      return {
        isAllowed: false,
        directive: matching,
        reason: `Muda wa kuingiza alama umekwisha tangu tarehe ${matching.deadlineDate}. Tafadhali wasiliana na Mkuu wa Taaluma kuongezewa muda.`,
        deadlineDate: matching.deadlineDate,
      };
    }

    return {
      isAllowed: true,
      directive: matching,
      reason: 'Ruhusa ya uingizaji matokeo iko wazi kulingana na maelekezo ya Mkuu wa Taaluma.',
      deadlineDate: matching.deadlineDate,
    };
  };

  // Exam Types Management (Aina za Mitihani - Mtaaluma / Academic Master)
  const addExamType = (data: Omit<ExamTypeConfig, 'id'>): ExamTypeConfig => {
    const newExam: ExamTypeConfig = {
      ...data,
      id: `exam-${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      dateCreated: data.dateCreated || new Date().toISOString().split('T')[0],
      status: data.status || 'active',
      isCurrentForEntry: typeof data.isCurrentForEntry === 'boolean' ? data.isCurrentForEntry : true,
    };

    setExamTypes((prev) => {
      const next = [newExam, ...prev.filter((e) => e.name.toLowerCase() !== newExam.name.toLowerCase())];
      safeSetStorage('uomboni_exam_types', next);
      saveExamTypeToFirestore(newExam);
      return next;
    });

    return newExam;
  };

  const updateExamType = (id: string, updates: Partial<ExamTypeConfig>) => {
    setExamTypes((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      safeSetStorage('uomboni_exam_types', next);
      const updated = next.find((e) => e.id === id);
      if (updated) saveExamTypeToFirestore(updated);
      return next;
    });
  };

  const deleteExamType = (id: string) => {
    setExamTypes((prev) => {
      const next = prev.filter((e) => e.id !== id);
      safeSetStorage('uomboni_exam_types', next);
      deleteExamTypeFromFirestore(id);
      return next;
    });
  };

  const toggleExamTypeEntryStatus = (id: string, isOpen: boolean) => {
    setExamTypes((prev) => {
      const next = prev.map((e) =>
        e.id === id
          ? {
              ...e,
              isCurrentForEntry: isOpen,
              status: isOpen ? ('active' as const) : ('closed' as const),
            }
          : e
      );
      safeSetStorage('uomboni_exam_types', next);
      const updated = next.find((e) => e.id === id);
      if (updated) saveExamTypeToFirestore(updated);
      return next;
    });
  };

  const syncResultsToOfflineStorage = async (): Promise<{ success: boolean; count: number }> => {
    const res = await cacheStudentResultsOffline(studentResults);
    if (res.success) {
      setOfflineCachedCount(res.count);
      setLastResultsOfflineSync(res.timestamp);
    }
    return res;
  };

  const loadInitialResults = () => {
    setStudentResults(DEFAULT_UOMBONI_STUDENT_RESULTS);
    safeSetStorage('uomboni_results', DEFAULT_UOMBONI_STUDENT_RESULTS);
    pushEntityToServer('studentResults', DEFAULT_UOMBONI_STUDENT_RESULTS);
    cacheStudentResultsOffline(DEFAULT_UOMBONI_STUDENT_RESULTS).then((res) => {
      if (res.success) {
        setOfflineCachedCount(res.count);
        setLastResultsOfflineSync(res.timestamp);
      }
    });
  };

  const addResultsPdfDoc = (doc: ResultsPdfDocument) => {
    setResultsPdfDocuments((prev) => {
      const updated = [doc, ...prev];
      safeSetStorage('uomboni_results_pdfs', updated);
      pushEntityToServer('resultsPdfDocuments', updated);
      return updated;
    });
  };

  const updateResultsPdfDoc = (doc: ResultsPdfDocument) => {
    setResultsPdfDocuments((prev) => {
      const updated = prev.map((d) => (d.id === doc.id ? doc : d));
      safeSetStorage('uomboni_results_pdfs', updated);
      pushEntityToServer('resultsPdfDocuments', updated);
      return updated;
    });
  };

  const deleteResultsPdfDoc = (id: string) => {
    setResultsPdfDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      safeSetStorage('uomboni_results_pdfs', updated);
      pushEntityToServer('resultsPdfDocuments', updated);
      return updated;
    });
  };


  // Student Management
  const addStudent = (student: StudentProfile) => {
    setStudents((prev) => {
      const updated = deduplicateStudentProfiles([student, ...prev]);
      safeSetStorage('uomboni_students', updated);
      pushEntityToServer('students', updated);
      return updated;
    });
  };

  const updateStudent = (student: StudentProfile) => {
    setStudents((prev) => {
      const updated = deduplicateStudentProfiles(prev.map((s) => (s.id === student.id ? student : s)));
      safeSetStorage('uomboni_students', updated);
      pushEntityToServer('students', updated);
      return updated;
    });
    if (currentLoggedInStudent && currentLoggedInStudent.id === student.id) {
      setCurrentLoggedInStudent(student);
      sessionStorage.setItem('uomboni_active_student', JSON.stringify(student));
    }
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      safeSetStorage('uomboni_students', updated);
      pushEntityToServer('students', updated);
      return updated;
    });
    if (currentLoggedInStudent && currentLoggedInStudent.id === id) {
      setCurrentLoggedInStudent(null);
      sessionStorage.removeItem('uomboni_active_student');
    }
  };

  // Student / Parent Auth
  const loginStudent = (identifier: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const cleanInputExam = cleanId.replace(/[\/\-_.\s]/g, '');
    const found = students.find((s) => {
      const parentDigits = (s.parentPhone || '').replace(/\D/g, '');
      const phoneMatch = cleanDigits.length >= 6 && parentDigits.includes(cleanDigits);
      const studentIdMatch = s.studentId.toLowerCase() === cleanId;
      const cleanExam = s.examNumber.toLowerCase().replace(/[\/\-_.\s]/g, '');
      const examNumberMatch =
        s.examNumber.toLowerCase() === cleanId ||
        cleanExam === cleanInputExam ||
        (cleanInputExam.length >= 4 && (cleanExam.endsWith(cleanInputExam) || cleanExam.includes(cleanInputExam)));
      const cleanPrem = (s.premNumber || '').toLowerCase().replace(/[\/\-_.\s]/g, '');
      const premMatch =
        cleanPrem &&
        (cleanPrem === cleanInputExam ||
          (cleanInputExam.length >= 4 && (cleanPrem.includes(cleanInputExam) || cleanInputExam.includes(cleanPrem))));
      const fullNameMatch = s.fullName.toLowerCase().includes(cleanId);
      const parentNameMatch = (s.parentName || s.parentGuardianName || '').toLowerCase().includes(cleanId);
      return studentIdMatch || examNumberMatch || premMatch || fullNameMatch || parentNameMatch || phoneMatch;
    });
    if (found) {
      setCurrentLoggedInStudent(found);
      sessionStorage.setItem('uomboni_active_student', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logoutStudent = () => {
    setCurrentLoggedInStudent(null);
    sessionStorage.removeItem('uomboni_active_student');
  };

  // School Assets Management
  const addSchoolAsset = (asset: SchoolAsset) => {
    setSchoolAssets((prev) => {
      const updated = [asset, ...prev];
      safeSetStorage('uomboni_assets', updated);
      pushEntityToServer('schoolAssets', updated);
      return updated;
    });
  };

  const updateSchoolAsset = (asset: SchoolAsset) => {
    setSchoolAssets((prev) => {
      const updated = prev.map((a) => (a.id === asset.id ? asset : a));
      safeSetStorage('uomboni_assets', updated);
      pushEntityToServer('schoolAssets', updated);
      return updated;
    });
  };

  const deleteSchoolAsset = (id: string) => {
    setSchoolAssets((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      safeSetStorage('uomboni_assets', updated);
      pushEntityToServer('schoolAssets', updated);
      return updated;
    });
  };

  const assignAssetToStudent = (assetId: string, studentId: string, studentName: string, returnDate?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setSchoolAssets((prev) => {
      const updated = prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status: 'Kwenye Matumizi (Assigned)',
              assignedToType: 'Student' as const,
              assignedToId: studentId,
              assignedToName: studentName,
              assignedDate: today,
              expectedReturnDate: returnDate || a.expectedReturnDate || '2025-11-30',
            }
          : a
      );
      safeSetStorage('uomboni_assets', updated);
      pushEntityToServer('schoolAssets', updated);
      return updated;
    });
  };

  const returnSchoolAsset = (assetId: string) => {
    setSchoolAssets((prev) => {
      const updated = prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status: 'Inapatikana (Available)',
              assignedToType: 'General' as const,
              assignedToId: undefined,
              assignedToName: undefined,
              assignedDate: undefined,
              expectedReturnDate: undefined,
            }
          : a
      );
      safeSetStorage('uomboni_assets', updated);
      pushEntityToServer('schoolAssets', updated);
      return updated;
    });
  };

  // Timetable
  const addTimetableSlot = (slot: TimetableSlot) => {
    setTimetable((prev) => {
      const updated = [...prev, slot];
      safeSetStorage('uomboni_timetable', updated);
      pushEntityToServer('timetable', updated);
      return updated;
    });
  };

  const updateTimetableSlot = (slot: TimetableSlot) => {
    setTimetable((prev) => {
      const updated = prev.map((t) => (t.id === slot.id ? slot : t));
      safeSetStorage('uomboni_timetable', updated);
      pushEntityToServer('timetable', updated);
      return updated;
    });
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetable((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      safeSetStorage('uomboni_timetable', updated);
      pushEntityToServer('timetable', updated);
      return updated;
    });
  };

  // Student Notices
  const addStudentNotice = (notice: StudentNotice) => {
    setStudentNotices((prev) => {
      const updated = [notice, ...prev];
      safeSetStorage('uomboni_student_notices', updated);
      pushEntityToServer('studentNotices', updated);
      return updated;
    });
  };

  const deleteStudentNotice = (id: string) => {
    setStudentNotices((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      safeSetStorage('uomboni_student_notices', updated);
      pushEntityToServer('studentNotices', updated);
      return updated;
    });
  };

  const addNews = (item: NewsItem) => {
    setNews((prev) => {
      const updated = [item, ...prev];
      safeSetStorage('uomboni_news', updated);
      pushEntityToServer('news', updated);
      return updated;
    });
  };

  const updateNews = (item: NewsItem) => {
    setNews((prev) => {
      const updated = prev.map((n) => (n.id === item.id ? item : n));
      safeSetStorage('uomboni_news', updated);
      pushEntityToServer('news', updated);
      return updated;
    });
  };

  const deleteNews = (id: string) => {
    setNews((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      safeSetStorage('uomboni_news', updated);
      pushEntityToServer('news', updated);
      return updated;
    });
  };

  const clearAllNews = () => {
    setNews([]);
    safeSetStorage('uomboni_news', []);
    pushEntityToServer('news', []);
  };

  const resetNewsToDefaults = () => {
    setNews(INITIAL_NEWS);
    safeSetStorage('uomboni_news', INITIAL_NEWS);
    pushEntityToServer('news', INITIAL_NEWS);
  };

  const addEvent = (item: SchoolEvent) => {
    setEvents((prev) => {
      const updated = [item, ...prev];
      safeSetStorage('uomboni_events', updated);
      pushEntityToServer('events', updated);
      return updated;
    });
  };

  const updateEvent = (item: SchoolEvent) => {
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === item.id ? item : e));
      safeSetStorage('uomboni_events', updated);
      pushEntityToServer('events', updated);
      return updated;
    });
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      safeSetStorage('uomboni_events', updated);
      pushEntityToServer('events', updated);
      return updated;
    });
  };

  const resetEventsToDefaults = () => {
    setEvents(INITIAL_EVENTS);
    safeSetStorage('uomboni_events', INITIAL_EVENTS);
    pushEntityToServer('events', INITIAL_EVENTS);
  };

  const addBankAccount = (account: BankAccount) => {
    setBankAccounts((prev) => {
      const updated = [account, ...prev];
      safeSetStorage('uomboni_bank_accounts', updated);
      pushEntityToServer('bankAccounts', updated);
      return updated;
    });
  };

  const updateBankAccount = (account: BankAccount) => {
    setBankAccounts((prev) => {
      const updated = prev.map((a) => (a.id === account.id ? account : a));
      safeSetStorage('uomboni_bank_accounts', updated);
      pushEntityToServer('bankAccounts', updated);
      return updated;
    });
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      safeSetStorage('uomboni_bank_accounts', updated);
      pushEntityToServer('bankAccounts', updated);
      return updated;
    });
  };

  const addStudentCouncilMember = (member: StudentCouncilMember) => {
    setStudentCouncil((prev) => {
      const updated = [...prev, member];
      safeSetStorage('uomboni_student_council', updated);
      pushEntityToServer('studentCouncil', updated);
      return updated;
    });
  };

  const updateStudentCouncilMember = (member: StudentCouncilMember) => {
    setStudentCouncil((prev) => {
      const updated = prev.map((m) => (m.id === member.id ? member : m));
      safeSetStorage('uomboni_student_council', updated);
      pushEntityToServer('studentCouncil', updated);
      return updated;
    });
  };

  const deleteStudentCouncilMember = (id: string) => {
    setStudentCouncil((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      safeSetStorage('uomboni_student_council', updated);
      pushEntityToServer('studentCouncil', updated);
      return updated;
    });
  };

  const resetStudentCouncilToDefaults = () => {
    setStudentCouncil(INITIAL_STUDENT_COUNCIL);
    safeSetStorage('uomboni_student_council', INITIAL_STUDENT_COUNCIL);
    pushEntityToServer('studentCouncil', INITIAL_STUDENT_COUNCIL);
  };

  const updateSchoolProfile = (updates: Partial<SchoolProfile>) => {
    setSchoolProfile((prev) => {
      const updated = { ...prev, ...updates };
      safeSetStorage('uomboni_school_profile', updated);
      pushEntityToServer('schoolProfile', updated);
      return updated;
    });
  };

  const updateEnrollmentStats = (stats: EnrollmentStat[]) => {
    setEnrollmentStats(stats);
    safeSetStorage('uomboni_enrollment_stats', stats);
    pushEntityToServer('enrollmentStats', stats);
  };

  const addAcademicCalendarEvent = (item: AcademicCalendarEvent) => {
    setAcademicCalendar((prev) => {
      const updated = [item, ...prev];
      safeSetStorage('uomboni_calendar', updated);
      pushEntityToServer('academicCalendar', updated);
      return updated;
    });
  };

  const updateAcademicCalendarEvent = (item: AcademicCalendarEvent) => {
    setAcademicCalendar((prev) => {
      const updated = prev.map((e) => (e.id === item.id ? item : e));
      safeSetStorage('uomboni_calendar', updated);
      pushEntityToServer('academicCalendar', updated);
      return updated;
    });
  };

  const deleteAcademicCalendarEvent = (id: string) => {
    setAcademicCalendar((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      safeSetStorage('uomboni_calendar', updated);
      pushEntityToServer('academicCalendar', updated);
      return updated;
    });
  };

  const resetAcademicCalendarToDefaults = () => {
    setAcademicCalendar(INITIAL_ACADEMIC_CALENDAR);
    pushEntityToServer('academicCalendar', INITIAL_ACADEMIC_CALENDAR);
    safeSetStorage('uomboni_calendar', INITIAL_ACADEMIC_CALENDAR);
  };

  const addTeacher = (item: Teacher) => {
    setTeachers((prev) => {
      const updated = [item, ...prev];
      safeSetStorage('uomboni_teachers', updated);
      pushEntityToServer('teachers', updated);
      return updated;
    });
  };

  const updateTeacher = (item: Teacher) => {
    setTeachers((prev) => {
      const updated = prev.map((t) => (t.id === item.id ? item : t));
      safeSetStorage('uomboni_teachers', updated);
      pushEntityToServer('teachers', updated);
      return updated;
    });
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      safeSetStorage('uomboni_teachers', updated);
      pushEntityToServer('teachers', updated);
      return updated;
    });
  };

  const submitPaymentRecord = (record: Omit<FeePaymentRecord, 'id' | 'status' | 'receiptNumber'>) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newRecord: FeePaymentRecord = {
      ...record,
      id: `pay-${Date.now()}`,
      status: 'Inakaguliwa',
      receiptNumber: `REC-UOMB-${new Date().getFullYear()}-${randomSuffix}`,
    };
    setPaymentRecords((prev) => {
      const updated = [newRecord, ...prev];
      safeSetStorage('uomboni_payments', updated);
      pushEntityToServer('paymentRecords', updated);
      return updated;
    });
    return newRecord;
  };

  const updatePaymentStatus = (id: string, status: 'Imethibitishwa' | 'Inakaguliwa' | 'Imekataliwa') => {
    setPaymentRecords((prev) => {
      const targetRecord = prev.find((p) => p.id === id);
      if (targetRecord && status === 'Imethibitishwa' && targetRecord.status !== 'Imethibitishwa') {
        // Automatically reconcile with student feePaid balance
        const cleanExam = (targetRecord.examNumber || '').toLowerCase().trim();
        const cleanName = (targetRecord.studentName || '').toLowerCase().trim();
        setStudents((studPrev) => {
          const updatedStudents = studPrev.map((s) => {
            const isMatch =
              (cleanExam && s.examNumber.toLowerCase().includes(cleanExam)) ||
              (cleanExam && s.studentId.toLowerCase().includes(cleanExam)) ||
              (cleanName && s.fullName.toLowerCase().includes(cleanName));
            if (isMatch) {
              const newPaid = (s.feePaid || 0) + (targetRecord.amount || 0);
              return { ...s, feePaid: newPaid };
            }
            return s;
          });
          safeSetStorage('uomboni_students', updatedStudents);
          pushEntityToServer('students', updatedStudents);
          return updatedStudents;
        });
      }
      const updated = prev.map((p) => (p.id === id ? { ...p, status } : p));
      safeSetStorage('uomboni_payments', updated);
      pushEntityToServer('paymentRecords', updated);
      return updated;
    });
  };

  // Bursar Specific Methods
  const updateStudentFee = (studentId: string, feeTotal: number, feePaid: number) => {
    setStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.id === studentId || s.studentId === studentId) {
          const u = {
            ...s,
            feeTotal: Math.max(0, feeTotal),
            feePaid: Math.max(0, feePaid),
          };
          if (currentLoggedInStudent && currentLoggedInStudent.id === s.id) {
            setCurrentLoggedInStudent(u);
            sessionStorage.setItem('uomboni_active_student', JSON.stringify(u));
          }
          return u;
        }
        return s;
      });
      safeSetStorage('uomboni_students', updated);
      pushEntityToServer('students', updated);
      return updated;
    });
  };

  const clearStudentDebt = (studentId: string) => {
    setStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.id === studentId || s.studentId === studentId) {
          const targetTotal = s.feeTotal || 1200000;
          const u = { ...s, feeTotal: targetTotal, feePaid: targetTotal };
          if (currentLoggedInStudent && currentLoggedInStudent.id === s.id) {
            setCurrentLoggedInStudent(u);
            sessionStorage.setItem('uomboni_active_student', JSON.stringify(u));
          }
          return u;
        }
        return s;
      });
      safeSetStorage('uomboni_students', updated);
      pushEntityToServer('students', updated);
      return updated;
    });
  };

  const recordBursarPayment = (data: {
    studentId: string;
    amount: number;
    paymentMethod: string;
    transactionReference: string;
    paymentDate?: string;
    parentPhone?: string;
    notes?: string;
  }) => {
    const student = students.find((s) => s.id === data.studentId || s.studentId === data.studentId);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const today = data.paymentDate || new Date().toISOString().split('T')[0];
    const receiptNum = `REC-BURSAR-${new Date().getFullYear()}-${randomSuffix}`;

    const newRecord: FeePaymentRecord = {
      id: `pay-bursar-${Date.now()}`,
      studentName: student ? student.fullName : 'Mwanafunzi',
      examNumber: student ? student.examNumber : 'S0486/BURSAR',
      form: student ? student.form : 'Form 1',
      amount: Number(data.amount) || 0,
      paymentMethod: data.paymentMethod || 'Fedha Taslimu (Cash / Bursar Desk)',
      transactionReference: data.transactionReference || `CASH-REC-${randomSuffix}`,
      paymentDate: today,
      parentPhone: data.parentPhone || (student ? student.parentPhone || '+255 782 558 127' : '+255 782 558 127'),
      status: 'Imethibitishwa',
      receiptNumber: receiptNum,
    };

    setPaymentRecords((prev) => {
      const updated = [newRecord, ...prev];
      safeSetStorage('uomboni_payments', updated);
      pushEntityToServer('paymentRecords', updated);
      return updated;
    });

    // Update student's feePaid automatically
    if (student) {
      const currentPaid = student.feePaid || 0;
      const updatedPaid = currentPaid + (Number(data.amount) || 0);
      updateStudentFee(student.id, student.feeTotal || 1200000, updatedPaid);
    }

    return newRecord;
  };

  const batchUpdateFeesByClass = (form: string, studentType: 'Bweni' | 'Kutwa' | 'Wote', feeTotal: number): number => {
    let updatedCount = 0;
    setStudents((prev) => {
      const updated = prev.map((s) => {
        const matchForm = form === 'Wote (All Forms)' || form === 'ALL' || s.form === form;
        const sType = s.studentType || s.boardingStatus || 'Bweni';
        const matchType =
          studentType === 'Wote' ||
          (studentType === 'Bweni' && sType.includes('Bweni')) ||
          (studentType === 'Kutwa' && sType.includes('Kutwa'));

        if (matchForm && matchType) {
          updatedCount++;
          return {
            ...s,
            feeTotal: Number(feeTotal),
          };
        }
        return s;
      });
      safeSetStorage('uomboni_students', updated);
      pushEntityToServer('students', updated);
      return updated;
    });
    return updatedCount;
  };

  const incrementDocDownload = (id: string) => {
    setJoiningDocs((prev) => {
      const updated = prev.map((doc) => (doc.id === id ? { ...doc, downloadCount: doc.downloadCount + 1 } : doc));
      safeSetStorage('uomboni_docs', updated);
      pushEntityToServer('joiningDocs', updated);
      return updated;
    });
  };

  const addJoiningDoc = (doc: JoiningDocument) => {
    setJoiningDocs((prev) => {
      const updated = [doc, ...prev];
      safeSetStorage('uomboni_docs', updated);
      pushEntityToServer('joiningDocs', updated);
      return updated;
    });
  };

  const updateJoiningDoc = (doc: JoiningDocument) => {
    setJoiningDocs((prev) => {
      const updated = prev.map((d) => (d.id === doc.id ? doc : d));
      safeSetStorage('uomboni_docs', updated);
      pushEntityToServer('joiningDocs', updated);
      return updated;
    });
  };

  const deleteJoiningDoc = (id: string) => {
    setJoiningDocs((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      safeSetStorage('uomboni_docs', updated);
      pushEntityToServer('joiningDocs', updated);
      return updated;
    });
  };

  const addGalleryPhoto = (photo: GalleryPhoto) => {
    setGalleryPhotos((prev) => {
      const updated = [photo, ...prev];
      safeSetStorage('uomboni_gallery', updated);
      pushEntityToServer('galleryPhotos', updated);
      return updated;
    });
  };

  const updateGalleryPhoto = (photo: GalleryPhoto) => {
    setGalleryPhotos((prev) => {
      const updated = prev.map((p) => (p.id === photo.id ? photo : p));
      safeSetStorage('uomboni_gallery', updated);
      pushEntityToServer('galleryPhotos', updated);
      return updated;
    });
  };

  const bulkReplaceGalleryPhotos = (photos: GalleryPhoto[]) => {
    setGalleryPhotos(photos);
    safeSetStorage('uomboni_gallery', photos);
    pushEntityToServer('galleryPhotos', photos);
  };

  const resetGalleryToDefaults = () => {
    setGalleryPhotos(INITIAL_GALLERY);
    safeSetStorage('uomboni_gallery', INITIAL_GALLERY);
    pushEntityToServer('galleryPhotos', INITIAL_GALLERY);
  };

  const deleteGalleryPhoto = (id: string) => {
    setGalleryPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      safeSetStorage('uomboni_gallery', updated);
      pushEntityToServer('galleryPhotos', updated);
      return updated;
    });
  };

  const submitInquiry = (inquiry: Omit<ParentInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: ParentInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Mpya',
    };
    setParentInquiries((prev) => {
      const updated = [newInquiry, ...prev];
      safeSetStorage('uomboni_inquiries', updated);
      pushEntityToServer('parentInquiries', updated);
      return updated;
    });
    return newInquiry;
  };

  const updateInquiryStatus = (id: string, status: 'Inashughulikiwa' | 'Imejibiwa' | 'Mpya', notes?: string) => {
    setParentInquiries((prev) => {
      const updated = prev.map((inq) => (inq.id === id ? { ...inq, status, adminNotes: notes || inq.adminNotes } : inq));
      safeSetStorage('uomboni_inquiries', updated);
      pushEntityToServer('parentInquiries', updated);
      return updated;
    });
  };

  // Online Applications Handlers
  const submitOnlineApplication = (app: Omit<OnlineApplication, 'id' | 'applicationNumber' | 'submissionDate' | 'status'>): OnlineApplication => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newApp: OnlineApplication = {
      ...app,
      id: `app-${Date.now()}`,
      applicationNumber: `APP-2026-${randomSuffix}`,
      status: 'Inasubiri Uhakiki',
      submissionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminNotes: app.adminNotes || 'Maombi yamewasilishwa mtandaoni kupitia tovuti ya shule.',
    };
    setApplications((prev) => {
      const updated = [newApp, ...prev];
      safeSetStorage('uomboni_applications', updated);
      pushEntityToServer('applications', updated);
      return updated;
    });
    return newApp;
  };

  const updateApplicationStatus = (
    id: string,
    status: OnlineApplication['status'],
    adminNotes?: string,
    verifiedBy?: string
  ) => {
    setApplications((prev) => {
      const updated = prev.map((app) => {
        if (app.id !== id) return app;
        return {
          ...app,
          status,
          adminNotes: adminNotes !== undefined ? adminNotes : app.adminNotes,
          verifiedBy: verifiedBy || (status === 'Imethibitishwa' ? 'Ofisi ya Udahili / Mkuu wa Shule' : app.verifiedBy),
          verifiedDate: status === 'Imethibitishwa' ? new Date().toISOString().substring(0, 10) : app.verifiedDate,
        };
      });
      safeSetStorage('uomboni_applications', updated);
      pushEntityToServer('applications', updated);
      return updated;
    });
  };

  const deleteOnlineApplication = (id: string) => {
    setApplications((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      safeSetStorage('uomboni_applications', updated);
      pushEntityToServer('applications', updated);
      return updated;
    });
  };

  const convertApplicationToStudent = (appId: string, targetForm?: string, targetStream?: string): StudentProfile => {
    const app = applications.find((a) => a.id === appId);
    if (!app) {
      throw new Error('Application not found');
    }

    const currentYear = new Date().getFullYear();
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const generatedStudentId = `USS-${currentYear}-${randomSeq}`;
    const generatedExamNo = `S0486/${randomSeq}/${currentYear + 3}`;

    const formClean = (targetForm || (app.applyingFor.includes('Form 2') ? 'Form 2' : app.applyingFor.includes('Form 3') ? 'Form 3' : 'Form 1')) as 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4';
    const streamClean = (targetStream || 'A') as 'A' | 'B' | 'Science' | 'Arts' | 'Commercial';

    const newStudentProfile: StudentProfile = {
      id: `std-${Date.now()}`,
      studentId: generatedStudentId,
      examNumber: generatedExamNo,
      premNumber: app.premNumber,
      previousSchool: app.previousSchool,
      fullName: app.studentName.toUpperCase(),
      gender: app.gender,
      dob: app.dob || '2012-01-01',
      form: formClean,
      stream: streamClean,
      admissionYear: currentYear,
      enrollmentDate: new Date().toISOString().substring(0, 10),
      studentType: app.entryType.includes('Bweni') ? 'Bweni (Boarding)' : 'Kutwa (Day Scholar)',
      boardingStatus: app.entryType.includes('Bweni') ? 'Bweni' : 'Kutwa',
      dormitoryRoom: app.entryType.includes('Bweni') ? (app.gender === 'M' ? 'Bweni la Mt. Thomas (Room 1)' : 'Bweni la Bikira Maria (Room 1)') : undefined,
      parentName: app.parentName,
      parentGuardianName: app.parentName,
      parentPhone: app.parentPhone,
      parentEmail: app.parentEmail,
      address: app.parentAddress || 'Marangu, Kilimanjaro',
      residence: app.parentAddress || 'Marangu, Kilimanjaro',
      religion: 'Mkatoliki / Mkristo',
      attendanceRate: 100,
      conductRating: 'Bora Sana',
      feeTotal: app.entryType.includes('Bweni') ? 1450000 : 750000,
      feePaid: 0,
    };

    setStudents((prev) => {
      const updated = [newStudentProfile, ...prev];
      safeSetStorage('uomboni_students', updated);
      pushEntityToServer('students', updated);
      return updated;
    });

    setApplications((prev) => {
      const updated = prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'Imethibitishwa' as const,
              enrolledStudentId: generatedStudentId,
              adminNotes: `${a.adminNotes ? a.adminNotes + ' • ' : ''}Amethibitishwa na kusajiliwa kama mwanafunzi namba ${generatedStudentId} (${formClean} ${streamClean}).`,
              verifiedBy: 'Mkuu wa Shule / Ofisi ya Udahili',
              verifiedDate: new Date().toISOString().substring(0, 10),
            }
          : a
      );
      safeSetStorage('uomboni_applications', updated);
      pushEntityToServer('applications', updated);
      return updated;
    });

    return newStudentProfile;
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, active: false } : a));
      safeSetStorage('uomboni_alerts', updated);
      pushEntityToServer('alerts', updated);
      return updated;
    });
  };

  const addAlert = (alert: UrgentAlert) => {
    setAlerts((prev) => {
      const updated = [alert, ...prev];
      safeSetStorage('uomboni_alerts', updated);
      pushEntityToServer('alerts', updated);
      return updated;
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
      safeSetStorage('uomboni_alerts', updated);
      pushEntityToServer('alerts', updated);
      return updated;
    });
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      safeSetStorage('uomboni_alerts', updated);
      pushEntityToServer('alerts', updated);
      return updated;
    });
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    safeSetStorage('uomboni_alerts', []);
    pushEntityToServer('alerts', []);
  };

  const resetAlertsToDefaults = () => {
    setAlerts(INITIAL_ALERTS);
    safeSetStorage('uomboni_alerts', INITIAL_ALERTS);
    pushEntityToServer('alerts', INITIAL_ALERTS);
  };

  const loginAdmin = (password: string): boolean => {
    const p = (password || '').trim().toLowerCase();
    const validPasswords = ['uomboni2025', 'admin', 's0486', 'uomboni', '1234', 'admin2025', 'admin2026', 'uomboniadmin'];
    if (validPasswords.includes(p) || p === 'uomboni2025' || p === 'admin') {
      const profile = {
        email: 'adolphmassawe@gmail.com',
        displayName: 'Br. Adolph Massawe (Mkuu wa Shule)',
        photoURL: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      };
      setAdminGoogleUser(profile);
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem('uomboni_admin_google_user', JSON.stringify(profile));
        sessionStorage.setItem('uomboni_admin_logged', 'true');
      } catch (e) {
        console.warn("Storage error:", e);
      }
      return true;
    }
    return false;
  };

  const loginAdminWithGoogle = (profile: { email: string | null; displayName: string | null; photoURL: string | null }) => {
    setAdminGoogleUser(profile);
    setIsAdminLoggedIn(true);
    try {
      localStorage.setItem('uomboni_admin_google_user', JSON.stringify(profile));
      sessionStorage.setItem('uomboni_admin_logged', 'true');
    } catch (e) {
      console.warn("Storage error:", e);
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminGoogleUser(null);
    try {
      sessionStorage.removeItem('uomboni_admin_logged');
      localStorage.removeItem('uomboni_admin_google_user');
    } catch {}
    logOutFromFirebase();
  };

  const loginBursar = (pin: string): boolean => {
    const p = (pin || '').trim().toLowerCase();
    const validPins = ['uomboni2025', 'bursar', '1234', 'ada2025', 'ada2026', 's0486', 'mhasibu'];
    if (validPins.includes(p) || p === '1234' || p === 'uomboni2025' || p === 'bursar') {
      const profile = {
        email: 'bursar@uombonisecondary.ac.tz',
        displayName: 'Mhasibu wa Shule (Bursar)',
        photoURL: null,
      };
      setBursarGoogleUser(profile);
      setIsBursarLoggedIn(true);
      try {
        localStorage.setItem('uomboni_bursar_google_user', JSON.stringify(profile));
        sessionStorage.setItem('uomboni_bursar_logged', 'true');
      } catch (e) {
        console.warn("Storage error:", e);
      }
      return true;
    }
    return false;
  };

  const loginBursarWithGoogle = (profile: { email: string | null; displayName: string | null; photoURL: string | null }) => {
    setBursarGoogleUser(profile);
    setIsBursarLoggedIn(true);
    try {
      localStorage.setItem('uomboni_bursar_google_user', JSON.stringify(profile));
      sessionStorage.setItem('uomboni_bursar_logged', 'true');
    } catch (e) {
      console.warn("Storage error:", e);
    }
  };

  const logoutBursar = () => {
    setIsBursarLoggedIn(false);
    setBursarGoogleUser(null);
    try {
      sessionStorage.removeItem('uomboni_bursar_logged');
      localStorage.removeItem('uomboni_bursar_google_user');
    } catch {}
    logOutFromFirebase();
  };

  const seedSampleData = () => {
    setStudentResults(DEFAULT_UOMBONI_STUDENT_RESULTS);
    setResultsPdfDocuments(INITIAL_RESULTS_PDF_DOCUMENTS);
    setStudents(INITIAL_STUDENTS);
    setCurrentLoggedInStudent(null);
    setSchoolAssets(INITIAL_SCHOOL_ASSETS);
    setTimetable(INITIAL_TIMETABLE);
    setStudentNotices(INITIAL_STUDENT_NOTICES);
    setNews(INITIAL_NEWS);
    setEvents(INITIAL_EVENTS);
    setAcademicCalendar(INITIAL_ACADEMIC_CALENDAR);
    setTeachers(INITIAL_TEACHERS);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setStudentCouncil(INITIAL_STUDENT_COUNCIL);
    setSchoolProfile(SCHOOL_PROFILE_INFO);
    setEnrollmentStats(INITIAL_ENROLLMENT_STATS);
    setPaymentRecords(SAMPLE_MOCK_PAYMENT_RECORDS);
    setJoiningDocs(INITIAL_JOINING_DOCUMENTS);
    setGalleryPhotos(INITIAL_GALLERY);
    setAlerts(INITIAL_ALERTS);
    setApplications(SAMPLE_MOCK_APPLICATIONS);

    safeSetStorage('uomboni_results', DEFAULT_UOMBONI_STUDENT_RESULTS);
    safeSetStorage('uomboni_results_pdfs', INITIAL_RESULTS_PDF_DOCUMENTS);
    safeSetStorage('uomboni_students', INITIAL_STUDENTS);
    safeSetStorage('uomboni_applications', SAMPLE_MOCK_APPLICATIONS);
    safeSetStorage('uomboni_assets', INITIAL_SCHOOL_ASSETS);
    safeSetStorage('uomboni_timetable', INITIAL_TIMETABLE);
    safeSetStorage('uomboni_student_notices', INITIAL_STUDENT_NOTICES);
    safeSetStorage('uomboni_news', INITIAL_NEWS);
    safeSetStorage('uomboni_events', INITIAL_EVENTS);
    safeSetStorage('uomboni_calendar', INITIAL_ACADEMIC_CALENDAR);
    safeSetStorage('uomboni_teachers', INITIAL_TEACHERS);
    safeSetStorage('uomboni_bank_accounts', INITIAL_BANK_ACCOUNTS);
    safeSetStorage('uomboni_student_council', INITIAL_STUDENT_COUNCIL);
    safeSetStorage('uomboni_school_profile', SCHOOL_PROFILE_INFO);
    safeSetStorage('uomboni_enrollment_stats', INITIAL_ENROLLMENT_STATS);
    safeSetStorage('uomboni_payments', SAMPLE_MOCK_PAYMENT_RECORDS);
    safeSetStorage('uomboni_docs', INITIAL_JOINING_DOCUMENTS);
    safeSetStorage('uomboni_gallery', INITIAL_GALLERY);
    safeSetStorage('uomboni_alerts', INITIAL_ALERTS);

    cacheStudentResultsOffline(DEFAULT_UOMBONI_STUDENT_RESULTS).then((res) => {
      if (res.success) {
        setOfflineCachedCount(res.count);
        setLastResultsOfflineSync(res.timestamp);
      }
    });

    pushEntityToServer('studentResults', DEFAULT_UOMBONI_STUDENT_RESULTS);
    pushEntityToServer('resultsPdfDocuments', INITIAL_RESULTS_PDF_DOCUMENTS);
    pushEntityToServer('students', INITIAL_STUDENTS);
    pushEntityToServer('applications', SAMPLE_MOCK_APPLICATIONS);
    pushEntityToServer('schoolAssets', INITIAL_SCHOOL_ASSETS);
    pushEntityToServer('timetable', INITIAL_TIMETABLE);
    pushEntityToServer('studentNotices', INITIAL_STUDENT_NOTICES);
    pushEntityToServer('news', INITIAL_NEWS);
    pushEntityToServer('events', INITIAL_EVENTS);
    pushEntityToServer('academicCalendar', INITIAL_ACADEMIC_CALENDAR);
    pushEntityToServer('teachers', INITIAL_TEACHERS);
    pushEntityToServer('bankAccounts', INITIAL_BANK_ACCOUNTS);
    pushEntityToServer('studentCouncil', INITIAL_STUDENT_COUNCIL);
    pushEntityToServer('schoolProfile', SCHOOL_PROFILE_INFO);
    pushEntityToServer('enrollmentStats', INITIAL_ENROLLMENT_STATS);
    pushEntityToServer('paymentRecords', SAMPLE_MOCK_PAYMENT_RECORDS);
    pushEntityToServer('joiningDocs', INITIAL_JOINING_DOCUMENTS);
    pushEntityToServer('galleryPhotos', INITIAL_GALLERY);
    pushEntityToServer('alerts', INITIAL_ALERTS);
  };

  const clearSampleData = () => {
    setStudentResults([]);
    setResultsPdfDocuments([]);
    setStudents([]);
    setCurrentLoggedInStudent(null);
    setSchoolAssets([]);
    setTimetable([]);
    setStudentNotices([]);
    setNews([]);
    setEvents([]);
    setAcademicCalendar([]);
    setTeachers([]);
    setPaymentRecords([]);
    setApplications([]);
    setGalleryPhotos([]);

    pushEntityToServer('studentResults', []);
    pushEntityToServer('resultsPdfDocuments', []);
    pushEntityToServer('students', []);
    pushEntityToServer('applications', []);
    pushEntityToServer('schoolAssets', []);
    pushEntityToServer('timetable', []);
    pushEntityToServer('studentNotices', []);
    pushEntityToServer('news', []);
    pushEntityToServer('events', []);
    pushEntityToServer('academicCalendar', []);
    pushEntityToServer('teachers', []);
    pushEntityToServer('paymentRecords', []);
    pushEntityToServer('galleryPhotos', []);

    localStorage.removeItem('uomboni_results');
    localStorage.removeItem('uomboni_results_pdfs');
    localStorage.removeItem('uomboni_students');
    localStorage.removeItem('uomboni_applications');
    localStorage.removeItem('uomboni_assets');
    localStorage.removeItem('uomboni_timetable');
    localStorage.removeItem('uomboni_student_notices');
    localStorage.removeItem('uomboni_news');
    localStorage.removeItem('uomboni_events');
    localStorage.removeItem('uomboni_calendar');
    localStorage.removeItem('uomboni_teachers');
    localStorage.removeItem('uomboni_payments');
    localStorage.removeItem('uomboni_docs');
    localStorage.removeItem('uomboni_gallery');
    localStorage.removeItem('uomboni_inquiries');
    localStorage.removeItem('uomboni_alerts');
    localStorage.removeItem('uomboni_bank_accounts');
    localStorage.removeItem('uomboni_student_council');
    localStorage.removeItem('uomboni_school_profile');
    localStorage.removeItem('uomboni_enrollment_stats');
    sessionStorage.removeItem('uomboni_active_student');
  };

  const resetAllDataToDefaults = () => {
    seedSampleData();
  };

  return (
    <DataContext.Provider
      value={{
        isOffline,
        offlineCachedCount,
        lastResultsOfflineSync,
        syncResultsToOfflineStorage,
        loadInitialResults,
        applications,
        submitOnlineApplication,
        updateApplicationStatus,
        deleteOnlineApplication,
        convertApplicationToStudent,
        studentResults,
        isResultsPublishedToParents,
        publishResultsToParents,
        recomputeNectaDivisions,
        submitTeacherSubjectMarks,
        subjectSubmissions,
        searchResult,
        addStudentResult,
        bulkAddStudentResults,
        bulkReplaceStudentResults,
        updateStudentResult,
        deleteStudentResult,
        resultsPdfDocuments,
        addResultsPdfDoc,
        updateResultsPdfDoc,
        deleteResultsPdfDoc,
        academicDirectives,
        sendAcademicDirective,
        updateAcademicDirective,
        deleteAcademicDirective,
        toggleMarkEntryAuthorization,
        checkMarkEntryPermission,
        examTypes,
        addExamType,
        updateExamType,
        deleteExamType,
        toggleExamTypeEntryStatus,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        currentLoggedInStudent,
        loginStudent,
        logoutStudent,
        schoolAssets,
        addSchoolAsset,
        updateSchoolAsset,
        deleteSchoolAsset,
        assignAssetToStudent,
        returnSchoolAsset,
        timetable,
        addTimetableSlot,
        updateTimetableSlot,
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
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        resetEventsToDefaults,
        academicCalendar,
        addAcademicCalendarEvent,
        updateAcademicCalendarEvent,
        deleteAcademicCalendarEvent,
        resetAcademicCalendarToDefaults,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        studentCouncil,
        addStudentCouncilMember,
        updateStudentCouncilMember,
        deleteStudentCouncilMember,
        resetStudentCouncilToDefaults,
        schoolProfile,
        updateSchoolProfile,
        bankAccounts,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        mobilePaymentMethods,
        paymentRecords,
        submitPaymentRecord,
        updatePaymentStatus,
        adminGoogleUser,
        bursarGoogleUser,
        loginAdminWithGoogle,
        loginBursarWithGoogle,
        isBursarLoggedIn,
        loginBursar,
        logoutBursar,
        updateStudentFee,
        recordBursarPayment,
        clearStudentDebt,
        batchUpdateFeesByClass,
        joiningDocs,
        incrementDocDownload,
        addJoiningDoc,
        updateJoiningDoc,
        deleteJoiningDoc,
        galleryPhotos,
        addGalleryPhoto,
        updateGalleryPhoto,
        bulkReplaceGalleryPhotos,
        resetGalleryToDefaults,
        deleteGalleryPhoto,
        parentInquiries,
        submitInquiry,
        updateInquiryStatus,
        customLogoUrl,
        setCustomLogoUrl,
        resetLogoToDefault,
        alerts,
        dismissAlert,
        addAlert,
        toggleAlert,
        deleteAlert,
        clearAllAlerts,
        resetAlertsToDefaults,
        enrollmentStats,
        updateEnrollmentStats,
        nectaTrends: INITIAL_NECTA_TRENDS,
        subjectStats: INITIAL_SUBJECT_STATS,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        resetAllDataToDefaults,
        seedSampleData,
        clearSampleData,
        isServerSyncing,
        lastServerSyncTime,
        syncAllWithServer,
        forceRefreshFromServer,
      }}
    >
      {children}
    </DataContext.Provider>
  );

};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
