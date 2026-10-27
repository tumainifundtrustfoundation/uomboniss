import React, { useState } from 'react';
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
  Trophy,
  Eye,
  Download,
  X,
  FileText
} from 'lucide-react';

interface AboutSectionProps {
  onNavigate?: (sectionId: string) => void;
  onOpenAdmissions?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate, onOpenAdmissions }) => {
  const { language } = useLanguage();
  const { schoolProfile } = useData();
  const [showFlyerModal, setShowFlyerModal] = useState(false);

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
              <span className="text-xs font-semibold text-[#C9A227] tracking-wider uppercase block mb-2">
                {language === 'sw' ? 'Kuhusu Shule Yetu' : 'About Our School'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
                {language === 'sw'
                  ? 'Elimu Bora, Malezi ya Kiroho na Maadili Mema'
                  : 'Quality Education, Moral Formation & Discipline'}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {language === 'sw'
                  ? 'Shule ya Sekondari Uomboni ni shule ya kutwa na bweni kwa wavulana na wasichana (Kidato cha 1 hadi 4) iliyopo Marangu West, Mkoani Kilimanjaro. Chini ya Jimbo Katoliki la Moshi, tunatoa elimu inayomjenga mwanafunzi kitaaluma, kinidhamu na kiroho ili kufikia ufaulu wa juu na kuwa raia mwema.'
                  : 'Uomboni Secondary School is a co-educational day and boarding secondary school (Forms 1–4) situated in Marangu West, Kilimanjaro. Owned and managed by the Catholic Diocese of Moshi, we provide holistic secondary education focused on academic competence, strong Christian values, and student discipline.'}
              </p>
            </div>

            {/* Official School Identity Card */}
            <div className="p-5 sm:p-6 rounded-xl bg-[#102A43] text-white border border-[#C9A227]/40 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  {language === 'sw' ? 'Kauli Mbiu na Dira ya Shule' : 'School Motto & Vision'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFlyerModal(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg border border-amber-400/30 transition-colors cursor-pointer"
                    title={language === 'sw' ? 'Tazama Brosha ya Shule' : 'View School Flyer'}
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'sw' ? 'Brosha' : 'Brochure'}</span>
                  </button>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold">
                    Jimbo Katoliki la Moshi
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                    {language === 'sw' ? 'Kauli Mbiu (Motto)' : 'School Motto'}
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl font-black text-amber-300 tracking-wide mt-0.5">
                    “Tujiendeleze sisi wenyewe.”
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] font-bold text-amber-300 uppercase block">
                      {language === 'sw' ? 'Dira (Vision)' : 'Vision'}
                    </span>
                    <p className="text-white/90 font-medium mt-1 leading-snug">
                      {language === 'sw'
                        ? '“Kuwa kitovu cha ubora katika kutoa elimu bora nchini.”'
                        : '“To be the centre of excellence in providing quality education in the country.”'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] font-bold text-amber-300 uppercase block">
                      {language === 'sw' ? 'Dhima (Mission)' : 'Mission'}
                    </span>
                    <p className="text-white/90 font-medium mt-1 leading-snug">
                      {language === 'sw'
                        ? '“Kutoa elimu bora na ufaulu wa juu wa kitaaluma wenye tija.”'
                        : '“To provide quality education and impressive academic performance.”'}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-amber-200/90 font-medium pt-1">
                  Misingi: <span className="font-semibold text-white">Sala na Kazi (Ora et Labora) · Nidhamu · Ushirikiano · Uwazi</span>
                </p>
              </div>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#102A43] text-white">
          <div className="space-y-1">
            <h4 className="font-serif text-base sm:text-lg font-bold text-white">
              {language === 'sw'
                ? 'Shule ya Sekondari Uomboni — Marangu, Moshi'
                : 'Uomboni Secondary School — Marangu, Moshi'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'sw'
                ? 'Elimu Bora yenye Maadili ya Kikanisa, Nidhamu ya Hali ya Juu na Taaluma Bora.'
                : 'Quality Catholic Education, High Discipline and Academic Excellence.'}
            </p>
          </div>

          <div className="flex flex-col xs:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
            {onNavigate && (
              <button
                onClick={() => onNavigate('academics')}
                className="w-full xs:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer text-center"
              >
                {language === 'sw' ? 'Tazama Taaluma' : 'Academic Programs'}
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('contact')}
                className="w-full xs:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-colors cursor-pointer shadow-sm text-center"
              >
                {language === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Official School Document / Flyer Modal */}
      {showFlyerModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowFlyerModal(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#102A43] text-white border-b border-[#102A43]/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white leading-tight">
                    {language === 'sw'
                      ? 'Nyaraka Rasmi: Tangazo na Mwongozo wa Shule'
                      : 'Official Institutional Document & Prospectus'}
                  </h3>
                  <p className="text-[11px] text-amber-200/90 font-medium">
                    UOMBONI SECONDARY SCHOOL · NECTA S0486 · MARANGU, MOSHI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/uomboni_flyer_2026.jpg"
                  download="Uomboni_Secondary_School_Official_Prospectus.jpg"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A227] hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs"
                  title="Pakua Nyaraka Hii (Download)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'sw' ? 'Pakua' : 'Download'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowFlyerModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Funga"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
              {/* Document Identity Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>Kauli Mbiu Rasmi: &ldquo;TUJIENDELEZE SISI WENYEWE&rdquo;</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {language === 'sw'
                    ? 'Hii ndio nyaraka rasmi ya Shule ya Sekondari Uomboni inayobeba Dira (Vision), Dhima (Mission), Maadili ya Msingi 6 (Core Values: Sala na Kazi, Ufanisi, Kazi ya Pamoja, Nidhamu, Uwajibikaji na Uwazi), pamoja na vigezo vyote vya udahili na mazingira ya shule.'
                    : 'Official Uomboni Secondary School flyer containing the official Motto, Vision, Mission, and 6 institutional Core Values.'}
                </p>
              </div>

              {/* Document Image */}
              <div className="rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-white flex justify-center">
                <img
                  src="/uomboni_flyer_2026.jpg"
                  alt="Uomboni Secondary School Official Prospectus & Flyer"
                  className="w-full max-w-2xl h-auto object-contain"
                  loading="eager"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px]">
                Catholic Diocese of Moshi · P.O. Box 361 Marangu
              </span>
              <button
                type="button"
                onClick={() => setShowFlyerModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer transition-colors"
              >
                {language === 'sw' ? 'Funga Dirisha' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};


