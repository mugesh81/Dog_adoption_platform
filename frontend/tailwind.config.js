/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F4C542',
          light: '#f7d674',
          dark: '#d6a827',
        },
        dark: {
          DEFAULT: '#1f2937',
          soft: '#374151',
        },
        light: {
          DEFAULT: '#f9fafb',
          soft: '#f3f4f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
