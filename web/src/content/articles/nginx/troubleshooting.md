---
tool: nginx
type: troubleshooting
title: Nginx 502 Bad Gateway 怎么排查?常见报错一次讲清
seoTitle: Nginx 502 Bad Gateway 解决方法与常见报错排查 | DevBox
description: 502 Bad Gateway 说明 Nginx 找不到或读不懂上游的响应。本文给出四步定位法,并逐一讲清 502 的六种成因,以及 403、413、504、配置改了不生效等常见问题的解法。
order: 4
updated: "2026-07-10"
faqs:
  - q: 502 和 504 有什么区别?
    a: 502 Bad Gateway 是 Nginx 连不上上游,或者上游返回了它读不懂的东西(连接被拒、进程崩了、响应头超出缓冲区)。504 Gateway Timeout 是连上了、请求也发出去了,但上游在 proxy_read_timeout 时间内没把响应写完。简单说:502 是"联系不上",504 是"联系上了但太慢"。
  - q: 在 Docker 里 Nginx 代理到 127.0.0.1 为什么 502?
    a: 因为容器里的 127.0.0.1 指的是 Nginx 容器自己,不是宿主机,也不是别的容器。同一个 compose 网络里应该用服务名(如 proxy_pass http://api:3000)。要访问宿主机上的服务,Docker Desktop 用 host.docker.internal,Linux 上需要显式加 extra_hosts 映射。
  - q: nginx -t 通过了,为什么改动还是没生效?
    a: nginx -t 只检查语法,不会应用配置。必须再执行 nginx -s reload。如果 reload 之后仍无变化,检查是否有另一个 server 块带 default_server 抢先接管了这个请求,或浏览器缓存了此前的 301 永久跳转(用无痕窗口或 curl -I 验证)。
  - q: 日志在哪里看?
    a: 默认在 /var/log/nginx/error.log 和 access.log。用 tail -f /var/log/nginx/error.log 一边刷新页面一边看,502 的真实原因几乎总会写在这里。容器里的 Nginx 通常把日志重定向到了标准输出,用 docker logs -f <容器名> 看。
---

## 先做这四步

遇到 502,不要急着改配置。按顺序做完这四步,原因基本就浮出来了:

```bash
# 1. 看 Nginx 到底报了什么
tail -f /var/log/nginx/error.log

# 2. 上游进程还活着吗?端口对不对?
ss -lntp | grep 3000

# 3. 绕过 Nginx,直接请求上游
curl -i http://127.0.0.1:3000/

# 4. 配置语法有没有问题
nginx -t
```

第 3 步最关键:**如果 `curl` 直接打上游也失败,那就跟 Nginx 没关系**,问题在你的应用。这一步能立刻把排查范围砍掉一半。

## 502 的六种成因

**上游根本没启动。** `error.log` 里会写 `connect() failed (111: Connection refused)`。111 就是"对方端口上没人监听"。先确认应用进程在跑、端口没写错。

**上游只监听了 127.0.0.1,而 Nginx 不在同一台机器上。** 很多框架默认绑定 `127.0.0.1`,外部完全连不进来。把应用改成监听 `0.0.0.0`。

**在 Docker 里代理到了 `127.0.0.1`。** 容器里的 `127.0.0.1` 是容器自己。同一个 compose 网络内要用服务名:

```nginx
# 错:指向 Nginx 容器自身
proxy_pass http://127.0.0.1:3000;

# 对:指向 compose 里名为 api 的服务
proxy_pass http://api:3000;
```

**上游响应头太大。** 典型场景是 Cookie 或 JWT 塞得太多。`error.log` 里写 `upstream sent too big header`。Nginx 读响应头的缓冲区默认较小,调大即可:

```nginx
proxy_buffer_size   16k;
proxy_buffers       4 16k;
proxy_busy_buffers_size 32k;
```

**上游进程崩了或被 OOM 杀了。** 请求打过去的瞬间进程退出,Nginx 拿不到完整响应。看应用自己的日志,以及 `dmesg | grep -i oom`。

**SELinux 挡住了。** 只在 CentOS / RHEL / Fedora 上出现,现象是配置全对、`curl` 直连上游正常,但经 Nginx 就 502。验证并放行:

```bash
getenforce                                    # 返回 Enforcing 才有嫌疑
setsebool -P httpd_can_network_connect 1      # 允许 Nginx 发起网络连接
```

## 403 Forbidden

发静态文件时最常见,原因几乎总是这三个之一:

- **目录权限不足。** Nginx 的 worker 进程(通常是 `www-data` 或 `nginx` 用户)需要对站点目录有读权限,并且对**路径上的每一层目录**都有执行权限(`x`)。放在 `/root/` 下面的站点必然 403。
- **没有 index 文件,也没开目录列表。** 访问 `/` 时找不到 `index.html`,Nginx 拒绝列出目录。要么放一个 index,要么在 location 里加 `autoindex on`(注意这会公开你的文件列表)。
- **`root` 路径写错了。** 检查拼接结果:`root /var/www` 配 `location /static/`,实际找的是 `/var/www/static/`,而不是 `/var/www/`。这一点在 [location 匹配规则](/nginx/guide) 里讲得更细。

## 413 Request Entity Too Large

上传稍大的文件就失败,请求根本没到后端。Nginx 的 `client_max_body_size` 默认只有 `1m`:

```nginx
client_max_body_size 50m;
```

改完记得 `nginx -s reload`。如果前面还有一层 CDN 或云负载均衡,它们通常也有自己的上限,要一并调整。

## 504 Gateway Timeout

连上了,但上游太慢。Nginx 等 `proxy_read_timeout`(默认 60 秒)拿不到响应就断开:

```nginx
proxy_connect_timeout 5s;    # 建立连接的超时,短一点便于快速失败
proxy_read_timeout    300s;  # 等上游返回数据的超时
proxy_send_timeout    300s;
```

但调大超时是**治标**。504 通常意味着某个接口真的慢(大查询、外部 API 阻塞),把它改成异步任务比把超时调到 5 分钟更值得。WebSocket 场景则确实需要调大 `proxy_read_timeout`,见 [Nginx 配置示例大全](/nginx/examples)。

## 改了配置不生效

按这个顺序查:

1. **忘了 reload。** `nginx -t` 只验证语法,不应用配置。必须 `nginx -s reload`。
2. **请求进了别的 server 块。** 当 `server_name` 都对不上时,Nginx 会把请求交给带 `default_server` 的那个,或者配置里的第一个 server 块。用 `curl -H "Host: example.com" -I http://127.0.0.1` 精确验证。
3. **浏览器缓存了 301。** 301 是永久重定向,浏览器会长期缓存,你在自己机器上永远看到旧行为。用无痕窗口,或者 `curl -I` 来验证真实响应。
4. **改错了文件。** `nginx -T`(大写 T)会打印出**当前实际生效的完整配置**,包括所有 `include` 进来的文件。找不到你的改动,就说明这个文件根本没被加载。

## 下一步

- 与其手写配置再来排错,不如用 [Nginx 配置生成器](/nginx) 直接生成一份正确的;
- 想彻底搞懂 location 优先级与 proxy_pass 斜杠,见 [Nginx 配置怎么写](/nginx/guide);
- 需要现成的 WebSocket / CORS / HTTPS 片段,见 [Nginx 配置示例大全](/nginx/examples)。
