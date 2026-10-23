import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  LogOut,
  User,
  LayoutDashboard,
  BookOpen,
  Megaphone,
  Award,
  Globe,
  Menu,
  X,
  Users,
  Image as ImageIcon,
  HelpCircle,
  MapPin,
  Flame,
  ArrowLeft,
} from 'lucide-react';
import { SchoolLogo } from '../SchoolLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../lib/firebase';

interface PortalNavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadNotificationsCount?: number;
}

export const PortalNavbar: React.FC<PortalNavbarProps> = ({
  currentTab,
  onSelectTab,
  unreadNotificationsCount = 3,
}) => {
  const { user, userProfile, logout, setActiveView, activeRoleDashboard } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = userProfile?.role || 'parent';

  const navItems = [
    { id: 'dashboard', label: language === 'sw' ? 'Dashibodi' : 'Dashboard', icon: LayoutDashboard },
    { id: 'academics', label: language === 'sw' ? 'Taaluma' : 'Academics', icon: BookOpen },
    { id: 'announcements', label: language === 'sw' ? 'Matangazo' : 'Announcements', icon: Megaphone },
    { id: 'results', label: language === 'sw' ? 'Matokeo' : 'Results', icon: Award },
    { id: 'notifications', label: language === 'sw' ? 'Taarifa' : 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    { id: 'profile', label: language === 'sw' ? 'Wasifu' : 'Profile', icon: User },
  ];

  const schoolSections = [
    { id: 'teachers', label: language === 'sw' ? 'Walimu' : 'Teachers', icon: Users, hash: '#teachers' },
    { id: 'gallery', label: language === 'sw' ? 'Picha' : 'Gallery', icon: ImageIcon, hash: '#gallery' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, hash: '#faq' },
    { id: 'location', label: language === 'sw' ? 'Ramani' : 'Location', icon: MapPin, hash: '#location' },
    { id: 'news', label: '🔥 News', icon: Flame, hash: '#news' },
  ];

  const roleLabels: { [key in UserRole]: { label: string; color: string } } = {
    student: { label: 'Student Portal', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' },
    parent: { label: 'Parent Portal', color: 'bg-blue-500/20 text-blue-300 border-blue-400/40' },
    teacher: { label: 'Teacher Portal', color: 'bg-amber-500/20 text-amber-300 border-amber-400/40' },
    staff: { label: 'Staff Portal', color: 'bg-amber-500/20 text-amber-300 border-amber-400/40' },
    admin: { label: 'Admin Control Center', color: 'bg-purple-500/20 text-purple-300 border-purple-400/40' },
    bursar: { label: 'Bursar & Finance Desk', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' },
    academic_master: { label: 'Academic Master Console', color: 'bg-amber-500/20 text-amber-300 border-amber-400/40' },
    guest: { label: 'Guest Visitor', color: 'bg-slate-500/20 text-slate-300 border-slate-400/40' },
  };

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleGoToSection = (sectionId: string, hash: string) => {
    setMobileMenuOpen(false);
    setActiveView('website');
    window.location.hash = hash;
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <nav className="bg-[#102A43] border-b border-[#C9A227]/30 text-[#FFFFF0] sticky top-0 z-50 shadow-md">
      {/* Top micro bar for school motto and switch to website */}
      <div className="bg-[#0B1D2D] border-b border-[#102A43] px-3 sm:px-6 py-1.5 text-[11px] flex items-center justify-between text-[#FFFFF0]/80">
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-[#C9A227]">TUJIENDELEZE SISI WENYEWE</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Education, Pray, Work</span>
          <span className="hidden md:inline">• Marangu Magharibi, Moshi</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick link to main website with all sections */}
          <button
            onClick={() => setActiveView('website')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>{language === 'sw' ? 'Rudi Kwenye Tovuti Kuu' : 'Return to Public Website'}</span>
          </button>

          {/* Language toggle */}
          <div className="flex items-center gap-1 border-l border-white/15 pl-2">
            <button
              onClick={() => setLanguage('sw')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                language === 'sw' ? 'bg-[#C9A227] text-slate-950' : 'text-[#FFFFF0]'
              }`}
            >
              SW
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                language === 'en' ? 'bg-[#C9A227] text-slate-950' : 'text-[#FFFFF0]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer min-w-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                <SchoolLogo size="sm" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-base font-bold text-white tracking-wide uppercase truncate">
                    UOMBONI
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      roleLabels[activeRoleDashboard]?.color || roleLabels.parent.color
                    }`}
                  >
                    {roleLabels[activeRoleDashboard]?.label || 'Parent Portal'}
                  </span>
                </div>
                <p className="text-[10px] text-[#C9A227] hidden sm:block font-medium">Digital School Management System</p>
              </div>
            </button>
          </div>

          {/* Core Portal Tabs */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 relative cursor-pointer ${
                    isActive
                      ? 'bg-[#C9A227] text-slate-950 font-black shadow-sm'
                      : 'text-slate-200 hover:bg-[#0B1D2D] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Jump to Website Sections (Walimu, Picha, FAQ, Ramani, News) */}
          <div className="hidden xl:flex items-center gap-1 border-l border-white/20 pl-2">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mr-1">Tovuti:</span>
            {schoolSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleGoToSection(sec.id, sec.hash)}
                className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveView('website')}
              className="hidden sm:inline-flex px-3 py-1.5 bg-[#C9A227] hover:bg-amber-300 text-slate-950 text-xs font-black rounded-lg transition-all items-center gap-1.5 cursor-pointer shadow-sm"
              title="Tazama tovuti kamili na vipengele vyote"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Tovuti Kuu</span>
            </button>

            <button
              onClick={() => logout()}
              className="px-2.5 sm:px-3 py-1.5 bg-[#0B1D2D] hover:bg-red-900/60 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-white/15"
              title="Ondoka kwenye akaunti"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 lg:hidden text-white hover:bg-white/10 rounded cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1D2D] border-t border-[#102A43] px-4 py-4 space-y-3 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top duration-200">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-1">
              Portal Tabs:
            </span>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between ${
                      isActive ? 'bg-[#C9A227] text-slate-950 font-bold' : 'text-slate-200 hover:bg-[#102A43]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold text-[9px]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-white/15">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-1">
              Vipengele vya Tovuti (School Sections):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {schoolSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleGoToSection(sec.id, sec.hash)}
                  className="w-full text-left px-3 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center gap-2"
                >
                  <sec.icon className="w-3.5 h-3.5 text-amber-300" />
                  <span>{sec.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/15">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveView('website');
              }}
              className="w-full py-2.5 px-3 rounded-lg bg-[#C9A227] hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>Rudi Kwenye Tovuti Kuu</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
