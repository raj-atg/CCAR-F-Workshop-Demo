# Exercises

Each exercise: goal, steps, what you should observe, how to check you got it right. Work through them roughly in order — later exercises assume you've seen the CLAUDE.md hierarchy and rules from the instructor demo.

## 1. Session naming and resuming

**Goal**: understand the difference between `--continue` and `--resume <name>`.

**Steps**:
1. `claude -n schema-investigation` and prompt: "Trace how Item flows from the SQLAlchemy model to the ItemTable component. Don't change anything." Let it finish, then quit.
2. Start a second, unrelated session (any prompt), quit.
3. Run `claude --continue` — note which session it picks up.
4. Run `claude --resume schema-investigation` — note that this ignores recency and picks that specific session.

**Observe**: `--continue` always resumes the most recent session in this directory, regardless of name. `--resume <name>` targets a specific one.

**Check**: after `--resume schema-investigation`, ask "what was the last thing you told me?" — it should reference the Item trace, not the unrelated session.

## 2. Fork a session two ways

**Goal**: branch one shared analysis into two independent changes.

**Steps**:
1. `claude --resume schema-investigation --fork-session`. Prompt: "Rename `quantity` to `quantity_on_hand` using Edit across the stack." Let it work, then quit without saving further.
2. `claude --resume schema-investigation --fork-session` again (forking from the *original*, not branch A). Prompt: "Add a computed property instead, leaving the column name alone."
3. Compare: two independent branches, each with the shared Item-trace context but no knowledge of each other's changes.

**Observe**: both forks start from the same analysis but diverge into different implementations without polluting each other.

**Check**: `git diff` in each branch's working state shows a completely different approach to the same problem.

## 3. `/fork` vs `--fork-session`

**Goal**: distinguish forking the conversation from forking the session.

**Steps**:
1. In a live session, after some work, run `/fork draft the test cases for this rename` — this spawns a background subagent with your current context, while you keep working in the main session.
2. Compare with exercise 2's `--fork-session`, which creates an entirely new session ID from the CLI.

**Observe**: `/fork` forks the *conversation* into a subagent that runs alongside your current session. `--fork-session` forks the *session ID* itself, producing a separate resumable session.

**Check**: after `/fork`, your main session is still active and usable immediately; the forked work happens in the background and reports back.

## 4. Plan mode vs direct execution

**Goal**: feel the overhead of plan mode on a trivial task, then see why it's worth it on a complex one.

