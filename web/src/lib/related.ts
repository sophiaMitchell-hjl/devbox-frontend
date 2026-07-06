// 相关工具:按语义相关取(人工关联优先 + 同分类兜底),替代旧的 tools.slice(0,3)。
// 见《内链策略.md》§3。
import { getTool, liveTools, type ResolvedTool } from './tools';
import type { Lang } from '../i18n';

/** 取与 slug 语义相关的工具:先用注册表里手工维护的 related,不足 n 个再用同分类兜底。 */
export function relatedTools(slug: string, lang: Lang, n = 3): ResolvedTool[] {
  const self = getTool(slug, lang);
  if (!self) return [];

  const manual = (self.related ?? [])
    .map((s) => getTool(s, lang))
    .filter((t): t is ResolvedTool => !!t && t.status === 'live' && t.slug !== slug);

  const picked = new Set(manual.map((t) => t.slug));
  const sameCat = liveTools(lang).filter(
    (t) => t.slug !== slug && t.category === self.category && !picked.has(t.slug)
  );

  return [...manual, ...sameCat].slice(0, n);
}
