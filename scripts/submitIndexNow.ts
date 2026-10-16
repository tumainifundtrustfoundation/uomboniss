import { OFFICIAL_SITEMAP_ENTRIES, CANONICAL_DOMAIN } from '../server/sitemapGenerator';

const INDEXNOW_KEY = 'e1a4d6f83b2c9a704e12589d6b3c7f1a';
const KEY_LOCATION = `${CANONICAL_DOMAIN}/${INDEXNOW_KEY}.txt`;

export async function submitToIndexNow(): Promise<{ success: boolean; status?: number; message: string }> {
  const urlList = OFFICIAL_SITEMAP_ENTRIES.map((entry) => entry.loc);
  const host = new URL(CANONICAL_DOMAIN).hostname; // 'www.uomboniss.sc.tz'

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  try {
    console.log(`[IndexNow] Submitting ${urlList.length} canonical URLs to https://api.indexnow.org/indexnow...`);
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      const msg = `[IndexNow] Successfully submitted ${urlList.length} URLs (HTTP ${response.status}). Participating search engines (Bing, Yandex, Seznam, Naver) notified.`;
      console.log(msg);
      return { success: true, status: response.status, message: msg };
    } else {
      const text = await response.text();
      const msg = `[IndexNow] Submission returned HTTP ${response.status}: ${text}`;
      console.warn(msg);
      return { success: false, status: response.status, message: msg };
    }
  } catch (error: any) {
    const msg = `[IndexNow] Network error notifying IndexNow: ${error?.message || error}`;
    console.error(msg);
    return { success: false, message: msg };
  }
}

// Allow direct CLI execution: tsx scripts/submitIndexNow.ts
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('submitIndexNow')) {
  submitToIndexNow().then((res) => {
    console.log('[IndexNow CLI Result]:', res);
  });
}
