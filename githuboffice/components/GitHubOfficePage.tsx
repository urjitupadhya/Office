"use client";

import { useRef, useState, useMemo } from "react";
import { GitHubOfficeScene } from "@githuboffice/components/GitHubOfficeScene";
import { buildGitHubOfficeSceneModel } from "@githuboffice/lib/stageSceneFactory";
import type { GitHubOfficeResponse } from "@githuboffice/types";
import { FloorElevator } from "@/components/FloorElevator";
import { HospitalScene } from "@/components/HospitalScene";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";
import { hospitalScene } from "@/data/hospitalScene";
import { useZoomPan } from "@/hooks/useZoomPan";

type AppState =
  | { status: "idle" }
  | { status: "loading"; lines: string[] }
  | { status: "error"; code: string }
  | { status: "ready"; data: GitHubOfficeResponse; currentFloor: number };

type CanvasMode = "office" | "hospital";

function parseRepoInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Accept full URL, shorthand owner/repo, or partial URL
  if (/github\.com\/[^/\s]+\/[^/\s?#]+/.test(trimmed)) return trimmed;
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(trimmed)) return trimmed;

  return null;
}

const clinicGatewaySrc = "/raw_assets/hospital/gatewayofcicdfromofficetoclinic.png";

function clampPatientCount(value: number) {
  return Math.min(Math.max(value, 0), hospitalScene.maxPatients);
}

