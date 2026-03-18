/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FF6B35',
          hover:   '#e55a27',
          dim:     'rgba(255,107,53,0.12)',
        },
        brolas: {
          DEFAULT: '#8b5cf6',
          dim:     'rgba(139,92,246,0.10)',
        },
        surface: {
          DEFAULT: '#1a1a1a',
          2:       '#242424',
          3:       '#2e2e2e',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
    },
  },
  plugins: [],
}
