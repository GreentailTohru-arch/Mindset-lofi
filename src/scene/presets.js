import * as uyghurMaterials from "./uyghur/materials.js";
import * as uyghurRoom from "./uyghur/room.js";
import * as uyghurFurniture from "./uyghur/furniture.js";
import * as uyghurLighting from "./uyghur/lighting.js";
import * as tibetanMaterials from "./tibetan/materials.js";
import * as tibetanRoom from "./tibetan/room.js";
import * as tibetanFurniture from "./tibetan/furniture.js";
import * as tibetanLighting from "./tibetan/lighting.js";
import * as brutalistMaterials from "./brutalist/materials.js";
import * as brutalistRoom from "./brutalist/room.js";
import * as brutalistFurniture from "./brutalist/furniture.js";
import * as brutalistLighting from "./brutalist/lighting.js";
import * as memphisMaterials from "./memphis/materials.js";
import * as memphisRoom from "./memphis/room.js";
import * as memphisFurniture from "./memphis/furniture.js";
import * as memphisLighting from "./memphis/lighting.js";
import * as tropicalMaterials from "./tropical/materials.js";
import * as tropicalRoom from "./tropical/room.js";
import * as tropicalFurniture from "./tropical/furniture.js";
import * as tropicalLighting from "./tropical/lighting.js";
import * as studioMaterials from "./materials.js";
import * as studioRoom from "./room.js";
import * as studioFurniture from "./reference-furniture.js";
import * as studioLighting from "./lighting.js";
import * as classicMaterials from "../model-library/lofi-v1/materials.js";
import * as classicRoom from "../model-library/lofi-v1/room.js";
import * as classicFurniture from "../model-library/lofi-v1/furniture.js";
import * as classicLighting from "../model-library/lofi-v1/lighting.js";
import { defaults } from "../state.js";
import { defaults as classicDefaults } from "../model-library/state.js";
import * as ruyaMaterials from "./ruya/materials.js";
import * as ruyaRoom from "./ruya/room.js";
import * as ruyaFurniture from "./ruya/furniture.js";
import * as ruyaLighting from "./ruya/lighting.js";
import * as renaissanceMaterials from "./country/materials.js";
import * as renaissanceRoom from "./country/room.js";
import * as renaissanceFurniture from "./country/furniture.js";
import * as renaissanceLighting from "./country/lighting.js";
import * as athensMaterials from "./athens/materials.js";
import * as athensRoom from "./athens/room.js";
import * as athensFurniture from "./athens/furniture.js";
import * as athensLighting from "./athens/lighting.js";
import * as palaceMaterials from "./palace/materials.js";
import * as palaceRoom from "./palace/room.js";
import * as palaceFurniture from "./palace/furniture.js";
import * as palaceLighting from "./palace/lighting.js";
import * as bauhausMaterials from "./bauhaus/materials.js";
import * as bauhausRoom from "./bauhaus/room.js";
import * as bauhausFurniture from "./bauhaus/furniture.js";
import * as bauhausLighting from "./bauhaus/lighting.js";
import * as baroqueMaterials from "./baroque/materials.js";
import * as baroqueRoom from "./baroque/room.js";
import * as baroqueFurniture from "./baroque/furniture.js";
import * as baroqueLighting from "./baroque/lighting.js";
import * as wabisabiMaterials from "./wabisabi/materials.js";
import * as wabisabiRoom from "./wabisabi/room.js";
import * as wabisabiFurniture from "./wabisabi/furniture.js";
import * as wabisabiLighting from "./wabisabi/lighting.js";
import * as machiyaMaterials from "./machiya/materials.js";
import * as machiyaRoom from "./machiya/room.js";
import * as machiyaFurniture from "./machiya/furniture.js";
import * as machiyaLighting from "./machiya/lighting.js";
import * as nordicMaterials from "./nordic/materials.js";
import * as nordicRoom from "./nordic/room.js";
import * as nordicFurniture from "./nordic/furniture.js";
import * as nordicLighting from "./nordic/lighting.js";

import * as dongfangMaterials from "./dongfang/materials.js";
import * as dongfangRoom from "./dongfang/room.js";
import * as dongfangFurniture from "./dongfang/furniture.js";
import * as dongfangLighting from "./dongfang/lighting.js";
import * as mediterraneanMaterials from "./mediterranean/materials.js";
import * as mediterraneanRoom from "./mediterranean/room.js";
import * as mediterraneanFurniture from "./mediterranean/furniture.js";
import * as mediterraneanLighting from "./mediterranean/lighting.js";
import * as italianMaterials from "./italian/materials.js";
import * as italianRoom from "./italian/room.js";
import * as italianFurniture from "./italian/furniture.js";
import * as italianLighting from "./italian/lighting.js";
import * as bohemianMaterials from "./bohemian/materials.js";
import * as bohemianRoom from "./bohemian/room.js";
import * as bohemianFurniture from "./bohemian/furniture.js";
import * as bohemianLighting from "./bohemian/lighting.js";
import * as midcenturyMaterials from "./midcentury/materials.js";
import * as midcenturyRoom from "./midcentury/room.js";
import * as midcenturyFurniture from "./midcentury/furniture.js";
import * as midcenturyLighting from "./midcentury/lighting.js";
import * as frenchMaterials from "./french/materials.js";
import * as frenchRoom from "./french/room.js";
import * as frenchFurniture from "./french/furniture.js";
import * as frenchLighting from "./french/lighting.js";
import * as industrialMaterials from "./industrial/materials.js";
import * as industrialRoom from "./industrial/room.js";
import * as industrialFurniture from "./industrial/furniture.js";
import * as industrialLighting from "./industrial/lighting.js";
import * as artdecoMaterials from "./artdeco/materials.js";
import * as artdecoRoom from "./artdeco/room.js";
import * as artdecoFurniture from "./artdeco/furniture.js";
import * as artdecoLighting from "./artdeco/lighting.js";

