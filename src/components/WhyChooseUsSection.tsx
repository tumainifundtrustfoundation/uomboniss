import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Award,
  FlaskConical,
  HeartHandshake,
  Trees,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Laptop,
  Flame,
  BookOpen
} from 'lucide-react';

interface WhyChooseUsSectionProps {
  onNavigate?: (sectionId: string) => void;
  onOpenApply?: () => void;
}

export const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({ onNavigate, onOpenApply }) => {
  const { language } = useLanguage();

  const cards = [
    {
      id: 'academics',
      icon: Award,
      badgeSw: 'UFAULU WA JUU WA NECTA',
      badgeEn: 'NECTA ACADEMIC DISTINCTION',
      titleSw: 'Taaluma Bora & Matokeo ya Kuigwa',
      titleEn: 'Academic Excellence & Proven Track Record',
      descriptionSw:
        'Rekodi endelevu ya ufaulu wa madaraja ya juu katika Mitihani ya Taifa (CSEE) na idadi kubwa ya wanafunzi wetu wakipata Daraja la Kwanza na la Pili (Division I & II). Tunatoa mwongozo binafsi wa kitaaluma, mitihani ya mara kwa mara na vipindi maalum vya ziada.',
      descriptionEn:
        'A consistent record of high academic performance in National Examinations (CSEE) with candidates securing Division I & II. We provide individualized student mentorship, weekly assessment series, and focused remedial learning.',
      pointsSw: [
        'Walimu bobezi wa masomo ya Sayansi, Biashara na Sanaa',
        'Mpango maalumu wa kuwaandaa watahiniwa wa Kidato cha Nne',
        'Maktaba yenye maelfu ya vitabu vya kiada na ziada vya kisasa'
      ],
      pointsEn: [
        'Expert faculty in Sciences, Commerce, and Humanities',
        'Targeted preparatory mentorship for Form Four candidates',
        'Resourceful library with thousands of syllabus textbooks'
      ],
      bgHeader: 'bg-[#0b2545]',
      accentColor: 'text-amber-300',
      tagColor: 'bg-blue-900/60 text-amber-300 border-blue-600/50'
    },
    {
      id: 'labs',
      icon: FlaskConical,
      badgeSw: 'MIUNDOMBINU YA KISASA',
      badgeEn: 'STATE-OF-THE-ART FACILITIES',
      titleSw: 'Maabara za Kisasa za Sayansi & TEHAMA',
      titleEn: 'Modern Science & ICT Computer Laboratories',
      descriptionSw:
        'Tuna maabara tatu kubwa na zilizosheheni vifaa kamili vya majaribio ya vitendo kwa masomo ya Fizikia, Kemia, na Baiolojia, pamoja na Maabara ya Kisasa ya Kompyuta yenye intaneti ya kasi ili kuwajengea wanafunzi ujuzi wa kidijitali na ubunifu.',
      descriptionEn:
        'Three fully equipped science laboratories for Physics, Chemistry, and Biology practicals, alongside a dedicated high-speed ICT Computer Lab equipping students with digital literacy, programming, and research skills.',
      pointsSw: [
        'Vifaa vya kisasa vya majaribio ya vitendo (Practicals)',
        'Kompyuta zenye intaneti na programu za kielimu',
        'Madarasa yenye projekta na vifaa vya kidijitali'
      ],
      pointsEn: [
        'Complete apparatus for hands-on national practical exams',
        'Modern computers with educational software & fast internet',
        'Digital projector-equipped interactive classrooms'
      ],
      bgHeader: 'bg-[#0b2545]',
      accentColor: 'text-blue-300',
      tagColor: 'bg-blue-900/60 text-blue-200 border-blue-600/50'
    },
    {
      id: 'spiritual',
      icon: HeartHandshake,
      badgeSw: 'MAADILI YA KIKATOLIKI',
      badgeEn: 'CATHOLIC SPIRITUAL FORMATION',
      titleSw: 'Malezi ya Kiroho, Nidhamu & Maadili Mema',
      titleEn: 'Spiritual Formation, Discipline & Character',
      descriptionSw:
        'Chini ya usimamizi thabiti wa Jimbo Katoliki Moshi, tunalea vijana kuwa raia wema, waadilifu na wanaomcha Mungu. Shule ina Padri Mlezi (Chaplain), ibada za kiroho, kwaya ya kikanisa, na miongozo thabiti ya nidhamu inayomsaidia mwanafunzi kustawi kimaadili.',
      descriptionEn:
        'Under the guidance of the Catholic Diocese of Moshi, we nurture morally sound, disciplined, and God-fearing citizens. Our dedicated School Chaplain provides pastoral counseling, Holy Mass, choir, and moral integrity.',
      pointsSw: [
        'Padri Mlezi na viongozi wa kidini kwa ushauri nasaha',
        'Misa Takatifu na malezi ya kiroho kwa wanafunzi wote',
        'Nidhamu ya hali ya juu inayojenga uwajibikaji binafsi'
      ],
      pointsEn: [
        'Resident School Chaplain providing pastoral guidance',
        'Holy Mass, spiritual retreats, and vibrant liturgical choir',
        'High standard of discipline cultivating personal responsibility'
      ],
      bgHeader: 'bg-[#0b2545]',
      accentColor: 'text-amber-300',
      tagColor: 'bg-blue-900/60 text-amber-300 border-blue-600/50'
    },
    {
      id: 'campus',
      icon: Trees,
      badgeSw: 'MAZINGIRA NA BWENI',
      badgeEn: 'SERENE CAMPUS & BOARDING',
      titleSw: 'Mazingira Tulivu ya Kilimanjaro & Bweni Bora',
      titleEn: 'Serene Mount Kilimanjaro Slopes & Quality Boarding',
      descriptionSw:
        'Shule ipo Marangu kwenye mteremko wenye uoto wa asili wa Mlima Kilimanjaro, ikitoa mazingira tulivu na hewa safi ya kupendeza inayomfanya mwanafunzi atulie na kuzingatia masomo. Mabweni yetu ni salama, yenye maji safi na ya moto, chakula bora cha lishe na viwanja vya michezo.',
      descriptionEn:
        'Located on the lush, cool slopes of Mount Kilimanjaro in Marangu, our campus provides a serene, distraction-free environment. Features modern dormitories, reliable hot & cold water, nutritious balanced meals, and sports fields.',
      pointsSw: [
        'Mabweni ya kisasa, salama na yenye wasimamizi makini',
        'Chakula bora cha lishe (mlo kamili mara tatu kwa siku)',
        'Viwanja vya michezo ya mpira wa miguu, pete, wavu na riadha'
      ],
      pointsEn: [
        'Secure dormitories with attentive matrons and patrons',
        'Three nutritious, balanced meals served daily',
        'Comprehensive sports grounds for football, netball, and athletics'
      ],
      bgHeader: 'bg-[#0b2545]',
      accentColor: 'text-blue-300',
      tagColor: 'bg-blue-900/60 text-blue-200 border-blue-600/50'
    }
  ];

  return (
    <section id="why-choose-us" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>{language === 'sw' ? 'Kwanini Uchague Shule ya Uomboni?' : 'Why Choose Uomboni Secondary?'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {language === 'sw' ? (
              <>
                Misingi Minne ya Ubora Inayofanya{' '}
                <span className="text-[#0b2545]">Uomboni Kuwa Chaguo la Kwanza</span>
              </>
            ) : (
              <>
                Four Core Pillars That Make{' '}
                <span className="text-[#0b2545]">Uomboni the Premier Choice</span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {language === 'sw'
              ? 'Tunajivunia kutoa elimu inayomjenga mwanafunzi kifikra, kimaadili, na kimwili ili kufungua milango ya mafanikio ya juu ya kielimu na kimaisha.'
              : 'We take pride in delivering holistic education that empowers students intellectually, spiritually, and physically to unlock lifelong success.'}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                id={`card-${card.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className={`p-5 sm:p-6 ${card.bgHeader} text-white space-y-2 relative overflow-hidden`}>
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${card.tagColor}`}>
                        {language === 'sw' ? card.badgeSw : card.badgeEn}
                      </span>
                      <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${card.accentColor}`} />
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {language === 'sw' ? card.titleSw : card.titleEn}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {language === 'sw' ? card.descriptionSw : card.descriptionEn}
                    </p>

                    {/* Bullet Points */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                      {(language === 'sw' ? card.pointsSw : card.pointsEn).map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <span className="font-medium">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 sm:p-6 pt-0 flex items-center justify-between">
                  {onNavigate && (
                    <button
                      onClick={() => {
                        if (card.id === 'academics') onNavigate('results');
                        else if (card.id === 'labs') onNavigate('gallery');
                        else if (card.id === 'spiritual') onNavigate('about');
                        else onNavigate('admissions');
                      }}
                      className="text-xs font-bold text-blue-800 hover:text-blue-900 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{language === 'sw' ? 'Jifunze Zaidi' : 'Learn More'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {onOpenApply && (
                    <button
                      onClick={onOpenApply}
                      className="px-3.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                    >
                      {language === 'sw' ? 'Omba Kujiunga' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Call to Action Strip */}
        <div className="bg-[#0b2545] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-blue-900">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {language === 'sw' ? 'Nafasi za Kujiunga Kidato cha 1 na Uhamisho 2026 Zipo Wazi!' : 'Admissions for Form 1 & Transfers for 2026 Are Open!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {language === 'sw'
                ? 'Pakua fomu ya kujiunga au jaza maombi mtandaoni moja kwa moja ili kuhakikisha nafasi ya mtoto wako.'
                : 'Download joining instructions or apply online right now to secure a spot for your child.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenApply && (
              <button
                onClick={onOpenApply}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer border border-blue-400"
              >
                {language === 'sw' ? 'Omba Kujiunga Sasa' : 'Apply Now Online'}
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('admissions')}
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors cursor-pointer"
              >
                {language === 'sw' ? 'Pakua Fomu za Kujiunga' : 'Download Forms'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
