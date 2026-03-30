"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { PixelPatternFill } from "@/components/PixelPatternFill";
import type { GitHubOfficeSceneModel, OfficeSeatAssignment, OfficeSceneElement, OfficeStageId } from "../types";
import { useCharacterRoutine } from "@githuboffice/hooks/useCharacterRoutine";
import type { RoutineSegment, PoseFrameSets, CharacterPlacement } from "@githuboffice/hooks/useCharacterRoutine";
import {
  bossFrameSets,
  executiveFrameSets,
  employeeFrameSets,
  buildGenericRoutine,
  stage1BossRoutine,
  stage2BossRoutine,
  stage2ExecutiveRoutine,
  stage2EmployeeDownRoutine,
  stage2EmployeeUpRoutine,
} from "@githuboffice/lib/officeRoutines";

/* ─── Avatar position config per STAGE × ROLE × DIRECTION ───
   Each stage has its own independent set of avatar placements.
   Tweak any entry without affecting other stages.
   labelTop: CSS top for the name tag — independent per entry  */
type AvatarPlacement = {
  top: string;       // circle CSS top (negative = above sprite)
  left: string;      // circle CSS left (50% = centered)
  width: string;     // circle diameter relative to sprite width
  labelTop: string;  // name tag CSS top — tweak per stage/role/dir
};

const AVATAR_CONFIG: Record<string, Record<string, AvatarPlacement>> = {
  // ── Stage 1: Solo ──
  solo: {
    "boss-down":       { top: "-25%",  left: "50%", width: "35%",  labelTop: "12%"  },
    "boss-up":         { top: "-25%",  left: "50%", width: "35%",  labelTop: "12%"  },
    "executive-down":  { top: "-20%",  left: "50%", width: "50%",  labelTop: "10%"  },
    "executive-up":    { top: "-20%",  left: "50%", width: "50%",  labelTop: "10%"  },
    "employee-down":   { top: "-30%",  left: "50%", width: "60%",  labelTop: "5%"   },
    "employee-up":     { top: "-30%",  left: "50%", width: "60%",  labelTop: "5%"   },
  },

  // ── Stage 2: Startup ──
  startup: {
    "boss-down":       { top: "-35%",  left: "50%", width: "55%",  labelTop: "5%"   },
    "boss-up":         { top: "-25%",  left: "50%", width: "55%",  labelTop: "10%"  },
    "executive-down":  { top: "-30%",  left: "50%", width: "50%",  labelTop: "5%"   },
    "executive-up":    { top: "-20%",  left: "50%", width: "50%",  labelTop: "12%"  },
    "employee-down":   { top: "-30%",  left: "50%", width: "60%",  labelTop: "5%"   },
    "employee-up":     { top: "-30%",  left: "50%", width: "60%",  labelTop: "5%"   },
  },

  // ── Stage 3: Medium ──
  medium: {
    "boss-down":       { top: "-60%",  left: "50%", width: "155%", labelTop: "03%"  },
    "boss-up":         { top: "-10%",  left: "50%", width: "55%",  labelTop: "3%"  },
    "executive-down":  { top: "-5%",   left: "50%", width: "150%", labelTop: "22%" },
    "executive-up":    { top: "-20%",  left: "50%", width: "50%",  labelTop: "10%"  },
    "employee-down":   { top: "15%",   left: "50%", width: "60%",  labelTop: "27%"  },
    "employee-up":     { top: "50%",   left: "50%", width: "60%",  labelTop: "65%" },
  },

  // ── Stage 4: Scalable HQ ──
  scalable: {
    "boss-down":       { top: "-45%",  left: "50%", width: "40%",  labelTop: "-5%"  },
    "boss-up":         { top: "-45%",  left: "50%", width: "40%",  labelTop: "-5%"  },
    "executive-down":  { top: "-50%",  left: "50%", width: "25%",  labelTop: "-15%" },
    "executive-up":    { top: "-50%",  left: "50%", width: "25%",  labelTop: "-15%" },
    "employee-down":   { top: "-5%",  left: "50%", width: "60%",  labelTop: "15%"  },
    "employee-up":     { top: "30%",   left: "55%", width: "60%",  labelTop: "65%"  },
  },
};

