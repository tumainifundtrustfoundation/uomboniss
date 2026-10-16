import React from 'react';
import {
  Lock,
  UserCheck,
  ClipboardList,
  GraduationCap,
  Calendar,
  Layers,
  FileBarChart,
  Bell,
  ArrowRight
} from 'lucide-react';

interface SchoolManagementSectionProps {
  onOpenStaffPortal?: () => void;
}

export const SchoolManagementSection: React.FC<SchoolManagementSectionProps> = ({
  onOpenStaffPortal,
}) => {
  const managementFeatures = [
    {
      title: 'Teacher Login',
      description: 'Secure, role-based authentication for verified teaching faculty and academic department heads.',
      icon: UserCheck,
    },
    {
      title: 'Attendance',
      description: 'Daily and session roll-call recording for class teachers, morning assemblies, and boarding roll-call.',
      icon: ClipboardList,
    },
    {
      title: 'Student Records',
      description: 'Comprehensive demographic data, admission records, guardian contacts, and student conduct histories.',
      icon: Layers,
    },
    {
      title: 'Academic Results',
      description: 'Subject marks entry, CA score calculation, terminal grading, and NECTA-aligned rank compilation.',
      icon: GraduationCap,
    },
    {
      title: 'Timetable',
      description: 'Master school schedule, subject period allocations, room assignments, and teacher rotation tracking.',
      icon: Calendar,
    },
    {
      title: 'Class Management',
      description: 'Streams, class master allocations, student rosters, subject enrollments, and academic directives.',
      icon: Layers,
    },
    {
      title: 'Reports',
      description: 'Automated terminal broadsheets, report card generation, subject performance analysis, and audits.',
      icon: FileBarChart,
    },
    {
      title: 'Announcements',
      description: 'Internal staff memos, academic directives from the Academic Master, and department circulars.',
      icon: Bell,
    },
  ];

  return (
    <section id="management" className="py-20 sm:py-24 bg-white border-t border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider block mb-2">
            Staff &amp; Administration
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight">
            School Management System
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed">
            A centralized digital management workspace built for Uomboni Secondary School teachers, department leaders, and administrative officers to streamline daily operations, academic grading, and records.
          </p>
        </div>

        {/* Staff Portal CTA Card */}
        <div className="mt-10 p-6 sm:p-8 rounded-lg bg-[#102A43] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C9A227] uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Restricted Administration &amp; Faculty Access</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Faculty &amp; Staff Portal Access
            </h3>
            <p className="text-xs sm:text-sm text-[#FFFFF0]/80 leading-relaxed">
              Authorized school staff, teachers, bursar, and administrators can sign in using school credentials to manage classes, record continuous assessments, and generate official academic reports.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              id="management-open-staff-portal-btn"
              onClick={onOpenStaffPortal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-md bg-[#FFFFF0] text-[#102A43] font-bold text-sm hover:bg-white transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 group"
            >
              <Lock className="w-4 h-4 text-[#C9A227]" />
              <span>Staff Portal</span>
              <ArrowRight className="w-4 h-4 text-[#C9A227] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 8 Features Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {managementFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-[#FFFFF0] p-6 rounded-lg border border-[#102A43]/10 flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-md bg-white border border-[#102A43]/15 flex items-center justify-center text-[#102A43] mb-4">
                    <Icon className="w-4 h-4 text-[#102A43]" />
                  </div>
                  <h4 className="text-base font-bold text-[#102A43]">
                    {feat.title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="mt-10 text-center text-xs text-slate-500">
          Access to student records and grading modules requires multi-factor authorized institutional credentials in compliance with National Educational Data Protection standards.
        </div>
      </div>
    </section>
  );
};
