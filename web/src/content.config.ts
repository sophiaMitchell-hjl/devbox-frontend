import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 信息型内容集合(见《技术方案.md》§6.5)。
// 目录按工具分组:src/content/articles/<tool>/<slug>.md
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    tool: z.string(), // 归属工具,如 'cron'
    lang: z.enum(['zh', 'en']).default('zh'), // 语言;英文文章置于 <tool>/en/ 下
    type: z.enum(['wiki', 'guide', 'examples', 'troubleshooting', 'compare']),
    title: z.string(), // 页面 H1
    seoTitle: z.string().optional(), // <title>(缺省用 title + 品牌)
    description: z.string(),
    order: z.number().default(0),
    published: z.string().optional(), // 首次发布日期(缺省回退到 updated)
    updated: z.string().optional(),
    faqs: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .default([]),
  }),
});

export const collections = { articles };
