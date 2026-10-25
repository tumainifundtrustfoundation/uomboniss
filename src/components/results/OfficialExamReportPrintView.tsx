import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  Users,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  FileText,
  School,
  ArrowUpDown,
} from 'lucide-react';
import { StudentResult, SubjectResult } from '../../types';
import {
  OFFICIAL_NECTA_SUBJECTS,
  scoreToNectaGrade,
  formatCno,
  calculateNectaDivision,
} from '../../utils/nectaResultsEngine';
import { exportResultsToExcel } from '../../utils/excelService';

export interface OfficialExamReportPrintViewProps {
  initialResults?: StudentResult[];
  defaultForm?: string;
  defaultExamType?: string;
  defaultMonthYear?: string;
  onSelectStudent?: (student: StudentResult) => void;
  showBackToPortalButton?: boolean;
  onBackToPortal?: () => void;
}

export const OfficialExamReportPrintView: React.FC<OfficialExamReportPrintViewProps> = ({
  initialResults,
  defaultForm = 'Form 1',
  defaultExamType = 'Monthly Examination',
  defaultMonthYear = 'AUGUST 2026',
  onSelectStudent,
  showBackToPortalButton = false,
  onBackToPortal,
}) => {
  const [selectedForm, setSelectedForm] = useState<string>(defaultForm);
  const [selectedExamType, setSelectedExamType] = useState<string>(defaultExamType);
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(defaultMonthYear);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'points' | 'average'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter available results based on selected Form and optional exam type
  const baseStudents = useMemo(() => {
    if (!initialResults || initialResults.length === 0) return [];

    // Filter by form
    const formMatches = initialResults.filter((st) => {
      const fNorm = (st.form || '').toLowerCase();
      const selNorm = selectedForm.toLowerCase();
      if (selNorm.includes('1') || selNorm.includes('one')) return fNorm.includes('1') || fNorm.includes('one');
      if (selNorm.includes('2') || selNorm.includes('two')) return fNorm.includes('2') || fNorm.includes('two');
      if (selNorm.includes('3') || selNorm.includes('three')) return fNorm.includes('3') || fNorm.includes('three');
      if (selNorm.includes('4') || selNorm.includes('four')) return fNorm.includes('4') || fNorm.includes('four');
      return true;
    });

    return formMatches.length > 0 ? formMatches : initialResults;
  }, [initialResults, selectedForm]);

  // Recalculate positions, averages, divisions strictly according to NECTA rules
  const processedStudents: (StudentResult & { rank: number })[] = useMemo(() => {
    const list = baseStudents.map((st) => {
      const nectaCalc = calculateNectaDivision(st.subjects || []);
      const totalMarks = (st.subjects || []).reduce((acc, cur) => acc + (cur.score || 0), 0);
      const avg = st.subjects && st.subjects.length > 0 ? parseFloat((totalMarks / st.subjects.length).toFixed(1)) : 0;

      return {
        ...st,
        totalMarks,
        averageMarks: st.averageMarks || avg,
        points: nectaCalc.points,
        division: nectaCalc.divisionFull,
        rank: 0,
      };
    });

    // Rank by points ascending (lower points is better) and then average marks descending
    list.sort((a, b) => {
      // Students with Division 0 or ABS placed after passes
      const aIs0 = a.division.includes('0') || a.division.includes('ABS');
      const bIs0 = b.division.includes('0') || b.division.includes('ABS');
      if (aIs0 && !bIs0) return 1;
      if (!aIs0 && bIs0) return -1;

      if (a.points !== b.points) {
        return a.points - b.points;
      }
      return b.averageMarks - a.averageMarks;
    });

    // Assign rank with tie handling
    let currentRank = 1;
    for (let i = 0; i < list.length; i++) {
      if (i > 0) {
        const prev = list[i - 1];
        const curr = list[i];
        if (curr.points === prev.points && curr.averageMarks === prev.averageMarks) {
          curr.rank = prev.rank;
        } else {
          curr.rank = i + 1;
        }
      } else {
        list[i].rank = 1;
      }
    }

    return list;
  }, [baseStudents]);

  // Search filtered
  const displayedStudents = useMemo(() => {
    let result = [...processedStudents];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (st) =>
          st.studentName.toLowerCase().includes(q) ||
          st.examNumber.toLowerCase().includes(q) ||
          st.division.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'name') {
      result.sort((a, b) => (sortOrder === 'asc' ? a.studentName.localeCompare(b.studentName) : b.studentName.localeCompare(a.studentName)));
    } else if (sortBy === 'points') {
      result.sort((a, b) => (sortOrder === 'asc' ? a.points - b.points : b.points - a.points));
    } else if (sortBy === 'average') {
      result.sort((a, b) => (sortOrder === 'asc' ? a.averageMarks - b.averageMarks : b.averageMarks - a.averageMarks));
    } else {
      result.sort((a, b) => (sortOrder === 'asc' ? a.rank - b.rank : b.rank - a.rank));
    }

    return result;
  }, [processedStudents, searchQuery, sortBy, sortOrder]);

  // -------------------------------------------------------------------------
  // 1. DIVISION PERFORMANCE SUMMARY (F, M, TOTAL for I, II, III, IV, 0, ABS)
  // -------------------------------------------------------------------------
  const divisionSummary = useMemo(() => {
    const table = {
      F: { div1: 0, div2: 0, div3: 0, div4: 0, div0: 0, abs: 0, total: 0 },
      M: { div1: 0, div2: 0, div3: 0, div4: 0, div0: 0, abs: 0, total: 0 },
      T: { div1: 0, div2: 0, div3: 0, div4: 0, div0: 0, abs: 0, total: 0 },
    };

    processedStudents.forEach((st) => {
      const g = st.gender === 'F' ? 'F' : 'M';
      const div = (st.division || '').toUpperCase();

      let slot: 'div1' | 'div2' | 'div3' | 'div4' | 'div0' | 'abs' = 'div0';
      if (div.includes('I') && !div.includes('II') && !div.includes('III') && !div.includes('IV')) {
        slot = 'div1';
      } else if (div.includes('II') && !div.includes('III')) {
        slot = 'div2';
      } else if (div.includes('III')) {
        slot = 'div3';
      } else if (div.includes('IV')) {
        slot = 'div4';
      } else if (div.includes('ABS')) {
        slot = 'abs';
      } else {
        slot = 'div0';
      }

      table[g][slot]++;
      table[g].total++;
      table.T[slot]++;
      table.T.total++;
    });

    return table;
  }, [processedStudents]);

  // -------------------------------------------------------------------------
  // 2. STUDENTS' AVERAGE GRADES SUMMARY (F, M, TOTAL for A, B, C, D, F)
  // -------------------------------------------------------------------------
  const gradesSummary = useMemo(() => {
    const table = {
      F: { A: 0, B: 0, C: 0, D: 0, F: 0, total: 0 },
      M: { A: 0, B: 0, C: 0, D: 0, F: 0, total: 0 },
      T: { A: 0, B: 0, C: 0, D: 0, F: 0, total: 0 },
    };

    processedStudents.forEach((st) => {
      const g = st.gender === 'F' ? 'F' : 'M';
      const { grade } = scoreToNectaGrade(st.averageMarks);
      table[g][grade]++;
      table[g].total++;
      table.T[grade]++;
      table.T.total++;
    });

    return table;
  }, [processedStudents]);

  // -------------------------------------------------------------------------
  // 3. BEST 10 STUDENTS & LAST 10 STUDENTS
  // -------------------------------------------------------------------------
  const best10 = useMemo(() => {
    return [...processedStudents].slice(0, 10);
  }, [processedStudents]);

  const last10 = useMemo(() => {
    const nonAbs = processedStudents.filter((s) => !s.division.includes('ABS'));
    if (nonAbs.length <= 10) return [];
    return [...nonAbs].slice(-10);
  }, [processedStudents]);

  // -------------------------------------------------------------------------
  // 4. CLASS PERFORMANCE METRICS
  // -------------------------------------------------------------------------
  const classMetrics = useMemo(() => {
    const total = processedStudents.length;
    if (total === 0) return { gpa: 0, grade: '—', avg: 0, avgGrade: '—', passRate: 0 };

    const totalAvg = processedStudents.reduce((acc, cur) => acc + cur.averageMarks, 0);
    const classAvg = parseFloat((totalAvg / total).toFixed(1));
    const avgGrade = scoreToNectaGrade(classAvg).grade;

    // NECTA GPA is calculated from points distribution: (1*A + 2*B + 3*C + 4*D + 5*F) / total
    let totalGradePoints = 0;
    let totalSubjectsCount = 0;

    processedStudents.forEach((st) => {
      (st.subjects || []).forEach((sub) => {
        if (typeof sub.score === 'number') {
          totalGradePoints += scoreToNectaGrade(sub.score).points;
          totalSubjectsCount++;
        }
      });
    });

    const gpa = totalSubjectsCount > 0 ? parseFloat((totalGradePoints / totalSubjectsCount).toFixed(2)) : 0;
    const gpaGrade = gpa <= 1.4 ? 'A' : gpa <= 2.4 ? 'B' : gpa <= 3.4 ? 'C' : gpa <= 4.4 ? 'D' : 'F';

    const passedCount = divisionSummary.T.div1 + divisionSummary.T.div2 + divisionSummary.T.div3 + divisionSummary.T.div4;
    const passRate = total > 0 ? parseFloat(((passedCount / total) * 100).toFixed(1)) : 0;

    return {
      gpa,
      grade: gpaGrade,
      avg: classAvg,
      avgGrade,
      passRate,
      satCount: total - divisionSummary.T.abs,
      absCount: divisionSummary.T.abs,
    };
  }, [processedStudents, divisionSummary]);

  // List of active subjects represented in this class
  const activeSubjectColumns = useMemo(() => {
    const set = new Set<string>();
    processedStudents.forEach((st) => {
      (st.subjects || []).forEach((s) => {
        set.add(s.name);
      });
    });

    return OFFICIAL_NECTA_SUBJECTS.filter((sub) => {
      return (
        set.has(sub.name) ||
        set.has(sub.nameEn) ||
        Array.from(set).some((s) => s.toLowerCase().includes(sub.name.toLowerCase()))
      );
    });
  }, [processedStudents]);

  // Subject averages across the class
  const subjectAverages = useMemo(() => {
    const map: Record<string, { total: number; count: number; avg: number; grade: string }> = {};

    activeSubjectColumns.forEach((sub) => {
      map[sub.code] = { total: 0, count: 0, avg: 0, grade: '—' };
    });

    processedStudents.forEach((st) => {
      (st.subjects || []).forEach((sub) => {
        const matched = activeSubjectColumns.find(
          (o) =>
            o.code === sub.code ||
            o.name.toLowerCase() === sub.name.toLowerCase() ||
            o.nameEn.toLowerCase() === (sub.nameEn || '').toLowerCase()
        );
        if (matched && typeof sub.score === 'number') {
          map[matched.code].total += sub.score;
          map[matched.code].count++;
        }
      });
    });

    Object.keys(map).forEach((code) => {
      const item = map[code];
      if (item.count > 0) {
        item.avg = parseFloat((item.total / item.count).toFixed(1));
        item.grade = scoreToNectaGrade(item.avg).grade;
      }
    });

    return map;
  }, [activeSubjectColumns, processedStudents]);

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel
  const handleExportExcel = () => {
    const filename = `UOMBONI_${selectedForm.replace(/\s+/g, '_')}_${selectedExamType.replace(/\s+/g, '_')}_RESULTS.xlsx`;
    exportResultsToExcel(processedStudents, filename);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'POS',
      'EXAM_NUMBER',
      'STUDENT_NAME',
      'GENDER',
      ...activeSubjectColumns.map((s) => `${s.code}_${s.name.replace(/\s+/g, '_')}`),
      'TOTAL_MARKS',
      'AVERAGE',
      'POINTS',
      'DIVISION',
    ];

    const rows = processedStudents.map((st) => {
      const subjScores = activeSubjectColumns.map((col) => {
        const found = (st.subjects || []).find(
          (s) =>
            s.code === col.code ||
            s.name.toLowerCase() === col.name.toLowerCase() ||
            (s.nameEn && s.nameEn.toLowerCase() === col.nameEn.toLowerCase())
        );
        return found ? `${found.score} (${found.grade})` : '—';
      });

      return [
        st.rank,
        `"${st.examNumber}"`,
        `"${st.studentName}"`,
        st.gender,
        ...subjScores,
        st.totalMarks,
        st.averageMarks,
        st.points,
        `"${st.division}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UOMBONI_${selectedForm}_RESULTS.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* TOP CONTROLS & SELECTION BAR (HIDDEN IN PRINT)                      */}
      {/* ------------------------------------------------------------------- */}
      <div className="print:hidden bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#102A43] text-[#FDE68A]">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-[#102A43] tracking-tight">
                  Ripoti Rasmi ya Matokeo ya Mitihani (Official Print Report)
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Mpangilio rasmi wa Shule ya Sekondari Uomboni (NECTA S0486) unaolingana na kielelezo cha picha ya matokeo ya shule.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showBackToPortalButton && onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                &larr; Rudi Dashibodi
              </button>
            )}

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Pakua Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs font-black rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md hover:shadow-lg"
            >
              <Printer className="w-4 h-4 text-[#FDE68A]" />
              <span>Chapisha / Hifadhi kama PDF (Print)</span>
            </button>
          </div>
        </div>

        {/* Filters and selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Chagua Kidato (Form):
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#102A43] focus:bg-white focus:outline-hidden"
            >
              <option value="Form 1">Kidato cha Kwanza (Form I)</option>
              <option value="Form 2">Kidato cha Pili (Form II)</option>
              <option value="Form 3">Kidato cha Tatu (Form III)</option>
              <option value="Form 4">Kidato cha Nne (Form IV)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Aina ya Mtihani (Exam Type):
            </label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#102A43] focus:bg-white focus:outline-hidden"
            >
              <option value="Monthly Examination">Mtihani wa Mwezi (Monthly Exam)</option>
              <option value="Mid-Term Examination">Mtihani wa Nusu Muhula (Mid-Term)</option>
              <option value="Terminal Examination">Mtihani wa Muhula (Terminal Exam)</option>
              <option value="Annual Examination">Mtihani wa Mwaka (Annual Exam)</option>
              <option value="CSSC Northern Zone Joint Exam">CSSC Northern Zone Joint Exam</option>
              <option value="NECTA Mock Examination">NECTA Mock Examination</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Mwezi na Mwaka (Month &amp; Year):
            </label>
            <input
              type="text"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              placeholder="e.g. AUGUST 2026"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-[#102A43] focus:bg-white focus:outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Tafuta Mwanafunzi:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Jina au namba ya mtihani..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-[#102A43] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* AUTHENTIC PRINT CONTAINER                                          */}
      {/* Styled to exactly match the reference photo format                  */}
      {/* ------------------------------------------------------------------- */}
      <div
        id="official-exam-report-sheet"
        className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 text-slate-900"
      >
        {/* ================================================================= */}
        {/* 1. HEADER SECTION (CATHOLIC DIOCESE OF MOSHI / UOMBONI SEC)       */}
        {/* ================================================================= */}
        <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
          <div className="flex items-center justify-between px-2">
            {/* Left crest logo */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
              <img
                src="/images/uomboni_official_logo.jpg"
                alt="Uomboni Secondary School Official Crest"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as any).src = '/logo.uomboni.jpg';
                }}
              />
            </div>

            {/* Central Diocesan Header */}
            <div className="space-y-0.5 text-center flex-1 px-4">
              <h1 className="text-sm sm:text-base font-black tracking-widest text-[#102A43] uppercase font-serif">
                CATHOLIC DIOCESE OF MOSHI
              </h1>
              <h2 className="text-xs sm:text-sm font-black tracking-wider text-slate-800 uppercase font-serif">
                MOSHI DISTRICT COUNCIL
              </h2>
              <h3 className="text-base sm:text-xl font-black tracking-wide text-[#102A43] uppercase font-serif">
                UOMBONI SECONDARY SCHOOL
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-600 font-semibold">
                P.O. BOX 361 MARANGU, MOSHI, KILIMANJARO • NECTA REG. NO: S.0486
              </p>
            </div>

            {/* Right decorative crest / balance */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 hidden sm:flex items-center justify-center">
              <img
                src="/images/uomboni_official_logo.jpg"
                alt="Uomboni Secondary School"
                className="max-h-full max-w-full object-contain opacity-95"
                onError={(e) => {
                  (e.currentTarget as any).src = '/logo.uomboni.jpg';
                }}
              />
            </div>
          </div>

          {/* DYNAMIC TITLE BAR (Pale Yellow / Gold matching photo) */}
          <div className="mt-3 py-2 px-4 bg-[#FDE68A] border-2 border-slate-900 rounded-sm text-center shadow-xs">
            <span className="text-sm sm:text-base font-black text-[#102A43] uppercase tracking-wide">
              {selectedForm.toUpperCase()} {selectedExamType.toUpperCase()} RESULTS — {selectedMonthYear.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. SUMMARY METRICS (Pale Blue & Yellow Cards matching photo)     */}
        {/* ================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 my-4">
          <div className="bg-[#E0F2FE] border border-[#0284C7] p-2.5 rounded-sm text-center">
            <span className="text-[9px] font-black uppercase text-[#0369A1] block">CLASS GPA</span>
            <span className="text-xl sm:text-2xl font-black text-[#0C4A6E] font-mono block">
              {classMetrics.gpa.toFixed(2)}
            </span>
            <span className="text-[9px] font-bold text-[#0369A1]">Grade: {classMetrics.grade}</span>
          </div>

          <div className="bg-[#FEF3C7] border border-[#D97706] p-2.5 rounded-sm text-center">
            <span className="text-[9px] font-black uppercase text-[#B45309] block">CLASS AVERAGE</span>
            <span className="text-xl sm:text-2xl font-black text-[#78350F] font-mono block">
              {classMetrics.avg}%
            </span>
            <span className="text-[9px] font-bold text-[#B45309]">Grade: {classMetrics.avgGrade}</span>
          </div>

          <div className="bg-[#E0F2FE] border border-[#0284C7] p-2.5 rounded-sm text-center">
            <span className="text-[9px] font-black uppercase text-[#0369A1] block">TOTAL CANDIDATES</span>
            <span className="text-xl sm:text-2xl font-black text-[#0C4A6E] font-mono block">
              {processedStudents.length}
            </span>
            <span className="text-[9px] font-bold text-[#0369A1]">
              F: {divisionSummary.F.total} | M: {divisionSummary.M.total}
            </span>
          </div>

          <div className="bg-[#DCFCE7] border border-[#16A34A] p-2.5 rounded-sm text-center">
            <span className="text-[9px] font-black uppercase text-[#15803D] block">PASS RATE</span>
            <span className="text-xl sm:text-2xl font-black text-[#14532D] font-mono block">
              {classMetrics.passRate}%
            </span>
            <span className="text-[9px] font-bold text-[#15803D]">Div I–IV Passes</span>
          </div>

          <div className="bg-[#E0F2FE] border border-[#0284C7] p-2.5 rounded-sm text-center">
            <span className="text-[9px] font-black uppercase text-[#0369A1] block">SAT / PRESENT</span>
            <span className="text-xl sm:text-2xl font-black text-[#0C4A6E] font-mono block">
              {classMetrics.satCount}
            </span>
            <span className="text-[9px] font-bold text-[#0369A1]">Waliofanya Mtihani</span>
          </div>

          <div className="bg-[#FEE2E2] border border-[#DC2626] p-2.5 rounded-sm text-center">
            <span className="text-[9px] font-black uppercase text-[#B91C1C] block">ABSENT</span>
            <span className="text-xl sm:text-2xl font-black text-[#7F1D1D] font-mono block">
              {classMetrics.absCount}
            </span>
            <span className="text-[9px] font-bold text-[#B91C1C]">Watoro / Hawajafanya</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. THREE SIDE-BY-SIDE SUMMARY TABLES (EXACT PHOTO REPLICA)       */}
        {/* Section A: Division Summary | Section B: Grade Summary | Best 10 */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 my-4">
          {/* (A) DIVISION PERFORMANCE SUMMARY TABLE */}
          <div className="lg:col-span-5 border border-slate-900 rounded-sm overflow-hidden text-center">
            <div className="bg-[#FDE68A] border-b border-slate-900 py-1 px-2 font-black text-[11px] uppercase text-[#102A43] tracking-wider">
              DIVISION PERFORMANCE SUMMARY
            </div>
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-[#E0F2FE] border-b border-slate-900 font-black">
                  <th className="py-1 px-1.5 border-r border-slate-900 text-left">SEX</th>
                  <th className="py-1 px-1 border-r border-slate-900">I</th>
                  <th className="py-1 px-1 border-r border-slate-900">II</th>
                  <th className="py-1 px-1 border-r border-slate-900">III</th>
                  <th className="py-1 px-1 border-r border-slate-900">IV</th>
                  <th className="py-1 px-1 border-r border-slate-900">0</th>
                  <th className="py-1 px-1 border-r border-slate-900">ABS</th>
                  <th className="py-1 px-1.5 bg-[#FEF3C7] font-black">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400">
                <tr className="hover:bg-slate-50">
                  <td className="py-1 px-1.5 border-r border-slate-900 font-bold text-left bg-slate-50">F</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.F.div1}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.F.div2}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.F.div3}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.F.div4}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.F.div0}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.F.abs}</td>
                  <td className="py-1 px-1.5 bg-[#FEF3C7] font-mono font-bold">{divisionSummary.F.total}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1 px-1.5 border-r border-slate-900 font-bold text-left bg-slate-50">M</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.M.div1}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.M.div2}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.M.div3}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.M.div4}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.M.div0}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{divisionSummary.M.abs}</td>
                  <td className="py-1 px-1.5 bg-[#FEF3C7] font-mono font-bold">{divisionSummary.M.total}</td>
                </tr>
                <tr className="bg-[#FEF3C7] border-t-2 border-slate-900 font-black">
                  <td className="py-1.5 px-1.5 border-r border-slate-900 text-left font-black">TOTAL</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{divisionSummary.T.div1}</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{divisionSummary.T.div2}</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{divisionSummary.T.div3}</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{divisionSummary.T.div4}</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{divisionSummary.T.div0}</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{divisionSummary.T.abs}</td>
                  <td className="py-1.5 px-1.5 bg-[#FDE68A] font-mono font-black">{divisionSummary.T.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* (B) STUDENTS' AVERAGE GRADES SUMMARY TABLE */}
          <div className="lg:col-span-4 border border-slate-900 rounded-sm overflow-hidden text-center">
            <div className="bg-[#FDE68A] border-b border-slate-900 py-1 px-2 font-black text-[11px] uppercase text-[#102A43] tracking-wider">
              STUDENTS' AVERAGE GRADES SUMMARY
            </div>
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-[#E0F2FE] border-b border-slate-900 font-black">
                  <th className="py-1 px-1.5 border-r border-slate-900 text-left">SEX</th>
                  <th className="py-1 px-1 border-r border-slate-900">A</th>
                  <th className="py-1 px-1 border-r border-slate-900">B</th>
                  <th className="py-1 px-1 border-r border-slate-900">C</th>
                  <th className="py-1 px-1 border-r border-slate-900">D</th>
                  <th className="py-1 px-1 border-r border-slate-900">F</th>
                  <th className="py-1 px-1.5 bg-[#FEF3C7] font-black">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400">
                <tr className="hover:bg-slate-50">
                  <td className="py-1 px-1.5 border-r border-slate-900 font-bold text-left bg-slate-50">F</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{gradesSummary.F.A}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{gradesSummary.F.B}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{gradesSummary.F.C}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{gradesSummary.F.D}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{gradesSummary.F.F}</td>
                  <td className="py-1 px-1.5 bg-[#FEF3C7] font-mono font-bold">{gradesSummary.F.total}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-1 px-1.5 border-r border-slate-900 font-bold text-left bg-slate-50">M</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{gradesSummary.M.A}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{gradesSummary.M.B}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{gradesSummary.M.C}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{gradesSummary.M.D}</td>
                  <td className="py-1 px-1 border-r border-slate-900 font-mono">{gradesSummary.M.F}</td>
                  <td className="py-1 px-1.5 bg-[#FEF3C7] font-mono font-bold">{gradesSummary.M.total}</td>
                </tr>
                <tr className="bg-[#FEF3C7] border-t-2 border-slate-900 font-black">
                  <td className="py-1.5 px-1.5 border-r border-slate-900 text-left font-black">TOTAL</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{gradesSummary.T.A}</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{gradesSummary.T.B}</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{gradesSummary.T.C}</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{gradesSummary.T.D}</td>
                  <td className="py-1.5 px-1 border-r border-slate-900 font-mono font-black">{gradesSummary.T.F}</td>
                  <td className="py-1.5 px-1.5 bg-[#FDE68A] font-mono font-black">{gradesSummary.T.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* (C) NECTA PASS BOUNDARIES & RATINGS CARD */}
          <div className="lg:col-span-3 border border-slate-900 rounded-sm overflow-hidden bg-slate-50 text-[10px]">
            <div className="bg-[#FDE68A] border-b border-slate-900 py-1 px-2 font-black text-[11px] uppercase text-[#102A43] tracking-wider text-center">
              NECTA PASS CRITERIA
            </div>
            <div className="p-2 space-y-1">
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="font-bold text-[#102A43]">Division I:</span>
                <span className="font-mono">7 – 17 Points</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="font-bold text-[#102A43]">Division II:</span>
                <span className="font-mono">18 – 21 Points</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="font-bold text-[#102A43]">Division III:</span>
                <span className="font-mono">22 – 25 Points</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="font-bold text-[#102A43]">Division IV:</span>
                <span className="font-mono">26 – 33 Points (Min 2 passes)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-rose-800">Division 0:</span>
                <span className="font-mono">34 – 35 Points or &lt;2 passes</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. BEST 10 STUDENTS & LAST 10 STUDENTS TABLES                     */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 my-4">
          {/* BEST 10 STUDENTS */}
          <div className="border border-slate-900 rounded-sm overflow-hidden">
            <div className="bg-[#FDE68A] border-b border-slate-900 py-1 px-3 font-black text-[11px] uppercase text-[#102A43] tracking-wider flex items-center justify-between">
              <span>BEST 10 STUDENTS</span>
              <span className="text-[10px] font-bold text-amber-900">Kinara wa Ufaulu</span>
            </div>
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-[#E0F2FE] border-b border-slate-900 font-black text-center">
                  <th className="py-1 px-1.5 border-r border-slate-900 w-8">POS</th>
                  <th className="py-1 px-2 border-r border-slate-900 text-left">CNO / REG NO</th>
                  <th className="py-1 px-2 border-r border-slate-900 text-left">STUDENT NAME</th>
                  <th className="py-1 px-1 border-r border-slate-900 w-8">SEX</th>
                  <th className="py-1 px-1.5 border-r border-slate-900 w-12">POINTS</th>
                  <th className="py-1 px-1.5 border-r border-slate-900 w-16">DIV</th>
                  <th className="py-1 px-1.5 w-12">AVG %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {best10.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-amber-50/50">
                    <td className="py-1 px-1.5 border-r border-slate-900 text-center font-bold font-mono">
                      {st.rank}
                    </td>
                    <td className="py-1 px-2 border-r border-slate-900 font-mono text-[9.5px]">
                      {formatCno(st.examNumber)}
                    </td>
                    <td className="py-1 px-2 border-r border-slate-900 font-bold uppercase truncate max-w-[150px]">
                      {st.studentName}
                    </td>
                    <td className="py-1 px-1 border-r border-slate-900 text-center font-bold">
                      {st.gender}
                    </td>
                    <td className="py-1 px-1.5 border-r border-slate-900 text-center font-mono font-bold">
                      {st.points}
                    </td>
                    <td className="py-1 px-1.5 border-r border-slate-900 text-center font-bold">
                      {st.division.replace('Division ', 'DIV ')}
                    </td>
                    <td className="py-1 px-1.5 text-center font-mono font-bold text-blue-900">
                      {st.averageMarks}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LAST 10 STUDENTS */}
          <div className="border border-slate-900 rounded-sm overflow-hidden">
            <div className="bg-[#FDE68A] border-b border-slate-900 py-1 px-3 font-black text-[11px] uppercase text-[#102A43] tracking-wider flex items-center justify-between">
              <span>LAST 10 STUDENTS</span>
              <span className="text-[10px] font-bold text-amber-900">Wanahitaji Msaada Zaidi</span>
            </div>
            {last10.length > 0 ? (
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-[#E0F2FE] border-b border-slate-900 font-black text-center">
                    <th className="py-1 px-1.5 border-r border-slate-900 w-8">POS</th>
                    <th className="py-1 px-2 border-r border-slate-900 text-left">CNO / REG NO</th>
                    <th className="py-1 px-2 border-r border-slate-900 text-left">STUDENT NAME</th>
                    <th className="py-1 px-1 border-r border-slate-900 w-8">SEX</th>
                    <th className="py-1 px-1.5 border-r border-slate-900 w-12">POINTS</th>
                    <th className="py-1 px-1.5 border-r border-slate-900 w-16">DIV</th>
                    <th className="py-1 px-1.5 w-12">AVG %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {last10.map((st) => (
                    <tr key={st.id} className="hover:bg-rose-50/40">
                      <td className="py-1 px-1.5 border-r border-slate-900 text-center font-bold font-mono">
                        {st.rank}
                      </td>
                      <td className="py-1 px-2 border-r border-slate-900 font-mono text-[9.5px]">
                        {formatCno(st.examNumber)}
                      </td>
                      <td className="py-1 px-2 border-r border-slate-900 font-bold uppercase truncate max-w-[150px]">
                        {st.studentName}
                      </td>
                      <td className="py-1 px-1 border-r border-slate-900 text-center font-bold">
                        {st.gender}
                      </td>
                      <td className="py-1 px-1.5 border-r border-slate-900 text-center font-mono font-bold">
                        {st.points}
                      </td>
                      <td className="py-1 px-1.5 border-r border-slate-900 text-center font-bold">
                        {st.division.replace('Division ', 'DIV ')}
                      </td>
                      <td className="py-1 px-1.5 text-center font-mono font-bold">
                        {st.averageMarks}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 font-medium">
                Idadi ya watahiniwa darasani ni ndogo (chini ya wanafunzi 10); orodha ya Best 10 inajumuisha watahiniwa wote.
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 5. FULL BROADSHEET MATRIX (ALL SUBJECTS & CANDIDATES)             */}
        {/* ================================================================= */}
        <div className="mt-6 border-2 border-slate-900 rounded-sm overflow-hidden">
          <div className="bg-[#FDE68A] border-b-2 border-slate-900 py-1.5 px-3 flex items-center justify-between font-black text-xs uppercase text-[#102A43] tracking-wide">
            <span>DETAILED CANDIDATES EXAMINATION RESULTS (MATOKEO YA KILA SOMO)</span>
            <span className="text-[10px] font-mono font-bold text-slate-700">
              Watahiniwa: {displayedStudents.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-[#E0F2FE] border-b-2 border-slate-900 font-black text-center">
                  <th className="py-2 px-1 border-r border-slate-900 w-8">POS</th>
                  <th className="py-2 px-2 border-r border-slate-900 text-left min-w-[85px]">CNO</th>
                  <th className="py-2 px-2.5 border-r border-slate-900 text-left min-w-[170px]">STUDENT NAME</th>
                  <th className="py-2 px-1 border-r border-slate-900 w-8">SEX</th>

                  {/* Subject Columns */}
                  {activeSubjectColumns.map((col) => (
                    <th
                      key={col.code}
                      className="py-1 px-1 border-r border-slate-900 min-w-[44px] text-center"
                      title={col.name}
                    >
                      <span className="block text-[8px] font-mono text-slate-500">{col.code}</span>
                      <span className="block text-[9px] font-bold text-[#102A43] truncate max-w-[48px]">
                        {col.key}
                      </span>
                    </th>
                  ))}

                  <th className="py-2 px-1.5 border-r border-slate-900 w-12 bg-[#FEF3C7]">TOTAL</th>
                  <th className="py-2 px-1.5 border-r border-slate-900 w-12 bg-[#FEF3C7]">AVG %</th>
                  <th className="py-2 px-1 border-r border-slate-900 w-10 bg-[#FEF3C7]">PTS</th>
                  <th className="py-2 px-1.5 border-r border-slate-900 w-14 bg-[#FEF3C7]">DIV</th>
                  <th className="py-2 px-1 bg-[#FDE68A] w-9">RANK</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-400">
                {displayedStudents.map((st, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={st.id}
                      onClick={() => onSelectStudent && onSelectStudent(st)}
                      className={`${isEven ? 'bg-white' : 'bg-slate-50/70'} hover:bg-amber-100/40 transition cursor-pointer`}
                    >
                      <td className="py-1.5 px-1 border-r border-slate-900 text-center font-bold font-mono text-[9px]">
                        {st.rank}
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-900 font-mono font-bold text-[9px] text-slate-800">
                        {formatCno(st.examNumber)}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-slate-900 font-black uppercase text-[#102A43] truncate max-w-[200px]">
                        {st.studentName}
                      </td>
                      <td className="py-1.5 px-1 border-r border-slate-900 text-center font-bold">
                        {st.gender}
                      </td>

                      {/* Subject Marks and Grades */}
                      {activeSubjectColumns.map((col) => {
                        const found = (st.subjects || []).find(
                          (s) =>
                            s.code === col.code ||
                            s.name.toLowerCase() === col.name.toLowerCase() ||
                            (s.nameEn && s.nameEn.toLowerCase() === col.nameEn.toLowerCase())
                        );

                        if (!found || typeof found.score !== 'number') {
                          return (
                            <td key={col.code} className="py-1.5 px-1 border-r border-slate-900 text-center text-slate-400">
                              —
                            </td>
                          );
                        }

                        const grade = found.grade || scoreToNectaGrade(found.score).grade;
                        const isFail = grade === 'F';
                        const isTop = grade === 'A' || grade === 'B';

                        return (
                          <td
                            key={col.code}
                            className={`py-1.5 px-1 border-r border-slate-900 text-center font-mono ${
                              isFail ? 'bg-rose-50/40 text-rose-900' : isTop ? 'bg-emerald-50/30' : ''
                            }`}
                          >
                            <span className="font-bold text-[9.5px]">{found.score}</span>
                            <span
                              className={`ml-0.5 text-[8.5px] font-black ${
                                isFail ? 'text-red-700' : isTop ? 'text-emerald-700' : 'text-slate-700'
                              }`}
                            >
                              {grade}
                            </span>
                          </td>
                        );
                      })}

                      <td className="py-1.5 px-1.5 border-r border-slate-900 text-center font-mono font-bold bg-[#FEF3C7]/40">
                        {st.totalMarks}
                      </td>
                      <td className="py-1.5 px-1.5 border-r border-slate-900 text-center font-mono font-black text-blue-900 bg-[#FEF3C7]/40">
                        {st.averageMarks}%
                      </td>
                      <td className="py-1.5 px-1 border-r border-slate-900 text-center font-mono font-black bg-[#FEF3C7]/40">
                        {st.points}
                      </td>
                      <td className="py-1.5 px-1.5 border-r border-slate-900 text-center font-black bg-[#FEF3C7]/40">
                        <span
                          className={`px-1 py-0.5 rounded-xs text-[9px] ${
                            st.division.includes('I') && !st.division.includes('II') && !st.division.includes('III') && !st.division.includes('IV')
                              ? 'bg-emerald-200 text-emerald-950 font-black'
                              : st.division.includes('II')
                              ? 'bg-blue-100 text-blue-950'
                              : st.division.includes('III')
                              ? 'bg-amber-100 text-amber-950'
                              : st.division.includes('IV')
                              ? 'bg-orange-100 text-orange-950'
                              : 'bg-rose-100 text-rose-950'
                          }`}
                        >
                          {st.division.replace('Division ', 'DIV ')}
                        </span>
                      </td>
                      <td className="py-1.5 px-1 text-center font-mono font-black bg-[#FDE68A]/60">
                        {st.rank}
                      </td>
                    </tr>
                  );
                })}

                {/* BOTTOM ROW: SUBJECT AVERAGES & GRADES */}
                <tr className="bg-[#FEF3C7] border-t-2 border-slate-900 font-black text-[9.5px]">
                  <td colSpan={4} className="py-2 px-3 border-r border-slate-900 text-right uppercase tracking-wider">
                    SUBJECT CLASS AVERAGE / DARASA:
                  </td>
                  {activeSubjectColumns.map((col) => {
                    const stat = subjectAverages[col.code];
                    return (
                      <td key={col.code} className="py-2 px-1 border-r border-slate-900 text-center font-mono">
                        <span className="block font-bold">{stat?.avg || 0}</span>
                        <span className="block text-[8px] font-black text-amber-900">
                          ({stat?.grade || '—'})
                        </span>
                      </td>
                    );
                  })}
                  <td colSpan={5} className="py-2 px-2 text-center bg-[#FDE68A] font-black text-[10px]">
                    OVERALL GPA: {classMetrics.gpa.toFixed(2)} ({classMetrics.grade})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 6. OFFICIAL CERTIFICATION & SIGNATURE STAMPS                      */}
        {/* ================================================================= */}
        <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-6 text-[11px]">
          {/* Academic Master */}
          <div className="text-center space-y-3">
            <p className="font-bold uppercase text-slate-700">Imetayarishwa na:</p>
            <div className="h-10 flex items-center justify-center">
              <span className="font-serif italic font-bold text-slate-800 text-sm">Yohana Bahati</span>
            </div>
            <div className="border-t border-slate-800 pt-1">
              <p className="font-black text-[#102A43]">MKUU WA TAALUMA (ACADEMIC MASTER)</p>
              <p className="text-[10px] text-slate-500 font-mono">Tarehe: {new Date().toLocaleDateString('sw-TZ')}</p>
            </div>
          </div>

          {/* School Stamp Seal */}
          <div className="text-center space-y-2 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#102A43] flex flex-col items-center justify-center p-2 text-center text-[#102A43]">
              <span className="text-[7.5px] font-black uppercase leading-tight">SHULE YA SEKONDARI UOMBONI</span>
              <span className="text-[6.5px] font-bold text-slate-600 my-0.5">S.L.P 361 MARANGU</span>
              <span className="text-[7px] font-black text-emerald-800">★ OFFICIAL STAMP ★</span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono uppercase">Muhuri Rasmi wa Shule</p>
          </div>

          {/* Headmaster */}
          <div className="text-center space-y-3">
            <p className="font-bold uppercase text-slate-700">Imethibitishwa na:</p>
            <div className="h-10 flex items-center justify-center">
              <span className="font-serif italic font-bold text-slate-800 text-sm">Adolph Massawe</span>
            </div>
            <div className="border-t border-slate-800 pt-1">
              <p className="font-black text-[#102A43]">MKUU WA SHULE (HEADMASTER)</p>
              <p className="text-[10px] text-slate-500 font-mono">Kituo cha NECTA Na: S0486</p>
            </div>
          </div>
        </div>

        {/* Footer print note */}
        <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
          UOMBONI SECONDARY SCHOOL • NECTA CENTRE S0486 • MARANGU, MOSHI, KILIMANJARO, TANZANIA • https://www.uomboniss.sc.tz/
        </div>
      </div>
    </div>
  );
};
