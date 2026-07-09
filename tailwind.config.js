/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e040fb',
          dark: '#b800d8',
          light: '#f06dff',
        },
        accent: {
          DEFAULT: '#00d4ff',
          dark: '#00a8cc',
        },
        surface: {
          DEFAULT: '#0a0a0f',
          2: '#13131e',
          3: '#1c1c2c',
          4: '#272740',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
