---
tool: docker-compose
type: troubleshooting
lang: en
title: 'Debugging Docker Compose Startup Failures: Eight Common Problems'
seoTitle: 'Docker Compose Troubleshooting: Port In Use, Connection Refused, Lost Data | DevBox'
description: 'Containers that will not start, services that cannot reach each other, data that vanishes, health checks stuck on unhealthy. A three-step diagnosis plus the eight failures you will actually hit, and what really causes them.'
order: 4
updated: "2026-07-10"
faqs:
  - q: 'What do I do about bind: address already in use?'
    a: 'Another process already holds that host port. Find it with ss -lntp | grep 8080 on Linux, lsof -i :8080 on macOS, or netstat -ano | findstr 8080 on Windows. Either stop that process or change the host port in your compose file. Remember that only the number before the colon is the host port; changing the one after it accomplishes nothing.'
  - q: 'What does exit code 137 mean?'
    a: '137 equals 128 plus 9, meaning the process was killed with SIGKILL. In practice that is nearly always the OOM killer reclaiming memory. Confirm it with docker inspect <container> and look for State.OOMKilled being true. Fix it by reducing memory use, giving Docker Desktop more memory, or setting an explicit deploy.resources.limits.memory.'
  - q: 'Why can my services not reach each other over localhost?'
    a: 'Each container has its own network namespace, so localhost means the container itself. Services in one compose project must address each other by service name, as in postgres://db:5432 rather than postgres://localhost:5432. Use the container-internal port, not whatever host port you mapped under ports.'
  - q: 'I edited the compose file and nothing changed.'
    a: 'docker compose up -d only recreates services whose configuration changed. If you edited a Dockerfile or source code, you need docker compose up -d --build to rebuild the image. If you changed environment variables but the container still shows the old values, try docker compose up -d --force-recreate.'
---

## Start with these three commands

```bash
docker compose ps               # who is down, and with what exit code?
docker compose logs <service>   # what did it say before dying?
docker compose config           # what does the config look like after interpolation?
```

That third one is routinely skipped and is enormously useful: `docker compose config` prints the file with every `${VAR}` already substituted. If a variable rendered as an empty string, your `.env` was never read — the problem is there, not inside the container.

## Port already in use

```
Error: bind: address already in use
```

Something else holds that host port. Find it:

```bash
ss -lntp | grep 8080              # Linux
lsof -i :8080                     # macOS
netstat -ano | findstr 8080       # Windows
```

Then either stop that process or change the number **before** the colon:

```yaml
ports:
  - "8081:80"     # change the host port, not the container port
```

Changing the second number does nothing useful — that is the port the program inside the container listens on, so editing it just points the forward at nobody.

## Services cannot reach each other

```
Connection refused / ECONNREFUSED 127.0.0.1:5432
```

Seeing `127.0.0.1` settles it: **inside a container, `localhost` is that container**, not the host and not a sibling.

```yaml
# Wrong
DATABASE_URL: postgres://user:pass@localhost:5432/app

# Right: service name plus container-internal port
DATABASE_URL: postgres://user:pass@db:5432/app
```

Note the port is the **container's** port (5432), not whatever you mapped to the host under `ports`. Container-to-container traffic never passes through host port mappings.

## Connection refused at startup, fine a few seconds later

`depends_on` guarantees the container **was started**, not that the program inside **can serve**. Postgres takes a few seconds to accept connections while your app is already dialing.

Add a `healthcheck` to the database and wait on it with the long form:

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

The depends_on section of the [Docker Compose Guide](/en/docker-compose/guide) covers this in full.

## Health check stuck on unhealthy

Run the command by hand inside the container and see what it actually returns:

```bash
docker compose exec db pg_isready -U postgres
echo $?      # must be 0 to count as healthy
```

Usual causes:

- **The command does not exist in the image.** Alpine images typically have no `curl`, so `test: ["CMD", "curl", "-f", "http://localhost/"]` fails outright. Use `wget --spider -q` or a tool the image actually ships.
- **`start_period` is too short.** Slow starters (a JVM, a large migration) are still warming up when the grace period ends, and failures start counting.
- **You used `CMD` where you needed `CMD-SHELL`.** `CMD` does not go through a shell, so pipes, `$?` and `&&` do not work. Shell syntax requires `CMD-SHELL`.

## Exit code 137

`137 = 128 + 9`: the process was `SIGKILL`ed, essentially always by the OOM killer.

```bash
docker inspect <container> | grep -i oomkilled
```

If that says `true`, you have your answer. In order of preference: reduce the program's memory use, give Docker Desktop more memory (the default on macOS and Windows is often only 2 GB), or set `deploy.resources.limits.memory` per service so one container cannot take down the rest.

Two neighbors worth remembering: exit code `1` means the program itself errored (read the logs), and `0` means it finished normally — a one-shot task that should not have `restart: always`.

## Data vanishes on restart

A container's writable layer is destroyed with the container, and `docker compose down` removes containers. Database data must live outside:

```yaml
services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**A specific warning about `-v`.** `docker compose down` removes containers and networks but keeps volumes. `docker compose down -v` **also deletes named volumes**, emptying the database completely. On a production server, that one letter is the difference between a restart and an incident.

## Password or init script changes have no effect

Initialization variables such as `POSTGRES_PASSWORD` and `MYSQL_ROOT_PASSWORD`, along with scripts in `/docker-entrypoint-initdb.d/`, **run exactly once, while the data directory is empty**.

Once the volume holds a database, the image uses it directly and ignores those settings. That is why the password you changed in the compose file never took.

Two ways out:

```bash
# Option 1: change it in place (keeps data — use this in production)
docker compose exec db psql -U postgres -c "ALTER USER postgres PASSWORD 'newpass';"

# Option 2: destroy the volume and reinitialize (erases everything — local dev only)
docker compose down -v && docker compose up -d
```

## Config edits not picked up

`docker compose up -d` only recreates services whose **configuration** changed. Three cases need more:

```bash
docker compose up -d --build            # you edited a Dockerfile or source
docker compose up -d --force-recreate   # env vars changed but the container did not
docker compose config                   # first confirm .env was actually read
```

`.env` must sit in the **directory you run the command from** (or be named with `--env-file`). Running `docker compose -f path/to/compose.yml up` from elsewhere looks for `.env` in your current directory, not next to the compose file.

## Next steps

- Rather than hand-writing and then debugging, generate a correct file with the [Docker Compose Generator](/en/docker-compose);
- For the semantics of ports, volumes and depends_on, see the [Docker Compose Guide](/en/docker-compose/guide);
- For full Nginx + Postgres + Redis templates, see [Docker Compose Examples](/en/docker-compose/examples).
