// Data adapter interface — the seam where a real backend plugs in later.
// CURRENT implementation: the file-backed JSON store in data/store.js.
// TODO: replace the methods below with a Dataverse, SharePoint, or SQL
// implementation when the owner answers the "real data source" spec question.
// No real connection exists today, and no connection is faked here.
//
// Interface (all methods operate on plain record objects):
//   list(collection)              -> array of records (read-only)
//   add(collection, record)       -> the saved record
//   update(collection, predicate, mutate) -> the updated record or null
//   find(collection, predicate)   -> the first matching record or null
//
// TODO markers for the future implementer:
//   TODO(dataverse): map collections to Dataverse tables; use the owner's
//     tenant credentials via Entra ID app registration (never hardcode secrets).
//   TODO(sharepoint): map collections to SharePoint lists where list storage
//     fits better than Dataverse (e.g. document-linked records).
//   TODO(sql): map collections to SQL tables for reporting-heavy collections.
//   TODO(migration): one-time seed import from data/*.json into the real store,
//     then delete the JSON files so seed data cannot leak into production.
const { createStore } = require('./store');

// Placeholder factory: today this just wraps the JSON store per collection.
function createAdapter(dir, collections) {
  const stores = {};
  for (const [name, seed] of Object.entries(collections)) {
    stores[name] = createStore(dir, name, seed);
  }
  return {
    list: (collection) => stores[collection].list(),
    add: (collection, record) => stores[collection].add(record),
    update: (collection, predicate, mutate) => stores[collection].update(predicate, mutate),
    find: (collection, predicate) => stores[collection].list().find(predicate) || null,
  };
}
module.exports = { createAdapter };
