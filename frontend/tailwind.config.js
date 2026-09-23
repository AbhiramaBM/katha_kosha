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
          50: '#f5f3ef',
          100: '#ede8df',
          200: '#ded2bf',
          300: '#cbb698',
          400: '#ba9a74',
          500: '#aa8156',
          600: '#8e6644',
          700: '#6e4c36',
          800: '#53392c',
          900: '#3e2b23',
          950: '#231612',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#252a55',
          700: '#1d2145',
          800: '#151833',
          900: '#0e1022'
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          500: '#eab308',
          600: '#c98a2e',
          700: '#a16207'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'Inter', 'sans-serif'],
        serif: ['Noto Serif', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
