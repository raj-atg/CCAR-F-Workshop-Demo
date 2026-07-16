<!-- Imported by root CLAUDE.md; keeps style rules out of every CLAUDE.md that touches Python -->

# Python style

- Format with `ruff format`; the PostToolUse hook runs this automatically on save.
- Type hints on all function signatures, including return types.
- Prefer `db.get(Model, id)` over `db.query(Model).filter_by(id=id).first()` for primary-key lookups.
- Pydantic schemas use `model_dump()`, not the deprecated `.dict()`.
- No bare `except:` — catch specific exceptions or let them propagate.
