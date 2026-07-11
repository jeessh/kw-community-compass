# Host / Admin Dashboard — Design

**Date:** 2026-07-11

Condensed, filterable management dashboard for hosts and admins, replacing the
simple card grid at `/host/events`.

## Decisions (confirmed with user)

- **Placement:** Replace the existing `/host/events` page.
- **Host scope:** Standard hosts see *all* events but can edit only their own;
  others' events are read-only.
- **Delete:** Hosts may delete their own events (with a confirmation modal);
  admins may delete any event.
- **API:** Add `host_name` to the events API so the table can show the owning
  organization by name instead of a UUID.

## Backend

- `Event.host_name` property → `self.host.name` (already has a `host` relationship).
- `EventOut.host_name: str` field.
- `list_events` uses `joinedload(Event.host)` to avoid N+1.
- No endpoint changes: `POST /events` (any host), `PATCH /events/{id}` and
  `DELETE /events/{id}` (owner-or-admin) already enforce the right permissions.

## Frontend

Replace `frontend/app/host/events/page.tsx` with a dashboard that loads
`/auth/me` + `/events` once.

- **Toolbar:** search (title/location/description), category `<select>`,
  free/paid `<select>`, and a List ⇄ Card view toggle. `aria-live` result count.
- **List view:** semantic `<table>` — Title · When · Category · Owner · Cost ·
  Actions. "You" badge on own rows.
- **Card view:** responsive card grid, same data + actions.
- **Per-row permissions:** `canManage = isAdmin || ev.host_id === me.id`.
  Read-only rows show "View only". Edit + Delete only when `canManage`.
- **Add:** links to existing `/host/events/new`.

## Modals (accessibility-first)

- `components/Modal.tsx`: accessible dialog shell — `role="dialog"`,
  `aria-modal`, labelled title, focus trap, Esc to close, restores focus to
  trigger, backdrop-click closes.
- `DeleteConfirmModal.tsx`: names the program, warns it is permanent.
- `EditEventModal`: refactored onto the shell; edits title, description,
  category, location, start time, free, requires-signup.

## Accessibility

Labelled controls, `scope` headers + sr-only `<caption>`, descriptive action
labels ("Edit *Coffee Morning*"), full keyboard operability, focus management,
`prefers-reduced-motion` (already global), ink-level contrast for key text,
`aria-live` for result count and post-delete announcements.
