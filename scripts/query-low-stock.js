#!/usr/bin/env node
// Queries the live SQLite database directly (read-only) so /low-stock reports
// real data instead of Claude guessing from seed.py. Cross-platform: pure
// Node + node:sqlite, no shell-specific syntax.
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dbPath =
  process.env.INVENTORY_DB_PATH ||
  path.join(__dirname, "..", "backend", "inventory.db");

const db = new DatabaseSync(dbPath, { readOnly: true });

const rows = db
  .prepare(
    `SELECT items.sku, items.name, items.quantity, items.reorder_level,
            suppliers.name AS supplier_name, suppliers.contact_email, suppliers.lead_time_days
     FROM items
     JOIN suppliers ON suppliers.id = items.supplier_id
     WHERE items.reorder_level IS NOT NULL AND items.quantity <= items.reorder_level
     ORDER BY items.quantity ASC`,
  )
  .all();

if (rows.length === 0) {
  console.log("No items are currently at or below their reorder level.");
} else {
  for (const row of rows) {
    console.log(
      `${row.sku} (${row.name}): qty=${row.quantity}, reorder_level=${row.reorder_level}, ` +
        `supplier=${row.supplier_name} <${row.contact_email}>, lead_time=${row.lead_time_days}d`,
    );
  }
}

db.close();