const DEFAULT_AVATAR: AvatarPlacement = { top: "-25%", left: "50%", width: "55%", labelTop: "10%" };

function getAvatarPlacement(stage: OfficeStageId, occupant: OfficeSeatAssignment): AvatarPlacement {
  const direction = occupant.spriteSrc.includes("_up_") ? "up" : "down";
  const key = `${occupant.role}-${direction}`;
  return AVATAR_CONFIG[stage]?.[key] ?? DEFAULT_AVATAR;
}

/* ─── Sleeping Z position config per STAGE × ROLE × DIRECTION ───
   top / right are CSS values relative to the sprite container.
   width controls how large the Z sprite is.                      */
type SleepingZPlacement = {
  top: string;
  right: string;
  width: string;
};

const SLEEPING_Z_CONFIG: Record<string, Record<string, SleepingZPlacement>> = {
  // ── Stage 1: Solo ──
  solo: {
    "boss-down":       { top: "-30%", right: "-5%",  width: "45%" },
    "boss-up":         { top: "-30%", right: "-5%",  width: "45%" },
    "executive-down":  { top: "-30%", right: "-5%",  width: "40%" },
    "executive-up":    { top: "-30%", right: "-5%",  width: "40%" },
    "employee-down":   { top: "-30%", right: "-5%",  width: "40%" },
    "employee-up":     { top: "-30%", right: "-5%",  width: "40%" },
  },

  // ── Stage 2: Startup ──
  startup: {
    "boss-down":       { top: "-35%", right: "0%",   width: "50%" },
    "boss-up":         { top: "-35%", right: "0%",   width: "50%" },
    "executive-down":  { top: "-30%", right: "0%",   width: "45%" },
    "executive-up":    { top: "-30%", right: "0%",   width: "45%" },
    "employee-down":   { top: "-30%", right: "0%",   width: "45%" },
    "employee-up":     { top: "-30%", right: "0%",   width: "45%" },
  },

  // ── Stage 3: Medium ──
  medium: {
    "boss-down":       { top: "5%",   right: "10%",  width: "60%" },
    "boss-up":         { top: "-20%", right: "5%",   width: "50%" },
    "executive-down":  { top: "20%",  right: "10%",  width: "55%" },
    "executive-up":    { top: "-15%", right: "5%",   width: "50%" },
    "employee-down":   { top: "25%",  right: "15%",  width: "55%" },
    "employee-up":     { top: "55%",  right: "15%",  width: "55%" },
  },

  // ── Stage 4: Scalable HQ ──
  scalable: {
    "boss-down":       { top: "-30%", right: "5%",   width: "35%" },
    "boss-up":         { top: "-30%", right: "5%",   width: "35%" },
    "executive-down":  { top: "-35%", right: "5%",   width: "25%" },
    "executive-up":    { top: "-35%", right: "5%",   width: "25%" },
    "employee-down":   { top: "5%",   right: "20%",  width: "55%" },
    "employee-up":     { top: "10%",  right: "20%",  width: "55%" },
  },
};

const DEFAULT_SLEEPING_Z: SleepingZPlacement = { top: "-30%", right: "0%", width: "50%" };

function getSleepingZPlacement(stage: OfficeStageId, occupant: OfficeSeatAssignment): SleepingZPlacement {
  const direction = occupant.spriteSrc.includes("_up_") ? "up" : "down";
  const key = `${occupant.role}-${direction}`;
  return SLEEPING_Z_CONFIG[stage]?.[key] ?? DEFAULT_SLEEPING_Z;
}

/* ─── Per-character routine resolver ────────────────────────
   Returns the right routine + frame sets for each occupant    */

