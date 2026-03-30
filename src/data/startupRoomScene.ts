export type StartupRoomProp = {
  id: string;
  label: string;
  kind: "desk" | "chair";
  src: string;
  sourcePath: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  description: string;
};

export type StartupRoomMember = {
  id: string;
  label: string;
  role: "boss" | "employee" | "executive";
  spriteSrc: string;
  sourcePath: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  description: string;
};

export type StartupRoomPlacement = {
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
};

export type StartupFounderPose = "sit_down" | "walk_right" | "walk_left" | "coffee_right";

export type StartupFounderFrameSet = {
  frames: string[];
  frameMs: number;
  sourcePath: string;
  description: string;
  flipX?: boolean;
};

export type StartupFounderRoutineSegment =
  | {
      id: string;
      label: string;
      description: string;
      mode: "hold";
      pose: StartupFounderPose;
      durationMs: number;
      at: StartupRoomPlacement;
    }
  | {
      id: string;
      label: string;
      description: string;
      mode: "move";
      pose: StartupFounderPose;
      durationMs: number;
      from: StartupRoomPlacement;
      to: StartupRoomPlacement;
    };

export const startupRoomPositionRegistryPath = "src/data/startupRoomScene.ts";

const founderSeatPlacement: StartupRoomPlacement = {
  left: 46,
  top: 36.3,
  width: 8.2,
  height: 16.3,
  zIndex: 3,
};

const founderDeskLeftPlacement: StartupRoomPlacement = {
  left: 40.8,
  top: 36.6,
  width: 8.2,
  height: 16.3,
  zIndex: 3,
};

const founderDeskRightPlacement: StartupRoomPlacement = {
  left: 55.8,
  top: 36.8,
  width: 8.2,
  height: 16.3,
  zIndex: 3,
};

const founderWindowPlacement: StartupRoomPlacement = {
  left: 84.8,
  top: 41.2,
  width: 8.4,
  height: 15.8,
  zIndex: 5,
};

const founderFrameSets = {
  sit_down: {
    frames: [
      "/raw_assets/characters/boss/sit_down_0.png",
      "/raw_assets/characters/boss/sit_down_1.png",
    ],
    frameMs: 1700,
    sourcePath: "public/raw_assets/characters/boss/sit_down_0.png + sit_down_1.png",
    description: "Seated founder loop for the main desk.",
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
    frameMs: 210,
    sourcePath: "public/raw_assets/characters/boss/1.png -> 6.png",
    description: "Founder walks out from the desk and checks the team pod.",
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
    frameMs: 210,
    sourcePath: "public/raw_assets/characters/boss/1.png -> 6.png (mirrored)",
    description: "Founder returns from the team aisle back to the main desk.",
    flipX: true,
  },
  coffee_right: {
    frames: [
      "/raw_assets/characters/boss/coffee1.png",
      "/raw_assets/characters/boss/coffee2.png",
    ],
    frameMs: 900,
    sourcePath: "public/raw_assets/characters/boss/coffee1.png + coffee2.png",
    description: "Founder pauses by the window and drinks coffee.",
  },
} satisfies Record<StartupFounderPose, StartupFounderFrameSet>;

const founderRoutine = [
  {
    id: "focus-at-desk",
    label: "Focus At Desk",
    description: "Founder stays seated at the main desk while the rest of the startup room remains active.",
    mode: "hold",
    pose: "sit_down",
    durationMs: 20000,
    at: founderSeatPlacement,
  },
  {
    id: "shift-left",
    label: "Shift Left",
    description: "Founder first slides left behind the desk instead of stepping onto the tabletop.",
    mode: "move",
    pose: "walk_left",
    durationMs: 1800,
    from: founderSeatPlacement,
    to: founderDeskLeftPlacement,
  },
  {
    id: "cross-desk-line",
    label: "Move Right",
    description: "Founder crosses behind the desk line toward the right side of the office.",
    mode: "move",
    pose: "walk_right",
    durationMs: 2600,
    from: founderDeskLeftPlacement,
    to: founderDeskRightPlacement,
  },
  {
    id: "reach-window",
    label: "Reach Window",
    description: "Founder keeps moving right until reaching the window side.",
    mode: "move",
    pose: "walk_right",
    durationMs: 2800,
    from: founderDeskRightPlacement,
    to: founderWindowPlacement,
  },
  {
    id: "window-coffee",
    label: "Window Coffee",
    description: "Founder drinks coffee at the window before heading back to the desk.",
    mode: "hold",
    pose: "coffee_right",
    durationMs: 6000,
    at: founderWindowPlacement,
  },
  {
    id: "return-from-window",
    label: "Return Left",
    description: "Founder leaves the window and walks back toward the main desk.",
    mode: "move",
    pose: "walk_left",
    durationMs: 2800,
    from: founderWindowPlacement,
    to: founderDeskRightPlacement,
  },
  {
    id: "settle-at-desk",
    label: "Settle Back",
    description: "Founder walks back into the chair line and resumes the work loop.",
    mode: "move",
    pose: "walk_left",
    durationMs: 2600,
    from: founderDeskRightPlacement,
    to: founderSeatPlacement,
  },
] satisfies StartupFounderRoutineSegment[];

