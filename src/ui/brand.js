import { posterAssets } from "./poster-art.js";
// Shared identity, adapted independently for a screen and a room-sized surface.
export const brand = {
  wordmark: "./images/brand/mindset-wordmark.png",
  symbol: "./images/brand/mindset-symbol.png",
  slogan: "回归本真",
  english: "Reconnect Your True Self",
  subtitle: "沉浸式专注空间疗愈体验",
};

export function loadBrandImages(redraw) {
  const images = {};
  if (typeof Image === "undefined") return images;
  for (const key of ["wordmark", "symbol", ...Object.keys(posterAssets)]) {
    const image = new Image();
    image.onload = () => {
      images[key] = image;
      redraw();
    };
    image.src = brand[key] || posterAssets[key];
  }
  if (typeof document !== "undefined" && document.fonts?.load) {
    Promise.all([
      document.fonts.load('16px "Mindset Times"'),
      document.fonts.load('16px "Mindset Song"'),
      document.fonts.load('16px "Mindset Qingke"'),
      document.fonts.load('16px "Mindset Samsung"'),
    ]).then(redraw).catch(() => {});
  }
  return images;
}

export function brandWordmark(ctx, images, x, y, w, light = false) {
  ctx.save();
  if (images.wordmark) {
    ctx.filter = light ? "invert(1)" : "none";
    ctx.drawImage(images.wordmark, x, y, w, (w * 795) / 2213);
  } else {
    ctx.fillStyle = light ? "#f1f4ec" : "#142b29";
    ctx.font = `${w * 0.33}px SimSun, serif`;
    ctx.fillText("心境", x, y + w * 0.3);
  }
  ctx.restore();
}

export function posterText(
  ctx,
  text,
  x,
  y,
  size,
  color = "#183b37",
  serif = false,
) {
  ctx.fillStyle = color;
  const family = text === brand.subtitle ? '"Mindset Qingke", SimSun, serif'
    : text === brand.slogan ? '"Mindset Song", SimSun, "Songti SC", serif'
    : /Powered by|Tomatotodo/i.test(text) ? '"Mindset Samsung", sans-serif'
    : /[A-Za-z]/.test(text) ? '"Mindset Times", "Mindset Qingke", serif'
    : '"Mindset Qingke", serif';
  ctx.font = `400 ${size}px ${family}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
}

// Artwork sits above the physical buttons; text is never baked into furniture.
export function paintRoomIdentity(ctx, images, kind, name, intro) {
  const w = ctx.canvas.width,
    h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.scale(w / 1200, h / 950);
  const mint = ctx.createLinearGradient(0, 0, 900, 950);
  mint.addColorStop(0, "#70beb6");
  mint.addColorStop(0.7, "#d7e8df");
  mint.addColorStop(1, "#f0eee4");
  ctx.fillStyle = mint;
  ctx.fillRect(0, 0, 1200, 950);
  posterText(
    ctx,
    kind === "story" ? "01 / THE SPACE" : "02 / THE ATMOSPHERE",
    66,
    70,
    25,
  );
  posterText(ctx, "MINDSET OF LO-FI", 795, 70, 23, "#183b37", true);
  ctx.strokeStyle = "#234b4944";
  ctx.beginPath();
  ctx.moveTo(65, 100);
  ctx.lineTo(1135, 100);
  ctx.stroke();
  brandWordmark(ctx, images, 65, 145, 315);
  posterText(ctx, "THE MINDSET", 450, 194, 62, "#173430", true);
  posterText(ctx, "OF LOW FIDELITY", 450, 259, 46, "#173430", true);
  posterText(
    ctx,
    kind === "story" ? name : "光影与天气",
    65,
    430,
    83,
    "#142c2b",
    true,
  );
  posterText(
    ctx,
    kind === "story" ? "A PLACE TO SLOW DOWN" : "MAKE THE MOMENT YOURS",
    68,
    485,
    27,
  );
  const lines = String(intro).match(/.{1,23}/gu) || [];
  lines
    .slice(0, 3)
    .forEach((line, i) => posterText(ctx, line, 68, 565 + i * 48, 31));
  ctx.strokeStyle = "#234b4933";
  ctx.beginPath();
  ctx.moveTo(65, 755);
  ctx.lineTo(1135, 755);
  ctx.stroke();
  posterText(ctx, brand.slogan, 65, 835, 54, "#183b37", true);
  posterText(ctx, "Reconnect", 430, 815, 26, "#183b37", true);
  posterText(ctx, "Your True Self", 430, 851, 26, "#183b37", true);
  if (images.symbol) ctx.drawImage(images.symbol, 930, 775, 200, 94);
  ctx.restore();
}
