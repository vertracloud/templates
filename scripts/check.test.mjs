// Tests of the checks themselves: every template of the repository is valid and the rules fail when they should.
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { checkTemplate, parsePlaceholder, ROOT } from "./lib/check.mjs";
import { templateFolders } from "./validate.mjs";

test("every template folder of the repository is valid", () => {
  for (const dir of templateFolders()) {
    const { id, errors } = checkTemplate(dir);
    assert.deepEqual(errors, [], `${id} has errors`);
  }
});

function mutated(template, edit, path = "vertracloud.template.yaml") {
  const tmp = mkdtempSync(join(tmpdir(), "tpl-"));
  const dir = join(tmp, template);
  cpSync(join(ROOT, template), dir, { recursive: true });
  const file = join(dir, path);
  writeFileSync(file, edit(readFileSync(file, "utf8")));
  const result = checkTemplate(dir);
  rmSync(tmp, { recursive: true, force: true });
  return result.errors.join("\n");
}

test("an unknown placeholder fails", () => {
  assert.match(mutated("uptime-kuma", (s) => s.replace("UPTIME_KUMA_DB_TYPE: sqlite", "UPTIME_KUMA_DB_TYPE: \"{{inputs.nope}}\"")), /unknown question "nope"/);
});

test("NODE_OPTIONS in env fails", () => {
  assert.match(mutated("uptime-kuma", (s) => s.replace("UPTIME_KUMA_DB_TYPE: sqlite", "NODE_OPTIONS: --require x")), /controlled by the platform/);
});

test("an unknown plan slug fails", () => {
  assert.match(mutated("uptime-kuma", (s) => s.replace("services:", "min_plan: business-12\nservices:")), /not a plan slug/);
});

test("a literal secret fails", () => {
  assert.match(mutated("uptime-kuma", (s) => s.replace("UPTIME_KUMA_DB_TYPE: sqlite", "ADMIN_PASSWORD: supersecret123")), /looks like a secret/);
});

test("context `.` and an image without digest fail", () => {
  assert.match(mutated("uptime-kuma", (s) => s.replace("context: docker", "context: .")), /sub-folder/);
  assert.match(mutated("uptime-kuma", (s) => s.replace(/@sha256:[0-9a-f]{64}/, "")), /pinned by digest/);
});

test("every image the Dockerfile pulls must be pinned by digest", () => {
  const dockerfile = (extra) => mutated("uptime-kuma", (s) => `${s}\n${extra}\n`, "docker/Dockerfile");
  assert.match(dockerfile("FROM caddy:2.11.7-alpine AS caddy"), /`FROM caddy:2\.11\.7-alpine` must be pinned/);
  assert.match(dockerfile("COPY --from=ghcr.io/someone/tools:1.0 /bin/tool /usr/local/bin/tool"), /`--from=ghcr\.io\/someone\/tools:1\.0` must be pinned/);
  assert.match(dockerfile("RUN --mount=from=node:22,source=/usr/local/bin/node,target=/n true"), /`--from=node:22` must be pinned/);
  assert.match(dockerfile("FROM louislam/uptime-kuma:${TAG}"), /uses a variable/);
  assert.match(dockerfile("ADD https://example.com/tool.tar.gz /tmp/tool.tar.gz"), /`ADD` from a URL must have `--checksum=/);
});

test("an icon with a script, a link or an external reference fails", () => {
  const icon = (svg) => mutated("discord-bot-js", () => svg, "icon.svg");
  const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${inner}</svg>`;
  assert.match(icon(wrap("<![CDATA[<!--]]><script>alert(1)</script><!---->")), /CDATA section or a malformed comment/);
  assert.match(icon(wrap("<!-- --!><script>alert(1)</script> -->")), /CDATA section or a malformed comment/);
  assert.match(icon(wrap('<x:script xmlns:x="http://www.w3.org/2000/svg">alert(1)</x:script>')), /element <x:script>/);
  assert.match(icon(wrap('<path d="M0 0" x:onload="alert(1)"/>')), /event handler/);
  assert.match(icon(wrap('<animate attributeName="href" to="#a"/>')), /animates a link/);
  assert.match(icon(wrap('<style>@import "https://example.com/x.css";</style>')), /external resources/);
  assert.match(icon(wrap('<path d="M0 0" style="fill:url(https://example.com/a)"/>')), /external resources/);
  assert.match(icon(wrap('<linearGradient id="a" href="javascript&#58;alert(1)"/>')), /scripts/);
  assert.match(icon(wrap('<linearGradient id="a" href="https://example.com/a"/>')), /not a fragment/);
  assert.equal(icon(wrap('<!-- loaded via <img> --><linearGradient id="a"/><path fill="url(#a)" d="M0 0"/>')), "");
});

test("placeholder grammar", () => {
  assert.equal(parsePlaceholder("secret:7"), null);
  assert.deepEqual(parsePlaceholder("secret:32"), { kind: "secret" });
  assert.deepEqual(parsePlaceholder("services.db.ssl.ca_path"), { kind: "service", id: "db", field: "ssl.ca_path" });
  assert.equal(parsePlaceholder("nope.x"), null);
});
