import React from 'react';
import {
  Users,
  Bell,
  Calendar,
  FileText,
  Phone,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';

interface ParentsGuardiansSectionProps {
  onOpenParentPortal?: () => void;
  onOpenCalendar?: () => void;
  onOpenAdmissions?: () => void;
}

export const ParentsGuardiansSection: React.FC<ParentsGuardiansSectionProps> = ({
  onOpenParentPortal,
  onOpenCalendar,
  onOpenAdmissions,
}) => {
  const announcements = [
    {
      title: 'Kufungua Shule & Muhula wa Masomo 2026',
      date: 'Januari 2026',
      category: 'Calendar',
      summary: 'Wanafunzi wote wa bweni na kutwa wanapaswa kuripoti shuleni kwa wakati wakiwa na vifaa kamili na sare rasmi za shule.',
    },
    {
      title: 'Mkutano Mkuu wa Wazazi na Walimu (PTA)',
      date: 'Machi 2026',
      category: 'Meeting',
      summary: 'Tathmini ya maendeleo ya kitaaluma, nidhamu, na miradi ya uboreshaji wa mazingira ya kujifunzia na malazi ya wanafunzi.',
    },
    {
      title: 'Ratiba ya Mitihani ya Robo Muhula & Mock',
      date: 'Aprili 2026',
      category: 'Academic',
      summary: 'Ripoti za maendeleo ya kitaaluma zitatumwa moja kwa moja kupitia Parent Portal baada ya masahihisho kukamilika.',
    },
  ];

  const parentResources = [
    {
      title: 'School Announcements',
      description: 'Official circulars and directives from the Headmaster’s office regarding school opening, holidays, and events.',
      icon: Bell,
    },
    {
      title: 'Academic Information',
      description: 'Termly grading criteria, continuous assessment schedules, homework guidelines, and academic counseling.',
      icon: FileText,
    },
    {
      title: 'School Calendar',
      description: 'Official schedule of academic terms, midterm departures, designated parent visiting Sundays, and exams.',
      icon: Calendar,
    },
    {
      title: 'Important Notices',
      description: 'Boarding health protocols, student medical requirements, dispensary procedures, and dormitory regulations.',
      icon: AlertCircle,
    },
    {
      title: 'Communication Channels',
      description: 'Direct phone lines to the Second Master, Academic Master, Patron/Matron, and scheduled teacher consultations.',
      icon: Phone,
    },
    {
      title: 'Official Documents',
      description: 'Downloadable Joining Instructions, fee payment schedules, bank deposit accounts (CRDB/NMB), and uniform guidelines.',
      icon: Download,
    },
  ];

  return (
    <section id="parents" className="py-20 sm:py-24 bg-white border-t border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold text-[#C9A227] tracking-wider block mb-2 uppercase">
            Family &amp; School Partnership
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
            Parents &amp; Guardians
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-700 leading-[1.75] font-normal">
            We value strong, transparent collaboration with parents and guardians to support the moral formation and academic excellence of our students.
          </p>
        </div>

        {/* High Visibility: Parent Portal Primary Access Card */}
        <div className="mt-10 p-6 sm:p-8 rounded-lg bg-[#FFFFF0] border-2 border-[#102A43] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C9A227]">
              <Users className="w-4 h-4 text-[#C9A227]" />
              <span>Official Parent Self-Service System</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#102A43]">
              Access the Parent Portal
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-[1.7] font-normal">
              Log in to view your child&apos;s academic reports, term examination scores, attendance records, school fee balance, and direct circulars from school administration.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              id="parents-section-portal-btn"
              onClick={onOpenParentPortal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-md bg-[#102A43] text-white font-semibold text-sm hover:bg-[#0A1C2E] transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 group"
            >
              <span>Open Parent Portal</span>
              <ArrowRight className="w-4 h-4 text-[#C9A227] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 6 Key Informational Modules */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold text-[#102A43] tracking-wide mb-6">
            Parent Information &amp; Services
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parentResources.map((res) => {
              const Icon = res.icon;
              return (
                <div
                  key={res.title}
                  className="bg-white p-6 rounded-lg border border-slate-200 hover:border-[#102A43]/30 transition-colors shadow-xs"
                >
                  <div className="w-8 h-8 rounded-md bg-[#FFFFF0] border border-[#C9A227]/40 flex items-center justify-center text-[#102A43] mb-4">
                    <Icon className="w-4 h-4 text-[#102A43]" />
                  </div>
                  <h4 className="text-base font-bold text-[#102A43]">
                    {res.title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {res.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Notices Feed */}
        <div className="mt-16 bg-[#FFFFF0] p-6 sm:p-8 rounded-lg border border-[#102A43]/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#102A43]">
                Important Notices &amp; Circulars
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current updates for the 2026 academic calendar
              </p>
            </div>
            {onOpenAdmissions && (
              <button
                onClick={onOpenAdmissions}
                className="text-xs font-semibold text-[#102A43] hover:text-[#C9A227] underline transition-colors cursor-pointer"
              >
                Download Joining Instructions
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {announcements.map((item) => (
              <div
                key={item.title}
                className="bg-white p-5 rounded-md border border-slate-200 text-xs text-slate-600 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                    <span className="text-[#C9A227] font-bold">{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                  <h4 className="font-bold text-[#102A43] text-sm mb-2">
                    {item.title}
                  </h4>
                  <p className="leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
