# DevBox API(FastAPI)

承接"必须由服务器完成"的只读功能。前端(`web/`)通过 `/api/*` 调用。

## 本地运行

```bash
# 在仓库根目录,使用已有的 .venv
.venv/Scripts/python -m pip install -r api/requirements.txt
.venv/Scripts/python -m uvicorn main:app --app-dir api --port 8000 --reload
```

开发时前端 `web/` 的 Astro dev 已配置把 `/api` 代理到 `http://127.0.0.1:8000`(见 `web/astro.config.mjs`),因此前端 `fetch('/api/ip')` 会自动打到本服务。

## 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/ip` | 返回访问者公网 IP 及归属地(尽力而为) |

## 部署

前端(静态)与本 API 分开部署。

### 用 Docker(推荐)

```bash
# 在 api/ 目录
docker build -t devbox-api .
docker run -d -p 8000:8000 --restart unless-stopped devbox-api
# 或
docker compose up -d --build
```

### 用 Fly.io

```bash
cd api
fly launch --no-deploy   # 首次:生成/确认 fly.toml(仓库已附示例)
fly deploy
```

也可直接在 VPS 上 `uvicorn main:app --host 0.0.0.0 --port 8000`,前置 Nginx/Caddy 反代 + HTTPS(反代配置可用本站 `/nginx` 生成器生成)。

### 前端接入

- 同域方案(推荐):把 `/api/*` 由 CDN/反代转发到本服务,前端 `PUBLIC_API_BASE` 留空即可,无跨域。
- 跨域方案:前端设 `PUBLIC_API_BASE=https://api.你的域名`(见 `web/.env.example`),后端已开启 CORS。

## 原则

只提供**只读、无副作用**的能力。不执行用户提交的任意命令(如 `nginx -t`),避免公网服务的命令注入与资源滥用风险。
