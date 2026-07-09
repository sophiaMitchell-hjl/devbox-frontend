// 共享 UI 文案(页面外壳:导航、页脚、布局标签、通用按钮等)。
// 页面正文文案在各自页面内本地化;此处只放跨页复用的 chrome 文案。
import type { Lang } from './index';

export const ui = {
  zh: {
    // Header
    'nav.tools': '工具',
    'nav.stack': '技术选型',
    'nav.guide': '部署指南',
    'nav.about': '关于',
    'lang.switch': '语言',
    'lang.zh': '中文',
    'lang.en': 'English',
    // Footer
    'site.tagline': '开发者在线工具箱',
    'footer.about': '关于',
    'footer.privacy': '隐私政策',
    'footer.terms': '服务条款',
    // Breadcrumb / 通用
    'crumb.home': '首页',
    'common.copy': '复制',
    'common.copied': '已复制',
    // ToolPageLayout
    'tool.whatIs': '这是什么:',
    'tool.whenUse': '什么时候用:',
    'tool.note': '全部在你的浏览器本地计算,不上传任何数据。',
    'tool.faq': '常见问题',
    'tool.related': '相关工具',
    // ArticleLayout
    'article.author': 'DevBox 团队',
    'article.updated': '最后更新',
    'article.ctaPrefix': '想直接生成?试试',
    'article.ctaSuffix': '—— 填参数即出结果。',
    'article.openTool': '打开工具 →',
    'article.faq': '常见问题',
    'article.moreAbout': '继续了解',
  },
  en: {
    'nav.tools': 'Tools',
    'nav.stack': 'Stack Picker',
    'nav.guide': 'Deploy Guide',
    'nav.about': 'About',
    'lang.switch': 'Language',
    'lang.zh': '中文',
    'lang.en': 'English',
    'site.tagline': 'Developer Toolbox',
    'footer.about': 'About',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'crumb.home': 'Home',
    'common.copy': 'Copy',
    'common.copied': 'Copied',
    'tool.whatIs': 'What it is: ',
    'tool.whenUse': 'When to use: ',
    'tool.note': 'Everything runs locally in your browser — nothing is uploaded.',
    'tool.faq': 'FAQ',
    'tool.related': 'Related tools',
    'article.author': 'DevBox Team',
    'article.updated': 'Last updated',
    'article.ctaPrefix': 'Want to generate directly? Try',
    'article.ctaSuffix': '— fill in the form and get results instantly.',
    'article.openTool': 'Open tool →',
    'article.faq': 'FAQ',
    'article.moreAbout': 'More about',
  },
} as const;

export type UIKey = keyof (typeof ui)['zh'];

/** 取某语言的翻译函数:t('nav.tools')。 */
export function useUI(lang: Lang) {
  const dict = ui[lang];
  return (key: UIKey): string => dict[key];
}

// 文章类型标签(面包屑末级 / 集群导航),按语言。
export const TYPE_LABEL: Record<Lang, Record<string, string>> = {
  zh: {
    wiki: '是什么',
    guide: '使用教程',
    examples: '示例大全',
    troubleshooting: '问题排查',
    compare: '对比',
  },
  en: {
    wiki: 'What is it',
    guide: 'Guide',
    examples: 'Examples',
    troubleshooting: 'Troubleshooting',
    compare: 'Compare',
  },
};
