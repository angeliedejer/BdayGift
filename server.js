const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const root = __dirname;
const port = process.env.PORT || 8000;

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  }[ext] || 'application/octet-stream';
}

function directoryIndex(absDir, reqPath) {
  // Create a simple HTML listing with anchor tags for files
  const items = fs.readdirSync(absDir, { withFileTypes: true });
  const links = items
    .filter((d) => d.isFile())
    .map((d) => `<li><a href="${d.name}">${d.name}</a></li>`) // relative links
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"></head>
    <body><h1>Index of ${reqPath}</h1><ul>${links}</ul></body></html>`;
  return html;
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname === '/') pathname = '/index.html';
  const absPath = path.join(root, pathname);

  try {
    const stat = fs.statSync(absPath);
    if (stat.isDirectory()) {
      // Directory index
      const html = directoryIndex(absPath, pathname);
      return send(res, 200, { 'Content-Type': 'text/html; charset=utf-8' }, html);
    }
    const data = fs.readFileSync(absPath);
    return send(res, 200, { 'Content-Type': mimeType(absPath) }, data);
  } catch (err) {
    return send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found');
  }
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}/`);
});