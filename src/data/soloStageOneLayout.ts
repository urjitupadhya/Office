export type StageSprite = {
  id: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  sourcePath: string;
  src?: string;
  frames?: string[];
  description: string;
};

export type FounderPose =
  | "sit_up"
  | "walk_down"
  | "walk_right"
  | "walk_left"
  | "walk_up"
  | "coffee_right"
  | "coffee_left";

export type FounderPlacement = {
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
};

export type FounderFrameSet = {
  frames: string[];
  frameMs: number;
  sourcePath: string;
  description: string;
  flipX?: boolean;
};

export type FounderRoutineSegment =
  | {
      id: string;
      label: string;
      description: string;
      mode: "hold";
      pose: FounderPose;
      durationMs: number;
      at: FounderPlacement;
    }
  | {
      id: string;
      label: string;
      description: string;
      mode: "move";
      pose: FounderPose;
      durationMs: number;
      from: FounderPlacement;
      to: FounderPlacement;
    };

export const soloStageOneRegistryPath = "src/data/soloStageOneLayout.ts";

const deskPlacement = {
  left: 25.6,
  top: 45.4,
  width: 30.2,
  height: 30.2,
  zIndex: 4,
} as const;

const founderSeatPlacement: FounderPlacement = {
  left: 30.7,
  top: 48.4,
  width: 20.1,
  height: 29.6,
  zIndex: 5,
};

const chairPlacement = {
  left: 30.2,
  top: 56.2,
  width: 20.9,
  height: 28.8,
  zIndex: 6,
} as const;

const elevatorPlacement = {
  left: 89.9,
  top: 4.2,
  width: 8.6,
  height: 14.2,
  zIndex: 4,
} as const;

const founderFloorPlacement: FounderPlacement = {
  left: 41.8,
  top: 55.4,
  width: 20,
  height: 29.8,
  zIndex: 7,
};

const founderRoamPlacement: FounderPlacement = {
  left: 58.4,
  top: 58.8,
  width: 20.4,
  height: 29.5,
  zIndex: 7,
};

const founderWindowApproachPlacement: FounderPlacement = {
  left: 7.8,
  top: 55.2,
  width: 18.8,
  height: 29.2,
  zIndex: 7,
};

const founderCoffeePlacement: FounderPlacement = {
  left: founderWindowApproachPlacement.left,
  top: founderWindowApproachPlacement.top,
  width: founderWindowApproachPlacement.width,
  height: founderWindowApproachPlacement.height,
  zIndex: founderWindowApproachPlacement.zIndex,
};

const founderReturnPlacement: FounderPlacement = {
  left: 42.8,
  top: 58.6,
  width: 20.4,
  height: 29.5,
  zIndex: 7,
};

