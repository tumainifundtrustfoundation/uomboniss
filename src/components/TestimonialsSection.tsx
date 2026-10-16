import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Quote,
  Star,
  CheckCircle2,
  Users,
  Award,
  GraduationCap,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  roleSw: string;
  roleEn: string;
  relationSw: string;
  relationEn: string;
  contentSw: string;
  contentEn: string;
  rating: number;
  avatarEmoji: string;
  verified: boolean;
  year: string;
}

export const TestimonialsSection: React.FC = () => {
  const { language } = useLanguage();

  const testimonials: Testimonial[] = [
    {
      id: 't1',
      name: 'Mhandisi Bernard Mushi',
      roleSw: 'Mzazi wa Mwanafunzi wa Kidato cha 4 (Bweni)',
      roleEn: 'Parent of Form 4 Student (Boarding)',
      relationSw: 'Mzazi (Moshi / Arusha)',
      relationEn: 'Parent (Moshi / Arusha)',
      contentSw:
        'Kama mzazi, nimefurahishwa sana na mabadiliko makubwa ya kitaaluma na kimaadili ya mwanangu tangu ajiunge na Uomboni Secondary. Walimu wanajali na kufuatilia maendeleo ya mwanafunzi kila wiki. Maabara zao za sayansi na vipindi vya jioni vimemwezesha kufanya vizuri sana kwenye masomo ya fizikia na kemia!',
      contentEn:
        'As a parent, I am truly impressed with my child’s tremendous academic and moral progress since joining Uomboni Secondary. The teachers are dedicated and follow up on each student weekly. The modern science laboratories and evening study sessions gave him strong confidence in Physics and Chemistry!',
      rating: 5,
      avatarEmoji: '👨‍💼',
      verified: true,
      year: '2025'
    },
    {
      id: 't2',
      name: 'Bi. Regina Tarimo',
      roleSw: 'Mzazi wa Mwanafunzi wa Kidato cha 2 & Mwenyekiti Kamati ya Wazazi (PTA)',
      roleEn: 'Parent of Form 2 Student & PTA Chairperson',
      relationSw: 'Mzazi (Marangu)',
      relationEn: 'Parent (Marangu)',
      contentSw:
        'Uomboni inatoa malezi ya kipekee ya Kikatoliki yenye heshima na nidhamu ya hali ya juu. Mabweni ni salama, chakula cha wanafunzi ni cha lishe na kizuri, na mazingira ya shule chini ya Mlima Kilimanjaro ni tulivu sana. Ni shule bora kabisa kwa mtoto wako kupata elimu na maadili mema.',
      contentEn:
        'Uomboni provides extraordinary Catholic moral formation grounded in respect and high discipline. The dormitories are secure, the meals are nutritious, and the serene campus under Mt. Kilimanjaro provides the perfect environment for deep learning.',
      rating: 5,
      avatarEmoji: '👩‍🏫',
      verified: true,
      year: '2025'
    },
    {
      id: 't3',
      name: 'Glory Aloyce Kimaro',
      roleSw: 'Mhitimu Bora wa CSEE (Division 1.7 - Sasa Chuo Kikuu UDSM)',
      roleEn: 'Top CSEE Graduate (Division 1.7 - Now at UDSM)',
      relationSw: 'Alumni (Darasa la 2024)',
      relationEn: 'Alumni (Class of 2024)',
      contentSw:
        'Miaka yangu minne Uomboni Secondary ilinijenga kuwa mtu ninayejiamini, kiongozi na mwanasayansi. Walimu wetu hawakuchoka kutusaidia hata nyakati za usiku kwenye masomo ya ziada. NECTA ufaulu wangu wa Daraja la Kwanza ulitokana na msingi thabiti wa maabara za shule na ushirikiano wa walimu wetu.',
      contentEn:
        'My four years at Uomboni Secondary shaped me into a confident leader and aspiring scientist. Our teachers supported us day and night during practicals. My Division One in NECTA was the direct outcome of our robust labs and caring tutors.',
      rating: 5,
      avatarEmoji: '🎓',
      verified: true,
      year: '2024'
    },
    {
      id: 't4',
      name: 'Mwl. Godfrey Lyimo',
      roleSw: 'Mzazi wa Mwanafunzi wa Kidato cha Kwanza (Kutwa)',
      roleEn: 'Parent of Form 1 Student (Day)',
      relationSw: 'Mzazi & Mwalimu (Moshi)',
      relationEn: 'Parent & Educator (Moshi)',
      contentSw:
        'Uwazi wa shule katika kutoa ripoti za mitihani, mfumo wa kidijitali wa kuangalia matokeo na kulipa ada kupitia simu na benki umewarahisishia sana wazazi. Tunapata taarifa zote kwa wakati na mtoto wangu amependa sana maabara ya kompyuta na michezo ya shule!',
      contentEn:
        'The school’s transparency with online examination results slips and seamless mobile fee payment makes parenting smooth. We get real-time feedback and my son loves the modern computer laboratory and athletics programmes!',
      rating: 5,
      avatarEmoji: '👨‍🏫',
      verified: true,
      year: '2025'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0b2545] text-xs font-bold border border-blue-200 shadow-xs">
            <Quote className="w-3.5 h-3.5 text-blue-800" />
            <span>{language === 'sw' ? 'Shuhuda & Maoni ya Wazazi na Wanafunzi' : 'Parent & Student Testimonials'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {language === 'sw' ? (
              <>
                Wazazi na Wahitimu Wanasema Nini Kuhusu{' '}
                <span className="text-[#0b2545]">Shule ya Sekondari Uomboni?</span>
              </>
            ) : (
              <>
                What Parents & Graduates Say About{' '}
                <span className="text-[#0b2545]">Uomboni Secondary School</span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {language === 'sw'
              ? 'Soma maoni halisi ya wazazi na wanafunzi walionufaika na taaluma ya kipekee, maadili na malezi ya Kikatoliki shuleni kwetu.'
              : 'Discover authentic feedback from parents and alumni who experienced our academic excellence and spiritual mentorship.'}
          </p>
        </div>

        {/* Testimonial Cards Grid (4 items) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((tItem) => (
            <div
              key={tItem.id}
              className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                {/* Header Rating & Quote icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(tItem.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0b2545] flex items-center justify-center border border-blue-100">
                    <Quote className="w-5 h-5 text-blue-800" />
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{language === 'sw' ? tItem.contentSw : tItem.contentEn}&rdquo;
                </p>
              </div>

              {/* Author Details Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shadow-xs shrink-0">
                  {tItem.avatarEmoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {tItem.name}
                    </h4>
                    {tItem.verified && (
                      <span title="Mzazi/Mwanafunzi Aliyethibitishwa">
                        <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-semibold text-[#0b2545] truncate">
                    {language === 'sw' ? tItem.roleSw : tItem.roleEn}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {language === 'sw' ? tItem.relationSw : tItem.relationEn} • {tItem.year}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges Bar */}
        <div className="bg-[#0b2545] text-white rounded-xl p-6 sm:p-8 border border-blue-900 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-blue-800">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">99.4%</div>
            <div className="text-xs font-bold text-slate-200">
              {language === 'sw' ? 'Wazazi Wanaopendekeza Shule' : 'Parent Recommendation Rate'}
            </div>
            <div className="text-[11px] text-blue-200">
              {language === 'sw' ? 'Kulingana na tafiti za PTA 2024/2025' : 'Based on 2024/2025 PTA survey'}
            </div>
          </div>

          <div className="space-y-1 pt-4 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-blue-200 font-mono">NECTA</div>
            <div className="text-xs font-bold text-slate-200">
              {language === 'sw' ? 'Watahiniwa Wanaomaliza CSEE' : 'CSEE Graduation Rate'}
            </div>
            <div className="text-[11px] text-blue-200">
              {language === 'sw' ? 'Kujiunga na Kidato cha 5 & Vyuo' : 'Progressing to Form 5 & Colleges'}
            </div>
          </div>

          <div className="space-y-1 pt-4 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">1:20</div>
            <div className="text-xs font-bold text-slate-200">
              {language === 'sw' ? 'Uwiano wa Mwalimu kwa Wanafunzi' : 'Teacher to Student Ratio'}
            </div>
            <div className="text-[11px] text-blue-200">
              {language === 'sw' ? 'Ufuatiliaji wa kina wa kila mtoto' : 'Personalized student mentorship'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
