---
paths:
  - "frontend/src/**/*.test.tsx"
  - "backend/tests/test_*.py"
---

<!-- Frontend tests are colocated beside source, scattered across components/ and pages/ — no single directory contains them, so this can't be a directory CLAUDE.md. That's the canonical case for a glob rule. -->

# Testing conventions

## Frontend (Vitest + React Testing Library)

- One `describe` block per component, one `it` per behavior.
- Query by role or visible text (`screen.getByText`, `getByLabelText`), not by test IDs.
- Mock callback props with `vi.fn()`; assert on call arguments, not just call count.
- A test file lives beside the component it tests: `ItemTable.tsx` → `ItemTable.test.tsx`, not in a separate `__tests__/` tree.

## Backend (pytest + httpx)

- Use the `client` fixture from `conftest.py`, which runs against an in-memory SQLite database — never point a test at `backend/inventory.db`.
- One test file per router: `test_items.py`, `test_orders.py`, `test_suppliers.py`.
- Assert on both status code and response body shape, not just status code.
- A new endpoint needs a test in the same change that adds it.
