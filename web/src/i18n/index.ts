// i18n 核心:语言判定与路径本地化。
// 路由策略:中文(默认)在根路径(/cron),英文加 /en 前缀(/en/cron)。
// 所有页面由 src/pages/[...loc]/ 下的单一源文件生成两种语言(见各页 getStaticPaths)。

export type Lang = 'zh' | 'en';
export const LANGS: Lang[] = ['zh', 'en'];
export const DEFAULT_LANG: Lang = 'zh';

/** [...loc] 动态路由的 getStaticPaths:同一文件产出 / 与 /en 两套路由。 */
export const localePaths = () => [{ params: { loc: undefined } }, { params: { loc: 'en' } }];

/** 从 [...loc] 参数取语言(页面 frontmatter 用)。 */
export const langOfParam = (loc: string | undefined): Lang => (loc === 'en' ? 'en' : 'zh');

/** 从 URL 判定语言(布局/组件用,无法访问 params 时)。 */
export function getLang(url: URL): Lang {
  const p = url.pathname;
  return p === '/en' || p.startsWith('/en/') ? 'en' : 'zh';
}

/** 去掉语言前缀,得到规范(中文)根路径。/en/cron → /cron,/en → / */
export function stripLang(pathname: string): string {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3);
  return pathname === '' ? '/' : pathname;
}

/**
 * 把一个规范根路径(以 / 开头,如 '/cron'、'/'、'/cron/what-is-cron')
 * 本地化到目标语言。中文原样返回,英文加 /en 前缀。
 */
export function localePath(path: string, lang: Lang): string {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  if (lang === 'en') return clean === '' ? '/en' : `/en${clean}`;
  return clean === '' ? '/' : clean;
}

/** 当前 URL 在另一语言下的对应路径(语言切换器用)。 */
export function altPath(url: URL, target: Lang): string {
  return localePath(stripLang(url.pathname), target);
}

/** <html lang> 属性值。 */
export const htmlLang = (lang: Lang): string => (lang === 'en' ? 'en' : 'zh-CN');
