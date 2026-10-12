import { sceneCopy } from "./scene-copy.js";

// Experience mappings, not sensor measurements or clinical classifications.
export const emotionScenes = [
  ["ruya", "儒风雅韵", "思绪纷繁"],
  ["dongfang", "东方美学", "渴望平衡"],
  ["palace", "金碧辉煌", "需要鼓舞"],
  ["tibetan", "藏式", "心神不定"],
  ["uyghur", "维吾尔", "期待远行"],
  ["machiya", "日式町屋", "想要独处"],
  ["wabisabi", "侘寂风", "有些紧绷"],
  ["tropical", "东南亚风", "感到疲惫"],
  ["athens", "雅典神话", "心怀向往"],
  ["baroque", "巴洛克", "情绪饱满"],
  ["french", "法式复古", "渴望浪漫"],
  ["mediterranean", "地中海风", "有些烦闷"],
  ["renaissance", "美式田园", "想念归属"],
  ["artdeco", "装饰艺术", "期待仪式感"],
  ["bauhaus", "包豪斯", "需要专注"],
  ["brutalist", "粗野主义", "需要踏实"],
  ["industrial", "工业风", "蓄势待发"],
  ["midcentury", "中古风", "怀念过去"],
  ["memphis", "孟菲斯风格", "愉悦开心"],
  ["bohemian", "波西米亚", "渴望自由"],
  ["nordic", "北欧风", "想要清爽"],
  ["italian", "意式轻奢", "想宠爱自己"],
  ["classic", "温馨卧室", "想要休息"],
  ["studio", "电竞影音", "充满活力"],
].map(([id, name, emotion]) => ({
  id,
  name,
  emotion,
  description: sceneCopy[id][0],
}));

export function randomEmotion(previousId, random = Math.random) {
  const choices = emotionScenes.filter((scene) => scene.id !== previousId);
  return choices[
    Math.min(choices.length - 1, Math.floor(random() * choices.length))
  ];
}
