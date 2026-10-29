/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        heading: ['"Manrope"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        page: '#fafafa',
        paper: '#ffffff',
        'paper-muted': '#f7f7f7',
        sidebar: '#f7f6f2',
        line: '#eaeaea',
        'line-strong': '#d4d4d4',
        ink: '#171717',
        muted: '#737373',
        brand: {
          DEFAULT: '#171717',
          hover: '#333333',
          pale: '#f4f4f4',
        },
        sage: {
          DEFAULT: '#52766d',
          dark: '#3d5952',
          pale: '#eef3f1',
        }
      },
      boxShadow: {
        subtle: '0 1px 2px rgb(0 0 0 / 4%)',
        card: '0 1px 3px rgb(0 0 0 / 4%), 0 1px 2px rgb(0 0 0 / 2%)',
        hover: '0 4px 14px rgb(0 0 0 / 6%)',
      }
    },
  },
  plugins: [],
};
