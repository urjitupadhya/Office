<p align="center">
  <img src="public/raw_assets/hospital/hospital%20background.png" alt="GitHub Office" width="700" />
</p>

<h1 align="center">GitHub Office</h1>
<p align="center"><strong>X-ray your repository. Expose hidden CI/CD friction. See who's really building — and who's on life support.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/hackathon-DX--Ray%202026-blueviolet" alt="Hackathon" />
  <img src="https://img.shields.io/badge/track-A%3A%20Build%20%26%20CI%20Scanner-brightgreen" alt="Track" />
  <img src="https://img.shields.io/badge/framework-Next.js%2016-black" alt="Framework" />
  <img src="https://img.shields.io/badge/ui-Pixel%20Art%20Canvas-orange" alt="UI" />
  <img src="https://img.shields.io/badge/status-shipping-4ade80" alt="Status" />
</p>

---

## The Problem

Every repository has invisible developer experience friction hiding beneath the surface — just like a medical condition hiding inside a patient.

> **You can't fix what you can't see.**

Most teams never diagnose their repos because:
- **CI/CD failures** get manually retried until they pass, root cause unknown
- **Contributor disengagement** goes unnoticed — nobody tracks who stopped committing
- **Build pipeline health** has no dashboard; you find out it's broken when a deploy fails
- **Test coverage** is a guess at best — there's no real-time scan of actual commit patterns
- **Branch health** across multiple branches is completely invisible in GitHub's UI

**GitHub Office is the X-ray machine for your repository.** It scans a GitHub repo in seconds and renders the results as a pixel-art world you can actually walk through.

---

## The Solution: Three Diagnostic Views

### Office Floor Plan
<p align="center">
  <em>Every repository becomes a building. Every branch becomes a floor. Every contributor gets a desk.</em>
</p>

The Office is a pixel-art visualization that maps your entire repository structure to an interactive floor plan:

- **Branches → Floors** — Each active branch is rendered as a separate office floor accessible via an elevator sidebar
- **Contributors → Characters** — Each contributor is placed at a desk as an animated character (boss, executive, or employee) based on their commit volume and activity
- **4 Scalable Stages** — The office layout auto-scales based on contributor count:
  - **Solo** (1 contributor) — A single founder's office
  - **Startup** (2–6) — Small team room with one executive desk and four employee seats
  - **Medium** (7–53) — Studio floor with 1 boss, 4 executive cabins, 48 employee seats
  - **Scalable HQ** (54+) — Full headquarters with expandable employee bands and executive suites
- **Activity Detection** — Inactive contributors (>30 days since last commit) are rendered sleeping at their desks. Active contributors sit upright. The boss paces. You see the real state of the team at a glance.

### CI/CD Health Clinic (Hospital)
<p align="center">
  <em>Click the clinic gateway from the office. Each contributor becomes a patient. Their diagnosis? Real CI/CD data.</em>
</p>

The Hospital is an **interactive diagnostic scene** that fetches live GitHub data (workflows, commits, releases, issues) and triages each contributor as a patient:

| Status | Color | Criteria |
|--------|-------|----------|
| **Critical** | 🔴 Red | Build failing, 90+ days inactive, no releases, low test coverage |
| **Warning** | 🟡 Yellow | Reduced activity, stale deploys, some workflow failures |
| **Stable** | 🟢 Green | Active contributor, passing builds, recent deployments |

**How it works:**
1. Click "Open Hospital" from the sidebar — the app fetches real GitHub API data for the top 12 contributors
2. Each contributor appears as a patient in a bed with a status badge
3. Click any patient to see their **full diagnosis**: build status, estimated test coverage, last deployment, workflow failure count, security issues, and dependency alerts
4. Hit "Fix Problem" to simulate resolution — the patient transitions to stable with a score and combo multiplier

The hospital doesn't just display data — it **triages** it, prioritizing the most severe issues first.

### City Central Library
<p align="center">
  <em>A technical archive scene that connects back to the office — your repo's documentation layer.</em>
</p>

The Library provides a gateway to documentation and archive content, styled as a pixel-art library with a librarian desk and inquiry area.

---

## Key Features

- **Real-Time GitHub Scanning** — Paste any public GitHub URL and get an instant visualization
- **Multi-Token Parallel Fetching** — Up to 5 GitHub tokens work in parallel, each handling ~20% of pagination. Handles repos with thousands of contributors without rate-limiting
- **Branch-Aware Visualization** — Each branch gets its own floor with its own contributor ranking, not just the default branch
- **Animated Character Routines** — Boss, executive, and employee characters have unique animated sprite routines (sitting, walking, sleeping)
- **Interactive Zoom & Pan Canvas** — Scroll to zoom, drag to pan, double-click to reset. Full canvas control
- **Contributor Scoring** — Composite score (activeness 40% + commit share 40% + log-normalized count 20%) ranks contributors for seat assignment and capping
- **60-Second API Cache** — GitHub API responses are cached with TTL to avoid redundant requests during exploration
- **Responsive Sidebar** — Floor elevator, repo info, hospital gateway, library gateway, and zoom controls in a single right panel

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        User enters repo URL                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  /api/githuboffice — Parallel GitHub API fetch                  │
│  ├─ Repo metadata (stars, description, branch count)            │
│  ├─ Branch list (top 5 by activity)                             │
│  ├─ Contributors per branch (up to 10,000 pages, parallel)      │
│  └─ Latest commit timestamps for activity detection             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Role Mapper — Assigns boss / executive / employee roles        │
│  ├─ Sort by commit count                                        │
│  ├─ Mark inactive (>30 days)                                    │
│  ├─ Cap at 200 contributors (score-based ranking)               │
│  └─ Map to stage (solo / startup / medium / scalable)           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Scene Factory — Builds pixel-art office per branch             │
│  ├─ Select layout (4 stages)                                    │
│  ├─ Place characters at seat anchors                            │
│  ├─ Assign avatar + sprite routine per role                     │
│  └─ Render on zoomable canvas                                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Hospital Gateway — CI/CD Health Clinic                         │
│  ├─ /api/hospital — Fetches workflows, commits, releases        │
│  ├─ Analyzes build status, test coverage, deployment age        │
│  ├─ Triages each contributor (critical / warning / stable)      │
│  └─ Renders interactive patient beds with click-to-diagnose     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, React 19) |
| **Language** | TypeScript |
| **State** | Zustand |
| **HTTP** | Axios + native fetch |
| **Styling** | PostCSS + CSS custom properties (pixel-art design system) |
| **API** | GitHub REST API v3 (parallel token pool) |
| **Canvas** | Custom zoom/pan engine (mouse events + CSS transforms) |
| **Sprites** | Pixel-art character sheets with frame-based animation |

