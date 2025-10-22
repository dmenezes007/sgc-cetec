/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#00529B',
        'secondary': '#003366',
        'secondary-dark': '#002244',
        'accent': '#FFC107',
        'light-bg': '#F0F4F8',
        'dark-text': '#102A43',
        'light-text': '#BCCCDC',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}