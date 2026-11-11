#!/usr/bin/env node
// Local preview server that mirrors GitHub Pages (/Portfolio/ pathPrefix)
// and redirects / -> /Portfolio/ for convenience.
// Usage: node tools/preview.mjs [--port 8080] [--open]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';

const args = process.argv.slice(2);
const portIdx = args.indexOf('--port');
const port = portIdx !== -1 ? Number(args[portIdx + 1]) : 8080;
const shouldOpen = args.includes('--open');

const root = path.resolve('docs');
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  if (urlPath === '/' || urlPath === '/Portfolio') {
    res.writeHead(302, { Location: '/Portfolio/' });
    res.end();
    return;
  }

  if (!urlPath.startsWith('/Portfolio/')) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found (site is served under /Portfolio/)');
    return;
  }

  const relPath = urlPath.slice('/Portfolio/'.length);
  let filePath = path.join(root, relPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`404 Not Found: ${urlPath}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'content-type': mimeTypes[ext] || 'application/octet-stream',
    'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'pragma': 'no-cache',
    'expires': '0'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  const url = `http://localhost:${port}/Portfolio/`;
  console.log(`\n  Portfolio local preview running at:\n  -> ${url}\n  Press Ctrl+C to stop.\n`);
  if (shouldOpen) {
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd);
  }
});
