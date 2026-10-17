import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
  onOpenParentPortal?: () => void;
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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection = 'home',
  onNavigate,
  onOpenParentPortal,
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
}) => {
  const { language, setLanguage } = useLanguage();
  const { user, userProfile, logout } = useAuth();
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
    { id: 'about', label: language === 'sw' ? 'Kuhusu Sisi' : 'About' },
    { id: 'academics', label: language === 'sw' ? 'Taaluma' : 'Academics' },
    { id: 'teachers', label: language === 'sw' ? 'Walimu' : 'Teachers' },
    { id: 'gallery', label: language === 'sw' ? 'Picha' : 'Gallery' },
    { id: 'faq', label: 'FAQ' },
    { id: 'location', label: language === 'sw' ? 'Ramani' : 'Location' },
    { id: 'news', label: '🔥 News' },
    { id: 'contact', label: language === 'sw' ? 'Mawasiliano' : 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Top Institutional Header Bar */}
      <div className="bg-[#102A43] text-[#FFFFF0] border-b border-[#C9A227]/20 text-[12px] py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-medium text-[#FFFFF0]/90">
              <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
              Marangu, Moshi, Kilimanjaro
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#FFFFF0]/90">
              <Phone className="w-3.5 h-3.5 text-[#C9A227]" />
              +255 782 558 127
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[#FFFFF0]/80">
              <Mail className="w-3.5 h-3.5 text-[#C9A227]" />
              uombonisec@gmail.com
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenNews && (
              <button
                onClick={onOpenNews}
                className="fire-news-btn liquid-btn inline-flex items-center gap-1.5 px-3.5 py-1 text-[11px] font-black text-white border border-amber-300/80 transition-all cursor-pointer group"
                title="Habari Mpya & Matangazo ya Shule (School Hot News)"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className="relative flex items-center justify-center">
                    <span className="absolute -inset-1 rounded-full bg-yellow-400 blur-xs opacity-75 animate-ping" />
                    <Flame className="w-3.5 h-3.5 text-yellow-100 fill-yellow-400 flame-spark drop-shadow-[0_0_6px_rgba(255,200,0,1)]" />
                  </span>
                  <span className="drop-shadow-xs">{language === 'sw' ? 'Habari Mpya' : 'Hot News'}</span>
                  <span className="px-1 py-0.2 rounded-full bg-yellow-300 text-slate-950 text-[8px] font-black uppercase">
                    HOT
                  </span>
                </span>
              </button>
            )}
            {onOpenWelcome && (
              <button
                onClick={onOpenWelcome}
                className="liquid-btn liquid-btn-frosted hidden lg:inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 cursor-pointer"
                title="Welcome Screen (Animated Embossed Login)"
              >
                <span className="relative z-10 flex items-center gap-1">✨ Welcome Screen</span>
              </button>
            )}
            {onOpenAcademicPortal && (
              <button
                onClick={onOpenAcademicPortal}
                className="liquid-btn liquid-btn-gold hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black px-3.5 py-1 cursor-pointer"
                title="Lango la Taaluma na Mitihani (Academic Portal)"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-950" />
                  <span>🎓 Portal ya Taaluma</span>
                </span>
              </button>
            )}
            {onOpenAdmissionDocuments && (
              <button
                onClick={onOpenAdmissionDocuments}
                id="topbar-student-admission-btn"
                className="liquid-btn liquid-btn-red inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black text-white cursor-pointer shadow-md group"
                title="Hati & Fomu Rasmi za Udahili (Student Admission)"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span className="tracking-wide">STUDENT ADMISSION</span>
                </span>
              </button>
            )}
            <PWAInstallButton variant="navbar" />
            <span className="text-[11px] font-semibold tracking-wider text-[#C9A227]">
              NECTA CENTRE S0486
            </span>
            <span className="text-[#FFFFF0]/30">|</span>
            <button
              onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
              className="liquid-btn liquid-btn-frosted inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 text-[#FFFFF0] cursor-pointer"
              title="Change Language"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[#C9A227]" />
                <span>{language === 'sw' ? 'English' : 'Kiswahili'}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className={`w-full bg-[#FFFFFF] border-b transition-all ${
          isScrolled
            ? 'shadow-sm border-[#102A43]/10 py-2.5'
            : 'border-[#102A43]/10 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo & School Branding */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <SchoolLogo size="md" />
            <div>
              <span className="block text-sm sm:text-base font-bold text-[#102A43] tracking-tight group-hover:text-[#102A43]/85 transition-colors">
                Uomboni Secondary School
              </span>
              <span className="block text-[11px] text-[#C9A227] font-bold tracking-wide">
                Tujiendeleze sisi wenyewe
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-2.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer rounded-md ${
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

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {onOpenNews && (
              <button
                id="nav-news-hot-btn"
                onClick={onOpenNews}
                className="fire-news-btn liquid-btn relative group inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-white border border-amber-300/80 transition-all cursor-pointer overflow-hidden"
                title="Habari Mpya & Matangazo ya Shule (School Hot News)"
              >
                {/* Glowing flame aura */}
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 via-orange-400/40 to-red-600/30 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />

                <span className="relative z-10 flex items-center gap-2">
                  {/* Animated dancing burning flame */}
                  <span className="relative flex items-center justify-center">
                    <span className="absolute -inset-1 rounded-full bg-yellow-300 blur-xs opacity-80 animate-ping" />
                    <Flame className="w-4 h-4 text-yellow-100 fill-yellow-400 flame-spark drop-shadow-[0_0_10px_rgba(255,215,0,1)]" />
                  </span>

                  <span className="font-black tracking-wider uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                    {language === 'sw' ? 'Habari' : 'News'}
                  </span>

                  <span className="px-1.5 py-0.2 rounded-full bg-yellow-300 text-slate-950 text-[9px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                    🔥 HOT
                  </span>
                </span>
              </button>
            )}

            {onOpenAdmissionDocuments && (
              <button
                id="nav-student-admission-btn"
                onClick={onOpenAdmissionDocuments}
                className="liquid-btn liquid-btn-red inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black cursor-pointer shadow-md group"
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
                className="liquid-btn liquid-btn-gold inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black cursor-pointer"
                title="Lango la Utawala & Udahili (Administration)"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-950" />
                  <span>Administration</span>
                </span>
              </button>
            )}

            <button
              id="nav-parent-portal-btn"
              onClick={onOpenParentPortal}
              className="liquid-btn liquid-btn-glass inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Parent Portal</span>
              </span>
            </button>

            <button
              id="nav-staff-portal-btn"
              onClick={onOpenStaffPortal}
              className="liquid-btn liquid-btn-navy inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Staff Portal</span>
              </span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#F5EBD7] rounded-full text-xs text-[#704214] border border-[#704214]/20 shadow-xs">
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
                className="liquid-btn liquid-btn-sepia inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer"
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
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#102A43] hover:bg-[#FFFFF0] transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[88px] z-50 bg-[#102A43]/40 backdrop-blur-xs xl:hidden">
          <div className="bg-[#FFFFFF] border-b border-[#102A43]/15 max-h-[85vh] overflow-y-auto px-4 py-6 shadow-xl animate-in slide-in-from-top duration-200">
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
                  className="fire-news-btn liquid-btn w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-black text-white border border-amber-300/80 transition-all cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="relative flex items-center justify-center">
                      <span className="absolute -inset-1 rounded-full bg-yellow-300 blur-xs opacity-80 animate-ping" />
                      <Flame className="w-4 h-4 text-yellow-100 fill-yellow-400 flame-spark drop-shadow-[0_0_10px_rgba(255,215,0,1)]" />
                    </span>
                    <span className="drop-shadow-xs">🔥 Habari Mpya &amp; Matangazo (Hot News)</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-yellow-300 text-slate-950 text-[9px] font-black animate-pulse">
                      HOT
                    </span>
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

              {onOpenWelcome && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWelcome();
                  }}
                  className="liquid-btn liquid-btn-frosted !text-stone-900 !bg-stone-100 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer border border-slate-300 shadow-xs"
                >
                  <span className="relative z-10">✨ Welcome Screen (Embossed Login)</span>
                </button>
              )}

              {onOpenAcademicPortal && (
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
                  if (onOpenParentPortal) onOpenParentPortal();
                }}
                className="liquid-btn liquid-btn-glass w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C9A227]" />
                  <span>Parent Portal</span>
                </span>
              </button>

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
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
