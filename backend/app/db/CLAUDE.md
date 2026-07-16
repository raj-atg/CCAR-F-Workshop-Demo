<!-- DB scope: the schema-change procedure a PreToolUse hook enforces on models.py -->

# Database layer

## Schema-change procedure

`models.py` is schema-critical: a change here can silently desync the seed data, the API schemas, and the frontend types. Whenever you change it:

1. Edit `models.py`.
2. Update `seed.py` in the same change — every column needs a value for all 10 items / 4 suppliers / 10 orders.
3. Re-run the seed: `python -m app.db.seed` (from `backend/`, venv active).
4. Update the affected Pydantic schema(s) in `app/schemas/`.
5. Confirm with the user before proceeding if the change is a rename or removal, since it likely touches the frontend too.

A `PreToolUse` hook (`.claude/hooks/protect-models.js`) blocks direct edits to this file and points back to this procedure — the instruction above is guidance, the hook is the guarantee. See the root `.claude/rules/db-schema.md` for the same procedure scoped as a path rule instead of a directory CLAUDE.md; compare the two to see why this one lives here.

## Why `inventory.db` is gitignored

The database file is generated, not authored. Anyone can reproduce it byte-for-byte with `python -m app.db.seed`. Committing it would create merge conflicts on a binary file and let the repo drift from `seed.py`.

## Session handling

`session.py` reads `INVENTORY_DB_PATH` from the environment so the MCP server and the FastAPI app can point at the same file without hardcoding a path.
