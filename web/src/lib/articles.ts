import { getCollection } from 'astro:content';
import type { Lang } from '../i18n';

// 文章类型 → 标签(面包屑末级 / 集群导航),按语言。见《网站结构.md》§7。
export { TYPE_LABEL } from '../i18n/ui';

/** 从 glob 集合 id(如 'cron/what-is-cron' 或 'cron/en/what-is-cron')取末段作为 URL slug */
export const slugOf = (id: string) => id.split('/').pop()!;

export interface ClusterArticle {
  slug: string;
  title: string;
  type: string;
  order: number;
}

/**
 * 取某工具集群下、某语言的全部内容页(按 order 排序),供支柱页"深入了解"与内容页兄弟模块共用。
 * 单一数据源 = content collection,新增文章零改动自动出现在内链里。见《内链策略.md》§5.3。
 */
export async function getClusterArticles(tool: string, lang: Lang): Promise<ClusterArticle[]> {
  const all = await getCollection('articles', (e) => e.data.tool === tool && e.data.lang === lang);
  return all
    .map((e) => ({
      slug: slugOf(e.id),
      title: e.data.title,
      type: e.data.type,
      order: e.data.order,
    }))
    .sort((a, b) => a.order - b.order);
}

// 入门主线(核心)vs 按需查阅(进阶)。用于支柱页"深入了解"入口分层。见《内链策略.md》§5.1。
const CORE_TYPES = ['wiki', 'guide'];

export function splitByTier(articles: ClusterArticle[]): {
  core: ClusterArticle[];
  advanced: ClusterArticle[];
} {
  return {
    core: articles.filter((a) => CORE_TYPES.includes(a.type)),
    advanced: articles.filter((a) => !CORE_TYPES.includes(a.type)),
  };
}
