
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // All color extensions are removed to prevent unknown class errors.
      // We will use CSS variables directly in the HTML/CSS.
    },
  },
  plugins: [],
}
