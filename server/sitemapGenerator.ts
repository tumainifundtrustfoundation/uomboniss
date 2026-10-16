export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const CANONICAL_DOMAIN = 'https://www.uomboniss.sc.tz';

/**
 * Valid canonical public pages for search engines (RFC sitemap standard).
 * Hash URLs (#) are omitted per Google Search Console and Bing Webmaster guidelines.
 * Private administration, student dashboards, staff gates, and login portals are excluded.
 */
export const OFFICIAL_SITEMAP_ENTRIES: SitemapUrlEntry[] = [
  // 1. Root Homepage
  {
    loc: `${CANONICAL_DOMAIN}/`,
    changefreq: 'daily',
    priority: 1.0,
  },
  // 2. Admissions & Joining Instructions
  {
    loc: `${CANONICAL_DOMAIN}/admissions`,
    changefreq: 'weekly',
    priority: 0.95,
  },
  {
    loc: `${CANONICAL_DOMAIN}/admission-documents`,
    changefreq: 'weekly',
    priority: 0.95,
  },
  // 3. Official Results & Academic Performance
  {
    loc: `${CANONICAL_DOMAIN}/results`,
    changefreq: 'weekly',
    priority: 0.9,
  },
  // 4. Academics, Curriculum & Examination Preparation
  {
    loc: `${CANONICAL_DOMAIN}/academics`,
    changefreq: 'weekly',
    priority: 0.9,
  },
  // 5. About Uomboni Secondary School (History, Motto, Mission)
  {
    loc: `${CANONICAL_DOMAIN}/about`,
    changefreq: 'monthly',
    priority: 0.85,
  },
  // 6. School Facilities & Campus Infrastructure
  {
    loc: `${CANONICAL_DOMAIN}/facilities`,
    changefreq: 'monthly',
    priority: 0.8,
  },
  // 7. News, Announcements & School Events
  {
    loc: `${CANONICAL_DOMAIN}/news`,
    changefreq: 'daily',
    priority: 0.85,
  },
  // 8. Frequently Asked Questions (FAQ - Admissions, Fees, Routine)
  {
    loc: `${CANONICAL_DOMAIN}/faq`,
    changefreq: 'weekly',
    priority: 0.85,
  },
  // 9. Contact Information & Administrative Offices
  {
    loc: `${CANONICAL_DOMAIN}/contact`,
    changefreq: 'monthly',
    priority: 0.85,
  },
  // 10. Location, Physical Address & Directions (Marangu, Moshi, Kilimanjaro)
  {
    loc: `${CANONICAL_DOMAIN}/location`,
    changefreq: 'monthly',
    priority: 0.8,
  },
];

/**
 * Builds the complete XML sitemap content string dynamically.
 */
export function generateSitemapXml(
  customEntries?: SitemapUrlEntry[],
  currentDateIso?: string
): string {
  const entries = customEntries && customEntries.length > 0 ? customEntries : OFFICIAL_SITEMAP_ENTRIES;
  const today = currentDateIso || new Date().toISOString().split('T')[0];

  const xmlUrls = entries
    .map((item) => {
      const lastmod = item.lastmod || today;
      const freq = item.changefreq || 'weekly';
      const prio = (item.priority !== undefined ? item.priority : 0.7).toFixed(1);

      return `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>
`;
}
