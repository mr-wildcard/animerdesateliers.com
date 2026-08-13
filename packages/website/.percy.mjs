const { PREVIEW_URL } = process.env;

console.info(`✅ Using preview URL: ${PREVIEW_URL}`);

const pages = [
  { path: "/", name: "homepage" },
  { path: "/mentions-legales", name: "mentions-legales" },
];

const basicSnapshotConfig = {
  enableJavaScript: true,
  async execute() {
    document.querySelectorAll("summary").forEach((summary) => summary.click());

    await new Promise((resolve) => {
      window.addEventListener(
        "scrollend",
        function () {
          resolve();
        },
        { once: true },
      );

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    });
  },
};

export default pages.map(({ path, name }) => ({
  ...basicSnapshotConfig,
  name,
  url: `${PREVIEW_URL}${path}`,
}));
