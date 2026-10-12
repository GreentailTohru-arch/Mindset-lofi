import { sceneCopy } from "./scene-copy.js";

export const sceneStories = Object.fromEntries(
  Object.entries(sceneCopy).map(([id, [, story, design]]) => [id, [story, design]]),
);

export function greetingForHour(hour) {
  if (hour >= 6 && hour < 12) return "清风初醒，开启美好的一天。";
  if (hour >= 12 && hour < 18) return "午后惬意，放慢生活的脚步。";
  if (hour >= 18 && hour < 22) return "暮色渐起，享受片刻宁静。";
  return "夜深了，该休息了，祝好梦。";
}
