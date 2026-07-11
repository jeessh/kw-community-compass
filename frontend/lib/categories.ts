export type CategoryStyle = { emoji: string; color: string };

// Known categories from the app's taxonomy → a distinct accent + icon. Colors
// are used inline (card banners / tints) so they survive Tailwind purging.
const MAP: Record<string, CategoryStyle> = {
  food: { emoji: "🍽️", color: "#E84C88" },
  "food events": { emoji: "🍽️", color: "#E84C88" },
  sports: { emoji: "🏐", color: "#3AA0C2" },
  sport: { emoji: "🏐", color: "#3AA0C2" },
  "sports & rec": { emoji: "🏐", color: "#3AA0C2" },
  "sport & rec": { emoji: "🏐", color: "#3AA0C2" },
  arts: { emoji: "🎨", color: "#E8A33D" },
  newcomers: { emoji: "🧭", color: "#5B5BD6" },
  wellness: { emoji: "🌿", color: "#2FA36B" },
  music: { emoji: "🎵", color: "#9B5BD6" },
  education: { emoji: "📚", color: "#4C6EE8" },
  social: { emoji: "🎉", color: "#E86A4C" },
  outdoors: { emoji: "🌲", color: "#2F8F5B" },
  technology: { emoji: "💻", color: "#4C6EE8" },
};

// Stable fallback palette for unknown categories (hashed → same color always).
const PALETTE = [
  "#E84C88",
  "#3AA0C2",
  "#E8A33D",
  "#5B5BD6",
  "#2FA36B",
  "#9B5BD6",
  "#E86A4C",
];

export function categoryStyle(category?: string | null): CategoryStyle {
  if (!category) return { emoji: "📌", color: "#5B5BD6" };
  const key = category.trim().toLowerCase();
  if (MAP[key]) return MAP[key];
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return { emoji: "📌", color: PALETTE[h % PALETTE.length] };
}