---

## Getting Started

### Prerequisites
- Node.js 18+
- At least 1 GitHub Personal Access Token (5 recommended for parallel fetching)

### Install & Run

```bash
git clone https://github.com/your-repo/github-office
cd github-office
npm install
cp .env.local.example .env.local
# Add your GitHub tokens to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste a public GitHub repo URL, and hit **Visualize**.

### Environment Variables

```env
GITHUB_TOKEN_1=github_pat_your_token_1
GITHUB_TOKEN_2=github_pat_your_token_2
GITHUB_TOKEN_3=github_pat_your_token_3
GITHUB_TOKEN_4=github_pat_your_token_4
GITHUB_TOKEN_5=github_pat_your_token_5
```

Up to 5 tokens. Each handles ~20% of paginated API requests in parallel. At least 1 is required.

---

## Project Structure

```
src/
  app/
    api/
      githuboffice/route.ts    # GitHub repo → office data API
      hospital/route.ts         # GitHub repo → CI/CD health API
    page.tsx                    # Entry point
    layout.tsx                  # Root layout
    globals.css                # Pixel-art design system
  components/
    HospitalScene.tsx           # Interactive CI/CD clinic with patient beds
    LibraryScene.tsx             # Library gateway scene
    FloorElevator.tsx           # Branch/floor navigation sidebar
    LoadingScreen.tsx           # Animated loading terminal
    ErrorScreen.tsx             # Error display with retry
    PixelPatternFill.tsx        # Repeating pixel pattern backgrounds
  data/
    hospitalScene.ts            # Hospital bed placements + config
    libraryScene.ts             # Library scene layout
    multiFloorHQScene.ts        # Scalable HQ floor plan
    startupRoomScene.ts         # Startup stage layout
    soloStageOneLayout.ts       # Solo stage layout
    teamStudioLayoutDraft.ts    # Medium stage layout
    layoutEditorTypes.ts        # Shared element type contracts
  hooks/
    useZoomPan.ts               # Canvas zoom/pan interaction hook
  lib/
    ciCdAnalyzer.ts             # CI/CD analysis engine
githuboffice/
  components/
    GitHubOfficePage.tsx        # Main page with all three views
    GitHubOfficeScene.tsx       # Pixel-art office renderer
  hooks/
    useCharacterRoutine.ts      # Character animation state machine
  lib/
    githubApi.ts                # GitHub API client with token pool + cache
    stageSceneFactory.ts        # Builds scene models from API data
    roleMapper.ts               # Assigns roles + scores contributors
    officeRoutines.ts           # Character animation routine definitions
    parseRepoReference.ts       # URL/shorthand parser
  types.ts                      # TypeScript contracts
```

---

## Bonus Challenges Completed

| Challenge | Status | Details |
|-----------|--------|---------|
| **Real Data Demo** | ✅ | Live GitHub API data — no mock data, real workflows, real commits |
| **Before & After** | ✅ | Hospital triage shows before (critical) → after (fixed) with scoring |
| **Open Source Ready** | ✅ | Clean repo structure, documented setup, `.env.local.example` |
| **Cross-Track Integration** | ✅ | Track A (CI Scanner) + Track F (Developer Flow) — office shows flow, hospital shows CI |

---

## DX-Ray Scan Results

```
SCAN TYPE:    Full Repository Diagnostic
TARGET:       Any Public GitHub Repository
SPEED:        < 5 seconds (cached), < 15 seconds (cold)
FLOORS:       Up to 5 branches visualized simultaneously
CONTRIBUTORS: Up to 200 per floor (score-ranked)
HOSPITAL:     Up to 12 patients with full CI/CD diagnosis
TOKEN POOL:   5 parallel GitHub tokens (anti-rate-limit)

SCAN STATUS: ✅ OPERATIONAL
```

---

## DX-Ray Hackathon

Built for [DX-Ray Hackathon 2026](https://raptors.dev) — **Track A: Build & CI Scanner**

> *X-ray your developer experience. Expose hidden friction. Build the fix.*

**The metaphor:** A repository is a body. CI/CD pipelines are its circulatory system. Contributors are its organs. When something goes wrong, you need an X-ray — not a guess.

GitHub Office is that X-ray machine.

---

<p align="center">
  <strong>Made with pixel art and parallel API calls</strong><br/>
  <sub>DX-Ray Hackathon 2026 · March 27–30 · 72 hours</sub>
</p>
