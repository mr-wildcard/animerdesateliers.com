const resolveConfig = require("tailwindcss/resolveConfig");
const tailwindConfig = require("./tailwind.config.js");

const fullConfig = resolveConfig(tailwindConfig);

// @ts-check
module.exports = {
  renderers: [],
  devOptions: {
    tailwindConfig: "./tailwind.config.js",
  },
  vite: {
    define: {
      tailwindConfig: JSON.stringify(fullConfig),
    },
  },
};
