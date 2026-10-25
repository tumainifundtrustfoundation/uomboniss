import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PortalNavbar } from './PortalNavbar';
import { StudentDashboard } from './StudentDashboard';
import { ParentDashboard } from './ParentDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { StaffDashboard } from './StaffDashboard';
import { AdminDashboard } from './AdminDashboard';
import {
  Bell,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  HelpCircle,
  MapPin,
  Flame,
  Globe,
  ShieldCheck,
  GraduationCap,
  FileText,
  Lock,
} from 'lucide-react';

import { UnauthorizedAccountView } from '../auth/UnauthorizedAccountView';

export const PortalContainer: React.FC = () => {
  const { user, userProfile, activeRoleDashboard, setActiveView } = useAuth();
  const { language } = useLanguage();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Enforce zero-trust RBAC: Accounts with pending, rejected, or disabled status
  // are strictly prohibited from viewing internal dashboards, student records, or marks.
  if (user && userProfile && userProfile.status !== 'approved') {
    return <UnauthorizedAccountView />;
  }

  const notifications = [
    {
      id: 'notif-1',
      title: 'Ratiba ya Mitihani ya Muhula Imepakiwa',
      time: 'Masaa 2 yaliyopita',
      category: 'Taaluma',
      body: 'Idara ya Taaluma imepakia ratiba rasmi ya majaribio na mitihani ya Kidato cha Kwanza hadi cha Nne.',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Uhakiki wa Malipo ya Ada & Vifaa',
      time: 'Siku 1 iliyopita',
      category: 'Fedha',
      body: 'Malipo ya benki CRDB, NMB na MKOMBOZI yanaendelea kuhakikiwa na ofisi ya Mhasibu.',
      read: true,
    },
    {
      id: 'notif-3',
      title: 'Michezo na Utunzaji Mazingira ya Shule',
      time: 'Siku 3 zilizopita',
      category: 'Shughuli',
      body: 'Wanafunzi wote wanashiriki zoezi la upandaji miti na michezo chini ya kaulimbiu "Tujiendeleze Sisi Wenyewe".',
      read: true,
    },
  ];

  const handleGoToSection = (sectionId: string, hash: string) => {
    setActiveView('website');
    window.location.hash = hash;
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#FFFFF0] text-[#102A43] font-sans flex flex-col">
      {/* Portal Navbar */}
      <PortalNavbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
        {/* Quick Institutional Section Switcher Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-slate-800">
              {language === 'sw' ? 'Vipengele vya Tovuti ya Shule:' : 'School Website Sections:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => handleGoToSection('teachers', '#teachers')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#102A43] hover:text-white text-xs font-bold text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>{language === 'sw' ? 'Walimu' : 'Teachers'}</span>
            </button>

            <button
              onClick={() => handleGoToSection('gallery', '#gallery')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#102A43] hover:text-white text-xs font-bold text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>{language === 'sw' ? 'Picha' : 'Gallery'}</span>
            </button>

            <button
              onClick={() => handleGoToSection('faq', '#faq')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#102A43] hover:text-white text-xs font-bold text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>FAQ</span>
            </button>

            <button
              onClick={() => handleGoToSection('location', '#location')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#102A43] hover:text-white text-xs font-bold text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>{language === 'sw' ? 'Ramani' : 'Location'}</span>
            </button>

            <button
              onClick={() => handleGoToSection('news', '#news')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-950 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>🔥 News</span>
            </button>

            <button
              onClick={() => setActiveView('website')}
              className="px-3 py-1.5 rounded-lg bg-[#102A43] hover:bg-[#0B1D2D] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ml-auto"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'sw' ? 'Fungua Tovuti Kuu' : 'Open Public Site'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Role View */}
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
            <h1 className="text-xl font-bold text-[#102A43] mb-2">School Announcements &amp; Circulars</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Ratiba ya Maandalizi ya Mitihani ya NECTA', date: '18 Machi 2026', cat: 'Taaluma', text: 'Watahiniwa wote wa Kidato cha Pili na cha Nne wanatakiwa kukamilisha maandalizi na kukusanya karatasi za majaribio kutoka ofisi za walimu wa masomo.' },
                { title: 'Mkutano Mkuu wa Wazazi na Walimu (PTA)', date: '12 Machi 2026', cat: 'Utawala', text: 'Mkutano mkuu uliopangwa kufanyika katika ukumbi wa shule kuanzia saa 03:00 asubuhi kwa ajili ya kutathmini maendeleo ya taaluma na nidhamu.' },
                { title: 'Kampeni ya Mazingira na Upandaji Miti Shuleni', date: '08 Machi 2026', cat: 'Bweni & Mazingira', text: 'Zoezi la kutunza mazingira na kupanda miti ya matunda chini ya kaulimbiu "Tujiendeleze Sisi Wenyewe" katika mzunguko wa shule.' },
              ].map((ann, i) => (
                <div key={i} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                    {ann.cat}
                  </span>
                  <h3 className="text-sm font-bold text-[#102A43] mt-2">{ann.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.text}</p>
                  <span className="text-[10px] text-[#C9A227] font-bold mt-3 block">{ann.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'notifications' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-xl font-bold text-[#102A43] mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#C9A227]" />
              <span>Portal Notifications</span>
            </h1>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !notif.read
                      ? 'bg-white border-amber-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#102A43]">{notif.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{notif.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#102A43] text-white font-bold text-xl flex items-center justify-center border-2 border-[#C9A227] shadow-sm">
                {(userProfile?.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#102A43]">{userProfile?.fullName || 'User'}</h1>
                <p className="text-xs text-slate-500 font-mono">{userProfile?.email || user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 uppercase tracking-wider">
                  Role: {userProfile?.role || 'parent'}
                </span>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Taasisi / Shule</span>
                <span className="font-bold text-[#102A43]">SHULE YA SEKONDARI UOMBONI</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Wito wa Shule</span>
                <span className="font-bold text-[#C9A227]">&ldquo;TUJIENDELEZE SISI WENYEWE&rdquo;</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Mahali</span>
                <span className="text-slate-800 font-medium">Marangu Magharibi, Moshi Vijijini, Kilimanjaro</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Hali ya Akaunti</span>
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {user?.emailVerified || userProfile?.emailVerified ? 'Akaunti Imethibitishwa' : 'Akaunti Ipo Hai'}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#102A43] border-t border-[#C9A227]/30 py-4 text-center text-xs text-[#FFFFF0]/80">
        <p>SHULE YA SEKONDARI UOMBONI • NECTA S0486 • Marangu Magharibi, Moshi, Kilimanjaro</p>
      </footer>
    </div>
  );
};
