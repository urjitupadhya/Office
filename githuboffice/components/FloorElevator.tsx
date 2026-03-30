"use client";

import type { GitHubOfficeFloor } from "../types";

type FloorElevatorProps = {
  floors: GitHubOfficeFloor[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

const stageLabels = {
  solo: "Solo",
  startup: "Startup",
  medium: "Medium",
  scalable: "Scalable",
} as const;

export function FloorElevator({ floors, currentIndex, onSelect }: FloorElevatorProps) {
  return (
    <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(245,249,248,0.92)] p-4 shadow-[0_18px_50px_rgba(45,100,91,0.1)]">
      <p className="font-mono text-xs uppercase tracking-[0.32em] text-[var(--accent)]">Branch Elevator</p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        Each branch becomes a floor. The elevator keeps the most active five branches ready to inspect.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {floors.map((floor, index) => {
          const isActive = index === currentIndex;

          return (
            <button
              key={`${floor.branchName}-${floor.stage}`}
              type="button"
              onClick={() => onSelect(index)}
              className={`rounded-[22px] border px-4 py-3 text-left transition ${
                isActive
                  ? "border-[rgba(45,100,91,0.35)] bg-[rgba(45,100,91,0.13)] shadow-[0_16px_34px_rgba(45,100,91,0.12)]"
                  : "border-[rgba(105,87,74,0.16)] bg-white/85 hover:border-[rgba(45,100,91,0.24)] hover:bg-[rgba(45,100,91,0.06)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{floor.branchName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    {stageLabels[floor.stage]} floor
                  </p>
                </div>
                <span className="rounded-full bg-[rgba(35,25,19,0.07)] px-3 py-1 text-xs font-medium text-[var(--ink)]">
                  {floor.total}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                <span className="rounded-full bg-[rgba(45,100,91,0.08)] px-2 py-1">
                  Boss {floor.boss ? 1 : 0}
                </span>
                <span className="rounded-full bg-[rgba(130,87,50,0.08)] px-2 py-1">
                  Exec {floor.topContributors.length}
                </span>
                <span className="rounded-full bg-[rgba(35,50,69,0.08)] px-2 py-1">
                  Team {floor.employees.length}
                </span>
                {floor.source === "global-fallback" ? (
                  <span className="rounded-full bg-[rgba(105,87,74,0.1)] px-2 py-1">Global fallback</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
