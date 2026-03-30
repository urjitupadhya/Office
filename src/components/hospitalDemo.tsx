"use client";

import { useState, useEffect } from "react";
import { HospitalScene } from "./HospitalScene";

// Mock GitHub data for demo
const mockGitHubData: Array<{
  id: string;
  login: string;
  avatarUrl: string;
  lastCommitAt: string;
  commits: number;
  status: 'critical' | 'warning' | 'stable';
  problem: string;
}> = [
  {
    id: "ward-top-left-01",
    login: "alice-dev",
    avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
    lastCommitAt: "2026-03-15T10:30:00Z",
    commits: 142,
    status: "critical",
    problem: "Build pipeline failure - tests not running"
  },
  {
    id: "ward-top-left-02", 
    login: "bob-coder",
    avatarUrl: "https://avatars.githubusercontent.com/u/2?v=4",
    lastCommitAt: "2026-03-20T14:22:00Z",
    commits: 89,
    status: "warning",
    problem: "Flaky test suite - 23% failure rate"
  },
  {
    id: "ward-top-right-01",
    login: "carol-build",
    avatarUrl: "https://avatars.githubusercontent.com/u/3?v=4", 
    lastCommitAt: "2026-03-28T09:15:00Z",
    commits: 67,
    status: "stable",
    problem: "All systems operational"
  },
  {
    id: "ward-top-right-02",
    login: "david-ops",
    avatarUrl: "https://avatars.githubusercontent.com/u/4?v=4",
    lastCommitAt: "2026-02-14T16:45:00Z", 
    commits: 23,
    status: "critical",
    problem: "CI timeout - builds exceed 30 minutes"
  },
  {
    id: "ward-bottom-left-01",
    login: "eve-docs",
    avatarUrl: "https://avatars.githubusercontent.com/u/5?v=4",
    lastCommitAt: "2025-12-01T11:20:00Z",
    commits: 45,
    status: "critical", 
    problem: "Documentation severely outdated - 6 months stale"
  }
];

export function HospitalDemo() {
  const [isDemo, setIsDemo] = useState(true);
  
  return (
    <div style={{ padding: 20 }}>
      {/* Demo Toggle */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setIsDemo(!isDemo)}
          style={{
            padding: "10px 20px",
            background: "#4ade80",
            color: "white",
            border: "none",
            borderRadius: 4,
            fontSize: 14,
            cursor: "pointer"
          }}
        >
          {isDemo ? "🔄 Real GitHub Data" : "🎮 Demo Mode"}
        </button>
      </div>

      {/* Instructions */}
      {isDemo && (
        <div style={{
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "15px",
          borderRadius: 8,
          marginBottom: 20
        }}>
          <h3 style={{ margin: "0 0 10px 0" }}>🏥 CI/CD Hospital Demo</h3>
          <p style={{ margin: "0", lineHeight: 1.5 }}>
            Welcome to the <strong>DX-Ray Health Clinic</strong>! This interactive demo shows how 
            GitHub contributor problems become visible medical emergencies.
          </p>
          <h4 style={{ margin: "10px 0 5px 0" }}>🎯 How to Play:</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>🚨 <strong>Click red beds</strong> - Critical CI/CD failures (+150 points)</li>
            <li>⚠️ <strong>Click yellow beds</strong> - Warning issues (+75 points)</li>
            <li>🟢 <strong>Green beds are healthy</strong> - Already stable</li>
            <li>⚡ <strong>Build combos</strong> - Consecutive fixes multiply points</li>
            <li>❤️ <strong>Watch health meter</strong> - Improve clinic to 100%</li>
          </ul>
          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            <strong>Tip:</strong> Each bed represents a real contributor. 
            Red beds mean inactive contributors, yellow means warning status, 
            and green shows healthy, active contributors.
          </p>
        </div>
      )}

      {/* Hospital Scene */}
      <HospitalScene 
        patientCount={mockGitHubData.length} 
        patients={isDemo ? mockGitHubData : []}
      />
      
      {/* Real Data Integration Instructions */}
      {!isDemo && (
        <div style={{
          background: "rgba(74, 222, 128, 0.1)",
          padding: 15,
          borderRadius: 8,
          marginTop: 20
        }}>
          <h3 style={{ margin: "0 0 10px 0" }}>🔗 Real GitHub Integration</h3>
          <p style={{ margin: "0", lineHeight: 1.5 }}>
            To use real GitHub data:
          </p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Connect your GitHub token in <code>.env.local</code></li>
            <li>Call the GitHub API to fetch real contributors</li>
            <li>Map contributor activity to bed status (critical/warning/stable)</li>
            <li>Each click fixes problems and earns points!</li>
          </ol>
        </div>
      )}
    </div>
  );
}
