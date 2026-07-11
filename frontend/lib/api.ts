export const API =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T = unknown>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include", // send/receive the httpOnly auth cookie
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
    ...opts,
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

export type EventImage = { id: string; url: string; caption?: string | null };

export type Event = {
  id: string;
  host_id: string;
  title: string;
  description: string;
  category?: string | null;
  location?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  accessibility_tags: string[];
  is_free: boolean;
  requires_signup: boolean;
  cover_image_url?: string | null;
  images: EventImage[];
};

export type Me = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  icons: string[];
};
