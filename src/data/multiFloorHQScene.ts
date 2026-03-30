import type { LayoutEditorElement } from "./layoutEditorTypes";
import {
  type Stage4GeneratedElement,
  stage4BaseBounds,
  stage4BaseContributorPodCount,
  stage4BaseElements,
  stage4ExecutiveSuiteCount,
  stage4ScalableBandBounds,
  stage4ScalableBandElements,
  stage4ScalableBandPodCount,
} from "./generatedStage4Layout";

type MultiFloorHQElement = Omit<LayoutEditorElement, "assetId"> & {
  description: string;
  tier?: "boss" | "executive" | "employee" | "utility" | "infrastructure" | "zone";
};

const assetPresets = {
  bossDeskBack: {
    src: "/raw_assets/furniture/desks/boss desk back.png",
    sourcePath: "public/raw_assets/furniture/desks/boss desk back.png",
    category: "desks",
    group: "furniture/desks",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  cabinetStorage: {
    src: "/raw_assets/furniture/utilities/cabinet_storage.png",
    sourcePath: "public/raw_assets/furniture/utilities/cabinet_storage.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  chairBossBrown: {
    src: "/raw_assets/furniture/chairs/chair_boss_brown.png",
    sourcePath: "public/raw_assets/furniture/chairs/chair_boss_brown.png",
    category: "chairs",
    group: "furniture/chairs",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  chairGamingBlack: {
    src: "/raw_assets/furniture/chairs/chair_gaming_black.png",
    sourcePath: "public/raw_assets/furniture/chairs/chair_gaming_black.png",
    category: "chairs",
    group: "furniture/chairs",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  chairMesh: {
    src: "/raw_assets/furniture/chairs/chair_mesh.png",
    sourcePath: "public/raw_assets/furniture/chairs/chair_mesh.png",
    category: "chairs",
    group: "furniture/chairs",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  chairMeshBack: {
    src: "/raw_assets/furniture/chairs/chair_mesh_back.png",
    sourcePath: "public/raw_assets/furniture/chairs/chair_mesh_back.png",
    category: "chairs",
    group: "furniture/chairs",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  coffeeMachine: {
    src: "/raw_assets/furniture/utilities/coffee_machine.png",
    sourcePath: "public/raw_assets/furniture/utilities/coffee_machine.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  deskDualMonitorBack: {
    src: "/raw_assets/furniture/desks/desk_dual_monitor_back.png",
    sourcePath: "public/raw_assets/furniture/desks/desk_dual_monitor_back.png",
    category: "desks",
    group: "furniture/desks",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  deskEmptyBack: {
    src: "/raw_assets/furniture/desks/desk_empty_back.png",
    sourcePath: "public/raw_assets/furniture/desks/desk_empty_back.png",
    category: "desks",
    group: "furniture/desks",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  deskLamp: {
    src: "/raw_assets/furniture/utilities/desk_lamp.png",
    sourcePath: "public/raw_assets/furniture/utilities/desk_lamp.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  deskLaptop: {
    src: "/raw_assets/furniture/desks/desk_laptop.png",
    sourcePath: "public/raw_assets/furniture/desks/desk_laptop.png",
    category: "desks",
    group: "furniture/desks",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  deskPcModern: {
    src: "/raw_assets/furniture/desks/desk_pc_modern.png",
    sourcePath: "public/raw_assets/furniture/desks/desk_pc_modern.png",
    category: "desks",
    group: "furniture/desks",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  bossFloorTile: {
    src: "/raw_assets/tiles/source/floor/bossfloortile.png",
    sourcePath: "public/raw_assets/tiles/source/floor/bossfloortile.png",
    category: "tiles-floor",
    group: "tiles/source/floor",
    renderMode: "pattern",
    repeat: true,
    backgroundSize: "128px 128px",
  },
  bossSitDown: {
    src: "/raw_assets/characters/boss/sit_down_0.png",
    sourcePath: "public/raw_assets/characters/boss/sit_down_0.png",
    category: "characters",
    group: "characters/boss",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  employeeSitDown: {
    src: "/raw_assets/characters/employee/sit_down_0.png",
    sourcePath: "public/raw_assets/characters/employee/sit_down_0.png",
    category: "characters",
    group: "characters/employee",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  employeeSitUp: {
    src: "/raw_assets/characters/employee/sit_up_0.png",
    sourcePath: "public/raw_assets/characters/employee/sit_up_0.png",
    category: "characters",
    group: "characters/employee",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  executiveSitDown: {
    src: "/raw_assets/characters/executive/sit_down_0.png",
    sourcePath: "public/raw_assets/characters/executive/sit_down_0.png",
    category: "characters",
    group: "characters/executive",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  doorClosed: {
    src: "/raw_assets/tiles/source/door/doorclosed.png",
    sourcePath: "public/raw_assets/tiles/source/door/doorclosed.png",
    category: "tiles-door",
    group: "tiles/source/door",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  elevatorClosed: {
    src: "/raw_assets/furniture/infrastructure/elevator_closed.png",
    sourcePath: "public/raw_assets/furniture/infrastructure/elevator_closed.png",
    category: "infrastructure",
    group: "furniture/infrastructure",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  floorDark: {
    src: "/raw_assets/tiles/source/floor/floor_dark.png",
    sourcePath: "public/raw_assets/tiles/source/floor/floor_dark.png",
    category: "tiles-floor",
    group: "tiles/source/floor",
    renderMode: "pattern",
    repeat: true,
    backgroundSize: "64px 64px",
  },
  floorMat: {
    src: "/raw_assets/furniture/utilities/floor_mat.png",
    sourcePath: "public/raw_assets/furniture/utilities/floor_mat.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  floorTileCarpet: {
    src: "/raw_assets/tiles/source/floor/floortile2carpet.png",
    sourcePath: "public/raw_assets/tiles/source/floor/floortile2carpet.png",
    category: "tiles-floor",
    group: "tiles/source/floor",
    renderMode: "pattern",
    repeat: true,
    backgroundSize: "64px 64px",
  },
  floorTileOne: {
    src: "/raw_assets/tiles/source/floor/floortileone.png",
    sourcePath: "public/raw_assets/tiles/source/floor/floortileone.png",
    category: "tiles-floor",
    group: "tiles/source/floor",
    renderMode: "pattern",
    repeat: true,
    backgroundSize: "64px 64px",
  },
  infoKiosk: {
    src: "/raw_assets/furniture/utilities/info_kiosk.png",
    sourcePath: "public/raw_assets/furniture/utilities/info_kiosk.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  plantHanging: {
    src: "/raw_assets/furniture/plants/plant_hanging.png",
    sourcePath: "public/raw_assets/furniture/plants/plant_hanging.png",
    category: "plants",
    group: "furniture/plants",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  plantMedium: {
    src: "/raw_assets/furniture/plants/plant_medium.png",
    sourcePath: "public/raw_assets/furniture/plants/plant_medium.png",
    category: "plants",
    group: "furniture/plants",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  printerLarge: {
    src: "/raw_assets/furniture/utilities/printer_large.png",
    sourcePath: "public/raw_assets/furniture/utilities/printer_large.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  snackMachine: {
    src: "/raw_assets/furniture/utilities/snack_machine.png",
    sourcePath: "public/raw_assets/furniture/utilities/snack_machine.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  topLeftCornerWall: {
    src: "/raw_assets/tiles/source/walls/corncorner-wallhorizntal.png",
    sourcePath: "public/raw_assets/tiles/source/walls/corncorner-wallhorizntal.png",
    category: "tiles-walls",
    group: "tiles/source/walls",
    renderMode: "pattern",
    repeat: true,
    backgroundSize: "64px 64px",
  },
  trashBin: {
    src: "/raw_assets/furniture/utilities/trash_bin.png",
    sourcePath: "public/raw_assets/furniture/utilities/trash_bin.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  vendingMachine: {
    src: "/raw_assets/furniture/utilities/vending_machine.png",
    sourcePath: "public/raw_assets/furniture/utilities/vending_machine.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  wallClock: {
    src: "/raw_assets/furniture/utilities/wall_clock.png",
    sourcePath: "public/raw_assets/furniture/utilities/wall_clock.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
  wallHorizontal: {
    src: "/raw_assets/tiles/source/walls/wallhorizntal.png",
    sourcePath: "public/raw_assets/tiles/source/walls/wallhorizntal.png",
    category: "tiles-walls",
    group: "tiles/source/walls",
    renderMode: "pattern",
    repeat: true,
    backgroundSize: "64px 64px",
  },
  wallVertical: {
    src: "/raw_assets/tiles/source/walls/wallvertical.png",
    sourcePath: "public/raw_assets/tiles/source/walls/wallvertical.png",
    category: "tiles-walls",
    group: "tiles/source/walls",
    renderMode: "pattern",
    repeat: true,
    backgroundSize: "64px 64px",
  },
  whiteboard: {
    src: "/raw_assets/furniture/utilities/whiteboard.png",
    sourcePath: "public/raw_assets/furniture/utilities/whiteboard.png",
    category: "utilities",
    group: "furniture/utilities",
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
  },
} as const;

type GeneratedAssetKey = keyof typeof assetPresets;

const tierByAssetKey: Partial<Record<GeneratedAssetKey, MultiFloorHQElement["tier"]>> = {
  bossDeskBack: "boss",
  bossFloorTile: "boss",
  chairBossBrown: "boss",
  deskLamp: "boss",
  cabinetStorage: "boss",
  chairGamingBlack: "executive",
  deskDualMonitorBack: "executive",
  deskLaptop: "employee",
  deskPcModern: "employee",
  chairMesh: "employee",
  chairMeshBack: "employee",
  deskEmptyBack: "employee",
  bossSitDown: "boss",
  executiveSitDown: "executive",
  employeeSitDown: "employee",
  employeeSitUp: "employee",
  coffeeMachine: "utility",
  floorMat: "utility",
  infoKiosk: "utility",
  plantHanging: "zone",
  plantMedium: "zone",
  printerLarge: "utility",
  snackMachine: "utility",
  trashBin: "utility",
  vendingMachine: "utility",
  wallClock: "utility",
  whiteboard: "utility",
  doorClosed: "zone",
  elevatorClosed: "infrastructure",
  floorDark: "zone",
  floorTileCarpet: "zone",
  floorTileOne: "zone",
  topLeftCornerWall: "zone",
  wallHorizontal: "zone",
  wallVertical: "zone",
};

function humanizeSourceName(sourceName: string) {
  return sourceName
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function labelForGeneratedElement(item: Stage4GeneratedElement) {
  const suffix = item.id.split("-").at(-1) ?? "";
  return `${humanizeSourceName(item.sourceName)} ${suffix}`.trim();
}

function descriptionForGeneratedElement(item: Stage4GeneratedElement, isScalableBand: boolean) {
  const sourceLabel = humanizeSourceName(item.sourceName);

  if (isScalableBand) {
    return `${sourceLabel} from the reusable Stage 4 contributor band, ready to attach below the main office when more rows are needed.`;
  }

  return `${sourceLabel} placed directly from the Stage 4 Figma export.`;
}

function roundPercent(value: number) {
  return Number(value.toFixed(3));
}

const stage4LiveOverrideAssetKeys = new Set<GeneratedAssetKey>([
  "cabinetStorage",
  "chairGamingBlack",
  "coffeeMachine",
  "deskDualMonitorBack",
  "deskLamp",
  "doorClosed",
  "bossSitDown",
  "employeeSitDown",
  "employeeSitUp",
  "executiveSitDown",
  "infoKiosk",
  "plantHanging",
  "plantMedium",
  "printerLarge",
  "snackMachine",
  "trashBin",
  "vendingMachine",
  "wallClock",
  "whiteboard",
]);

// These placements come from the latest live Stage 4 Figma node and replace the stale prop coordinates
// inside the generated base export while keeping the floor, walls, and growth-band extraction intact.
const stage4LiveBasePlacements: Stage4GeneratedElement[] = [
  { assetKey: "cabinetStorage", sourceName: "cabinet_storage", x: 1022, y: 9, width: 96, height: 96 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 104, y: 13, width: 32, height: 32 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 269, y: 13, width: 32, height: 32 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 439, y: 13, width: 32, height: 32 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 598, y: 13, width: 32, height: 32 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 1328, y: 13, width: 32, height: 32 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 1491, y: 13, width: 32, height: 32 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 1659, y: 13, width: 32, height: 32 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 1826, y: 13, width: 32, height: 32 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 965, y: 16, width: 32, height: 32 },
  { assetKey: "cabinetStorage", sourceName: "cabinet_storage", x: 142, y: 20, width: 64, height: 64 },
  { assetKey: "cabinetStorage", sourceName: "cabinet_storage", x: 311, y: 20, width: 64, height: 64 },
  { assetKey: "cabinetStorage", sourceName: "cabinet_storage", x: 476, y: 20, width: 64, height: 64 },
  { assetKey: "cabinetStorage", sourceName: "cabinet_storage", x: 633, y: 20, width: 64, height: 64 },
  { assetKey: "cabinetStorage", sourceName: "cabinet_storage", x: 1365, y: 20, width: 64, height: 64 },
  { assetKey: "cabinetStorage", sourceName: "cabinet_storage", x: 1534, y: 20, width: 64, height: 64 },
  { assetKey: "cabinetStorage", sourceName: "cabinet_storage", x: 1699, y: 20, width: 64, height: 64 },
  { assetKey: "cabinetStorage", sourceName: "cabinet_storage", x: 1858, y: 20, width: 64, height: 64 },
  { assetKey: "deskLamp", sourceName: "desk_lamp", x: 853, y: 23, width: 69, height: 69 },
  { assetKey: "deskLamp", sourceName: "desk_lamp", x: 1269, y: 30, width: 46, height: 46 },
  { assetKey: "deskLamp", sourceName: "desk_lamp", x: 45, y: 32, width: 46, height: 46 },
  { assetKey: "deskLamp", sourceName: "desk_lamp", x: 211, y: 32, width: 46, height: 46 },
  { assetKey: "deskLamp", sourceName: "desk_lamp", x: 380, y: 32, width: 46, height: 46 },
  { assetKey: "deskLamp", sourceName: "desk_lamp", x: 1435, y: 32, width: 46, height: 46 },
  { assetKey: "deskLamp", sourceName: "desk_lamp", x: 545, y: 34, width: 46, height: 46 },
  { assetKey: "deskLamp", sourceName: "desk_lamp", x: 1604, y: 34, width: 46, height: 46 },
  { assetKey: "deskLamp", sourceName: "desk_lamp", x: 1770, y: 34, width: 46, height: 46 },
  { assetKey: "chairGamingBlack", sourceName: "chair_gaming_black", x: 1815, y: 72, width: 64, height: 64 },
  { assetKey: "chairGamingBlack", sourceName: "chair_gaming_black", x: 1485, y: 76, width: 64, height: 64 },
  { assetKey: "chairGamingBlack", sourceName: "chair_gaming_black", x: 1657, y: 76, width: 64, height: 64 },
  { assetKey: "chairGamingBlack", sourceName: "chair_gaming_black", x: 89, y: 78, width: 64, height: 64 },
  { assetKey: "chairGamingBlack", sourceName: "chair_gaming_black", x: 1321, y: 78, width: 64, height: 64 },
  { assetKey: "chairGamingBlack", sourceName: "chair_gaming_black", x: 423, y: 80, width: 64, height: 64 },
  { assetKey: "chairGamingBlack", sourceName: "chair_gaming_black", x: 253, y: 81, width: 64, height: 64 },
  { assetKey: "chairGamingBlack", sourceName: "chair_gaming_black", x: 583, y: 81, width: 64, height: 64 },
  { assetKey: "deskDualMonitorBack", sourceName: "desk_dual_monitor_back", x: 1815, y: 93, width: 64, height: 64 },
  { assetKey: "deskDualMonitorBack", sourceName: "desk_dual_monitor_back", x: 89, y: 96, width: 64, height: 64 },
  { assetKey: "deskDualMonitorBack", sourceName: "desk_dual_monitor_back", x: 1320, y: 96, width: 64, height: 64 },
  { assetKey: "deskDualMonitorBack", sourceName: "desk_dual_monitor_back", x: 1486, y: 96, width: 64, height: 64 },
  { assetKey: "deskDualMonitorBack", sourceName: "desk_dual_monitor_back", x: 1657, y: 96, width: 64, height: 64 },
  { assetKey: "deskDualMonitorBack", sourceName: "desk_dual_monitor_back", x: 423, y: 98, width: 64, height: 64 },
  { assetKey: "deskDualMonitorBack", sourceName: "desk_dual_monitor_back", x: 253, y: 99, width: 64, height: 64 },
  { assetKey: "deskDualMonitorBack", sourceName: "desk_dual_monitor_back", x: 583, y: 99, width: 64, height: 64 },
  { assetKey: "plantHanging", sourceName: "plant_hanging", x: 43, y: 160, width: 34, height: 34 },
  { assetKey: "plantHanging", sourceName: "plant_hanging", x: 209, y: 160, width: 34, height: 34 },
  { assetKey: "plantHanging", sourceName: "plant_hanging", x: 380, y: 160, width: 34, height: 34 },
  { assetKey: "plantHanging", sourceName: "plant_hanging", x: 546, y: 160, width: 34, height: 34 },
  { assetKey: "plantHanging", sourceName: "plant_hanging", x: 1436, y: 160, width: 34, height: 34 },
  { assetKey: "plantHanging", sourceName: "plant_hanging", x: 1269, y: 161, width: 34, height: 34 },
  { assetKey: "plantHanging", sourceName: "plant_hanging", x: 1604, y: 161, width: 34, height: 34 },
  { assetKey: "plantHanging", sourceName: "plant_hanging", x: 1771, y: 161, width: 34, height: 34 },
  { assetKey: "doorClosed", sourceName: "doorclosed", x: 1844, y: 196, width: 64, height: 64 },
  { assetKey: "doorClosed", sourceName: "doorclosed", x: 639, y: 197, width: 64, height: 64 },
  { assetKey: "plantMedium", sourceName: "plant_medium", x: 847, y: 197, width: 64, height: 64 },
  { assetKey: "plantMedium", sourceName: "plant_medium", x: 1058, y: 197, width: 64, height: 64 },
  { assetKey: "doorClosed", sourceName: "doorclosed", x: 1349, y: 197, width: 64, height: 64 },
  { assetKey: "doorClosed", sourceName: "doorclosed", x: 1514, y: 197, width: 64, height: 64 },
  { assetKey: "doorClosed", sourceName: "doorclosed", x: 1679, y: 197, width: 64, height: 64 },
  { assetKey: "doorClosed", sourceName: "doorclosed", x: 144, y: 198, width: 64, height: 64 },
  { assetKey: "doorClosed", sourceName: "doorclosed", x: 309, y: 198, width: 64, height: 64 },
  { assetKey: "doorClosed", sourceName: "doorclosed", x: 474, y: 198, width: 64, height: 64 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 384, y: 203, width: 64, height: 64 },
  { assetKey: "wallClock", sourceName: "wall_clock", x: 1608, y: 203, width: 64, height: 64 },
  { assetKey: "printerLarge", sourceName: "printer_large", x: 30, y: 219, width: 64, height: 64 },
  { assetKey: "printerLarge", sourceName: "printer_large", x: 77, y: 219, width: 64, height: 64 },
  { assetKey: "coffeeMachine", sourceName: "coffee_machine", x: 208, y: 219, width: 64, height: 64 },
  { assetKey: "trashBin", sourceName: "trash_bin", x: 546, y: 219, width: 64, height: 64 },
  { assetKey: "printerLarge", sourceName: "printer_large", x: 1273, y: 219, width: 64, height: 64 },
  { assetKey: "coffeeMachine", sourceName: "coffee_machine", x: 1406, y: 219, width: 64, height: 64 },
  { assetKey: "trashBin", sourceName: "trash_bin", x: 1765, y: 219, width: 64, height: 64 },
  { assetKey: "doorClosed", sourceName: "doorclosed", x: 1054, y: 256, width: 64, height: 64 },
  { assetKey: "vendingMachine", sourceName: "vending_machine", x: 821, y: 265, width: 64, height: 64 },
  { assetKey: "vendingMachine", sourceName: "vending_machine", x: 856, y: 265, width: 64, height: 64 },
  { assetKey: "whiteboard", sourceName: "whiteboard", x: 914, y: 271, width: 64, height: 64 },
  { assetKey: "infoKiosk", sourceName: "info_kiosk", x: 987, y: 271, width: 64, height: 64 },
].map((item, index) => ({
  id: `live-${item.assetKey}-${String(index + 1).padStart(3, "0")}`,
  assetKey: item.assetKey,
  sourceName: item.sourceName,
  x: item.x,
  y: item.y,
  width: item.width,
  height: item.height,
  zIndex: 260 + index,
  backgroundSize: `${Math.round(item.width)}px ${Math.round(item.height)}px`,
}));

type Stage4LayoutElementPatch = {
  id: string;
} & Partial<
  Pick<
    MultiFloorHQElement,
    | "left"
    | "top"
    | "width"
    | "height"
    | "zIndex"
    | "opacity"
    | "backgroundSize"
    | "cropLeft"
    | "cropTop"
    | "cropRight"
    | "cropBottom"
  >
>;

type Stage4AddedElementPatch = Omit<MultiFloorHQElement, "description" | "tier"> &
  Partial<Pick<MultiFloorHQElement, "description" | "tier">>;

const stage4LayoutDraftPatch = {
  addedElements: [
    {
      id: "boss-sit-direct",
      label: "Boss Seated",
      src: "/raw_assets/characters/boss/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/boss/sit_down_0.png",
      category: "characters",
      group: "characters/boss",
      renderMode: "image",
      repeat: false,
      backgroundSize: "contain",
      left: 48.5,
      top: 12.0,
      width: 5.2,
      height: 12.0,
      zIndex: 17,
      opacity: 1,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
    },
    {
      id: "sit-down-0-c5",
      label: "Sit Down 0",
      src: "/raw_assets/characters/executive/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/executive/sit_down_0.png",
      category: "characters",
      group: "characters/executive",
      renderMode: "image",
      repeat: false,
      backgroundSize: "contain",
      left: 28.4,
      top: 10.8,
      width: 7.2,
      height: 9.7,
      zIndex: 300,
      opacity: 1,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
    },
    {
      id: "sit-down-0-c5-paste-c6",
      label: "Sit Down 0",
      src: "/raw_assets/characters/executive/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/executive/sit_down_0.png",
      category: "characters",
      group: "characters/executive",
      renderMode: "image",
      repeat: false,
      backgroundSize: "contain",
      left: 19.9,
      top: 10.8,
      width: 7.2,
      height: 9.7,
      zIndex: 298,
      opacity: 1,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
    },
    {
      id: "sit-down-0-c5-paste-c6-paste-c7-paste-cb",
      label: "Sit Down 0",
      src: "/raw_assets/characters/executive/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/executive/sit_down_0.png",
      category: "characters",
      group: "characters/executive",
      renderMode: "image",
      repeat: false,
      backgroundSize: "contain",
      left: 66.3,
      top: 10.9,
      width: 7.2,
      height: 9.7,
      zIndex: 292,
      opacity: 1,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
    },
    {
      id: "sit-down-0-c5-paste-c6-paste-c7",
      label: "Sit Down 0",
      src: "/raw_assets/characters/executive/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/executive/sit_down_0.png",
      category: "characters",
      group: "characters/executive",
      renderMode: "image",
      repeat: false,
      backgroundSize: "contain",
      left: 2.6,
      top: 11.3,
      width: 7.2,
      height: 9.7,
      zIndex: 293,
      opacity: 1,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
    },
    {
      id: "sit-down-0-c5-paste-c9",
      label: "Sit Down 0",
      src: "/raw_assets/characters/executive/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/executive/sit_down_0.png",
      category: "characters",
      group: "characters/executive",
      renderMode: "image",
      repeat: false,
      backgroundSize: "contain",
      left: 92.1,
      top: 10.4,
      width: 7.2,
      height: 9.7,
      zIndex: 293,
      opacity: 1,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
    },
    {
      id: "sit-down-0-c5-paste-c6-paste-ca",
      label: "Sit Down 0",
      src: "/raw_assets/characters/executive/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/executive/sit_down_0.png",
      category: "characters",
      group: "characters/executive",
      renderMode: "image",
      repeat: false,
      backgroundSize: "contain",
      left: 83.8,
      top: 10.2,
      width: 7.2,
      height: 9.7,
      zIndex: 293,
      opacity: 1,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
    },
    {
      id: "sit-down-0-c5-paste-c6-paste-c7-paste-c8-paste-cc",
      label: "Sit Down 0",
      src: "/raw_assets/characters/executive/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/executive/sit_down_0.png",
      category: "characters",
      group: "characters/executive",
      renderMode: "image",
      repeat: false,
      backgroundSize: "contain",
      left: 74.9,
      top: 10.8,
      width: 7.2,
      height: 9.7,
      zIndex: 293,
      opacity: 1,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
    },
    {
      id: "sit-down-0-c5-paste-c6-paste-c7-paste-c8",
      label: "Sit Down 0",
      src: "/raw_assets/characters/executive/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/executive/sit_down_0.png",
      category: "characters",
      group: "characters/executive",
      renderMode: "image",
      repeat: false,
      backgroundSize: "contain",
      left: 11.2,
      top: 11.2,
      width: 7.2,
      height: 9.7,
      zIndex: 294,
      opacity: 1,
      cropLeft: 0,
      cropTop: 0,
      cropRight: 0,
      cropBottom: 0,
    },
  ] satisfies readonly Stage4AddedElementPatch[],
  updatedElements: [
    { id: "floorDark-011", left: 1.4, top: 7.5, width: 98.6, height: 55.4, zIndex: 0 },
    { id: "founder-cabin-floor", left: 44, top: 9.1, width: 13.6, height: 27.3, zIndex: 2 },
    { id: "chairBossBrown-026", zIndex: 14 },
    { id: "wallHorizontal-020", left: 40.9, width: 43.2, height: 9 },
    { id: "topLeftCornerWall-022", left: 43.2, width: 2, height: 9.1 },
    { id: "wallVertical-023", left: 43.2, top: 1.3, width: 2.1, height: 35.3 },
    { id: "wallVertical-045", left: 64.5, top: 1.1, width: 2.4, height: 35.3 },
    { id: "wallHorizontal-049", left: 64.5, top: 27.8, width: 33.6, height: 9.1 },
    { id: "wallHorizontal-061", left: 0.7, width: 40.5, height: 9.3 },
    { id: "elevatorClosed-062", left: 38, top: 1.1 },
    { id: "sit-up-0-a6", left: 59.9, top: 62.1 },
    { id: "live-deskLamp-019", left: 44.4, top: 2.3 },
    { id: "wallVertical-292", left: 36.3, top: 0, width: 1.6, height: 36.4 },
    { id: "wallVertical-293", left: 1.1, width: 2.6, height: 36.4 },
    { id: "wallHorizontal-296", left: 1.9, top: 27.8, width: 32.8, height: 9.2 },
    { id: "live-wallClock-062", left: 20.1, top: 28, zIndex: 324 },
    { id: "live-wallClock-063", left: 83.3, top: 27.8 },
    { id: "live-coffeeMachine-069", left: 73.7, top: 30.1 },
    { id: "live-trashBin-070", left: 92.4, top: 31.3 },
    { id: "live-doorClosed-071", left: 54.7, top: 36.4 },
 
  ] satisfies readonly Stage4LayoutElementPatch[],
  removedElementIds: [
    "floorDark-001",
    "floorDark-003",
    "floorDark-004",
    "floorDark-005",
    "floorDark-006",
    "floorDark-007",
    "floorDark-008",
    "floorDark-009",
    "floorDark-010",
    "floorDark-012",
    "floorDark-013",
    "floorTileCarpet-027",
    "wallVertical-036",
    "wallHorizontal-048",
    "floorTileCarpet-051",
    "floorTileCarpet-052",
    "floorTileCarpet-053",
    "floorTileCarpet-054",
    "wallHorizontal-284",
    "wallHorizontal-287",
    "wallHorizontal-295",
    "floorTileCarpet-298",
    "floorTileCarpet-299",
    "floorTileCarpet-300",
    "floorTileCarpet-301",
    "floorDark-317",
    "floorDark-318",
    "sit-down-0-a5",
  ],
} as const;

function inferTierForStage4AddedElement(element: Stage4AddedElementPatch): MultiFloorHQElement["tier"] {
  if (element.category === "characters" || element.group.startsWith("characters/")) {
    if (element.group.includes("/boss")) {
      return "boss";
    }
    if (element.group.includes("/executive")) {
      return "executive";
    }
    return "employee";
  }

  if (element.category === "utilities" || element.group.startsWith("furniture/utilities")) {
    return "utility";
  }

  if (element.category === "infrastructure" || element.group.startsWith("furniture/infrastructure")) {
    return "infrastructure";
  }

  if (element.category.startsWith("tiles-") || element.group.startsWith("tiles/")) {
    return "zone";
  }

  return undefined;
}

function normalizeStage4AddedElement(element: Stage4AddedElementPatch): MultiFloorHQElement {
  return {
    ...element,
    description: element.description ?? `${element.label} added from the HQ editor patch.`,
    tier: element.tier ?? inferTierForStage4AddedElement(element),
  };
}

const manualExecutiveCabinDeskIds = new Set([
  "deskDualMonitorBack-036",
  "deskDualMonitorBack-037",
  "deskDualMonitorBack-038",
  "deskDualMonitorBack-039",
  "deskDualMonitorBack-040",
  "deskDualMonitorBack-041",
  "deskDualMonitorBack-042",
  "deskDualMonitorBack-043",
]);

function scaleStage4VerticalPercent(value: number | undefined, canvasHeight: number) {
  if (value === undefined) {
    return undefined;
  }

  if (canvasHeight === stage4BaseBounds.height) {
    return value;
  }

  return roundPercent(value * (stage4BaseBounds.height / canvasHeight));
}

function normalizeStage4LayoutPatch(
  patch: Stage4LayoutElementPatch,
  canvasHeight: number,
): Stage4LayoutElementPatch {
  return {
    ...patch,
    top: scaleStage4VerticalPercent(patch.top, canvasHeight),
    height: scaleStage4VerticalPercent(patch.height, canvasHeight),
  };
}

function normalizeStage4AddedElementForCanvas(
  element: MultiFloorHQElement,
  canvasHeight: number,
): MultiFloorHQElement {
  if (canvasHeight === stage4BaseBounds.height) {
    return element;
  }

  return {
    ...element,
    top: scaleStage4VerticalPercent(element.top, canvasHeight) ?? element.top,
    height: scaleStage4VerticalPercent(element.height, canvasHeight) ?? element.height,
  };
}

function applyStage4LayoutPatch(elements: MultiFloorHQElement[], canvasHeight: number) {
  const patchById = new Map<string, Stage4LayoutElementPatch>(
    stage4LayoutDraftPatch.updatedElements.map((patch) => [patch.id, normalizeStage4LayoutPatch(patch, canvasHeight)] as const),
  );
  const addedElementIds = new Set<string>(stage4LayoutDraftPatch.addedElements.map((element) => element.id));
  const removedElementIds = new Set<string>(stage4LayoutDraftPatch.removedElementIds);

  const patchedElements = elements
    .filter((element) => !removedElementIds.has(element.id) && !addedElementIds.has(element.id))
    .map((element) => {
      const patch = patchById.get(element.id);
      return patch ? { ...element, ...patch } : element;
    });

  const addedElements = stage4LayoutDraftPatch.addedElements
    .filter((element) => !removedElementIds.has(element.id))
    .map((element) => {
      const normalizedElement = normalizeStage4AddedElementForCanvas(
        normalizeStage4AddedElement(element),
        canvasHeight,
      );
      const patch = patchById.get(element.id);

      return patch ? { ...normalizedElement, ...patch } : normalizedElement;
    });

  return [...patchedElements, ...addedElements];
}

function createSeatCharacterElement(
  anchor: MultiFloorHQElement,
  options: {
    id: string;
    assetKey: "bossSitDown" | "employeeSitDown" | "employeeSitUp" | "executiveSitDown";
    label: string;
    leftOffset: number;
    topOffset: number;
    width: number;
    height: number;
    zIndexOffset: number;
    description: string;
  },
): MultiFloorHQElement {
  const preset = assetPresets[options.assetKey];

  return {
    id: options.id,
    label: options.label,
    src: preset.src,
    sourcePath: preset.sourcePath,
    category: preset.category,
    group: preset.group,
    renderMode: preset.renderMode,
    repeat: preset.repeat,
    backgroundSize: preset.backgroundSize,
    left: roundPercent(anchor.left + options.leftOffset),
    top: roundPercent(anchor.top + options.topOffset),
    width: options.width,
    height: options.height,
    zIndex: anchor.zIndex + options.zIndexOffset,
    opacity: 1,
    cropLeft: 0,
    cropTop: 0,
    cropRight: 0,
    cropBottom: 0,
    tier: tierByAssetKey[options.assetKey],
    description: options.description,
  };
}

function createStage4SeatCharacters(elements: MultiFloorHQElement[]) {
  const seatCharacters: MultiFloorHQElement[] = [];

  for (const desk of elements.filter(
    (element) => element.id.startsWith("deskDualMonitorBack-") && !manualExecutiveCabinDeskIds.has(element.id),
  )) {
    seatCharacters.push(
      createSeatCharacterElement(desk, {
        id: `executive-sit-down-${desk.id}`,
        assetKey: "executiveSitDown",
        label: "Sit Down 0",
        leftOffset: -1.9,
        topOffset: -3.2,
        width: 7.2,
        height: 9.7,
        zIndexOffset: -2,
        description: "Executive seated in a private office.",
      }),
    );
  }

  for (const chair of elements.filter((element) => element.id.startsWith("chairMesh-"))) {
    seatCharacters.push(
      createSeatCharacterElement(chair, {
        id: chair.id === "chairMesh-072" ? "sit-down-0-a4" : `employee-sit-down-${chair.id}`,
        assetKey: "employeeSitDown",
        label: "Sit Down 0",
        leftOffset: 0.677,
        topOffset: -2.014,
        width: 2,
        height: 14,
        zIndexOffset: 0,
        description: "Contributor seated at a top-row workstation.",
      }),
    );
  }

  for (const chair of elements.filter((element) => element.id.startsWith("chairMeshBack-"))) {
    seatCharacters.push(
      createSeatCharacterElement(chair, {
        id: chair.id === "chairMeshBack-081" ? "sit-up-0-a6" : `employee-sit-up-${chair.id}`,
        assetKey: "employeeSitUp",
        label: "Sit Up 0",
        leftOffset: 0.5,
        topOffset: -2.9,
        width: 2,
        height: 11.4,
        zIndexOffset: -1,
        description: "Contributor seated at a lower-row workstation.",
      }),
    );
  }

  return seatCharacters;
}

function createFounderFloorElement(canvasWidth: number, canvasHeight: number): MultiFloorHQElement {
  const preset = assetPresets.bossFloorTile;

  return {
    id: "founder-cabin-floor",
    label: "Founder Cabin Floor",
    src: preset.src,
    sourcePath: preset.sourcePath,
    category: preset.category,
    group: preset.group,
    renderMode: preset.renderMode,
    repeat: preset.repeat,
    backgroundSize: preset.backgroundSize,
    left: roundPercent((897 / canvasWidth) * 100),
    top: roundPercent((64 / canvasHeight) * 100),
    width: roundPercent((215 / canvasWidth) * 100),
    height: roundPercent((192 / canvasHeight) * 100),
    zIndex: 1,
    opacity: 1,
    cropLeft: 0,
    cropTop: 0,
    cropRight: 0,
    cropBottom: 0,
    tier: "boss",
    description: "Custom boss cabin floor tile applied to the centered founder office.",
  };
}

// Asset keys that should always render at the very back (z-index 1-2)
const backgroundAssetKeys = new Set<string>([
  "floorDark", "floorTileOne", "floorTileCarpet", "bossFloorTile",
  "wallHorizontal", "wallVertical", "topLeftCornerWall",
]);

function resolveBackgroundZIndex(assetKey: string, originalZIndex: number): number {
  if (!backgroundAssetKeys.has(assetKey)) return originalZIndex;
  // Walls get z=2 (above floors), floors/tiles get z=1
  if (assetKey.startsWith("wall") || assetKey === "topLeftCornerWall") return 2;
  return 1;
}

function convertGeneratedElement(
  item: Stage4GeneratedElement,
  canvasWidth: number,
  canvasHeight: number,
  yOffset = 0,
  zOffset = 0,
  isScalableBand = false,
): MultiFloorHQElement {
  const assetKey = item.assetKey as GeneratedAssetKey;
  const preset = assetPresets[assetKey];
  const id = isScalableBand ? `${item.id}-band-${String(zOffset).padStart(3, "0")}` : item.id;
  const resolvedZIndex = resolveBackgroundZIndex(assetKey, item.zIndex + zOffset);

  return {
    id,
    label: labelForGeneratedElement(item),
    src: preset.src,
    sourcePath: preset.sourcePath,
    category: preset.category,
    group: preset.group,
    renderMode: preset.renderMode,
    repeat: preset.repeat,
    backgroundSize: preset.renderMode === "pattern" ? item.backgroundSize : preset.backgroundSize,
    left: roundPercent((item.x / canvasWidth) * 100),
    top: roundPercent(((item.y + yOffset) / canvasHeight) * 100),
    width: roundPercent((item.width / canvasWidth) * 100),
    height: roundPercent((item.height / canvasHeight) * 100),
    zIndex: resolvedZIndex,
    opacity: 1,
    cropLeft: 0,
    cropTop: 0,
    cropRight: 0,
    cropBottom: 0,
    tier: tierByAssetKey[assetKey],
    description: descriptionForGeneratedElement(item, isScalableBand),
  };
}

export const stage4BaseSeatCapacity = 1 + stage4ExecutiveSuiteCount + stage4BaseContributorPodCount * 2;
export const stage4AdditionalBandSeatCapacity = stage4ScalableBandPodCount * 2;

export const multiFloorHQRegistryPath = "src/data/generatedStage4Layout.ts";

export function buildMultiFloorHQScene(requestedContributorCount = stage4BaseSeatCapacity) {
  const normalizedContributorCount = Math.max(stage4BaseSeatCapacity, Math.floor(requestedContributorCount || stage4BaseSeatCapacity));
  const extraScalableBandCount = Math.max(
    0,
    Math.ceil((normalizedContributorCount - stage4BaseSeatCapacity) / stage4AdditionalBandSeatCapacity),
  );
  const stage4CanvasWidth = stage4BaseBounds.width;
  const stage4CanvasHeight = stage4BaseBounds.height + extraScalableBandCount * stage4ScalableBandBounds.height;

  const founderFloorElement = createFounderFloorElement(stage4CanvasWidth, stage4CanvasHeight);
  const staticBaseElements = stage4BaseElements.filter(
    (item) => !stage4LiveOverrideAssetKeys.has(item.assetKey as GeneratedAssetKey),
  );
  const liveBaseElements = stage4LiveBasePlacements.map((item) =>
    convertGeneratedElement(item, stage4CanvasWidth, stage4CanvasHeight),
  );
  const baseElements = [
    ...staticBaseElements.map((item) => convertGeneratedElement(item, stage4CanvasWidth, stage4CanvasHeight)),
    ...liveBaseElements,
  ];

  const scalableBandElements = Array.from({ length: extraScalableBandCount }, (_, bandIndex) => {
    const yOffset = stage4BaseBounds.height + bandIndex * stage4ScalableBandBounds.height;
    const zOffset = stage4BaseElements.length + 1 + bandIndex * stage4ScalableBandElements.length;

    return stage4ScalableBandElements.map((item) =>
      convertGeneratedElement(item, stage4CanvasWidth, stage4CanvasHeight, yOffset, zOffset, true),
    );
  }).flat();

  const patchedStructuralElements = applyStage4LayoutPatch([
    founderFloorElement,
    ...baseElements,
    ...scalableBandElements,
  ], stage4CanvasHeight);
  const seatedCharacterElements = createStage4SeatCharacters(patchedStructuralElements);
  const elements = applyStage4LayoutPatch([
    ...patchedStructuralElements,
    ...seatedCharacterElements,
  ], stage4CanvasHeight).sort((left, right) => left.zIndex - right.zIndex);

  const contributorPodCount = stage4BaseContributorPodCount + extraScalableBandCount * stage4ScalableBandPodCount;
  const visibleContributorCount = 1 + stage4ExecutiveSuiteCount + contributorPodCount * 2;

  return {
    levelLabel: "Level 04",
    title: "Scalable HQ",
    subtitle:
      "Stage 4 now uses the real Figma export: the founder core stays in the middle, both executive wings mirror around it, and the reusable employee band attaches below the office whenever contributor growth needs another +50 seats.",
    capacityRange: "109+ contributors",
    requestedContributorCount: normalizedContributorCount,
    visibleContributorCount,
    baseSeatCapacity: stage4BaseSeatCapacity,
    executiveSuiteCount: stage4ExecutiveSuiteCount,
    contributorPodCount,
    employeeRowCount: 2 + extraScalableBandCount * 2,
    leadContributorCount: stage4ExecutiveSuiteCount,
    scalableBandPodCount: stage4ScalableBandPodCount,
    extraScalableBandCount,
    stage4AdditionalBandSeatCapacity,
    canvas: { aspectRatio: `${stage4CanvasWidth} / ${stage4CanvasHeight}` },
    systemNotes: [
      "The live Stage 4 office is sourced from the exported Stage 4 Figma layout instead of the earlier approximation.",
      "The founder cabin now uses the dedicated boss floor tile while the centered founder core and mirrored executive wings stay aligned to the design file.",
      "The latest sync applies the HQ editor patch first, then auto-fills every founder, executive, and contributor seat with the correct seated character pose.",
      `The base HQ seats ${stage4BaseSeatCapacity} people by default: 1 founder, 8 executives, and 100 employee seats.`,
      `Every extra reusable seat band adds ${stage4AdditionalBandSeatCapacity} more seats below the main floor, and the current request attaches ${extraScalableBandCount} extra band${extraScalableBandCount === 1 ? "" : "s"}.`,
    ],
    tierLegend: [
      {
        title: "Founder Core",
        text: "The founder cabin stays centered in the main office spine, with the elevators flanking it on both sides.",
      },
      {
        title: "Executive Wings",
        text: "Eight mirrored private offices define the top-contributor tier around the founder core.",
      },
      {
        title: "Main Contributor Floor",
        text: "The lower office floor keeps the full 100-seat default layout from the main Stage 4 Figma frame.",
      },
      {
        title: "Growth Bands",
        text: `Each attached seat band is the reusable Figma row pair and contributes ${stage4AdditionalBandSeatCapacity} more seats below the base office.`,
      },
    ],
    elements,
  };
}

export const multiFloorHQScene = buildMultiFloorHQScene();
