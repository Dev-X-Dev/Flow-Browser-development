/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'flow-cyan': '#22d3ee',
        'flow-blue': '#3b82f6',
        'flow-purple': '#a855f7',
        'flow-dark': '#0f172a',
        'flow-darker': '#020617',
      },
      fontFamily: {
        'mono': ['Space Mono', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(0)' },
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.5)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}
