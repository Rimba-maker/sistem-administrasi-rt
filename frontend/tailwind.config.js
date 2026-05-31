/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        background: '#ffffff',
        foreground: '#171717',
        primary: {
          DEFAULT: '#171717',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#fafafa',
          foreground: '#888888',
        },
        border: '#ebebeb',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#171717',
        },
        success: '#0070f3',
        error: '#ee0000',
        warning: '#f5a623',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      }
    },
  },
  plugins: [],
}