**Steps**:
1. Try plan mode on the `low-stock` crash (seeded flaw #1 — see instructor notes below) first. Notice plan mode adds ceremony for a fix that's really just "add a null check."
2. Now try the `quantity` → `quantity_on_hand` rename (seeded flaw #2) with plan mode. It touches ~10 files across both stacks with several valid approaches (rename in place vs. add an alias vs. migrate gradually).

**Observe**: plan mode's overhead is wasted on the crash fix but earns its cost on the rename, where seeing the plan before 10 files change is worth the pause.

**Check**: you should feel the ceremony was unnecessary in step 1 and justified in step 2 — that contrast is the actual lesson.

## 5. Write a new skill: `explain-order-flow`

**Goal**: model a new skill on `explore-schema`.

**Steps**:
1. Read `.claude/skills/explore-schema/SKILL.md`.
2. Write `.claude/skills/explain-order-flow/SKILL.md` that traces how an `Order` moves from creation (`OrdersPage.tsx`) through the API to the database and back.
3. Decide: does this need `context: fork`? Justify your answer in a comment in the SKILL.md.

**Observe**: if the trace is verbose (multiple files, full field listings), forking keeps that detail out of your main context, same as `explore-schema`. If you expect a short answer, forking is unnecessary overhead.

**Check**: run `/explain-order-flow` and confirm the main session's context usage matches your expectation from step 3.

## 6. Personal slash commands are not shared

**Goal**: confirm project vs personal command scope.

**Steps**:
1. Create `~/.claude/commands/my-notes.md` with any prompt content.
2. Run `/my-notes` in this repo — it works.
3. Check `git status` — nothing changed, because `~/.claude/commands/` is outside the repo entirely.

**Observe**: a teammate cloning this repo will never see `/my-notes`, because it was never in version control to begin with.

**Check**: `git log --all --full-history -- '**/my-notes.md'` returns nothing.

## 7. Write a path-scoped rule and prove it loads conditionally

**Goal**: use `.claude/instructions.log` to prove a rule only loads for matching files.

**Steps**:
1. Write `.claude/rules/pages.md` with `paths: ["frontend/src/pages/**/*.tsx"]` and any content.
2. Open `frontend/src/pages/ItemsPage.tsx`.
3. Open `backend/app/routers/items.py`.
4. Check `.claude/instructions.log`.

**Observe**: a `path_glob_match` entry for `pages.md` appears after step 2, but not after step 3.

**Check**: `grep pages.md .claude/instructions.log` shows exactly one entry, timestamped after you opened the page file.

## 8. Add a fourth agent with restricted tools

**Goal**: practice the tool-restriction pattern from `api-reviewer.md`.

**Steps**:
1. Write `.claude/agents/order-auditor.md`: `tools: Read, Grep, Glob` (read-only), a `description` explaining it checks order data for anomalies (e.g. orders referencing a deleted item).
2. Ask Claude to "use the order-auditor agent to check for orphaned orders."

**Observe**: the agent can read and grep but can't edit anything, even if it finds a problem — it can only report.

**Check**: ask it to "fix" what it finds; it should be unable to, since `Edit`/`Write` aren't in its `tools` list.

## 9. Add a fourth MCP tool

**Goal**: extend `inventory_mcp/server.py`.

**Steps**:
1. Add a `supplier_summary()` tool to `mcp/inventory_mcp/server.py` that returns each supplier with its item count and total inventory value.
2. Restart the MCP connection (`/mcp` → reconnect, or restart Claude Code).
3. Ask "summarize our suppliers by inventory value."

**Observe**: `/mcp` shows 4 tools on the `inventory` server instead of 3.

**Check**: the new tool's result matches a manual `SELECT` via `query_inventory` for the same aggregation.

## 10. Write a `Stop` hook that blocks on failing tests

**Goal**: enforce (not just request) that tests pass before Claude considers a task done.

**Steps**:
1. Write a `Stop` hook (Node, exec form, matching the existing hooks' pattern) that runs `pytest` and `npm test`, and on failure prints `{"decision": "block", "reason": "..."}` to stdout with exit 0.
2. Wire it into `.claude/settings.json` under `"Stop"`.
3. Deliberately break a test, then let Claude try to finish a turn.

**Observe**: Claude is told to continue instead of stopping, because the hook detected a failure.

**Check**: fix the test; the same hook should now allow the turn to end normally.

---

## Instructor notes (spoilers)

Five flaws are seeded into this repo on purpose. Don't read this section before attempting the exercises above if you want the "find it yourself" experience.

1. **Null-reorder-level crash** — `SN-2002` in `backend/app/db/seed.py` has `reorder_level=None`. `GET /api/items/low-stock` (`backend/app/routers/items.py`) does `item.quantity <= item.reorder_level`, which raises `TypeError` when `reorder_level` is `None`. Not covered by any test — that's *why* it shipped broken. Expected diagnosis: read the stack trace, add a null check (`item.reorder_level is not None and item.quantity <= item.reorder_level`), add a regression test.

2. **`quantity` naming collision** — `Item.quantity` and `Order.quantity` mean different things (`Item.quantity` = on-hand stock, `Order.quantity` = amount ordered) but share a name, which is confusing when both appear in the same conversation about "quantity." Renaming `Item.quantity` → `Item.quantity_on_hand` touches `models.py`, `schemas/item.py`, `routers/items.py`, `seed.py`, both backend test files, `frontend/src/api/client.ts`, `ItemTable.tsx`, `ItemForm.tsx`, and their tests. Expected diagnosis: plan mode, then a systematic Edit pass across all ~10 files, confirmed by running both test suites.

3. **Untested `suppliers.py`** — `backend/app/routers/suppliers.py` has full CRUD but zero tests, while `items` and `orders` are covered. Expected diagnosis: notice the gap (e.g. via `.claude/rules/testing.md` prompting "does every router have a test file?"), use the `test-writer` agent to fill it.

4. **Inconsistent date format** — `/api/orders` returns `placed_at` as a Unix timestamp; `/api/items` returns `updated_at` as ISO-8601. `frontend/src/api/client.ts`'s `normalizeOrder()` function compensates at the client boundary. Expected diagnosis: `/review-endpoint backend/app/routers/orders.py` (or the `api-reviewer` agent) flags it against `.claude/rules/api-conventions.md`; the real fix is changing the backend to emit ISO-8601 and removing the client-side normalization, not leaving the workaround in place.

5. **Direct `fetch` in `SupplierTable.tsx`** — its delete handler calls `fetch` directly instead of going through `api/client.ts`, violating `.claude/rules/react-components.md` and `frontend/src/components/CLAUDE.md`. Expected diagnosis: same pattern as #4 — a rule or agent flags it, the fix is routing the delete through `api.suppliers.delete()` via a callback prop instead.
