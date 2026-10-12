import { emotionScenes } from "./emotion-scenes.js";
import { startEmotionArt, emotionArtNames } from "./emotion-art.js";

// Destinations occupy a loose ellipsoid; depth is shared by links and canvas.
const seeds = [
  [0.48, 0.12],
  [0.34, 0.2],
  [0.63, 0.19],
  [0.21, 0.31],
  [0.46, 0.31],
  [0.77, 0.3],
  [0.58, 0.36],
  [0.33, 0.39],
  [0.13, 0.47],
  [0.7, 0.46],
  [0.87, 0.46],
  [0.47, 0.49],
  [0.25, 0.54],
  [0.6, 0.55],
  [0.37, 0.61],
  [0.78, 0.62],
  [0.13, 0.66],
  [0.51, 0.69],
  [0.66, 0.73],
  [0.27, 0.75],
  [0.42, 0.84],
  [0.57, 0.88],
  [0.83, 0.77],
  [0.69, 0.89],
];
export function mountSceneCloud(root) {
  root.innerHTML = `<canvas class="neural-space" aria-hidden="true"></canvas><div class="scene-cloud" aria-label="可拖动的场景星团"><canvas class="cloud-lines" aria-hidden="true"></canvas><nav class="cloud-nodes" aria-label="选择场景">${emotionScenes.map((s) => `<a class="cloud-node" draggable="false" href="?scene=${s.id}" aria-label="${s.name} · ${s.emotion}"><span class="cloud-orbit" aria-hidden="true"></span><span class="cloud-dot" aria-hidden="true"></span><span class="cloud-name">${s.name}</span></a>`).join("")}</nav></div><div class="cloud-caption" aria-live="polite"><span class="cloud-caption-name">二十四处意境，汇成你的星群。</span><span class="cloud-caption-detail">拖动探索星团 · 轻触光点进入 / DRAG TO EXPLORE</span></div>`;
  const cloud = root.querySelector(".scene-cloud"),
    canvas = root.querySelector(".cloud-lines"),
    ctx = canvas.getContext("2d"),
    background = root.querySelector(".neural-space"),
    bg = background.getContext("2d"),
    nodes = [...root.querySelectorAll("a")];
  root.insertAdjacentHTML(
    "beforeend",
    `<aside class="cloud-preview cloud-preview-art" aria-hidden="true"><span class="preview-eyebrow">EMOTIONAL FORM</span><canvas class="preview-art-canvas"></canvas><span class="preview-art-name"></span></aside><aside class="cloud-preview cloud-preview-info" aria-hidden="true"><span class="preview-eyebrow preview-index"></span><h3 class="preview-title"></h3><p class="preview-feeling"></p><p class="preview-description"></p><span class="preview-hint">轻触星点，进入此境 ↗</span></aside>`,
  );
  const previews = [...root.querySelectorAll(".cloud-preview")];
  const previewArt = startEmotionArt(
    root.querySelector(".preview-art-canvas"),
    document.createElement("canvas"),
  );
  let previewIndex = -1,
    previewTimer,
    leaveTimer;
  function hidePreview() {
    clearTimeout(previewTimer);
    clearTimeout(leaveTimer);
    previews.forEach((p) => {
      p.classList.remove("is-visible");
      p.setAttribute("aria-hidden", "true");
    });
    previewIndex = -1;
    previewTimer = setTimeout(() => previewArt.active(false), 280);
  }
  function showPreview(i) {
    clearTimeout(leaveTimer);
    if (i === previewIndex) return;
    const switching = previewIndex >= 0;
    clearTimeout(previewTimer);
    previews.forEach((p) => p.classList.remove("is-visible"));
    previewIndex = i;
    previewTimer = setTimeout(
      () => {
        const scene = emotionScenes[i];
        root.querySelector(".preview-art-name").textContent =
          emotionArtNames[i];
        root.querySelector(".preview-index").textContent =
          `${String(i + 1).padStart(2, "0")} / 24 — SCENE`;
        root.querySelector(".preview-title").textContent = scene.name;
        root.querySelector(".preview-feeling").textContent = scene.emotion;
        root.querySelector(".preview-description").textContent =
          scene.description;
        previewArt.setEmotion(i);
        previewArt.active(true);
        previews.forEach((p) => {
          p.classList.add("is-visible");
          p.setAttribute("aria-hidden", "false");
        });
      },
      switching ? 280 : 70,
    );
  }
  const points = seeds.map(([x, y], i) => ({
    x: (x - 0.5) * 2,
    y: (y - 0.5) * 2,
    z: Math.sin(i * 2.399) * 0.28,
  }));
  const edges = new Set();
  points.forEach((p, i) =>
    points
      .map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z) }))
      .filter((q) => q.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .forEach(({ j }) =>
        edges.add([Math.min(i, j), Math.max(i, j)].join(":")),
      ),
  );
  const links = [...edges].map((e) => e.split(":").map(Number));
  const dust = Array.from({ length: 160 }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
    v: 0.015 + Math.random() * 0.025,
  }));
  let width = 0,
    height = 0,
    bw = 0,
    bh = 0,
    active = -1,
    frame = 0,
    last = 0,
    time = 0,
    layoutTime = 0,
    yaw = 0,
    pitch = 0,
    vx = 0,
    vy = 0,
    drag = null,
    suppressClick = false,
    disposed = false;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function size(c, w, h) {
    const d = Math.min(devicePixelRatio, 1.75);
    if (c.width === Math.round(w * d) && c.height === Math.round(h * d)) return;
    c.width = Math.round(w * d);
    c.height = Math.round(h * d);
    c.getContext("2d").setTransform(d, 0, 0, d, 0, 0);
  }
  function resize() {
    const r = cloud.getBoundingClientRect();
    width = r.width;
    height = r.height;
    bw = innerWidth;
    bh = innerHeight;
    if (width && height) {
      size(canvas, width, height);
      size(background, bw, bh);
    }
  }
  function glow(c, x, y, r, alpha) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(235,235,235,${alpha})`);
    g.addColorStop(1, "rgba(235,235,235,0)");
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function draw(now) {
    frame = 0;
    if (
      disposed ||
      !root.isConnected ||
      !width ||
      !height ||
      root.closest("[hidden]") ||
      document.hidden
    )
      return;
    const dt = Math.min((now - last) / 1000 || 0, 0.035);
    last = now;
    if (!reduced.matches) {
      time += dt;
      if (!drag && active < 0) {
        layoutTime += dt;
        yaw += vx + dt * 0.014;
        pitch += vy;
        vx *= 0.93;
        vy *= 0.93;
      }
    }
    pitch = Math.max(-0.65, Math.min(0.65, pitch));
    bg.clearRect(0, 0, bw, bh);
    glow(bg, bw * 0.5, bh * 0.5, Math.max(bw, bh) * 0.44, 0.045);
    const stars = dust.map((p, i) => {
      if (!reduced.matches) {
        p.z -= dt * p.v;
        if (p.z < 0.08) {
          p.z = 1;
          p.x = Math.random();
          p.y = Math.random();
        }
      }
      const scale = 1 / (p.z + 0.35);
      return {
        x: bw * 0.5 + (p.x - 0.5) * bw * scale,
        y: bh * 0.5 + (p.y - 0.5) * bh * scale,
        z: p.z,
      };
    });
    stars.forEach((p, i) => {
      const a = 0.15 + (1 - p.z) * 0.45;
      bg.fillStyle = `rgba(235,235,235,${a})`;
      bg.beginPath();
      bg.arc(p.x, p.y, 0.4 + (1 - p.z) * 1.25, 0, Math.PI * 2);
      bg.fill();
      if (i % 7 === 0) {
        glow(bg, p.x, p.y, 10, 0.1);
        for (let j = i + 1; j < stars.length; j += 3) {
          const q = stars[j],
            d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 110) {
            bg.strokeStyle = `rgba(225,225,225,${(1 - d / 110) * 0.16})`;
            bg.beginPath();
            bg.moveTo(p.x, p.y);
            bg.lineTo(q.x, q.y);
            bg.stroke();
          }
        }
      }
    });
    ctx.clearRect(0, 0, width, height);
    const projected = points.map((p, i) => {
      const x = p.x * Math.cos(yaw) + p.z * Math.sin(yaw),
        z = -p.x * Math.sin(yaw) + p.z * Math.cos(yaw),
        y = p.y * Math.cos(pitch) - z * Math.sin(pitch),
        depth = p.y * Math.sin(pitch) + z * Math.cos(pitch),
        s = 1 / (1 - depth * 0.2);
      return {
        x:
          width / 2 + x * width * 0.45 * s + Math.sin(layoutTime * 0.5 + i) * 3,
        y:
          height / 2 +
          y * height * 0.45 * s +
          Math.cos(layoutTime * 0.4 + i) * 4,
        z: depth,
        s,
      };
    });
    // Fine concentric dust streams give the constellation an orbital silhouette.
    for (let i = 0; i < 170; i++) {
      const a = i * 2.399 + time * 0.025,
        r = 0.35 + (i % 23) / 35,
        x = width / 2 + Math.cos(a) * width * 0.41 * r,
        y = height / 2 + Math.sin(a) * height * 0.41 * r;
      ctx.fillStyle = `rgba(235,235,235,${0.08 + (i % 5) * 0.025})`;
      ctx.fillRect(x, y, 1, 1);
    }
    links.forEach(([a, b], i) => {
      const p = projected[a],
        q = projected[b],
        lit = a === active || b === active;
      ctx.strokeStyle = `rgba(235,235,235,${lit ? 0.65 : 0.16})`;
      ctx.lineWidth = lit ? 1 : 0.65;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
      const t = (time * 0.16 + i * 0.173) % 1;
      glow(
        ctx,
        p.x + (q.x - p.x) * t,
        p.y + (q.y - p.y) * t,
        lit ? 7 : 4,
        lit ? 0.75 : 0.4,
      );
    });
    projected.forEach((p, i) => {
      const node = nodes[i];
      node.style.left = `${p.x}px`;
      node.style.top = `${p.y}px`;
      node.style.setProperty("--depth", p.s);
      node.style.opacity = String(0.68 + (p.z + 0.8) * 0.2);
      node.style.zIndex = String(i === active ? 100 : Math.round(10 + p.z * 5));
      glow(
        ctx,
        p.x,
        p.y,
        i === active ? 38 : 19,
        0.09 + (Math.sin(time * 1.2 + i) + 1) * 0.025,
      );
    });
    if (!reduced.matches) frame = requestAnimationFrame(draw);
  }
  function refresh() {
    resize();
    if (!frame && !disposed) {
      last = performance.now();
      frame = requestAnimationFrame(draw);
    }
  }
  function highlight(i) {
    active = i;
    if (i >= 0) showPreview(i);
    else hidePreview();
    nodes.forEach((n, j) => n.classList.toggle("is-active", i === j));
    root.querySelector(".cloud-caption-name").textContent =
      i < 0 ? "二十四处意境，汇成你的星群。" : emotionScenes[i].name;
    root.querySelector(".cloud-caption-detail").textContent =
      i < 0
        ? "拖动探索星团 · 轻触光点进入 / DRAG TO EXPLORE"
        : emotionScenes[i].description;
    if (reduced.matches) refresh();
  }
  nodes.forEach((n, i) => {
    n.addEventListener("pointerenter", () => {
      if (!drag) highlight(i);
    });
    n.addEventListener("pointerleave", () => {
      leaveTimer = setTimeout(() => highlight(-1), 80);
    });
    n.addEventListener("focus", () => {
      if (n.matches(":focus-visible")) highlight(i);
    });
    n.addEventListener("blur", () => highlight(-1));
  });
  cloud.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    suppressClick = false;
    vx = vy = 0;
  });
  cloud.addEventListener("pointermove", (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6) {
      if (!drag.moved) highlight(-1);
      drag.moved = true;
      cloud.setPointerCapture(e.pointerId);
      cloud.classList.add("is-dragging");
    }
    if (drag.moved) {
      vx = (e.clientX - drag.x) * 0.004;
      vy = (e.clientY - drag.y) * 0.003;
      yaw += vx;
      pitch += vy;
      refresh();
    }
    drag.x = e.clientX;
    drag.y = e.clientY;
  });
  function release(e) {
    if (!drag || drag.id !== e.pointerId) return;
    suppressClick = drag.moved;
    drag = null;
    cloud.classList.remove("is-dragging");
    if (cloud.hasPointerCapture(e.pointerId))
      cloud.releasePointerCapture(e.pointerId);
  }
  cloud.addEventListener("pointerup", release);
  cloud.addEventListener("pointercancel", release);
  cloud.addEventListener(
    "click",
    (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopImmediatePropagation();
        suppressClick = false;
      }
    },
    true,
  );
  cloud.addEventListener("pointerleave", () => {
    if (!drag) highlight(-1);
  });
  cloud.addEventListener("dragstart", (e) => e.preventDefault());
  const observer = new ResizeObserver(refresh);
  observer.observe(cloud);
  document.addEventListener("visibilitychange", refresh);
  reduced.addEventListener("change", refresh);
  return {
    refresh,
    hidePreview,
    dispose() {
      disposed = true;
      clearTimeout(previewTimer);
      clearTimeout(leaveTimer);
      previewArt.dispose();
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", refresh);
      reduced.removeEventListener("change", refresh);
    },
  };
}
