// Checks of one template folder. Used by `scripts/validate.mjs` (CI and local) and by `scripts/pack.mjs`.
//
// What runs here: the JSON Schema (`schema/v1.json`), the semantic rules the schema cannot express (placeholders, `when`, plan slugs,
// permissions, sources) and the folder rules (README, icon, docs, Dockerfile, secrets). The platform validates again on import.
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { UserPlanName } from "@vertracloud/api-types/v1";
import Ajv from "ajv";
import yaml from "js-yaml";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const MANIFEST_FILE = "vertracloud.template.yaml";

const MAX_FILES = 5000;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_TOTAL_BYTES = 100 * 1024 * 1024;
const MAX_YAML_BYTES = 256 * 1024;
const MAX_README_BYTES = 100 * 1024;
const ICON_MAX = { svg: 64 * 1024, png: 256 * 1024 };
const DOCS_EXT = new Set([".md", ".json", ".txt", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const IGNORED = new Set([".git", ".DS_Store"]);

/** Variables the platform controls (api `FORBIDDEN_ENVS` plus the template-only ones). */
const FORBIDDEN_ENVS = new Set(["PORT", "HOST", "NODE_ENV", "RACK_ENV", "RAILS_ENV", "APP_ID", "PATH", "HOME", "USER", "SHELL", "LD_PRELOAD", "LD_LIBRARY_PATH", "LD_AUDIT", "NODE_OPTIONS"]);
const isForbiddenEnv = (key) => FORBIDDEN_ENVS.has(key.toUpperCase()) || key.toUpperCase().startsWith("DYLD_");

const SECRET_KEY_NAME = /(?:^|_)(?:PASSWORD|PASSWD|SECRET|TOKEN|API_?KEY|PRIVATE_?KEY|ACCESS_?KEY|AUTH_?KEY|ENCRYPTION_?KEY|CREDENTIALS?)$/i;
const SECRET_SHAPES = [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\bgh[pousr]_[A-Za-z0-9]{30,}/, /\bsk-[A-Za-z0-9_-]{20,}/, /\bAKIA[0-9A-Z]{16}\b/, /\bxox[baprs]-[A-Za-z0-9-]{10,}/];

const IDENTIFIER = /^[a-z0-9][a-z0-9_-]{0,39}$/;
const SERVICE_FIELDS = {
  app: ["url", "domain"],
  database: ["url", "host", "port", "user", "password", "database", "ssl.ca_path", "ssl.cert_path", "ssl.key_path", "ssl.pem_path", "ssl.p12_path", "ssl.p12_password", "prisma_url"],
  blob: ["endpoint", "bucket", "region", "prefix", "access_key_id", "secret_access_key", "public_base_url"],
};

let schemaValidator;
function validator() {
  if (!schemaValidator) {
    const schema = JSON.parse(readFileSync(join(ROOT, "schema/v1.json"), "utf8"));
    schemaValidator = new Ajv({ allErrors: true, strict: false }).compile(schema);
  }
  return schemaValidator;
}

/** Plan slugs of the catalog (`UserPlanName` of the api-types package). */
export const PLAN_SLUGS = Object.values(UserPlanName);

/** Parses `{{ ... }}`; `null` = malformed or unknown. */
export function parsePlaceholder(expression) {
  const expr = expression.trim();
  const secret = /^secret:(\d{1,3})$/.exec(expr);
  if (secret) return Number(secret[1]) >= 8 && Number(secret[1]) <= 128 ? { kind: "secret" } : null;
  if (expr === "app.url" || expr === "app.domain") return { kind: "app" };
  if (expr === "stack.name" || expr === "stack.id") return { kind: "stack" };
  const dot = expr.indexOf(".");
  if (dot < 1) return null;
  const head = expr.slice(0, dot);
  const rest = expr.slice(dot + 1);
  if (head === "inputs") return IDENTIFIER.test(rest) ? { kind: "input", id: rest } : null;
  if (head === "secrets") return IDENTIFIER.test(rest) ? { kind: "secrets", name: rest } : null;
  if (head === "services") {
    const second = rest.indexOf(".");
    if (second < 1) return null;
    const id = rest.slice(0, second);
    const field = rest.slice(second + 1);
    return IDENTIFIER.test(id) && field ? { kind: "service", id, field } : null;
  }
  return null;
}

function* placeholders(text) {
  let rest = text;
  for (;;) {
    const open = rest.indexOf("{{");
    if (open === -1) return;
    const close = rest.indexOf("}}", open);
    if (close === -1) {
      yield { raw: rest.slice(open), ref: null };
      return;
    }
    const inner = rest.slice(open + 2, close);
    yield { raw: rest.slice(open, close + 2), ref: inner.includes("{{") ? null : parsePlaceholder(inner) };
    rest = rest.slice(close + 2);
  }
}

/** Allowed by local name, so `<x:script>` does not slip through. */
const SVG_ELEMENTS = new Set([
  "svg", "g", "defs", "symbol", "title", "desc", "metadata", "style", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
  "text", "tspan", "textPath", "linearGradient", "radialGradient", "stop", "clipPath", "mask", "pattern", "marker", "filter",
  "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR",
  "feGaussianBlur", "feMerge", "feMergeNode", "feMorphology", "feOffset", "animate", "animateTransform",
]);

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&colon;/gi, ":")
    .replace(/&(?:tab|newline);/gi, "");
}

