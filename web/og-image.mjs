// 英文版社交分享图生成(Astro 集成)。
// 在 astro:build:done 用 satori→resvg 把英文 OG 卡片渲染成 dist/og-default-en.png,
// 供 /en 下所有页面用作 og:image(中文页沿用手工的 public/og-default.png)。
// 设计与中文图保持一致,只把文案换成英文;字体用 @fontsource/inter 的 woff(satori 支持)。
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const font = (file) =>
  readFileSync(new URL(`./node_modules/@fontsource/inter/files/${file}`, import.meta.url));
const interRegular = font('inter-latin-400-normal.woff');
const interBold = font('inter-latin-700-normal.woff');

// satori 接受 { type, props } 的 vnode;用极简 h() 手搓,免引 JSX/react。
// satori 规则:任何 div 只要有子节点就应显式声明 display,这里统一补 flex。
const h = (type, style, children) => ({
  type,
  props: { style: { display: 'flex', ...style }, children },
});
const text = (style, value) => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: value },
});

const ACCENT = '#a78bfa';

// 1200×630 卡片。深色底 + 顶部紫色辉光,与中文图一致。
const card = h(
  'div',
  {
    width: 1200,
    height: 630,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 100px',
    backgroundColor: '#0a0a0f',
    backgroundImage:
      'radial-gradient(1000px 500px at 50% -10%, #3b1d6e 0%, rgba(59,29,110,0) 60%)',
    fontFamily: 'Inter',
    color: '#ffffff',
  },
  [
    // 品牌行:渐变小方块 + DevBox
    h('div', { display: 'flex', alignItems: 'center', marginBottom: 28 }, [
      h('div', {
        width: 52,
        height: 52,
        borderRadius: 14,
        marginRight: 20,
        backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
      }, []),
      text({ fontSize: 40, fontWeight: 700, color: '#e4e4e7' }, 'DevBox'),
    ]),
    // 主标题:两行,白 + 强调色(英文比中文长,单行会溢出)
    h('div', { flexDirection: 'column', fontSize: 78, fontWeight: 700, letterSpacing: -2, lineHeight: 1.12 }, [
      text({ color: '#ffffff' }, 'The Developer’s'),
      text({ color: ACCENT }, 'Online Toolbox'),
    ]),
    // 副标题
    text(
      { marginTop: 28, fontSize: 34, fontWeight: 400, color: '#a1a1aa', lineHeight: 1.35 },
      'Config generators · Regex · Cron · Command builders',
    ),
    // 底部标语
    text(
      { marginTop: 44, fontSize: 26, fontWeight: 400, color: '#8b7bd8' },
      'Runs locally in your browser · No signup · Nothing uploaded',
    ),
  ],
);

export default function ogImage() {
  return {
    name: 'devbox-og-image',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const svg = await satori(card, {
          width: 1200,
          height: 630,
          fonts: [
            { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
            { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
          ],
        });
        const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
          .render()
          .asPng();
        writeFileSync(join(fileURLToPath(dir), 'og-default-en.png'), png);
        logger.info('英文 OG 图生成:/og-default-en.png(1200×630)');
      },
    },
  };
}
