/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ferrari': '#DC0000',
        'ferrari-dark': '#8B0000',
        'mercedes': '#00D2BE',
        'mercedes-dark': '#008C7A',
        'redbull': '#0600EF',
        'redbull-dark': '#04009E',
        'track': '#2C2C2C',
        'track-light': '#3A3A3A',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'race': 'race 3s ease-in-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        race: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100vw)' },
        },
      },
    },
  },
  plugins: [],
}
