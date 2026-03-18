/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
      },
      colors: {
        bg: '#F7F6F3',
        surface: '#FFFFFF',
        'surface-2': '#F0EEE9',
        border: '#E8E4DC',
        accent: {
          DEFAULT: '#2D6A4F',
          light: '#E8F5EE',
          hover: '#235A41',
        },
        amber: { portal: '#C77B2A', light: '#FDF3E7' },
        indigo: { portal: '#5C6BC0', light: '#EEF0FD' },
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.06)',
        'card-md': '0 4px 24px rgba(0,0,0,0.09)',
      },
      borderRadius: { portal: '12px', lg: '16px' },
    },
  },
  plugins: [],
}
