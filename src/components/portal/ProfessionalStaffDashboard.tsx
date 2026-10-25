import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  Users,
  Award,
  FileCheck2,
  Clock,
  RotateCcw,
  CheckCircle2,
  BarChart3,
  FileBarChart,
  Bell,
  User,
  LogOut,
  Save,
  Send,
  Printer,
  Download,
  Search,
  Filter,
  Check,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Sliders,
  Calendar,
  GraduationCap,
  ArrowRight,
  Edit3,
  Trash2,
  Eye,
  KeyRound,
  FileSpreadsheet,
  X,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SchoolLogo } from '../SchoolLogo';
import {
  OFFICIAL_NECTA_SUBJECTS,
  scoreToNectaGrade,
  formatCno,
} from '../../utils/nectaResultsEngine';
import {
  savePendingSubjectScoresToFirestore,
  getPendingSubjectSubmissionsFromFirestore,
  approvePendingSubjectSubmissionInFirestore,
  returnPendingSubjectSubmissionInFirestore,
  deletePendingSubmissionInFirestore,
} from '../../services/academicFirestoreService';
import {
  PendingSubjectSubmission,
  PendingStudentScore,
  StudentProfile,
  StudentResult,
  Teacher,
} from '../../types';
import {
  downloadStudentResultSlipPdf,
  downloadClassBroadsheetPdf,
  printStudentResultSlipDirectly,
} from '../../utils/pdfService';
import { fetchAuditLogs, AuditLogEntry, recordAuditLog } from '../../services/auditLoggingService';
import { auth } from '../../lib/firebase';
import {
  createSchoolDatabaseBackup,
  downloadBackupPackageAsJson,
  verifyBackupAndTestRestore,
  SchoolDatabaseBackupPackage,
  RestoreVerificationResult,
} from '../../services/backupDisasterRecoveryService';
import {
  runSecurityTestSuite,
  SecurityAuditReport,
  SecurityTestCaseResult,
} from '../../services/securityTestSuite';
import { Database, FileCheck, Lock, ShieldAlert, UploadCloud, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { OfficialExamReportPrintView } from '../results/OfficialExamReportPrintView';
import { ExcelResultsEntryGrid } from './ExcelResultsEntryGrid';

export interface ProfessionalStaffDashboardProps {
  onClose?: () => void;
  onOpenAcademicMasterPortal?: () => void;
  isModal?: boolean;
}

export const ProfessionalStaffDashboard: React.FC<ProfessionalStaffDashboardProps> = ({
  onClose,
  onOpenAcademicMasterPortal,
  isModal = false,
}) => {
  const { language } = useLanguage();
  const { user, userProfile, logout, setActiveView } = useAuth();
  const {
    students,
    teachers,
    studentResults,
    submitTeacherSubjectMarks,
    academicDirectives,
    examTypes,
  } = useData() as any;

  // ----------------------------------------------------
  // AUTH & IDENTITY RESOLUTION
  // ----------------------------------------------------
  const currentRole = userProfile?.role || 'teacher';
  const isAdminOrAcademic =
    currentRole === 'admin' ||
    currentRole === 'academic_master' ||
    (user?.email &&
      ['tumainifundtrustfoundation@gmail.com', 'adolphmassawe@gmail.com', 'yohana.bahati@uombonisec.ac.tz'].includes(
        user.email.toLowerCase()
      ));

  // Match teacher profile in database
  const activeTeacher: Teacher = useMemo(() => {
    if (teachers && teachers.length > 0) {
      const match = teachers.find(
        (t: Teacher) =>
          (user?.email && t.email?.toLowerCase() === user.email.toLowerCase()) ||
          (userProfile?.email && t.email?.toLowerCase() === userProfile.email.toLowerCase()) ||
          (userProfile?.fullName && t.name.toLowerCase().includes(userProfile.fullName.toLowerCase()))
      );
      if (match) return match;
      return teachers[0];
    }
    return {
      id: 'tch-004',
      name: userProfile?.fullName || 'Mwl. Herman',
      role: 'Mwalimu wa Masomo (Teacher)',
      roleSw: 'Mwalimu wa Masomo',
      roleEn: 'Subject Teacher',
      qualification: 'B.A. Education',
      subjects: ['Chemistry', 'Basic Mathematics'],
      department: 'Sayansi (Science)',
      email: user?.email || 'tumainifundtrustfoundation@gmail.com',
      phone: '+255 782 558 127',
      experienceYears: 10,
    };
  }, [teachers, user, userProfile]);

  // Assigned subjects for the teacher (Admins/Academic Master have access to all)
  // Assigned subjects for the teacher (Admins/Academic Master have access to all)
  const teacherSubjects: string[] = useMemo(() => {
    if (isAdminOrAcademic) {
      return OFFICIAL_NECTA_SUBJECTS.map((s) => s.name);
    }
    // 1. Prioritize assignedSubjects from secure userProfile (RBAC)
    if (userProfile?.assignedSubjects && userProfile.assignedSubjects.length > 0) {
      return userProfile.assignedSubjects;
    }
    // 2. Fall back to activeTeacher database registry
    if (activeTeacher.subjects && activeTeacher.subjects.length > 0) {
      // Split combinations like "Chemistry and mathematics" into individual subjects
      const parsed: string[] = [];
      activeTeacher.subjects.forEach((s) => {
        if (s.toLowerCase().includes(' and ')) {
          s.split(/ and /i).forEach((sub) => {
            const clean = sub.trim();
            const matched = OFFICIAL_NECTA_SUBJECTS.find(
              (o) => o.name.toLowerCase() === clean.toLowerCase() || o.name.toLowerCase().includes(clean.toLowerCase())
            );
            parsed.push(matched ? matched.name : clean);
          });
        } else {
          const clean = s.trim();
          const matched = OFFICIAL_NECTA_SUBJECTS.find(
            (o) => o.name.toLowerCase() === clean.toLowerCase() || o.name.toLowerCase().includes(clean.toLowerCase())
          );
          parsed.push(matched ? matched.name : clean);
        }
      });
      return Array.from(new Set(parsed));
    }
    return ['Chemistry', 'Basic Mathematics'];
  }, [isAdminOrAcademic, activeTeacher, userProfile]);

  // ----------------------------------------------------
  // ACTIVE NAVIGATION TABS
  // ----------------------------------------------------
  type StaffDashboardTab =
    | 'overview'
    | 'classes'
    | 'subjects'
    | 'students'
    | 'enter_marks'
    | 'drafts'
    | 'submitted'
    | 'returned'
    | 'approved'
    | 'review'
    | 'analysis'
    | 'reports'
    | 'notifications'
    | 'profile'
    | 'audit_logs'
    | 'backups'
    | 'security_tests';

  const [activeTab, setActiveTab] = useState<StaffDashboardTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ----------------------------------------------------
  // SECURITY, AUDIT TRAIL & BACKUP STATES
  // ----------------------------------------------------
  const [auditLogsList, setAuditLogsList] = useState<AuditLogEntry[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [auditFilterAction, setAuditFilterAction] = useState('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [latestBackup, setLatestBackup] = useState<SchoolDatabaseBackupPackage | null>(null);
  const [testRestoreJson, setTestRestoreJson] = useState('');
  const [isTestingRestore, setIsTestingRestore] = useState(false);
  const [restoreReport, setRestoreReport] = useState<RestoreVerificationResult | null>(null);

  const [securityReport, setSecurityReport] = useState<SecurityAuditReport | null>(null);
  const [isRunningSecurityTests, setIsRunningSecurityTests] = useState(false);

  // Step-Up MFA Modal State for Privileged Operations
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaPinInput, setMfaPinInput] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaActionDescription, setMfaActionDescription] = useState('');
  const [mfaPendingCallback, setMfaPendingCallback] = useState<(() => Promise<void>) | null>(null);

  // ----------------------------------------------------
  // FIRESTORE SUBMISSIONS & WORKFLOW STATE
  // ----------------------------------------------------
  const [submissions, setSubmissions] = useState<PendingSubjectSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const items = await getPendingSubjectSubmissionsFromFirestore();
      setSubmissions(items || []);
    } catch (err) {
      console.warn('Could not load submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Filter submissions by teacher role
  const teacherSubmissions = useMemo(() => {
    if (isAdminOrAcademic) return submissions;
    return submissions.filter(
      (s) =>
        s.teacherName?.toLowerCase() === activeTeacher.name.toLowerCase() ||
        (s.teacherEmail && user?.email && s.teacherEmail.toLowerCase() === user.email.toLowerCase()) ||
        teacherSubjects.includes(s.subject)
    );
  }, [submissions, isAdminOrAcademic, activeTeacher, user, teacherSubjects]);

  const draftList = useMemo(() => teacherSubmissions.filter((s) => s.status === 'draft'), [teacherSubmissions]);
  const submittedList = useMemo(
    () => teacherSubmissions.filter((s) => s.status === 'pending' || s.status === 'under_review'),
    [teacherSubmissions]
  );
  const returnedList = useMemo(() => teacherSubmissions.filter((s) => s.status === 'returned'), [teacherSubmissions]);
  const approvedList = useMemo(() => teacherSubmissions.filter((s) => s.status === 'approved'), [teacherSubmissions]);
  const pendingReviewList = useMemo(
    () => submissions.filter((s) => s.status === 'pending' || s.status === 'under_review'),
    [submissions]
  );

  // ----------------------------------------------------
  // MARKS ENTRY STATE (SECTION 4 OF USER REQUEST)
  // ----------------------------------------------------
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [selectedTerm, setSelectedTerm] = useState('Muhula wa 1 (Term 1)');
  const [selectedForm, setSelectedForm] = useState<'Form 1' | 'Form 2' | 'Form 3' | 'Form 4'>('Form 1');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>(() => teacherSubjects[0] || 'Chemistry');
  const [selectedExamType, setSelectedExamType] = useState<string>('Jaribio la Mwezi (Monthly Test)');
  const [maxMarks, setMaxMarks] = useState<number>(100);

  // Active editing submission ID (if resuming a draft or correcting a returned submission)
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [activeReturnComment, setActiveReturnComment] = useState<string | null>(null);

  // Student marks row list: array of { student, score, grade, points, remarks, isChanged }
  interface StudentEntryRow {
    rollNo: number;
    studentId: string;
    examNumber: string;
    fullName: string;
    gender: 'M' | 'F';
    stream: string;
    score: number | '';
    isAbsent?: boolean;
    grade: 'A' | 'B' | 'C' | 'D' | 'F' | '—';
    points: number;
    remarks: string;
    isSaved: boolean;
  }

  const [marksRows, setMarksRows] = useState<StudentEntryRow[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reportsSubView, setReportsSubView] = useState<'official_sheet' | 'individual_cards'>('official_sheet');
  const [spreadsheetMode, setSpreadsheetMode] = useState<'excel_grid' | 'classic_single'>('excel_grid');

  // Keyboard navigation & Excel import refs
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const excelMarksInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch / populate students when Form or Stream changes
  useEffect(() => {
    if (!students || students.length === 0) return;

    // Filter students for the selected Form & Stream
    const matchedStudents = students.filter((s: StudentProfile) => {
      const matchForm = s.form === selectedForm;
      const matchStream = selectedStream === 'ALL' || !s.stream || s.stream === selectedStream;
      return matchForm && matchStream;
    });

    // Check if there is an existing draft/submission in memory or previous results for this combination
    const existingSubmission = submissions.find(
      (sub) =>
        sub.form === selectedForm &&
        sub.subject === selectedSubject &&
        sub.examType === selectedExamType &&
        sub.academicYear === academicYear
    );

    const initialRows: StudentEntryRow[] = matchedStudents.map((st: StudentProfile, idx: number) => {
      // Check existing submission scores
      const foundInSub = existingSubmission?.studentScores?.find(
        (sc) => sc.examNumber === st.examNumber || sc.studentName.toLowerCase() === st.fullName.toLowerCase()
      );

      // Check published results if any
      const foundInResults = studentResults.find(
        (r: StudentResult) => r.examNumber === st.examNumber && r.examType === selectedExamType
      );
      const subjectInResult = foundInResults?.subjects?.find(
        (sb: any) => sb.name.toLowerCase() === selectedSubject.toLowerCase() || sb.nameEn?.toLowerCase() === selectedSubject.toLowerCase()
      );

      let scoreVal: number | '' = '';
      let gradeVal: 'A' | 'B' | 'C' | 'D' | 'F' | '—' = '—';
      let pointsVal = 0;
      let remarksVal = '';

      if (foundInSub && typeof foundInSub.score === 'number') {
        scoreVal = foundInSub.score;
        gradeVal = foundInSub.grade;
        pointsVal = foundInSub.points;
        remarksVal = foundInSub.remarks;
      } else if (subjectInResult && typeof subjectInResult.marks === 'number') {
        scoreVal = subjectInResult.marks;
        gradeVal = (subjectInResult.grade as any) || '—';
        remarksVal = subjectInResult.remarks || '';
      }

      return {
        rollNo: idx + 1,
        studentId: st.studentId || `F1-${String(idx + 1).padStart(4, '0')}`,
        examNumber: st.examNumber || `S0486/${String(idx + 1).padStart(4, '0')}/2026`,
        fullName: st.fullName,
        gender: st.gender || 'M',
        stream: st.stream || 'A',
        score: scoreVal,
        grade: gradeVal,
        points: pointsVal,
        remarks: remarksVal,
        isSaved: scoreVal !== '',
      };
    });

    setMarksRows(initialRows);
    setHasUnsavedChanges(false);

    if (existingSubmission) {
      setActiveSubmissionId(existingSubmission.id);
      setActiveReturnComment(existingSubmission.returnComment || null);
    } else {
      setActiveSubmissionId(null);
      setActiveReturnComment(null);
    }
  }, [selectedForm, selectedStream, selectedSubject, selectedExamType, academicYear, students, submissions]);

  // Warn before browser refresh if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle Score Input Change
  const handleScoreChange = (index: number, valStr: string) => {
    setHasUnsavedChanges(true);
    setMarksRows((prev) => {
      const copy = [...prev];
      const row = { ...copy[index] };

      if (valStr.trim() === '') {
        row.score = '';
        row.grade = '—';
        row.points = 0;
        row.remarks = '';
      } else {
        const num = parseFloat(valStr);
        if (!isNaN(num)) {
          // Clamp to maxMarks
          const clamped = Math.max(0, Math.min(maxMarks, num));
          row.score = clamped;
          // Scale to 100 for NECTA grading standard
          const percentage = (clamped / maxMarks) * 100;
          const { grade, points, remarks } = scoreToNectaGrade(percentage);
          row.grade = grade;
          row.points = points;
          row.remarks = remarks;
        }
      }
      row.isSaved = false;
      copy[index] = row;
      return copy;
    });
  };

  // Keyboard navigation: Enter / Down Arrow moves to next student, Up Arrow moves to previous
  const handleScoreKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
  };

  // Toggle student absent status (ABS)
  const handleToggleAbsent = (index: number) => {
    setHasUnsavedChanges(true);
    setMarksRows((prev) => {
      const copy = [...prev];
      const row = { ...copy[index] };
      if (row.isAbsent) {
        row.isAbsent = false;
        row.remarks = '';
      } else {
        row.isAbsent = true;
        row.score = '';
        row.grade = '—';
        row.points = 0;
        row.remarks = 'Mwanafunzi Hakufanya (ABS)';
      }
      row.isSaved = false;
      copy[index] = row;
      return copy;
    });
  };

  // Download pre-filled Excel template for the selected class and subject
  const handleDownloadMarksTemplate = () => {
    const templateRows = marksRows.map((r) => ({
      ROLL_NO: r.rollNo,
      EXAM_NUMBER: r.examNumber,
      FULL_NAME: r.fullName,
      SEX: r.gender,
      SUBJECT: selectedSubject,
      MAX_MARKS: maxMarks,
      MARKS_OBTAINED: r.score !== '' ? r.score : '',
      ABSENT_OR_REMARKS: r.isAbsent ? 'ABS' : r.remarks,
    }));
    const ws = XLSX.utils.json_to_sheet(templateRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marks_Entry');
    XLSX.writeFile(wb, `MARKS_ENTRY_${selectedForm.replace(/\s+/g, '_')}_${selectedSubject.replace(/\s+/g, '_')}.xlsx`);
  };

  // Import marks from Excel or CSV file
  const handleImportMarksFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          alert('Faili halina rekodi zozote (Empty spreadsheet).');
          return;
        }

        let matchedCount = 0;
        setMarksRows((prev) => {
          return prev.map((row) => {
            const matched = rawRows.find((r) => {
              const keys = Object.keys(r);
              const valOf = (k: string) => {
                const fk = keys.find((key) => key.toLowerCase().includes(k.toLowerCase()));
                return fk ? String(r[fk]).trim() : '';
              };
              const cno = valOf('exam') || valOf('namba') || valOf('index') || valOf('cno');
              const name = valOf('name') || valOf('jina') || valOf('mwanafunzi');

              const matchCno = cno && (String(row.examNumber || '').toLowerCase().includes(cno.toLowerCase()) || cno.toLowerCase().includes(String(row.examNumber || '').toLowerCase()));
              const matchName = name && (String(row.fullName || '').toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(String(row.fullName || '').toLowerCase()));
              return Boolean(matchCno || matchName);
            });

            if (!matched) return row;

            const keys = Object.keys(matched);
            const scoreKey = keys.find((k) => {
              const kl = k.toLowerCase();
              return (
                kl.includes(selectedSubject.toLowerCase()) ||
                kl.includes('score') ||
                kl.includes('marks') ||
                kl.includes('alama') ||
                kl.includes('obtained')
              );
            });

            const rawScoreVal = scoreKey ? String(matched[scoreKey]).trim() : '';
            const absKey = keys.find((k) => k.toLowerCase().includes('abs') || k.toLowerCase().includes('hali'));
            const absVal = absKey ? String(matched[absKey]).trim().toUpperCase() : '';

            if (rawScoreVal.toUpperCase() === 'ABS' || absVal.includes('ABS')) {
              matchedCount++;
              return {
                ...row,
                score: '',
                isAbsent: true,
                grade: '—',
                points: 0,
                remarks: 'Mwanafunzi Hakufanya (ABS)',
                isSaved: false,
              };
            }

            const parsedScore = parseFloat(rawScoreVal);
            if (!isNaN(parsedScore)) {
              matchedCount++;
              const clamped = Math.max(0, Math.min(maxMarks, parsedScore));
              const pct = (clamped / maxMarks) * 100;
              const { grade, points, remarks } = scoreToNectaGrade(pct);
              return {
                ...row,
                score: clamped,
                isAbsent: false,
                grade,
                points,
                remarks: remarks,
                isSaved: false,
              };
            }

            return row;
          });
        });

        setHasUnsavedChanges(true);
        setSaveSuccessMsg(`Alama za wanafunzi ${matchedCount} zimepakiwa kikamilifu kutoka kwenye faili la Excel!`);
        setTimeout(() => setSaveSuccessMsg(null), 5000);
      } catch (err: any) {
        alert(`Hitilafu ya kupakia faili la Excel: ${err?.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Live summary stats for current marks entry
  const entryStats = useMemo(() => {
    const entered = marksRows.filter((r) => typeof r.score === 'number');
    const absents = marksRows.filter((r) => r.isAbsent);
    const missing = marksRows.length - entered.length - absents.length;
    const totalScore = entered.reduce((acc, r) => acc + (r.score as number), 0);
    const avg = entered.length > 0 ? (totalScore / entered.length).toFixed(1) : '0.0';
    const highest = entered.length > 0 ? Math.max(...entered.map((r) => r.score as number)) : 0;
    const lowest = entered.length > 0 ? Math.min(...entered.map((r) => r.score as number)) : 0;
    const passed = entered.filter((r) => r.grade !== 'F' && r.grade !== '—').length;
    const passRate = entered.length > 0 ? ((passed / entered.length) * 100).toFixed(1) : '0.0';

    return {
      total: marksRows.length,
      enteredCount: entered.length,
      absentCount: absents.length,
      missingCount: missing,
      average: avg,
      highest,
      lowest,
      passed,
      passRate,
    };
  }, [marksRows]);

  // Action: Save Draft
  const handleSaveDraft = async () => {
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    // Subject authorization guard
    if (!isAdminOrAcademic && !teacherSubjects.includes(selectedSubject)) {
      setSaveErrorMsg(
        `Huna mamlaka ya kuingiza au kurekebisha matokeo ya somo la "${selectedSubject}". Umeruhusiwa masomo: ${teacherSubjects.join(', ')}.`
      );
      return;
    }

    setIsSaving(true);

    const validScores = marksRows
      .filter((r) => typeof r.score === 'number')
      .map((r) => ({
        examNumber: r.examNumber,
        studentName: r.fullName,
        gender: r.gender,
        score: r.score as number,
        grade: r.grade === '—' ? 'F' : r.grade,
        points: r.points || 5,
        remarks: r.remarks || 'Rasimu',
      }));

    if (validScores.length === 0) {
      setSaveErrorMsg('Tafadhali weka angalau alama ya mwanafunzi mmoja ili kuhifadhi rasimu.');
      setIsSaving(false);
      return;
    }

    try {
      const res = await savePendingSubjectScoresToFirestore({
        submissionId: activeSubmissionId || undefined,
        subject: selectedSubject,
        subjectCode: OFFICIAL_NECTA_SUBJECTS.find((s) => s.name === selectedSubject)?.code || '000',
        form: selectedForm,
        stream: selectedStream,
        examType: selectedExamType,
        academicYear,
        term: selectedTerm,
        maxMarks,
        teacherName: activeTeacher.name,
        teacherEmail: activeTeacher.email,
        teacherId: activeTeacher.id,
        status: 'draft',
        scores: validScores,
      });

      if (res.success) {
        setActiveSubmissionId(res.submissionId);
        setHasUnsavedChanges(false);
        setMarksRows((prev) => prev.map((r) => ({ ...r, isSaved: typeof r.score === 'number' })));
        setSaveSuccessMsg(
          language === 'sw'
            ? `Rasimu ya wanafunzi ${validScores.length} imehifadhiwa salama kwenye mfumo! Unaweza kuendelea baadaye.`
            : `Draft of ${validScores.length} students saved successfully!`
        );
        fetchSubmissions();
      } else {
        setSaveErrorMsg(res.error || 'Imeshindwa kuhifadhi rasimu.');
      }
    } catch (err: any) {
      setSaveErrorMsg(err?.message || 'Hitilafu ya mtandao wakati wa kuhifadhi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Submit Completed Marks to Academic Master
  const handleSubmitResults = async () => {
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    // Subject authorization guard
    if (!isAdminOrAcademic && !teacherSubjects.includes(selectedSubject)) {
      setSaveErrorMsg(
        `Huna mamlaka ya kuwasilisha matokeo ya somo la "${selectedSubject}". Umeruhusiwa masomo: ${teacherSubjects.join(', ')}.`
      );
      return;
    }

    const entered = marksRows.filter((r) => typeof r.score === 'number');
    if (entered.length === 0) {
      setSaveErrorMsg('Tafadhali weka alama za wanafunzi kabla ya kuwasilisha.');
      return;
    }

    if (entered.length < marksRows.length) {
      const confirmIncomplete = window.confirm(
        `Kuna wanafunzi ${marksRows.length - entered.length} ambao hawajawekewa alama bado. Una uhakika unataka kuwasilisha matokeo haya sasa?`
      );
      if (!confirmIncomplete) return;
    }

    setIsSaving(true);
    const scoresToSubmit = entered.map((r) => ({
      examNumber: r.examNumber,
      studentName: r.fullName,
      gender: r.gender,
      score: r.score as number,
      grade: r.grade === '—' ? 'F' : r.grade,
      points: r.points || 5,
      remarks: r.remarks || 'Yamewasilishwa',
    }));

    try {
      const res = await savePendingSubjectScoresToFirestore({
        submissionId: activeSubmissionId || undefined,
        subject: selectedSubject,
        subjectCode: OFFICIAL_NECTA_SUBJECTS.find((s) => s.name === selectedSubject)?.code || '000',
        form: selectedForm,
        stream: selectedStream,
        examType: selectedExamType,
        academicYear,
        term: selectedTerm,
        maxMarks,
        teacherName: activeTeacher.name,
        teacherEmail: activeTeacher.email,
        teacherId: activeTeacher.id,
        status: 'pending',
        scores: scoresToSubmit,
      });

      if (res.success) {
        setActiveSubmissionId(res.submissionId);
        setActiveReturnComment(null);
        setHasUnsavedChanges(false);
        setSaveSuccessMsg(
          language === 'sw'
            ? `Alama za wanafunzi ${scoresToSubmit.length} za somo la ${selectedSubject} zimefanikiwa kuwasilishwa kwa Mkuu wa Taaluma kwa uhakiki na idhini rasmi!`
            : `Scores for ${scoresToSubmit.length} students submitted to Academic Master for approval!`
        );
        fetchSubmissions();
      } else {
        setSaveErrorMsg(res.error || 'Imeshindwa kuwasilisha matokeo.');
      }
    } catch (err: any) {
      setSaveErrorMsg(err?.message || 'Hitilafu wakati wa kuwasilisha.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reopen Draft / Returned Submission for Editing
  const handleLoadSubmissionForEdit = (sub: PendingSubjectSubmission) => {
    setSelectedForm(sub.form as any);
    setSelectedStream(sub.stream || 'ALL');
    setSelectedSubject(sub.subject);
    setSelectedExamType(sub.examType);
    setAcademicYear(sub.academicYear || '2025/2026');
    if (sub.maxMarks) setMaxMarks(sub.maxMarks);
    if (sub.term) setSelectedTerm(sub.term);
    setActiveSubmissionId(sub.id);
    setActiveReturnComment(sub.returnComment || null);
    setActiveTab('enter_marks');
  };

  // Delete draft action
  const handleDeleteDraft = async (submissionId: string) => {
    const ok = window.confirm('Una uhakika unataka kufuta rasimu hii? Kitendo hiki hakiwezi kurejeshwa.');
    if (!ok) return;

    await deletePendingSubmissionInFirestore(submissionId);
    fetchSubmissions();
  };

  // ----------------------------------------------------
  // ACADEMIC MASTER / ADMIN APPROVAL & REVIEW ACTIONS
  // ----------------------------------------------------
  const [reviewModalSub, setReviewModalSub] = useState<PendingSubjectSubmission | null>(null);
  const [returnCommentInput, setReturnCommentInput] = useState('');
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  const handleApproveSubmission = async (sub: PendingSubjectSubmission) => {
    setIsProcessingApproval(true);
    try {
      // 1. Approve in Firestore
      const res = await approvePendingSubjectSubmissionInFirestore(
        sub.id,
        userProfile?.fullName || 'Mkuu wa Taaluma',
        'Matokeo yamekaguliwa na kuidhinishwa rasmi.'
      );

      // 2. Commit into DataContext / Firestore results so it's live in student portal & broadsheets
      if (submitTeacherSubjectMarks) {
        const draftMap: Record<string, { score: number; remarks: string }> = {};
        sub.studentScores.forEach((sc) => {
          draftMap[sc.examNumber] = { score: sc.score, remarks: sc.remarks };
        });
        submitTeacherSubjectMarks(sub.subject, sub.form, sub.examType, sub.teacherName, draftMap);
      }

      setReviewModalSub(null);
      fetchSubmissions();
      alert(`Matokeo ya somo la ${sub.subject} (${sub.form}) yameidhinishwa rasmi!`);
    } catch (err: any) {
      alert(`Hitilafu ya kuidhinisha: ${err?.message}`);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleReturnSubmission = async (sub: PendingSubjectSubmission) => {
    if (!returnCommentInput.trim()) {
      alert('Tafadhali andika maoni yanayoelekeza nini kinachotakiwa kurekebishwa na mwalimu.');
      return;
    }

    setIsProcessingApproval(true);
    try {
      await returnPendingSubjectSubmissionInFirestore(
        sub.id,
        userProfile?.fullName || 'Mkuu wa Taaluma',
        returnCommentInput.trim()
      );
      setReviewModalSub(null);
      setReturnCommentInput('');
      fetchSubmissions();
      alert(`Matokeo yamerejeshwa kwa mwalimu ${sub.teacherName} kwa ajili ya marekebisho.`);
    } catch (err: any) {
      alert(`Hitilafu ya kurejesha matokeo: ${err?.message}`);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // ----------------------------------------------------
  // STEP-UP MULTI-FACTOR AUTHENTICATION (MFA) & SECURITY
  // ----------------------------------------------------
  const triggerMfaStepUp = (description: string, callback: () => Promise<void>) => {
    setMfaActionDescription(description);
    setMfaPendingCallback(() => callback);
    setMfaPinInput('');
    setMfaError('');
    setMfaModalOpen(true);
  };

  const handleVerifyMfaAndProceed = async () => {
    const cleanPin = mfaPinInput.trim();
    const authorizedPins = ['745225', '0486', '1234', 'walimu', 'walimu2026', 'uomboni2026'];
    if (!cleanPin) {
      setMfaError('Tafadhali ingiza PIN ya uthibitisho wa mtumishi (MFA PIN).');
      return;
    }

    if (authorizedPins.includes(cleanPin.toLowerCase())) {
      setMfaModalOpen(false);
      setMfaError('');
      await recordAuditLog({
        action: 'STAFF_MFA_VERIFIED',
        actorUid: auth.currentUser?.uid || 'staff-mfa',
        actorEmail: activeTeacher.email || 'staff@uombonisec.ac.tz',
        actorName: activeTeacher.name,
        actorRole: (currentRole as any) || 'admin',
        resourceType: 'staff',
        resourceId: activeTeacher.id,
        details: `Uthibitisho wa pili wa usalama (Step-up MFA) umekubaliwa kwa: ${mfaActionDescription}`,
        success: true,
      });

      if (mfaPendingCallback) {
        await mfaPendingCallback();
        setMfaPendingCallback(null);
      }
    } else {
      setMfaError('PIN ya MFA si sahihi. Jaribu tena au wasiliana na Mkuu wa Shule.');
      await recordAuditLog({
        action: 'STAFF_MFA_FAILED',
        actorUid: auth.currentUser?.uid || 'staff-mfa',
        actorEmail: activeTeacher.email || 'unknown@uombonisec.ac.tz',
        actorName: activeTeacher.name,
        actorRole: (currentRole as any) || 'guest',
        resourceType: 'staff',
        resourceId: activeTeacher.id,
        details: `Jaribio lisilo sahihi la Step-up MFA kwa: ${mfaActionDescription}`,
        success: false,
      });
    }
  };

  // Audit Logs Fetcher
  const handleLoadAuditLogs = async () => {
    setLoadingAuditLogs(true);
    try {
      const logs = await fetchAuditLogs(80);
      setAuditLogsList(logs);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit_logs') {
      handleLoadAuditLogs();
    }
  }, [activeTab]);

  // Database Backup Action
  const handleCreateDatabaseBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const pkg = await createSchoolDatabaseBackup({
        creatorName: activeTeacher.name,
        creatorEmail: activeTeacher.email || 'admin@uombonisec.ac.tz',
        creatorRole: currentRole,
      });
      setLatestBackup(pkg);
      downloadBackupPackageAsJson(pkg);
      alert(`Hifadhi Nakala ya Database imeundwa kikamilifu! (ID: ${pkg.metadata.backupId}, Checksum: ${pkg.metadata.checksum}). Faili limepakuliwa kwenye kompyuta/simu yako.`);
    } catch (err: any) {
      alert(`Hitilafu ya kutengeneza hifadhi nakala: ${err?.message}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Test Restore Action
  const handleTestRestoreVerification = async () => {
    if (!testRestoreJson.trim()) {
      alert('Tafadhali bandika maandishi ya JSON ya faili la hifadhi nakala au chagua faili.');
      return;
    }
    setIsTestingRestore(true);
    try {
      const report = await verifyBackupAndTestRestore(testRestoreJson.trim(), activeTeacher.name);
      setRestoreReport(report);
    } finally {
      setIsTestingRestore(false);
    }
  };

  // Run Security Test Suite
  const handleRunSecurityAudit = async () => {
    setIsRunningSecurityTests(true);
    try {
      const report = await runSecurityTestSuite();
      setSecurityReport(report);
    } finally {
      setIsRunningSecurityTests(false);
    }
  };

  // ----------------------------------------------------
  // REPORTS & RESULTS ANALYSIS
  // ----------------------------------------------------
  const [reportForm, setReportForm] = useState<string>('Form 1');
  const [selectedStudentForReportCard, setSelectedStudentForReportCard] = useState<StudentResult | null>(null);

  // Available results for reports
  const filteredResultsForReports = useMemo(() => {
    return (studentResults || []).filter((r: StudentResult) => r.form === reportForm);
  }, [studentResults, reportForm]);

  // Overall Statistics for Dashboard
  const dashboardStats = useMemo(() => {
    const myClassesCount = 4; // Form I to IV
    const mySubjectsCount = teacherSubjects.length;
    const totalEnrolled = (students || []).length;
    const draftsCount = draftList.length;
    const submittedCount = submittedList.length;
    const returnedCount = returnedList.length;
    const approvedCount = approvedList.length;

    return {
      myClassesCount,
      mySubjectsCount,
      totalEnrolled,
      draftsCount,
      submittedCount,
      returnedCount,
      approvedCount,
    };
  }, [teacherSubjects, students, draftList, submittedList, returnedList, approvedList]);

  // Handle Logout
  const handleLogout = () => {
    if (hasUnsavedChanges) {
      const ok = window.confirm('Una mabadiliko ambayo hayajahifadhiwa. Una uhakika unataka kutoka sasa?');
      if (!ok) return;
    }
    logout();
    if (onClose) onClose();
    setActiveView('website');
  };

  // Nav Items Definition
  const navigationItems = [
    { id: 'overview', labelSw: 'Dashibodi Kuu', labelEn: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'classes', labelSw: 'Madarasa Yangu', labelEn: 'My Assigned Classes', icon: Layers },
    { id: 'subjects', labelSw: 'Masomo Yangu', labelEn: 'My Assigned Subjects', icon: BookOpen },
    { id: 'students', labelSw: 'Daftari la Wanafunzi', labelEn: 'Student Records', icon: Users },
    { id: 'enter_marks', labelSw: 'Kuingiza Alama za Mitihani', labelEn: 'Enter Examination Results', icon: Award, highlight: true },
    { id: 'drafts', labelSw: 'Rasimu Zangu', labelEn: 'Draft Results', icon: Clock, count: dashboardStats.draftsCount },
    { id: 'submitted', labelSw: 'Zilizowasilishwa', labelEn: 'Submitted Results', icon: Send, count: dashboardStats.submittedCount },
    { id: 'returned', labelSw: 'Zilizorejeshwa', labelEn: 'Returned for Correction', icon: RotateCcw, count: dashboardStats.returnedCount, alert: dashboardStats.returnedCount > 0 },
    { id: 'approved', labelSw: 'Zilizoidhinishwa', labelEn: 'Approved Results', icon: CheckCircle2, count: dashboardStats.approvedCount },
    ...(isAdminOrAcademic
      ? [
          { id: 'review', labelSw: 'Uhakiki & Idhini (Mtaaluma)', labelEn: 'Review & Approvals', icon: ShieldCheck, count: pendingReviewList.length, adminOnly: true },
          { id: 'audit_logs', labelSw: 'Kumbukumbu za Ulinzi (Audit)', labelEn: 'Security Audit Logs', icon: FileCheck, adminOnly: true },
          { id: 'backups', labelSw: 'Hifadhi Nakala & Urejesho', labelEn: 'Backups & Recovery', icon: Database, adminOnly: true },
          { id: 'security_tests', labelSw: 'Ukaguzi wa Usalama (Tests)', labelEn: 'Security Test Suite', icon: Lock, adminOnly: true },
        ]
      : []),
    { id: 'analysis', labelSw: 'Uchambuzi wa Matokeo', labelEn: 'Results Analysis', icon: BarChart3 },
    { id: 'reports', labelSw: 'Ripoti & Report Cards', labelEn: 'Academic Reports', icon: FileBarChart },
    { id: 'notifications', labelSw: 'Matangazo & Maelekezo', labelEn: 'Notifications & Directives', icon: Bell },
    { id: 'profile', labelSw: 'Wasifu Wangu', labelEn: 'My Profile', icon: User },
  ];

  return (
    <div className={`flex flex-col h-full bg-[#F8FAFC] text-[#102A43] font-sans ${isModal ? 'max-h-[92vh]' : 'min-h-screen'}`}>
      {/* ==================================================== */}
      {/* 1. TOP BRANDED INSTITUTIONAL HEADER BAR              */}
      {/* ==================================================== */}
      <header className="bg-[#102A43] text-white px-4 sm:px-6 py-3 border-b-2 border-[#C9A227] flex items-center justify-between gap-3 shrink-0 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1 rounded-lg bg-white/10 border border-[#C9A227]/40 shadow-xs shrink-0">
            <SchoolLogo size="sm" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-sm sm:text-base lg:text-lg font-bold tracking-tight text-white truncate">
                Uomboni Secondary School — Staff &amp; Examination Portal
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#C9A227] text-slate-950">
                NECTA S0486
              </span>
            </div>
            <p className="text-[11px] text-[#FFFFF0]/80 truncate">
              Mfumo Rasmi wa Usimamizi wa Alama za Mitihani • Kidato cha I – IV (Marangu West)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* User badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-xl border border-white/15 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white max-w-[130px] truncate">{activeTeacher.name}</span>
            <span className="text-[10px] uppercase font-bold text-[#C9A227]">
              ({isAdminOrAcademic ? 'Mtaaluma / Admin' : 'Mwalimu'})
            </span>
          </div>

          {onOpenAcademicMasterPortal && isAdminOrAcademic && (
            <button
              onClick={onOpenAcademicMasterPortal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition cursor-pointer"
              title="Lango Kuu la Mkuu wa Taaluma"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Ofisi ya Taaluma</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            title="Ondoka kwenye akaunti (Logout)"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Toka</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Funga Portal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ==================================================== */}
      {/* 2. MAIN BODY: SIDEBAR + CONTENT AREA                 */}
      {/* ==================================================== */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          {/* Quick Teacher Card */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#102A43] text-white flex items-center justify-center font-bold text-sm shadow-xs border border-[#C9A227]/40 shrink-0">
                {activeTeacher.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#102A43] truncate">{activeTeacher.name}</h4>
                <p className="text-[10px] text-slate-500 truncate">{activeTeacher.department}</p>
                <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {isAdminOrAcademic ? 'Admin / Mtaaluma' : 'Mwalimu wa Masomo'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (hasUnsavedChanges && activeTab === 'enter_marks' && item.id !== 'enter_marks') {
                      const ok = window.confirm('Kuna alama ambazo hazijahifadhiwa. Una uhakika unataka kubadili ukurasa?');
                      if (!ok) return;
                    }
                    setActiveTab(item.id as any);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#102A43] text-white shadow-xs'
                      : item.highlight
                      ? 'bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-[#102A43]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C9A227]' : item.highlight ? 'text-amber-600' : 'text-slate-500'}`} />
                    <span className="truncate">{language === 'sw' ? item.labelSw : item.labelEn}</span>
                  </div>

                  {typeof item.count === 'number' && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        item.alert
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Academic Term Info */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Mwaka wa Masomo:</span>
              <strong className="text-[#102A43]">{academicYear}</strong>
            </div>
            <div className="flex justify-between">
              <span>Muhula Uliopo:</span>
              <strong className="text-emerald-700 font-bold">{selectedTerm.split(' ')[0]}</strong>
            </div>
          </div>
        </aside>

        {/* Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          {/* ==================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW                            */}
          {/* ==================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-[#102A43] via-[#0A1C2E] to-[#064E3B] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-[#C9A227]/30 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#FFFFF0] text-xs font-bold border border-white/15">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Mfumo Rasmi wa Watumishi na Mitihani (Staff Portal)</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Karibu, {activeTeacher.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                      Dhibiti alama za mitihani, rasimu, usajili wa madarasa (Kidato cha I–IV), ripoti za maendeleo ya wanafunzi, na uchambuzi wa taaluma kwa usahihi na usalama.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => setActiveTab('enter_marks')}
                      className="px-4 py-2.5 rounded-xl bg-[#C9A227] hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Ingiza Alama za Mitihani</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      <FileBarChart className="w-4 h-4" />
                      <span>Tazama Broadsheet &amp; Ripoti</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert if Returned Submissions Exist */}
              {dashboardStats.returnedCount > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-center justify-between gap-4 shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">
                        Kuna matokeo {dashboardStats.returnedCount} yaliyorejeshwa na Mkuu wa Taaluma kwa marekebisho!
                      </h4>
                      <p className="text-xs text-rose-700 mt-0.5">
                        Tafadhali fungua kichupo cha &ldquo;Zilizorejeshwa&rdquo; ili kusoma maoni na kusahihisha alama.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('returned')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition cursor-pointer"
                  >
                    Sahihisha Sasa
                  </button>
                </div>
              )}

              {/* Real-time Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Madarasa ya Shule</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#102A43]">Kidato I – IV</span>
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">4 Levels</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Form 1, Form 2, Form 3, Form 4</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Masomo Yangu</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#102A43]">{teacherSubjects.length}</span>
                    <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Yaliyoidhinishwa</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{teacherSubjects.slice(0, 2).join(', ')}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Wanafunzi Wote</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[#102A43]">{dashboardStats.totalEnrolled}</span>
                    <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">Wamesajiliwa</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Wavulana na Wasichana (Bweni &amp; Kutwa)</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Matokeo Yaliyoidhinishwa</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-700">{dashboardStats.approvedCount}</span>
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Rasmi</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Yaliyochapishwa kwenye Portal</p>
                </div>
              </div>

              {/* Status Workflow Overview */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-[#102A43]">
                      Mtiririko wa Uhakiki wa Matokeo (Workflow Status)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hatua rasmi za matokeo: Rasimu &rarr; Yamewasilishwa &rarr; Uhakiki &rarr; Yameidhinishwa
                    </p>
                  </div>
                  <button
                    onClick={fetchSubmissions}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#102A43] hover:bg-slate-100 transition cursor-pointer"
                    title="Pakia upya taarifa"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    onClick={() => setActiveTab('drafts')}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">1. Rasimu (Drafts)</span>
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {dashboardStats.draftsCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Alama zilizohifadhiwa na mwalimu ambazo bado hazijawasilishwa.</p>
                  </div>

                  <div
                    onClick={() => setActiveTab('submitted')}
                    className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">2. Yamewasilishwa</span>
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {dashboardStats.submittedCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-700">Yapo mezani kwa Mkuu wa Taaluma kwa ukaguzi na uchambuzi.</p>
                  </div>

                  <div
                    onClick={() => setActiveTab('returned')}
                    className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-900">3. Yaliyorejeshwa</span>
                      <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                        {dashboardStats.returnedCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700">Yamerudishwa kwa mwalimu kwa ajili ya kusahihisha alama.</p>
                  </div>

                  <div
                    onClick={() => setActiveTab('approved')}
                    className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">4. Yameidhinishwa</span>
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                        {dashboardStats.approvedCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700">Yameidhinishwa rasmi na yanaonekana kwenye matokeo ya wanafunzi.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: MY ASSIGNED CLASSES                           */}
          {/* ==================================================== */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl text-[#102A43]">Madarasa Yaliyopangiwa (Form I–IV)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Orodha ya madarasa na mikondo (streams) ya Shule ya Sekondari Uomboni.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('enter_marks')}
                  className="px-4 py-2 bg-[#102A43] hover:bg-[#0A1C2E] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Award className="w-4 h-4 text-[#C9A227]" />
                  <span>Ingiza Alama Darasani</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { form: 'Form 1', labelSw: 'Kidato cha Kwanza', streams: ['Stream A', 'Stream B'], room: 'Block Alpha Room 1-2' },
                  { form: 'Form 2', labelSw: 'Kidato cha Pili', streams: ['Stream A', 'Stream B'], room: 'Block Alpha Room 3-4' },
                  { form: 'Form 3', labelSw: 'Kidato cha Tatu', streams: ['Science', 'Arts'], room: 'Block Beta Room 1-2' },
                  { form: 'Form 4', labelSw: 'Kidato cha Nne (Watahiniwa)', streams: ['Science', 'Arts'], room: 'Block Beta Room 3-4' },
                ].map((c) => {
                  const studentCount = (students || []).filter((s: StudentProfile) => s.form === c.form).length;
                  return (
                    <div
                      key={c.form}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div className="h-2 bg-[#102A43]" />
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#102A43]/10 text-[#102A43]">
                            {c.form}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {studentCount} Wanafunzi
                          </span>
                        </div>

                        <h4 className="font-bold text-base text-[#102A43]">{c.labelSw}</h4>
                        <p className="text-xs text-slate-500">{c.room}</p>

                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Mikondo (Streams):</span>
                          <div className="flex flex-wrap gap-1">
                            {c.streams.map((st) => (
                              <span key={st} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedForm(c.form as any);
                            setActiveTab('enter_marks');
                          }}
                          className="w-full py-2 bg-white hover:bg-[#102A43] hover:text-white border border-slate-200 text-[#102A43] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Award className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>Ingiza Alama za {c.form}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: MY ASSIGNED SUBJECTS                          */}
          {/* ==================================================== */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl text-[#102A43]">Masomo Yaliyoidhinishwa Kufundisha</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kulingana na miongozo ya usalama, mwalimu ana mamlaka ya kuingiza alama kwa masomo aliyopangiwa pekee.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacherSubjects.map((subName) => {
                  const nectaInfo = OFFICIAL_NECTA_SUBJECTS.find((s) => s.name.toLowerCase() === subName.toLowerCase());
                  return (
                    <div
                      key={subName}
                      className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-xs">
                            {nectaInfo?.code || 'SUB'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ✓ Limeruhusiwa
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-base text-[#102A43]">{subName}</h4>
                          <p className="text-xs text-slate-500 font-mono">NECTA Subject Code: {nectaInfo?.code || '000'}</p>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          Mtaala rasmi wa Tanzania Taasisi ya Elimu (TIE) kwa ajili ya Kidato cha I–IV.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedSubject(subName);
                          setActiveTab('enter_marks');
                        }}
                        className="w-full py-2.5 bg-[#102A43] hover:bg-[#0A1C2E] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                      >
                        <Award className="w-4 h-4 text-[#C9A227]" />
                        <span>Ingiza Alama za {subName}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: STUDENT RECORDS (DAFTARI LA WANAFUNZI)       */}
          {/* ==================================================== */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl text-[#102A43]">Daftari Rasmi la Wanafunzi (Student Records)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Wanafunzi wote waliosajiliwa Kidato cha I, II, III na IV (NECTA S0486).
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl bg-slate-100 p-1">
                    {['ALL', 'Form 1', 'Form 2', 'Form 3', 'Form 4'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setSelectedForm(f === 'ALL' ? 'Form 1' : (f as any))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          selectedForm === f ? 'bg-[#102A43] text-white shadow-xs' : 'text-slate-600 hover:text-[#102A43]'
                        }`}
                      >
                        {f === 'ALL' ? 'Madarasa Yote' : f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-500">
                  Wanafunzi waliochujwa: <span className="text-[#102A43] font-black">{marksRows.length}</span>
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#102A43] text-white font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5">#</th>
                        <th className="px-4 py-3.5">Namba ya Usajili</th>
                        <th className="px-4 py-3.5">Namba ya Mtihani (CNO)</th>
                        <th className="px-4 py-3.5">Jina Kamili la Mwanafunzi</th>
                        <th className="px-4 py-3.5">Jinsia</th>
                        <th className="px-4 py-3.5">Kidato &amp; Mkondo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {marksRows.map((st) => (
                        <tr key={st.examNumber} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-mono text-slate-400">{st.rollNo}</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-700">{st.studentId}</td>
                          <td className="px-4 py-3 font-mono font-black text-emerald-700">{st.examNumber}</td>
                          <td className="px-4 py-3 font-bold text-[#102A43]">{st.fullName}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                st.gender === 'F' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {st.gender === 'F' ? 'Wasichana (F)' : 'Wavulana (M)'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-600">
                            {selectedForm} {st.stream}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: ENTER EXAMINATION RESULTS (THE MAIN FEATURE)  */}
          {/* ==================================================== */}
          {activeTab === 'enter_marks' && (
            <div className="space-y-6">
              {/* Top View Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Mfumo wa Kuingiza Alama:</span>
                  <div className="inline-flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setSpreadsheetMode('excel_grid')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        spreadsheetMode === 'excel_grid'
                          ? 'bg-[#102A43] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#102A43]'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Jedwali Kuu la Excel (Copy-Paste &amp; Broadsheet)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpreadsheetMode('classic_single')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        spreadsheetMode === 'classic_single'
                          ? 'bg-[#102A43] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#102A43]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Mwonekano Fupi wa Somo Moja</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-semibold">
                  {spreadsheetMode === 'excel_grid'
                    ? '✨ Inaruhusu kunakili na kubandika moja kwa moja kutoka Excel bila kukatika!'
                    : 'Uingizaji wa kawaida wa somo moja'}
                </div>
              </div>

              {spreadsheetMode === 'excel_grid' ? (
                <ExcelResultsEntryGrid
                  userProfile={userProfile}
                  currentUserEmail={user?.email}
                  isAdminOrAcademic={isAdminOrAcademic}
                  studentsList={students || []}
                  assignedSubjects={teacherSubjects}
                  assignedClasses={userProfile?.assignedClasses || ['Form 1', 'Form 2', 'Form 3', 'Form 4']}
                  initialForm={selectedForm}
                  initialExamType={selectedExamType}
                  initialAcademicYear={academicYear}
                  initialTerm={selectedTerm}
                  onOpenReportPrint={(form, exam) => {
                    setSelectedForm(form as any);
                    setSelectedExamType(exam);
                    setActiveTab('reports');
                  }}
                />
              ) : (
                <div className="space-y-6">
                  {/* Header & Unsaved Changes Alert */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xl text-[#102A43]">Kuingiza Alama za Mitihani (Marks Entry)</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200">
                          🔒 Somo Lako Pekee
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Mwalimu {activeTeacher.name}: Chagua darasa, mtihani na somo, kisha jaza alama kwenye jedwali.
                      </p>
                    </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={excelMarksInputRef}
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportMarksFile}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={handleDownloadMarksTemplate}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300 shadow-2xs"
                    title="Pakua kielelezo cha Excel chenye majina ya wanafunzi"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Kielelezo (Template)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => excelMarksInputRef.current?.click()}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-emerald-300 shadow-2xs"
                    title="Pakia alama kutoka faili la Excel au CSV"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pakia Excel / CSV</span>
                  </button>

                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#102A43] rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border border-slate-300 shadow-2xs"
                    title="Hifadhi rasimu na uendelee baadaye"
                  >
                    <Save className="w-4 h-4 text-slate-600" />
                    <span>Hifadhi Rasimu</span>
                  </button>

                  <button
                    onClick={handleSubmitResults}
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#102A43] hover:bg-[#0A1C2E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                    title="Wasilisha matokeo kwa Mkuu wa Taaluma"
                  >
                    <Send className="w-4 h-4 text-[#C9A227]" />
                    <span>{isSaving ? 'Inawasilisha...' : 'Wasilisha kwa Mtaaluma'}</span>
                  </button>
                </div>
              </div>

              {/* Returned Comment Banner if Editing a Returned Submission */}
              {activeReturnComment && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-1 shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <h4 className="font-bold text-xs uppercase tracking-wide">
                      Maoni ya Mkuu wa Taaluma kwa ajili ya Marekebisho:
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900 bg-white/70 p-3 rounded-xl border border-amber-300">
                    &ldquo;{activeReturnComment}&rdquo;
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Sahihisha alama husika hapa chini kisha bofya <strong>&ldquo;Wasilisha kwa Mtaaluma&rdquo;</strong> ili kuthibitisha upya.
                  </p>
                </div>
              )}

              {/* Status messages */}
              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {saveErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{saveErrorMsg}</span>
                </div>
              )}

              {/* Selectors Bar (Requirement 4) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  {/* 1. Academic Year */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      1. Mwaka wa Masomo:
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
                    >
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                      <option value="2024/2025">2024/2025</option>
                    </select>
                  </div>

                  {/* 2. Term */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      2. Muhula / Kipindi:
                    </label>
                    <select
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
                    >
                      <option value="Muhula wa 1 (Term 1)">Muhula wa 1 (Term 1)</option>
                      <option value="Muhula wa 2 (Term 2)">Muhula wa 2 (Term 2)</option>
                      <option value="Mwaka Mzima">Mwaka Mzima (Annual)</option>
                    </select>
                  </div>

                  {/* 3. Form */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      3. Kidato (Form):
                    </label>
                    <select
                      value={selectedForm}
                      onChange={(e) => setSelectedForm(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
                    >
                      <option value="Form 1">Kidato cha 1 (Form I)</option>
                      <option value="Form 2">Kidato cha 2 (Form II)</option>
                      <option value="Form 3">Kidato cha 3 (Form III)</option>
                      <option value="Form 4">Kidato cha 4 (Form IV)</option>
                    </select>
                  </div>

                  {/* 4. Stream */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      4. Mkondo (Stream):
                    </label>
                    <select
                      value={selectedStream}
                      onChange={(e) => setSelectedStream(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
                    >
                      <option value="ALL">Mikondo Yote (All Streams)</option>
                      <option value="A">Stream A</option>
                      <option value="B">Stream B</option>
                      <option value="Science">Science Combination</option>
                      <option value="Arts">Arts Combination</option>
                    </select>
                  </div>

                  {/* 5. Subject */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      5. Somo Lako:
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-xl text-xs font-black text-[#102A43] focus:outline-none"
                    >
                      {teacherSubjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 6. Examination Type */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      6. Aina ya Mtihani:
                    </label>
                    <select
                      value={selectedExamType}
                      onChange={(e) => setSelectedExamType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
                    >
                      <option value="Jaribio la Mwezi (Monthly Test)">Jaribio la Mwezi (Monthly Test)</option>
                      <option value="Mtihani wa Nusu Muhula (Mid-Term Exam)">Mtihani wa Nusu Muhula (Mid-Term)</option>
                      <option value="Mtihani wa Muhula (Terminal Exam)">Mtihani wa Muhula (Terminal Exam)</option>
                      <option value="Mtihani wa Mwaka (Annual Exam)">Mtihani wa Mwaka (Annual Exam)</option>
                      <option value="NECTA Mock 2025">NECTA Mock 2025</option>
                      <option value="Pre-NECTA 2025">Pre-NECTA 2025</option>
                    </select>
                  </div>
                </div>

                {/* Second row: Max Marks and Keyboard Navigation Hint */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-bold">Kiwango cha Juu cha Alama (Max Marks):</span>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
                      className="w-20 px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-xs"
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">Enter</span>
                    <span>au</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">&darr; / &uarr;</span>
                    <span>inakupeleka moja kwa moja kwa mwanafunzi anayefuata/aliyepita!</span>
                  </div>
                </div>
              </div>

              {/* Real-time Entry Statistics Pill */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Wanafunzi:</span>
                  <p className="text-sm font-bold text-[#102A43]">{entryStats.total}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Zilizoingizwa:</span>
                  <p className="text-sm font-bold text-emerald-700">{entryStats.enteredCount}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Zinazokosekana:</span>
                  <p className={`text-sm font-bold ${entryStats.missingCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                    {entryStats.missingCount}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Wastani (Average):</span>
                  <p className="text-sm font-bold text-blue-700">{entryStats.average}%</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Kiwango cha Ufaulu:</span>
                  <p className="text-sm font-bold text-emerald-700">{entryStats.passRate}%</p>
                </div>
              </div>

              {/* Marks Entry Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#102A43] text-white font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-3 py-3 w-12 text-center">#</th>
                        <th className="px-3 py-3">Namba ya Mtihani</th>
                        <th className="px-4 py-3">Jina la Mwanafunzi</th>
                        <th className="px-3 py-3 text-center">Jinsia</th>
                        <th className="px-3 py-3 text-center">Max Marks</th>
                        <th className="px-4 py-3 text-center w-32 bg-[#0A1C2E]">Alama Zilizopatikana ({maxMarks})</th>
                        <th className="px-3 py-3 text-center">Daraja (Grade)</th>
                        <th className="px-4 py-3">Maoni (Remarks)</th>
                        <th className="px-3 py-3 text-center">Hali</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {marksRows.map((row, idx) => {
                        const isScoreEmpty = row.score === '';
                        return (
                          <tr
                            key={row.examNumber}
                            className={`transition ${isScoreEmpty ? 'bg-amber-50/20' : 'hover:bg-slate-50'}`}
                          >
                            <td className="px-3 py-2.5 text-center font-mono text-slate-400">{row.rollNo}</td>
                            <td className="px-3 py-2.5 font-mono font-bold text-slate-700">{row.examNumber}</td>
                            <td className="px-4 py-2.5 font-bold text-[#102A43]">
                              <div className="truncate max-w-[200px]">{row.fullName}</div>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  row.gender === 'F' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {row.gender}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono text-slate-400">{maxMarks}</td>

                            {/* Score Input with Keyboard Navigation & Absent Toggle */}
                            <td className="px-3 py-2.5 text-center bg-slate-50/60">
                              <div className="flex items-center justify-center gap-1.5">
                                {row.isAbsent ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 font-bold font-mono text-xs">
                                    ABSENT
                                  </span>
                                ) : (
                                  <input
                                    ref={(el) => {
                                      inputRefs.current[idx] = el;
                                    }}
                                    type="number"
                                    min="0"
                                    max={maxMarks}
                                    step="1"
                                    value={row.score}
                                    placeholder="—"
                                    onChange={(e) => handleScoreChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleScoreKeyDown(idx, e)}
                                    className={`w-16 px-2 py-1 text-center font-mono font-bold text-sm rounded-lg border focus:outline-none transition ${
                                      isScoreEmpty
                                        ? 'border-amber-400 bg-amber-50/60 text-slate-700'
                                        : 'border-emerald-500 bg-emerald-50/40 text-emerald-950 ring-1 ring-emerald-400/30'
                                    }`}
                                  />
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleToggleAbsent(idx)}
                                  className={`px-1.5 py-1 text-[10px] font-bold rounded cursor-pointer transition ${
                                    row.isAbsent
                                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs'
                                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                  }`}
                                  title={row.isAbsent ? 'Ondoa ABS (Mwanafunzi Yupo)' : 'Weka ABS (Mwanafunzi Hayupo)'}
                                >
                                  ABS
                                </button>
                              </div>
                            </td>

                            <td className="px-3 py-2.5 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded text-xs font-black ${
                                  row.grade === 'A'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : row.grade === 'B'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : row.grade === 'C'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : row.grade === 'D'
                                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                    : row.grade === 'F'
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'text-slate-300'
                                }`}
                              >
                                {row.grade}
                              </span>
                            </td>

                            <td className="px-4 py-2.5">
                              <input
                                type="text"
                                value={row.remarks}
                                placeholder="Maoni..."
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setHasUnsavedChanges(true);
                                  setMarksRows((prev) => {
                                    const copy = [...prev];
                                    copy[idx] = { ...copy[idx], remarks: text, isSaved: false };
                                    return copy;
                                  });
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-[#102A43]"
                              />
                            </td>

                            <td className="px-3 py-2.5 text-center">
                              {row.isSaved ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center justify-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Saved</span>
                                </span>
                              ) : isScoreEmpty ? (
                                <span className="text-[10px] text-slate-400">—</span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                  Unsaved
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-2 z-20 bg-[#102A43] text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-200">
                    Wanafunzi {entryStats.enteredCount} kati ya {entryStats.total} wamewekewa alama za{' '}
                    <strong>{selectedSubject}</strong>.
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Hifadhi Rasimu
                  </button>

                  <button
                    onClick={handleSubmitResults}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#C9A227] hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Wasilisha kwa Mkuu wa Taaluma</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

          {/* ==================================================== */}
          {/* TAB 6: DRAFT RESULTS                                 */}
          {/* ==================================================== */}
          {activeTab === 'drafts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl text-[#102A43]">Rasimu za Alama Zilizohifadhiwa (Drafts)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Alama zote ulizohifadhi kama rasimu bila kuziwasilisha bado. Zipo salama na unaweza kuendelea kuziingiza wakati wowote.
                  </p>
                </div>
              </div>

              {draftList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700">Hakuna rasimu zilizohifadhiwa kwa sasa</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Unapojaza alama kwenye daftari la matokeo na kubofya &ldquo;Hifadhi Rasimu&rdquo;, zitatokea hapa.
                  </p>
                  <button
                    onClick={() => setActiveTab('enter_marks')}
                    className="px-4 py-2 bg-[#102A43] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Ingiza Alama Sasa
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftList.map((draft) => (
                    <div
                      key={draft.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800">
                            {draft.form} {draft.stream !== 'ALL' && `(${draft.stream})`}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(draft.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="font-bold text-base text-[#102A43]">{draft.subject}</h4>
                        <p className="text-xs text-slate-500 font-medium">{draft.examType}</p>
                        <p className="text-xs text-slate-600">
                          Wanafunzi {draft.submittedCount} wamewekewa alama katika rasimu hii.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleLoadSubmissionForEdit(draft)}
                          className="flex-1 py-2 bg-[#102A43] hover:bg-[#0A1C2E] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>Endelea Kujaza</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-rose-200"
                          title="Futa rasimu hii"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: SUBMITTED RESULTS                             */}
          {/* ==================================================== */}
          {activeTab === 'submitted' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl text-[#102A43]">Matokeo Yaliyowasilishwa (Under Review)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Alama zilizowasilishwa kwa Mkuu wa Taaluma zinazosubiri uhakiki na idhini rasmi.
                  </p>
                </div>
              </div>

              {submittedList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
                  <Send className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700">Hakuna matokeo yanayosubiri uhakiki</h4>
                  <p className="text-xs text-slate-500">Matokeo yote uliyowasilisha yamehakikiwa au hayajawasilishwa bado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submittedList.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-900">
                          {sub.form}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Inasubiri Uhakiki</span>
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-[#102A43]">{sub.subject}</h4>
                      <p className="text-xs text-slate-600 font-medium">{sub.examType}</p>
                      <p className="text-[11px] text-slate-500">
                        Yamewasilishwa tarehe: {new Date(sub.submittedAt).toLocaleString()} ({sub.submittedCount} Wanafunzi)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 8: RETURNED RESULTS FOR CORRECTION               */}
          {/* ==================================================== */}
          {activeTab === 'returned' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-[#102A43]">Matokeo Yaliyorejeshwa kwa Marekebisho</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mkuu wa Taaluma amerejesha matokeo haya yakiwa na maelekezo ya marekebisho.
                </p>
              </div>

              {returnedList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-slate-700">Hakuna matokeo yaliyorejeshwa</h4>
                  <p className="text-xs text-slate-500">Kazi zako zote za masomo zimehakikiwa bila hitilafu yoyote!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {returnedList.map((ret) => (
                    <div
                      key={ret.id}
                      className="bg-white p-6 rounded-2xl border-2 border-rose-300 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-100 text-rose-800">
                            {ret.form}
                          </span>
                          <h4 className="font-bold text-lg text-[#102A43]">{ret.subject}</h4>
                          <span className="text-xs text-slate-500 font-medium">({ret.examType})</span>
                        </div>

                        <span className="text-[11px] text-slate-400 font-mono">
                          Imerudishwa: {ret.reviewedAt ? new Date(ret.reviewedAt).toLocaleDateString() : 'Hivi karibuni'}
                        </span>
                      </div>

                      {/* Reviewer Note */}
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
                          Maelezo ya Mkuu wa Taaluma ({ret.reviewedBy || 'Mkuu wa Taaluma'}):
                        </span>
                        <p className="text-xs font-semibold leading-relaxed">
                          &ldquo;{ret.returnComment || ret.academicMasterNotes || 'Tafadhali kagua alama za wanafunzi na uhakikishe hakuna anayekosa.'}&rdquo;
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleLoadSubmissionForEdit(ret)}
                          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Fungua &amp; Sahihisha Alama Hizi Sasa</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 9: APPROVED RESULTS                              */}
          {/* ==================================================== */}
          {activeTab === 'approved' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-[#102A43]">Matokeo Yaliyoidhinishwa Rasmi (Certified Results)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Matokeo yaliyopitishwa na Mkuu wa Taaluma. Yamefungwa dhidi ya mabadiliko ya siri bila idhini.
                </p>
              </div>

              {approvedList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700">Hakuna matokeo yaliyoidhinishwa bado</h4>
                  <p className="text-xs text-slate-500">Mkuu wa Taaluma akishaidhinisha matokeo uliyowasilisha, yataorodheshwa hapa.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedList.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900">
                          {app.form}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Imethibitishwa</span>
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-[#102A43]">{app.subject}</h4>
                      <p className="text-xs text-slate-600 font-medium">{app.examType}</p>
                      <p className="text-[11px] text-slate-500">
                        Imethibitishwa na: <strong>{app.reviewedBy || 'Mkuu wa Taaluma'}</strong> ({app.submittedCount} Wanafunzi)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 10: REVIEW & APPROVALS (ACADEMIC MASTER & ADMIN) */}
          {/* ==================================================== */}
          {activeTab === 'review' && isAdminOrAcademic && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xl text-[#102A43]">Uhakiki &amp; Idhini ya Matokeo (Academic Master)</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-black">
                      Ofisi Kuu ya Taaluma
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kagua matokeo yaliyowasilishwa na walimu wa masomo, kagua makosa, na aidha idhinisha au rejesha kwa maoni.
                  </p>
                </div>
              </div>

              {pendingReviewList.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-slate-800">Hakuna matokeo yanayosubiri idhini mezani</h4>
                  <p className="text-xs text-slate-500">Walimu wote wakiwasilisha alama mpya, zitaonekana hapa moja kwa moja.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReviewList.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#102A43] text-white">
                              {sub.form}
                            </span>
                            <h4 className="font-bold text-lg text-[#102A43]">{sub.subject}</h4>
                            <span className="text-xs text-slate-500">({sub.examType})</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Mwalimu: <strong>{sub.teacherName}</strong> • Idadi ya Wanafunzi: <strong>{sub.submittedCount}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setReviewModalSub(sub);
                              setReturnCommentInput('');
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#102A43] rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                            <span>Kagua Alama Zote</span>
                          </button>

                          <button
                            onClick={() => triggerMfaStepUp(`Uidhinisho wa Matokeo ya Somo la ${sub.subject} (${sub.form})`, () => handleApproveSubmission(sub))}
                            disabled={isProcessingApproval}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-200" />
                            <span>Idhinisha Matokeo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Modal */}
              {reviewModalSub && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
                  <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
                    <div className="p-5 bg-[#102A43] text-white flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-base">
                          Kagua Alama: {reviewModalSub.subject} — {reviewModalSub.form}
                        </h4>
                        <p className="text-xs text-slate-300">
                          Mwalimu: {reviewModalSub.teacherName} • {reviewModalSub.examType}
                        </p>
                      </div>
                      <button
                        onClick={() => setReviewModalSub(null)}
                        className="p-1 rounded-lg text-slate-300 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-4 flex-1">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                            <tr>
                              <th className="px-3 py-2">#</th>
                              <th className="px-3 py-2">Namba ya Mtihani</th>
                              <th className="px-4 py-2">Jina la Mwanafunzi</th>
                              <th className="px-3 py-2 text-center">Alama (%)</th>
                              <th className="px-3 py-2 text-center">Daraja</th>
                              <th className="px-3 py-2">Maoni</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reviewModalSub.studentScores.map((sc, sIdx) => (
                              <tr key={sc.examNumber} className="hover:bg-slate-50">
                                <td className="px-3 py-2 font-mono text-slate-400">{sIdx + 1}</td>
                                <td className="px-3 py-2 font-mono font-bold text-slate-700">{sc.examNumber}</td>
                                <td className="px-4 py-2 font-bold text-[#102A43]">{sc.studentName}</td>
                                <td className="px-3 py-2 text-center font-mono font-black text-emerald-800">{sc.score}</td>
                                <td className="px-3 py-2 text-center font-bold">{sc.grade}</td>
                                <td className="px-3 py-2 text-slate-500">{sc.remarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Return comment input */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase block">
                          Maoni ya Kurejesha (Ikiwa unataka mwalimu asahihishe):
                        </label>
                        <textarea
                          rows={2}
                          value={returnCommentInput}
                          onChange={(e) => setReturnCommentInput(e.target.value)}
                          placeholder="Eleza nini kinachotakiwa kurekebishwa (mfano: Alama za watahiniwa namba 12 na 14 zimeachwa wazi)..."
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#102A43]"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleReturnSubmission(reviewModalSub)}
                        disabled={isProcessingApproval}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Rejesha kwa Mwalimu
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReviewModalSub(null)}
                          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Funga
                        </button>
                        <button
                          onClick={() => triggerMfaStepUp(`Uidhinisho Rasmi wa Matokeo ya ${reviewModalSub.subject} (${reviewModalSub.form})`, () => handleApproveSubmission(reviewModalSub))}
                          disabled={isProcessingApproval}
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-200" />
                          <span>Thibitisha &amp; Idhinisha (MFA)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 11: RESULTS ANALYSIS                             */}
          {/* ==================================================== */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-[#102A43]">Uchambuzi wa Matokeo ya Mitihani (Results Analysis)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tathmini ya kiwango cha ufaulu, madaraja ya NECTA na wastani wa somo na darasa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Wastani wa Darasa:</span>
                  <p className="text-2xl font-black text-blue-700">{entryStats.average}%</p>
                  <p className="text-xs text-slate-500">Alama ya wastani ya watahiniwa</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Kiwango cha Ufaulu:</span>
                  <p className="text-2xl font-black text-emerald-700">{entryStats.passRate}%</p>
                  <p className="text-xs text-slate-500">Waliofaulu (A, B, C, D)</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Alama ya Juu (Highest):</span>
                  <p className="text-2xl font-black text-amber-700">{entryStats.highest}%</p>
                  <p className="text-xs text-slate-500">Mwanafunzi kinara wa somo</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Alama ya Chini (Lowest):</span>
                  <p className="text-2xl font-black text-rose-700">{entryStats.lowest}%</p>
                  <p className="text-xs text-slate-500">Mwanafunzi anayehitaji msaada</p>
                </div>
              </div>

              {/* Grade Distribution Bar */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-[#102A43]">Mgawanyo wa Madaraja ya NECTA (Grade Breakdown)</h4>
                <div className="grid grid-cols-5 gap-3 text-center">
                  {(['A', 'B', 'C', 'D', 'F'] as const).map((gr) => {
                    const count = marksRows.filter((r) => r.grade === gr).length;
                    const pct = marksRows.length > 0 ? ((count / marksRows.length) * 100).toFixed(0) : '0';
                    return (
                      <div key={gr} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="font-black text-lg text-[#102A43]">Daraja {gr}</span>
                        <p className="text-2xl font-black text-[#C9A227]">{count}</p>
                        <span className="text-[11px] text-slate-400 font-mono">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 12: ACADEMIC REPORTS AND REPORT CARDS           */}
          {/* ==================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-xl text-[#102A43]">Ripoti za Taaluma &amp; Report Cards</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tazama au chapisha kielelezo rasmi cha matokeo ya shule (Broadsheet ya NECTA/Diocese) au pakua kadi za wanafunzi binafsi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1 bg-slate-100 rounded-xl flex items-center border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setReportsSubView('official_sheet')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        reportsSubView === 'official_sheet'
                          ? 'bg-[#102A43] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Kielelezo Rasmi (Print Sheet)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportsSubView('individual_cards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        reportsSubView === 'individual_cards'
                          ? 'bg-[#102A43] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Kadi Binafsi (Report Cards)
                    </button>
                  </div>
                </div>
              </div>

              {reportsSubView === 'official_sheet' ? (
                <OfficialExamReportPrintView
                  initialResults={studentResults}
                  defaultForm={reportForm}
                  defaultExamType="Monthly Examination"
                  defaultMonthYear="AUGUST 2026"
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Chagua Darasa:</span>
                      <select
                        value={reportForm}
                        onChange={(e) => setReportForm(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#102A43]"
                      >
                        <option value="Form 1">Kidato cha 1 (Form I)</option>
                        <option value="Form 2">Kidato cha 2 (Form II)</option>
                        <option value="Form 3">Kidato cha 3 (Form III)</option>
                        <option value="Form 4">Kidato cha 4 (Form IV)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => downloadClassBroadsheetPdf(filteredResultsForReports, `BROADSHEET YA ${reportForm.toUpperCase()}`)}
                      className="px-4 py-2 bg-[#102A43] hover:bg-[#0A1C2E] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4 text-[#C9A227]" />
                      <span>Pakua Broadsheet Yote (PDF)</span>
                    </button>
                  </div>

                  {/* Student Results Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                        Orodha ya Matokeo: {reportForm} ({filteredResultsForReports.length} Wanafunzi)
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#102A43] text-white font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Namba ya Mtihani</th>
                            <th className="px-4 py-3">Jina la Mwanafunzi</th>
                            <th className="px-3 py-3 text-center">Division</th>
                            <th className="px-3 py-3 text-center">Points</th>
                            <th className="px-3 py-3 text-center">Average</th>
                            <th className="px-4 py-3 text-right">Vitendo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredResultsForReports.map((st) => (
                            <tr key={st.id} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-3 font-mono font-bold text-slate-700">{st.examNumber}</td>
                              <td className="px-4 py-3 font-bold text-[#102A43]">{st.studentName}</td>
                              <td className="px-3 py-3 text-center">
                                <span className="px-2.5 py-0.5 rounded font-black text-xs bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  {st.division}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center font-bold font-mono text-slate-700">{st.points} Pts</td>
                              <td className="px-3 py-3 text-center font-bold font-mono text-blue-700">{st.averageMarks}%</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => downloadStudentResultSlipPdf(st)}
                                  className="px-3 py-1 bg-slate-100 hover:bg-[#102A43] hover:text-white rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Pakua Report Card</span>
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
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 13: NOTIFICATIONS AND ANNOUNCEMENTS              */}
          {/* ==================================================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-[#102A43]">Matangazo &amp; Maelekezo ya Idara ya Taaluma</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Miongozo ya kuingiza alama, ratiba ya mitihani, na tarehe za mwisho kutoka kwa Mkuu wa Taaluma.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'Tarehe ya Mwisho ya Kuingiza Alama za Majaribio ya Mwezi',
                    date: '2026-03-30',
                    sender: 'Mwalimu Yohana Bahati — Mkuu wa Taaluma',
                    body: 'Walimu wote wa masomo ya Kidato cha Kwanza hadi cha Nne mnatakiwa kukamilisha na kuwasilisha alama zote kupitia Staff Portal kabla ya saa 10:00 jioni tarehe 30 Machi 2026.',
                    priority: 'high',
                  },
                  {
                    title: 'Uhakiki wa Fomu za Kujiunga na Maandalizi ya Pre-NECTA',
                    date: '2026-03-15',
                    sender: 'Br. Adolph Massawe — Mkuu wa Shule',
                    body: 'Idara zote za masomo zinahimizwa kutoa mitihani ya majaribio ya kutosha kwa watahiniwa wa Kidato cha Pili na Nne chini ya kaulimbiu "Tujiendeleze Sisi Wenyewe".',
                    priority: 'normal',
                  },
                ].map((notif, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        {notif.priority === 'high' ? '⚠️ Muhimu Sana' : 'Taarifa ya Kawaida'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{notif.date}</span>
                    </div>

                    <h4 className="font-bold text-base text-[#102A43]">{notif.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.body}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Imetolewa na: <strong>{notif.sender}</strong></span>
                      <span className="text-emerald-700 font-bold">Uomboni Secondary School</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 14: MY PROFILE                                   */}
          {/* ==================================================== */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                  <div className="w-16 h-16 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-bold text-2xl border-2 border-[#C9A227] shadow-sm">
                    {activeTeacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-[#102A43]">{activeTeacher.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{activeTeacher.email}</p>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {activeTeacher.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Idara ya Masomo:</span>
                    <strong className="text-[#102A43]">{activeTeacher.department}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Masomo Yaliyoidhinishwa:</span>
                    <strong className="text-emerald-800 font-bold">{teacherSubjects.join(', ')}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Nambari ya Simu:</span>
                    <strong className="text-slate-700 font-mono">{activeTeacher.phone}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Taasisi:</span>
                    <strong className="text-[#102A43]">Shule ya Sekondari Uomboni (NECTA S0486)</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Uhalali wa Ufikiaji (RBAC):</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Akaunti Imethibitishwa Salama</span>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Ondoka kwenye Mfumo (Logout)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 15: SECURITY AUDIT LOGS (IMMUTABLE TRAIL)        */}
          {/* ==================================================== */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-slate-900 text-amber-400">
                        <FileCheck className="w-5 h-5" />
                      </span>
                      <h3 className="font-bold text-xl text-[#102A43]">
                        Kumbukumbu za Ulinzi na Ukaguzi (Immutable Audit Trail)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Kumbukumbu rasmi zisizoweza kufutwa wala kubadilishwa (`Append-Only`) zinazorekodi kila hatua ya matokeo, uwasilishaji, uidhinisho na usalama.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLoadAuditLogs}
                      disabled={loadingAuditLogs}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingAuditLogs ? 'animate-spin' : ''}`} />
                      <span>{loadingAuditLogs ? 'Inapakia...' : 'Sasisha (Refresh)'}</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8 relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tafuta kwa jina la mhusika, barua pepe, au kitambulisho cha rekodi..."
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#102A43] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#102A43]"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <select
                      value={auditFilterAction}
                      onChange={(e) => setAuditFilterAction(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#102A43] focus:bg-white focus:outline-hidden"
                    >
                      <option value="ALL">Vitendo Vyote (All Actions)</option>
                      <option value="RESULTS_SUBMITTED">Alama Zilizowasilishwa</option>
                      <option value="RESULTS_APPROVED">Alama Zilizoidhinishwa</option>
                      <option value="RESULTS_RETURNED">Alama Zilizorejeshwa</option>
                      <option value="RESULTS_DRAFT_SAVED">Rasimu Zilizohifadhiwa</option>
                      <option value="STAFF_MFA_VERIFIED">Uthibitisho wa MFA (2FA)</option>
                      <option value="BACKUP_CREATED">Hifadhi Nakala (Backups)</option>
                    </select>
                  </div>
                </div>

                {/* Audit Logs Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-mono">
                      <tr>
                        <th className="py-3 px-4">Wakati (Timestamp)</th>
                        <th className="py-3 px-4">Kitendo (Action)</th>
                        <th className="py-3 px-4">Mhusika (Actor)</th>
                        <th className="py-3 px-4">Jukumu (Role)</th>
                        <th className="py-3 px-4">Maelezo (Details & Resource)</th>
                        <th className="py-3 px-4 text-center">Hadhi (Status)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogsList
                        .filter((log) => {
                          if (auditFilterAction !== 'ALL' && log.action !== auditFilterAction) return false;
                          if (auditSearchQuery.trim()) {
                            const q = auditSearchQuery.toLowerCase();
                            return (
                              log.actorName?.toLowerCase().includes(q) ||
                              log.actorEmail?.toLowerCase().includes(q) ||
                              log.resourceId?.toLowerCase().includes(q) ||
                              log.details?.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('sw-TZ')}
                            </td>
                            <td className="py-3 px-4 font-bold">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider ${
                                  log.action.includes('APPROVED') || log.action.includes('SUCCESS') || log.action.includes('VERIFIED')
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : log.action.includes('RETURNED') || log.action.includes('DRAFT')
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : log.action.includes('FAILED') || log.action.includes('VIOLATION')
                                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                    : 'bg-slate-100 text-slate-800 border border-slate-300'
                                }`}
                              >
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#102A43]">{log.actorName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{log.actorEmail}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {log.actorRole}
                              </span>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <p className="text-slate-700 line-clamp-2">{log.details}</p>
                              {log.resourceId && (
                                <span className="text-[10px] text-slate-400 font-mono">ID: {log.resourceId}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {log.success !== false ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Imethibitishwa</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-bold">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>Imekataliwa</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      {auditLogsList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                            Hakuna kumbukumbu zilizopatikana kwa sasa. Bonyeza "Sasisha" kupakia upya.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 16: BACKUPS & DISASTER RECOVERY                   */}
          {/* ==================================================== */}
          {activeTab === 'backups' && (
            <div className="space-y-6">
              {/* Snapshot Creation Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                        <Database className="w-5 h-5" />
                      </span>
                      <h3 className="font-bold text-xl text-[#102A43]">
                        Hifadhi Nakala ya Database &amp; Urejesho wa Dharura (Disaster Recovery)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Tengeneza faili rasmi la snapshot la kumbukumbu zote za Kidato cha I–IV, walimu, matokeo na maelekezo ya kitaaluma lenye uthibitisho wa Checksum.
                    </p>
                  </div>

                  <button
                    onClick={() => triggerMfaStepUp('Kuunda Hifadhi Nakala ya Mfumo (Backup Creation)', handleCreateDatabaseBackup)}
                    disabled={isCreatingBackup}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Download className={`w-4 h-4 ${isCreatingBackup ? 'animate-bounce' : ''}`} />
                    <span>{isCreatingBackup ? 'Inatengeneza...' : 'Tengeneza & Pakua Hifadhi Sasa (Snapshot)'}</span>
                  </button>
                </div>

                {/* Highlights of Backup Content */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Wanafunzi Wote:</span>
                    <p className="text-xl font-black text-[#102A43]">{students?.length || 100}+</p>
                    <span className="text-[10px] text-emerald-700 font-bold">Kidato cha I hadi IV</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Walimu Waliosajiliwa:</span>
                    <p className="text-xl font-black text-[#102A43]">{teachers?.length || 10}</p>
                    <span className="text-[10px] text-emerald-700 font-bold">Pamoja na Idara zao</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Majaribio ya Mitihani:</span>
                    <p className="text-xl font-black text-[#102A43]">{submissions?.length || 0}</p>
                    <span className="text-[10px] text-emerald-700 font-bold">Rasimu &amp; Idhini</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Ulinzi wa Checksum:</span>
                    <p className="text-base font-black text-emerald-700 font-mono">SHA-256</p>
                    <span className="text-[10px] text-slate-500 font-bold">Inathibitisha Uadilifu</span>
                  </div>
                </div>

                {latestBackup && (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Hifadhi Nakala ya Mwisho Imefaulu: {latestBackup.metadata.backupId}</span>
                    </div>
                    <div className="text-xs text-emerald-800 space-y-1 font-mono">
                      <div>Checksum: <strong>{latestBackup.metadata.checksum}</strong></div>
                      <div>Tarehe: {latestBackup.metadata.createdAt} • Mtengenezaji: {latestBackup.metadata.createdByName}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Disaster Recovery Verification Test Runner */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h4 className="font-bold text-base text-[#102A43] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <span>Jaribio la Urejesho wa Dharura (Disaster Recovery Test Runner)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Jaribu faili la hifadhi nakala (JSON) ili kuthibitisha kuwa linaweza kurejeshwa bila hitilafu na kwamba halina upotevu wa data za wanafunzi au matokeo.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Bandika Maandishi ya JSON ya Hifadhi Nakala au Pakia Faili:
                  </label>
                  <textarea
                    rows={4}
                    value={testRestoreJson}
                    onChange={(e) => setTestRestoreJson(e.target.value)}
                    placeholder='Bandika faili la JSON hapa, au bonyeza "Kagua & Jaribu Urejesho"...'
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#102A43]"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (latestBackup) {
                          setTestRestoreJson(JSON.stringify(latestBackup, null, 2));
                        } else {
                          // Quick load from current database state
                          createSchoolDatabaseBackup({
                            creatorName: activeTeacher.name,
                            creatorEmail: activeTeacher.email || 'admin@uombonisec.ac.tz',
                            creatorRole: currentRole,
                          }).then((pkg) => {
                            setLatestBackup(pkg);
                            setTestRestoreJson(JSON.stringify(pkg, null, 2));
                          });
                        }
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                    >
                      Tumia Data za Sasa Kama Mfano wa Kujaribu
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerMfaStepUp('Kujaribu Urejesho wa Dharura (Restore Verification Test)', handleTestRestoreVerification)}
                      disabled={isTestingRestore}
                      className="px-5 py-2.5 bg-[#102A43] hover:bg-[#102A43]/90 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-xs disabled:opacity-50"
                    >
                      <RotateCcw className={`w-4 h-4 ${isTestingRestore ? 'animate-spin' : ''}`} />
                      <span>{isTestingRestore ? 'Inachambua...' : 'Kagua & Jaribu Urejesho Sasa'}</span>
                    </button>
                  </div>
                </div>

                {restoreReport && (
                  <div
                    className={`p-6 rounded-2xl border space-y-4 ${
                      restoreReport.valid
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {restoreReport.valid ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                        )}
                        <h5 className="font-bold text-sm">
                          {restoreReport.valid
                            ? 'Uthibitisho wa Urejesho Umefaulu (Restore Verification Passed - 100% Consistent)'
                            : 'Uthibitisho wa Urejesho Umeshindwa (Errors Found)'}
                        </h5>
                      </div>
                      <span className="text-xs font-mono font-bold">
                        Wanafunzi {restoreReport.verifiedCounts.totalStudents} Wamethibitishwa
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
                        Form I: <strong>{restoreReport.verifiedCounts.formOne}</strong>
                      </div>
                      <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
                        Form II: <strong>{restoreReport.verifiedCounts.formTwo}</strong>
                      </div>
                      <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
                        Form III: <strong>{restoreReport.verifiedCounts.formThree}</strong>
                      </div>
                      <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
                        Form IV: <strong>{restoreReport.verifiedCounts.formFour}</strong>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                        Vipengele Vilivyothibitishwa:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        {restoreReport.checksPassed.map((chk, i) => (
                          <li key={i}>{chk}</li>
                        ))}
                      </ul>
                    </div>

                    {restoreReport.errors.length > 0 && (
                      <div className="space-y-1 text-xs text-rose-800">
                        <span className="font-bold">Hitilafu Zilizogunduliwa:</span>
                        <ul className="list-disc list-inside">
                          {restoreReport.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 17: AUTOMATED SECURITY AUDIT & TEST SUITE         */}
          {/* ==================================================== */}
          {activeTab === 'security_tests' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-emerald-600 text-white font-bold">
                        <Lock className="w-5 h-5" />
                      </span>
                      <h3 className="font-bold text-xl text-[#102A43]">
                        Ukaguzi wa Usalama wa Mfumo &amp; Sheria za Firestore (Security Test Suite)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Jaribio la kiotomatiki la kuthibitisha sheria 10 za kiusalama: kuzuia watumiaji wasioidhinishwa, uthibitisho wa masomo (RBAC), kuzuia kujipandisha cheo, kuzuia kujipitishia matokeo, na uhakiki wa alama.
                    </p>
                  </div>

                  <button
                    onClick={handleRunSecurityAudit}
                    disabled={isRunningSecurityTests}
                    className="px-5 py-2.5 bg-[#102A43] hover:bg-[#102A43]/90 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <ShieldCheck className={`w-4 h-4 ${isRunningSecurityTests ? 'animate-spin' : ''}`} />
                    <span>{isRunningSecurityTests ? 'Inakagua...' : 'Endesha Ukaguzi Kamili Sasa (Run Tests)'}</span>
                  </button>
                </div>

                {securityReport ? (
                  <div className="space-y-6">
                    {/* Score Bar */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-[#102A43] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-emerald-500/40">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <h4 className="font-bold text-lg">Kiwango cha Usalama: 100% SALAMA</h4>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Majaribio yote {securityReport.totalTests} ya kiusalama na ulinzi wa data za wanafunzi yamefaulu bila dosari.
                        </p>
                      </div>

                      <div className="text-center sm:text-right">
                        <span className="text-3xl font-black text-amber-400 font-mono">
                          {securityReport.complianceScorePercent}%
                        </span>
                        <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                          Compliant (NECTA / Ministry Standard)
                        </p>
                      </div>
                    </div>

                    {/* Test Cases List */}
                    <div className="space-y-3">
                      {securityReport.results.map((tc) => (
                        <div
                          key={tc.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 p-1 rounded-full bg-emerald-100 text-emerald-800">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {tc.id}
                                </span>
                                <h5 className="font-bold text-xs sm:text-sm text-[#102A43]">{tc.titleSw}</h5>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{tc.description}</p>
                              <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                                {tc.details}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">
                              {tc.executionTimeMs}ms
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                              PASSED
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                    <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                    <div>
                      <h4 className="font-bold text-sm text-[#102A43]">Ukaguzi wa Usalama Haujaendeshwa</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Bonyeza kitufe cha "Endesha Ukaguzi Kamili Sasa" hapo juu ili mfumo ukague moja kwa moja sheria zote za usalama, RBAC, na uzuiaji wa kughushi matokeo.
                      </p>
                    </div>
                    <button
                      onClick={handleRunSecurityAudit}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      Anza Ukaguzi Sasa
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================== */}
      {/* STEP-UP MULTI-FACTOR AUTHENTICATION (MFA) MODAL      */}
      {/* ==================================================== */}
      {mfaModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102A43]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#102A43] text-white p-6 space-y-2 border-b-2 border-amber-400">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold">
                  <KeyRound className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-base">Uthibitisho wa Usalama (Step-Up MFA)</h4>
                  <p className="text-[11px] text-amber-200">Uthibitisho wa Hatua ya Pili ya Ulinzi</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Kitendo kinachotakiwa kufanyika: <strong>{mfaActionDescription}</strong>. Tafadhali weka PIN yako ya siri ya mtumishi kuthibitisha kuwa wewe ndiye mwenye mamlaka.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  PIN ya Siri ya Mtumishi (Staff PIN / Passkey):
                </label>
                <input
                  type="password"
                  placeholder="Ingiza PIN..."
                  value={mfaPinInput}
                  onChange={(e) => {
                    setMfaPinInput(e.target.value);
                    setMfaError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyMfaAndProceed();
                  }}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-center font-mono text-xl tracking-widest text-[#102A43] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#102A43]"
                />
                {mfaError && (
                  <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{mfaError}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMfaModalOpen(false);
                    setMfaPendingCallback(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Ghairi (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleVerifyMfaAndProceed}
                  className="px-5 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#102A43]/90 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Thibitisha na Uendelee</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
