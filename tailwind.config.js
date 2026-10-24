/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#070707",
        ink: "#0D0D0D",
        graphite: "#151515",
        silver: "#C3C6CB",
        steel: "#8A8E94",
        cream: "#ECE3D2",
      },
    },
  },
  plugins: [],
};
