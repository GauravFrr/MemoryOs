import type { Config } from "tailwindcss";

const config: Omit<Config, "content"> = {
  theme: {
    extend: {
      colors: {
        primary: "#7C5CFC",
        background: "#0A0A0B",
        surface: "#141415",
        text: {
          main: "#F3F4F6",
          muted: "#9CA3AF"
        }
      }
    },
  },
  plugins: [],
};

export default config;
