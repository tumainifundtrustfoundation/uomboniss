/**
 * Uomboni Secondary School — Programmatic SEO & Dynamic Metadata Service
 * 
 * Generates tailored search engine optimization (SEO), OpenGraph cards,
 * Twitter cards, canonical links, and Schema.org (JSON-LD) structured data
 * for specific dynamic pages (Results, Admissions, News, Academics, Staff).
 */

import { useEffect } from 'react';

export const CANONICAL_BASE = 'https://www.uomboniss.sc.tz';
export const DEFAULT_SHARE_IMAGE = `${CANONICAL_BASE}/uomboni_flyer_2026.jpg`;
export const SCHOOL_NAME = 'Uomboni Secondary School';
export const NECTA_CENTRE_CODE = 'S0486';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface PageSeoOptions {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  schema?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
  language?: 'sw' | 'en';
}

/**
 * Builds the canonical URL from a path or relative string.
 */
export function buildCanonicalUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return CANONICAL_BASE;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${CANONICAL_BASE}${cleanPath}`;
}

/**
 * Generates SEO metadata for Results & Examination pages (NECTA, Mock, Termly).
 */
export function generateResultsSeo(params?: {
  examType?: string;
  year?: number | string;
  formClass?: string;
  studentName?: string;
}): PageSeoOptions {
  const exam = params?.examType || 'NECTA CSEE';
  const year = params?.year || new Date().getFullYear();
  const form = params?.formClass ? ` - ${params.formClass}` : '';
  const student = params?.studentName ? ` kwa ${params.studentName}` : '';

  const title = `Matokeo ya ${exam} ${year}${form}${student} | Uomboni Secondary (NECTA ${NECTA_CENTRE_CODE})`;
  const description = `Tazama matokeo rasmi ya mtihani wa ${exam} mwaka ${year}${form} ya Shule ya Sekondari Uomboni (Kituo cha NECTA S0486), Marangu Magharibi, Moshi Vijijini. Takwimu za ufaulu, madaraja ya Division I-IV na nafasi za wanafunzi.`;

  const canonicalPath = `/results?exam=${encodeURIComponent(exam)}&year=${encodeURIComponent(String(year))}`;

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Mwanzo', url: CANONICAL_BASE },
    { name: 'Matokeo ya Shule', url: `${CANONICAL_BASE}/results` },
    { name: `${exam} ${year}`, url: `${CANONICAL_BASE}${canonicalPath}` },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Matokeo ya Mitihani ya ${exam} ${year} - Uomboni Secondary School`,
    description: description,
    url: `${CANONICAL_BASE}${canonicalPath}`,
    keywords: [
      `Matokeo ya ${exam} ${year}`,
      `NECTA ${NECTA_CENTRE_CODE}`,
      'Uomboni Secondary Results',
      'Matokeo Kidato cha Nne Marangu',
      'Division I CSEE Uomboni',
    ],
    creator: {
      '@type': 'EducationalOrganization',
      name: SCHOOL_NAME,
      identifier: NECTA_CENTRE_CODE,
      url: CANONICAL_BASE,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Marangu Magharibi',
        addressRegion: 'Kilimanjaro',
        addressCountry: 'Tanzania',
      },
    },
    temporalCoverage: `${year}`,
  };

  return {
    title,
    description,
    keywords: [
      `Matokeo ya ${exam} ${year}`,
      `NECTA ${NECTA_CENTRE_CODE}`,
      'Matokeo ya Kidato cha Nne Uomboni',
      'CSEE Results Marangu Moshi',
      'Uomboni Secondary School Results',
      'FTNA Form Two Results',
    ],
    canonicalPath,
    ogType: 'website',
    ogImage: DEFAULT_SHARE_IMAGE,
    ogImageAlt: `Matokeo ya Mitihani ${exam} ${year} - Uomboni Secondary`,
    twitterCard: 'summary_large_image',
    breadcrumbs,
    schema,
  };
}

