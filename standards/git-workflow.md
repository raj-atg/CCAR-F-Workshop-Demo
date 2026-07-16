<!-- Imported by root CLAUDE.md; keeps commit conventions out of every CLAUDE.md -->

# Git workflow

- Commit messages: imperative mood, one line summary under 72 chars, blank line, then body if needed.
- Never commit `backend/inventory.db` or `.claude/instructions.log` — both are gitignored.
- Run the relevant test suite (`pytest` for backend changes, `npm test` for frontend changes) before committing.
- Prefer several small commits over one large commit when a change touches both stacks.
