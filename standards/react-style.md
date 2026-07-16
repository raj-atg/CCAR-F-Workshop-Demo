<!-- Imported by root CLAUDE.md; keeps style rules out of every CLAUDE.md that touches the frontend -->

# React style

- Function components only, no class components.
- Format with `prettier --write`; the PostToolUse hook runs this automatically on save.
- Props typed with an explicit `interface`, not inline object types.
- Prefer `useState`/`useEffect` over introducing a state library — this app is small enough that hooks are sufficient.
- Event handlers named `handleX` (e.g. `handleSubmit`, `handleDelete`).
