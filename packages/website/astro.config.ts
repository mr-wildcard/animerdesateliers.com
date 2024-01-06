import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "./tailwind.config";

const fullConfig = resolveConfig(tailwindConfig);
const isProd = process.env.CF_PAGES_BRANCH === "main";

const LOCAL_PORT = 4321;
const LOCAL_HOST = "localhost";

function getSiteURL() {
  if (process.env.CF_PAGES) {
    if (process.env.CF_PAGES_BRANCH !== "main") {
      return `https://${process.env.CF_PAGES_BRANCH}.animerdesateliers.pages.dev/`;
    } else {
      return "https://animerdesateliers.com/";
    }
  } else {
    return `http://${LOCAL_HOST}:${LOCAL_PORT}/`;
  }
}

/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
  server: {
    host: LOCAL_HOST,
    port: LOCAL_PORT,
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
      nesting: true,
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
          rewrite: (path: string) => path.replace(/^\/subscribe/, ""),
        },
      },
    },
  },
});
