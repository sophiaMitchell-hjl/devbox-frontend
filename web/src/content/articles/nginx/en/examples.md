---
tool: nginx
type: examples
lang: en
title: 'Nginx Config Examples: WebSocket, CORS, HTTPS Redirect, gzip'
seoTitle: 'Nginx Examples: WebSocket / CORS / HTTPS / gzip, Copy-Ready | DevBox'
description: 'The Nginx snippets you actually need, on one page: WebSocket proxying, CORS headers, HTTP to HTTPS redirect, gzip, subdirectory deployment, static files and SPA fallback. Each one copy-ready, with the reasoning behind it.'
order: 3
updated: "2026-07-10"
faqs:
  - q: 'WebSocket will not connect, or drops after a minute. Why?'
    a: 'Failing to connect usually means the Upgrade and Connection headers are missing along with proxy_http_version 1.1 — Nginx talks HTTP/1.0 to upstreams by default and cannot complete the protocol upgrade. Connecting and then dropping is a timeout: proxy_read_timeout defaults to 60 seconds and cuts idle long-lived connections. Raise it (say 3600s) or have the app send heartbeats.'
  - q: 'I set CORS headers with add_header, but some responses lack them.'
    a: 'Two causes. First, add_header does not inherit downward: if any child location declares its own add_header, every add_header from the parent is discarded and must be repeated. Second, headers are only added to 2xx and 3xx responses by default, so a backend 500 arrives without CORS headers and the browser reports it as a CORS failure. Append the always flag to fix that.'
  - q: 'Should text/html be listed in gzip_types?'
    a: 'No. text/html is always compressed and cannot be removed from the list, so declaring it changes nothing. Also avoid compressing images and video: jpg, png and mp4 are already compressed formats, and running gzip over them just burns CPU.'
  - q: 'After deploying to a subdirectory, all my CSS and JS return 404.'
    a: 'Your app is emitting absolute paths like /assets/app.js rather than paths relative to /blog/. That is not something Nginx can fix, because the paths are already baked into the HTML. Configure a base path in the application instead: base in Astro and Vite, or basePath in Next.js.'
---

## WebSocket proxying

WebSocket needs an HTTP upgrade, and Nginx speaks HTTP/1.0 to upstreams by default, which cannot carry one. Turn it on explicitly:

```nginx
location /ws/ {
    proxy_pass http://127.0.0.1:3000;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;

    # Idle timeout while the connection carries no data. Default: 60s
    proxy_read_timeout 3600s;
}
```

Three things matter: `proxy_http_version 1.1` enables HTTP/1.1, the `Upgrade` and `Connection` headers forward the upgrade request to the upstream, and `proxy_read_timeout` stops Nginx from cutting an idle connection.

## CORS

```nginx
location /api/ {
    add_header Access-Control-Allow-Origin  "https://example.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Max-Age       86400 always;

    # Answer preflight here; no need to bother the upstream
    if ($request_method = OPTIONS) {
        return 204;
    }

    proxy_pass http://127.0.0.1:3000;
}
```

Do not drop `always`. Without it Nginx only attaches these headers to 2xx and 3xx responses. The moment your backend returns a 500, the browser receives a response with no CORS headers and reports a cross-origin error, sending you down entirely the wrong debugging path.

Also note that **`add_header` does not inherit downward**. If a child location declares any `add_header` of its own, every one from the parent is dropped and must be repeated.

To allow cookies, `Allow-Origin` cannot be `*` — echo the specific origin back and add `add_header Access-Control-Allow-Credentials true always;`.

## HTTP to HTTPS redirect

Use a dedicated port-80 server block. Do not put an `if` inside the 443 block:

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

    # ...
}
```

`$host` preserves whichever domain the visitor typed rather than hard-coding one, and `$request_uri` preserves the full path and query string, so `http://example.com/a?b=1` lands on `https://example.com/a?b=1`.

One warning: 301 is a permanent redirect and browsers **cache it aggressively**. Test with a 302 first, switch to 301 once you are sure. Otherwise a mistake becomes very hard to verify from your own browser.

## gzip

```nginx
# Put this in the http block for site-wide effect
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

Why these values:

- `gzip_comp_level 5` — the scale runs 1 to 9, but past 5 the compression gain is marginal while CPU cost climbs noticeably.
- `gzip_min_length 256` — tiny responses can come out larger than the original, since gzip adds a fixed header.
- `gzip_vary on` — emits `Vary: Accept-Encoding` so a CDN never serves compressed bytes to a client that cannot decode them.
- `gzip_types` should **not** list `text/html` (always compressed anyway) and should **not** list images or video (already compressed).

## Subdirectory deployment

Mount an app running on port 4321 under `example.com/blog/`:

```nginx
location /blog/ {
    proxy_pass http://127.0.0.1:4321/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

That trailing slash is the whole trick: it turns `/blog/posts/hello` into `/posts/hello` before the upstream sees it, which is the path the app actually knows. Drop the slash and the upstream receives `/blog/posts/hello` and returns 404, unless it was configured with a `/blog` prefix to begin with.

**Nginx alone is usually not enough.** If the app emits absolute asset paths like `/assets/app.js`, the browser requests `example.com/assets/app.js`, not `/blog/assets/app.js`. Fix that in the application: `base` in Astro and Vite, `basePath` in Next.js.

## Static files and SPA fallback

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/example;
    index index.html;

    # No file? Hand it to index.html and let the frontend router decide
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Hashed assets can be cached hard
    location ~* \.(js|css|woff2|png|jpg|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

`try_files $uri $uri/ /index.html` is the standard single-page-app incantation: try it as a file, then as a directory, then serve `index.html` so React Router or Vue Router can handle the path in the browser. Without that line, a user who reloads `/about` gets Nginx's 404.

Note that the `location ~*` regex block deliberately **beats** `location /` for `.js` files. If you also have a `location /static/` that must win, give it `^~` — see [location matching rules](/en/nginx/guide).

## 413 on upload

```nginx
client_max_body_size 50m;
```

The default is only `1m`, so any moderately sized upload is rejected by Nginx with **413 Request Entity Too Large** before it ever reaches your backend. Place this in `http`, `server` or `location` depending on the granularity you want.

## Next steps

- Every option above is a checkbox in the [Nginx Config Generator](/en/nginx), which also shows the equivalent Caddy config;
- For the rules behind location priority and the proxy_pass slash, see [How to Write Nginx Config](/en/nginx/guide);
- Hitting 502 or 403? See [How to Debug Nginx 502 Bad Gateway](/en/nginx/troubleshooting).
