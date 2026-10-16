import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Sparkles,
  BookOpen,
  Award,
  Users,
  Compass,
  HeartHandshake,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Layers,
  GraduationCap,
  FlaskConical,
  Trees,
  Laptop,
  Church,
  Trophy
} from 'lucide-react';

interface AboutSectionProps {
  onNavigate?: (sectionId: string) => void;
  onOpenAdmissions?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate, onOpenAdmissions }) => {
  const { language } = useLanguage();
  const { schoolProfile } = useData();

  // 7 Core Features verbatim from the official School Flyer / Karatasi ya Udahili
  const flyerFeatures = [
    {
      icon: Users,
      titleSw: 'Experienced & Committed Teachers',
      titleEn: 'Experienced & Committed Teachers',
      descSw: 'Walimu wenye uzoefu mkubwa wa kitaaluma, waliojitolea na wanaoishi maadili ya malezi ya mwanafunzi.',
      descEn: 'Highly qualified, dedicated educators providing rigorous syllabus coverage and individual academic guidance.',
    },
    {
      icon: Trees,
      titleSw: 'Conducive Learning Environment',
      titleEn: 'Conducive Learning Environment',
      descSw: 'Mazingira tulivu, hewa safi na uoto wa asili kwenye mteremko wa Mlima Kilimanjaro, Marangu West.',
      descEn: 'Serene, distraction-free campus nestled on the cool slopes of Mount Kilimanjaro in Marangu.',
    },
    {
      icon: FlaskConical,
      titleSw: 'Modern Library & Science Labs',
      titleEn: 'Modern Library & Science Labs',
      descSw: 'Maabara tatu kamili za Fizikia, Kemia, Baiolojia na Maktaba kubwa ya kisasa yenye maelfu ya vitabu.',
      descEn: 'Fully equipped Physics, Chemistry, Biology laboratories and extensive resource library.',
    },
    {
      icon: Trophy,
      titleSw: 'High Academic Excellence',
      titleEn: 'High Academic Excellence',
      descSw: 'Ufaulu wa juu endelevu katika mitihani ya NECTA na CSSC na idadi kubwa ya wanafunzi wa Daraja I na II.',
      descEn: 'Consistent high pass-rate track record in National (NECTA) and Northern Zone Christian schools exams.',
    },
    {
      icon: Church,
      titleSw: 'Spiritual & Moral Guidance (Catholic Values)',
      titleEn: 'Spiritual & Moral Guidance (Catholic Values)',
      descSw: 'Malezi ya kiroho, Misa Takatifu na maadili thabiti chini ya Jimbo Katoliki la Moshi na Padri Mlezi.',
      descEn: 'Holistic Catholic values, resident chaplaincy, spiritual retreats, and strong moral discipline.',
    },
    {
      icon: Award,
      titleSw: 'Sports & Extracurricular Activities',
      titleEn: 'Sports & Extracurricular Activities',
      descSw: 'Michezo ya mpira wa miguu, pete, wavu, kwaya, mijadala ya kiingereza na vilabu vya taaluma.',
      descEn: 'Vibrant sports, liturgical choir, debate clubs, scouts, and student leadership development.',
    },
    {
      icon: Laptop,
      titleSw: 'Computer & ICT Studies',
      titleEn: 'Computer & ICT Studies',
      descSw: 'Maabara ya kisasa ya kompyuta yenye intaneti na mafunzo ya stadi za kidijitali na TEHAMA.',
      descEn: 'Modern computer lab with educational software and internet equipping students with digital literacy.',
    },
  ];

  return (
    <section id="about" className="py-12 sm:py-16 bg-[#FFFFF0] border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Part: Overview + Real Photo + Official Institutional Fact Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Real School Photograph & Official Identity */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#102A43]/15 shadow-lg bg-white group">
              <img
                src="/media/media_6.webp"
                alt="Uomboni Secondary School Administration and Classrooms, Marangu"
                className="w-full h-auto aspect-4/3 object-cover group-hover:scale-102 transition-transform duration-500"
                loading="lazy"
              />
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#102A43]">
                    Uomboni Secondary School Campus
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Marangu West, Moshi Vijijini · Jimbo Katoliki la Moshi
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#F5EBD7] text-[#704214] border border-[#704214]/20">
                  NECTA S0486
                </span>
              </div>
            </div>

            {/* Quick Fact Box with Official School Crest */}
            <div className="bg-white p-5 rounded-2xl border border-[#102A43]/15 shadow-sm space-y-3">
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
                <SchoolLogo size="md" />
                <div>
                  <h4 className="text-xs font-black text-[#102A43] uppercase tracking-wider">
                    Uomboni Secondary School
                  </h4>
                  <p className="text-[11px] text-[#C9A227] font-bold">
                    Catholic Diocese of Moshi (Jimbo Katoliki la Moshi)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FFFFF0] border border-[#102A43]/10">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Kituo cha NECTA</span>
                  <span className="font-mono font-black text-sm text-[#102A43]">S0486</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FFFFF0] border border-[#102A43]/10">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Madarasa</span>
                  <span className="font-bold text-xs text-[#102A43]">Form 1 – 4 (Bweni &amp; Kutwa)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FFFFF0] border border-[#102A43]/10">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Eneo</span>
                  <span className="font-bold text-xs text-[#102A43]">Marangu, Moshi - Kilimanjaro</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FFFFF0] border border-[#102A43]/10">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Mawasiliano</span>
                  <span className="font-bold text-xs text-[#102A43]">info@uomboniss.ac.tz</span>
                </div>
              </div>

              {/* Admissions Action Link */}
              <button
                type="button"
                onClick={onOpenAdmissions ? onOpenAdmissions : () => onNavigate?.('admissions')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#102A43] to-[#0A1C2E] hover:from-[#0A1C2E] hover:to-[#102A43] text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-[#C9A227]/40"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>{language === 'sw' ? 'Taarifa za Kujiunga & Udahili 2026' : 'Admissions & Enrollment 2026'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: About Narrative + Main Motto Banner */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#102A43]/10 text-[#102A43] text-xs font-black tracking-wider uppercase mb-3 border border-[#102A43]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>{language === 'sw' ? 'Kuhusu Shule ya Sekondari Uomboni' : 'About Uomboni Secondary School'}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
                {language === 'sw'
                  ? 'Taasisi ya Elimu Bora, Malezi ya Kiroho na Maadili Mema'
                  : 'A Sanctuary of Academic Competence, Spiritual Growth & Moral Discipline'}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-700 leading-[1.8] font-normal">
                {language === 'sw'
                  ? 'Shule ya Sekondari Uomboni ni shule ya kutwa na bweni kwa wavulana na wasichana (Kidato cha 1 hadi 4) iliyopo katika mazingira tulivu, hewa safi na yenye uoto mzuri wa asili ya Marangu West kwenye mteremko wa Mlima Kilimanjaro. Chini ya usimamizi wa Jimbo Katoliki la Moshi, tunajizatiti kutoa elimu yenye viwango vya juu vya kitaaluma inayomjenga mwanafunzi kifikra, kimaadili, na kiroho.'
                  : 'Uomboni Secondary School is an established co-educational Ordinary Level (Forms 1–4) day and boarding school situated in the tranquil, intellectually stimulating climate of Marangu West on the slopes of Mount Kilimanjaro. Under the auspices of the Catholic Diocese of Moshi, we are dedicated to providing accessible, high-quality secondary education rooted in academic rigor, self-discipline, and moral integrity.'}
              </p>
            </div>

            {/* Prominent Motto Highlight Card from Flyer & Logo */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#102A43] via-[#0b2545] to-[#102A43] text-white border-2 border-[#C9A227] shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
                  {language === 'sw' ? '★ KAULIMBIU RASMI YA SHULE (OFFICIAL MOTTO)' : '★ OFFICIAL SCHOOL MOTTO'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                  Catholic Diocese of Moshi
                </span>
              </div>

              <div className="space-y-1">
                <p className="font-serif text-2xl sm:text-3xl font-black text-amber-300 tracking-wide">
                  “ELIMU NI MAISHA”
                </p>
                <p className="text-xs sm:text-sm font-bold text-white/95">
                  “TUJENDELEE SISI WENYEWE”
                </p>
                <p className="text-xs text-amber-200/90 font-medium">
                  Misingi ya Nembo: <span className="font-black text-white">PRAYER · EDUCATION · WORK</span> (Sala, Elimu na Kazi)
                </p>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed pt-1">
                {language === 'sw'
                  ? 'Kaulimbiu hii inayopatikana kwenye nembo na karatasi rasmi ya shule inasisitiza kwamba elimu ya kweli ni chachu ya maisha, ikishirikiana na maombi, heshima, na kazi ya bidii ili kujiendeleza wenyewe.'
                  : 'Our institutional motto embodies education as the foundation of meaningful life, combining persistent prayer, academic rigor, and diligent work to achieve true self-reliance.'}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars: Vision, Mission, Core Values, Foundation */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#102A43]">
              {language === 'sw' ? 'Dira, Dhima na Misingi ya Shule' : 'Our Vision, Mission & Core Values'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {language === 'sw'
                ? 'Misingi thabiti inayoongoza kila hatua ya utendaji wetu na malezi ya wanafunzi.'
                : 'Guiding tenets shaping our curriculum, pastoral care, and student character formation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Vision (Dira) */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#102A43]/15 border-t-4 border-t-amber-500 shadow-xs flex flex-col justify-between space-y-2.5">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-600 mb-2">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-black text-[#102A43] uppercase tracking-wide">
                  {language === 'sw' ? 'Dira Yetu (Vision)' : 'Our Vision'}
                </h4>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed font-semibold">
                  “{language === 'sw'
                    ? (schoolProfile?.visionSw || 'Kutoa elimu bora na ufaulu wa kuvutia kitaaluma')
                    : (schoolProfile?.vision || schoolProfile?.visionEn || 'To provide quality education and impressive academic performance')}”
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded self-start border border-amber-200">
                Ubora wa Kitaaluma
              </span>
            </div>

            {/* 2. Mission (Dhima) */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#102A43]/15 border-t-4 border-t-[#102A43] shadow-xs flex flex-col justify-between space-y-2.5">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-900/10 border border-blue-900/20 flex items-center justify-center text-[#102A43] mb-2">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-black text-[#102A43] uppercase tracking-wide">
                  {language === 'sw' ? 'Dhima Yetu (Mission)' : 'Our Mission'}
                </h4>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed font-normal">
                  {language === 'sw'
                    ? 'Kuelimisha wavulana na wasichana kufikia uwezo wao kamili wawe watu wanaojitegemea na wenye nidhamu thabiti.'
                    : 'To educate boys and girls to their full potential to become self-reliant, disciplined citizens.'}
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#102A43] bg-blue-50 px-2 py-0.5 rounded self-start border border-blue-200">
                Wajibu na Utendaji
              </span>
            </div>

            {/* 3. Core Values */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#102A43]/15 border-t-4 border-t-emerald-600 shadow-xs flex flex-col justify-between space-y-2.5">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 mb-2">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-black text-[#102A43] uppercase tracking-wide">
                  {language === 'sw' ? 'Maadili ya Msingi' : 'Core Values'}
                </h4>
                <ul className="mt-1.5 space-y-1 text-[11px] text-slate-600 leading-snug">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Bidii &amp; Uadilifu</strong> kitaaluma</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Nidhamu &amp; Kujitambua</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Sala na Kazi:</strong> Prayer &amp; Work</span>
                  </li>
                </ul>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded self-start border border-emerald-200">
                Malezi ya Kikatoliki
              </span>
            </div>

            {/* 4. Institutional Foundation */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#102A43]/15 border-t-4 border-t-[#C9A227] shadow-xs flex flex-col justify-between space-y-2.5">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-700 mb-2">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-black text-[#102A43] uppercase tracking-wide">
                  {language === 'sw' ? 'Kaulimbiu ya Shule' : 'Motto'}
                </h4>
                <p className="mt-1 text-sm font-serif font-black text-[#102A43]">
                  “ELIMU NI MAISHA”
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Tujendelee Sisi Wenyewe: Prayer · Education · Work.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded self-start border border-amber-200">
                Jimbo Katoliki Moshi
              </span>
            </div>
          </div>
        </div>

        {/* Hallmark Strengths (Compact 4-Card Highlights) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#102A43]/15 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="text-xs sm:text-sm font-black text-[#102A43] uppercase tracking-wider">
                {language === 'sw' ? 'Sifa Kuu za Uomboni Secondary' : 'Key School Hallmark Features'}
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              NECTA S0486 · Marangu West, Kilimanjaro
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {flyerFeatures.slice(0, 4).map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#FFFFF0] border border-[#102A43]/10 space-y-1.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-[#102A43] text-amber-300 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h5 className="text-xs font-bold text-[#102A43] leading-snug">
                      {language === 'sw' ? feat.titleSw : feat.titleEn}
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {language === 'sw' ? feat.descSw : feat.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Link Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-[#102A43] text-white">
          <div>
            <h4 className="font-serif text-base sm:text-lg font-bold text-white">
              {language === 'sw'
                ? 'Shule ya Sekondari Uomboni — Marangu, Moshi'
                : 'Uomboni Secondary School — Marangu, Moshi'}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {language === 'sw'
                ? 'Elimu Bora yenye Maadili ya Kikanisa, Nidhamu ya Hali ya Juu na Taaluma Bora.'
                : 'Quality Catholic Education, High Discipline and Academic Excellence.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('academics')}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'sw' ? 'Tazama Taaluma' : 'Academic Programs'}
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-colors cursor-pointer shadow-sm"
              >
                {language === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

