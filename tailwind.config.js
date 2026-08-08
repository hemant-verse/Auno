// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        loadingBar: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
      },
    },
  },
};