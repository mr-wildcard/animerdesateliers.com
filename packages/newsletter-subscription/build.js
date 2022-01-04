const esbuild = require("esbuild");

return esbuild
  .build({
    bundle: true,
    entryPoints: ["src/index.ts"],
    outfile: "dist/worker.js",
    platform: "node",
  })
  .then(() => {
    console.log("✅  Build successful.");
  })
  .catch((error) => {
    console.error({ error });
  });
