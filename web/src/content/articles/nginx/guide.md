---
tool: nginx
type: guide
title: Nginx 配置怎么写?location 匹配规则与 proxy_pass 斜杠详解
seoTitle: Nginx 配置教程:location 匹配规则与 proxy_pass 斜杠 | DevBox
description: 看懂 Nginx 配置文件的三层结构,搞清 location 五种匹配方式的优先级,以及 proxy_pass 末尾加不加斜杠的关键区别。附 root 与 alias 的选择和常用指令速查。
order: 2
updated: "2026-07-10"
faqs:
  - q: proxy_pass 后面到底要不要加斜杠?
    a: 看你想不想去掉 location 前缀。proxy_pass 的地址里只要带了路径部分(哪怕只有一个 /),Nginx 就会把 location 匹配到的那段前缀替换成它;不带路径则原样把完整 URI 传给上游。例如 location /api/ 配 proxy_pass http://127.0.0.1:3000/ 时,/api/users 会变成 /users;不加斜杠则仍是 /api/users。
  - q: location 的匹配优先级是怎样的?
    a: Nginx 先找出最长的普通前缀匹配并记住它。如果这个匹配带 ^~,就直接用它,不再试正则。否则按配置文件里出现的顺序逐个试正则(~ 和 ~*),第一个匹配上的胜出。所有正则都不匹配时,才回头用刚才记住的最长前缀。= 精确匹配优先级最高,一旦命中立刻结束。
  - q: root 和 alias 有什么区别?
    a: root 会把 location 匹配的路径拼在后面,alias 则用它整个替换掉 location 匹配的部分。location /static/ 配 root /var/www 时,请求 /static/a.png 找的是 /var/www/static/a.png;配 alias /var/www/ 时找的是 /var/www/a.png。alias 用在前缀 location 时结尾必须带斜杠。
  - q: 改完配置为什么不生效?
    a: Nginx 不会自动重载。先用 nginx -t 检查语法,再用 nginx -s reload 平滑重载。如果仍不生效,检查是不是有另一个 server 块用 default_server 抢先接管了请求,或者浏览器缓存了 301 跳转。
---

## Nginx 配置文件的三层结构

一个 Nginx 配置由外到内是三层嵌套,理解了这个结构,大部分"这行该写在哪"的疑问就没了:

```nginx
http {
    # 全局:gzip、日志格式、超时,对所有站点生效
    gzip on;

    server {
        # 一个站点(一个域名 + 端口)
        listen 80;
        server_name example.com;

        location /api/ {
            # 一类 URL 路径的处理规则
            proxy_pass http://127.0.0.1:3000;
        }
    }
}
```

- **http**:管全局。写在这里的指令,底下所有站点都继承。
- **server**:管一个站点。由 `listen`(端口)和 `server_name`(域名)共同决定哪个请求进哪个 server。
- **location**:管一类路径。请求进入 server 之后,再由 location 决定怎么处理。

内层可以覆盖外层。比如 `http` 里开了 `gzip on`,某个 `location` 里写 `gzip off`,那个路径就不压缩。

## location 的五种匹配方式

这是 Nginx 配置里最容易踩坑的地方。先看五种写法:

| 写法 | 名称 | 例子 | 含义 |
|------|------|------|------|
| `= /path` | 精确匹配 | `location = /` | URI 必须完全等于 `/` |
| `^~ /path` | 前缀匹配(禁用正则) | `location ^~ /static/` | 以 `/static/` 开头,且命中后不再试正则 |
| `~ 正则` | 正则(区分大小写) | `location ~ \.php$` | 以 `.php` 结尾 |
| `~* 正则` | 正则(不区分大小写) | `location ~* \.(jpg\|png)$` | 以 `.jpg` 或 `.png` 结尾 |
| `/path` | 普通前缀匹配 | `location /api/` | 以 `/api/` 开头 |

## 优先级:不是从上往下读

很多人以为 Nginx 像 if-else 一样从上往下匹配,**这是错的**。真实的匹配过程是:

