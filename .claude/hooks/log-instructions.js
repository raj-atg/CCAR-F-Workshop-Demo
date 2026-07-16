#!/usr/bin/env node
// InstructionsLoaded (async): appends one line per loaded instruction file to
// .claude/instructions.log. This is what makes the CLAUDE.md hierarchy and
// path-scoped rules demo visible — tail this file while opening files to see
// session_start vs nested_traversal vs path_glob_match fire in real time.
const fs = require("node:fs");
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

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const logPath = path.join(projectDir, ".claude", "instructions.log");

  const files = input?.files || input?.instructions || [];
  const entries = Array.isArray(files) ? files : [files];

  const lines = entries.map((entry) => {
    const record = {
      timestamp: new Date().toISOString(),
      file_path: entry?.file_path ?? entry?.path ?? String(entry),
      memory_type: entry?.memory_type ?? entry?.type ?? "unknown",
      load_reason: entry?.load_reason ?? entry?.reason ?? "unknown",
      globs: entry?.globs ?? entry?.paths ?? null,
    };
    return JSON.stringify(record);
  });

  if (lines.length > 0) {
    fs.appendFileSync(logPath, lines.join("\n") + "\n");
  }

  process.exit(0);
}

main();
