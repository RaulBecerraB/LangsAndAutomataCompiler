/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#9ECDEF",
        foreground: "#133E87",
        secondary: "#88B5EE",
        accent: "#F2F2F2"
      },
    },
  },
  plugins: [],
};
