// mini-express.js
// A tiny, dependency-free web framework that mimics the parts of Express
// this project needs: app.get/post/put/delete, app.use (mount + middleware),
// route params (:id), JSON body parsing, req.cookies, res.json/res.status/res.cookie.
//
// WHY THIS EXISTS: the sandbox environment used to build this project could not
// reach the npm registry (network policy), so real Express could not be installed.
// This shim is written so the route code below reads almost identically to
// real Express. If you run `npm install express cookie-parser` on your own
// machine later, swapping back to real Express requires only trivial edits
// (see README "Switching to real Express").
import http from 'node:http';
import { URL } from 'node:url';

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function compilePath(routePath) {
  // turns "/api/orders/:id" into a regex + param names
  const paramNames = [];
  const pattern = routePath
    .replace(/\/+$/, '')
    .split('/')
    .map(seg => {
      if (seg.startsWith(':')) {
        paramNames.push(seg.slice(1));
        return '([^/]+)';
      }
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return { regex: new RegExp(`^${pattern || '/'}$`), paramNames };
}

class Router {
  constructor() {
    this.routes = []; // { method, regex, paramNames, handlers }
    this.middlewares = []; // global middlewares
  }

  use(fn) {
    this.middlewares.push(fn);
  }

  _add(method, routePath, handlers) {
    const { regex, paramNames } = compilePath(routePath);
    this.routes.push({ method, regex, paramNames, handlers });
  }

  get(p, ...h) { this._add('GET', p, h); }
  post(p, ...h) { this._add('POST', p, h); }
  put(p, ...h) { this._add('PUT', p, h); }
  patch(p, ...h) { this._add('PATCH', p, h); }
  delete(p, ...h) { this._add('DELETE', p, h); }

  match(method, pathname) {
    for (const r of this.routes) {
      if (r.method !== method) continue;
      const m = r.regex.exec(pathname);
      if (m) {
        const params = {};
        r.paramNames.forEach((name, i) => { params[name] = decodeURIComponent(m[i + 1]); });
        return { handlers: r.handlers, params };
      }
    }
    return null;
  }
}

export function createApp() {
  const router = new Router();
  const app = {
    get: router.get.bind(router),
    post: router.post.bind(router),
    put: router.put.bind(router),
    patch: router.patch.bind(router),
    delete: router.delete.bind(router),
    use: (fn) => router.use(fn),
  };

  const server = http.createServer(async (nodeReq, nodeRes) => {
    const url = new URL(nodeReq.url, `http://${nodeReq.headers.host}`);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    // CORS — supports a comma-separated list in CORS_ORIGIN (e.g.
    // "https://www.halfcon.site,https://halfcon.site"). We must reflect back
    // the SPECIFIC origin that matched (not '*') because '*' is rejected by
    // browsers whenever credentials/cookies are involved.
    const allowedOrigins = (process.env.CORS_ORIGIN || '*')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    const requestOrigin = nodeReq.headers.origin;
    let originToSend = '*';
    if (allowedOrigins.includes('*')) {
      originToSend = '*';
    } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      originToSend = requestOrigin;
    } else if (allowedOrigins.length > 0) {
      originToSend = allowedOrigins[0]; // fallback, e.g. for non-browser/no-Origin requests
    }
    nodeRes.setHeader('Access-Control-Allow-Origin', originToSend);
    nodeRes.setHeader('Vary', 'Origin');
    nodeRes.setHeader('Access-Control-Allow-Credentials', 'true');
    nodeRes.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    nodeRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (nodeReq.method === 'OPTIONS') {
      nodeRes.writeHead(204);
      nodeRes.end();
      return;
    }

    // Parse JSON body
    let body = {};
    let rawBody = '';
    if (['POST', 'PUT', 'PATCH'].includes(nodeReq.method)) {
      const chunks = [];
      for await (const chunk of nodeReq) chunks.push(chunk);
      rawBody = Buffer.concat(chunks).toString('utf8');
      if (rawBody) {
        try { body = JSON.parse(rawBody); } catch { body = {}; }
      }
    }

    const match = router.match(nodeReq.method, pathname);

    const req = {
      raw: nodeReq,
      method: nodeReq.method,
      url: nodeReq.url,
      path: pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      params: match ? match.params : {},
      body,
      rawBody, // needed for HMAC signature verification (e.g. Paystack/Stripe webhooks)
      headers: nodeReq.headers,
      cookies: parseCookies(nodeReq.headers.cookie),
    };

    let statusCode = 200;
    let sent = false;
    const res = {
      status(code) { statusCode = code; return this; },
      json(obj) {
        if (sent) return;
        sent = true;
        nodeRes.setHeader('Content-Type', 'application/json');
        nodeRes.writeHead(statusCode);
        nodeRes.end(JSON.stringify(obj));
      },
      send(text) {
        if (sent) return;
        sent = true;
        nodeRes.writeHead(statusCode);
        nodeRes.end(typeof text === 'string' ? text : JSON.stringify(text));
      },
      cookie(name, value, opts = {}) {
        const parts = [`${name}=${encodeURIComponent(value)}`];
        parts.push('Path=/');
        if (opts.httpOnly) parts.push('HttpOnly');
        if (opts.secure) parts.push('Secure');
        if (opts.maxAge) parts.push(`Max-Age=${Math.floor(opts.maxAge / 1000)}`);
        if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
        nodeRes.setHeader('Set-Cookie', parts.join('; '));
        return this;
      },
      clearCookie(name) {
        nodeRes.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0`);
        return this;
      },
    };

    try {
      // run global middlewares first
      for (const mw of router.middlewares) {
        let nextCalled = false;
        await new Promise((resolve) => {
          mw(req, res, () => { nextCalled = true; resolve(); });
          if (!nextCalled) resolve();
        });
        if (sent) return;
      }

      if (!match) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      for (const handler of match.handlers) {
        let nextCalled = false;
        await handler(req, res, () => { nextCalled = true; });
        if (sent) return;
        if (!nextCalled) break;
      }
      if (!sent) res.status(404).json({ error: 'No response sent' });
    } catch (err) {
      console.error('Request error:', err);
      if (!sent) res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
  });

  app.listen = (port, cb) => server.listen(port, '0.0.0.0', cb);
  return app;
}
