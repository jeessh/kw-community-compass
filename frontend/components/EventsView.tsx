"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ApiError, api, type Event, type Me } from "@/lib/api";
import { countdown, whenLabel } from "@/lib/time";
import { useHold } from "@/lib/useHold";
import { PersonIcon } from "@/components/PersonIcon";

const DROP_THRESHOLD = 150; // drag-down px to attend
const SETTINGS_THRESHOLD = 130; // drag-up px to open settings
const HOLD_TOUCH_MS = 2000; // press-and-hold on touch/mouse
const HOLD_KEY_MS = 1500; // keyboard hold (ArrowDown / ArrowUp)

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// Directional slide for the active card. `dir` is passed via `custom`:
// +1 → new card enters from the right (advancing), -1 → from the left.
const cardVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 320 : -320,
    opacity: 0,
    scale: 0.92,
    rotate: dir > 0 ? 4 : -4,
  }),
  center: { x: 0, opacity: 1, scale: 1, rotate: 0 },
  exit: (dir: number) => ({
    x: dir > 0 ? -320 : 320,
    opacity: 0,
    scale: 0.92,
    rotate: dir > 0 ? -4 : 4,
  }),
};

export function EventsView() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [i, setI] = useState(0);
  // +1 = advancing (new card enters from the right), -1 = going back.
  const [dir, setDir] = useState(1);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"loading" | "ready" | "empty">(
    "loading",
  );
  const [view, setView] = useState<"events" | "settings">("events");
  const [confirming, setConfirming] = useState(false);

  // Progress values that drive the slot + morph visuals (0..1).
  const [saveReveal, setSaveReveal] = useState(0);
  const [settingsReveal, setSettingsReveal] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-9, 9]);

  const holdSave = useHold();
  const holdSettings = useHold();

  // ---- data ----
  useEffect(() => {
    (async () => {
      try {
        const [meRes, evRes] = await Promise.all([
          api<Me>("/users/me"),
          api<Event[]>("/events"),
        ]);
        setMe(meRes);
        setEvents(evRes);
        setStatus(evRes.length ? "ready" : "empty");
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/signup");
          return;
        }
        setStatus("empty");
      }
    })();
  }, [router]);

  const current = events[i];
  const n = events.length;
  // Neighbors for the faded "peek" cards behind the active one.
  const prevEvent = n > 1 ? events[(i - 1 + n) % n] : null;
  const nextEvent = n > 1 ? events[(i + 1) % n] : null;

  const next = useCallback(() => {
    setDir(1);
    setEvents((ev) => (setI((n) => (n + 1) % Math.max(ev.length, 1)), ev));
  }, []);
  const prev = useCallback(() => {
    setDir(-1);
    setEvents(
      (ev) => (setI((n) => (n - 1 + ev.length) % Math.max(ev.length, 1)), ev),
    );
  }, []);

  const saveCurrent = useCallback(async () => {
    const ev = events[i];
    if (!ev) return;
    setConfirming(true);
    if (!saved.has(ev.id)) {
      try {
        // Attending = automatic registration; no form for the member to fill.
        await api(`/events/${ev.id}/attend`, { method: "POST" });
      } catch {
        /* keep the optimistic UI even if offline in the demo */
      }
      setSaved((prev) => new Set(prev).add(ev.id));
    }
    window.setTimeout(() => setConfirming(false), 1300);
  }, [events, i, saved]);

  const openSettings = useCallback(() => {
    setSettingsReveal(1);
    setView("settings");
  }, []);
  const closeSettings = useCallback(() => {
    setSettingsReveal(0);
    setView("events");
  }, []);

  // ---- hold drivers ----
  const startSaveHold = useCallback(
    (ms: number) => {
      holdSave.start(
        ms,
        (p) => {
          setSaveReveal(p);
          y.set(p * 34); // card eases down as it "drops"
        },
        () => {
          setSaveReveal(0);
          y.set(0);
          void saveCurrent();
        },
      );
    },
    [holdSave, saveCurrent, y],
  );
  const cancelSaveHold = useCallback(() => {
    holdSave.cancel(() => setSaveReveal(0));
    y.set(0);
  }, [holdSave, y]);

  const startSettingsHold = useCallback(
    (ms: number) => {
      holdSettings.start(
        ms,
        (p) => setSettingsReveal(p),
        () => openSettings(),
      );
    },
    [holdSettings, openSettings],
  );
  const cancelSettingsHold = useCallback(() => {
    holdSettings.cancel(() => setSettingsReveal(0));
  }, [holdSettings]);

  // ---- keyboard ----
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (view === "settings") {
        if (e.key === "Escape" || e.key === "ArrowDown") closeSettings();
        return;
      }
      switch (e.key) {
        case "ArrowRight":
          if (!e.repeat) next();
          break;
        case "ArrowLeft":
          if (!e.repeat) prev();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!e.repeat) startSaveHold(HOLD_KEY_MS);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!e.repeat) startSettingsHold(HOLD_KEY_MS);
          break;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") cancelSaveHold();
      if (e.key === "ArrowUp") cancelSettingsHold();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [
    view,
    next,
    prev,
    startSaveHold,
    cancelSaveHold,
    startSettingsHold,
    cancelSettingsHold,
    closeSettings,
  ]);

  if (status === "loading") {
    return (
      <main className="grid h-dvh place-items-center text-muted">
        <p className="font-display text-2xl">Loading your programs…</p>
      </main>
    );
  }

  const alreadySaved = current ? saved.has(current.id) : false;

  return (
    <main className="relative h-dvh w-full overflow-hidden select-none">
      {/* ambient ground */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#ffffff_0%,#EEEBF5_55%,#E6E1F2_100%)]" />

      {/* ---------------- SETTINGS MORPH ---------------- */}
      <SettingsMorph me={me} reveal={settingsReveal} onClose={closeSettings} />

      {/* ---------------- EVENTS ---------------- */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-24"
        style={{
          opacity: 1 - settingsReveal,
          pointerEvents: view === "settings" ? "none" : "auto",
        }}
      >
        {status === "empty" || !current ? (
          <p className="font-display text-3xl text-muted">
            No programs yet — check back soon.
          </p>
        ) : (
          <>
            {/* side nav rectangles */}
            <SideNav side="left" onClick={prev} />
            <SideNav side="right" onClick={next} />

            {/* card stage: faded peek neighbors + the active, sliding card */}
            <div className="relative aspect-[3/2] w-full max-w-[720px]">
              {/* faded peek cards behind the active one */}
              {prevEvent && prevEvent.id !== current.id && (
                <PeekCard event={prevEvent} side="left" onClick={prev} />
              )}
              {nextEvent && nextEvent.id !== current.id && (
                <PeekCard event={nextEvent} side="right" onClick={next} />
              )}

              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.div
                  key={current.id}
                  custom={dir}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 34,
                    opacity: { duration: 0.18 },
                  }}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.65}
                  style={{ x, y, rotate }}
                  whileDrag={{ scale: 1.04 }}
                  onDragStart={() => {
                    cancelSaveHold();
                    cancelSettingsHold();
                  }}
                  onDrag={(_, info) => {
                    const dy = info.offset.y;
                    if (dy > 0) {
                      setSaveReveal(clamp01(dy / DROP_THRESHOLD));
                      setSettingsReveal(0);
                    } else {
                      setSettingsReveal(clamp01(-dy / SETTINGS_THRESHOLD));
                      setSaveReveal(0);
                    }
                  }}
                  onDragEnd={(_, info) => {
                    const dy = info.offset.y;
                    setSaveReveal(0);
                    setSettingsReveal(0);
                    if (dy > DROP_THRESHOLD) void saveCurrent();
                    else if (dy < -SETTINGS_THRESHOLD) openSettings();
                  }}
                  onPointerDown={() => startSaveHold(HOLD_TOUCH_MS)}
                  onPointerUp={cancelSaveHold}
                  onPointerCancel={cancelSaveHold}
                  className="absolute inset-0 cursor-grab overflow-hidden rounded-[28px] bg-card shadow-card active:cursor-grabbing"
                >
                  <EventCard event={current} saved={alreadySaved} />

                  {/* radial hold ring */}
                  <HoldRing progress={saveReveal} />

                  {/* confirm sweep */}
                  <AnimatePresence>
                    {confirming && <ConfirmSweep />}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* progress dots */}
            <div className="mt-6 flex gap-2" aria-hidden>
              {events.map((e, idx) => (
                <span
                  key={e.id}
                  className={`h-2 rounded-full transition-all ${
                    idx === i ? "w-7 bg-accent" : "w-2 bg-edge"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* the SLOT — signature element */}
        <SaveSlot reveal={saveReveal} />

        {/* bottom bar: name to the left of the person icon */}
        {me && (
          <div className="absolute bottom-6 left-8 flex items-center gap-3">
            <span className="font-display text-xl text-ink">
              {me.first_name} {me.last_name}
            </span>
            <button
              onClick={openSettings}
              aria-label="Open your settings"
              className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-card transition-transform hover:scale-105"
            >
              <PersonIcon className="h-6 w-6 text-accent" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------- pieces ---------------- */

function EventCard({ event, saved }: { event: Event; saved: boolean }) {
  return (
    <div className="flex h-full flex-col">
      {/* cover — top half */}
      <div className="relative h-1/2 w-full bg-edge">
        {event.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_image_url}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        )}
        {event.category && (
          <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1 text-sm font-medium text-white">
            {event.category}
          </span>
        )}
        {saved && (
          <span className="absolute right-4 top-4 rounded-full bg-attend px-3 py-1 text-sm font-semibold text-white">
            Attending ✓
          </span>
        )}
      </div>
      {/* body — bottom half */}
      <div className="flex flex-1 flex-col gap-2 p-7">
        <p className="font-display text-lg font-semibold text-pop">
          {countdown(event.starts_at)}
        </p>
        <h1 className="font-display text-3xl font-extrabold leading-tight text-ink">
          {event.title}
        </h1>
        <p className="line-clamp-2 text-lg text-muted">{event.description}</p>
        <p className="mt-auto text-base text-muted">
          {whenLabel(event.starts_at)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
      </div>
    </div>
  );
}

function PeekCard({
  event,
  side,
  onClick,
}: {
  event: Event;
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-hidden
      tabIndex={-1}
      initial={false}
      animate={{
        x: side === "left" ? "-14%" : "14%",
        scale: 0.9,
        opacity: 0.45,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      className="absolute inset-0 -z-10 cursor-pointer overflow-hidden rounded-[28px] bg-card shadow-card blur-[1px]"
    >
      <EventCard event={event} saved={false} />
      {/* wash to push it visually behind the active card */}
      <span className="pointer-events-none absolute inset-0 bg-paper/40" />
    </motion.button>
  );
}

function SaveSlot({ reveal }: { reveal: number }) {
  // Full-width bottom glow that rises up the screen and intensifies as the
  // member nears confirmation. Height grows from ~18vh to ~55vh of the viewport.
  const heightVh = 18 + reveal * 37;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center"
      style={{ opacity: clamp01(reveal * 1.15) }}
    >
      <div
        className="flex w-full flex-col items-center justify-end pb-8"
        style={{
          height: `${heightVh}vh`,
          background: `radial-gradient(140% 100% at 50% 130%, rgba(255,122,77,${
            0.28 + reveal * 0.4
          }), rgba(255,122,77,0) 72%)`,
        }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
          style={{ scale: 0.7 + reveal * 0.7 }}
          className="text-4xl text-pop"
        >
          ↑
        </motion.div>
        <p className="font-display text-lg font-semibold text-ink">
          {reveal > 0.9 ? "Release to attend" : "Drop here to attend"}
        </p>
      </div>
    </div>
  );
}

function HoldRing({ progress }: { progress: number }) {
  if (progress <= 0) return null;
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <svg width="90" height="90" viewBox="0 0 90 90" className="drop-shadow">
        <circle cx="45" cy="45" r={r} fill="rgba(255,255,255,0.85)" />
        <circle
          cx="45"
          cy="45"
          r={r}
          fill="none"
          stroke="#5B5BD6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          transform="rotate(-90 45 45)"
        />
        <text
          x="45"
          y="52"
          textAnchor="middle"
          className="fill-ink"
          fontSize="26"
        >
          ↓
        </text>
      </svg>
    </div>
  );
}

function ConfirmSweep() {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="absolute inset-0 grid place-items-center bg-attend text-white"
    >
      <div className="text-center">
        <div className="text-6xl">✓</div>
        <p className="mt-2 font-display text-3xl font-extrabold">
          You&apos;re attending!
        </p>
        <p className="mt-1 text-lg text-white/80">You&apos;re all registered.</p>
      </div>
    </motion.div>
  );
}

function SideNav({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous program" : "Next program"}
      className={`absolute top-1/2 -translate-y-1/2 flex h-40 w-14 items-center justify-center rounded-2xl bg-white/70 text-2xl text-accent shadow-card backdrop-blur transition-transform hover:scale-105 ${
        side === "left" ? "left-6" : "right-6"
      }`}
    >
      {side === "left" ? "←" : "→"}
    </button>
  );
}

function SettingsMorph({
  me,
  reveal,
  onClose,
}: {
  me: Me | null;
  reveal: number;
  onClose: () => void;
}) {
  if (reveal <= 0) return null;
  return (
    <div
      className="absolute inset-0 z-10 grid place-items-center"
      style={{ opacity: reveal }}
      onClick={onClose}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="grid place-items-center rounded-full bg-white shadow-lift"
          style={{ height: 96 + reveal * 96, width: 96 + reveal * 96 }}
        >
          <PersonIcon
            className="text-accent"
            style={{ height: 44 + reveal * 40, width: 44 + reveal * 40 }}
          />
        </div>
        {me && (
          <p className="font-display text-3xl font-extrabold text-ink">
            {me.first_name} {me.last_name}
          </p>
        )}
        {reveal > 0.95 && (
          <p className="text-lg text-muted">
            Settings coming soon · press Esc or tap to go back
          </p>
        )}
      </div>
    </div>
  );
}
