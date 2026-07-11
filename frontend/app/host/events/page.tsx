"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, api, type Event } from "@/lib/api";
import { whenLabel } from "@/lib/time";
import { EditEventModal } from "@/components/EditEventModal";

export default function HostEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [meRes, evRes] = await Promise.all([
      api<{ role: string; is_admin: boolean }>("/auth/me"),
      api<Event[]>("/events"),
    ]);
    setIsAdmin(meRes.is_admin);
    setEvents(evRes);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((e) => {
      if (e instanceof ApiError && e.status === 401) router.replace("/host");
    });
  }, [router]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Your programs
          </h1>
          {isAdmin && (
            <span className="mt-1 inline-block rounded-full bg-ink px-3 py-1 text-sm font-medium text-white">
              Admin — you can edit any program
            </span>
          )}
        </div>
        <Link
          href="/host/events/new"
          className="rounded-xl bg-accent px-5 py-3 font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          + Add program
        </Link>
      </header>

      {loading ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : events.length === 0 ? (
        <p className="mt-10 text-muted">
          No programs yet. Add your first one.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="overflow-hidden rounded-2xl bg-white shadow-card"
            >
              {ev.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ev.cover_image_url}
                  alt=""
                  className="h-36 w-full object-cover"
                />
              )}
              <div className="p-5">
                <h2 className="font-display text-xl font-bold text-ink">
                  {ev.title}
                </h2>
                <p className="mt-1 text-muted">{whenLabel(ev.starts_at)}</p>
                <button
                  onClick={() => setEditing(ev)}
                  className="mt-4 rounded-lg border-2 border-accent px-4 py-2 font-semibold text-accent hover:bg-accent hover:text-white"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <EditEventModal
          event={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
    </main>
  );
}
