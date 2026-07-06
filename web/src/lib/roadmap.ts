// 首页开发流程路线图数据源。
// - 有 stage 的工具 → 进入居中流程图对应阶段(两侧交错展示)
// - 无 stage 的工具 → 流程图下方按 category 分组展示(组合型/长尾型)
// live+slug/href 的为已上线(紫色可点),其余为规划中(灰色)。
import type { Lang } from '../i18n';
import { localePath } from '../i18n';

type Bi = { zh: string; en: string };

export interface Stage {
  n: string;
  title: Bi;
  desc: Bi;
}

export interface Item {
  name: Bi;
  stage?: number; // 1-8;无则归到下方分类
  category: string; // 分类 key(中文,稳定),显示用 CAT_LABEL 映射
  slug?: string; // 本站工具路由(已上线)
  href?: string; // 非工具类链接(如指南)
  live?: boolean; // 是否已上线可点
}

// 解析后(某语言)的条目,组件直接用
export interface ResolvedItem {
  name: string;
  category: string;
  href?: string; // 已本地化
  live?: boolean;
}

const CAT_LABEL: Record<string, Bi> = {
  色彩工具: { zh: '色彩工具', en: 'Color Tools' },
  图片处理: { zh: '图片处理', en: 'Image Tools' },
  编码进阶: { zh: '编码进阶', en: 'Encoding' },
  代码演练: { zh: '代码演练', en: 'Code Playground' },
  文本处理: { zh: '文本处理', en: 'Text Processing' },
  表格转换: { zh: '表格转换', en: 'Table Conversion' },
  开发者工具: { zh: '开发者工具', en: 'Dev Tools' },
  配置生成: { zh: '配置生成', en: 'Config' },
  指南: { zh: '指南', en: 'Guides' },
  SEO: { zh: 'SEO', en: 'SEO' },
};

export const stages: Stage[] = [
  { n: '1', title: { zh: '设计 / 资源', en: 'Design / Assets' }, desc: { zh: '配色、图标、图片、favicon 等前端资源准备。', en: 'Colors, icons, images, favicons and other frontend assets.' } },
  { n: '2', title: { zh: '编码 / 演练', en: 'Coding / Playground' }, desc: { zh: '写代码、在线试库、写文档。', en: 'Write code, try libraries online, write docs.' } },
  { n: '3', title: { zh: '数据 / 文本处理', en: 'Data / Text' }, desc: { zh: '格式化、转换、编解码、文本比对。', en: 'Format, convert, encode/decode, compare text.' } },
  { n: '4', title: { zh: '接口 / 调试', en: 'API / Debug' }, desc: { zh: '调 API、解析 token、查各种信息。', en: 'Call APIs, decode tokens, look up various info.' } },
  { n: '5', title: { zh: '构建 / 打包', en: 'Build / Package' }, desc: { zh: '版本、依赖、把应用打包成服务。', en: 'Versions, dependencies, packaging apps into services.' } },
  { n: '6', title: { zh: '部署上线', en: 'Deploy' }, desc: { zh: '搬上服务器、反向代理、配 HTTPS。', en: 'Move to a server, reverse proxy, set up HTTPS.' } },
  { n: '7', title: { zh: '运维 / 定时', en: 'Ops / Scheduling' }, desc: { zh: '定时任务、自动备份与清理。', en: 'Scheduled jobs, automated backups and cleanup.' } },
  { n: '8', title: { zh: '发布 / SEO', en: 'Publish / SEO' }, desc: { zh: '分享卡片、SEO 检查、二维码。', en: 'Share cards, SEO checks, QR codes.' } },
];

