# Inventory Workshop

## 1. What this is

A hands-on baseline for a mini Claude Code workshop, built for Claude Certified Architect Foundations training. The app — a small factory inventory manager — is scaffolding. The `.claude/` configuration layer is the actual product: every artifact in it is something a working engineer would genuinely add to this codebase, not a demo prop. This is not production code; don't copy the app's simplicity assumptions (no auth, no pagination) into a real project without reconsidering them.

Format: the instructor demos a feature live, participants repeat it and extend it. Guides: `instructor.md` (full instructor script, faults, and timing), `PARTICIPANTS.md` (start-to-finish participant walkthrough with all exercises), and `VSCODE-STEPS.md` (the 14-step VS Code-extension path). Instructors typically drive from the Claude Code CLI; participants from the VS Code extension.

## 2. Quickstart

Clone the repo, then:

<table>
<tr><th>Windows (PowerShell)</th><th>macOS</th></tr>
<tr><td>

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..
npm install --prefix frontend
npm run seed
```

</td><td>

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
npm install --prefix frontend
npm run seed
```

</td></tr>
</table>

### Confirm you're ready

Before starting the app, run the readiness check from the repo root:

```
npm run doctor
```

It verifies Python 3.11+, Node 20+, npm, the Claude Code CLI, the backend virtualenv and its dependencies, the frontend `node_modules`, the seeded database, and the `.claude/` config files — then prints a clear pass/fail summary. Exit code `0` means ready; `1` means at least one required check failed (each failure prints the exact command to fix it). `node scripts/doctor.js --doctor` is accepted as an alias.

### Run the app

In **two terminals** (**with the venv active** in the backend terminal — see Troubleshooting):

```
# Terminal 1 (backend/, venv active)
uvicorn app.main:app --port 8001 --reload

# Terminal 2 — from the repo root (no cd needed)
npm run dev --prefix frontend
```

Open http://localhost:3000. The API is at http://localhost:8001 (interactive docs at http://localhost:8001/docs).

**Stop the app** with `Ctrl+C` in each terminal. **Re-seed** the database anytime with `npm run seed` (drops and rebuilds it to exactly 4 suppliers / 10 items / 10 orders). Leave both servers running for the whole workshop; run `claude` in a *third* terminal.

## 3. The app

```
Supplier  id, name, contact_email, lead_time_days
    │ 1
    │
    │ N
Item      id, sku, name, category, quantity, reorder_level,
          unit_cost, supplier_id (FK), updated_at
    │ 1
    │
    │ N
Order     id, item_id (FK), quantity, status, placed_at
```

`Item.category`: `circuit_board | sensor | actuator | controller`. `Order.status`: `pending | shipped | delivered | backordered`.

**Endpoints** (all under `/api`, port 8001): `GET/POST /suppliers`, `GET/PATCH/DELETE /suppliers/{id}`, same shape for `/items` and `/orders`, plus `GET /items/low-stock` (items where `quantity <= reorder_level`). Interactive API docs at http://localhost:8001/docs.

**Frontend**: three pages (Items, Suppliers, Orders), each a table + create/edit form + delete. React Router, plain CSS, one shared `frontend/src/api/client.ts` wrapping `fetch`.

**Backend layering** is strictly one-way — `router → schema → model`. A router depends on `get_db`, accepts/returns a Pydantic schema, and reads/writes the SQLAlchemy model internally; it never returns a raw model. This is the rule the whole `.claude/` memory hierarchy reinforces.

The seeded database has exactly 4 suppliers, 10 items, and 10 orders. Re-seed anytime with `npm run seed`. The DB file (`backend/inventory.db`) is **not** committed — it's generated from `seed.py`, so anyone reproduces it byte-for-byte with the seed command.

### Source-tree map

