import test from "node:test";
import assert from "node:assert/strict";
import { emotionScenes, randomEmotion } from "../src/ui/emotion-scenes.js";
import { moodOrder } from "../src/ui/mood-config.js";

test("each navigable scene has a unique feeling and recommendation", () => {
  assert.deepEqual(
    emotionScenes.map((s) => s.id),
    moodOrder,
  );
  assert.equal(new Set(emotionScenes.map((s) => s.emotion)).size, 24);
  assert.ok(emotionScenes.every((s) => s.name && s.description));
});
test("simulation can reach every scene and avoids immediate repetition", () => {
  for (const previous of emotionScenes) {
    const results = new Set(
      Array.from(
        { length: 23 },
        (_, index) => randomEmotion(previous.id, () => (index + 0.5) / 23).id,
      ),
    );
    assert.equal(results.size, 23);
    assert.equal(results.has(previous.id), false);
  }
});