1. 先看有没有 `=` 精确匹配。命中就**立刻结束**,不再往下看。
2. 遍历所有普通前缀匹配,**记住其中最长的那一个**。
3. 如果这个最长前缀带 `^~`,直接用它,**跳过所有正则**。
4. 否则,**按配置文件里书写的顺序**逐个试正则,**第一个**匹配上的胜出。
5. 所有正则都没匹配上,才回头用第 2 步记住的那个最长前缀。

所以有两条结论要记住:

- **普通前缀之间比的是"谁更长",跟写的顺序无关。** `location /a/` 和 `location /a/b/` 谁写前面都一样,`/a/b/c` 一定进后者。
- **正则之间比的是"谁写在前面",跟长短无关。** 正则的顺序有意义,前缀的顺序没有。

一个经典的翻车例子:

```nginx
location /static/ {
    root /var/www;
}
location ~* \.(js|css|png)$ {
    expires 30d;
}
```

你以为 `/static/app.js` 会走第一个 location,实际上它走了**第二个**——因为 `/static/` 是普通前缀,不带 `^~`,所以 Nginx 会继续试正则,而 `.js` 正好匹配上了。修法是把第一个改成 `location ^~ /static/`。

## proxy_pass 末尾的斜杠

这是 Nginx 第二大坑。规则其实只有一句话:

> **`proxy_pass` 的地址里只要带了路径部分,Nginx 就会用它替换掉 location 匹配的那段前缀;不带路径,就原样把完整 URI 传给上游。**

注意:**一个单独的 `/` 也算"带了路径"**。所以:

```nginx
# 不带路径 —— 上游收到 /api/users
location /api/ {
    proxy_pass http://127.0.0.1:3000;
}

# 带路径(哪怕只是 /)—— 上游收到 /users
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
}

# 带路径 —— 上游收到 /v1/users
location /api/ {
    proxy_pass http://127.0.0.1:3000/v1/;
}
```

怎么选?**看你的后端认不认 `/api` 这个前缀。**

- 后端路由本来就写的是 `/api/users` → **不加斜杠**,把前缀原样传过去。
- 后端路由是 `/users`,`/api` 只是你在网关层加的命名空间 → **加斜杠**,把前缀剥掉。

还有一个限制:**在正则 location 里,`proxy_pass` 不能带路径部分**,因为 Nginx 不知道该替换掉哪一段。

## root 还是 alias

发静态文件时的另一个斜杠陷阱。两者的区别是**拼接**还是**替换**:

```nginx
# root:把 location 的路径拼在 root 后面
location /static/ {
    root /var/www;          # /static/a.png → /var/www/static/a.png
}

# alias:用 alias 整个替换掉 location 匹配的部分
location /static/ {
    alias /var/www/;        # /static/a.png → /var/www/a.png
}
```

日常建议:**优先用 `root`**,行为更直观。只有当磁盘目录名和 URL 路径对不上时才用 `alias`,并且记住**前缀 location 里的 `alias` 结尾必须带斜杠**,否则路径会拼错。

## 常用指令速查

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    # 上传大小上限,默认只有 1m,传文件必改
    client_max_body_size 50m;

    # 静态站点 / SPA:文件找不到就回落到 index.html
    root /var/www/example;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 反向代理:这四个头几乎是标配
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

那四个 `proxy_set_header` 值得解释一下:不加的话,上游程序看到的来访 IP 全是 Nginx 自己(`127.0.0.1`),看到的协议全是 `http`(哪怕用户走的是 HTTPS)。很多框架生成绝对 URL、做限流、记日志时都依赖这几个头。

改完记得先验证再重载,别直接 restart:

```bash
nginx -t          # 检查语法,不通过就别 reload
nginx -s reload   # 平滑重载,不断连接
```

## 下一步

- 不想手写?用 [Nginx 配置生成器](/nginx) 填表单直接出配置,还能一键切换等价的 Caddy 写法;
- 要现成的 WebSocket、CORS、HTTPS 跳转配置,见 [Nginx 配置示例大全](/nginx/examples);
- 配好了但报 502,见 [Nginx 502 Bad Gateway 怎么排查](/nginx/troubleshooting)。
