// Placeholder icon set — slugs mirror the backend ICON_POOL. Swap emoji for
// real icons later without touching logic. Keep in sync with core/icons.py.
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
  guitar: "🎸",
  rocket: "🚀",
  crown: "👑",
  gift: "🎁",
  camera: "📷",
  clock: "⏰",
  umbrella: "☂️",
  balloon: "🎈",
  anchor: "⚓",
  diamond: "💎",
  mushroom: "🍄",
  cactus: "🌵",
  grapes: "🍇",
  lemon: "🍋",
  pizza: "🍕",
  hat: "🎩",
};

/** All selectable icon slugs, in a stable display order. */
export const ALL_ICONS = Object.keys(ICON_EMOJI);

export function emojiFor(slug: string): string {
  return ICON_EMOJI[slug] ?? "❔";
}
