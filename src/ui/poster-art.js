// Reference-poster coordinates, shared by the DOM and the spatial canvas.
export const posterAssets = {
  posterWordmark: "./images/brand/poster-wordmark.png",
  posterLockup: "./images/brand/poster-lockup.png",
  posterSubtitle: "./images/brand/poster-subtitle.png",
  posterCredits: "./images/brand/poster-credits.png",
  posterSlogan: "./images/brand/poster-slogan.png",
};
const parts = [
  { key: "posterWordmark", crop: [0, 0, 930, 795], rect: [105, 40, 345, 295] },
  { key: "posterWordmark", crop: [1180, 0, 1033, 795], rect: [250, 365, 350, 270] },
  { key: "posterSlogan", rect: [635, 430, 120, 204] },
  { key: "posterLockup", rect: [70, 708, 860, 283] },
  { key: "posterSubtitle", rect: [70, 1115, 860, 129] },
  { key: "posterCredits", rect: [70, 1260, 860, 131] },
];
export function posterMarkup() {
  const body = parts.map(({key, crop, rect: [x,y,w,h]}) => crop
    ? `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${crop.join(" ")}"><image href="${posterAssets[key]}" width="2213" height="795"/></svg>`
    : `<image href="${posterAssets[key]}" x="${x}" y="${y}" width="${w}" height="${h}"/>`).join("");
  return `<svg class="reference-poster" viewBox="0 0 1000 1414" role="img" aria-label="心境 · The Mindset of Low Fidelity。回归本真。沉浸式专注空间疗愈体验。Powered by EGG × VR">${body}</svg>`;
}
export function drawReferencePoster(ctx, images, x, y, w, h) {
  ctx.save(); ctx.translate(x,y); ctx.scale(w / 1000, h / 1414); ctx.filter = "invert(1)";
  for (const {key, crop, rect} of parts) {
    if (!images[key]) continue;
    if (crop) ctx.drawImage(images[key], ...crop, ...rect);
    else ctx.drawImage(images[key], ...rect);
  }
  ctx.restore();
}
