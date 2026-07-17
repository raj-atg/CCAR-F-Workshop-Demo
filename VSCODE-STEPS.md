# VS Code Steps

This is the **VS Code extension** path through the workshop, written step by step. Everything here is done with the Claude Code panel inside VS Code — you never need a separate terminal for Claude itself. (You'll still use VS Code's built-in terminal a couple of times to run the app.)

A few workshop moments are driven from a command line that only the instructor has open. Those are called out as **"Watch the instructor"** — you follow along on screen rather than typing them yourself. Everything else below, you do.

> **Before you start:** make sure the app is installed and seeded (see the participant guide's setup section) and that the **Claude Code extension** is installed in VS Code. If the doctor check passed, you're ready.

---

## Step 1 — Open the project and the Claude Code panel

1. In VS Code: **File → Open Folder…** and select the `CCAR-F-Workshop-Demo` folder you cloned.
2. Open the Claude Code panel: click the **Claude** icon in the Activity Bar (left edge), or press **Cmd/Ctrl+Esc**.
3. If VS Code asks whether you **trust the authors** of this folder, choose **Trust** — Claude Code only loads the `.claude/` configuration in a trusted workspace.
4. When the panel asks you to sign in, complete the sign-in flow your instructor gave you (personal login, or the gateway settings from `SETUP-PROXY.md`).

**You should see:** a Claude chat panel docked in VS Code, ready for a prompt.

---

## Step 2 — Start the app (two VS Code terminals)

You only need the app running so you can see your changes land in the browser.

1. Open a terminal: **Terminal → New Terminal**.
2. **Backend** — in that terminal, activate the virtualenv and start the API:
   - Windows (PowerShell): `cd backend; .venv\Scripts\activate; uvicorn app.main:app --port 8001 --reload`
   - macOS/Linux: `cd backend && source .venv/bin/activate && uvicorn app.main:app --port 8001 --reload`
3. Open a **second** terminal (the **+** in the terminal panel) and start the frontend:
   - `npm run dev --prefix frontend`
4. Open **http://localhost:3000** in your browser.

**You should see:** the Items page with 10 rows. Leave both terminals running for the whole workshop.

---

## Step 3 — See the memory hierarchy load lazily

The `CLAUDE.md` files teach Claude about this project. There are several, nested by folder, and Claude loads the deeper ones **only when you touch that folder**.

1. In the Explorer, open a file deep in the tree: `frontend/src/components/ItemTable.tsx`.
2. In the Claude panel, type: `/memory`
3. Read the list of loaded memory files.

**You should see:** the deep `frontend/src/components/CLAUDE.md` now appears in the list — it wasn't loaded at startup, only after you opened a file in that folder. This is the whole point: Claude doesn't load everything up front.

---

## Step 4 — Watch a path-scoped rule fire (and not fire)

Rules in `.claude/rules/` apply only to files matching a glob. You'll prove it using the log the project writes.

1. Open `frontend/src/components/ItemTable.test.tsx` (a **test** file).
2. Open `backend/app/routers/items.py` (a **router** file).
3. Open `.claude/instructions.log`.

**You should see:** a `path_glob_match` entry for `testing.md` (fired for the test file) and one for `api-conventions.md` (fired for the router). Each rule loaded only for the files it's scoped to — not for the other.

---

## Step 5 — Run a skill that forks its own context

Skills are reusable prompts you trigger with `/name`. `explore-schema` traces an entity across the whole codebase, and it runs in a **forked** context so all that detail doesn't clog your main chat.

1. In the Claude panel, type: `/explore-schema Item`
2. Watch it trace `Item` through the model, schemas, router, and frontend.

**You should see:** a compact summary of where `Item` lives across the stack, without the main conversation filling up with every file it read — that's the fork doing its job.

---

## Step 6 — Run the legacy command that runs code first

`.claude/commands/low-stock.md` is an older-style `/command`. It runs a script and injects the result **before** Claude starts talking.

1. In the Claude panel, type: `/low-stock`

**You should see:** the list of low-stock items is already filled in at the top of the response, before Claude adds any commentary — the command executed a script and injected the output.

---

## Step 7 — Feel a hook *enforce* a rule (not just ask)

A `CLAUDE.md` note is a request Claude usually follows. A **hook** is a guarantee — it can block an action outright.

1. In the Claude panel, ask: `Add a field called notes to the Item model in backend/app/db/models.py`
2. Watch what happens when Claude tries to edit `models.py`.

**You should see:** the `protect-models` hook **blocks** the edit and prints the safe procedure (update `models.py` and `seed.py` together). Claude can't bypass it — that's the difference between a note and a hook.

---

## Step 8 — See a hook run automatically after an edit

The `format-on-write` hook runs the formatter after every file write, so you never have to remember to.

1. Ask Claude to make a tiny, safe change, e.g.: `Add a one-line comment at the top of backend/app/routers/suppliers.py explaining what this file does.`
2. After the edit, open the file.

**You should see:** the file is already formatted (`ruff format` ran automatically) — no manual formatting step. You can confirm the hook is registered by typing `/hooks` in the panel.

---

## Step 9 — Ask a question against the *live* database (MCP)

The `inventory` MCP server gives Claude a live, read-only connection to your actual database — so it answers from real data instead of guessing from the seed file.

1. Confirm the server is connected: type `/mcp` in the panel and check that `inventory` shows as connected.
2. Ask: `Which items currently need reordering?`

**You should see:** Claude query the real database (via the MCP tools) and return the current low-stock items — not a guess based on `seed.py`. If you've edited stock levels in the browser, the answer reflects *those* edits.

> If `inventory` shows **Pending approval**, accept the trust prompt in the panel, then retry.

---

## Step 10 — Use a restricted, read-only agent

Agents are specialized helpers with limited tools. `db-explorer` can read the database but nothing else; `api-reviewer` can read code but can't edit it.

1. Ask: `Use the db-explorer agent to tell me which suppliers have the most items below reorder level.`
2. Then ask: `Use the api-reviewer agent to review backend/app/routers/orders.py against our API conventions.`

**You should see:** `db-explorer` answers from the live DB; `api-reviewer` reports an issue (the `orders` endpoint returns `placed_at` as a Unix timestamp, which violates the API conventions) but **does not edit** anything — a reviewer that can only report is exactly the constraint you want.

---

## Step 11 — Fix a real bug with Claude (the low-stock crash)

This repo has a deliberately planted bug. Let Claude diagnose and fix it end to end.

1. In your browser, note that the low-stock feature is broken (the endpoint returns a 500).
2. In the Claude panel, ask: `GET /api/items/low-stock returns a 500 error. Find out why and fix it, then add a test so it can't regress.`
3. Approve the edits when Claude asks.

**You should see:** Claude read the stack trace, find the `NULL` reorder level on `SN-2002`, add a null check in `backend/app/routers/items.py`, and write a regression test. Reload the low-stock view in the browser to confirm it works now.

---

## Step 12 — Write your own skill

Now you author a skill, modeled on an existing one.

1. Open `.claude/skills/explore-schema/SKILL.md` and read its structure (frontmatter + prompt body).
2. Ask Claude: `Create a new skill at .claude/skills/explain-order-flow/SKILL.md, modeled on explore-schema, that traces how an Order moves from OrdersPage.tsx through the API to the database and back. Decide whether it needs context: fork and explain your choice in a comment.`
3. Run your new skill: `/explain-order-flow`

**You should see:** a working `/explain-order-flow` skill that traces the Order flow. Whether you kept `context: fork` should match how verbose the trace is — that's the judgment call.

---

## Step 13 — Add a restricted agent of your own

Practice the tool-restriction pattern yourself.

1. Ask Claude: `Create .claude/agents/order-auditor.md with tools: Read, Grep, Glob (read-only). Its job is to check order data for anomalies, like orders that reference a deleted item. Model it on api-reviewer.md.`
2. Then ask: `Use the order-auditor agent to check for orphaned orders.`
3. Finally ask it to **fix** anything it finds.

**You should see:** the agent can read and grep to find problems but **cannot** fix them — `Edit`/`Write` aren't in its tools list, so it can only report. That restriction is the lesson.

---

## Step 14 — Explore the config, then reset

Wrap up by seeing how the pieces fit, and reset your database for a clean slate.

1. Ask Claude: `Give me a tour of the .claude/ folder — what each rule, skill, agent, and hook does and why this project has it.`
2. Skim its answer against the actual files in `.claude/`.
3. When you're done experimenting, reset the database in a terminal: `npm run seed`

**You should see:** `Seeded 4 suppliers, 10 items, 10 orders.` — a clean slate. You've now touched every major Claude Code configuration surface from inside VS Code.

---

## Watch the instructor (CLI-only moments)

A few features are demonstrated from the command line by the instructor. You don't run these — just watch what they show:

- **Sessions** — naming a session, resuming the most recent one, resuming a specific one by name, and forking one analysis into two independent branches.
- **Headless / CI** — asking Claude one question and having it answer without a prompt waiting for input, which is what makes Claude usable in automation and pull-request review.

The *ideas* transfer to the extension even though the exact commands are CLI-only — that's why they're worth watching.

---

## If something doesn't look right

| What you see | What to do |
| --- | --- |
| Browser page blank / "can't reach backend" | Make sure both terminals (backend on 8001, frontend on 3000) are still running. |
| Claude panel won't load `.claude/` config | Reopen the folder and choose **Trust** when prompted. |
| `inventory` MCP shows "Pending approval" | Accept the trust prompt in the panel, then retry the question. |
| A hook or rule "doesn't fire" | Type `/hooks` and `/memory` in the panel to confirm they loaded; check `.claude/instructions.log`. |
| Claude blocked your edit to `models.py` | That's the `protect-models` hook working — follow the procedure it printed. |

Still stuck? Ask your instructor, or ask Claude itself: *"Why isn't `<thing>` working in this project?"* — it can read its own configuration.
