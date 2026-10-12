import test from "node:test";
import assert from "node:assert/strict";
import { homeXRPage } from "../src/ui/home-xr-pages.js";
import { emotionScenes } from "../src/ui/emotion-scenes.js";

test("VR free selection reaches all 24 destinations and wraps both ways", () => {
  const seen = Array.from(
    { length: 4 },
    (_, page) => homeXRPage({ view: "free" }, page).choices,
  ).flat();
  assert.deepEqual(
    seen.map((c) => c.scene),
    emotionScenes.map((s) => s.id),
  );
  assert.deepEqual(
    homeXRPage({ view: "free" }, -1),
    homeXRPage({ view: "free" }, 3),
  );
  assert.deepEqual(
    homeXRPage({ view: "free" }, 4),
    homeXRPage({ view: "free" }, 0),
  );
});

test("VR sensing follows shared stages and preserves the selected result", () => {
  const welcome = homeXRPage({ view: "home" });
  assert.deepEqual(
    welcome.choices.map((c) => c.action),
    ["sense", "free"],
  );
  assert.match(welcome.choices[0].label, /模拟体验/);
  const arrival = homeXRPage({ view: "wear", guideStage: 0 });
  const wear = homeXRPage({ view: "wear", guideStage: 1 });
  assert.match(arrival.title, /请走近/);
  assert.match(wear.title, /请佩戴/);
  assert.equal(wear.choices[0].action, "next");
  const sensing = homeXRPage({ view: "sense", phase: "sensing" });
  assert.equal(sensing.image, "handsImage");
  assert.deepEqual(sensing.choices, []);
  const selected = emotionScenes[9];
  const result = homeXRPage({ view: "sense", phase: "done", selected });
  assert.equal(result.choices[0].scene, selected.id);
  assert.equal(result.copy, selected.description);
  assert.equal(result.image, "artCanvas");
});

test("VR headset preparation follows ECG preparation", () => {
  const page = homeXRPage({ view: "wear", guideStage: 2 });
  assert.equal(page.title, "请佩戴 VR 设备");
  assert.equal(page.image, "guideImage");
  assert.equal(page.choices[0].label, "已佩戴，开始感应");
  assert.equal(page.choices[0].action, "next");
});
