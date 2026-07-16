---
description: Reports items below reorder level, straight from the live database.
---

<!-- Lives in .claude/commands/ (not .claude/skills/) on purpose, to prove that form still works
     alongside skills, and to demo `!`cmd`` dynamic injection running before Claude sees the prompt. -->

## Current low stock

!`node scripts/query-low-stock.js`

## Task

Summarize which items need reordering and which supplier to contact for each, using the data above. Group by supplier if more than one supplier is affected.
