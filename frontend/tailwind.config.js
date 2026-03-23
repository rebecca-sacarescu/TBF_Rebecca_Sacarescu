/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Manrope", "sans-serif"],
      },
      colors: {
        primary: "#001d45",
        "primary-container": "#00316c",
        "on-primary": "#ffffff",
        "on-primary-container": "#639bfc",
        "primary-fixed": "#d7e2ff",
        "primary-fixed-dim": "#acc7ff",
        "on-primary-fixed": "#001a40",
        "on-primary-fixed-variant": "#004491",

        secondary: "#0c6780",
        "secondary-container": "#9ae1ff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#09657f",
        "secondary-fixed": "#baeaff",
        "secondary-fixed-dim": "#89d0ed",
        "on-secondary-fixed": "#001f29",
        "on-secondary-fixed-variant": "#004d62",

        tertiary: "#321700",
        "tertiary-container": "#512900",
        "tertiary-fixed": "#ffdcc3",
        "tertiary-fixed-dim": "#ffb77d",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#d68a49",
        "on-tertiary-fixed": "#2f1500",
        "on-tertiary-fixed-variant": "#6e3900",

        surface: "#f7f9fb",
        "surface-dim": "#d8dadc",
        "surface-bright": "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "surface-variant": "#e0e3e5",
        "surface-tint": "#115cb9",

        "on-surface": "#191c1e",
        "on-surface-variant": "#43474f",
        "on-background": "#191c1e",
        background: "#f7f9fb",

        outline: "#737780",
        "outline-variant": "#c3c6d1",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eff1f3",
        "inverse-primary": "#acc7ff",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};