function svgProblem(text) {
  if (!/<svg[\s>]/i.test(text)) return "is not an SVG";
  if (/<!(?:DOCTYPE|ENTITY)/i.test(text) || /<\?xml-stylesheet/i.test(text)) return "has a DOCTYPE, entities or a stylesheet reference";
  // Comments are stripped before the element check, so every form an XML or HTML parser reads differently is refused:
  // CDATA, the HTML-only `--!>`, `<!-->` and `<!--->` endings, and `<` inside an attribute value (invalid XML anyway).
  if (/<!\[CDATA\[/i.test(text) || /--!>|<!---?>/.test(text) || /=\s*(?:"[^"]*<|'[^']*<)/.test(text)) return "has a CDATA section, a malformed comment or `<` in an attribute";
  const markup = text.replace(/<!--[\s\S]*?-->/g, "");
  for (const [, prefix = "", name] of markup.matchAll(/<\s*([A-Za-z_][\w.-]*:)?([A-Za-z_][\w.-]*)/g)) {
    if (!SVG_ELEMENTS.has(name)) return `has the element <${prefix}${name}>, which is not allowed`;
  }
  if (/\s(?:[\w.-]+:)?on[a-z]+\s*=/i.test(markup)) return "has event handler attributes";
  if (/attributeName\s*=\s*["']?\s*(?:[\w.-]+:)?(?:href|on)/i.test(markup)) return "animates a link or an event handler";
  const decoded = decodeEntities(markup);
  if (/(?:java|vb)script:/i.test(decoded.replace(/[\s\u0000-\u001f]+/g, ""))) return "has scripts";
  if (/(?:^|[\s"'])(?:[\w.-]+:)?href\s*=\s*["']?\s*[^"'#\s]/i.test(decoded)) return "has a link that is not a fragment (#id)";
  if (/@import/i.test(decoded) || /url\(\s*["']?\s*(?!#)[^)\s]/i.test(decoded)) return "references external resources";
  return null;
}

/** All regular files under `dir` as relative posix paths; symlinks and special files are errors (same as the platform). */
export function listFiles(dir, errors) {
  const out = [];
  const walk = (rel) => {
    for (const entry of readdirSync(join(dir, rel), { withFileTypes: true })) {
      if (IGNORED.has(entry.name)) continue;
      const path = rel ? `${rel}/${entry.name}` : entry.name;
      const stat = lstatSync(join(dir, path));
      if (stat.isSymbolicLink()) errors.push(`${path}: symbolic links are not allowed`);
      else if (stat.isDirectory()) walk(path);
      else if (stat.isFile()) out.push({ path, size: stat.size });
      else errors.push(`${path}: not a regular file`);
    }
  };
  walk("");
  return out.sort((a, b) => (a.path < b.path ? -1 : 1));
}

function whenProblem(target, equals) {
  if (target.type === "boolean") return typeof equals === "boolean" ? null : "must be true or false";
  if (target.type === "number") return typeof equals === "number" ? null : "must be a number";
  if (target.type === "select") {
    if (typeof equals !== "string") return "must be text";
    return (target.options ?? []).some((o) => o.value === equals) ? null : "is not one of the options of the question";
  }
  return typeof equals === "string" ? null : "must be text";
}

/**
 * @param {string} dir template folder
 * @returns {{ id: string, manifest: object | null, errors: string[], warnings: string[], files: {path: string, size: number}[] }}
 */
export function checkTemplate(dir) {
  const errors = [];
  const warnings = [];
  const folder = dir.split("/").filter(Boolean).pop();
  const err = (where, message) => errors.push(`${where}: ${message}`);
  const warn = (where, message) => warnings.push(`${where}: ${message}`);

  const manifestPath = join(dir, MANIFEST_FILE);
  if (!existsSync(manifestPath)) return { id: folder, manifest: null, errors: [`${MANIFEST_FILE}: missing`], warnings, files: [] };

  const files = listFiles(dir, errors);
  const names = new Set(files.map((f) => f.path));
  if (files.length > MAX_FILES) err("package", `more than ${MAX_FILES} files`);
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_BYTES) err("package", "larger than 100 MB");
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) err(f.path, "larger than 20 MB");
    if (/(^|\/)\.env(\.|$)/i.test(f.path)) err(f.path, "env files never go in a template");
    if (f.path.startsWith(".vertra/") || f.path.includes("/.vertra/")) err(f.path, "`.vertra/` is reserved by the platform");
  }

  // --- manifest: YAML (JSON schema of js-yaml, like the platform) + JSON Schema
  const rawText = readFileSync(manifestPath, "utf8");
  if (Buffer.byteLength(rawText) > MAX_YAML_BYTES) err(MANIFEST_FILE, "larger than 256 KB");
  let m;
  try {
    m = yaml.load(rawText, { schema: yaml.JSON_SCHEMA });
  } catch (e) {
    return { id: folder, manifest: null, errors: [...errors, `${MANIFEST_FILE}: not valid YAML (${String(e.message).split("\n")[0]})`], warnings, files };
  }
  const validate = validator();
  if (!validate(m)) {
    for (const e of validate.errors.slice(0, 30)) err(MANIFEST_FILE, `${e.instancePath || "/"} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ""}`);
    return { id: folder, manifest: null, errors, warnings, files };
  }

  const id = m.id;
  if (id !== folder) err("id", `"${id}" must match the folder name "${folder}"`);

  // --- semantic rules
  const inputs = m.inputs ?? [];
  const inputIndex = new Map();
  inputs.forEach((input, i) => {
    if (inputIndex.has(input.id)) err(`inputs[${i}].id`, `duplicate question id "${input.id}"`);
    else inputIndex.set(input.id, i);
  });
  const secrets = new Set(m.secrets ?? []);
  if (secrets.size !== (m.secrets ?? []).length) err("secrets", "duplicate secret name");
  if (new Set(m.tags ?? []).size !== (m.tags ?? []).length) err("tags", "duplicate tag");
  const kindOf = (s) => (s.source ? "app" : s.database ? "database" : "blob");
  const services = new Map(Object.entries(m.services).map(([sid, s]) => [sid, kindOf(s)]));
  if (![...services.values()].includes("app")) err("services", "a template needs at least one app service");
  if (m.min_plan && !PLAN_SLUGS.includes(m.min_plan)) err("min_plan", `"${m.min_plan}" is not a plan slug of the catalog (${PLAN_SLUGS.join(", ")})`);
  if (m.landing && m.landing !== id) warn("landing", "the landing slug usually equals the template id");

  const checkText = (where, text, area) => {
    for (const { raw, ref } of placeholders(text)) {
      if (!ref) err(where, `unknown or malformed placeholder ${raw.slice(0, 40)}`);
      else if (ref.kind === "input" && !inputIndex.has(ref.id)) err(where, `placeholder refers to the unknown question "${ref.id}"`);
      else if (ref.kind === "secrets" && !secrets.has(ref.name)) err(where, `secret "${ref.name}" is not declared in \`secrets\``);
      else if (ref.kind === "secret" && area === "output") err(where, "`{{secret:<n>}}` is not available in outputs; declare it in `secrets`");
      else if (ref.kind === "service") {
        const kind = services.get(ref.id);
        if (!kind) err(where, `placeholder refers to the unknown service "${ref.id}"`);
        else if (!SERVICE_FIELDS[kind].includes(ref.field)) err(where, `"${ref.field}" does not exist on the ${kind} service "${ref.id}"`);
      }
    }
  };
  const checkEnvKey = (where, key) => {
    if (isForbiddenEnv(key)) err(where, `"${key}" is controlled by the platform (put it in the Dockerfile \`ENV\` if the image needs it)`);
  };
  const checkLiteral = (where, key, value, hidden = false) => {
    if (hidden || value === "" || value.includes("{{")) return;
    if ((SECRET_KEY_NAME.test(key) && value.length >= 6) || SECRET_SHAPES.some((re) => re.test(value))) err(where, `"${key}" looks like a secret with a literal value; use \`{{secret:<n>}}\`, \`secrets\` or a \`secret\` question`);
  };
  const checkWhen = (where, when, ownerIndex) => {
    const at = inputIndex.get(when.input);
    if (at === undefined) return err(`${where}.input`, `condition refers to the unknown question "${when.input}"`);
    if (ownerIndex !== undefined && at >= ownerIndex) err(`${where}.input`, "a condition can only refer to a question that comes before it");
    const problem = whenProblem(inputs[at], when.equals);
    if (problem) err(`${where}.equals`, `\`equals\` ${problem}`);
  };

  const ramOk = (where, ram) => {
    if (ram.min > ram.recommended) err(`${where}.recommended`, "`recommended` is below `min`");
    if (ram.max !== undefined && ram.max < ram.recommended) err(`${where}.max`, "`max` is below `recommended`");
  };

  let hasOpenLicense = Boolean(m.links?.license);
  for (const [sid, s] of Object.entries(m.services)) {
    const base = `services.${sid}`;
    const kind = kindOf(s);
    if (kind === "database") {
      if (s.when) checkWhen(`${base}.when`, s.when, undefined);
      ramOk(`${base}.ram`, s.ram);
      continue;
    }
    if (kind === "blob") {
      if (s.when) checkWhen(`${base}.when`, s.when, undefined);
      continue;
    }
    ramOk(`${base}.ram`, s.ram);
    const src = s.source;
    if (src.type === "image") {
      if (!src.image) err(`${base}.source.image`, "an image service needs `source.image` (the origin, even with `context`)");
      else if (!/@sha256:[0-9a-f]{64}$/.test(src.image)) err(`${base}.source.image`, "a public image must be pinned by digest (`@sha256:...`)");
      else if (/[\s\\]/.test(src.image)) err(`${base}.source.image`, "not a valid image reference");
      if (src.path) err(`${base}.source.path`, "`source.path` is only for code services");
      for (const field of ["language", "runtime_version", "main", "build", "start"]) if (s[field] !== undefined) err(`${base}.${field}`, `\`${field}\` is only for code services`);
      if (src.context !== undefined) {
        const c = src.context;
        if (c.startsWith("/") || c.includes("\\") || c.split("/").some((seg) => seg === ".." || seg === "" || seg === ".")) err(`${base}.source.context`, "must be a relative sub-folder inside the template (not `.`)");
        else if (!names.has(`${c}/Dockerfile`)) err(`${base}.source.context`, `the folder "${c}" has no Dockerfile at its root`);
        else checkDockerfile(`${c}/Dockerfile`, join(dir, c, "Dockerfile"), err, warn);
      }
    } else {
      if (src.image) err(`${base}.source.image`, "`source.image` is only for image services");
      if (s.port !== undefined) err(`${base}.port`, "`port` is only for image services");
      if (!s.language) err(`${base}.language`, "a code service needs `language`");
      if (!src.path) err(`${base}.source.path`, "a public code service needs `source.path`");
      else if (src.path.startsWith("/") || src.path.split("/").includes("..")) err(`${base}.source.path`, "must be a relative path inside the template");
      else if (![...names].some((n) => n.startsWith(`${src.path}/`))) err(`${base}.source.path`, `the code folder "${src.path}" is not in the template`);
    }
    if (s.env_hidden?.length) err(`${base}.env_hidden`, "`env_hidden` is only for private templates");
    for (const [key, value] of Object.entries(s.env ?? {})) {
      checkEnvKey(`${base}.env.${key}`, key);
      checkText(`${base}.env.${key}`, value, "env");
      checkLiteral(`${base}.env.${key}`, key, value);
    }
    for (const field of ["main", "build", "start"]) if (s[field]?.includes("{{")) err(`${base}.${field}`, "placeholders are only available in `env` and `outputs`");
    if (s.healthcheck?.path?.includes("{{")) err(`${base}.healthcheck.path`, "placeholders are only available in `env` and `outputs`");
    for (const target of Object.keys(s.connections ?? {})) {
      if (target === sid) err(`${base}.connections.${target}`, "a service cannot connect to itself");
      else if (!services.has(target)) err(`${base}.connections.${target}`, `unknown service "${target}"`);
    }
    const zd = s.deploy?.zero_downtime;
    if (zd?.locked && zd.default === "auto") err(`${base}.deploy.zero_downtime`, "a locked setting needs `default: on` or `default: off`");
  }

  inputs.forEach((input, i) => {
    const base = `inputs[${i}]`;
    if (input.when) {
      if (input.when.input === input.id) err(`${base}.when.input`, "a question cannot depend on itself");
      else checkWhen(`${base}.when`, input.when, i);
    }
    if (input.type === "select") {
      const options = input.options ?? [];
      if (options.length === 0) err(`${base}.options`, "a `select` question needs at least one option");
      if (new Set(options.map((o) => o.value)).size !== options.length) err(`${base}.options`, "duplicate option value");
      if (typeof input.default === "string" && options.length && !options.some((o) => o.value === input.default)) err(`${base}.default`, "`default` is not one of the options");
    } else if (input.options?.length) err(`${base}.options`, "`options` is only for `select` questions");
    if (input.default !== undefined && input.type !== "select") {
      const expected = input.type === "boolean" ? "boolean" : input.type === "number" ? "number" : "string";
      if (typeof input.default !== expected) err(`${base}.default`, `\`default\` must be of type ${expected}`);
    }
    if (input.generate && input.type !== "secret") err(`${base}.generate`, "`generate` is only for `secret` questions");
    if (input.editable === false && !input.generate) err(`${base}.editable`, "`editable: false` needs `generate`");
    const regex = input.validation?.regex;
    if (regex !== undefined) {
      let problem = null;
      try {
        new RegExp(regex);
      } catch {
        problem = "the regex does not compile";
      }
      if (/\\[1-9]/.test(regex)) problem = "back-references are not allowed";
      else if (/\((?:[^()\\]|\\.)*[+*](?:[^()\\]|\\.)*\)\s*(?:[+*]|\{\d+,\d*\})/.test(regex)) problem = "nested quantifiers are not allowed";
      else if (/\((?:[^()\\]|\\.)*\|(?:[^()\\]|\\.)*\)\s*(?:[+*]|\{\d+,\d*\})/.test(regex)) problem = "repeated alternation is not allowed";
      if (problem) err(`${base}.validation.regex`, problem);
      if (["boolean", "number", "select"].includes(input.type)) err(`${base}.validation.regex`, "`regex` is only for text questions");
    }
    (input.options ?? []).forEach((option, k) => {
      const sets = option.sets;
      if (!sets) return;
      const at = `${base}.options[${k}].sets`;
      for (const sid of Object.keys(sets.services ?? {})) if (!services.has(sid)) err(`${at}.services.${sid}`, `unknown service "${sid}"`);
      for (const [sid, vars] of Object.entries(sets.env ?? {})) {
        if (!services.has(sid)) err(`${at}.env.${sid}`, `unknown service "${sid}"`);
        else if (services.get(sid) !== "app") err(`${at}.env.${sid}`, `"${sid}" is not an app service`);
        for (const [key, value] of Object.entries(vars)) {
          checkEnvKey(`${at}.env.${sid}.${key}`, key);
          checkText(`${at}.env.${sid}.${key}`, value, "env");
          checkLiteral(`${at}.env.${sid}.${key}`, key, value);
        }
      }
      for (const sid of Object.keys(sets.ram_extra ?? {})) {
        if (!services.has(sid)) err(`${at}.ram_extra.${sid}`, `unknown service "${sid}"`);
        else if (services.get(sid) === "blob") err(`${at}.ram_extra.${sid}`, "a Blob service has no memory");
      }
    });
  });

  (m.outputs ?? []).forEach((output, i) => {
    if (typeof output.value === "string") checkText(`outputs[${i}].value`, output.value, "output");
    else for (const [lang, text] of Object.entries(output.value)) checkText(`outputs[${i}].value.${lang}`, text, "output");
  });

  const p = m.permissions ?? {};
  if (p.code?.view === false) err("permissions.code.view", "a public template always shows its code");
  if (p.share?.full_copy) err("permissions.share.full_copy", "share links are only for private templates");
  if (p.ram?.change === false) {
    if (p.ram.below_min === true) err("permissions.ram.below_min", "`below_min` needs `ram.change` to be true");
    if (p.ram.above_max === true) err("permissions.ram.above_max", "`above_max` needs `ram.change` to be true");
  }

  // --- folder rules (what the CI and the review ask of every template)
  if (!hasOpenLicense) err("links.license", "declare the license of the packaged software (`links.license`)");
  if (!names.has("README.md")) err("README.md", "missing (pt-BR, required)");
  for (const lang of ["en", "es"]) if (!names.has(`README.${lang}.md`)) warn(`README.${lang}.md`, "missing (recommended: the catalog shows it to users of that language)");
  for (const name of ["README.md", "README.en.md", "README.es.md"]) {
    const f = files.find((x) => x.path === name);
    if (f && f.size > MAX_README_BYTES) err(name, "larger than 100 KB");
    if (f && f.size === 0) err(name, "empty");
  }
  const iconPath = m.icon ?? (names.has("icon.svg") ? "icon.svg" : names.has("icon.png") ? "icon.png" : null);
  if (!iconPath || !names.has(iconPath)) err("icon", "missing (`icon.svg`, up to 64 KB, no scripts)");
  else {
    const ext = posix.extname(iconPath).toLowerCase();
    const data = readFileSync(join(dir, iconPath));
    if (ext === ".svg") {
      if (data.length > ICON_MAX.svg) err(iconPath, "larger than 64 KB");
      const problem = svgProblem(data.toString("utf8"));
      if (problem) err(iconPath, problem);
    } else if (ext === ".png") {
      if (data.length > ICON_MAX.png) err(iconPath, "larger than 256 KB");
      if (data.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") err(iconPath, "not a PNG");
    } else err(iconPath, "the icon must be an SVG or a PNG");
  }

  const docs = files.filter((f) => f.path.startsWith("docs/"));
  if (docs.length === 0) err("docs/", "missing (`docs/_index.json` and the pages it lists)");
  let docsTotal = 0;
  for (const f of docs) {
    docsTotal += f.size;
    if (!DOCS_EXT.has(posix.extname(f.path).toLowerCase())) err(f.path, "file type not allowed in docs/");
    if (f.size > 256 * 1024) err(f.path, "larger than 256 KB");
    if (f.path.toLowerCase().endsWith(".svg")) {
      const problem = svgProblem(readFileSync(join(dir, f.path), "utf8"));
      if (problem) err(f.path, problem);
    }
  }
  if (docs.length > 200 || docsTotal > 5 * 1024 * 1024) err("docs/", "too many or too large files (200 files, 5 MB)");
  if (docs.length > 0) {
    if (!names.has("docs/_index.json")) err("docs/_index.json", "missing");
    else {
      try {
        const index = JSON.parse(readFileSync(join(dir, "docs/_index.json"), "utf8"));
        const pages = Array.isArray(index.pages) ? index.pages : null;
        if (!pages) err("docs/_index.json", "needs a `pages` array");
        else {
          for (const page of pages) {
            const listed = [page.files?.["pt-br"], page.files?.en, page.files?.es].filter(Boolean);
            if (!page.title?.["pt-br"] || !page.files?.["pt-br"]) err("docs/_index.json", `page "${page.id ?? "?"}" needs a pt-br title and a pt-br file`);
            for (const file of listed) if (!names.has(`docs/${file}`)) err("docs/_index.json", `lists "docs/${file}", which does not exist`);
          }
        }
      } catch {
        err("docs/_index.json", "not valid JSON");
      }
    }
  }

  return { id, manifest: m, errors, warnings, files };
}

/** Dockerfile rules the platform's builder enforces (a subset: the importer runs the full check). */
function checkDockerfile(rel, abs, err, warn) {
  const text = readFileSync(abs, "utf8");
  const syntax = text.split(/\r?\n/).slice(0, 5).map((l) => /^\s*#\s*syntax\s*=\s*(\S+)/i.exec(l)?.[1]).find(Boolean);
  if (syntax && !/^(?:docker\.io\/)?docker\/dockerfile:1(?:\.\d+){0,2}(?:-labs)?(?:@sha256:[a-f0-9]{64})?$/.test(syntax)) err(rel, `\`# syntax=${syntax}\` is not allowed (only the official docker/dockerfile frontend)`);
  // Stages (`AS <name>`), stage indexes and `scratch` are not images.
  const stages = new Set();
  const checkImage = (what, ref) => {
    if (ref === "scratch" || /^\d+$/.test(ref) || stages.has(ref.toLowerCase())) return;
    if (ref.includes("$")) err(rel, `\`${what}${ref}\` uses a variable: write the image with its digest`);
    else if (!/@sha256:[0-9a-f]{64}$/.test(ref)) err(rel, `\`${what}${ref}\` must be pinned by digest (\`@sha256:...\`)`);
  };
  for (const line of text.replace(/\\\r?\n/g, " ").split(/\r?\n/)) {
    const from = /^\s*FROM\s+(?:--platform=\S+\s+)?(\S+)(?:\s+AS\s+(\S+))?/i.exec(line);
    if (from) {
      checkImage("FROM ", from[1]);
      if (from[2]) stages.add(from[2].toLowerCase());
      continue;
    }
    for (const [, ref] of line.matchAll(/(?:--from=|[=,]from=)([^\s,]+)/gi)) checkImage("--from=", ref);
    if (/^\s*ADD\s/i.test(line) && /(?:[a-z][a-z0-9+.-]*:\/\/|git@)/i.test(line) && !/--checksum=/i.test(line)) err(rel, "`ADD` from a URL must have `--checksum=sha256:...`");
  }
  // Last stage only: the last `USER` instruction decides who runs the image.
  const lastStage = text.split(/^\s*FROM\s/im).pop() ?? "";
  const users = [...lastStage.matchAll(/^\s*USER\s+(\S+)/gim)].map((x) => x[1]);
  if (users.length > 0 && /^(root|0)(:|$)/.test(users[users.length - 1])) err(rel, "the last stage must not end as root: finish with `USER 1000:1000` (the platform runs images as uid 1000)");
  if (!/^\s*USER\s+1000(?::1000)?\s*$/im.test(text)) warn(rel, "no `USER 1000:1000` (the platform runs the image as uid 1000 anyway)");
}
