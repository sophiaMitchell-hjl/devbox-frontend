---
tool: nginx
type: examples
title: Nginx 配置示例大全:WebSocket、跨域、HTTPS 跳转、gzip
seoTitle: Nginx 配置示例:WebSocket / CORS / HTTPS / gzip 复制即用 | DevBox
description: 一页收齐最常用的 Nginx 配置片段:WebSocket 代理、CORS 跨域、HTTP 跳 HTTPS、gzip 压缩、二级目录部署、静态文件与 SPA 回落。每段都可复制即用,并说明为什么这么写。
order: 3
updated: "2026-07-10"
faqs:
  - q: 配了 WebSocket 还是连不上,连上几十秒就断?
    a: 连不上通常是漏了 proxy_http_version 1.1 和 Upgrade / Connection 两个请求头,Nginx 默认用 HTTP/1.0 向上游发请求,无法完成协议升级。连上又断多半是超时:Nginx 的 proxy_read_timeout 默认 60 秒,长连接期间没有数据就会被切断,把它调大(如 3600s)或让应用定期发心跳。
  - q: add_header 配了跨域头,为什么有的响应没有?
    a: 两个原因。一是 add_header 只在当前层级生效,子级 location 里只要再写了任何一条 add_header,父级的全部失效,需要在子级重新写一遍。二是默认只对 2xx 和 3xx 响应加头,后端返回 4xx/5xx 时不加,导致浏览器把错误显示成跨域问题,在指令末尾加 always 即可。
  - q: gzip_types 要不要写 text/html?
    a: 不用。text/html 永远会被压缩,写不写都一样,Nginx 甚至不允许你把它从 gzip_types 里去掉。另外不要压缩图片和视频(jpg/png/mp4),它们本身已经是压缩格式,再压一遍只会白费 CPU。
  - q: 二级目录部署后,页面的 CSS 和 JS 全 404?
    a: 说明应用生成的是绝对路径(/assets/app.js),而不是相对于 /blog/ 的路径。这通常不是 Nginx 的问题,要在应用侧配置 base path,比如 Astro 的 base、Vite 的 base、Next.js 的 basePath。Nginx 只负责转发,改不了 HTML 里已经写死的路径。
---

## WebSocket 代理

WebSocket 需要从 HTTP 升级到 `ws` 协议,而 Nginx 默认用 HTTP/1.0 与上游通信,不支持升级。必须显式打开:

```nginx
location /ws/ {
    proxy_pass http://127.0.0.1:3000;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;

    # 长连接期间没有数据传输时的空闲超时,默认 60s
    proxy_read_timeout 3600s;
}
```

三个关键点:`proxy_http_version 1.1` 打开 HTTP/1.1,`Upgrade` 和 `Connection` 两个头把升级请求透传给上游,`proxy_read_timeout` 防止空闲连接被 Nginx 提前掐断。

## CORS 跨域

```nginx
location /api/ {
    add_header Access-Control-Allow-Origin  "https://example.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Max-Age       86400 always;

    # 预检请求直接返回,不必打扰上游
    if ($request_method = OPTIONS) {
        return 204;
    }

    proxy_pass http://127.0.0.1:3000;
}
```

`always` 不能省。没有它,Nginx 只给 2xx / 3xx 响应加这些头;后端一旦返回 500,浏览器拿到的是一个没有 CORS 头的响应,控制台里会报成跨域错误,把你引向完全错误的排查方向。

另外注意:**`add_header` 不会向下继承**。如果子级 location 里写了任何一条 `add_header`,父级的所有 `add_header` 都会失效,必须在子级重新写全。

如果要允许携带 Cookie,`Allow-Origin` 不能用 `*`,必须回显具体域名,并加上 `add_header Access-Control-Allow-Credentials true always;`。

## HTTP 跳转 HTTPS

用一个独立的 80 端口 server 块专门做跳转,不要在 443 的 server 里用 `if` 判断:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 其余配置...
}
```

`$host` 保留用户访问的域名(而不是写死一个),`$request_uri` 保留完整路径和查询参数,所以 `http://example.com/a?b=1` 会跳到 `https://example.com/a?b=1`。

一个提醒:301 是永久重定向,浏览器会**长期缓存**。配置期间建议先用 302 测试,确认无误再改成 301,否则改错了很难在自己浏览器上验证。

## gzip 压缩

```nginx
# 写在 http 块里,全站生效
gzip on;
gzip_comp_level 5;
gzip_min_length 256;
gzip_vary on;
gzip_proxied any;
gzip_types
    text/plain
    text/css
    text/xml
    application/json
    application/javascript
    application/xml
    image/svg+xml;
```

几个取值的理由:

- `gzip_comp_level 5`:1 到 9,再往上压缩率提升很小但 CPU 消耗明显上升,5 是常用的平衡点。
- `gzip_min_length 256`:太小的响应压完可能比原文还大(gzip 有固定头部开销),不值得。
- `gzip_vary on`:让响应带上 `Vary: Accept-Encoding`,避免 CDN 把压缩过的内容发给不支持 gzip 的客户端。
- `gzip_types` **不用写 `text/html`**,它永远被压缩。也**不要写图片和视频**,jpg / png / mp4 本身已经压缩过。

## 二级目录部署

把一个跑在 4321 端口的应用挂到 `example.com/blog/` 下:

```nginx
location /blog/ {
    proxy_pass http://127.0.0.1:4321/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

末尾那个斜杠是关键:它让 `/blog/posts/hello` 到达上游时变成 `/posts/hello`,也就是应用自己认识的路径。去掉斜杠,上游收到的是 `/blog/posts/hello`,除非你的应用本来就配置了 `/blog` 前缀,否则会 404。

**但只改 Nginx 通常不够**。应用生成的 HTML 里如果引用了 `/assets/app.js` 这种绝对路径,浏览器会去请求 `example.com/assets/app.js`,而不是 `/blog/assets/app.js`。这必须在应用侧解决:Astro 的 `base`、Vite 的 `base`、Next.js 的 `basePath`。

## 静态文件与 SPA 回落

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/example;
    index index.html;

    # 找不到文件就交给 index.html,由前端路由接管
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 带哈希的静态资源可以长期强缓存
    location ~* \.(js|css|woff2|png|jpg|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

`try_files $uri $uri/ /index.html` 是单页应用的标准写法:先当成文件找,再当成目录找,都没有就返回 `index.html`,让 React Router / Vue Router 在浏览器里处理这个路径。没有这一行,用户刷新 `/about` 就会得到 Nginx 的 404。

注意这里的 `location ~*` 是正则,会**抢在** `location /` 之前匹配 `.js` 文件——这正是我们想要的。如果你还有一个 `location /static/` 需要保护,记得给它加 `^~`,详见 [location 匹配规则](/nginx/guide)。

## 上传文件 413

```nginx
client_max_body_size 50m;
```

默认值只有 `1m`,任何稍大的文件上传都会被 Nginx 直接拒掉,返回 **413 Request Entity Too Large**,请求根本到不了后端。这一行可以写在 `http`、`server` 或 `location` 里,按需要的粒度放。

## 下一步

- 上面这些选项 [Nginx 配置生成器](/nginx) 都能勾选生成,还能一键看等价的 Caddy 配置;
- 想搞懂 location 优先级和 proxy_pass 斜杠背后的规则,见 [Nginx 配置怎么写](/nginx/guide);
- 配好了却报 502 / 403,见 [Nginx 502 Bad Gateway 怎么排查](/nginx/troubleshooting)。
