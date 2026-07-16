<!-- Root-level facts every session needs: stack, exact commands, universal conventions -->

# Inventory Workshop

Factory inventory management: React + TypeScript + Vite frontend, Python + FastAPI + SQLAlchemy backend, SQLite database. Three entities: Supplier, Item, Order. Plain CRUD, no auth, no pagination.

## Setup

```
pip install -r backend/requirements.txt
npm install --prefix frontend
python -m app.db.seed   # from backend/, with venv active
```

## Run

- Backend: `uvicorn app.main:app --port 8001 --reload` (from `backend/`, venv active) — http://localhost:8001
- Frontend: `npm run dev` (from `frontend/`) — http://localhost:3000, proxies `/api` to 8001

## Test

- Backend: `pytest` (from `backend/`, venv active)
- Frontend: `npm test` (from `frontend/`)

## Re-seed

`python -m app.db.seed` (from `backend/`, venv active) drops and recreates the database with exactly 4 suppliers, 10 items, and 10 orders. Always update `backend/app/db/seed.py` in the same change as any `models.py` edit — see `backend/app/db/CLAUDE.md`.

## Universal conventions

- Layering is one-way: router → schema → model. Never import a SQLAlchemy model directly into a router without going through a Pydantic schema. See `backend/CLAUDE.md`.
- The frontend never calls `fetch` directly outside `frontend/src/api/client.ts`. See `frontend/CLAUDE.md`.
- Windows and macOS both run this repo. Any new script goes in `scripts/` as a Node file invoked via `npm run` — no `.sh` files.

@standards/python-style.md
@standards/react-style.md
@standards/git-workflow.md
