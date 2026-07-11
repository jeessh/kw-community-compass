"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { api, type Event } from "@/lib/api";

/** Admin (or owning host) modal to modify an event in place. */
export function EditEventModal({
  event,
  onClose,
  onSaved,
}: {
  event: Event;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api(`/events/${event.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, description, location }),
      });
      onSaved();
    } catch {
      setError("Could not save — you may not have permission for this program.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 grid place-items-center bg-ink/40 px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-lift"
      >
        <h2 className="font-display text-2xl font-extrabold text-ink">
          Edit program
        </h2>
        <div className="mt-5 flex flex-col gap-3">
          <label className="text-sm font-semibold text-muted">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border-2 border-edge px-4 py-3 text-lg outline-none focus:border-accent"
          />
          <label className="text-sm font-semibold text-muted">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-xl border-2 border-edge px-4 py-3 text-lg outline-none focus:border-accent"
          />
          <label className="text-sm font-semibold text-muted">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border-2 border-edge px-4 py-3 text-lg outline-none focus:border-accent"
          />
        </div>
        {error && <p className="mt-3 text-pop">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-3 font-semibold text-muted hover:bg-paper"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={save}
            className="rounded-xl bg-accent px-6 py-3 font-semibold text-white disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
