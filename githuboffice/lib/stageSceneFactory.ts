import { buildMultiFloorHQScene } from "@/data/multiFloorHQScene";
import type { LayoutEditorElement } from "@/data/layoutEditorTypes";
import { soloStageOneLayout } from "@/data/soloStageOneLayout";
import { startupRoomScene } from "@/data/startupRoomScene";
import { teamStudioLayoutDraft } from "@/data/teamStudioLayoutDraft";
import type {
  ContributorRole,
  GitHubOfficeFloor,
  GitHubOfficeSceneModel,
  OfficeSceneElement,
  OfficeSeatAnchor,
  OfficeSeatAssignment,
} from "../types";

const employeeFrontSprite = "/raw_assets/characters/employee/sit_up_0.png";
const bossSleepDownSprite = "/raw_assets/characters/boss/sleep_down_1.png";
const employeeSleepDownSprite = "/raw_assets/characters/employee/sleep_down_1.png";
const employeeSleepUpSprite = "/raw_assets/characters/employee/sleep_up_1.png";
const executiveSleepDownSprite = "/raw_assets/characters/executive/sleep_down_1.png";
const executiveSleepUpSprite = "/raw_assets/characters/executive/sleep_up_1.png";

const stageMetadata = {
  solo: {
    stageLabel: "Stage 01",
    title: "Solo Contributor Office",
    subtitle: "The branch is being carried by the repo owner alone, so the founder office stays active.",
  },
  startup: {
    stageLabel: "Stage 02",
    title: "Startup Contributor Office",
    subtitle: "A small contributor team unlocks the startup room with one executive desk and four employee seats.",
  },
  medium: {
    stageLabel: "Stage 03",
    title: "Contributor Growth Floor",
    subtitle: "Mid-sized contributor branches use the fixed studio floor: 1 boss, 4 executive cabins, and 48 employee seats.",
  },
  scalable: {
    stageLabel: "Stage 04",
    title: "Scalable Contributor HQ",
    subtitle: "Large contributor branches move into the HQ floor where executive suites stay fixed and employee bands expand.",
  },
} as const;

function createImageElement(options: {
  id: string;
  label: string;
  src: string;
  sourcePath: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  category: string;
  group: string;
}): OfficeSceneElement {
  return {
    ...options,
    renderMode: "image",
    repeat: false,
    backgroundSize: "contain",
    opacity: 1,
    cropLeft: 0,
    cropTop: 0,
    cropRight: 0,
    cropBottom: 0,
  };
}

function sortSeatAnchors(left: OfficeSeatAnchor, right: OfficeSeatAnchor) {
  if (left.top !== right.top) {
    return left.top - right.top;
  }

  if (left.left !== right.left) {
    return left.left - right.left;
  }

  if (left.zIndex !== right.zIndex) {
    return left.zIndex - right.zIndex;
  }

  return left.id.localeCompare(right.id);
}

function inferRoleFromGroup(group: string): ContributorRole {
  if (group.includes("/boss")) {
    return "boss";
  }

  if (group.includes("/executive")) {
    return "executive";
  }

  return "employee";
}

function isCharacterElement(element: LayoutEditorElement | OfficeSceneElement) {
  return element.category === "characters" || element.group.startsWith("characters/");
}

function toAnchorFromElement(element: LayoutEditorElement | OfficeSceneElement): OfficeSeatAnchor {
  return {
    id: element.id,
    label: element.label,
    role: inferRoleFromGroup(element.group),
    spriteSrc: element.src,
    left: element.left,
    top: element.top,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    description: element.label,
  };
}

function inferSeatFacing(spriteSrc: string) {
  return spriteSrc.includes("_up_") ? "up" : "down";
}

function getInactiveSeatSprite(anchor: OfficeSeatAnchor) {
  if (anchor.role === "boss") {
    return bossSleepDownSprite;
  }

  const facing = inferSeatFacing(anchor.spriteSrc);

  if (anchor.role === "executive") {
    return facing === "up" ? executiveSleepUpSprite : executiveSleepDownSprite;
  }

  return facing === "up" ? employeeSleepUpSprite : employeeSleepDownSprite;
}

function getSeatSprite(anchor: OfficeSeatAnchor, isInactive: boolean) {
  if (!isInactive) {
    return anchor.spriteSrc;
  }

  return getInactiveSeatSprite(anchor);
}

