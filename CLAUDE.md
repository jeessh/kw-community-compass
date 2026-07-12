# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
Frontend also has `npm run typecheck` (`tsc --noEmit`) and `npm run build`.
Interactive API docs: http://localhost:8000/docs. **There is no test suite,
linter, or CI** — verify changes by running the app and typecheck.

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

## Frontend architecture
- `components/EventsView.tsx` (~1.3k lines) is the member experience — the whole
  one-card-at-a-time discovery/attend flow lives here and orchestrates every
  accessibility mode below.
- **Accessibility modes are per-member toggles**, persisted on the user (`Me.tts_enabled`,
  `voice_commands_enabled`, `eye_tracking_enabled`) and loaded from `GET /auth/me`.
  Each is a hook in `lib/`: `useTextToSpeech`, `useSpeechCommands`,
  `useEyeTracking` (webgazer-based gaze cursor + `CalibrationOverlay`), `useHold`
  (press-and-hold-to-attend). Toggling a mode PATCHes `/users/me` and flips the
  hook — keep the persisted pref and the active hook in sync.
- All HTTP goes through the single `api()` helper in `lib/api.ts`
  (`credentials: "include"` for the auth cookie). Image uploads use raw `FormData`
  via `uploadImage()` — never force `Content-Type: application/json` on those.

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
