<!-- Frontend scope: Vite/React conventions and the api client contract -->

# Frontend (Vite + React + TypeScript)

## The api client contract

`src/api/client.ts` is the only place that calls `fetch`. Every page and component goes through `api.items.*`, `api.suppliers.*`, or `api.orders.*`. This exists because the backend is inconsistent about date formats (`Order.placed_at` is a Unix timestamp, `Item.updated_at` is ISO-8601) — the client normalizes both to ISO-8601 strings so components never branch on it. Adding a new fetch call outside this file reintroduces that inconsistency at the call site.

## Pages vs components

- `src/pages/` — one per entity (`ItemsPage`, `SuppliersPage`, `OrdersPage`). Own data fetching (via the api client) and pass data down as props.
- `src/components/` — presentational, receive data and callbacks as props. See `src/components/CLAUDE.md` for component-specific rules.

## Routing

React Router, defined in `src/App.tsx`. Adding a page means adding both a `<Route>` there and a `<NavLink>` in the nav bar.

## Running just the frontend tests

```
npm test              # from frontend/, runs Vitest once
npm test -- --watch    # watch mode
```

Tests are colocated beside their source (`ItemTable.tsx` next to `ItemTable.test.tsx`), not gathered in a separate `__tests__/` directory. See `.claude/rules/testing.md`, which scopes testing conventions by glob because they can't be scoped to one directory.
