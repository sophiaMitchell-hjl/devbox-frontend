// 首页开发流程路线图数据源。
// - 有 stage 的工具 → 进入居中流程图对应阶段(两侧交错展示)
// - 无 stage 的工具 → 流程图下方按 category 分组展示(组合型/长尾型)
// live+slug/href 的为已上线(紫色可点),其余为规划中(灰色)。

export interface Stage {
  n: string;
  title: string;
  desc: string;
}

export interface Item {
  name: string;
  stage?: number; // 1-8;无则归到下方分类
  category: string; // 分类(流程外分组用)
  slug?: string; // 本站工具路由(已上线)
  href?: string; // 非工具类链接(如指南)
  live?: boolean; // 是否已上线可点
}

export const stages: Stage[] = [
  { n: '1', title: '设计 / 资源', desc: '配色、图标、图片、favicon 等前端资源准备。' },
  { n: '2', title: '编码 / 演练', desc: '写代码、在线试库、写文档。' },
  { n: '3', title: '数据 / 文本处理', desc: '格式化、转换、编解码、文本比对。' },
  { n: '4', title: '接口 / 调试', desc: '调 API、解析 token、查各种信息。' },
  { n: '5', title: '构建 / 打包', desc: '版本、依赖、把应用打包成服务。' },
  { n: '6', title: '部署上线', desc: '搬上服务器、反向代理、配 HTTPS。' },
  { n: '7', title: '运维 / 定时', desc: '定时任务、自动备份与清理。' },
  { n: '8', title: '发布 / SEO', desc: '分享卡片、SEO 检查、二维码。' },
];

export const catalog: Item[] = [
  // ① 设计 / 资源
  { name: '颜色转换 / 调色板', stage: 1, category: '色彩工具', slug: 'color', live: true },
  { name: 'CSS 渐变生成器', stage: 1, category: '色彩工具', slug: 'gradient', live: true },
  { name: 'Favicon 生成器', stage: 1, category: '图片处理', slug: 'favicon', live: true },
  { name: '图片压缩', stage: 1, category: '图片处理', slug: 'image-compress', live: true },
  { name: 'SVG 压缩', stage: 1, category: '图片处理', slug: 'svg', live: true },

  // ② 编码 / 演练
  { name: '代码演练场', stage: 2, category: '代码演练', slug: 'playground', live: true },
  { name: 'Markdown 表格生成', stage: 2, category: '代码演练', slug: 'markdown-table', live: true },
  { name: 'HTML 转 Markdown', stage: 2, category: '代码演练', slug: 'html-to-markdown', live: true },

  // ③ 数据 / 文本处理
  { name: '正则表达式测试', stage: 3, category: '文本处理', slug: 'regex', live: true },
  { name: 'JSON 格式化', stage: 3, category: '文本处理', slug: 'json', live: true },
  { name: '文本 Diff 对比', stage: 3, category: '文本处理', slug: 'text-diff', live: true },
  { name: 'Base64 编解码', stage: 3, category: '编码进阶', slug: 'base64', live: true },
  { name: 'URL 编解码', stage: 3, category: '编码进阶', slug: 'url-encode', live: true },
  { name: '表格转换(5 格式互转)', stage: 3, category: '表格转换', slug: 'table', live: true },

  // ④ 接口 / 调试
  { name: 'JWT 解码', stage: 4, category: '开发者工具', slug: 'jwt', live: true },
  { name: '时间戳转换', stage: 4, category: '开发者工具', slug: 'timestamp', live: true },
  { name: '时区转换', stage: 4, category: '开发者工具', slug: 'timezone', live: true },
  { name: 'UUID 生成', stage: 4, category: '开发者工具', slug: 'uuid', live: true },
  { name: 'UserAgent 解析', stage: 4, category: '开发者工具', slug: 'ua', live: true },
  { name: 'IP 信息查询', stage: 4, category: '开发者工具', slug: 'ip', live: true },
  { name: 'Hash 生成', stage: 4, category: '编码进阶', slug: 'hash', live: true },
  { name: '密码生成器', stage: 4, category: '编码进阶', slug: 'password', live: true },

  // ⑤ 构建 / 打包
  { name: 'Docker Compose 生成器', stage: 5, category: '配置生成', slug: 'docker-compose', live: true },
  { name: 'semver 版本查询', stage: 5, category: '开发者工具', slug: 'semver', live: true },
  { name: '目录树生成', stage: 5, category: '开发者工具', slug: 'tree', live: true },

  // ⑥ 部署上线
  { name: 'Nginx 配置生成器', stage: 6, category: '配置生成', slug: 'nginx', live: true },
  { name: '部署指南', stage: 6, category: '指南', href: '/guide/deploy-to-server', live: true },

  // ⑦ 运维 / 定时
  { name: 'Cron 表达式生成器', stage: 7, category: '配置生成', slug: 'cron', live: true },

  // ⑧ 发布 / SEO
  { name: 'Meta 长度检测', stage: 8, category: 'SEO', slug: 'meta', live: true },
  { name: 'Open Graph 预览', stage: 8, category: 'SEO', slug: 'og', live: true },
  { name: '二维码生成', stage: 8, category: '图片处理', slug: 'qrcode', live: true },

  // ——— 以下无 stage:流程外,按分类列在下方 ———

  // 色彩工具(长尾)
  { name: 'RGB/HSL/CMYK 互转', category: '色彩工具' },
  { name: 'CSS 命名颜色', category: '色彩工具' },
  { name: '对比度计算', category: '色彩工具', slug: 'contrast', live: true },
  { name: '亮度计算', category: '色彩工具' },
  { name: '灰阶计算', category: '色彩工具' },
  { name: '色盲模拟', category: '色彩工具', slug: 'colorblind', live: true },
  { name: '色彩和谐', category: '色彩工具' },
  { name: 'Tailwind 颜色查找', category: '色彩工具' },
  { name: '图片取色', category: '色彩工具' },
  { name: '颜色混合', category: '色彩工具' },
  { name: 'OKLCH 探索', category: '色彩工具' },
  { name: '随机颜色', category: '色彩工具' },
  { name: '图片转 CSS 渐变', category: '色彩工具' },

  // 图片处理(长尾)
  { name: '图片灰阶', category: '图片处理' },
  { name: '图片格式转换', category: '图片处理' },
  { name: '图床', category: '图片处理' },
  { name: '占位图 API', category: '图片处理' },
  { name: 'DataURL 生成', category: '图片处理', slug: 'dataurl', live: true },
  { name: 'EXIF 查看 / 清除', category: '图片处理' },
  { name: 'ASCII 字符画', category: '图片处理' },
  { name: '图片水印', category: '图片处理' },
  { name: '背景擦除', category: '图片处理' },

  // 编码进阶(长尾)
  { name: 'Unicode / 码点查看', category: '编码进阶', slug: 'unicode', live: true },
  { name: 'HTML 实体编解码', category: '编码进阶', slug: 'html-entity', live: true },
  { name: 'ASCII 码表', category: '编码进阶', slug: 'ascii', live: true },
  { name: '对称加密', category: '编码进阶' },
];

export const itemsByStage = (n: number) => catalog.filter((i) => i.stage === n);

const CATEGORY_ORDER = ['色彩工具', '图片处理', '编码进阶'];

export function flowlessGroups() {
  const groups: Record<string, Item[]> = {};
  for (const it of catalog) {
    if (it.stage === undefined) (groups[it.category] ??= []).push(it);
  }
  return CATEGORY_ORDER.filter((c) => groups[c]).map((c) => ({
    category: c,
    items: groups[c],
  }));
}
