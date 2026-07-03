"""DevBox API —— 承接"必须由服务器完成"的功能(见《技术方案.md》§2 第二阶段)。

目前提供:
- GET /api/health  健康检查
- GET /api/ip      返回访问者公网 IP 及(尽力而为的)归属地信息

只读、无副作用;不执行用户提交的任意命令。
"""
from __future__ import annotations

import json
import urllib.request

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DevBox API", version="0.1.0")

# 前端为独立静态站,需允许跨域(生产可收紧为你的域名)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_PRIVATE_PREFIXES = ("127.", "10.", "192.168.", "172.", "::1", "localhost")


def _client_ip(request: Request) -> str:
    """优先取反向代理透传的真实 IP。"""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    xr = request.headers.get("x-real-ip")
    if xr:
        return xr.strip()
    return request.client.host if request.client else ""


def _geo(ip: str) -> dict:
    """尽力而为的归属地查询;失败或内网 IP 时返回空。"""
    if not ip or ip.startswith(_PRIVATE_PREFIXES):
        return {}
    try:
        url = f"http://ip-api.com/json/{ip}?lang=zh-CN&fields=status,country,regionName,city,isp,timezone"
        with urllib.request.urlopen(url, timeout=3) as resp:
            data = json.load(resp)
        if data.get("status") == "success":
            return {
                "country": data.get("country"),
                "region": data.get("regionName"),
                "city": data.get("city"),
                "isp": data.get("isp"),
                "timezone": data.get("timezone"),
            }
    except Exception:
        pass
    return {}


@app.get("/")
def root() -> dict:
    return {
        "name": "DevBox API",
        "status": "running",
        "endpoints": ["/api/health", "/api/ip"],
    }


@app.get("/api/health")
def health() -> dict:
    return {"ok": True}


@app.get("/api/ip")
def ip_info(request: Request) -> dict:
    ip = _client_ip(request)
    return {
        "ip": ip,
        "userAgent": request.headers.get("user-agent", ""),
        "language": request.headers.get("accept-language", ""),
        **_geo(ip),
    }
