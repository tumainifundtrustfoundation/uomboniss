import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const StudentDashboard: React.FC<{ activeTab?: string }> = ({ activeTab = 'dashboard' }) => {
  const { userProfile } = useAuth();
  const { language } = useLanguage();

  const [tab, setTab] = useState<'overview' | 'subjects' | 'timetable' | 'results' | 'assignments' | 'materials'>(
    activeTab === 'results' ? 'results' : activeTab === 'academics' ? 'subjects' : 'overview'
  );

  // Student details
  const student = {
    name: userProfile?.fullName || 'Baraka J. Kimaro',
    studentId: 'USS/2026/0486',
    form: 'Form Four (IV)',
    stream: 'Form 4A - Science',
    examNumber: 'S.0486/0014/2026',
    attendancePercent: 96.4,
    daysPresent: 82,
    daysAbsent: 3,
    gpa: '3.8 / 4.0',
    currentDivision: 'Division I',
    divisionPoints: '9 Points (Distinction)',
  };

  const subjects = [
    { code: '011', name: 'Civics', teacher: 'Madam Grace Lyimo', progress: 85, grade: 'A', score: 86 },
    { code: '012', name: 'History', teacher: 'Mr. Emmanuel Shirima', progress: 78, grade: 'B+', score: 79 },
    { code: '013', name: 'Geography', teacher: 'Mr. Peter Mboya', progress: 88, grade: 'A', score: 88 },
    { code: '014', name: 'Kiswahili', teacher: 'Mwl. Asha Bakari', progress: 92, grade: 'A', score: 94 },
    { code: '021', name: 'English Language', teacher: 'Madam Sarah Massawe', progress: 81, grade: 'A', score: 84 },
    { code: '031', name: 'Physics', teacher: 'Mr. Kelvin Temu', progress: 74, grade: 'B', score: 76 },
    { code: '032', name: 'Chemistry', teacher: 'Dr. Joseph Kavishe', progress: 89, grade: 'A', score: 91 },
    { code: '033', name: 'Biology', teacher: 'Madam Elizabeth Moshi', progress: 94, grade: 'A', score: 95 },
    { code: '041', name: 'Basic Mathematics', teacher: 'Mr. David Tarimo', progress: 86, grade: 'A', score: 87 },
  ];

  const assignments = [
    {
      id: 'asg-1',
      subject: 'Basic Mathematics',
      title: 'Coordinate Geometry & Linear Inequalities Problem Set 4',
      dueDate: 'Monday, 24 March 2026',
      status: 'Pending',
      teacher: 'Mr. David Tarimo',
    },
    {
      id: 'asg-2',
      subject: 'Chemistry',
      title: 'Volumetric Analysis (Acid-Base Titration Lab Report)',
      dueDate: 'Wednesday, 26 March 2026',
      status: 'Submitted',
      teacher: 'Dr. Joseph Kavishe',
    },
    {
      id: 'asg-3',
      subject: 'Biology',
      title: 'Genetics and Chromosomal Inheritance Essay',
      dueDate: 'Friday, 28 March 2026',
      status: 'Graded (A)',
      teacher: 'Madam Elizabeth Moshi',
    },
  ];

  const announcements = [
    {
      id: 'ann-1',
      title: 'NECTA Pre-National Mock Examinations Timetable Released',
      date: '18 March 2026',
      badge: 'Academics',
      body: 'Form Four Pre-National Mock exams commence on 14th April 2026. All students must collect revision sets from academic masters.',
    },
    {
      id: 'ann-2',
      title: 'Inter-House Sports & Cultural Gala 2026',
      date: '15 March 2026',
      badge: 'Events',
      body: 'Uomboni Secondary School annual sports tournament takes place this Saturday on the main athletic grounds.',
    },
  ];

  const timetable = [
    { period: '07:30 - 08:10', mon: 'Assembly', tue: 'Civics', wed: 'Chemistry', thu: 'Physics', fri: 'English' },
    { period: '08:10 - 08:50', mon: 'Mathematics', tue: 'Civics', wed: 'Chemistry', thu: 'Physics', fri: 'English' },
    { period: '08:50 - 09:30', mon: 'Mathematics', tue: 'Kiswahili', wed: 'Biology', thu: 'Geography', fri: 'Mathematics' },
    { period: '09:30 - 10:10', mon: 'Physics', tue: 'Kiswahili', wed: 'Biology', thu: 'Geography', fri: 'Mathematics' },
    { period: '10:10 - 10:40', mon: 'TEA BREAK', tue: 'TEA BREAK', wed: 'TEA BREAK', thu: 'TEA BREAK', fri: 'TEA BREAK' },
    { period: '10:40 - 11:20', mon: 'Chemistry', tue: 'Mathematics', wed: 'English', thu: 'History', fri: 'Biology' },
    { period: '11:20 - 12:00', mon: 'Chemistry', tue: 'Mathematics', wed: 'English', thu: 'History', fri: 'Biology' },
    { period: '12:00 - 12:40', mon: 'Biology', tue: 'Physics Lab', wed: 'Kiswahili', thu: 'Civics', fri: 'Club Activities' },
    { period: '12:40 - 01:40', mon: 'LUNCH & REST', tue: 'LUNCH & REST', wed: 'LUNCH & REST', thu: 'LUNCH & REST', fri: 'LUNCH & REST' },
    { period: '01:40 - 02:20', mon: 'History', tue: 'Geography', wed: 'Mathematics', thu: 'Chemistry Lab', fri: 'Sports & Games' },
    { period: '02:20 - 03:00', mon: 'Geography', tue: 'History', wed: 'Basic Maths', thu: 'Chemistry Lab', fri: 'Cleanliness' },
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-1 shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black text-amber-400">
                {student.name.charAt(0)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {student.stream}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Candidate ID: <span className="font-mono text-amber-300 font-bold">{student.examNumber}</span> • {student.studentId}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>📍 Marangu, Moshi</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">&ldquo;TUJIENDELEZE SISI WENYEWE&rdquo;</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl min-w-[120px] text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Current Standing</span>
              <span className="text-base font-black text-emerald-400">{student.currentDivision}</span>
              <span className="text-[10px] text-amber-400 font-semibold block">{student.divisionPoints}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl min-w-[110px] text-center">
              <span className="text-[11px] text-slate-400 font-medium block">Attendance</span>
              <span className="text-base font-black text-blue-400">{student.attendancePercent}%</span>
              <span className="text-[10px] text-slate-400 block">{student.daysPresent} Days Present</span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: BookOpen },
          { id: 'subjects', label: 'Subjects & Grades', icon: Award },
          { id: 'timetable', label: 'Class Timetable', icon: Calendar },
          { id: 'results', label: 'NECTA & Term Results', icon: GraduationCap },
          { id: 'assignments', label: 'Assignments (3)', icon: FileText },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left 2 Cols: School Announcements & Recent Assignments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white">School Announcements & Notices</h2>
                </div>
                <span className="text-xs text-slate-400">Updated today</span>
              </div>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-100">{ann.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {ann.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{ann.body}</p>
                    <span className="text-[10px] text-amber-400/80 font-mono mt-2 block">{ann.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments Quick View */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base font-bold text-white">Active Assignments & Coursework</h2>
                </div>
                <button
                  onClick={() => setTab('assignments')}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {assignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 block">{asg.subject}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">{asg.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Due: {asg.dueDate} • Instructor: {asg.teacher}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          asg.status === 'Submitted'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : asg.status.includes('Graded')
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {asg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Performance & Subject Summary */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white mb-4">Academic Progress by Subject</h2>
              <div className="space-y-3">
                {subjects.slice(0, 5).map((s) => (
                  <div key={s.code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{s.name}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {s.score}% ({s.grade})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setTab('subjects')}
                className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-colors"
              >
                View Full Subject Roster &rarr;
              </button>
            </div>

            {/* Motto & Discipline Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/20 text-center">
              <GraduationCap className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-black text-amber-300 uppercase tracking-widest">
                UOMBONI MOTTO
              </p>
              <h3 className="text-base font-bold text-white font-serif my-1">
                &ldquo;TUJIENDELEZE SISI WENYEWE&rdquo;
              </h3>
              <p className="text-xs text-slate-400 italic">
                Education • Pray • Work • Discipline • Excellence
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Subjects */}
      {tab === 'subjects' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Registered Subjects (Form IV Science & Arts)</h2>
              <p className="text-xs text-slate-400">9 Core and elective subjects approved by NECTA for examination.</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400">Academic Year 2026</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div
                key={sub.code}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-400">{sub.code}</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Grade: {sub.grade} ({sub.score}%)
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white">{sub.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Instructor: {sub.teacher}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Syllabus Covered</span>
                    <span className="font-bold text-white">{sub.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${sub.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Class Timetable */}
      {tab === 'timetable' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 overflow-x-auto">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">Form Four Class Timetable</h2>
            <p className="text-xs text-slate-400">Official schedule for Academic Term 2026 • Marangu Magharibi</p>
          </div>

          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Period</th>
                <th className="py-3 px-3">Monday</th>
                <th className="py-3 px-3">Tuesday</th>
                <th className="py-3 px-3">Wednesday</th>
                <th className="py-3 px-3">Thursday</th>
                <th className="py-3 px-3">Friday</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {timetable.map((row, idx) => (
                <tr
                  key={idx}
                  className={
                    row.mon.includes('BREAK') || row.mon.includes('LUNCH')
                      ? 'bg-slate-950/80 text-amber-400 font-bold text-center'
                      : 'hover:bg-slate-800/50'
                  }
                >
                  <td className="py-2.5 px-3 font-mono text-slate-400 font-semibold">{row.period}</td>
                  <td className="py-2.5 px-3 font-medium">{row.mon}</td>
                  <td className="py-2.5 px-3 font-medium">{row.tue}</td>
                  <td className="py-2.5 px-3 font-medium">{row.wed}</td>
                  <td className="py-2.5 px-3 font-medium">{row.thu}</td>
                  <td className="py-2.5 px-3 font-medium">{row.fri}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Examination Results */}
      {tab === 'results' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Form IV Terminal & Mock Examination Broad-sheet</h2>
                <p className="text-xs text-slate-400">National Examination Council of Tanzania (NECTA) Standards</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Result Slip</span>
                </button>
              </div>
            </div>

            {/* Candidate summary banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Candidate Number</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-white">{student.examNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Overall Division</span>
                <span className="text-xs sm:text-sm font-black text-emerald-400">{student.currentDivision}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Total Points (Best 7)</span>
                <span className="text-xs sm:text-sm font-bold text-amber-400">9 Points</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">School Rank</span>
                <span className="text-xs sm:text-sm font-bold text-blue-400">#4 of 128 Students</span>
              </div>
            </div>

            {/* Scorecard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Subject Code</th>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3">Continuous (40%)</th>
                    <th className="py-2.5 px-3">Exam (60%)</th>
                    <th className="py-2.5 px-3">Total (100%)</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {subjects.map((sub) => (
                    <tr key={sub.code} className="hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono font-semibold text-amber-400">{sub.code}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{sub.name}</td>
                      <td className="py-2.5 px-3">36</td>
                      <td className="py-2.5 px-3">{sub.score - 36}</td>
                      <td className="py-2.5 px-3 font-bold">{sub.score}</td>
                      <td className="py-2.5 px-3 font-black text-emerald-400">{sub.grade}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-medium">Excellent Performance</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Assignments */}
      {tab === 'assignments' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Student Assignments Portal</h2>
              <p className="text-xs text-slate-400">View tasks, download worksheets, and submit your homework.</p>
            </div>
          </div>

          <div className="space-y-3">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">{asg.subject}</span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-xs text-slate-400">Assigned by {asg.teacher}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{asg.title}</h3>
                  <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Due Date: {asg.dueDate}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Task PDF
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Upload Answer Sheet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
