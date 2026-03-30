/**
 * Office routines — per-role per-stage.
 * Each routine is a loop of hold/move segments.
 * Inactive characters skip this and stay at their seat position.
 */

import type {
  RoutineSegment,
  PoseFrameSets,
  CharacterPlacement,
} from "@githuboffice/hooks/useCharacterRoutine";

/* ── Shared frame sets ───────────────────────────────────── */

export const bossFrameSets: PoseFrameSets = {
  sit_down: {
    frames: ["/raw_assets/characters/boss/sit_down_0.png", "/raw_assets/characters/boss/sit_down_1.png"],
    frameMs: 1700,
  },
  sit_up: {
    frames: ["/raw_assets/characters/boss/sit_up_0.png", "/raw_assets/characters/boss/sit_up_1.png"],
    frameMs: 1700,
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
    frameMs: 180,
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
    frameMs: 180,
    flipX: true,
  },
  walk_down: {
    frames: [
      "/raw_assets/characters/boss/walk_down_0.png",
      "/raw_assets/characters/boss/walk_down_1.png",
      "/raw_assets/characters/boss/walk_down_2.png",
      "/raw_assets/characters/boss/walk_down_3.png",
    ],
    frameMs: 150,
  },
  walk_up: {
    frames: [
      "/raw_assets/characters/boss/walk_up_0.png",
      "/raw_assets/characters/boss/walk_up_1.png",
      "/raw_assets/characters/boss/walk_up_2.png",
      "/raw_assets/characters/boss/walk_up_3.png",
    ],
    frameMs: 150,
  },
  idle: {
    frames: ["/raw_assets/characters/boss/coffee_down_0.png", "/raw_assets/characters/boss/coffee_down_1.png"],
    frameMs: 900,
  },
};

export const executiveFrameSets: PoseFrameSets = {
  sit_down: {
    frames: ["/raw_assets/characters/executive/sit_down_0.png", "/raw_assets/characters/executive/sit_down_1.png"],
    frameMs: 1900,
  },
  sit_up: {
    frames: ["/raw_assets/characters/executive/sit_up_0.png", "/raw_assets/characters/executive/sit_up_1.png"],
    frameMs: 1900,
  },
  walk_right: {
    frames: [
      "/raw_assets/characters/executive/walk_right_0.png",
      "/raw_assets/characters/executive/walk_right_1.png",
      "/raw_assets/characters/executive/walk_right_2.png",
      "/raw_assets/characters/executive/walk_right_3.png",
    ],
    frameMs: 160,
  },
  walk_left: {
    frames: [
      "/raw_assets/characters/executive/walk_left_0.png",
      "/raw_assets/characters/executive/walk_left_1.png",
      "/raw_assets/characters/executive/walk_left_2.png",
      "/raw_assets/characters/executive/walk_left_3.png",
    ],
    frameMs: 160,
  },
  walk_down: {
    frames: [
      "/raw_assets/characters/executive/walk_down_0.png",
      "/raw_assets/characters/executive/walk_down_1.png",
      "/raw_assets/characters/executive/walk_down_2.png",
      "/raw_assets/characters/executive/walk_down_3.png",
    ],
    frameMs: 160,
  },
  walk_up: {
    frames: [
      "/raw_assets/characters/executive/walk_up_0.png",
      "/raw_assets/characters/executive/walk_up_1.png",
      "/raw_assets/characters/executive/walk_up_2.png",
      "/raw_assets/characters/executive/walk_up_3.png",
    ],
    frameMs: 160,
  },
  idle: {
    frames: ["/raw_assets/characters/executive/coffee_down_0.png", "/raw_assets/characters/executive/coffee_down_1.png"],
    frameMs: 900,
  },
};

export const employeeFrameSets: PoseFrameSets = {
  sit_down: {
    frames: ["/raw_assets/characters/employee/sit_down_0.png", "/raw_assets/characters/employee/sit_down_1.png"],
    frameMs: 2000,
  },
  sit_up: {
    frames: ["/raw_assets/characters/employee/sit_up_0.png", "/raw_assets/characters/employee/sit_up_1.png"],
    frameMs: 2000,
  },
  walk_right: {
    frames: [
      "/raw_assets/characters/employee/walk_right_0.png",
      "/raw_assets/characters/employee/walk_right_1.png",
      "/raw_assets/characters/employee/walk_right_2.png",
      "/raw_assets/characters/employee/walk_right_3.png",
    ],
    frameMs: 150,
  },
  walk_left: {
    frames: [
      "/raw_assets/characters/employee/walk_left_0.png",
      "/raw_assets/characters/employee/walk_left_1.png",
      "/raw_assets/characters/employee/walk_left_2.png",
      "/raw_assets/characters/employee/walk_left_3.png",
    ],
    frameMs: 150,
  },
  walk_down: {
    frames: [
      "/raw_assets/characters/employee/walk_down_0.png",
      "/raw_assets/characters/employee/walk_down_1.png",
      "/raw_assets/characters/employee/walk_down_2.png",
      "/raw_assets/characters/employee/walk_down_3.png",
    ],
    frameMs: 150,
  },
  walk_up: {
    frames: [
      "/raw_assets/characters/employee/walk_up_0.png",
      "/raw_assets/characters/employee/walk_up_1.png",
      "/raw_assets/characters/employee/walk_up_2.png",
      "/raw_assets/characters/employee/walk_up_3.png",
    ],
    frameMs: 150,
  },
  idle: {
    frames: ["/raw_assets/characters/employee/coffee_down_0.png", "/raw_assets/characters/employee/coffee_down_1.png"],
    frameMs: 900,
  },
};

