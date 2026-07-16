#!/usr/bin/env node
// PreToolUse(Edit|Write): blocks direct edits to backend/app/db/models.py.
//
// The settings.json `if` filter already narrows this hook to that path, but
// `if` is documented as best-effort and fails open when it can't parse a
// command — so this script re-checks the path itself rather than trusting
// the filter. That's the difference between a CLAUDE.md asking Claude to
// follow the schema-change procedure (usually works) and this hook
// guaranteeing it (always works).
const path = require("node:path");

function readStdin() {
  const chunks = [];
  process.stdin.on("data", (chunk) => chunks.push(chunk));
  return new Promise((resolve) => {
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

async function main() {
  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    process.exit(0);
  }

  const filePath = input?.tool_input?.file_path;
  if (!filePath) process.exit(0);

  const normalized = filePath.replace(/\\/g, "/");
  const isModelsFile = /(^|\/)backend\/app\/db\/models\.py$/.test(normalized);

  if (!isModelsFile) {
    process.exit(0);
  }

  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason:
        "models.py is schema-critical. Follow the procedure in backend/app/db/CLAUDE.md: " +
        "update the model, update seed.py, re-run the seed, and update the affected schemas " +
        "in the same change. Ask the user to confirm before proceeding.",
    },
  };

  console.log(JSON.stringify(output));
  process.exit(0); // JSON is only processed on exit 0; exit 2 would discard it.
}

main();
