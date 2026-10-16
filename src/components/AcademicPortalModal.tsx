import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { WorldClassLoginView, PortalLoginRole } from './WorldClassLoginView';
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Printer,
  Sparkles,
  Phone,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  Lock,
  LogOut,
  X,
  Plus,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Check,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Sliders,
  Filter,
  Upload,
  Send,
  Share2,
  Table,
  CheckCheck,
  FileDown,
  Mail,
  KeyRound,
  BellRing,
  Megaphone,
} from 'lucide-react';
import { signInWithGoogle, getUserProfile } from '../lib/firebase';
import { checkStaffAuthorization, logStaffAuthAttempt } from '../services/staffSecurityService';
import { GoogleSignInButton } from './GoogleSignInButton';
import { SchoolLogo } from './SchoolLogo';
import { AcademicStudentRosterTab } from './academic/AcademicStudentRosterTab';
import { AcademicDirectivesManagerTab } from './academic/AcademicDirectivesManagerTab';
import { StudentResult, Teacher, StudentProfile, SubjectResult, ResultsPdfDocument } from '../types';
import {
  downloadStudentResultSlipPdf,
  downloadClassBroadsheetPdf,
  printStudentResultSlipDirectly,
} from '../utils/pdfService';
import {
  exportResultsToExcel,
  parseExcelResultsFile,
  downloadExcelTemplate,
} from '../utils/excelService';
import { InlineReportCardPdfViewer } from './InlineReportCardPdfViewer';
import { NectaResultsOfficialView } from './NectaResultsOfficialView';
import { AcademicSubjectEntryModule } from './AcademicSubjectEntryModule';
import {
  changeTeacherPinWithVerification,
  getTeacherAuthProfile,
  isTeacherAuthorizedForSubject,
} from '../services/teacherAuthDirectory';

export type AcademicRole = 'parent' | 'teacher' | 'academic_master' | 'student';

interface AcademicPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: AcademicRole;
  initialStudentId?: string;
  onOpenInstallApp?: () => void;
  initialAuthenticated?: boolean;
}

// Standard subjects for Uomboni Secondary School
const STANDARD_SUBJECTS = [
  { code: '011', name: 'Civics', nameEn: 'Civics' },
  { code: '012', name: 'History', nameEn: 'History' },
  { code: '013', name: 'Geography', nameEn: 'Geography' },
  { code: '021', name: 'Kiswahili', nameEn: 'Kiswahili' },
  { code: '022', name: 'English Language', nameEn: 'English Language' },
  { code: '031', name: 'Physics', nameEn: 'Physics' },
  { code: '032', name: 'Chemistry', nameEn: 'Chemistry' },
  { code: '033', name: 'Biology', nameEn: 'Biology' },
  { code: '041', name: 'Basic Mathematics', nameEn: 'Basic Mathematics' },
  { code: '071', name: 'Religious Education', nameEn: 'Religious Education' },
];

