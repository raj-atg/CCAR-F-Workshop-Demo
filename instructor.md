# Instructor Guide

Everything you need to run this workshop end to end. Read the **Summary** for the fast path; the rest is the verbose, step-by-step script with talking points, the seeded faults, and recovery notes.

---

## Summary (read this first)

**What the workshop is.** A hands-on tour of Claude Code's configuration layer. The app — a factory inventory manager (React + Vite frontend, FastAPI backend, SQLite) — is throwaway scaffolding. The real subject is the `.claude/` folder: memory, rules, skills, commands, agents, hooks, and MCP. You demo each feature live; participants repeat and extend it.

**Who runs what.**
- **You (instructor)** drive from the **Claude Code CLI** (`claude` in a terminal). You have the full surface, including the CLI-only session and headless features.
- **Participants** drive from the **VS Code extension** (the Claude Code panel). They do everything except the CLI-only session/headless pieces, which they watch you demo.

**The arc of the session (~45–60 min):**
1. Setup + confirm everyone's `npm run doctor` is green.
2. Memory hierarchy (`/memory`) — lazy loading.
3. Path-scoped rules (`.claude/instructions.log`) — conditional loading.
4. Skills that fork (`/explore-schema`) — context isolation.
5. Legacy command (`/low-stock`) — code runs before Claude speaks.
6. Hooks — `protect-models` (enforce) and `format-on-write` (automate).
7. MCP (`/mcp`, "which items need reordering?") — live DB vs guessing.
8. Agents (`db-explorer`, `api-reviewer`, `test-writer`) — tool restriction.
9. Fix the seeded low-stock crash live.
10. **CLI-only, you demo:** sessions (`-n`, `--continue`, `--resume`, `--fork-session`, `/fork`) and headless (`-p`, `npm run ci-review`).
11. Participants extend: write a skill, add a restricted agent, add an MCP tool, write a Stop hook.

**The five seeded faults (memorize these):**
1. `SN-2002` has `reorder_level = NULL` → `GET /api/items/low-stock` returns **HTTP 500**.
2. `Item.quantity` vs `Order.quantity` name collision → the plan-mode rename lesson (~10 files).
3. `backend/app/routers/suppliers.py` has full CRUD but **zero tests**.
4. `/api/orders` returns `placed_at` as a **Unix timestamp** (others use ISO-8601); `client.ts` compensates.
5. `SupplierTable.tsx` calls `fetch` directly, violating the "only `client.ts` calls fetch" rule.

**Failure-first is the method.** For each fault and each hook, let the failure happen *before* you show the fix. The failure is what participants remember.

**Golden rule:** keep both app servers (backend 8001, frontend 3000) running the whole time, and run `claude` in a *third* terminal. Re-seed with `npm run seed` whenever you need a clean slate.

---

## 0. Before class (pre-flight)

Do this on your own machine ahead of time, and have participants run their own setup + `npm run doctor` before the session starts.

### 0.1 Your environment

You need **Python 3.11+**, **Node 20+**, and the **Claude Code CLI**:

```
python --version
node --version
claude --version
```

If `claude` is missing: `npm install -g @anthropic-ai/claude-code`. On a gateway/proxy, follow `SETUP-PROXY.md` (env-var auth, no `claude login`).

### 0.2 Install and seed the app

Windows (PowerShell):
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..
npm install --prefix frontend
npm run seed
```

macOS/Linux: same, but `source .venv/bin/activate`.

`npm run seed` should print `Seeded 4 suppliers, 10 items, 10 orders.`

### 0.3 One-command readiness check

```
npm run doctor
```

It validates Python, Node, npm, the CLI, the venv + deps, `node_modules`, the seeded DB, and the `.claude/` config. Green means the demos will work. Have every participant run this and reach `✓ You're ready for the workshop.` before you start — don't begin until the room is green.

### 0.4 Deeper smoke test (optional, recommended for you)

```
# both suites green
cd backend && pytest && cd ..
npm test --prefix frontend

# seed = 4/10/10
npm run seed

# fault #1 is live — start uvicorn first, then:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8001/api/items/low-stock   # expect 500

# CLI sees the project config
claude mcp list      # inventory / playwright / github listed (github warns about missing PAT — expected)
```

Expected: 8 backend + 9 frontend tests pass, seed prints 4/10/10, low-stock returns **500**.

