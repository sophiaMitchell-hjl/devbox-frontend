---
tool: docker-compose
type: examples
title: Docker Compose 配置示例:Nginx、Postgres、Redis 复制即用
seoTitle: Docker Compose 示例:Nginx / Postgres / Redis 配置模板 | DevBox
description: 收齐最常用的 docker-compose.yml 模板:Nginx 反向代理、PostgreSQL 持久化、Redis 缓存,以及把三者串起来的完整全栈示例。每段都说明为什么这么写、哪里容易配错。
order: 3
updated: "2026-07-10"
faqs:
  - q: Postgres 的数据为什么重启就没了?
    a: 说明没把 /var/lib/postgresql/data 挂出来。容器的可写层会随容器删除一起消失,docker compose down 就会清空数据。给它挂一个具名卷(pgdata:/var/lib/postgresql/data)并在顶层 volumes 声明,数据才会留在容器之外。
  - q: 改了 POSTGRES_PASSWORD 为什么还是旧密码?
    a: 因为 POSTGRES_PASSWORD 等初始化变量只在数据目录为空时生效。卷里已经有数据后,Postgres 直接使用现有数据,完全忽略这些变量。要么进容器用 ALTER USER 改密码,要么删掉卷(docker compose down -v)重新初始化,但那会丢失全部数据。
  - q: Redis 需要挂载卷吗?
    a: 看用途。纯缓存不需要,重启后重新预热即可。如果你用它存会话、队列或排行榜这类丢不起的数据,就要挂卷并开启持久化(--appendonly yes),否则容器一重启数据全没。
  - q: Nginx 容器里 proxy_pass 该写什么地址?
    a: 写 compose 里的服务名和容器内端口,比如 proxy_pass http://api:3000。同一个 compose 项目的服务默认在同一个网络里,可以用服务名互相解析。千万别写 127.0.0.1,那指的是 Nginx 容器自己。
---

## Nginx 反向代理

最常见的组合:Nginx 在前面收流量,把请求转给后面的应用容器。

```yaml
services:
  proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - api
    restart: unless-stopped

  api:
    image: myapi:latest
    expose:
      - "3000"          # 只对同网络的容器开放,不映射到宿主机
    restart: unless-stopped
```

对应的 `nginx.conf` 里,`proxy_pass` 要写**服务名**:

```nginx
location / {
    proxy_pass http://api:3000;     # 不是 127.0.0.1
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

同一个 compose 项目里的服务默认在同一个网络中,可以用服务名互相解析。容器里的 `127.0.0.1` 指的是容器**自己**,写了必然 502。

`api` 用的是 `expose` 而不是 `ports`:它只需要被 Nginx 访问,不需要暴露到宿主机。少开一个端口,少一个攻击面。

## PostgreSQL

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}     # 从 .env 读,别写死
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./initdb:/docker-entrypoint-initdb.d:ro   # 首次初始化时执行的 .sql/.sh
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
    restart: unless-stopped

volumes:
  pgdata:
```

三个必知的点:

**数据必须挂卷。** 不挂 `/var/lib/postgresql/data`,`docker compose down` 就会把数据库连同容器一起删掉。这里用具名卷而非绑定挂载,性能更好也更少权限问题。

**`POSTGRES_PASSWORD` 只在首次初始化时生效。** 卷里一旦有了数据,Postgres 直接用现有数据,这些环境变量会被完全忽略。改了密码不生效就是这个原因。

**`/docker-entrypoint-initdb.d` 里的脚本也只在数据目录为空时跑一次。** 想重新执行,得先 `docker compose down -v` 删掉卷——那会丢掉全部数据,生产环境慎用。

## Redis

```yaml
services:
  cache:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

volumes:
  redisdata:
```

官方镜像默认**不开密码、不开持久化**。

如果 Redis 只当缓存,不挂卷、不开 `appendonly` 完全可以,重启后重新预热就是了。但只要你用它存会话、任务队列或排行榜,就必须挂卷并开 `--appendonly yes`,否则容器一重启数据全没。

同样,**不要给它写 `ports`**。公网暴露的无密码 Redis 是最经典的入侵入口之一。

## 完整全栈示例

把上面三个串起来,加上应用本身:

```yaml
services:
  proxy:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api
    restart: unless-stopped

  api:
    build: .
    expose:
      - "3000"
    environment:
      DATABASE_URL: postgres://appuser:${DB_PASSWORD}@db:5432/appdb
      REDIS_URL: redis://:${REDIS_PASSWORD}@cache:6379
    depends_on:
      db:
        condition: service_healthy      # 真的等数据库能连了再启动
      cache:
        condition: service_started
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
    restart: unless-stopped

  cache:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
```

配套的 `.env`(记得加进 `.gitignore`):

```bash
DB_PASSWORD=换成一个长随机串
REDIS_PASSWORD=换成另一个长随机串
```

这份配置里值得注意的设计:

- **只有 `proxy` 有 `ports`。** 整个应用对外只开 80 一个端口,数据库和 Redis 在内网里,外面根本碰不到。
- **`api` 用 `condition: service_healthy` 等数据库。** 光写 `depends_on: [db]` 只等容器启动,不等数据库能接受连接,启动瞬间必然连接被拒。
- **密码全部走 `.env` 插值**,compose 文件本身可以安全地提交进仓库。

启动:

```bash
docker compose up -d --build
docker compose logs -f api
```

## 下一步

- 用 [Docker Compose 生成器](/docker-compose) 勾选服务,直接生成这类文件;
- 想搞懂 ports 方向、volume 选型、depends_on 与 healthcheck,见 [Docker Compose 教程](/docker-compose/guide);
- 起不来、连不上、数据没了,见 [Docker Compose 启动失败怎么排查](/docker-compose/troubleshooting);
- Nginx 那份配置怎么写,见 [Nginx 配置示例大全](/nginx/examples)。
