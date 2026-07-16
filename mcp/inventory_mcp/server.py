"""Exposes the live inventory SQLite database over MCP.

Without this, Claude answers "which items need reordering" by reading
seed.py and guessing at current state. With it, Claude queries the
actual database. Run standalone with: python -m inventory_mcp.server

Requires the venv that has `mcp` installed to be active before launching
Claude Code, since Claude Code spawns this server inheriting its own
environment. See README.md Troubleshooting.
"""

import os
import re
import sqlite3

from mcp.server.fastmcp import FastMCP

DB_PATH = os.environ.get(
    "INVENTORY_DB_PATH",
    os.path.join(os.path.dirname(__file__), "..", "..", "backend", "inventory.db"),
)

mcp = FastMCP(
    "inventory",
    instructions=(
        "Tools for querying the live factory inventory SQLite database: schema "
        "introspection, read-only SQL queries, and a low-stock report with "
        "supplier contacts. Use these instead of reading seed.py when the "
        "question is about current data rather than the schema definition."
    ),
)


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn


_WRITE_KEYWORDS = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE|ATTACH|PRAGMA)\b",
    re.IGNORECASE,
)


@mcp.tool()
def get_schema() -> dict:
    """Return every table and its columns (name, type, nullability) in the inventory database."""
    conn = _connect()
    try:
        tables = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        ).fetchall()
        schema = {}
        for table in tables:
            columns = conn.execute(f"PRAGMA table_info({table['name']})").fetchall()
            schema[table["name"]] = [
                {
                    "name": col["name"],
                    "type": col["type"],
                    "nullable": not col["notnull"],
                    "primary_key": bool(col["pk"]),
                }
                for col in columns
            ]
        return schema
    finally:
        conn.close()


@mcp.tool()
def query_inventory(sql: str) -> list[dict]:
    """Run a read-only SELECT query against the inventory database. Any write keyword is rejected."""
    stripped = sql.strip().rstrip(";")
    if not stripped.upper().startswith("SELECT"):
        raise ValueError("Only SELECT statements are allowed.")
    if _WRITE_KEYWORDS.search(stripped):
        raise ValueError("Query contains a disallowed write/DDL keyword.")

    conn = _connect()
    try:
        rows = conn.execute(stripped).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@mcp.tool()
def low_stock_report() -> list[dict]:
    """Return items at or below their reorder level, with the responsible supplier's contact info."""
    conn = _connect()
    try:
        rows = conn.execute(
            """
            SELECT items.sku, items.name, items.quantity, items.reorder_level,
                   suppliers.name AS supplier_name, suppliers.contact_email,
                   suppliers.lead_time_days
            FROM items
            JOIN suppliers ON suppliers.id = items.supplier_id
            WHERE items.reorder_level IS NOT NULL
              AND items.quantity <= items.reorder_level
            ORDER BY items.quantity ASC
            """
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


if __name__ == "__main__":
    mcp.run()
