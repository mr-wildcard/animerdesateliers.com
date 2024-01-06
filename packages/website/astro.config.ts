import tailwind from "@astrojs/tailwind";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "./tailwind.config";

const fullConfig = resolveConfig(tailwindConfig);

const isProd = process.env.CF_PAGES_BRANCH === "main";

function getSiteURL() {
  if (process.env.CF_PAGES) {
    if (process.env.CF_PAGES_BRANCH !== "main") {
      return `https://${process.env.CF_PAGES_BRANCH}.animerdesateliers.pages.dev/`;
    } else {
      return "https://animerdesateliers.com/";
    }
  } else {
    return "http://localhost:3000/";
  }
}

export default {
  server: {
    hostname: "0.0.0.0",
    port: 3000,
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  site: getSiteURL(),
  vite: {
    define: {
      tailwindConfig: JSON.stringify(fullConfig),
      __PROD__: JSON.stringify(isProd),
    },
    server: {
      proxy: {
        "/subscribe": {
          target: "http://0.0.0.0:8401",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/subscribe/, ""),
        },
      },
    },
  },
};