export const soloStageOneLayout = {
  levelLabel: "Level 01",
  title: "Solo Leveling",
  subtitle:
    "The solo-office background stays intact, while the founder sits for 20 seconds, walks right, heads to the window for coffee, and returns to the chair on a loop.",
  backgroundSrc: "/level-assets/backgrounds/solo-office-stage-01.png",
  sprites: [
    {
      id: "desk",
      label: "Desk",
      ...deskPlacement,
      sourcePath: "public/raw_assets/furniture/desks/desk_dual_monitor.png",
      src: "/raw_assets/furniture/desks/desk_dual_monitor.png",
      description: "Dual-monitor desk placed over the founder work area.",
    },
    {
      id: "founder",
      label: "Boss",
      ...founderSeatPlacement,
      sourcePath: "public/raw_assets/characters/boss/{sit_up_*,1..6,coffee1,coffee2}.png",
      description: "Founder uses sitting, walking, and coffee poses based on the registered routine below.",
    },
    {
      id: "chair",
      label: "Chair",
      ...chairPlacement,
      sourcePath: "public/raw_assets/furniture/chairs/chair_mesh_back.png",
      src: "/raw_assets/furniture/chairs/chair_mesh_back.png",
      description: "Back-view mesh chair placed in front of the founder sprite.",
    },
    {
      id: "elevator",
      label: "Elevator",
      ...elevatorPlacement,
      sourcePath: "public/raw_assets/furniture/infrastructure/elevator_closed.png",
      src: "/raw_assets/furniture/infrastructure/elevator_closed.png",
      description: "Closed elevator sprite placed on the top-right elevator location.",
    },
  ] satisfies StageSprite[],
  founderFrameSets: {
    sit_up: {
      frames: [
        "/raw_assets/characters/boss/sit_up_0.png",
        "/raw_assets/characters/boss/sit_up_1.png",
      ],
      frameMs: 1100,
      sourcePath: "public/raw_assets/characters/boss/sit_up_0.png + sit_up_1.png",
      description: "Used while the founder is seated at the chair.",
    },
    walk_down: {
      frames: [
        "/raw_assets/characters/boss/walk_down_0.png",
        "/raw_assets/characters/boss/walk_down_1.png",
        "/raw_assets/characters/boss/walk_down_2.png",
        "/raw_assets/characters/boss/walk_down_3.png",
      ],
      frameMs: 260,
      sourcePath:
        "public/raw_assets/characters/boss/walk_down_0.png ... walk_down_3.png",
      description: "Legacy downward walk frames kept in the registry but not used in the main route.",
    },
    walk_right: {
      frames: [
        "/raw_assets/characters/boss/1.png",
        "/raw_assets/characters/boss/2.png",
        "/raw_assets/characters/boss/3.png",
        "/raw_assets/characters/boss/4.png",
        "/raw_assets/characters/boss/5.png",
        "/raw_assets/characters/boss/6.png",
      ],
      frameMs: 220,
      sourcePath: "public/raw_assets/characters/boss/1.png ... 6.png",
      description: "Uses the new six-frame right-facing walk cycle.",
    },
    walk_left: {
      frames: [
        "/raw_assets/characters/boss/1.png",
        "/raw_assets/characters/boss/2.png",
        "/raw_assets/characters/boss/3.png",
        "/raw_assets/characters/boss/4.png",
        "/raw_assets/characters/boss/5.png",
        "/raw_assets/characters/boss/6.png",
      ],
      frameMs: 220,
      sourcePath: "public/raw_assets/characters/boss/1.png ... 6.png (flipped in scene)",
      description: "Uses the same six-frame walk cycle mirrored for left movement.",
      flipX: true,
    },
    walk_up: {
      frames: [
        "/raw_assets/characters/boss/walk_up_0.png",
        "/raw_assets/characters/boss/walk_up_1.png",
        "/raw_assets/characters/boss/walk_up_2.png",
        "/raw_assets/characters/boss/walk_up_3.png",
      ],
      frameMs: 260,
      sourcePath: "public/raw_assets/characters/boss/walk_up_0.png ... walk_up_3.png",
      description: "Used while the founder heads back toward the desk.",
    },
    coffee_right: {
      frames: [
        "/raw_assets/characters/boss/coffee1.png",
        "/raw_assets/characters/boss/coffee2.png",
      ],
      frameMs: 900,
      sourcePath: "public/raw_assets/characters/boss/coffee1.png + coffee2.png",
      description: "Uses the new coffee animation while facing right.",
    },
    coffee_left: {
      frames: [
        "/raw_assets/characters/boss/coffee1.png",
        "/raw_assets/characters/boss/coffee2.png",
      ],
      frameMs: 900,
      sourcePath: "public/raw_assets/characters/boss/coffee1.png + coffee2.png (flipped in scene)",
      description: "Uses the new coffee animation mirrored while the founder faces the window.",
      flipX: true,
    },
  } satisfies Record<FounderPose, FounderFrameSet>,
  founderRoutine: [
    {
      id: "focus-start",
      label: "Focus Start",
      description: "The founder starts seated at the designated chair.",
      mode: "hold",
      pose: "sit_up",
      durationMs: 20000,
      at: founderSeatPlacement,
    },
    {
      id: "leave-chair",
      label: "Stand And Move Right",
      description: "Stand up from the chair and start moving right immediately.",
      mode: "move",
      pose: "walk_right",
      durationMs: 2600,
      from: founderSeatPlacement,
      to: founderFloorPlacement,
    },
    {
      id: "roam-right",
      label: "Roam Right",
      description: "Walk right across the room after standing up from the desk.",
      mode: "move",
      pose: "walk_right",
      durationMs: 3400,
      from: founderFloorPlacement,
      to: founderRoamPlacement,
    },
    {
      id: "window-walk",
      label: "Head To Window",
      description: "Cross back toward the left side and stop by the window.",
      mode: "move",
      pose: "walk_left",
      durationMs: 4200,
      from: founderRoamPlacement,
      to: founderWindowApproachPlacement,
    },
    {
      id: "coffee-break",
      label: "Window Coffee",
      description: "Look out the window and drink coffee for a while.",
      mode: "hold",
      pose: "coffee_left",
      durationMs: 6000,
      at: founderCoffeePlacement,
    },
    {
      id: "loop-back",
      label: "Loop Back",
      description: "Leave the window and walk back toward the desk area.",
      mode: "move",
      pose: "walk_right",
      durationMs: 3200,
      from: founderCoffeePlacement,
      to: founderReturnPlacement,
    },
    {
      id: "return-desk",
      label: "Return To Desk",
      description: "Walk back up toward the chair and settle into position.",
      mode: "move",
      pose: "walk_up",
      durationMs: 2600,
      from: founderReturnPlacement,
      to: founderSeatPlacement,
    },
  ] satisfies FounderRoutineSegment[],
} as const;
