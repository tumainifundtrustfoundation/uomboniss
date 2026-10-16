import React, { useState, useMemo, useEffect } from 'react';
import {
  Upload,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Save,
  FileSpreadsheet,
  Download,
  Search,
  Check,
  ShieldCheck,
  Clock,
  RefreshCw,
  Eye,
  FileText,
  UserCheck,
  Sliders,
  Award,
  Sparkles,
  ArrowRight,
  Database,
  CloudCheck,
  CheckCheck,
  Lock,
  Unlock,
  BellRing,
  Megaphone,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  OFFICIAL_NECTA_SUBJECTS,
  scoreToNectaGrade,
  formatCno,
} from '../utils/nectaResultsEngine';
import {
  savePendingSubjectScoresToFirestore,
  getPendingSubjectSubmissionsFromFirestore,
} from '../services/academicFirestoreService';
import { PendingSubjectSubmission } from '../types';

interface TeacherSubjectScoreUploadFormProps {
  currentTeacherName?: string;
  currentTeacherEmail?: string;
  assignedSubjects?: string[];
  onOpenResultsPreview?: () => void;
  onSubmissionSuccess?: (submissionId: string) => void;
  isAcademicMaster?: boolean;
}

export const TeacherSubjectScoreUploadForm: React.FC<TeacherSubjectScoreUploadFormProps> = ({
  currentTeacherName = 'Mwl. Yohana Bahati',
  currentTeacherEmail = 'yohana.bahati@uombonisec.ac.tz',
  assignedSubjects = ['Chemistry', 'Biology', 'Physics'],
  onOpenResultsPreview,
  onSubmissionSuccess,
  isAcademicMaster = false,
}) => {
  const { language } = useLanguage();
  const {
    studentResults,
    submitTeacherSubjectMarks,
    students,
    academicDirectives,
    checkMarkEntryPermission,
    toggleMarkEntryAuthorization,
  } = useData();

  // Primary Selection States
  const [selectedForm, setSelectedForm] = useState<string>('Form 4');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedExam, setSelectedExam] = useState<string>('NECTA Mock 2025');
  const [academicYear, setAcademicYear] = useState<string>('2025/2026');
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    return assignedSubjects.length > 0 ? assignedSubjects[0] : 'Chemistry';
  });

  // Entry method tabs
  const [entryMethod, setEntryMethod] = useState<'gradebook' | 'upload_file' | 'paste_text'>('gradebook');

  // Search filter
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Draft marks state: { [examNumber]: { score: number; remarks: string } }
  const [marksDraft, setMarksDraft] = useState<Record<string, { score: number; remarks: string }>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // File upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [parsedUploadRows, setParsedUploadRows] = useState<Array<{
    examNumber: string;
    score: number;
    remarks: string;
    studentName?: string;
    status: 'valid' | 'invalid' | 'warning';
    error?: string;
  }>>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  // Submission & Firestore status
  const [isSavingToFirestore, setIsSavingToFirestore] = useState<boolean>(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    submissionId: string;
    count: number;
    timestamp: string;
    firestoreSaved: boolean;
  } | null>(null);
  const [recentPendingSubmissions, setRecentPendingSubmissions] = useState<PendingSubjectSubmission[]>([]);
  const [showRecentSubmissions, setShowRecentSubmissions] = useState<boolean>(false);

  // Get current subject metadata
  const currentSubjectObj = useMemo(() => {
    return (
      OFFICIAL_NECTA_SUBJECTS.find(
        (s) => s.name.toLowerCase() === selectedSubject.toLowerCase() || s.code === selectedSubject
      ) || OFFICIAL_NECTA_SUBJECTS[6] // Default Chemistry
    );
  }, [selectedSubject]);

  // Check Academic Master mark entry permission and active directives
  const permission = useMemo(() => {
    return checkMarkEntryPermission(selectedForm, selectedExam);
  }, [checkMarkEntryPermission, selectedForm, selectedExam, academicDirectives]);

  // Strict Subject Permission Enforcement (Prompt requirement: teacher cannot enter marks for unassigned subjects)
  const isSubjectAssigned = useMemo(() => {
    if (isAcademicMaster) return true;
    if (!assignedSubjects || assignedSubjects.length === 0) return false;
    return assignedSubjects.some(
      (a) =>
        a.toLowerCase() === selectedSubject.toLowerCase() ||
        a.toLowerCase().includes(selectedSubject.toLowerCase()) ||
        selectedSubject.toLowerCase().includes(a.toLowerCase())
    );
  }, [isAcademicMaster, assignedSubjects, selectedSubject]);

  const isEntryAllowed = isAcademicMaster || permission.isAllowed;
  const canEditMarks = isEntryAllowed && isSubjectAssigned;

  // Filter students for current class & exam, incorporating all registered school students
  const currentClassStudents = useMemo(() => {
    const fromResults = studentResults.filter(
      (r) =>
        (!selectedForm || selectedForm === 'ALL' || r.form === selectedForm) &&
        (!selectedStream || selectedStream === 'ALL' || r.stream === selectedStream) &&
        (!selectedExam || selectedExam === 'ALL' || r.examType === selectedExam)
    );
    const existingExamNos = new Set(fromResults.map((r) => r.examNumber.toLowerCase()));

    // Registered students from school directory for selected form & stream
    const registered = (students || []).filter((s) => {
      if (selectedForm && selectedForm !== 'ALL' && s.form !== selectedForm) return false;
      if (selectedStream && selectedStream !== 'ALL' && s.stream !== selectedStream) return false;
      return !existingExamNos.has(s.examNumber.toLowerCase());
    });

    const synthesized: typeof fromResults = registered.map((s) => ({
      id: `syn-${s.id}-${selectedExam}`,
      studentId: s.studentId,
      examNumber: s.examNumber,
      studentName: s.fullName,
      gender: (s.gender as 'M' | 'F') || 'F',
      form: (s.form as any) || (selectedForm !== 'ALL' ? selectedForm : 'Form 4'),
      stream: (s.stream as any) || (selectedStream !== 'ALL' ? selectedStream : 'Science'),
      examType: (selectedExam !== 'ALL' ? selectedExam : 'NECTA Mock 2025') as any,
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
  }, [studentResults, students, selectedForm, selectedStream, selectedExam]);

  // Filtered displayed students in table
  const displayedStudents = useMemo(() => {
    if (!searchStudent.trim()) return currentClassStudents;
    const q = searchStudent.toLowerCase();
    return currentClassStudents.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.examNumber.toLowerCase().includes(q) ||
        formatCno(s.examNumber).toLowerCase().includes(q)
    );
  }, [currentClassStudents, searchStudent]);

  // Load existing subject marks into draft whenever subject, form, or exam changes
  useEffect(() => {
    const draft: Record<string, { score: number; remarks: string }> = {};
    currentClassStudents.forEach((st) => {
      const existing = st.subjects.find(
        (s) =>
          s.name.toLowerCase() === selectedSubject.toLowerCase() ||
          s.code === currentSubjectObj.code
      );
      if (existing) {
        draft[st.examNumber] = {
          score: existing.score,
          remarks: existing.remarks || scoreToNectaGrade(existing.score).remarks,
        };
      } else {
        draft[st.examNumber] = {
          score: 0,
          remarks: '',
        };
      }
    });
    setMarksDraft(draft);
    setHasUnsavedChanges(false);
  }, [selectedSubject, selectedForm, selectedStream, selectedExam, currentClassStudents, currentSubjectObj.code]);

  // Fetch recent pending submissions on mount
  useEffect(() => {
    getPendingSubjectSubmissionsFromFirestore().then((subs) => {
      setRecentPendingSubmissions(subs);
    });
  }, []);

  // Handle individual score change
  const handleScoreChange = (examNumber: string, value: string) => {
    const numeric = value === '' ? 0 : Math.min(100, Math.max(0, parseInt(value, 10) || 0));
    const gradeInfo = scoreToNectaGrade(numeric);
    setMarksDraft((prev) => ({
      ...prev,
      [examNumber]: {
        score: numeric,
        remarks: prev[examNumber]?.remarks || gradeInfo.remarks,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Handle remarks change
  const handleRemarksChange = (examNumber: string, remarks: string) => {
    setMarksDraft((prev) => ({
      ...prev,
      [examNumber]: {
        score: prev[examNumber]?.score || 0,
        remarks,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Quick fill benchmarks
  const handleQuickFillBenchmark = (score: number) => {
    const draft: Record<string, { score: number; remarks: string }> = {};
    const gradeInfo = scoreToNectaGrade(score);
    currentClassStudents.forEach((st) => {
      draft[st.examNumber] = {
        score,
        remarks: gradeInfo.remarks,
      };
    });
    setMarksDraft(draft);
    setHasUnsavedChanges(true);
  };

  // Download template for this class & subject
  const handleDownloadTemplate = () => {
    const rows = currentClassStudents.map((st, idx) => ({
      'S/N': idx + 1,
      'CANDIDATE_NO': st.examNumber,
      'STUDENT_NAME': st.studentName,
      'GENDER': st.gender,
      'CLASS': st.form,
      'SUBJECT': selectedSubject,
      'SUBJECT_CODE': currentSubjectObj.code,
      'EXAM_TYPE': selectedExam,
      'SCORE_OUT_OF_100': marksDraft[st.examNumber]?.score || 0,
      'REMARKS': marksDraft[st.examNumber]?.remarks || 'Nzuri Sana',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alama_za_Somo');
    const safeFileName = `Uomboni_${selectedForm.replace(/\s+/g, '_')}_${selectedSubject}_${selectedExam.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, safeFileName);
  };

  // Parse Excel / CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        const parsed = rows.map((r) => {
          const rawCno = r['CANDIDATE_NO'] || r['Candidate Number'] || r['Exam Number'] || r['CNO'] || r['Namba ya Mtihani'] || '';
          const rawScore = r['SCORE_OUT_OF_100'] || r['Score'] || r['Marks'] || r['Alama'] || 0;
          const rawRemarks = r['REMARKS'] || r['Remarks'] || r['Maoni'] || '';
          const rawName = r['STUDENT_NAME'] || r['Student Name'] || r['Jina'] || '';

          const scoreNum = Math.min(100, Math.max(0, parseInt(String(rawScore), 10) || 0));
          const examNumberStr = String(rawCno).trim();

          const studentMatch = currentClassStudents.find(
            (s) =>
              s.examNumber.toLowerCase() === examNumberStr.toLowerCase() ||
              formatCno(s.examNumber).toLowerCase() === examNumberStr.toLowerCase()
          );

          let status: 'valid' | 'invalid' | 'warning' = 'valid';
          let error = '';

          if (!examNumberStr) {
            status = 'invalid';
            error = 'Namba ya mtihani haipo';
          } else if (!studentMatch) {
            status = 'warning';
            error = 'Mwanafunzi hayupo darasani hili';
          }

          return {
            examNumber: examNumberStr,
            score: scoreNum,
            remarks: rawRemarks || scoreToNectaGrade(scoreNum).remarks,
            studentName: studentMatch?.studentName || rawName,
            status,
            error,
          };
        });

        setParsedUploadRows(parsed);
      } catch (err) {
        console.error('Error parsing file:', err);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Parse Pasted Text (CSV or Tab-delimited)
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    setIsParsing(true);
    const lines = pastedText.trim().split('\n');
    const parsed = lines.map((line) => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      const rawCno = parts[0]?.trim() || '';
      const rawScore = parts[1]?.trim() || '0';
      const rawRemarks = parts[2]?.trim() || '';

      const scoreNum = Math.min(100, Math.max(0, parseInt(rawScore, 10) || 0));
      const studentMatch = currentClassStudents.find(
        (s) =>
          s.examNumber.toLowerCase() === rawCno.toLowerCase() ||
          formatCno(s.examNumber).toLowerCase() === rawCno.toLowerCase()
      );

      let status: 'valid' | 'invalid' | 'warning' = 'valid';
      let error = '';
      if (!rawCno) {
        status = 'invalid';
        error = 'Namba batili';
      } else if (!studentMatch) {
        status = 'warning';
        error = 'Mwanafunzi hayupo darasani hili';
      }

      return {
        examNumber: rawCno,
        score: scoreNum,
        remarks: rawRemarks || scoreToNectaGrade(scoreNum).remarks,
        studentName: studentMatch?.studentName,
        status,
        error,
      };
    });

    setParsedUploadRows(parsed);
    setIsParsing(false);
  };

  // Apply parsed upload rows to active draft
  const handleApplyParsedToDraft = () => {
    setMarksDraft((prev) => {
      const next = { ...prev };
      parsedUploadRows.forEach((r) => {
        if (r.status !== 'invalid' && r.examNumber) {
          next[r.examNumber] = {
            score: r.score,
            remarks: r.remarks,
          };
        }
      });
      return next;
    });
    setHasUnsavedChanges(true);
    setEntryMethod('gradebook');
    setParsedUploadRows([]);
  };

  // Compute Grade Statistics
  const statistics = useMemo(() => {
    const scores = Object.values(marksDraft).map((m) => m.score);
    if (scores.length === 0) {
      return { total: 0, average: 0, highest: 0, lowest: 0, passRate: 0, countA: 0, countB: 0, countC: 0, countD: 0, countF: 0 };
    }
    const total = scores.length;
    const sum = scores.reduce((a, b) => a + b, 0);
    const average = total > 0 ? Math.round(sum / total) : 0;
    const highest = Math.max(...scores, 0);
    const lowest = scores.length > 0 ? Math.min(...scores) : 0;

    let countA = 0, countB = 0, countC = 0, countD = 0, countF = 0;
    scores.forEach((sc) => {
      const g = scoreToNectaGrade(sc).grade;
      if (g === 'A') countA++;
      else if (g === 'B') countB++;
      else if (g === 'C') countC++;
      else if (g === 'D') countD++;
      else countF++;
    });

    const passed = countA + countB + countC + countD;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, average, highest, lowest, passRate, countA, countB, countC, countD, countF };
  }, [marksDraft]);

  // Primary Action: Submit and Save to Cloud Firestore as 'pending' results
  const handleSubmitToFirestore = async () => {
    setIsSavingToFirestore(true);

    // Prepare list of scores to save
    const scoresToSave = currentClassStudents.map((st) => {
      const entry = marksDraft[st.examNumber] || { score: 0, remarks: '' };
      const gradeInfo = scoreToNectaGrade(entry.score);
      return {
        examNumber: st.examNumber,
        studentName: st.studentName,
        gender: st.gender,
        score: entry.score,
        grade: gradeInfo.grade,
        points: gradeInfo.points,
        remarks: entry.remarks || gradeInfo.remarks,
      };
    });

    try {
      // 1. Save to Cloud Firestore via academicFirestoreService with status: 'pending'
      const firestoreResult = await savePendingSubjectScoresToFirestore({
        subject: selectedSubject,
        subjectCode: currentSubjectObj.code,
        form: selectedForm,
        stream: selectedStream,
        examType: selectedExam,
        academicYear,
        teacherName: currentTeacherName,
        teacherEmail: currentTeacherEmail,
        scores: scoresToSave,
      });

      // 2. Also update in-memory context so the UI responds immediately
      submitTeacherSubjectMarks(
        selectedSubject,
        selectedForm,
        selectedExam,
        currentTeacherName,
        marksDraft
      );

      // Set submission receipt
      const receipt = {
        submissionId: firestoreResult.submissionId,
        count: firestoreResult.count,
        timestamp: new Date().toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' }),
        firestoreSaved: firestoreResult.firestoreSaved,
      };
      setSubmissionReceipt(receipt);
      setHasUnsavedChanges(false);

      // Refresh recent submissions
      getPendingSubjectSubmissionsFromFirestore().then((subs) => {
        setRecentPendingSubmissions(subs);
      });

      if (onSubmissionSuccess) {
        onSubmissionSuccess(firestoreResult.submissionId);
      }
    } catch (error) {
      console.error('Error submitting scores to Firestore:', error);
    } finally {
      setIsSavingToFirestore(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 animate-in fade-in duration-300">
      {/* 1. TOP TEACHER IDENTITY & FIRESTORE SECURITY VERIFICATION HEADER */}
      <div className="p-5 bg-[#FFFDF8] rounded-3xl text-stone-900 border-2 border-red-200/80 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-700 text-[#FFFFF0] text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                {language === 'sw' ? 'Fomu Salama ya Mwalimu' : 'Secure Teacher Score Portal'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-red-900 border border-red-300 text-[11px] font-bold flex items-center gap-1.5">
                <Database className="w-3 h-3 text-red-700" />
                <span>Cloud Firestore: Hifadhi ya Matokeo ya 'Pending'</span>
              </span>
            </div>
            <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-red-700" />
              <span>{language === 'sw' ? 'Uingizaji wa Alama kwa Somo (Pending Results)' : 'Subject Marks Entry & Upload'}</span>
            </h3>
            <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
              {language === 'sw'
                ? 'Ingiza au pakia alama za wanafunzi kulingana na somo unalofundisha. Alama hizi zinahifadhiwa kwenye Cloud Firestore zikiwa na hadhi ya "Pending" kwa ajili ya kukaguliwa na Mkuu wa Taaluma kabla ya kuruhusiwa kutazamwa na wazazi.'
                : 'Upload or input student scores for your assigned subject. Data is securely saved to Cloud Firestore as "pending" results awaiting certification by the Academic Master.'}
            </p>
          </div>

          {/* Teacher Profile Stamp */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-red-200 flex items-center gap-3 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-red-700 text-[#FFFFF0] flex items-center justify-center font-black text-lg shadow-md">
              {currentTeacherName.split(' ')[1]?.[0] || 'M'}
            </div>
            <div className="text-left">
              <span className="text-[10px] text-stone-500 font-mono block">Mwalimu Mhusika:</span>
              <span className="text-xs font-black text-red-900 block">{currentTeacherName}</span>
              <span className="text-[10px] text-stone-600 font-mono">{currentTeacherEmail}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Workflow Info Bar */}
        <div className="pt-3 border-t border-red-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-700" />
            <span>{language === 'sw' ? 'Hadhi ya Matokeo: ' : 'Status: '}</span>
            <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 font-black border border-red-200 text-[10px] uppercase">
              Pending Approval (Inasubiri Mkuu wa Taaluma)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRecentSubmissions(!showRecentSubmissions)}
              className="text-red-700 hover:text-red-800 underline text-xs font-bold cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {language === 'sw'
                  ? `Tazama Vipindi Vilivyowasilishwa (${recentPendingSubmissions.length})`
                  : `Recent Pending Submissions (${recentPendingSubmissions.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* RECENT SUBMISSIONS DRAWER (IF OPEN) */}
      {showRecentSubmissions && recentPendingSubmissions.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h5 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>{language === 'sw' ? 'Mkusanyiko wa Alama Zinazosubiri Ukaguzi kwenye Firestore' : 'Pending Submissions in Firestore'}</span>
            </h5>
            <span className="text-[10px] text-slate-400">{recentPendingSubmissions.length} zimepatikana</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentPendingSubmissions.map((sub) => (
              <div key={sub.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-400">{sub.subject}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase font-bold">
                    {sub.status}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  <span>{sub.form} • {sub.examType}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                  <span>Wanafunzi: {sub.submittedCount}</span>
                  <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SUCCESS CONFIRMATION RECEIPT BANNER */}
      {submissionReceipt && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/90 shadow-2xl text-white space-y-3 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <CheckCheck className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm font-black text-white flex items-center gap-2">
                  <span>{language === 'sw' ? 'Alama Zimehifadhiwa Kikamilifu Kwenye Firestore!' : 'Scores Successfully Saved to Firestore!'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                    Status: PENDING
                  </span>
                </h5>
                <p className="text-xs text-slate-300">
                  {language === 'sw'
                    ? `Wanafunzi ${submissionReceipt.count} wa Somo la ${selectedSubject} wamehifadhiwa. Mkuu wa Taaluma atapokea taarifa ya kukagua kabla ya kutangaza kwa wazazi.`
                    : `${submissionReceipt.count} candidate marks saved for ${selectedSubject} as pending review.`}
                </p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block">Msimbo wa Firestore:</span>
              <span className="text-xs font-bold text-amber-300 break-all">{submissionReceipt.submissionId}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {language === 'sw'
                  ? 'Data imelindwa na kuhakikiwa kulingana na viwango vya NECTA.'
                  : 'Data encrypted and secured adhering to NECTA standards.'}
              </span>
            </div>
            {onOpenResultsPreview && (
              <button
                onClick={onOpenResultsPreview}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Tazama Mtazamo wa Wazazi (Namba za Wanafunzi) →' : 'Preview Official Sheet →'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2B. ACADEMIC MASTER DIRECTIVE & PERMISSION BANNER */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border-2 shadow-lg transition-all ${
          !isEntryAllowed
            ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-rose-500/80 text-white'
            : 'bg-gradient-to-r from-indigo-950/80 via-slate-900 to-emerald-950/80 border-indigo-500/50 text-white'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-2xl shrink-0 ${
                !isEntryAllowed
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {!isEntryAllowed ? <Lock className="w-6 h-6" /> : <Megaphone className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    !isEntryAllowed
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  }`}
                >
                  {!isEntryAllowed
                    ? language === 'sw' ? 'DIRISHA LIMEFUNGWA NA TAALUMA' : 'MARK ENTRY LOCKED'
                    : language === 'sw' ? 'DIRISHA LIKO WAZI' : 'WINDOW OPEN FOR ENTRY'}
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {selectedForm} • {selectedExam}
                </span>
                {permission.directive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {permission.directive.priority.toUpperCase()}
                  </span>
                )}
              </div>

              <h4 className="text-sm md:text-base font-black text-white">
                {permission.directive?.title || (
                  !isEntryAllowed
                    ? language === 'sw' ? 'Kufungwa kwa Uingizaji wa Alama' : 'Mark Submission Locked'
                    : language === 'sw' ? 'Maelekezo Rasmi ya Kuingiza Alama' : 'Official Mark Submission Guidelines'
                )}
              </h4>

              <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
                {permission.directive?.message || permission.reason}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'sw' ? 'Tarehe ya Mwisho (Deadline):' : 'Deadline:'} <strong>{permission.deadlineDate || '2026-03-30'}</strong></span>
                </span>
                <span>
                  {language === 'sw' ? 'Mtoa Maelekezo:' : 'Directive By:'} <strong>{permission.directive?.senderName || 'Mwl. Yohana Bahati (Mkuu wa Taaluma)'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick lock/unlock toggle if Academic Master */}
          {isAcademicMaster && (
            <button
              type="button"
              onClick={() =>
                toggleMarkEntryAuthorization(
                  selectedForm,
                  selectedExam,
                  !permission.isAllowed,
                  !permission.isAllowed
                    ? `Mkuu wa Taaluma amefungua rasmi dirisha la kuingiza alama kwa ajili ya ${selectedForm} (${selectedExam}).`
                    : `Dirisha la kuingiza alama za ${selectedForm} limefungwa na Mkuu wa Taaluma.`
                )
              }
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0 self-start md:self-center ${
                !permission.isAllowed
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-rose-700 hover:bg-rose-600 text-white'
              }`}
            >
              {!permission.isAllowed ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Fungua Dirisha Hili Sasa' : 'Unlock This Window'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Funga Dirisha Hili' : 'Lock This Window'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 3. PRIMARY PARAMETERS SELECTION BAR */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>{language === 'sw' ? 'Vigezo vya Uingizaji wa Alama' : 'Subject Mark Parameters'}</span>
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            {language === 'sw' ? 'Wanafunzi Darasani:' : 'Class Candidates:'}{' '}
            <strong className="text-emerald-700 font-black">{currentClassStudents.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Form */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'sw' ? '1. Kidato (Form)' : '1. Form Level'}
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Form 1">Kidato cha 1 (Form 1)</option>
              <option value="Form 2">Kidato cha 2 (Form 2)</option>
              <option value="Form 3">Kidato cha 3 (Form 3)</option>
              <option value="Form 4">Kidato cha 4 (Form 4)</option>
            </select>
          </div>

          {/* Stream */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'sw' ? '2. Mkondo (Stream)' : '2. Stream'}
            </label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Mikondo Yote (All Streams)</option>
              <option value="Science">Sayansi (Science)</option>
              <option value="Arts">Sanaa (Arts)</option>
              <option value="Commercial">Biashara (Commercial)</option>
              <option value="A">Stream A</option>
              <option value="B">Stream B</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'sw' ? '3. Somo (Subject)' : '3. Subject'}
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-emerald-400 text-slate-900 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
            >
              {OFFICIAL_NECTA_SUBJECTS.map((sub) => {
                const isAssigned = assignedSubjects.some(
                  (a) => a.toLowerCase() === sub.name.toLowerCase()
                );
                return (
                  <option key={sub.code} value={sub.name}>
                    {sub.name} ({sub.code}) {isAssigned ? '★ Mwalimu Mhusika' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Exam Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'sw' ? '4. Aina ya Mtihani (Exam)' : '4. Exam Period'}
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="NECTA Mock 2025">NECTA Mock 2025</option>
              <option value="Annual Examination 2025">Mtihani wa Mwaka (Annual)</option>
              <option value="Mid-Term Exam 2025">Mtihani wa Nusu Muhula (Mid-Term)</option>
              <option value="Pre-NECTA 2025">Pre-NECTA Mtihani wa Majaribio</option>
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'sw' ? '5. Mwaka wa Masomo' : '5. Academic Year'}
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. CLASS PERFORMANCE SUMMARY MINI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Wanafunzi</span>
          <span className="text-xl font-black text-slate-900">{statistics.total}</span>
          <span className="text-[10px] text-emerald-600 block font-semibold">{selectedForm}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Wastani (Average)</span>
          <span className="text-xl font-black text-emerald-700">{statistics.average}%</span>
          <span className="text-[10px] text-slate-400 block">Alama ya Juu: {statistics.highest}%</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Kiwango cha Ufaulu</span>
          <span className="text-xl font-black text-blue-700">{statistics.passRate}%</span>
          <span className="text-[10px] text-slate-400 block">Alama A - D</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Wenye Daraja A & B</span>
          <span className="text-xl font-black text-emerald-600">{statistics.countA + statistics.countB}</span>
          <span className="text-[10px] text-emerald-600 block">A: {statistics.countA} | B: {statistics.countB}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Hadhi ya Uhifadhi</span>
          <span className="text-xs font-black text-amber-600 uppercase block mt-1">Pending Review</span>
          <span className="text-[10px] text-slate-400 block font-mono">Cloud Firestore</span>
        </div>
      </div>

      {/* 5. INPUT METHOD TOGGLE TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEntryMethod('gradebook')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              entryMethod === 'gradebook'
                ? 'bg-emerald-700 text-white shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? '1. Daftari la Alama (Gradebook)' : '1. Interactive Gradebook'}</span>
          </button>

          <button
            onClick={() => setEntryMethod('upload_file')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              entryMethod === 'upload_file'
                ? 'bg-emerald-700 text-white shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? '2. Pakia Excel / CSV' : '2. Excel / CSV Upload'}</span>
          </button>

          <button
            onClick={() => setEntryMethod('paste_text')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              entryMethod === 'paste_text'
                ? 'bg-emerald-700 text-white shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? '3. Bandika Maandishi (Paste Rows)' : '3. Paste Table Rows'}</span>
          </button>
        </div>

        {/* Quick Helper Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Pakua kiolezo cha Excel cha somo hili"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'sw' ? 'Pakua Kiolezo cha Excel' : 'Download Excel Template'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* METHOD 1: INTERACTIVE GRADEBOOK TABLE */}
      {/* ========================================================================= */}
      {entryMethod === 'gradebook' && (
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
          {/* Header & Student Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{selectedSubject} ({currentSubjectObj.code})</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {selectedForm} • {selectedExam}
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                {language === 'sw'
                  ? 'Andika alama (0-100) kwa kila mwanafunzi. Daraja na maoni ya NECTA yanajazwa kiotomatiki.'
                  : 'Enter marks (0-100) per candidate. NECTA grade and remarks compute automatically.'}
              </p>
            </div>

            {/* Student Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder={language === 'sw' ? 'Tafuta kwa jina au namba...' : 'Filter candidate...'}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick Fill Benchmark Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-600 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'sw' ? 'Ujazaji wa Haraka wa Sampuli:' : 'Quick Fill Sample Marks:'}</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleQuickFillBenchmark(82)}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] cursor-pointer"
              >
                Weka 82 (Grade A)
              </button>
              <button
                onClick={() => handleQuickFillBenchmark(70)}
                className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[11px] cursor-pointer"
              >
                Weka 70 (Grade B)
              </button>
              <button
                onClick={() => handleQuickFillBenchmark(58)}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] cursor-pointer"
              >
                Weka 58 (Grade C)
              </button>
              <button
                onClick={() => handleQuickFillBenchmark(0)}
                className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] cursor-pointer"
              >
                Safisha Alama Zote
              </button>
            </div>
          </div>

          {/* Students Marks Entry Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-900">
              <thead className="bg-slate-100 text-slate-700 font-black text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-3 w-12 text-center">#</th>
                  <th className="px-3.5 py-3 w-40">Namba ya Mtihani (CNO)</th>
                  <th className="px-3.5 py-3">Jina Kamili la Mwanafunzi</th>
                  <th className="px-3.5 py-3 w-16 text-center">Jinsia</th>
                  <th className="px-3.5 py-3 w-32 text-center bg-emerald-50 text-emerald-900 border-x border-emerald-200">
                    Alama (0 - 100)
                  </th>
                  <th className="px-3.5 py-3 w-20 text-center">Daraja</th>
                  <th className="px-3.5 py-3 w-16 text-center">Points</th>
                  <th className="px-3.5 py-3">Maoni (Remarks)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      Hakuna wanafunzi waliopatikana kwa vigezo hivi vya {selectedForm} ({selectedExam}).
                    </td>
                  </tr>
                ) : (
                  displayedStudents.map((st, idx) => {
                    const entry = marksDraft[st.examNumber] || { score: 0, remarks: '' };
                    const gradeInfo = scoreToNectaGrade(entry.score);

                    const isGradeA = gradeInfo.grade === 'A';
                    const isGradeB = gradeInfo.grade === 'B';
                    const isGradeC = gradeInfo.grade === 'C';
                    const isGradeD = gradeInfo.grade === 'D';
                    const isGradeF = gradeInfo.grade === 'F';

                    return (
                      <tr key={`${st.examNumber || 'exam'}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3.5 py-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-slate-800">
                          {formatCno(st.examNumber)}
                        </td>
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">
                          {st.studentName || students.find(s => s.examNumber.toLowerCase() === st.examNumber.toLowerCase())?.fullName || '—'}
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              st.gender === 'F' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {st.gender}
                          </span>
                        </td>

                        {/* Interactive Score Input */}
                        <td className={`px-3 py-2 text-center border-x ${!isEntryAllowed ? 'bg-slate-100 border-slate-200' : 'bg-emerald-50/40 border-emerald-100'}`}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={!isEntryAllowed}
                            value={entry.score === 0 && !hasUnsavedChanges ? '' : entry.score}
                            onChange={(e) => handleScoreChange(st.examNumber, e.target.value)}
                            placeholder={!isEntryAllowed ? '🔒' : '0'}
                            className={`w-20 px-2 py-1.5 rounded-lg text-center font-black text-sm shadow-sm transition-all ${
                              !isEntryAllowed
                                ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                : 'bg-white border-2 border-emerald-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600'
                            }`}
                          />
                        </td>

                        {/* Grade Badge */}
                        <td className="px-3.5 py-2.5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-black inline-block shadow-xs ${
                              isGradeA
                                ? 'bg-emerald-600 text-white'
                                : isGradeB
                                ? 'bg-blue-600 text-white'
                                : isGradeC
                                ? 'bg-amber-500 text-white'
                                : isGradeD
                                ? 'bg-orange-500 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {gradeInfo.grade}
                          </span>
                        </td>

                        {/* Points */}
                        <td className="px-3.5 py-2.5 text-center font-mono font-bold text-slate-700">
                          {gradeInfo.points}
                        </td>

                        {/* Remarks Input */}
                        <td className="px-3.5 py-2">
                          <input
                            type="text"
                            disabled={!isEntryAllowed}
                            value={entry.remarks}
                            onChange={(e) => handleRemarksChange(st.examNumber, e.target.value)}
                            placeholder={!isEntryAllowed ? 'Dirisha limefungwa na Taaluma' : gradeInfo.remarks}
                            className={`w-full px-2.5 py-1 rounded-lg text-xs transition-all ${
                              !isEntryAllowed
                                ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                            }`}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* METHOD 2: SPREADSHEET / CSV FILE UPLOAD */}
      {/* ========================================================================= */}
      {entryMethod === 'upload_file' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>{language === 'sw' ? 'Pakia Faili la Alama za Somo (Excel au CSV)' : 'Upload Subject Marks Spreadsheet'}</span>
            </h4>
            <p className="text-xs text-slate-500">
              {language === 'sw'
                ? `Pakia faili la .xlsx, .xls au .csv lenye safu wima za CANDIDATE_NO, SCORE_OUT_OF_100 na REMARKS kwa somo la ${selectedSubject}.`
                : `Select a spreadsheet file containing CANDIDATE_NO, SCORE_OUT_OF_100, and REMARKS columns.`}
            </p>
          </div>

          {/* Drag and drop upload zone */}
          <div className="p-8 rounded-3xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 text-center space-y-3 transition-colors">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <label
                htmlFor={isEntryAllowed ? "file-upload-input" : undefined}
                className={`inline-block px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition-all ${
                  !isEntryAllowed
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-400'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                }`}
              >
                {!isEntryAllowed
                  ? language === 'sw' ? '🔒 Uingizaji Umefungwa na Mkuu wa Taaluma' : '🔒 Mark Entry Locked by Academic Master'
                  : uploadFile ? uploadFile.name : language === 'sw' ? 'Chagua Faili la Excel / CSV' : 'Choose Spreadsheet File'}
              </label>
              <input
                id="file-upload-input"
                type="file"
                disabled={!isEntryAllowed}
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {language === 'sw' ? 'Au buruta na udondoshe faili hapa (.xlsx, .xls, .csv)' : 'Or drag and drop file here (.xlsx, .xls, .csv)'}
            </p>
          </div>

          {/* Parsed Preview Table */}
          {parsedUploadRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">
                  {language === 'sw' ? `Mstari Zilizochakatwa: ${parsedUploadRows.length}` : `Parsed Rows: ${parsedUploadRows.length}`}
                </span>
                <button
                  onClick={handleApplyParsedToDraft}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Weka Kwenye Daftari la Alama' : 'Load Into Gradebook'}</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">CNO</th>
                      <th className="p-2.5">Mwanafunzi</th>
                      <th className="p-2.5 text-center">Alama</th>
                      <th className="p-2.5 text-center">Daraja</th>
                      <th className="p-2.5">Maoni</th>
                      <th className="p-2.5 text-center">Hali</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedUploadRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold">{r.examNumber}</td>
                        <td className="p-2">{r.studentName || '—'}</td>
                        <td className="p-2 text-center font-black">{r.score}</td>
                        <td className="p-2 text-center font-bold text-emerald-700">{scoreToNectaGrade(r.score).grade}</td>
                        <td className="p-2 text-slate-600">{r.remarks}</td>
                        <td className="p-2 text-center">
                          {r.status === 'valid' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Valid</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">{r.error}</span>
                          )}
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

      {/* ========================================================================= */}
      {/* METHOD 3: PASTE TEXT ROWS */}
      {/* ========================================================================= */}
      {entryMethod === 'paste_text' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>{language === 'sw' ? 'Bandika Maandishi ya Alama (CSV au Tab Delimited)' : 'Paste Table Rows (CSV or TSV)'}</span>
            </h4>
            <p className="text-xs text-slate-500">
              {language === 'sw'
                ? 'Nakili kutoka Excel au faili la maandishi kisha bandika hapa katika muundo: Namba_ya_Mtihani, Alama, Maoni'
                : 'Copy columns from Excel and paste here in format: Candidate_No, Score, Remarks'}
            </p>
          </div>

          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={6}
            placeholder={`S0486/0001/2025, 84, Vizuri Sana\nS0486/0002/2025, 76, Vizuri Sana\nS0486/0003/2025, 62, Wastani`}
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Mstari: {pastedText.trim() ? pastedText.trim().split('\n').length : 0}
            </span>
            <button
              onClick={handleParsePastedText}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs cursor-pointer shadow-md"
            >
              Chakata Maandishi (Parse Text)
            </button>
          </div>

          {/* Parsed Output */}
          {parsedUploadRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">Mstari Zilizochakatwa: {parsedUploadRows.length}</span>
                <button
                  onClick={handleApplyParsedToDraft}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Weka Kwenye Daftari la Alama' : 'Load Into Gradebook'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. PRIMARY SUBMISSION CONTROL DOCK */}
      <div className="p-5 rounded-3xl bg-[#FFFDF8] text-stone-900 border-2 border-red-200/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h5 className="text-sm font-black text-stone-900">
              {language === 'sw' ? 'Uwasilishaji Salama wa Alama' : 'Secure Mark Submission'}
            </h5>
            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-black uppercase">
              Pending Results
            </span>
          </div>
          <p className="text-xs text-stone-600">
            {language === 'sw'
              ? `Jumla ya wanafunzi ${statistics.total} watasajiliwa kwenye Cloud Firestore na kuwekwa hadhi ya "Pending" kuelekea kwa Mkuu wa Taaluma.`
              : `All ${statistics.total} candidate scores will be committed to Cloud Firestore with status 'pending' awaiting Academic Master certification.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-[11px] text-red-800 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-700" />
              <span>Mabadiliko hayajahifadhiwa</span>
            </span>
          )}

          <button
            onClick={handleSubmitToFirestore}
            disabled={!isEntryAllowed || isSavingToFirestore || statistics.total === 0}
            className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2.5 shadow-md transition-all cursor-pointer ${
              !isEntryAllowed || isSavingToFirestore || statistics.total === 0
                ? 'bg-[#FAF7EE] text-stone-400 border border-red-200 cursor-not-allowed'
                : 'bg-red-700 hover:bg-red-800 text-[#FFFFF0] border border-red-800 scale-102 font-black'
            }`}
          >
            {isSavingToFirestore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#FFFFF0]" />
                <span>Inahifadhi kwenye Firestore...</span>
              </>
            ) : !isEntryAllowed ? (
              <>
                <Lock className="w-4 h-4 text-rose-400" />
                <span className="text-rose-300">
                  {language === 'sw'
                    ? 'Dirisha Limefungwa na Taaluma'
                    : 'Locked by Academic Master'}
                </span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-slate-950" />
                <span>
                  {language === 'sw'
                    ? 'Hifadhi Kwenye Firestore kama "Pending"'
                    : 'Save to Firestore as "Pending" Results'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
