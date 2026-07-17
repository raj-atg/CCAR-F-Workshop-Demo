---
paths:
  - "backend/app/routers/**/*.py"
---

<!-- Only matters inside routers, not the whole backend, so it's a glob rule rather than backend/CLAUDE.md content -->

# API conventions

- Every list endpoint returns a JSON array directly, not wrapped in an envelope like `{"data": [...]}`.
- Date/time fields must be ISO-8601 strings. `app/routers/orders.py` currently violates this — `placed_at` is serialized as a Unix timestamp while `app/routers/items.py`'s `updated_at` is ISO-8601. This is a known seeded inconsistency (see the seeded-faults section of `instructor.md`); don't copy the Unix-timestamp pattern into new endpoints.
- 404s raise `HTTPException(status_code=404, detail="<Entity> not found")` — match the existing wording pattern per entity.
- `PATCH` endpoints use `payload.model_dump(exclude_unset=True)` so partial updates don't overwrite untouched fields with defaults.
- `DELETE` endpoints return `204` with no body.
