import type { Config } from 'tailwindcss'

const colors = {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712', // Extra deep for rich dark mode
  },
  accent: '#ede9fe',
  text: '#18181b',
  // Enhanced dark mode colors
  dark: {
    bg: '#0a0a0f',
    card: '#13131a',
    border: '#1e1e2e',
    text: '#e4e4e7',
    muted: '#71717a',
  }
}

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: colors,
      backgroundColor: colors,
      textColor: colors,
      borderColor: colors,
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(124, 58, 237, 0.08)',
        'card-dark': '0 4px 24px 0 rgba(168, 85, 247, 0.15)',
        'glow-sm': '0 0 15px rgba(168, 85, 247, 0.5)',
        'glow-md': '0 0 30px rgba(168, 85, 247, 0.6)',
        'glow-lg': '0 0 45px rgba(168, 85, 247, 0.7)',
        'inner-glow': 'inset 0 0 20px rgba(168, 85, 247, 0.3)',
        'neon': '0 0 5px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)',
        // Light theme glow effects
        'light-glow-sm': '0 0 20px rgba(147, 51, 234, 0.15), 0 4px 24px rgba(168, 85, 247, 0.12)',
        'light-glow-md': '0 0 30px rgba(147, 51, 234, 0.2), 0 8px 32px rgba(168, 85, 247, 0.15)',
        'light-glow-lg': '0 0 40px rgba(147, 51, 234, 0.25), 0 12px 40px rgba(168, 85, 247, 0.18)',
      },
      borderRadius: {
        xl: '1.25rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInFromLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.7s ease-in',
        slideInRight: 'slideInFromRight 0.5s ease-out',
        slideInLeft: 'slideInFromLeft 0.5s ease-out',
        glow: 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 3s linear infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.3), transparent)',
      },
      backgroundSize: {
        '200%': '200% 200%',
        '300%': '300% 300%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config

