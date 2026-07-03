# DevBox — 开发者在线工具箱

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

## 文档

见 `docs/`:技术方案、关键词矩阵、网站结构、页面 SEO、入门层与开发流程。
