/** Human "in 3 days" / "in 5 hours" / "starting now" from an ISO timestamp. */
export function countdown(iso?: string | null): string {
  if (!iso) return "Date to be announced";
  const start = new Date(iso).getTime();
  const diffMs = start - Date.now();

  if (diffMs <= 0) return "Happening now";

  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return "in less than an hour";
  if (hours < 24) return `in ${hours} ${hours === 1 ? "hour" : "hours"}`;

  const days = Math.round(hours / 24);
  if (days < 7) return `in ${days} ${days === 1 ? "day" : "days"}`;

  const weeks = Math.round(days / 7);
  return `in ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
}

export function whenLabel(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
