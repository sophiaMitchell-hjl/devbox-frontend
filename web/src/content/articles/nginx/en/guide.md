---
tool: nginx
type: guide
lang: en
title: 'How to Write Nginx Config: location Matching and the proxy_pass Slash'
seoTitle: 'Nginx Config Guide: location Priority and proxy_pass Trailing Slash | DevBox'
description: 'Understand the three-level structure of an Nginx config, the real priority order of the five location match types, and exactly what the trailing slash on proxy_pass changes. Plus root vs alias and a directive cheat sheet.'
order: 2
updated: "2026-07-10"
faqs:
  - q: 'Do I need a trailing slash on proxy_pass?'
    a: 'It depends on whether you want the location prefix stripped. If the proxy_pass address contains any path component (even a bare /), Nginx replaces the matched location prefix with it; without a path, the full original URI is passed through unchanged. With location /api/ and proxy_pass http://127.0.0.1:3000/, a request for /api/users reaches the upstream as /users. Without the slash it arrives as /api/users.'
  - q: 'How does Nginx decide which location wins?'
    a: 'Nginx first finds the longest matching prefix location and remembers it. If that one is marked ^~, it is used immediately and no regex is tried. Otherwise Nginx tests the regex locations in the order they appear in the file, and the first one that matches wins. Only if no regex matches does it fall back to the remembered longest prefix. An = exact match short-circuits everything.'
  - q: 'What is the difference between root and alias?'
    a: 'root appends the matched location path to the value, while alias replaces the matched part entirely. With location /static/ and root /var/www, a request for /static/a.png looks for /var/www/static/a.png. With alias /var/www/, it looks for /var/www/a.png. When used in a prefix location, alias must end with a slash.'
  - q: 'I changed the config and nothing happened. Why?'
    a: 'Nginx does not reload automatically. Run nginx -t to check the syntax, then nginx -s reload to apply it. If it still has no effect, check whether another server block marked default_server is claiming the request, or whether your browser cached an earlier 301 permanent redirect.'
---

## The three levels of an Nginx config

An Nginx config nests three levels deep. Once this clicks, most "where does this line go" questions answer themselves:

```nginx
http {
    # Global: gzip, log formats, timeouts — applies to every site
    gzip on;

    server {
        # One site: a domain plus a port
        listen 80;
        server_name example.com;

        location /api/ {
            # Rules for one class of URL path
            proxy_pass http://127.0.0.1:3000;
        }
    }
}
```

- **http** holds global directives. Everything below inherits them.
- **server** is one site. `listen` (port) and `server_name` (domain) together decide which request lands in which server block.
- **location** handles one class of path, once a request is already inside a server block.

Inner levels override outer ones. Turn on `gzip on` in `http` and set `gzip off` in one `location`, and only that path skips compression.

## The five location match types

This is where most Nginx configs go wrong.

| Syntax | Name | Example | Meaning |
|--------|------|---------|---------|
| `= /path` | Exact | `location = /` | URI equals `/` exactly |
| `^~ /path` | Prefix, no regex | `location ^~ /static/` | Starts with `/static/`, and skips regex if it wins |
| `~ regex` | Regex, case-sensitive | `location ~ \.php$` | Ends in `.php` |
| `~* regex` | Regex, case-insensitive | `location ~* \.(jpg\|png)$` | Ends in `.jpg` or `.png` |
| `/path` | Plain prefix | `location /api/` | Starts with `/api/` |

## Priority: it is not top-to-bottom

Many people assume Nginx walks the file like an if-else chain. **It does not.** The real algorithm:

1. Check for an `=` exact match. If one hits, **stop immediately**.
2. Scan all plain prefix locations and **remember the longest one that matches**.
3. If that longest prefix is marked `^~`, use it and **skip all regexes**.
4. Otherwise test the regex locations **in the order written in the file**. The **first** match wins.
5. If no regex matches, fall back to the prefix remembered in step 2.

Two rules follow from this:

- **Prefix locations compete on length, not on order.** `location /a/` and `location /a/b/` behave identically no matter which you write first — `/a/b/c` always lands in the longer one.
- **Regex locations compete on order, not on length.** Order matters for regexes and is irrelevant for prefixes.

A classic trap:

```nginx
location /static/ {
    root /var/www;
}
location ~* \.(js|css|png)$ {
    expires 30d;
}
```

You expect `/static/app.js` to hit the first block. It hits the **second** — `/static/` is a plain prefix without `^~`, so Nginx goes on to test regexes, and `.js` matches. The fix is `location ^~ /static/`.

## The trailing slash on proxy_pass

Nginx's second-biggest trap. The rule is one sentence:

> **If the `proxy_pass` address contains a path component, Nginx replaces the matched location prefix with it. If it contains no path, the full original URI is passed through untouched.**

A lone `/` **counts as a path component**. So:

```nginx
# No path — upstream receives /api/users
location /api/ {
    proxy_pass http://127.0.0.1:3000;
}

# Has a path (just "/") — upstream receives /users
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
}

# Has a path — upstream receives /v1/users
location /api/ {
    proxy_pass http://127.0.0.1:3000/v1/;
}
```

How to choose? **Ask whether your backend knows about the `/api` prefix.**

- Backend routes are literally `/api/users` → **no slash**, pass the prefix through.
- Backend routes are `/users` and `/api` is just a gateway namespace → **add the slash** to strip it.

One constraint: inside a **regex** location, `proxy_pass` cannot contain a path component, because Nginx has no way to know which part to replace.

## root or alias

The other slash trap, this time for static files. The difference is **append** versus **replace**:

```nginx
# root: the location path is appended to the root value
location /static/ {
    root /var/www;          # /static/a.png → /var/www/static/a.png
}

# alias: the matched part is replaced by the alias value
location /static/ {
    alias /var/www/;        # /static/a.png → /var/www/a.png
}
```

Practical advice: **prefer `root`**, since its behavior is more predictable. Reach for `alias` only when the directory name on disk does not match the URL path, and remember that **`alias` in a prefix location must end with a slash**, or paths get mangled.

## Directive cheat sheet

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    # Upload limit — defaults to just 1m, always raise it for file uploads
    client_max_body_size 50m;

    # Static site / SPA: fall back to index.html when no file matches
    root /var/www/example;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy: these four headers are effectively mandatory
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Those four `proxy_set_header` lines deserve a note. Without them your upstream sees every visitor's IP as Nginx itself (`127.0.0.1`) and every request as plain `http`, even when the user arrived over HTTPS. Frameworks rely on these headers to build absolute URLs, rate-limit, and write useful logs.

Always validate before reloading, and reload rather than restart:

```bash
nginx -t          # check syntax; do not reload if this fails
nginx -s reload   # graceful reload, no dropped connections
```

## Next steps

- Skip the hand-writing: the [Nginx Config Generator](/en/nginx) builds a config from a form and can switch to the equivalent Caddy syntax;
- For ready-made WebSocket, CORS and HTTPS snippets, see [Nginx Config Examples](/en/nginx/examples);
- Getting a 502? See [How to Debug Nginx 502 Bad Gateway](/en/nginx/troubleshooting).
