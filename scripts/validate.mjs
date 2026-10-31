#!/usr/bin/env node
// Validates template folders: JSON Schema + semantic rules + folder rules (see scripts/lib/check.mjs).
//   node scripts/validate.mjs                 every folder with a vertracloud.template.yaml
//   node scripts/validate.mjs n8n discord-bot-js   only these folders
// Exit code 1 when any template has errors. Warnings never fail.
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { checkTemplate, MANIFEST_FILE, ROOT } from "./lib/check.mjs";

export function templateFolders(args = []) {
  if (args.length > 0) return args.map((a) => resolve(a));
  return readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && existsSync(join(ROOT, e.name, MANIFEST_FILE)))
    .map((e) => join(ROOT, e.name))
    .sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dirs = templateFolders(process.argv.slice(2));
  if (dirs.length === 0) {
    console.error("no template folder found");
    process.exit(2);
  }
  let failed = 0;
  const ids = new Map();
  for (const dir of dirs) {
    const { id, manifest, errors, warnings } = checkTemplate(dir);
    if (manifest) {
      if (ids.has(manifest.id)) errors.push(`id: "${manifest.id}" is already used by ${ids.get(manifest.id)}`);
      ids.set(manifest.id, dir);
    }
    console.log(`${errors.length ? "FAIL" : "ok  "} ${id}${manifest ? `@${manifest.version}` : ""}${warnings.length ? ` (${warnings.length} warning${warnings.length > 1 ? "s" : ""})` : ""}`);
    for (const e of errors) console.log(`  error: ${e}`);
    for (const w of warnings) console.log(`  warn:  ${w}`);
    if (errors.length) failed++;
  }
  console.log(`\n${dirs.length - failed}/${dirs.length} templates valid`);
  process.exit(failed ? 1 : 0);
}
