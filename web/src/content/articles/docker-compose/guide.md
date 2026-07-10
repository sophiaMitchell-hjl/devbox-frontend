---
tool: docker-compose
type: guide
title: Docker Compose 教程:端口、卷、环境变量与 depends_on 详解
seoTitle: Docker Compose 教程:端口映射 / volume / 环境变量 / healthcheck | DevBox
description: 一篇讲透 docker-compose.yml 的核心字段:ports 端口映射方向、volumes 具名卷与绑定挂载的区别、environment 与 env_file 的取值顺序、depends_on 为什么不等服务就绪,以及 restart 四种策略怎么选。
order: 2
updated: "2026-07-10"
faqs:
  - q: docker-compose.yml 开头还要写 version 吗?
    a: 不用了。Compose V2 会忽略顶层的 version 字段,官方文档已将其标记为过时,写了还可能在新版本里收到警告。直接从 services 字段开始写即可。命令也从 docker-compose(带连字符)变成了 docker compose(空格子命令)。
  - q: ports 里 8080:80 哪个是宿主机?
    a: 前面是宿主机,后面是容器,顺序是"宿主机:容器"。8080:80 表示访问宿主机的 8080 端口会被转发到容器的 80 端口。只写一个数字(如 "80")时,宿主机端口会被随机分配。记忆方法:从外到内,外面的写前面。
  - q: depends_on 为什么没等数据库准备好?
    a: 因为默认的 depends_on 只保证容器"被启动了",不保证里面的程序"能服务了"。Postgres 容器起来后还要几秒才能接受连接。要真正等待就绪,需要给依赖方加 healthcheck,再用 depends_on 的长语法把 condition 设为 service_healthy。
  - q: environment 和 env_file 冲突时谁生效?
    a: compose 文件里 environment 直接写的值优先级最高,会覆盖 env_file 里的同名变量。而 .env 文件是另一回事,它只负责给 compose 文件本身的 ${VAR} 占位符做插值,并不会自动注入到容器里。
---

## 一个最小可用的 compose 文件

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./site:/usr/share/nginx/html:ro
    restart: unless-stopped
```

保存为 `docker-compose.yml`,然后:

```bash
docker compose up -d      # 后台启动
docker compose ps         # 看状态
docker compose logs -f    # 跟踪日志
docker compose down       # 停止并删除容器
```

注意两个 2026 年的写法变化:**顶层不再需要 `version:` 字段**(Compose V2 会忽略它,官方已标记为过时),命令也从 `docker-compose` 变成了 `docker compose` 子命令。

## ports:方向别搞反

```yaml
ports:
  - "8080:80"     # 宿主机 8080 → 容器 80
  - "127.0.0.1:5432:5432"   # 只绑定到本机回环,外网访问不到
  - "80"          # 宿主机端口随机分配
```

顺序永远是 **`宿主机:容器`**,从外到内。

一个安全提醒:`- "5432:5432"` 会把数据库端口**暴露到服务器的所有网卡上**,配合一个弱密码就是公网可入侵的数据库。如果这个端口只给同一个 compose 网络里的其他服务用,**根本不要写 `ports`**——同网络内的容器可以直接用服务名互访:

```yaml
services:
  api:
    image: myapi
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app   # 直接用服务名 db
  db:
    image: postgres:16
    # 不写 ports,外部就访问不到
```

只有确实需要从宿主机连进去调试时,才写成 `"127.0.0.1:5432:5432"`,把它限制在回环地址上。

## volumes:具名卷还是绑定挂载

两种写法长得像,行为完全不同:

```yaml
volumes:
  - ./site:/usr/share/nginx/html    # 绑定挂载:宿主机的一个目录
  - pgdata:/var/lib/postgresql/data # 具名卷:Docker 管理的存储

volumes:
  pgdata:      # 具名卷必须在顶层声明
