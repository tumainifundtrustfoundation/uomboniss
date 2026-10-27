import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GraduationCap, Users, Lock, BookOpen } from 'lucide-react';

interface AcademicsSectionProps {
  onOpenAdmissions?: () => void;
  onOpenResults?: () => void;
  onOpenAcademicPortal?: () => void;
  onOpenParentPortal?: () => void;
}

export const AcademicsSection: React.FC<AcademicsSectionProps> = ({
  onOpenResults,
  onOpenAcademicPortal,
  onOpenParentPortal,
}) => {
  const { language } = useLanguage();

  const forms = [
    {
      form: language === 'sw' ? 'Kidato cha Kwanza' : 'Form One',
      focus: language === 'sw' ? 'Misingi na Mapokezi' : 'Foundations & Transition',
      description: language === 'sw'
        ? 'Kujenga misingi thabiti ya masomo ya sekondari, hisabati, sayansi, lugha na stadi za kujisomea.'
        : 'Foundational secondary stage covering sciences, basic mathematics, English, Kiswahili, and study skills.',
    },
    {
      form: language === 'sw' ? 'Kidato cha Pili' : 'Form Two',
      focus: language === 'sw' ? 'Tathmini ya Kitaifa (FTNA)' : 'FTNA National Assessment',
      description: language === 'sw'
        ? 'Uimarishaji wa mada za msingi na maandalizi ya mtihani wa taifa wa kidato cha pili (NECTA FTNA).'
        : 'Core syllabus mastery and preparation for the National Form Two Assessment administered by NECTA.',
    },
    {
      form: language === 'sw' ? 'Kidato cha Tatu' : 'Form Three',
      focus: language === 'sw' ? 'Mchepuo na Vitendo' : 'Subject Streams & Practicals',
      description: language === 'sw'
        ? 'Uchaguzi wa masomo ya mchepuo (Sayansi, Sanaa au Biashara) na mafunzo ya vitendo maabara.'
        : 'Stream selection across sciences, arts, and business subjects with extensive science laboratory sessions.',
    },
    {
      form: language === 'sw' ? 'Kidato cha Nne' : 'Form Four',
      focus: language === 'sw' ? 'Mtihani wa Taifa (CSEE)' : 'CSEE National Examination',
      description: language === 'sw'
        ? 'Marudio ya kina ya mitaala, mitihani ya majaribio (Mock) na maandalizi ya mtihani wa kuhitimu (NECTA CSEE).'
        : 'Intensive syllabus revision, mock examination series, and preparation for national CSEE certificate exams.',
    },
  ];

  const departments = [
    {
      name: language === 'sw' ? 'Idara ya Sayansi' : 'Science Department',
      subjects: 'Physics, Chemistry & Biology',
      description: language === 'sw'
        ? 'Mafunzo ya nadharia na vitendo katika maabara zetu tatu zilizowekewa vifaa kamili.'
        : 'Theory and practical experiments conducted in our fully equipped science laboratories.',
    },
    {
      name: language === 'sw' ? 'Idara ya Hisabati' : 'Mathematics Department',
      subjects: 'Basic Mathematics',
      description: language === 'sw'
        ? 'Kujenga uwezo wa utatuzi wa matatizo, aljebra, jiometria, takwimu na mantiki.'
        : 'Focus on logical deduction, problem solving, algebra, geometry, and statistics.',
    },
    {
      name: language === 'sw' ? 'Idara ya Lugha' : 'Languages Department',
      subjects: 'English & Kiswahili',
      description: language === 'sw'
        ? 'Sarufi, fasihi, utunzi na uwezo wa kuwasiliana kwa ufasaha katika lugha zote mbili.'
        : 'Grammar, literature analysis, composition, and spoken communication fluency in English and Swahili.',
    },
    {
      name: language === 'sw' ? 'Idara ya Jamii' : 'Humanities & Social Sciences',
      subjects: 'History, Geography & Civics',
      description: language === 'sw'
        ? 'Uelewa mpana wa historia ya nchi, jiografia ya mazingira na uraia wenye uwajibikaji.'
        : 'Critical study of national heritage, physical and human geography, and responsible citizenship.',
    },
    {
      name: language === 'sw' ? 'Idara ya TEHAMA' : 'ICT & Computer Studies',
      subjects: 'Computer Studies',
      description: language === 'sw'
        ? 'Mafunzo ya vitendo ya kompyuta, matumizi ya programu za ofisi na stadi za kidijitali.'
        : 'Practical computer laboratory sessions covering digital literacy, office applications, and research skills.',
    },
  ];

  return (
    <section id="academics" className="py-12 sm:py-16 bg-white border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold text-[#C9A227] tracking-wider block mb-2 uppercase">
              {language === 'sw' ? 'Mtaala & Mafunzo' : 'Curriculum & Learning'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
              {language === 'sw' ? 'Taaluma na Mitihani' : 'Academics & Curriculum'}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {language === 'sw'
                ? 'Shule ya Sekondari Uomboni inafuata mtaala rasmi wa Wizara ya Elimu, Sayansi na Teknolojia wa Tanzania chini ya Baraza la Mitihani la Taifa (NECTA).'
                : 'Uomboni Secondary School follows the national curriculum accredited by the Ministry of Education, Science and Technology and the National Examinations Council of Tanzania (NECTA).'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenResults && (
              <button
                onClick={onOpenResults}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#102A43] text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer border border-slate-300"
                title="Tazama Matokeo ya Mitihani"
              >
                <span>📊 {language === 'sw' ? 'Matokeo' : 'Exam Results'}</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  <Lock className="w-2.5 h-2.5 text-slate-500" />
                  <span>{language === 'sw' ? 'Faragha' : 'Private'}</span>
                </span>
              </button>
            )}
            {onOpenAcademicPortal && (
              <button
                onClick={onOpenAcademicPortal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer border border-amber-500/50"
              >
                <GraduationCap className="w-4 h-4 text-slate-950" />
                <span>{language === 'sw' ? 'Portal ya Taaluma' : 'Academic Portal'}</span>
              </button>
            )}
            {onOpenParentPortal && (
              <button
                onClick={onOpenParentPortal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-amber-300" />
                <span>{language === 'sw' ? 'Portal ya Mzazi' : 'Parent Portal'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Academic Levels (Forms 1–4) */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C9A227]" />
              <span>{language === 'sw' ? 'Madarasa (Kidato cha 1 hadi 4)' : 'Academic Levels (Forms 1–4)'}</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">NECTA S0486</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {forms.map((item) => (
              <div
                key={item.form}
                className="bg-[#FFFFF0] p-5 rounded-xl border border-slate-200/90 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div>
                  <span className="text-[11px] font-bold text-[#C9A227] tracking-wider uppercase block">
                    {item.focus}
                  </span>
                  <h4 className="text-base font-bold text-[#102A43] mt-1">
                    {item.form}
                  </h4>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Core Academic Departments */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-bold text-[#102A43]">
              {language === 'sw' ? 'Idara za Masomo' : 'Subject Departments'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#102A43]">
                    {dept.name}
                  </h4>
                  <span className="text-xs font-medium text-amber-700 block mt-0.5">
                    {dept.subjects}
                  </span>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {dept.description}
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