/**
 * Generates SEO metadata for Admissions, Joining Instructions & Fee structure.
 */
export function generateAdmissionsSeo(params?: {
  academicYear?: number | string;
  deadline?: string;
  formLevel?: string;
}): PageSeoOptions {
  const nextYear = new Date().getFullYear() + 1;
  const year = params?.academicYear || `${new Date().getFullYear()}/${nextYear}`;
  const form = params?.formLevel || 'Kidato cha Kwanza na Uhamisho';

  const title = `Nafasi za Kujiunga & Udahili ${year} (${form}) | Uomboni Secondary School`;
  const description = `Fomu za kujiunga (Joining Instructions) na nafasi za masomo ${year} Shule ya Sekondari Uomboni (NECTA S0486), Marangu Moshi. Masomo ya Kutwa na Bweni kwa wavulana na wasichana. Pakua fomu na maelezo ya ada.`;

  const canonicalPath = '/admissions';

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Mwanzo', url: CANONICAL_BASE },
    { name: 'Udahili & Fomu za Kujiunga', url: `${CANONICAL_BASE}/admissions` },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: `Udahili wa Sekondari ${year} - Shule ya Sekondari Uomboni`,
    description: description,
    provider: {
      '@type': 'School',
      name: SCHOOL_NAME,
      identifier: NECTA_CENTRE_CODE,
      url: CANONICAL_BASE,
      telephone: '+255782558127',
      email: 'info@uomboniss.sc.tz',
    },
    educationalProgramMode: ['Full-time', 'Boarding', 'Day'],
    programPrerequisites: 'Kuhitimu Elimu ya Msingi (Standard 7) au Uhamisho wa Kidato cha 1-3',
    offers: {
      '@type': 'Offer',
      category: 'School Fees',
      priceCurrency: 'TZS',
      description: 'Ada nafuu ya shule inalipwa kupitia akaunti rasmi ya CRDB ya shule (0150283084300).',
    },
  };

  return {
    title,
    description,
    keywords: [
      `Nafasi za Kujiunga Uomboni ${year}`,
      'Joining Instructions Uomboni Secondary',
      'Fomu ya Kujiunga Kidato cha Kwanza Moshi',
      'Udahili wa Wanafunzi wa Bweni Marangu',
      'Ada ya Shule ya Sekondari Uomboni',
      'Secondary School Admissions Kilimanjaro',
    ],
    canonicalPath,
    ogType: 'website',
    ogImage: DEFAULT_SHARE_IMAGE,
    ogImageAlt: 'Fomu za Kujiunga na Udahili Uomboni Secondary School',
    twitterCard: 'summary_large_image',
    breadcrumbs,
    schema,
  };
}

/**
 * Generates SEO metadata for School News articles and announcements.
 */
