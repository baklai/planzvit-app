/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      eUkraine: ['e-Ukraine', 'sans-serif']
    },
    extend: {
      fontWeight: {
        thin: 100,
        ultraLight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        bold: 700
      }
    }
  },
  plugins: [require('tailwindcss-primeui')]
};
