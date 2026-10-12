import { emotionScenes } from "./emotion-scenes.js";
import { pageItems } from "../xr-spatial.js";

// The headset presents the same home flow; it never invents sensor readings.
export function homeXRPage(state, page = 0) {
  if (state.view === "free") {
    const slice = pageItems(emotionScenes, page, 6);
    return {
      kind: "free",
      title: "此刻，想去哪里？",
      copy: `二十四处意境 · ${slice.index + 1} / ${slice.pages}`,
      choices: slice.items.map((s) => ({
        label: `${s.name}\n${s.emotion}`,
        scene: s.id,
      })),
      pages: slice.pages,
    };
  }
  if (state.view === "wear")
    return {
      kind: "guide",
      title:
        state.guideStage === 2
          ? "请佩戴 VR 设备"
          : state.guideStage
            ? "请佩戴 ECG 脑波传感器"
            : "请走近，开启你的心境房间。",
      copy:
        state.guideStage === 2
          ? "调整头显至舒适的位置，准备进入你的心境。"
          : state.guideStage
            ? "调整至舒适的位置，保持自然呼吸。"
            : "Step closer. Enter your mood room.",
      image: "guideImage",
      choices: [
        {
          label:
            state.guideStage === 2
              ? "已佩戴，开始感应"
              : state.guideStage
                ? "准备好了"
                : "进入体验",
          action: "next",
        },
      ],
    };
  if (state.view === "sense") {
    if (state.phase === "done")
      return {
        kind: "result",
        title: `${state.selected.emotion} · ${state.selected.name}`,
        copy: state.selected.description,
        image: "artCanvas",
        choices: [{ label: "进入这处意境", scene: state.selected.id }],
      };
    return {
      kind: "sensing",
      title: "正在感受你的心境，请稍等…",
      copy: "Sensing your mood. Please wait.",
      image: "handsImage",
      choices: [],
    };
  }
  return {
    kind: "home",
    title: "心境 LOFI",
    copy: "让空间回应心情，让此刻慢下来。",
    choices: [
      { label: "脑电传感模式 · 模拟体验\nEEG SENSING MODE", action: "sense" },
      { label: "自由选择模式\nFREE SELECTION MODE", action: "free" },
    ],
  };
}
