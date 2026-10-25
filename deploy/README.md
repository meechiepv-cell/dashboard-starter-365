# Deploy — Dashboard Starter 365

**STAGED ONLY.** This folder holds deployment templates, not a live deployment.
Nothing here is connected to any repo, tenant, or hosting account.

## Target-agnostic steps (placeholders only)

1. Pick a deployment target (Azure Web App is the template provided; any
   Node 20 host works). The target is an open spec question — see README.md.
2. Set the app's environment variables from `deploy/.env.example` (placeholder keys
   only — never commit real secrets).
3. Deploy this folder's contents (`server.js`, `public/`, `lib/`, `data/`,
   `auth/`, `jobs/`, `package.json`) with `npm start`.
4. Verify `/api/health` returns `staged: true` and the UI banner still reads
   "STAGED PRODUCTION BUILD — NOT DEPLOYED — SEED DATA ONLY".
5. Before ANY real go-live: replace seed data, wire real Entra ID (see
   `auth/middleware.js`), and swap `data/store.js` for a real backend via
   `data/adapter.js`.

## Files

- `azure-webapp.yml` — GitHub Actions workflow TEMPLATE. Replace `<APP-NAME>`
  and `<SECRET>` placeholders; it is not connected to any repository.
