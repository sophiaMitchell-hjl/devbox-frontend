// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import linkCheck from './link-check.mjs';

// URL 规则见《网站结构.md》:silo 嵌套、无尾斜杠
export default defineConfig({
  site: 'https://devbox.nextlink.me',
  trailingSlash: 'never',
  integrations: [sitemap(), linkCheck()],
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