```

| | 绑定挂载 `./x:/y` | 具名卷 `name:/y` |
|---|---|---|
| 数据存在哪 | 你指定的宿主机目录 | Docker 管理的区域 |
| 你能直接编辑吗 | 能,改了容器里立刻可见 | 不方便 |
| 跨平台表现 | Windows/macOS 上 I/O 慢 | 一致且快 |
| 适合 | 源码、配置文件 | 数据库数据 |

经验法则:**代码和配置用绑定挂载,数据库数据用具名卷。** 数据库文件跑在 macOS 的绑定挂载上,性能会明显变差,还容易碰上文件权限问题。

只读挂载加 `:ro` 后缀,配置文件建议都加上,防止容器意外写坏:

```yaml
- ./nginx.conf:/etc/nginx/nginx.conf:ro
```

## 环境变量:三个东西别混淆

这是 Compose 里最容易绕晕的地方,涉及三个不同的概念:

**1. `environment` —— 直接注入容器**

```yaml
environment:
  NODE_ENV: production
  DATABASE_URL: postgres://user:pass@db:5432/app
  API_KEY:              # 不写值 = 从当前 shell 环境透传
```

**2. `env_file` —— 从文件批量注入容器**

```yaml
env_file:
  - .env.production
```

**3. `.env` 文件 —— 只给 compose 文件自己做插值**

放在 compose 文件同级目录的 `.env`,作用是替换 compose 文件里的 `${VAR}` 占位符,**它不会自动进到容器里**:

```yaml
# .env 内容:TAG=1.2.3
services:
  api:
    image: myapi:${TAG}     # 变成 myapi:1.2.3
```

优先级:`environment` 里写死的值 > `env_file` 里的值。而 `.env` 与前两者不在一个维度上,它管的是 compose 文件的渲染,不是容器的环境。

**别把密码提交进 git。** `.env` 应该进 `.gitignore`,仓库里放一份 `.env.example` 说明需要哪些变量。

## depends_on:它不等服务就绪

这是新手最常踩的坑:

```yaml
services:
  api:
    depends_on:
      - db        # 只保证 db 容器"启动了"
  db:
    image: postgres:16
```

`depends_on` 只控制**启动顺序**,不关心容器里的程序有没有准备好。Postgres 容器起来后还要几秒才能接受连接,而 `api` 已经开始连了,于是启动瞬间报 `Connection refused`。

正确做法是给被依赖方加 `healthcheck`,依赖方用长语法等它健康:

```yaml
services:
  api:
    image: myapi
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
```

`start_period` 是宽限期:这段时间内健康检查失败不计入 `retries`,专门留给启动较慢的服务。

即便如此,**应用侧仍然应该有连接重试**。容器编排能做的只是尽量按顺序启动,数据库在运行期间重启的情况它管不了。

## restart:四种策略

```yaml
restart: unless-stopped
```

| 取值 | 行为 |
|------|------|
| `no` | 默认值,退出后不重启 |
| `on-failure` | 只在非零退出码时重启 |
| `always` | 总是重启,包括你手动 stop 之后重启 Docker 守护进程 |
| `unless-stopped` | 总是重启,但你手动 stop 过的不再自动拉起 |

生产环境用 **`unless-stopped`**。它和 `always` 的唯一区别是:你手动 `docker compose stop` 停掉一个服务后,重启机器或 Docker 守护进程时,`always` 会把它重新拉起来,`unless-stopped` 会尊重你的决定。跑一次就结束的任务(数据迁移、备份脚本)用 `no` 或 `on-failure`。

## 下一步

- 不想手写 YAML?用 [Docker Compose 生成器](/docker-compose) 勾选服务直接出文件;
- 要 Nginx + Postgres + Redis 的完整可用示例,见 [Docker Compose 配置示例大全](/docker-compose/examples);
- 起不来、连不上、数据丢了,见 [Docker Compose 启动失败怎么排查](/docker-compose/troubleshooting)。
