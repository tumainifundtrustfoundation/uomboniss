import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  Phone,
  Mail,
  Award,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Send,
  MessageSquare,
  Building,
  CalendarCheck,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SchoolLogo } from '../SchoolLogo';

export const ParentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { language } = useLanguage();

  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'academics' | 'attendance' | 'announcements' | 'calendar' | 'notices' | 'fees' | 'downloads' | 'messages' | 'contact'
  >('overview');

  const [msgSent, setMsgSent] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [msgTarget, setMsgTarget] = useState('Class Teacher');

  const children = [
    {
      name: 'Baraka J. Kimaro',
      admissionNo: 'USS/2026/0486',
      form: 'Form Four (IV-A)',
      house: 'Kibo House',
      classTeacher: 'Mr. David Tarimo',
      teacherPhone: '+255 754 123 456',
      attendance: 96.4,
      absentDays: 2,
      standing: 'Division I (9 Points)',
      annualFee: 1500000,
      feePaid: 1200000,
      feeBalance: 300000,
      recentGrades: [
        { subject: 'Basic Mathematics', score: 87, grade: 'A' },
        { subject: 'Physics', score: 76, grade: 'B' },
        { subject: 'Chemistry', score: 91, grade: 'A' },
        { subject: 'Biology', score: 95, grade: 'A' },
        { subject: 'English', score: 84, grade: 'A' },
        { subject: 'Kiswahili', score: 94, grade: 'A' },
      ],
    },
    {
      name: 'Grace J. Kimaro',
      admissionNo: 'USS/2026/0612',
      form: 'Form Two (II-B)',
      house: 'Mawenzi House',
      classTeacher: 'Madam Sarah Massawe',
      teacherPhone: '+255 784 987 654',
      attendance: 98.1,
      absentDays: 1,
      standing: 'Division I (8 Points)',
      annualFee: 1400000,
      feePaid: 1400000,
      feeBalance: 0,
      recentGrades: [
        { subject: 'Mathematics', score: 90, grade: 'A' },
        { subject: 'Science', score: 88, grade: 'A' },
        { subject: 'English', score: 85, grade: 'A' },
        { subject: 'Kiswahili', score: 92, grade: 'A' },
      ],
    },
  ];

  const currentChild = children[activeChildIndex];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setMsgSent(true);
    setMsgText('');
    setTimeout(() => setMsgSent(false), 4000);
  };

  return (
    <div className="space-y-6 text-[#704214]">
      {/* Parent Welcome Bar - Dedicated Sepia Identity */}
      <div className="bg-[#704214] border border-[#C9A227]/40 rounded-xl p-6 sm:p-8 text-[#FFFFF0] relative overflow-hidden shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-1.5 rounded-xl bg-white/10 border border-[#C9A227]/40 shadow-sm shrink-0">
              <SchoolLogo size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#F5EBD7] text-[#704214]">
                  Parent Portal Dashboard
                </span>
                <span className="text-xs text-[#F5EBD7]/80">NECTA S0486 · Marangu West</span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFF0]">
                Welcome, {userProfile?.fullName || 'Parent / Guardian'}
              </h1>
              <p className="text-xs sm:text-sm text-[#F5EBD7]/90 mt-1 max-w-2xl">
                Track your child&apos;s academic progress, attendance records, school fee statements, official announcements, and direct messages with teachers.
              </p>
            </div>
          </div>

          {/* Child Selector */}
          <div className="flex items-center gap-2 shrink-0">
            {children.map((child, idx) => (
              <button
                key={child.admissionNo}
                type="button"
                onClick={() => setActiveChildIndex(idx)}
                className={`px-3 py-2 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                  activeChildIndex === idx
                    ? 'bg-[#FFFFF0] text-[#704214] border-[#C9A227] shadow-sm'
                    : 'bg-[#58330F] text-[#F5EBD7] border-[#704214] hover:bg-[#704214]'
                }`}
              >
                {child.name.split(' ')[0]} ({child.form.split(' ')[1] || child.form})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub navigation buttons (11 core areas) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F5EBD7] rounded-lg border border-[#704214]/15">
        {[
          { id: 'overview', label: 'Parent Dashboard' },
          { id: 'academics', label: 'Academic Progress' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'announcements', label: 'School Announcements' },
          { id: 'calendar', label: 'School Calendar' },
          { id: 'notices', label: 'Important Notices' },
          { id: 'fees', label: 'Fees Information' },
          { id: 'downloads', label: 'Downloads' },
          { id: 'messages', label: 'Messages' },
          { id: 'contact', label: 'Contact School' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-[#704214] text-white shadow-xs'
                : 'text-[#704214] hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Child Profile & Metrics Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Child Info Card */}
            <div className="bg-white border border-[#704214]/15 rounded-lg p-5 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-lg bg-[#F5EBD7] text-[#704214] flex items-center justify-center font-bold text-base border border-[#704214]/20">
                  {currentChild.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#704214]">{currentChild.name}</h3>
                  <p className="text-xs text-[#704214]/70">{currentChild.form} • {currentChild.house}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-[#704214]/10 pt-3">
                <div className="flex justify-between">
                  <span className="text-[#704214]/70">Admission No:</span>
                  <span className="font-mono font-bold text-[#704214]">{currentChild.admissionNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#704214]/70">Class Teacher:</span>
                  <span className="font-medium text-[#704214]">{currentChild.classTeacher}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#704214]/70">Teacher Contact:</span>
                  <span className="font-mono text-[#704214]">{currentChild.teacherPhone}</span>
                </div>
              </div>
            </div>

            {/* Attendance & Standing Card */}
            <div className="bg-white border border-[#704214]/15 rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#704214]">Attendance &amp; Standing</h3>
                <span className="text-xs font-bold text-[#704214] bg-[#F5EBD7] px-2 py-0.5 rounded">
                  {currentChild.standing}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#704214]/70">Attendance Rate</span>
                    <span className="font-bold text-[#704214]">{currentChild.attendance}%</span>
                  </div>
                  <div className="w-full bg-[#F5EBD7] rounded-full h-2">
                    <div
                      className="bg-[#704214] h-2 rounded-full"
                      style={{ width: `${currentChild.attendance}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-[#704214]/70 pt-2 border-t border-[#704214]/10">
                  Total absent days this term: <strong>{currentChild.absentDays} days</strong> (Medically cleared)
                </div>
              </div>
            </div>

            {/* Fee Balance Card */}
            <div className="bg-white border border-[#704214]/15 rounded-lg p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#704214] mb-3">Tuition &amp; Fees</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#704214]/70">Annual Total:</span>
                  <span className="font-bold text-[#704214]">TZS {currentChild.annualFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#704214]/70">Paid to Date:</span>
                  <span className="font-bold text-[#704214]">TZS {currentChild.feePaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#704214]/10">
                  <span className="text-[#704214] font-semibold">Remaining Balance:</span>
                  <span className="font-bold text-[#704214]">
                    TZS {currentChild.feeBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Report Card Table */}
          <div className="bg-white border border-[#704214]/15 rounded-lg p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#704214] mb-4">
              Recent Academic Assessment Grades ({currentChild.form})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {currentChild.recentGrades.map((grade) => (
                <div key={grade.subject} className="p-3 bg-[#FFFFF0] border border-[#704214]/15 rounded-md text-center">
                  <span className="text-[11px] text-[#704214]/70 block truncate">{grade.subject}</span>
                  <span className="text-xl font-bold text-[#704214] block mt-1">{grade.score}%</span>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5EBD7] text-[#704214]">
                    Grade {grade.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACADEMICS */}
      {activeSubTab === 'academics' && (
        <div className="bg-white border border-[#704214]/15 rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#704214]">Academic Progress Report</h3>
          <p className="text-xs text-[#704214]/80">
            Form Four Mock and Terminal examinations for {currentChild.name} are reviewed under official NECTA criteria.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EBD7] border-b border-[#704214]/15 text-[#704214]">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Subject</th>
                  <th className="px-4 py-2.5 font-bold text-center">Score</th>
                  <th className="px-4 py-2.5 font-bold text-center">Grade</th>
                  <th className="px-4 py-2.5 font-bold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#704214]/10">
                {currentChild.recentGrades.map((g, idx) => (
                  <tr key={idx} className="hover:bg-[#FFFFF0]">
                    <td className="px-4 py-2.5 font-semibold text-[#704214]">{g.subject}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-[#704214]">{g.score}%</td>
                    <td className="px-4 py-2.5 text-center font-bold text-[#704214]">{g.grade}</td>
                    <td className="px-4 py-2.5 text-[#704214]/80">Very Good Performance</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEES */}
      {activeSubTab === 'fees' && (
        <div className="bg-white border border-[#704214]/15 rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#704214]">Fees Information &amp; Official Bank Accounts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#FFFFF0] border border-[#704214]/15 rounded-md">
              <span className="font-bold text-sm text-[#704214] block">CRDB Bank</span>
              <p className="mt-1 font-mono text-[#704214]">Account: 01J1079051400</p>
              <p className="text-[11px] text-[#704214]/70">Name: Uomboni Secondary School</p>
            </div>
            <div className="p-4 bg-[#FFFFF0] border border-[#704214]/15 rounded-md">
              <span className="font-bold text-sm text-[#704214] block">NMB Bank</span>
              <p className="mt-1 font-mono text-[#704214]">Account: 40302507439</p>
              <p className="text-[11px] text-[#704214]/70">Name: Uomboni Secondary School</p>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      {activeSubTab === 'messages' && (
        <div className="bg-white border border-[#704214]/15 rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#704214]">Direct Message to School</h3>
          {msgSent ? (
            <div className="p-4 bg-[#FFFFF0] border border-[#C9A227] rounded text-xs text-[#704214]">
              Message delivered to {msgTarget}. You will be contacted shortly.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Recipient</label>
                <select
                  value={msgTarget}
                  onChange={(e) => setMsgTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-[#704214]/20 rounded bg-white text-[#704214]"
                >
                  <option value="Class Teacher">Class Teacher ({currentChild.classTeacher})</option>
                  <option value="Headmaster">Headmaster</option>
                  <option value="Academic Master">Academic Master</option>
                  <option value="Bursar">Bursar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Enter your message or inquiry here..."
                  className="w-full px-3 py-2 border border-[#704214]/20 rounded bg-white text-[#704214]"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-[#704214] text-white font-semibold rounded hover:bg-[#58330F] transition-colors cursor-pointer"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      )}

      {/* CONTACT */}
      {activeSubTab === 'contact' && (
        <div className="bg-white border border-[#704214]/15 rounded-lg p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-base font-bold text-[#704214]">Contact School</h3>
          <p className="text-[#704214]/80">
            Headmaster: +255 782 558 127 · Second Master: +255 754 532 949 · Academic Master: +255 745 548 225
          </p>
        </div>
      )}
    </div>
  );
};