### 0.5 Start the app (leave running all session)

Terminal 1 (backend, venv active):
```
cd backend
uvicorn app.main:app --port 8001 --reload
```

Terminal 2 (frontend):
```
npm run dev --prefix frontend
```

Open http://localhost:3000 — Items page, 10 rows. Run `claude` in **Terminal 3**.

---

## 1. Frame the session (2 min)

Say this out loud:

> "The inventory app is scaffolding. The real subject is the `.claude/` folder — the configuration that teaches Claude Code how to work inside *this specific* project. Everything in `.claude/` is something a real engineer would genuinely add to this codebase, not a demo prop. By the end you'll know how to add the same configuration to your own repos."

Point out the split: you're on the CLI, participants are in the VS Code panel, and a few things are CLI-only (you'll flag them as you reach them).

---

## 2. Memory hierarchy — lazy loading (5 min)

**Goal:** show that deeper `CLAUDE.md` files load only when you touch that folder.

1. In `claude`, open (or reference) a file deep in the tree: `frontend/src/components/ItemTable.tsx`.
2. Run `/memory`.

**Point at:** `frontend/src/components/CLAUDE.md` appears in the list *only after* you touched that directory — it wasn't loaded at session start. Contrast with the root `CLAUDE.md`, always loaded.

**Talking point:** this is why big monorepos stay usable — Claude doesn't front-load every note. There are four+ levels here: root, `backend/`, `backend/app/db/`, `frontend/`, `frontend/src/components/`. Also mention `@import` — the root `CLAUDE.md` imports `standards/*.md` to keep style rules out of the file people read most.

---

## 3. Path-scoped rules — conditional loading (5 min)

**Goal:** prove a rule loads only for files matching its glob.

1. Open `frontend/src/components/ItemTable.test.tsx` (test file).
2. Open `backend/app/routers/items.py` (router file).
3. `tail` / open `.claude/instructions.log`.

**Point at:** a `path_glob_match` entry for `testing.md` after the test file, and for `api-conventions.md` after the router — and neither fires for the other file. The `log-instructions` hook is what makes this observable.

**Talking point:** rules are how you scope guidance to files that live in *many* directories (tests are colocated beside source across `components/` and `pages/`, so no single directory `CLAUDE.md` could cover them). `db-schema.md` and `react-components.md` deliberately overlap with directory `CLAUDE.md`s — use that to explain when a stable directory is better served by a `CLAUDE.md` than a glob.

---

## 4. Skills that fork — context isolation (5 min)

**Goal:** show `context: fork` keeping verbose output out of the main conversation.

1. Run `/explore-schema Item`.
2. (Optional strong version) Note main-session context usage. Remove `context: fork` from `.claude/skills/explore-schema/SKILL.md` frontmatter, run again, and show the flood of file reads landing in the main context. **Restore the line afterward.**

**Point at:** the before/after context usage — the flood is the lesson.

**Talking point:** other skills to name: `/add-entity` (the literal template to copy for a 4th entity; uses `argument-hint`, `allowed-tools`), `/review-endpoint <file>` (uses `disable-model-invocation: true` so it runs only when *asked*, not whenever Claude thinks a router looks done).

---

## 5. Legacy command — code runs before Claude speaks (3 min)

**Goal:** show the old `/command` form with dynamic injection.

1. Run `/low-stock`.

**Point at:** the low-stock list is already inlined at the top of the response *before* Claude's own text — the `` !`cmd` `` injection ran a script and fed the result in.

**Talking point:** `.claude/commands/` still works standalone alongside `.claude/skills/`; it isn't superseded. `low-stock.md` deliberately stays in the legacy form to prove that.

---

## 6. Hooks — enforce and automate (5 min)

**Goal:** a hook is a guarantee, not a request.

### 6a. `protect-models` (PreToolUse, deny)
1. Ask Claude to edit `backend/app/db/models.py` directly (e.g. "add a `notes` field to Item"), *without* mentioning the procedure.
2. Watch the `PreToolUse` hook **block** the edit and print the safe procedure.

**Point at:** the deny message. A `CLAUDE.md` note is followed "usually"; the hook is a guarantee. `models.py` is the one file where "usually" isn't good enough.

