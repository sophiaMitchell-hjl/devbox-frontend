---
tool: docker-compose
type: troubleshooting
title: Docker Compose 启动失败怎么排查?八个常见问题一次解决
seoTitle: Docker Compose 启动失败排查:端口占用 / 连接被拒 / 数据丢失 | DevBox
description: 容器起不来、服务之间连不上、数据莫名消失、健康检查一直 unhealthy。本文给出三步定位法,并逐一讲清 Compose 最常见的八类故障与它们的真正成因。
order: 4
updated: "2026-07-10"
faqs:
  - q: '报错 bind: address already in use 怎么办?'
    a: 宿主机的那个端口已经被别的进程占用了。用 ss -lntp | grep 8080(Windows 用 netstat -ano | findstr 8080)找出占用者,要么停掉它,要么把 compose 里的宿主机端口改成别的。注意冒号前面才是宿主机端口,改后面的容器端口没有任何作用。
  - q: 容器退出码 137 是什么意思?
    a: 137 = 128 + 9,表示进程被 SIGKILL 杀死,绝大多数情况是内存超限被 OOM Killer 干掉了。用 docker inspect <容器> 看 State.OOMKilled 是否为 true。解法是减少内存占用,或给 Docker Desktop 分配更多内存,或用 deploy.resources.limits.memory 明确限额。
  - q: 为什么服务之间用 localhost 连不上?
    a: 每个容器有自己独立的网络命名空间,localhost 指的是容器自身。同一个 compose 项目的服务要用服务名互相访问,比如 postgres://db:5432 而不是 postgres://localhost:5432。端口也要用容器内端口,不是 ports 里映射到宿主机的那个。
  - q: 改了 compose 文件为什么没生效?
    a: docker compose up -d 只会重建配置有变化的服务。如果你改的是 Dockerfile 或源码,需要 docker compose up -d --build 强制重新构建镜像。如果改了环境变量却发现容器里还是旧值,试试 docker compose up -d --force-recreate。
---

## 先做这三步

```bash
docker compose ps          # 谁没起来?退出码是多少?
docker compose logs <服务名>   # 它死之前说了什么
docker compose config      # 变量插值后的最终配置长什么样
```

第三步经常被忽略,但它极其有用:`docker compose config` 会把 `${VAR}` 全部替换成实际值再打印出来。如果你发现某个变量变成了空字符串,那就是 `.env` 没被读到——问题在这里,不在容器里。

## 端口已被占用

```
Error: bind: address already in use
```

宿主机的端口被别人占了。找出是谁:

```bash
ss -lntp | grep 8080              # Linux
lsof -i :8080                     # macOS
netstat -ano | findstr 8080       # Windows
```

然后要么停掉占用者,要么改 compose 里**冒号前面**的那个端口:

```yaml
ports:
  - "8081:80"     # 改前面的宿主机端口,不是后面的容器端口
```

改后面那个数字是没用的——那是容器内部程序监听的端口,改了只会让转发指向一个没人监听的地方。

## 服务之间连接被拒

```
Connection refused / ECONNREFUSED 127.0.0.1:5432
```

看到 `127.0.0.1` 就基本确定了:**容器里的 `localhost` 指的是容器自己**,不是宿主机,也不是别的容器。

```yaml
# 错
DATABASE_URL: postgres://user:pass@localhost:5432/app

# 对:用服务名 + 容器内端口
DATABASE_URL: postgres://user:pass@db:5432/app
```

注意端口用的是**容器内端口**(5432),而不是你在 `ports` 里映射到宿主机的那个。容器之间通信根本不经过宿主机的端口映射。

## 启动瞬间连不上数据库,过几秒又好了

`depends_on` 只保证容器**被启动**,不保证里面的程序**能服务**。Postgres 容器起来后还要几秒才接受连接,而应用已经开始连了。

给数据库加 `healthcheck`,让应用用长语法等它:

```yaml
services:
  api:
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5
      start_period: 10s
```

详见 [Docker Compose 教程](/docker-compose/guide) 里 depends_on 那一节。

## 健康检查一直 unhealthy

先手动进容器里跑一遍那条命令,看它到底返回什么:

```bash
docker compose exec db pg_isready -U postgres
echo $?      # 必须返回 0 才算健康
```

常见原因:

- **命令在镜像里不存在。** alpine 镜像里通常没有 `curl`,`test: ["CMD", "curl", "-f", "http://localhost/"]` 会直接失败。改用 `wget --spider -q` 或镜像自带的工具。
- **`start_period` 太短。** 启动慢的服务(JVM、大型迁移)在宽限期结束前还没准备好,失败次数就开始累计了。
- **用了 `CMD` 而不是 `CMD-SHELL`。** `CMD` 不经过 shell,管道、`$?`、`&&` 这些都不会生效。需要 shell 语法时必须用 `CMD-SHELL`。

## 容器退出码 137

`137 = 128 + 9`,进程被 `SIGKILL` 杀了,几乎总是内存超限:

```bash
docker inspect <容器名> | grep -i oomkilled
```

返回 `true` 就确认了。解法按优先级:减少程序内存占用 → 给 Docker Desktop 分配更多内存(macOS/Windows 默认往往只有 2GB)→ 用 `deploy.resources.limits.memory` 给每个服务明确限额,避免一个服务拖垮全部。

顺带记一下另外两个:退出码 `1` 是程序自己报错退出(看日志),`0` 是正常结束(一次性任务跑完了,别配 `restart: always`)。

## 数据重启就没了

容器的可写层随容器一起销毁,`docker compose down` 会删掉容器。数据库数据必须挂到容器之外:

```yaml
services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**特别警告 `-v` 参数。** `docker compose down` 只删容器和网络,保留卷;而 `docker compose down -v` 会**连具名卷一起删掉**,数据库彻底清空。在生产服务器上,这一个字母的差别就是一次事故。

## 改了密码 / 初始化脚本却不生效

`POSTGRES_PASSWORD`、`MYSQL_ROOT_PASSWORD` 这类初始化变量,以及 `/docker-entrypoint-initdb.d/` 里的脚本,**只在数据目录为空时执行一次**。

卷里一旦有了数据,镜像会直接使用现有数据库,完全忽略这些设置。所以你改了 compose 文件里的密码,重启后发现还是旧密码。

两条路:

```bash
# 路 1:进容器改(保留数据,生产环境用这个)
docker compose exec db psql -U postgres -c "ALTER USER postgres PASSWORD 'newpass';"

# 路 2:删卷重来(会丢掉全部数据,只在本地开发用)
docker compose down -v && docker compose up -d
```

## 改了配置没生效

`docker compose up -d` 只重建**配置发生变化**的服务。三种情况要额外加参数:

```bash
docker compose up -d --build            # 改了 Dockerfile 或源码
docker compose up -d --force-recreate   # 改了环境变量但容器没重建
docker compose config                   # 先确认 .env 真的被读到了
```

`.env` 必须放在**执行命令的目录**下(或用 `--env-file` 指定)。在别的目录里跑 `docker compose -f path/to/compose.yml up`,它找的是当前目录的 `.env`,不是 compose 文件旁边那个。

## 下一步

- 与其手写再排错,不如用 [Docker Compose 生成器](/docker-compose) 生成一份正确的;
- 想彻底搞懂 ports、volumes、depends_on 的语义,见 [Docker Compose 教程](/docker-compose/guide);
- 要 Nginx + Postgres + Redis 的完整模板,见 [Docker Compose 配置示例大全](/docker-compose/examples)。
