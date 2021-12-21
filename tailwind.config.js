const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: "jit",
  purge: ["./public/**/*.html", "./src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      sans: ["Filson Pro", "sans-serif"],
      serif: ["Dela Gothic One", "serif"],
    },
    container: {
      center: true,
    },
    boxShadow: theme => ({
      ...theme.boxShadow,
      bubble: `4px 4px 0px 0px ${theme('colors.canary')}`,
      buttonTypePrimary: `0px 4px 0px 0px ${theme('colors.downriver')}`,
      buttonTypePrimary_focused: `0px 2px 0px 0px ${theme('colors.downriver')}`
    }),
    outline: theme => ({
      ...theme.outline,
      button: [`2px solid ${theme('colors.denim')}`, '4px'],
    }),
    extend: {
      colors: {
        downriver: "#08124f",
        blue: "#0f24f7",
        denim: "#197abf",
        selago: "#f4f6fe",
        canary: "#e3fd52",
        chiffon: "#f7fecb",
      },
    },
  },
};
