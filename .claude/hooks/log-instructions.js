#!/usr/bin/env node
// InstructionsLoaded (async): appends one line per loaded instruction file to
// .claude/instructions.log. This is what makes the CLAUDE.md hierarchy and
// path-scoped rules demo visible — tail this file while opening files to see
// session_start vs nested_traversal vs path_glob_match fire in real time.
//
// Claude Code fires this event once per loaded file, sending `file_path` and
// `load_reason` at the top level of the stdin payload (see the hooks reference).
// We also accept a `files` array for forward-compatibility in case a future
// version batches multiple files into one call.
const fs = require("node:fs");
const path = require("node:path");

function readStdin() {
  const chunks = [];
  process.stdin.on("data", (chunk) => chunks.push(chunk));
  return new Promise((resolve) => {
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

function toRecord(entry) {
  return {
    timestamp: new Date().toISOString(),
    file_path: entry?.file_path ?? entry?.path ?? "unknown",
    memory_type: entry?.memory_type ?? entry?.type ?? "unknown",
    load_reason: entry?.load_reason ?? entry?.reason ?? "unknown",
    globs: entry?.globs ?? entry?.paths ?? null,
  };
}

async function main() {
  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    process.exit(0);
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const logPath = path.join(projectDir, ".claude", "instructions.log");

  // Preferred shape: one file per event, fields at the top level.
  // Fallback shape: a `files`/`instructions` array of entries.
  const batch = input?.files ?? input?.instructions;
  const entries = Array.isArray(batch) ? batch : [input];

  const lines = entries
    .filter((entry) => entry && (entry.file_path || entry.path))
    .map((entry) => JSON.stringify(toRecord(entry)));

  if (lines.length > 0) {
    fs.appendFileSync(logPath, lines.join("\n") + "\n");
  }

  process.exit(0);
}

main();