function resolveRoutine(
  stage: OfficeStageId,
  occupant: OfficeSeatAssignment,
  index: number,
): { routine: RoutineSegment[]; frameSets: PoseFrameSets } {
  const sitPose = occupant.spriteSrc.includes("_up_") ? "sit_up" : "sit_down";
  const stagger = index * 3000; // spread workers so they don't all walk at once

  const seat: CharacterPlacement = {
    left: occupant.left,
    top: occupant.top,
    width: occupant.width,
    height: occupant.height,
    zIndex: occupant.zIndex,
  };

  // Stage 1
  if (stage === "solo") {
    return { routine: stage1BossRoutine, frameSets: bossFrameSets };
  }

  // Stage 2
  if (stage === "startup") {
    if (occupant.role === "boss") return { routine: stage2BossRoutine, frameSets: bossFrameSets };
    if (occupant.role === "executive") return { routine: stage2ExecutiveRoutine, frameSets: executiveFrameSets };
    return {
      routine: sitPose === "sit_up" ? stage2EmployeeUpRoutine : stage2EmployeeDownRoutine,
      frameSets: employeeFrameSets,
    };
  }

  // Stage 3 & 4 — generic work-coffee loop per seat
  const coffeeOffset = occupant.role === "boss" ? 12 : occupant.role === "executive" ? 10 : 8;
  const frames = occupant.role === "boss" ? bossFrameSets : occupant.role === "executive" ? executiveFrameSets : employeeFrameSets;
  return {
    routine: buildGenericRoutine(seat, sitPose, coffeeOffset, stagger),
    frameSets: frames,
  };
}

/* ─── StaticOccupantSprite ───────────────────────────────────
   Zero-timer renderer for inactive contributors.
   No useCharacterRoutine, no RAF, no setInterval — pure static img. */
function StaticOccupantSprite({
  occupant,
  stage,
  animationDelay,
}: {
  occupant: OfficeSeatAssignment;
  stage: OfficeStageId;
  animationDelay: string | undefined;
}) {
  const sz = getSleepingZPlacement(stage, occupant);

  return (
    <div
      style={{
        position: "absolute",
        overflow: "visible",
        left: `${occupant.left}%`,
        top: `${occupant.top}%`,
        width: `${occupant.width}%`,
        height: `${occupant.height}%`,
        zIndex: occupant.zIndex,
      }}
    >
      <div
        className="seat-bob"
        style={{ position: "relative", height: "100%", width: "100%", animationDelay }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={occupant.spriteSrc}
          alt={occupant.label}
          draggable={false}
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            height: "100%",
            width: "100%",
            userSelect: "none",
            objectFit: "contain",
            imageRendering: "pixelated",
            filter: "grayscale(1)",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/raw_assets/sleepingz.png"
          alt="sleeping"
          draggable={false}
          className="sleeping-z"
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: sz.top,
            right: sz.right,
            width: sz.width,
            height: "auto",
            userSelect: "none",
            objectFit: "contain",
            imageRendering: "pixelated",
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}

/* ─── ActiveOccupantSprite ───────────────────────────────────
   Full routine-driven animation — only for active contributors. */
function ActiveOccupantSprite({
  occupant,
  stage,
  index,
  animationDelay,
}: {
  occupant: OfficeSeatAssignment;
  stage: OfficeStageId;
  index: number;
  animationDelay: string | undefined;
}) {
  const { routine, frameSets } = resolveRoutine(stage, occupant, index);
  const { placement, activeFrame, flipX, isSitting } = useCharacterRoutine(routine, frameSets, true);

  const pos = placement ?? {
    left: occupant.left, top: occupant.top,
    width: occupant.width, height: occupant.height,
    zIndex: occupant.zIndex,
  };

  const spriteSrc = activeFrame ?? occupant.spriteSrc;

  return (
    <div
      style={{
        position: "absolute",
        overflow: "visible",
        left: `${pos.left}%`,
        top: `${pos.top}%`,
        width: `${pos.width}%`,
        height: `${pos.height}%`,
        zIndex: pos.zIndex,
        transition: "left 0.15s linear, top 0.15s linear",
        willChange: "left, top",
      }}
    >
      <div
        className={isSitting ? "seat-bob" : ""}
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          animationDelay: isSitting ? animationDelay : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spriteSrc}
          alt={occupant.label}
          draggable={false}
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            height: "100%",
            width: "100%",
            userSelect: "none",
            objectFit: "contain",
            imageRendering: "pixelated",
            transform: flipX ? "scaleX(-1)" : undefined,
            transformOrigin: "center",
          }}
        />
      </div>
    </div>
  );
}

