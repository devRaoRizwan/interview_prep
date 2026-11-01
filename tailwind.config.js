/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['"Manrope"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        page: '#ffffff',
        paper: '#ffffff',
        'paper-muted': '#f7f7f9',
        sidebar: '#ffffff',
        line: '#e4e4e6',
        'line-strong': '#d4d4d8',
        ink: '#1a1e27',
        muted: '#565656',
        brand: {
          DEFAULT: '#1e222b',
          hover: '#292f3b',
          pale: '#f7f7f9',
        },
        signal: {
          DEFAULT: '#10b981',
          ink: '#047857',
          border: '#a7f3d0',
          pale: '#f0fdf8',
        }
      },
      boxShadow: {
        subtle: 'inset 0 1px #fff, 0 1px 2px #0a0a0a0d',
        card: 'inset 0 1px #fff, 0 8px 20px -8px #0a0a0a1a, 0 24px 48px -32px #0a0a0a42',
        hover: 'inset 0 1px #fff, 0 2px 4px #0a0a0a0d, 0 12px 28px -10px #0a0a0a29',
      }
    },
  },
  plugins: [],
};
