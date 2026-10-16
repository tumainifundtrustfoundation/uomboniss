import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { StudentProfile } from '../../types';
import {
  Users,
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  GraduationCap,
  Award,
  Phone,
  Edit2,
  Trash2,
  Eye,
  X,
  UserCheck,
  Building2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Check,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { OFFICIAL_NECTA_SUBJECTS } from '../../utils/nectaResultsEngine';

interface AcademicStudentRosterTabProps {
  onSelectStudentForMarks?: (student: StudentProfile) => void;
  onViewStudentResults?: (studentIdOrExamNo: string) => void;
}

export const AcademicStudentRosterTab: React.FC<AcademicStudentRosterTabProps> = ({
  onSelectStudentForMarks,
  onViewStudentResults,
}) => {
  const { language } = useLanguage();
  const {
    students,
    studentResults,
    addStudent,
    updateStudent,
    deleteStudent,
    updateStudentSubjectEnrollment,
    bulkExemptStudentsFromSubject,
    bulkEnrollStudentsInSubject,
  } = useData() as any;

  // Primary Tab Toggle: Nominal Roll vs Subject Exemptions
  const [activeRosterMode, setActiveRosterMode] = useState<'nominal_roll' | 'subject_exemptions'>('nominal_roll');

  // Filter & Search state
  const [selectedForm, setSelectedForm] = useState<string>('ALL');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedResidency, setSelectedResidency] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Subject Enrollment & Exemption State (Academic Master)
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('031'); // Physics default
  const [exemptionTab, setExemptionTab] = useState<'exempt' | 'taking' | 'all'>('exempt');
  const [exemptionReasonInput, setExemptionReasonInput] = useState<string>('Mchepuo wa Sanaa (Arts Stream)');

  // Modals & Editing
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [detailModalStudent, setDetailModalStudent] = useState<StudentProfile | null>(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<StudentProfile | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Student Form State
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    fullName: '',
    examNumber: '',
    studentId: '',
    premNumber: '',
    form: 'Form 4',
    stream: 'Science',
    gender: 'F',
    studentType: 'Bweni (Boarding)',
    parentName: '',
    parentPhone: '',
    conductRating: 'Bora Sana',
    attendanceRate: 98,
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Roster Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const form1 = students.filter((s) => s.form === 'Form 1').length;
    const form2 = students.filter((s) => s.form === 'Form 2').length;
    const form3 = students.filter((s) => s.form === 'Form 3').length;
    const form4 = students.filter((s) => s.form === 'Form 4').length;
    const boys = students.filter((s) => s.gender === 'M').length;
    const girls = students.filter((s) => s.gender === 'F').length;
    const boarding = students.filter((s) => (s.studentType || s.boardingStatus || '').toLowerCase().includes('bweni')).length;
    const day = total - boarding;

    return { total, form1, form2, form3, form4, boys, girls, boarding, day };
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Form filter
      if (selectedForm !== 'ALL' && s.form !== selectedForm) return false;

      // Stream filter
      if (selectedStream !== 'ALL' && s.stream !== selectedStream) return false;

      // Gender filter
      if (selectedGender !== 'ALL' && s.gender !== selectedGender) return false;

      // Residency filter
      if (selectedResidency !== 'ALL') {
        const isBweni = (s.studentType || s.boardingStatus || '').toLowerCase().includes('bweni');
        if (selectedResidency === 'Bweni' && !isBweni) return false;
        if (selectedResidency === 'Kutwa' && isBweni) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.fullName.toLowerCase().includes(q);
        const matchesExam = s.examNumber.toLowerCase().includes(q);
        const matchesId = s.studentId.toLowerCase().includes(q);
        const matchesPrem = s.premNumber ? s.premNumber.toLowerCase().includes(q) : false;
        const matchesParent = s.parentName ? s.parentName.toLowerCase().includes(q) : false;
        const matchesPhone = s.parentPhone ? s.parentPhone.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesExam && !matchesId && !matchesPrem && !matchesParent && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [students, selectedForm, selectedStream, selectedGender, selectedResidency, searchQuery]);

  // Check latest result for student
  const getStudentLatestResult = (examNo: string) => {
    const results = studentResults.filter(
      (r) => r.examNumber.toLowerCase() === examNo.toLowerCase()
    );
    if (results.length === 0) return null;
    return results[results.length - 1];
  };

  // Active Subject for Exemption Management
  const activeSubject = useMemo(() => {
    return (
      OFFICIAL_NECTA_SUBJECTS.find(
        (s) => s.code === selectedSubjectCode || s.name.toLowerCase() === selectedSubjectCode.toLowerCase()
      ) || OFFICIAL_NECTA_SUBJECTS[6] // Chemistry
    );
  }, [selectedSubjectCode]);

  // Check whether a student is exempt from the active subject
  const isStudentExempt = (student: StudentProfile, subjectCode: string) => {
    const code = subjectCode.toLowerCase();
    const subObj = OFFICIAL_NECTA_SUBJECTS.find((s) => s.code === subjectCode);
    const subName = subObj ? subObj.name.toLowerCase() : '';

    if (student.exemptSubjects && student.exemptSubjects.length > 0) {
      const match = student.exemptSubjects.some(
        (ex) => ex.toLowerCase() === code || (subName && ex.toLowerCase() === subName)
      );
      if (match) return true;
    }

    // Default stream rules: if student is in Arts stream and subject is Physics/Chemistry and not explicitly registered
    if (student.stream?.toLowerCase().includes('art') || student.stream === 'Arts') {
      if (
        (code === '031' || code === '032' || subName.includes('physics') || subName.includes('chemistry')) &&
        (!student.registeredSubjects || !student.registeredSubjects.includes(code))
      ) {
        return true;
      }
    }

    // Default stream rules: if student is in Science stream and subject is History/Commerce and not explicitly registered
    if (student.stream?.toLowerCase().includes('sci') || student.stream === 'Science') {
      if (
        (code === '012' || code === '061' || subName.includes('history') || subName.includes('commerce')) &&
        (!student.registeredSubjects || !student.registeredSubjects.includes(code))
      ) {
        return true;
      }
    }

    return false;
  };

  // Grouped students by exemption for active subject
  const subjectBreakdown = useMemo(() => {
    const classFiltered = students.filter((s) => {
      if (selectedForm !== 'ALL' && s.form !== selectedForm) return false;
      if (selectedStream !== 'ALL' && s.stream !== selectedStream) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.examNumber.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const taking: StudentProfile[] = [];
    const exempt: StudentProfile[] = [];

    classFiltered.forEach((st) => {
      if (isStudentExempt(st, selectedSubjectCode)) {
        exempt.push(st);
      } else {
        taking.push(st);
      }
    });

    return { taking, exempt, all: classFiltered, total: classFiltered.length };
  }, [students, selectedSubjectCode, selectedForm, selectedStream, searchQuery]);

  // Handle single student exemption toggle
  const handleToggleStudentExemption = (student: StudentProfile) => {
    const isCurrentlyExempt = isStudentExempt(student, selectedSubjectCode);
    if (isCurrentlyExempt) {
      // Re-enroll
      bulkEnrollStudentsInSubject(selectedSubjectCode, [student.id]);
      showToast(`Mwanafunzi ${student.fullName} amesajiliwa kwenye somo la ${activeSubject.name}.`);
    } else {
      // Exempt
      bulkExemptStudentsFromSubject(selectedSubjectCode, [student.id], exemptionReasonInput);
      showToast(`Mwanafunzi ${student.fullName} amewekwa kama hafanyi somo la ${activeSubject.name} (${exemptionReasonInput}).`);
    }
  };

  // Handle bulk stream exemption
  const handleBulkExemptStream = (streamName: string) => {
    const targets = students
      .filter((s) => (selectedForm === 'ALL' || s.form === selectedForm) && s.stream === streamName)
      .map((s) => s.id);
    if (targets.length === 0) {
      showToast(`Hakuna wanafunzi wa mkondo wa ${streamName} waliopatikana.`);
      return;
    }
    bulkExemptStudentsFromSubject(selectedSubjectCode, targets, `Mchepuo wa ${streamName}`);
    showToast(`Wanafunzi ${targets.length} wa mkondo wa ${streamName} wamewekwa kama hawafanyi somo la ${activeSubject.name}.`);
  };

  // Handle bulk enroll all in subject
  const handleBulkEnrollAll = () => {
    const targets = subjectBreakdown.exempt.map((s) => s.id);
    if (targets.length === 0) {
      showToast(`Wanafunzi wote tayari wanasoma somo hili.`);
      return;
    }
    bulkEnrollStudentsInSubject(selectedSubjectCode, targets);
    showToast(`Wanafunzi wote ${targets.length} wamesajiliwa kwenye somo la ${activeSubject.name}.`);
  };

  // Handle Save New Student
  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim()) return;

    const newExamNumber = formData.examNumber?.trim() || `S0486/${String(students.length + 1).padStart(4, '0')}/2026`;
    const newStudentId = formData.studentId?.trim() || `USS-2026-${String(students.length + 1).padStart(4, '0')}`;

    const newStudent: StudentProfile = {
      id: `std-custom-${Date.now()}`,
      studentId: newStudentId,
      examNumber: newExamNumber,
      premNumber: formData.premNumber || `PREM-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      fullName: formData.fullName.trim(),
      gender: (formData.gender as 'M' | 'F') || 'F',
      form: formData.form || 'Form 4',
      stream: formData.stream || 'Science',
      admissionYear: 2026,
      studentType: formData.studentType || 'Bweni (Boarding)',
      boardingStatus: formData.studentType?.includes('Bweni') ? 'Bweni' : 'Kutwa',
      parentName: formData.parentName || '',
      parentPhone: formData.parentPhone || '',
      conductRating: formData.conductRating || 'Bora Sana',
      attendanceRate: formData.attendanceRate || 98,
    };

    addStudent(newStudent);
    setIsAddModalOpen(false);
    setFormData({
      fullName: '',
      examNumber: '',
      studentId: '',
      premNumber: '',
      form: 'Form 4',
      stream: 'Science',
      gender: 'F',
      studentType: 'Bweni (Boarding)',
      parentName: '',
      parentPhone: '',
      conductRating: 'Bora Sana',
      attendanceRate: 98,
    });
    showToast(`Mwanafunzi ${newStudent.fullName} amesajiliwa kikamilifu kwenye Daftari la Taaluma!`);
  };

  // Handle Update Existing Student
  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    updateStudent(editingStudent);
    setEditingStudent(null);
    showToast(`Taarifa za ${editingStudent.fullName} zimesasishwa kikamilifu!`);
  };

  // Handle Delete Student
  const handleDeleteStudent = (id: string) => {
    deleteStudent(id);
    setDeleteConfirmStudent(null);
    showToast('Mwanafunzi ameondolewa kwenye orodha!');
  };

  // Export Roster to CSV
  const handleExportCSV = () => {
    const headers = [
      'Na.',
      'Jina Kamili',
      'Namba ya Mtihani (CNO)',
      'Namba ya Usajili (ID)',
      'Namba ya PREM',
      'Kidato',
      'Mkondo',
      'Jinsia',
      'Aina (Bweni/Kutwa)',
      'Mzazi/Mlezi',
      'Simu ya Mzazi',
      'Nidhamu',
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.examNumber}"`,
      `"${s.studentId}"`,
      `"${s.premNumber || ''}"`,
      `"${s.form}"`,
      `"${s.stream}"`,
      s.gender === 'M' ? 'Mvulana' : 'Msichana',
      `"${s.studentType || s.boardingStatus || ''}"`,
      `"${(s.parentName || '').replace(/"/g, '""')}"`,
      `"${s.parentPhone || ''}"`,
      `"${s.conductRating || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ORODHA_YA_WANAFUNZI_UOMBONI_${selectedForm}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Daftari la wanafunzi limepakuliwa (CSV/Excel)!');
  };

  // Print Roster
  const handlePrintRoster = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Quick Overview */}
      <div className="bg-[#FFFDF8] p-5 rounded-3xl border-2 border-red-200/80 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-700 text-[#FFFFF0] font-black shadow-xs">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <span>{language === 'sw' ? 'Daftari Kamili la Wanafunzi (Nominal Roll ya Mtaaluma)' : 'Official Student Register (Nominal Roll)'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-red-900 border border-red-300 text-xs font-mono font-bold">
                  {students.length} {language === 'sw' ? 'Wanafunzi' : 'Students'}
                </span>
              </h3>
              <p className="text-xs text-stone-600">
                {language === 'sw'
                  ? 'Orodha rasmi ya wanafunzi waliosajiliwa Kidato cha 1 hadi cha 4, namba za NECTA/CSEE, PREM, na viunganishi vya matokeo.'
                  : 'Official registered students roster across Form 1 to 4 with NECTA CSEE candidate indices, PREM numbers, and results.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#FFFFF0]" />
            <span>{language === 'sw' ? 'Sajili Mwanafunzi Mpya' : 'Add New Student'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-[#FAF7EE] hover:bg-red-50 text-red-900 text-xs font-bold flex items-center gap-1.5 border border-red-300 cursor-pointer transition-all"
            title="Pakua Orodha katika Muundo wa Excel au CSV"
          >
            <Download className="w-3.5 h-3.5 text-red-700" />
            <span>{language === 'sw' ? 'Pakua Excel/CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handlePrintRoster}
            className="px-3 py-2 rounded-xl bg-[#FAF7EE] hover:bg-red-50 text-stone-800 text-xs font-bold flex items-center gap-1.5 border border-red-300 cursor-pointer transition-all"
            title="Chapisha Orodha Rasmi ya Darasa"
          >
            <Printer className="w-3.5 h-3.5 text-red-700" />
            <span>{language === 'sw' ? 'Chapisha Orodha' : 'Print Roll'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation: Nominal Roll vs Subject Exemptions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-[#FAF7EE] rounded-2xl border-2 border-red-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveRosterMode('nominal_roll')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeRosterMode === 'nominal_roll'
                ? 'bg-red-700 text-[#FFFFF0] shadow-md'
                : 'text-stone-700 hover:bg-red-100/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'sw' ? 'Daftari Kamili la Wanafunzi (Nominal Roll)' : 'Student Nominal Roll'}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-mono">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveRosterMode('subject_exemptions')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeRosterMode === 'subject_exemptions'
                ? 'bg-red-700 text-[#FFFFF0] shadow-md'
                : 'text-stone-700 hover:bg-red-100/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'sw' ? 'Wanafunzi Wasiolifanya Somo & Usajili' : 'Subject Exemptions & Enrollment'}</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
              ★ {subjectBreakdown.exempt.length} Wasiolifanya
            </span>
          </button>
        </div>

        {activeRosterMode === 'subject_exemptions' && (
          <div className="text-xs font-bold text-red-950 flex items-center gap-2 px-2">
            <span>Somo Linalochunguzwa:</span>
            <strong className="text-red-700 font-black">{activeSubject.name} ({activeSubject.code})</strong>
          </div>
        )}
      </div>

      {activeRosterMode === 'nominal_roll' && (
        <>
          {/* Class Statistics Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <button
              onClick={() => setSelectedForm('ALL')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedForm === 'ALL'
              ? 'bg-red-700 border-red-800 text-[#FFFFF0] shadow-md'
              : 'bg-[#FFFDF8] border-red-200 text-stone-800 hover:bg-[#FAF7EE]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase block ${selectedForm === 'ALL' ? 'text-red-100' : 'text-stone-500'}`}>Wote (Shule Nzima)</span>
          <span className={`text-xl font-black mt-0.5 block ${selectedForm === 'ALL' ? 'text-[#FFFFF0]' : 'text-red-900'}`}>{stats.total}</span>
          <span className={`text-[10px] ${selectedForm === 'ALL' ? 'text-red-100' : 'text-stone-500'}`}>{stats.boys} ME &bull; {stats.girls} KE</span>
        </button>

        <button
          onClick={() => setSelectedForm('Form 1')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedForm === 'Form 1'
              ? 'bg-red-700 border-red-800 text-[#FFFFF0] shadow-md'
              : 'bg-[#FFFDF8] border-red-200 text-stone-800 hover:bg-[#FAF7EE]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase block ${selectedForm === 'Form 1' ? 'text-red-100' : 'text-stone-500'}`}>Kidato cha 1 (Form 1)</span>
          <span className={`text-xl font-black mt-0.5 block ${selectedForm === 'Form 1' ? 'text-[#FFFFF0]' : 'text-stone-900'}`}>{stats.form1}</span>
          <span className={`text-[10px] ${selectedForm === 'Form 1' ? 'text-red-100' : 'text-red-800'}`}>Waliosajiliwa 2025/26</span>
        </button>

        <button
          onClick={() => setSelectedForm('Form 2')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedForm === 'Form 2'
              ? 'bg-red-700 border-red-800 text-[#FFFFF0] shadow-md'
              : 'bg-[#FFFDF8] border-red-200 text-stone-800 hover:bg-[#FAF7EE]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase block ${selectedForm === 'Form 2' ? 'text-red-100' : 'text-stone-500'}`}>Kidato cha 2 (Form 2)</span>
          <span className={`text-xl font-black mt-0.5 block ${selectedForm === 'Form 2' ? 'text-[#FFFFF0]' : 'text-stone-900'}`}>{stats.form2}</span>
          <span className={`text-[10px] ${selectedForm === 'Form 2' ? 'text-red-100' : 'text-red-800'}`}>FTNA NECTA / CSSC</span>
        </button>

        <button
          onClick={() => setSelectedForm('Form 3')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedForm === 'Form 3'
              ? 'bg-red-700 border-red-800 text-[#FFFFF0] shadow-md'
              : 'bg-[#FFFDF8] border-red-200 text-stone-800 hover:bg-[#FAF7EE]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase block ${selectedForm === 'Form 3' ? 'text-red-100' : 'text-stone-500'}`}>Kidato cha 3 (Form 3)</span>
          <span className={`text-xl font-black mt-0.5 block ${selectedForm === 'Form 3' ? 'text-[#FFFFF0]' : 'text-stone-900'}`}>{stats.form3}</span>
          <span className={`text-[10px] ${selectedForm === 'Form 3' ? 'text-red-100' : 'text-red-800'}`}>Science & Arts</span>
        </button>

        <button
          onClick={() => setSelectedForm('Form 4')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedForm === 'Form 4'
              ? 'bg-red-700 border-red-800 text-[#FFFFF0] shadow-md'
              : 'bg-[#FFFDF8] border-red-200 text-stone-800 hover:bg-[#FAF7EE]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase block ${selectedForm === 'Form 4' ? 'text-red-100' : 'text-stone-500'}`}>Kidato cha 4 (Form 4)</span>
          <span className={`text-xl font-black mt-0.5 block ${selectedForm === 'Form 4' ? 'text-[#FFFFF0]' : 'text-red-900'}`}>{stats.form4}</span>
          <span className={`text-[10px] ${selectedForm === 'Form 4' ? 'text-red-100' : 'text-red-800'}`}>Watahiniwa CSEE S0486</span>
        </button>

        <div className="p-3 rounded-2xl bg-[#FFFDF8] border border-red-200 text-stone-800 shadow-xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">Ukaazi (Boarding/Day)</span>
          <span className="text-sm font-black text-stone-900 mt-1 block">
            <span className="text-red-700">{stats.boarding}</span> Bweni / <span className="text-stone-700">{stats.day}</span> Kutwa
          </span>
          <span className="text-[10px] text-stone-500">Hosteli 100% Salama</span>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-[#FFFDF8] p-4 rounded-3xl border-2 border-red-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-red-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'sw'
                ? 'Tafuta mwanafunzi kwa Jina, Namba ya CNO (S0486/...), PREM, au Simu ya Mzazi...'
                : 'Search student by Name, Exam Number, PREM, or Parent Phone...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FAF7EE] border border-red-300 text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-red-600 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-red-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Form Select */}
          <div className="flex items-center gap-1 bg-[#FAF7EE] border border-red-300 rounded-xl px-2.5 py-1">
            <span className="text-[10px] text-stone-600 font-bold">Kidato:</span>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="bg-transparent text-xs text-stone-900 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Madarasa Yote</option>
              <option value="Form 1">Kidato cha 1</option>
              <option value="Form 2">Kidato cha 2</option>
              <option value="Form 3">Kidato cha 3</option>
              <option value="Form 4">Kidato cha 4</option>
            </select>
          </div>

          {/* Gender Select */}
          <div className="flex items-center gap-1 bg-[#FAF7EE] border border-red-300 rounded-xl px-2.5 py-1">
            <span className="text-[10px] text-stone-600 font-bold">Jinsia:</span>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="bg-transparent text-xs text-stone-900 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Wote (ME & KE)</option>
              <option value="M">Wavulana (ME)</option>
              <option value="F">Wasichana (KE)</option>
            </select>
          </div>

          {/* Residency Select */}
          <div className="flex items-center gap-1 bg-[#FAF7EE] border border-red-300 rounded-xl px-2.5 py-1">
            <span className="text-[10px] text-stone-600 font-bold">Ukaazi:</span>
            <select
              value={selectedResidency}
              onChange={(e) => setSelectedResidency(e.target.value)}
              className="bg-transparent text-xs text-stone-900 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Wote</option>
              <option value="Bweni">Bweni</option>
              <option value="Kutwa">Kutwa</option>
            </select>
          </div>

          {(selectedForm !== 'ALL' || selectedGender !== 'ALL' || selectedResidency !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedForm('ALL');
                setSelectedGender('ALL');
                setSelectedResidency('ALL');
                setSearchQuery('');
              }}
              className="px-2 py-1 text-[11px] text-red-700 hover:text-red-900 font-bold cursor-pointer underline"
            >
              Weka Upya
            </button>
          )}
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="bg-[#FFFDF8] rounded-3xl border-2 border-red-200/80 shadow-md overflow-hidden">
        <div className="p-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-red-700" />
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              {language === 'sw' ? 'Orodha ya Wanafunzi Waliochujwa' : 'Filtered Students Roster'}
            </h4>
            <span className="text-xs text-stone-500">({filteredStudents.length} / {students.length})</span>
          </div>

          <span className="text-[11px] text-stone-500 font-mono">
            Kituo: <strong className="text-red-800">S.0486</strong> &bull; Marangu, Moshi
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-stone-500 space-y-3">
            <Users className="w-12 h-12 text-stone-400 mx-auto" />
            <p className="text-sm font-bold text-stone-800">Hakuna mwanafunzi aliyepatikana kwa vigezo hivi.</p>
            <p className="text-xs text-stone-500">Jaribu kubadilisha darasa au maneno ya utafutaji.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7EE] text-stone-700 uppercase text-[10px] font-black border-b border-red-200">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-4">Jina Kamili la Mwanafunzi</th>
                  <th className="py-3 px-3">Namba ya Mtihani (CNO)</th>
                  <th className="py-3 px-3">Namba ya PREM / ID</th>
                  <th className="py-3 px-2 text-center">Jinsia</th>
                  <th className="py-3 px-3">Kidato & Mkondo</th>
                  <th className="py-3 px-3">Aina / Hosteli</th>
                  <th className="py-3 px-3">Mzazi / Mlezi & Simu</th>
                  <th className="py-3 px-3">Matokeo ya Karibuni</th>
                  <th className="py-3 px-4 text-right">Vitendo vya Taaluma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100 font-medium text-stone-800">
                {filteredStudents.map((s, idx) => {
                  const latestRes = getStudentLatestResult(s.examNumber);

                  return (
                    <tr
                      key={s.id || s.studentId || idx}
                      className="hover:bg-[#FAF7EE] transition-colors group"
                    >
                      {/* Roll Index */}
                      <td className="py-3 px-3 text-stone-500 font-mono text-[11px] font-bold">
                        {idx + 1}
                      </td>

                      {/* Full Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            s.gender === 'M' ? 'bg-[#FAF7EE] text-stone-800 border border-red-200' : 'bg-red-50 text-red-800 border border-red-200'
                          }`}>
                            {s.gender === 'M' ? 'ME' : 'KE'}
                          </span>
                          <div>
                            <span className="text-stone-900 font-black text-xs block group-hover:text-red-700 transition-colors">
                              {s.fullName}
                            </span>
                            {s.leadershipRole && (
                              <span className="text-[10px] text-red-800 font-semibold block">
                                👑 {s.leadershipRole}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Exam Number */}
                      <td className="py-3 px-3 font-mono font-bold text-red-800 text-[11px]">
                        {s.examNumber}
                      </td>

                      {/* PREM Number */}
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-500">
                        {s.premNumber || s.studentId}
                      </td>

                      {/* Gender */}
                      <td className="py-3 px-2 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          s.gender === 'M' ? 'bg-[#FAF7EE] text-stone-800 border border-red-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {s.gender === 'M' ? 'ME' : 'KE'}
                        </span>
                      </td>

                      {/* Form & Stream */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-stone-900 block">{s.form}</span>
                        <span className="text-[10px] text-stone-500 font-mono">{s.stream}</span>
                      </td>

                      {/* Residency / Boarding */}
                      <td className="py-3 px-3">
                        <span className="text-stone-700 text-xs block">
                          {(s.studentType || s.boardingStatus || '').includes('Bweni') ? '🏠 Bweni' : '🚶 Kutwa'}
                        </span>
                        {s.dormitoryRoom && (
                          <span className="text-[10px] text-stone-500 block truncate max-w-[130px]">
                            {s.dormitoryRoom}
                          </span>
                        )}
                      </td>

                      {/* Parent / Guardian & Phone */}
                      <td className="py-3 px-3">
                        <span className="text-stone-700 text-xs block truncate max-w-[130px]">
                          {s.parentName || s.parentGuardianName || '-'}
                        </span>
                        {s.parentPhone && (
                          <a
                            href={`tel:${s.parentPhone}`}
                            className="text-[10px] text-red-700 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>{s.parentPhone}</span>
                          </a>
                        )}
                      </td>

                      {/* Latest Result */}
                      <td className="py-3 px-3">
                        {latestRes ? (
                          <div className="space-y-0.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                              latestRes.division === 'Division I'
                                ? 'bg-red-700 text-[#FFFFF0]'
                                : latestRes.division === 'Division II'
                                ? 'bg-red-800 text-[#FFFFF0]'
                                : latestRes.division === 'Division III'
                                ? 'bg-red-900 text-[#FFFFF0]'
                                : 'bg-[#FAF7EE] text-stone-700 border border-red-200'
                            }`}>
                              {latestRes.division} (Pts {latestRes.points})
                            </span>
                            <span className="text-[10px] text-stone-500 block truncate max-w-[110px]">
                              {latestRes.examType}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">Haijarekodiwa</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Enter marks for this student */}
                          {onSelectStudentForMarks && (
                            <button
                              onClick={() => onSelectStudentForMarks(s)}
                              className="px-2 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                              title="Weka Alama za Somo kwa mwanafunzi huyu"
                            >
                              <Edit2 className="w-3 h-3 text-[#FFFFF0]" />
                              <span className="hidden xl:inline">Alama</span>
                            </button>
                          )}

                          {/* View Result Slip */}
                          {onViewStudentResults && (
                            <button
                              onClick={() => onViewStudentResults(s.examNumber || s.studentId)}
                              className="px-2 py-1 rounded-lg bg-[#FAF7EE] hover:bg-red-50 text-red-900 border border-red-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="Tazama Matokeo Kamili / Result Slip"
                            >
                              <Eye className="w-3.5 h-3.5 text-red-700" />
                              <span className="hidden xl:inline">Matokeo</span>
                            </button>
                          )}

                          {/* Quick Edit */}
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="p-1 rounded-lg text-stone-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            title="Hariri Taarifa za Mwanafunzi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Delete */}
                          <button
                            onClick={() => setDeleteConfirmStudent(s)}
                            className="p-1 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            title="Futa Mwanafunzi"
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
        )}
      </div>
    </>
  )}

  {/* VIEW 2: SUBJECT ENROLLMENT & EXEMPTIONS MANAGER (ACADEMIC MASTER) */}
  {activeRosterMode === 'subject_exemptions' && (
    <div className="space-y-5">
      {/* Subject & Class Controls Bar */}
      <div className="bg-[#FFFDF8] p-5 rounded-3xl border-2 border-red-200/80 shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-950 text-xs font-black uppercase mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
              <span>{language === 'sw' ? 'Mamlaka ya Mkuu wa Taaluma' : 'Academic Master Authority'}</span>
            </div>
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-red-700" />
              <span>{language === 'sw' ? 'Usimamizi wa Wanafunzi Wasiolifanya Somo & Usajili wa Masomo' : 'Subject Registration & Exemption Roster'}</span>
            </h3>
            <p className="text-xs text-stone-600 max-w-2xl mt-0.5">
              {language === 'sw'
                ? 'Angalia wanafunzi wote wanaofanya au ambao hawafanyi somo hili (k.m. wanafunzi wa mchepuo wa sanaa wasiofanya Physics/Chemistry). Unaweza kusajili au kuweka msamaha kwa mwanafunzi yeyote kwa kubonyeza kitufe cha hatua.'
                : 'Monitor students registered for or exempt from specific subjects (e.g., Arts stream students not taking Physics or Chemistry). Manage exemptions with single-click actions.'}
            </p>
          </div>

          {/* Quick Stream Bulk Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkExemptStream('Arts')}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-black border border-amber-300 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              title="Weka wanafunzi wote wa Arts wasifanye somo hili"
            >
              <span>Msamaha: Wanafunzi wa Sanaa (Arts)</span>
            </button>

            <button
              type="button"
              onClick={handleBulkEnrollAll}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-[#FFFFF0] text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Sajili Wote Kwenye Somo</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-red-100">
          {/* Subject Selector */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {language === 'sw' ? '1. Chagua Somo la Kuchunguza' : '1. Select Subject'}
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border-2 border-red-300 text-stone-900 font-bold text-xs focus:ring-2 focus:ring-red-600 focus:outline-none shadow-xs"
            >
              {OFFICIAL_NECTA_SUBJECTS.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          {/* Form Selector */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {language === 'sw' ? '2. Kidato (Form)' : '2. Class Form'}
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-red-300 text-stone-900 font-semibold text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
            >
              <option value="ALL">Madarasa Yote (All Forms)</option>
              <option value="Form 4">Kidato cha 4 (Form 4)</option>
              <option value="Form 3">Kidato cha 3 (Form 3)</option>
              <option value="Form 2">Kidato cha 2 (Form 2)</option>
              <option value="Form 1">Kidato cha 1 (Form 1)</option>
            </select>
          </div>

          {/* Stream Selector */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {language === 'sw' ? '3. Mkondo / Mchepuo' : '3. Stream'}
            </label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-red-300 text-stone-900 font-semibold text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
            >
              <option value="ALL">Mikondo Yote</option>
              <option value="Science">Sayansi (Science)</option>
              <option value="Arts">Sanaa (Arts)</option>
              <option value="A">Stream A</option>
              <option value="B">Stream B</option>
            </select>
          </div>

          {/* Exemption Reason Preset */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {language === 'sw' ? '4. Sababu ya Msamaha wa Somo' : '4. Exemption Reason'}
            </label>
            <input
              type="text"
              value={exemptionReasonInput}
              onChange={(e) => setExemptionReasonInput(e.target.value)}
              placeholder="mfano: Mchepuo wa Sanaa"
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7EE] border border-red-300 text-stone-900 font-medium text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards for Selected Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase block">
              {language === 'sw' ? 'Wanafunzi Darasani' : 'Total Candidates'}
            </span>
            <span className="text-2xl font-black text-stone-900 mt-1 block">
              {subjectBreakdown.total}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center font-black text-stone-700">
            {activeSubject.code}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase block">
              {language === 'sw' ? 'Wanaofanya Somo Hili' : 'Registered / Taking Subject'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-950">
                {subjectBreakdown.taking.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black">
                {subjectBreakdown.total > 0
                  ? `${Math.round((subjectBreakdown.taking.length / subjectBreakdown.total) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-800 uppercase block">
              {language === 'sw' ? 'Hawafanyi Somo Hili (Exempt)' : 'Exempt / Not Taking Subject'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-rose-950">
                {subjectBreakdown.exempt.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black">
                ★ Wasiofanya
              </span>
            </div>
          </div>
          <AlertCircle className="w-8 h-8 text-rose-500 opacity-80" />
        </div>
      </div>

      {/* Filter Tabs: Exempt vs Taking vs All */}
      <div className="flex items-center gap-2 p-1.5 bg-[#FAF7EE] rounded-2xl border border-red-200">
        <button
          onClick={() => setExemptionTab('exempt')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            exemptionTab === 'exempt'
              ? 'bg-rose-700 text-[#FFFFF0] shadow-md'
              : 'text-stone-700 hover:bg-red-100/60'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{language === 'sw' ? 'Wanafunzi Ambao Hawafanyi Somo Hili' : 'Exempt / Not Taking Subject'}</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-900 text-[#FFFFF0] text-[10px] font-bold">
            {subjectBreakdown.exempt.length}
          </span>
        </button>

        <button
          onClick={() => setExemptionTab('taking')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            exemptionTab === 'taking'
              ? 'bg-emerald-700 text-[#FFFFF0] shadow-md'
              : 'text-stone-700 hover:bg-red-100/60'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{language === 'sw' ? 'Wanaofanya Somo' : 'Enrolled Students'}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-[#FFFFF0] text-[10px] font-bold">
            {subjectBreakdown.taking.length}
          </span>
        </button>

        <button
          onClick={() => setExemptionTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            exemptionTab === 'all'
              ? 'bg-red-700 text-[#FFFFF0] shadow-md'
              : 'text-stone-700 hover:bg-red-100/60'
          }`}
        >
          <span>{language === 'sw' ? 'Wanafunzi Wote' : 'All Candidates'}</span>
          <span className="px-2 py-0.5 rounded-full bg-stone-300 text-stone-900 text-[10px] font-bold">
            {subjectBreakdown.total}
          </span>
        </button>
      </div>

      {/* Table of Students for active exemption tab */}
      <div className="bg-[#FFFDF8] rounded-3xl border-2 border-red-200/80 shadow-md overflow-hidden">
        <div className="p-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-red-700" />
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              {exemptionTab === 'exempt'
                ? `Wanafunzi Wasiolifanya Somo la ${activeSubject.name} (${subjectBreakdown.exempt.length})`
                : exemptionTab === 'taking'
                ? `Wanafunzi Wanaosoma Somo la ${activeSubject.name} (${subjectBreakdown.taking.length})`
                : `Wanafunzi Wote wa Darasa (${subjectBreakdown.total})`}
            </h4>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            NECTA Code: <strong>{activeSubject.code}</strong>
          </span>
        </div>

        {(() => {
          const list =
            exemptionTab === 'exempt'
              ? subjectBreakdown.exempt
              : exemptionTab === 'taking'
              ? subjectBreakdown.taking
              : subjectBreakdown.all;

          if (list.length === 0) {
            return (
              <div className="py-16 text-center text-stone-500 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-70" />
                <p className="text-sm font-bold text-stone-800">
                  {exemptionTab === 'exempt'
                    ? `Wanafunzi wote wanasoma somo hili la ${activeSubject.name}!`
                    : `Hakuna mwanafunzi aliyepatikana kwa kundi hili.`}
                </p>
                <p className="text-xs text-stone-500">
                  {exemptionTab === 'exempt'
                    ? 'Hakuna msamaha au mwanafunzi aliyewekwa kama hafanyi somo hili.'
                    : 'Tumia vichujio au sajili wanafunzi kwenye somo hili.'}
                </p>
              </div>
            );
          }

          return (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7EE] text-stone-700 uppercase text-[10px] font-black border-b border-red-200">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-4">Jina Kamili la Mwanafunzi</th>
                    <th className="py-3 px-3">Namba ya Mtihani (CNO)</th>
                    <th className="py-3 px-3">Kidato & Mkondo</th>
                    <th className="py-3 px-3 text-center">Hali ya Somo ({activeSubject.name})</th>
                    <th className="py-3 px-3">Sababu ya Msamaha</th>
                    <th className="py-3 px-4 text-right">Kitendo cha Taaluma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100 font-medium text-stone-800">
                  {list.map((st, idx) => {
                    const isExempt = isStudentExempt(st, selectedSubjectCode);
                    const reason =
                      st.subjectExemptionReasons?.[selectedSubjectCode] ||
                      st.subjectExemptionReasons?.[activeSubject.name] ||
                      (st.stream === 'Arts' ? 'Mchepuo wa Sanaa (Arts)' : st.stream === 'Science' ? 'Mchepuo wa Sayansi' : 'Msamaha Maalum');

                    return (
                      <tr
                        key={st.id}
                        className={`hover:bg-[#FFFFF0]/80 transition-colors ${
                          isExempt ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-stone-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          <div>{st.fullName}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{st.studentId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-red-900">{st.examNumber}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-stone-900 block">{st.form}</span>
                          <span className="text-[10px] text-stone-500 font-mono">{st.stream}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isExempt ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Hafanyi Somo Hili</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Inafanya Somo</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-stone-600">
                          {isExempt ? (
                            <span className="font-medium text-rose-900">{reason}</span>
                          ) : (
                            <span className="text-stone-400 italic">Limesajiliwa</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStudentExemption(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 ${
                              isExempt
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-[#FFFFF0]'
                                : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
                            }`}
                          >
                            {isExempt ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Sajili Kwenye Somo</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5" />
                                <span>Weka Kama Hafanyi Somo</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  )}

      {/* MODAL: Add New Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black">
                  <Plus className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-black text-white">Sajili Mwanafunzi Mpya (Daftari la Taaluma)</h4>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Jina Kamili la Mwanafunzi *</label>
                  <input
                    type="text"
                    required
                    placeholder="mf. Adella Silvano Massawe"
                    value={formData.fullName}
                    onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Namba ya Mtihani CNO (NECTA) *</label>
                  <input
                    type="text"
                    placeholder="S.0486.0020 au S0486/0020/2026"
                    value={formData.examNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, examNumber: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-hidden focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Kidato (Form) *</label>
                  <select
                    value={formData.form}
                    onChange={(e) => setFormData((p) => ({ ...p, form: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Form 1">Kidato cha 1 (Form 1)</option>
                    <option value="Form 2">Kidato cha 2 (Form 2)</option>
                    <option value="Form 3">Kidato cha 3 (Form 3)</option>
                    <option value="Form 4">Kidato cha 4 (Form 4)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Mkondo / Combination</label>
                  <select
                    value={formData.stream}
                    onChange={(e) => setFormData((p) => ({ ...p, stream: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="A">Stream A</option>
                    <option value="B">Stream B</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Jinsia *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="M">Mvulana (Male - ME)</option>
                    <option value="F">Msichana (Female - KE)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Namba ya PREM / Primary Roll</label>
                  <input
                    type="text"
                    placeholder="PREM-2025-XXXXX"
                    value={formData.premNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, premNumber: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Aina ya Mwanafunzi</label>
                  <select
                    value={formData.studentType}
                    onChange={(e) => setFormData((p) => ({ ...p, studentType: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Bweni (Boarding)">Bweni (Boarding)</option>
                    <option value="Kutwa (Day Scholar)">Kutwa (Day Scholar)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Simu ya Mzazi / Mlezi</label>
                  <input
                    type="tel"
                    placeholder="+255 7XX XXX XXX"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData((p) => ({ ...p, parentPhone: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sajili Mwanafunzi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black">
                  <Edit2 className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-black text-white">Hariri Taarifa za Mwanafunzi: {editingStudent.fullName}</h4>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Jina Kamili</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.fullName}
                    onChange={(e) => setEditingStudent((p) => p ? { ...p, fullName: e.target.value } : null)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Namba ya Mtihani (CNO)</label>
                  <input
                    type="text"
                    value={editingStudent.examNumber}
                    onChange={(e) => setEditingStudent((p) => p ? { ...p, examNumber: e.target.value } : null)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-hidden focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Kidato</label>
                  <select
                    value={editingStudent.form}
                    onChange={(e) => setEditingStudent((p) => p ? { ...p, form: e.target.value } : null)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Mkondo</label>
                  <input
                    type="text"
                    value={editingStudent.stream}
                    onChange={(e) => setEditingStudent((p) => p ? { ...p, stream: e.target.value } : null)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Namba ya PREM</label>
                  <input
                    type="text"
                    value={editingStudent.premNumber || ''}
                    onChange={(e) => setEditingStudent((p) => p ? { ...p, premNumber: e.target.value } : null)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 font-mono focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Simu ya Mzazi</label>
                  <input
                    type="tel"
                    value={editingStudent.parentPhone || ''}
                    onChange={(e) => setEditingStudent((p) => p ? { ...p, parentPhone: e.target.value } : null)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hifadhi Mabadiliko</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h4 className="text-sm font-black text-white">Thibitisha Kuondoa Mwanafunzi</h4>
            </div>
            <p className="text-xs text-slate-300">
              Una uhakika unataka kumwondoa <strong>{deleteConfirmStudent.fullName}</strong> ({deleteConfirmStudent.examNumber}) kwenye Daftari la Wanafunzi?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Ghairi
              </button>
              <button
                onClick={() => handleDeleteStudent(deleteConfirmStudent.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Ndio, Ondoa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