export function GitHubOfficePage() {
  const [inputVal, setInputVal] = useState("");
  const [inputErr, setInputErr] = useState("");
  const [state, setState] = useState<AppState>({ status: "idle" });
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("office");
  const [patientInput, setPatientInput] = useState(String(hospitalScene.maxPatients));
  const [hospitalPatients, setHospitalPatients] = useState<any[]>([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [hospitalError, setHospitalError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { zoom, transformStyle, handlers, onDoubleClick, zoomIn, zoomOut, reset } =
    useZoomPan(containerRef);

  // Build scene models from API data
  const sceneModels = useMemo(() => {
    if (state.status !== "ready") return [];
    return state.data.floors.map((floor) => buildGitHubOfficeSceneModel(floor));
  }, [state]);

  const currentFloor = state.status === "ready" ? state.currentFloor : 0;
  const currentScene = sceneModels[currentFloor] ?? null;
  const officeData = state.status === "ready" ? state.data : null;
  const isHospitalOpen = canvasMode === "hospital";
  const parsedPatientCount = Number.parseInt(patientInput, 10);
  const patientCount = Number.isNaN(parsedPatientCount)
    ? 0
    : clampPatientCount(parsedPatientCount);

  function pushLine(line: string) {
    setState((prev) =>
      prev.status === "loading"
        ? { ...prev, lines: [...prev.lines, line] }
        : { status: "loading", lines: [line] },
    );
  }

  async function handleVisualize() {
    setInputErr("");
    const repo = parseRepoInput(inputVal);
    if (!repo) {
      setInputErr("Enter a valid GitHub URL — e.g. https://github.com/owner/repo");
      return;
    }

    setState({ status: "loading", lines: ["Connecting to GitHub..."] });

    try {
      const res = await fetch(`/api/githuboffice?repo=${encodeURIComponent(repo)}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = await res.json();

      if (!res.ok) {
        setState({
          status: "error",
          code: payload.error ?? `HTTP_${res.status}`,
        });
        return;
      }

      const data = payload as GitHubOfficeResponse;

      pushLine(`Found: ${data.repo.fullName}`);
      pushLine(`${data.repo.selectedBranchCount} branch floor${data.repo.selectedBranchCount !== 1 ? "s" : ""} ready`);
      pushLine("Building office...");

      if (!data.floors.length) {
        setState({ status: "error", code: "NO_CONTRIB" });
        return;
      }

      pushLine("Ready.");
      await new Promise((r) => setTimeout(r, 350));

      setCanvasMode("office");
      setState({ status: "ready", data, currentFloor: 0 });
      reset();
    } catch {
      setState({ status: "error", code: "NETWORK_ERROR" });
    }
  }

  function handleFloorSelect(i: number) {
    if (state.status !== "ready") return;
    setCanvasMode("office");
    setState({ ...state, currentFloor: i });
    reset();
  }

  async function handleOpenHospital() {
    setCanvasMode("hospital");
    reset();

    if (state.status !== "ready") return;
    if (hospitalPatients.length > 0) return;

    const repoFullName = state.data.repo.fullName;
    setHospitalLoading(true);
    setHospitalError(null);

    console.log("[Hospital] Fetching CI/CD analysis for:", repoFullName);

    try {
      const res = await fetch(`/api/hospital?repo=${encodeURIComponent(repoFullName)}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = await res.json();
      console.log("[Hospital] API response:", res.status, payload);

      if (!res.ok) {
        setHospitalError(payload.error || `API error: ${res.status}`);
        return;
      }

      if (payload.patients && payload.patients.length > 0) {
        console.log("[Hospital] Setting", payload.patients.length, "patients");
        setHospitalPatients(payload.patients);
      } else {
        setHospitalError("No patient data returned from analysis.");
      }
    } catch (err) {
      console.error("[Hospital] Analysis failed:", err);
      setHospitalError(err instanceof Error ? err.message : "Network error");
    } finally {
      setHospitalLoading(false);
    }
  }

  function handleReturnToOffice() {
    setCanvasMode("office");
    reset();
  }

  function handlePatientInputChange(value: string) {
    if (value === "") {
      setPatientInput("");
      return;
    }

    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      return;
    }

    setPatientInput(String(clampPatientCount(parsed)));
  }

  const isLoading = state.status === "loading";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--px-bg)",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            state.status === "ready"
              ? "max-content minmax(0, 1fr) max-content"
              : "max-content minmax(0, 1fr)",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          background: "var(--px-panel)",
          borderBottom: "2px solid var(--px-border)",
          boxShadow: "0 2px 0 #000",
          flexShrink: 0,
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "0.03em",
            whiteSpace: "nowrap",
            color: "var(--px-accent)",
          }}
        >
          GitHub Office
        </span>

        {/* Input row */}
        <div
          style={{
            display: "flex",
            gap: 6,
            minWidth: 0,
            width: "100%",
            maxWidth: 720,
          }}
        >
          <input
            className="px-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleVisualize()}
            placeholder="https://github.com/owner/repo"
            disabled={isLoading}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            style={{ flex: 1, minWidth: 0 }}
          />
          <button
            className="px-btn px-btn--accent"
            onClick={handleVisualize}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Visualize"}
          </button>
        </div>

        {inputErr && (
          <p
            className="px-status error"
            style={{ width: "100%", paddingLeft: 2, gridColumn: "1 / -1" }}
          >
            {inputErr}
          </p>
        )}

        {/* Zoom controls — only when scene is ready */}
        {state.status === "ready" && (
          <div className="px-zoom-group" style={{ justifySelf: "end" }}>
            <button className="px-btn px-btn--sm" onClick={zoomOut}>
              −
            </button>
            <span className="px-zoom-label">{Math.round(zoom * 100)}%</span>
            <button className="px-btn px-btn--sm" onClick={zoomIn}>
              +
            </button>
            <button className="px-btn px-btn--sm" onClick={reset} style={{ marginLeft: 4 }}>
              Reset
            </button>
          </div>
        )}
      </div>

      {/* ── Main area ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas area */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
            background: "#0a0a14",
          }}
          onMouseDown={handlers.onMouseDown}
          onMouseMove={handlers.onMouseMove}
          onMouseUp={handlers.onMouseUp}
          onMouseLeave={handlers.onMouseUp}
          onDoubleClick={onDoubleClick}
        >
          {state.status === "idle" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--px-muted)",
                fontSize: 13,
                fontFamily: "monospace",
              }}
            >
              Paste a public GitHub repo URL above and press Visualize
            </div>
          )}

          {state.status === "loading" && <LoadingScreen lines={state.lines} />}

          {state.status === "error" && (
            <ErrorScreen code={state.code} onRetry={() => setState({ status: "idle" })} />
          )}

          {state.status === "ready" && currentScene && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  ...transformStyle,
                  width: "calc(100vw - 260px)",
                  maxHeight: "calc(100vh - 60px)",
                  flexShrink: 0,
                }}
              >
                {isHospitalOpen ? (
                  hospitalLoading ? (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 400,
                      color: "#e8e8f0",
                      fontSize: 16,
                      flexDirection: "column",
                      gap: 12,
                    }}>
                      <div>🏥 Analyzing CI/CD Health...</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Fetching real GitHub data for each contributor...
                      </div>
                    </div>
                  ) : hospitalError ? (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 400,
                      color: "#f87171",
                      fontSize: 14,
                      flexDirection: "column",
                      gap: 12,
                      textAlign: "center",
                      padding: 40,
                    }}>
                      <div style={{ fontSize: 24 }}>⚠️</div>
                      <div style={{ fontWeight: "bold" }}>Hospital Analysis Failed</div>
                      <div style={{ opacity: 0.8, maxWidth: 400, lineHeight: 1.5 }}>{hospitalError}</div>
                      <button
                        onClick={() => { setHospitalError(null); handleOpenHospital(); }}
                        style={{
                          marginTop: 10,
                          padding: "8px 20px",
                          background: "#4ade80",
                          color: "black",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <HospitalScene
                      patientCount={hospitalPatients.length > 0 ? hospitalPatients.length : patientCount}
                      patients={hospitalPatients.length > 0 ? hospitalPatients : undefined}
                    />
                  )
                ) : (
                  <GitHubOfficeScene
                    scene={currentScene}
                    zoom={zoom}
                    key={`${currentScene.branchName}-${currentScene.stage}`}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar — only when ready */}
        {state.status === "ready" && officeData && (
          <div
            style={{
              width: 216,
              flexShrink: 0,
              borderLeft: "2px solid var(--px-border)",
              background: "var(--px-panel)",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              overflowY: "auto",
              padding: 12,
            }}
          >
            <FloorElevator
              floors={officeData.floors}
              currentIndex={currentFloor}
              onSelect={handleFloorSelect}
            />

            {officeData.floors.length > 1 && <hr className="px-divider" />}

            {/* Current floor info */}
            {currentScene && !isHospitalOpen && (
              <div style={{ marginBottom: 12 }}>
                <span className="px-label">Current floor</span>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 4,
                    wordBreak: "break-all",
                  }}
                >
                  {currentScene.branchName}
                </p>
                <p className="px-status">
                  {currentScene.totalContributors} contributors
                </p>
                <p className="px-status" style={{ textTransform: "capitalize" }}>
                  {currentScene.stage} stage
                </p>
                <p className="px-status">
                  {currentScene.usedSeatCount}/{currentScene.seatCapacity} seats used
                </p>
              </div>
            )}

            {isHospitalOpen && (
              <div style={{ marginBottom: 12 }}>
                <span className="px-label">Current View</span>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  {hospitalScene.title}
                </p>
                {hospitalLoading ? (
                  <p className="px-status" style={{ color: "#facc15" }}>
                    ⏳ Analyzing CI/CD pipelines...
                  </p>
                ) : hospitalPatients.length > 0 ? (
                  <>
                    <p className="px-status">
                      {hospitalPatients.length} patients analyzed
                    </p>
                    <p className="px-status" style={{ color: "#f87171" }}>
                      🚨 {hospitalPatients.filter((p: any) => p.status === "critical").length} critical
                    </p>
                    <p className="px-status" style={{ color: "#facc15" }}>
                      ⚠️ {hospitalPatients.filter((p: any) => p.status === "warning").length} warning
                    </p>
                    <p className="px-status" style={{ color: "#4ade80" }}>
                      ✅ {hospitalPatients.filter((p: any) => p.status === "stable").length} stable
                    </p>
                  </>
                ) : (
                  <p className="px-status">
                    {patientCount}/{hospitalScene.maxPatients} visible beds occupied
                  </p>
                )}
                <button
                  type="button"
                  className="px-btn px-btn--sm"
                  onClick={handleReturnToOffice}
                  style={{ marginTop: 10 }}
                >
                  Back To Office
                </button>
              </div>
            )}

            <hr className="px-divider" />

            {/* Repo info */}
            <div style={{ marginBottom: 12 }}>
              <span className="px-label">Repository</span>
              <a
                href={officeData.repo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "var(--px-accent)",
                  marginBottom: 4,
                  wordBreak: "break-all",
                  textDecoration: "none",
                }}
              >
                {officeData.repo.fullName}
              </a>
              <p className="px-status">⭐ {officeData.repo.stars.toLocaleString()}</p>
              <p className="px-status">{officeData.repo.contributorCount} total contributors</p>
            </div>

            <hr className="px-divider" />

            {/* Controls hint */}
            <div>
              <span className="px-label">Controls</span>
              <p className="px-status">Scroll — zoom</p>
              <p className="px-status">Drag — pan</p>
              <p className="px-status">Double-click — reset</p>
            </div>

            <hr className="px-divider" />

            <div>
              <span className="px-label">Clinic Gateway</span>
              <p className="px-status" style={{ marginBottom: 8 }}>
                Click the gate to open the hospital. The patient input below fills the visible beds.
              </p>
              <label className="px-label" style={{ marginBottom: 6 }}>
                Patients In Clinic
              </label>
              <input
                className="px-input"
                type="number"
                min={0}
                max={hospitalScene.maxPatients}
                value={patientInput}
                onChange={(e) => handlePatientInputChange(e.target.value)}
                onFocus={handleOpenHospital}
                placeholder={`0-${hospitalScene.maxPatients}`}
                style={{ marginBottom: 8 }}
              />
              <p className="px-status" style={{ marginBottom: 10 }}>
                Visible capacity: {hospitalScene.maxPatients} patients
              </p>
              <button
                type="button"
                onClick={handleOpenHospital}
                style={{
                  display: "block",
                  width: "100%",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid rgba(45,100,91,0.18)",
                  background: isHospitalOpen
                    ? "rgba(214,243,233,0.98)"
                    : "rgba(255,255,255,0.88)",
                  boxShadow: isHospitalOpen
                    ? "0 14px 28px rgba(74,185,139,0.16)"
                    : "0 12px 24px rgba(45,100,91,0.08)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={clinicGatewaySrc}
                  alt="CI CD Health Clinic gateway"
                  draggable={false}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    imageRendering: "pixelated",
                  }}
                />
              </button>
              <button
                type="button"
                className="px-btn px-btn--accent"
                onClick={handleOpenHospital}
                style={{ width: "100%", marginTop: 10 }}
              >
                Open Hospital
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
