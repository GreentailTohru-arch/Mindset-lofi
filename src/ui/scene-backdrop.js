// Each backdrop owns a daylight and moonlit palette; only presentation layers change.
export const sceneThemes = Object.fromEntries(
  [
    ["ruya", 152, 24],
    ["dongfang", 174, 30],
    ["palace", 42, 62],
    ["tibetan", 352, 36],
    ["uyghur", 190, 48],
    ["machiya", 28, 28],
    ["wabisabi", 72, 16],
    ["tropical", 140, 42],
    ["athens", 214, 44],
    ["baroque", 274, 32],
    ["french", 332, 36],
    ["mediterranean", 201, 60],
    ["renaissance", 95, 28],
    ["artdeco", 164, 48],
    ["bauhaus", 222, 30],
    ["brutalist", 230, 12],
    ["industrial", 18, 28],
    ["midcentury", 35, 38],
    ["memphis", 310, 45],
    ["bohemian", 12, 42],
    ["nordic", 183, 24],
    ["italian", 286, 24],
    ["classic", 25, 34],
    ["studio", 252, 64],
  ].map(([id, h, s]) => [
    id,
    {
      day: {
        core: `hsl(${h} ${s}% 48%)`,
        mid: `hsl(${h} ${s * 0.65}% 25%)`,
        edge: `hsl(${h} ${s * 0.5}% 12%)`,
        glow: `hsl(${h} ${s}% 65%)`,
      },
      night: {
        core: `hsl(${(h + 12) % 360} ${s * 0.8}% 24%)`,
        mid: `hsl(${(h + 8) % 360} ${s * 0.7}% 12%)`,
        edge: `hsl(${h} ${s * 0.55}% 5%)`,
        glow: `hsl(${h} ${s}% 44%)`,
      },
    },
  ]),
);

// Follow the projected bottom-plane outline instead of a screen-wide horizontal axis.
export function bottomEdgeAtX(polygon, x) {
  const crossings = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i],
      b = polygon[(i + 1) % polygon.length];
    if (Math.abs(a.x - b.x) < 1e-8) continue;
    if (x >= Math.min(a.x, b.x) && x <= Math.max(a.x, b.x))
      crossings.push(a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x));
  }
  return crossings.length ? Math.max(...crossings) : null;
}

export function mountSceneBackdrop(container, sceneId, store) {
  const theme = sceneThemes[sceneId];
  const host = document.querySelector("#experience");
  host.classList.add("themed-experience");
  const backdrop = document.createElement("div");
  backdrop.className = "scene-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  for (const mode of ["night", "day"]) {
    const layer = document.createElement("div");
    layer.className = `scene-backdrop-${mode}`;
    for (const [key, value] of Object.entries(theme[mode]))
      layer.style.setProperty(`--backdrop-${key}`, value);
    backdrop.append(layer);
  }
  host.prepend(backdrop);
  const reflection = document.createElement("canvas");
  reflection.className = "scene-reflection";
  reflection.setAttribute("aria-hidden", "true");
  container.prepend(reflection);
  const ctx = reflection.getContext("2d");
  const mask = document.createElement("canvas"),
    maskContext = mask.getContext("2d");
  function update(s) {
    host.dataset.timeOfDay = s.day ? "day" : "night";
  }
  update(store.state);
  const unsubscribe = store.subscribe(update);

  return {
    render(source, floorOutline) {
      const width = Math.max(1, Math.round(container.clientWidth * 0.6));
      const height = Math.max(1, Math.round(container.clientHeight * 0.6));
      if (reflection.width !== width || reflection.height !== height) {
        reflection.width = width;
        reflection.height = height;
        mask.width = width;
        mask.height = height;
      }
      ctx.clearRect(0, 0, width, height);
      maskContext.clearRect(0, 0, width, height);
      const depth = height * 0.25;
      // Source is already mirrored in world space; keep its perspective intact.
      ctx.drawImage(source, 0, 0, width, height);
      const minX = Math.min(...floorOutline.map((p) => p.x));
      const maxX = Math.max(...floorOutline.map((p) => p.x));
      for (let x = 0; x < width; x++) {
        const edge = bottomEdgeAtX(
          floorOutline,
          Math.max(minX + 1e-6, Math.min(maxX - 1e-6, (x + 0.5) / width)),
        );
        const anchor = (edge ?? 1) * height;
        const fade = maskContext.createLinearGradient(
          0,
          anchor,
          0,
          anchor + depth,
        );
        fade.addColorStop(0, "rgba(255,255,255,.48)");
        fade.addColorStop(0.4, "rgba(255,255,255,.2)");
        fade.addColorStop(1, "rgba(255,255,255,0)");
        maskContext.fillStyle = fade;
        maskContext.fillRect(x, anchor, 1, height - anchor);
      }
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    },
    dispose() {
      unsubscribe?.();
      reflection.remove();
      backdrop.remove();
      host.classList.remove("themed-experience");
    },
  };
}
