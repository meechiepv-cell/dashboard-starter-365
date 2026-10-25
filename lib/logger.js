// Structured logging: timestamp, level, route, request id. Stdout only, no PII.
// Never log request bodies, headers, or user identifiers beyond the demo label.
function log(level, fields) {
  const entry = Object.assign({ timestamp: new Date().toISOString(), level }, fields);
  process.stdout.write(JSON.stringify(entry) + '\n');
}
module.exports = {
  info: (fields) => log('info', fields),
  error: (fields) => log('error', fields),
};