```
backend/
  app/
    main.py               FastAPI app, router registration, CORS
    db/
      models.py           SQLAlchemy models (Supplier, Item, Order)   ← protected by a hook
      session.py          engine + SessionLocal + get_db, reads INVENTORY_DB_PATH
      seed.py             drops/recreates schema, inserts 4/10/10
    schemas/              Pydantic v2 schemas: Base/Create/Update/Out per entity
    routers/              items.py, orders.py, suppliers.py  (one CRUD router each)
  tests/                  pytest + conftest fixtures (in-memory SQLite, StaticPool)
frontend/
  src/
    api/client.ts         the ONLY place fetch is called; normalizes date formats
    pages/                ItemsPage, SuppliersPage, OrdersPage (own data fetching)
    components/           tables + forms (presentational, props in/callbacks out)
    App.tsx               React Router routes + nav
mcp/inventory_mcp/        FastMCP stdio server exposing the live DB read-only
scripts/                  cross-platform Node runners (doctor, seed, ci-review, low-stock)
schemas/                  JSON Schema for CI review findings
```

## 4. What's here and why

### Claude Code features demonstrated (at a glance)

Every major configuration surface of Claude Code is exercised by something real in this repo:

| Feature area | Where it lives | One-line demo |
| --- | --- | --- |
| **Memory hierarchy** (4 levels) | `CLAUDE.md`, `backend/CLAUDE.md`, `backend/app/db/CLAUDE.md`, `frontend/CLAUDE.md`, `frontend/src/components/CLAUDE.md` | Deeper files load lazily only when you touch that directory. |
| **`@import`** | root `CLAUDE.md` → `standards/*.md` | Style rules kept out of the file people read most. |
| **Path-scoped rules** | `.claude/rules/*.md` with `paths:` frontmatter | A rule fires only for files matching its glob. |
| **Skills** | `.claude/skills/{explore-schema,add-entity,review-endpoint}/` | `context: fork`, `argument-hint`, `allowed-tools`, `disable-model-invocation`. |
| **Legacy commands** | `.claude/commands/low-stock.md` | Old `/command` form + `` !`cmd` `` dynamic injection still works. |
| **Subagents** | `.claude/agents/{db-explorer,api-reviewer,test-writer}.md` | Tool restriction, read-only vs write-capable, `model:` selection. |
| **Hooks** | `.claude/hooks/*.js` + `.claude/settings.json` | `PostToolUse` format, `PreToolUse` deny-with-reason, `InstructionsLoaded` logging. |
| **MCP** | `.mcp.json` + `mcp/inventory_mcp/server.py` | Project-scoped stdio server exposing the live DB read-only. |
| **Headless / CI** | `scripts/ci-review.js` + `.github/workflows/claude-review.yml` | `-p`, `--output-format json`, `--json-schema` → inline PR comments. |
| **Sessions** | `PARTICIPANTS.md` CLI-only exercises | `-n`, `--continue`, `--resume`, `--fork-session`, `/fork`. |
| **Plan mode** | `PARTICIPANTS.md` CLI-only exercises | When ceremony is wasted vs. worth it. |
| **Gateway/proxy auth** | `SETUP-PROXY.md` | Running through LiteLLM with env-var auth. |

Verified live against Claude Code `2.1.212` — see §9.

### Why each artifact earns its place

Every `.claude/` artifact below is something this specific codebase needs — not a demo prop. If you wouldn't add it to a real project, it shouldn't be here.