export const AcademicPortalModal: React.FC<AcademicPortalModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'parent',
  initialStudentId,
  onOpenInstallApp,
  initialAuthenticated = false,
}) => {
  const { language } = useLanguage();
  const {
    studentResults,
    students,
    teachers,
    resultsPdfDocuments,
    timetable,
    addStudentResult,
    bulkAddStudentResults,
    updateStudentResult,
    deleteStudentResult,
    bulkReplaceStudentResults,
    addResultsPdfDoc,
    deleteResultsPdfDoc,
  } = useData();

  // Active role state
  const [activeRole, setActiveRole] = useState<AcademicRole>(initialRole);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    initialRole === 'parent' ? true : initialAuthenticated
  );

  // Sync role and authentication when modal is opened or reopened with new role
  React.useEffect(() => {
    setActiveRole(initialRole);
    if (initialRole === 'parent' || initialAuthenticated) {
      setIsAuthenticated(true);
    }
  }, [initialRole, initialAuthenticated]);

  // Parent State
  const [parentSearchQuery, setParentSearchQuery] = useState(initialStudentId || '');
  const [selectedParentStudent, setSelectedParentStudent] = useState<StudentResult | null>(() => {
    return studentResults[0] || null;
  });
  const [parentActiveTab, setParentActiveTab] = useState<'marks' | 'progress' | 'conduct' | 'teachers'>('marks');
  const [parentViewPdfMode, setParentViewPdfMode] = useState<boolean>(false);
  const [parentViewMode, setParentViewMode] = useState<'official_necta' | 'report_card'>('official_necta');
  const [parentFeedbackSent, setParentFeedbackSent] = useState<boolean>(false);

  // Teacher State & Instant Auto-Publishing Engine
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(() => {
    return teachers.find(t => t.roleSw.includes('Taaluma') || t.subjects.includes('Chemistry')) || teachers[0] || null;
  });
  const [teacherEmailInput, setTeacherEmailInput] = useState('walimu@uomboni.sc.tz');
  const [isTeacherGoogleSigningIn, setIsTeacherGoogleSigningIn] = useState(false);
  const [teacherGoogleUser, setTeacherGoogleUser] = useState<any>(null);
  const [teacherAuthError, setTeacherAuthError] = useState(false);
  const [teacherEmailError, setTeacherEmailError] = useState('');
  const [teacherSelectedSubject, setTeacherSelectedSubject] = useState<string>('Chemistry');
  const [teacherSelectedForm, setTeacherSelectedForm] = useState<string>('Form 4');
  const [teacherSelectedExam, setTeacherSelectedExam] = useState<string>('NECTA Mock 2025');
  const [teacherMarksDraft, setTeacherMarksDraft] = useState<{ [examNumber: string]: { score: number; remarks: string } }>({});
  const [teacherSaveSuccess, setTeacherSaveSuccess] = useState(false);
  const [teacherActiveTab, setTeacherActiveTab] = useState<'subject_entry' | 'master_grid' | 'single_add' | 'broadcast'>('subject_entry');

  // Teacher Change PIN Modal State (Inside Authenticated Portal)
  const [isTeacherChangePinOpen, setIsTeacherChangePinOpen] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeFeedback, setPinChangeFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Excel / CSV File Upload State for Teachers
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [parsedExcelStudents, setParsedExcelStudents] = useState<StudentResult[]>([]);
  const [excelParseError, setExcelParseError] = useState<string | null>(null);
  const [excelParseSuccess, setExcelParseSuccess] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [lastPublishedAudit, setLastPublishedAudit] = useState<{
    timestamp: string;
    count: number;
    examType: string;
    form: string;
    teacherName: string;
    divisionStats: Record<string, number>;
  } | null>(null);
  const [copiedBroadcastText, setCopiedBroadcastText] = useState(false);

  // Teacher Single Student Quick Add Draft
  const [teacherSingleStudentDraft, setTeacherSingleStudentDraft] = useState({
    studentName: '',
    examNumber: '',
    gender: 'M' as 'M' | 'F',
    form: 'Form 4' as 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4',
    stream: 'Science' as 'A' | 'B' | 'Science' | 'Arts' | 'Commercial',
    examType: 'NECTA Mock 2025',
    conduct: 'Bora Sana (Excellent)' as 'Bora Sana (Excellent)' | 'Nzuri Sana (Very Good)' | 'Nzuri (Good)' | 'Inaridhisha (Fair)',
    headmasterRemarks: 'Mwanafunzi hodari mwenye bidii na nidhamu ya kikanisa.',
    subjectScores: STANDARD_SUBJECTS.reduce((acc, sub) => ({ ...acc, [sub.code]: 72 }), {} as { [code: string]: number }),
  });

  // Academic Master State
  const [academicEmailInput, setAcademicEmailInput] = useState('academic@uomboni.sc.tz');
  const [isAcademicGoogleSigningIn, setIsAcademicGoogleSigningIn] = useState(false);
  const [academicGoogleUser, setAcademicGoogleUser] = useState<any>(null);
  const [academicAuthError, setAcademicAuthError] = useState(false);
  const [academicEmailError, setAcademicEmailError] = useState('');
  const [academicActiveTab, setAcademicActiveTab] = useState<'teachers_admin' | 'directives' | 'necta_sheet' | 'students_roster' | 'overview' | 'broadsheet' | 'manage' | 'pdfBooks' | 'recompute'>('teachers_admin');
  const [broadsheetForm, setBroadsheetForm] = useState<string>('Form 4');
  const [broadsheetExam, setBroadsheetExam] = useState<string>('NECTA Mock 2025');
  const [recomputeSuccess, setRecomputeSuccess] = useState(false);

  // New Student Result Form State (for Academic Master)
  const [isAddResultModalOpen, setIsAddResultModalOpen] = useState(false);
  const [newResultData, setNewResultData] = useState({
    studentName: '',
    examNumber: '',
    gender: 'M' as 'M' | 'F',
    form: 'Form 4' as 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4',
    stream: 'Science' as 'A' | 'B' | 'Science' | 'Arts' | 'Commercial',
    examType: 'NECTA Mock 2025' as 'NECTA Mock 2025' | 'Annual Examination 2025' | 'Mid-Term Exam 2025' | 'Pre-NECTA 2025',
    conduct: 'Bora Sana (Excellent)' as 'Bora Sana (Excellent)' | 'Nzuri Sana (Very Good)' | 'Nzuri (Good)' | 'Inaridhisha (Fair)',
    headmasterRemarks: 'Matokeo mazuri sana kitaaluma. Ana nidhamu thabiti na bidii ya kuigwa.',
    subjectScores: STANDARD_SUBJECTS.reduce((acc, sub) => ({ ...acc, [sub.code]: 65 }), {} as { [code: string]: number }),
  });

  // Student State
  const [studentInputIdentifier, setStudentInputIdentifier] = useState('');
  const [studentAuthError, setStudentAuthError] = useState(false);
  const [activeStudentResult, setActiveStudentResult] = useState<StudentResult | null>(() => studentResults[0] || null);

  // Filtered students for teacher mark entry, incorporating all registered school students
  const teacherClassStudents = useMemo(() => {
    const fromResults = studentResults.filter(
      (r) => r.form === teacherSelectedForm && r.examType === teacherSelectedExam
    );
    const existingExamNos = new Set(fromResults.map((r) => r.examNumber.toLowerCase()));

    const registered = (students || []).filter(
      (s) => s.form === teacherSelectedForm && !existingExamNos.has(s.examNumber.toLowerCase())
    );

    const synthesized: StudentResult[] = registered.map((s) => ({
      id: `syn-${s.id}-${teacherSelectedExam}`,
      studentId: s.studentId,
      examNumber: s.examNumber,
      studentName: s.fullName,
      gender: (s.gender as 'M' | 'F') || 'F',
      form: (s.form as any) || teacherSelectedForm,
      stream: (s.stream as any) || 'Science',
      examType: teacherSelectedExam as any,
      year: 2026,
      subjects: [],
      totalMarks: 0,
      averageMarks: 0,
      division: 'Division 0',
      points: 35,
      classPosition: 0,
      totalStudentsInClass: 0,
      conduct: 'Bora Sana (Excellent)',
      headmasterRemarks: 'Mwanafunzi mwenye bidii kitaaluma.',
      publishDate: '2026-03-15',
      detailedSubjectsString: '',
      approvalStatus: 'draft_teacher',
    }));

    return [...fromResults, ...synthesized].sort((a, b) => a.examNumber.localeCompare(b.examNumber));
  }, [studentResults, students, teacherSelectedForm, teacherSelectedExam]);

  // Broadsheet filtered results
  const broadsheetResults = useMemo(() => {
    return studentResults.filter(
      (r) => (broadsheetForm === 'ALL' || r.form === broadsheetForm) && (broadsheetExam === 'ALL' || r.examType === broadsheetExam)
    );
  }, [studentResults, broadsheetForm, broadsheetExam]);

  if (!isOpen) return null;

  // Grade and Point calculation helper
  const calculateGradeAndPoints = (score: number): { grade: 'A' | 'B' | 'C' | 'D' | 'F'; points: number; remarks: string } => {
    if (score >= 75) return { grade: 'A', points: 1, remarks: 'Bora Sana / Excellent' };
    if (score >= 65) return { grade: 'B', points: 2, remarks: 'Nzuri Sana / Very Good' };
    if (score >= 45) return { grade: 'C', points: 3, remarks: 'Nzuri / Good' };
    if (score >= 30) return { grade: 'D', points: 4, remarks: 'Inaridhisha / Pass' };
    return { grade: 'F', points: 5, remarks: 'Feli / Fail' };
  };

  // Division calculation based on best 7 subjects for NECTA O-Level
  const calculateDivision = (subjects: SubjectResult[]): { division: StudentResult['division']; totalPoints: number } => {
    if (!subjects || subjects.length === 0) return { division: 'Division 0', totalPoints: 35 };
    const pointsList = subjects.map((s) => s.points).sort((a, b) => a - b);
    const best7Points = pointsList.slice(0, 7);
    const totalPoints = best7Points.reduce((sum, p) => sum + p, 0);

    let division: StudentResult['division'] = 'Division 0';
    if (totalPoints >= 7 && totalPoints <= 17) {
      division = 'Division I';
    } else if (totalPoints >= 18 && totalPoints <= 21) {
      division = 'Division II';
    } else if (totalPoints >= 22 && totalPoints <= 25) {
      division = 'Division III';
    } else if (totalPoints >= 26 && totalPoints <= 33) {
      division = 'Division IV';
    } else {
      division = 'Division 0';
    }
    return { division, totalPoints };
  };

  // Handle Parent Search
  const handleParentSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    const foundResult = studentResults.find((r) => {
      return (
        r.examNumber.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.id.toLowerCase() === q
      );
    });

    if (foundResult) {
      setSelectedParentStudent(foundResult);
      setIsAuthenticated(true);
      return;
    }

    // Try matching from students list (e.g. parent phone or studentId)
    const foundProfile = students.find((s) => {
      const cleanPhone = (s.parentPhone || '').replace(/\D/g, '');
      const qDigits = q.replace(/\D/g, '');
      return (
        s.studentId.toLowerCase() === q ||
        s.fullName.toLowerCase().includes(q) ||
        s.examNumber.toLowerCase().includes(q) ||
        (qDigits.length >= 6 && cleanPhone.includes(qDigits))
      );
    });

    if (foundProfile) {
      const matchResult = studentResults.find(
        (r) => r.examNumber.toLowerCase() === foundProfile.examNumber.toLowerCase() || r.studentName.toLowerCase() === foundProfile.fullName.toLowerCase()
      );
      if (matchResult) {
        setSelectedParentStudent(matchResult);
        setIsAuthenticated(true);
      } else if (studentResults[0]) {
        setSelectedParentStudent(studentResults[0]);
        setIsAuthenticated(true);
      }
    }
  };

  // Handle Teacher Google Sign-In
  const handleTeacherGoogleSignIn = async () => {
    setIsTeacherGoogleSigningIn(true);
    setTeacherAuthError(false);
    setTeacherEmailError('');
    try {
      const res = await signInWithGoogle('teacher');
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

        const authCheck = checkStaffAuthorization(email, 'teacher', firestoreRole);

        await logStaffAuthAttempt({
          email,
          roleRequested: 'teacher',
          success: authCheck.authorized,
          reason: authCheck.authorized ? 'Teacher access authorized' : 'Unauthorized teacher desk attempt',
          uid: res.user.uid,
        });

        if (!authCheck.authorized) {
          setTeacherAuthError(true);
          setTeacherEmailError(language === 'sw' ? authCheck.reasonSw : authCheck.reasonEn);
          return;
        }

        // Match verified teacher faculty profile and assigned subjects
        const matchedFaculty =
          teachers.find((t) => t.email?.toLowerCase() === email.toLowerCase()) ||
          getTeacherAuthProfile(email);

        if (matchedFaculty) {
          const assignedList =
            ('assignedSubjects' in matchedFaculty
              ? (matchedFaculty as any).assignedSubjects
              : (matchedFaculty as any).subjects) || ['Chemistry'];
          setSelectedTeacher({
            id: matchedFaculty.id,
            name: matchedFaculty.name,
            email: matchedFaculty.email || email,
            phone: (matchedFaculty as any).phone || '+255 700 000 000',
            role: (matchedFaculty as any).role || 'Mwalimu wa Somo',
            roleSw: (matchedFaculty as any).roleSw || (matchedFaculty as any).role || 'Mwalimu wa Somo',
            roleEn: (matchedFaculty as any).roleEn || 'Subject Teacher',
            department: matchedFaculty.department || 'Sayansi (Science)',
            subjects: assignedList,
            imageUrl: matchedFaculty.imageUrl || '/media/media_1.webp',
          });
          if (assignedList.length > 0) {
            setTeacherSelectedSubject(assignedList[0]);
          }
        }

        setTeacherGoogleUser(res.user);
        if (res.user.email) setTeacherEmailInput(res.user.email);
        setTeacherActiveTab('subject_entry');
        setIsAuthenticated(true);
      } else {
        setTeacherAuthError(true);
        setTeacherEmailError(
          res.error ||
            (language === 'sw'
              ? 'Imeshindwa kuingia na akaunti ya Google.'
              : 'Failed to sign in with Google account.')
        );
      }
    } catch (err: any) {
      setTeacherAuthError(true);
      setTeacherEmailError(err?.message || 'Hitilafu ya uthibitishaji.');
    } finally {
      setIsTeacherGoogleSigningIn(false);
    }
  };

  // Handle Academic Master Google Sign-In
  const handleAcademicGoogleSignIn = async () => {
    setIsAcademicGoogleSigningIn(true);
    setAcademicAuthError(false);
    setAcademicEmailError('');
    try {
      const res = await signInWithGoogle('academic_master');
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

        const authCheck = checkStaffAuthorization(email, 'academic_master', firestoreRole);

        await logStaffAuthAttempt({
          email,
          roleRequested: 'academic_master',
          success: authCheck.authorized,
          reason: authCheck.authorized ? 'Academic Master access authorized' : 'Unauthorized Academic Master access attempt',
          uid: res.user.uid,
        });

        if (!authCheck.authorized) {
          setAcademicAuthError(true);
          setAcademicEmailError(language === 'sw' ? authCheck.reasonSw : authCheck.reasonEn);
          return;
        }

        setAcademicGoogleUser(res.user);
        if (res.user.email) setAcademicEmailInput(res.user.email);
        setIsAuthenticated(true);
      } else {
        setAcademicAuthError(true);
        setAcademicEmailError(
          res.error ||
            (language === 'sw'
              ? 'Imeshindwa kuingia na akaunti ya Google.'
              : 'Failed to sign in with Google account.')
        );
      }
    } catch (err: any) {
      setAcademicAuthError(true);
      setAcademicEmailError(err?.message || 'Hitilafu ya uthibitishaji.');
    } finally {
      setIsAcademicGoogleSigningIn(false);
    }
  };

  // Handle Teacher Direct / PIN / Faculty Selection Sign-In
  const handleTeacherDirectLogin = (teacher: { id?: string; name: string; email: string; role?: string; subjects?: string[] }) => {
    const found =
      teachers.find(
        (t) =>
          (teacher.id && t.id === teacher.id) ||
          (teacher.email && t.email?.toLowerCase() === teacher.email.toLowerCase()) ||
          t.name.toLowerCase().includes(teacher.name.toLowerCase())
      ) || teachers[0];

    const teacherAssignedSubjects = teacher.subjects || found.subjects || ['Chemistry'];
    setSelectedTeacher({
      ...found,
      subjects: teacherAssignedSubjects,
    });
    setTeacherEmailInput(found.email || teacher.email || 'walimu@uombonisec.ac.tz');
    if (teacherAssignedSubjects && teacherAssignedSubjects.length > 0) {
      setTeacherSelectedSubject(teacherAssignedSubjects[0]);
    }
    setTeacherGoogleUser({
      email: found.email || teacher.email,
      displayName: found.name,
      photoURL: found.imageUrl,
    });
    setTeacherActiveTab('subject_entry');
    setTeacherAuthError(false);
    setTeacherEmailError('');
    setIsAuthenticated(true);
  };

  // Handle Academic Master Direct / PIN Sign-In
  const handleAcademicDirectLogin = (master?: { name?: string; email?: string }) => {
    const defaultEmail = master?.email || 'yohana.bahati@uombonisec.ac.tz';
    const defaultName = master?.name || 'Mwl. Yohana Bahati (Mtaaluma Mkuu)';
    setAcademicEmailInput(defaultEmail);
    setAcademicGoogleUser({
      email: defaultEmail,
      displayName: defaultName,
      photoURL: '/media/media_3.webp',
    });
    setAcademicAuthError(false);
    setAcademicEmailError('');
    setIsAuthenticated(true);
  };

  // Handle Student Login
  const handleStudentLogin = () => {
    const q = studentInputIdentifier.trim().toLowerCase();
    if (!q) return;

    const found = studentResults.find(
      (r) => r.examNumber.toLowerCase() === q || r.studentName.toLowerCase().includes(q) || r.id.toLowerCase() === q
    );

    if (found) {
      setActiveStudentResult(found);
      setIsAuthenticated(true);
      setStudentAuthError(false);
    } else {
      setStudentAuthError(true);
    }
  };

  // Handle Excel File Upload & Parse for Teachers
  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);
    setIsParsingExcel(true);
    setExcelParseError(null);
    setExcelParseSuccess(null);
    try {
      const parsed = await parseExcelResultsFile(file);
      if (!parsed || parsed.length === 0) {
        throw new Error(language === 'sw' ? 'Faili halina rekodi zozote za wanafunzi.' : 'Spreadsheet contains no valid student records.');
      }
      setParsedExcelStudents(parsed);
      setExcelParseSuccess(
        language === 'sw'
          ? `Faili limekaguliwa kikamilifu! Wanafunzi ${parsed.length} wametambuliwa na madaraja (A-F, Division I-0) yamehesabiwa kiotomatiki kwa vigezo vya NECTA.`
          : `File parsed successfully! ${parsed.length} students detected with automated NECTA grading.`
      );
    } catch (err: any) {
      setExcelParseError(err?.message || (language === 'sw' ? 'Hitilafu ya kusoma faili la Excel/CSV.' : 'Error reading spreadsheet.'));
    } finally {
      setIsParsingExcel(false);
    }
  };

  // Handle Instant Self-Publishing from Uploaded Excel
  const handleInstantPublishExcel = (mode: 'merge' | 'replace' = 'merge') => {
    if (parsedExcelStudents.length === 0) return;

    // Calculate division breakdown statistics
    const stats: Record<string, number> = {
      'Division I': 0,
      'Division II': 0,
      'Division III': 0,
      'Division IV': 0,
      'Division 0': 0,
    };
    parsedExcelStudents.forEach((s) => {
      stats[s.division] = (stats[s.division] || 0) + 1;
    });

    if (mode === 'replace') {
      bulkReplaceStudentResults(parsedExcelStudents);
    } else {
      bulkAddStudentResults(parsedExcelStudents);
    }

    const nowStr = new Date().toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('sw-TZ');

    setLastPublishedAudit({
      timestamp: nowStr,
      count: parsedExcelStudents.length,
      examType: parsedExcelStudents[0]?.examType || 'Mitihani ya Uomboni',
      form: parsedExcelStudents[0]?.form || 'Form 4',
      teacherName: selectedTeacher?.name || 'Mwalimu wa Uomboni',
      divisionStats: stats,
    });

    setTeacherSaveSuccess(true);
    setTimeout(() => setTeacherSaveSuccess(false), 6000);
  };

  // Handle Loading Demo Test Batch for Instant Testing
  const handleLoadDemoBatch = () => {
    const demoNames = [
      'AMANI ELIAKIM MUSHI',
      'DEVOTHA GODFREY SHAYO',
      'KELVIN JOSEPHAT MTUI',
      'NEEMA CHRISTOPHER KIMARO',
      'BARAKA EMMANUEL TEMBA',
      'MARIAM JOACHIM LYIMO',
      'COLLINS FRANCIS MASSAWE',
      'GLORIA ALFRED TARIMO',
      'INNOCENT PETER MARIKI',
      'HAPPINESS FAUSTINE URASSA',
    ];

    const demoBatch: StudentResult[] = demoNames.map((name, idx) => {
      const isFemale = name.includes('DEVOTHA') || name.includes('NEEMA') || name.includes('MARIAM') || name.includes('GLORIA') || name.includes('HAPPINESS');
      const baseScores: Record<string, number> = {
        '011': 82 + (idx % 8) - 3,
        '012': 78 + (idx % 7) - 2,
        '013': 85 + (idx % 9) - 4,
        '021': 88 + (idx % 6) - 2,
        '022': 84 + (idx % 8) - 3,
        '031': 75 + (idx % 11) - 5,
        '032': 80 + (idx % 9) - 4,
        '033': 86 + (idx % 7) - 3,
        '041': 79 + (idx % 12) - 6,
        '071': 92 + (idx % 5) - 2,
      };

      const subjects: SubjectResult[] = STANDARD_SUBJECTS.map((sub) => {
        const rawScore = Math.min(100, Math.max(35, baseScores[sub.code] || 70));
        const { grade, points, remarks } = calculateGradeAndPoints(rawScore);
        return {
          code: sub.code,
          name: sub.name,
          nameEn: sub.nameEn,
          score: rawScore,
          grade,
          points,
          remarks,
        };
      });

      const totalMarks = subjects.reduce((sum, s) => sum + s.score, 0);
      const averageMarks = parseFloat((totalMarks / subjects.length).toFixed(1));
      const { division, totalPoints } = calculateDivision(subjects);

      return {
        id: `demo-res-${Date.now()}-${idx}`,
        examNumber: `S0486/${String(idx + 101).padStart(4, '0')}/2025`,
        studentName: name,
        gender: isFemale ? 'F' : 'M',
        form: 'Form 4',
        stream: idx % 2 === 0 ? 'Science' : 'Arts',
        examType: 'NECTA Mock 2025',
        year: 2025,
        subjects,
        totalMarks,
        averageMarks,
        division,
        points: totalPoints,
        classPosition: idx + 1,
        totalStudentsInClass: demoNames.length,
        conduct: 'Bora Sana (Excellent)',
        headmasterRemarks: 'Ufaulu mzuri sana na nidhamu ya kielelezo cha shule.',
        publishDate: new Date().toISOString().split('T')[0],
      };
    });

    demoBatch.sort((a, b) => b.averageMarks - a.averageMarks);
    demoBatch.forEach((s, i) => {
      s.classPosition = i + 1;
    });

    setParsedExcelStudents(demoBatch);
    setUploadFileName('Mfano_Matokeo_Form4_Mock2025.xlsx');
    setExcelParseSuccess(`Wanafunzi ${demoBatch.length} wa mfano wameandaliwa tayari kusakinishwa!`);
  };

  // Handle Teacher Saving Marks for Selected Subject & Instant Live Auto-Publishing
  const handleTeacherSaveMarks = () => {
    let affectedCount = 0;
    const updatedStudents = teacherClassStudents.map((student) => {
      const draft = teacherMarksDraft[student.examNumber];
      if (draft !== undefined) {
        affectedCount++;
        const score = draft.score;
        const remarks = draft.remarks;
        const { grade, points } = calculateGradeAndPoints(score);

        // Update or add subject in student subjects list
        let updatedSubjects = [...student.subjects];
        const existingSubIndex = updatedSubjects.findIndex(
          (s) =>
            s.name.toLowerCase() === teacherSelectedSubject.toLowerCase() ||
            s.nameEn.toLowerCase() === teacherSelectedSubject.toLowerCase()
        );

        if (existingSubIndex >= 0) {
          updatedSubjects[existingSubIndex] = {
            ...updatedSubjects[existingSubIndex],
            score,
            grade,
            points,
            remarks: remarks || updatedSubjects[existingSubIndex].remarks,
          };
        } else {
          updatedSubjects.push({
            code: '099',
            name: teacherSelectedSubject,
            nameEn: teacherSelectedSubject,
            score,
            grade,
            points,
            remarks: remarks || 'Nzuri',
          });
        }

        const totalMarks = updatedSubjects.reduce((sum, s) => sum + s.score, 0);
        const averageMarks = parseFloat((totalMarks / updatedSubjects.length).toFixed(1));
        const { division, totalPoints } = calculateDivision(updatedSubjects);

        const updatedStudentResult: StudentResult = {
          ...student,
          subjects: updatedSubjects,
          totalMarks,
          averageMarks,
          division,
          points: totalPoints,
        };

        updateStudentResult(updatedStudentResult);
        return updatedStudentResult;
      }
      return student;
    });

    const nowStr = new Date().toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('sw-TZ');
    setLastPublishedAudit({
      timestamp: nowStr,
      count: affectedCount || teacherClassStudents.length,
      examType: teacherSelectedExam,
      form: teacherSelectedForm,
      teacherName: selectedTeacher?.name || 'Mwalimu wa Somo',
      divisionStats: {
        'Division I': updatedStudents.filter((s) => s.division === 'Division I').length,
        'Division II': updatedStudents.filter((s) => s.division === 'Division II').length,
        'Division III': updatedStudents.filter((s) => s.division === 'Division III').length,
        'Division IV': updatedStudents.filter((s) => s.division === 'Division IV').length,
        'Division 0': updatedStudents.filter((s) => s.division === 'Division 0').length,
      },
    });

    setTeacherSaveSuccess(true);
    setTimeout(() => setTeacherSaveSuccess(false), 5000);
  };

  // Handle Teacher Single Student Quick Add & Instant Live Auto-Publishing
  const handleTeacherSingleStudentPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherSingleStudentDraft.studentName.trim()) {
      alert(language === 'sw' ? 'Tafadhali weka jina la mwanafunzi.' : 'Please provide student name.');
      return;
    }

    const assignedSubjects = selectedTeacher?.subjects || ['Chemistry'];
    const assignedSubjectObjs = STANDARD_SUBJECTS.filter((sub) =>
      assignedSubjects.some(
        (a) =>
          a.toLowerCase() === sub.name.toLowerCase() ||
          sub.name.toLowerCase().includes(a.toLowerCase()) ||
          a.toLowerCase().includes(sub.name.toLowerCase())
      )
    );

    const generatedExamNo =
      teacherSingleStudentDraft.examNumber.trim() ||
      `S0486/${String(studentResults.length + 1).padStart(4, '0')}/2025`;

    // Check if student already exists in student results
    const existingStudent = studentResults.find(
      (s) =>
        s.examNumber.toLowerCase() === generatedExamNo.toLowerCase() ||
        (s.studentName.toLowerCase() === teacherSingleStudentDraft.studentName.trim().toLowerCase() &&
          s.form === teacherSingleStudentDraft.form &&
          s.examType === teacherSingleStudentDraft.examType)
    );

    let finalDivision: StudentResult['division'] = 'Division 0';

    if (existingStudent) {
      // ONLY update or append teacher's assigned subject(s)! DO NOT touch other teachers' subjects!
      const updatedSubjects = [...existingStudent.subjects];
      assignedSubjectObjs.forEach((sub) => {
        const score = teacherSingleStudentDraft.subjectScores[sub.code] ?? 70;
        const { grade, points, remarks } = calculateGradeAndPoints(score);
        const idx = updatedSubjects.findIndex(
          (s) => s.code === sub.code || s.name.toLowerCase() === sub.name.toLowerCase()
        );
        const newSubObj: SubjectResult = {
          code: sub.code,
          name: sub.name,
          nameEn: sub.nameEn,
          score,
          grade,
          points,
          remarks: remarks || 'Nzuri',
        };
        if (idx >= 0) {
          updatedSubjects[idx] = newSubObj;
        } else {
          updatedSubjects.push(newSubObj);
        }
      });

      const totalMarks = updatedSubjects.reduce((sum, s) => sum + s.score, 0);
      const averageMarks = parseFloat((totalMarks / (updatedSubjects.length || 1)).toFixed(1));
      const { division, totalPoints } = calculateDivision(updatedSubjects);
      finalDivision = division;

      const updatedStudent: StudentResult = {
        ...existingStudent,
        subjects: updatedSubjects,
        totalMarks,
        averageMarks,
        division,
        points: totalPoints,
      };

      updateStudentResult(updatedStudent);
    } else {
      // New student: strictly populate only the teacher's assigned subjects
      const subjectsList: SubjectResult[] = assignedSubjectObjs.map((sub) => {
        const score = teacherSingleStudentDraft.subjectScores[sub.code] ?? 70;
        const { grade, points, remarks } = calculateGradeAndPoints(score);
        return {
          code: sub.code,
          name: sub.name,
          nameEn: sub.nameEn,
          score,
          grade,
          points,
          remarks: remarks || 'Nzuri',
        };
      });

      const totalMarks = subjectsList.reduce((sum, s) => sum + s.score, 0);
      const averageMarks = parseFloat((totalMarks / (subjectsList.length || 1)).toFixed(1));
      const { division, totalPoints } = calculateDivision(subjectsList);
      finalDivision = division;

      const newResult: StudentResult = {
        id: `tch-res-${Date.now()}`,
        examNumber: generatedExamNo.toUpperCase(),
        studentName: teacherSingleStudentDraft.studentName.toUpperCase().trim(),
        gender: teacherSingleStudentDraft.gender,
        form: teacherSingleStudentDraft.form,
        stream: teacherSingleStudentDraft.stream,
        examType: teacherSingleStudentDraft.examType as any,
        year: 2025,
        subjects: subjectsList,
        totalMarks,
        averageMarks,
        division,
        points: totalPoints,
        classPosition: studentResults.filter((s) => s.form === teacherSingleStudentDraft.form).length + 1,
        totalStudentsInClass: studentResults.filter((s) => s.form === teacherSingleStudentDraft.form).length + 1,
        conduct: teacherSingleStudentDraft.conduct as any,
        headmasterRemarks: teacherSingleStudentDraft.headmasterRemarks,
        publishDate: new Date().toISOString().split('T')[0],
      };

      addStudentResult(newResult);
    }

    const nowStr = new Date().toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('sw-TZ');
    setLastPublishedAudit({
      timestamp: nowStr,
      count: 1,
      examType: teacherSingleStudentDraft.examType,
      form: teacherSingleStudentDraft.form,
      teacherName: selectedTeacher?.name || 'Mwalimu wa Uomboni',
      divisionStats: {
        [finalDivision]: 1,
      },
    });

    setTeacherSaveSuccess(true);
    setTeacherSingleStudentDraft((prev) => ({
      ...prev,
      studentName: '',
      examNumber: '',
    }));
    setTimeout(() => setTeacherSaveSuccess(false), 5000);
  };

  // Handle Recalculating All Divisions & Class Ranks
  const handleRecomputeAllDivisions = () => {
    const updated = studentResults.map((student) => {
      const { division, totalPoints } = calculateDivision(student.subjects);
      const totalMarks = student.subjects.reduce((sum, s) => sum + s.score, 0);
      const averageMarks = parseFloat((totalMarks / (student.subjects.length || 1)).toFixed(1));
      return {
        ...student,
        division,
        points: totalPoints,
        totalMarks,
        averageMarks,
      };
    });

    // Re-rank by form and exam
    const forms = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
    const exams = Array.from(new Set(studentResults.map((s) => s.examType)));

    forms.forEach((f) => {
      exams.forEach((ex) => {
        const cohort = updated.filter((s) => s.form === f && s.examType === ex);
        cohort.sort((a, b) => b.averageMarks - a.averageMarks);
        cohort.forEach((s, idx) => {
          s.classPosition = idx + 1;
          s.totalStudentsInClass = cohort.length;
        });
      });
    });

    bulkReplaceStudentResults(updated);
    setRecomputeSuccess(true);
    setTimeout(() => setRecomputeSuccess(false), 4000);
  };

  // Add new student result
  const handleCreateStudentResult = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectsList: SubjectResult[] = STANDARD_SUBJECTS.map((sub) => {
      const score = newResultData.subjectScores[sub.code] || 60;
      const { grade, points, remarks } = calculateGradeAndPoints(score);
      return {
        code: sub.code,
        name: sub.name,
        nameEn: sub.nameEn,
        score,
        grade,
        points,
        remarks,
      };
    });

    const totalMarks = subjectsList.reduce((sum, s) => sum + s.score, 0);
    const averageMarks = parseFloat((totalMarks / subjectsList.length).toFixed(1));
    const { division, totalPoints } = calculateDivision(subjectsList);

    const newResult: StudentResult = {
      id: `res-${Date.now()}`,
      examNumber: newResultData.examNumber || `S0486/${String(studentResults.length + 1).padStart(4, '0')}/2025`,
      studentName: newResultData.studentName.toUpperCase(),
      gender: newResultData.gender,
      form: newResultData.form,
      stream: newResultData.stream,
      examType: newResultData.examType,
      year: 2025,
      subjects: subjectsList,
      totalMarks,
      averageMarks,
      division,
      points: totalPoints,
      classPosition: studentResults.filter(s => s.form === newResultData.form).length + 1,
      totalStudentsInClass: studentResults.filter(s => s.form === newResultData.form).length + 1,
      conduct: newResultData.conduct,
      headmasterRemarks: newResultData.headmasterRemarks,
      publishDate: new Date().toISOString().split('T')[0],
    };

    addStudentResult(newResult);
    setIsAddResultModalOpen(false);
  };

  // Division Badge Helper (Ivory & Red theme)
  const getDivisionBadge = (div: string) => {
    switch (div) {
      case 'Division I':
        return 'bg-red-700 text-[#FFFFF0] font-black shadow-xs border border-red-800';
      case 'Division II':
        return 'bg-red-800 text-[#FFFFF0] font-bold border border-red-900';
      case 'Division III':
        return 'bg-red-900/90 text-[#FFFFF0] font-semibold border border-red-700/60';
      case 'Division IV':
        return 'bg-[#FAF7EE] text-red-900 border border-red-300 font-bold';
      default:
        return 'bg-red-50 text-red-950 border border-red-200 font-bold';
    }
  };

  // Grade Badge Helper (Ivory & Red theme)
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-red-700 text-[#FFFFF0] border-red-800 font-black';
      case 'B':
        return 'bg-red-100 text-red-900 border-red-300 font-bold';
      case 'C':
        return 'bg-[#FFFDF8] text-red-800 border-red-200 font-semibold';
      case 'D':
        return 'bg-[#FAF7EE] text-red-950 border-red-200';
      default:
        return 'bg-red-50 text-red-950 border-red-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-1 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FAF7EE] border-2 border-red-800/40 rounded-2xl sm:rounded-3xl w-full max-w-6xl h-[97vh] sm:h-auto sm:max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-[#2A1617]">
        
        {/* ================= MODAL TOP BANNER & ROLE SWITCHER (COMPACT) ================= */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b-2 border-red-800 p-2.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 text-[#FFFFF0] shadow-md">
          <div className="flex items-center justify-between w-full md:w-auto gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-xl bg-[#FFFFF0] border border-red-700/60 shadow-xs shrink-0">
                <SchoolLogo size="sm" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-base font-black text-[#FFFFF0] tracking-tight">
                    {language === 'sw' ? 'Portal ya Taaluma & Utawala' : 'Academic & Faculty Portal'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFFFF0] text-red-900 text-[9px] font-black uppercase tracking-wider">
                    🔒 {language === 'sw' ? 'Ndani' : 'Internal'}
                  </span>
                </div>
                <p className="text-[11px] text-red-100 font-medium hidden sm:block">
                  {language === 'sw'
                    ? 'Shule ya Sekondari Uomboni (NECTA S0486) • Marangu, Moshi'
                    : 'Uomboni Secondary School (NECTA S0486) • Marangu, Moshi'}
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden text-red-200 hover:text-white p-1.5 rounded-xl bg-red-950/80 hover:bg-red-800 transition-all cursor-pointer"
              title="Funga (Close)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Navigation Pills */}
          <div className="flex items-center gap-1 p-0.5 bg-red-950/90 rounded-xl border border-red-800 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => {
                setActiveRole('academic_master');
                setIsAuthenticated(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                activeRole === 'academic_master'
                  ? 'bg-[#FFFFF0] text-red-900 shadow-xs font-black'
                  : 'text-red-100 hover:text-white hover:bg-red-900/60'
              }`}
            >
              <Award className="w-3 h-3 text-red-700" />
              <span>{language === 'sw' ? 'Taaluma' : 'Academic'}</span>
            </button>

            <button
              onClick={() => {
                setActiveRole('teacher');
                setIsAuthenticated(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                activeRole === 'teacher'
                  ? 'bg-[#FFFFF0] text-red-900 shadow-xs font-black'
                  : 'text-red-100 hover:text-white hover:bg-red-900/60'
              }`}
            >
              <BookOpen className="w-3 h-3 text-red-700" />
              <span>{language === 'sw' ? 'Mwalimu' : 'Teacher'}</span>
            </button>

            <button
              onClick={() => {
                setActiveRole('parent');
                setIsAuthenticated(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                activeRole === 'parent'
                  ? 'bg-[#FFFFF0] text-red-900 shadow-xs font-black'
                  : 'text-red-100 hover:text-white hover:bg-red-900/60'
              }`}
            >
              <Users className="w-3 h-3 text-red-700" />
              <span>{language === 'sw' ? 'Mzazi' : 'Parent'}</span>
            </button>

            <button
              onClick={() => {
                setActiveRole('student');
                setIsAuthenticated(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-[#FFFFF0] text-red-900 shadow-xs font-black'
                  : 'text-red-100 hover:text-white hover:bg-red-900/60'
              }`}
            >
              <GraduationCap className="w-3 h-3 text-red-700" />
              <span>{language === 'sw' ? 'Mwanafunzi' : 'Student'}</span>
            </button>
          </div>

          {/* Desktop Close Button */}
          <button
            onClick={onClose}
            className="hidden md:flex text-red-200 hover:text-white p-1.5 rounded-xl bg-red-950/80 hover:bg-red-800 transition-all cursor-pointer shrink-0"
            title="Funga (Close)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= MODAL MAIN BODY ================= */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-5 space-y-4 bg-[#FAF7EE] text-[#2A1617]">

          {/* ========================================================================= */}
          {/* ============================= 1. PARENT ROLE ============================= */}
          {/* ========================================================================= */}
          {activeRole === 'parent' && (
            <div className="space-y-6">
              {/* Parent Sub-View Toggle */}
              <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-[#FFFDF8] rounded-2xl border-2 border-red-200 shadow-xs">
                <button
                  onClick={() => setParentViewMode('official_necta')}
                  className={`flex-1 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    parentViewMode === 'official_necta'
                      ? 'bg-red-700 text-[#FFFFF0] font-black shadow-md'
                      : 'text-red-950 hover:bg-red-50'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Jedwali Rasmi la NECTA / CSSC (Majina & Namba za Watahiniwa)' : 'Official NECTA / CSSC Results (Candidate Names & Numbers)'}</span>
                </button>
                <button
                  onClick={() => setParentViewMode('report_card')}
                  className={`flex-1 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    parentViewMode === 'report_card'
                      ? 'bg-red-700 text-[#FFFFF0] font-black shadow-md'
                      : 'text-red-950 hover:bg-red-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Ripoti ya Mwanafunzi Binafsi & SMS kwa Walimu' : 'Personal Student Report Card & Teacher SMS'}</span>
                </button>
              </div>

              {parentViewMode === 'official_necta' ? (
                <NectaResultsOfficialView
                  initialExamNumber={selectedParentStudent?.examNumber || parentSearchQuery}
                  onOpenReportCard={(st) => {
                    setSelectedParentStudent(st);
                    setParentViewMode('report_card');
                  }}
                  isAcademicMasterView={false}
                />
              ) : (
                <div className="space-y-6">
                  {/* Parent Student Search & Quick Select Banner */}
                  <div className="bg-[#FFFDF8] p-4 sm:p-5 rounded-2xl border-2 border-red-200/80 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-red-950 flex items-center gap-2">
                          <Users className="w-5 h-5 text-red-700" />
                          <span>{language === 'sw' ? 'Portal ya Mzazi / Mlezi (Ripoti Binafsi)' : 'Parent Academic Desk & Progress'}</span>
                        </h3>
                        <p className="text-xs text-red-900/70">
                          {language === 'sw'
                            ? 'Tazama ripoti ya maendeleo ya kitaaluma, madaraja ya masomo, nafasi darasani, na pakua Hati ya Matokeo (PDF).'
                            : 'Review your child’s academic performance, subject breakdown, class rank, and download official PDF Report Cards.'}
                        </p>
                      </div>

                      {/* Student Switcher / Search Input */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                          <Search className="w-4 h-4 text-red-600 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={parentSearchQuery}
                            onChange={(e) => {
                              setParentSearchQuery(e.target.value);
                              handleParentSearch(e.target.value);
                            }}
                            placeholder={language === 'sw' ? 'Namba ya Mtihani au Jina...' : 'Exam No or Name...'}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7EE] border-2 border-red-200 text-xs text-red-950 placeholder-stone-400 focus:outline-hidden focus:border-red-600 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Select Student Chips */}
                    {studentResults.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
                        <span className="text-red-900 text-[11px] font-semibold shrink-0">
                          {language === 'sw' ? 'Wanafunzi:' : 'Students:'}
                        </span>
                        {studentResults.slice(0, 5).map((stu) => (
                          <button
                            key={stu.id}
                            onClick={() => setSelectedParentStudent(stu)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                              selectedParentStudent?.id === stu.id
                                ? 'bg-red-700 text-[#FFFFF0] border-red-800 font-black shadow-xs'
                                : 'bg-[#FAF7EE] text-red-950 border-red-200 hover:bg-red-50'
                            }`}
                          >
                            {stu.studentName.split(' ')[0]} ({stu.form}) - {stu.division}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

              {selectedParentStudent ? (
                <div className="space-y-6">
                  {/* Top Student Overview Card */}
                  <div className="bg-[#FFFDF8] p-5 rounded-2xl border-2 border-red-200/80 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-red-700 text-[#FFFFF0] flex items-center justify-center font-black text-2xl shadow-md shrink-0 border border-red-800">
                        {selectedParentStudent.studentName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-black text-red-950">{selectedParentStudent.studentName}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${getDivisionBadge(selectedParentStudent.division)}`}>
                            {selectedParentStudent.division}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-red-900/80">
                          <span className="font-mono bg-[#FAF7EE] px-2 py-0.5 rounded-md border border-red-200 text-red-800 font-bold">
                            {selectedParentStudent.examNumber}
                          </span>
                          <span>• {selectedParentStudent.form} ({selectedParentStudent.stream})</span>
                          <span>• {selectedParentStudent.examType}</span>
                        </div>
                      </div>
                    </div>

                    {/* KPI Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                      <div className="p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-center">
                        <span className="text-[10px] text-red-800 uppercase font-bold block">{language === 'sw' ? 'Wastani' : 'Average'}</span>
                        <span className="text-base font-black text-red-700">{selectedParentStudent.averageMarks}%</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-center">
                        <span className="text-[10px] text-red-800 uppercase font-bold block">{language === 'sw' ? 'Pointi' : 'Points'}</span>
                        <span className="text-base font-black text-red-950">{selectedParentStudent.points} pts</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-center">
                        <span className="text-[10px] text-red-800 uppercase font-bold block">{language === 'sw' ? 'Nafasi' : 'Rank'}</span>
                        <span className="text-base font-black text-red-700">{selectedParentStudent.classPosition} / {selectedParentStudent.totalStudentsInClass}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-center">
                        <span className="text-[10px] text-red-800 uppercase font-bold block">{language === 'sw' ? 'Jumla' : 'Total'}</span>
                        <span className="text-base font-black text-red-950">{selectedParentStudent.totalMarks}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Subtabs */}
                  <div className="flex items-center gap-2 border-b-2 border-red-200 pb-2 overflow-x-auto">
                    <button
                      onClick={() => setParentActiveTab('marks')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        parentActiveTab === 'marks'
                          ? 'bg-red-700 text-[#FFFFF0] font-black shadow-xs'
                          : 'text-red-950 hover:bg-red-50 bg-[#FFFDF8] border border-red-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Ripoti ya Masomo (Subject Grades)' : 'Subject Grades'}</span>
                    </button>

                    <button
                      onClick={() => setParentActiveTab('conduct')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        parentActiveTab === 'conduct'
                          ? 'bg-red-700 text-[#FFFFF0] font-black shadow-xs'
                          : 'text-red-950 hover:bg-red-50 bg-[#FFFDF8] border border-red-200'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Nidhamu & Maoni ya Walimu' : 'Conduct & Remarks'}</span>
                    </button>

                    <button
                      onClick={() => setParentActiveTab('teachers')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        parentActiveTab === 'teachers'
                          ? 'bg-red-700 text-[#FFFFF0] font-black shadow-xs'
                          : 'text-red-950 hover:bg-red-50 bg-[#FFFDF8] border border-red-200'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Wasiliana na Walimu wa Somo' : 'Contact Teachers'}</span>
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => downloadStudentResultSlipPdf(selectedParentStudent)}
                        className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{language === 'sw' ? 'Pakua PDF' : 'Download PDF'}</span>
                      </button>

                      <button
                        onClick={() => printStudentResultSlipDirectly(selectedParentStudent)}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF7EE] hover:bg-red-50 text-red-900 border border-red-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{language === 'sw' ? 'Chapisha' : 'Print'}</span>
                      </button>

                      <button
                        onClick={() => setParentViewPdfMode(!parentViewPdfMode)}
                        className="px-3 py-1.5 rounded-xl bg-[#FFFDF8] border-2 border-red-400 text-red-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-red-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{parentViewPdfMode ? 'Orodha ya Kawaida' : 'Onyesha Hati Kamili (PDF)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: SUBJECT GRADES OR INLINE PDF VIEWER */}
                  {parentActiveTab === 'marks' && (
                    <div>
                      {parentViewPdfMode ? (
                        <InlineReportCardPdfViewer student={selectedParentStudent} />
                      ) : (
                        <div className="bg-[#FFFDF8] rounded-2xl border-2 border-red-200 overflow-hidden shadow-sm">
                          <div className="p-4 bg-[#F5EFEB] border-b border-red-200 flex items-center justify-between">
                            <h5 className="text-sm font-bold text-red-950 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-red-700" />
                              <span>{language === 'sw' ? 'Mchanganuo wa Alama na Madaraja kwa Kila Somo' : 'Subject Breakdown & Grade Allocation'}</span>
                            </h5>
                            <span className="text-xs text-red-900/70">
                              {selectedParentStudent.subjects.length} {language === 'sw' ? 'Masomo Yaliyotahiniwa' : 'Assessed Subjects'}
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#FAF7EE] text-red-900 uppercase text-[10px] font-bold border-b border-red-200">
                                <tr>
                                  <th className="py-3 px-4">Kodi / Somo</th>
                                  <th className="py-3 px-3 text-center">Alama (/100)</th>
                                  <th className="py-3 px-3 text-center">Daraja</th>
                                  <th className="py-3 px-3 text-center">Pointi</th>
                                  <th className="py-3 px-4">Maoni ya Mwalimu wa Somo</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-red-100 font-medium text-stone-900">
                                {selectedParentStudent.subjects.map((sub, idx) => (
                                  <tr key={idx} className="hover:bg-red-50/50 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="font-bold text-red-950">{sub.name}</div>
                                      <div className="text-[10px] text-red-900/60 font-mono">Code: {sub.code} • {sub.nameEn}</div>
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                      <span className="font-black text-red-700 text-sm">{sub.score}</span>
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                      <span className={`px-2.5 py-0.5 rounded-md border text-xs font-black ${getGradeBadge(sub.grade)}`}>
                                        {sub.grade}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-center font-mono font-bold text-red-950">
                                      {sub.points}
                                    </td>
                                    <td className="py-3 px-4 text-stone-700">
                                      {sub.remarks}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: CONDUCT & HEADMASTER REMARKS */}
                  {parentActiveTab === 'conduct' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-[#FFFDF8] border-2 border-red-200 space-y-3">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                          <ShieldCheck className="w-5 h-5" />
                          <span>{language === 'sw' ? 'Tathmini ya Maadili na Nidhamu' : 'Character & Moral Evaluation'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FAF7EE] border border-red-200">
                          <span className="text-[11px] text-red-800 block uppercase font-bold">{language === 'sw' ? 'Kiwango cha Tabia' : 'Conduct Rating'}</span>
                          <span className="text-base font-black text-red-700">{selectedParentStudent.conduct}</span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          Mwanafunzi anazingatia kanuni za shule ya Kikatoliki, amani, usafi, na ushirikiano mzuri na wanafunzi wenzake na walimu.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#FFFDF8] border-2 border-red-200 space-y-3">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                          <Award className="w-5 h-5" />
                          <span>{language === 'sw' ? 'Maoni ya Mkuu wa Shule & Taaluma' : 'Headmaster & Academic Remarks'}</span>
                        </div>
                        <blockquote className="p-3.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-xs text-stone-800 italic leading-relaxed">
                          "{selectedParentStudent.headmasterRemarks}"
                        </blockquote>
                        <div className="text-[11px] text-red-900/70 flex items-center justify-between">
                          <span>Br. Adolph Massawe (Mkuu wa Shule)</span>
                          <span>Tarehe: {selectedParentStudent.publishDate}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CONTACT TEACHERS VIA SMS */}
                  {parentActiveTab === 'teachers' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-[#FFFDF8] border-2 border-red-200">
                        <h5 className="text-sm font-bold text-red-950 mb-1">
                          {language === 'sw' ? 'Wasiliana na Walimu wa Mwanafunzi Wako' : 'Direct SMS to Subject Teachers'}
                        </h5>
                        <p className="text-xs text-stone-600">
                          {language === 'sw'
                            ? 'Bonyeza kitufe cha "Tuma SMS Moja kwa Moja" kufungua programu yako ya ujumbe na kutuma swali kwa mwalimu.'
                            : 'Click the direct SMS button to immediately compose an SMS to the teacher on your mobile device.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {teachers.map((tch) => (
                          <div key={tch.id} className="p-4 rounded-2xl bg-[#FFFDF8] border-2 border-red-200 flex flex-col justify-between space-y-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={tch.imageUrl}
                                alt={tch.name}
                                className="w-12 h-12 rounded-xl object-cover border-2 border-red-300"
                              />
                              <div>
                                <h6 className="text-xs font-bold text-red-950">{tch.name}</h6>
                                <p className="text-[10px] text-red-800 font-semibold">{tch.roleSw}</p>
                                <p className="text-[10px] text-stone-500">{tch.subjects.join(', ')}</p>
                              </div>
                            </div>

                            <a
                              href={`sms:${tch.phone.replace(/\s+/g, '')}?body=${encodeURIComponent(
                                `Habari ${tch.name}, mimi ni mzazi wa ${selectedParentStudent.studentName} (${selectedParentStudent.form}). Ningependa kufahamu maendeleo yake katika somo la ${tch.subjects[0] || 'Taaluma'}.`
                              )}`}
                              className="w-full py-2 px-3 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{language === 'sw' ? 'Tuma SMS kwa Mwalimu' : 'Send SMS to Teacher'}</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-stone-600 bg-[#FFFDF8] rounded-2xl border-2 border-red-200">
                  <p>{language === 'sw' ? 'Mwanafunzi hakupatikana. Tafadhali andika namba ya mtihani au jina hapo juu.' : 'No student found. Please type exam number or name above.'}</p>
                </div>
              )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ============================= 2. TEACHER ROLE ============================ */}
          {/* ========================================================================= */}
          {activeRole === 'teacher' && (
            <div className="space-y-6">
              {!isAuthenticated ? (
                /* Teacher World-Class Authentication View */
                <div className="py-2">
                  <WorldClassLoginView
                    activeRole="teacher"
                    onRoleChange={(role) => {
                      if (role === 'academic_master') {
                        setActiveRole('academic_master');
                      }
                    }}
                    availableTeachers={teachers}
                    onDirectTeacherLogin={handleTeacherDirectLogin}
                    onDirectAcademicLogin={handleAcademicDirectLogin}
                    onGoogleSignIn={handleTeacherGoogleSignIn}
                    isSigningIn={isTeacherGoogleSigningIn}
                    authError={teacherAuthError ? teacherEmailError : undefined}
                    currentUser={teacherGoogleUser}
                    onContinueToPortal={() => setIsAuthenticated(true)}
                    isModal={false}
                  />
                </div>
              ) : (
                /* Teacher Authenticated Workspace */
                <div className="space-y-6">
                  {/* Teacher Header Bar */}
                  <div className="bg-[#FFFDF8] p-4 sm:p-5 rounded-3xl border-2 border-red-200/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {selectedTeacher && (
                        <img
                          src={selectedTeacher.imageUrl}
                          alt={selectedTeacher.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-red-600 shadow-sm"
                        />
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-black text-red-950">{selectedTeacher?.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-[#FAF7EE] text-red-900 text-[10px] font-mono border border-red-200">
                            {teacherEmailInput || 'walimu@uomboni.sc.tz'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300 text-[10px] font-black uppercase tracking-wider">
                            {selectedTeacher?.department}
                          </span>
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 text-[10px] font-bold border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                            {language === 'sw' ? 'Mfumo wa Usakinishaji Upo Tayari' : 'Auto-Publish Active'}
                          </span>
                        </div>
                        <p className="text-xs text-red-800 font-semibold mt-0.5">
                          {selectedTeacher?.roleSw} • Masomo: {selectedTeacher?.subjects.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsTeacherChangePinOpen(true);
                          setCurrentPinInput('');
                          setNewPinInput('');
                          setConfirmPinInput('');
                          setPinChangeFeedback(null);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#FAF7EE] hover:bg-red-50 text-red-900 text-xs font-bold flex items-center gap-1.5 border border-red-300 transition-all cursor-pointer shadow-xs"
                        title={language === 'sw' ? 'Badili nambari yako ya siri ya mwalimu' : 'Change your confidential teacher PIN'}
                      >
                        <KeyRound className="w-3.5 h-3.5 text-red-700" />
                        <span>{language === 'sw' ? '🔑 Badili PIN' : '🔑 Change PIN'}</span>
                      </button>
                      {onOpenInstallApp && (
                        <button
                          onClick={onOpenInstallApp}
                          className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title={language === 'sw' ? 'Sakinisha App kwenye simu/kompyuta yako kwa upakiaji wa haraka' : 'Install app on phone/PC for instant access'}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? '📲 Sakinisha App' : '📲 Install App'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setIsAuthenticated(false)}
                        className="px-3.5 py-2 rounded-xl bg-[#FAF7EE] hover:bg-red-50 text-red-900 text-xs font-bold flex items-center gap-1.5 border border-red-300 transition-all cursor-pointer shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{language === 'sw' ? 'Toka (Logout)' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Secure Teacher PIN Change Modal (Inside Authenticated Session) */}
                  {isTeacherChangePinOpen && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFDF8] border-2 border-red-600 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between pb-3 border-b border-red-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-700 font-bold">
                            <KeyRound className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-red-950">
                              {language === 'sw' ? 'Badilisha Nambari Yako Binafsi ya Siri (PIN ya Mwalimu)' : 'Update Your Confidential Faculty PIN'}
                            </h5>
                            <p className="text-xs text-stone-600">
                              {language === 'sw'
                                ? `Mwalimu: ${selectedTeacher?.name} • PIN hii inalinda akaunti yako na masomo yako (${selectedTeacher?.subjects.join(', ')}).`
                                : `Teacher: ${selectedTeacher?.name} • Secures your account and assigned subjects.`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTeacherChangePinOpen(false)}
                          className="p-1.5 rounded-lg text-red-900 hover:bg-red-100 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-red-900 block mb-1">
                            {language === 'sw' ? 'PIN ya Sasa *' : 'Current PIN *'}
                          </label>
                          <input
                            type="password"
                            value={currentPinInput}
                            onChange={(e) => setCurrentPinInput(e.target.value)}
                            placeholder="Weka PIN ya sasa..."
                            className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-xs font-mono text-red-950 focus:outline-hidden focus:border-red-600"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-red-900 block mb-1">
                            {language === 'sw' ? 'PIN Mpya (Tarakimu 4+) *' : 'New PIN (4+ digits) *'}
                          </label>
                          <input
                            type="password"
                            value={newPinInput}
                            onChange={(e) => setNewPinInput(e.target.value)}
                            placeholder="PIN mpya..."
                            className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-xs font-mono text-red-950 focus:outline-hidden focus:border-red-600"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-red-900 block mb-1">
                            {language === 'sw' ? 'Rudia PIN Mpya *' : 'Confirm New PIN *'}
                          </label>
                          <input
                            type="password"
                            value={confirmPinInput}
                            onChange={(e) => setConfirmPinInput(e.target.value)}
                            placeholder="Rudia PIN mpya..."
                            className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-xs font-mono text-red-950 focus:outline-hidden focus:border-red-600"
                          />
                        </div>
                      </div>

                      {pinChangeFeedback && (
                        <div
                          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                            pinChangeFeedback.type === 'success'
                              ? 'bg-red-50 border border-red-300 text-red-900'
                              : 'bg-red-100 border border-red-400 text-red-950'
                          }`}
                        >
                          {pinChangeFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-red-700 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                          )}
                          <span>{pinChangeFeedback.message}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsTeacherChangePinOpen(false)}
                          className="px-4 py-2 rounded-xl bg-[#FAF7EE] hover:bg-red-50 text-red-900 border border-red-200 text-xs font-bold cursor-pointer"
                        >
                          {language === 'sw' ? 'Ghairi' : 'Cancel'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPinChangeFeedback(null);
                            if (!currentPinInput.trim()) {
                              setPinChangeFeedback({
                                type: 'error',
                                message: language === 'sw' ? 'Tafadhali weka PIN yako ya sasa.' : 'Please enter your current PIN.',
                              });
                              return;
                            }
                            if (!newPinInput.trim() || newPinInput.trim().length < 4) {
                              setPinChangeFeedback({
                                type: 'error',
                                message: language === 'sw' ? 'PIN mpya lazima iwe na angalau tarakimu 4.' : 'New PIN must be at least 4 digits.',
                              });
                              return;
                            }
                            if (newPinInput.trim() !== confirmPinInput.trim()) {
                              setPinChangeFeedback({
                                type: 'error',
                                message: language === 'sw' ? 'PIN mpya na marudio yake hazilingani.' : 'New PIN and confirmation do not match.',
                              });
                              return;
                            }
                            const res = changeTeacherPinWithVerification(
                              selectedTeacher?.id || '',
                              currentPinInput.trim(),
                              newPinInput.trim()
                            );
                            if (res.success) {
                              setPinChangeFeedback({
                                type: 'success',
                                message: language === 'sw' ? res.messageSw : res.message,
                              });
                              setTimeout(() => {
                                setIsTeacherChangePinOpen(false);
                                setPinChangeFeedback(null);
                              }, 2000);
                            } else {
                              setPinChangeFeedback({
                                type: 'error',
                                message: language === 'sw' ? res.messageSw : res.message,
                              });
                            }
                          }}
                          className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-black cursor-pointer shadow-md"
                        >
                          {language === 'sw' ? 'Hifadhi PIN Mpya' : 'Save New PIN'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Teacher Publishing Hub Navigation Tabs */}
                  <div className="flex flex-wrap items-center justify-start sm:justify-center gap-2 p-1.5 bg-[#FFFDF8] rounded-2xl border-2 border-red-200 shadow-xs">
                    <button
                      onClick={() => setTeacherActiveTab('subject_entry')}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        teacherActiveTab === 'subject_entry'
                          ? 'bg-red-700 text-[#FFFFF0] shadow-md font-black'
                          : 'text-red-950 hover:bg-red-50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{language === 'sw' ? '✍️ Ingiza Alama za Somo Lako Pekee' : '✍️ My Assigned Subject Marks'}</span>
                    </button>

                    <button
                      onClick={() => setTeacherActiveTab('master_grid')}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        teacherActiveTab === 'master_grid'
                          ? 'bg-red-700 text-[#FFFFF0] shadow-md font-black'
                          : 'text-red-950 hover:bg-red-50'
                      }`}
                    >
                      <Table className="w-4 h-4" />
                      <span>{language === 'sw' ? '📑 Daftari la Masomo Yote (Kuangalia)' : '📑 All-Subjects Matrix (View)'}</span>
                    </button>

                    <button
                      onClick={() => setTeacherActiveTab('single_add')}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        teacherActiveTab === 'single_add'
                          ? 'bg-red-700 text-[#FFFFF0] shadow-md font-black'
                          : 'text-red-950 hover:bg-red-50'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'sw' ? '➕ Ongeza Mwanafunzi (Somo Lako)' : '➕ Add Single Student (My Subject)'}</span>
                    </button>

                    <button
                      onClick={() => setTeacherActiveTab('broadcast')}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        teacherActiveTab === 'broadcast'
                          ? 'bg-red-700 text-[#FFFFF0] shadow-md font-black'
                          : 'text-red-950 hover:bg-red-50'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>{language === 'sw' ? '📢 Tangaza kwa Wazazi' : '📢 Parent Broadcast'}</span>
                    </button>
                  </div>

                  {/* SUCCESS RECEIPT / AUDIT BADGE */}
                  {lastPublishedAudit && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border-2 border-red-300 shadow-md space-y-3 animate-in fade-in zoom-in duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-red-700 text-[#FFFFF0] flex items-center justify-center font-black shadow-md">
                            <CheckCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-red-950 flex items-center gap-2">
                              <span>{language === 'sw' ? 'Matokeo Yamejisakinisha & Yamechapishwa Kikamilifu!' : 'Results Successfully Published Live!'}</span>
                              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-900 border border-red-300 text-[10px] font-bold">
                                Live on Portal
                              </span>
                            </h5>
                            <p className="text-xs text-stone-600">
                              {language === 'sw'
                                ? `Wanafunzi ${lastPublishedAudit.count} wamesakinishwa kwenye mfumo kwa ${lastPublishedAudit.examType} (${lastPublishedAudit.form}).`
                                : `${lastPublishedAudit.count} students live published for ${lastPublishedAudit.examType} (${lastPublishedAudit.form}).`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-stone-500 block font-mono">Muda wa Usakinishaji:</span>
                          <span className="text-xs font-black text-red-700 font-mono">{lastPublishedAudit.timestamp}</span>
                        </div>
                      </div>

                      {/* Division Statistics Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-center">
                          <span className="text-[10px] text-red-800 block font-bold">Division I</span>
                          <span className="text-base font-black text-red-700">{lastPublishedAudit.divisionStats['Division I'] || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-center">
                          <span className="text-[10px] text-red-800 block font-bold">Division II</span>
                          <span className="text-base font-black text-red-800">{lastPublishedAudit.divisionStats['Division II'] || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-center">
                          <span className="text-[10px] text-red-800 block font-bold">Division III</span>
                          <span className="text-base font-black text-red-900">{lastPublishedAudit.divisionStats['Division III'] || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-center">
                          <span className="text-[10px] text-red-800 block font-bold">Division IV</span>
                          <span className="text-base font-black text-red-950">{lastPublishedAudit.divisionStats['Division IV'] || 0}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-center">
                          <span className="text-[10px] text-red-800 block font-bold">Division 0</span>
                          <span className="text-base font-black text-stone-700">{lastPublishedAudit.divisionStats['Division 0'] || 0}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-stone-700">
                        <span className="flex items-center gap-1.5 text-red-800 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-red-700" />
                          <span>Wazazi na wanafunzi wanaweza kutafuta matokeo haya na kupakua Hati za PDF mara moja.</span>
                        </span>
                        <button
                          onClick={() => setTeacherActiveTab('broadcast')}
                          className="px-3 py-1 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Tuma Taarifa kwa Wazazi sasa →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 1: SINGLE SUBJECT MARK ENTRY GRADEBOOK (NECTA / CSSC WORKFLOW) */}
                  {/* ========================================================================= */}
                  {teacherActiveTab === 'subject_entry' && (
                    <AcademicSubjectEntryModule
                      mode="teacher"
                      currentTeacherName={selectedTeacher?.name || 'Mwl. Yohana Bahati (Mtaaluma)'}
                      assignedSubjects={selectedTeacher?.subjects || ['Chemistry', 'Biology', 'Physics']}
                      onOpenResultsPreview={() => {
                        setActiveRole('parent');
                        setParentViewMode('official_necta');
                      }}
                    />
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 3: ALL-SUBJECTS MASTER MATRIX (DAFTARI LA MASOMO YOTE) */}
                  {/* ========================================================================= */}
                  {teacherActiveTab === 'master_grid' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-[#FFFDF8] border-2 border-red-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div>
                          <h5 className="text-sm font-black text-stone-900 flex items-center gap-2">
                            <Table className="w-4 h-4 text-red-700" />
                            <span>{language === 'sw' ? 'Daftari Kamili la Masomo Yote (Master Marksheet Matrix)' : 'All-Subjects Master Matrix'}</span>
                          </h5>
                          <p className="text-xs text-stone-600 mt-0.5">
                            {language === 'sw'
                              ? `Mwalimu ${selectedTeacher?.name}: Masomo yako pekee ya kuingiza maksi ni: ${selectedTeacher?.subjects?.join(', ') || 'Somo Lako'}. Masomo mengine yanalindwa kwa usalama.`
                              : `Teacher ${selectedTeacher?.name}: Your assigned subjects are: ${selectedTeacher?.subjects?.join(', ')}. Other subjects are securely locked.`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => exportResultsToExcel(broadsheetResults, `UOMBONI_MASTER_MARKSHEET_${broadsheetForm}.xlsx`)}
                            className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{language === 'sw' ? 'Pakua Excel' : 'Export Excel'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Teacher assigned subject reminder badge */}
                      <div className="p-3 rounded-2xl bg-[#FAF7EE] border-2 border-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-red-900 font-medium">
                          <ShieldCheck className="w-4 h-4 text-red-700 shrink-0" />
                          <span>
                            {language === 'sw'
                              ? `Uthibitisho wa Ulinzi: Umeidhinishwa kuingiza alama kwa somo la ${selectedTeacher?.subjects?.join(', ') || 'Somo Lako'} pekee.`
                              : `Access Controlled: You may only input scores for your assigned subjects (${selectedTeacher?.subjects?.join(', ')}).`}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-red-700 text-[#FFFFF0] text-[10px] font-black uppercase tracking-wider self-start sm:self-center shadow-xs">
                          ★ Somo Lako Pekee
                        </span>
                      </div>

                      <div className="bg-[#FFFDF8] rounded-3xl border-2 border-red-200/80 overflow-hidden shadow-md">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7EE] text-stone-700 uppercase text-[10px] font-black border-b border-red-200">
                              <tr>
                                <th className="py-2.5 px-3">#</th>
                                <th className="py-2.5 px-3">Namba</th>
                                <th className="py-2.5 px-4 min-w-44">Jina la Mwanafunzi</th>
                                {STANDARD_SUBJECTS.map((sub) => (
                                  <th key={sub.code} className="py-2.5 px-2 text-center font-mono">
                                    {sub.name.substring(0, 4).toUpperCase()}
                                  </th>
                                ))}
                                <th className="py-2.5 px-3 text-center">Jumla</th>
                                <th className="py-2.5 px-3 text-center">Wastani</th>
                                <th className="py-2.5 px-3 text-center">Pointi</th>
                                <th className="py-2.5 px-3 text-center">Division</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100 font-medium text-stone-800">
                              {broadsheetResults.map((student, idx) => (
                                <tr key={`${student.id}-${student.examNumber || idx}-${idx}`} className="hover:bg-[#FAF7EE] transition-colors">
                                  <td className="py-2.5 px-3 text-stone-500 font-mono">{idx + 1}</td>
                                  <td className="py-2.5 px-3 font-mono text-red-800 font-bold">{student.examNumber}</td>
                                  <td className="py-2.5 px-4 font-bold text-stone-900">{student.studentName}</td>
                                  {STANDARD_SUBJECTS.map((sub) => {
                                    const match = student.subjects.find(
                                      (s) => s.code === sub.code || s.name.toLowerCase() === sub.name.toLowerCase()
                                    );
                                    return (
                                      <td key={sub.code} className="py-2.5 px-2 text-center font-mono text-stone-700">
                                        {match ? (
                                          <span className="font-bold">
                                            {match.score}
                                            <span className="text-[10px] text-red-700 ml-0.5">{match.grade}</span>
                                          </span>
                                        ) : (
                                          <span className="text-stone-400">-</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="py-2.5 px-3 text-center font-mono text-stone-700">{student.totalMarks}</td>
                                  <td className="py-2.5 px-3 text-center font-black text-red-700 font-mono">{student.averageMarks}%</td>
                                  <td className="py-2.5 px-3 text-center font-bold text-stone-900 font-mono">{student.points}</td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${getDivisionBadge(student.division)}`}>
                                      {student.division}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 4: SINGLE STUDENT QUICK POST FORM */}
                  {/* ========================================================================= */}
                  {teacherActiveTab === 'single_add' && (
                    <form onSubmit={handleTeacherSingleStudentPublish} className="space-y-5">
                      <div className="p-5 rounded-3xl bg-[#FFFDF8] border-2 border-red-200/80 shadow-md space-y-4">
                        <div className="pb-3 border-b border-red-100">
                          <h5 className="text-sm font-black text-stone-900 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-red-700" />
                            <span>{language === 'sw' ? 'Ongeza Matokeo ya Mwanafunzi Mmoja & Sakinisha Moja kwa Moja' : 'Quick Single Student Result Posting'}</span>
                          </h5>
                          <p className="text-xs text-stone-600 mt-0.5">
                            {language === 'sw'
                              ? 'Jaza taarifa za mwanafunzi na alama zake za masomo kisha bonyeza Sakinisha ili yatokee mtandaoni mara moja.'
                              : 'Fill student info and subject marks to instantly publish live to the portal.'}
                          </p>
                        </div>

                        {/* Quick Registered Student Selector */}
                        <div className="p-3 bg-[#FAF7EE] rounded-2xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-red-950">
                            <Users className="w-4 h-4 text-red-700 shrink-0" />
                            <span>{language === 'sw' ? 'Chagua Mwanafunzi Aliyesajiliwa (Orodha ya Shule):' : 'Pick Registered Student:'}</span>
                          </div>
                          <select
                            onChange={(e) => {
                              const found = students.find((s) => s.id === e.target.value || s.examNumber === e.target.value);
                              if (found) {
                                setTeacherSingleStudentDraft((p) => ({
                                  ...p,
                                  studentName: found.fullName,
                                  examNumber: found.examNumber,
                                  gender: (found.gender as any) || 'M',
                                  form: (found.form as any) || p.form,
                                  stream: (found.stream as any) || 'Science',
                                }));
                              }
                            }}
                            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-[#FFFDF8] border border-red-300 text-xs text-red-900 font-bold focus:outline-hidden focus:border-red-600 cursor-pointer"
                          >
                            <option value="">-- {language === 'sw' ? 'Chagua Mwanafunzi...' : 'Choose Student...'} --</option>
                            {students
                              .filter((s) => s.form === teacherSingleStudentDraft.form)
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.fullName} ({s.examNumber}) - {s.stream}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-stone-700 block mb-1">Jina Kamili la Mwanafunzi *</label>
                            <input
                              type="text"
                              required
                              placeholder="Jina kamili la mwanafunzi..."
                              value={teacherSingleStudentDraft.studentName}
                              onChange={(e) => setTeacherSingleStudentDraft((p) => ({ ...p, studentName: e.target.value }))}
                              className="w-full p-2.5 rounded-xl bg-[#FFFDF8] border border-red-300 text-xs text-stone-900 uppercase focus:outline-hidden focus:border-red-600 font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-stone-700 block mb-1">Namba ya Mtihani (Hiari)</label>
                            <input
                              type="text"
                              placeholder="S0486/0125/2025"
                              value={teacherSingleStudentDraft.examNumber}
                              onChange={(e) => setTeacherSingleStudentDraft((p) => ({ ...p, examNumber: e.target.value }))}
                              className="w-full p-2.5 rounded-xl bg-[#FFFDF8] border border-red-300 text-xs text-red-800 uppercase focus:outline-hidden focus:border-red-600 font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-stone-700 block mb-1">Kidato (Form)</label>
                            <select
                              value={teacherSingleStudentDraft.form}
                              onChange={(e) => setTeacherSingleStudentDraft((p) => ({ ...p, form: e.target.value as any }))}
                              className="w-full p-2.5 rounded-xl bg-[#FFFDF8] border border-red-300 text-xs text-stone-900 font-bold focus:outline-hidden focus:border-red-600 cursor-pointer"
                            >
                              <option value="Form 1">Form 1</option>
                              <option value="Form 2">Form 2</option>
                              <option value="Form 3">Form 3</option>
                              <option value="Form 4">Form 4</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-stone-700 block mb-1">Jinsia</label>
                            <select
                              value={teacherSingleStudentDraft.gender}
                              onChange={(e) => setTeacherSingleStudentDraft((p) => ({ ...p, gender: e.target.value as any }))}
                              className="w-full p-2.5 rounded-xl bg-[#FFFDF8] border border-red-300 text-xs text-stone-900 font-bold focus:outline-hidden focus:border-red-600 cursor-pointer"
                            >
                              <option value="M">Mvulana (Male - M)</option>
                              <option value="F">Msichana (Female - F)</option>
                            </select>
                          </div>
                        </div>

                        {/* Subject Marks Entry Grid - Filtered Strictly to Teacher's Assigned Subject(s) */}
                        <div className="pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-red-950 block">
                              {language === 'sw'
                                ? `Alama za Somo Lako Pekee (${selectedTeacher?.subjects.join(', ')}):`
                                : `Assigned Subject Mark Entry (${selectedTeacher?.subjects.join(', ')}):`}
                            </label>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold">
                              🔒 Somo Lako Pekee
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {STANDARD_SUBJECTS.filter((sub) => {
                              const assigned = selectedTeacher?.subjects || [];
                              return assigned.some(
                                (a) =>
                                  a.toLowerCase() === sub.name.toLowerCase() ||
                                  sub.name.toLowerCase().includes(a.toLowerCase()) ||
                                  a.toLowerCase().includes(sub.name.toLowerCase())
                              );
                            }).map((sub) => {
                              const score = teacherSingleStudentDraft.subjectScores[sub.code] ?? 70;
                              const { grade } = calculateGradeAndPoints(score);
                              return (
                                <div key={sub.code} className="p-3.5 rounded-2xl bg-[#FFFDF8] border-2 border-red-300 space-y-2 shadow-xs">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-black text-stone-900">{sub.name} ({sub.code})</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-700 text-[#FFFFF0] font-black">
                                      ★ Somo Lako
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={score}
                                      onChange={(e) => {
                                        const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                        setTeacherSingleStudentDraft((prev) => ({
                                          ...prev,
                                          subjectScores: {
                                            ...prev.subjectScores,
                                            [sub.code]: val,
                                          },
                                        }));
                                      }}
                                      className="flex-1 p-2 text-center font-black text-lg rounded-xl bg-[#FAF7EE] border border-red-300 text-red-800 focus:outline-hidden focus:border-red-600"
                                    />
                                    <span className={`px-2.5 py-1.5 rounded-xl text-xs font-black border ${getGradeBadge(grade)}`}>
                                      {grade}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-red-800 font-medium">
                                    ✓ Umeidhinishwa kuingiza alama za somo hili
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Subject Isolation Security Notice */}
                          <div className="mt-3 p-3 rounded-2xl bg-[#FAF7EE] border border-red-200 text-[11px] text-stone-700 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-red-700 shrink-0" />
                            <span>
                              {language === 'sw'
                                ? 'Ulinzi wa Masomo: Masomo yasiyokuhusu yamelindwa kikamilifu. Huwezi kuingiza wala kubadilisha alama za masomo ya walimu wenzako.'
                                : 'Subject Isolation Security: Subjects outside your faculty assignment are securely locked and cannot be edited by other teachers.'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-3 rounded-2xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] font-black text-xs sm:text-sm shadow-md transition-all hover:scale-102 flex items-center gap-2 cursor-pointer border border-red-800"
                          >
                            <CheckCheck className="w-5 h-5" />
                            <span>{language === 'sw' ? '🚀 SAKINISHA MWANAFUNZI HUYU MOJA KWA MOJA' : '🚀 PUBLISH STUDENT RESULTS LIVE'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 5: PARENT SMS / WHATSAPP BROADCAST ANNOUNCEMENT DESK */}
                  {/* ========================================================================= */}
                  {teacherActiveTab === 'broadcast' && (
                    <div className="space-y-5">
                      <div className="p-5 rounded-3xl bg-[#FFFDF8] border-2 border-red-200/80 shadow-md space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-red-700 text-[#FFFFF0] flex items-center justify-center font-black shadow-md">
                            <Send className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-stone-900">
                              {language === 'sw' ? 'Kitovu cha Kutangaza Matokeo kwa Wazazi (SMS / WhatsApp)' : 'Parent Notification & Broadcast Desk'}
                            </h5>
                            <p className="text-xs text-stone-600 mt-0.5">
                              {language === 'sw'
                                ? 'Wajulishe wazazi wote mara moja kuwa matokeo ya mitihani yamechapishwa mtandaoni.'
                                : 'Send instant WhatsApp or SMS announcements to notify parents that exam results are published.'}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-red-200 space-y-3">
                          <span className="text-[11px] font-bold text-red-800 block uppercase">
                            Ujumbe Rasmi wa Shule (Tayari Kutumwa):
                          </span>
                          <p className="text-xs text-stone-800 leading-relaxed font-mono bg-[#FFFDF8] p-3.5 rounded-xl border border-red-200">
                            "Shule ya Sekondari Uomboni (NECTA S0486) inapenda kuwataarifu wazazi wote kuwa matokeo ya {teacherSelectedExam} ({teacherSelectedForm}) yamechapishwa mtandaoni. Unaweza kuangalia matokeo na kupakua Hati Rasmi ya PDF ya mwanao kupitia tovuti yetu: https://uombonisec.ac.tz/results. Karibuni sana."
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <button
                              onClick={() => {
                                const text = `Shule ya Sekondari Uomboni (NECTA S0486) inapenda kuwataarifu wazazi wote kuwa matokeo ya ${teacherSelectedExam} (${teacherSelectedForm}) yamechapishwa mtandaoni. Unaweza kuangalia matokeo na kupakua Hati Rasmi ya PDF ya mwanao kupitia tovuti yetu: https://uombonisec.ac.tz/results. Karibuni sana.`;
                                navigator.clipboard?.writeText(text);
                                setCopiedBroadcastText(true);
                                setTimeout(() => setCopiedBroadcastText(false), 3000);
                              }}
                              className="px-4 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#FAF7EE] text-red-900 text-xs font-bold flex items-center gap-2 cursor-pointer border border-red-300"
                            >
                              <Share2 className="w-3.5 h-3.5 text-red-700" />
                              <span>{copiedBroadcastText ? '✅ Ujumbe Umenakiliwa!' : 'Nakili Ujumbe (Copy Text)'}</span>
                            </button>

                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(
                                `Shule ya Sekondari Uomboni (NECTA S0486) inapenda kuwataarifu wazazi wote kuwa matokeo ya ${teacherSelectedExam} (${teacherSelectedForm}) yamechapishwa mtandaoni. Unaweza kuangalia matokeo na kupakua Hati Rasmi ya PDF ya mwanao kupitia tovuti yetu: https://uombonisec.ac.tz/results. Karibuni sana.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Tuma kwenye WhatsApp Groups za Wazazi</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ======================= 3. ACADEMIC MASTER ROLE ========================= */}
          {/* ========================================================================= */}
          {activeRole === 'academic_master' && (
            <div className="space-y-6">
              {!isAuthenticated ? (
                /* Academic Master World-Class Authentication View */
                <div className="py-2">
                  <WorldClassLoginView
                    activeRole="academic_master"
                    onRoleChange={(role) => {
                      if (role === 'teacher') {
                        setActiveRole('teacher');
                      }
                    }}
                    availableTeachers={teachers}
                    onDirectTeacherLogin={handleTeacherDirectLogin}
                    onDirectAcademicLogin={handleAcademicDirectLogin}
                    onGoogleSignIn={handleAcademicGoogleSignIn}
                    isSigningIn={isAcademicGoogleSigningIn}
                    authError={academicAuthError ? academicEmailError : undefined}
                    currentUser={academicGoogleUser}
                    onContinueToPortal={() => setIsAuthenticated(true)}
                    isModal={false}
                  />
                </div>
              ) : (
                /* Academic Master Authenticated Workspace */
                <div className="space-y-6">
                  {/* Academic Master Controls Header */}
                  <div className="bg-[#FFFDF8] p-4 rounded-3xl border-2 border-red-200/80 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-stone-900">
                          {language === 'sw' ? 'Ofisi ya Mkuu wa Taaluma (Mwl. Yohana Bahati / Madam Adela Manyanga)' : 'Office of the Academic Masters (Mwl. Yohana Bahati & Madam Adela Manyanga)'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF7EE] text-red-900 text-[10px] font-mono border border-red-200">
                          {academicEmailInput || 'academic@uomboni.sc.tz'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-red-700 text-[#FFFFF0] text-[10px] font-black uppercase">
                          Exams Dean
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        {language === 'sw'
                          ? 'Usimamizi wa Mitihani ya NECTA, Mock, Midterms, na Ufunguzi wa Ripoti za Wanafunzi.'
                          : 'Comprehensive examination management, broadsheet exports, division engine, and published books.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {recomputeSuccess && (
                        <span className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-red-700" />
                          <span>Division zimehesabiwa upya!</span>
                        </span>
                      )}

                      <button
                        onClick={handleRecomputeAllDivisions}
                        className="px-3 py-2 rounded-xl bg-[#FAF7EE] hover:bg-red-50 text-red-900 border border-red-300 text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Kokotoa Upya Division & Nafasi za Darasa kulingana na masomo 7 bora ya NECTA"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-red-700" />
                        <span>{language === 'sw' ? 'Kokotoa Upya Division (Best 7)' : 'Auto-Compute Divisions'}</span>
                      </button>

                      <button
                        onClick={() => setIsAddResultModalOpen(true)}
                        className="px-3 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'sw' ? 'Ongeza Matokeo' : 'Add Result'}</span>
                      </button>

                      <button
                        onClick={() => setIsAuthenticated(false)}
                        className="px-3 py-2 rounded-xl bg-[#FAF7EE] hover:bg-red-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-red-200"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-700" />
                        <span>{language === 'sw' ? 'Toka' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Academic Master Subtabs */}
                  <div className="flex items-center gap-2 border-b-2 border-red-200 pb-2 overflow-x-auto">
                    <button
                      onClick={() => setAcademicActiveTab('teachers_admin')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        academicActiveTab === 'teachers_admin'
                          ? 'bg-red-700 text-[#FFFFF0] font-black shadow-md'
                          : 'text-stone-700 hover:text-red-900 hover:bg-[#FAF7EE]'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? '👨‍🏫 Usimamizi wa Walimu & Masomo' : 'Teacher Marks Admin'}</span>
                    </button>

                    <button
                      onClick={() => setAcademicActiveTab('necta_sheet')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        academicActiveTab === 'necta_sheet'
                          ? 'bg-red-700 text-[#FFFFF0] font-black shadow-md'
                          : 'text-stone-700 hover:text-red-900 hover:bg-[#FAF7EE]'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? '🏛️ Matokeo Rasmi NECTA / CSSC & Uchapishaji' : 'Official NECTA Results Sheet'}</span>
                    </button>

                    <button
                      onClick={() => setAcademicActiveTab('students_roster')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        academicActiveTab === 'students_roster'
                          ? 'bg-red-700 text-[#FFFFF0] font-black shadow-md'
                          : 'text-stone-700 hover:text-red-900 hover:bg-[#FAF7EE]'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? `📋 Daftari la Wanafunzi (${students.length})` : `📋 Student Register (${students.length})`}</span>
                    </button>

                    <button
                      onClick={() => setAcademicActiveTab('directives')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        academicActiveTab === 'directives'
                          ? 'bg-red-700 text-[#FFFFF0] font-black shadow-md'
                          : 'text-stone-700 hover:text-red-900 hover:bg-[#FAF7EE]'
                      }`}
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? '📢 Maelekezo & Ruhusa za Walimu' : '📢 Directives & Entry Permissions'}</span>
                    </button>

                    <button
                      onClick={() => setAcademicActiveTab('overview')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        academicActiveTab === 'overview'
                          ? 'bg-red-700 text-[#FFFFF0] font-black shadow-md'
                          : 'text-stone-700 hover:text-red-900 hover:bg-[#FAF7EE]'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Muhtasari wa Ufaulu' : 'Performance Overview'}</span>
                    </button>

                    <button
                      onClick={() => setAcademicActiveTab('broadsheet')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        academicActiveTab === 'broadsheet'
                          ? 'bg-red-700 text-[#FFFFF0] font-black shadow-md'
                          : 'text-stone-700 hover:text-red-900 hover:bg-[#FAF7EE]'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Broadsheet ya Darasa' : 'Class Broadsheet'}</span>
                    </button>

                    <button
                      onClick={() => setAcademicActiveTab('pdfBooks')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        academicActiveTab === 'pdfBooks'
                          ? 'bg-red-700 text-[#FFFFF0] font-black shadow-md'
                          : 'text-stone-700 hover:text-red-900 hover:bg-[#FAF7EE]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Vitabu vya Matokeo PDF' : 'Published Results Library'}</span>
                    </button>
                  </div>

                  {/* TAB 0: TEACHER MARKS ADMIN & WORKFLOW (ACADEMIC MASTER AS ADMIN) */}
                  {academicActiveTab === 'teachers_admin' && (
                    <AcademicSubjectEntryModule
                      mode="academic_master"
                      currentTeacherName={academicEmailInput || 'Mwl. Yohana Bahati / Madam Adela Manyanga (Taaluma)'}
                      onOpenResultsPreview={() => {
                        setAcademicActiveTab('necta_sheet');
                      }}
                    />
                  )}

                  {/* TAB 0B: NECTA / CSSC OFFICIAL BROADSHEET & PARENT ACCESS PUBLISHER */}
                  {academicActiveTab === 'necta_sheet' && (
                    <NectaResultsOfficialView isAcademicMasterView={true} />
                  )}

                  {/* TAB 0C: STUDENT ROSTER & NOMINAL ROLL FOR ACADEMIC MASTER */}
                  {academicActiveTab === 'students_roster' && (
                    <AcademicStudentRosterTab
                      onSelectStudentForMarks={(student) => {
                        setTeacherSelectedForm(student.form as any);
                        setAcademicActiveTab('teachers_admin');
                      }}
                      onViewStudentResults={(identifier) => {
                        const res = studentResults.find(
                          (r) =>
                            r.examNumber.toLowerCase() === identifier.toLowerCase() ||
                            (r.studentId && r.studentId.toLowerCase() === identifier.toLowerCase())
                        );
                        if (res) {
                          setActiveStudentResult(res);
                          setActiveRole('student');
                        }
                      }}
                    />
                  )}

                  {/* TAB 0D: DIRECTIVES & PERMISSION CONTROL FOR TEACHERS */}
                  {academicActiveTab === 'directives' && (
                    <AcademicDirectivesManagerTab language={language} />
                  )}

                  {/* TAB 1: ACADEMIC PERFORMANCE OVERVIEW */}
                  {academicActiveTab === 'overview' && (
                    <div className="space-y-4">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-4 rounded-2xl bg-[#FFFDF8] border-2 border-red-200/80 shadow-xs">
                          <span className="text-xs text-stone-600 uppercase font-bold block">{language === 'sw' ? 'Watahiniwa Wote' : 'Total Candidates'}</span>
                          <span className="text-2xl font-black text-stone-900 mt-1 block">{studentResults.length}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#FFFDF8] border-2 border-red-300 shadow-xs">
                          <span className="text-xs text-red-800 uppercase font-bold block">Division I</span>
                          <span className="text-2xl font-black text-red-700 mt-1 block">
                            {studentResults.filter(s => s.division === 'Division I').length}
                          </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#FFFDF8] border-2 border-red-200/80 shadow-xs">
                          <span className="text-xs text-red-900 uppercase font-bold block">Division II & III</span>
                          <span className="text-2xl font-black text-red-800 mt-1 block">
                            {studentResults.filter(s => s.division === 'Division II' || s.division === 'Division III').length}
                          </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#FFFDF8] border-2 border-red-200/80 shadow-xs">
                          <span className="text-xs text-stone-600 uppercase font-bold block">{language === 'sw' ? 'Wastani wa Shule' : 'School Average'}</span>
                          <span className="text-2xl font-black text-red-700 mt-1 block">
                            {(studentResults.reduce((acc, s) => acc + s.averageMarks, 0) / (studentResults.length || 1)).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Top Ranked Students Table */}
                      <div className="bg-[#FFFDF8] rounded-2xl border-2 border-red-200/80 p-4 space-y-3 shadow-md">
                        <h5 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-red-700" />
                          <span>{language === 'sw' ? 'Wanafunzi Wanaoongoza Kitaaluma (Top Performers)' : 'Top Academic Performers'}</span>
                        </h5>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7EE] text-stone-700 uppercase text-[10px] font-black border-b border-red-200">
                              <tr>
                                <th className="py-2 px-3">Nafasi</th>
                                <th className="py-2 px-4">Jina</th>
                                <th className="py-2 px-3">Kidato</th>
                                <th className="py-2 px-3">Wastani</th>
                                <th className="py-2 px-3">Division</th>
                                <th className="py-2 px-3">Pointi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100 font-medium text-stone-800">
                              {[...studentResults]
                                .sort((a, b) => b.averageMarks - a.averageMarks)
                                .slice(0, 5)
                                .map((s, idx) => (
                                  <tr key={s.id} className="hover:bg-[#FAF7EE]">
                                    <td className="py-2.5 px-3 font-mono font-bold text-red-800">#{idx + 1}</td>
                                    <td className="py-2.5 px-4 font-bold text-stone-900">{s.studentName}</td>
                                    <td className="py-2.5 px-3 text-stone-600">{s.form}</td>
                                    <td className="py-2.5 px-3 font-bold text-red-700">{s.averageMarks}%</td>
                                    <td className="py-2.5 px-3">
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getDivisionBadge(s.division)}`}>
                                        {s.division}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-stone-900">{s.points}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CLASS BROADSHEET TABLE */}
                  {academicActiveTab === 'broadsheet' && (
                    <div className="space-y-4">
                      {/* Broadsheet Filter & Export Bar */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FFFDF8] p-4 rounded-2xl border-2 border-red-200/80 shadow-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={broadsheetForm}
                            onChange={(e) => setBroadsheetForm(e.target.value)}
                            className="p-2 rounded-xl bg-[#FAF7EE] border border-red-300 text-xs text-stone-900 font-bold focus:outline-hidden focus:border-red-600 cursor-pointer"
                          >
                            <option value="ALL">Madarasa Yote (All Forms)</option>
                            <option value="Form 1">Kidato cha 1 (Form 1)</option>
                            <option value="Form 2">Kidato cha 2 (Form 2)</option>
                            <option value="Form 3">Kidato cha 3 (Form 3)</option>
                            <option value="Form 4">Kidato cha 4 (Form 4)</option>
                          </select>

                          <select
                            value={broadsheetExam}
                            onChange={(e) => setBroadsheetExam(e.target.value)}
                            className="p-2 rounded-xl bg-[#FAF7EE] border border-red-300 text-xs text-stone-900 font-bold focus:outline-hidden focus:border-red-600 cursor-pointer"
                          >
                            <option value="ALL">Mitihani Yote</option>
                            <option value="NECTA Mock 2025">NECTA Mock 2025</option>
                            <option value="Mid-Term Exam 2025">Mid-Term Exam 2025</option>
                            <option value="Annual Examination 2025">Annual Exam 2025</option>
                            <option value="Pre-NECTA 2025">Pre-NECTA 2025</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadClassBroadsheetPdf(broadsheetResults, `BROADSHEET YA MATOKEO - ${broadsheetForm}`)}
                            className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{language === 'sw' ? 'Pakua Broadsheet (PDF)' : 'Download PDF Broadsheet'}</span>
                          </button>

                          <button
                            onClick={() => exportResultsToExcel(broadsheetResults, `BROADSHEET_${broadsheetForm}_${Date.now()}.xlsx`)}
                            className="px-3 py-1.5 rounded-xl bg-[#FAF7EE] hover:bg-red-50 border border-red-300 text-red-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-red-700" />
                            <span>{language === 'sw' ? 'Hamisha Excel (.xlsx)' : 'Export Excel'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Broadsheet Grid */}
                      <div className="bg-[#FFFDF8] rounded-2xl border-2 border-red-200/80 overflow-hidden shadow-md">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7EE] text-stone-700 uppercase text-[10px] font-black border-b border-red-200">
                              <tr>
                                <th className="py-2.5 px-3">#</th>
                                <th className="py-2.5 px-3">Namba</th>
                                <th className="py-2.5 px-4">Jina</th>
                                <th className="py-2.5 px-2 text-center">CIV</th>
                                <th className="py-2.5 px-2 text-center">HIST</th>
                                <th className="py-2.5 px-2 text-center">GEO</th>
                                <th className="py-2.5 px-2 text-center">KISW</th>
                                <th className="py-2.5 px-2 text-center">ENG</th>
                                <th className="py-2.5 px-2 text-center">PHY</th>
                                <th className="py-2.5 px-2 text-center">CHEM</th>
                                <th className="py-2.5 px-2 text-center">BIO</th>
                                <th className="py-2.5 px-2 text-center">MATH</th>
                                <th className="py-2.5 px-2 text-center">REL</th>
                                <th className="py-2.5 px-2 text-center">Wastani</th>
                                <th className="py-2.5 px-2 text-center">Points</th>
                                <th className="py-2.5 px-3 text-center">Division</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100 font-medium text-stone-800">
                              {broadsheetResults.map((student, idx) => {
                                const getSubGrade = (code: string) => {
                                  const s = student.subjects.find(sub => sub.code === code || sub.name.toLowerCase().includes(code.toLowerCase()));
                                  return s ? s.grade : '-';
                                };

                                return (
                                  <tr key={`${student.id}-${student.examNumber || idx}-${idx}`} className="hover:bg-[#FAF7EE]">
                                    <td className="py-2 px-3 text-stone-500 font-mono">{idx + 1}</td>
                                    <td className="py-2 px-3 font-mono text-red-800 text-[11px] font-bold">{student.examNumber}</td>
                                    <td className="py-2 px-4 font-bold text-stone-900 whitespace-nowrap">{student.studentName}</td>
                                    <td className="py-2 px-2 text-center font-bold text-stone-700">{getSubGrade('011')}</td>
                                    <td className="py-2 px-2 text-center font-bold text-stone-700">{getSubGrade('012')}</td>
                                    <td className="py-2 px-2 text-center font-bold text-stone-700">{getSubGrade('013')}</td>
                                    <td className="py-2 px-2 text-center font-bold text-stone-700">{getSubGrade('021')}</td>
                                    <td className="py-2 px-2 text-center font-bold text-stone-700">{getSubGrade('022')}</td>
                                    <td className="py-2 px-2 text-center font-bold text-stone-700">{getSubGrade('031')}</td>
                                    <td className="py-2 px-2 text-center font-bold text-stone-700">{getSubGrade('032')}</td>
                                    <td className="py-2 px-2 text-center font-bold text-stone-700">{getSubGrade('033')}</td>
                                    <td className="py-2 px-2 text-center font-bold text-stone-700">{getSubGrade('041')}</td>
                                    <td className="py-2 px-2 text-center font-bold text-stone-700">{getSubGrade('071')}</td>
                                    <td className="py-2 px-2 text-center font-black text-red-700">{student.averageMarks}%</td>
                                    <td className="py-2 px-2 text-center font-mono font-bold text-stone-900">{student.points}</td>
                                    <td className="py-2 px-3 text-center">
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getDivisionBadge(student.division)}`}>
                                        {student.division}
                                      </span>
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

                  {/* TAB 3: PUBLISHED PDF RESULTS BOOKS */}
                  {academicActiveTab === 'pdfBooks' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-stone-900">
                          {language === 'sw' ? 'Maktaba ya Vitabu Rasmi vya Matokeo (NECTA & Mock PDF Documents)' : 'Published Results Documents'}
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resultsPdfDocuments.map((doc) => (
                          <div key={doc.id} className="p-4 rounded-2xl bg-[#FFFDF8] border-2 border-red-200/80 space-y-3 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 border border-red-200 flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <h6 className="text-xs font-bold text-stone-900">{doc.titleSw}</h6>
                                  <p className="text-[10px] text-stone-500">{doc.form} • {doc.year} • {doc.fileSize}</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-stone-700">{doc.descriptionSw}</p>
                            <div className="p-2 rounded-xl bg-[#FAF7EE] border border-red-200 text-[11px] text-red-900 font-mono">
                              {doc.divisionSummary}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ============================ 4. STUDENT ROLE ============================= */}
          {/* ========================================================================= */}
          {activeRole === 'student' && (
            <div className="space-y-6">
              {!isAuthenticated ? (
                /* Student Login Screen */
                <div className="max-w-md mx-auto p-6 rounded-3xl bg-[#FFFDF8] border-2 border-red-200/80 shadow-xl space-y-5">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-red-700 text-[#FFFFF0] flex items-center justify-center mx-auto font-black shadow-md">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900">
                      {language === 'sw' ? 'Portal ya Mwanafunzi' : 'Student Academic Login'}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {language === 'sw'
                        ? 'Weka Namba yako ya Mtihani au Namba ya Usajili kuangalia matokeo yako na kupakua Report Card.'
                        : 'Enter your Exam Number or Student ID to view your academic dashboard.'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        {language === 'sw' ? 'Namba ya Mtihani / Student ID:' : 'Exam Number / Student ID:'}
                      </label>
                      <input
                        type="text"
                        value={studentInputIdentifier}
                        onChange={(e) => {
                          setStudentInputIdentifier(e.target.value);
                          setStudentAuthError(false);
                        }}
                        placeholder="Mf. S0486/0001/2025 au Anna"
                        className="w-full p-2.5 rounded-xl bg-[#FAF7EE] border border-red-300 text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-red-600 font-mono"
                      />
                      {studentAuthError && (
                        <p className="text-xs text-red-700 mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? 'Namba haijapatikana. Jaribu "S0486/0001/2025" au "Anna"' : 'Student not found. Try "S0486/0001/2025" or "Anna"'}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleStudentLogin}
                      className="w-full py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{language === 'sw' ? 'Ingia Kwenye Portal' : 'Login to Portal'}</span>
                    </button>

                    <div className="pt-2 text-center">
                      <p className="text-[11px] text-stone-500">
                        {language === 'sw' ? 'Mfano wa Namba:' : 'Sample Exam No:'}{' '}
                        <span
                          className="font-mono text-red-800 font-bold cursor-pointer underline"
                          onClick={() => {
                            setStudentInputIdentifier('S0486/0001/2025');
                          }}
                        >
                          S0486/0001/2025
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Student Authenticated View */
                activeStudentResult && (
                  <div className="space-y-6">
                    <div className="bg-[#FFFDF8] p-5 rounded-3xl border-2 border-red-200/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-stone-900">{activeStudentResult.studentName}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${getDivisionBadge(activeStudentResult.division)}`}>
                            {activeStudentResult.division}
                          </span>
                        </div>
                        <p className="text-xs text-red-800 font-mono mt-1 font-bold">
                          {activeStudentResult.examNumber} • {activeStudentResult.form} ({activeStudentResult.stream})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadStudentResultSlipPdf(activeStudentResult)}
                          className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? 'Pakua Hati ya Matokeo (PDF)' : 'Download PDF Report'}</span>
                        </button>

                        <button
                          onClick={() => setIsAuthenticated(false)}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF7EE] hover:bg-red-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-red-200"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-700" />
                          <span>{language === 'sw' ? 'Toka' : 'Logout'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#FFFDF8] rounded-2xl border-2 border-red-200/80 overflow-hidden shadow-md">
                      <div className="p-4 bg-[#FAF7EE] border-b border-red-200">
                        <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                          {language === 'sw' ? 'Matokeo Yako ya Hivi Karibuni' : 'Your Academic Results'}
                        </h5>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FAF7EE] text-stone-700 uppercase text-[10px] font-black border-b border-red-200">
                            <tr>
                              <th className="py-2.5 px-4">Somo</th>
                              <th className="py-2.5 px-3 text-center">Alama</th>
                              <th className="py-2.5 px-3 text-center">Daraja</th>
                              <th className="py-2.5 px-3 text-center">Pointi</th>
                              <th className="py-2.5 px-4">Maoni</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-100 font-medium text-stone-800">
                            {activeStudentResult.subjects.map((sub, idx) => (
                              <tr key={idx} className="hover:bg-[#FAF7EE]">
                                <td className="py-3 px-4 font-bold text-stone-900">{sub.name}</td>
                                <td className="py-3 px-3 text-center font-black text-red-700">{sub.score}</td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-md border text-xs font-black ${getGradeBadge(sub.grade)}`}>
                                    {sub.grade}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-bold text-stone-900">{sub.points}</td>
                                <td className="py-3 px-4 text-stone-600">{sub.remarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="bg-[#FAF7EE] border-t-2 border-red-200 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-red-700" />
            <span>
              {language === 'sw'
                ? 'Mfumo Salama wa Kitaaluma • Uomboni Secondary School (S0486)'
                : 'Secure Role-Based Academic Engine • Uomboni Secondary School (S0486)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              {language === 'sw' ? 'Funga Portal' : 'Close Portal'}
            </button>
          </div>
        </div>
      </div>

      {/* ================= ADD STUDENT RESULT MODAL (FOR ACADEMIC MASTER) ================= */}
      {isAddResultModalOpen && (
        <div className="fixed inset-0 z-60 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFF0] border-2 border-red-300 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 text-stone-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b-2 border-red-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-700" />
                <span>{language === 'sw' ? 'Ongeza Matokeo ya Mwanafunzi Mpya' : 'Add New Student Result'}</span>
              </h3>
              <button
                onClick={() => setIsAddResultModalOpen(false)}
                className="text-stone-500 hover:text-red-700 p-1.5 rounded-xl bg-[#FAF7EE] hover:bg-red-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudentResult} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Jina Kamili la Mwanafunzi *</label>
                  <input
                    type="text"
                    required
                    value={newResultData.studentName}
                    onChange={(e) => setNewResultData({ ...newResultData, studentName: e.target.value })}
                    placeholder="Mf. JOHN PETER SWAI"
                    className="w-full p-2 rounded-xl bg-[#FFFDF8] border border-red-300 text-stone-900 font-bold focus:outline-hidden focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Namba ya Mtihani *</label>
                  <input
                    type="text"
                    required
                    value={newResultData.examNumber}
                    onChange={(e) => setNewResultData({ ...newResultData, examNumber: e.target.value })}
                    placeholder="Mf. S0486/0029/2025"
                    className="w-full p-2 rounded-xl bg-[#FFFDF8] border border-red-300 text-red-800 font-mono font-bold focus:outline-hidden focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Kidato</label>
                  <select
                    value={newResultData.form}
                    onChange={(e) => setNewResultData({ ...newResultData, form: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-[#FFFDF8] border border-red-300 text-stone-900 font-bold focus:outline-hidden focus:border-red-600 cursor-pointer"
                  >
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Aina ya Mtihani</label>
                  <select
                    value={newResultData.examType}
                    onChange={(e) => setNewResultData({ ...newResultData, examType: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-[#FFFDF8] border border-red-300 text-stone-900 font-bold focus:outline-hidden focus:border-red-600 cursor-pointer"
                  >
                    <option value="NECTA Mock 2025">NECTA Mock 2025</option>
                    <option value="Mid-Term Exam 2025">Mid-Term Exam 2025</option>
                    <option value="Annual Examination 2025">Annual Examination 2025</option>
                    <option value="Pre-NECTA 2025">Pre-NECTA 2025</option>
                  </select>
                </div>
              </div>

              {/* Subject Marks Grid */}
              <div className="pt-2">
                <label className="font-bold text-red-900 block mb-2">Alama za Masomo (0 - 100):</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {STANDARD_SUBJECTS.map((sub) => (
                    <div key={sub.code} className="p-2 rounded-xl bg-[#FFFDF8] border border-red-200">
                      <span className="text-[10px] font-bold text-stone-600 block truncate">{sub.name}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newResultData.subjectScores[sub.code] || 60}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setNewResultData({
                            ...newResultData,
                            subjectScores: {
                              ...newResultData.subjectScores,
                              [sub.code]: val,
                            },
                          });
                        }}
                        className="w-full p-1 text-center font-bold text-red-800 rounded bg-[#FAF7EE] border border-red-300 mt-1 focus:outline-hidden focus:border-red-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-red-200">
                <button
                  type="button"
                  onClick={() => setIsAddResultModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7EE] text-stone-700 hover:bg-red-50 border border-red-200 font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] font-black cursor-pointer shadow-md"
                >
                  Hifadhi Matokeo Sasa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
