/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        django: {
          DEFAULT: '#092e20',
          dark: '#051b13',
          accent: '#44b78b',
          muted: '#2c4f42'
        }
      }
    },
  },
  plugins: [],
};