export const catalog: Item[] = [
  // ① 设计 / 资源
  { name: { zh: '颜色转换 / 调色板', en: 'Color Converter / Palette' }, stage: 1, category: '色彩工具', slug: 'color', live: true },
  { name: { zh: 'CSS 渐变生成器', en: 'CSS Gradient Generator' }, stage: 1, category: '色彩工具', slug: 'gradient', live: true },
  { name: { zh: 'Favicon 生成器', en: 'Favicon Generator' }, stage: 1, category: '图片处理', slug: 'favicon', live: true },
  { name: { zh: '图片压缩', en: 'Image Compressor' }, stage: 1, category: '图片处理', slug: 'image-compress', live: true },
  { name: { zh: 'SVG 压缩', en: 'SVG Minifier' }, stage: 1, category: '图片处理', slug: 'svg', live: true },

  // ② 编码 / 演练
  { name: { zh: '代码演练场', en: 'Code Playground' }, stage: 2, category: '代码演练', slug: 'playground', live: true },
  { name: { zh: 'Markdown 表格生成', en: 'Markdown Table Generator' }, stage: 2, category: '代码演练', slug: 'markdown-table', live: true },
  { name: { zh: 'HTML 转 Markdown', en: 'HTML to Markdown' }, stage: 2, category: '代码演练', slug: 'html-to-markdown', live: true },

  // ③ 数据 / 文本处理
  { name: { zh: '正则表达式测试', en: 'Regex Tester' }, stage: 3, category: '文本处理', slug: 'regex', live: true },
  { name: { zh: 'JSON 格式化', en: 'JSON Formatter' }, stage: 3, category: '文本处理', slug: 'json', live: true },
  { name: { zh: '文本 Diff 对比', en: 'Text Diff' }, stage: 3, category: '文本处理', slug: 'text-diff', live: true },
  { name: { zh: 'Base64 编解码', en: 'Base64 Encode/Decode' }, stage: 3, category: '编码进阶', slug: 'base64', live: true },
  { name: { zh: 'URL 编解码', en: 'URL Encode/Decode' }, stage: 3, category: '编码进阶', slug: 'url-encode', live: true },
  { name: { zh: '表格转换(5 格式互转)', en: 'Table Converter (5 formats)' }, stage: 3, category: '表格转换', slug: 'table', live: true },

  // ④ 接口 / 调试
  { name: { zh: 'JWT 解码', en: 'JWT Decoder' }, stage: 4, category: '开发者工具', slug: 'jwt', live: true },
  { name: { zh: '时间戳转换', en: 'Timestamp Converter' }, stage: 4, category: '开发者工具', slug: 'timestamp', live: true },
  { name: { zh: '时区转换', en: 'Timezone Converter' }, stage: 4, category: '开发者工具', slug: 'timezone', live: true },
  { name: { zh: 'UUID 生成', en: 'UUID Generator' }, stage: 4, category: '开发者工具', slug: 'uuid', live: true },
  { name: { zh: 'UserAgent 解析', en: 'User-Agent Parser' }, stage: 4, category: '开发者工具', slug: 'ua', live: true },
  { name: { zh: 'IP 信息查询', en: 'IP Lookup' }, stage: 4, category: '开发者工具', slug: 'ip', live: true },
  { name: { zh: 'Hash 生成', en: 'Hash Generator' }, stage: 4, category: '编码进阶', slug: 'hash', live: true },
  { name: { zh: '密码生成器', en: 'Password Generator' }, stage: 4, category: '编码进阶', slug: 'password', live: true },

  // ⑤ 构建 / 打包
  { name: { zh: 'Docker Compose 生成器', en: 'Docker Compose Generator' }, stage: 5, category: '配置生成', slug: 'docker-compose', live: true },
  { name: { zh: 'semver 版本查询', en: 'Semver Version Tool' }, stage: 5, category: '开发者工具', slug: 'semver', live: true },
  { name: { zh: '目录树生成', en: 'Directory Tree Generator' }, stage: 5, category: '开发者工具', slug: 'tree', live: true },

  // ⑥ 部署上线
  { name: { zh: 'Nginx 配置生成器', en: 'Nginx Config Generator' }, stage: 6, category: '配置生成', slug: 'nginx', live: true },
  { name: { zh: '部署指南', en: 'Deploy Guide' }, stage: 6, category: '指南', href: '/guide/deploy-to-server', live: true },

  // ⑦ 运维 / 定时
  { name: { zh: 'Cron 表达式生成器', en: 'Cron Expression Generator' }, stage: 7, category: '配置生成', slug: 'cron', live: true },

  // ⑧ 发布 / SEO
  { name: { zh: 'Meta 长度检测', en: 'Meta Length Checker' }, stage: 8, category: 'SEO', slug: 'meta', live: true },
  { name: { zh: 'Open Graph 预览', en: 'Open Graph Preview' }, stage: 8, category: 'SEO', slug: 'og', live: true },
  { name: { zh: '二维码生成', en: 'QR Code Generator' }, stage: 8, category: '图片处理', slug: 'qrcode', live: true },

  // ——— 以下无 stage:流程外,按分类列在下方 ———

  // 色彩工具(长尾)
  { name: { zh: 'RGB/HSL/CMYK 互转', en: 'RGB/HSL/CMYK Converter' }, category: '色彩工具' },
  { name: { zh: 'CSS 命名颜色', en: 'CSS Named Colors' }, category: '色彩工具' },
  { name: { zh: '对比度计算', en: 'Contrast Checker' }, category: '色彩工具', slug: 'contrast', live: true },
  { name: { zh: '亮度计算', en: 'Luminance Calculator' }, category: '色彩工具' },
  { name: { zh: '灰阶计算', en: 'Grayscale Calculator' }, category: '色彩工具' },
  { name: { zh: '色盲模拟', en: 'Color Blindness Simulator' }, category: '色彩工具', slug: 'colorblind', live: true },
  { name: { zh: '色彩和谐', en: 'Color Harmony' }, category: '色彩工具' },
  { name: { zh: 'Tailwind 颜色查找', en: 'Tailwind Color Finder' }, category: '色彩工具' },
  { name: { zh: '图片取色', en: 'Image Color Picker' }, category: '色彩工具' },
  { name: { zh: '颜色混合', en: 'Color Mixer' }, category: '色彩工具' },
  { name: { zh: 'OKLCH 探索', en: 'OKLCH Explorer' }, category: '色彩工具' },
  { name: { zh: '随机颜色', en: 'Random Color' }, category: '色彩工具' },
  { name: { zh: '图片转 CSS 渐变', en: 'Image to CSS Gradient' }, category: '色彩工具' },

  // 图片处理(长尾)
  { name: { zh: '图片灰阶', en: 'Image Grayscale' }, category: '图片处理' },
  { name: { zh: '图片格式转换', en: 'Image Format Converter' }, category: '图片处理' },
  { name: { zh: '图床', en: 'Image Hosting' }, category: '图片处理' },
  { name: { zh: '占位图 API', en: 'Placeholder Image API' }, category: '图片处理' },
  { name: { zh: 'DataURL 生成', en: 'DataURL Generator' }, category: '图片处理', slug: 'dataurl', live: true },
  { name: { zh: 'EXIF 查看 / 清除', en: 'EXIF Viewer / Cleaner' }, category: '图片处理' },
  { name: { zh: 'ASCII 字符画', en: 'ASCII Art' }, category: '图片处理' },
  { name: { zh: '图片水印', en: 'Image Watermark' }, category: '图片处理' },
  { name: { zh: '背景擦除', en: 'Background Remover' }, category: '图片处理' },

  // 编码进阶(长尾)
  { name: { zh: 'Unicode / 码点查看', en: 'Unicode / Code Point Inspector' }, category: '编码进阶', slug: 'unicode', live: true },
  { name: { zh: 'HTML 实体编解码', en: 'HTML Entity Encode/Decode' }, category: '编码进阶', slug: 'html-entity', live: true },
  { name: { zh: 'ASCII 码表', en: 'ASCII Table' }, category: '编码进阶', slug: 'ascii', live: true },
  { name: { zh: '对称加密', en: 'Symmetric Encryption' }, category: '编码进阶' },
];

const resolveItem = (it: Item, lang: Lang): ResolvedItem => ({
  name: it.name[lang],
  category: (CAT_LABEL[it.category] ?? { zh: it.category, en: it.category })[lang],
  href: it.href
    ? localePath(it.href, lang)
    : it.slug && it.live
      ? localePath(`/${it.slug}`, lang)
      : undefined,
  live: it.live,
});

export const getStages = (lang: Lang) =>
  stages.map((s) => ({ n: s.n, title: s.title[lang], desc: s.desc[lang] }));

export const itemsByStage = (n: number, lang: Lang) =>
  catalog.filter((i) => i.stage === n).map((i) => resolveItem(i, lang));

const CATEGORY_ORDER = ['色彩工具', '图片处理', '编码进阶'];

export function flowlessGroups(lang: Lang) {
  const groups: Record<string, Item[]> = {};
  for (const it of catalog) {
    if (it.stage === undefined) (groups[it.category] ??= []).push(it);
  }
  return CATEGORY_ORDER.filter((c) => groups[c]).map((c) => ({
    category: CAT_LABEL[c][lang],
    items: groups[c].map((it) => resolveItem(it, lang)),
  }));
}
