import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { SchoolLogo } from './SchoolLogo';
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Lock,
  Users,
  ChevronRight,
  Globe,
  LogIn,
  LogOut,
  GraduationCap,
  ShieldCheck,
  Flame,
  FileText,
  FileSpreadsheet,
  Facebook,
  Youtube,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
  onOpenParentPortal?: () => void;
  onOpenStudentPortal?: () => void;
  onOpenStaffPortal?: () => void;
  onOpenAcademicPortal?: () => void;
  onOpenAdmin?: () => void;
  onOpenNews?: () => void;
  onOpenAdmissions?: () => void;
  onOpenAdmissionDocuments?: () => void;
  onOpenJoiningInstructions?: () => void;
  onOpenVituMuhimu?: () => void;
  onOpenWelcome?: () => void;
  onOpenLogin?: () => void;
  onOpenResultsEntry?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection = 'home',
  onNavigate,
  onOpenParentPortal,
  onOpenStudentPortal,
  onOpenStaffPortal,
  onOpenAcademicPortal,
  onOpenAdmin,
  onOpenNews,
  onOpenAdmissions,
  onOpenAdmissionDocuments,
  onOpenJoiningInstructions,
  onOpenVituMuhimu,
  onOpenWelcome,
  onOpenLogin,
  onOpenResultsEntry,
}) => {
  const { language, setLanguage } = useLanguage();
  const { user, userProfile, logout } = useAuth();
  const { schoolProfile, isAdminLoggedIn } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (sectionId === 'news' && onOpenNews) {
      onOpenNews();
      return;
    }
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { id: 'home', label: language === 'sw' ? 'Mwanzo' : 'Home' },
    { id: 'about', label: language === 'sw' ? 'Kuhusu' : 'About' },
    { id: 'academics', label: language === 'sw' ? 'Taaluma' : 'Academics' },
    { id: 'teachers', label: language === 'sw' ? 'Walimu' : 'Teachers' },
    { id: 'gallery', label: language === 'sw' ? 'Picha' : 'Gallery' },
    { id: 'faq', label: 'FAQ' },
    { id: 'location', label: language === 'sw' ? 'Ramani' : 'Location' },
    { id: 'contact', label: language === 'sw' ? 'Mawasiliano' : 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all overflow-x-clip">
      {/* Top Institutional Header Bar */}
      <div className="bg-[#102A43] text-[#FFFFF0] border-b border-[#C9A227]/20 text-[11px] sm:text-[12px] py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Contact Info */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <span className="hidden md:inline-flex items-center gap-1.5 font-medium text-[#FFFFF0]/90 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
              <span>{schoolProfile?.location || 'Marangu, Moshi, Kilimanjaro'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#FFFFF0]/90 font-medium shrink-0">
              <Phone className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
              <span>{schoolProfile?.phone || (schoolProfile?.phones && schoolProfile.phones[0]) || '+255 782 558 127'}</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[#FFFFF0]/80 truncate">
              <Mail className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
              <span>{schoolProfile?.email || 'uombonisec@gmail.com'}</span>
            </span>

            {/* Official Social Media Links */}
            <div className="hidden xl:inline-flex items-center gap-1.5 pl-2 border-l border-white/20">
              <a
                href="https://web.facebook.com/profile.php?id=61596072835470"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook Rasmi: Uomboni Secondary School"
                aria-label="Facebook"
                className="w-5 h-5 rounded-md flex items-center justify-center bg-white/10 hover:bg-[#1877F2] text-white transition-all hover:scale-110"
              >
                <Facebook className="w-3 h-3" />
              </a>
              <a
                href="https://www.youtube.com/@uombonisecondaryschool"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube Channel: @uombonisecondaryschool"
                aria-label="YouTube"
                className="w-5 h-5 rounded-md flex items-center justify-center bg-white/10 hover:bg-[#FF0000] text-white transition-all hover:scale-110"
              >
                <Youtube className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right: Quick Tools (Clean, only essential on mobile to prevent overflow) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {onOpenNews && (
              <button
                onClick={onOpenNews}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
                title="Habari na Matangazo ya Shule"
              >
                <span>{language === 'sw' ? 'Habari' : 'News'}</span>
              </button>
            )}
            {onOpenResultsEntry && (
              <button
                onClick={onOpenResultsEntry}
                className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded bg-[#c9a227] text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer shadow-xs"
                title="Lango Rasmi la Uingizaji wa Matokeo na Alama za Mitihani"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-950" />
                <span>Uingizaji wa Matokeo</span>
              </button>
            )}
            {/* Academic Portal Quick Link - Only visible to authenticated academic staff or admin */}
            {user && (userProfile?.role === 'admin' || userProfile?.role === 'teacher' || userProfile?.role === 'academic_master') && onOpenAcademicPortal && (
              <button
                onClick={onOpenAcademicPortal}
                className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded bg-[#c9a227] text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
                title="Lango la Taaluma na Mitihani (Academic Portal)"
              >
                <GraduationCap className="w-3.5 h-3.5 text-slate-950" />
                <span>Portal ya Taaluma</span>
              </button>
            )}
            {onOpenAdmissionDocuments && (
              <button
                onClick={onOpenAdmissionDocuments}
                id="topbar-student-admission-btn"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded bg-red-800 hover:bg-red-700 text-white cursor-pointer shadow-xs"
                title="Hati & Fomu Rasmi za Udahili"
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>UDAHILI 2026/2027</span>
              </button>
            )}
            <div className="hidden lg:inline-flex">
              <PWAInstallButton variant="navbar" />
            </div>
            <span className="hidden sm:inline text-[11px] font-semibold tracking-wider text-[#C9A227]">
              {schoolProfile?.nectaCode ? `NECTA CENTRE ${schoolProfile.nectaCode}` : 'NECTA CENTRE S0486'}
            </span>
            <span className="hidden sm:inline text-[#FFFFF0]/30">|</span>
            <button
              onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 sm:px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-[#FFFFF0] transition-colors cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3 h-3 text-[#C9A227]" />
              <span className="sm:hidden">{language === 'sw' ? 'EN' : 'SW'}</span>
              <span className="hidden sm:inline">{language === 'sw' ? 'English' : 'Kiswahili'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className={`w-full bg-[#FFFFFF] border-b transition-all ${
          isScrolled
            ? 'shadow-sm border-[#102A43]/10 py-2 sm:py-2.5'
            : 'border-[#102A43]/10 py-2.5 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3">
          {/* Logo & School Branding */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group min-w-0 flex-1 sm:flex-initial"
          >
            <SchoolLogo size="md" className="shrink-0" />
            <div className="min-w-0">
              <span className="block text-xs sm:text-base font-bold text-[#102A43] tracking-tight group-hover:text-[#102A43]/85 transition-colors truncate">
                {schoolProfile?.name || 'Uomboni Secondary School'}
              </span>
              <span className="block text-[10px] sm:text-[11px] text-[#C9A227] font-bold tracking-wide truncate">
                {schoolProfile?.slogan || schoolProfile?.sloganSw || 'Tujiendeleze sisi wenyewe'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links (XL screens and above) */}
          <div className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-2 py-1.5 text-[13px] font-medium transition-colors cursor-pointer rounded-md ${
                    isActive
                      ? 'text-[#102A43] font-bold border-b-2 border-[#C9A227] rounded-none'
                      : 'text-slate-700 hover:text-[#102A43] hover:bg-[#FFFFF0]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Tablet Quick Actions (sm to xl) - Only essential CTAs to preserve tablet layout without overflow */}
          <div className="hidden sm:flex xl:hidden items-center gap-2">
            {onOpenAdmissionDocuments && (
              <button
                onClick={onOpenAdmissionDocuments}
                className="liquid-btn liquid-btn-red inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black cursor-pointer shadow-xs"
                title="STUDENT ADMISSION"
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span className="tracking-wide">ADMISSION</span>
              </button>
            )}
            {!user && onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="liquid-btn liquid-btn-sepia inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Ingia</span>
              </button>
            )}
          </div>

          {/* Desktop Full Action Buttons (2XL / XL only) */}
          <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2">
            {onOpenNews && (
              <button
                id="nav-news-hot-btn"
                onClick={onOpenNews}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#102A43] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Habari na Matangazo ya Shule"
              >
                <span>{language === 'sw' ? 'Habari' : 'News'}</span>
              </button>
            )}

            {onOpenAdmissionDocuments && (
              <button
                id="nav-student-admission-btn"
                onClick={onOpenAdmissionDocuments}
                className="liquid-btn liquid-btn-red inline-flex items-center gap-1.5 px-3 2xl:px-4 py-2 text-xs font-black cursor-pointer shadow-md group"
                title="Hati & Fomu Rasmi za Udahili (Student Admission)"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span className="tracking-wide">STUDENT ADMISSION</span>
                </span>
              </button>
            )}

            {onOpenAdmin && (
              <button
                id="nav-admin-portal-btn"
                onClick={onOpenAdmin}
                className="liquid-btn liquid-btn-gold inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black cursor-pointer shadow-xs group"
                title="Lango la Utawala & Udahili (Administration)"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-950" />
                  <span>Utawala</span>
                  {(isAdminLoggedIn || userProfile?.role === 'admin') && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="Admin Active" />
                  )}
                </span>
              </button>
            )}

            {onOpenResultsEntry && (
              <button
                id="nav-results-entry-btn"
                onClick={onOpenResultsEntry}
                className="liquid-btn liquid-btn-gold inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black cursor-pointer shadow-xs"
                title="Lango Rasmi la Uingizaji wa Alama na Matokeo ya Mitihani"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-950" />
                  <span>Ingiza Matokeo</span>
                </span>
              </button>
            )}

            {user && (userProfile?.role === 'admin' || userProfile?.role === 'parent') && onOpenParentPortal && (
              <button
                id="nav-parent-portal-btn"
                onClick={onOpenParentPortal}
                className="liquid-btn liquid-btn-glass inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Parent Portal</span>
                </span>
              </button>
            )}

            {user && (userProfile?.role === 'admin' || userProfile?.role === 'teacher') && onOpenStaffPortal && (
              <button
                id="nav-staff-portal-btn"
                onClick={onOpenStaffPortal}
                className="liquid-btn liquid-btn-navy inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Staff Portal</span>
                </span>
              </button>
            )}

            <button
              id="nav-student-portal-btn"
              onClick={onOpenStudentPortal}
              className="liquid-btn liquid-btn-glass inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold cursor-pointer"
              title="Portal ya Mwanafunzi - Ingia kwa Majina Matatu"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Student Portal</span>
              </span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#F5EBD7] rounded-full text-xs text-[#704214] border border-[#704214]/20 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
                  <span className="font-bold truncate max-w-[110px]">{userProfile?.fullName || user.email?.split('@')[0]}</span>
                  <span className="text-[10px] uppercase font-bold text-[#704214]/70">({userProfile?.role || 'user'})</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="liquid-btn liquid-btn-sepia inline-flex items-center gap-1 px-3 py-2 text-xs font-bold cursor-pointer"
                  title="Ondoka kwenye mfumo (Logout)"
                >
                  <span className="relative z-10 flex items-center gap-1">
                    <LogOut className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Toka</span>
                  </span>
                </button>
              </div>
            ) : (
              <button
                id="nav-login-btn"
                onClick={onOpenLogin}
                className="liquid-btn liquid-btn-sepia inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold cursor-pointer"
                title="Ingia kwenye Mfumo (Login)"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Ingia</span>
                </span>
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex xl:hidden items-center gap-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#102A43] hover:bg-[#FFFFF0] transition-colors cursor-pointer border border-transparent hover:border-[#102A43]/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[72px] sm:top-[84px] z-50 bg-[#102A43]/50 backdrop-blur-xs xl:hidden overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-[#FFFFFF] border-b border-[#102A43]/15 max-h-[calc(100vh-84px)] overflow-y-auto px-4 sm:px-6 py-6 shadow-2xl animate-in slide-in-from-top duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full text-left px-3.5 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center justify-between ${
                    activeSection === link.id
                      ? 'bg-[#FFFFF0] text-[#102A43] font-bold border-l-3 border-[#C9A227]'
                      : 'text-slate-700 hover:bg-[#FFFFF0] hover:text-[#102A43]'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            <div className="pt-6 mt-4 border-t border-slate-200 flex flex-col gap-2.5">
              {onOpenNews && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNews();
                  }}
                  className="fire-news-btn w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
                  <span>Habari Mpya &amp; Matangazo (School News)</span>
                  <span className="px-1.5 py-0.5 rounded-xs bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                    HOT
                  </span>
                </button>
              )}

              {onOpenAdmissionDocuments && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmissionDocuments();
                  }}
                  id="mobile-student-admission-btn"
                  className="liquid-btn liquid-btn-red w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-black cursor-pointer shadow-md"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white" />
                    <span className="tracking-wide">STUDENT ADMISSION</span>
                  </span>
                </button>
              )}

              <PWAInstallButton variant="mobile" />

              {onOpenAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="liquid-btn liquid-btn-gold w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-black cursor-pointer shadow-md"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-950 shrink-0" />
                    <span>🏛️ Administration (Utawala &amp; Udahili)</span>
                  </span>
                </button>
              )}

              {onOpenResultsEntry && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenResultsEntry();
                  }}
                  className="liquid-btn liquid-btn-gold w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-black cursor-pointer shadow-md"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-950 shrink-0" />
                    <span>📝 Uingizaji wa Matokeo (Marks Entry)</span>
                  </span>
                </button>
              )}

              {user && (userProfile?.role === 'admin' || userProfile?.role === 'teacher' || userProfile?.role === 'academic_master') && onOpenAcademicPortal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAcademicPortal();
                  }}
                  className="liquid-btn liquid-btn-gold w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-black cursor-pointer shadow-md"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-950 shrink-0" />
                    <span>🎓 Portal ya Taaluma (Academic Portal)</span>
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenStudentPortal) onOpenStudentPortal();
                }}
                className="liquid-btn liquid-btn-glass w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#C9A227]" />
                  <span>Student Portal (Wanafunzi)</span>
                </span>
              </button>

              {user && (userProfile?.role === 'admin' || userProfile?.role === 'parent') && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenParentPortal) onOpenParentPortal();
                  }}
                  className="liquid-btn liquid-btn-glass w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C9A227]" />
                    <span>Parent Portal</span>
                  </span>
                </button>
              )}

              {user && (userProfile?.role === 'admin' || userProfile?.role === 'teacher') && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenStaffPortal) onOpenStaffPortal();
                  }}
                  className="liquid-btn liquid-btn-navy w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer shadow-xs"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#C9A227]" />
                    <span>Staff Portal</span>
                  </span>
                </button>
              )}

              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="liquid-btn liquid-btn-sepia w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-[#C9A227]" />
                    <span>Toka ({userProfile?.fullName || user.email?.split('@')[0]})</span>
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenLogin) onOpenLogin();
                  }}
                  className="liquid-btn liquid-btn-sepia w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LogIn className="w-4 h-4 text-[#C9A227]" />
                    <span>Ingia kwenye Akaunti (Login)</span>
                  </span>
                </button>
              )}

              {/* Mobile Social Links */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-3">
                <a
                  href="https://web.facebook.com/profile.php?id=61596072835470"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#1877F2] text-xs font-bold"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
                <a
                  href="https://www.youtube.com/@uombonisecondaryschool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-bold"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube Channel</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
