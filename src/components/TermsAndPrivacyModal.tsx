import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SchoolLogo } from './SchoolLogo';
import { X, ShieldCheck, FileText, Lock, CheckCircle2, ChevronRight } from 'lucide-react';

interface TermsAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 via-slate-900 to-amber-600/60 p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SchoolLogo size="sm" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-serif tracking-wide">
                UOMBONI SECONDARY SCHOOL
              </h2>
              <p className="text-[11px] text-amber-300/90 font-medium">
                {language === 'sw'
                  ? 'Sera ya Faragha & Masharti ya Matumizi (Privacy & Terms)'
                  : 'Privacy Policy & Terms of Service'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="Funga"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>{language === 'sw' ? 'Sera ya Faragha (Privacy Policy)' : 'Privacy Policy'}</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>{language === 'sw' ? 'Masharti ya Matumizi (Terms of Service)' : 'Terms of Service'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'privacy' ? (
            /* Privacy Policy Section */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'sw' ? 'Ulinzi wa Taarifa za Wanafunzi, Wazazi na Watumishi' : 'Protection of Student, Parent & Staff Data'}
                  </h3>
                  <p className="text-[12px] text-slate-300 mt-1">
                    {language === 'sw'
                      ? 'Shule ya Sekondari Uomboni (NECTA S0486) inazingatia kikamilifu Sheria ya Ulinzi wa Taarifa Binafsi ya Tanzania (Personal Data Protection Act, 2022).'
                      : 'Uomboni Secondary School strictly complies with the Tanzania Personal Data Protection Act, 2022, securing all academic, financial and personal data.'}
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
                    ? 'Tunakusanya barua pepe (ikiwemo anwani ya Google utakayochagua kupitia Google Sign-In), jina kamili, namba ya simu, na namba ya mtihani wa NECTA au usajili wa mwanafunzi kwa ajili ya usajili, malipo ya ada, na utoaji wa ripoti za maendeleo ya kitaaluma.'
                    : 'We collect your authorized email address (including chosen Google account via Google Sign-In), full name, phone number, and student registration/examination IDs to authenticate portal access, track fee transactions, and issue academic performance report sheets.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '2. Matumizi ya Kuingia kwa Google (Google Sign-In)' : '2. Google Sign-In & Email Choice'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Mfumo wetu unatumia Firebase Authentication yenye kipengele cha "select_account", kinachokuruhusu kuchagua anwani ya Google unayotaka kutumia (k.m. ya mzazi, mtumishi, au mwanafunzi). Shule haihifadhi nenosiri lako la Google bali hutumia uthibitisho rasmi uliolindwa.'
                    : 'Our system utilizes Firebase Authentication with interactive account selection, allowing users to choose whichever Google email they wish to log in with. We never view or store your Google password.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '3. Usalama na Uhifadhi wa Takwimu' : '3. Data Security & Firestore Encryption'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Data zote zimehifadhiwa kwenye wingu lililolindwa kwa sera za usalama (Security Rules & RBAC). Hakuna taarifa za wanafunzi zinazouzwa au kutolewa kwa watu au mashirika yasiyohusika.'
                    : 'All records are protected in encrypted Cloud Firestore databases with role-based access control. Student records are strictly confidential and never shared with unauthorized third parties.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '4. Mawasiliano na Usaidizi' : '4. Contact & Inquiries'}
                </h4>
                <p className="text-slate-400 text-xs">
                  Barua pepe: <span className="text-amber-300 font-mono">uombonisecondary@gmail.com</span> | Simu ya Ofisi: <span className="text-amber-300 font-mono">+255 782 558 127</span>
                </p>
              </div>
            </div>
          ) : (
            /* Terms of Service Section */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'sw' ? 'Mwongozo na Masharti ya Matumizi ya Tovuti na Mfumo' : 'Website & School Portal Terms of Service'}
                  </h3>
                  <p className="text-[12px] text-slate-300 mt-1">
                    {language === 'sw'
                      ? 'Kwa kutumia tovuti au mifumo ya kidijitali ya Shule ya Sekondari Uomboni, unakubali kufuata kanuni na maadili ya shule na sheria za nchi.'
                      : 'By accessing or utilizing the digital school portals of Uomboni Secondary School, you agree to adhere to school regulations, ethical internet use, and the Laws of Tanzania.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '1. Akaunti na Usalama wa Mfumo' : '1. Authorized Accounts'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Kila mtumiaji (Mwanafunzi, Mzazi, Mwalimu, Mhasibu, au Msimamizi) anawajibika kulinda taarifa zake za siri. Hairuhusiwi kushiriki akaunti za usimamizi au kuingilia mifumo bila idhini.'
                    : 'Users are responsible for safeguarding their login credentials. Unauthorized access attempts into staff or administration portals are strictly logged and prohibited.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '2. Malipo na Ada za Shule' : '2. Fee Payments & Official Receipts'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Malipo yote ya ada lazima yafanywe kupitia namba rasmi za akaunti ya benki ya Shule ya Sekondari Uomboni (CRDB Bank au KCB Bank) au namba rasmi ya Udahili iliyotangazwa kwenye tovuti hii. Stakabadhi rasmi hutolewa na Mhasibu wa Shule.'
                    : 'All school fees must be paid through designated official school bank accounts or payment instructions authorized by Uomboni Secondary School. Verified receipts are reconciled by the school bursar.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  {language === 'sw' ? '3. Haki Miliki' : '3. Intellectual Property'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {language === 'sw'
                    ? 'Nembo, picha, nyaraka za kujiunga (Joining Instructions), na matokeo ya kitaaluma ni mali ya Shule ya Sekondari Uomboni na Jimbo Katoliki la Moshi.'
                    : 'The school crest, photographic assets, Joining Instructions, and published academic records are the property of Uomboni Secondary School and the Catholic Diocese of Moshi.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {language === 'sw' ? 'Ilisasishwa: Machi 2026' : 'Last Updated: March 2026'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            {language === 'sw' ? 'Nimeelewa (Funga)' : 'I Understand (Close)'}
          </button>
        </div>
      </div>
    </div>
  );
};
