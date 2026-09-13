/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#081220',
        surface: '#132238',
        card: '#1E293B',
        gold: '#FFD93D',
        red: '#FF4B4B',
        blue: '#4DA6FF',
        green: '#4CAF50',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        pixel: '0 0 0 2px #000, 0 0 0 4px #4DA6FF',
        'pixel-gold': '0 0 0 2px #000, 0 0 0 4px #FFD93D',
        glow: '0 0 12px rgba(255, 217, 61, 0.55)',
      },
      borderRadius: {
        pixel: '4px',
      },
      maxWidth: {
        app: '430px',
      },
    },
  },
  plugins: [],
};
