import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Users,
  GraduationCap,
  Award,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

interface QuickStatsSectionProps {
  onNavigate?: (sectionId: string) => void;
}

export const QuickStatsSection: React.FC<QuickStatsSectionProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { students, teachers, enrollmentStats, schoolProfile } = useData();

  const totalStudents = students.length > 0
    ? `${students.length}+`
    : enrollmentStats && enrollmentStats.length > 0
    ? `${enrollmentStats.reduce((acc, curr) => acc + (curr.total || 0), 0)}+`
    : '160+';

  const totalTeachers = teachers.length > 0 ? `${teachers.length}+` : '15+';
  const establishedYear = schoolProfile?.establishedYear || 1985;
  const legacyYears = `${new Date().getFullYear() - establishedYear}+`;

  const stats = [
    {
      id: 'students',
      icon: Users,
      value: totalStudents,
      labelSw: 'Wanafunzi Waliosajiliwa',
      labelEn: 'Enrolled Students',
      subSw: 'Bweni na Kutwa (Kidato 1 - 4)',
      subEn: 'Boarding & Day (Form 1 - 4)',
      color: 'text-white',
      bgGradient: 'bg-blue-800/40',
      borderColor: 'border-blue-700/50'
    },
    {
      id: 'teachers',
      icon: GraduationCap,
      value: totalTeachers,
      labelSw: 'Walimu Mahiri & Wataalamu',
      labelEn: 'Dedicated Teaching Faculty',
      subSw: 'Wenye Shahada & Uzoefu Mkubwa',
      subEn: 'Degreed & Certified Educators',
      color: 'text-blue-200',
      bgGradient: 'bg-blue-800/40',
      borderColor: 'border-blue-700/50'
    },
    {
      id: 'success',
      icon: Award,
      value: '100%',
      labelSw: 'Ufaulu wa Mitihani ya NECTA',
      labelEn: 'NECTA CSEE Pass Rate',
      subSw: 'Ufaulu thabiti CSEE & FTNA (S0486)',
      subEn: 'Consistent CSEE & FTNA Passes (S0486)',
      color: 'text-white',
      bgGradient: 'bg-blue-800/40',
      borderColor: 'border-blue-700/50'
    },
    {
      id: 'years',
      icon: Calendar,
      value: legacyYears,
      labelSw: 'Miaka ya Ubora & Uzoefu',
      labelEn: 'Years of Academic Legacy',
      subSw: `Tangu ${establishedYear} • NECTA tangu 1988`,
      subEn: `Founded ${establishedYear} • NECTA since 1988`,
      color: 'text-blue-200',
      bgGradient: 'bg-blue-800/40',
      borderColor: 'border-blue-700/50'
    }
  ];

  return (
    <section id="quick-stats" className="relative -mt-8 sm:-mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#0b2545] text-white rounded-xl p-6 sm:p-8 border border-blue-900 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-blue-800/60">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className={`flex flex-col items-center sm:items-start text-center sm:text-left ${
                  idx > 0 ? 'pt-6 sm:pt-0 sm:pl-6 lg:pl-8' : ''
                } group`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgGradient} ${stat.borderColor} border flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className={`text-3xl sm:text-4xl font-bold ${stat.color} tracking-tight font-mono`}>
                    {stat.value}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {language === 'sw' ? stat.labelSw : stat.labelEn}
                </h3>

                <p className="text-xs text-blue-200/80 mt-1 font-medium">
                  {language === 'sw' ? stat.subSw : stat.subEn}
                </p>
              </div>
            );
          })}
        </div>

        {/* Small bottom note */}
        <div className="mt-6 pt-5 border-t border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-200/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-300 shrink-0" />
            <span>
              {language === 'sw'
                ? 'Shule inatambulika rasmi na Wizara ya Elimu, Sayansi na Teknolojia (NECTA S0486)'
                : 'Accredited by the Ministry of Education, Science & Technology (NECTA S0486)'}
            </span>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('academics')}
              className="text-white hover:text-blue-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{language === 'sw' ? 'Tazama Matokeo ya NECTA na Mitihani →' : 'View NECTA & Academic Results →'}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
