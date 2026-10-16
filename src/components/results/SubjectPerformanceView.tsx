import React, { useState } from 'react';
import {
  BookOpen,
  Filter,
  BarChart2,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StudentResult } from '../../types';
import { OFFICIAL_NECTA_SUBJECTS, scoreToNectaGrade } from '../../utils/nectaResultsEngine';

interface SubjectPerformanceViewProps {
  studentResults: StudentResult[];
}

export const SubjectPerformanceView: React.FC<SubjectPerformanceViewProps> = ({
  studentResults,
}) => {
  const { language } = useLanguage();

  const [selectedForm, setSelectedForm] = useState<string>('Form 4');
  const [selectedExam, setSelectedExam] = useState<string>('Annual Examination 2025');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('013'); // Geography default

  // Filter students based on class & exam
  const matchingStudents = studentResults.filter(
    (s) =>
      (selectedForm === 'ALL' || s.form === selectedForm) &&
      (selectedExam === 'ALL' || s.examType.includes(selectedExam.split(' ')[0]))
  );

  // Extract subject scores
  const subjectScores: { student: StudentResult; score: number; grade: string; points: number }[] = [];

  matchingStudents.forEach((st) => {
    const sub = st.subjects.find((s) => s.code === selectedSubjectCode);
    if (sub && typeof sub.score === 'number' && !sub.remarks?.includes('ABS')) {
      subjectScores.push({
        student: st,
        score: sub.score,
        grade: sub.grade || scoreToNectaGrade(sub.score).grade,
        points: sub.points || scoreToNectaGrade(sub.score).points,
      });
    }
  });

  const subjectInfo =
    OFFICIAL_NECTA_SUBJECTS.find((s) => s.code === selectedSubjectCode) || {
      code: selectedSubjectCode,
      name: 'Subject',
      nameEn: 'Subject',
    };

  const totalStudents = subjectScores.length;
  const scoresOnly = subjectScores.map((s) => s.score);
  const highestMark = totalStudents > 0 ? Math.max(...scoresOnly) : 0;
  const lowestMark = totalStudents > 0 ? Math.min(...scoresOnly) : 0;
  const totalMarksSum = scoresOnly.reduce((a, b) => a + b, 0);
  const subjectAverage = totalStudents > 0 ? parseFloat((totalMarksSum / totalStudents).toFixed(1)) : 0;

  const passedStudents = subjectScores.filter((s) => s.grade !== 'F');
  const passRate = totalStudents > 0 ? parseFloat(((passedStudents.length / totalStudents) * 100).toFixed(1)) : 0;

  // Grade breakdown: A, B, C, D, F
  const grades = ['A', 'B', 'C', 'D', 'F'] as const;
  const gradeBreakdown = grades.map((g) => {
    const count = subjectScores.filter((s) => s.grade === g).length;
    const percentage = totalStudents > 0 ? parseFloat(((count / totalStudents) * 100).toFixed(1)) : 0;
    return { grade: g, count, percentage };
  });

  return (
    <div className="space-y-6">
      {/* Subject Selector Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-700" />
            <span>{language === 'sw' ? 'Uchambuzi wa Somo (Subject Performance Analysis)' : 'Subject Analytics'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {subjectInfo.name} ({subjectInfo.code})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Form */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase text-[11px]">
              {language === 'sw' ? 'Kidato (Class):' : 'Class / Form:'}
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-600"
            >
              <option value="ALL">Madarasa Yote (All)</option>
              <option value="Form 4">Form 4</option>
              <option value="Form 3">Form 3</option>
              <option value="Form 2">Form 2</option>
              <option value="Form 1">Form 1</option>
            </select>
          </div>

          {/* Exam */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase text-[11px]">
              {language === 'sw' ? 'Mtihani (Exam):' : 'Examination:'}
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-600"
            >
              <option value="ALL">Mitihani Yote (All Exams)</option>
              <option value="CSSC Joint Examination 2026">CSSC Joint Examination 2026 (Agosti 2026)</option>
              <option value="Annual Examination 2025">Annual Examination 2025</option>
              <option value="NECTA Mock 2025">NECTA Mock 2025</option>
              <option value="Mid-Term Exam 2025">Mid-Term Exam 2025</option>
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase text-[11px]">
              {language === 'sw' ? 'Chagua Somo (Subject):' : 'Select Subject:'}
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-600"
            >
              {OFFICIAL_NECTA_SUBJECTS.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} - {sub.name} ({sub.key})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subject Summary Cards (Section 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {/* NUMBER OF STUDENTS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center space-y-1 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL STUDENTS</span>
          <span className="text-2xl font-black text-slate-900 font-mono block">
            {totalStudents}
          </span>
          <span className="text-[9px] text-slate-500">Wanafunzi Waliofanya</span>
        </div>

        {/* SUBJECT AVERAGE */}
        <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200 text-center space-y-1 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-blue-700 block">SUBJECT AVERAGE</span>
          <span className="text-2xl font-black text-blue-900 font-mono block">
            {subjectAverage}%
          </span>
          <span className="text-[9px] text-blue-600">Wastani wa Somo</span>
        </div>

        {/* HIGHEST MARK */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 text-center space-y-1 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">HIGHEST MARK</span>
          <span className="text-2xl font-black text-emerald-950 font-mono block">
            {highestMark}%
          </span>
          <span className="text-[9px] text-emerald-600">Alama ya Juu Zaidi</span>
        </div>

        {/* LOWEST MARK */}
        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 text-center space-y-1 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">LOWEST MARK</span>
          <span className="text-2xl font-black text-amber-950 font-mono block">
            {lowestMark}%
          </span>
          <span className="text-[9px] text-amber-600">Alama ya Chini</span>
        </div>

        {/* PASS RATE */}
        <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-200 text-center space-y-1 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-indigo-700 block">PASS RATE</span>
          <span className="text-2xl font-black text-indigo-950 font-mono block">
            {passRate}%
          </span>
          <span className="text-[9px] text-indigo-600">Ufaulu wa Somo</span>
        </div>
      </div>

      {/* Grade Distribution Breakdown Table (Section 8) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-emerald-700" />
            <span>{language === 'sw' ? 'Mchanganuo wa Madaraja ya Somo (Grade Breakdown)' : 'Subject Grade Distribution'}</span>
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            NECTA Scale: A, B, C, D, F
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-[11px]">
                <th className="py-3 px-4 w-24">GRADE</th>
                <th className="py-3 px-4">MARKS RANGE</th>
                <th className="py-3 px-4 text-center">NUMBER OF STUDENTS</th>
                <th className="py-3 px-4 text-center">PERCENTAGE (%)</th>
                <th className="py-3 px-6 min-w-[200px]">VISUAL DISTRIBUTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold">
              {gradeBreakdown.map((row) => {
                let range = '0 - 29 (Fail)';
                let badgeClass = 'bg-red-100 text-red-800 border-red-300';
                let barColor = 'bg-red-500';

                if (row.grade === 'A') {
                  range = '75 - 100 (Excellent)';
                  badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  barColor = 'bg-emerald-600';
                } else if (row.grade === 'B') {
                  range = '65 - 74 (Very Good)';
                  badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
                  barColor = 'bg-blue-600';
                } else if (row.grade === 'C') {
                  range = '45 - 64 (Good)';
                  badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                  barColor = 'bg-amber-500';
                } else if (row.grade === 'D') {
                  range = '30 - 44 (Satisfactory)';
                  badgeClass = 'bg-orange-100 text-orange-800 border-orange-300';
                  barColor = 'bg-orange-500';
                }

                return (
                  <tr key={row.grade} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full border text-xs font-black ${badgeClass}`}>
                        Grade {row.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{range}</td>
                    <td className="py-3 px-4 text-center font-black text-sm font-mono text-slate-900">
                      {row.count}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800 font-mono">
                      {row.percentage}%
                    </td>
                    <td className="py-3 px-6">
                      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${row.percentage}%` }}
                        />
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
  );
};
