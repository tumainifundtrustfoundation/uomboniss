import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { useData } from '../context/DataContext';
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
  Flame,
  FileSpreadsheet,
  Edit3,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PolicyTab } from './TermsAndPrivacyModal';

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
  onOpenResultsEntry?: () => void;
  onOpenPolicy?: (tab: PolicyTab) => void;
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
  onOpenResultsEntry,
  onOpenPolicy,
}) => {
  const { schoolProfile } = useData();

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

  const handleOpenResultsEntryAction = () => {
    window.location.hash = '#uingizaji-matokeo';
    if (onOpenResultsEntry) {
      onOpenResultsEntry();
    } else if (onOpenAcademicPortal) {
      onOpenAcademicPortal();
    }
  };

  const handleOpenPolicyAction = (tab: PolicyTab) => {
    if (onOpenPolicy) {
      onOpenPolicy(tab);
    } else {
      window.location.hash = `#${tab}`;
    }
  };

  const schoolName = schoolProfile?.name || 'Uomboni Secondary School';
  const slogan = schoolProfile?.slogan || schoolProfile?.sloganSw || 'Tujiendeleze sisi wenyewe.';
  const nectaCode = schoolProfile?.nectaCode || 'S0486';
  const postalAddress = schoolProfile?.postalAddress || 'P.O. Box 361, Marangu - Moshi, Tanzania';
  const phone = schoolProfile?.phone || (schoolProfile?.phones && schoolProfile.phones.join(' / ')) || '0767 207 688 / +255 782 558 127';
  const email = schoolProfile?.email || 'uombonisecondary@gmail.com';

  return (
    <footer className="bg-[#102A43] text-[#FFFFF0] border-t border-[#C9A227]/30">
      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          {/* Col 1: School Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 border border-[#C9A227]/30 shadow-xs shrink-0">
                <SchoolLogo size="md" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {schoolName}
                </h3>
                <p className="text-xs text-[#C9A227] font-semibold">
                  NECTA Centre {nectaCode} · Marangu West
                </p>
              </div>
            </div>

            <p className="text-xs text-amber-300 font-bold tracking-wide">
              Motto: “{slogan}”
            </p>
            <p className="text-xs text-[#FFFFF0]/80 leading-relaxed max-w-sm">
              Shule ya Sekondari Uomboni chini ya Jimbo Katoliki la Moshi (Catholic Diocese of Moshi). Kituo cha NECTA {nectaCode}, Marangu-Moshi.
            </p>

            <div className="pt-2 text-xs space-y-2.5 text-[#FFFFF0]/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="block font-semibold text-white">{schoolName}</span>
                  <span className="text-[#FFFFF0]/85">{postalAddress}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:text-[#C9A227] transition-colors font-mono">{phone}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-[#C9A227] transition-colors font-mono">{email}</a>
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
                <button onClick={() => handleNav('home')} className="hover:text-[#C9A227] transition-colors cursor-pointer text-left">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-[#C9A227] transition-colors cursor-pointer text-left">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academics')} className="hover:text-[#C9A227] transition-colors cursor-pointer text-left">
                  Academics
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('teachers')} className="hover:text-[#C9A227] transition-colors cursor-pointer text-left">
                  Our Teachers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenNews) onOpenNews();
                    else handleNav('news');
                  }}
                  className="inline-flex items-center gap-1.5 text-amber-300 font-bold hover:text-white transition-colors cursor-pointer group text-left"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-500 animate-bounce" />
                  <span>Habari Mpya (News)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenAdmissionDocuments) onOpenAdmissionDocuments();
                    else window.location.hash = '#admission-documents';
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-amber-300 font-bold flex items-center gap-1.5 text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Hati za Udahili</span>
                </button>
              </li>
              {/* Prominent Results Entry Link */}
              <li>
                <button
                  onClick={handleOpenResultsEntryAction}
                  className="text-amber-300 hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                  title="Uingizaji wa Alama na Matokeo ya Mitihani"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Uingizaji wa Matokeo</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('gallery')} className="hover:text-[#C9A227] transition-colors cursor-pointer text-left">
                  Photo Gallery (Picha)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-[#C9A227] transition-colors cursor-pointer text-left">
                  Maswali (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-[#C9A227] transition-colors cursor-pointer text-left">
                  Mawasiliano (Contact)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Academics & Results (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
              Academics &amp; Results
            </h4>
            <ul className="space-y-2 text-xs text-[#FFFFF0]/85">
              <li>
                <button onClick={() => handleNav('academics')} className="hover:text-[#C9A227] transition-colors cursor-pointer text-left">
                  Form One &amp; Two
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academics')} className="hover:text-[#C9A227] transition-colors cursor-pointer text-left">
                  Form Three &amp; Four
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenResults) onOpenResults();
                    else handleNav('academics');
                  }}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer text-left"
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
                  className="hover:text-[#C9A227] transition-colors cursor-pointer text-left"
                >
                  Matokeo ya Mitihani ya Shule
                </button>
              </li>
              {/* Direct Uingizaji wa Matokeo Link (Selector 2) */}
              <li className="pt-2 border-t border-white/10">
                <button
                  onClick={handleOpenResultsEntryAction}
                  className="inline-flex items-start gap-2 text-amber-300 font-bold hover:text-white transition-colors cursor-pointer text-left group"
                  title="Lango Rasmi la Uingizaji wa Alama za Masomo kwa Walimu (Firebase Security Enforced)"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-amber-300 group-hover:text-white">Uingizaji wa Matokeo</span>
                      <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold uppercase tracking-wider">
                        Firebase
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-300/80 font-normal">🔒 Ulinzi wa Firebase (Walimu Pekee)</span>
                  </div>
                </button>
              </li>
              {/* Broadsheets za Madarasa Link (Selector 3) */}
              <li>
                <button
                  onClick={() => {
                    if (onOpenAcademicPortal) onOpenAcademicPortal();
                    else handleNav('academics');
                  }}
                  className="inline-flex items-start gap-2 text-emerald-400 font-semibold hover:text-white transition-colors cursor-pointer text-left group"
                  title="Jedwali kamili la matokeo na ufaulu wa darasa zima"
                >
                  <span className="shrink-0 mt-0.5">🎓</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-emerald-300 group-hover:text-white">Broadsheets za Madarasa</span>
                    <span className="text-[10px] text-[#FFFFF0]/70 font-normal">Jedwali kuu la ufaulu wa kidato</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenAdmin) onOpenAdmin();
                    else handleNav('about');
                  }}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer text-amber-300 font-semibold text-left"
                >
                  🏛️ Utawala (Administration)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Parents & Portals (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
              Parents &amp; Portals
            </h4>
            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenStudentPortal}
                className="w-full text-left px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Student Portal</span>
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
                title="Chumba cha Walimu (Private Staffroom)"
              >
                <span>Staff Portal</span>
                <KeyRound className="w-3.5 h-3.5 text-[#C9A227]" />
              </button>

              {/* Dedicated Uingizaji wa Matokeo Button (Selector 1) */}
              <button
                type="button"
                onClick={handleOpenResultsEntryAction}
                className="w-full text-left p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/50 hover:border-emerald-400 text-white flex items-center justify-between transition-all cursor-pointer shadow-sm group"
                title="Lango Rasmi la Walimu Kuingiza Alama za Mitihani - Ulinzi wa Firebase (Firebase Security Enforced)"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-stone-900 transition-colors">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-amber-300 group-hover:text-white transition-colors">
                        Ingiza Matokeo
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 shrink-0">
                        Walimu
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Firebase
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-300/90 font-medium truncate flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-emerald-400 shrink-0" /> Ulinzi wa Firebase • Kuweka alama &amp; mitihani
                    </span>
                  </div>
                </div>
                <Edit3 className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-0.5 group-hover:scale-110 transition-all shrink-0 ml-1" />
              </button>
            </div>

            <p className="text-[11px] text-[#FFFFF0]/60 pt-1 leading-relaxed">
              Official school records and teacher entries are strictly access-controlled via Firebase Security.
            </p>
          </div>

          {/* Col 5: POLICIES Section (Matching user screenshot exactly) */}
          <div className="lg:col-span-2 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                POLICIES
              </h4>
              <div className="w-8 h-[2.5px] bg-[#FDE047] mt-1.5 mb-3.5 rounded-full"></div>
            </div>
            <ul className="space-y-2.5 text-xs text-[#FFFFF0]/85">
              <li>
                <button
                  onClick={() => handleOpenPolicyAction('terms')}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer text-left block"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicyAction('privacy')}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer text-left block"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicyAction('refund')}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer text-left block"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicyAction('cookie')}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer text-left block"
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicyAction('content')}
                  className="hover:text-[#C9A227] transition-colors cursor-pointer text-left block"
                >
                  Content Submission Policy
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10 bg-[#0A1C2E] py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#FFFFF0]/70">
          <div className="text-center md:text-left">
            &copy; 2026 Uomboni Secondary School. All Rights Reserved. · NECTA S0486
          </div>

          {/* Policy quick shortcuts in footer copyright line */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[#FFFFF0]/80">
            <button
              onClick={() => handleOpenPolicyAction('terms')}
              className="hover:text-[#C9A227] transition-colors cursor-pointer"
            >
              Terms
            </button>
            <span>·</span>
            <button
              onClick={() => handleOpenPolicyAction('privacy')}
              className="hover:text-[#C9A227] transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <span>·</span>
            <button
              onClick={() => handleOpenPolicyAction('refund')}
              className="hover:text-[#C9A227] transition-colors cursor-pointer"
            >
              Refunds
            </button>
            <span>·</span>
            <button
              onClick={() => handleOpenPolicyAction('cookie')}
              className="hover:text-[#C9A227] transition-colors cursor-pointer"
            >
              Cookies
            </button>
            <span>·</span>
            <button
              onClick={() => handleOpenPolicyAction('content')}
              className="hover:text-[#C9A227] transition-colors cursor-pointer"
            >
              Content Submission
            </button>
            <span>·</span>
            <button
              onClick={handleOpenResultsEntryAction}
              className="text-amber-300 hover:text-white font-bold transition-colors cursor-pointer"
            >
              Uingizaji wa Matokeo
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#FFFFF0] hover:text-[#C9A227] transition-colors cursor-pointer font-semibold"
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
