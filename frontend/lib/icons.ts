// Placeholder icon set — slugs mirror the backend ICON_POOL. Swap emoji for
// real icons later without touching logic.
export const ICON_EMOJI: Record<string, string> = {
  tree: "🌳",
  cat: "🐱",
  apple: "🍎",
  sun: "☀️",
  moon: "🌙",
  star: "⭐",
  dog: "🐶",
  fish: "🐟",
  bird: "🐦",
  leaf: "🍃",
  flower: "🌸",
  house: "🏠",
  car: "🚗",
  boat: "⛵",
  heart: "❤️",
  cloud: "☁️",
  rain: "🌧️",
  snow: "❄️",
  fire: "🔥",
  key: "🔑",
  book: "📖",
  ball: "⚽",
  cake: "🍰",
  bell: "🔔",
};

export function emojiFor(slug: string): string {
  return ICON_EMOJI[slug] ?? "❔";
}
