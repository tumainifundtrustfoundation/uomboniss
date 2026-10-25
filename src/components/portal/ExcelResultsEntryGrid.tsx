import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Check,
  X,
  FileCheck2,
  Award,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  Printer,
  ChevronDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  OFFICIAL_NECTA_SUBJECTS,
  scoreToNectaGrade,
  calculateNectaDivision,
  formatCno,
  getNectaSubjectAbbr,
  NectaSubjectInfo,
} from '../../utils/nectaResultsEngine';
import {
  savePendingSubjectScoresToFirestore,
  getPendingSubjectSubmissionsFromFirestore,
  approvePendingSubjectSubmissionInFirestore,
  returnPendingSubjectSubmissionInFirestore,
} from '../../services/academicFirestoreService';
import { savePublishedResult, getStudents, getClasses } from '../../services/schoolFirestoreService';
import { recordAuditLog } from '../../services/auditLoggingService';
import { auth, UserProfile } from '../../lib/firebase';
import { StudentProfile, PendingSubjectSubmission } from '../../types';

export interface ExcelGridStudentRow {
  rollNo: number;
  studentId: string;
  admissionNumber: string;
  examNumber: string;
  fullName: string;
  gender: 'M' | 'F';
  form: string;
  stream: string;
  // Dynamic subject marks: key is subject name or code (e.g. "Civics" or "011")
  // Value is number (0-100), '' (empty), or 'ABS' (absent)
  marks: Record<string, number | '' | 'ABS'>;
  // Cell validation errors
  errors: Record<string, string>;
  // Calculated summaries
  totalMarks: number;
  averageMarks: number;
  division: 'Division I' | 'Division II' | 'Division III' | 'Division IV' | 'Division 0' | 'ABS';
  points: number;
  rank: number;
  completedSubjectsCount: number;
  isAbsentAll: boolean;
}

export interface ExcelResultsEntryGridProps {
  userProfile?: UserProfile | null;
  currentUserEmail?: string | null;
  isAdminOrAcademic: boolean;
  studentsList: StudentProfile[];
  assignedSubjects: string[];
  assignedClasses: string[];
  initialForm?: string;
  initialExamType?: string;
  initialAcademicYear?: string;
  initialTerm?: string;
  onOpenReportPrint?: (form: string, examType: string) => void;
}

