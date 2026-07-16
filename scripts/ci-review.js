#!/usr/bin/env node
// Cross-platform CI review runner: reads the schema file and passes its
// contents inline to --json-schema, since that flag takes a JSON string,
// not a file path (verified against the CLI reference docs, which
// diverges from a natural first guess). Runs with -p so this never hangs
// waiting for interactive input in a CI job.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.join(__dirname, "..");
const schemaPath = path.join(projectRoot, "schemas", "review-findings.schema.json");
const schema = fs.readFileSync(schemaPath, "utf8");

const prompt =
  "Review the changed files against .claude/rules/api-conventions.md. " +
  "Report only critical bugs and convention violations. Skip style nits.";

const result = spawnSync(
  "claude",
  ["-p", prompt, "--output-format", "json", "--json-schema", schema],
  { cwd: projectRoot, stdio: "inherit" },
);

process.exit(result.status ?? 1);
