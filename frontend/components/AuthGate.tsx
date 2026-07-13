"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, type Me } from "@/lib/api";

// Gates member routes: resolves /users/me before rendering children, so an
// unauthenticated visitor is redirected out before any child data fetch runs.
export function AuthGate({
  children,
}: {
  children: (me: Me) => ReactNode;
}) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const meRes = await api<Me>("/users/me");
        if (alive) setMe(meRes);
      } catch {
        if (alive) router.replace("/"); // not signed in → landing
      }
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  if (!me) {
    return (
      <main className="grid h-dvh place-items-center bg-[radial-gradient(120%_80%_at_50%_-10%,#ffffff,#EEEBF5_60%,#E6E1F2)] text-muted">
        <p className="font-display text-2xl">Checking you in…</p>
      </main>
    );
  }

  return <>{children(me)}</>;
}