/* ── Routine builder helpers ────────────────────────────── */

/** Build a simple sit-work-coffee-return loop given seat and coffee-spot placements */
function buildWorkRoutine(
  sitPose: "sit_down" | "sit_up",
  seat: CharacterPlacement,
  coffeeSpot: CharacterPlacement,
  offsetSeatMs = 0,
): RoutineSegment[] {
  // Stagger: hold at seat for different durations so not everyone walks at once
  const workMs = 16000 + offsetSeatMs;
  const travelMs = 2200;
  const coffeeMs = 5000;

  const walkPoseOut: RoutineSegment["pose"] = coffeeSpot.left > seat.left ? "walk_right" : "walk_left";
  const walkPoseBack: RoutineSegment["pose"] = coffeeSpot.left > seat.left ? "walk_left" : "walk_right";

  return [
    { id: "work", mode: "hold", pose: sitPose, durationMs: workMs, at: seat },
    { id: "go-coffee", mode: "move", pose: walkPoseOut, durationMs: travelMs, from: seat, to: coffeeSpot },
    { id: "drink", mode: "hold", pose: "idle", durationMs: coffeeMs, at: coffeeSpot },
    { id: "go-back", mode: "move", pose: walkPoseBack, durationMs: travelMs, from: coffeeSpot, to: seat },
  ];
}

/* ──────────────────────────────────────────────────────────
   Stage 1: Solo — Boss only
   Canvas: 1244 × 684 background image
────────────────────────────────────────────────────────── */

const stage1BossSeat: CharacterPlacement = {
  left: 30.7, top: 48.4, width: 20.1, height: 29.6, zIndex: 5,
};
const stage1BossCoffee: CharacterPlacement = {
  left: 74.0, top: 42.0, width: 18.0, height: 28.0, zIndex: 7,
};

export const stage1BossRoutine: RoutineSegment[] = buildWorkRoutine("sit_up", stage1BossSeat, stage1BossCoffee);

/* ──────────────────────────────────────────────────────────
   Stage 2: Startup
   Canvas: 1024 × 768  background image
────────────────────────────────────────────────────────── */

const stage2BossSeat: CharacterPlacement = {
  left: 46, top: 36.3, width: 8.2, height: 16.3, zIndex: 3,
};
const stage2BossCoffee: CharacterPlacement = {
  left: 84.8, top: 41.2, width: 8.4, height: 15.8, zIndex: 5,
};

export const stage2BossRoutine: RoutineSegment[] = [
  { id: "focus-at-desk", mode: "hold", pose: "sit_down", durationMs: 20000, at: stage2BossSeat },
  {
    id: "cross-right", mode: "move", pose: "walk_right", durationMs: 2600,
    from: { ...stage2BossSeat, left: 40.8 },
    to: { ...stage2BossSeat, left: 55.8 },
  },
  {
    id: "reach-window", mode: "move", pose: "walk_right", durationMs: 2800,
    from: { ...stage2BossSeat, left: 55.8 },
    to: stage2BossCoffee,
  },
  { id: "coffee", mode: "hold", pose: "idle", durationMs: 6000, at: stage2BossCoffee },
  {
    id: "return", mode: "move", pose: "walk_left", durationMs: 4000,
    from: stage2BossCoffee, to: stage2BossSeat,
  },
];

// Executive (solo-builder desk) — short coffee trip to the right
const stage2ExecSeat: CharacterPlacement = {
  left: 24, top: 39, width: 8.2, height: 16.3, zIndex: 3,
};
const stage2ExecCoffee: CharacterPlacement = {
  left: 38, top: 40, width: 8.2, height: 15.0, zIndex: 4,
};
export const stage2ExecutiveRoutine: RoutineSegment[] = buildWorkRoutine("sit_down", stage2ExecSeat, stage2ExecCoffee, 5000);

// Employees — back row pair take a short walk left, front row pair walk right
const stage2EmpBackSeat: CharacterPlacement = {
  left: 14, top: 28, width: 8, height: 15, zIndex: 3,
};
const stage2EmpFrontSeat: CharacterPlacement = {
  left: 14, top: 55, width: 8, height: 15, zIndex: 5,
};
const stage2EmpCoffee: CharacterPlacement = {
  left: 5, top: 40, width: 8, height: 14, zIndex: 6,
};
export const stage2EmployeeDownRoutine: RoutineSegment[] = buildWorkRoutine("sit_down", stage2EmpBackSeat, stage2EmpCoffee, 8000);
export const stage2EmployeeUpRoutine: RoutineSegment[] = buildWorkRoutine("sit_up", stage2EmpFrontSeat, stage2EmpCoffee, 3000);

/* ──────────────────────────────────────────────────────────
   Stage 3: Medium Studio
   Each character walks to a shared coffee machine area
   We build generic routines using the occupant's own seat position
   and a coffee spot offset to the right
────────────────────────────────────────────────────────── */

/** Generic routine for medium/scalable stages — uses occupant.left/top directly */
export function buildGenericRoutine(
  seat: CharacterPlacement,
  sitPose: "sit_down" | "sit_up",
  coffeeOffsetLeft: number,
  staggerMs: number,
): RoutineSegment[] {
  return [
    { id: "work", mode: "hold", pose: sitPose, durationMs: 16000 + staggerMs, at: seat },
    { id: "drink", mode: "hold", pose: "idle", durationMs: 5000, at: seat }
  ];
}