### 6b. `format-on-write` (PostToolUse)
1. Ask for a tiny safe edit elsewhere (e.g. a comment in `suppliers.py`).
2. Show the file comes back already formatted — `ruff format` ran automatically.

**Point at:** nobody had to remember to format. Run `/hooks` to show all three registered (`format-on-write`, `protect-models`, `log-instructions`).

---

## 7. MCP — live DB vs guessing (5 min)

**Goal:** contrast a real query against a guess from `seed.py`.

1. (Optional) Ask "which items need reordering?" *before* the MCP server connects (or with it disconnected) — Claude guesses from `seed.py`.
2. Confirm connection with `/mcp` (`inventory` connected).
3. Ask again: **"Which items need reordering?"** — now Claude queries the real DB.

**Point at:** the difference. Bonus: edit a stock level in the browser first, then ask — the live answer reflects your edit; a seed-file guess wouldn't.

**Talking point:** the `inventory` server exposes three non-overlapping read-only tools: `get_schema`, `query_inventory` (SELECT-only, server-enforced), `low_stock_report`. Two extra servers (`playwright`, `github`) are configured too; `github` warns about a missing PAT — that's expected, not a bug.

> If `inventory` is stuck at "Pending approval": run `claude` once interactively in this directory and accept the workspace trust dialog. If the server import fails: activate the backend venv **before** launching `claude`.

---

## 8. Agents — tool restriction (5 min)

**Goal:** show read-only vs write-capable subagents and small-model routing.

