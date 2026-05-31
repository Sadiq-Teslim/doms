/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // DevFest-inspired green-forward identity
        forest: {
          DEFAULT: "#0B4D34",
          900: "#06311F",
          800: "#0B4D34",
          700: "#0F6043",
          600: "#137A54",
        },
        brand: {
          DEFAULT: "#1AA260",
          50: "#E8F7EE",
          100: "#CDEFDB",
          200: "#9FE0BB",
          300: "#5FC98E",
          400: "#2FB673",
          500: "#1AA260",
          600: "#13854E",
          700: "#0F6A3F",
        },
        gold: {
          DEFAULT: "#F4B740",
          100: "#FCEEC9",
          500: "#F4B740",
          600: "#E09F1F",
        },
        coral: {
          DEFAULT: "#F25C3B",
          100: "#FDE0D8",
          500: "#F25C3B",
          600: "#D9431F",
        },
        cream: {
          DEFAULT: "#F7F4EC",
          100: "#FBF9F3",
          200: "#F1ECDF",
        },
        ink: {
          DEFAULT: "#12211B",
          500: "#46544D",
          400: "#6B776F",
        },
      },
      fontFamily: {
        display: ['"Poppins"', "system-ui", "sans-serif"],
        sans: ['"Poppins"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,33,27,0.04), 0 8px 24px -12px rgba(18,33,27,0.12)",
        pop: "0 12px 40px -8px rgba(18,33,27,0.25)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};
