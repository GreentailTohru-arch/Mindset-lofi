import test from "node:test";
import assert from "node:assert/strict";
import { defaults as classicDefaults } from "../src/model-library/state.js";
import {
  createStore,
  defaults,
  damp,
  rgbEnvelope,
  rgbModes,
} from "../src/state.js";
test("RGB controls preserve white lighting and furniture state", () => {
  const s = createStore();
  s.set("whiteTemp", "6000");
  s.set("whiteBrightness", 0.23);
  s.set("ac", true);
  for (const mode of Object.keys(rgbModes)) {
    s.set("rgbMode", mode);
    s.set("rgbBrightness", 0);
    assert.equal(s.state.whiteOn, true);
    assert.equal(s.state.whiteTemp, "6000");
    assert.equal(s.state.whiteBrightness, 0.23);
    assert.equal(s.state.ac, true);
  }
});
test("white light controls preserve RGB settings", () => {
  const s = createStore();
  s.set("rgbMode", "wave");
  s.set("rgbColor", "#123456");
  s.set("whiteOn", false);
  assert.equal(s.state.rgbMode, "wave");
  assert.equal(s.state.rgbColor, "#123456");
});
test("each scene resets to its own lighting defaults", () => {
  const studio = createStore();
  const classic = createStore(classicDefaults);
  studio.set("rgbMode", "off");
  classic.set("rgbMode", "off");
  studio.reset();
  classic.reset();
  assert.equal(studio.state.rgbMode, "static");
  assert.equal(classic.state.rgbMode, "aurora");
  assert.equal(studio.state.rgbColor, "#ed79ef");
  assert.equal(classic.state.rgbColor, "#a58bfa");
  classic.set("drawer", true);
  assert.equal(studio.state.drawer, false);
});
test("reset restores every light and interactive furniture state and notifies once", () => {
  const s = createStore();
  const reference = s.state;
  for (const key of ["ac", "day", "wardrobe", "drawer", "window"])
    s.set(key, true);
  s.set("screen", 2);
  s.set("pc", false);
  s.set("rgbMode", "off");
  let calls = 0;
  s.subscribe((state, key) => {
    calls++;
    assert.equal(key, "reset");
  });
  s.reset();
  assert.deepEqual(s.state, defaults);
  assert.equal(s.state, reference);
  assert.equal(calls, 1);
});
test("light easing is frame-rate independent and cannot overshoot", () => {
  let a = 0,
    b = 0;
  for (let i = 0; i < 30; i++) a = damp(a, 1, 1 / 30);
  for (let i = 0; i < 120; i++) b = damp(b, 1, 1 / 120);
  assert.ok(Math.abs(a - b) < 1e-10);
  assert.ok(a > 0 && a < 1);
  assert.equal(damp(1, 0, 0), 1);
});
test("breathing remains gentle and off emits no light", () => {
  for (let t = 0; t < 100; t += 0.1) {
    assert.ok(rgbEnvelope("breathing", t) >= 0.22);
    assert.ok(rgbEnvelope("breathing", t) <= 1);
    assert.equal(rgbEnvelope("off", t), 0);
  }
});