// Scene modules are independent; adding another preset does not replace either room.
export const scenePresets = {
  uyghur: {label:"维吾尔",settings:{...defaults,day:true,rgbMode:"off",rgbBrightness:0,whiteBrightness:.4},...uyghurMaterials,...uyghurRoom,...uyghurFurniture,...uyghurLighting},
  tibetan: {label:"藏式",settings:{...defaults,day:false,rgbMode:"off",rgbBrightness:0,whiteBrightness:.4},...tibetanMaterials,...tibetanRoom,...tibetanFurniture,...tibetanLighting},
  brutalist: { label: "粗野主义", settings: {...defaults, day: true, rgbMode: "off", rgbBrightness: 0, whiteBrightness: .32, bedLamp: true, floorLamp: true}, ...brutalistMaterials, ...brutalistRoom, ...brutalistFurniture, ...brutalistLighting },
  memphis: {
    label: "孟菲斯风格",
    settings: {
      ...defaults,
      day: true,
      rgbMode: "off",
      rgbBrightness: 0,
      whiteBrightness: 0.48,
    },
    ...memphisMaterials,
    ...memphisRoom,
    ...memphisFurniture,
    ...memphisLighting,
  },
  tropical: {
    label: "东南亚风",
    settings: {
      ...defaults,
      day: true,
      rgbMode: "off",
      rgbBrightness: 0,
      whiteBrightness: 0.36,
    },
    ...tropicalMaterials,
    ...tropicalRoom,
    ...tropicalFurniture,
    ...tropicalLighting,
  },
  artdeco: {
    label: "装饰艺术",
    settings: {
      ...defaults,
      day: false,
      rgbMode: "off",
      rgbBrightness: 0,
      whiteBrightness: 0.38,
    },
    ...artdecoMaterials,
    ...artdecoRoom,
    ...artdecoFurniture,
    ...artdecoLighting,
  },
  industrial: {
    label: "工业风",
    settings: {
      ...defaults,
      day: false,
      rgbMode: "off",
      rgbBrightness: 0,
      whiteBrightness: 0.38,
    },
    ...industrialMaterials,
    ...industrialRoom,
    ...industrialFurniture,
    ...industrialLighting,
  },
  french: {
    label: "法式复古",
    settings: {
      ...defaults,
      day: true,
      rgbMode: "off",
      rgbBrightness: 0,
      whiteBrightness: 0.36,
    },
    ...frenchMaterials,
    ...frenchRoom,
    ...frenchFurniture,
    ...frenchLighting,
  },
  midcentury: {
    label: "中古风",
    settings: {
      ...defaults,
      day: true,
      rgbMode: "off",
      rgbColor: "#b7a280",
      rgbBrightness: 0,
      whiteBrightness: 0.32,
    },
    ...midcenturyMaterials,
    ...midcenturyRoom,
    ...midcenturyFurniture,
    ...midcenturyLighting,
  },
  bohemian: {
    label: "波西米亚",
    settings: {
      ...defaults,
      day: true,
      rgbMode: "off",
      rgbColor: "#9d8fa3",
      rgbBrightness: 0.08,
      whiteBrightness: 0.35,
    },
    ...bohemianMaterials,
    ...bohemianRoom,
    ...bohemianFurniture,
    ...bohemianLighting,
  },
  italian: {
    label: "意式轻奢",
    settings: {
      ...defaults,
      day: false,
      rgbMode: "off",
      rgbColor: "#9a9da9",
      rgbBrightness: 0.08,
      whiteBrightness: 0.3,
    },
    ...italianMaterials,
    ...italianRoom,
    ...italianFurniture,
    ...italianLighting,
  },
  mediterranean: {
    label: "地中海风",
    settings: {
      ...defaults,
      day: true,
      window: true,
      rgbMode: "off",
      rgbColor: "#819ba9",
      rgbBrightness: 0.1,
      whiteBrightness: 0.24,
    },
    ...mediterraneanMaterials,
    ...mediterraneanRoom,
    ...mediterraneanFurniture,
    ...mediterraneanLighting,
  },
  dongfang: {
    label: "东方美学",
    settings: {
      ...defaults,
      day: false,
      rgbMode: "off",
      rgbColor: "#839f98",
      rgbBrightness: 0.12,
      whiteBrightness: 0.32,
    },
    ...dongfangMaterials,
    ...dongfangRoom,
    ...dongfangFurniture,
    ...dongfangLighting,
  },
  nordic: {
    label: "北欧风",
    settings: {
      ...defaults,
      day: true,
      rgbMode: "off",
      rgbColor: "#b5c5d0",
      rgbBrightness: 0.12,
      whiteTemp: "4000",
      whiteBrightness: 0.22,
    },
    ...nordicMaterials,
    ...nordicRoom,
    ...nordicFurniture,
    ...nordicLighting,
  },
  machiya: {
    label: "日式町屋",
    settings: {
      ...defaults,
      day: false,
      rgbMode: "off",
      rgbColor: "#a8b8cf",
      rgbBrightness: 0.12,
      whiteBrightness: 0.34,
    },
    ...machiyaMaterials,
    ...machiyaRoom,
    ...machiyaFurniture,
    ...machiyaLighting,
  },
  wabisabi: {
    label: "侘寂风",
    settings: {
      ...defaults,
      day: true,
      rgbMode: "off",
      rgbColor: "#a9b3aa",
      rgbBrightness: 0.1,
      whiteTemp: "4000",
      whiteBrightness: 0.18,
    },
    ...wabisabiMaterials,
    ...wabisabiRoom,
    ...wabisabiFurniture,
    ...wabisabiLighting,
  },
  baroque: {
    label: "巴洛克",
    settings: {
      ...defaults,
      rgbMode: "static",
      rgbColor: "#a99bbd",
      rgbBrightness: 0.18,
      whiteBrightness: 0.48,
    },
    ...baroqueMaterials,
    ...baroqueRoom,
    ...baroqueFurniture,
    ...baroqueLighting,
  },
  bauhaus: {
    label: "包豪斯",
    settings: {
      ...defaults,
      day: true,
      rgbMode: "off",
      rgbColor: "#aac1d8",
      rgbBrightness: 0.15,
      whiteBrightness: 0.32,
    },
    ...bauhausMaterials,
    ...bauhausRoom,
    ...bauhausFurniture,
    ...bauhausLighting,
  },
  palace: {
    label: "金碧辉煌",
    settings: {
      ...defaults,
      rgbMode: "static",
      rgbColor: "#b5a3cd",
      rgbBrightness: 0.2,
      whiteBrightness: 0.48,
    },
    ...palaceMaterials,
    ...palaceRoom,
    ...palaceFurniture,
    ...palaceLighting,
  },
  athens: {
    label: "雅典神话",
    settings: {
      ...defaults,
      day: true,
      rgbMode: "static",
      rgbColor: "#b4a6d2",
      rgbBrightness: 0.23,
      whiteBrightness: 0.35,
    },
    ...athensMaterials,
    ...athensRoom,
    ...athensFurniture,
    ...athensLighting,
  },
  renaissance: {
    label: "美式田园",
    settings: {
      ...defaults,
      rgbMode: "off",
      rgbColor: "#a1b6ac",
      day: true,
      rgbBrightness: 0.2,
      whiteBrightness: 0.5,
    },
    ...renaissanceMaterials,
    ...renaissanceRoom,
    ...renaissanceFurniture,
    ...renaissanceLighting,
  },
  ruya: {
    label: "儒风雅韵",
    settings: {
      ...defaults,
      rgbMode: "aurora",
      rgbColor: "#79a99a",
      rgbBrightness: 0.3,
      whiteBrightness: 0.48,
    },
    ...ruyaMaterials,
    ...ruyaRoom,
    ...ruyaFurniture,
    ...ruyaLighting,
  },
  studio: {
    label: "电竞影音",
    settings: defaults,
    ...studioMaterials,
    createMaterials: () => studioMaterials.createMaterials(true),
    ...studioRoom,
    ...studioFurniture,
    ...studioLighting,
  },
  classic: {
    label: "温馨卧室",
    settings: classicDefaults,
    ...classicMaterials,
    ...classicRoom,
    ...classicFurniture,
    ...classicLighting,
  },
};

export function resolveScene(search) {
  const id = new URLSearchParams(search).get("scene");
  return Object.hasOwn(scenePresets, id) ? id : "studio";
}

export function mountSceneSwitcher(activeId) {
  const nav = document.createElement("nav");
  nav.className = "scene-switcher glass";
  nav.setAttribute("aria-label", "切换房间场景");
  for (const [id, preset] of Object.entries(scenePresets)) {
    const link = document.createElement("a");
    const url = new URL(window.location.href);
    url.searchParams.set("scene", id);
    link.href = url.href;
    link.textContent = preset.label;
    if (id === activeId) link.setAttribute("aria-current", "page");
    nav.append(link);
  }
  document.querySelector("#experience").append(nav);
}
