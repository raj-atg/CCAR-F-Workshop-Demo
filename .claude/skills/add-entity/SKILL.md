---
description: Scaffolds a new CRUD entity across the model, schema, router, tests, and frontend page — the template to copy for adding a fourth entity to this app.
argument-hint: "[EntityName] [field:type ...]"
allowed-tools: Read Write Edit Glob
---

Scaffold a new entity called `$0` with fields: $ARGUMENTS

Follow the exact pattern of the existing `Item`, `Supplier`, and `Order` entities — read those files first before writing anything, since the new entity must match their conventions exactly (see `backend/CLAUDE.md` for the router → schema → model layering, and `.claude/rules/api-conventions.md` for response shape).

1. **Model**: add a class to `backend/app/db/models.py` with the fields given in `$ARGUMENTS` (format `name:type`, e.g. `weight:float`), an `id` primary key, and any foreign keys implied by the field names (a field named `<other_entity>_id` should become a `ForeignKey`).
2. **Schema**: add `backend/app/schemas/<entity>.py` with `<EntityName>Base`, `<EntityName>Create`, `<EntityName>Update` (all fields optional), and `<EntityName>Out` (adds `id`), following `backend/app/schemas/item.py` as the template.
3. **Router**: add `backend/app/routers/<entity>.py` with `GET` (list), `GET /{id}`, `POST`, `PATCH /{id}`, `DELETE /{id}` under `/api/<entities>`, following `backend/app/routers/items.py`. Register the router in `backend/app/main.py`.
4. **Seed**: add this entity to `backend/app/db/seed.py` with at least 3 realistic rows, per the schema-change procedure in `backend/app/db/CLAUDE.md`.
5. **Tests**: add `backend/tests/test_<entity>.py` covering create, list, update, delete, following `backend/tests/test_items.py`.
6. **Frontend types**: add the TypeScript interface and `api.<entities>` methods to `frontend/src/api/client.ts`, following the `Item` block.
7. **Frontend page**: add `frontend/src/pages/<EntityName>Page.tsx` and a `<EntityName>Table.tsx` component, following `ItemsPage.tsx` and `ItemTable.tsx`. Register the route and nav link in `frontend/src/App.tsx`.

After scaffolding, run `pytest` and `npm test` and report the result.
