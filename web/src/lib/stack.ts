// 技术栈组合器数据源 —— 单一数据源:驱动 /stack 工具页的选择器、详情卡、趋势总览与推断引擎。
// 双语:所有面向用户的文案用 { zh, en };结构字段(id/layer/tags/trend)语言无关。
// 纯前端可 import:evaluate 为无副作用纯函数,可直接在客户端 <script> 里调用(见 stack.astro)。
import type { Lang } from '../i18n';

export type Bi = { zh: string; en: string };

export type Layer = 'frontend' | 'backend' | 'database' | 'plugin' | 'infra';

// 2026 开发者使用现状
export type Trend = 'mainstream' | 'rising' | 'niche' | 'declining';

export interface StackOption {
  id: string;
  layer: Layer;
  name: Bi; // 显示名(含语言,如 "React / Next.js")
  blurb: Bi; // 详细介绍(2~3 句)
  useCase: Bi; // 一句话典型用途
  trend: Trend; // 2026 使用现状
  trendNote?: Bi; // 趋势补充说明
  tags: string[]; // 归档 / 推断用
}

export const LAYER_LABEL: Record<Layer, Bi> = {
  frontend: { zh: '前端框架', en: 'Frontend' },
  backend: { zh: '后端框架', en: 'Backend' },
  database: { zh: '数据库', en: 'Database' },
  plugin: { zh: '开发工具链', en: 'Dev Toolchain' },
  infra: { zh: '配置 / 基础设施', en: 'Config / Infra' },
};

export const trendLabel: Record<Trend, Bi> = {
  mainstream: { zh: '🔥 主流', en: '🔥 Mainstream' },
  rising: { zh: '📈 上升', en: '📈 Rising' },
  niche: { zh: '🌱 小众', en: '🌱 Niche' },
  declining: { zh: '📉 逐渐式微', en: '📉 Declining' },
};