1. `db-explorer` (read-only, MCP tools, `model: haiku`): "Use the db-explorer agent — which suppliers have the most items below reorder level?"
2. `api-reviewer` (read-only code review): "Use the api-reviewer agent to review `backend/app/routers/orders.py`." It flags fault #4 (Unix timestamp) but **cannot edit**.
3. `test-writer` (write-capable): mention it exists to fill the `suppliers.py` coverage gap (fault #3).

**Point at:** `api-reviewer` finds a problem but can't "fix" it — `Edit`/`Write` aren't in its tools. That constraint is the feature.

---

## 9. Fix the seeded low-stock crash live (5 min)

**Goal:** an end-to-end real fix with a regression test.

1. Show the 500 in the browser (low-stock view) or via `curl`.
2. In `claude`: *"GET /api/items/low-stock returns a 500 error. Find out why and fix it, then add a test so it can't regress."*
3. Watch it read the stack trace, find `SN-2002`'s `NULL` reorder level, add the null check in `backend/app/routers/items.py` (`item.reorder_level is not None and item.quantity <= item.reorder_level`), and write a test.
4. Reload the browser — fixed.

> If you want to re-run this demo, re-seed (`npm run seed`) to restore the `NULL` and revert the router edit.

---

## 10. CLI-only — you demo, participants watch (10 min)

These are **CLI-only**. Participants can't run them in the VS Code panel — tell them to watch; the ideas transfer.

### 10a. Sessions
- `claude -n schema-investigation` → "Trace how Item flows from the SQLAlchemy model to the ItemTable component. Don't change anything." Quit.
- Start an unrelated session, quit.
- `claude --continue` → picks the **most recent** session regardless of name.
- `claude --resume schema-investigation` → targets that **specific** session; ask "what was the last thing you told me?" to prove it.
- `claude --resume schema-investigation --fork-session` → prompt a rename approach; quit. Fork *again from the original*, prompt a different approach. Two branches from one shared analysis, neither polluting the other.
- `/fork draft the test cases for this rename` (inside a live session) → forks the **conversation** into a background subagent while you keep working. Contrast: `--fork-session` forks the **session ID**; `/fork` forks the **conversation**.

### 10b. Headless / CI
- Run `claude "Review this PR"` interactively and let it **hang** waiting for input — that hang is the lesson.
- Then `npm run ci-review`, which uses `-p` (headless) plus `--output-format json` and `--json-schema` to produce machine-parseable findings that drive inline PR comments.

**Point at:** headless `-p` is what makes Claude usable in automation. The `.github/workflows/claude-review.yml` gate runs this on PRs without breaking CI for forks that haven't set the secret.

---

## 11. Participant extension exercises

Participants work these in the VS Code panel (full detail in `PARTICIPANTS.md`, Exercises 7–11). Circulate and help.

1. **Write a skill** `explain-order-flow` modeled on `explore-schema`; decide `context: fork` or not and justify it.
2. **Add a restricted agent** `order-auditor` (`tools: Read, Grep, Glob`) that finds orphaned orders but can't fix them.
3. **Add a 4th MCP tool** `supplier_summary()` to `mcp/inventory_mcp/server.py`; reconnect (`/mcp`); confirm 4 tools.
4. **Write a Stop hook** that runs `pytest` + `npm test` and blocks "done" on failure; break a test to prove it, then fix it.
5. **Find the other seeded faults** (2–5 below) and fix them with Claude.

---

## 12. The five seeded faults — full diagnoses

Don't reveal these before participants attempt to find them.

1. **Null-reorder-level crash.** `SN-2002` in `backend/app/db/seed.py` has `reorder_level=None`. `GET /api/items/low-stock` in `backend/app/routers/items.py` does `item.quantity <= item.reorder_level`, raising `TypeError` on `None`. No test covered it — that's *why* it shipped. Fix: null check + regression test.

2. **`quantity` naming collision.** `Item.quantity` (on-hand stock) and `Order.quantity` (amount ordered) share a name. Renaming `Item.quantity` → `Item.quantity_on_hand` touches `models.py`, `schemas/item.py`, `routers/items.py`, `seed.py`, both backend test files, `frontend/src/api/client.ts`, `ItemTable.tsx`, `ItemForm.tsx`, and their tests (~10 files). Fix: plan mode, then a systematic Edit pass, confirmed by both test suites. This is the plan-mode lesson — the ceremony is worth it *here* and wasted on fault #1.

3. **Untested `suppliers.py`.** `backend/app/routers/suppliers.py` has full CRUD but zero tests, while `items` and `orders` are covered. Fix: notice the gap (the `testing.md` rule prompts "does every router have a test file?"), use the `test-writer` agent to fill it.

4. **Inconsistent date format.** `/api/orders` returns `placed_at` as a Unix timestamp; `/api/items` returns `updated_at` as ISO-8601. `client.ts`'s `normalizeOrder()` compensates at the client boundary. Fix: `/review-endpoint backend/app/routers/orders.py` (or `api-reviewer`) flags it against `api-conventions.md`; the *real* fix is emitting ISO-8601 from the backend and removing the client workaround — not leaving the band-aid.

5. **Direct `fetch` in `SupplierTable.tsx`.** Its delete handler calls `fetch` directly instead of going through `api/client.ts`, violating `.claude/rules/react-components.md` and `frontend/src/components/CLAUDE.md`. Fix: route the delete through `api.suppliers.delete()` via a callback prop.

---

## 13. Timing cheat sheet

| Segment | Minutes |
| --- | --- |
| Frame the session | 2 |
| Memory hierarchy | 5 |
| Path-scoped rules | 5 |
| Skills that fork | 5 |
| Legacy command | 3 |
| Hooks (enforce + automate) | 5 |
| MCP live vs guess | 5 |
| Agents | 5 |
| Fix the crash live | 5 |
| CLI-only demos (sessions + headless) | 10 |
| Participant extensions | remainder |

Trim by dropping the optional `explore-schema` fork-removal (step 4) and the "before MCP connects" beat (step 7) if you're short.

---

## 14. Recovery notes (when a demo misbehaves)

| Symptom | Fix |
| --- | --- |
| MCP `inventory` stuck at "Pending approval" | Run `claude` interactively once, accept the workspace trust dialog. |
| `inventory_mcp.server` import error | Activate the backend venv **before** launching `claude`. |
| Hooks don't fire | `/hooks` to confirm registration; tail `.claude/instructions.log`. |
| A rule never loads | `/memory` to confirm discovery; check the `paths:` glob; check `.claude/instructions.log` for `path_glob_match`. |
| Crash demo already "fixed" from a prior run | `npm run seed` restores the `NULL`; revert the router edit. |
| Frontend can't reach backend | Both servers running? Vite proxy target is `http://localhost:8001`. |
| Git line-ending warnings (Windows) | `.gitattributes` forces `eol=lf`; `git config --global core.autocrlf false` and re-clone if needed. |
| `github` MCP warns at startup | Expected — missing PAT. Doesn't affect the workshop. |

Verified against Claude Code `2.1.212`. If you're on a newer CLI, run `claude --version` and note any behavior differences.
