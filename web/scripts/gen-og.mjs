// 生成默认社交分享图 public/og-default.png(1200×630)。
// 品牌视觉与首页一致:深色背景 + 紫罗兰渐变光晕 + 标语。
// 运行:node scripts/gen-og.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '../public/og-default.png');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0a0b"/>
      <stop offset="1" stop-color="#18181b"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.15" r="0.6">
      <stop offset="0" stop-color="#8b5cf6" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#818cf8"/>
      <stop offset="1" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(96,150)">
    <rect x="0" y="8" width="56" height="56" rx="14" fill="url(#accent)"/>
    <text x="80" y="52" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="40" font-weight="700" fill="#fafafa">DevBox</text>
  </g>
  <text x="96" y="340" font-family="Inter, 'Microsoft YaHei', Segoe UI, Arial, sans-serif" font-size="76" font-weight="700" fill="#fafafa">开发者的<tspan fill="url(#accent)">在线工具箱</tspan></text>
  <text x="96" y="420" font-family="Inter, 'Microsoft YaHei', Segoe UI, Arial, sans-serif" font-size="34" font-weight="400" fill="#a1a1aa">配置生成 · 正则 · Cron · 命令构建 —— 填参数即出结果,复制可用</text>
  <text x="96" y="540" font-family="Inter, 'Microsoft YaHei', Segoe UI, Arial, sans-serif" font-size="26" font-weight="500" fill="#8b5cf6">纯浏览器本地计算 · 免注册 · 不上传</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log('wrote', out);
