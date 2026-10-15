const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '..', 'index.html');
http.createServer((req, res) => {
  if (!['/', '/index.html'].includes(req.url.split('?')[0])) {
    res.writeHead(404); res.end('Not found'); return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(fs.readFileSync(file));
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
