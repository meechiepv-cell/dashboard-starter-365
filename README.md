# Dashboard Starter 365

**STAGED PRODUCTION BUILD — NOT DEPLOYED — SEED DATA ONLY**

Start a team dashboard from a template — widgets included, data not yet live.

Staged templates only: widget values are SEED figures, not live tenant analytics. No connection to any reporting or telemetry source exists here.

All data in this build is SEED DATA. Nothing here connects to a live tenant, mailbox, billing system, or partner system. Nothing in this folder is deployed, sold, or live.

## Run locally

```bash
node server.js
```

Then open http://localhost:3000 (or set `PORT`, e.g. `PORT=8161 node server.js`). Health check: `/api/health`. Zero dependencies — no `npm install` needed. All API responses carry `staged: true`, `seedData: true`, and a staged notice.

## Endpoints

- `GET /api/health — status + staged flags`
- `GET /api/templates — dashboard templates`
- `GET /api/dashboard?template=… — template widgets (seed figures)`
- `POST /api/dashboards — {name, template} → save a dashboard (persisted)`
- `GET /api/dashboards — persisted dashboards`

## Data layer

- `data/store.js` — file-backed JSON persistence in `data/dashboards.json`; survives restarts. Seed data is labeled SEED DATA everywhere (UI, API, README).
- `data/adapter.js` — documented interface (methods + TODO markers) for swapping in Dataverse / SharePoint / SQL later. No real connection exists today, and none is faked.

## Auth (stub, not real authentication)

- `auth/middleware.js` reads a configurable dev header (`x-demo-user`) and annotates requests with a demo role from `auth/roles.js`. Nothing is verified.
- **Wire real Entra ID here** before any real deployment (see the TODO in `auth/middleware.js`). Set `AUTH_ENFORCE=true` to preview write-endpoint role checks with demo roles.

## Tests

```bash
npm test
```

Uses built-in `node:test` (zero new dependencies). Covers `/api/health`, each endpoint's happy path + validation-error path, job dry-run, UI banner, JSON 404, and POST-then-GET persistence.

## Autopilot

Job script: `jobs/dashboard-snapshot.js` — dry-run only. It reads `data/store.js` read-only, prints what it *would* do, and never sends real messages or touches any live system.

```bash
node jobs/dashboard-snapshot.js
```

Proposed schedule: daily at 07:00 — snapshot stored dashboards for review. No auto-send, ever, in this staged build.

## Production Readiness

### What is production-grade now

- Working core workflow endpoints + UI; zero dependencies; no network calls.
- File-backed JSON persistence surviving restarts, with a documented adapter seam for a real backend.
- Auth-ready structure (dev-header stub + role placeholders + a marked Entra ID integration point).
- Central error handling, input validation on all POST endpoints (400 + message), JSON 404s, no stack traces to clients.
- Structured logging (timestamp, level, route, request id) to stdout; no PII.
- Test suite (`npm test`) and target-agnostic deployment templates (`deploy/` including `deploy/.env.example` with placeholder keys only).
- Staged banners and flags on every surface: nothing reads as live, sold, or deployed.

### Still missing — exact spec questions for the owner

- Real data source — which Dataverse / SharePoint / SQL store should replace the seed JSON, and who owns the migration?
- User / role model — who are the real users and roles, and how does Entra ID map to them?
- Integrations — which live systems must this connect to, and with what permissions?
- Deployment target — which Azure Web App / environment should host this, and who approves go-live?
- Real metrics sources — which tenant analytics feed the widgets?
- Dashboard sharing — who can view / edit each dashboard?

Built from a one-line concept description. Anything not listed above (real permissions, real tenants, real billing, real AI) is intentionally absent. Do not describe this staged build as live, sold, or production-deployed.
