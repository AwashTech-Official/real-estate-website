/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#0C0D10',
        'card-main': '#141519',
        'text-main': '#F5F3EF',
        'muted-main': '#B4B1A8',
        'accent-main': '#C8A35F',
        'accent-hover': '#DEC07E',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Noto Sans Ethiopic"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"DM Sans"', '"Noto Sans Ethiopic"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
