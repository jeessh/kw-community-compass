import type { Event } from "@/lib/api";
import { countdown } from "@/lib/time";

/**
 * Build the spoken-language summary read aloud for an event. Kept deliberately
 * short: just the title, when it happens ("in 3 days"), and the description.
 */
export function eventToSpeech(event: Event): string {
  const parts: string[] = [event.title + "."];
  parts.push(countdown(event.starts_at) + ".");
  if (event.description) parts.push(event.description);
  return parts.filter(Boolean).join(" ");
}
