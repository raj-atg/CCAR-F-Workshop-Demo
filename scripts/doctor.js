#!/usr/bin/env node
// Workshop readiness check. Confirms every prerequisite a participant needs
// before the workshop starts, and prints a clear pass/fail summary.
//
// Run any of:
//   npm run doctor
//   node scripts/doctor.js
//   node scripts/doctor.js --doctor   (the flag form is accepted as an alias)
//
// Exit code 0 = ready to start; 1 = at least one required check failed.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.join(__dirname, "..");
const isWindows = process.platform === "win32";

// --- tiny output helpers -------------------------------------------------
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = (s) => c("32", s);
const red = (s) => c("31", s);
const yellow = (s) => c("33", s);
const dim = (s) => c("2", s);
const bold = (s) => c("1", s);

const PASS = green("✓");
const FAIL = red("✗");
const WARN = yellow("!");

const results = []; // { level: "pass"|"fail"|"warn", label, detail, fix }

function record(level, label, detail, fix) {
  results.push({ level, label, detail, fix });
  const mark = level === "pass" ? PASS : level === "warn" ? WARN : FAIL;
  let line = `  ${mark} ${label}`;
  if (detail) line += ` ${dim("— " + detail)}`;
  console.log(line);
  if (level !== "pass" && fix) console.log(`      ${dim("→ " + fix)}`);
}

// Run a command and capture its output; never throws.
function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
    ...opts,
  });
  return {
    ok: r.status === 0,
    status: r.status,
    stdout: (r.stdout || "").trim(),
    stderr: (r.stderr || "").trim(),
    missing: r.error && r.error.code === "ENOENT",
  };
}

// Parse the first "X.Y.Z" out of a string.
function parseVersion(s) {
  const m = /(\d+)\.(\d+)(?:\.(\d+))?/.exec(s || "");
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3] || 0)];
}
function atLeast(version, min) {
  if (!version) return false;
  for (let i = 0; i < min.length; i++) {
    if ((version[i] || 0) > min[i]) return true;
    if ((version[i] || 0) < min[i]) return false;
  }
  return true;
}

// --- the checks ----------------------------------------------------------

console.log(bold("\nWorkshop readiness check\n"));
console.log(dim("Toolchain"));

// Python 3.11+
{
  const py = run("python", ["--version"]);
  const alt = py.missing ? run("python3", ["--version"]) : null;
  const found = !py.missing ? py : alt && !alt.missing ? alt : null;
  if (!found) {
    record("fail", "Python", "not found on PATH", "Install Python 3.11+ from python.org and reopen your terminal.");
  } else {
    const v = parseVersion(found.stdout || found.stderr);
    if (atLeast(v, [3, 11])) {
      record("pass", "Python", `${v.join(".")}`);
    } else {
      record("fail", "Python", `${v ? v.join(".") : "unknown"} (need 3.11+)`, "Upgrade to Python 3.11 or newer.");
    }
  }
}

// Node 20+
{
  const v = parseVersion(process.version);
  if (atLeast(v, [20])) {
    record("pass", "Node.js", process.version);
  } else {
    record("fail", "Node.js", `${process.version} (need 20+)`, "Install Node 20+ from nodejs.org.");
  }
}

// npm
{
  const npm = run(isWindows ? "npm.cmd" : "npm", ["--version"]);
  if (npm.missing) record("fail", "npm", "not found", "npm ships with Node — reinstall Node from nodejs.org.");
  else record("pass", "npm", npm.stdout);
}

// Claude Code CLI
{
  const cli = run(isWindows ? "claude.cmd" : "claude", ["--version"]);
  const cliAlt = cli.missing ? run("claude", ["--version"]) : cli;
  const found = !cli.missing ? cli : cliAlt;
  if (found.missing) {
    record("fail", "Claude Code CLI", "not found on PATH", "Install it: npm install -g @anthropic-ai/claude-code");
  } else {
    record("pass", "Claude Code CLI", found.stdout.split("\n")[0]);
  }
}

// --- project install state ----------------------------------------------
console.log("\n" + dim("Project setup"));

// backend venv
const venvPython = path.join(
  repoRoot,
  "backend",
  ".venv",
  isWindows ? "Scripts" : "bin",
  isWindows ? "python.exe" : "python",
);
const haveVenv = fs.existsSync(venvPython);
if (haveVenv) {
  record("pass", "Backend virtualenv", "backend/.venv present");
} else {
  record(
    "fail",
    "Backend virtualenv",
    "backend/.venv missing",
    isWindows
      ? "cd backend && python -m venv .venv && .venv\\Scripts\\activate && pip install -r requirements.txt"
      : "cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt",
  );
}

// backend deps importable (only meaningful if venv exists)
if (haveVenv) {
  const imp = run(venvPython, ["-c", "import fastapi, sqlalchemy, uvicorn, mcp"], {
    cwd: path.join(repoRoot, "backend"),
  });
  if (imp.ok) record("pass", "Backend dependencies", "fastapi, sqlalchemy, uvicorn, mcp importable");
  else record("fail", "Backend dependencies", "import failed", "Activate the venv and run: pip install -r backend/requirements.txt");
}

// frontend node_modules
const haveNodeModules = fs.existsSync(path.join(repoRoot, "frontend", "node_modules"));
if (haveNodeModules) record("pass", "Frontend dependencies", "frontend/node_modules present");
else record("fail", "Frontend dependencies", "frontend/node_modules missing", "npm install --prefix frontend");

// seeded database
const dbPath = path.join(repoRoot, "backend", "inventory.db");
if (fs.existsSync(dbPath) && fs.statSync(dbPath).size > 0) {
  record("pass", "Seeded database", "backend/inventory.db present");
} else {
  record("warn", "Seeded database", "backend/inventory.db not found", "Run: npm run seed  (creates it from seed.py)");
}

// --- Claude project config (nice-to-have, non-blocking) ------------------
console.log("\n" + dim("Claude project config"));

const configFiles = [
  ["CLAUDE.md", "Project memory"],
  [".mcp.json", "MCP servers"],
  [".claude/settings.json", "Hooks wiring"],
];
for (const [rel, label] of configFiles) {
  if (fs.existsSync(path.join(repoRoot, rel))) record("pass", label, rel);
  else record("warn", label, `${rel} missing`, "Are you running this from the repo root?");
}

// --- summary -------------------------------------------------------------
const fails = results.filter((r) => r.level === "fail");
const warns = results.filter((r) => r.level === "warn");

console.log("");
if (fails.length === 0) {
  console.log(green(bold("✓ You're ready for the workshop.")));
  if (warns.length > 0) {
    console.log(yellow(`  ${warns.length} optional item(s) to note above, but nothing blocking.`));
  }
  console.log(dim("\nStart the app with two terminals (see README §2 / PARTICIPANTS.md §2):"));
  console.log(dim("  Terminal 1:  cd backend && uvicorn app.main:app --port 8001 --reload   (venv active)"));
  console.log(dim("  Terminal 2:  npm run dev --prefix frontend"));
  console.log(dim("  Then open http://localhost:3000\n"));
} else {
  console.log(red(bold(`✗ Not ready yet — ${fails.length} required check(s) failed.`)));
  console.log("Fix the items marked with " + red("✗") + " above, then re-run " + bold("npm run doctor") + ".\n");
}

process.exit(fails.length === 0 ? 0 : 1);
