// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';
import linkCheck from './link-check.mjs';

const SITE = 'https://devbox.nextlink.me';

// 从文章 frontmatter 读取 updated,构建 URL → lastmod 映射(单一数据源仍是 md 文件)。
// 目录结构:src/content/articles/<tool>/<slug>.md → /<tool>/<slug>
function articleLastmods() {
  const base = new URL('./src/content/articles/', import.meta.url);
  const map = new Map();
  for (const tool of readdirSync(base, { withFileTypes: true })) {
    if (!tool.isDirectory()) continue;
    const dir = new URL(`${tool.name}/`, base);
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      const fm = readFileSync(new URL(file, dir), 'utf8');
      const m = fm.match(/^updated:\s*["']?([\d-]+)["']?/m);
      if (m) map.set(`${SITE}/${tool.name}/${file.replace(/\.md$/, '')}`, m[1]);
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
    sitemap({
      serialize(item) {
        const lastmod = LASTMODS.get(item.url);
        if (lastmod) item.lastmod = new Date(`${lastmod}T00:00:00Z`).toISOString();
        return item;
      },
    }),
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
