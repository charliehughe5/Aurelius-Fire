import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Security Headers Middleware (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data: blob:; font-src 'self' https: data:; connect-src 'self' https: wss:; frame-ancestors 'self' https://*.google.com https://*.aistudio.google.com https://*.run.app https://ai.studio https://*.ai.studio;"
    );
    next();
  });

  // 2. Sensitive File & Backup Path Blocker (Resolves exposed file scanner vulnerabilities)
  const SENSITIVE_FILE_PATTERNS = [
    /^\/backup(\.zip|\.tar|\.gz|\.bak|\.sql)?$/i,
    /\.(zip|tar|gz|tgz|rar|7z|bak|sql|db|sqlite|env|git|svn|log)$/i,
    /\/(backup|dump|secrets?|config|credentials|private)(\/|\.|$)/i,
    /^\/\.well-known\/.*\.env/i,
  ];

  app.use((req, res, next) => {
    const rawPath = (req.path || '').toLowerCase();
    if (SENSITIVE_FILE_PATTERNS.some((pattern) => pattern.test(rawPath))) {
      return res.status(404).type('text/plain').send('404 Not Found');
    }
    next();
  });

  // 3. OpenGraph / Social Share Card Endpoint
  app.get('/og-image.png', (req, res) => {
    const svg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#020617"/>
        <circle cx="1000" cy="100" r="300" fill="#f59e0b" opacity="0.08"/>
        <circle cx="200" cy="550" r="250" fill="#f59e0b" opacity="0.05"/>
        <g transform="translate(100, 140)">
          <rect width="80" height="80" rx="20" fill="#f59e0b"/>
          <path d="M40 20 L58 55 L22 55 Z" fill="#020617"/>
          <text x="110" y="55" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#ffffff" letter-spacing="-1">AURELIUS</text>
          <text x="390" y="55" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="28" fill="#f59e0b" letter-spacing="2">COMMERCIAL</text>
        </g>
        <g transform="translate(100, 270)">
          <text x="0" y="45" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="48" fill="#ffffff" letter-spacing="-0.5">Fire Risk Assessment Platform</text>
          <text x="0" y="105" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="26" fill="#94a3b8">Specialist non-sleeping commercial assessments • PAS 79-1:2020 • RRO 2005</text>
          <text x="0" y="150" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="24" fill="#cbd5e1">Principal Assessor: Charlie Hughes • NEBOSH Fire Safety Certified</text>
        </g>
        <g transform="translate(100, 480)">
          <rect width="260" height="60" rx="16" fill="#0f172a" stroke="#334155" stroke-width="2"/>
          <text x="130" y="38" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="20" fill="#fbbf24" text-anchor="middle">Fixed Fee Quotes</text>
          <rect x="280" y="0" width="280" height="60" rx="16" fill="#0f172a" stroke="#334155" stroke-width="2"/>
          <text x="420" y="38" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="20" fill="#34d399" text-anchor="middle">Zero VAT Applied</text>
        </g>
      </svg>
    `;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg.trim());
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', system: 'Apex Fire Risk Assessment Operations Engine' });
  });

  // Mount API router FIRST
  app.use('/api', apiRouter);

  // Guard against any unhandled /api requests falling through to HTML SPA fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
  });

  // Vite middleware for development vs Static SPA in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apex Fire Safety Operations Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
