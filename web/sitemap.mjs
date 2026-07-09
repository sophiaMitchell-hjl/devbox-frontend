// 扁平站点地图生成(Astro 集成)。
// 在 astro:build:done 把所有页面写成单个 dist/sitemap.xml,
// 取代 @astrojs/sitemap 默认的 sitemap-index.xml → sitemap-0.xml 双层结构。
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const norm = (p) => {
  let s = p.replace(/[#?].*$/, '');
  if (!s.startsWith('/')) s = '/' + s;
  s = s.replace(/\/+$/, '');
  return s === '' ? '/' : s;
};

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * @param {{ site: string, lastmods?: Map<string,string> }} opts
 *   site: 站点根 URL;lastmods: 绝对 URL → 'YYYY-MM-DD' 映射(可选)。
 */
export default function flatSitemap({ site, lastmods = new Map() }) {
  const base = site.replace(/\/$/, '');
  return {
    name: 'devbox-flat-sitemap',
    hooks: {
      'astro:build:done': async ({ dir, pages, logger }) => {
        const routes = new Set(['/']);
        for (const p of pages) routes.add(norm('/' + p.pathname));

        // 首页在前,其余按字母序,输出稳定
        const urls = [...routes].sort((a, b) =>
          a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)
        );

        const body = urls
          .map((r) => {
            const loc = xmlEscape(r === '/' ? base : base + r);
            const lm = lastmods.get(r === '/' ? base : base + r);
            const lastmod = lm ? `<lastmod>${new Date(`${lm}T00:00:00Z`).toISOString()}</lastmod>` : '';
            return `  <url><loc>${loc}</loc>${lastmod}</url>`;
          })
          .join('\n');

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

        writeFileSync(join(fileURLToPath(dir), 'sitemap.xml'), xml, 'utf8');
        logger.info(`站点地图生成:/sitemap.xml(单文件,${urls.length} 条 URL)`);
      },
    },
  };
}
