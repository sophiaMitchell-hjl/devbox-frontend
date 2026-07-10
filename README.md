# DevBox — 开发者在线工具箱

**在线访问:<https://devbox.nextlink.me>**([English](https://devbox.nextlink.me/en))

填参数,出配置与命令,复制即用。多数工具在浏览器本地运行、不上传;少数需服务器的功能由 FastAPI 后端承接。

## 结构

```
devbox/
├─ web/    Astro 静态前端(工具页 + 内容集群 + SEO)
├─ api/    FastAPI 后端(仅承接需服务器的只读功能,如 IP 查询)
└─ docs/   产品与 SEO 方案文档
```

## 本地开发

```bash
# 前端
cd web && npm install && npm run dev        # http://localhost:4321

# 后端(可选,仅 /ip 等工具需要)
.venv/Scripts/python -m pip install -r api/requirements.txt
.venv/Scripts/python -m uvicorn main:app --app-dir api --port 8000 --reload
```

Astro dev 已把 `/api` 代理到本地 FastAPI,前端零配置联调。

## 部署

- 前端:Cloudflare Pages / Vercel(静态,`web/` 构建 `dist/`)。
- 后端:Docker / Fly.io / VPS(见 `api/README.md`)。

## 内容集群

每个工具页(支柱页)下挂一组内容页,讲清这项技术本身,而不只是给个输入框。

**[Cron 表达式生成器](https://devbox.nextlink.me/cron)**

- [Cron 是什么?一文讲清 crontab 与表达式格式](https://devbox.nextlink.me/cron/what-is-cron)
- [Cron 表达式怎么写?五个字段规则详解与示例](https://devbox.nextlink.me/cron/guide)
- [Cron 表达式示例大全:常见定时场景怎么写](https://devbox.nextlink.me/cron/examples)
- [crontab 不执行怎么办?排查步骤与解决方法](https://devbox.nextlink.me/cron/troubleshooting)

**[正则表达式测试](https://devbox.nextlink.me/regex)**

- [正则表达式是什么?一文看懂基础语法](https://devbox.nextlink.me/regex/what-is-regex)
- [正则表达式怎么写?从零构造与实战技巧](https://devbox.nextlink.me/regex/guide)
- [常用正则表达式大全:邮箱/手机号/URL 等](https://devbox.nextlink.me/regex/examples)
- [正则不匹配 / 匹配过多怎么办?排查指南](https://devbox.nextlink.me/regex/troubleshooting)

**[Nginx 配置生成器](https://devbox.nextlink.me/nginx)**

- [Nginx 配置怎么写?location 匹配规则与 proxy_pass 斜杠详解](https://devbox.nextlink.me/nginx/guide)
- [Nginx 配置示例大全:WebSocket、跨域、HTTPS 跳转、gzip](https://devbox.nextlink.me/nginx/examples)
- [Nginx 502 Bad Gateway 怎么排查?常见报错一次讲清](https://devbox.nextlink.me/nginx/troubleshooting)

**[Docker Compose 生成器](https://devbox.nextlink.me/docker-compose)**

- [Docker Compose 教程:端口、卷、环境变量与 depends_on 详解](https://devbox.nextlink.me/docker-compose/guide)
- [Docker Compose 配置示例:Nginx、Postgres、Redis 复制即用](https://devbox.nextlink.me/docker-compose/examples)
- [Docker Compose 启动失败怎么排查?八个常见问题一次解决](https://devbox.nextlink.me/docker-compose/troubleshooting)

**[技术栈组合器](https://devbox.nextlink.me/stack)** · [部署指南](https://devbox.nextlink.me/guide/deploy-to-server) · [全部工具](https://devbox.nextlink.me/)

## 文档

见 `docs/`:技术方案、关键词矩阵、网站结构、页面 SEO、入门层与开发流程。
