# KW Community Compass

Accessible, needs-first community-programming platform for Kitchener-Waterloo
nonprofits (hackathon build). Members discover/attend programs via a tactile,
one-card-at-a-time UI; sign-in is a memorable **3-icon key that IS the password**.

## Layout
- `backend/` — FastAPI + SQLAlchemy. **Source of truth for the API.**
- `frontend/` — Next.js (App Router) + Tailwind + Framer Motion.
- `vercel.json` (root) — single-origin deploy: `/api/*` → backend, `/*` → frontend.

## Run locally
```bash
# backend → http://localhost:8000
cd backend && .venv/bin/uvicorn app.main:app --reload
# frontend → http://localhost:3000
cd frontend && npm run dev
```
`backend/.env` (gitignored) holds `DATABASE_URL` + `JWT_SECRET`; seed with
`.venv/bin/python -m app.seed` (idempotent; skips if hosts exist).

## Database (Supabase)
- Project ref `xybhshhcgdvfgryklsze`, region `aws-1-us-west-2`.
- Pooler host `aws-1-us-west-2.pooler.supabase.com` — **:5432 session** (local),
  **:6543 transaction** (serverless/Vercel). URL prefix must be `postgresql+psycopg://`.
- Auth is **custom cookie-based** (not Supabase Auth); RLS is intentionally off —
  never expose the anon key or hit the DB from the browser.

## Same-origin deploy (why it matters)
Auth cookie is `SameSite=Lax`, frontend fetches with `credentials:"include"`, so FE
and BE **must share one origin**. In prod set `NEXT_PUBLIC_API_URL=/api`; FastAPI
uses `settings.ROOT_PATH` (`""` local, `/api` prod).

Required prod env: `DATABASE_URL` (:6543), `JWT_SECRET`, `COOKIE_SECURE=true`,
`NEXT_PUBLIC_API_URL=/api`, `FRONTEND_ORIGIN`, `ROOT_PATH=/api`.

## Gotchas / conventions
- **Passwords use `bcrypt` directly — do NOT reintroduce `passlib`** (crashes on
  bcrypt ≥4.1). Hashes are standard `$2b$`.
- **The 3-icon set is the credential** → generate with `secrets` (see
  `app/core/icons.py`), never `random`. Keyspace is only ~12k combos; add login
  rate-limiting before treating this as production auth.
- `JWT_SECRET` has no default — the app fails fast if it's unset.
- DB engine uses `NullPool` + `prepare_threshold=None` for pgbouncer compatibility.
- Roles: **members** (icon sign-in) · **hosts** (manage own programs) · **admins**
  (hosts with `is_admin`).

## Status
DB live + seeded. Deploy config present but **not yet deployed/verified**; the root
`vercel.json` `services` schema needs validation against current Vercel support, and
`vercel login` must be completed first.
