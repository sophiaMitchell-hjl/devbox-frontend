// 开发流程地图(见《入门层与开发流程.md》§2)。
// 首页竖版流程图的数据源:每个阶段标注该阶段用得到的工具(可点击)。
export interface Stage {
  n: string;
  title: string;
  desc: string;
  toolSlugs: string[]; // 该阶段相关工具(取自工具注册表)
  link?: { label: string; href: string }; // 无对应工具时的替代入口(如部署指南)
}

export const lifecycle: Stage[] = [
  {
    n: '1',
    title: '本地开发',
    desc: '在自己电脑上写代码、调试。',
    toolSlugs: [],
  },
  {
    n: '2',
    title: '处理文本 / 数据',
    desc: '校验邮箱、提取内容、清洗字符串——用规则匹配,不用写一堆判断。',
    toolSlugs: ['regex'],
  },
  {
    n: '3',
    title: '定义与打包服务',
    desc: '把应用和数据库等打包成能一键启动的服务。',
    toolSlugs: ['docker-compose'],
  },
  {
    n: '4',
    title: '部署到服务器',
    desc: '把服务搬到一台 24 小时在线的服务器上。',
    toolSlugs: [],
    link: { label: '看部署指南', href: '/guide/deploy-to-server' },
  },
  {
    n: '5',
    title: '对外访问 + HTTPS',
    desc: '让别人用域名访问,并加上小绿锁——反向代理。',
    toolSlugs: ['nginx'],
  },
  {
    n: '6',
    title: '定时与运维',
    desc: '每天自动备份、定时跑任务,交给 cron。',
    toolSlugs: ['cron'],
  },
];
