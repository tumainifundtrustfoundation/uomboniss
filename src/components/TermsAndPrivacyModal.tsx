import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SchoolLogo } from './SchoolLogo';
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle2,
  RotateCcw,
  Cookie,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export type PolicyTab = 'terms' | 'privacy' | 'refund' | 'cookie' | 'content';

interface TermsAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
  onOpenResultsEntry?: () => void;
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
  onOpenResultsEntry,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  const tabs: { id: PolicyTab; labelSw: string; labelEn: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'terms', labelSw: 'Terms & Conditions', labelEn: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', labelSw: 'Privacy Policy', labelEn: 'Privacy Policy', icon: ShieldCheck },
    { id: 'refund', labelSw: 'Refund Policy', labelEn: 'Refund Policy', icon: RotateCcw },
    { id: 'cookie', labelSw: 'Cookie Policy', labelEn: 'Cookie Policy', icon: Cookie },
    { id: 'content', labelSw: 'Content Submission', labelEn: 'Content Submission Policy', icon: UploadCloud },
  ];

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#102A43] via-[#0A1C2E] to-slate-900 p-4 sm:p-6 border-b border-[#C9A227]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  OFFICIAL POLICIES
                </span>
                <span className="text-xs text-amber-300 font-mono">NECTA S0486</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-serif tracking-wide mt-0.5">
                UOMBONI SECONDARY SCHOOL POLICIES
              </h2>
              <p className="text-[11px] text-[#FFFFF0]/80 font-medium">
                {language === 'sw'
                  ? 'Sera, Kanuni, Masharti na Mwongozo Rasmi wa Kisheria na Kiutawala'
                  : 'Official Legal, Administrative & Educational Governance Policies'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Funga"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Switch (All 5 Policies) */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/80 p-2 gap-1.5 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#102A43] text-white border border-[#C9A227]/60 shadow-md ring-1 ring-amber-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C9A227]' : 'text-slate-400'}`} />
                <span>{language === 'sw' ? tab.labelSw : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed max-h-[60vh]">
          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'sw'
                      ? 'Masharti ya Matumizi ya Tovuti na Mifumo ya Shule (Terms & Conditions)'
                      : 'Terms & Conditions of Service'}
                  </h3>
                  <p className="text-[12px] text-slate-300 mt-1">
                    {language === 'sw'
                      ? 'Karibu kwenye mfumo rasmi wa kidijitali wa Shule ya Sekondari Uomboni (NECTA S0486). Kwa kutumia tovuti au huduma zetu, unakubali kuwajibika na kufuata masharti haya kwa mujibu wa miongozo ya shule, Jimbo Katoliki la Moshi, na Sheria za Jamhuri ya Muungano wa Tanzania.'
                      : 'Welcome to the official digital portal of Uomboni Secondary School (NECTA S0486). By accessing or using our website and services, you agree to be bound by these Terms and Conditions in accordance with school policies and Tanzanian Law.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '1. Matumizi Yanayoruhusiwa' : '1. Permitted Use'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Tovuti hii imeundwa kwa ajili ya kutoa taarifa za kitaaluma, fomu na maelekezo ya kujiunga (Joining Instructions), matokeo ya mitihani, maisha ya shule, malipo ya ada, na mawasiliano baina ya uongozi wa shule, wazazi, walimu na wanafunzi. Ni marufuku kutumia mfumo huu kwa shughuli zozote za udanganyifu au ukiukwaji wa usalama.'
                    : 'This portal is designed exclusively for educational information, admission joining documents, examination results, fee tracking, and communication among administrators, teachers, parents, and students. Unlawful or deceptive activities are strictly prohibited.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '2. Usalama wa Akaunti na Uidhinishaji' : '2. Account Security & Access Control'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Kila mtumiaji (Mwanafunzi, Mzazi, Mwalimu, Mhasibu, au Msimamizi Mkuu) anawajibika kikamilifu kulinda taarifa zake za siri (PIN, manenosiri na barua pepe ya Google). Kuingia kwenye mifumo ya watumishi bila idhini au kujifanya mtumishi wa shule ni kosa la jinai na mfumo wetu hurekodi anwani zote za IP na shughuli zote kwenye ukaguzi wa kiusalama (Audit Logs).'
                    : 'Users are responsible for safeguarding their login credentials. Unauthorized attempts to breach administrative or teacher portals are recorded in server audit logs with full IP and device telemetry.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '3. Haki Miliki na Nembo ya Shule' : '3. Intellectual Property Rights'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Nembo rasmi ya Shule ya Sekondari Uomboni, nembo ya Jimbo Katoliki la Moshi, maandishi, picha za wanafunzi na walimu, nembo za video na hati rasmi za mtihani ni mali halisi ya shule na zinalindwa chini ya sheria za haki miliki. Hairuhusiwi kutumia nembo ya shule kwa maslahi ya kibinafsi au ya kibiashara bila kibali cha maandishi kutoka kwa Mkuu wa Shule.'
                    : 'The school emblem, registered crest, photographic archives, joining document templates, and published examination brochettes are proprietary intellectual property of Uomboni Secondary School.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '4. Marekebisho ya Masharti' : '4. Modifications to Terms'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Bodi ya Usimamizi ya Shule ya Sekondari Uomboni inahifadhi haki ya kubadilisha masharti haya wakati wowote. Mabadiliko yoyote yatawekwa wazi kwenye ukurasa huu na kuanza kutumika mara moja.'
                    : 'The School Board reserves the right to amend these Terms at any time with immediate effect upon publishing here.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'sw'
                      ? 'Sera ya Faragha na Ulinzi wa Taarifa Binafsi (Privacy Policy)'
                      : 'Privacy Policy & Data Protection'}
                  </h3>
                  <p className="text-[12px] text-slate-300 mt-1">
                    {language === 'sw'
                      ? 'Shule ya Sekondari Uomboni (NECTA S0486) inazingatia kikamilifu Sheria ya Ulinzi wa Taarifa Binafsi ya Tanzania (Personal Data Protection Act, 2022). Usalama wa faragha ya wanafunzi, wazazi na wafanyakazi ndiyo kipaumbele chetu kikuu.'
                      : 'Uomboni Secondary School strictly complies with the Tanzania Personal Data Protection Act, 2022, securing all academic, financial and personal identity records.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '1. Taarifa Tunazokusanya' : '1. Information We Collect'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Tunakusanya taarifa muhimu tu kwa ajili ya huduma za shule: Majina kamili ya mwanafunzi na mzazi, namba za simu, barua pepe, namba ya mtihani wa NECTA, fomu anayosoma mwanafunzi, alama za masomo, na nambari za kumbukumbu ya malipo ya ada (Bank Reference Numbers).'
                    : 'We gather only requisite information: student and guardian names, phone contacts, email identifiers, NECTA examination numbers, classroom stream, academic marks, and fee payment proof references.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '2. Uthibitishaji wa Google (Google Sign-In)' : '2. Google Sign-In & Authentication'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Mfumo unatumia Firebase Authentication uliowezeshwa na Google Sign-In salama. Hatuhifadhi nenosiri lako la Google. Mfumo hutumia jina na barua pepe yako tu kuthibitisha jukumu lako kwenye shule (Mzazi, Mwanafunzi, au Mtumishi).'
                    : 'Authentication uses OAuth credentials through Firebase without ever storing Google passwords on our servers.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '3. Usalama wa Taarifa na Kutokushiriki na Wahusika Wengine' : '3. Strict Non-Disclosure Policy'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Shule haitoi, haiuzi, wala haishiriki taarifa za siri za wanafunzi au wazazi kwa makampuni ya matangazo au wahusika wasioidhinishwa. Taarifa za matokeo hutolewa kwa mujibu wa miongozo ya NECTA na sera ya shule.'
                    : 'Under no circumstances do we sell, rent, or lease personal records to external commercial marketing entities.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: REFUND POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'sw'
                      ? 'Sera ya Marejesho ya Ada na Michango ya Shule (Refund Policy)'
                      : 'Fee Payment & Refund Policy'}
                  </h3>
                  <p className="text-[12px] text-slate-300 mt-1">
                    {language === 'sw'
                      ? 'Mwongozo rasmi wa uhasibu na sera ya fedha kuhusu ada za masomo, michango ya bweni, ada ya kujiunga, na marejesho pindi inapotokea dharura au malipo ya ziada.'
                      : 'Official financial policies governing school fees, boarding dues, enrollment payments, and refund conditions for students and parents.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '1. Michango Isiyorejeshwa (Non-Refundable Fees)' : '1. Non-Refundable Charges'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Ada ya fomu ya kujiunga (Application/Admission fee), ada ya usajili wa mitihani ya NECTA, na gharama za sare zilizokwisha shonwa au vifaa vilivyokabidhiwa hazirejeshwi (Non-refundable) mara tu mchakato unapokamilika.'
                    : 'Application, admission processing fees, registration charges, custom uniforms, and educational supplies once issued are strictly non-refundable.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '2. Marejesho ya Ada ya Masomo na Bweni' : '2. Tuition & Boarding Refunds'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Iwapo mwanafunzi atahama au kutoendelea kabla muhula haujaanza, mzazi anaweza kuomba kurejeshewa ada ya masomo na chakula kwa kiwango kitakachoidhinishwa na Mkuu wa Shule na Bodi ya Usimamizi, baada ya kukata ada ya uendeshaji ya 10%. Mwanafunzi aliyehudhuria zaidi ya wiki tatu ndani ya muhula hatalipwa marejesho ya muhula huo.'
                    : 'If a student withdraws before the academic term starts, parents may request a tuition refund minus a 10% administrative fee. No refunds apply after 3 weeks of attendance in any given term.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '3. Malipo ya Ziada au Makosa ya Kibenki' : '3. Overpayments & Banking Discrepancies'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Ikiwa mzazi alilipa kiasi kinachozidi ada inayotakiwa au kulipa mara mbili kimakosa kupitia akaunti ya benki ya CRDB au KCB, kiasi cha ziada kinaweza kuhamishiwa kwenye ada ya muhula unaofuata au kurejeshwa kwa mzazi baada ya uthibitisho wa stakabadhi halisi na taarifa ya benki na Mhasibu wa Shule (Bursar).'
                    : 'Accidental overpayments can either be credited toward subsequent school terms or refunded upon verification with original bank deposit slips and reconciliation by the School Bursar.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '4. Utaratibu wa Kuwasilisha Ombi la Marejesho' : '4. How to Submit a Refund Claim'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Maombi yote ya marejesho lazima yawasilishwe kwa maandishi kwa Mkuu wa Shule (Headmaster) yakiambatana na nakala halisi ya stakabadhi za malipo, kitambulisho cha mzazi, na akaunti rasmi ya benki ya kurejeshea fedha.'
                    : 'All refund claims must be submitted in writing to the Headmaster along with original payment slips and valid national identification.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: COOKIE POLICY */}
          {activeTab === 'cookie' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
                <Cookie className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'sw'
                      ? 'Sera ya Vidakuzi na Uhifadhi wa Takwimu (Cookie & Storage Policy)'
                      : 'Cookie & Storage Policy'}
                  </h3>
                  <p className="text-[12px] text-slate-300 mt-1">
                    {language === 'sw'
                      ? 'Tovuti ya Shule ya Sekondari Uomboni inatumia vidakuzi na teknolojia salama za hifadhi ya ndani (Browser LocalStorage na SessionStorage) ili kuhakikisha mfumo unafanya kazi kwa kasi ya juu, hata ukiwa na mtandao mdogo au bila mtandao (Offline PWA).'
                      : 'We use strictly functional cookies, LocalStorage, and Progressive Web App cache to deliver instant page loads and offline resilience.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '1. Vidakuzi vya Kiutendaji (Essential Cookies & Storage)' : '1. Strictly Necessary Storage'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Tunahifadhi mapendeleo yako kama vile lugha unayochagua (Kiswahili au Kiingereza), hali ya ulinzi wa akaunti ya mtumishi, na uthibitishaji wa kuingia kwenye portal. Hizi ni muhimu ili usilazimike kuchagua upya kila unapofungua ukurasa mpya.'
                    : 'We store your preferred language (Swahili or English), active portal sessions, and authentication security tokens.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '2. Uhifadhi wa Nje ya Mtandao (PWA Offline Cache)' : '2. PWA Cache Storage'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Kupitia Service Worker, faili za muundo wa tovuti, picha za nembo, na fomu za kujiunga huhifadhiwa kwenye kumbukumbu ya simu au kompyuta yako ili uweze kusoma taarifa hata pale mtandao unapokatika.'
                    : 'Public website shells, icons, and joining documents are cached locally so parents and students can access them even during internet downtime.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '3. Hakuna Vidakuzi vya Matangazo ya Biashara' : '3. Zero Commercial Advertising Trackers'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Tovuti ya Uomboni haina matangazo yoyote ya kibiashara na haitumii vidakuzi vya kufuatilia mwenendo wako wa mtandao nje ya tovuti hii (No 3rd-party ad tracking cookies).'
                    : 'Uomboni Secondary School runs zero commercial advertisement scripts and never tracks your browsing across other external websites.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: CONTENT SUBMISSION POLICY */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-start gap-3">
                <UploadCloud className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'sw'
                      ? 'Sera ya Uwasilishaji wa Maudhui, Matokeo na Nyaraka (Content Submission Policy)'
                      : 'Content Submission & Data Integrity Policy'}
                  </h3>
                  <p className="text-[12px] text-slate-300 mt-1">
                    {language === 'sw'
                      ? 'Mwongozo na masharti kwa walimu wanaoingiza matokeo ya masomo, wazazi wanaotuma maoni na fomu, na wasimamizi wanaopakia picha au taarifa za shule.'
                      : 'Strict integrity standards for teachers entering marks, parents uploading forms, and administrators publishing media or academic updates.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '1. Uingizaji wa Alama na Matokeo ya Mitihani' : '1. Student Marks & Results Entry Standards'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Walimu na wasimamizi wa masomo wanapaswa kuingiza alama sahihi zilizothibitishwa kupitia karatasi rasmi za mtihani au faili za Excel. Ni marufuku kubadilisha alama za mwanafunzi bila idhini ya Mtaaluma Mkuu (Academic Master). Mfumo unarekodi mtumishi aliyeweka alama na tarehe ya uhifadhi.'
                    : 'Scores submitted via Teacher Subject Score Entry or Excel files must be strictly authenticated. All score entries log the submitter email, timestamp, and audit trail.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '2. Uwasilishaji wa Picha na Video za Wanafunzi' : '2. Media & Child Safeguarding Policy'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Picha zote za matukio ya shule, mahafali, michezo, na maabara zinazopakiwa kwenye tovuti lazima zizingatie heshima na maadili ya Kikatoliki na sera ya malezi ya mtoto (Child Protection Policy). Hairuhusiwi kupakia picha zinazokiuka utu au heshima ya mwanafunzi yeyote.'
                    : 'All school media and gallery photos must strictly uphold Catholic moral principles, student dignity, and child safeguarding standards.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '3. Uwasilishaji wa Fomu za Udahili na Maoni ya Wazazi' : '3. Admission Applications & Parent Inquiries'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Wazazi na walezi wanaowasilisha fomu za maombi mtandaoni wanapaswa kuwasilisha vyeti na taarifa za kweli. Uwasilishaji wa vyeti bandia utapelekea maombi kufutwa mara moja na kuchukuliwa hatua stahiki za kisheria.'
                    : 'Parents submitting admission forms or student documentation must furnish truthful records. Forged certificates result in immediate disqualification.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              {language === 'sw' ? 'Toleo Rasmi: Oktoba 2026' : 'Official Edition: October 2026'}
            </span>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => {
                onClose();
                if (onOpenResultsEntry) {
                  onOpenResultsEntry();
                } else {
                  window.location.hash = '#uingizaji-matokeo';
                }
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{language === 'sw' ? 'Lango la Uingizaji wa Matokeo' : 'Results Entry Portal'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {language === 'sw' ? 'Nimeelewa (Funga)' : 'I Understand (Close)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