/* ─── OccupantSprite ─────────────────────────────────────────
   Routes to Static or Active path based on contributor status. */
function OccupantSprite({
  occupant,
  stage,
  index,
  animationDelay,
}: {
  occupant: OfficeSeatAssignment;
  stage: OfficeStageId;
  index: number;
  animationDelay: string | undefined;
}) {
  if (occupant.contributor.isInactive) {
    return (
      <StaticOccupantSprite
        occupant={occupant}
        stage={stage}
        animationDelay={animationDelay}
      />
    );
  }

  return (
    <ActiveOccupantSprite
      occupant={occupant}
      stage={stage}
      index={index}
      animationDelay={animationDelay}
    />
  );
}


function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseAspectRatioDimensions(aspectRatio: string) {
  const match = aspectRatio.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);

  if (!match) {
    return { width: 896, height: 1143 };
  }

  const width = Number(match[1]);
  const height = Number(match[2]);

  if (!Number.isFinite(width) || !Number.isFinite(height) || height === 0) {
    return { width: 896, height: 1143 };
  }

  return { width, height };
}

function getContributorActivityLabel(lastCommitAt: string | null, isInactive: boolean) {
  if (!lastCommitAt) {
    return "Contributor activity unavailable";
  }

  return isInactive ? "Inactive contributor" : "Active contributor";
}

function getCropMetrics(element: Pick<OfficeSceneElement, "cropLeft" | "cropTop" | "cropRight" | "cropBottom">) {
  const left = clamp(element.cropLeft ?? 0, 0, 85);
  const top = clamp(element.cropTop ?? 0, 0, 85);
  const right = clamp(element.cropRight ?? 0, 0, 85 - left);
  const bottom = clamp(element.cropBottom ?? 0, 0, 85 - top);

  return { left, top, right, bottom };
}

function getImageFrameStyle(element: Pick<OfficeSceneElement, "cropLeft" | "cropTop" | "cropRight" | "cropBottom">) {
  const crop = getCropMetrics(element);
  const visibleWidth = Math.max(1, 100 - crop.left - crop.right);
  const visibleHeight = Math.max(1, 100 - crop.top - crop.bottom);
  const hasCrop = crop.left > 0 || crop.top > 0 || crop.right > 0 || crop.bottom > 0;

  return {
    hasCrop,
    frameStyle: hasCrop
      ? {
          left: `-${(crop.left / visibleWidth) * 100}%`,
          top: `-${(crop.top / visibleHeight) * 100}%`,
          width: `${(100 / visibleWidth) * 100}%`,
          height: `${(100 / visibleHeight) * 100}%`,
        }
      : {
          inset: "0px",
        },
  };
}

// Zoom threshold (as a multiplier, e.g. 2.5 = 250%) at which
// contributor usernames appear below their avatar circles.
const LABEL_ZOOM_THRESHOLD: Record<string, number> = {
  solo:     0,    // always visible
  startup:  0,    // always visible
  medium:   1.9,  // visible at 190%+
  scalable: 2.5,  // visible at 250%+
};

type GitHubOfficeSceneProps = {
  scene: GitHubOfficeSceneModel;
  zoom?: number;
};

