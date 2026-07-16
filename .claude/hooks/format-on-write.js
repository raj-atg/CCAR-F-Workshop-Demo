#!/usr/bin/env node
// PostToolUse(Edit|Write): auto-formats the file that was just edited.
// Node + exec-form spawn so this runs identically on Windows and macOS —
// no shell, no .sh script that needs Git Bash on Windows.
const { spawnSync } = require("node:child_process");

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

  let command, args;
  if (filePath.endsWith(".py")) {
    command = "ruff";
    args = ["format", filePath];
  } else if (/\.(ts|tsx|js|jsx|css|md|json)$/.test(filePath)) {
    command = "npx";
    args = ["--yes", "--no-install", "prettier", "--write", filePath];
  } else {
    process.exit(0);
  }

  // Formatter may not be installed in every participant's environment.
  // Missing tooling should never block or noisily fail a save.
  const result = spawnSync(command, args, { stdio: "ignore" });
  if (result.error || result.status !== 0) {
    process.exit(0);
  }
  process.exit(0);
}

main();
