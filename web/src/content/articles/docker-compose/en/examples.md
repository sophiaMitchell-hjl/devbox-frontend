---
tool: docker-compose
type: examples
lang: en
title: 'Docker Compose Examples: Nginx, Postgres and Redis, Copy-Ready'
seoTitle: 'Docker Compose Examples: Nginx / Postgres / Redis Templates | DevBox'
description: 'Working docker-compose.yml templates for the services you actually run: an Nginx reverse proxy, a persistent PostgreSQL, a Redis cache, and a full stack wiring all three together — each with the reasoning and the usual mistakes.'
order: 3
updated: "2026-07-10"
faqs:
  - q: 'Why does my Postgres data disappear on restart?'
    a: 'Because /var/lib/postgresql/data was never mounted outside the container. A container writable layer is destroyed with the container, so docker compose down wipes it. Mount a named volume at that path and declare it under the top-level volumes key, and the data will outlive the container.'
  - q: 'I changed POSTGRES_PASSWORD but the old password still works.'
    a: 'Initialization variables like POSTGRES_PASSWORD only take effect when the data directory is empty. Once the volume holds a database, Postgres uses it as-is and ignores those variables entirely. Either change the password inside the container with ALTER USER, or destroy the volume with docker compose down -v to reinitialize, which erases all data.'
  - q: 'Does Redis need a volume?'
    a: 'It depends on the role. A pure cache does not — just let it warm up again after a restart. But if you store sessions, job queues or leaderboards in it, mount a volume and enable persistence with --appendonly yes, or a single restart loses everything.'
  - q: 'What address should proxy_pass use inside an Nginx container?'
    a: 'The compose service name and the container-internal port, for example proxy_pass http://api:3000. Services in the same compose project share a network and resolve each other by name. Never write 127.0.0.1, which refers to the Nginx container itself.'
---

## Nginx reverse proxy

The common shape: Nginx takes the traffic and forwards it to an application container.

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
      - "3000"          # visible to the compose network only, not the host
    restart: unless-stopped
```

In the matching `nginx.conf`, `proxy_pass` must use the **service name**:

```nginx
location / {
    proxy_pass http://api:3000;     # not 127.0.0.1
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

Services in one compose project share a network and resolve each other by name. Inside a container, `127.0.0.1` means **that container**, so writing it guarantees a 502.

Note that `api` uses `expose` rather than `ports`: it only needs to be reachable by Nginx, never from the host. One fewer open port is one fewer way in.

## PostgreSQL

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}     # from .env, never hard-coded
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./initdb:/docker-entrypoint-initdb.d:ro   # .sql/.sh run on first init
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

Three things worth knowing:

**The data must be on a volume.** Without a mount at `/var/lib/postgresql/data`, `docker compose down` destroys the database along with the container. A named volume is used here rather than a bind mount: better performance, fewer permission headaches.

**`POSTGRES_PASSWORD` only applies on first initialization.** Once the volume contains a database, Postgres uses it as-is and ignores these variables completely. That is why changing the password appears to do nothing.

**Scripts in `/docker-entrypoint-initdb.d` also run exactly once**, when the data directory is empty. Re-running them means `docker compose down -v`, which deletes the volume and all its data. Never do that in production.

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

The official image ships with **no password and no persistence**.

If Redis is only a cache, skipping the volume and `appendonly` is perfectly reasonable — it will warm up again. The moment you keep sessions, job queues or leaderboards in it, mount a volume and enable `--appendonly yes`, or one restart wipes it.

And again: **do not give it `ports`**. A publicly exposed, password-less Redis is one of the most reliable ways to get compromised.

## Full stack

The three services above, plus the application itself:

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
        condition: service_healthy      # actually wait until the DB accepts connections
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

The matching `.env` (add it to `.gitignore`):

```bash
DB_PASSWORD=a long random string
REDIS_PASSWORD=a different long random string
```

Design choices worth noticing:

- **Only `proxy` declares `ports`.** The whole stack exposes exactly one port to the world; the database and Redis sit on an internal network, untouchable from outside.
- **`api` waits with `condition: service_healthy`.** Plain `depends_on: [db]` waits only for the container to start, not for Postgres to accept connections, so startup would fail with connection refused.
- **Every password comes from `.env` interpolation**, which keeps the compose file itself safe to commit.

Bring it up:

```bash
docker compose up -d --build
docker compose logs -f api
```

## Next steps

- Generate files like these from checkboxes with the [Docker Compose Generator](/en/docker-compose);
- For the semantics of ports, volumes, depends_on and healthcheck, see the [Docker Compose Guide](/en/docker-compose/guide);
- When it will not start, cannot connect, or lost its data, see [Debugging Docker Compose Startup Failures](/en/docker-compose/troubleshooting);
- For the Nginx side of that config, see [Nginx Config Examples](/en/nginx/examples).
