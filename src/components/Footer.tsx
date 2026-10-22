import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Lock,
  KeyRound,
  Users,
  Award,
  ArrowUp,
  Facebook,
  Youtube,
  MessageCircle,
  FileText,
  Flame
} from 'lucide-react';

interface FooterProps {
  onNavigate?: (sectionId: string) => void;
  onOpenStaffPortal?: () => void;
  onOpenParentPortal?: () => void;
  onOpenStudentPortal?: () => void;
  onOpenAcademicPortal?: () => void;
  onOpenAdmin?: () => void;
  onOpenNews?: () => void;
  onOpenAdmissions?: () => void;
  onOpenAdmissionDocuments?: () => void;
  onOpenJoiningInstructions?: () => void;
  onOpenVituMuhimu?: () => void;
  onOpenResults?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenStaffPortal,
  onOpenParentPortal,
  onOpenStudentPortal,
  onOpenAcademicPortal,
  onOpenAdmin,
  onOpenNews,
  onOpenAdmissions,
  onOpenAdmissionDocuments,
  onOpenJoiningInstructions,
  onOpenVituMuhimu,
  onOpenResults,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (sectionId: string) => {
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#102A43] text-[#FFFFF0] border-t border-[#C9A227]/30">
      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: School Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 border border-[#C9A227]/30 shadow-xs shrink-0">
                <SchoolLogo size="md" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Uomboni Secondary School
                </h3>
                <p className="text-xs text-[#C9A227] font-semibold">
                  NECTA Centre S0486 · Marangu West
                </p>
              </div>
            </div>

            <p className="text-xs text-amber-300 font-bold tracking-wide">
              Motto: “Tujiendeleze sisi wenyewe.”
            </p>
            <p className="text-xs text-[#FFFFF0]/80 leading-relaxed max-w-sm">
              Shule ya Sekondari Uomboni chini ya Jimbo Katoliki la Moshi (Catholic Diocese of Moshi). Kituo cha NECTA S0486, Marangu-Moshi.
            </p>

            <div className="pt-2 text-xs space-y-2.5 text-[#FFFFF0]/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="block font-semibold text-white">Uomboni Secondary School</span>
                  <span className="text-[#FFFFF0]/85">P.O. Box 361, Marangu - Moshi, Tanzania</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                <a href="tel:+255767207688" className="hover:text-[#C9A227] transition-colors font-mono">0767 207 688 / +255 782 558 127</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                <a href="mailto:uombonisecondary@gmail.com" className="hover:text-[#C9A227] transition-colors font-mono">uombonisecondary@gmail.com</a>
              </div>
            </div>

            {/* Social media links */}
            <div className="pt-3 flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-md bg-white/10 hover:bg-[#C9A227] hover:text-[#102A43] text-[#FFFFF0] flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-md bg-white/10 hover:bg-[#C9A227] hover:text-[#102A43] text-[#FFFFF0] flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/255782558127"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-md bg-white/10 hover:bg-[#C9A227] hover:text-[#102A43] text-[#FFFFF0] flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-[#FFFFF0]/85">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academics')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Academics
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('teachers')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Our Teachers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenNews) onOpenNews();
                    else handleNav('news');
                  }}
                  className="inline-flex items-center gap-1.5 text-amber-300 font-bold hover:text-white transition-colors cursor-pointer group"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-500 animate-bounce" />
                  <span>Habari Mpya (Hot News)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenAdmissionDocuments) onOpenAdmissionDocuments();
                    else window.location.hash = '#admission-documents';
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-amber-300 font-bold flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                  <span>Hati za Udahili (Admission Docs)</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('gallery')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Photo Gallery (Picha)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Maswali Yanayoulizwa (FAQ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenAdmin) onOpenAdmin();
                    else handleNav('about');
                  }}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer text-amber-300 font-semibold"
                >
                  Administration (Utawala)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('location')} className="hover:text-[#C9A227] transition-colors cursor-pointer text-amber-300 font-semibold flex items-center gap-1">
                  <span>📍 Ramani ya Shule (Campus Map)</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Mawasiliano (Contact Us)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Academics (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
              Academics
            </h4>
            <ul className="space-y-2 text-xs text-[#FFFFF0]/85">
              <li>
                <button onClick={() => handleNav('academics')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Form One
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academics')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Form Two (FTNA)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academics')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Form Three
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academics')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Form Four (CSEE)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academics')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Science &amp; ICT
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academics')} className="hover:text-[#C9A227] transition-colors cursor-pointer">
                  Languages &amp; Arts
                </button>
              </li>
              <li className="pt-1.5 border-t border-white/10">
                <button
                  onClick={() => {
                    if (onOpenAcademicPortal) onOpenAcademicPortal();
                    else handleNav('academics');
                  }}
                  className="inline-flex items-center gap-1.5 text-amber-300 font-bold hover:text-white transition-colors cursor-pointer"
                >
                  <span>🎓 Portal ya Taaluma (Broadsheets)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Administration & Examination Results (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
              Administration &amp; Results
            </h4>
            <ul className="space-y-2 text-xs text-[#FFFFF0]/85">
              <li>
                <button
                  onClick={() => {
                    if (onOpenAdmin) onOpenAdmin();
                    else handleNav('about');
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-amber-300 font-bold flex items-center gap-1.5"
                >
                  <span>🏛️ Jopo la Utawala (Administration)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenResults) onOpenResults();
                    else handleNav('academics');
                  }}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer"
                >
                  Matokeo ya NECTA (S0486)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenResults) onOpenResults();
                    else handleNav('academics');
                  }}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer"
                >
                  Matokeo ya Mitihani ya Shule
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenStaffPortal) onOpenStaffPortal();
                  }}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer"
                >
                  Lango la Walimu (Staff Portal)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenParentPortal) onOpenParentPortal();
                  }}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer"
                >
                  Lango la Wazazi (Parent Portal)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Parents & Portals (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
              Parents &amp; Portals
            </h4>
            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenStudentPortal}
                className="w-full text-left px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Student Portal (Wanafunzi)</span>
                <GraduationCap className="w-3.5 h-3.5 text-[#C9A227]" />
              </button>
              <button
                onClick={onOpenParentPortal}
                className="w-full text-left px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Parent Portal</span>
                <Users className="w-3.5 h-3.5 text-[#C9A227]" />
              </button>

              <button
                onClick={onOpenStaffPortal}
                className="w-full text-left px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer"
                title="Chumba cha Walimu (Private Staffroom) — Lango la Ndani la Watumishi"
              >
                <span>Chumba cha Walimu (Staffroom)</span>
                <KeyRound className="w-3.5 h-3.5 text-[#C9A227]" />
              </button>
            </div>

            <p className="text-[11px] text-[#FFFFF0]/60 pt-2 leading-relaxed">
              Official school records and teacher entries are strictly access-controlled.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10 bg-[#0A1C2E] py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFFFF0]/70">
          <div>
            &copy; 2026 Uomboni Secondary School. All Rights Reserved.
          </div>

          <div className="flex items-center gap-6">
            <span>NECTA Registration: S0486</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#FFFFF0] hover:text-[#C9A227] transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#C9A227]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
