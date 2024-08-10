const http = require('http');
const { parse } = require('url');
const next = require('next');

const https = require('https');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 4200;

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '..', '..', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '..', '..', 'cert.pem')),
};

app.prepare().then(() => {
  // https 서버 추가
  https
    .createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> HTTPS: Ready on https://localhost:${PORT}`);
    });

  http
    .createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(PORT + 1, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT + 1}`);
    });
});