function assignSeats(floor: GitHubOfficeFloor, anchors: OfficeSeatAnchor[]) {
  const bossAnchors = anchors.filter((anchor) => anchor.role === "boss").sort(sortSeatAnchors);
  const executiveAnchors = anchors.filter((anchor) => anchor.role === "executive").sort(sortSeatAnchors);
  const employeeAnchors = anchors.filter((anchor) => anchor.role === "employee").sort(sortSeatAnchors);
  const assignments: OfficeSeatAssignment[] = [];

  if (floor.boss && bossAnchors[0]) {
    assignments.push({
      ...bossAnchors[0],
      spriteSrc: getSeatSprite(bossAnchors[0], floor.boss.isInactive),
      contributor: floor.boss,
    });
  }

  floor.topContributors.forEach((contributor, index) => {
    const anchor = executiveAnchors[index];

    if (!anchor) {
      return;
    }

    assignments.push({
      ...anchor,
      spriteSrc: getSeatSprite(anchor, contributor.isInactive),
      contributor,
    });
  });

  floor.employees.forEach((contributor, index) => {
    const anchor = employeeAnchors[index];

    if (!anchor) {
      return;
    }

    assignments.push({
      ...anchor,
      spriteSrc: getSeatSprite(anchor, contributor.isInactive),
      contributor,
    });
  });

  return {
    seatCapacity: anchors.length,
    occupants: assignments.sort(sortSeatAnchors),
  };
}

function buildSoloSceneModel(floor: GitHubOfficeFloor): GitHubOfficeSceneModel {
  const founderSprite = soloStageOneLayout.sprites.find((item) => item.id === "founder");

  if (!founderSprite) {
    throw new Error("Solo founder sprite is missing from soloStageOneLayout.");
  }

  const elements = soloStageOneLayout.sprites.flatMap((item) => {
    if (item.id === "founder" || !("src" in item)) {
      return [];
    }

    return [
      createImageElement({
        id: item.id,
        label: item.label,
        src: item.src,
        sourcePath: item.sourcePath,
        left: item.left,
        top: item.top,
        width: item.width,
        height: item.height,
        zIndex: item.zIndex,
        category: item.id === "elevator" ? "infrastructure" : "stage1-prop",
        group: item.id === "elevator" ? "furniture/infrastructure" : "stage1/props",
      }),
    ];
  });

  const bossAnchor: OfficeSeatAnchor = {
    id: founderSprite.id,
    label: founderSprite.label,
    role: "boss",
    spriteSrc: soloStageOneLayout.founderFrameSets.sit_up.frames[0],
    left: founderSprite.left,
    top: founderSprite.top,
    width: founderSprite.width,
    height: founderSprite.height,
    zIndex: founderSprite.zIndex,
    description: founderSprite.description,
  };

  const { occupants, seatCapacity } = assignSeats(floor, [bossAnchor]);
  const metadata = stageMetadata.solo;

  return {
    stage: "solo",
    stageLabel: metadata.stageLabel,
    title: metadata.title,
    subtitle: metadata.subtitle,
    branchName: floor.branchName,
    backgroundSrc: soloStageOneLayout.backgroundSrc,
    aspectRatio: "1024 / 768",
    elements,
    occupants,
    seatCapacity,
    usedSeatCount: occupants.length,
    totalContributors: floor.total,
    boss: floor.boss,
    topContributors: floor.topContributors,
    employees: floor.employees,
  };
}

