import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./public/**/*.html", "./src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      sans: ["Filson Pro", "sans-serif"],
      serif: ["Termina", "serif"],
    },
    extend: {
      fontSize: {
        xl: ["20px", "34px"],
      },
      colors: {
        downriver: "#08124f",
        blue: "#0f24f7",
        denim: "#197abf",
        canary: "#e3fd52",
        chiffon: "#f7fecb",
        brightred: "#ad0002",
        cosmos: "#ffe8e8",
        magnolia: "#f6f1ff",
        selago: "#f4f6fe",
        shipgray: "#3f3e47",
        gray: "#838383",
        silversand: "#bdbfc1",
        concrete: "#f3f3f3",
      },
    },
  },
  corePlugins: {
    container: false,
  },
};
