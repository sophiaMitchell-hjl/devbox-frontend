// 内链构建期校验(Astro 集成)。见《内链策略.md》§4.3。
// 在 astro:build:done 扫描 dist 里最终渲染的 HTML:
//   - 死链   → 致命,构建失败(防止写文章埋死链)
//   - 自链   → 告警(页面链到自己)
//   - 孤儿页 → 告警(除首页外无任何站内入链)
//   - 黑名单锚文本 → 告警(点这里 / 查看更多 …)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';

// 无意义锚文本黑名单(小写、去空白后匹配)。
const BAD_ANCHORS = [
  '点击这里', '点这里', '点击', '点此', '查看更多', '了解更多', '更多',
  '这里', '详情', '查看详情', 'more', 'click here', 'read more', 'learn more',
];

const norm = (p) => {
  let s = p.replace(/[#?].*$/, ''); // 去掉锚点/查询
  if (!s.startsWith('/')) s = '/' + s;
  s = s.replace(/\/+$/, ''); // 去尾斜杠
  return s === '' ? '/' : s;
};

// 是否需要校验的站内页面链接(排除外链、锚点、mailto、静态资源)。
const isInternalPageLink = (href) => {
  if (!href || href.startsWith('#')) return false;
  if (/^(https?:)?\/\//i.test(href)) return false; // 外链 / 协议相对
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return false;
  if (!href.startsWith('/')) return false; // 相对/片段
  if (href.startsWith('/_astro/')) return false; // 构建资源
  const last = norm(href).split('/').pop() ?? '';
  if (last.includes('.')) return false; // 带扩展名 = 静态文件(sitemap.xml/favicon.svg…)
  return true;
};

const walkHtml = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkHtml(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
};

// dist 文件路径 → 站内路由(dist/cron/guide/index.html → /cron/guide)
const routeOfFile = (distDir, file) => {
  let rel = relative(distDir, file).split(sep).join('/');
  rel = rel.replace(/\/?index\.html$/, '').replace(/\.html$/, '');
  return norm('/' + rel);
};

const stripTags = (html) => html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();

export default function linkCheck() {
  return {
    name: 'devbox-link-check',
    hooks: {
      'astro:build:done': async ({ dir, pages, logger }) => {
        const distDir = fileURLToPath(dir);

        // 合法路由集合:构建产出的所有页面 + 首页。
        const routes = new Set(['/']);
        for (const p of pages) routes.add(norm('/' + p.pathname));

        const htmlFiles = walkHtml(distDir);
        const dead = []; // { from, href }
        const selfLinks = []; // { page, href }
        const badAnchors = []; // { page, text, href }
        const inbound = new Map(); // route → 入链数(来自其它页面)

        const anchorRe = /<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

        for (const file of htmlFiles) {
          const page = routeOfFile(distDir, file);
          const html = readFileSync(file, 'utf8');
          let m;
          while ((m = anchorRe.exec(html))) {
            const href = m[1];
            const text = stripTags(m[2]).toLowerCase();
            if (BAD_ANCHORS.some((b) => text === b || text === b + ' →' || text === b + '→')) {
              badAnchors.push({ page, text: stripTags(m[2]), href });
            }
            if (!isInternalPageLink(href)) continue;
            const target = norm(href);
            // 死链:既不在路由集合,dist 里也没有对应文件
            const asFile = join(distDir, target.slice(1));
            const ok =
              routes.has(target) ||
              existsSync(join(asFile, 'index.html')) ||
              existsSync(asFile + '.html');
            if (!ok) dead.push({ from: page, href });
            else if (target !== page) inbound.set(target, (inbound.get(target) ?? 0) + 1);
          }

          // 自链只在正文 <article> 里查(导航/logo/面包屑链到当前页是正常的,不算)。
          const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? '';
          let a;
          while ((a = anchorRe.exec(article))) {
            if (isInternalPageLink(a[1]) && norm(a[1]) === page) {
              selfLinks.push({ page, href: a[1] });
            }
          }
        }

        // 孤儿页:除首页外,路由无任何来自其它页面的入链。
        const orphans = [...routes].filter((r) => r !== '/' && !(inbound.get(r) > 0));

        for (const o of orphans) logger.warn(`孤儿页(无站内入链):${o}`);
        for (const s of selfLinks) logger.warn(`自链:${s.page} → ${s.href}`);
        for (const b of badAnchors) logger.warn(`劣质锚文本「${b.text}」:${b.page} → ${b.href}`);

        if (dead.length) {
          for (const d of dead) logger.error(`死链:${d.from} → ${d.href}`);
          throw new Error(`内链校验失败:发现 ${dead.length} 条死链(见上方 error 日志)。`);
        }

        logger.info(
          `内链校验通过:${htmlFiles.length} 页 / ${routes.size} 路由,死链 0,` +
            `孤儿 ${orphans.length},自链 ${selfLinks.length},劣质锚文本 ${badAnchors.length}。`
        );
      },
    },
  };
}
