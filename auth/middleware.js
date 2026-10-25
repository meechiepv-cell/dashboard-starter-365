// Auth-ready middleware STUB — not real authentication.
// Reads a configurable dev header (x-demo-user) and annotates req.user with
// a demo role from auth/roles.js. Nothing is verified: any value is accepted.
// TODO(auth): WIRE REAL ENTRA ID HERE. Replace this stub with Entra ID token
// validation (e.g. passport-azure-ad / @azure/msal-node), map the token's
// roles claim to auth/roles.js, and enforce roles on write endpoints.
// To preview enforcement, set AUTH_ENFORCE=true: write endpoints then require
// a demo role of admin or editor and return 401 without a usable header.
const roles = require('./roles');

function attach(req) {
  const demoUser = req.headers['x-demo-user'];
  req.user = {
    name: demoUser || 'demo-user',
    role: roles.roleForDemoUser(demoUser),
    authenticated: false, // STUB: no real authentication has taken place.
    notice: 'Auth stub only — wire real Entra ID here before any real deployment.',
  };
}

function writeAllowed(req) {
  if (process.env.AUTH_ENFORCE !== 'true') return true;
  return req.user && (req.user.role === 'admin' || req.user.role === 'editor');
}

module.exports = { attach, writeAllowed };
