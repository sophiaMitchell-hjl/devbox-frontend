---
tool: nginx
type: troubleshooting
lang: en
title: 'How to Debug Nginx 502 Bad Gateway (and Other Common Errors)'
seoTitle: 'Nginx 502 Bad Gateway: Causes and Fixes, Plus 403, 413, 504 | DevBox'
description: 'A 502 means Nginx could not reach your upstream, or could not understand what it sent back. Here is a four-step diagnosis, the six real causes of 502, and fixes for 403, 413, 504 and the classic "my config change did nothing".'
order: 4
updated: "2026-07-10"
faqs:
  - q: 'What is the difference between 502 and 504?'
    a: '502 Bad Gateway means Nginx could not reach the upstream at all, or received something it could not parse — connection refused, process crashed, response headers too large for the buffer. 504 Gateway Timeout means the connection succeeded and the request was sent, but the upstream did not finish responding within proxy_read_timeout. In short: 502 is cannot reach, 504 is reached but too slow.'
  - q: 'Why does proxying to 127.0.0.1 return 502 inside Docker?'
    a: 'Because 127.0.0.1 inside a container refers to that container itself, not the host and not another container. Services in the same compose network should be addressed by service name, as in proxy_pass http://api:3000. To reach a service on the host, Docker Desktop offers host.docker.internal, while on Linux you need an explicit extra_hosts mapping.'
  - q: 'nginx -t passes but my change still has no effect.'
    a: 'nginx -t only validates syntax; it never applies the config. You still need nginx -s reload. If a reload changes nothing, check whether another server block marked default_server is capturing the request, or whether your browser cached an earlier 301 permanent redirect. Verify with curl -I rather than a browser.'
  - q: 'Where are the logs?'
    a: 'By default /var/log/nginx/error.log and access.log. Run tail -f /var/log/nginx/error.log while you reload the page — the real reason for a 502 is almost always written there. Containerized Nginx usually redirects logs to stdout, so use docker logs -f <container> instead.'
---

## Start with these four commands

Do not start editing config. Run these in order and the cause usually surfaces on its own:

```bash
# 1. What is Nginx actually complaining about?
tail -f /var/log/nginx/error.log

# 2. Is the upstream alive? On the port you think?
ss -lntp | grep 3000

# 3. Bypass Nginx entirely and hit the upstream directly
curl -i http://127.0.0.1:3000/

# 4. Is the config even valid?
nginx -t
```

Step 3 is the decisive one. **If `curl` against the upstream also fails, Nginx is not your problem** — your application is. That single check eliminates half the search space.

## The six causes of 502

**The upstream is not running.** `error.log` says `connect() failed (111: Connection refused)`. Errno 111 means nothing is listening on that port. Confirm the process is up and the port is right.

**The upstream binds only to 127.0.0.1 while Nginx lives elsewhere.** Many frameworks bind to loopback by default, so nothing outside the machine can reach them. Bind to `0.0.0.0` instead.

**Proxying to `127.0.0.1` from inside Docker.** In a container, `127.0.0.1` is that container. Within a compose network, use the service name:

```nginx
# Wrong: points at the Nginx container itself
proxy_pass http://127.0.0.1:3000;

# Right: points at the service named "api"
proxy_pass http://api:3000;
```

**Response headers too large.** Usually caused by fat cookies or JWTs. `error.log` says `upstream sent too big header`. Nginx's header buffer is small by default:

```nginx
proxy_buffer_size   16k;
proxy_buffers       4 16k;
proxy_busy_buffers_size 32k;
```

**The upstream crashed or was OOM-killed.** The process dies the moment the request arrives, so Nginx never gets a complete response. Check your application's own logs and `dmesg | grep -i oom`.

**SELinux is blocking it.** Only on CentOS, RHEL and Fedora. The symptom is maddening: the config is right, `curl` to the upstream works, but going through Nginx yields 502.

```bash
getenforce                                    # only suspect if this says Enforcing
setsebool -P httpd_can_network_connect 1      # let Nginx open network connections
```

## 403 Forbidden

Almost always one of three things when serving static files:

- **Directory permissions.** The Nginx worker (typically the `www-data` or `nginx` user) needs read access to the site directory and **execute permission on every directory along the path**. A site under `/root/` will always 403.
- **No index file, and no directory listing.** Requesting `/` finds no `index.html`, and Nginx refuses to list the directory. Either add an index file or set `autoindex on` in that location — noting that this publishes your file listing.
- **A wrong `root` path.** Check the concatenation: `root /var/www` with `location /static/` resolves to `/var/www/static/`, not `/var/www/`. [location matching rules](/en/nginx/guide) covers this in detail.

## 413 Request Entity Too Large

Uploads fail and never reach the backend, because `client_max_body_size` defaults to `1m`:

```nginx
client_max_body_size 50m;
```

Reload afterwards. If a CDN or cloud load balancer sits in front of Nginx, it has its own limit that must be raised too.

## 504 Gateway Timeout

The connection succeeded, but the upstream is too slow. Nginx gives up after `proxy_read_timeout` (60 seconds by default):

```nginx
proxy_connect_timeout 5s;    # keep short so failures surface fast
proxy_read_timeout    300s;  # how long to wait for upstream data
proxy_send_timeout    300s;
```

Raising the timeout **treats the symptom**. A 504 usually means some endpoint really is slow — a heavy query, a blocking third-party API — and converting it into an async job beats setting a five-minute timeout. WebSocket connections are the legitimate exception; see [Nginx Config Examples](/en/nginx/examples).

## The config change did nothing

Work through these in order:

1. **You forgot to reload.** `nginx -t` validates, it does not apply. Run `nginx -s reload`.
2. **The request went to a different server block.** When no `server_name` matches, Nginx hands the request to the block marked `default_server`, or to the first one in the file. Verify precisely with `curl -H "Host: example.com" -I http://127.0.0.1`.
3. **Your browser cached a 301.** Permanent redirects stick around for a long time, so you keep seeing old behavior on your own machine. Use a private window, or `curl -I`.
4. **You edited a file that is not loaded.** `nginx -T` (capital T) prints the **complete config currently in effect**, including everything pulled in by `include`. If your change is not in that output, that file is not being read.

## Next steps

- Rather than hand-writing a config and then debugging it, generate a correct one with the [Nginx Config Generator](/en/nginx);
- To really understand location priority and the proxy_pass slash, see [How to Write Nginx Config](/en/nginx/guide);
- For ready-made WebSocket, CORS and HTTPS snippets, see [Nginx Config Examples](/en/nginx/examples).
