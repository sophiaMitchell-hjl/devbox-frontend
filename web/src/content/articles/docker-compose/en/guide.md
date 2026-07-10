---
tool: docker-compose
type: guide
lang: en
title: 'Docker Compose Guide: Ports, Volumes, Env Vars and depends_on'
seoTitle: 'Docker Compose Guide: Port Mapping, Volumes, Env Vars, healthcheck | DevBox'
description: 'The core fields of docker-compose.yml, explained properly: which side of ports is the host, named volumes versus bind mounts, how environment, env_file and .env differ, why depends_on does not wait for readiness, and which restart policy to pick.'
order: 2
updated: "2026-07-10"
faqs:
  - q: 'Do I still need the version field at the top of docker-compose.yml?'
    a: 'No. Compose V2 ignores the top-level version field and the official docs mark it obsolete; recent versions may even warn about it. Start straight from services. The command changed too, from docker-compose with a hyphen to docker compose as a subcommand.'
  - q: 'In ports, which side is the host?'
    a: 'The first number is the host and the second is the container, always in host:container order. So 8080:80 forwards host port 8080 to container port 80. Giving a single number instead assigns a random host port. Mnemonic: outside to inside, outside goes first.'
  - q: 'Why did depends_on not wait for my database?'
    a: 'Because plain depends_on only guarantees the container was started, never that the program inside is ready to serve. A Postgres container takes a few more seconds before it accepts connections. To wait for real readiness, add a healthcheck to the dependency and use the long form of depends_on with condition set to service_healthy.'
  - q: 'If environment and env_file both set a variable, which wins?'
    a: 'Values written directly under environment take precedence and override the same key from env_file. The .env file is a separate mechanism entirely: it only interpolates ${VAR} placeholders inside the compose file itself and is not automatically injected into containers.'
---

## A minimal compose file

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

Save it as `docker-compose.yml`, then:

```bash
docker compose up -d      # start in the background
docker compose ps         # check status
docker compose logs -f    # follow logs
docker compose down       # stop and remove containers
```

Two things changed in recent years: **the top-level `version:` field is gone** (Compose V2 ignores it and the docs mark it obsolete), and `docker-compose` became the `docker compose` subcommand.

## ports: do not reverse the direction

```yaml
ports:
  - "8080:80"               # host 8080 → container 80
  - "127.0.0.1:5432:5432"   # bound to loopback only, unreachable from outside
  - "80"                    # random host port
```

The order is always **`host:container`**, outside to inside.

A security note: `- "5432:5432"` exposes your database **on every network interface of the server**. Combined with a weak password, that is an internet-reachable database. If the port is only used by other services in the same compose network, **do not declare `ports` at all** — containers on one network reach each other by service name:

```yaml
services:
  api:
    image: myapi
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app   # service name "db"
  db:
    image: postgres:16
    # no ports, so nothing outside can reach it
```

Only when you genuinely need to connect from the host for debugging should you write `"127.0.0.1:5432:5432"`, pinning it to loopback.

## volumes: named volume or bind mount

The two forms look alike and behave completely differently:

```yaml
volumes:
  - ./site:/usr/share/nginx/html    # bind mount: a directory on your host
  - pgdata:/var/lib/postgresql/data # named volume: storage Docker manages

volumes:
  pgdata:      # named volumes must be declared at the top level
```

| | Bind mount `./x:/y` | Named volume `name:/y` |
|---|---|---|
| Where data lives | A host directory you choose | An area Docker manages |
| Can you edit it directly | Yes, changes appear instantly | Not conveniently |
| Cross-platform behavior | Slow I/O on Windows and macOS | Consistent and fast |
| Good for | Source code, config files | Database data |

Rule of thumb: **bind-mount code and config, use named volumes for database data.** Database files on a macOS bind mount are noticeably slower and invite file-permission trouble.

Append `:ro` for read-only. Config files should almost always have it, so a container cannot corrupt them:

```yaml
- ./nginx.conf:/etc/nginx/nginx.conf:ro
```

## Environment variables: three distinct things

This is where Compose confuses people most, because three separate mechanisms share a name.

**1. `environment` — injected straight into the container**

```yaml
environment:
  NODE_ENV: production
  DATABASE_URL: postgres://user:pass@db:5432/app
  API_KEY:              # no value = pass through from the current shell
```

**2. `env_file` — a file of variables injected into the container**

```yaml
env_file:
  - .env.production
```

**3. `.env` — interpolation for the compose file itself**

A `.env` next to your compose file substitutes `${VAR}` placeholders **inside the compose file**. It does **not** end up inside containers:

```yaml
# .env contains: TAG=1.2.3
services:
  api:
    image: myapi:${TAG}     # becomes myapi:1.2.3
```

Precedence: values under `environment` beat values from `env_file`. `.env` is on a different axis altogether — it governs how the compose file is rendered, not what the container sees.

**Keep secrets out of git.** Put `.env` in `.gitignore` and commit a `.env.example` documenting which variables are needed.

## depends_on does not wait for readiness

The single most common beginner trap:

```yaml
services:
  api:
    depends_on:
      - db        # only guarantees the db container was started
  db:
    image: postgres:16
```

`depends_on` controls **start order** and nothing else. It does not care whether the program inside is ready. Postgres needs a few more seconds before it accepts connections, by which time `api` has already tried and failed with `Connection refused`.

Give the dependency a `healthcheck` and use the long form to wait for it:

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

`start_period` is a grace window: failures during it do not count toward `retries`, which is exactly what slow-starting services need.

Even so, **your application should still retry its connections**. Orchestration can order startup; it cannot stop a database from restarting later while everything is running.

## restart: four policies

```yaml
restart: unless-stopped
```

| Value | Behavior |
|-------|----------|
| `no` | Default. Never restarted. |
| `on-failure` | Restarted only on a non-zero exit code. |
| `always` | Always restarted, even after you stopped it manually and the daemon restarts. |
| `unless-stopped` | Always restarted, except containers you stopped manually. |

Use **`unless-stopped`** in production. Its only difference from `always` shows up after you run `docker compose stop` on a service: when the machine or Docker daemon restarts, `always` brings it back anyway while `unless-stopped` respects your decision. For run-once tasks like migrations or backups, use `no` or `on-failure`.

## Next steps

- Skip the YAML: the [Docker Compose Generator](/en/docker-compose) builds the file from checkboxes;
- For complete Nginx + Postgres + Redis templates, see [Docker Compose Examples](/en/docker-compose/examples);
- When it will not start, cannot connect, or lost its data, see [Debugging Docker Compose Startup Failures](/en/docker-compose/troubleshooting).
