export const defaults = Object.freeze({
  rgbMode: "aurora",
  rgbColor: "#a58bfa",
  rgbBrightness: 0.6,
  rgbSpeed: 0.5,
  whiteOn: true,
  whiteTemp: "2700",
  whiteBrightness: 0.55,
  curtains: true,
  window: false,
  ac: false,
  day: false,
  bedLamp: true,
  floorLamp: true,
  wardrobe: false,
  drawer: false,
  pc: true,
  screen: 0,
});
export function createStore() {
  const state = { ...defaults };
  const listeners = new Set();
  return {
    state,
    set(key, value) {
      if (!(key in defaults)) return;
      state[key] = value;
      listeners.forEach((fn) => fn(state, key));
    },
    reset() {
      Object.assign(state, defaults);
      listeners.forEach((fn) => fn(state, "reset"));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
export const rgbModes = {
  static: "静态单色",
  breathing: "呼吸灯",
  rainbow: "彩虹渐变",
  wave: "流动波浪",
  aurora: "极光",
  random: "柔和变色",
  off: "关闭",
};
export function damp(current, target, delta, speed = 4) {
  return current + (target - current) * (1 - Math.exp(-speed * delta));
}
// Pure light envelope, shared by render code and regression checks.
export function rgbEnvelope(mode, time) {
  if (mode === "off") return 0;
  if (mode === "breathing") return 0.22 + 0.78 * (0.5 + Math.sin(time) * 0.5);
  return 1;
}