| File | What it demonstrates | Why this project genuinely needs it |
| --- | --- | --- |
| `CLAUDE.md` (root) | Project-scope memory, `@import` | Every session needs the run/test/seed commands and the router→schema→model rule; imports keep style rules out of the file participants read most. |
| `backend/CLAUDE.md` | Directory-scope memory | Backend layering and endpoint-adding steps only matter once you're touching `backend/`; loads lazily instead of bloating every session. |
| `backend/app/db/CLAUDE.md` | Deep directory-scope memory | The schema-change procedure (models → seed → schemas) is the single highest-risk workflow in this repo; it needs to be exactly where the risky file lives. |
| `frontend/CLAUDE.md` | Directory-scope memory | Documents the api-client contract (why `fetch` is centralized) — the reason isn't obvious from reading `client.ts` alone. |
| `frontend/src/components/CLAUDE.md` | 4th-level nested memory | Component-specific conventions (props typing, no direct fetch) that don't apply to pages one level up. |
| `standards/python-style.md`, `react-style.md`, `git-workflow.md` | `@import` | Style rules and commit conventions nobody wants inline in every CLAUDE.md; imported once, referenced everywhere. |
| `.claude/rules/testing.md` | Path-scoped rule, glob across directories | Tests are colocated beside source, scattered across `components/` and `pages/` — no single directory CLAUDE.md could cover them. The canonical case for a glob rule. |
| `.claude/rules/api-conventions.md` | Path-scoped rule | Response-shape and date-format rules only matter inside `routers/`; scoping them keeps them out of context when you're editing the frontend. |
| `.claude/rules/db-schema.md` | Path-scoped rule (deliberately overlapping) | Same procedure as `db/CLAUDE.md`, on purpose — compare the two to see that a stable directory is better served by a CLAUDE.md than a glob. |
| `.claude/rules/react-components.md` | Path-scoped rule (deliberately overlapping) | Same content as `components/CLAUDE.md`, on purpose — same lesson as above, from the frontend side. |
| `.claude/skills/explore-schema/SKILL.md` | `context: fork`, `agent: Explore` | Tracing an entity across 6+ files is exactly the "verbose, one-time lookup" that should never live in the main conversation. |
| `.claude/skills/add-entity/SKILL.md` | `argument-hint`, `allowed-tools` | A 4th entity is the most likely thing a participant adds; this is the literal template to copy. |
| `.claude/skills/review-endpoint/SKILL.md` | `disable-model-invocation: true` | A conventions check should run when you ask for it, not whenever Claude thinks a router "looks done." |
| `.claude/commands/low-stock.md` | Legacy command form, `` !`cmd` `` injection | Proves `.claude/commands/` still works next to `.claude/skills/`, and shows dynamic injection running before Claude ever sees the prompt. |
| `.claude/agents/db-explorer.md` | Subagent + MCP tool restriction, `model: haiku` | Schema/data questions are cheap and frequent; routing them to a small model with only MCP read tools keeps cost and blast radius down. |
| `.claude/agents/api-reviewer.md` | Read-only subagent | A reviewer that can't `Edit` is a real constraint you want — it can't "fix" what it's supposed to only report. |
| `.claude/agents/test-writer.md` | Write-capable subagent | Explicit contrast with `api-reviewer`: this repo has a genuinely untested router (`suppliers.py`), and this agent's whole job is filling that gap. |
| `.claude/hooks/format-on-write.js` | `PostToolUse` hook | Nobody wants to remember to run the formatter after every edit; this is the automation a real team would wire up on day one. |
| `.claude/hooks/protect-models.js` | `PreToolUse` hook, deny + reason | `models.py` is the one file where "usually follows the CLAUDE.md procedure" isn't good enough — this is the guarantee, not the request. |
| `.claude/hooks/log-instructions.js` | `InstructionsLoaded` hook, async | Makes the entire CLAUDE.md hierarchy and rule-loading system observable; also the best debugging tool when a participant's rule doesn't fire. |
| `.mcp.json` (`inventory` server) | Project-scoped stdio MCP | Without it, "which items need reordering" is answered by guessing from `seed.py`. With it, Claude queries the real, current database. |
| `mcp/inventory_mcp/server.py` | MCP tool design (3 non-overlapping tools) | `get_schema`, `query_inventory` (SELECT-only, server-enforced), `low_stock_report` — each answers a different class of question with no overlap. |
| `schemas/review-findings.schema.json` + `scripts/ci-review.js` | `-p`, `--output-format json`, `--json-schema` | CI needs machine-parseable findings to post inline PR comments; unstructured text can't drive that. |
| `.github/workflows/claude-review.yml` | Gated CI integration | Runs automated review on PRs without breaking CI for a fork that hasn't configured the secret. |

