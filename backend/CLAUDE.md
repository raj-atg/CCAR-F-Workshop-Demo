<!-- Backend-scope facts: loads lazily when Claude reads a file under backend/ -->

# Backend (FastAPI)

## Layering

Router → schema → model, always in that order. A router:

1. Depends on `get_db` from `app/db/session.py` for a session.
2. Accepts/returns a Pydantic schema from `app/schemas/`, never a raw SQLAlchemy model.
3. Reads/writes the SQLAlchemy model from `app/db/models.py` internally.

Never import a model into a router response — serialize through the matching `Out` schema.

## Adding an endpoint

1. Add or extend the Pydantic schema in `app/schemas/<entity>.py`.
2. Add the route in `app/routers/<entity>.py`, following the existing CRUD pattern in that file.
3. If the endpoint touches the schema (new field, new entity), update `app/db/models.py` and `app/db/seed.py` together — see `app/db/CLAUDE.md`.
4. Add a test in `tests/test_<entity>.py`.

## Running just the backend tests

```
pytest                      # from backend/, venv active
pytest tests/test_items.py  # single file
pytest -k low_stock         # by keyword
```

## Response conventions

See `.claude/rules/api-conventions.md` for response shape and error-format rules that apply specifically to `app/routers/`.
