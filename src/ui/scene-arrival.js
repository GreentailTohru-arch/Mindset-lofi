// Keep one opaque surface in the same document until the room has rendered.
export async function enterSceneSmoothly(id) {
  const veil = document.createElement("div");
  veil.id = "scene-arrival";
  veil.setAttribute("role", "status");
  veil.setAttribute("aria-label", "正在进入意境");
  veil.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;background:#080808;opacity:0;transition:opacity 800ms cubic-bezier(.4,0,.2,1);display:grid;place-content:center;color:#eee;font:14px sans-serif;text-align:center";
  document.body.append(veil);
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
  veil.style.opacity = "1";
  await new Promise((resolve) => setTimeout(resolve, 820));
  const guard = document.createElement("style");
  guard.textContent = "#loading{visibility:hidden!important}";
  document.head.append(guard);
  let failTimer;
  const onReady = async () => {
    clearTimeout(failTimer);
    // Allow the existing loading overlay to finish removal beneath the veil.
    await new Promise((resolve) => setTimeout(resolve, 600));
    veil.style.opacity = "0";
    setTimeout(() => {
      veil.remove();
      guard.remove();
    }, 850);
  };
  const fail = () => {
    window.removeEventListener("stillroom:ready", onReady);
    veil.replaceChildren();
    const message = document.createElement("p");
    message.textContent = "空间暂未就绪，请重新进入。";
    const retry = document.createElement("button");
    retry.textContent = "重新进入";
    retry.onclick = () => location.reload();
    veil.append(message, retry);
  };
  window.addEventListener("stillroom:ready", onReady, { once: true });
  failTimer = setTimeout(fail, 30000);
  document
    .querySelectorAll('link[rel="stylesheet"],style[data-vite-dev-id]')
    .forEach((node) => {
      if (
        (node.href || node.dataset.viteDevId || "").match(
          /(?:\/home[-.]|\/home\.css)/,
        )
      )
        node.remove();
    });
  history.pushState({}, "", `?scene=${encodeURIComponent(id)}`);
  window.addEventListener("popstate", () => location.reload(), { once: true });
  try {
    await import("../main.js");
  } catch (error) {
    clearTimeout(failTimer);
    console.error(error);
    fail();
  }
}