Two extra MCP servers (`playwright`, `github`) are also configured in `.mcp.json` beyond the app's own needs, added at the requester's explicit request — see "Known version notes" below for why they don't meet the same bar as `inventory`.

## 5. Instructor demo script

Budget ~45 minutes. Failure-first beats are marked — let the failure happen before showing the fix; that's what participants remember.

| Time | Beat | Do this | Point at |
| --- | --- | --- | --- |
| 5 min | CLAUDE.md hierarchy | Open a file under `frontend/src/components/`. Run `/memory`. | The nested file appears only after you touched that directory — not at session start. |
| 5 min | Path-scoped rules | Open `ItemTable.test.tsx`, then open `routers/items.py`. Tail `.claude/instructions.log`. | `testing.md` fires for the test file; `api-conventions.md` fires for the router; neither fires for the other. |
| 5 min | `explore-schema` fork contrast | Run `/explore-schema Item`. Then remove `context: fork` from the SKILL.md frontmatter and run it again. | Main session context usage before/after — the flood is the lesson. Restore the line after. |
| 5 min | Hook: instruction vs enforcement | Ask Claude to edit `models.py` directly without mentioning the procedure. Watch it usually follow `db/CLAUDE.md` anyway. Then explicitly try to bypass the convention. | The `PreToolUse` deny message — "usually" isn't a guarantee, the hook is. |
| 5 min | `low-stock` command | Run `/low-stock`. | `` !`cmd` `` output already inlined before Claude's response starts. |
| 5 min | MCP before/after | Ask "which items need reordering" with `.mcp.json` server disconnected (or ask before it connects). Then ask again once `/mcp` shows it connected. | Guessing from `seed.py` vs a live query result. |
| 5 min | `-p` hang, then fix | Run `claude "Review this PR"` interactively and watch it wait on you. Then run `npm run ci-review`. | The hang is real — that's why CI always needs `-p`. |
| 5 min | Session resume lab | Follow the CLI-only exercises in `PARTICIPANTS.md`: `-n`, `--resume`, `--fork-session`, `/fork`. | Two divergent branches from one shared analysis, neither polluting the other. |
| 5 min | User vs project CLAUDE.md | Add a line to `~/.claude/CLAUDE.md` (personal). Explain it never reaches a teammate who clones the repo — only `./CLAUDE.md` does. | The scope table in `docs/memory` — user vs project. |

## 6. Participant exercises

**Participants: start with `PARTICIPANTS.md`** — a plain-language, start-to-finish walkthrough of setup, every demo you'll watch, and every hands-on task (numbered, self-checkable, covering every runtime feature above plus extension tasks: write a new skill, add a 4th agent, add a 4th MCP tool, write a `Stop` hook). VS Code-extension users can follow the condensed 14-step `VSCODE-STEPS.md` instead. Full instructor spoilers for the five seeded flaws live in `instructor.md`.

### The five seeded flaws (instructors)

The repo ships with five deliberate, non-fatal flaws — the raw material for the "find it, then fix it with Claude" exercises. Full diagnoses are in `instructor.md`'s seeded-faults section; the one-line map:

| # | Flaw | Surfaces as |
| --- | --- | --- |
| 1 | `SN-2002` has `reorder_level = NULL` | `GET /api/items/low-stock` returns **HTTP 500** (null comparison crash) |
| 2 | `Item.quantity` vs `Order.quantity` name collision | Confusing rename touching ~10 files across both stacks — the plan-mode lesson |
| 3 | `suppliers.py` has full CRUD but **zero tests** | A coverage gap `test-writer` exists to fill |
| 4 | `orders` returns `placed_at` as a **Unix timestamp** | Violates `api-conventions.md`; frontend compensates in `client.ts` |
| 5 | `SupplierTable.tsx` calls `fetch` directly | Violates the "only `client.ts` calls fetch" rule |

