// Role placeholders for this product. These are NOT real permissions.
// TODO(auth): wire real Entra ID here — map Entra ID groups / app roles
// to these placeholders and enforce them on write endpoints.
module.exports = {
  roles: ["admin", "editor", "viewer"],
  // Demo mapping only: the x-demo-user header value decides the demo role.
  // 'admin' in the value -> admin; 'editor' in the value -> editor; otherwise viewer.
  roleForDemoUser(value) {
    const v = String(value || '').toLowerCase();
    if (v.includes('admin')) return 'admin';
    if (v.includes('editor')) return 'editor';
    return 'viewer';
  },
};
