---
description: Reviews one API endpoint file against this project's api-conventions.md rules.
argument-hint: "[router-file]"
disable-model-invocation: true
---

Review `$ARGUMENTS` against `.claude/rules/api-conventions.md`.

This is a deliberate, user-triggered review — that's why `disable-model-invocation: true` is set on this skill. You wouldn't want Claude deciding on its own that a router "looks done" and running a review unprompted; you invoke this explicitly with `/review-endpoint backend/app/routers/orders.py` when you want a conventions check.

For the given file:

1. Read `.claude/rules/api-conventions.md` and the target router file.
2. Check each endpoint against every convention: envelope shape, date/time format, 404 wording, `PATCH` partial-update behavior, `DELETE` status code.
3. Report violations with the specific line and which convention it breaks. Don't report anything that isn't in `api-conventions.md` — this skill checks conventions, not general code quality.
4. If the file is clean, say so plainly instead of inventing nitpicks.