### Pre-class smoke test (instructors)

Fastest check — one command that validates the whole environment:

```
npm run doctor
```

For a deeper baseline (actually exercising tests, seed, and the crash flaw):

```
# 1. Both test suites green
cd backend && pytest && cd ..
npm test --prefix frontend

# 2. Seed produces exactly 4/10/10
npm run seed

# 3. Flaw #1 is live (expect HTTP 500)
#    (start uvicorn first, then:)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8001/api/items/low-stock

# 4. CLI sees the project config
claude --version
claude mcp list          # inventory/playwright/github all listed
```

Expected: 8 backend + 9 frontend tests pass, seed prints `4 suppliers, 10 items, 10 orders`, low-stock returns `500`, and `claude mcp list` shows the three project servers (github will warn about a missing PAT — that's expected).

## 7. Running through an LLM gateway

If you reach Claude Code through a LiteLLM gateway instead of a direct login, see `SETUP-PROXY.md`. Short version: everything client-side (CLAUDE.md, rules, skills, hooks, agents, MCP, plan mode, `--resume`) behaves identically either way.

## 8. Troubleshooting

| Symptom | Fix |
| --- | --- |
| MCP server stuck at `⏸ Pending approval` | Run `claude` interactively once in this directory and accept the workspace trust dialog. |
| `inventory_mcp.server` can't be found / import errors | Activate the backend venv **before** launching `claude` — the MCP server inherits the shell's environment, not the other way around. |
| Hooks don't seem to fire | Run `/hooks` to confirm all three are registered, then tail `.claude/instructions.log` (create it by triggering any tool use) to see what actually ran. |
| A path-scoped rule never loads | Run `/memory` to confirm the rule file is discovered, check the `paths:` glob syntax, and check `.claude/instructions.log` for a `path_glob_match` entry. |
| Frontend can't reach the backend | Confirm both servers are running and that `vite.config.ts`'s proxy target (`http://localhost:8001`) matches where uvicorn is bound. |
| Git line-ending warnings on Windows | `.gitattributes` forces `eol=lf`; if you still see warnings, run `git config --global core.autocrlf false` and re-clone. |

## 9. Known version notes

Built and verified against **Claude Code `2.1.212`** and the current hosted documentation. The repo was audited end-to-end against a live install of that version: headless `-p` runs, `--output-format json`, `--json-schema` structured output (the CI mechanism), `.mcp.json` parsing of all three servers, project-memory loading, and skill/command discovery were all confirmed working. If you're on a newer CLI, re-run `claude --version` and note any behavior differences here.

Divergences found against stale/common assumptions, corrected in this repo:

- The `--json-schema` CLI flag takes the schema **inline as a JSON string**, not a file path. `scripts/ci-review.js` reads `schemas/review-findings.schema.json` and passes its contents inline rather than passing the path directly.
- `CLAUDE_PROJECT_DIR` is not set in Claude Code's own environment (only in spawned hooks/MCP servers), so every reference to it in `.mcp.json` and `.claude/settings.json` uses the `${CLAUDE_PROJECT_DIR:-.}` default form.
- Exit code 2 blocks a `PreToolUse` hook; exit code 1 does not. `protect-models.js` uses the JSON `permissionDecision: "deny"` form with exit 0, per the current hooks reference, rather than relying on a nonzero exit code.
- `.claude/commands/` still works standalone and is not superseded by `.claude/skills/` — both produce a `/name` command; `low-stock.md` deliberately stays in the legacy form.
- `.mcp.json` includes two servers (`playwright`, `github`) beyond the app's own `inventory` server, added at the requester's explicit direction during the build rather than because the app needs them. Unlike `inventory`, they depend on a GitHub PAT and network-fetched `npx` packages, so a participant without those configured will see a connection warning at startup — this is expected, not a bug in the repo.
