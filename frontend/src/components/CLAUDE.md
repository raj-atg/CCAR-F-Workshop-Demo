<!-- Deepest CLAUDE.md in the hierarchy: component-specific conventions -->

# Components

## Props typing

Every component declares an explicit `interface <ComponentName>Props` above the component function. No inline object types in the function signature.

## No direct `fetch`

Components receive data and callback props (`onEdit`, `onDelete`, etc.) from their parent page; they never call `api/client.ts` or `fetch` themselves. `SupplierTable.tsx` currently violates this — it calls `fetch` directly for deletes instead of delegating to the parent page. Don't copy that pattern; see the seeded-faults section of `instructor.md` for the fix.

## Table + Form pairing

Each entity that has a dedicated form (currently just `Item`) follows the `<Entity>Table` / `<Entity>Form` split: the table is read-only and presentational, the form handles both create and edit via an `initial` prop that's `null` for create.
