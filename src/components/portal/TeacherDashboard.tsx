import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Award,
  BookOpen,
  Calendar,
  Save,
  Search,
  Upload,
  CalendarCheck,
  Layers,
  FileBarChart,
  User,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SchoolLogo } from '../SchoolLogo';

export const TeacherDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { language } = useLanguage();

  const [activeTeacherTab, setActiveTeacherTab] = useState<
    | 'dashboard'
    | 'records'
    | 'attendance'
    | 'results'
    | 'timetable'
    | 'classes'
    | 'assignments'
    | 'announcements'
    | 'reports'
    | 'profile'
  >('attendance');

  const [selectedClass, setSelectedClass] = useState('Form 4A');
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  const [students, setStudents] = useState([
    { id: 'USS/0486', name: 'Baraka J. Kimaro', attendance: 'Present', score: 87, grade: 'A' },
    { id: 'USS/0487', name: 'Amina S. Mushi', attendance: 'Present', score: 92, grade: 'A' },
    { id: 'USS/0488', name: 'Frank K. Tarimo', attendance: 'Present', score: 68, grade: 'C' },
    { id: 'USS/0489', name: 'Neema P. Massawe', attendance: 'Absent', score: 79, grade: 'B' },
    { id: 'USS/0490', name: 'Godfrey E. Temu', attendance: 'Late', score: 84, grade: 'A' },
    { id: 'USS/0491', name: 'Zawadi D. Lyimo', attendance: 'Present', score: 95, grade: 'A' },
    { id: 'USS/0492', name: 'Kelvin R. Moshi', attendance: 'Present', score: 71, grade: 'B' },
  ]);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: 'Basic Mathematics',
    dueDate: '',
    instructions: '',
  });
  const [assignmentCreated, setAssignmentCreated] = useState(false);

  const toggleAttendance = (id: string, newStatus: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, attendance: newStatus } : s))
    );
  };

  const handleScoreChange = (id: string, newScore: number) => {
    let grade = 'F';
    if (newScore >= 75) grade = 'A';
    else if (newScore >= 65) grade = 'B';
    else if (newScore >= 50) grade = 'C';
    else if (newScore >= 30) grade = 'D';

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, score: newScore, grade } : s))
    );
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title.trim()) return;
    setAssignmentCreated(true);
    setNewAssignment({ title: '', subject: 'Basic Mathematics', dueDate: '', instructions: '' });
    setTimeout(() => setAssignmentCreated(false), 3500);
  };

  return (
    <div className="space-y-6 text-[#704214]">
      {/* Teacher Welcome Bar - Sepia Identity */}
      <div className="bg-[#704214] border border-[#C9A227]/40 rounded-xl p-6 sm:p-8 text-[#FFFFF0] relative overflow-hidden shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-1.5 rounded-xl bg-white/10 border border-[#C9A227]/40 shadow-sm shrink-0">
              <SchoolLogo size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#F5EBD7] text-[#704214]">
                  Teachers &amp; Staff Portal
                </span>
                <span className="text-xs text-[#F5EBD7]/80">NECTA S0486 · Marangu West</span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFF0]">
                Welcome, {userProfile?.fullName || 'Teacher / Staff Member'}
              </h1>
              <p className="text-xs sm:text-sm text-[#F5EBD7]/90 mt-1 max-w-2xl">
                Manage classroom roll-call, continuous assessments, grading broadsheets, teaching timetables, and student records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#58330F] rounded-md text-xs font-semibold text-[#F5EBD7] border border-[#704214]">
              Active Term: Term 1, 2026
            </span>
          </div>
        </div>
      </div>

      {/* Tabs list (10 core areas) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F5EBD7] rounded-lg border border-[#704214]/15">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'records', label: 'Student Records' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'results', label: 'Academic Results' },
          { id: 'timetable', label: 'Timetable' },
          { id: 'classes', label: 'Classes' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'announcements', label: 'Announcements' },
          { id: 'reports', label: 'Reports' },
          { id: 'profile', label: 'Profile' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTeacherTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTeacherTab === tab.id
                ? 'bg-[#704214] text-white shadow-xs'
                : 'text-[#704214] hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ATTENDANCE SECTION */}
      {activeTeacherTab === 'attendance' && (
        <div className="bg-white border border-[#704214]/15 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#704214]">
                Mark Session Attendance — {selectedClass}
              </h3>
              <p className="text-xs text-[#704214]/70 mt-0.5">
                Select Present, Absent, or Late for each enrolled student.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 text-xs border border-[#704214]/20 rounded bg-[#FFFFF0] text-[#704214]"
              >
                <option value="Form 4A">Form 4A</option>
                <option value="Form 3B">Form 3B</option>
                <option value="Form 2A">Form 2A</option>
              </select>

              <button
                onClick={() => {
                  setAttendanceSaved(true);
                  setTimeout(() => setAttendanceSaved(false), 3000);
                }}
                className="px-4 py-1.5 bg-[#704214] hover:bg-[#58330F] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>{attendanceSaved ? 'Saved to Records!' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EBD7] border-b border-[#704214]/15 text-[#704214]">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Admission No</th>
                  <th className="px-4 py-2.5 font-bold">Student Name</th>
                  <th className="px-4 py-2.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#704214]/10">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FFFFF0]">
                    <td className="px-4 py-2.5 font-mono text-[#704214]/80">{s.id}</td>
                    <td className="px-4 py-2.5 font-bold text-[#704214]">{s.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        {['Present', 'Late', 'Absent'].map((status) => (
                          <button
                            key={status}
                            onClick={() => toggleAttendance(s.id, status)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                              s.attendance === status
                                ? 'bg-[#704214] text-white'
                                : 'bg-[#FFFFF0] border border-[#704214]/20 text-[#704214] hover:bg-[#F5EBD7]'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESULTS SECTION */}
      {activeTeacherTab === 'results' && (
        <div className="bg-white border border-[#704214]/15 rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#704214]">Enter Assessment Scores (Form 4A)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EBD7] border-b border-[#704214]/15 text-[#704214]">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Admission No</th>
                  <th className="px-4 py-2.5 font-bold">Student Name</th>
                  <th className="px-4 py-2.5 font-bold text-center">Score (%)</th>
                  <th className="px-4 py-2.5 font-bold text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#704214]/10">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FFFFF0]">
                    <td className="px-4 py-2.5 font-mono text-[#704214]/80">{s.id}</td>
                    <td className="px-4 py-2.5 font-bold text-[#704214]">{s.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={s.score}
                        onChange={(e) => handleScoreChange(s.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center font-bold px-2 py-1 border border-[#704214]/25 rounded bg-[#FFFFF0] text-[#704214]"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[#F5EBD7] text-[#704214]">
                        {s.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSIGNMENTS SECTION */}
      {activeTeacherTab === 'assignments' && (
        <div className="bg-white border border-[#704214]/15 rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#704214]">Create Class Assignment</h3>
          {assignmentCreated && (
            <div className="p-3 bg-[#FFFFF0] border border-[#C9A227] rounded text-xs text-[#704214]">
              Assignment published successfully to student portal!
            </div>
          )}
          <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Title *</label>
              <input
                type="text"
                required
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                placeholder="e.g. Vectors and Geometry Problem Set"
                className="w-full px-3 py-2 border border-[#704214]/20 rounded bg-white text-[#704214]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Due Date</label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                className="w-full sm:w-64 px-3 py-2 border border-[#704214]/20 rounded bg-white text-[#704214]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-[#704214] text-white font-semibold rounded hover:bg-[#58330F] transition-colors cursor-pointer"
            >
              Post Assignment
            </button>
          </form>
        </div>
      )}

      {/* TIMETABLE / OTHER TABS */}
      {activeTeacherTab !== 'attendance' && activeTeacherTab !== 'results' && activeTeacherTab !== 'assignments' && (
        <div className="bg-white border border-[#704214]/15 rounded-lg p-6 shadow-xs space-y-2 text-xs">
          <h3 className="text-base font-bold text-[#704214]">
            {activeTeacherTab.charAt(0).toUpperCase() + activeTeacherTab.slice(1)} Module
          </h3>
          <p className="text-[#704214]/70">
            Official records for {activeTeacherTab} synchronized with the Uomboni Secondary School central database.
          </p>
        </div>
      )}
    </div>
  );
};
