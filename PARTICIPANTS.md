# Participant Guide

Your complete, start-to-finish guide for the Claude Code workshop — setup, every demo you'll watch, and every hands-on task, in order. No prior Claude Code experience needed. If a step doesn't work, jump to [When something goes wrong](#8-when-something-goes-wrong).

**Two ways to drive Claude Code:**
- **VS Code extension** — the Claude Code panel inside VS Code. If that's you, you can follow the short, screenshot-friendly path in **`VSCODE-STEPS.md`** instead of the exercise details here — but read Sections 1–3 first for context.
- **Command line (CLI)** — running `claude` in a terminal. A few tasks below are **CLI-only**; if you're on the extension, you'll watch the instructor demo those (they're marked **⌨️ CLI-only**).

**The big idea:** the little inventory app in this repo is just *scaffolding*. The real subject is the `.claude/` folder — the configuration that teaches Claude Code how to work inside *this specific* project. By the end you'll be able to add that same configuration to your own repos.

---

## 1. What you'll be working on

A tiny factory **inventory manager**:

- **Suppliers** — companies you buy parts from.
- **Items** — parts in the warehouse (circuit boards, sensors, actuators, controllers), each with a stock count and a "reorder level."
- **Orders** — purchase orders for items.

Each has a web page (a table you can add/edit/delete rows in) and a small API behind it. You'll mostly be *asking Claude* to work on it, not editing by hand.

**Your edits are real and persist.** Changing a row in the browser writes to your local `backend/inventory.db`. That's fine — the DB file is `.gitignore`d, so nothing you do in the UI reaches version control. Reset to a clean slate anytime:

```
npm run seed
```

This rebuilds the database to exactly 4 suppliers, 10 items, and 10 orders.

---

## 2. Setup (do this once, before the workshop)

You need **Python 3.11+** and **Node 20+**. Extension users also need the **Claude Code extension** installed in VS Code; CLI users need the CLI (`npm install -g @anthropic-ai/claude-code`).

```
python --version
node --version
```

> **On a company gateway/proxy instead of a personal login?** Read `SETUP-PROXY.md` first — you authenticate with environment variables, not a login step. Everything else is identical.

Install the app — copy the block for your OS:

**Windows (PowerShell):**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..
npm install --prefix frontend
npm run seed
```

**macOS / Linux:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
npm install --prefix frontend
npm run seed
```

`npm run seed` should print `Seeded 4 suppliers, 10 items, 10 orders.`

### Confirm you're ready (one command)

From the repo root:

```
npm run doctor
```

It checks everything at once — Python, Node, dependencies, the seeded database, and the `.claude/` config — and tells you plainly:

```
✓ You're ready for the workshop.
```

Any red `✗` prints the exact command to fix it. **Don't move on until doctor is green.**

### Start the app (two terminals)

**Terminal 1 — backend** (venv active — you should see `(.venv)`):
```
cd backend
uvicorn app.main:app --port 8001 --reload
```

**Terminal 2 — frontend:**
```
npm run dev --prefix frontend
```

Open **http://localhost:3000** — the Items page with 10 rows. Leave both running the whole workshop.

- **CLI users:** run `claude` in a *third* terminal.
- **Extension users:** open the folder in VS Code (**File → Open Folder**), open the Claude panel (**Cmd/Ctrl+Esc**), and **Trust** the workspace when prompted.

---

## 3. The 30-second mental model of `.claude/`

When Claude Code runs inside this folder, it reads configuration that lives alongside the code:

| Thing | Plain-English meaning | Lives in |
| --- | --- | --- |
| **CLAUDE.md** | "Notes to Claude" — commands, rules, conventions. Several, nested by folder. | `CLAUDE.md` and deeper folders |
| **Rules** | Notes that apply only to *certain files* (e.g. only tests). | `.claude/rules/` |
| **Skills** | Reusable prompts you trigger with `/name`. | `.claude/skills/` |
| **Commands** | Older-style `/name` prompts; can run code first. | `.claude/commands/` |
| **Agents** | Specialized helpers with limited tools (e.g. read-but-not-edit). | `.claude/agents/` |
| **Hooks** | Automatic actions around Claude's tools (e.g. auto-format). | `.claude/hooks/` |
| **MCP** | A live connection to the real database. | `.mcp.json`, `mcp/` |

You don't have to memorize this — the demos show each in action.

---

## 4. What you'll watch the instructor demo

Follow along; you'll repeat most of these in Section 5. The point to notice is in **bold**.

1. **Memory hierarchy** — Open a file in `frontend/src/components/`, run `/memory`. **Notice:** the deep `CLAUDE.md` appears only *after* you touched that folder.
2. **Path-scoped rules** — Open a test file, then a router file, then look at `.claude/instructions.log`. **Notice:** each rule fires only for the files it's scoped to.
3. **A skill that forks** — `/explore-schema Item`. **Notice:** it runs in a separate "forked" context so the detail doesn't clog your main chat.
4. **A hook that enforces** — Ask Claude to edit `backend/app/db/models.py`. **Notice:** a hook *blocks* it. A CLAUDE.md note is a request; a hook is a guarantee.
5. **A command that runs code first** — `/low-stock`. **Notice:** the list is filled in *before* Claude starts talking.
6. **MCP: guessing vs knowing** — "Which items need reordering?" **Notice:** with `inventory` connected, Claude queries the *real* database.
7. **⌨️ CLI-only — Sessions** — naming, resuming, and forking a conversation. **Notice:** you can branch one analysis into two independent attempts.
8. **⌨️ CLI-only — Headless mode** — watch `claude "Review this PR"` hang, then see `npm run ci-review` (using `-p`) finish. **Notice:** `-p` is what makes Claude usable in automation.

---

## 5. Your hands-on exercises

Do these roughly in order. Each has a **Goal**, **Steps**, what to **Observe**, and how to **Check**.

> **How to run a prompt:** Extension users type it in the Claude panel. CLI users type it in `claude`. Slash commands like `/explore-schema` work in both.

### Exercise 1 — Run a skill that forks its context
**Goal:** see `context: fork` keep verbose output out of your main chat.
**Steps:**
1. Open `.claude/skills/explore-schema/SKILL.md` and skim it.
2. Run `/explore-schema Item`.
**Observe:** a compact summary of where `Item` lives, without every file it read landing in your conversation.
**Check:** your main context stayed small — the trace ran in a fork.

### Exercise 2 — The legacy command that runs code first
**Goal:** see a `/command` inject script output before Claude speaks.
**Steps:**
1. Run `/low-stock`.
**Observe:** the low-stock list is already at the top of the response, before any commentary.
**Check:** the numbers came from a script that ran first — not from Claude guessing.

### Exercise 3 — Feel a hook enforce a rule
**Goal:** experience the difference between a note and a guarantee.
**Steps:**
1. Ask: *"Add a field called `notes` to the Item model in `backend/app/db/models.py`."*
**Observe:** the `protect-models` hook **blocks** the edit and prints the safe procedure.
**Check:** Claude couldn't bypass it. Type `/hooks` to see all three hooks registered.

### Exercise 4 — Ask against the live database (MCP)
**Goal:** get an answer from real data, not the seed file.
**Steps:**
1. Type `/mcp` and confirm `inventory` is connected.
2. Ask: *"Which items currently need reordering?"*
3. (Bonus) Change a stock level in the browser, then ask again.
**Observe:** Claude queries the real DB; after your edit, the answer reflects it.
**Check:** the result matches what you see in the browser, not `seed.py`.

### Exercise 5 — Use a restricted, read-only agent
**Goal:** see tool restriction in action.
**Steps:**
1. Ask: *"Use the db-explorer agent — which suppliers have the most items below reorder level?"*
2. Ask: *"Use the api-reviewer agent to review `backend/app/routers/orders.py` against our API conventions."*
3. Ask api-reviewer to *fix* what it finds.
**Observe:** `api-reviewer` flags an issue (orders returns `placed_at` as a Unix timestamp) but **cannot edit** — `Edit`/`Write` aren't in its tools.
**Check:** it reports but never changes a file. That restriction is the point.

### Exercise 6 — Fix a real bug with Claude (the low-stock crash)
**Goal:** watch an end-to-end diagnosis and fix.
**Steps:**
1. In the browser, note the low-stock feature is broken (500 error).
2. Ask: *"GET /api/items/low-stock returns a 500 error. Find out why and fix it, then add a test so it can't regress."*
3. Approve the edits.
**Observe:** Claude reads the stack trace, finds the `NULL` reorder level on `SN-2002`, adds a null check in `backend/app/routers/items.py`, and writes a regression test.
**Check:** reload the low-stock view — it works. `pytest -k low_stock` passes.

### Exercise 7 — Write your own skill
**Goal:** model a new skill on `explore-schema`.
**Steps:**
1. Ask: *"Create `.claude/skills/explain-order-flow/SKILL.md`, modeled on explore-schema, that traces how an Order moves from `OrdersPage.tsx` through the API to the database and back. Decide whether it needs `context: fork` and explain the choice in a comment."*
2. Run `/explain-order-flow`.
**Observe:** if the trace is verbose, forking keeps it out of your main context; if you expect a short answer, forking is unnecessary overhead.
**Check:** the new command works and your `context: fork` choice matches how much output it produced.

### Exercise 8 — Write a path-scoped rule and prove it loads conditionally
**Goal:** use `.claude/instructions.log` to prove a rule only loads for matching files.
**Steps:**
1. Ask Claude to create `.claude/rules/pages.md` with `paths: ["frontend/src/pages/**/*.tsx"]` and any content.
2. Open `frontend/src/pages/ItemsPage.tsx`.
3. Open `backend/app/routers/items.py`.
4. Open `.claude/instructions.log`.
**Observe:** a `path_glob_match` entry for `pages.md` appears after step 2, but not after step 3.
**Check:** the log shows exactly one `pages.md` entry, timestamped after you opened the page file.

### Exercise 9 — Add a restricted agent of your own
**Goal:** practice the tool-restriction pattern from `api-reviewer.md`.
**Steps:**
1. Ask: *"Create `.claude/agents/order-auditor.md` with `tools: Read, Grep, Glob` (read-only), whose job is checking order data for anomalies like orders referencing a deleted item. Model it on api-reviewer.md."*
2. Ask: *"Use the order-auditor agent to check for orphaned orders."*
3. Ask it to *fix* what it finds.
**Observe:** it can read and grep but can't edit — it can only report.
**Check:** it's unable to fix anything, since `Edit`/`Write` aren't in its `tools` list.

### Exercise 10 — Add a fourth MCP tool
**Goal:** extend the MCP server.
**Steps:**
1. Ask Claude to add a `supplier_summary()` tool to `mcp/inventory_mcp/server.py` returning each supplier with its item count and total inventory value.
2. Reconnect: `/mcp` → reconnect (or restart Claude Code).
3. Ask: *"Summarize our suppliers by inventory value."*
**Observe:** `/mcp` now shows 4 tools on the `inventory` server instead of 3.
**Check:** the new tool's result matches a manual aggregation via `query_inventory`.

### Exercise 11 — Write a `Stop` hook that blocks on failing tests
**Goal:** enforce (not just request) that tests pass before Claude considers a task done.
**Steps:**
1. Ask Claude to write a `Stop` hook (Node, matching the existing hooks' pattern) that runs `pytest` and `npm test`, and on failure prints `{"decision": "block", "reason": "..."}` to stdout with exit 0. Wire it into `.claude/settings.json` under `"Stop"`.
2. Deliberately break a test, then let Claude try to finish a turn.
3. Fix the test.
**Observe:** with a failing test, Claude is told to continue instead of stopping; once fixed, the turn ends normally.
**Check:** the same hook flips from blocking to allowing based purely on test state.

### ⌨️ CLI-only exercises — watch the instructor

These use flags that only exist on the command line. Extension users: watch the instructor; the ideas transfer.

- **Session naming & resuming** — `claude -n <name>`, `claude --continue` (most recent), `claude --resume <name>` (specific). `--continue` follows recency; `--resume` targets a named session.
- **Forking a session two ways** — `claude --resume <name> --fork-session` branches one shared analysis into two independent sessions; `/fork <prompt>` forks the *conversation* into a background subagent while you keep working. `--fork-session` forks the session ID; `/fork` forks the conversation.
- **Plan mode vs direct execution** — try plan mode on the low-stock crash (overkill) vs. the `quantity` → `quantity_on_hand` rename (worth it — ~10 files, several valid approaches). The contrast is the lesson. *(Plan mode also exists in the extension — you can try this one yourself if time allows.)*
- **Headless / CI** — `claude "Review this PR"` hangs waiting for input; `npm run ci-review` uses `-p` and finishes. `-p` is what makes Claude usable in automation.

---

## 6. The five seeded flaws (find them, then fix them)

This repo has **five deliberate flaws**. You fixed #1 in Exercise 6 — try to find the rest before peeking:

| # | Flaw | Surfaces as |
| --- | --- | --- |
| 1 | `SN-2002` has `reorder_level = NULL` | `GET /api/items/low-stock` → HTTP 500 (fixed in Exercise 6) |
| 2 | `Item.quantity` vs `Order.quantity` name collision | A confusing rename touching ~10 files — the plan-mode lesson |
| 3 | `suppliers.py` has full CRUD but zero tests | A coverage gap the `test-writer` agent exists to fill |
| 4 | `/api/orders` returns `placed_at` as a Unix timestamp | Violates `api-conventions.md`; `client.ts` compensates |
| 5 | `SupplierTable.tsx` calls `fetch` directly | Violates the "only `client.ts` calls fetch" rule |

For 3, 4, and 5, ask Claude to find and fix them — e.g. *"Does every router have a test file? If not, use the test-writer agent to fill the gap,"* or *"Review `orders.py` against our API conventions and fix any violation properly."*

---

## 7. Cheat sheet

| You want to… | Do this |
| --- | --- |
| Check you're set up correctly | `npm run doctor` |
| Start the backend (venv active) | `cd backend` then `uvicorn app.main:app --port 8001 --reload` |
| Start the frontend | `npm run dev --prefix frontend` |
| See what memory/rules loaded | `/memory` |
| See which hooks are active | `/hooks` |
| See MCP server status | `/mcp` |
| Run a skill | `/explore-schema Item`, `/add-entity`, `/review-endpoint <file>` |
| Run the legacy command | `/low-stock` |
| Re-fill the database | `npm run seed` |
| Run the tests | `pytest` (backend) · `npm test --prefix frontend` |
| **CLI-only:** name a session | `claude -n my-session` |
| **CLI-only:** resume most recent | `claude --continue` |
| **CLI-only:** resume a named session | `claude --resume my-session` |
| **CLI-only:** ask one thing and quit | `claude -p "your question"` |

---

## 7b. How the app is laid out (when an exercise sends you into the code)

- **A page in the browser** (e.g. Items) → `frontend/src/pages/ItemsPage.tsx`, table in `frontend/src/components/ItemTable.tsx`.
- **All web/API calls** → one file: `frontend/src/api/client.ts`.
- **An API endpoint** (e.g. `/api/items`) → `backend/app/routers/items.py`.
- **The database shape** → `backend/app/db/models.py` (sample data in `seed.py`).
- **The tests** → backend in `backend/tests/`, frontend beside each component (`ItemTable.test.tsx`).

---

## 8. When something goes wrong

| Symptom | Fix |
| --- | --- |
| Browser page blank or "can't reach backend" | Make sure **both** terminals (backend 8001, frontend 3000) are running. |
| `uvicorn: command not found` or import errors | The virtualenv isn't active. Re-run the `activate` line from Section 2 in that terminal. |
| `npm run seed` fails | Activate the backend venv first, then re-run. |
| MCP server shows "Pending approval" | CLI: run `claude` once interactively and accept the trust prompt. Extension: accept the trust prompt in the panel. |
| `github` MCP shows a warning | Expected — it needs a GitHub token you probably don't have. Ignore it. |
| A hook or rule "doesn't fire" | Run `/hooks` and `/memory` to confirm they loaded; check `.claude/instructions.log`. |
| Claude blocked your edit to `models.py` | That's the `protect-models` hook working — follow the procedure it prints. |

Still stuck? Ask your instructor, or ask Claude: *"Why isn't `<thing>` working in this project?"* — it can read its own configuration.

---

Have fun. The goal isn't to finish every exercise — it's to leave knowing how to make Claude Code genuinely useful inside a real repository.
