// Minimal server-side validation endpoint.
// Uses only Node's built-in http module — no dependencies, no npm install.
// Run with: node server.js
// Then open index.html in a browser; the form will call this for a second,
// server-side check in addition to the existing client-side validation.

const http = require('http');

function validate(email, password) {
  if (!email || !password) {
    return { valid: false, error: 'Email and password are required.' };
  }
  if (typeof email !== 'string' || !email.includes('@')) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  if (typeof password !== 'string' || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters.' };
  }
  return { valid: true };
}

const server = http.createServer((req, res) => {
  // CORS so the page (opened as a local file) can call this during testing.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/validate') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: false, error: 'Malformed request.' }));
        return;
      }

      // This is the real server-side check: it re-runs the same rules as
      // the client, but here the client has no ability to skip or tamper
      // with it, since it only runs on this machine, not in the browser.
      const result = validate(data.email, data.password);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server-side validation listening on http://localhost:${PORT}`);
});
