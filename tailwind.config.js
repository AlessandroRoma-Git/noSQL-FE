
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'bg-base': 'rgb(var(--color-bg-base) / <alpha-value>)',
        'bg-surface': 'rgb(var(--color-bg-surface) / <alpha-value>)',
        'text-main': 'rgb(var(--color-text) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}
