// dashboard snapshot (dry run): reads the staged store READ-ONLY and prints what
// it *would* do. Sends no messages, touches no live system, writes nothing.
const path = require('path');
const { createStore } = require('../data/store');
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
const store = createStore(path.join(__dirname, '..', 'data'), 'dashboards', SEED);
const items = store.list();
console.log('[DRY RUN] Dashboard Starter 365 — dashboard snapshot');
console.log('Seed records in store: ' + items.length + '.');
for (const d of items) { console.log(' - ' + d.name + ' (' + d.template + '): ' + (d.widgets ? d.widgets.length : 0) + ' widgets'); }
console.log('Would do: list stored seed dashboards and their widget counts. No messages sent, no live systems touched.');
console.log('Done. (SEED DATA ONLY — staged build, not deployed.)');