function buildStartupSceneModel(floor: GitHubOfficeFloor): GitHubOfficeSceneModel {
  const startupElements = startupRoomScene.props.map((item) =>
    createImageElement({
      id: item.id,
      label: item.label,
      src: item.src,
      sourcePath: item.sourcePath,
      left: item.left,
      top: item.top,
      width: item.width,
      height: item.height,
      zIndex: item.zIndex,
      category: item.kind,
      group: "startup/props",
    }),
  );

  const teamMemberById = new Map(startupRoomScene.team.map((member) => [member.id, member]));

  const founder = teamMemberById.get("founder");
  const executive = teamMemberById.get("solo-builder");
  const backLeft = teamMemberById.get("team-back-left");
  const backRight = teamMemberById.get("team-back-right");
  const frontLeft = teamMemberById.get("team-front-left");
  const frontRight = teamMemberById.get("team-front-right");

  if (!founder || !executive || !backLeft || !backRight || !frontLeft || !frontRight) {
    throw new Error("Startup scene seat anchors are incomplete.");
  }

  const anchors: OfficeSeatAnchor[] = [
    {
      id: founder.id,
      label: founder.label,
      role: "boss",
      spriteSrc: founder.spriteSrc,
      left: founder.left,
      top: founder.top,
      width: founder.width,
      height: founder.height,
      zIndex: founder.zIndex,
      description: founder.description,
    },
    {
      id: executive.id,
      label: executive.label,
      role: "executive",
      spriteSrc: executive.spriteSrc,
      left: executive.left,
      top: executive.top,
      width: executive.width,
      height: executive.height,
      zIndex: executive.zIndex,
      description: executive.description,
    },
    {
      id: backLeft.id,
      label: backLeft.label,
      role: "employee",
      spriteSrc: backLeft.spriteSrc,
      left: backLeft.left,
      top: backLeft.top,
      width: backLeft.width,
      height: backLeft.height,
      zIndex: backLeft.zIndex,
      description: backLeft.description,
    },
    {
      id: backRight.id,
      label: backRight.label,
      role: "employee",
      spriteSrc: backRight.spriteSrc,
      left: backRight.left,
      top: backRight.top,
      width: backRight.width,
      height: backRight.height,
      zIndex: backRight.zIndex,
      description: backRight.description,
    },
    {
      id: frontLeft.id,
      label: frontLeft.label,
      role: "employee",
      spriteSrc: frontLeft.spriteSrc,
      left: frontLeft.left,
      top: frontLeft.top,
      width: frontLeft.width,
      height: frontLeft.height,
      zIndex: frontLeft.zIndex,
      description: frontLeft.description,
    },
    {
      id: frontRight.id,
      label: frontRight.label,
      role: "employee",
      spriteSrc: employeeFrontSprite,
      left: frontRight.left,
      top: frontRight.top,
      width: frontRight.width,
      height: frontRight.height,
      zIndex: frontRight.zIndex,
      description: frontRight.description,
    },
  ];

  const { occupants, seatCapacity } = assignSeats(floor, anchors);
  const metadata = stageMetadata.startup;

  return {
    stage: "startup",
    stageLabel: metadata.stageLabel,
    title: metadata.title,
    subtitle: metadata.subtitle,
    branchName: floor.branchName,
    backgroundSrc: startupRoomScene.backgroundSrc,
    aspectRatio: "1024 / 768",
    elements: startupElements,
    occupants,
    seatCapacity,
    usedSeatCount: occupants.length,
    totalContributors: floor.total,
    boss: floor.boss,
    topContributors: floor.topContributors,
    employees: floor.employees,
  };
}

function buildDraftSceneModel(
  floor: GitHubOfficeFloor,
  scene: {
    canvas: { aspectRatio: string };
    elements: ReadonlyArray<OfficeSceneElement>;
  },
  stage: "medium" | "scalable",
): GitHubOfficeSceneModel {
  const anchors = scene.elements
    .filter((item) => isCharacterElement(item))
    .map(toAnchorFromElement);
  const baseElements = scene.elements.filter((item) => !isCharacterElement(item));
  const { occupants, seatCapacity } = assignSeats(floor, anchors);
  const metadata = stageMetadata[stage];

  return {
    stage,
    stageLabel: metadata.stageLabel,
    title: metadata.title,
    subtitle: metadata.subtitle,
    branchName: floor.branchName,
    backgroundSrc: null,
    aspectRatio: scene.canvas.aspectRatio,
    elements: [...baseElements].sort((left, right) => left.zIndex - right.zIndex),
    occupants,
    seatCapacity,
    usedSeatCount: occupants.length,
    totalContributors: floor.total,
    boss: floor.boss,
    topContributors: floor.topContributors,
    employees: floor.employees,
  };
}

function buildMediumSceneModel(floor: GitHubOfficeFloor): GitHubOfficeSceneModel {
  return buildDraftSceneModel(floor, teamStudioLayoutDraft, "medium");
}

function buildScalableSceneModel(floor: GitHubOfficeFloor): GitHubOfficeSceneModel {
  const scene = buildMultiFloorHQScene(floor.total);

  return buildDraftSceneModel(
    floor,
    {
      canvas: scene.canvas,
      elements: scene.elements,
    },
    "scalable",
  );
}

export function buildGitHubOfficeSceneModel(floor: GitHubOfficeFloor) {
  if (floor.stage === "solo") {
    return buildSoloSceneModel(floor);
  }

  if (floor.stage === "startup") {
    return buildStartupSceneModel(floor);
  }

  if (floor.stage === "medium") {
    return buildMediumSceneModel(floor);
  }

  return buildScalableSceneModel(floor);
}