// ——————————————————————————————————————————————————————————————
// 选项库(约 55 项,覆盖 2026 主流)
// ——————————————————————————————————————————————————————————————
export const options: StackOption[] = [
  // ========================= 前端框架 =========================
  {
    id: 'nextjs',
    layer: 'frontend',
    name: { zh: 'Next.js (React)', en: 'Next.js (React)' },
    blurb: {
      zh: 'React 生态最主流的全栈框架,内置服务端渲染(SSR)、静态生成与 API 路由,App Router + React Server Components 已成默认写法。前后端一体,既能做站也能写接口。',
      en: "React's most popular full-stack framework, with built-in SSR, static generation, and API routes; App Router + React Server Components are now the default. Frontend and backend in one codebase.",
    },
    useCase: { zh: 'SaaS、内容站、电商、几乎任何需要 SEO 的 Web 应用。', en: 'SaaS, content sites, e-commerce — almost any SEO-friendly web app.' },
    trend: 'mainstream',
    trendNote: { zh: '2026 事实标准,招聘需求最大。', en: 'The de-facto standard in 2026, with the most job demand.' },
    tags: ['react', 'ssr', 'fullstack', 'seo', 'js'],
  },
  {
    id: 'react-spa',
    layer: 'frontend',
    name: { zh: 'React (Vite SPA)', en: 'React (Vite SPA)' },
    blurb: {
      zh: '用 Vite 起的纯 React 单页应用(SPA),全部在浏览器里渲染,和后端 API 完全解耦。适合登录后才用的后台、控制台类应用。',
      en: 'A pure React single-page app (SPA) bootstrapped with Vite, rendered entirely in the browser and fully decoupled from a backend API. Great for behind-login dashboards and consoles.',
    },
    useCase: { zh: '管理后台、数据看板、内部工具等无需 SEO 的应用。', en: 'Admin panels, dashboards, internal tools where SEO does not matter.' },
    trend: 'mainstream',
    tags: ['react', 'spa', 'dashboard', 'js'],
  },
  {
    id: 'vue',
    layer: 'frontend',
    name: { zh: 'Vue 3 / Nuxt', en: 'Vue 3 / Nuxt' },
    blurb: {
      zh: '上手平缓、文档友好的前端框架,中文社区尤其活跃。Nuxt 是它对标 Next.js 的全栈方案,提供 SSR 与 SEO。',
      en: 'A gentle-to-learn, well-documented framework with an especially active Chinese community. Nuxt is its full-stack, SSR/SEO answer to Next.js.',
    },
    useCase: { zh: '中小团队的官网、后台、内容站,快速交付。', en: 'Marketing sites, admin panels and content sites for small teams, shipped fast.' },
    trend: 'mainstream',
    tags: ['vue', 'ssr', 'seo', 'js'],
  },
  {
    id: 'astro',
    layer: 'frontend',
    name: { zh: 'Astro', en: 'Astro' },
    blurb: {
      zh: '内容优先的框架,默认输出零 JS 的纯静态页,加载极快、SEO 极好,需要交互时再"孤岛式"引入 React/Vue 组件。本站 DevBox 就是用它做的。',
      en: 'A content-first framework that ships zero-JS static pages by default — blazing fast and SEO-friendly — and lets you drop in React/Vue components as interactive "islands" only where needed. DevBox itself is built on it.',
    },
    useCase: { zh: '博客、文档、营销站、作品集等内容型网站。', en: 'Blogs, docs, marketing sites, portfolios — content-heavy sites.' },
    trend: 'rising',
    trendNote: { zh: '内容站领域快速上升。', en: 'Rising fast for content sites.' },
    tags: ['static', 'content', 'seo', 'mpa', 'js'],
  },
  {
    id: 'sveltekit',
    layer: 'frontend',
    name: { zh: 'Svelte / SvelteKit', en: 'Svelte / SvelteKit' },
    blurb: {
      zh: '编译期把组件编译成精简原生 JS,运行时体积小、性能好,写法简洁。SvelteKit 是其全栈框架,开发者满意度常年很高。',
      en: 'Compiles components to lean vanilla JS at build time, so runtime bundles are small and fast, with concise syntax. SvelteKit is its full-stack framework, consistently topping developer-satisfaction surveys.',
    },
    useCase: { zh: '追求性能与开发体验的中小型 Web 应用。', en: 'Small-to-mid web apps that prize performance and DX.' },
    trend: 'rising',
    tags: ['svelte', 'ssr', 'fullstack', 'seo', 'js'],
  },
  {
    id: 'angular',
    layer: 'frontend',
    name: { zh: 'Angular', en: 'Angular' },
    blurb: {
      zh: '谷歌出品的重量级全功能框架,自带路由、表单、依赖注入等一整套,规范性强。学习曲线陡,近年在新项目中的占比下滑,但企业存量项目仍多。',
      en: "Google's heavyweight, batteries-included framework — routing, forms, dependency injection all built in and highly opinionated. Steep learning curve; its share of new projects is declining, but many enterprise codebases still run it.",
    },
    useCase: { zh: '大型企业级前端、有强规范要求的团队。', en: 'Large enterprise frontends and teams that want strict conventions.' },
    trend: 'declining',
    trendNote: { zh: '新项目减少,企业存量仍在。', en: 'Fewer new projects, but entrenched in enterprises.' },
    tags: ['angular', 'spa', 'enterprise', 'js'],
  },
  {
    id: 'reactnative',
    layer: 'frontend',
    name: { zh: 'React Native (Expo)', en: 'React Native (Expo)' },
    blurb: {
      zh: '用 React 写一套代码,同时打包 iOS 与 Android 原生 App。Expo 让搭建与发布大幅简化,是跨平台移动开发的主流之一。',
      en: 'Write one React codebase and ship native iOS and Android apps. Expo makes setup and release far simpler; it is one of the mainstream choices for cross-platform mobile.',
    },
    useCase: { zh: '需要同时上架双端的移动 App。', en: 'Mobile apps that must ship to both app stores.' },
    trend: 'mainstream',
    tags: ['mobile', 'react', 'js'],
  },
  {
    id: 'flutter',
    layer: 'frontend',
    name: { zh: 'Flutter (Dart)', en: 'Flutter (Dart)' },
    blurb: {
      zh: '谷歌的跨平台 UI 框架,用 Dart 语言,一套代码覆盖移动、桌面、Web,自绘引擎保证各端 UI 高度一致、动画流畅。',
      en: "Google's cross-platform UI framework in Dart: one codebase for mobile, desktop and web, with a self-rendering engine that keeps UI identical and animations smooth across platforms.",
    },
    useCase: { zh: '重 UI、重动画、要求多端一致的 App。', en: 'UI- and animation-heavy apps needing pixel-consistent multi-platform output.' },
    trend: 'mainstream',
    tags: ['mobile', 'dart'],
  },
  {
    id: 'htmx',
    layer: 'frontend',
    name: { zh: 'HTMX', en: 'HTMX' },
    blurb: {
      zh: '返璞归真的思路:几乎不写 JS,用 HTML 属性就能发请求、局部刷新页面,把渲染交回后端。让传统后端(Django/Rails/Go)也能做出现代交互。',
      en: 'A back-to-basics approach: barely any JS — HTML attributes issue requests and swap page fragments, keeping rendering on the server. Lets classic backends (Django/Rails/Go) deliver modern interactivity.',
    },
    useCase: { zh: '后端主导、不想引入前端框架的中小项目。', en: 'Backend-driven small/mid projects that want to avoid a JS framework.' },
    trend: 'rising',
    tags: ['static', 'ssr', 'simple'],
  },
  {
    id: 'jquery',
    layer: 'frontend',
    name: { zh: 'jQuery', en: 'jQuery' },
    blurb: {
      zh: '十多年前的王者,简化了 DOM 操作与 Ajax。如今原生 JS 已能替代其大部分功能,新项目几乎不再选用,主要见于维护老系统。',
      en: 'The king a decade-plus ago, simplifying DOM manipulation and Ajax. Modern vanilla JS now covers most of what it did; virtually no new projects pick it — mainly seen maintaining legacy systems.',
    },
    useCase: { zh: '维护遗留老网站。', en: 'Maintaining legacy websites.' },
    trend: 'declining',
    trendNote: { zh: '新项目请优先原生 JS 或现代框架。', en: 'For new projects prefer vanilla JS or a modern framework.' },
    tags: ['legacy', 'simple', 'js'],
  },
  {
    id: 'plain',
    layer: 'frontend',
    name: { zh: '纯 HTML/CSS/JS', en: 'Plain HTML/CSS/JS' },
    blurb: {
      zh: '不用任何框架,直接手写。零依赖、零构建、加载最快,但页面一多、交互一复杂就难以维护。学习与理解 Web 本质的最佳起点。',
      en: 'No framework, hand-written. Zero dependencies, zero build, fastest loads — but hard to maintain once pages and interactions grow. The best starting point for learning how the web really works.',
    },
    useCase: { zh: '单页落地页、小工具、学习练手。', en: 'One-off landing pages, tiny tools, learning exercises.' },
    trend: 'niche',
    tags: ['static', 'simple', 'js'],
  },

  {
    id: 'solidjs',
    layer: 'frontend',
    name: { zh: 'SolidJS', en: 'SolidJS' },
    blurb: {
      zh: '写法很像 React,但用细粒度响应式、没有虚拟 DOM,运行时性能在前端框架里名列前茅。生态相对小,适合对性能敏感的中小项目。',
      en: 'React-like syntax but fine-grained reactivity with no virtual DOM, giving top-tier runtime performance. Smaller ecosystem; good for performance-sensitive projects.',
    },
    useCase: { zh: '追求极致性能的中小型 Web 应用。', en: 'Performance-critical small/mid web apps.' },
    trend: 'niche',
    tags: ['spa', 'highperf', 'js'],
  },
  {
    id: 'remix',
    layer: 'frontend',
    name: { zh: 'Remix (React Router 7)', en: 'Remix (React Router 7)' },
    blurb: {
      zh: 'React 全栈框架,强调 Web 标准、嵌套路由与表单原生提交,数据加载体验好。已与 React Router 合并演进,是 Next.js 之外的主流选择。',
      en: 'A React full-stack framework emphasizing web standards, nested routes and native form submits. Now merged with React Router — a mainstream alternative to Next.js.',
    },
    useCase: { zh: '重表单、重数据交互的全栈 Web 应用。', en: 'Form- and data-heavy full-stack web apps.' },
    trend: 'rising',
    tags: ['react', 'ssr', 'fullstack', 'seo', 'js'],
  },
  {
    id: 'qwik',
    layer: 'frontend',
    name: { zh: 'Qwik', en: 'Qwik' },
    blurb: {
      zh: '主打"可恢复性(resumability)":几乎不发送 JS,首屏立刻可交互,再大的页面也秒开。理念新颖,但生态尚小。',
      en: 'Built around "resumability": ships almost no JS so pages are interactive instantly, even huge ones. Novel idea, small ecosystem.',
    },
    useCase: { zh: '对首屏速度极致敏感的内容/营销站。', en: 'Content/marketing sites obsessed with first-load speed.' },
    trend: 'niche',
    tags: ['ssr', 'static', 'highperf', 'seo', 'js'],
  },
  {
    id: 'uni-app',
    layer: 'frontend',
    name: { zh: 'uni-app / Taro(小程序)', en: 'uni-app / Taro (mini-programs)' },
    blurb: {
      zh: '用 Vue 或 React 写一套代码,同时发布到微信/支付宝等小程序、H5 和 App。是国内多端开发的主流方案,插件生态丰富。',
      en: 'Write once in Vue/React and publish to WeChat/Alipay mini-programs, H5 and apps at once. The mainstream multi-end approach in China.',
    },
    useCase: { zh: '微信小程序及"小程序+App+H5"多端项目。', en: 'WeChat mini-programs and multi-end (mini-program + app + H5) projects.' },
    trend: 'mainstream',
    tags: ['mobile', 'miniprogram', 'js'],
  },

  // ========================= 后端框架 =========================
  {
    id: 'node-express',
    layer: 'backend',
    name: { zh: 'Node.js (Express / Fastify)', en: 'Node.js (Express / Fastify)' },
    blurb: {
      zh: '用 JavaScript/TypeScript 写后端,和前端同一门语言,生态(npm)最大。Express 最经典,Fastify 更快更现代。异步 I/O 模型适合高并发接口。',
      en: 'Backend in JavaScript/TypeScript — same language as the frontend — with the largest ecosystem (npm). Express is the classic; Fastify is faster and more modern. Its async I/O model suits high-concurrency APIs.',
    },
    useCase: { zh: '通用 API、实时服务、与前端同栈的中小后端。', en: 'General APIs, realtime services, and same-language backends for JS teams.' },
    trend: 'mainstream',
    tags: ['node', 'general', 'js'],
  },
  {
    id: 'nestjs',
    layer: 'backend',
    name: { zh: 'NestJS (Node)', en: 'NestJS (Node)' },
    blurb: {
      zh: '给 Node 后端加上类似 Spring 的分层与依赖注入结构,TypeScript 优先,约定统一。适合规模变大、需要工程规范的团队。',
      en: 'Brings Spring-like layered architecture and dependency injection to Node, TypeScript-first and highly conventional. Good for teams that need engineering structure as the codebase grows.',
    },
    useCase: { zh: '中大型 Node 后端、需要规范与可维护性的团队。', en: 'Mid-to-large Node backends that need structure and maintainability.' },
    trend: 'rising',
    tags: ['node', 'enterprise', 'structured', 'js'],
  },
  {
    id: 'fastapi',
    layer: 'backend',
    name: { zh: 'FastAPI (Python)', en: 'FastAPI (Python)' },
    blurb: {
      zh: '现代 Python Web 框架,类型注解 + 自动生成接口文档,性能好。因 Python 是 AI/数据生态的母语,它成了 AI 应用后端的首选。',
      en: 'A modern Python web framework with type hints and auto-generated API docs, and solid performance. Since Python is the native tongue of AI/data, it is the go-to backend for AI apps.',
    },
    useCase: { zh: 'AI/大模型应用、数据服务、机器学习接口。', en: 'AI/LLM apps, data services, and machine-learning APIs.' },
    trend: 'rising',
    trendNote: { zh: 'AI 浪潮下需求猛增。', en: 'Demand surging with the AI wave.' },
    tags: ['python', 'ai', 'api', 'data'],
  },
  {
    id: 'django',
    layer: 'backend',
    name: { zh: 'Django (Python)', en: 'Django (Python)' },
    blurb: {
      zh: '"电池全含"的 Python 全栈框架,自带 ORM、后台管理、认证。写业务系统开发效率极高,自带的 Admin 后台能省下大量增删改查工作。',
      en: 'A "batteries-included" Python full-stack framework with a built-in ORM, admin panel, and auth. Extremely productive for business systems — its auto Admin saves huge amounts of CRUD work.',
    },
    useCase: { zh: '内容管理、业务后台、数据密集的传统 Web 应用。', en: 'CMS, business back-offices, and data-heavy traditional web apps.' },
    trend: 'mainstream',
    tags: ['python', 'fullstack', 'admin', 'cms', 'relational'],
  },
  {
    id: 'spring',
    layer: 'backend',
    name: { zh: 'Spring Boot (Java)', en: 'Spring Boot (Java)' },
    blurb: {
      zh: '企业级后端的绝对主力,生态成熟、稳定、可扩展,配套完善。学习曲线较陡、样板代码多,但大型系统与国内外大厂招聘最看重它。',
      en: 'The absolute workhorse of enterprise backends — mature, stable, scalable, with a complete ecosystem. Steeper curve and more boilerplate, but large systems and big-company hiring value it most.',
    },
    useCase: { zh: '银行、电商、大型企业级高并发系统。', en: 'Banking, e-commerce, and large enterprise high-concurrency systems.' },
    trend: 'mainstream',
    tags: ['java', 'enterprise', 'robust', 'relational'],
  },
  {
    id: 'go',
    layer: 'backend',
    name: { zh: 'Go (Gin / Echo)', en: 'Go (Gin / Echo)' },
    blurb: {
      zh: '谷歌的 Go 语言,天生为并发与云原生而生,编译成单个二进制、部署极简、性能高、内存省。是微服务与基础设施(Docker、K8s 都用 Go 写)的宠儿。',
      en: "Google's Go, built for concurrency and cloud-native: compiles to a single binary, dead-simple to deploy, fast and memory-lean. A favorite for microservices and infrastructure (Docker and K8s are written in Go).",
    },
    useCase: { zh: '高并发微服务、网关、基础设施与云原生后端。', en: 'High-concurrency microservices, gateways, infra, and cloud-native backends.' },
    trend: 'rising',
    tags: ['go', 'highperf', 'microservice'],
  },
  {
    id: 'laravel',
    layer: 'backend',
    name: { zh: 'Laravel (PHP)', en: 'Laravel (PHP)' },
    blurb: {
      zh: 'PHP 世界最流行的框架,开发体验优雅,自带 ORM、队列、认证等,配套生态(Forge/Vapor)完善。做内容站、电商、中小 SaaS 交付快。',
      en: "The most popular PHP framework, with elegant DX and built-in ORM, queues and auth, plus a rich ecosystem (Forge/Vapor). Fast to deliver content sites, e-commerce, and small SaaS.",
    },
    useCase: { zh: '内容站、电商、中小型 SaaS,快速交付。', en: 'Content sites, e-commerce, and small SaaS delivered quickly.' },
    trend: 'mainstream',
    tags: ['php', 'fullstack', 'rapid', 'cms', 'relational'],
  },
  {
    id: 'dotnet',
    layer: 'backend',
    name: { zh: 'ASP.NET Core (C#)', en: 'ASP.NET Core (C#)' },
    blurb: {
      zh: '微软的现代跨平台后端框架,性能在同类中名列前茅,C# 语言体验优秀,工具链(Visual Studio)强大。在企业与微软技术栈公司中广泛使用。',
      en: "Microsoft's modern cross-platform backend framework — among the fastest in its class — with an excellent C# language and powerful tooling (Visual Studio). Widely used in enterprises and Microsoft-stack shops.",
    },
    useCase: { zh: '企业级系统,尤其是 Windows/微软技术栈团队。', en: 'Enterprise systems, especially Windows/Microsoft-stack teams.' },
    trend: 'mainstream',
    tags: ['csharp', 'enterprise', 'robust', 'relational'],
  },
  {
    id: 'rails',
    layer: 'backend',
    name: { zh: 'Ruby on Rails', en: 'Ruby on Rails' },
    blurb: {
      zh: '"约定优于配置"的鼻祖,极高的原型开发速度,一个人也能快速做出完整产品。热度不如巅峰期,但仍是独立开发者与初创的利器(GitHub、Shopify 都用它起家)。',
      en: 'The originator of "convention over configuration," with extremely fast prototyping — one person can ship a full product. Past its peak in hype, but still a weapon for solo devs and startups (GitHub and Shopify started on it).',
    },
    useCase: { zh: '初创 MVP、独立开发者的全栈产品。', en: 'Startup MVPs and solo-dev full-stack products.' },
    trend: 'niche',
    tags: ['ruby', 'rapid', 'fullstack', 'relational'],
  },
  {
    id: 'supabase',
    layer: 'backend',
    name: { zh: 'Supabase (BaaS)', en: 'Supabase (BaaS)' },
    blurb: {
      zh: '开源的 Firebase 替代:直接给你一个 Postgres 数据库,并自动生成 API、认证、实时订阅、文件存储。几乎不用写后端,前端直连即可,上手极快。',
      en: 'An open-source Firebase alternative: gives you a Postgres database with auto-generated APIs, auth, realtime subscriptions and file storage. Almost no backend to write — the frontend talks to it directly, and setup is fast.',
    },
    useCase: { zh: '快速 MVP、独立开发、前端主导的项目。', en: 'Fast MVPs, solo dev, and frontend-led projects.' },
    trend: 'rising',
    trendNote: { zh: '独立开发圈的热门首选。', en: 'A hot default in the indie-dev scene.' },
    tags: ['baas', 'rapid', 'realtime', 'auth', 'relational'],
  },
  {
    id: 'firebase',
    layer: 'backend',
    name: { zh: 'Firebase (BaaS)', en: 'Firebase (BaaS)' },
    blurb: {
      zh: '谷歌的后端即服务:实时数据库、认证、云函数、推送、托管一站式。移动 App 后端尤其省心,但按用量计费,规模大了成本与锁定要留意。',
      en: "Google's backend-as-a-service: realtime database, auth, cloud functions, push, hosting — all in one. Especially painless as a mobile-app backend, but usage-based pricing and lock-in matter at scale.",
    },
    useCase: { zh: '移动 App 后端、实时小应用、快速验证。', en: 'Mobile-app backends, small realtime apps, and quick validation.' },
    trend: 'mainstream',
    tags: ['baas', 'rapid', 'realtime', 'auth', 'mobile'],
  },
  {
    id: 'nextapi',
    layer: 'backend',
    name: { zh: 'Next.js 全栈 (同一套)', en: 'Next.js full-stack (same app)' },
    blurb: {
      zh: '不单独起后端:直接用 Next.js 的 Route Handlers / Server Actions 写接口与服务端逻辑,前后端同一个项目、同一门语言。最省事的全栈起步方式。',
      en: 'No separate backend: write APIs and server logic with Next.js Route Handlers / Server Actions — one project, one language for both ends. The lowest-friction way to start full-stack.',
    },
    useCase: { zh: '中小型全栈应用、想少维护一套服务的团队。', en: 'Small/mid full-stack apps and teams that want one fewer service to run.' },
    trend: 'mainstream',
    tags: ['node', 'fullstack', 'js'],
  },

  {
    id: 'flask',
    layer: 'backend',
    name: { zh: 'Flask (Python)', en: 'Flask (Python)' },
    blurb: {
      zh: '轻量灵活的 Python 微框架,核心极简、想加什么加什么。适合小型 API、原型和教学;复杂项目多用 Django/FastAPI。',
      en: 'A lightweight, flexible Python micro-framework — minimal core, add what you need. Good for small APIs and prototypes; larger projects lean to Django/FastAPI.',
    },
    useCase: { zh: '小型 API、脚本服务、教学原型。', en: 'Small APIs, script services, teaching prototypes.' },
    trend: 'niche',
    tags: ['python', 'simple', 'api'],
  },
  {
    id: 'hono',
    layer: 'backend',
    name: { zh: 'Hono (边缘/Serverless)', en: 'Hono (edge/serverless)' },
    blurb: {
      zh: '超轻量、极快的 JS 后端框架,专为 Cloudflare Workers/Deno/Bun 等边缘与 Serverless 运行时设计,冷启动快。近年快速上升。',
      en: 'An ultralight, very fast JS backend framework designed for edge/serverless runtimes (Cloudflare Workers, Deno, Bun) with fast cold starts. Rising quickly.',
    },
    useCase: { zh: '边缘函数、Serverless API、轻量后端。', en: 'Edge functions, serverless APIs, lightweight backends.' },
    trend: 'rising',
    tags: ['node', 'edge', 'highperf', 'js'],
  },
  {
    id: 'pocketbase',
    layer: 'backend',
    name: { zh: 'PocketBase (BaaS)', en: 'PocketBase (BaaS)' },
    blurb: {
      zh: '一个可执行文件就是完整后端:内置 SQLite、认证、文件存储与管理后台。零依赖、易自托管,独立开发者做小项目极省事。',
      en: 'A single executable is your whole backend: built-in SQLite, auth, file storage and an admin UI. Zero-dependency and easy to self-host — great for indie projects.',
    },
    useCase: { zh: '独立开发的小型应用、自托管 MVP。', en: 'Indie small apps and self-hosted MVPs.' },
    trend: 'rising',
    tags: ['baas', 'rapid', 'relational', 'auth'],
  },

  // ========================= 数据库 =========================
  {
    id: 'postgres',
    layer: 'database',
    name: { zh: 'PostgreSQL', en: 'PostgreSQL' },
    blurb: {
      zh: '功能最全的开源关系型数据库,既有严谨的表结构与事务,又能存 JSON、地理数据,还能通过 pgvector 扩展直接做 AI 向量检索。新项目的通用首选。',
      en: 'The most feature-complete open-source relational database: rigorous tables and transactions, yet also stores JSON and geo data, and does AI vector search directly via the pgvector extension. The default pick for new projects.',
    },
    useCase: { zh: '绝大多数应用的通用数据库,从小站到大型系统。', en: "A general-purpose database for most apps, from small sites to large systems." },
    trend: 'mainstream',
    trendNote: { zh: '开发者最想用的数据库,连续多年第一。', en: "Developers' most-wanted database, #1 for years running." },
    tags: ['relational', 'general', 'jsonb', 'vector'],
  },
  {
    id: 'mysql',
    layer: 'database',
    name: { zh: 'MySQL / MariaDB', en: 'MySQL / MariaDB' },
    blurb: {
      zh: '装机量最大的开源关系型数据库,成熟稳定、资料多、托管便宜。功能不如 Postgres 全,但对绝大多数业务足够,国内虚拟主机与老系统里最常见。',
      en: 'The most widely deployed open-source relational database — mature, stable, well-documented and cheap to host. Less feature-rich than Postgres but plenty for most apps, and ubiquitous on shared hosting and legacy systems.',
    },
    useCase: { zh: '常规业务系统、CMS、电商,尤其 PHP 生态。', en: 'Standard business systems, CMS, e-commerce — especially the PHP world.' },
    trend: 'mainstream',
    tags: ['relational', 'general'],
  },
  {
    id: 'sqlite',
    layer: 'database',
    name: { zh: 'SQLite', en: 'SQLite' },
    blurb: {
      zh: '整个数据库就是一个文件,零安装、零运维,直接嵌进应用。过去只当本地/测试用,如今借 Turso/LiteFS 等也能撑起中小型生产站点,是边缘部署的新宠。',
      en: 'The entire database is a single file — zero install, zero ops, embedded in your app. Once considered local/testing only, it now powers small/mid production sites via Turso/LiteFS and is a rising pick for edge deployment.',
    },
    useCase: { zh: '小型站点、桌面/移动应用、边缘部署、原型。', en: 'Small sites, desktop/mobile apps, edge deployments, and prototypes.' },
    trend: 'rising',
    tags: ['relational', 'small', 'embedded'],
  },
  {
    id: 'mongodb',
    layer: 'database',
    name: { zh: 'MongoDB', en: 'MongoDB' },
    blurb: {
      zh: '最流行的文档型(NoSQL)数据库,直接存 JSON 文档,表结构灵活、改字段不用迁移。适合数据结构多变、快速迭代的场景;强关联/事务需求下不如关系库。',
      en: 'The most popular document (NoSQL) database — stores JSON documents with a flexible, migration-free schema. Good for evolving data and fast iteration; weaker than relational for heavy joins and transactions.',
    },
    useCase: { zh: '结构多变的内容、日志、快速迭代的原型。', en: 'Shape-shifting content, logs, and fast-iterating prototypes.' },
    trend: 'mainstream',
    tags: ['document', 'flexible', 'nosql'],
  },
  {
    id: 'neon',
    layer: 'database',
    name: { zh: 'Neon / 云 Serverless 数据库', en: 'Neon / Serverless DB' },
    blurb: {
      zh: '"无服务器"的云端 Postgres(如 Neon、PlanetScale):按用量计费、能自动缩容到零、支持分支像 Git 一样开测试库。适合 Serverless / 边缘架构。',
      en: 'Serverless cloud Postgres/MySQL (e.g. Neon, PlanetScale): usage-based billing, scale-to-zero, and Git-like branching for test databases. A fit for serverless and edge architectures.',
    },
    useCase: { zh: '配合 Vercel/边缘部署的现代 Serverless 应用。', en: 'Modern serverless apps paired with Vercel/edge deployment.' },
    trend: 'rising',
    tags: ['relational', 'serverless', 'general'],
  },
  {
    id: 'mssql',
    layer: 'database',
    name: { zh: 'SQL Server / Oracle', en: 'SQL Server / Oracle' },
    blurb: {
      zh: '商业关系型数据库,稳定、功能强、有商业支持,但授权费高。多见于金融、政企与既有 Windows/Java 大型系统,新的中小项目一般不会主动选。',
      en: 'Commercial relational databases — stable, powerful, commercially supported, but expensive to license. Common in finance, government/enterprise and existing large Windows/Java systems; rarely a fresh pick for small projects.',
    },
    useCase: { zh: '金融、政企等既有商业数据库环境。', en: 'Finance, government/enterprise environments already on commercial DBs.' },
    trend: 'niche',
    tags: ['relational', 'enterprise'],
  },
  {
    id: 'dynamodb',
    layer: 'database',
    name: { zh: 'DynamoDB (云 KV)', en: 'DynamoDB (cloud KV)' },
    blurb: {
      zh: 'AWS 的全托管键值/文档数据库,几乎无限水平扩展、稳定的毫秒级延迟。设计需围绕访问模式,灵活查询弱,是超大规模、Serverless 场景的常客。',
      en: "AWS's fully managed key-value/document database with near-infinite horizontal scale and steady millisecond latency. You design around access patterns and lose flexible querying; a staple for hyperscale and serverless.",
    },
    useCase: { zh: '超大规模、可预测访问模式的云原生应用。', en: 'Hyperscale cloud-native apps with predictable access patterns.' },
    trend: 'mainstream',
    tags: ['nosql', 'serverless', 'scale'],
  },

  {
    id: 'clickhouse',
    layer: 'database',
    name: { zh: 'ClickHouse(分析型)', en: 'ClickHouse (analytical)' },
    blurb: {
      zh: '为分析而生的列式数据库,聚合海量数据的查询快得惊人。做报表、埋点分析、实时数仓时和普通业务库(Postgres)分工使用。',
      en: 'A column-oriented database built for analytics, astonishingly fast at aggregating huge datasets. Used alongside a normal app DB for reporting and real-time warehousing.',
    },
    useCase: { zh: 'BI 报表、用户行为分析、实时数仓。', en: 'BI reporting, user-behavior analytics, real-time warehousing.' },
    trend: 'rising',
    tags: ['analytics', 'olap', 'scale'],
  },
  {
    id: 'vectordb',
    layer: 'database',
    name: { zh: '向量数据库 (Pinecone/Qdrant)', en: 'Vector DB (Pinecone/Qdrant)' },
    blurb: {
      zh: '专门存放"向量"、支持按语义相似度检索,是 AI 应用做知识库问答(RAG)的关键。小规模直接用 Postgres 的 pgvector,量大再上专用向量库。',
      en: 'Stores "vectors" for semantic-similarity search — key to knowledge-base Q&A (RAG). Start with Postgres pgvector, move to a dedicated vector DB at scale.',
    },
    useCase: { zh: 'AI 知识库 / RAG 检索、语义搜索、推荐。', en: 'AI knowledge bases / RAG, semantic search, recommendations.' },
    trend: 'rising',
    tags: ['vector', 'ai', 'nosql'],
  },
  {
    id: 'cassandra',
    layer: 'database',
    name: { zh: 'Cassandra / ScyllaDB', en: 'Cassandra / ScyllaDB' },
    blurb: {
      zh: '分布式宽列数据库,天生水平扩展、写入吞吐极高、无单点故障。适合超大规模写入(消息、时序、日志),但查询灵活性弱。',
      en: 'A distributed wide-column database with native horizontal scaling and very high write throughput. Great for massive writes (messaging, time-series, logs) but weak on flexible queries.',
    },
    useCase: { zh: '超大规模写入:消息、时序、物联网数据。', en: 'Massive-write workloads: messaging, time-series, IoT.' },
    trend: 'niche',
    tags: ['nosql', 'scale'],
  },

  // ========================= 开发工具链 =========================
  {
    id: 'typescript',
    layer: 'plugin',
    name: { zh: 'TypeScript', en: 'TypeScript' },
    blurb: {
      zh: '给 JavaScript 加上类型检查,写代码时就能发现一大半低级错误,编辑器补全也更聪明。已是现代前端/Node 项目的默认语言。',
      en: 'Adds type checking to JavaScript so a large share of silly bugs surface as you type, with smarter editor autocomplete. Now the default language for modern frontend/Node projects.',
    },
    useCase: { zh: '几乎所有正经的前端与 Node 项目。', en: 'Nearly every serious frontend and Node project.' },
    trend: 'mainstream',
    tags: ['lang', 'types', 'js'],
  },
  {
    id: 'tailwind',
    layer: 'plugin',
    name: { zh: 'Tailwind CSS', en: 'Tailwind CSS' },
    blurb: {
      zh: '"原子化"CSS:直接在 HTML 里用短类名拼样式,不用为命名纠结、不用来回切文件。上手后写页面极快,是当前最主流的样式方案。',
      en: 'Utility-first CSS: compose styles with short class names right in your HTML — no naming debates, no file-switching. Very fast once it clicks, and the most mainstream styling approach today.',
    },
    useCase: { zh: '快速搭 UI、组件库、几乎任何 Web 界面。', en: 'Rapid UI, component libraries, and almost any web interface.' },
    trend: 'mainstream',
    tags: ['css'],
  },
  {
    id: 'vite',
    layer: 'plugin',
    name: { zh: 'Vite', en: 'Vite' },
    blurb: {
      zh: '现代前端构建/开发服务器,秒级启动、热更新极快。已全面取代 Webpack 成为新项目的默认构建工具,几乎所有框架都用它。',
      en: 'A modern frontend build tool and dev server with near-instant startup and blazing hot-reload. It has broadly replaced Webpack as the default for new projects and underpins nearly every framework.',
    },
    useCase: { zh: '所有现代前端项目的构建与本地开发。', en: 'Building and local dev for all modern frontend projects.' },
    trend: 'mainstream',
    tags: ['build'],
  },
  {
    id: 'webpack',
    layer: 'plugin',
    name: { zh: 'Webpack', en: 'Webpack' },
    blurb: {
      zh: '上一代前端打包工具,功能强但配置繁琐、构建慢。新项目基本被 Vite/Turbopack 取代,主要存在于老项目与部分企业构建链中。',
      en: 'The previous-generation bundler — powerful but fiddly to configure and slow to build. Largely superseded by Vite/Turbopack for new projects; mostly lives on in legacy and some enterprise build chains.',
    },
    useCase: { zh: '维护既有的 Webpack 老项目。', en: 'Maintaining existing Webpack projects.' },
    trend: 'declining',
    tags: ['build', 'legacy'],
  },
  {
    id: 'prisma',
    layer: 'plugin',
    name: { zh: 'Prisma (ORM)', en: 'Prisma (ORM)' },
    blurb: {
      zh: 'Node/TS 生态最流行的 ORM:用 schema 描述数据表,自动生成类型安全的查询代码,不用手写 SQL 也能享受补全与校验。上手友好。',
      en: "The most popular ORM in the Node/TS world: describe tables in a schema and get type-safe query code generated for you, with autocomplete and validation instead of hand-written SQL. Beginner-friendly.",
    },
    useCase: { zh: 'Node/TS 项目访问关系型数据库。', en: 'Accessing relational databases from Node/TS projects.' },
    trend: 'mainstream',
    tags: ['orm', 'relational', 'js'],
  },
  {
    id: 'drizzle',
    layer: 'plugin',
    name: { zh: 'Drizzle (ORM)', en: 'Drizzle (ORM)' },
    blurb: {
      zh: '更轻量、更贴近 SQL 的 TypeScript ORM,零运行时依赖、类型推断强,在边缘/Serverless 场景表现好。近两年快速崛起,常被拿来和 Prisma 对比。',
      en: 'A lighter, SQL-closer TypeScript ORM with zero runtime dependencies and strong type inference, performing well on edge/serverless. It has risen fast in the last two years and is often compared with Prisma.',
    },
    useCase: { zh: '追求轻量与边缘部署的 TS 项目。', en: 'TS projects that want lean footprint and edge deployment.' },
    trend: 'rising',
    tags: ['orm', 'relational', 'js'],
  },
  {
    id: 'zod',
    layer: 'plugin',
    name: { zh: 'Zod (数据校验)', en: 'Zod (validation)' },
    blurb: {
      zh: '用 TypeScript 写一次数据结构,既做运行时校验又自动推出类型。校验表单、接口入参、环境变量的事实标准,和 tRPC、表单库配合紧密。',
      en: 'Define a data shape once in TypeScript and get both runtime validation and inferred types. The de-facto standard for validating forms, API inputs and env vars, tightly paired with tRPC and form libraries.',
    },
    useCase: { zh: '校验表单/接口/配置的输入数据。', en: 'Validating form, API and config inputs.' },
    trend: 'rising',
    tags: ['validation', 'js'],
  },
  {
    id: 'trpc',
    layer: 'plugin',
    name: { zh: 'tRPC', en: 'tRPC' },
    blurb: {
      zh: '前后端同为 TS 时,不用定义 API 契约就能"像调本地函数一样"调后端,类型自动打通、改后端前端立刻报错。全栈单体项目里很爽。',
      en: 'When both ends are TS, call the backend "like a local function" with no API contract to define — types flow end-to-end so a backend change instantly errors the frontend. A joy in full-stack monoliths.',
    },
    useCase: { zh: '前后端同栈(TS)的全栈单体应用。', en: 'Full-stack TS monoliths sharing one codebase.' },
    trend: 'rising',
    tags: ['rpc', 'typesafe', 'js'],
  },
  {
    id: 'bun',
    layer: 'plugin',
    name: { zh: 'Bun (运行时/包管理)', en: 'Bun (runtime/pkg)' },
    blurb: {
      zh: '主打极速的 JS 运行时,集运行、打包、测试、包管理于一身,可作为 Node 的替代。安装依赖和启动都比 Node 快很多,近年上升迅猛但生态仍在追赶。',
      en: 'A speed-focused JS runtime bundling run, bundle, test and package management in one — a Node alternative. Installing deps and startup are far faster than Node; rising fast, though its ecosystem is still catching up.',
    },
    useCase: { zh: '追求速度的现代 JS/TS 项目、脚本、工具。', en: 'Speed-hungry modern JS/TS projects, scripts and tooling.' },
    trend: 'rising',
    tags: ['runtime', 'build', 'js'],
  },
  {
    id: 'eslint-prettier',
    layer: 'plugin',
    name: { zh: 'ESLint + Prettier', en: 'ESLint + Prettier' },
    blurb: {
      zh: 'ESLint 查代码里的潜在问题与坏习惯,Prettier 自动统一代码格式。二者组合是团队协作保持代码整洁一致的标配(新兴的 Biome 想一次做完两件事)。',
      en: 'ESLint catches likely bugs and bad habits; Prettier auto-formats code consistently. Together they are the standard for keeping a team codebase clean and uniform (the newer Biome aims to do both at once).',
    },
    useCase: { zh: '任何多人协作的 JS/TS 代码库。', en: 'Any multi-contributor JS/TS codebase.' },
    trend: 'mainstream',
    tags: ['lint', 'js'],
  },
  {
    id: 'testing',
    layer: 'plugin',
    name: { zh: 'Vitest / Playwright (测试)', en: 'Vitest / Playwright (testing)' },
    blurb: {
      zh: 'Vitest 跑单元测试(与 Vite 同源、极快),Playwright 跑端到端浏览器测试(自动点点点验证真实流程)。有测试的项目上线后才睡得安稳。',
      en: 'Vitest runs unit tests (Vite-native and very fast); Playwright drives end-to-end browser tests (clicking through real flows). Projects with tests are the ones you sleep soundly after shipping.',
    },
    useCase: { zh: '需要质量保障、持续集成的项目。', en: 'Projects that need quality gates and continuous integration.' },
    trend: 'rising',
    tags: ['test', 'js'],
  },

  {
    id: 'shadcn',
    layer: 'plugin',
    name: { zh: 'shadcn/ui (组件)', en: 'shadcn/ui (components)' },
    blurb: {
      zh: '基于 Tailwind + Radix 的组件方案:组件代码直接复制进你的项目、完全可改,不是黑盒依赖。2026 React 生态最火的 UI 做法。',
      en: 'A Tailwind + Radix component approach where you copy the component code into your project and own it fully. The hottest UI pattern in the 2026 React ecosystem.',
    },
    useCase: { zh: '快速搭好看又可定制的 React 界面。', en: 'Quickly building good-looking, customizable React UIs.' },
    trend: 'rising',
    tags: ['css', 'ui', 'react', 'js'],
  },
  {
    id: 'tanstack-query',
    layer: 'plugin',
    name: { zh: 'TanStack Query', en: 'TanStack Query' },
    blurb: {
      zh: '前端数据请求与缓存的事实标准:自动缓存、失效、重试、后台刷新,省掉一大堆手写的 loading/错误状态。React/Vue 等通用。',
      en: 'The de-facto standard for frontend data fetching and caching: auto caching, invalidation, retries and background refresh. Works with React/Vue and more.',
    },
    useCase: { zh: '前端调接口、管理服务端数据状态。', en: 'Fetching APIs and managing server state on the frontend.' },
    trend: 'mainstream',
    tags: ['data-fetching', 'js'],
  },
  {
    id: 'pnpm',
    layer: 'plugin',
    name: { zh: 'pnpm (包管理)', en: 'pnpm (package manager)' },
    blurb: {
      zh: '更快、更省磁盘的 npm 替代:用硬链接共享依赖,安装快、node_modules 更干净,对 monorepo 支持好。新项目越来越多默认用它。',
      en: 'A faster, disk-thrifty npm alternative using hard links: fast installs, a cleaner node_modules, and great monorepo support. Increasingly the default for new projects.',
    },
    useCase: { zh: '任何 JS/TS 项目的依赖安装与管理。', en: 'Installing and managing dependencies in any JS/TS project.' },
    trend: 'rising',
    tags: ['package', 'js'],
  },
  {
    id: 'biome',
    layer: 'plugin',
    name: { zh: 'Biome (Lint + 格式化)', en: 'Biome (lint + format)' },
    blurb: {
      zh: '用 Rust 写的一体化工具,一个工具同时干 ESLint + Prettier 的活,速度快到几乎无感。想简化工具链的新项目在尝试。',
      en: 'A Rust-based all-in-one tool doing both ESLint and Prettier jobs at near-instant speed. New projects wanting a simpler toolchain are adopting it.',
    },
    useCase: { zh: '想用一个快工具替代 ESLint+Prettier。', en: 'Replacing ESLint+Prettier with one fast tool.' },
    trend: 'rising',
    tags: ['lint', 'js'],
  },

  // ========================= 配置 / 基础设施 =========================
  {
    id: 'docker',
    layer: 'infra',
    name: { zh: 'Docker (容器)', en: 'Docker (containers)' },
    blurb: {
      zh: '把应用连同它的运行环境打包成"容器",在你电脑上和服务器上跑得一模一样,彻底解决"在我这没问题"。现代部署的地基,几乎人人都用。',
      en: 'Packages an app together with its environment into a "container" that runs identically on your machine and the server, killing "works on my machine" for good. The bedrock of modern deployment — used almost universally.',
    },
    useCase: { zh: '统一开发/生产环境、一键部署几乎任何服务。', en: 'Unifying dev/prod environments and one-command deploying almost any service.' },
    trend: 'mainstream',
    tags: ['container', 'deploy'],
  },
  {
    id: 'redis',
    layer: 'infra',
    name: { zh: 'Redis (缓存)', en: 'Redis (cache)' },
    blurb: {
      zh: '内存级别的超高速键值存储,常用来缓存热点数据、扛住高并发,也能做会话、排行榜、限流、消息队列。是给数据库"减负提速"的标配。',
      en: 'A blazing-fast in-memory key-value store, commonly used to cache hot data and absorb high traffic, and also for sessions, leaderboards, rate limiting and lightweight queues. The standard way to offload and speed up a database.',
    },
    useCase: { zh: '缓存加速、会话、限流、实时排行榜。', en: 'Cache acceleration, sessions, rate limiting, realtime leaderboards.' },
    trend: 'mainstream',
    tags: ['cache', 'kv'],
  },
  {
    id: 'kafka',
    layer: 'infra',
    name: { zh: 'Apache Kafka (消息队列)', en: 'Apache Kafka (message queue)' },
    blurb: {
      zh: '高吞吐的分布式"消息/事件流"中枢:各服务把事件写进 Kafka,其他服务再各取所需,实现解耦、削峰、异步。适合海量日志、埋点、订单流等大数据管道。小项目通常用不上。',
      en: 'A high-throughput distributed message/event-stream hub: services publish events to Kafka and others consume what they need, enabling decoupling, load-smoothing and async processing. Ideal for massive logs, analytics and order streams — usually overkill for small projects.',
    },
    useCase: { zh: '大规模事件流、日志管道、微服务异步解耦。', en: 'Large-scale event streams, log pipelines, async microservice decoupling.' },
    trend: 'mainstream',
    trendNote: { zh: '大厂/大数据标配,起步阶段别过早引入。', en: 'A big-tech/big-data staple — do not adopt it too early.' },
    tags: ['queue', 'eventstream', 'scale'],
  },
  {
    id: 'rabbitmq',
    layer: 'infra',
    name: { zh: 'RabbitMQ (消息队列)', en: 'RabbitMQ (message queue)' },
    blurb: {
      zh: '经典的消息队列,擅长任务分发与异步处理(如发邮件、生成报表、下单后续流程)。比 Kafka 轻、上手快,适合中小规模的异步任务,而非海量流式数据。',
      en: 'A classic message broker, great for task dispatch and async work (sending email, generating reports, post-order flows). Lighter and easier than Kafka, suited to mid-scale async tasks rather than massive streaming.',
    },
    useCase: { zh: '异步任务队列、后台作业、服务间通信。', en: 'Async task queues, background jobs, inter-service messaging.' },
    trend: 'mainstream',
    tags: ['queue', 'async'],
  },
  {
    id: 'nginx',
    layer: 'infra',
    name: { zh: 'Nginx / Caddy (反向代理)', en: 'Nginx / Caddy (reverse proxy)' },
    blurb: {
      zh: '把用户对域名的访问转发给后台真正跑的程序,并处理 HTTPS、负载均衡、静态资源。Nginx 最经典,Caddy 自动申请续期证书、配置更简单。',
      en: 'Forwards visitors of your domain to the program actually running behind it, and handles HTTPS, load balancing and static assets. Nginx is the classic; Caddy auto-issues/renews certificates with simpler config.',
    },
    useCase: { zh: '对外暴露服务、配 HTTPS、多站点共存。', en: 'Exposing services, setting up HTTPS, hosting multiple sites.' },
    trend: 'mainstream',
    tags: ['proxy', 'deploy'],
  },
  {
    id: 'k8s',
    layer: 'infra',
    name: { zh: 'Kubernetes (容器编排)', en: 'Kubernetes (orchestration)' },
    blurb: {
      zh: '大规模管理成百上千容器的"操作系统":自动扩缩容、故障自愈、滚动更新。威力巨大但复杂度也高,小团队/小项目一般不需要,别为了用而用。',
      en: 'The "operating system" for running hundreds/thousands of containers at scale: autoscaling, self-healing, rolling updates. Powerful but complex — small teams/projects usually do not need it; do not adopt it for its own sake.',
    },
    useCase: { zh: '大规模、多服务、需要弹性伸缩的生产系统。', en: 'Large, multi-service production systems needing elastic scaling.' },
    trend: 'mainstream',
    trendNote: { zh: '大规模才划算,小项目属过度设计。', en: 'Worth it only at scale; over-engineering for small projects.' },
    tags: ['orchestration', 'scale', 'deploy'],
  },
  {
    id: 'vercel',
    layer: 'infra',
    name: { zh: 'Vercel / Netlify / Cloudflare (托管)', en: 'Vercel / Netlify / Cloudflare (hosting)' },
    blurb: {
      zh: '面向前端与全栈的托管平台:连接 Git 仓库,推代码即自动构建、全球 CDN 分发、免运维。做 Next.js/Astro 等前端站点几乎零配置上线,起步免费。',
      en: 'Hosting platforms for frontend and full-stack: connect a Git repo, push to auto-build, distribute over a global CDN, zero ops. Near-zero-config launches for Next.js/Astro sites, free to start.',
    },
    useCase: { zh: '前端/全栈站点免运维上线、边缘部署。', en: 'Ops-free launches for frontend/full-stack sites and edge deployment.' },
    trend: 'mainstream',
    tags: ['hosting', 'serverless', 'cdn', 'edge'],
  },
  {
    id: 'elasticsearch',
    layer: 'infra',
    name: { zh: 'Elasticsearch / Meilisearch (搜索)', en: 'Elasticsearch / Meilisearch (search)' },
    blurb: {
      zh: '专门的全文搜索引擎,提供关键词高亮、拼写纠错、相关性排序等数据库做不好的搜索体验。Meilisearch 更轻更易上手,ES 更适合海量与复杂分析。',
      en: 'Dedicated full-text search engines delivering highlighting, typo tolerance and relevance ranking that databases handle poorly. Meilisearch is lighter and easier; Elasticsearch suits large-scale and complex analytics.',
    },
    useCase: { zh: '站内搜索、日志分析、电商商品检索。', en: 'On-site search, log analytics, e-commerce product search.' },
    trend: 'mainstream',
    tags: ['search'],
  },
  {
    id: 'objectstorage',
    layer: 'infra',
    name: { zh: '对象存储 (S3 / R2 / OSS)', en: 'Object storage (S3 / R2 / OSS)' },
    blurb: {
      zh: '专门存放图片、视频、文件等大块二进制数据,便宜、可无限扩容,配合 CDN 分发。用户上传的头像/附件不该塞进数据库,交给对象存储。',
      en: 'Purpose-built storage for images, video and files — cheap, infinitely scalable, and CDN-friendly. User-uploaded avatars/attachments should not live in your database; hand them to object storage.',
    },
    useCase: { zh: '用户上传、图片/视频托管、备份、静态资源。', en: 'User uploads, image/video hosting, backups, static assets.' },
    trend: 'mainstream',
    tags: ['storage'],
  },
  {
    id: 'cicd',
    layer: 'infra',
    name: { zh: 'GitHub Actions (CI/CD)', en: 'GitHub Actions (CI/CD)' },
    blurb: {
      zh: '推代码后自动跑测试、构建、部署的流水线。把"手动打包上传"变成"推一次 Git 就上线",既减少人为失误,又是团队协作质量的守门员。',
      en: 'A pipeline that auto-runs tests, builds and deploys on every push. Turns "manually package and upload" into "push once, it ships," cutting human error and gatekeeping team quality.',
    },
    useCase: { zh: '自动化测试与部署、任何正经协作项目。', en: 'Automated testing/deploys for any serious collaborative project.' },
    trend: 'mainstream',
    tags: ['cicd', 'deploy'],
  },
  {
    id: 'monitoring',
    layer: 'infra',
    name: { zh: 'Prometheus + Grafana(监控)', en: 'Prometheus + Grafana (monitoring)' },
    blurb: {
      zh: '采集并可视化系统与业务指标(CPU、请求量、延迟…),配好告警,服务一出问题第一时间知道。生产系统的"仪表盘"标配。',
      en: 'Collect and visualize system and business metrics with alerting, so you know the moment something breaks. The standard "dashboard" for production systems.',
    },
    useCase: { zh: '生产环境的指标监控与告警。', en: 'Metrics monitoring and alerting in production.' },
    trend: 'mainstream',
    tags: ['observability', 'ops'],
  },
  {
    id: 'sentry',
    layer: 'infra',
    name: { zh: 'Sentry(错误监控)', en: 'Sentry (error tracking)' },
    blurb: {
      zh: '自动捕获前后端线上报错与性能问题,带堆栈、用户和复现路径,用户还没反馈你就已定位。上线后排障必备。',
      en: 'Automatically captures front- and back-end production errors with stack traces, user context and repro paths — you find bugs before users report them. Essential post-launch.',
    },
    useCase: { zh: '线上错误追踪、性能与崩溃排查。', en: 'Production error tracking and crash triage.' },
    trend: 'mainstream',
    tags: ['observability', 'ops'],
  },
  {
    id: 'terraform',
    layer: 'infra',
    name: { zh: 'Terraform(基础设施即代码)', en: 'Terraform (infra as code)' },
    blurb: {
      zh: '用代码描述服务器、数据库、网络等云资源,一条命令创建/变更/销毁,可版本化、可复现。团队管理复杂云环境的标准做法。',
      en: 'Describe cloud resources as code and create/change/destroy them with one command — versioned and reproducible. The standard way teams manage complex cloud infra.',
    },
    useCase: { zh: '团队化、可复现地管理云资源。', en: 'Managing cloud resources reproducibly across a team.' },
    trend: 'mainstream',
    tags: ['iac', 'ops', 'deploy'],
  },
];

