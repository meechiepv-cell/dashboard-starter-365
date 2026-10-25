// Tests for Dashboard Starter 365 — node:test, zero new dependencies.
// Spawns server.js on a test port, exercises endpoints, then kills it and
// removes any data file the run created (restoring seed state).
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn, execFileSync } = require('node:child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.TEST_PORT || 8391;
const BASE = 'http://127.0.0.1:' + PORT;
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'dashboards.json');
let proc;

async function waitForHealth() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(BASE + '/api/health');
      if (r.ok) return;
    } catch { /* not up yet */ }
    await new Promise((x) => setTimeout(x, 100));
  }
  throw new Error('server did not become healthy');
}

before(async () => {
  proc = spawn('node', ['server.js'], {
    cwd: ROOT, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'pipe',
  });
  await waitForHealth();
});

after(async () => {
  try { proc.kill(); } catch { /* already stopped */ }
  try { fs.unlinkSync(DATA_FILE); } catch { /* no data file to clean */ }
});

test('health reports staged + seed data', async () => {
  const r = await fetch(BASE + '/api/health');
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.status, 'ok');
  assert.equal(j.app, 'dashboard-starter-365');
  assert.equal(j.staged, true);
  assert.equal(j.seedData, true);
});

test('list endpoint returns staged seed data', async () => {
  const r = await fetch(BASE + '/api/dashboards');
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.staged, true);
  assert.ok(Array.isArray(j.dashboards), 'expected array at ' + 'dashboards');
});

test('POST happy path', async () => {
  const r = await fetch(BASE + '/api/dashboards', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({"name": "Test dashboard", "template": "adoption"}),
  });
  assert.equal(r.status, 201);
  const j = await r.json();
  assert.equal(j.staged, true);
  assert.ok(j.dashboard !== undefined, 'expected field ' + 'dashboard');
});

test('POST validation error returns 400', async () => {
  const r = await fetch(BASE + '/api/dashboards', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({"name": "Bad dashboard", "template": "nope"}),
  });
  assert.equal(r.status, 400);
  const j = await r.json();
  assert.ok(typeof j.error === 'string' && j.error.length > 0);
});

test('persistence: POST then GET shows the record', async () => {
  const r = await fetch(BASE + '/api/dashboards', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({"name": "persist-check-dashboard-12345", "template": "team-activity"}),
  });
  assert.ok(r.status === 200 || r.status === 201);
  const g = await fetch(BASE + '/api/dashboards');
  assert.equal(g.status, 200);
  const text = JSON.stringify(await g.json());
  assert.ok(text.includes('persist-check-dashboard-12345'), 'persisted record not found in GET response');
});

test('job dry-run prints DRY RUN and sends nothing', () => {
  const out = execFileSync('node', [path.join(ROOT, 'jobs', 'dashboard-snapshot.js')], { encoding: 'utf8' });
  assert.ok(out.includes('DRY RUN'), 'job output missing DRY RUN marker');
});

test('UI carries the staged banner', async () => {
  const r = await fetch(BASE + '/');
  assert.equal(r.status, 200);
  const text = await r.text();
  assert.ok(text.includes('STAGED PRODUCTION BUILD'));
  assert.ok(text.includes('NOT DEPLOYED'));
});

test('unknown API route returns JSON 404', async () => {
  const r = await fetch(BASE + '/api/does-not-exist');
  assert.equal(r.status, 404);
  const j = await r.json();
  assert.equal(j.staged, true);
  assert.ok(typeof j.error === 'string');
});
