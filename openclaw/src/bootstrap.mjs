// Writes /app/.openclaw/openclaw.json on the first start. After that the file belongs to the user and is not rewritten,
// except for gateway.trustedProxies, which `--refresh-proxies <file>` re-applies on every boot.
// Secrets are env SecretRefs and the origin/model are ${VAR} references, so no secret value is written to the file.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const env = process.env;
const refresh = process.argv[2] === "--refresh-proxies";
const file = refresh ? process.argv[3] : process.argv[2];
const csv = (v) => (v ?? "").split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);

// The only proxy in front of the app reaches it over the container's own network, so trust that IPv4 subnet and nothing else.
// An empty list fails closed: the gateway sees the proxy address, never a spoofed loopback.
const ipToInt = (a) => a.split(".").reduce((n, o) => (n * 256 + Number(o)) >>> 0, 0);
const intToIp = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
function trustedProxies() {
  const out = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.internal || (a.family !== "IPv4" && a.family !== 4) || !a.netmask) continue;
      const mask = ipToInt(a.netmask);
      const bits = mask.toString(2).replace(/0/g, "").length;
      const cidr = `${intToIp((ipToInt(a.address) & mask) >>> 0)}/${bits}`;
      if (!out.includes(cidr)) out.push(cidr);
    }
  }
  if (!out.length) console.warn("[vertra] no IPv4 interface found; trustedProxies left empty");
  return out;
}

if (refresh) {
  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    console.warn("[vertra] openclaw.json is not plain JSON; trustedProxies not refreshed");
    process.exit(0);
  }
  cfg.gateway = { ...(cfg.gateway ?? {}), trustedProxies: trustedProxies() };
  const tmp = `${file}.vertra-tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2) + "\n", { mode: 0o600 });
  fs.renameSync(tmp, file);
  process.exit(0);
}

const envRef = (id) => ({ source: "env", provider: "default", id });
const cfg = {
  gateway: {
    mode: "local",
    bind: "lan",
    auth: { mode: "token", token: envRef("OPENCLAW_GATEWAY_TOKEN") },
    trustedProxies: trustedProxies(),
  },
  // The agent's Docker sandbox mode is unavailable here; tools run in this container.
  agents: { defaults: { sandbox: { mode: "off" } } },
  // Chromium comes from the runtime; it runs without its own sandbox, the container is the isolation.
  browser: { enabled: env.OPENCLAW_BROWSER !== "off", headless: true, noSandbox: true, defaultProfile: "openclaw", executablePath: env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium" },
};

if (env.PUBLIC_ORIGIN) {
  cfg.gateway.publicOrigin = "${PUBLIC_ORIGIN}";
  cfg.gateway.controlUi = { allowedOrigins: ["${PUBLIC_ORIGIN}"] };
}
// start.sh recomputes OPENCLAW_MODEL_REF on every boot, so the model follows the variable.
if (env.OPENCLAW_MODEL_REF) cfg.agents.defaults.model = { primary: "${OPENCLAW_MODEL_REF}" };

// OpenAI-compatible endpoint.
const mid = (env.OPENCLAW_MODEL_ID || "default").replace(/^custom\//, "");
if (env.OPENCLAW_PROVIDER === "custom" && env.OPENAI_COMPAT_BASE_URL) {
  cfg.models = {
    mode: "merge",
    providers: {
      custom: {
        baseUrl: "${OPENAI_COMPAT_BASE_URL}",
        apiKey: envRef("OPENAI_COMPAT_API_KEY"),
        api: "openai-completions",
        models: [{ id: mid, name: mid, reasoning: false, input: ["text"], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 128000, maxTokens: 8192 }],
      },
    },
  };
}

// Channels with a token variable are enabled on first boot, for allowlisted users only.
const channels = {};
// Group policy is explicit: Discord and Slack stay closed until a guild or channel is allowlisted.
const allow = (ids) => ({ dmPolicy: "allowlist", allowFrom: ids, groupPolicy: "allowlist" });
const tg = csv(env.TELEGRAM_ALLOWED_USERS);
if (env.TELEGRAM_BOT_TOKEN && tg.length) channels.telegram = { enabled: true, botToken: envRef("TELEGRAM_BOT_TOKEN"), ...allow(tg), groupAllowFrom: tg, groups: { "*": { requireMention: true } } };
const dc = csv(env.DISCORD_ALLOWED_USERS);
if (env.DISCORD_BOT_TOKEN && dc.length) channels.discord = { enabled: true, token: envRef("DISCORD_BOT_TOKEN"), ...allow(dc) };
const sl = csv(env.SLACK_ALLOWED_USERS);
if (env.SLACK_BOT_TOKEN && env.SLACK_APP_TOKEN && sl.length) channels.slack = { enabled: true, mode: "socket", botToken: envRef("SLACK_BOT_TOKEN"), appToken: envRef("SLACK_APP_TOKEN"), ...allow(sl) };
if (Object.keys(channels).length) cfg.channels = channels;

fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n", { mode: 0o600 });
console.log("[vertra] openclaw.json created; channels:", Object.keys(channels).join(",") || "none");
