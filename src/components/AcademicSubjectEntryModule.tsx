import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Save,
  Send,
  AlertCircle,
  RefreshCw,
  Eye,
  Edit3,
  Unlock,
  Lock,
  Award,
  Users,
  Search,
  Check,
  Database,
  CheckCheck,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { StudentResult, PendingSubjectSubmission } from '../types';
import {
  OFFICIAL_NECTA_SUBJECTS,
  scoreToNectaGrade,
  formatCno,
} from '../utils/nectaResultsEngine';
import { TeacherSubjectScoreUploadForm } from './TeacherSubjectScoreUploadForm';
import {
  getPendingSubjectSubmissionsFromFirestore,
  approvePendingSubjectSubmissionInFirestore,
} from '../services/academicFirestoreService';

interface AcademicSubjectEntryModuleProps {
  mode: 'teacher' | 'academic_master';
  currentTeacherName?: string;
  assignedSubjects?: string[];
  onOpenResultsPreview?: () => void;
}

export const AcademicSubjectEntryModule: React.FC<AcademicSubjectEntryModuleProps> = ({
  mode,
  currentTeacherName = 'Mwl. Yohana Bahati',
  assignedSubjects = ['Chemistry', 'Physics'],
  onOpenResultsPreview,
}) => {
  // If in teacher mode, render the dedicated secure score input and upload form
  if (mode === 'teacher') {
    return (
      <TeacherSubjectScoreUploadForm
        currentTeacherName={currentTeacherName}
        assignedSubjects={assignedSubjects}
        onOpenResultsPreview={onOpenResultsPreview}
        isAcademicMaster={false}
      />
    );
  }

  const { language } = useLanguage();
  const {
    students,
    studentResults,
    isResultsPublishedToParents,
    publishResultsToParents,
    recomputeNectaDivisions,
    submitTeacherSubjectMarks,
    subjectSubmissions,
    teachers,
  } = useData();

  // Firestore Pending Submissions state for Academic Master
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubjectSubmission[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Selected Form and Exam
  const [selectedForm, setSelectedForm] = useState<string>('Form 4');
  const [selectedExam, setSelectedExam] = useState<string>('NECTA Mock 2025');
  const [selectedSubject, setSelectedSubject] = useState<string>('Chemistry');

  // Search filter for students
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Active student editing marks draft: { [examNumber]: { score: number, remarks: string } }
  const [marksDraft, setMarksDraft] = useState<Record<string, { score: number; remarks: string }>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);
  const [isProcessingNecta, setIsProcessingNecta] = useState<boolean>(false);

  // Fetch pending submissions from Firestore on mount
  React.useEffect(() => {
    getPendingSubjectSubmissionsFromFirestore().then((subs) => {
      setPendingSubmissions(subs);
    });
  }, []);

  // Academic Master approves a pending submission
  const handleApproveSubmission = async (sub: PendingSubjectSubmission) => {
    setApprovingId(sub.id);
    try {
      await approvePendingSubjectSubmissionInFirestore(
        sub.id,
        currentTeacherName,
        'Yameidhinishwa na Mkuu wa Taaluma.'
      );

      // Also merge into local context marks
      const marksMap: Record<string, { score: number; remarks: string }> = {};
      sub.studentScores.forEach((sc) => {
        marksMap[sc.examNumber] = {
          score: sc.score,
          remarks: sc.remarks,
        };
      });
      submitTeacherSubjectMarks(
        sub.subject,
        sub.form,
        sub.examType,
        sub.teacherName,
        marksMap
      );

      // Refresh pending list
      const updated = await getPendingSubjectSubmissionsFromFirestore();
      setPendingSubmissions(updated);
      setSubmissionSuccessMsg(`Matokeo ya ${sub.subject} (${sub.form}) yameidhinishwa kikamilifu!`);
      setTimeout(() => setSubmissionSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Error approving submission:', err);
    } finally {
      setApprovingId(null);
    }
  };

  // Filter students for current class & exam, incorporating all registered students
  const currentClassStudents = useMemo(() => {
    const fromResults = studentResults.filter(
      (r) =>
        (!selectedForm || selectedForm === 'ALL' || r.form === selectedForm) &&
        (!selectedExam || selectedExam === 'ALL' || r.examType === selectedExam)
    );
    const existingExamNos = new Set(fromResults.map((r) => r.examNumber.toLowerCase()));

    // Registered students from school directory for selected form
    const registered = (students || []).filter((s) => {
      if (selectedForm && selectedForm !== 'ALL' && s.form !== selectedForm) return false;
      return !existingExamNos.has(s.examNumber.toLowerCase());
    });

    const synthesized: typeof fromResults = registered.map((s) => ({
      id: `syn-${s.id}-${selectedExam}`,
      studentId: s.studentId,
      examNumber: s.examNumber,
      studentName: s.fullName,
      gender: (s.gender as 'M' | 'F') || 'F',
      form: (s.form as any) || (selectedForm !== 'ALL' ? selectedForm : 'Form 4'),
      stream: (s.stream as any) || 'Science',
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
  }, [studentResults, students, selectedForm, selectedExam]);

  // Search filtered students in table
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
  React.useEffect(() => {
    const draft: Record<string, { score: number; remarks: string }> = {};
    currentClassStudents.forEach((st) => {
      const existing = st.subjects.find(
        (s) => s.name.toLowerCase() === selectedSubject.toLowerCase() || s.code === selectedSubject
      );
      if (existing) {
        draft[st.examNumber] = {
          score: existing.score,
          remarks: existing.remarks || '',
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
    setSubmissionSuccessMsg(null);
  }, [selectedSubject, selectedForm, selectedExam, currentClassStudents]);

  // Handle score change
  const handleScoreChange = (examNumber: string, value: string) => {
    const numeric = value === '' ? 0 : Math.min(100, Math.max(0, parseInt(value, 10) || 0));
    setMarksDraft((prev) => ({
      ...prev,
      [examNumber]: {
        score: numeric,
        remarks: prev[examNumber]?.remarks || scoreToNectaGrade(numeric).remarks,
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

  // Submit subject marks to Academic Master
  const handleSubmitToAcademicMaster = () => {
    const res = submitTeacherSubjectMarks(
      selectedSubject,
      selectedForm,
      selectedExam,
      currentTeacherName,
      marksDraft
    );

    setHasUnsavedChanges(false);
    setSubmissionSuccessMsg(
      language === 'sw'
        ? `Alama za somo la ${selectedSubject} (${res.updatedCount} wanafunzi) zimewasilishwa kikamilifu kwa Mkuu wa Taaluma kwa ajili ya uchakataji wa mwisho!`
        : `Marks for ${selectedSubject} (${res.updatedCount} candidates) have been submitted to the Academic Master for processing!`
    );
    setTimeout(() => setSubmissionSuccessMsg(null), 7000);
  };

  // Academic Master: Recalculate all NECTA divisions and points
  const handleProcessNectaResults = () => {
    setIsProcessingNecta(true);
    setTimeout(() => {
      recomputeNectaDivisions(selectedForm, selectedExam);
      setIsProcessingNecta(false);
      setSubmissionSuccessMsg(
        language === 'sw'
          ? `Uchakataji wa matokeo (NECTA Best 7, Points, Aggregate na Division) umekamilika kikamilifu!`
          : `NECTA Processing Engine (Best 7, Points, Aggregates & Divisions) completed successfully!`
      );
      setTimeout(() => setSubmissionSuccessMsg(null), 6000);
    }, 600);
  };

  // Overview status matrix for all subjects
  const subjectStatusList = useMemo(() => {
    return OFFICIAL_NECTA_SUBJECTS.map((subj) => {
      const key = `${selectedForm}_${selectedExam}_${subj.name}`;
      const submission = subjectSubmissions[key];

      // Find assigned teacher in faculty
      const assigned = teachers.find((t) =>
        t.subjects.some((s) => s.toLowerCase().includes(subj.name.toLowerCase()))
      );

      // Check how many students have scores for this subject
      const studentsWithScore = currentClassStudents.filter((st) =>
        st.subjects.some(
          (s) =>
            (s.name.toLowerCase() === subj.name.toLowerCase() || s.code === subj.code) &&
            typeof s.score === 'number'
        )
      ).length;

      const isCompleted =
        submission?.status === 'submitted' ||
        (currentClassStudents.length > 0 && studentsWithScore >= currentClassStudents.length);

      return {
        subject: subj.name,
        code: subj.code,
        key: subj.key,
        teacherName: submission?.teacherName || assigned?.name || 'Mwalimu wa Somo',
        submittedAt: submission?.submittedAt || (isCompleted ? '2025-08-01' : null),
        status: isCompleted ? ('submitted' as const) : ('pending' as const),
        studentsCount: studentsWithScore,
        totalClass: currentClassStudents.length,
      };
    });
  }, [selectedForm, selectedExam, subjectSubmissions, teachers, currentClassStudents]);

  const totalSubmittedCount = subjectStatusList.filter((s) => s.status === 'submitted').length;
  const progressPercent =
    subjectStatusList.length > 0
      ? Math.round((totalSubmittedCount / subjectStatusList.length) * 100)
      : 0;

  return (
    <div className="space-y-6 text-slate-900">
      {/* 1. TOP SUPERVISION / WORKFLOW HEADER */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 rounded-2xl text-white border border-emerald-800/60 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                {mode === 'academic_master'
                  ? language === 'sw'
                    ? 'Mkuu wa Taaluma (Admin wa Walimu)'
                    : 'Academic Master (Teachers Admin)'
                  : language === 'sw'
                  ? 'Mwalimu wa Somo'
                  : 'Subject Teacher'}
              </span>
              <span className="text-xs font-mono text-emerald-300">
                S0486 UOMBONI • NECTA WORKFLOW
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              {mode === 'academic_master'
                ? language === 'sw'
                  ? 'Mfumo wa Usimamizi & Uhakiki wa Uingizaji wa Matokeo'
                  : 'Academic Marks Administration & Verification Hub'
                : language === 'sw'
                ? `Daftari la Uingizaji wa Alama: ${selectedSubject} (${selectedForm})`
                : `Marks Entry Gradebook: ${selectedSubject} (${selectedForm})`}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'academic_master'
                ? language === 'sw'
                  ? 'Mkuu wa Taaluma anasimamia walimu wote, anahakiki uingizaji wa alama, anachakata madaraja (NECTA Best 7), na anaruhusu matokeo kwenda kwa wazazi.'
                  : 'Academic Master oversees all subject teachers, verifies score submissions, computes NECTA Best 7 divisions, and authorizes release to parents.'
                : language === 'sw'
                ? 'Ingiza alama za mwanafunzi mmojamoja kwa somo lako kisha bonyeza "Wasilisha kwa Mkuu wa Taaluma" kwa uhakiki.'
                : 'Enter marks for your subject student-by-student, then submit to the Academic Master for compilation and publishing.'}
            </p>
          </div>

          {/* Academic Master Master Approval Switch */}
          {mode === 'academic_master' ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={handleProcessNectaResults}
                disabled={isProcessingNecta}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                title="Chakata NECTA Best 7, Points na Division"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessingNecta ? 'animate-spin' : ''}`} />
                <span>
                  {isProcessingNecta
                    ? language === 'sw'
                      ? 'Inachakata...'
                      : 'Processing...'
                    : language === 'sw'
                    ? 'Chakata Matokeo (NECTA Engine)'
                    : 'Compute NECTA Divisions'}
                </span>
              </button>

              <button
                onClick={() => publishResultsToParents(!isResultsPublishedToParents)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all border ${
                  isResultsPublishedToParents
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                    : 'bg-red-600 hover:bg-red-500 text-white border-red-400 animate-pulse'
                }`}
              >
                {isResultsPublishedToParents ? (
                  <>
                    <Unlock className="w-4 h-4 text-amber-300" />
                    <span>{language === 'sw' ? 'Yameruhusiwa kwa Wazazi' : 'Live to Parents'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white" />
                    <span>{language === 'sw' ? 'Ruhusu Matokeo kwa Wazazi' : 'Release to Parents'}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            onOpenResultsPreview && (
              <button
                onClick={onOpenResultsPreview}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Eye className="w-4 h-4 text-amber-300" />
                <span>{language === 'sw' ? 'Tazama Matokeo ya Shule' : 'View Broadsheet'}</span>
              </button>
            )
          )}
        </div>

        {/* Status Indicator Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{language === 'sw' ? 'Hali ya Matokeo:' : 'Publishing Status:'}</span>
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                isResultsPublishedToParents
                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500'
                  : 'bg-amber-900/80 text-amber-300 border border-amber-500'
              }`}
            >
              {isResultsPublishedToParents
                ? language === 'sw'
                  ? '✓ Yameruhusiwa Rasmi na Mkuu wa Taaluma (Wazazi Wanaona)'
                  : '✓ Published to Parents & Students by Academic Master'
                : language === 'sw'
                ? '⏳ Yapo kwenye Mapitio ya Mtaaluma (Wazazi Bado Hawaoni)'
                : '⏳ Held in Academic Review (Not visible to parents)'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span>
              {language === 'sw' ? 'Uingizaji wa Masomo:' : 'Subjects Progress:'}{' '}
              <strong className="text-white">{totalSubmittedCount}/{subjectStatusList.length}</strong> ({progressPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* 2. ACADEMIC MASTER SUPERVISION MATRIX (SEEN IN ACADEMIC MASTER MODE) */}
      {mode === 'academic_master' && (
        <div className="space-y-4">
          {/* FIRESTORE PENDING SUBMISSIONS REVIEW CARD */}
          {pendingSubmissions.length > 0 && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-2xl p-5 border border-amber-500/40 text-white shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>
                      {language === 'sw'
                        ? `Alama Zilizowasilishwa na Walimu kwenye Firestore (${pendingSubmissions.filter(p => p.status === 'pending').length} Zinasubiri)`
                        : `Teacher Submissions in Firestore (${pendingSubmissions.filter(p => p.status === 'pending').length} Pending Review)`}
                    </span>
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Cloud Firestore: /pendingResults</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingSubmissions.map((sub) => {
                  const isPending = sub.status === 'pending';
                  const isApproving = approvingId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isPending
                          ? 'bg-slate-900/90 border-amber-500/50 hover:border-amber-400'
                          : 'bg-slate-950/60 border-slate-800 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-black text-emerald-400">{sub.subject}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                            isPending
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-emerald-900 text-emerald-300 border border-emerald-500'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 space-y-0.5 mb-2">
                        <div className="font-semibold text-white">{sub.form} • {sub.examType}</div>
                        <div className="text-slate-400 text-[11px]">Mwalimu: <strong className="text-slate-200">{sub.teacherName}</strong></div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Watahiniwa: {sub.submittedCount} • {new Date(sub.submittedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {isPending ? (
                        <button
                          onClick={() => handleApproveSubmission(sub)}
                          disabled={isApproving}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                        >
                          {isApproving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Inaidhinisha...</span>
                            </>
                          ) : (
                            <>
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>{language === 'sw' ? 'Idhinisha Alama Hizi' : 'Approve & Release'}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Imeidhinishwa na {sub.reviewedBy || 'Mkuu wa Taaluma'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'sw' ? 'Ufuatiliaji wa Uingizaji wa Masomo kwa Kila Mwalimu' : 'Teacher Subject Submission Matrix'}</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'sw'
                    ? 'Bofya somo lolote chini ili kukagua, kuingiza, au kurekebisha alama za wanafunzi kama Mkuu wa Taaluma.'
                    : 'Click any subject below to inspect, enter, or override marks on behalf of any teacher.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-mono">
                  {selectedForm} • {selectedExam}
                </span>
              </div>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjectStatusList.map((sub) => {
              const isSelected = selectedSubject.toLowerCase() === sub.subject.toLowerCase();
              return (
                <div
                  key={sub.code}
                  onClick={() => setSelectedSubject(sub.subject)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
                        {sub.key.slice(0, 3)}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{sub.subject}</h5>
                        <span className="text-[10px] text-slate-500 font-mono">NECTA {sub.code}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        sub.status === 'submitted'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {sub.status === 'submitted'
                        ? language === 'sw'
                          ? 'Imewasilishwa'
                          : 'Submitted'
                        : language === 'sw'
                        ? 'Inasubiriwa'
                        : 'Pending'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="truncate">{sub.teacherName}</span>
                    <span className="font-mono font-bold text-slate-800">
                      {sub.studentsCount}/{sub.totalClass}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* 3. CONTROLS: SELECT CLASS, EXAM, AND SUBJECT */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              {language === 'sw' ? 'Kidato' : 'Form'}
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600 cursor-pointer shadow-xs"
            >
              <option value="Form 4">Form 4</option>
              <option value="Form 3">Form 3</option>
              <option value="Form 2">Form 2</option>
              <option value="Form 1">Form 1</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              {language === 'sw' ? 'Mtihani' : 'Exam'}
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600 cursor-pointer shadow-xs"
            >
              <option value="NECTA Mock 2025">NECTA Mock 2025</option>
              <option value="Annual Examination 2025">Annual Examination 2025</option>
              <option value="Mid-Term Exam 2025">Mid-Term Exam 2025</option>
              <option value="Pre-NECTA 2025">Pre-NECTA 2025</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              {language === 'sw' ? 'Somo Linaloingizwa' : 'Subject'}
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600 cursor-pointer shadow-xs"
            >
              {OFFICIAL_NECTA_SUBJECTS.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name} ({s.key})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Search Student in this class */}
        <div className="w-full sm:w-64">
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            {language === 'sw' ? 'Tafuta Mwanafunzi' : 'Filter Student'}
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder={language === 'sw' ? 'Jina au Namba ya Mtihani...' : 'Filter candidate...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-emerald-600 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {submissionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{submissionSuccessMsg}</span>
        </div>
      )}

      {/* 4. STUDENT BY STUDENT MARKS ENTRY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-black flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>
                {language === 'sw'
                  ? `Uingizaji wa Alama: ${selectedSubject} • ${selectedForm}`
                  : `Marks Entry: ${selectedSubject} • ${selectedForm}`}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {displayedStudents.length} {language === 'sw' ? 'Watahiniwa Wamepatikana' : 'Candidates'} • Mwalimu: {currentTeacherName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmitToAcademicMaster}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {mode === 'academic_master'
                  ? language === 'sw'
                    ? 'Hifadhi & Thibitisha Alama'
                    : 'Save & Approve Marks'
                  : language === 'sw'
                  ? 'Wasilisha kwa Mkuu wa Taaluma'
                  : 'Submit to Academic Master'}
              </span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300 text-[11px]">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3 w-36">NAMBA YA MTIHANI</th>
                <th className="py-2.5 px-3">JINA LA MWANAFUNZI</th>
                <th className="py-2.5 px-2 text-center w-12">JINSIA</th>
                <th className="py-2.5 px-3 text-center w-28">ALAMA (/100)</th>
                <th className="py-2.5 px-2 text-center w-16">DARAJA</th>
                <th className="py-2.5 px-2 text-center w-16">POINTI</th>
                <th className="py-2.5 px-3">MAONI YA MWALIMU WA SOMO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedStudents.map((st, idx) => {
                const draft = marksDraft[st.examNumber] || { score: 0, remarks: '' };
                const gradeInfo = scoreToNectaGrade(draft.score);

                return (
                  <tr
                    key={st.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      draft.score >= 45 ? 'text-slate-900' : 'text-slate-800'
                    }`}
                  >
                    <td className="py-2 px-3 text-center font-mono text-slate-500 font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-emerald-950">
                      {formatCno(st.examNumber)}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {st.studentName || students.find(s => s.examNumber.toLowerCase() === st.examNumber.toLowerCase())?.fullName || '—'}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-slate-600">
                      {st.gender}
                    </td>
                    {/* Score Input Box */}
                    <td className="py-1.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={draft.score === 0 && !hasUnsavedChanges ? '' : draft.score}
                        onChange={(e) => handleScoreChange(st.examNumber, e.target.value)}
                        placeholder="0"
                        className="w-20 px-2 py-1 text-center font-mono font-black text-sm bg-slate-50 focus:bg-white rounded-lg border border-slate-300 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </td>
                    {/* Computed Grade */}
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-black font-mono text-xs ${
                          gradeInfo.grade === 'A'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : gradeInfo.grade === 'B'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : gradeInfo.grade === 'C'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : gradeInfo.grade === 'D'
                            ? 'bg-orange-100 text-orange-900 border border-orange-300'
                            : 'bg-red-100 text-red-900 border border-red-300'
                        }`}
                      >
                        {gradeInfo.grade}
                      </span>
                    </td>
                    {/* Points */}
                    <td className="py-2 px-2 text-center font-mono font-bold text-blue-900">
                      {gradeInfo.points}
                    </td>
                    {/* Teacher Remarks */}
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={draft.remarks}
                        onChange={(e) => handleRemarksChange(st.examNumber, e.target.value)}
                        placeholder={gradeInfo.remarks}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Save & Submission Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {language === 'sw'
              ? 'Wanafunzi wanahifadhiwa mara moja kwenye mfumo wa shule. Mtaaluma atapokea taarifa ya uwasilishaji.'
              : 'Marks are saved securely to school records. The Academic Master will receive submission notification.'}
          </span>

          <button
            onClick={handleSubmitToAcademicMaster}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4 text-amber-300" />
            <span>
              {mode === 'academic_master'
                ? language === 'sw'
                  ? 'Hifadhi & Chakata Alama'
                  : 'Save & Process Marks'
                : language === 'sw'
                ? 'Wasilisha Alama kwa Mkuu wa Taaluma'
                : 'Submit Subject Marks to Academic Master'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
