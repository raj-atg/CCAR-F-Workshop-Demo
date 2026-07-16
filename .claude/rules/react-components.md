---
paths:
  - "frontend/src/components/**/*.tsx"
---

<!-- Overlaps frontend/src/components/CLAUDE.md exactly -- included so participants can compare a glob rule and a directory CLAUDE.md covering the identical tree -->

# React component conventions

- No direct `fetch` calls in components — delegate to `src/api/client.ts` via callback props from the parent page. `SupplierTable.tsx` currently violates this; see `EXERCISES.md`.
- Every component file exports one component as its default export, named after the file.
- Props interfaces are named `<ComponentName>Props`.

This rule and `frontend/src/components/CLAUDE.md` cover the same directory and largely the same content. Since `components/` is a real, stable directory, the CLAUDE.md is the more natural fit — it loads exactly when this rule's glob would match anyway, with no glob to maintain. Reach for a path-scoped rule instead when the matching files are scattered across directories, the way `testing.md` scopes to test files spread across both `components/` and `pages/`.
