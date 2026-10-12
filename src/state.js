export const defaults = Object.freeze({
  rgbMode: "static",
  rgbColor: "#ed79ef",
  rgbBrightness: 0.6,
  rgbSpeed: 0.5,
  whiteOn: true,
  whiteTemp: "2700",
  whiteBrightness: 0.55,
  curtains: true,
  window: false,
  ac: false,
  day: false,
  weather: "clear",
  bedLamp: true,
  floorLamp: true,
  wardrobe: false,
  drawer: false,
  pc: true,
  screen: 0,
  floorStyle: "original",
});
export function createStore(
  sceneDefaults = defaults,
  { rgbEnabled = true, dayNightLighting = false } = {},
) {
  const initial = { ...defaults, ...sceneDefaults };
  const nightRgbMode =
    initial.rgbMode === "off" ? defaults.rgbMode : initial.rgbMode;
  if (dayNightLighting) {
    initial.whiteOn = initial.bedLamp = initial.floorLamp = !initial.day;
    if (initial.day) initial.rgbMode = "off";
  }
  if (!rgbEnabled) {
    initial.rgbMode = "off";
    initial.rgbBrightness = 0;
  }
  const state = { ...initial };
  let lastBrightness = initial.whiteBrightness || defaults.whiteBrightness;
  let lastRgbMode = nightRgbMode;
  let lastRgbBrightness = initial.rgbBrightness || defaults.rgbBrightness;
  const wakeWhite = () => {
    state.whiteOn = true;
    if (state.whiteBrightness === 0) state.whiteBrightness = lastBrightness;
  };
  const listeners = new Set();
  return {
    state,
    wakeFixture() {
      wakeWhite();
      listeners.forEach((fn) => fn(state, "fixture"));
    },
    set(key, value) {
      if (!(key in defaults)) return;
      if (dayNightLighting) {
        if (key === "whiteBrightness" && value > 0) lastBrightness = value;
        if (key === "rgbMode" && value !== "off") lastRgbMode = value;
        if (key === "rgbBrightness" && value > 0) lastRgbBrightness = value;
        if (key === "day" && value !== state.day) {
          state.whiteOn = state.bedLamp = state.floorLamp = !value;
          if (!value) wakeWhite();
          if (rgbEnabled) {
            state.rgbMode = value ? "off" : lastRgbMode;
            if (!value && state.rgbBrightness === 0)
              state.rgbBrightness = lastRgbBrightness;
          }
        } else if (key === "whiteBrightness" && value === 0) {
          state.whiteOn = state.bedLamp = state.floorLamp = false;
        } else if (key === "whiteBrightness" && value > 0 && !state.whiteOn) {
          state.whiteOn = state.bedLamp = state.floorLamp = true;
        } else if (key === "whiteOn") {
          state.bedLamp = state.floorLamp = Boolean(value);
          if (value) wakeWhite();
        } else if ((key === "bedLamp" || key === "floorLamp") && value) {
          wakeWhite();
        }
      }
      if (!rgbEnabled && key === "rgbMode") value = "off";
      if (!rgbEnabled && key === "rgbBrightness") value = 0;
      state[key] = value;
      listeners.forEach((fn) => fn(state, key));
    },
    reset() {
      Object.assign(state, initial);
      lastBrightness = initial.whiteBrightness || defaults.whiteBrightness;
      lastRgbMode = nightRgbMode;
      lastRgbBrightness = initial.rgbBrightness || defaults.rgbBrightness;
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