// 便捷索引
const byId = new Map(options.map((o) => [o.id, o]));
export const getOption = (id: string) => byId.get(id);
export const optionsByLayer = (layer: Layer) => options.filter((o) => o.layer === layer);

// ——————————————————————————————————————————————————————————————
// 推断引擎
// ——————————————————————————————————————————————————————————————
export interface Selection {
  frontend?: string;
  backend?: string;
  database?: string;
  plugins: string[];
  infra: string[];
}

export interface Verdict {
  archetypes: { name: Bi; why: Bi }[]; // 命中的项目类型(取前 1~2)
  examples: Bi[]; // 典型项目举例
  warnings: Bi[]; // 搭配隐患
  suggestions: Bi[]; // 智能补充建议
  empty: boolean; // 是否尚未做出有效选择
}

interface Archetype {
  key: string;
  name: Bi;
  why: Bi;
  examples: Bi[];
  weights: Record<string, number>; // tag -> 权重
}

const ARCHETYPES: Archetype[] = [
  {
    key: 'content',
    name: { zh: '内容站 / 博客 / 文档', en: 'Content site / blog / docs' },
    why: {
      zh: '这套组合以静态输出和 SEO 见长,首屏快、利于搜索引擎收录,适合以"读"为主的内容型网站。',
      en: 'This stack excels at static output and SEO — fast first paint, easy to index — a fit for read-heavy content sites.',
    },
    examples: [
      { zh: '个人博客 / 技术文档站', en: 'Personal blog / technical docs' },
      { zh: '公司官网 / 落地页', en: 'Company site / landing pages' },
    ],
    weights: { static: 3, content: 3, seo: 2, cms: 1, mpa: 1 },
  },
  {
    key: 'saas',
    name: { zh: 'SaaS / 管理后台', en: 'SaaS / admin dashboard' },
    why: {
      zh: '前后端 + 关系型数据库的经典全栈组合,能承载账号、权限、增删改查与业务逻辑,是做产品化 Web 应用的主力配置。',
      en: 'The classic full-stack combo of frontend + backend + relational database — accounts, permissions, CRUD and business logic — the workhorse for productized web apps.',
    },
    examples: [
      { zh: '订阅制 SaaS 产品', en: 'Subscription SaaS product' },
      { zh: '企业管理后台 / 数据看板', en: 'Business admin panel / dashboard' },
    ],
    weights: { fullstack: 2, relational: 2, dashboard: 2, orm: 1, node: 1, auth: 1, general: 1 },
  },
  {
    key: 'enterprise',
    name: { zh: '企业级 / 高并发系统', en: 'Enterprise / high-concurrency system' },
    why: {
      zh: '选用了稳健、可扩展、生态成熟的技术,适合对稳定性、并发与长期维护要求高的大型业务系统。',
      en: 'Built on robust, scalable, mature technology — suited to large business systems with high demands on stability, concurrency and long-term maintenance.',
    },
    examples: [
      { zh: '金融 / 电商核心交易系统', en: 'Finance / e-commerce core transaction systems' },
      { zh: '大型企业内部平台', en: 'Large enterprise internal platforms' },
    ],
    weights: { enterprise: 3, robust: 2, java: 1, csharp: 1, highperf: 2, microservice: 2, scale: 2, queue: 1, orchestration: 1 },
  },
  {
    key: 'realtime',
    name: { zh: '实时应用', en: 'Realtime app' },
    why: {
      zh: '组合具备实时通信能力,适合需要即时推送、多人协作或在线状态的应用。',
      en: 'The stack has realtime capability — a fit for apps needing instant push, multi-user collaboration or presence.',
    },
    examples: [
      { zh: '聊天 / IM / 客服系统', en: 'Chat / IM / support' },
      { zh: '协作文档 / 在线白板', en: 'Collaborative docs / whiteboards' },
    ],
    weights: { realtime: 3, kv: 1, queue: 1 },
  },
  {
    key: 'ai',
    name: { zh: 'AI / 大模型应用', en: 'AI / LLM app' },
    why: {
      zh: '以 Python 生态为后端,天然贴近大模型与数据处理,适合做 AI 对话、RAG 检索、智能体等应用。',
      en: 'A Python-based backend sits naturally close to LLMs and data processing — a fit for AI chat, RAG retrieval and agent apps.',
    },
    examples: [
      { zh: 'AI 聊天 / 知识库问答(RAG)', en: 'AI chat / knowledge-base Q&A (RAG)' },
      { zh: '智能体 / 内容生成工具', en: 'Agents / content-generation tools' },
    ],
    weights: { ai: 3, python: 1, data: 1, vector: 2 },
  },
  {
    key: 'mobile',
    name: { zh: '移动 App', en: 'Mobile app' },
    why: {
      zh: '前端选择面向移动端,适合需要上架 iOS/Android 应用商店的产品。',
      en: 'The frontend targets mobile — a fit for products that ship to the iOS/Android app stores.',
    },
    examples: [
      { zh: '跨平台移动 App', en: 'Cross-platform mobile app' },
      { zh: '带后端的社交 / 工具类 App', en: 'Social / utility apps with a backend' },
    ],
    weights: { mobile: 3, baas: 1, realtime: 1 },
  },
  {
    key: 'mvp',
    name: { zh: '快速 MVP / 独立开发', en: 'Fast MVP / indie build' },
    why: {
      zh: '组合主打"少写后端、快速上线",适合一个人或小团队用最短时间验证一个想法。',
      en: 'This combo is about "less backend, faster launch" — ideal for a solo dev or small team validating an idea in minimum time.',
    },
    examples: [
      { zh: '周末上线的验证型产品', en: 'A weekend-launched validation product' },
      { zh: '独立开发者的付费小工具', en: "An indie hacker's paid micro-tool" },
    ],
    weights: { baas: 3, rapid: 3, simple: 1 },
  },
  {
    key: 'dataplatform',
    name: { zh: '数据分析 / BI 平台', en: 'Data analytics / BI platform' },
    why: {
      zh: '组合里含专门的分析型存储,擅长对海量数据做聚合与实时分析,适合报表与数据洞察类系统。',
      en: 'The stack includes analytical storage built for aggregating and analyzing large datasets in real time — a fit for reporting and data-insight systems.',
    },
    examples: [
      { zh: 'BI 报表 / 数据看板', en: 'BI reporting / dashboards' },
      { zh: '用户行为分析 / 实时数仓', en: 'User-behavior analytics / real-time warehouse' },
    ],
    weights: { analytics: 3, olap: 2, data: 2, python: 1 },
  },
];

