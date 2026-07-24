// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';
import linkCheck from './link-check.mjs';
import flatSitemap from './sitemap.mjs';
import ogImage from './og-image.mjs';

const SITE = 'https://devbox.nextlink.me';

// 从文章 frontmatter 读取 updated,构建 URL → lastmod 映射(单一数据源仍是 md 文件)。
// 目录结构:src/content/articles/<tool>/<slug>.md → /<tool>/<slug>
function articleLastmods() {
  const base = new URL('./src/content/articles/', import.meta.url);
  const map = new Map();
  for (const tool of readdirSync(base, { withFileTypes: true })) {
    if (!tool.isDirectory()) continue;
    const dir = new URL(`${tool.name}/`, base);
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name === 'en') {
        // 英文文章在 <tool>/en/<slug>.md → /en/<tool>/<slug>
        const enDir = new URL(`en/`, dir);
        for (const file of readdirSync(enDir)) {
          if (!file.endsWith('.md')) continue;
          const fm = readFileSync(new URL(file, enDir), 'utf8');
          const m = fm.match(/^updated:\s*["']?([\d-]+)["']?/m);
          if (m) map.set(`${SITE}/en/${tool.name}/${file.replace(/\.md$/, '')}`, m[1]);
        }
      } else if (entry.name.endsWith('.md')) {
        const fm = readFileSync(new URL(entry.name, dir), 'utf8');
        const m = fm.match(/^updated:\s*["']?([\d-]+)["']?/m);
        if (m) map.set(`${SITE}/${tool.name}/${entry.name.replace(/\.md$/, '')}`, m[1]);
      }
    }
  }
  return map;
}
const LASTMODS = articleLastmods();

// URL 规则见《网站结构.md》:silo 嵌套、无尾斜杠
export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  integrations: [
    flatSitemap({ site: SITE, lastmods: LASTMODS }),
    ogImage(),
    linkCheck(),
  ],
  vite: {
    plugins: [tailwindcss()],
    // 开发联调:把 /api 代理到本地 FastAPI(见 api/README.md)
    server: {
      proxy: {
        '/api': 'http://127.0.0.1:8000',
      },
    },
  },
});