export function generateNewsSeo(newsItem: {
  title: string;
  summary: string;
  date?: string;
  author?: string;
  imageUrl?: string;
  id?: string;
  tags?: string[];
}): PageSeoOptions {
  const title = `${newsItem.title} | Habari za Shule - Uomboni Secondary`;
  const description = newsItem.summary.length > 160 
    ? `${newsItem.summary.substring(0, 157)}...` 
    : newsItem.summary;

  const canonicalPath = newsItem.id ? `/news/${encodeURIComponent(newsItem.id)}` : '/news';
  const ogImage = newsItem.imageUrl || DEFAULT_SHARE_IMAGE;

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Mwanzo', url: CANONICAL_BASE },
    { name: 'Habari na Matukio', url: `${CANONICAL_BASE}/news` },
    { name: newsItem.title, url: `${CANONICAL_BASE}${canonicalPath}` },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: newsItem.title,
    description: description,
    image: [ogImage],
    datePublished: newsItem.date || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: newsItem.author || SCHOOL_NAME,
      url: CANONICAL_BASE,
    },
    publisher: {
      '@type': 'School',
      name: SCHOOL_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${CANONICAL_BASE}/uomboni_official_logo.jpg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${CANONICAL_BASE}${canonicalPath}`,
    },
  };

  return {
    title,
    description,
    keywords: [
      'Habari za Shule ya Sekondari Uomboni',
      'Matangazo ya Uomboni Moshi',
      ...(newsItem.tags || []),
    ],
    canonicalPath,
    ogType: 'article',
    ogImage,
    ogImageAlt: newsItem.title,
    author: newsItem.author || SCHOOL_NAME,
    publishedTime: newsItem.date,
    twitterCard: 'summary_large_image',
    breadcrumbs,
    schema,
  };
}

/**
 * Generates SEO metadata for Academics & Curriculum subjects.
 */
export function generateAcademicsSeo(subjectName?: string): PageSeoOptions {
  const subjectText = subjectName ? `Somo la ${subjectName}` : 'Mitaala na Idara za Masomo';
  const title = `${subjectText} | Taaluma na Masomo - Uomboni Secondary (NECTA S0486)`;
  const description = `Mitaala na maandalizi ya kitaaluma ya ${subjectText} katika Shule ya Sekondari Uomboni, Marangu Moshi. Masomo ya Sayansi, Biashara, Lugha na Sanaa kulingana na muongozo wa NECTA Tanzania.`;

  const canonicalPath = subjectName ? `/academics/${encodeURIComponent(subjectName.toLowerCase())}` : '/academics';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: subjectText,
    description: description,
    provider: {
      '@type': 'School',
      name: SCHOOL_NAME,
      sameAs: CANONICAL_BASE,
    },
  };

  return {
    title,
    description,
    keywords: [
      subjectName ? `Somo la ${subjectName} Uomboni` : 'Mitaala ya Sekondari Tanzania',
      'Sayansi na Maabara Uomboni',
      'NECTA Curriculum O-Level',
      'Taaluma Shule ya Sekondari Uomboni',
    ],
    canonicalPath,
    ogType: 'website',
    ogImage: DEFAULT_SHARE_IMAGE,
    twitterCard: 'summary_large_image',
    schema,
  };
}

/**
 * Programmatically injects or updates all meta tags, canonical link, and JSON-LD
 * in document.head. Returns a cleanup function to revert on unmount.
 */
export function applyPageSeo(options: PageSeoOptions): () => void {
  if (typeof document === 'undefined') return () => {};

  const previousTitle = document.title;

  // 1. Title
  if (options.title) {
    document.title = options.title;
  }

  const helperSetMeta = (attribute: 'name' | 'property', key: string, content?: string | null) => {
    if (!content) return;
    let el = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attribute, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Standard Meta
  helperSetMeta('name', 'description', options.description);
  if (options.keywords && options.keywords.length > 0) {
    helperSetMeta('name', 'keywords', options.keywords.join(', '));
  }
  if (options.author) {
    helperSetMeta('name', 'author', options.author);
  }
  if (options.noindex) {
    helperSetMeta('name', 'robots', 'noindex, nofollow');
  } else {
    helperSetMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }

  // 3. OpenGraph
  const canonicalUrl = options.canonicalUrl || buildCanonicalUrl(options.canonicalPath);
  helperSetMeta('property', 'og:title', options.title);
  helperSetMeta('property', 'og:description', options.description);
  helperSetMeta('property', 'og:type', options.ogType || 'website');
  helperSetMeta('property', 'og:url', canonicalUrl);
  helperSetMeta('property', 'og:site_name', SCHOOL_NAME);
  helperSetMeta('property', 'og:image', options.ogImage || DEFAULT_SHARE_IMAGE);
  if (options.ogImageAlt) {
    helperSetMeta('property', 'og:image:alt', options.ogImageAlt);
  }
  helperSetMeta('property', 'og:locale', options.language === 'en' ? 'en_US' : 'sw_TZ');

  if (options.ogType === 'article') {
    if (options.publishedTime) {
      helperSetMeta('property', 'article:published_time', options.publishedTime);
    }
    if (options.modifiedTime) {
      helperSetMeta('property', 'article:modified_time', options.modifiedTime);
    }
  }

  // 4. Twitter / X
  helperSetMeta('name', 'twitter:card', options.twitterCard || 'summary_large_image');
  helperSetMeta('name', 'twitter:title', options.title);
  helperSetMeta('name', 'twitter:description', options.description);
  helperSetMeta('name', 'twitter:url', canonicalUrl);
  helperSetMeta('name', 'twitter:image', options.ogImage || DEFAULT_SHARE_IMAGE);

  // 5. Canonical Link
  let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute('href', canonicalUrl);

  // 6. Schema.org JSON-LD Structured Data
  let scriptSchema = document.querySelector('script#dynamic-seo-schema') as HTMLScriptElement | null;
  if (!scriptSchema) {
    scriptSchema = document.createElement('script');
    scriptSchema.id = 'dynamic-seo-schema';
    scriptSchema.type = 'application/ld+json';
    document.head.appendChild(scriptSchema);
  }

  const jsonLdPayload: any[] = [];

  // Breadcrumbs Schema
  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    jsonLdPayload.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: options.breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: b.url,
      })),
    });
  }

  // Custom Schema
  if (options.schema) {
    if (Array.isArray(options.schema)) {
      jsonLdPayload.push(...options.schema);
    } else {
      jsonLdPayload.push(options.schema);
    }
  }

  if (jsonLdPayload.length > 0) {
    scriptSchema.textContent = JSON.stringify(jsonLdPayload.length === 1 ? jsonLdPayload[0] : jsonLdPayload);
  }

  // Cleanup handler
  return () => {
    if (previousTitle) {
      document.title = previousTitle;
    }
  };
}

/**
 * React Hook for declarative page SEO management.
 */
export function usePageSeo(
  options: PageSeoOptions | (() => PageSeoOptions),
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const opts = typeof options === 'function' ? options() : options;
    const cleanup = applyPageSeo(opts);
    return cleanup;
  }, [
    typeof options === 'object' ? options.title : '',
    typeof options === 'object' ? options.description : '',
    typeof options === 'object' ? options.canonicalPath : '',
    ...deps,
  ]);
}

/**
 * Generates raw HTML string of all meta and structured data tags.
 * Ideal for SSR, prerendering, or building static templates.
 */
export function generateMetaTagsHtml(options: PageSeoOptions): string {
  const canonicalUrl = options.canonicalUrl || buildCanonicalUrl(options.canonicalPath);
  const image = options.ogImage || DEFAULT_SHARE_IMAGE;
  const card = options.twitterCard || 'summary_large_image';
  const robots = options.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  let html = `
<title>${escapeHtml(options.title)}</title>
<meta name="description" content="${escapeHtml(options.description)}" />
<meta name="robots" content="${robots}" />
<link rel="canonical" href="${canonicalUrl}" />

<!-- OpenGraph / Facebook -->
<meta property="og:type" content="${options.ogType || 'website'}" />
<meta property="og:title" content="${escapeHtml(options.title)}" />
<meta property="og:description" content="${escapeHtml(options.description)}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:site_name" content="${escapeHtml(SCHOOL_NAME)}" />
<meta property="og:image" content="${image}" />
<meta property="og:locale" content="${options.language === 'en' ? 'en_US' : 'sw_TZ'}" />

<!-- Twitter / X -->
<meta name="twitter:card" content="${card}" />
<meta name="twitter:title" content="${escapeHtml(options.title)}" />
<meta name="twitter:description" content="${escapeHtml(options.description)}" />
<meta name="twitter:url" content="${canonicalUrl}" />
<meta name="twitter:image" content="${image}" />
`;

  if (options.keywords && options.keywords.length > 0) {
    html += `<meta name="keywords" content="${escapeHtml(options.keywords.join(', '))}" />\n`;
  }

  if (options.schema) {
    html += `
<script type="application/ld+json">
${JSON.stringify(options.schema, null, 2)}
</script>
`;
  }

  return html.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
