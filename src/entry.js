const params = new URLSearchParams(location.search);
if (params.has("scene") || params.has("clean")) {
  await import("./main.js");
} else {
  const { mountHome } = await import("./ui/home.js");
  mountHome();
}
