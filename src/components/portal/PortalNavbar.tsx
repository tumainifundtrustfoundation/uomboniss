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
  ShieldAlert,
  ChevronDown,
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
  const { user, userProfile, logout, setActiveView, activeRoleDashboard, setActiveRoleDashboard } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const role = userProfile?.role || 'parent';
  const isAdmin = role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const roleLabels: { [key in UserRole]: { label: string; color: string } } = {
    student: { label: 'Student Portal', color: 'bg-[#F5EBD7] text-[#704214] border-[#C9A227]/40' },
    parent: { label: 'Parent Portal', color: 'bg-[#F5EBD7] text-[#704214] border-[#C9A227]/40' },
    teacher: { label: 'Teacher Portal', color: 'bg-[#F5EBD7] text-[#704214] border-[#C9A227]/40' },
    staff: { label: 'Staff Portal', color: 'bg-[#F5EBD7] text-[#704214] border-[#C9A227]/40' },
    admin: { label: 'Admin Control Center', color: 'bg-[#F5EBD7] text-[#704214] border-[#C9A227]/40' },
    bursar: { label: 'Bursar & Finance Desk', color: 'bg-[#F5EBD7] text-[#704214] border-[#C9A227]/40' },
    academic_master: { label: 'Academic Master Console', color: 'bg-[#F5EBD7] text-[#704214] border-[#C9A227]/40' },
    guest: { label: 'Guest Visitor', color: 'bg-[#F5EBD7] text-[#704214] border-[#C9A227]/40' },
  };

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#704214] border-b border-[#C9A227]/30 text-[#FFFFF0] sticky top-0 z-50">
      {/* Top micro bar for school motto and switch to website */}
      <div className="bg-[#58330F] border-b border-[#704214] px-4 py-1.5 text-[11px] flex items-center justify-between text-[#F5EBD7]/80">
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-[#C9A227]">TUJIENDELEZE SISI WENYEWE</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Education, Pray, Work</span>
          <span className="hidden md:inline">• Marangu Magharibi, Moshi</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick link to main website */}
          <button
            onClick={() => setActiveView('website')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFFFF0] hover:text-[#C9A227] hover:underline cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Public Website</span>
          </button>

          {/* Language toggle */}
          <div className="flex items-center gap-1 border-l border-[#704214] pl-2">
            <button
              onClick={() => setLanguage('sw')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                language === 'sw' ? 'bg-[#FFFFF0] text-[#704214]' : 'text-[#F5EBD7]'
              }`}
            >
              SW
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                language === 'en' ? 'bg-[#FFFFF0] text-[#704214]' : 'text-[#F5EBD7]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-md bg-[#FFFFF0] p-1 flex items-center justify-center">
                <SchoolLogo size="sm" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                    UOMBONI
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      roleLabels[activeRoleDashboard]?.color || roleLabels.parent.color
                    }`}
                  >
                    {roleLabels[activeRoleDashboard]?.label || 'Parent Portal'}
                  </span>
                </div>
                <p className="text-[10px] text-[#F5EBD7]/80 hidden sm:block">Digital School Management System</p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 relative cursor-pointer ${
                    isActive
                      ? 'bg-[#FFFFF0] text-[#704214] shadow-xs'
                      : 'text-[#F5EBD7] hover:bg-[#58330F] hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#C9A227] text-[#704214] font-bold text-[9px] flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 bg-[#58330F] hover:bg-[#FFFFF0] hover:text-[#704214] text-[#FFFFF0] text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer border border-[#C9A227]/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 md:hidden text-[#FFFFF0] hover:bg-[#58330F] rounded"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#58330F] border-t border-[#704214] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded flex items-center gap-2 ${
                  isActive ? 'bg-[#FFFFF0] text-[#704214]' : 'text-[#F5EBD7] hover:bg-[#704214]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
