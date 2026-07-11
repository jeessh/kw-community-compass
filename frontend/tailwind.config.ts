import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEEBF5",
        card: "#FFFFFF",
        ink: "#201B33",
        muted: "#6B6580",
        edge: "#E2DEF0",
        accent: "#5B5BD6",
        attend: "#2FA36B",
        pop: "#FF7A4D",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 60px -20px rgba(32,27,51,0.35)",
        lift: "0 40px 90px -24px rgba(32,27,51,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
