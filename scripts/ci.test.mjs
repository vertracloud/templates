// The CI workflow: untrusted values never reach the shell through `${{ }}`, actions are pinned by commit and the bucket credentials
// never share a job with the repository code.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { load } from "js-yaml";
import { ROOT } from "./lib/check.mjs";

const workflow = load(readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8"));
const steps = Object.values(workflow.jobs).flatMap((job) => job.steps);

test("no `${{ }}` expression inside a `run` script (values go through `env`)", () => {
  for (const step of steps) if (step.run) assert.doesNotMatch(step.run, /\$\{\{/, step.name ?? step.run);
});

test("every action is pinned by a full commit SHA", () => {
  for (const step of steps) if (step.uses) assert.match(step.uses, /@[0-9a-f]{40}$/, step.uses);
});

test("the bucket credentials live in a job that runs no repository code", () => {
  const { pack, publish } = workflow.jobs;
  assert.deepEqual(pack.steps.filter((s) => s.run?.startsWith("npm ")).map((s) => s.run), ["npm ci --ignore-scripts"]);
  assert.doesNotMatch(JSON.stringify(pack), /secrets\./);
  assert.equal(publish.environment, "catalog");
  assert.deepEqual(publish.needs, "pack");
  for (const step of publish.steps) {
    assert.doesNotMatch(step.uses ?? "", /checkout|setup-node/);
    assert.doesNotMatch(step.run ?? "", /\b(npm|node|npx)\b/);
  }
  for (const [name, job] of Object.entries(workflow.jobs)) if (name !== "publish") assert.doesNotMatch(JSON.stringify(job), /secrets\./, name);
});

test("no checkout keeps the token in the workspace", () => {
  for (const step of steps) if (step.uses?.startsWith("actions/checkout@")) assert.equal(step.with?.["persist-credentials"], false);
});

test("the list of changed templates drops a folder name that is not a slug", () => {
  const step = workflow.jobs.validate.steps.find((s) => s.id === "changed");
  const dir = mkdtempSync(join(tmpdir(), "ci-test-"));
  try {
    const git = (...args) => execFileSync("git", args, { cwd: dir, stdio: "pipe" });
    git("init", "-q");
    git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "base");
    const base = execFileSync("git", ["rev-parse", "HEAD"], { cwd: dir }).toString().trim();
    for (const name of ["good-one", "x$(touch pwned)"]) {
      mkdirSync(join(dir, name));
      writeFileSync(join(dir, name, "vertracloud.template.yaml"), "id: x\n");
    }
    git("add", "-A");
    git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "change");
    const output = join(dir, "out.txt");
    execFileSync("bash", ["-c", step.run], { cwd: dir, env: { ...process.env, EVENT: "pull_request", BASE: base, GITHUB_OUTPUT: output }, stdio: "pipe" });
    assert.match(readFileSync(output, "utf8"), /^list=\["good-one"\]$/m);
    assert.throws(() => readFileSync(join(dir, "pwned")));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
