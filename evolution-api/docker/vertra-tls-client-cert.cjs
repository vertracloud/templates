// Adds the client certificate to TLS connections to one host, for clients with no cert option (node-redis via URL).
// Reads VERTRA_TLS_CLIENT_HOST, VERTRA_TLS_CLIENT_CERT and VERTRA_TLS_CLIENT_KEY (paths); the CA comes from NODE_EXTRA_CA_CERTS.
const tls = require("node:tls"), fs = require("node:fs");
const { VERTRA_TLS_CLIENT_HOST: host, VERTRA_TLS_CLIENT_CERT: certPath, VERTRA_TLS_CLIENT_KEY: keyPath } = process.env;
if (host && certPath && keyPath) {
  const cert = fs.readFileSync(certPath), key = fs.readFileSync(keyPath), orig = tls.connect;
  tls.connect = function (...args) {
    const o = typeof args[0] === "object" && args[0] !== null ? args[0] : null;
    if (o && (o.host === host || o.servername === host)) args[0] = { ...o, cert, key };
    return orig.apply(this, args);
  };
}
