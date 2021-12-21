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
    extend: {
      colors: {
        downriver: "#08124f",
        blue: "#0f24f7",
      },
    },
  },
};