export const startupRoomScene = {
  levelLabel: "Level 02",
  title: "Startup Room",
  subtitle:
    "Stage 2 opens the startup office with a six-person capacity, real background art, and a proper founder-plus-team desk layout.",
  backgroundSrc: "/level-assets/backgrounds/startupbackground.png",
  maxCapacity: 6,
  founderFrameSets,
  founderRoutine,
  props: [
    {
      id: "founder-chair",
      label: "Founder Chair",
      kind: "chair",
      src: "/raw_assets/furniture/chairs/chair_boss_brown.png",
      sourcePath: "public/raw_assets/furniture/chairs/chair_boss_brown.png",
      left: 45.1,
      top: 36.3,
      width: 10.1,
      height: 14.8,
      zIndex: 3,
      description: "Brown boss chair placed at the founder's desk.",
    },
    {
      id: "founder-desk",
      label: "Founder Desk",
      kind: "desk",
      src: "/raw_assets/furniture/desks/boss desk back.png",
      sourcePath: "public/raw_assets/furniture/desks/boss desk back.png",
      left: 39.1,
      top: 34.9,
      width: 20.8,
      height: 27.1,
      zIndex: 4,
      description: "Founder desk at the center of the startup room.",
    },
    {
      id: "solo-chair",
      label: "Solo Builder Chair",
      kind: "chair",
      src: "/raw_assets/furniture/chairs/chair_gaming_black.png",
      sourcePath: "public/raw_assets/furniture/chairs/chair_gaming_black.png",
      left: 19.5,
      top: 47.8,
      width: 10.1,
      height: 15.1,
      zIndex: 3,
      description: "Gaming chair for the first solo builder station on the left.",
    },
    {
      id: "solo-desk",
      label: "Solo Builder Desk",
      kind: "desk",
      src: "/raw_assets/furniture/desks/desk_dual_monitor_back.png",
      sourcePath: "public/raw_assets/furniture/desks/desk_dual_monitor_back.png",
      left: 16.4,
      top: 51.2,
      width: 15.2,
      height: 20.6,
      zIndex: 4,
      description: "Dual-monitor back-facing workstation for the first builder seat.",
    },
    {
      id: "team-back-left-chair",
      label: "Team Back Left Chair",
      kind: "chair",
      src: "/raw_assets/furniture/chairs/chair_mesh.png",
      sourcePath: "public/raw_assets/furniture/chairs/chair_mesh.png",
      left: 63.31,
      top: 46.7,
      width: 10.1,
      height: 15.1,
      zIndex: 3,
      description: "Front-facing mesh chair for the back-left team seat.",
    },
    {
      id: "team-back-left-desk",
      label: "Team Back Left Desk",
      kind: "desk",
      src: "/raw_assets/furniture/desks/desk_empty_back.png",
      sourcePath: "public/raw_assets/furniture/desks/desk_empty_back.png",
      left: 62.2,
      top: 50.4,
      width: 12.5,
      height: 18.3,
      zIndex: 4,
      description: "Back-facing empty desk shell for the first team pod seat.",
    },
    {
      id: "team-back-right-chair",
      label: "Team Back Right Chair",
      kind: "chair",
      src: "/raw_assets/furniture/chairs/chair_mesh.png",
      sourcePath: "public/raw_assets/furniture/chairs/chair_mesh.png",
      left: 74.50,
      top: 46.7,
      width: 10.1,
      height: 15.1,
      zIndex: 3,
      description: "Front-facing mesh chair for the back-right team seat.",
    },
    {
      id: "team-back-right-desk",
      label: "Team Back Right Desk",
      kind: "desk",
      src: "/raw_assets/furniture/desks/desk_laptop_back.png",
      sourcePath: "public/raw_assets/furniture/desks/desk_laptop_back.png",
      left: 73.2,
      top: 50.2,
      width: 12.4,
      height: 18.1,
      zIndex: 4,
      description: "Laptop-back desk for the second seat in the raised team pod.",
    },
    {
      id: "team-front-left-desk",
      label: "Team Front Left Desk",
      kind: "desk",
      src: "/raw_assets/furniture/desks/desk_laptop.png",
      sourcePath: "public/raw_assets/furniture/desks/desk_laptop.png",
      left: 62.0,
      top: 59.8,
      width: 12.7,
      height: 18.4,
      zIndex: 4,
      description: "Front-facing laptop desk for the lower-left seat in the team pod.",
    },
    {
      id: "team-front-left-chair",
      label: "Team Front Left Chair",
      kind: "chair",
      src: "/raw_assets/furniture/chairs/chair_mesh_back.png",
      sourcePath: "public/raw_assets/furniture/chairs/chair_mesh_back.png",
      left: 63.41,
      top: 67.1,
      width: 10.1,
      height: 15.1,
      zIndex: 6,
      description: "Back-facing mesh chair for the lower-left pod seat.",
    },
    {
      id: "team-front-right-desk",
      label: "Team Front Right Desk",
      kind: "desk",
      src: "/raw_assets/furniture/desks/desk_dual_monitor.png",
      sourcePath: "public/raw_assets/furniture/desks/desk_dual_monitor.png",
      left: 72.7,
      top: 59.1,
      width: 14.4,
      height: 19.2,
      zIndex: 4,
      description: "Front-facing dual-monitor desk for the lower-right pod seat.",
    },
    {
      id: "team-front-right-chair",
      label: "Team Front Right Chair",
      kind: "chair",
      src: "/raw_assets/furniture/chairs/chair_mesh_back.png",
      sourcePath: "public/raw_assets/furniture/chairs/chair_mesh_back.png",
      left: 75.0,
      top: 67.1,
      width: 10.1,
      height: 15.1,
      zIndex: 6,
      description: "Back-facing mesh chair for the lower-right pod seat.",
    },
  ] satisfies StartupRoomProp[],
  team: [
    {
      id: "founder",
      label: "Founder",
      role: "boss",
      spriteSrc: "/raw_assets/characters/boss/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/boss/sit_down_0.png",
      ...founderSeatPlacement,
      description: "Founder leads the room from the main center desk.",
    },
    {
      id: "solo-builder",
      label: "Solo Builder",
      role: "executive",
      spriteSrc: "/raw_assets/characters/executive/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/executive/sit_down_0.png",
      left: 21.1,
      top: 47.7,
      width: 6.8,
      height: 14.0,
      zIndex: 3,
      description: "The first serious teammate station on the left side of the room.",
    },
    {
      id: "team-back-left",
      label: "Engineer 01",
      role: "employee",
      spriteSrc: "/raw_assets/characters/employee/sit_down_0.png",
      sourcePath: "public/raw_assets/characters/employee/sit_down_0.png",
      left: 65.0,
      top: 46.2,
      width: 6.6,
      height: 13.7,
      zIndex: 3,
      description: "Back-left seat in the main four-person pod.",
    },
    {
      id: "team-back-right",
      label: "Engineer 02",
      role: "employee",
      spriteSrc: "/raw_assets/characters/employee/sit_down_1.png",
      sourcePath: "public/raw_assets/characters/employee/sit_down_1.png",
      left: 76.3,
      top: 46.0,
      width: 6.6,
      height: 13.7,
      zIndex: 3,
      description: "Back-right seat in the main four-person pod.",
    },
    {
      id: "team-front-left",
      label: "Product",
      role: "employee",
      spriteSrc: "/raw_assets/characters/employee/sit_up_0.png",
      sourcePath: "public/raw_assets/characters/employee/sit_up_0.png",
      left: 65.0,
      top: 63.2,
      width: 6.8,
      height: 14.9,
      zIndex: 5,
      description: "Lower-left pod seat facing the monitors and the team cluster.",
    },
    {
      id: "team-front-right",
      label: "Operations",
      role: "executive",
      spriteSrc: "/raw_assets/characters/executive/sit_up_0.png",
      sourcePath: "public/raw_assets/characters/executive/sit_up_0.png",
      left: 76.6,
      top: 63.1,
      width: 6.8,
      height: 14.8,
      zIndex: 5,
      description: "Lower-right pod seat completing the six-person startup office.",
    },
  ] satisfies StartupRoomMember[],
} as const;
