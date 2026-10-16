import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  HelpCircle,
  ChevronDown,
  Search,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  FileText
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'admissions' | 'fees' | 'schedule';
  questionSw: string;
  questionEn: string;
  answerSw: string;
  answerEn: string;
  highlightsSw?: string[];
  highlightsEn?: string[];
}

const FAQ_DATA: FAQItem[] = [
  // 1. Admissions
  {
    id: 'faq-adm-1',
    category: 'admissions',
    questionSw: 'Ni vigezo gani vinavyohitajika kujiunga na Kidato cha Kwanza Shule ya Sekondari Uomboni?',
    questionEn: 'What are the admission requirements for Form One at Uomboni Secondary School?',
    answerSw: 'Mwanafunzi anapaswa kuwa amehitimu mtihani wa Darasa la Saba (PSLE) akiwa na ufaulu mzuri wa madaraja A, B au C. Anahitaji kuwasilisha cheti cha kuzaliwa (RITA), nakala ya matokeo ya NECTA (Result Slip), picha 4 za pasipoti za hivi karibuni zenye mandhari ya bluu, na fomu ya uchunguzi wa afya (Medical Examination Form) iliyojazwa na mganga mkuu wa hospitali inayotambuliwa na serikali.',
    answerEn: 'The candidate must have completed and passed the Primary School Leaving Examination (PSLE) with grades A, B, or C. Required documents include an official birth certificate (RITA), NECTA PSLE result slip, 4 recent passport-size photos with sky-blue background, and an official medical examination form certified by a recognized government physician.',
    highlightsSw: ['Cheti cha Kuzaliwa (RITA)', 'Result Slip ya Darasa la 7', 'Fomu ya Afya (Hospitali ya Serikali)', 'Picha 4 za Pasipoti'],
    highlightsEn: ['Birth Certificate (RITA)', 'Grade 7 PSLE Result Slip', 'Official Medical Form', '4 Passport Photographs'],
  },
  {
    id: 'faq-adm-2',
    category: 'admissions',
    questionSw: 'Je, mnapokea wanafunzi wa uhamisho wa Kidato cha Pili na Kidato cha Tatu?',
    questionEn: 'Do you accept transfer students for Form Two and Form Three?',
    answerSw: 'Ndiyo, nafasi za uhamisho kwa Kidato cha Pili na Tatu zipo wazi kwa wanafunzi wenye mwenendo mwema wa tabia na rekodi nzuri ya kitaaluma kutoka shule zilizosajiliwa na Wizara ya Elimu. Mtahiniwa atafanyiwa usaili mdogo wa kupima kiwango chake na atapaswa kuleta ripoti ya maendeleo ya shule aliyotoka pamoja na barua rasmi ya uhamisho.',
    answerEn: 'Yes, transfer opportunities for Form 2 and Form 3 are available for students with good academic standing and exemplary discipline from registered schools. The student will undertake a placement test and must provide terminal progress reports from the previous school alongside official transfer documentation.',
    highlightsSw: ['Ripoti ya maendeleo ya kimasomo', 'Barua rasmi ya uhamisho', 'Kipimo kidogo cha kujiunga (Placement Test)'],
    highlightsEn: ['Previous Academic Reports', 'Official Transfer Release', 'Placement Evaluation'],
  },
  {
    id: 'faq-adm-3',
    category: 'admissions',
    questionSw: 'Fomu za kujiunga na shule zinapatikana wapi na kwa njia gani?',
    questionEn: 'Where and how can I obtain the school admission joining instructions form?',
    answerSw: 'Fomu zote za kujiunga (Joining Instructions & Admission Forms) zinapatikana bure mtandaoni kwenye sehemu ya "Hati za Udahili" (STUDENT ADMISSION) kwa kubonyeza kitufe chekundu cha Liquid Button kilichopo juu au kupitia ofisi ya shule Marangu, Moshi Bookshop mjini Moshi, na parokia ya Ngarenaro Arusha.',
    answerEn: 'All official joining instructions and admission forms are available online on this website under the "STUDENT ADMISSION" red liquid button with direct PDF download. Physical copies are also available at the School Administration Office in Marangu, Moshi Bookshop in Moshi Town, and Ngarenaro Parish.',
  },

  // 2. School Fees & Payment
  {
    id: 'faq-fee-1',
    category: 'fees',
    questionSw: 'Ada ya shule ni kiasi gani na inalipwaje kwa wanafunzi wa Bweni na Kutwa?',
    questionEn: 'How much are the school fees and what are the payment terms for day and boarding scholars?',
    answerSw: 'Shule ya Sekondari Uomboni inatoa ada nafuu na yenye unafuu mkubwa kwa wazazi inayozingatia ubora wa huduma na malezi ya Kikatoliki. Ada inaweza kulipwa kwa awamu nne (4 instalments) kulingana na mihula na kalenda ya shule, au kwa awamu mbili. Ada inajumuisha masomo, maabara, huduma ya chakula bora, malazi (kwa wanafunzi wa bweni), huduma ya kwanza na ulinzi wa masaa 24.',
    answerEn: 'Uomboni Secondary School offers affordable and subsidized school fees structured into flexible instalments (up to 4 terms or 2 biannual payments). The fee covers tuition, science laboratory usage, balanced nutritional meals, hostel accommodation for boarders, first-aid health care, and 24/7 security.',
    highlightsSw: ['Malipo ya awamu 4 yanaruhusiwa', 'Inajumuisha chakula na huduma za maabara', 'Nafuu kwa bweni na kutwa'],
    highlightsEn: ['4 flexible payment terms', 'Includes meals & lab facilities', 'Subsidized day & boarding rates'],
  },
  {
    id: 'faq-fee-2',
    category: 'fees',
    questionSw: 'Ni akaunti zipi rasmi za benki zinazotumika kulipa ada na michango ya shule?',
    questionEn: 'Which official bank accounts are authorized for school fee deposits?',
    answerSw: 'Malipo yote ya ada hufanyika benki moja kwa moja kupitia akaunti rasmi za Shule ya Sekondari Uomboni katika Benki ya CRDB, NMB Bank, au Mkombozi Commercial Bank. Hairuhusiwi kabisa kumlipa mtu yeyote pesa mkononi (cash). Hati ya malipo (Bank Pay-in Slip) halisi huwasilishwa kwa mhasibu (Bursar) wa shule kwa ajili ya kupatiwa stakabadhi rasmi.',
    answerEn: 'All fee payments must be deposited directly into the registered institutional bank accounts at CRDB Bank, NMB Bank, or Mkombozi Commercial Bank under "UOMBONI SECONDARY SCHOOL". Cash payments to individuals are strictly prohibited. Original bank pay-in slips must be presented to the school Bursar for official receipting.',
    highlightsSw: ['Benki ya CRDB', 'NMB Bank', 'Mkombozi Commercial Bank', 'Pay-in Slip inapewa stakabadhi rasmi'],
    highlightsEn: ['CRDB Bank Account', 'NMB Bank Account', 'Mkombozi Commercial Bank', 'Official receipt issued on slip submission'],
  },
  {
    id: 'faq-fee-3',
    category: 'fees',
    questionSw: 'Je, kuna michango ya ziada isiyotarajiwa katikati ya muhula?',
    questionEn: 'Are there hidden or unexpected extra contributions during the academic term?',
    answerSw: 'Hapana! Shule ya Sekondari Uomboni inazingatia uwazi kamili. Michango yote halali huainishwa kwa uwazi kwenye Fomu Rasmi ya Maelekezo ya Kujiunga (Joining Instructions) inayotolewa mwanzoni mwa mwaka wa masomo, ikijumuisha sare za shule, matibabu madogo na vitambulisho.',
    answerEn: 'No! Uomboni Secondary School maintains utmost transparency. Every necessary cost is comprehensively detailed in the official Joining Instructions document issued at the beginning of the school year, covering uniforms, basic medical fund, and student ID cards without undisclosed levies.',
  },

  // 3. Daily Schedules & Life
  {
    id: 'faq-sch-1',
    category: 'schedule',
    questionSw: 'Ratiba ya siku ya shule inakuwaje kuanzia asubuhi hadi jioni?',
    questionEn: 'What does the daily school routine look like from morning until evening?',
    answerSw: 'Ratiba ya siku inaanza saa 11:30 asubuhi kwa maandalizi binafsi na sala ya asubuhi. Mkutano mkuu (Assembly) hufanyika saa 1:30 asubuhi. Masomo darasani huanzia saa 2:00 asubuhi hadi saa 9:00 alasiri kukiwa na mapumziko ya chai na chakula cha mchana. Saa 9:30 - 11:00 alasiri ni muda wa michezo, kilimo na usafi. Jioni saa 1:00 hadi 3:30 usiku ni muda wa masomo binafsi (Night Preparation/Prep) chini ya uangalizi wa mwalimu wa zamu, ikifuatiwa na ukimya na mapumziko saa 4:00 usiku.',
    answerEn: 'The daily timetable begins at 5:30 AM with personal morning routines and dawn prayers. Morning parade assembly occurs at 7:30 AM. Academic periods run from 8:00 AM to 3:00 PM with structured tea and lunch breaks. Between 3:30 PM and 5:00 PM students engage in physical sports, extracurricular clubs, and environmental care. Evening prep runs from 7:00 PM to 9:30 PM under teacher supervision, with lights out at 10:00 PM.',
    highlightsSw: ['07:30 Asubuhi: Assembly ya Shule', '08:00 - 15:00: Vipindi vya Masomo', '15:30 - 17:00: Michezo & Klabu za Taaluma', '19:00 - 21:30: Prep ya Jioni (Masomo Binafsi)'],
    highlightsEn: ['07:30 AM: School Assembly', '08:00 AM - 03:00 PM: Classroom Lectures', '03:30 PM - 05:00 PM: Sports & Clubs', '07:00 PM - 09:30 PM: Supervised Evening Prep'],
  },
  {
    id: 'faq-sch-2',
    category: 'schedule',
    questionSw: 'Utaratibu wa wazazi kutembelea wanafunzi (Visiting Days) ukoje?',
    questionEn: 'What is the visiting schedule and protocol for parents and guardians?',
    answerSw: 'Siku rasmi ya wazazi kuwatembelea wanafunzi (Visiting Day) hufanyika Jumapili ya kwanza ya kila mwezi kuanzia saa 4:00 asubuhi hadi saa 10:30 jioni. Wazazi wanatakiwa kujiandikisha getini kwa mlinzi na mwalimu wa zamu. Katika siku za kawaida za masomo, ugeni hauruhusiwi bila idhini maalum ya Mkuu wa Shule ili kutovuruga utulivu wa masomo.',
    answerEn: 'Official Visiting Day takes place on the first Sunday of every month between 10:00 AM and 4:30 PM. Parents and guardians must sign in at the security gate and report to the teacher on duty. Weekday visits are strictly controlled and require prior clearance from the Head of School to safeguard instructional hours.',
  },
  {
    id: 'faq-sch-3',
    category: 'schedule',
    questionSw: 'Je, simu za mkononi na vifaa vya kielektroniki vinaruhusiwa kwa wanafunzi?',
    questionEn: 'Are smartphones and personal electronic gadgets permitted on campus?',
    answerSw: 'HAPANA KABISA. Simu za mkononi, spika, redio, hita za umeme na vifaa vyote vya kielektroniki vimepigwa marufuku vikali shuleni. Mwanafunzi yeyote anayekutwa na simu atachukuliwa hatua kali za kinidhamu. Mawasiliano kati ya mzazi na mwanafunzi hufanyika kupitia simu rasmi ya ofisi ya shule au mwalimu wa malezi (Patron/Matron).',
    answerEn: 'ABSOLUTELY NOT. Mobile phones, smart devices, immersion heaters, and unauthorized electronic gadgets are strictly forbidden on campus. Any student found in possession faces stern disciplinary measures. Parent-student communication is conducted seamlessly via the official school administration or residential patrons/matrons.',
    highlightsSw: ['Simu za mkononi zimepigwa marufuku', 'Mawasiliano yote kupitia ofisi ya shule na walezi'],
    highlightsEn: ['Mobile devices strictly prohibited', 'Official communication through school office & boarding masters'],
  },
  {
    id: 'faq-sch-4',
    category: 'schedule',
    questionSw: 'Je, wanafunzi wa dini na madhehebu mbalimbali wanatendewaje haki shuleni?',
    questionEn: 'How are students of diverse religious denominations accommodated?',
    answerSw: 'Ingawa Uomboni ni shule inayomilikiwa na Kanisa Katoliki Jimbo la Moshi, tunapokea wanafunzi wa madhehebu na dini zote bila ubaguzi wowote. Uhusiano mwema, uvumilivu wa kidini na kuheshimiana ni msingi mkuu wa malezi yetu. Wanafunzi wote wanashiriki malezi imara ya kimaadili yanayomjenga mtoto kuwa raia mwema na mtiifu kwa Taifa.',
    answerEn: 'Although Uomboni is a Catholic institution under the Diocese of Moshi, we warmly welcome students of all religious beliefs with complete respect and dignity. Inter-faith tolerance, unity, and shared moral ethics form the bedrock of student life, nurturing responsible citizens of Tanzania.',
  },
];

