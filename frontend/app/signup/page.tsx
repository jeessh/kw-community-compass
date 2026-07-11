"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { emojiFor } from "@/lib/icons";

type Step = "name" | "icons" | "success";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [icons, setIcons] = useState<string[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createAccount() {
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ icons: string[] }>("/auth/signup/user", {
        method: "POST",
        body: JSON.stringify({ first_name: first, last_name: last }),
      });
      setIcons(res.icons);
      setStep("icons");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function togglePick(slug: string) {
    setPicked((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(slug); // confirming = tapping each icon to remember it
      return nextSet;
    });
  }

  function finish() {
    setStep("success");
    // Cookie is already set by signup; fade into the events page.
    window.setTimeout(() => router.replace("/"), 1600);
  }

  return (
    <main className="grid h-dvh place-items-center bg-[radial-gradient(120%_80%_at_50%_-10%,#ffffff,#EEEBF5_60%,#E6E1F2)] px-6">
      <AnimatePresence mode="wait">
        {step === "name" && (
          <motion.section
            key="name"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-lg text-center"
          >
            <h1 className="font-display text-4xl font-extrabold text-ink">
              Welcome
            </h1>
            <p className="mt-2 text-lg text-muted">
              Just your name to get started.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <input
                autoFocus
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                placeholder="First name"
                className="rounded-2xl border-2 border-edge bg-white px-5 py-4 text-2xl outline-none focus:border-accent"
              />
              <input
                value={last}
                onChange={(e) => setLast(e.target.value)}
                placeholder="Last name"
                className="rounded-2xl border-2 border-edge bg-white px-5 py-4 text-2xl outline-none focus:border-accent"
              />
            </div>
            {error && <p className="mt-4 text-pop">{error}</p>}
            <button
              disabled={!first.trim() || !last.trim() || busy}
              onClick={createAccount}
              className="mt-8 w-full rounded-2xl bg-accent px-6 py-4 text-2xl font-semibold text-white shadow-card transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
            >
              {busy ? "Creating…" : "Continue"}
            </button>
          </motion.section>
        )}

        {step === "icons" && (
          <motion.section
            key="icons"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-2xl text-center"
          >
            <h1 className="font-display text-4xl font-extrabold text-ink">
              These 3 icons are your key
            </h1>
            <p className="mt-2 text-lg text-muted">
              Tap each one to remember it. You&apos;ll use them to sign in.
            </p>
            <div className="mt-10 flex justify-center gap-6">
              {icons.map((slug) => {
                const isPicked = picked.has(slug);
                return (
                  <button
                    key={slug}
                    onClick={() => togglePick(slug)}
                    aria-label={slug}
                    className={`grid h-40 w-40 place-items-center rounded-3xl border-4 bg-white text-7xl shadow-card transition-all ${
                      isPicked
                        ? "border-attend scale-105"
                        : "border-edge hover:border-accent"
                    }`}
                  >
                    <span aria-hidden>{emojiFor(slug)}</span>
                    <span className="mt-1 block text-base font-medium capitalize text-muted">
                      {slug}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-6 text-muted">
              Your sign-in word:{" "}
              <span className="font-semibold text-ink">
                {icons.join("_")}
              </span>
            </p>
            <button
              disabled={picked.size < icons.length}
              onClick={finish}
              className="mt-8 rounded-2xl bg-accent px-10 py-4 text-2xl font-semibold text-white shadow-card transition-transform enabled:hover:scale-[1.02] disabled:opacity-40"
            >
              Create account
            </button>
          </motion.section>
        )}

        {step === "success" && (
          <motion.section
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-attend text-6xl text-white"
            >
              ✓
            </motion.div>
            <h1 className="mt-6 font-display text-4xl font-extrabold text-ink">
              You&apos;re in, {first}!
            </h1>
            <p className="mt-2 text-lg text-muted">Finding programs for you…</p>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
