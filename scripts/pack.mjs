#!/usr/bin/env node
// Packs every (or the named) template folder into the format the platform imports and writes the catalog index.
//   node scripts/pack.mjs [--out dist] [folder ...]
//
// Output:
//   <out>/packages/<id>/<version>.zip   the package (the folder content at the zip root), deterministic: same content = same bytes
//   <out>/catalog/index.json            { version: 1, templates: [{ id, origin, version, package, sha256, visibility, featured }] }
//
// Nothing is uploaded here: the CI uploads `<out>` to the catalog bucket on merge. A template whose folder has errors is never packed.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import AdmZip from "adm-zip";
import { checkTemplate } from "./lib/check.mjs";
import { templateFolders } from "./validate.mjs";

const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const out = resolve(outAt >= 0 ? args[outAt + 1] : "dist");
const folders = templateFolders(args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--out"));

/** Same bytes for the same content: sorted paths, fixed mtime, fixed mode (like the importer's own `zipFiles`). */
export function zipFolder(dir, files) {
  const zip = new AdmZip();
  for (const { path } of files) {
    zip.addFile(path, readFileSync(join(dir, path)));
    const entry = zip.getEntry(path);
    entry.header.time = new Date(Date.UTC(2020, 0, 1));
    entry.attr = (0o100644 << 16) >>> 0;
  }
  return zip.toBuffer();
}

/** Catalog flags that are not in the manifest, from `catalog.json` at the repo root. Without `origin: "vertra"` a template is community. */
function catalogFlags(id) {
  try {
    const flags = JSON.parse(readFileSync(resolve(dirname(new URL(import.meta.url).pathname), "../catalog.json"), "utf8"));
    return flags[id] ?? {};
  } catch {
    return {};
  }
}

const entries = [];
let failed = 0;
for (const dir of folders) {
  const { manifest, errors, files } = checkTemplate(dir);
  if (!manifest || errors.length) {
    failed++;
    console.error(`skip ${dir}: ${errors.length} error(s); run scripts/validate.mjs`);
    continue;
  }
  const zip = zipFolder(dir, files);
  const target = join(out, "packages", manifest.id, `${manifest.version}.zip`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, zip);
  const flags = catalogFlags(manifest.id);
  entries.push({
    id: manifest.id,
    origin: flags.origin === "vertra" ? "vertra" : "community",
    version: manifest.version,
    package: `packages/${manifest.id}/${manifest.version}.zip`,
    sha256: createHash("sha256").update(zip).digest("hex"),
    visibility: flags.visibility ?? "public",
    ...(flags.featured ? { featured: true } : {}),
  });
  console.log(`packed ${manifest.id}@${manifest.version} (${files.length} files, ${(zip.length / 1024).toFixed(1)} KB)`);
}
if (failed) process.exit(1);
entries.sort((a, b) => (a.id < b.id ? -1 : 1));
mkdirSync(join(out, "catalog"), { recursive: true });
writeFileSync(join(out, "catalog/index.json"), `${JSON.stringify({ version: 1, templates: entries }, null, 2)}\n`);
console.log(`wrote ${join(out, "catalog/index.json")} (${entries.length} templates)`);
