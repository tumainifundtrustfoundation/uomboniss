import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PortalNavbar } from './PortalNavbar';
import { StudentDashboard } from './StudentDashboard';
import { ParentDashboard } from './ParentDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { StaffDashboard } from './StaffDashboard';
import { AdminDashboard } from './AdminDashboard';
import { Bell, User, CheckCircle2, ShieldCheck, Mail, Phone, Calendar, School, Award } from 'lucide-react';

export const PortalContainer: React.FC = () => {
  const { user, userProfile, activeRoleDashboard } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  const notifications = [
    {
      id: 'notif-1',
      title: 'Term Examination Schedule Published',
      time: '2 hours ago',
      category: 'Academics',
      body: 'The academic department has uploaded the official Form Four terminal timetable.',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Tuition Fee Verification Confirmed',
      time: '1 day ago',
      category: 'Finance',
      body: 'Your bank payment reference CRDB-98421 has been reconciled and credited.',
      read: true,
    },
    {
      id: 'notif-3',
      title: 'School Sports Gala & Athletics Day',
      time: '3 days ago',
      category: 'Events',
      body: 'Saturday athletic gala registrations are now open with physical education teachers.',
      read: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFF0] text-[#704214] font-sans flex flex-col">
      {/* Portal Navbar */}
      <PortalNavbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <>
            {activeRoleDashboard === 'student' && <StudentDashboard activeTab="dashboard" />}
            {activeRoleDashboard === 'parent' && <ParentDashboard />}
            {activeRoleDashboard === 'teacher' && <TeacherDashboard />}
            {activeRoleDashboard === 'staff' && <StaffDashboard />}
            {activeRoleDashboard === 'admin' && <AdminDashboard />}
          </>
        )}

        {currentTab === 'academics' && (
          <>
            {activeRoleDashboard === 'student' && <StudentDashboard activeTab="academics" />}
            {activeRoleDashboard === 'parent' && <ParentDashboard />}
            {activeRoleDashboard === 'teacher' && <TeacherDashboard />}
            {activeRoleDashboard === 'staff' && <StaffDashboard />}
            {activeRoleDashboard === 'admin' && <AdminDashboard />}
          </>
        )}

        {currentTab === 'results' && (
          <StudentDashboard activeTab="results" />
        )}

        {currentTab === 'announcements' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-[#704214] mb-2">School Announcements &amp; Circulars</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'NECTA Pre-National Mock Examination Dates', date: '18 March 2026', cat: 'Academics', text: 'All candidate students in Form Two and Form Four are advised to finalize coursework and collect past paper broadsheets from faculty offices.' },
                { title: 'Parents & Teachers Association (PTA) Conference', date: '12 March 2026', cat: 'General', text: 'Annual general meeting scheduled in the main assembly hall at 09:00 AM. Academic review reports will be distributed.' },
                { title: 'Campus Cleanliness & Environmental Greenery Drive', date: '08 March 2026', cat: 'Boarding', text: 'Tree planting campaign under the theme "Tujiendeleze Sisi Wenyewe" around the school perimeter.' },
              ].map((ann, i) => (
                <div key={i} className="p-5 bg-white border border-[#704214]/15 rounded-lg shadow-xs">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5EBD7] text-[#704214] border border-[#704214]/20">
                    {ann.cat}
                  </span>
                  <h3 className="text-sm font-bold text-[#704214] mt-2">{ann.title}</h3>
                  <p className="text-xs text-[#704214]/80 mt-1 leading-relaxed">{ann.text}</p>
                  <span className="text-[10px] text-[#C9A227] font-semibold mt-3 block">{ann.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'notifications' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-xl font-bold text-[#704214] mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#C9A227]" />
              <span>Portal Notifications</span>
            </h1>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border transition-all ${
                    !notif.read
                      ? 'bg-white border-[#704214]/30 shadow-xs'
                      : 'bg-[#FFFFF0] border-[#704214]/15 text-[#704214]/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#704214]">{notif.title}</span>
                    <span className="text-[10px] text-[#704214]/60">{notif.time}</span>
                  </div>
                  <p className="text-xs text-[#704214]/80 mt-1">{notif.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white border border-[#704214]/15 rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-[#704214] text-[#FFFFF0] font-bold text-xl flex items-center justify-center border border-[#C9A227]">
                {(userProfile?.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#704214]">{userProfile?.fullName || 'User'}</h1>
                <p className="text-xs text-[#704214]/70 font-mono">{userProfile?.email || user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5EBD7] text-[#704214] border border-[#704214]/20 uppercase">
                  Role: {userProfile?.role || 'parent'}
                </span>
              </div>
            </div>

            <div className="space-y-3 border-t border-[#704214]/10 pt-4 text-xs">
              <div className="flex justify-between py-2 border-b border-[#704214]/10">
                <span className="text-[#704214]/70">School Institution</span>
                <span className="font-bold text-[#704214]">UOMBONI SECONDARY SCHOOL</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#704214]/10">
                <span className="text-[#704214]/70">School Motto</span>
                <span className="font-semibold text-[#704214]">&ldquo;TUJIENDELEZE SISI WENYEWE&rdquo;</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#704214]/10">
                <span className="text-[#704214]/70">Location</span>
                <span className="text-[#704214]">Marangu Magharibi, Moshi, Kilimanjaro</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#704214]/70">Email Verification</span>
                <span className="font-bold text-[#704214] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A227]" />
                  {user?.emailVerified || userProfile?.emailVerified ? 'Verified' : 'Active Account'}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#F5EBD7] border-t border-[#704214]/15 py-4 text-center text-xs text-[#704214]/80">
        <p>UOMBONI SECONDARY SCHOOL • Digital Portal System • Marangu Magharibi, Moshi</p>
      </footer>
    </div>
  );
};
