// 相关工具:按语义相关取(人工关联优先 + 同分类兜底),替代旧的 tools.slice(0,3)。
// 见《内链策略.md》§3。
import { getTool, liveTools, type Tool } from './tools';

/** 取与 slug 语义相关的工具:先用注册表里手工维护的 related,不足 n 个再用同分类兜底。 */
export function relatedTools(slug: string, n = 3): Tool[] {
  const self = getTool(slug);
  if (!self) return [];

  const manual = (self.related ?? [])
    .map(getTool)
    .filter((t): t is Tool => !!t && t.status === 'live' && t.slug !== slug);

  const picked = new Set(manual.map((t) => t.slug));
  const sameCat = liveTools().filter(
    (t) => t.slug !== slug && t.category === self.category && !picked.has(t.slug)
  );

  return [...manual, ...sameCat].slice(0, n);
}
