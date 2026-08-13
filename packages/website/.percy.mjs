const { PREVIEW_URL } = process.env;

console.info(`✅ Using preview URL: ${PREVIEW_URL}`);

const pages = [
  { path: "/", name: "homepage" },
  { path: "/mentions-legales", name: "mentions-legales" },
];

export default pages.map(({ path, name }) => ({
  name,
  url: `${PREVIEW_URL}${path}`,
}));
