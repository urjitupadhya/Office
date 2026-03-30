"use client";

import type { GitHubOfficeFloor } from "@githuboffice/types";

const STAGE_SHORT: Record<string, string> = {
  solo: "Solo",
  startup: "Startup",
  medium: "Medium",
  scalable: "HQ",
};

interface Props {
  floors: GitHubOfficeFloor[];
  currentIndex: number;
  onSelect: (i: number) => void;
}

export function FloorElevator({ floors, currentIndex, onSelect }: Props) {
  if (floors.length <= 1) return null;

  return (
    <div>
      <span className="px-label">Floors / Branches</span>
      {floors.map((f, i) => (
        <button
          key={f.branchName}
          className={`px-floor-btn${i === currentIndex ? " active" : ""}`}
          onClick={() => onSelect(i)}
        >
          <span
            style={{
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 110,
            }}
          >
            {f.branchName}
          </span>
          <span className="px-badge">
            {f.total} · {STAGE_SHORT[f.stage] ?? f.stage}
          </span>
        </button>
      ))}
    </div>
  );
}
