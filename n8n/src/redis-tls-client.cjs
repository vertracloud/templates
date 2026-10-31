// n8n can enable TLS for the queue Redis but has no CA or client certificate option. This preload (`node --require`,
// n8n process only) adds ca/cert/key to TLS connections to the Redis host and no other.
// Reads VERTRA_TLS_CLIENT_HOST, VERTRA_TLS_CLIENT_CA, VERTRA_TLS_CLIENT_CERT and VERTRA_TLS_CLIENT_KEY (file paths).
const tls = require("node:tls");
const fs = require("node:fs");
const { VERTRA_TLS_CLIENT_HOST: host, VERTRA_TLS_CLIENT_CA: caPath, VERTRA_TLS_CLIENT_CERT: certPath, VERTRA_TLS_CLIENT_KEY: keyPath } = process.env;
if (host && caPath && certPath && keyPath) {
  const ca = fs.readFileSync(caPath);
  const cert = fs.readFileSync(certPath);
  const key = fs.readFileSync(keyPath);
  const original = tls.connect;
  tls.connect = function patched(...args) {
    const o = typeof args[0] === "object" && args[0] !== null ? args[0] : null;
    if (o && (o.host === host || o.servername === host)) args[0] = { ...o, ca, cert, key };
    return original.apply(this, args);
  };
}
