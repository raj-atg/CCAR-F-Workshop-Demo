---
description: Traces an entity end-to-end through the stack — SQLAlchemy model, Pydantic schemas, router endpoints, frontend TypeScript types, and every component or page that consumes it. Use when asked how an entity flows through the stack, or to understand blast radius before a schema change.
argument-hint: "[entity-name]"
context: fork
agent: Explore
allowed-tools: Read Grep Glob
---

Trace the entity `$0` completely through this codebase. Be exhaustive — report every file that touches it and every field, not just a summary. This skill runs in an isolated subagent specifically so it can afford to be verbose here without flooding the main conversation; do not compress your search process, only your final report structure.

1. Find the SQLAlchemy model in `backend/app/db/models.py`. List every column, its type, and nullability.
2. Find every Pydantic schema in `backend/app/schemas/` that references this entity (`<Entity>Base`, `<Entity>Create`, `<Entity>Update`, `<Entity>Out`). List every field in each.
3. Find the router in `backend/app/routers/` that exposes this entity. List every endpoint, its HTTP method, and its request/response shape.
4. Find the TypeScript interface in `frontend/src/api/client.ts` for this entity. List every field and its type.
5. Grep `frontend/src/pages/` and `frontend/src/components/` for every file that imports or references this entity's type or the `api.<entity>` client methods. List each file and how it uses the entity (renders it, edits it, deletes it, etc).
6. Check `backend/app/db/seed.py` for how this entity is seeded — how many rows, and any deliberately unusual values (nulls, edge cases).

Return a structured report with one section per step above. Name every file explicitly with its path. This is the level of detail the main session would need to plan a schema change without re-reading the files itself.
