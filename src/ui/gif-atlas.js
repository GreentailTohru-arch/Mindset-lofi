// Explicit GIF frame timing: drawing an animated HTMLImageElement to a canvas
// can return only its first frame on headset browsers.
export function animationFrame(durations, milliseconds) {
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  if (!total) return 0;
  let time = ((milliseconds % total) + total) % total;
  for (let i = 0; i < durations.length; i++) {
    if (time < durations[i]) return i;
    time -= durations[i];
  }
  return durations.length - 1;
}
export function createAnimationAtlases() {
  const ready = new Map(), pending = new Map();
  let disposed = false;
  function load(source) {
    const name = source?.split('/').pop()?.replace(/\.gif(?:\?.*)?$/, '');
    if (!name || pending.has(name)) return name;
    const base = `./images/xr/${name}`;
    const promise = Promise.all([
      fetch(`${base}.json`).then(r => { if (!r.ok) throw new Error('Animation timing unavailable'); return r.json(); }),
      new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = `${base}.png`; }),
    ]).then(([meta,image]) => { if (!disposed) ready.set(name, {meta,image}); }).catch(() => {});
    pending.set(name,promise);
    return name;
  }
  return {
    draw(ctx, source, milliseconds, width, height) {
      const item = ready.get(load(source));
      if (!item) return null;
      const {meta,image} = item;
      const frame = animationFrame(meta.durations,milliseconds);
      const ratio = Math.min(width/meta.width,height/meta.height);
      ctx.drawImage(image,(frame%meta.columns)*meta.width,Math.floor(frame/meta.columns)*meta.height,meta.width,meta.height,(width-meta.width*ratio)/2,(height-meta.height*ratio)/2,meta.width*ratio,meta.height*ratio);
      return frame;
    },
    preload: load,
    dispose() { disposed = true; ready.clear(); pending.clear(); },
  };
}
