const esbuild = require("esbuild");

return esbuild
  .build({
    bundle: true,
    entryPoints: ["src/index.ts"],
    outfile: "dist/worker.js",
    define: {
      MJ_APIKEY_PUBLIC: JSON.stringify(process.env.MJ_APIKEY_PUBLIC),
      MJ_APIKEY_PRIVATE: JSON.stringify(process.env.MJ_APIKEY_PRIVATE),
      MJ_LIST_ID: JSON.stringify(6339),
    },
  })
  .then(() => {
    console.log("✅  Build successful.");
  })
  .catch((error) => {
    console.error({ error });
  });