export const ExcelResultsEntryGrid: React.FC<ExcelResultsEntryGridProps> = ({
  userProfile,
  currentUserEmail,
  isAdminOrAcademic,
  studentsList,
  assignedSubjects,
  assignedClasses,
  initialForm = 'Form 1',
  initialExamType = 'Jaribio la Mwezi (Monthly Test)',
  initialAcademicYear = '2025/2026',
  initialTerm = 'Muhula wa 1 (Term 1)',
  onOpenReportPrint,
}) => {
  // ----------------------------------------------------
  // 1. SELECTORS & FILTER STATE
  // ----------------------------------------------------
  const [academicYear, setAcademicYear] = useState<string>(initialAcademicYear);
  const [selectedTerm, setSelectedTerm] = useState<string>(initialTerm);
  const [selectedForm, setSelectedForm] = useState<string>(initialForm);
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedExamType, setSelectedExamType] = useState<string>(initialExamType);
  const [maxMarks, setMaxMarks] = useState<number>(100);

  // View Mode: 'master' (All Subjects Excel Grid) or 'single' (Assigned/Chosen Single Subject)
  const [viewMode, setViewMode] = useState<'master' | 'single'>('master');
  const [activeSingleSubject, setActiveSingleSubject] = useState<string>(
    assignedSubjects[0] || 'Civics'
  );

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'M' | 'F'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'complete' | 'incomplete' | 'has_errors' | 'absent'>('ALL');
  const [sortBy, setSortBy] = useState<'roll' | 'name' | 'cno' | 'total' | 'rank'>('roll');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Active Cell Selection & Focus
  const [focusedCell, setFocusedCell] = useState<{ studentIndex: number; subjectKey: string } | null>(null);

  // Save Status: 'saved' | 'saving' | 'unsaved' | 'error'
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Workflow State for this Class + Exam
  const [workflowState, setWorkflowState] = useState<'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED'>('DRAFT');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [workflowReturnNotes, setWorkflowReturnNotes] = useState<string | null>(null);
  const [isSubmittingWorkflow, setIsSubmittingWorkflow] = useState(false);

  // Authorized post-approval correction state
  const [isCorrectionUnlocked, setIsCorrectionUnlocked] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionReasonInput, setCorrectionReasonInput] = useState('');

  // Return to teacher modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReasonInput, setReturnReasonInput] = useState('');

  // Excel Import Preview Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<{
    fileName: string;
    totalRows: number;
    validRows: Array<{
      rollNo?: number;
      admissionNumber: string;
      fullName: string;
      marks: Record<string, number | 'ABS'>;
    }>;
    invalidRows: Array<{
      rowNumber: number;
      rawIdentifier: string;
      rawName: string;
      errors: string[];
    }>;
  } | null>(null);

  // Reference for file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Determine active subjects displayed in the spreadsheet
  const activeSubjectColumns: NectaSubjectInfo[] = useMemo(() => {
    if (viewMode === 'single') {
      const match = OFFICIAL_NECTA_SUBJECTS.find((s) => s.name === activeSingleSubject);
      return match ? [match] : [OFFICIAL_NECTA_SUBJECTS[0]];
    }

    // In master grid:
    // If Admin/Academic, show all official NECTA subjects
    // If teacher, can view all subjects for the class, but editing permission is checked per cell
    return OFFICIAL_NECTA_SUBJECTS;
  }, [viewMode, activeSingleSubject]);

  // ----------------------------------------------------
  // 2. GRID ROWS STATE INITIALIZATION
  // ----------------------------------------------------
  const [gridRows, setGridRows] = useState<ExcelGridStudentRow[]>([]);
  const hasUnsavedChanges = saveStatus === 'unsaved';

  // Generate grid rows from students list and cached submissions
  const loadGridData = useCallback(async () => {
    // 1. Filter students for selected Form & Stream
    const matchedStudents = (studentsList || []).filter((s) => {
      const matchesForm = (s.form || '').toLowerCase().includes(selectedForm.toLowerCase().replace('form ', ''));
      const matchesStream = selectedStream === 'ALL' || !s.stream || s.stream === selectedStream;
      return matchesForm && matchesStream;
    });

    if (matchedStudents.length === 0) {
      setGridRows([]);
      return;
    }

    // 2. Try fetching existing submissions for this exam + form
    let existingSubmissions: PendingSubjectSubmission[] = [];
    try {
      existingSubmissions = await getPendingSubjectSubmissionsFromFirestore();
    } catch {
      // fallback
    }

    // Check if any submission matches Form & Exam
    const classSubs = existingSubmissions.filter(
      (sub) =>
        sub.form.toLowerCase().includes(selectedForm.toLowerCase().replace('form ', '')) &&
        sub.examType.toLowerCase() === selectedExamType.toLowerCase() &&
        sub.academicYear === academicYear
    );

    // Determine workflow state
    if (classSubs.some((s) => s.status === 'approved')) {
      setWorkflowState('APPROVED');
    } else if (classSubs.some((s) => s.status === 'pending' || s.status === 'under_review')) {
      setWorkflowState('SUBMITTED');
    } else if (classSubs.some((s) => s.status === 'returned')) {
      setWorkflowState('DRAFT');
      const returned = classSubs.find((s) => s.status === 'returned');
      setWorkflowReturnNotes(returned?.returnComment || 'Matokeo yamerejeshwa na Mkuu wa Taaluma kwa ajili ya marekebisho.');
    } else {
      setWorkflowState('DRAFT');
      setWorkflowReturnNotes(null);
    }

    // Build Student Rows
    const rows: ExcelGridStudentRow[] = matchedStudents.map((st, idx) => {
      const studentMarks: Record<string, number | '' | 'ABS'> = {};
      const errors: Record<string, string> = {};

      OFFICIAL_NECTA_SUBJECTS.forEach((sub) => {
        // Find existing score from submissions
        let foundScore: number | '' | 'ABS' = '';
        for (const submission of classSubs) {
          if (submission.subject.toLowerCase() === sub.name.toLowerCase()) {
            const sc = submission.studentScores?.find(
              (s) =>
                s.examNumber.toLowerCase() === (st.examNumber || '').toLowerCase() ||
                s.studentName.toLowerCase() === st.fullName.toLowerCase()
            );
            if (sc) {
              if (sc.remarks?.includes('ABS') || (sc.score === 0 && sc.remarks?.includes('Hakufanya'))) {
                foundScore = 'ABS';
              } else if (typeof sc.score === 'number') {
                foundScore = sc.score;
              }
            }
          }
        }

        studentMarks[sub.name] = foundScore;
      });

      return {
        rollNo: idx + 1,
        studentId: st.studentId || `STU-${idx + 1}`,
        admissionNumber: (st as any).admissionNumber || st.studentId || `S0486/${String(idx + 1).padStart(4, '0')}`,
        examNumber: st.examNumber || formatCno((st as any).admissionNumber || st.studentId || `S0486/${String(idx + 1).padStart(4, '0')}`),
        fullName: st.fullName,
        gender: st.gender === 'F' ? 'F' : 'M',
        form: st.form || selectedForm,
        stream: st.stream || 'A',
        marks: studentMarks,
        errors,
        totalMarks: 0,
        averageMarks: 0,
        division: 'Division 0',
        points: 0,
        rank: idx + 1,
        completedSubjectsCount: 0,
        isAbsentAll: false,
      };
    });

    // Run calculations on initial data
    const computedRows = recalculateAllRows(rows);
    setGridRows(computedRows);
    setSaveStatus('saved');
  }, [studentsList, selectedForm, selectedStream, selectedExamType, academicYear]);

  useEffect(() => {
    loadGridData();
  }, [loadGridData]);

  // Warn before browser tab exit if unsaved changes
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

  // ----------------------------------------------------
  // 3. RECALCULATION ENGINE (NECTA Standard)
  // ----------------------------------------------------
  const recalculateAllRows = (rows: ExcelGridStudentRow[]): ExcelGridStudentRow[] => {
    const updated = rows.map((r) => {
      const subjectEntries: Array<{ name: string; score: number }> = [];
      let total = 0;
      let completedCount = 0;
      let absentCount = 0;

      OFFICIAL_NECTA_SUBJECTS.forEach((sub) => {
        const val = r.marks[sub.name];
        if (typeof val === 'number') {
          total += val;
          completedCount++;
          subjectEntries.push({ name: sub.name, score: val });
        } else if (val === 'ABS') {
          absentCount++;
        }
      });

      const avg = completedCount > 0 ? parseFloat((total / completedCount).toFixed(1)) : 0;
      const isAbsentAll = completedCount === 0 && absentCount > 0;

      // NECTA Division calculation using best 7 subjects
      let division: 'Division I' | 'Division II' | 'Division III' | 'Division IV' | 'Division 0' | 'ABS' = 'Division 0';
      let points = 0;

      if (isAbsentAll) {
        division = 'ABS';
      } else if (completedCount > 0) {
        const subResults = subjectEntries.map((s) => {
          const { grade, points: pts } = scoreToNectaGrade(s.score);
          return {
            code: '000',
            name: s.name,
            nameEn: s.name,
            score: s.score,
            grade,
            points: pts,
            remarks: '',
          };
        });
        const nectaCalc = calculateNectaDivision(subResults);
        division = nectaCalc.divisionFull as any;
        points = nectaCalc.points;
      }

      return {
        ...r,
        totalMarks: total,
        averageMarks: avg,
        division,
        points,
        completedSubjectsCount: completedCount,
        isAbsentAll,
      };
    });

    // Compute ranks based on averageMarks (descending)
    const sortedForRank = [...updated].sort((a, b) => b.averageMarks - a.averageMarks);
    const rankMap = new Map<string, number>();

    let currentRank = 1;
    for (let i = 0; i < sortedForRank.length; i++) {
      if (i > 0 && sortedForRank[i].averageMarks < sortedForRank[i - 1].averageMarks) {
        currentRank = i + 1;
      }
      rankMap.set(sortedForRank[i].examNumber, currentRank);
    }

    return updated.map((r) => ({
      ...r,
      rank: rankMap.get(r.examNumber) || r.rollNo,
    }));
  };

  // ----------------------------------------------------
  // 4. CELL EDITING & KEYBOARD NAVIGATION
  // ----------------------------------------------------
  const handleCellChange = (
    studentIndex: number,
    subjectName: string,
    rawVal: string
  ) => {
    // Authorization Check: Teachers can only edit their assigned subjects
    if (!isAdminOrAcademic && !assignedSubjects.includes(subjectName)) {
      setStatusMessage({
        type: 'error',
        text: `Huna mamlaka ya kubadilisha alama za somo la "${subjectName}". Masomo yako ni: ${assignedSubjects.join(', ')}.`,
      });
      return;
    }

    // Workflow Check: Cannot edit submitted, approved, or published results without authorized correction
    if ((workflowState === 'APPROVED' || workflowState === 'PUBLISHED') && !isCorrectionUnlocked) {
      setStatusMessage({
        type: 'error',
        text: 'Matokeo haya yameshaidhinishwa au kuchapishwa. Bofya kitufe cha "Idhinisha Marekebisho" (Authorize Correction) kuweka sababu rasmi kabla ya kubadilisha alama.',
      });
      return;
    }

    setSaveStatus('unsaved');
    setGridRows((prevRows) => {
      const copy = [...prevRows];
      const row = { ...copy[studentIndex] };
      const rowMarks = { ...row.marks };
      const rowErrors = { ...row.errors };

      const trimmed = rawVal.trim().toUpperCase();

      if (trimmed === '') {
        rowMarks[subjectName] = '';
        delete rowErrors[subjectName];
      } else if (trimmed === 'ABS' || trimmed === 'A' || trimmed === 'ABSENT') {
        rowMarks[subjectName] = 'ABS';
        delete rowErrors[subjectName];
      } else {
        const num = parseFloat(trimmed);
        if (isNaN(num)) {
          rowErrors[subjectName] = 'Weka namba 0-100 au ABS';
          rowMarks[subjectName] = trimmed as any;
        } else if (num < 0 || num > maxMarks) {
          rowErrors[subjectName] = `Alama lazima ziwe 0-${maxMarks}`;
          rowMarks[subjectName] = num;
        } else {
          rowMarks[subjectName] = num;
          delete rowErrors[subjectName];
        }
      }

      row.marks = rowMarks;
      row.errors = rowErrors;
      copy[studentIndex] = row;
      return recalculateAllRows(copy);
    });
  };

  // Keyboard navigation handler inside cell inputs
  const handleCellKeyDown = (
    studentIndex: number,
    subjectName: string,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const subjectIndex = activeSubjectColumns.findIndex((s) => s.name === subjectName);

    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      // Move to same column in next row
      if (studentIndex < gridRows.length - 1) {
        const nextId = `cell-${studentIndex + 1}-${subjectName}`;
        document.getElementById(nextId)?.focus();
        setFocusedCell({ studentIndex: studentIndex + 1, subjectKey: subjectName });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Move to same column in previous row
      if (studentIndex > 0) {
        const prevId = `cell-${studentIndex - 1}-${subjectName}`;
        document.getElementById(prevId)?.focus();
        setFocusedCell({ studentIndex: studentIndex - 1, subjectKey: subjectName });
      }
    } else if (e.key === 'Tab') {
      // Tab moves across subjects horizontally
      if (!e.shiftKey) {
        if (subjectIndex < activeSubjectColumns.length - 1) {
          e.preventDefault();
          const nextSubject = activeSubjectColumns[subjectIndex + 1].name;
          document.getElementById(`cell-${studentIndex}-${nextSubject}`)?.focus();
          setFocusedCell({ studentIndex, subjectKey: nextSubject });
        } else if (studentIndex < gridRows.length - 1) {
          e.preventDefault();
          const firstSubject = activeSubjectColumns[0].name;
          document.getElementById(`cell-${studentIndex + 1}-${firstSubject}`)?.focus();
          setFocusedCell({ studentIndex: studentIndex + 1, subjectKey: firstSubject });
        }
      } else {
        if (subjectIndex > 0) {
          e.preventDefault();
          const prevSubject = activeSubjectColumns[subjectIndex - 1].name;
          document.getElementById(`cell-${studentIndex}-${prevSubject}`)?.focus();
          setFocusedCell({ studentIndex, subjectKey: prevSubject });
        } else if (studentIndex > 0) {
          e.preventDefault();
          const lastSubject = activeSubjectColumns[activeSubjectColumns.length - 1].name;
          document.getElementById(`cell-${studentIndex - 1}-${lastSubject}`)?.focus();
          setFocusedCell({ studentIndex: studentIndex - 1, subjectKey: lastSubject });
        }
      }
    }
  };

  // ----------------------------------------------------
  // 5. RECTANGULAR COPY-PASTE FROM MICROSOFT EXCEL
  // ----------------------------------------------------
  const handleGridPaste = (
    startStudentIndex: number,
    startSubjectName: string,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const clipboardText = e.clipboardData.getData('text/plain');
    if (!clipboardText) return;

    // Check if clipboard contains multiple cells (tabs or newlines)
    const hasTabs = clipboardText.includes('\t');
    const hasNewlines = clipboardText.includes('\n');

    if (!hasTabs && !hasNewlines) {
      // Single cell paste; let standard input behavior handle it
      return;
    }

    e.preventDefault();

    const startSubjectIdx = activeSubjectColumns.findIndex((s) => s.name === startSubjectName);
    if (startSubjectIdx === -1) return;

    // Split rows and columns
    const rawRows = clipboardText
      .split(/\r?\n/)
      .map((row) => row.trimEnd())
      .filter((row) => row.length > 0);

    let pastedCellsCount = 0;
    let flaggedErrorsCount = 0;

    setGridRows((prevRows) => {
      const copy = [...prevRows];

      rawRows.forEach((rowStr, rowOffset) => {
        const targetRowIdx = startStudentIndex + rowOffset;
        if (targetRowIdx >= copy.length) return; // out of student row bounds

        const targetStudent = { ...copy[targetRowIdx] };
        const targetMarks = { ...targetStudent.marks };
        const targetErrors = { ...targetStudent.errors };

        const cellValues = rowStr.split('\t');

        cellValues.forEach((cellRaw, colOffset) => {
          const targetColIdx = startSubjectIdx + colOffset;
          if (targetColIdx >= activeSubjectColumns.length) return; // out of subject column bounds

          const subject = activeSubjectColumns[targetColIdx].name;

          // Authorization guard for teacher
          if (!isAdminOrAcademic && !assignedSubjects.includes(subject)) {
            return; // skip non-assigned subjects
          }

          const trimmed = cellRaw.trim().toUpperCase();
          pastedCellsCount++;

          if (trimmed === '' || trimmed === '-' || trimmed === '—') {
            targetMarks[subject] = '';
            delete targetErrors[subject];
          } else if (trimmed === 'ABS' || trimmed === 'A' || trimmed === 'ABSENT') {
            targetMarks[subject] = 'ABS';
            delete targetErrors[subject];
          } else {
            const num = parseFloat(trimmed);
            if (isNaN(num)) {
              targetErrors[subject] = 'Alama isiyo halali';
              targetMarks[subject] = trimmed as any;
              flaggedErrorsCount++;
            } else if (num < 0 || num > maxMarks) {
              targetErrors[subject] = `Zidisha ${maxMarks}`;
              targetMarks[subject] = num;
              flaggedErrorsCount++;
            } else {
              targetMarks[subject] = num;
              delete targetErrors[subject];
            }
          }
        });

        targetStudent.marks = targetMarks;
        targetStudent.errors = targetErrors;
        copy[targetRowIdx] = targetStudent;
      });

      return recalculateAllRows(copy);
    });

    setSaveStatus('unsaved');
    setStatusMessage({
      type: flaggedErrorsCount > 0 ? 'error' : 'success',
      text: `Umenakili na kubandika alama za seli ${pastedCellsCount} moja kwa moja kutoka Excel!${
        flaggedErrorsCount > 0 ? ` (Tahadhari: Seli ${flaggedErrorsCount} zimezidi kiwango au si namba)` : ''
      }`,
    });
  };

  // ----------------------------------------------------
  // 6. SAVE DRAFT & WORKFLOW SUBMISSION
  // ----------------------------------------------------
  const handleSaveDraft = async () => {
    setStatusMessage(null);
    setSaveStatus('saving');

    try {
      // Determine which subjects to save
      const subjectsToSave = viewMode === 'single' ? [activeSingleSubject] : activeSubjectColumns.map((s) => s.name);

      for (const subjName of subjectsToSave) {
        // Skip if teacher is not assigned to this subject
        if (!isAdminOrAcademic && !assignedSubjects.includes(subjName)) {
          continue;
        }

        const validScores = gridRows
          .filter((r) => typeof r.marks[subjName] === 'number')
          .map((r) => {
            const sc = r.marks[subjName] as number;
            const pct = (sc / maxMarks) * 100;
            const { grade, points, remarks } = scoreToNectaGrade(pct);
            return {
              examNumber: r.examNumber,
              studentName: r.fullName,
              gender: r.gender,
              score: sc,
              grade,
              points,
              remarks,
            };
          });

        if (validScores.length > 0) {
          const subInfo = OFFICIAL_NECTA_SUBJECTS.find((s) => s.name === subjName);
          await savePendingSubjectScoresToFirestore({
            subject: subjName,
            subjectCode: subInfo?.code || '000',
            form: selectedForm,
            stream: selectedStream,
            examType: selectedExamType,
            academicYear,
            term: selectedTerm,
            maxMarks,
            teacherName: userProfile?.fullName || 'Mwalimu wa Somo',
            teacherEmail: currentUserEmail || userProfile?.email || '',
            teacherId: userProfile?.uid || auth.currentUser?.uid || '',
            status: 'draft',
            scores: validScores,
          });
        }
      }

      setSaveStatus('saved');
      setStatusMessage({
        type: 'success',
        text: 'Rasimu ya matokeo imehifadhiwa salama kwenye mfumo wa shule bila kupoteza taarifa zozote!',
      });
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage({
        type: 'error',
        text: `Hitilafu ya kuhifadhi rasimu: ${err?.message || 'Mtandao ulikatika'}`,
      });
    }
  };

  // Submit to Academic Master for Certification
  const handleSubmitToAcademicMaster = async () => {
    const hasCellErrors = gridRows.some((r) => Object.keys(r.errors).length > 0);
    if (hasCellErrors) {
      setStatusMessage({
        type: 'error',
        text: 'Kuna seli zenye hitilafu za alama (zilizozidi 100 au herufi). Sahihisha seli zote zilizowekewa rangi nyekundu kabla ya kuwasilisha.',
      });
      return;
    }

    const confirmSubmit = window.confirm(
      `Je, una uhakika unataka kuwasilisha matokeo ya ${selectedForm} (${selectedExamType}) kwa Mkuu wa Taaluma kwa ajili ya ukaguzi rasmi? Baada ya kuwasilisha, hutaweza kubadilisha alama hadi utakapopewa idhini.`
    );
    if (!confirmSubmit) return;

    setIsSubmittingWorkflow(true);
    setStatusMessage(null);

    try {
      const subjectsToSubmit = viewMode === 'single' ? [activeSingleSubject] : activeSubjectColumns.map((s) => s.name);

      for (const subjName of subjectsToSubmit) {
        if (!isAdminOrAcademic && !assignedSubjects.includes(subjName)) {
          continue;
        }

        const validScores = gridRows
          .filter((r) => typeof r.marks[subjName] === 'number')
          .map((r) => {
            const sc = r.marks[subjName] as number;
            const pct = (sc / maxMarks) * 100;
            const { grade, points, remarks } = scoreToNectaGrade(pct);
            return {
              examNumber: r.examNumber,
              studentName: r.fullName,
              gender: r.gender,
              score: sc,
              grade,
              points,
              remarks,
            };
          });

        if (validScores.length > 0) {
          const subInfo = OFFICIAL_NECTA_SUBJECTS.find((s) => s.name === subjName);
          await savePendingSubjectScoresToFirestore({
            subject: subjName,
            subjectCode: subInfo?.code || '000',
            form: selectedForm,
            stream: selectedStream,
            examType: selectedExamType,
            academicYear,
            term: selectedTerm,
            maxMarks,
            teacherName: userProfile?.fullName || 'Mwalimu wa Somo',
            teacherEmail: currentUserEmail || userProfile?.email || '',
            teacherId: userProfile?.uid || auth.currentUser?.uid || '',
            status: 'pending', // Pending review by Academic Master
            scores: validScores,
          });
        }
      }

      // Log workflow submission to server
      try {
        await fetch('/api/academic/workflow/transition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form: selectedForm,
            examType: selectedExamType,
            academicYear,
            targetState: 'SUBMITTED',
            userEmail: currentUserEmail || userProfile?.email,
            userRole: userProfile?.role || 'teacher',
          }),
        });
      } catch {
        // Non-blocking fallback
      }

      setWorkflowState('SUBMITTED');
      setSaveStatus('saved');
      setStatusMessage({
        type: 'success',
        text: 'Matokeo yamewasilishwa kikamilifu kwa Mkuu wa Taaluma (Academic Master) kwa ukaguzi na uchambuzi.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Imeshindwa kuwasilisha matokeo: ${err?.message}`,
      });
    } finally {
      setIsSubmittingWorkflow(false);
    }
  };

  // Academic Master Certifies & Approves Results
  const handleAcademicMasterApprove = async () => {
    if (!isAdminOrAcademic) return;

    const confirmApprove = window.confirm(
      'Je, unathibitisha kuwa umechambua na kuidhinisha matokeo haya rasmi kwa ajili ya Shule ya Sekondari Uomboni?'
    );
    if (!confirmApprove) return;

    setIsSubmittingWorkflow(true);
    try {
      // Transition state on server
      await fetch('/api/academic/workflow/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: selectedForm,
          examType: selectedExamType,
          academicYear,
          targetState: 'APPROVED',
          userEmail: currentUserEmail || userProfile?.email,
          userRole: userProfile?.role || 'academic_master',
        }),
      });

      setWorkflowState('APPROVED');
      setStatusMessage({
        type: 'success',
        text: 'Matokeo yameidhinishwa rasmi na Mkuu wa Taaluma! Sasa yanaweza kuchapishwa au kutoa broadsheet.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Hitilafu ya kuidhinisha' });
    } finally {
      setIsSubmittingWorkflow(false);
    }
  };

  // Academic Master Returns Results with Notes for Corrections
  const handleAcademicMasterReturn = async (notes: string) => {
    if (!isAdminOrAcademic) return;
    if (!notes.trim()) {
      alert('Tafadhali weka maelezo ya kurejesha matokeo kwa mwalimu.');
      return;
    }

    setIsSubmittingWorkflow(true);
    try {
      await fetch('/api/academic/workflow/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: selectedForm,
          examType: selectedExamType,
          academicYear,
          targetState: 'DRAFT',
          userEmail: currentUserEmail || userProfile?.email,
          userRole: userProfile?.role || 'academic_master',
          reason: notes.trim(),
        }),
      });

      setWorkflowState('DRAFT');
      setWorkflowReturnNotes(notes.trim());
      setShowReturnModal(false);
      setReturnReasonInput('');
      setStatusMessage({
        type: 'info',
        text: 'Matokeo yamerejeshwa kwa mwalimu kwa ajili ya marekebisho pamoja na maelezo yako rasmi.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Hitilafu ya kurejesha' });
    } finally {
      setIsSubmittingWorkflow(false);
    }
  };

  // Authorize Correction for Approved / Published Marks
  const handleAuthorizeCorrection = async (reason: string) => {
    if (!isAdminOrAcademic) return;
    if (!reason.trim()) {
      alert('Tafadhali weka sababu ya kufanya marekebisho ya alama zilizoidhinishwa.');
      return;
    }

    setIsSubmittingWorkflow(true);
    try {
      await fetch('/api/auth/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'EXAM_MARKS_CORRECTED',
          identifier: currentUserEmail || userProfile?.email || 'admin',
          role: userProfile?.role || 'admin',
          success: true,
          details: `Msimamizi ameidhinisha marekebisho ya matokeo ya ${selectedForm} (${selectedExamType} - ${academicYear}). Sababu: ${reason.trim()}`,
        }),
      });

      setIsCorrectionUnlocked(true);
      setCorrectionReason(reason.trim());
      setShowCorrectionModal(false);
      setCorrectionReasonInput('');
      setStatusMessage({
        type: 'info',
        text: '✅ Mtiririko wa marekebisho umefunguliwa rasmi (Correction Mode Active). Sasa unaweza kubadilisha alama na kuhifadhi.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Hitilafu' });
    } finally {
      setIsSubmittingWorkflow(false);
    }
  };

  // Publish to Portal for Students & Parents
  const handlePublishResults = async () => {
    if (!isAdminOrAcademic) return;

    const confirmPublish = window.confirm(
      'Je, una uhakika unataka KUCHAPISHA matokeo haya ili yaonekane kwenye Portal ya Wanafunzi na Wazazi?'
    );
    if (!confirmPublish) return;

    setIsSubmittingWorkflow(true);
    try {
      // Save each student's result to published_results in Firestore
      for (const st of gridRows) {
        const studentSubjects = activeSubjectColumns.map((sub) => {
          const val = st.marks[sub.name];
          const sc = typeof val === 'number' ? val : 0;
          const { grade, points, remarks } = scoreToNectaGrade(sc);
          return {
            code: sub.code,
            name: sub.name,
            nameEn: sub.nameEn,
            marks: sc,
            score: sc,
            grade,
            points,
            remarks: val === 'ABS' ? 'ABS' : remarks,
          };
        });

        await savePublishedResult({
          studentId: st.studentId,
          examId: `${selectedForm}_${selectedExamType}_${academicYear}`.replace(/\s+/g, '_'),
          admissionNumber: st.admissionNumber,
          totalMarks: st.totalMarks,
          average: st.averageMarks,
          division: st.division,
          position: st.rank,
          subjects: studentSubjects as any,
          publishedBy: userProfile?.fullName || 'Mkuu wa Taaluma',
          publishedAt: new Date().toISOString(),
        });
      }

      await fetch('/api/academic/workflow/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: selectedForm,
          examType: selectedExamType,
          academicYear,
          targetState: 'PUBLISHED',
          userEmail: currentUserEmail || userProfile?.email,
          userRole: userProfile?.role || 'admin',
        }),
      });

      setWorkflowState('PUBLISHED');
      setStatusMessage({
        type: 'success',
        text: `Matokeo ya wanafunzi ${gridRows.length} yamechapishwa kikamilifu kwenye Portal ya Shule!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Hitilafu ya kuchapisha: ${err?.message}` });
    } finally {
      setIsSubmittingWorkflow(false);
    }
  };

  // ----------------------------------------------------
  // 7. EXCEL EXPORT FUNCTIONS (Requirement 3)
  // ----------------------------------------------------

  // 1. Download Blank/Pre-filled Excel Template
  const handleDownloadExcelTemplate = () => {
    const headers = [
      'ROLL_NO',
      'ADMISSION_NO',
      'EXAM_NUMBER_CNO',
      'STUDENT_NAME',
      'SEX',
      'FORM',
      'STREAM',
      ...activeSubjectColumns.map((s) => `${s.name.toUpperCase()} (Max: ${maxMarks})`),
    ];

    const dataRows = gridRows.map((r) => {
      const rowObj: Record<string, any> = {
        ROLL_NO: r.rollNo,
        ADMISSION_NO: r.admissionNumber,
        EXAM_NUMBER_CNO: r.examNumber,
        STUDENT_NAME: r.fullName,
        SEX: r.gender,
        FORM: selectedForm,
        STREAM: r.stream,
      };

      activeSubjectColumns.forEach((sub) => {
        rowObj[`${sub.name.toUpperCase()} (Max: ${maxMarks})`] =
          r.marks[sub.name] !== undefined ? r.marks[sub.name] : '';
      });

      return rowObj;
    });

    const ws = XLSX.utils.json_to_sheet(dataRows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marks_Template');

    const fileName = `UOMBONI_TEMPLATE_${selectedForm.replace(/\s+/g, '_')}_${selectedExamType.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // 2. Download Completed Marks Spreadsheet
  const handleDownloadCompletedMarksSpreadsheet = () => {
    const dataRows = gridRows.map((r) => {
      const rowObj: Record<string, any> = {
        ROLL_NO: r.rollNo,
        EXAM_NUMBER: r.examNumber,
        STUDENT_NAME: r.fullName,
        SEX: r.gender,
        FORM: selectedForm,
        STREAM: r.stream,
      };

      activeSubjectColumns.forEach((sub) => {
        const val = r.marks[sub.name];
        rowObj[sub.name.toUpperCase()] = val !== '' ? val : '—';
      });

      rowObj['TOTAL_MARKS'] = r.totalMarks;
      rowObj['AVERAGE'] = r.averageMarks;
      rowObj['DIVISION'] = r.division;
      rowObj['POINTS'] = r.points;
      rowObj['POSITION_RANK'] = r.rank;

      return rowObj;
    });

    const ws = XLSX.utils.json_to_sheet(dataRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Completed_Marks');

    const fileName = `UOMBONI_MARKS_${selectedForm.replace(/\s+/g, '_')}_${selectedExamType.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // 3. Download Class Broadsheet Summary (.xlsx)
  const handleDownloadClassBroadsheet = () => {
    const broadsheetRows = gridRows.map((r) => {
      const rowObj: Record<string, any> = {
        RANK: r.rank,
        CNO: r.examNumber,
        NAME: r.fullName,
        SEX: r.gender,
      };

      activeSubjectColumns.forEach((sub) => {
        const val = r.marks[sub.name];
        const grade = typeof val === 'number' ? scoreToNectaGrade(val).grade : val === 'ABS' ? 'ABS' : '—';
        rowObj[getNectaSubjectAbbr(sub)] = typeof val === 'number' ? `${val} (${grade})` : grade;
      });

      rowObj['TOTAL'] = r.totalMarks;
      rowObj['AVG%'] = r.averageMarks;
      rowObj['POINTS'] = r.points;
      rowObj['DIVISION'] = r.division;

      return rowObj;
    });

    const ws = XLSX.utils.json_to_sheet(broadsheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Broadsheet');

    const fileName = `BROADSHEET_${selectedForm.replace(/\s+/g, '_')}_${selectedExamType.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // 4. Download Best 10 and Last 10 Students Report
  const handleDownloadBestAndLastReport = () => {
    const sorted = [...gridRows].filter((r) => r.completedSubjectsCount > 0).sort((a, b) => b.averageMarks - a.averageMarks);
    const best10 = sorted.slice(0, 10).map((r, i) => ({
      CATEGORY: 'TOP 10 BEST PERFORMERS',
      POSITION: i + 1,
      CNO: r.examNumber,
      STUDENT_NAME: r.fullName,
      SEX: r.gender,
      AVERAGE_MARKS: r.averageMarks,
      TOTAL_MARKS: r.totalMarks,
      DIVISION: r.division,
      POINTS: r.points,
    }));

    const last10 = sorted.slice(-10).reverse().map((r, i) => ({
      CATEGORY: 'LAST 10 STUDENTS (NEED REMEDIATION)',
      POSITION: sorted.length - i,
      CNO: r.examNumber,
      STUDENT_NAME: r.fullName,
      SEX: r.gender,
      AVERAGE_MARKS: r.averageMarks,
      TOTAL_MARKS: r.totalMarks,
      DIVISION: r.division,
      POINTS: r.points,
    }));

    const ws = XLSX.utils.json_to_sheet([...best10, ...last10]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Best_Last_Performers');

    const fileName = `BEST_LAST_REPORT_${selectedForm.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // 5. Download Subject Performance Reports (.xlsx)
  const handleDownloadSubjectPerformanceReport = () => {
    const subjectStatsRows = activeSubjectColumns.map((sub) => {
      let satCount = 0;
      let countA = 0;
      let countB = 0;
      let countC = 0;
      let countD = 0;
      let countF = 0;
      let countAbs = 0;
      let totalScore = 0;
      let highestScore = 0;
      let lowestScore = maxMarks;

      gridRows.forEach((r) => {
        const val = r.marks[sub.name];
        if (typeof val === 'number') {
          satCount++;
          totalScore += val;
          if (val > highestScore) highestScore = val;
          if (val < lowestScore) lowestScore = val;

          const pct = (val / maxMarks) * 100;
          const { grade } = scoreToNectaGrade(pct);
          if (grade === 'A') countA++;
          else if (grade === 'B') countB++;
          else if (grade === 'C') countC++;
          else if (grade === 'D') countD++;
          else countF++;
        } else if (val === 'ABS') {
          countAbs++;
        }
      });

      const avgScore = satCount > 0 ? parseFloat((totalScore / satCount).toFixed(1)) : 0;
      const passCount = countA + countB + countC + countD;
      const passRate = satCount > 0 ? parseFloat(((passCount / satCount) * 100).toFixed(1)) : 0;
      const gpaPoints = countA * 1 + countB * 2 + countC * 3 + countD * 4 + countF * 5;
      const gpa = satCount > 0 ? parseFloat((gpaPoints / satCount).toFixed(2)) : 0;
      const subGrade = scoreToNectaGrade((avgScore / maxMarks) * 100).grade;

      return {
        SUBJECT_CODE: sub.code,
        SUBJECT_NAME: sub.name.toUpperCase(),
        TOTAL_STUDENTS_SAT: satCount,
        GRADE_A: countA,
        GRADE_B: countB,
        GRADE_C: countC,
        GRADE_D: countD,
        GRADE_F: countF,
        ABSENT_ABS: countAbs,
        TOTAL_PASSED: passCount,
        PASS_PERCENT: `${passRate}%`,
        AVERAGE_SCORE: avgScore,
        SUBJECT_GPA: gpa,
        OVERALL_GRADE: subGrade,
        HIGHEST_MARK: satCount > 0 ? highestScore : 0,
        LOWEST_MARK: satCount > 0 ? lowestScore : 0,
      };
    });

    const ws = XLSX.utils.json_to_sheet(subjectStatsRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subject_Performance');

    const fileName = `SUBJECT_PERFORMANCE_${selectedForm.replace(/\s+/g, '_')}_${selectedExamType.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ----------------------------------------------------
  // 8. EXCEL FILE IMPORT WITH PRE-VALIDATION PREVIEW
  // ----------------------------------------------------
  const handleFileSelectedForImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('Faili la Excel halina rekodi zozote (Empty spreadsheet).');
          return;
        }

        // Check if results are locked (Approved or Published) without authorized correction
        if ((workflowState === 'APPROVED' || workflowState === 'PUBLISHED') && !isCorrectionUnlocked) {
          alert('Matokeo ya mtihani huu yameshaidhinishwa au kuchapishwa. Huwezi kupakia faili jipya la Excel bila kufungua mtiririko rasmi wa marekebisho (Authorize Correction).');
          return;
        }

        const validList: Array<{
          rollNo?: number;
          admissionNumber: string;
          fullName: string;
          marks: Record<string, number | 'ABS'>;
        }> = [];

        const invalidList: Array<{
          rowNumber: number;
          rawIdentifier: string;
          rawName: string;
          errors: string[];
        }> = [];

        const seenStudentKeys = new Set<string>();

        rawJson.forEach((row, rowIdx) => {
          const keys = Object.keys(row);
          const findVal = (terms: string[]) => {
            const k = keys.find((key) => terms.some((t) => key.toLowerCase().includes(t.toLowerCase())));
            return k ? String(row[k]).trim() : '';
          };

          const rawId = findVal(['admission', 'id', 'roll', 'cno', 'exam', 'namba', 'index']);
          const rawName = findVal(['name', 'jina', 'mwanafunzi', 'student']);

          // Match student in class by Admission Number, CNO, or exact Name
          const matchedStudent = gridRows.find((st) => {
            const matchCno = rawId && st.examNumber.toLowerCase().includes(rawId.toLowerCase());
            const matchAdm = rawId && st.admissionNumber.toLowerCase().includes(rawId.toLowerCase());
            const matchName = rawName && (st.fullName.toLowerCase().includes(rawName.toLowerCase()) || rawName.toLowerCase().includes(st.fullName.toLowerCase()));
            return Boolean(matchCno || matchAdm || matchName);
          });

          const rowErrors: string[] = [];

          const cleanIdent = (rawId || rawName || '').toLowerCase().trim();
          if (cleanIdent && seenStudentKeys.has(cleanIdent)) {
            rowErrors.push(`Mwanafunzi huyu (${rawName || rawId}) amerudiwa zaidi ya mara moja kwenye faili la Excel (Duplicate entry in spreadsheet).`);
          } else if (cleanIdent) {
            seenStudentKeys.add(cleanIdent);
          }

          if (!matchedStudent) {
            rowErrors.push(`Mwanafunzi "${rawName || rawId || 'Hajulikani'}" hakupatikana kwenye darasa la ${selectedForm}`);
          }

          // Parse marks for subjects
          const parsedMarks: Record<string, number | 'ABS'> = {};

          OFFICIAL_NECTA_SUBJECTS.forEach((sub) => {
            const subKey = keys.find((k) => {
              const kl = k.toLowerCase();
              return kl.includes(sub.name.toLowerCase()) || kl.includes(getNectaSubjectAbbr(sub).toLowerCase());
            });

            if (subKey && row[subKey] !== '') {
              const rawVal = String(row[subKey]).trim().toUpperCase();
              if (rawVal === 'ABS' || rawVal === 'ABSENT' || rawVal === 'A') {
                parsedMarks[sub.name] = 'ABS';
              } else {
                const num = parseFloat(rawVal);
                if (isNaN(num)) {
                  rowErrors.push(`Somo la ${sub.name}: Alama "${rawVal}" si namba halali`);
                } else if (num < 0 || num > maxMarks) {
                  rowErrors.push(`Somo la ${sub.name}: Alama "${num}" imezidi kiwango cha juu (${maxMarks})`);
                } else {
                  parsedMarks[sub.name] = num;
                }
              }
            }
          });

          if (rowErrors.length > 0) {
            invalidList.push({
              rowNumber: rowIdx + 2, // header is row 1
              rawIdentifier: rawId || '—',
              rawName: rawName || '—',
              errors: rowErrors,
            });
          } else if (matchedStudent) {
            validList.push({
              rollNo: matchedStudent.rollNo,
              admissionNumber: matchedStudent.admissionNumber,
              fullName: matchedStudent.fullName,
              marks: parsedMarks,
            });
          }
        });

        // Set preview data and open modal
        setImportPreviewData({
          fileName: file.name,
          totalRows: rawJson.length,
          validRows: validList,
          invalidRows: invalidList,
        });
        setImportModalOpen(true);
      } catch (err: any) {
        alert(`Hitilafu ya kusoma faili la Excel: ${err?.message}`);
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Commit valid imported rows into grid
  const handleConfirmImport = () => {
    if (!importPreviewData || importPreviewData.validRows.length === 0) return;

    setGridRows((prevRows) => {
      const copy = [...prevRows];

      importPreviewData.validRows.forEach((imp) => {
        const studentIdx = copy.findIndex((r) => r.admissionNumber === imp.admissionNumber || r.fullName.toLowerCase() === imp.fullName.toLowerCase());
        if (studentIdx >= 0) {
          const currentStudent = { ...copy[studentIdx] };
          const updatedMarks = { ...currentStudent.marks, ...imp.marks };
          currentStudent.marks = updatedMarks;
          copy[studentIdx] = currentStudent;
        }
      });

      return recalculateAllRows(copy);
    });

    setSaveStatus('unsaved');
    setImportModalOpen(false);
    setStatusMessage({
      type: 'success',
      text: `Alama za wanafunzi ${importPreviewData.validRows.length} zimeingizwa kikamilifu kwenye jedwali! Bofya "Hifadhi Rasimu" ili kuhifadhi.`,
    });
    setImportPreviewData(null);
  };

  // ----------------------------------------------------
  // 9. FILTERING & SORTING LOGIC FOR DISPLAY
  // ----------------------------------------------------
  const filteredAndSortedRows = useMemo(() => {
    let result = [...gridRows];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.admissionNumber.toLowerCase().includes(q) ||
          r.examNumber.toLowerCase().includes(q)
      );
    }

    // Gender filter
    if (genderFilter !== 'ALL') {
      result = result.filter((r) => r.gender === genderFilter);
    }

    // Status filter
    if (statusFilter === 'complete') {
      result = result.filter((r) => r.completedSubjectsCount >= activeSubjectColumns.length);
    } else if (statusFilter === 'incomplete') {
      result = result.filter((r) => r.completedSubjectsCount < activeSubjectColumns.length && !r.isAbsentAll);
    } else if (statusFilter === 'has_errors') {
      result = result.filter((r) => Object.keys(r.errors).length > 0);
    } else if (statusFilter === 'absent') {
      result = result.filter((r) => r.isAbsentAll);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'roll') {
        comparison = a.rollNo - b.rollNo;
      } else if (sortBy === 'name') {
        comparison = a.fullName.localeCompare(b.fullName);
      } else if (sortBy === 'cno') {
        comparison = a.examNumber.localeCompare(b.examNumber);
      } else if (sortBy === 'total') {
        comparison = b.totalMarks - a.totalMarks;
      } else if (sortBy === 'rank') {
        comparison = a.rank - b.rank;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [gridRows, searchQuery, genderFilter, statusFilter, sortBy, sortOrder, activeSubjectColumns]);

  // Overall class statistics summary
  const classSummaryStats = useMemo(() => {
    const total = gridRows.length;
    const completed = gridRows.filter((r) => r.completedSubjectsCount >= activeSubjectColumns.length).length;
    const incomplete = gridRows.filter((r) => r.completedSubjectsCount > 0 && r.completedSubjectsCount < activeSubjectColumns.length).length;
    const absent = gridRows.filter((r) => r.isAbsentAll).length;
    const scoredStudents = gridRows.filter((r) => r.completedSubjectsCount > 0);

    const classAverage = scoredStudents.length > 0
      ? (scoredStudents.reduce((acc, r) => acc + r.averageMarks, 0) / scoredStudents.length).toFixed(1)
      : '0.0';

    const div1Count = gridRows.filter((r) => r.division === 'Division I').length;
    const div2Count = gridRows.filter((r) => r.division === 'Division II').length;
    const div3Count = gridRows.filter((r) => r.division === 'Division III').length;
    const div4Count = gridRows.filter((r) => r.division === 'Division IV').length;
    const div0Count = gridRows.filter((r) => r.division === 'Division 0').length;

    return {
      total,
      completed,
      incomplete,
      absent,
      classAverage,
      div1Count,
      div2Count,
      div3Count,
      div4Count,
      div0Count,
    };
  }, [gridRows, activeSubjectColumns]);

  // Subject performance statistics for each active column (Subject Averages & Pass Rates)
  const subjectAverages = useMemo(() => {
    const stats: Record<string, { avg: number; count: number; passRate: number; highest: number; lowest: number }> = {};
    activeSubjectColumns.forEach((sub) => {
      let sum = 0;
      let count = 0;
      let passes = 0;
      let highest = 0;
      let lowest = maxMarks;

      gridRows.forEach((r) => {
        const val = r.marks[sub.name];
        if (typeof val === 'number') {
          sum += val;
          count++;
          if (val >= 30) passes++;
          if (val > highest) highest = val;
          if (val < lowest) lowest = val;
        }
      });

      stats[sub.name] = {
        avg: count > 0 ? parseFloat((sum / count).toFixed(1)) : 0,
        count,
        passRate: count > 0 ? parseFloat(((passes / count) * 100).toFixed(1)) : 0,
        highest: count > 0 ? highest : 0,
        lowest: count > 0 ? lowest : 0,
      };
    });
    return stats;
  }, [gridRows, activeSubjectColumns, maxMarks]);

  // ----------------------------------------------------
  // 10. RENDER
  // ----------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Hidden File Input for Excel Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls,.csv"
        onChange={handleFileSelectedForImport}
        className="hidden"
      />

      {/* TOP HEADER: Title, Workflow State & Primary Action Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-[#102A43] flex items-center gap-2 font-serif">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Mfumo wa Matokeo Mtindo wa Excel (Results Management System)</span>
              </h2>

              {/* Workflow Status Badge */}
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-black tracking-wide uppercase border flex items-center gap-1.5 ${
                  workflowState === 'DRAFT'
                    ? 'bg-slate-100 text-slate-800 border-slate-300'
                    : workflowState === 'SUBMITTED'
                    ? 'bg-blue-50 text-blue-800 border-blue-300 animate-pulse'
                    : workflowState === 'APPROVED'
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Hatua: {workflowState}</span>
              </span>

              {/* Save Status Live Indicator */}
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : saveStatus === 'saving'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : saveStatus === 'unsaved'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    saveStatus === 'saved'
                      ? 'bg-emerald-500'
                      : saveStatus === 'saving'
                      ? 'bg-blue-500 animate-spin'
                      : saveStatus === 'unsaved'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
                <span>
                  {saveStatus === 'saved'
                    ? 'Imehifadhiwa (Saved)'
                    : saveStatus === 'saving'
                    ? 'Inahifadhi...'
                    : saveStatus === 'unsaved'
                    ? 'Haijahifadhiwa (Unsaved)'
                    : 'Hitilafu ya Kuhifadhi'}
                </span>
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Jedwali shirikishi lenye uwezo wa kunakili na kubandika safu za alama kutoka Excel, uhakiki wa kiotomatiki, na daraja za NECTA.
            </p>
          </div>

          {/* Action Buttons: Import, Export, Save, Submit */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Download Template */}
            <button
              onClick={handleDownloadExcelTemplate}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300 shadow-2xs"
              title="Pakua kielelezo cha Excel chenye majina ya wanafunzi"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Pakua Template</span>
            </button>

            {/* Import from Excel / CSV */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-emerald-300 shadow-2xs"
              title="Pakia alama kutoka faili la Excel au CSV lenye preview kabla ya kuhifadhi"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pakia Excel (.xlsx)</span>
            </button>

            {/* Export Dropdown Options */}
            <div className="relative group">
              <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300 shadow-2xs">
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>Ripoti za Excel</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              <div className="hidden group-hover:block absolute right-0 top-full pt-1 z-40 w-56">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 text-xs">
                  <button
                    onClick={handleDownloadCompletedMarksSpreadsheet}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pakua Jedwali la Alama (.xlsx)</span>
                  </button>
                  <button
                    onClick={handleDownloadClassBroadsheet}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Broadsheet ya Darasa (.xlsx)</span>
                  </button>
                  <button
                    onClick={handleDownloadBestAndLastReport}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Best 10 na Last 10 (.xlsx)</span>
                  </button>
                  <button
                    onClick={handleDownloadSubjectPerformanceReport}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-slate-700 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ripoti ya Masomo (Subjects .xlsx)</span>
                  </button>
                  {onOpenReportPrint && (
                    <button
                      onClick={() => onOpenReportPrint(selectedForm, selectedExamType)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl text-slate-700 font-bold flex items-center gap-2 cursor-pointer border-t border-slate-100"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-600" />
                      <span>Ukurasa wa Kuchapa (Print A4)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Save Draft Button */}
            <button
              onClick={handleSaveDraft}
              disabled={saveStatus === 'saving'}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#102A43] rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border border-slate-300 shadow-2xs"
            >
              <Save className="w-4 h-4 text-slate-600" />
              <span>Hifadhi Rasimu</span>
            </button>

            {/* Workflow Action: Submit or Approve */}
            {workflowState === 'DRAFT' && (
              <button
                onClick={handleSubmitToAcademicMaster}
                disabled={isSubmittingWorkflow}
                className="px-5 py-2 bg-[#102A43] hover:bg-[#0A1C2E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#C9A227]" />
                <span>Wasilisha kwa Mtaaluma</span>
              </button>
            )}

            {workflowState === 'SUBMITTED' && isAdminOrAcademic && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAcademicMasterApprove}
                  disabled={isSubmittingWorkflow}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-purple-300" />
                  <span>Idhinisha (Approve)</span>
                </button>
                <button
                  onClick={() => setShowReturnModal(true)}
                  disabled={isSubmittingWorkflow}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Rejesha kwa Mwalimu</span>
                </button>
              </div>
            )}

            {workflowState === 'APPROVED' && isAdminOrAcademic && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePublishResults}
                  disabled={isSubmittingWorkflow}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Award className="w-4 h-4 text-emerald-300" />
                  <span>Chapisha (Publish)</span>
                </button>
                <button
                  onClick={() => setShowCorrectionModal(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 cursor-pointer"
                  title="Weka sababu rasmi ya kurekebisha matokeo yaliyoidhinishwa"
                >
                  {isCorrectionUnlocked ? '🔓 Marekebisho Yapo Wazi' : 'Rekebisha Alama'}
                </button>
              </div>
            )}

            {workflowState === 'PUBLISHED' && isAdminOrAcademic && (
              <button
                onClick={() => setShowCorrectionModal(true)}
                className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold border border-amber-300 cursor-pointer flex items-center gap-1.5"
                title="Weka sababu rasmi ya kurekebisha matokeo yaliyochapishwa"
              >
                <span>{isCorrectionUnlocked ? '🔓 Mode ya Marekebisho (Unlocked)' : 'Idhinisha Marekebisho ya Alama'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Workflow Return Notes if Returned */}
        {workflowReturnNotes && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-800 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Maelezo ya Marekebisho kutoka kwa Mkuu wa Taaluma:
            </span>
            <p className="bg-white/80 p-2.5 rounded-xl border border-amber-200 italic">
              &ldquo;{workflowReturnNotes}&rdquo;
            </p>
          </div>
        )}

        {/* FILTER & SELECTORS CONTROL BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* 1. Academic Year */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              1. Mwaka wa Masomo:
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
            >
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
              <option value="2024/2025">2024/2025</option>
            </select>
          </div>

          {/* 2. Term */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              2. Muhula:
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
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
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
            >
              <option value="ALL">Mikondo Yote (All Streams)</option>
              <option value="A">Stream A</option>
              <option value="B">Stream B</option>
              <option value="Science">Science Stream</option>
              <option value="Arts">Arts Stream</option>
            </select>
          </div>

          {/* 5. Exam Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              5. Aina ya Mtihani:
            </label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#102A43] focus:outline-none focus:border-[#102A43]"
            >
              <option value="Jaribio la Mwezi (Monthly Test)">Jaribio la Mwezi (Monthly Test)</option>
              <option value="Mtihani wa Nusu Muhula (Mid-Term Exam)">Mtihani wa Nusu Muhula (Mid-Term)</option>
              <option value="Mtihani wa Muhula (Terminal Exam)">Mtihani wa Muhula (Terminal)</option>
              <option value="Mtihani wa Mwaka (Annual Exam)">Mtihani wa Mwaka (Annual Exam)</option>
              <option value="NECTA Mock 2025">NECTA Mock 2025</option>
              <option value="Pre-NECTA 2025">Pre-NECTA 2025</option>
            </select>
          </div>

          {/* 6. Mode Switcher (Master Grid vs Single Subject) */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              6. Mtindo wa Jedwali:
            </label>
            <div className="inline-flex w-full p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('master')}
                className={`flex-1 py-1 rounded-lg text-center font-bold text-[11px] transition cursor-pointer ${
                  viewMode === 'master'
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#102A43]'
                }`}
              >
                Masomo Yote
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`flex-1 py-1 rounded-lg text-center font-bold text-[11px] transition cursor-pointer ${
                  viewMode === 'single'
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#102A43]'
                }`}
              >
                Somo Moja
              </button>
            </div>
          </div>
        </div>

        {/* Single Subject Picker if in Single Subject Mode */}
        {viewMode === 'single' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-700">Chagua Somo la Kuingiza Alama:</span>
            <select
              value={activeSingleSubject}
              onChange={(e) => setActiveSingleSubject(e.target.value)}
              className="px-3 py-1.5 bg-amber-50 border-2 border-amber-400 rounded-xl font-black text-[#102A43] focus:outline-none"
            >
              {OFFICIAL_NECTA_SUBJECTS.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.code}) {assignedSubjects.includes(s.name) ? '★ Somo Lako' : ''}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500">
              Kiwango cha Juu (Max): <strong>{maxMarks}</strong>
            </span>
          </div>
        )}
      </div>

      {/* CLASS PERFORMANCE SUMMARY PILL & QUICK METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Jumla ya Wanafunzi</span>
          <span className="text-xl font-black text-[#102A43]">{classSummaryStats.total}</span>
          <span className="text-[10px] text-slate-400 block">{selectedForm} {selectedStream}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Wenye Alama Kamili</span>
          <span className="text-xl font-black text-emerald-700">{classSummaryStats.completed}</span>
          <span className="text-[10px] text-emerald-600 font-bold">100% Kamili</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Zinazokosekana</span>
          <span className={`text-xl font-black ${classSummaryStats.incomplete > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {classSummaryStats.incomplete}
          </span>
          <span className="text-[10px] text-slate-400 block">Zinahitaji kujazwa</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Wastani wa Darasa</span>
          <span className="text-xl font-black text-blue-700">{classSummaryStats.classAverage}%</span>
          <span className="text-[10px] text-blue-600 font-bold">Class Average</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Watahiniwa Div I &amp; II</span>
          <span className="text-xl font-black text-purple-700">
            {classSummaryStats.div1Count + classSummaryStats.div2Count}
          </span>
          <span className="text-[10px] text-purple-600 font-bold">
            I: {classSummaryStats.div1Count} | II: {classSummaryStats.div2Count}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Div III, IV &amp; 0</span>
          <span className="text-xl font-black text-slate-700">
            {classSummaryStats.div3Count + classSummaryStats.div4Count + classSummaryStats.div0Count}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            III: {classSummaryStats.div3Count} | IV: {classSummaryStats.div4Count} | 0: {classSummaryStats.div0Count}
          </span>
        </div>
      </div>

      {/* SEARCH, FILTER, AND KEYBOARD SHORTCUTS BAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tafuta jina au namba ya mtihani..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#102A43]"
            />
          </div>

          {/* Gender Filter */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {(['ALL', 'M', 'F'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                  genderFilter === g
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#102A43]'
                }`}
              >
                {g === 'ALL' ? 'Wote' : g === 'M' ? 'Wavulana (M)' : 'Wasichana (F)'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
          >
            <option value="ALL">Hali Yoyote</option>
            <option value="complete">Zilizokamilika Pekee</option>
            <option value="incomplete">Zenye Alama Zinazokosekana</option>
            <option value="has_errors">Zenye Hitilafu Pekee</option>
            <option value="absent">Wasiokuwepo (ABS)</option>
          </select>
        </div>

        {/* Keyboard Helper Tooltip */}
        <div className="text-[11px] text-slate-500 hidden md:flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">Tab</span>
          <span>= Kwenda Kulia</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">Enter / &darr;</span>
          <span>= Mstari Unaofuata</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 font-mono font-bold text-emerald-900">Ctrl+V</span>
          <span>= Bandika safu za Excel!</span>
        </div>
      </div>

      {/* THE INTERACTIVE SPREADSHEET GRID */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[650px] relative scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            {/* STICKY TABLE HEADER */}
            <thead className="bg-[#102A43] text-white font-bold uppercase text-[10px] tracking-wider sticky top-0 z-30 shadow-xs">
              <tr>
                {/* Frozen Columns */}
                <th className="px-3 py-3.5 w-12 text-center sticky left-0 z-40 bg-[#102A43] border-r border-slate-700">
                  #
                </th>
                <th className="px-3 py-3.5 w-32 sticky left-12 z-40 bg-[#102A43] border-r border-slate-700">
                  Namba ya Mtihani (CNO)
                </th>
                <th className="px-4 py-3.5 w-48 sticky left-44 z-40 bg-[#102A43] border-r border-slate-700">
                  Jina Kamili la Mwanafunzi
                </th>
                <th className="px-2 py-3.5 w-12 text-center border-r border-slate-700">
                  Jinsia
                </th>

                {/* Subject Columns */}
                {activeSubjectColumns.map((sub) => {
                  const isAssigned = assignedSubjects.includes(sub.name);
                  return (
                    <th
                      key={sub.name}
                      className={`px-2 py-3.5 text-center min-w-[90px] border-r border-slate-700 transition ${
                        isAssigned ? 'bg-[#0f3458]' : 'bg-[#102A43]'
                      }`}
                      title={`${sub.name} (${sub.code}) - Max Marks: ${maxMarks}`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-amber-300 font-black">{getNectaSubjectAbbr(sub)}</span>
                        <span className="text-[8px] text-slate-300 truncate max-w-[80px]">{sub.name}</span>
                        <span className="text-[8px] text-slate-400 font-mono">({maxMarks})</span>
                      </div>
                    </th>
                  );
                })}

                {/* Auto Calculated Summary Columns */}
                <th className="px-3 py-3.5 text-center w-20 bg-[#0A1C2E] border-r border-slate-700">
                  Jumla (Total)
                </th>
                <th className="px-3 py-3.5 text-center w-16 bg-[#0A1C2E] border-r border-slate-700">
                  Wastani %
                </th>
                <th className="px-3 py-3.5 text-center w-24 bg-[#0A1C2E] border-r border-slate-700">
                  Daraja (Div)
                </th>
                <th className="px-3 py-3.5 text-center w-16 bg-[#0A1C2E] border-r border-slate-700">
                  Points
                </th>
                <th className="px-3 py-3.5 text-center w-16 bg-[#0A1C2E]">
                  Nafasi (Rank)
                </th>
              </tr>
            </thead>

            {/* SPREADSHEET ROWS */}
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeSubjectColumns.length + 8}
                    className="p-12 text-center text-slate-400 text-xs"
                  >
                    Hakuna wanafunzi waliopatikana kwa vigezo hivi vya darasa ({selectedForm}).
                  </td>
                </tr>
              ) : (
                filteredAndSortedRows.map((student, sIdx) => {
                  return (
                    <tr
                      key={student.examNumber}
                      className="hover:bg-blue-50/40 transition group"
                    >
                      {/* Frozen Roll Number */}
                      <td className="px-3 py-2 text-center font-mono text-slate-400 font-bold sticky left-0 z-20 bg-white group-hover:bg-blue-50/40 border-r border-slate-200">
                        {student.rollNo}
                      </td>

                      {/* Frozen Exam Number (CNO) */}
                      <td className="px-3 py-2 font-mono font-bold text-slate-800 text-[11px] sticky left-12 z-20 bg-white group-hover:bg-blue-50/40 border-r border-slate-200 truncate">
                        {student.examNumber}
                      </td>

                      {/* Frozen Student Full Name */}
                      <td className="px-4 py-2 font-bold text-[#102A43] sticky left-44 z-20 bg-white group-hover:bg-blue-50/40 border-r border-slate-200">
                        <div className="truncate max-w-[170px]" title={student.fullName}>
                          {student.fullName}
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="px-2 py-2 text-center border-r border-slate-200">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            student.gender === 'F' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>

                      {/* Editable Subject Cells */}
                      {activeSubjectColumns.map((sub) => {
                        const cellVal = student.marks[sub.name];
                        const cellError = student.errors[sub.name];
                        const cellId = `cell-${sIdx}-${sub.name}`;
                        const isAssigned = isAdminOrAcademic || assignedSubjects.includes(sub.name);
                        const isReadOnly = !isAssigned || ((workflowState === 'APPROVED' || workflowState === 'PUBLISHED') && !isCorrectionUnlocked);

                        return (
                          <td
                            key={sub.name}
                            className={`p-1 text-center border-r border-slate-200 relative ${
                              cellError ? 'bg-rose-50/60' : ''
                            }`}
                          >
                            <input
                              id={cellId}
                              type="text"
                              value={cellVal !== undefined ? cellVal : ''}
                              placeholder="—"
                              disabled={isReadOnly}
                              onChange={(e) => handleCellChange(sIdx, sub.name, e.target.value)}
                              onKeyDown={(e) => handleCellKeyDown(sIdx, sub.name, e)}
                              onPaste={(e) => handleGridPaste(sIdx, sub.name, e)}
                              onFocus={() => setFocusedCell({ studentIndex: sIdx, subjectKey: sub.name })}
                              className={`w-full h-8 px-1.5 text-center font-mono font-bold text-xs rounded-lg transition-all focus:outline-none ${
                                isReadOnly
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : cellError
                                  ? 'border-2 border-rose-500 bg-rose-50 text-rose-950 ring-1 ring-rose-400'
                                  : cellVal === 'ABS'
                                  ? 'border border-rose-300 bg-rose-100 text-rose-900 font-black'
                                  : typeof cellVal === 'number'
                                  ? 'border border-emerald-300 bg-emerald-50/40 text-emerald-950 focus:border-emerald-600 focus:bg-white'
                                  : 'border border-slate-200 bg-white text-slate-700 focus:border-blue-500'
                              }`}
                              title={
                                cellError ||
                                (!isAssigned
                                  ? 'Huna ruhusa ya kuhariri somo hili (Somo halijapangiwa kwako)'
                                  : `${sub.name}: ${cellVal !== '' ? cellVal : 'Hakuna alama'}`)
                              }
                            />
                            {cellError && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white" />
                            )}
                          </td>
                        );
                      })}

                      {/* Total Marks */}
                      <td className="px-3 py-2 text-center font-mono font-black text-slate-800 bg-slate-50/50 border-r border-slate-200">
                        {student.completedSubjectsCount > 0 ? student.totalMarks : '—'}
                      </td>

                      {/* Average % */}
                      <td className="px-3 py-2 text-center font-mono font-black text-blue-700 bg-slate-50/50 border-r border-slate-200">
                        {student.completedSubjectsCount > 0 ? `${student.averageMarks}%` : '—'}
                      </td>

                      {/* Division */}
                      <td className="px-3 py-2 text-center bg-slate-50/50 border-r border-slate-200">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            student.division === 'Division I'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : student.division === 'Division II'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : student.division === 'Division III'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : student.division === 'Division IV'
                              ? 'bg-orange-100 text-orange-900 border border-orange-300'
                              : student.division === 'ABS'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {student.division}
                        </span>
                      </td>

                      {/* Points */}
                      <td className="px-3 py-2 text-center font-mono font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                        {student.completedSubjectsCount > 0 ? student.points : '—'}
                      </td>

                      {/* Position / Rank */}
                      <td className="px-3 py-2 text-center font-mono font-black text-purple-800 bg-slate-50/50">
                        #{student.rank}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* STICKY TABLE FOOTER: Subject Averages, Pass Rates & Statistics */}
            <tfoot className="bg-slate-100 font-bold sticky bottom-0 z-20 shadow-md border-t-2 border-slate-300">
              {/* Row 1: Wastani wa Somo (Subject Average %) */}
              <tr className="bg-slate-100 text-slate-800 text-[11px]">
                <td
                  colSpan={4}
                  className="px-3 py-2 text-right font-black border-r border-slate-300 uppercase tracking-wider sticky left-0 z-30 bg-slate-100 text-[#102A43]"
                >
                  Wastani wa Somo (Avg %):
                </td>
                {activeSubjectColumns.map((sub) => {
                  const sStat = subjectAverages[sub.name];
                  return (
                    <td
                      key={sub.name}
                      className="px-2 py-2 text-center font-mono font-black text-blue-900 border-r border-slate-300 bg-blue-50/70"
                      title={`${sub.name}: Wastani ${sStat?.avg || 0}%, Waliofanya: ${sStat?.count || 0}`}
                    >
                      {sStat && sStat.count > 0 ? `${sStat.avg}%` : '—'}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center font-mono font-black bg-slate-200 border-r border-slate-300">—</td>
                <td className="px-3 py-2 text-center font-mono font-black text-blue-900 bg-slate-200 border-r border-slate-300">
                  {classSummaryStats.classAverage}%
                </td>
                <td colSpan={3} className="px-3 py-2 bg-slate-200 text-slate-500 font-mono text-center text-[10px]">
                  Wastani wa Darasa
                </td>
              </tr>

              {/* Row 2: Kiwango cha Ufaulu (Pass Rate %) */}
              <tr className="bg-slate-50 text-slate-700 text-[10px]">
                <td
                  colSpan={4}
                  className="px-3 py-1.5 text-right font-bold border-r border-slate-300 uppercase tracking-wider sticky left-0 z-30 bg-slate-50 text-emerald-900"
                >
                  Kiwango cha Ufaulu (Pass %):
                </td>
                {activeSubjectColumns.map((sub) => {
                  const sStat = subjectAverages[sub.name];
                  return (
                    <td
                      key={sub.name}
                      className="px-2 py-1.5 text-center font-mono font-bold text-emerald-800 border-r border-slate-300 bg-emerald-50/70"
                      title={`${sub.name}: Ufaulu ${sStat?.passRate || 0}%`}
                    >
                      {sStat && sStat.count > 0 ? `${sStat.passRate}%` : '—'}
                    </td>
                  );
                })}
                <td colSpan={5} className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold text-center">
                  Wanafunzi {classSummaryStats.completed} kati ya {classSummaryStats.total} wamekamilika
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* EXCEL IMPORT PRE-VALIDATION PREVIEW MODAL */}
      {importModalOpen && importPreviewData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-serif text-lg font-black text-[#102A43] flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Uhakiki wa Faili la Excel Kabla ya Kuingiza (Import Preview)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Faili: <strong>{importPreviewData.fileName}</strong> • Jumla ya safu: {importPreviewData.totalRows}
                </p>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Validation Breakdown Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Safu Zote Zilizosomwa:</span>
                <p className="text-xl font-black text-[#102A43]">{importPreviewData.totalRows}</p>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-300">
                <span className="text-emerald-800 text-[10px] uppercase font-bold">Safu Halali (Tayari Kuingizwa):</span>
                <p className="text-xl font-black text-emerald-800">{importPreviewData.validRows.length}</p>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                importPreviewData.invalidRows.length > 0
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <span className="text-[10px] uppercase font-bold">Safu Zenye Hitilafu (Zitakataliwa):</span>
                <p className="text-xl font-black">{importPreviewData.invalidRows.length}</p>
              </div>
            </div>

            {/* Invalid Rows Explanation Table */}
            {importPreviewData.invalidRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Orodha ya Hitilafu Zilizogunduliwa (Hazitaingizwa):</span>
                </div>
                <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-3 max-h-48 overflow-y-auto text-xs space-y-1.5 divide-y divide-rose-200">
                  {importPreviewData.invalidRows.map((inv, idx) => (
                    <div key={idx} className="pt-1.5 first:pt-0">
                      <span className="font-bold text-rose-950">Mstari {inv.rowNumber} ({inv.rawName || inv.rawIdentifier}):</span>
                      <ul className="list-disc pl-5 text-[11px] text-rose-800 mt-0.5">
                        {inv.errors.map((err, eIdx) => (
                          <li key={eIdx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valid Rows Sample Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Mfano wa Wanafunzi Halali Wanaoingizwa:</span>
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-40 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Namba</th>
                      <th className="px-3 py-2">Jina la Mwanafunzi</th>
                      <th className="px-3 py-2">Masomo Yaliyopatikana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreviewData.validRows.slice(0, 5).map((vr, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 font-mono text-slate-600">{vr.admissionNumber}</td>
                        <td className="px-3 py-1.5 font-bold text-[#102A43]">{vr.fullName}</td>
                        <td className="px-3 py-1.5 text-slate-500 font-mono">
                          {Object.keys(vr.marks).length} masomo
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Ghairi (Cancel)
              </button>
              <button
                type="button"
                disabled={importPreviewData.validRows.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Thibitisha na Ingiza Wanafunzi ({importPreviewData.validRows.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN FOR CORRECTIONS MODAL (Academic Master) */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-[#102A43]">Rejesha Matokeo kwa Mwalimu</h3>
                  <p className="text-xs text-slate-500">Mpe mwalimu maelezo mahususi ya kile anachotakiwa kusahihisha</p>
                </div>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Maoni na Maelekezo ya Marekebisho (Return Notes):
              </label>
              <textarea
                value={returnReasonInput}
                onChange={(e) => setReturnReasonInput(e.target.value)}
                placeholder="Mfano: Tafadhali sahihisha alama za wanafunzi 3 ambao hawakuwekewa alama za somo la Civics..."
                rows={4}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#102A43]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Ghairi
              </button>
              <button
                onClick={() => handleAcademicMasterReturn(returnReasonInput)}
                disabled={isSubmittingWorkflow || !returnReasonInput.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Wasilisha na Rejesha Matokeo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHORIZED CORRECTION MODAL (Post-Approval Marks Correction) */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-900">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-[#102A43]">Idhinisha Marekebisho ya Matokeo</h3>
                  <p className="text-xs text-slate-500">Marekebisho baada ya kuidhinisha au kuchapisha yanahitaji sababu rasmi</p>
                </div>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
              <strong>Tahadhari ya Kiutawala:</strong> Kila mabadiliko ya alama yaliyoidhinishwa hurekodiwa kwenye Daftari Rasmi la Usalama (Audit Log) pamoja na tarehe, jina la mtumiaji, na IP anwani.
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Sababu ya Kufanya Marekebisho (Reason for Correction):
              </label>
              <textarea
                value={correctionReasonInput}
                onChange={(e) => setCorrectionReasonInput(e.target.value)}
                placeholder="Mfano: Kusahihisha alama ya mtihani wa Physics kwa mwanafunzi Juma baada ya rufaa na ukaguzi wa script..."
                rows={4}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#102A43]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Ghairi
              </button>
              <button
                onClick={() => handleAuthorizeCorrection(correctionReasonInput)}
                disabled={isSubmittingWorkflow || !correctionReasonInput.trim()}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Idhinisha na Fungua Marekebisho</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
