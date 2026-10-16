import fs from 'fs';
import path from 'path';
import { generateSitemapXml } from '../server/sitemapGenerator';

function buildSitemap() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapContent = generateSitemapXml();
  const targetPath = path.join(publicDir, 'sitemap.xml');

  fs.writeFileSync(targetPath, sitemapContent, 'utf-8');
  console.log(`[SEO] sitemap.xml generated successfully at: ${targetPath}`);

  // Also write to dist/sitemap.xml if dist exists
  const distDir = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent, 'utf-8');
    console.log(`[SEO] sitemap.xml also synced to dist/sitemap.xml`);
  }
}

buildSitemap();
