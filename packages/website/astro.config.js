const resolveConfig = require("tailwindcss/resolveConfig");
const tailwindConfig = require("./tailwind.config.js");

const fullConfig = resolveConfig(tailwindConfig);

function getSiteURL() {
  if (process.env.CF_PAGES_BRANCH) {
    if (process.env.CF_PAGES_BRANCH !== "main") {
      return "https://animerdesateliers.pages.dev/";
    } else {
      return "https://animerdesateliers.com/";
    }
  } else {
    return "http://localhost:3000/";
  }
}

module.exports = {
  renderers: [],
  devOptions: {
    tailwindConfig: "./tailwind.config.js",
    hostname: "0.0.0.0",
  },
  buildOptions: {
    site: getSiteURL(),
  },
  vite: {
    define: {
      tailwindConfig: JSON.stringify(fullConfig),
    },
  },
};
