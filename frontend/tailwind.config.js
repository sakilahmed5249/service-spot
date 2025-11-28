/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // toggle dark glass UI with `class="dark"` or `class="theme-dark"`
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* COLOR SYSTEM
         - primary/secondary/accent: your brand
         - brand: single stops for quick gradient building
         - trust: neutrals for fintech-like whitespace & text
         - glass: translucent tints for glassmorphism
      */
      colors: {
        primary: {
          DEFAULT: '#9333EA',
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
        },
        secondary: {
          DEFAULT: '#EC4899',
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
        },
        accent: {
          DEFAULT: '#06B6D4',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },

        /* extras for UI system */
        brand: { // convenient gradient endpoints
          purple: '#6C5CE7',
          teal: '#00BFA6',
        },

        trust: { // fintech neutrals
          900: '#0F1724',
          800: '#111827',
          700: '#0B1220',
          600: '#334155',
          400: '#94A3B8',
          100: '#E6EEF2',
        },

        glass: {
          light: 'rgba(255,255,255,0.06)',
          mid: 'rgba(255,255,255,0.04)',
          dark: 'rgba(12,17,23,0.36)',
        },

        success: {
          DEFAULT: '#10B981',
          600: '#059669'
        },
        danger: {
          DEFAULT: '#EF4444',
          600: '#DC2626'
        },
      },

      /* TYPOGRAPHY */
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },

      /* ANIMATIONS / KEYFRAMES (adds pop, float-slow) */
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pop': 'pop .36s ease-out',
        'slide-in-up': 'slideInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        pulse:  { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '.6', transform: 'scale(1.3)' } },
        pop:    { '0%': { transform: 'scale(.96)' }, '60%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' } },
        slideInUp: { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      },

      /* DEPTH & SHAPE */
      boxShadow: {
        'soft-lg': '0 10px 30px rgba(2,6,23,0.12)',
        'glass-md': '0 8px 20px rgba(12,17,23,0.08)',
        'soft-glow': '0 12px 40px rgba(108,92,231,0.12)',
        'strong': '0 22px 60px rgba(2,6,23,0.6)',
        'glow': '0 0 20px rgba(99,102,241,0.16)',
        'glow-lg': '0 0 30px rgba(99,102,241,0.22)',
      },

      borderRadius: {
        'xl-2': '18px',
        '2xl-2': '22px',
        'rounder': '28px',
      },

      /* BACKDROP utility options */
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
      },

      /* small helpful spacing tokens */
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },

      /* put commonly used z-index values */
      zIndex: {
        '60': '60',
        '70': '70',
        '90': '90'
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // optional: require('@tailwindcss/line-clamp'),
  ],
}