# KW Community Compass

An accessible, needs-first platform where Kitchener-Waterloo nonprofits contribute
community programming and members of all abilities discover what fits them — all
in one place.

Built for a one-day hackathon with KW Hab.

## Why it's different

The old shared community calendar is a grid that answers "what's on Tuesday?"
This app answers **"what do I need, and can I actually use it?"** — organized
around needs and accessibility, with a deliberately tactile, one-thing-at-a-time
interface.

### The member experience
A single big card at a time. To attend a program you either:
- **drag** the card down into the slot,
- **press and hold** it (2s), or
- **hold the ↓ arrow key** (1.5s).

Every path resolves into the same "drop into the slot → you're attending" moment.
Attending auto-registers the member — no forms. Left/right (arrows or on-screen)
move between programs; the person icon (or drag-up / hold-↑) opens settings.

Sign-up asks only for a first and last name; the app generates a memorable
3-icon key (e.g. 🌳🐱🍎 = `tree_cat_apple`) as the password.

## Stack
- **Frontend:** Next.js (App Router) · Tailwind · Framer Motion — see [`frontend/`](frontend)
- **Backend:** FastAPI · SQLAlchemy — see [`backend/`](backend)
- **Database + storage:** Supabase Postgres (used as the DB; auth is custom, cookie-based)

## Run it locally

```bash
# 1. Backend  (http://localhost:8000)
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # paste your Supabase DATABASE_URL + a JWT_SECRET
python -m app.seed          # optional sample data
uvicorn app.main:app --reload

# 2. Frontend (http://localhost:3000)
cd ../frontend
npm install
cp .env.local.example .env.local
npm run dev
```

See [`backend/README.md`](backend/README.md) for the data model, permissions, and
API reference.

## Roles
- **Members** — discover + attend programs (simple icon sign-in)
- **Hosts** — nonprofit organizers who add and edit their own programs
- **Admins** — hosts who can edit any program and manage member accounts
