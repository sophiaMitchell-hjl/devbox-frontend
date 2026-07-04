#!/usr/bin/env bash
# DevBox 一键部署:拉代码 → 构建前端(含内链校验)→ 同步到 web 根 → 清 Cloudflare 缓存。
# 在服务器仓库根目录执行:bash deploy.sh
set -euo pipefail

WEB_ROOT="/var/www/devbox"   # nginx/caddy 的站点根目录(见 /etc/nginx/conf.d/devbox.conf)

cd "$(dirname "$0")"         # 切到仓库根

echo "▶ 拉取最新代码…"
git pull --ff-only

echo "▶ 构建前端(内链校验会在此拦截死链)…"
cd web
npm install --no-audit --no-fund
npm run build

echo "▶ 同步 dist → ${WEB_ROOT}(--delete 清理旧文件)…"
rsync -a --delete dist/ "${WEB_ROOT}/"

# 清 Cloudflare 缓存(HTML 边缘缓存后,不清会让用户看到旧页面)。
# 需先设置环境变量:export CF_ZONE_ID=xxx CF_API_TOKEN=xxx
if [ -n "${CF_ZONE_ID:-}" ] && [ -n "${CF_API_TOKEN:-}" ]; then
  echo "▶ 清 Cloudflare 缓存…"
  resp=$(curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}')
  if echo "$resp" | grep -q '"success":true'; then
    echo "  ✓ CF 缓存已清空"
  else
    echo "  ✗ CF 清缓存失败:$resp"
  fi
else
  echo "▶ 跳过 CF 清缓存(未设 CF_ZONE_ID / CF_API_TOKEN)。请到 Cloudflare 后台手动 Purge Everything。"
fi

echo "✅ 部署完成。"
