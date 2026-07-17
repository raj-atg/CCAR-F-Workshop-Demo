# Participant Guide

Welcome. This is your start-to-finish guide for the Claude Code workshop. You don't need any prior Claude Code experience — just follow along. If a step doesn't work, jump to [Troubleshooting](#8-when-something-goes-wrong) at the bottom.

**The big idea:** the little inventory app in this repo is just *scaffolding*. The real subject of the workshop is the `.claude/` folder — the configuration that teaches Claude Code how to work inside *this specific* project. By the end you'll be able to add that same kind of configuration to your own repos.

---

## 1. What you'll be working on

A tiny factory **inventory manager**. Three things it tracks:

- **Suppliers** — companies you buy parts from.
- **Items** — parts in the warehouse (circuit boards, sensors, actuators, controllers), each with a stock count and a "reorder level."
- **Orders** — purchase orders for items.

It has a web page for each (a table you can add/edit/delete rows in) and a small API behind it. That's the whole app. Don't worry about mastering the app — you'll mostly be *asking Claude* to work on it.

---

## 2. Setup (do this once, before the workshop)

You need three things installed already: **Python 3.11+**, **Node 20+**, and **Claude Code**. Check:

```
python --version
node --version
claude --version
```

If `claude` isn't found, install it: `npm install -g @anthropic-ai/claude-code`.

> **On a company gateway/proxy instead of a personal login?** Read `SETUP-PROXY.md` first — you authenticate with environment variables, not `claude login`. Everything else in this guide is identical.

Now set up the app. Copy-paste the block for your OS:

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

The last line (`npm run seed`) fills the database with sample data. You should see `Seeded 4 suppliers, 10 items, 10 orders.`

### Start the app (two terminals)

**Terminal 1 — backend** (make sure the venv is active — you should see `(.venv)` in the prompt):
```
cd backend
uvicorn app.main:app --port 8001 --reload
```

**Terminal 2 — frontend:**
```
npm run dev --prefix frontend
```

Open **http://localhost:3000**. You should see the Items page with 10 rows. That's it — you're ready.

> Leave both terminals running during the workshop. You'll run `claude` in a *third* terminal.

---

## 3. The 30-second mental model of `.claude/`

When you run `claude` inside this folder, it automatically reads configuration that lives alongside the code. Five kinds, from simplest to most powerful:

| Thing | Plain-English meaning | Lives in |
| --- | --- | --- |
| **CLAUDE.md** | "Notes to Claude" about the project — commands, rules, conventions. There are several, nested by folder. | `CLAUDE.md` and deeper folders |
| **Rules** | Notes that only apply to *certain files* (e.g. only test files). | `.claude/rules/` |
| **Skills** | Reusable prompts you trigger with `/name`. | `.claude/skills/` |
| **Agents** | Specialized "helpers" with limited tools (e.g. a reviewer that can read but not edit). | `.claude/agents/` |
| **Hooks** | Automatic actions that run around Claude's tools (e.g. auto-format after every edit). | `.claude/hooks/` |
| **MCP** | A live connection to the real database, so Claude can query actual data. | `.mcp.json`, `mcp/` |

You don't have to memorize this — the demos will show each one in action.

---

## 4. What you'll watch the instructor demo

Follow along; you'll repeat these yourself in Section 5. For each, the point to notice is in **bold**.

1. **Memory hierarchy** — Open a file deep in `frontend/src/components/`, then run `/memory`. **Notice:** the deep `CLAUDE.md` appears only *after* you touched that folder — Claude doesn't load everything up front.

2. **Path-scoped rules** — Open a test file, then a router file, then look at `.claude/instructions.log`. **Notice:** the testing rule fired for the test file and the API rule fired for the router — each rule loads only for the files it's scoped to.

3. **A skill that forks** — Run `/explore-schema Item`. It traces the `Item` entity across the whole codebase. **Notice:** it runs in a separate "forked" context so all that detail doesn't clog your main conversation.

4. **A hook that *enforces*, not just asks** — Ask Claude to edit `backend/app/db/models.py`. **Notice:** a hook *blocks* the edit and explains the safe procedure. A CLAUDE.md note is a request; a hook is a guarantee.

5. **A command that runs code first** — Run `/low-stock`. **Notice:** the list of low-stock items is already filled in *before* Claude starts talking — the command ran a script and injected the result.

6. **MCP: guessing vs. knowing** — Ask "which items need reordering?" **Notice:** with the `inventory` MCP server connected, Claude queries the *real* database instead of guessing from the seed file.

7. **Why CI needs `-p`** — Watch `claude "Review this PR"` hang waiting for input, then see `npm run ci-review` (which uses `-p`) run to completion. **Notice:** headless mode (`-p`) is what makes Claude usable in automation.

8. **Sessions** — naming, resuming, and forking a conversation two different ways. **Notice:** you can branch one shared analysis into two independent attempts.

---

## 5. Your hands-on exercises

Open **`EXERCISES.md`** and work through the numbered exercises. Each one tells you the goal, the exact steps, what you should see, and how to check you got it right. Do them roughly in order.

Rough map of what they cover:

- **1–3** Sessions: naming (`-n`), resuming (`--resume`), and forking (`--fork-session`, `/fork`).
- **4** Plan mode: feel when it's overkill and when it's worth it.
- **5** Write your *own* skill (`explain-order-flow`), modeled on an existing one.
- **6** Personal vs. project commands — why `~/.claude/` never reaches teammates.
- **7** Write a path-scoped rule and *prove* it only loads for matching files.
- **8** Add a restricted agent that can look but not touch.
- **9** Add a new tool to the MCP server.
- **10** Write a hook that blocks "done" until tests pass.

### Bonus: fix a real bug with Claude

This repo has **five deliberate flaws** planted in it. The most fun one to fix first:

> **The low-stock crash.** In your browser, the low-stock feature is broken. Ask Claude: *"GET /api/items/low-stock returns a 500 error. Find out why and fix it, then add a test so it can't regress."* Watch how it reads the stack trace, finds the `NULL` reorder level, adds a null check, and writes a test.

The other four (a confusing rename, an untested file, an inconsistent date format, and a rule violation in the frontend) are described in `EXERCISES.md`. Try to find them before peeking at the spoilers.

---

## 6. A cheat sheet of commands you'll use

| You want to… | Run |
| --- | --- |
| Start Claude in this project | `claude` |
| Ask one thing and quit (headless) | `claude -p "your question"` |
| Name a session so you can find it later | `claude -n my-session-name` |
| Resume the most recent session | `claude --continue` |
| Resume a specific named session | `claude --resume my-session-name` |
| See what memory/rules loaded | `/memory` (inside Claude) |
| See which hooks are active | `/hooks` (inside Claude) |
| See MCP server status | `/mcp` (inside Claude) |
| Run a skill | `/explore-schema Item`, `/add-entity`, `/review-endpoint <file>` |
| Run the legacy command | `/low-stock` |
| Re-fill the database | `npm run seed` |
| Run the tests | `pytest` (backend) · `npm test --prefix frontend` |

---

## 7. How the app is laid out (for when an exercise sends you into the code)

You mostly won't edit code by hand — you'll ask Claude to. But when you need to *find* something:

- **A page in the browser** (e.g. Items) → `frontend/src/pages/ItemsPage.tsx` and its table in `frontend/src/components/ItemTable.tsx`.
- **All the web/API calls** → they all go through one file: `frontend/src/api/client.ts`.
- **An API endpoint** (e.g. `/api/items`) → `backend/app/routers/items.py`.
- **The database shape** → `backend/app/db/models.py` (and the sample data in `seed.py`).
- **The tests** → backend in `backend/tests/`, frontend right next to each component (`ItemTable.test.tsx` beside `ItemTable.tsx`).

---

## 8. When something goes wrong

| Symptom | Fix |
| --- | --- |
| Browser page is blank or "can't reach backend" | Make sure **both** terminals (backend on 8001, frontend on 3000) are still running. |
| `uvicorn: command not found` or import errors | The virtual environment isn't active. Re-run the `activate` line from Section 2 in that terminal. |
| `npm run seed` fails | Activate the backend venv first, then re-run it. |
| MCP server shows "Pending approval" | Run `claude` once interactively and accept the trust prompt for this folder. |
| `github` MCP server shows a warning | Expected — it needs a GitHub token you probably don't have. Ignore it; it doesn't affect the workshop. |
| A hook or rule "doesn't seem to fire" | Run `/hooks` and `/memory` inside Claude to confirm they're loaded; check `.claude/instructions.log`. |
| Claude blocked your edit to `models.py` | That's the `protect-models` hook doing its job — follow the procedure it prints. |

Still stuck? Ask your instructor, or ask Claude itself: *"Why isn't `<thing>` working in this project?"* — it can read its own configuration.

---

Have fun. The goal isn't to finish every exercise — it's to leave knowing how to make Claude Code genuinely useful inside a real repository.
