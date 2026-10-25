// File-backed JSON persistence for the staged build.
// Data lives in <product>/data/<collection>.json and survives restarts.
// list() is READ-ONLY: if no file exists it returns a copy of the seed data
// without writing anything. add()/update() are the only writers.
// Swap this module for data/adapter.js when a real backend is chosen.
const fs = require('fs');
const path = require('path');

function createStore(dir, collection, seed) {
  const file = path.join(dir, collection + '.json');
  function list() {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* missing or corrupt file -> fall back to seed, never crash */ }
    return JSON.parse(JSON.stringify(seed));
  }
  function write(items) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(items, null, 2) + '\n', 'utf8');
  }
  return {
    file,
    list,
    add(record) {
      const items = list();
      items.push(record);
      write(items);
      return record;
    },
    update(predicate, mutate) {
      const items = list();
      const rec = items.find(predicate);
      if (!rec) return null;
      mutate(rec);
      write(items);
      return rec;
    },
  };
}
module.exports = { createStore };
