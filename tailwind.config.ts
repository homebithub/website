import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        blink: {
          '0%, 100%': { backgroundColor: 'bg-white' },
          '50%': { backgroundColor: 'bg-yellow-400' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in-out',
        blink: 'blink 1s ease-in-out',
      },
      colors: {
        black: {
          800: '#262626',
          900: '#18181b',
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),

  ],
} satisfies Config

