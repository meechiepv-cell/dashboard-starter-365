// Dashboard Starter 365 \u2014 Cyber Digits staged production build. Zero dependencies, Node 20.
// STAGED PRODUCTION BUILD \u2014 NOT DEPLOYED \u2014 SEED DATA ONLY.
// No real integrations, no network calls, no live systems touched.
const http = require('http');
const fs = require('fs');
const path = require('path');
const logger = require('./lib/logger');
const auth = require('./auth/middleware');
const { createStore } = require('./data/store');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
const NOTICE = 'STAGED PRODUCTION BUILD \u2014 NOT DEPLOYED \u2014 SEED DATA ONLY';
const APP = 'dashboard-starter-365';
const SEED = [
  {
    "id": "dashboard-seed-1",
    "name": "Team Activity (SEED DATA)",
    "template": "team-activity",
    "widgets": [
      {
        "label": "Active users",
        "value": 42
      },
      {
        "label": "Meetings this week",
        "value": 18
      },
      {
        "label": "Files shared",
        "value": 96
      }
    ],
    "createdAt": "2026-10-25T00:00:00Z",
    "seedData": true
  }
];
const store = createStore(path.join(__dirname, 'data'), 'dashboards', SEED);
const TEMPLATES = { 'team-activity': { title: 'Team Activity (SEED DATA)', widgets: [{ label: 'Active users', value: 42 }, { label: 'Meetings this week', value: 18 }, { label: 'Files shared', value: 96 }] }, 'adoption': { title: 'Adoption Snapshot (SEED DATA)', widgets: [{ label: 'Teams adoption', value: '78%' }, { label: 'OneDrive adoption', value: '64%' }, { label: 'SharePoint sites', value: 12 }] } };

function staged(extra) {
  return Object.assign({ staged: true, seedData: true, notice: NOTICE }, extra);
}
function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', (c) => { b += c; });
    req.on('end', () => {
      if (!b) { resolve({}); return; }
      try { resolve(JSON.parse(b)); } catch { reject(new Error('Request body must be valid JSON.')); }
    });
    req.on('error', reject);
  });
}
function badRequest(res, message) { send(res, 400, staged({ error: message })); }
function requireFields(body, fields) {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || (typeof body[f] === 'string' && body[f].trim() === '')) {
      return 'Missing required field: ' + f + '.';
    }
  }
  return null;
}
function nextId(prefix, items) { return prefix + '-' + (items.length + 1) + '-' + Date.now().toString(36); }

const server = http.createServer(async (req, res) => {
  const requestId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  let u;
  try { u = new URL(req.url, 'http://localhost'); } catch { send(res, 400, staged({ error: 'Malformed URL.' })); return; }
  logger.info({ route: u.pathname, method: req.method, requestId });
  try {
    auth.attach(req);
    if (u.pathname === '/api/health') { send(res, 200, staged({ status: 'ok', app: APP })); return; }
    if (u.pathname === '/api/templates') { send(res, 200, staged({ templates: Object.keys(TEMPLATES) })); return; }
    if (u.pathname === '/api/dashboards' && req.method === 'GET') { send(res, 200, staged({ dashboards: store.list() })); return; }
    if (u.pathname === '/api/dashboard') {
      const name = u.searchParams.get('template');
      if (name && !TEMPLATES[name]) { badRequest(res, 'Unknown template. Valid templates: team-activity, adoption.'); return; }
      send(res, 200, staged({ dashboard: TEMPLATES[name] || TEMPLATES['team-activity'] })); return;
    }
    if (u.pathname === '/api/dashboards' && req.method === 'POST') {
      let b;
      try { b = await readBody(req); } catch (e) { badRequest(res, e.message); return; }
      const missing = requireFields(b, ['name', 'template']);
      if (missing) { badRequest(res, missing); return; }
      if (!TEMPLATES[b.template]) { badRequest(res, 'Unknown template. Valid templates: team-activity, adoption.'); return; }
      const record = { id: nextId('dashboard', store.list()), name: b.name, template: b.template, widgets: TEMPLATES[b.template].widgets, createdAt: new Date().toISOString(), seedData: false };
      store.add(record);
      send(res, 201, staged({ dashboard: record })); return;
    }

    if (u.pathname.startsWith('/api/')) { send(res, 404, staged({ error: 'API route not found.' })); return; }
    const filePath = path.join(PUBLIC_DIR, u.pathname === '/' ? 'index.html' : u.pathname);
    if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end(); return; }
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/html' }); res.end('<h1>Not found</h1>'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  } catch (err) {
    logger.error({ route: u.pathname, method: req.method, requestId, message: err.message });
    send(res, 500, staged({ error: 'Internal error.' }));
  }
});

server.listen(PORT, () => logger.info({ route: 'startup', message: APP + ' listening on port ' + PORT }));
