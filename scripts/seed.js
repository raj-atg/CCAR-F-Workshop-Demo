#!/usr/bin/env node
// Cross-platform wrapper so `npm run seed` works from the repo root without
// requiring participants to `cd backend` and remember the venv-activation
// syntax that differs between Windows and macOS.
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const backendDir = path.join(__dirname, "..", "backend");
const isWindows = process.platform === "win32";
const venvPython = path.join(
  backendDir,
  ".venv",
  isWindows ? "Scripts" : "bin",
  isWindows ? "python.exe" : "python",
);

const fs = require("node:fs");
const pythonCommand = fs.existsSync(venvPython) ? venvPython : "python";

const result = spawnSync(pythonCommand, ["-m", "app.db.seed"], {
  cwd: backendDir,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