/** 收集当前选择涉及的所有 tag(计数)。 */
function collectTags(sel: Selection): { tags: Set<string>; ids: string[] } {
  const ids = [sel.frontend, sel.backend, sel.database, ...sel.plugins, ...sel.infra].filter(
    (x): x is string => Boolean(x)
  );
  const tags = new Set<string>();
  for (const id of ids) {
    const o = byId.get(id);
    if (o) o.tags.forEach((t) => tags.add(t));
  }
  return { tags, ids };
}

export function evaluate(sel: Selection): Verdict {
  const empty = !sel.frontend && !sel.backend;
  if (empty) {
    return { archetypes: [], examples: [], warnings: [], suggestions: [], empty: true };
  }

  const { tags } = collectTags(sel);
  const fe = sel.frontend ? byId.get(sel.frontend) : undefined;
  const be = sel.backend ? byId.get(sel.backend) : undefined;
  const db = sel.database ? byId.get(sel.database) : undefined;

  // —— archetype 评分 ——
  const scored = ARCHETYPES.map((a) => {
    let score = 0;
    for (const [tag, w] of Object.entries(a.weights)) if (tags.has(tag)) score += w;
    return { a, score };
  })
    .filter((s) => s.score >= 3)
    .sort((x, y) => y.score - x.score);

  const top = scored.slice(0, 2);
  const archetypes = top.map(({ a }) => ({ name: a.name, why: a.why }));
  // 举例取命中的第一类;若无命中给出通用兜底
  const examples = top.length ? top[0].a.examples : [];

  // —— warnings ——
  const warnings: Bi[] = [];
  const has = (t: string) => tags.has(t);

  if (fe && has('spa') && !has('ssr') && !has('static')) {
    warnings.push({
      zh: '当前前端是纯 SPA(浏览器渲染),首屏对搜索引擎不友好。若这是面向公众、需要 SEO 的网站,建议换成带 SSR 的框架(如 Next.js/Nuxt)。',
      en: 'Your frontend is a pure SPA (browser-rendered), which is weak for SEO on first load. If this is a public, SEO-dependent site, prefer an SSR framework (Next.js/Nuxt).',
    });
  }
  if (fe && has('mobile') && be && has('enterprise')) {
    warnings.push({
      zh: '移动 App 搭配重型企业级后端并无不可,但对小团队偏重;若只是验证想法,BaaS(Supabase/Firebase)会轻很多。',
      en: 'A mobile app on a heavy enterprise backend works, but is heavy for a small team; for validating an idea a BaaS (Supabase/Firebase) is far lighter.',
    });
  }
  if (fe && has('static') && !has('content') && be && (has('enterprise') || has('java') || has('csharp'))) {
    warnings.push({
      zh: '静态/内容型前端搭配重型后端略不匹配:内容站通常配轻后端、BaaS 或 headless CMS 即可。',
      en: 'A static/content frontend paired with a heavy backend is a slight mismatch — content sites usually only need a light backend, a BaaS, or a headless CMS.',
    });
  }
  // 式微技术提醒
  const declining = [sel.frontend, sel.backend, sel.database, ...sel.plugins, ...sel.infra]
    .map((id) => (id ? byId.get(id) : undefined))
    .filter((o): o is StackOption => Boolean(o) && o!.trend === 'declining');
  for (const o of declining) {
    warnings.push({
      zh: `${o.name.zh} 已逐渐式微,新项目建议评估更现代的替代方案。`,
      en: `${o.name.en} is in decline — for new projects consider a more modern alternative.`,
    });
  }

  // —— suggestions ——
  const suggestions: Bi[] = [];
  const topRealtime = top.some((t) => t.a.key === 'realtime');
  const scaleLike = top.some((t) => ['saas', 'enterprise'].includes(t.a.key));
  const feStaticOnly = fe && has('static') && !be;
  const beIsBaas = be && has('baas');
  if (be && !db && !beIsBaas && !feStaticOnly) {
    suggestions.push({
      zh: '你选了后端却没选数据库。大多数业务都要持久化数据,通用首选 PostgreSQL;小站点可用 SQLite。',
      en: 'You picked a backend but no database. Most apps need to persist data — PostgreSQL is the safe default; SQLite works for small sites.',
    });
  }
  if ((topRealtime || scaleLike) && !has('cache')) {
    suggestions.push({
      zh: '规模变大或做实时功能时建议加 Redis:既能缓存热点数据减轻数据库压力,也能承担会话、限流、在线状态。',
      en: 'As you scale or add realtime features, add Redis: cache hot data to relieve the database, and handle sessions, rate limiting and presence.',
    });
  }
  if (top.some((t) => t.a.key === 'ai') && !has('vector')) {
    suggestions.push({
      zh: 'AI 应用要做"知识库检索(RAG)"时需要向量库:最省事是给 PostgreSQL 装 pgvector 扩展,规模大再上专用向量库。',
      en: 'For AI apps doing knowledge retrieval (RAG) you need a vector store: simplest is the pgvector extension on PostgreSQL, moving to a dedicated vector DB at scale.',
    });
  }
  if (top.some((t) => t.a.key === 'content') && !has('cms')) {
    suggestions.push({
      zh: '内容站若需非技术同事也能改内容,可接一个 headless CMS(如 Strapi、Sanity、Contentful)。',
      en: 'If non-technical teammates should edit content, plug in a headless CMS (Strapi, Sanity, Contentful).',
    });
  }
  // Kafka / 消息队列科普式建议(仅在规模型场景且未选队列时)
  if (scaleLike && !has('queue')) {
    suggestions.push({
      zh: '业务做大、出现"发邮件/生成报表/订单后续流程"等耗时任务时,可引入消息队列(中小规模用 RabbitMQ,海量事件流才用 Kafka)做异步解耦——起步阶段通常用不到,别过早引入。',
      en: 'As you grow and hit slow tasks (emails, reports, post-order flows), add a message queue for async decoupling — RabbitMQ at mid scale, Kafka only for massive event streams. You rarely need it early; do not adopt it prematurely.',
    });
  }

  return { archetypes, examples, warnings, suggestions, empty: false };
}

