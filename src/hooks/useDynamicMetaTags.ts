import { useEffect } from 'react';

export interface MetaTagConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface DynamicMetaOptions {
  activeSection?: string;
  activeView?: string;
  hash?: string;
  isNectaOpen?: boolean;
  isParentPortalOpen?: boolean;
  isStaffPortalOpen?: boolean;
  isAdminOpen?: boolean;
  isBursarOpen?: boolean;
  isAcademicOpen?: boolean;
  isAdmissionsOpen?: boolean;
  isArchitectureOpen?: boolean;
  isSchoolResultsOpen?: boolean;
  language?: 'sw' | 'en';
}

const BASE_URL = 'https://www.uomboniss.sc.tz';
const DEFAULT_IMAGE = `${BASE_URL}/uomboni_flyer_2026.jpg`;

/**
 * Returns tailored SEO metadata for each section, portal modal, or system view.
 */
export function getSectionMetaData(options: DynamicMetaOptions): MetaTagConfig {
  const {
    activeSection = 'home',
    activeView,
    hash = '',
    isNectaOpen,
    isParentPortalOpen,
    isStaffPortalOpen,
    isAdminOpen,
    isBursarOpen,
    isAcademicOpen,
    isAdmissionsOpen,
    isArchitectureOpen,
    isSchoolResultsOpen,
    language = 'sw',
  } = options;

  const cleanHash = hash.replace(/^#/, '').toLowerCase();

  // 1. Modals & Hash-triggered Portal Gateways (Highest Priority)
  if (isNectaOpen || cleanHash === 'necta') {
    return {
      title: 'Matokeo Rasmi ya NECTA (S0486) | Uomboni Secondary School',
      description:
        'Tazama matokeo rasmi ya NECTA CSEE Kidato cha Nne na mitihani ya kitaifa ya Shule ya Sekondari Uomboni (Kituo cha NECTA S0486), Marangu Magharibi, Moshi Vijijini.',
      keywords: [
        'Matokeo ya NECTA S0486',
        'Uomboni Secondary School NECTA',
        'Matokeo Kidato cha Nne Uomboni',
        'CSEE Results Uomboni',
        'NECTA Marangu Moshi',
      ],
      canonicalUrl: `${BASE_URL}/#necta`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (isParentPortalOpen || cleanHash === 'parent' || cleanHash === 'wazazi') {
    return {
      title: 'Portal ya Wazazi (Parent Gateway) | Uomboni Secondary School',
      description:
        'Lango salama la wazazi na walezi wa Uomboni Secondary School: Fuatilia matokeo ya mwanao, mahudhurio, ankara za ada, control numbers na taarifa za maendeleo.',
      keywords: [
        'Parent Portal Uomboni',
        'Portal ya Wazazi Uomboni',
        'Ada Uomboni Secondary',
        'Matokeo ya Mwanafunzi Uomboni',
      ],
      canonicalUrl: `${BASE_URL}/#parent`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (isStaffPortalOpen || cleanHash === 'staff' || cleanHash === 'walimu' || cleanHash === 'staffportal') {
    return {
      title: 'Chumba cha Walimu & Staff Portal | Uomboni Secondary School',
      description:
        'Chumba cha Walimu na Mfumo wa Ndani wa Wafanyakazi wa Shule ya Sekondari Uomboni: Uingizaji wa alama za masomo, mahudhurio ya wanafunzi, na madaftari ya kitaaluma.',
      keywords: [
        'Chumba cha Walimu Uomboni',
        'Staff Portal Uomboni',
        'Walimu Uomboni Sec',
        'Gradebook Staffroom Marangu',
      ],
      canonicalUrl: `${BASE_URL}/#staff`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (isAcademicOpen || cleanHash === 'academic' || cleanHash === 'taaluma') {
    return {
      title: 'Idara ya Taaluma & Broadsheet | Uomboni Secondary School',
      description:
        'Mfumo rasmi wa Idara ya Taaluma ya Shule ya Sekondari Uomboni: Usimamizi wa mitihani ya Mock, Midterm, broadsheet za madarasa yote na tathmini ya GPA.',
      keywords: [
        'Taaluma Uomboni',
        'Academic Master Uomboni',
        'Broadsheet Uomboni',
        'Mitihani Uomboni Secondary',
      ],
      canonicalUrl: `${BASE_URL}/#academic`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (isBursarOpen || cleanHash === 'bursar' || cleanHash === 'mhasibu') {
    return {
      title: 'Uhasibu & Malipo ya Ada | Uomboni Secondary School',
      description:
        'Lango la Mhasibu wa Shule ya Sekondari Uomboni: Usimamizi wa malipo ya ada, ankara za benki, uthibitisho wa risiti na namba za malipo.',
      keywords: ['Uhasibu Uomboni', 'Bursar Uomboni', 'Malipo ya Ada Uomboni', 'School Fees Uomboni'],
      canonicalUrl: `${BASE_URL}/#bursar`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (isAdminOpen || cleanHash === 'admin' || cleanHash === 'uomboni' || cleanHash === 's0486') {
    return {
      title: 'Utawala Mkuu & Mfumo wa Shule | Uomboni Secondary School',
      description:
        'Lango la Uongozi Mkuu na Utawala wa Shule ya Sekondari Uomboni (NECTA S0486): Usimamizi wa wasifu, walimu, wanafunzi, na usalama wa mifumo.',
      keywords: ['Utawala Uomboni', 'Admin Portal Uomboni', 'Mkuu wa Shule Uomboni'],
      canonicalUrl: `${BASE_URL}/#admin`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (
    cleanHash === 'joining-instructions' ||
    cleanHash === 'joining' ||
    cleanHash === 'fomu-kujiunga' ||
    cleanHash === 'fomu' ||
    cleanHash === 'maelekezo-kujiunga'
  ) {
    return {
      title: 'Fomu Rasmi ya Kujiunga na Shule 2027 (Joining Instructions) | Uomboni Secondary School',
      description:
        'Fomu rasmi na maelekezo ya kujiunga na Shule ya Sekondari Uomboni (2027): Tarehe ya kufunguliwa 07/01/2027, mchanganuo wa ada ya bweni (TZS 1,600,000/=), sare na vifaa (TZS 224,000/=), akaunti za benki (CRDB, NMB, Mkombozi) na mahitaji ya bweni.',
      keywords: [
        'Fomu ya Kujiunga Uomboni 2027',
        'Joining Instructions Uomboni 2027',
        'Ada ya Shule Uomboni',
        'Akaunti za Benki Uomboni',
        'Mahitaji ya Bweni Uomboni',
        'Form One Joining Instructions 2027',
      ],
      canonicalUrl: `${BASE_URL}/#joining-instructions`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (cleanHash === 'vitu-muhimu' || cleanHash === 'mahitaji' || cleanHash === 'vitu' || cleanHash === 'requirements') {
    return {
      title: 'Vitu Muhimu vya Kujiunga na Shule | Uomboni Secondary School',
      description:
        'Orodha rasmi ya vitu muhimu vya kujiunga na Shule ya Sekondari Uomboni (NECTA S0486): Vifaa vya masomo na daftari, sare za shule, mahitaji ya bweni, sanduku la bati, nyaraka za usajili na vitu vilivyopigwa marufuku.',
      keywords: [
        'Vitu Muhimu Uomboni',
        'Mahitaji ya Kujiunga Uomboni',
        'Orodha ya Vitu vya Shule Uomboni',
        'Sare za Shule Uomboni',
        'Vifaa vya Bweni Uomboni Secondary',
      ],
      canonicalUrl: `${BASE_URL}/#vitu-muhimu`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (isAdmissionsOpen || cleanHash === 'admissions' || cleanHash === 'kujiunga') {
    return {
      title: 'Udahili & Maombi ya Kujiunga 2026/2027 | Uomboni Secondary School',
      description:
        'Nafasi za masomo Kidato cha I hadi IV (Kutwa na Bweni) katika Shule ya Sekondari Uomboni, Marangu Magharibi, Moshi. Pakua fomu ya kujiunga na maelezo ya ada.',
      keywords: [
        'Udahili Uomboni 2026',
        'Nafasi za Kujiunga Uomboni',
        'Joining Instructions Uomboni',
        'Form One Selection Uomboni',
        'Shule ya Bweni Marangu',
      ],
      canonicalUrl: `${BASE_URL}/#admissions`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (isSchoolResultsOpen || cleanHash === 'results') {
    return {
      title: 'Matokeo ya Mitihani ya Shule & Broadsheet | Uomboni Secondary School',
      description:
        'Kagua matokeo ya mitihani ya ndani ya muhula, tathmini ya mwezi, na mitihani ya utayari ya Kidato cha I, II, III na IV ya Shule ya Sekondari Uomboni.',
      keywords: ['Matokeo ya Shule Uomboni', 'Results Portal Uomboni', 'Terminal Exams Uomboni'],
      canonicalUrl: `${BASE_URL}/#results`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (isArchitectureOpen || cleanHash === 'architecture' || cleanHash === 'tech') {
    return {
      title: 'Muundo wa Mfumo & Usalama wa Data | Uomboni Secondary School',
      description:
        'Muundo wa kiteknolojia wa mfumo wa kidijitali wa Uomboni Secondary School: Usalama wa CSRF, ulinzi wa taarifa za wanafunzi, na utayari wa Vercel / Netlify.',
      keywords: ['System Architecture Uomboni', 'CSRF Protection', 'Vercel Deployment Uomboni'],
      canonicalUrl: `${BASE_URL}/#architecture`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  // 2. Active Views (Dedicated full-screen pages)
  if (activeView === 'welcome' || cleanHash === 'welcome' || cleanHash === 'karibu') {
    return {
      title: 'Welcome Screen (Animated Embossed Login) | Uomboni Secondary School',
      description:
        'Karibu Shule ya Sekondari Uomboni (NECTA S0486), Marangu - Moshi. Lango rasmi la kuingia kwenye mifumo ya shule na kutembelea tovuti rasmi ya shule.',
      keywords: ['Welcome Uomboni', 'Animated Embossed Login Uomboni', 'Karibu Uomboni Secondary'],
      canonicalUrl: `${BASE_URL}/#welcome`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (activeView === 'portal' || cleanHash === 'portal' || cleanHash === 'dashboard') {
    return {
      title: 'School Portal & Dashboard | Uomboni Secondary School (NECTA S0486)',
      description:
        'Lango kuu la mtandao wa ndani la Shule ya Sekondari Uomboni: Dashibodi ya wanafunzi, wazazi, na walimu kwa ajili ya maendeleo ya kitaaluma na taarifa za shule.',
      keywords: ['Portal Uomboni', 'Student Portal Uomboni', 'School Dashboard Uomboni S0486'],
      canonicalUrl: `${BASE_URL}/#portal`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (activeView === 'login' || cleanHash === 'login' || cleanHash === 'ingia') {
    return {
      title: 'Ingia Kwenye Mfumo (Staff & Portal Login) | Uomboni Secondary School',
      description:
        'Ingia kwa usalama kwenye mfumo wa kidijitali wa Shule ya Sekondari Uomboni (NECTA S0486). Upatikanaji wa alama, wasifu, na taarifa za shule.',
      keywords: ['Login Uomboni', 'Ingia Uomboni Secondary', 'Staff Login Uomboni'],
      canonicalUrl: `${BASE_URL}/#login`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  if (activeView === 'signup' || cleanHash === 'signup' || cleanHash === 'register') {
    return {
      title: 'Sajili Akaunti Mpya | Uomboni Secondary School Portal',
      description:
        'Fungua akaunti mpya ya mzazi au mwanafunzi katika mfumo rasmi wa Shule ya Sekondari Uomboni, Marangu, Kilimanjaro.',
      keywords: ['Register Uomboni', 'Sajili Akaunti Uomboni', 'Sign Up School Portal'],
      canonicalUrl: `${BASE_URL}/#signup`,
      ogImage: DEFAULT_IMAGE,
    };
  }

  // 3. Scrollable Page Sections
  switch (activeSection) {
    case 'about':
      return {
        title: 'Kuhusu Sisi & Historia | Shule ya Sekondari Uomboni (NECTA S0486)',
        description:
          'Fahamu historia ya Shule ya Sekondari Uomboni tangu kuanzishwa kwake, maono, dhamira, wito wa shule na mazingira tulivu ya kujisomea yaliyoko Marangu Magharibi, Moshi.',
        keywords: ['Kuhusu Uomboni', 'Historia ya Shule ya Uomboni', 'Marangu Magharibi Sekondari'],
        canonicalUrl: `${BASE_URL}/#about`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'academics':
      return {
        title: 'Taaluma & Mitaala ya Masomo | Shule ya Sekondari Uomboni',
        description:
          'Mitaala ya NECTA kwa Kidato cha I - IV: Sayansi (Fizikia, Kemia, Baiolojia), Biashara na Sanaa. Maabara za kisasa, maktaba na maandalizi thabiti ya mitihani ya taifa.',
        keywords: ['Taaluma Uomboni', 'Masomo Uomboni', 'Mitaala NECTA', 'Sayansi na Biashara Uomboni'],
        canonicalUrl: `${BASE_URL}/#academics`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'teachers':
      return {
        title: 'Walimu & Uongozi wa Taaluma | Shule ya Sekondari Uomboni',
        description:
          'Kutana na walimu wenye uzoefu, weledi wa juu na moyo wa kulea wanafunzi kimasomo na kimaadili katika Shule ya Sekondari Uomboni, Moshi Vijijini.',
        keywords: ['Walimu wa Uomboni', 'Uongozi wa Taaluma', 'Staff Directory Uomboni'],
        canonicalUrl: `${BASE_URL}/#teachers`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'parents':
      return {
        title: 'Wazazi na Walezi | Shule ya Sekondari Uomboni',
        description:
          'Ushirikiano thabiti kati ya wazazi na shule: Mikutano ya wazazi, malezi ya pamoja, maelezo ya ada na maendeleo ya wanafunzi wa Uomboni Secondary.',
        keywords: ['Wazazi Uomboni', 'Parents Association Uomboni', 'Mikutano ya Wazazi'],
        canonicalUrl: `${BASE_URL}/#parents`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'students':
      return {
        title: 'Maisha ya Wanafunzi & Bweni | Shule ya Sekondari Uomboni',
        description:
          'Mazingira safi ya mabweni, chakula bora, michezo, vilabu vya ubunifu na mijadala, na malezi ya kiroho kwa wanafunzi wa kutwa na bweni.',
        keywords: ['Maisha ya Wanafunzi Uomboni', 'Mabweni Uomboni', 'Michezo na Vilabu'],
        canonicalUrl: `${BASE_URL}/#students`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'management':
      return {
        title: 'Uongozi wa Shule & Bodi | Shule ya Sekondari Uomboni',
        description:
          'Bodi ya Shule na Uongozi Mkuu wa Shule ya Sekondari Uomboni wakiongoza kwa dira ya kutoa elimu bora yenye viwango vya juu vya kitaifa.',
        keywords: ['Bodi ya Shule Uomboni', 'Uongozi wa Shule Uomboni'],
        canonicalUrl: `${BASE_URL}/#management`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'admissions':
      return {
        title: 'Udahili & Nafasi za Kujiunga 2026/2027 | Uomboni Secondary School',
        description:
          'Nafasi za kujiunga na Kidato cha Kwanza hadi cha Nne. Maelezo ya fomu za kujiunga, michango, na taratibu zote za usajili Uomboni Secondary.',
        keywords: ['Udahili Uomboni', 'Joining Instructions Uomboni', 'Nafasi za Masomo Marangu'],
        canonicalUrl: `${BASE_URL}/#admissions`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'results':
      return {
        title: 'Matokeo Rasmi & Tathmini ya Ufaulu | Uomboni Secondary School',
        description:
          'Tazama matokeo ya NECTA CSEE, matokeo ya majaribio ya wilaya na mkoa, pamoja na ripoti za kina za maendeleo ya kila kidato.',
        keywords: ['Matokeo Uomboni', 'NECTA S0486', 'Broadsheet Uomboni'],
        canonicalUrl: `${BASE_URL}/#results`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'news':
      return {
        title: 'Habari, Matukio & Kalenda ya Shule | Uomboni Secondary School',
        description:
          'Habari za hivi punde, kalenda ya mihula ya masomo, matukio ya kitaaluma, mahafali na matangazo rasmi ya Shule ya Sekondari Uomboni.',
        keywords: ['Habari za Uomboni', 'Kalenda ya Shule', 'Matukio Uomboni'],
        canonicalUrl: `${BASE_URL}/#news`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'gallery':
      return {
        title: 'Matukio ya Picha & Maktaba ya Shule | Uomboni Secondary School',
        description:
          'Picha za shule, mandhari maridadi ya Mlima Kilimanjaro na Marangu, majengo ya shule, maabara za sayansi na shughuli za wanafunzi.',
        keywords: ['Picha za Uomboni', 'School Gallery Uomboni', 'Mazingira ya Marangu'],
        canonicalUrl: `${BASE_URL}/#gallery`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'contact':
      return {
        title: 'Wasiliana Nasi | Shule ya Sekondari Uomboni, Marangu Moshi',
        description:
          'Wasiliana na uongozi wa Shule ya Sekondari Uomboni: Simu +255 782 558 127, barua pepe, eneo shule lililopo Marangu Magharibi, Moshi Vijijini.',
        keywords: ['Wasiliana na Uomboni', 'Mawasiliano Uomboni Secondary', 'Marangu Magharibi Moshi'],
        canonicalUrl: `${BASE_URL}/#contact`,
        ogImage: DEFAULT_IMAGE,
      };

    case 'home':
    default:
      return {
        title:
          language === 'sw'
            ? 'Uomboni Secondary School | Official Results & Academic Portal (NECTA S0486)'
            : 'Uomboni Secondary School | Official Results & Academic Portal (NECTA S0486)',
        description:
          'Tovuti Rasmi ya Shule ya Sekondari Uomboni (NECTA S0486), Marangu Magharibi, Moshi Vijijini, Kilimanjaro. Mfumo kamili wa Udahili, Matokeo ya NECTA, Maisha ya Bweni, Vilabu, Walimu, Picha, Malipo ya Ada na Portal ya Wanafunzi.',
        keywords: [
          'Uomboni Secondary School',
          'Shule ya Sekondari Uomboni',
          'NECTA S0486',
          'Marangu Moshi Kilimanjaro',
          'Matokeo ya NECTA Uomboni',
          'Joining Instructions Uomboni',
        ],
        canonicalUrl: BASE_URL,
        ogImage: DEFAULT_IMAGE,
      };
  }
}

/**
 * Custom React Hook: useDynamicMetaTags
 *
 * Dynamically updates document head title, meta descriptions, OpenGraph tags,
 * Twitter cards, and canonical link whenever the user navigates sections,
 * changes views, or opens portal modals.
 */
export function useDynamicMetaTags(options: DynamicMetaOptions): MetaTagConfig {
  const meta = getSectionMetaData(options);

  useEffect(() => {
    // 1. Update Document Title
    if (meta.title && document.title !== meta.title) {
      document.title = meta.title;
    }

    // Helper to set or update meta tag
    const setMetaTag = (attribute: 'name' | 'property', value: string, content: string) => {
      let tag = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 2. Standard Meta Description
    if (meta.description) {
      setMetaTag('name', 'description', meta.description);
    }

    // 3. Keywords
    if (meta.keywords && meta.keywords.length > 0) {
      setMetaTag('name', 'keywords', meta.keywords.join(', '));
    }

    // 4. OpenGraph Tags
    if (meta.title) {
      setMetaTag('property', 'og:title', meta.title);
    }
    if (meta.description) {
      setMetaTag('property', 'og:description', meta.description);
    }
    if (meta.canonicalUrl) {
      setMetaTag('property', 'og:url', meta.canonicalUrl);
    }
    if (meta.ogImage) {
      setMetaTag('property', 'og:image', meta.ogImage);
    }
    setMetaTag('property', 'og:site_name', 'Shule ya Sekondari Uomboni');

    // 5. Twitter / X Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    if (meta.title) {
      setMetaTag('name', 'twitter:title', meta.title);
    }
    if (meta.description) {
      setMetaTag('name', 'twitter:description', meta.description);
    }
    if (meta.canonicalUrl) {
      setMetaTag('name', 'twitter:url', meta.canonicalUrl);
    }
    if (meta.ogImage) {
      setMetaTag('name', 'twitter:image', meta.ogImage);
    }

    // 6. Canonical URL Tag
    if (meta.canonicalUrl) {
      let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', meta.canonicalUrl);
    }
  }, [
    meta.title,
    meta.description,
    meta.canonicalUrl,
    meta.ogImage,
    meta.keywords,
  ]);

  return meta;
}

export default useDynamicMetaTags;
