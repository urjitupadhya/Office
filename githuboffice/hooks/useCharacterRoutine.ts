"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ── Types ──────────────────────────────────────────────── */

export type CharacterPose =
  | "sit_down"
  | "sit_up"
  | "walk_down"
  | "walk_up"
  | "walk_left"
  | "walk_right"
  | "idle";

export type CharacterPlacement = {
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  flipX?: boolean;
};

export type RoutineSegment =
  | {
      id: string;
      mode: "hold";
      pose: CharacterPose;
      durationMs: number;
      at: CharacterPlacement;
    }
  | {
      id: string;
      mode: "move";
      pose: CharacterPose;
      durationMs: number;
      from: CharacterPlacement;
      to: CharacterPlacement;
    };

/* ── Frame sets per pose ─────────────────────────────────── */

export type PoseFrameSet = {
  frames: string[];
  frameMs: number;
  flipX?: boolean;
};

export type PoseFrameSets = Partial<Record<CharacterPose, PoseFrameSet>>;

/* ── Lerp helper ─────────────────────────────────────────── */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPlacement(
  from: CharacterPlacement,
  to: CharacterPlacement,
  t: number,
): CharacterPlacement {
  return {
    left: lerp(from.left, to.left, t),
    top: lerp(from.top, to.top, t),
    width: lerp(from.width, to.width, t),
    height: lerp(from.height, to.height, t),
    zIndex: t < 0.5 ? from.zIndex : to.zIndex,
    flipX: t < 0.5 ? from.flipX : to.flipX,
  };
}

/* ── Main hook ───────────────────────────────────────────── */

export function useCharacterRoutine(
  routine: RoutineSegment[],
  frameSets: PoseFrameSets,
  /** Pass false for inactive characters — they skip the routine and stay static */
  active: boolean,
) {
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const rafRef = useRef<number>(0);

  const currentSegment = routine[segmentIndex % routine.length];
  const pose = currentSegment?.pose ?? "sit_down";
  const frameSet = frameSets[pose] ?? frameSets["sit_down"] ?? frameSets["sit_up"];

  const placement: CharacterPlacement | null = useMemo(() => {
    if (!currentSegment) return null;
    if (currentSegment.mode === "hold") return currentSegment.at;
    return lerpPlacement(currentSegment.from, currentSegment.to, progress >= 1 ? 0 : progress);
  }, [currentSegment, progress]);

  // Frame animation
  useEffect(() => {
    if (!active || !frameSet || frameSet.frames.length <= 1) return;
    const id = window.setInterval(() => {
      setFrameIndex((i) => (i + 1) % frameSet.frames.length);
    }, frameSet.frameMs);
    return () => window.clearInterval(id);
  }, [active, frameSet]);

  // Segment progress animation
  useEffect(() => {
    if (!active || !currentSegment) return;

    const startedAt = performance.now();
    const duration = currentSegment.durationMs;

    const step = (now: number) => {
      const p = Math.min((now - startedAt) / duration, 1);
      setProgress(p);
      if (p >= 1) {
        setSegmentIndex((i) => (i + 1) % routine.length);
        return;
      }
      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [active, currentSegment, routine.length]);

  const activeFrame = frameSet
    ? (frameSet.frames[frameIndex % frameSet.frames.length] ?? frameSet.frames[0])
    : null;

  const flipX = frameSet?.flipX ?? placement?.flipX ?? false;
  const isSitting = pose.startsWith("sit");

  return {
    placement,
    activeFrame,
    flipX,
    isSitting,
    currentSegment,
  };
}