// ——————————————————————————————————————————————————————————————
// 项目类型预设(一键套用一整套推荐技术栈)
// ——————————————————————————————————————————————————————————————
export interface Preset {
  id: string;
  name: Bi; // 项目类型
  desc: Bi; // 一句话:做什么的
  sel: Selection; // 对应的推荐技术栈
}

export const presets: Preset[] = [
  {
    id: 'content',
    name: { zh: '内容站 / 博客', en: 'Content site / blog' },
    desc: { zh: '博客、文档、公司官网,内容为主、SEO 优先', en: 'Blogs, docs, marketing sites — content-first, SEO-first' },
    sel: { frontend: 'astro', backend: undefined, database: undefined, plugins: ['typescript', 'tailwind'], infra: ['vercel'] },
  },
  {
    id: 'saas',
    name: { zh: '全栈 SaaS / 管理后台', en: 'Full-stack SaaS / dashboard' },
    desc: { zh: '订阅制产品、管理后台,前后端一套搞定', en: 'Subscription products and admin panels, full-stack in one app' },
    sel: { frontend: 'nextjs', backend: 'nextapi', database: 'postgres', plugins: ['typescript', 'tailwind', 'prisma'], infra: ['vercel'] },
  },
  {
    id: 'ai',
    name: { zh: 'AI / 大模型应用', en: 'AI / LLM app' },
    desc: { zh: 'AI 对话、RAG 知识库,Python 后端贴近大模型', en: 'AI chat, RAG knowledge base — a Python backend close to LLMs' },
    sel: { frontend: 'nextjs', backend: 'fastapi', database: 'postgres', plugins: ['typescript'], infra: ['docker'] },
  },
  {
    id: 'mobile',
    name: { zh: '移动 App', en: 'Mobile app' },
    desc: { zh: 'iOS/Android 双端,一套代码 + 免运维后端', en: 'iOS/Android from one codebase + an ops-free backend' },
    sel: { frontend: 'reactnative', backend: 'supabase', database: undefined, plugins: ['typescript'], infra: [] },
  },
  {
    id: 'indie',
    name: { zh: '独立开发极速上线', en: 'Indie: ship fast' },
    desc: { zh: '一个人周末上线,少写后端、快速验证', en: 'Solo, weekend launch — minimal backend, validate fast' },
    sel: { frontend: 'nextjs', backend: 'supabase', database: undefined, plugins: ['typescript', 'tailwind'], infra: ['vercel'] },
  },
  {
    id: 'enterprise',
    name: { zh: '企业级系统', en: 'Enterprise system' },
    desc: { zh: '大型业务、高稳定,成熟生态与规范', en: 'Large business systems — stable, mature, conventional' },
    sel: { frontend: 'vue', backend: 'spring', database: 'mysql', plugins: ['typescript'], infra: ['nginx', 'redis'] },
  },
  {
    id: 'scale',
    name: { zh: '高并发 / 微服务', en: 'High-concurrency / microservices' },
    desc: { zh: '大规模、事件驱动,云原生基础设施', en: 'Large scale, event-driven, cloud-native infra' },
    sel: { frontend: 'react-spa', backend: 'go', database: 'postgres', plugins: ['typescript'], infra: ['redis', 'kafka', 'docker', 'k8s'] },
  },
  {
    id: 'dataplatform',
    name: { zh: '数据分析平台', en: 'Data analytics platform' },
    desc: { zh: 'BI 报表、用户行为分析、实时数仓', en: 'BI reporting, user-behavior analytics, real-time warehouse' },
    sel: { frontend: 'react-spa', backend: 'fastapi', database: 'clickhouse', plugins: ['typescript'], infra: ['docker'] },
  },
  {
    id: 'miniprogram',
    name: { zh: '微信小程序 / 多端', en: 'Mini-program / multi-end' },
    desc: { zh: '一套代码发小程序 + App + H5', en: 'One codebase to mini-program + app + H5' },
    sel: { frontend: 'uni-app', backend: 'node-express', database: 'mysql', plugins: ['typescript'], infra: [] },
  },
];

/** 取某语言字符串的小工具(页面用)。 */
export const t = (bi: Bi, lang: Lang) => bi[lang];
