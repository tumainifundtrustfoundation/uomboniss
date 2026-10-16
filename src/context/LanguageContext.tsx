import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { sw: 'Mwanzo', en: 'Home' },
  'nav.about': { sw: 'Kuhusu Shule', en: 'About Us' },
  'nav.results': { sw: 'Matokeo ya Wanafunzi', en: 'Student Results' },
  'nav.news': { sw: 'Habari na Matukio', en: 'News & Events' },
  'nav.gallery': { sw: 'Picha za Matukio', en: 'Photo Gallery' },
  'nav.leadership': { sw: 'Uongozi na Walimu', en: 'Leadership & Staff' },
  'nav.fees': { sw: 'Malipo ya Ada & Benki', en: 'Fees & Bank Accounts' },
  'nav.admissions': { sw: 'Fomu za Kujiunga', en: 'Joining Instructions' },
  'nav.analytics': { sw: 'Takwimu za Kitaaluma', en: 'Academic Analytics' },
  'nav.contact': { sw: 'Mawasiliano na Maoni', en: 'Contact & Feedback' },
  'nav.admin': { sw: 'Sehemu ya Admin', en: 'Admin Portal' },

  // School Identity
  'school.name': { sw: 'SHULE YA SEKONDARI UOMBONI', en: 'UOMBONI SECONDARY SCHOOL' },
  'school.tagline': { sw: 'Jimbo Katoliki Moshi • Marangu, Kilimanjaro', en: 'Catholic Diocese of Moshi • Marangu, Kilimanjaro' },
  'school.motto': { sw: 'Elimu ni Mwanga na Maadili Mema', en: 'Education, Faith & Moral Excellence' },
  'school.nectaCode': { sw: 'Kituo cha Mitihani NECTA: S0486', en: 'NECTA Examination Centre: S0486' },

  // Hero Section
  'hero.badge': { sw: 'Shule ya Sekondari ya Bweni & Kutwa (Form 1 - Form 4)', en: 'Boarding & Day Secondary School (Form 1 - Form 4)' },
  'hero.title': { sw: 'Kulea Taaluma Bora, Nidhamu ya Kiroho na Maadili Chini ya Mlima Kilimanjaro', en: 'Nurturing Academic Excellence, Christian Morals & Leadership on the Slopes of Mt. Kilimanjaro' },
  'hero.subtitle': { sw: 'Shule ya Sekondari Uomboni iliyopo Marangu Magharibi, Wilaya ya Moshi Vijijini, Kilimanjaro (NECTA Kituo S0486), ikitoa elimu bora ya sekondari kwa mazingira tulivu.', en: 'Uomboni Secondary School located in Marangu West, Moshi Rural District, Kilimanjaro (NECTA Center S0486), offering quality secondary education in a serene climate.' },
  'hero.btnResults': { sw: 'Angalia Matokeo ya Mtihani', en: 'Check Examination Results' },
  'hero.btnJoining': { sw: 'Pakua Fomu za Kujiunga 2026', en: 'Download Joining Instructions' },
  'hero.btnPay': { sw: 'Lipa Ada Mtandaoni', en: 'Pay School Fees Online' },
  'hero.btnInquiry': { sw: 'Wasilisha Maoni / Swali', en: 'Submit Parent Inquiry' },

  // Stats Counters
  'stats.passRate': { sw: 'Kufaulu NECTA CSEE', en: 'NECTA CSEE Pass Rate' },
  'stats.division1and2': { sw: 'Wanafunzi Div I & II', en: 'Division I & II Rate' },
  'stats.students': { sw: 'Wanafunzi Waliosajiliwa', en: 'Enrolled Students' },
  'stats.staff': { sw: 'Walimu Waliobobea', en: 'Qualified Teachers' },

  // Results Checker
  'results.title': { sw: 'Viungo Rasmi vya Matokeo ya Mitihani ya Shule na NECTA', en: 'Official School & NECTA Examination Results Links' },
  'results.subtitle': { sw: 'Bofya kiungo cha mtihani wa kidato husika kufungua matokeo rasmi moja kwa moja mtandaoni (NECTA, Mock, Terminal na Nusu Muhula).', en: 'Click on any examination link below to instantly open the official results online (NECTA, Mock, Terminal, and Mid-Term).' },
  'results.searchPlaceholder': { sw: 'Andika Namba ya Mtihani au Jina...', en: 'Search by Exam No. or Student Name...' },
  'results.filterClass': { sw: 'Chagua Kidato', en: 'Select Class' },
  'results.filterExam': { sw: 'Chagua Mtihani', en: 'Select Exam Type' },
  'results.btnSearch': { sw: 'Tafuta Matokeo', en: 'Find Results' },
  'results.btnPrint': { sw: 'Pakua / Chapisha Ripoti (PDF)', en: 'Print / Download Slip (PDF)' },
  'results.demoNotice': { sw: 'Mfano wa Namba za Kujaribu:', en: 'Sample Exam Numbers to test:' },

  // Fees Section
  'fees.title': { sw: 'Mfumo wa Malipo ya Ada na Akaunti za Benki', en: 'School Fees Payment & Bank Accounts' },
  'fees.subtitle': { sw: 'Malipo yote ya ada na michango ya shule hufanyika moja kwa moja kupitia akaunti rasmi za benki za shule au mitandao ya simu.', en: 'All school fees and contributions are deposited directly into official bank accounts or verified mobile merchant numbers.' },
  'fees.copySuccess': { sw: 'Namba ya Akaunti Imenakiliwa!', en: 'Account Number Copied!' },
  'fees.submitProof': { sw: 'Wasilisha Taarifa za Muamala wa Malipo', en: 'Submit Payment Transaction Verification' },
  'fees.verifyTitle': { sw: 'Kupata Risiti ya Papo Hapo', en: 'Generate Instant Digital Receipt' },

  // Joining Section
  'joining.title': { sw: 'Fomu za Kujiunga na Maelekezo ya Usajili', en: 'Joining Instructions & Admission Forms' },
  'joining.subtitle': { sw: 'Pakua moja kwa moja fomu za maelekezo ya kujiunga kidato cha kwanza, nafasi za uhamisho, fomu za afya na kanuni za shule.', en: 'Download official Form One joining instructions, student transfer packs, medical forms, and code of conduct directly.' },
  'joining.btnDownload': { sw: 'Pakua Fomu Hii', en: 'Download This Form' },
  'joining.btnPreview': { sw: 'Soma Fomu Mtandaoni', en: 'Preview Document Online' },

  // Analytics Section
  'analytics.title': { sw: 'Takwimu za Wanafunzi na Utendaji wa Kitaaluma', en: 'Student Enrollment & Academic Performance Analytics' },
  'analytics.subtitle': { sw: 'Uchambuzi wa wazi wa idadi ya wanafunzi waliosajiliwa kuanzia Kidato cha Kwanza hadi cha Nne na matokeo ya NECTA kwa grafu.', en: 'Transparent visual metrics of student enrollments from Form 1 to Form 4, gender ratios, and multi-year NECTA trends.' },
  
  // Feedback Section
  'feedback.title': { sw: 'Mawasiliano, Maoni na Maswali ya Wazazi/Walezi', en: 'Parent Inquiries & Feedback Portal' },
  'feedback.subtitle': { sw: 'Uongozi wa Shule ya Sekondari Uomboni unathamini ushirikiano wa karibu na wazazi na walezi kwa maendeleo ya mwanafunzi.', en: 'School leadership values active engagement with parents and guardians for holistic child development.' },
  'feedback.submitBtn': { sw: 'Tuma Ujumbe / Maoni Yako', en: 'Submit Inquiry / Feedback' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('uomboni_lang');
    return (saved === 'en' || saved === 'sw') ? saved : 'sw';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('uomboni_lang', lang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
