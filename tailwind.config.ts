import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: '#821db7',
        border: '#230633',
        secondary: '#e9d0f5',
        focus: '#6e159e',
        'action-btn-focus': '#d8bae6',
        'pink-lighter': '#f8eaff',
        'focus-shadow': '#0c0112',
        'clear-pink': '#F6EFFD',
        'clear-gray': '#dfd8e6',
        'clear-gray-2': '#c5becc',
        botbot: {
          purple: '#8A2BE2',
          dark: '#2D1A45',
          darker: '#1A0F29',
          darkest: '#0F0919',
          accent: '#B388FF',
        },
      },
      backgroundImage: {
        'home-img': "url('/bg.png')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 0deg at 50% 50%, var(--tw-gradient-stops))',
      },
      height: {
        inherit: 'inherit',
      },
      borderRadius: {
        'default-border': '25px',
        'menu-btn-border': '8px',
      },
      keyframes: {
        shrinkBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.8)' },
          '100%': { transform: 'scale(1)' },
        },
        heartBounce: {
          '0%': { transform: 'scale(0) translateY(0)', opacity: '0' },
          '30%': { transform: 'scale(1.4) translateY(-20px)', opacity: '1' },
          '50%': { transform: 'scale(1) translateY(10px)' },
          '70%': { transform: 'scale(1.2) translateY(-5px)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
        emoji1Animation: {
          '0%': {
            transform: 'scale(0) rotate(0deg)',
            opacity: '0',
            filter: 'blur(10px)',
          },
          '20%': {
            transform: 'scale(1.5) rotate(-15deg) translate(-40px, -20px)',
            opacity: '1',
            filter: 'blur(0)',
          },
          '40%': {
            transform: 'scale(1.2) rotate(10deg) translate(-30px, 30px)',
          },
          '60%': {
            transform: 'scale(1.4) rotate(-5deg) translate(-20px, -10px)',
          },
          '80%': {
            transform: 'scale(1.1) rotate(5deg) translate(-10px, 10px)',
          },
          '100%': {
            transform: 'scale(0) rotate(0deg) translate(0, 0)',
            opacity: '0',
            filter: 'blur(10px)',
          },
        },
        emoji2Animation: {
          '0%': {
            transform: 'scale(0) rotate(0deg)',
            opacity: '0',
            filter: 'blur(10px)',
          },
          '20%': {
            transform: 'scale(1.5) rotate(15deg) translate(40px, -20px)',
            opacity: '1',
            filter: 'blur(0)',
          },
          '40%': {
            transform: 'scale(1.2) rotate(-10deg) translate(30px, 30px)',
          },
          '60%': {
            transform: 'scale(1.4) rotate(5deg) translate(20px, -10px)',
          },
          '80%': {
            transform: 'scale(1.1) rotate(-5deg) translate(10px, 10px)',
          },
          '100%': {
            transform: 'scale(0) rotate(0deg) translate(0, 0)',
            opacity: '0',
            filter: 'blur(10px)',
          },
        },
        emoji3Animation: {
          '0%': {
            transform: 'scale(0) rotate(0deg)',
            opacity: '0',
            filter: 'blur(10px)',
          },
          '20%': {
            transform: 'scale(0.8) rotate(-10deg) translate(0, 50px)',
            opacity: '1',
            filter: 'blur(0)',
          },
          '40%': { transform: 'scale(1.2) rotate(360deg) translate(0, -30px)' },
          '60%': { transform: 'scale(1.5) rotate(720deg) translate(0, 0)' },
          '80%': { transform: 'scale(1.2) rotate(1080deg) translate(0, 20px)' },
          '100%': {
            transform: 'scale(0) rotate(1440deg) translate(0, 0)',
            opacity: '0',
            filter: 'blur(10px)',
          },
        },
        psychedelicBackground: {
          '0%': {
            backgroundImage:
              'linear-gradient(0deg, #ff00ff, #00ffff, #ffff00, #ff00ff)',
            backgroundSize: '400% 400%',
            backgroundPosition: '0% 0%',
            transform: 'scale(1.1)',
          },
          '25%': {
            backgroundImage:
              'linear-gradient(90deg, #00ff00, #ff00ff, #00ffff, #ffff00)',
            backgroundSize: '400% 400%',
            backgroundPosition: '100% 0%',
            transform: 'scale(1)',
          },
          '50%': {
            backgroundImage:
              'linear-gradient(180deg, #ffff00, #00ff00, #ff00ff, #00ffff)',
            backgroundSize: '400% 400%',
            backgroundPosition: '100% 100%',
            transform: 'scale(1.1)',
          },
          '75%': {
            backgroundImage:
              'linear-gradient(270deg, #00ffff, #ffff00, #00ff00, #ff00ff)',
            backgroundSize: '400% 400%',
            backgroundPosition: '0% 100%',
            transform: 'scale(1)',
          },
          '100%': {
            backgroundImage:
              'linear-gradient(360deg, #ff00ff, #00ffff, #ffff00, #ff00ff)',
            backgroundSize: '400% 400%',
            backgroundPosition: '0% 0%',
            transform: 'scale(1.1)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        redScreenFlash: {
          '0%': { opacity: '0' },
          '12.5%': { opacity: '0.9' },
          '25%': { opacity: '0' },
          '37.5%': { opacity: '0.9' },
          '50%': { opacity: '0' },
          '62.5%': { opacity: '0.9' },
          '75%': { opacity: '0' },
          '87.5%': { opacity: '0.9' },
          '100%': { opacity: '0' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-up-fade-out': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        successActionFeedback: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        failActionFeedback: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        shrinkBounce: 'shrinkBounce 0.4s ease-in-out',
        heartBounce: 'heartBounce 4s ease-in-out forwards',
        emoji1:
          'emoji1Animation 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        emoji2:
          'emoji2Animation 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        emoji3:
          'emoji3Animation 4s cubic-bezier(0.215, 0.61, 0.355, 1) forwards',
        psychedelic:
          'psychedelicBackground 4s cubic-bezier(0.42, 0, 0.58, 1) forwards',
        fadeIn: 'fadeIn 1s ease-in forwards',
        spin: 'spin 3s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        redFlash:
          'redScreenFlash 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-up-fade-out': 'slide-up-fade-out 1s ease-out forwards',
        successActionFeedback: 'successActionFeedback 0.75s ease-out forwards',
        failActionFeedback: 'failActionFeedback 0.75s ease-out forwards',
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
  safelist: [
    'bg-red-600',
    'hover:bg-red-600',
    'animate-spin',
    'animate-pulse',
    'animate-psychedelic',
    'animate-redFlash',
    'bg-gradient-radial',
    'bg-gradient-conic',
  ],
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