export function GitHubOfficeScene({ scene, zoom = 1 }: GitHubOfficeSceneProps) {
  const threshold = LABEL_ZOOM_THRESHOLD[scene.stage] ?? 9999;
  const showLabels = zoom >= threshold;
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [canvasPixelWidth, setCanvasPixelWidth] = useState(0);
  const canvasAspectRatioMetrics = useMemo(() => parseAspectRatioDimensions(scene.aspectRatio), [scene.aspectRatio]);
  const canvasPatternScale = canvasPixelWidth > 0 ? canvasPixelWidth / canvasAspectRatioMetrics.width : 1;
  const sortedElements = useMemo(
    () => [...scene.elements].sort((left, right) => left.zIndex - right.zIndex),
    [scene.elements],
  );
  const occupantAnimationDelays = useMemo(() => {
    return new Map(scene.occupants.map((occupant, index) => [occupant.id, `${index * 120}ms`]));
  }, [scene.occupants]);

  useEffect(() => {
    const node = canvasRef.current;

    if (!node) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;

      if (!rect) {
        return;
      }

      setCanvasPixelWidth(rect.width);
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={canvasRef}
      style={{
        position: "relative",
        width: "100%",
        overflow: "visible",
        aspectRatio: scene.aspectRatio,
        background: "linear-gradient(180deg, rgba(251,252,253,1), rgba(233,238,244,0.96))",
        imageRendering: "pixelated" as React.CSSProperties["imageRendering"],
      }}
    >
      {/* Background image */}
      {scene.backgroundSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={scene.backgroundSrc}
          alt={`${scene.title} background`}
          draggable={false}
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            height: "100%",
            width: "100%",
            userSelect: "none",
            objectFit: "cover",
            imageRendering: "pixelated",
          }}
        />
      ) : null}

      {/* Scene elements (furniture, tiles, patterns) */}
      {sortedElements.map((item) => {
        const imageFrame = item.renderMode === "image" ? getImageFrameStyle(item) : null;

        return item.renderMode === "pattern" ? (
          <div
            key={item.id}
            style={{
              position: "absolute",
              overflow: "hidden",
              left: `${item.left}%`,
              top: `${item.top}%`,
              width: `${item.width}%`,
              height: `${item.height}%`,
              zIndex: item.zIndex,
              opacity: item.opacity,
            }}
          >
            <PixelPatternFill
              src={item.src}
              backgroundSize={item.backgroundSize}
              repeat={item.repeat}
              scale={canvasPatternScale}
              className=""
            />
          </div>
        ) : (
          <div
            key={item.id}
            style={{
              position: "absolute",
              overflow: "hidden",
              left: `${item.left}%`,
              top: `${item.top}%`,
              width: `${item.width}%`,
              height: `${item.height}%`,
              zIndex: item.zIndex,
              opacity: item.opacity,
            }}
          >
            <div style={{ position: "relative", height: "100%", width: "100%" }}>
              <div style={{ position: "absolute", ...imageFrame?.frameStyle }}>
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  unoptimized
                  style={{
                    objectFit: imageFrame?.hasCrop ? "cover" : "contain",
                    imageRendering: "pixelated",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Occupants — character sprites with routine animation */}
      {scene.occupants.map((occupant, index) => (
        <OccupantSprite
          key={occupant.id}
          occupant={occupant}
          stage={scene.stage}
          index={index}
          animationDelay={occupantAnimationDelays.get(occupant.id)}
        />
      ))}

      {/* Avatar overlay — rendered separately so avatars float above ALL elements */}
      {scene.occupants.map((occupant) => {
        const av = getAvatarPlacement(scene.stage, occupant);
        return (
          <a
            key={`avatar-${occupant.id}`}
            href={occupant.contributor.profileUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${occupant.contributor.login} on GitHub`}
            style={{
              position: "absolute",
              left: `${occupant.left}%`,
              top: `${occupant.top}%`,
              width: `${occupant.width}%`,
              height: `${occupant.height}%`,
              zIndex: 10000,
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: av.left,
                top: av.top,
                width: av.width,
                aspectRatio: "1 / 1",
                transform: "translateX(-50%)",
                overflow: "hidden",
                borderRadius: "50%",
                border: "2px solid white",
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                pointerEvents: "auto",
                cursor: "pointer",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={occupant.contributor.avatarUrl}
                alt={occupant.contributor.login}
                draggable={false}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            {showLabels && (
              <div
                style={{
                  position: "absolute",
                  left: av.left,
                  top: av.labelTop,
                  width: "max-content",
                  maxWidth: "200%",
                  transform: "translateX(-50%)",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  fontSize: "clamp(4px, 1.1cqw, 10px)",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "#ffffff",
                  textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)",
                  lineHeight: 1,
                  letterSpacing: "0.02em",
                  background: "rgba(0,0,0,0.6)",
                  padding: "2px 4px",
                  borderRadius: "2px",
                }}
              >
                {occupant.contributor.login}
              </div>
            )}
          </a>
        );
      })}
    </div>
  );
}
