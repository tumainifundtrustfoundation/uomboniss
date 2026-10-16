import React from 'react';
import {
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Percent,
  BookOpen,
  Sparkles,
  BarChart2,
  GraduationCap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { StudentResult } from '../../types';

interface SchoolResultsDashboardViewProps {
  studentResults: StudentResult[];
  onSelectStudent?: (student: StudentResult) => void;
}

export const SchoolResultsDashboardView: React.FC<SchoolResultsDashboardViewProps> = ({
  studentResults,
  onSelectStudent,
}) => {
  const { language } = useLanguage();

  const totalCandidates = studentResults.length || 20;
  const passedStudents = studentResults.filter(
    (s) => s.division && s.division !== 'Division 0' && s.division !== 'ABS'
  );
  const totalPassed = passedStudents.length;
  const totalFailed = totalCandidates - totalPassed;
  const passRate = ((totalPassed / totalCandidates) * 100).toFixed(1);

  // Average marks
  const totalMarksSum = studentResults.reduce((acc, cur) => acc + (cur.averageMarks || 0), 0);
  const schoolAverage = (totalMarksSum / totalCandidates).toFixed(1);

  // Best Student
  const sortedStudents = [...studentResults].sort((a, b) => {
    if (a.division === 'Division II' && b.division !== 'Division II') return -1;
    if (b.division === 'Division II' && a.division !== 'Division II') return 1;
    return a.points - b.points;
  });
  const bestStudent = sortedStudents[0];

  // Count by Division
  const divCounts = {
    div1: studentResults.filter((s) => s.division === 'Division I').length,
    div2: studentResults.filter((s) => s.division === 'Division II').length,
    div3: studentResults.filter((s) => s.division === 'Division III').length,
    div4: studentResults.filter((s) => s.division === 'Division IV').length,
    div0: studentResults.filter((s) => s.division === 'Division 0' || s.division === 'ABS').length,
  };

  // Gender breakdown
  const boys = studentResults.filter((s) => s.gender === 'M');
  const girls = studentResults.filter((s) => s.gender === 'F');
  const boysPassed = boys.filter((s) => s.division !== 'Division 0' && s.division !== 'ABS').length;
  const girlsPassed = girls.filter((s) => s.division !== 'Division 0' && s.division !== 'ABS').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards (Section 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* TOTAL CANDIDATES */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL CANDIDATES</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono block">
            {totalCandidates}
          </span>
          <span className="text-[9px] text-slate-500">Watahiniwa Wote</span>
        </div>

        {/* TOTAL PASSED */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">PASSED</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono block">
            {totalPassed}
          </span>
          <span className="text-[9px] text-emerald-600">Waliofaulu</span>
        </div>

        {/* TOTAL FAILED */}
        <div className="bg-red-50/70 rounded-2xl p-4 border border-red-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-red-700 block">FAILED</span>
          <span className="text-xl sm:text-2xl font-black text-red-950 font-mono block">
            {totalFailed}
          </span>
          <span className="text-[9px] text-red-600">Hawajafaulu / ABS</span>
        </div>

        {/* OVERALL PASS RATE */}
        <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-blue-700 block">PASS RATE</span>
          <span className="text-xl sm:text-2xl font-black text-blue-950 font-mono block">
            {passRate}%
          </span>
          <span className="text-[9px] text-blue-600">Kiwango cha Ufaulu</span>
        </div>

        {/* SCHOOL AVERAGE */}
        <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-200 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-indigo-700 block">AVERAGE</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-950 font-mono block">
            {schoolAverage}%
          </span>
          <span className="text-[9px] text-indigo-600">Wastani wa Shule</span>
        </div>

        {/* BEST STUDENT */}
        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 shadow-xs text-center space-y-1 col-span-2">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">TOP CANDIDATE</span>
          <span className="text-xs sm:text-sm font-black text-amber-950 block truncate">
            {bestStudent ? bestStudent.studentName : 'BENEDICT KIMARIO'}
          </span>
          <span className="text-[9px] text-amber-800 font-semibold">
            {bestStudent ? `${bestStudent.division} • ${bestStudent.points} Pts` : 'Div II • 18 Pts'}
          </span>
        </div>

        {/* SCHOOL GPA */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xs text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-300 block">SCHOOL GPA</span>
          <span className="text-xl sm:text-2xl font-black font-mono block text-amber-400">
            3.58
          </span>
          <span className="text-[9px] text-slate-300">Grade D</span>
        </div>
      </div>

      {/* Division Breakdown & Gender Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Division Distribution Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-700" />
              <span>{language === 'sw' ? 'Mgawanyo wa Madaraja (Division Distribution)' : 'Division Breakdown'}</span>
            </h4>
            <span className="text-xs text-slate-500 font-mono">{totalCandidates} Candidates</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Division I */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-emerald-800">Division I (7 - 17 Pts)</span>
                <span className="font-mono text-slate-700">
                  {divCounts.div1} ({((divCounts.div1 / totalCandidates) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${(divCounts.div1 / totalCandidates) * 100}%` }}
                />
              </div>
            </div>

            {/* Division II */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-blue-800">Division II (18 - 21 Pts)</span>
                <span className="font-mono text-slate-700">
                  {divCounts.div2} ({((divCounts.div2 / totalCandidates) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(divCounts.div2 / totalCandidates) * 100}%` }}
                />
              </div>
            </div>

            {/* Division III */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-amber-800">Division III (22 - 25 Pts)</span>
                <span className="font-mono text-slate-700">
                  {divCounts.div3} ({((divCounts.div3 / totalCandidates) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(divCounts.div3 / totalCandidates) * 100}%` }}
                />
              </div>
            </div>

            {/* Division IV */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-orange-800">Division IV (26 - 33 Pts)</span>
                <span className="font-mono text-slate-700">
                  {divCounts.div4} ({((divCounts.div4 / totalCandidates) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(divCounts.div4 / totalCandidates) * 100}%` }}
                />
              </div>
            </div>

            {/* Division 0 / ABS */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-red-800">Division 0 / ABS (34 - 35 Pts)</span>
                <span className="font-mono text-slate-700">
                  {divCounts.div0} ({((divCounts.div0 / totalCandidates) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${(divCounts.div0 / totalCandidates) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gender Comparison & Performance Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>{language === 'sw' ? 'Ulinganifu wa Kijinsia (Gender Performance)' : 'Gender Analysis'}</span>
            </h4>
            <span className="text-xs text-emerald-700 font-bold">Wavulana & Wasichana</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Boys Card */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">WAVULANA (BOYS)</span>
              <div className="text-2xl font-black text-blue-950">{boys.length}</div>
              <div className="space-y-1 text-[11px] text-blue-800">
                <div className="flex justify-between">
                  <span>Waliofaulu:</span>
                  <strong>{boysPassed} / {boys.length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Kiwango cha Ufaulu:</span>
                  <strong>{boys.length > 0 ? ((boysPassed / boys.length) * 100).toFixed(1) : 0}%</strong>
                </div>
              </div>
            </div>

            {/* Girls Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">WASICHANA (GIRLS)</span>
              <div className="text-2xl font-black text-emerald-950">{girls.length}</div>
              <div className="space-y-1 text-[11px] text-emerald-800">
                <div className="flex justify-between">
                  <span>Waliofaulu:</span>
                  <strong>{girlsPassed} / {girls.length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Kiwango cha Ufaulu:</span>
                  <strong>{girls.length > 0 ? ((girlsPassed / girls.length) * 100).toFixed(1) : 0}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Core Strengths & Recommendations */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-800 uppercase text-[10px] block">
              {language === 'sw' ? 'Muhtasari wa Kitaaluma:' : 'Academic Committee Takeaways:'}
            </span>
            <p className="text-slate-600 leading-relaxed">
              Masomo ya <strong>Jiografia</strong> na <strong>Historia</strong> yamekuwa na ufaulu wa hali ya juu na daraja A na B. Mpango maalum wa uimarishaji wa <strong>Kiswahili</strong> na <strong>Kiingereza</strong> umeanzishwa ili kupandisha madaraja ya jumla ya watahiniwa kuelekea mtihani wa Taifa wa NECTA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