interface FAQSectionProps {
  onOpenAdmissionDocuments?: () => void;
  onOpenContact?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onOpenAdmissionDocuments,
  onOpenContact,
}) => {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'admissions' | 'fees' | 'schedule'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-adm-1');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const qSw = item.questionSw.toLowerCase();
      const qEn = item.questionEn.toLowerCase();
      const aSw = item.answerSw.toLowerCase();
      const aEn = item.answerEn.toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      return qSw.includes(q) || qEn.includes(q) || aSw.includes(q) || aEn.includes(q);
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="faq" className="py-16 sm:py-20 bg-gradient-to-b from-white via-[#F8FAFC] to-[#FFFFF0] border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black tracking-wider uppercase border border-amber-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'sw' ? 'MASWALI YANAYOULIZWA MARA KWA MARA' : 'FREQUENTLY ASKED QUESTIONS'}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight">
            {language === 'sw' ? 'Maswali & Majibu Kuhusu Uomboni' : 'Frequently Asked Questions (FAQ)'}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {language === 'sw'
              ? 'Pata majibu ya kina na ya papo hapo kuhusu udahili wa wanafunzi wapya, muundo wa ada na malipo, pamoja na ratiba na maisha ya kila siku shuleni.'
              : 'Find quick, clear answers regarding Form One admissions, transfers, affordable fee structures, and daily school routines at Uomboni Secondary School.'}
          </p>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 max-w-4xl mx-auto">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#102A43] hover:bg-white/60'
              }`}
            >
              {language === 'sw' ? 'Yote (All)' : 'All'}
            </button>
            <button
              onClick={() => setActiveCategory('admissions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeCategory === 'admissions'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#102A43] hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>{language === 'sw' ? 'Udahili' : 'Admissions'}</span>
            </button>
            <button
              onClick={() => setActiveCategory('fees')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeCategory === 'fees'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#102A43] hover:bg-white/60'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'sw' ? 'Ada & Malipo' : 'School Fees'}</span>
            </button>
            <button
              onClick={() => setActiveCategory('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeCategory === 'schedule'
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#102A43] hover:bg-white/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'sw' ? 'Ratiba & Maisha' : 'Daily Schedule'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'sw' ? 'Tafuta swali au jibu...' : 'Search questions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-[#102A43] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#102A43] focus:border-transparent transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {language === 'sw' ? 'Hakuna swali lililopatikana.' : 'No matching questions found.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-3 text-xs text-[#102A43] font-bold underline cursor-pointer"
              >
                {language === 'sw' ? 'Onyesha maswali yote' : 'Show all questions'}
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = expandedId === faq.id;
              const question = language === 'sw' ? faq.questionSw : faq.questionEn;
              const answer = language === 'sw' ? faq.answerSw : faq.answerEn;
              const highlights = language === 'sw' ? faq.highlightsSw : faq.highlightsEn;

              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-[#102A43]/30 shadow-md ring-1 ring-[#102A43]/10'
                      : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4.5 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <span className="p-1.5 rounded-lg bg-[#FFFFF0] border border-amber-200/80 text-[#102A43] shrink-0 mt-0.5">
                        {faq.category === 'admissions' && <BookOpen className="w-4 h-4 text-[#C9A227]" />}
                        {faq.category === 'fees' && <DollarSign className="w-4 h-4 text-emerald-600" />}
                        {faq.category === 'schedule' && <Clock className="w-4 h-4 text-blue-600" />}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#102A43] leading-snug">
                        {question}
                      </span>
                    </div>

                    <div
                      className={`p-1 rounded-full shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-[#102A43] text-white' : 'text-slate-400 hover:text-slate-600 bg-slate-100'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100">
                      <p className="mt-2 text-slate-600">{answer}</p>

                      {highlights && highlights.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            {language === 'sw' ? 'Muhtasari Muhimu:' : 'Key Highlights:'}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {highlights.map((h, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-[#FFFFF0] p-2 rounded-lg border border-amber-200/60">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Banner with Quick CTAs */}
        <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-[#102A43] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#C9A227]/30">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'sw' ? 'Bado una swali ambalo halijajibiwa?' : 'Still have unanswered questions?'}</span>
            </h4>
            <p className="text-xs text-slate-300 max-w-md">
              {language === 'sw'
                ? 'Ofisi ya taaluma na ushauri wa wanafunzi ipo tayari kukusaidia. Pakua hati zote za kujiunga au wasiliana nasi moja kwa moja.'
                : 'Our admissions desk and administration team are ready to assist. Download official documents or contact us directly.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {onOpenAdmissionDocuments && (
              <button
                onClick={onOpenAdmissionDocuments}
                className="liquid-btn liquid-btn-red px-4 py-2.5 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>STUDENT ADMISSION</span>
              </button>
            )}

            {onOpenContact && (
              <button
                onClick={onOpenContact}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Wasiliana Nasi' : 'Contact Us'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
