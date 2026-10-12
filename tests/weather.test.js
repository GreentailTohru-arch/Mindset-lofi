import test from "node:test";
import assert from "node:assert/strict";
import { outsideRoom, makeWeatherParticle, WEATHER_GROUND } from "../src/ui/weather.js";
import { createStore } from "../src/state.js";

test("rain and snow spawn outside the room and land on the scene base plane", () => {
  assert.equal(WEATHER_GROUND, -0.35);
  for (let i = 0; i < 3000; i++) {
    const p = makeWeatherParticle();
    assert.ok(outsideRoom(p.x, p.z));
    assert.ok(p.y >= WEATHER_GROUND && p.y <= WEATHER_GROUND + 13);
  }
  assert.equal(outsideRoom(0, 0), false);
  assert.equal(outsideRoom(5.175, -5.175), false);
});
test("weather changes preserve manual lighting and day/night state", () => {
  const store = createStore(undefined, { dayNightLighting: true });
  store.set("day", true);
  store.set("bedLamp", true);
  const before = { ...store.state };
  for (const mode of ["rain", "snow", "clear"]) {
    store.set("weather", mode);
    assert.deepEqual(store.state, { ...before, weather: mode });
  }
});
