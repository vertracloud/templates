#!/usr/bin/env node
// Creates the Uptime Kuma admin account at deploy, before the public port opens. Kuma has no env var or CLI for the first user,
// so whoever opens the setup screen first would become admin. Flow:
//   1. start Kuma on 127.0.0.1 only;
//   2. when it answers, call its own `setup` event with the user `admin` and the generated KUMA_ADMIN_PASSWORD;
//   3. then open the public port (PORT) as a TCP forwarder to Kuma.
// If a user already exists nothing is touched. Any failure exits with an error and never opens the port with setup still open.
// The protocol is Socket.IO 4 over Engine.IO v4 long polling (no dependency).
// Probe modes, used by the Vertra Cloud test suite only:
//   node vertra-start.cjs probe needsetup <port>
//   node vertra-start.cjs probe setup <port> <user>        (password in PROBE_PASSWORD)
//   node vertra-start.cjs probe login <port> <user>        (password in PROBE_PASSWORD)
'use strict';
const http = require('http');
const net = require('net');
const { spawn } = require('child_process');

const SEP = '\x1e';
const log = (m) => console.log(`[vertra] ${m}`);

function request(port, method, path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port, method, path, timeout: 40000, headers: body ? { 'Content-Type': 'text/plain;charset=UTF-8', 'Content-Length': Buffer.byteLength(body) } : {} },
      (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (text += c));
        res.on('end', () => resolve({ status: res.statusCode, text }));
      },
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// One Socket.IO polling session: emit(event, ...args) resolves with the first ack argument.
async function connect(port) {
  const base = '/socket.io/?EIO=4&transport=polling';
  const hs = await request(port, 'GET', base);
  if (hs.status !== 200 || !hs.text.startsWith('0')) throw new Error(`handshake ${hs.status}`);
  const sid = JSON.parse(hs.text.slice(1)).sid;
  const url = `${base}&sid=${encodeURIComponent(sid)}`;
  const c = await request(port, 'POST', url, '40');
  if (c.status !== 200) throw new Error(`connect ${c.status}`);
  let ackId = 0;
  return {
    async emit(event, ...args) {
      const id = ++ackId;
      const sent = await request(port, 'POST', url, `42${id}${JSON.stringify([event, ...args])}`);
      if (sent.status !== 200) throw new Error(`emit ${sent.status}`);
      const deadline = Date.now() + 20000;
      while (Date.now() < deadline) {
        const poll = await request(port, 'GET', url);
        if (poll.status !== 200) throw new Error(`poll ${poll.status}`);
        for (const packet of poll.text.split(SEP)) {
          if (packet === '2') await request(port, 'POST', url, '3'); // answer the server ping
          if (packet.startsWith(`43${id}`)) return JSON.parse(packet.slice(2 + String(id).length))[0];
        }
      }
      throw new Error(`no ack for ${event}`);
    },
    async close() {
      try { await request(port, 'POST', url, '41'); } catch { /* the server drops idle sessions */ }
    },
  };
}

async function waitReady(port, seconds) {
  const end = Date.now() + seconds * 1000;
  while (Date.now() < end) {
    try {
      const r = await request(port, 'GET', '/api/entry-page');
      if (r.status === 200) return;
    } catch { /* still starting */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Kuma did not answer /api/entry-page within ${seconds}s`);
}

async function probe(mode, port, user) {
  const s = await connect(Number(port));
  try {
    if (mode === 'needsetup') console.log(`needSetup=${await s.emit('needSetup')}`);
    else if (mode === 'setup') { const r = await s.emit('setup', user, process.env.PROBE_PASSWORD); console.log(`setup ok=${r && r.ok === true}`); }
    else if (mode === 'login') { const r = await s.emit('login', { username: user, password: process.env.PROBE_PASSWORD, token: '' }); console.log(`login ok=${r && r.ok === true}`); }
    else throw new Error(`unknown probe ${mode}`);
  } finally {
    await s.close();
  }
}

async function main() {
  const publicPort = Number(process.env.PORT || 3001);
  const internalPort = Number(process.env.UPTIME_KUMA_PORT || 3002);
  if (internalPort === publicPort) throw new Error('UPTIME_KUMA_PORT must differ from PORT');
  const adminUser = process.env.KUMA_ADMIN_USER || 'admin';
  const adminPassword = process.env.KUMA_ADMIN_PASSWORD || '';

  // Kuma gets the environment without the admin password and listens on loopback only.
  const env = { ...process.env, UPTIME_KUMA_HOST: '127.0.0.1', UPTIME_KUMA_PORT: String(internalPort) };
  delete env.KUMA_ADMIN_PASSWORD;
  delete env.KUMA_ADMIN_USER;
  const kuma = spawn('node', ['server/server.js'], { cwd: '/opt/uptime-kuma', env, stdio: 'inherit' });
  let stopping = false;
  const stop = (code) => {
    if (stopping) return;
    stopping = true;
    try { kuma.kill('SIGTERM'); } catch { /* already gone */ }
    setTimeout(() => process.exit(code), 8000).unref();
  };
  kuma.on('exit', (code, signal) => {
    log(`Kuma saiu (código ${code ?? signal}); encerrando`);
    process.exit(code === null ? 143 : code);
  });
  process.on('SIGTERM', () => stop(143));
  process.on('SIGINT', () => stop(130));

  await waitReady(internalPort, 180);
  const s = await connect(internalPort);
  try {
    const needSetup = await s.emit('needSetup');
    if (needSetup === true) {
      if (!adminPassword) throw new Error('KUMA_ADMIN_PASSWORD is required for the first start (no administrator exists yet)');
      const r = await s.emit('setup', adminUser, adminPassword);
      if (!r || r.ok !== true) throw new Error(`setup of the administrator was refused${r && r.msg ? `: ${String(r.msg).slice(0, 120)}` : ''}`);
      log('administrador criado no deploy; abrindo a porta pública');
    } else if (needSetup === false) {
      log('o administrador já existe; abrindo a porta pública');
    } else {
      throw new Error('unexpected answer to needSetup');
    }
  } finally {
    await s.close();
  }

  // TCP forwarder: the public port exists only from here on.
  const server = net.createServer((client) => {
    const upstream = net.connect(internalPort, '127.0.0.1');
    const end = () => { client.destroy(); upstream.destroy(); };
    client.on('error', end);
    upstream.on('error', end);
    client.on('close', end);
    upstream.on('close', end);
    client.pipe(upstream);
    upstream.pipe(client);
  });
  server.on('error', (e) => { console.error(`[vertra] porta pública: ${e.message}`); stop(70); });
  server.listen(publicPort, '0.0.0.0', () => log(`porta pública ${publicPort} -> Kuma em 127.0.0.1:${internalPort}`));
}

if (process.argv[2] === 'probe') {
  probe(process.argv[3], process.argv[4], process.argv[5]).catch((e) => { console.error(`probe failed: ${e.message}`); process.exit(1); });
} else {
  main().catch((e) => {
    console.error(`[vertra] ${e.message}`);
    process.exit(e.message.includes('required') ? 64 : 70);
  });
}
