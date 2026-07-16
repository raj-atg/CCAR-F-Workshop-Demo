---
paths:
  - "backend/app/db/**/*.py"
---

<!-- Same procedure as backend/app/db/CLAUDE.md, deliberately duplicated as a glob rule so participants can compare the two mechanisms on the same tree -->

# Database schema discipline

- Never edit `models.py` without updating `seed.py` in the same change — every column needs a seeded value across all 10 items, 4 suppliers, and 10 orders.
- After any schema change, re-run `python -m app.db.seed` and confirm the app still starts.
- A schema change that renames or removes a column almost always touches the frontend's TypeScript types (`frontend/src/api/client.ts`) too — check there before considering the change complete.
- This duplicates the procedure in `backend/app/db/CLAUDE.md` on purpose. The directory CLAUDE.md always loads once you touch a file under `app/db/`; this rule loads under the same condition today, but would keep loading even if this content moved to a subdirectory the CLAUDE.md doesn't cover. For a directory-shaped concern like this one, the CLAUDE.md is the better fit — prefer it over adding new glob rules when a directory already exists.
