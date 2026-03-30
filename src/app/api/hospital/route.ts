import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GITHUB_API_BASE = "https://api.github.com";

function loadToken(): string | null {
  const tokens = [
    process.env.GITHUB_TOKEN_1,
    process.env.GITHUB_TOKEN_2,
    process.env.GITHUB_TOKEN_3,
    process.env.GITHUB_TOKEN_4,
    process.env.GITHUB_TOKEN_5,
  ]
    .map((t) => t?.trim())
    .filter((t): t is string => Boolean(t));

  if (tokens.length > 0) return tokens[0];

  const legacy = process.env.GITHUB_TOKEN?.trim();
  return legacy || null;
}

function buildHeaders(token: string): HeadersInit {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
  };
}

async function ghFetch(path: string, token: string): Promise<any> {
  const res = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: buildHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

function analyzeBuildStatus(workflows: any[]): "passing" | "failing" | "unknown" {
  if (workflows.length === 0) return "unknown";
  const runs = workflows.flatMap((w) => w.runs).slice(0, 10);
  if (runs.length === 0) return "unknown";
  const failureRate = runs.filter((r) => r.conclusion === "failure").length / runs.length;
  if (failureRate > 0.1) return "failing";
  return "passing";
}

function estimateTestCoverage(commits: any[]): number {
  const testCommits = commits.filter(
    (c: any) =>
      c.commit?.message?.toLowerCase().includes("test") ||
      c.commit?.message?.toLowerCase().includes("spec") ||
      c.commit?.message?.toLowerCase().includes("coverage")
  );
  return Math.min((testCommits.length / Math.max(commits.length, 1)) * 100, 95);
}

function countWorkflowFailures(workflows: any[]): number {
  return workflows.reduce((total, wf) => {
    const failures = wf.runs?.filter((r: any) => r.conclusion === "failure").length || 0;
    return total + failures;
  }, 0);
}

function identifyContributorProblem(
  contributor: { login: string; commits: number; lastCommitAt: string | null },
  repoAnalysis: { buildStatus: string; testCoverage: number; lastDeployment: string | null; workflowFailures: number; securityIssues: number; dependencyIssues: number }
) {
  const daysSinceLastCommit = contributor.lastCommitAt
    ? Math.floor((Date.now() - new Date(contributor.lastCommitAt).getTime()) / (1000 * 60 * 60 * 24))
    : 365;

  const problems: Array<{ status: "critical" | "warning" | "stable"; problem: string; points: number; details: string }> = [];

  if (daysSinceLastCommit > 90) {
    problems.push({
      status: "critical",
      problem: "Complete contributor disengagement",
      points: 200,
      details: `No commits for ${daysSinceLastCommit} days. Contributor likely left the project.`,
    });
  } else if (daysSinceLastCommit > 30) {
    problems.push({
      status: "warning",
      problem: "Low contributor activity",
      points: 100,
      details: `Last commit was ${daysSinceLastCommit} days ago. Engagement declining.`,
    });
  } else if (daysSinceLastCommit > 14) {
    problems.push({
      status: "warning",
      problem: "Reduced commit frequency",
      points: 60,
      details: `No commits for ${daysSinceLastCommit} days. May be blocked or on other tasks.`,
    });
  }

  if (repoAnalysis.buildStatus === "failing") {
    problems.push({
      status: "critical",
      problem: "Build pipeline failures",
      points: 150,
      details: `CI/CD pipeline failing with ${repoAnalysis.workflowFailures} recent failures. Code cannot be merged safely.`,
    });
  }

  if (repoAnalysis.testCoverage < 20) {
    problems.push({
      status: "critical",
      problem: "Very low test coverage",
      points: 120,
      details: `Repository test coverage estimated at ${repoAnalysis.testCoverage.toFixed(0)}%. High regression risk.`,
    });
  } else if (repoAnalysis.testCoverage < 40) {
    problems.push({
      status: "warning",
      problem: "Low test coverage",
      points: 50,
      details: `Repository test coverage estimated at ${repoAnalysis.testCoverage.toFixed(0)}%.`,
    });
  }

  if (!repoAnalysis.lastDeployment) {
    problems.push({
      status: "critical",
      problem: "No releases deployed",
      points: 175,
      details: "No releases found. Deployment pipeline may be broken.",
    });
  } else {
    const daysSince = Math.floor(
      (Date.now() - new Date(repoAnalysis.lastDeployment).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince > 180) {
      problems.push({
        status: "critical",
        problem: "Stale deployment pipeline",
        points: 150,
        details: `Last release was ${daysSince} days ago. Project may be abandoned.`,
      });
    } else if (daysSince > 90) {
      problems.push({
        status: "warning",
        problem: "Stale deployment pipeline",
        points: 100,
        details: `Last release was ${daysSince} days ago.`,
      });
    }
  }

  if (repoAnalysis.securityIssues > 0) {
    problems.push({
      status: "critical",
      problem: `${repoAnalysis.securityIssues} security issue(s)`,
      points: 80,
      details: "Open security-labeled issues found in the repository.",
    });
  }

  if (repoAnalysis.dependencyIssues > 10) {
    problems.push({
      status: "warning",
      problem: "Multiple dependency vulnerabilities",
      points: 60,
      details: `${repoAnalysis.dependencyIssues} open dependency security alerts.`,
    });
  }

  if (problems.length === 0) {
    return {
      status: "stable" as const,
      problem: "All Systems Operational",
      points: 25,
      details: "No CI/CD issues detected. Pipeline healthy.",
    };
  }

  const severityOrder: Record<string, number> = { critical: 3, warning: 2, stable: 1 };
  problems.sort((a, b) => {
    const diff = severityOrder[b.status] - severityOrder[a.status];
    if (diff !== 0) return diff;
    return b.points - a.points;
  });

  return problems[0];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const repoInput = url.searchParams.get("repo");

  if (!repoInput) {
    return NextResponse.json({ error: "Missing `repo` query parameter." }, { status: 400 });
  }

  const match = repoInput.match(/github\.com\/([^/\s?#]+)\/([^/\s?#]+)/);
  const owner = match ? match[1] : repoInput.split("/")[0];
  const repo = match ? match[2] : repoInput.split("/")[1];

  if (!owner || !repo) {
    return NextResponse.json({ error: "Invalid repo format." }, { status: 400 });
  }

  const token = loadToken();
  if (!token) {
    return NextResponse.json(
      { error: "No GitHub token configured. Set GITHUB_TOKEN in your environment." },
      { status: 500 }
    );
  }

  try {
    console.log(`[Hospital API] Analyzing ${owner}/${repo}`);

    const [contributors, workflows, commits, releases] = await Promise.all([
      ghFetch(`/repos/${owner}/${repo}/contributors?per_page=12`, token),
      (async () => {
        const wfData = await ghFetch(`/repos/${owner}/${repo}/actions/workflows`, token);
        if (!wfData?.workflows?.length) return [];
        const withRuns = await Promise.all(
          wfData.workflows.slice(0, 3).map(async (wf: any) => {
            const runs = await ghFetch(
              `/repos/${owner}/${repo}/actions/workflows/${wf.id}/runs?per_page=5`,
              token
            );
            return { ...wf, runs: runs?.workflow_runs || [] };
          })
        );
        return withRuns;
      })(),
      ghFetch(`/repos/${owner}/${repo}/commits?per_page=30`, token),
      ghFetch(`/repos/${owner}/${repo}/releases?per_page=5`, token),
    ]);

    const contributorList = Array.isArray(contributors) ? contributors : [];
    const commitList = Array.isArray(commits) ? commits : [];
    const releaseList = Array.isArray(releases) ? releases : [];

    console.log(`[Hospital API] Fetched: ${contributorList.length} contributors, ${workflows.length} workflows, ${commitList.length} commits, ${releaseList.length} releases`);

    const buildStatus = analyzeBuildStatus(workflows);
    const testCoverage = estimateTestCoverage(commitList);
    const workflowFailures = countWorkflowFailures(workflows);
    const lastDeployment = releaseList.length > 0 ? releaseList[0].published_at : null;

    const repoAnalysis = {
      buildStatus,
      testCoverage,
      lastDeployment,
      workflowFailures,
      securityIssues: 0,
      dependencyIssues: 0,
    };

    const authorLatestCommit = new Map<string, string>();
    for (const c of commitList) {
      const login = c.author?.login;
      const date = c.commit?.author?.date;
      if (login && date && !authorLatestCommit.has(login)) {
        authorLatestCommit.set(login, date);
      }
    }

    const patients = contributorList.slice(0, 12).map((contributor: any, index: number) => {
      const lastCommitAt = authorLatestCommit.get(contributor.login) || null;
      const problem = identifyContributorProblem(
        { login: contributor.login, commits: contributor.contributions, lastCommitAt },
        repoAnalysis
      );

      return {
        id: `ward-${index}`,
        login: contributor.login,
        avatarUrl: contributor.avatar_url,
        lastCommitAt,
        commits: contributor.contributions,
        status: problem.status,
        problem: problem.problem,
        details: problem.details,
        points: problem.points,
        ciCdAnalysis: {
          buildStatus: repoAnalysis.buildStatus,
          testCoverage: repoAnalysis.testCoverage,
          lastDeployment: repoAnalysis.lastDeployment,
          mergeConflicts: 0,
          workflowFailures: repoAnalysis.workflowFailures,
          securityIssues: repoAnalysis.securityIssues,
          dependencyIssues: repoAnalysis.dependencyIssues,
        },
      };
    });

    console.log(`[Hospital API] Returning ${patients.length} patients`);
    return NextResponse.json({ patients, repoAnalysis });
  } catch (error) {
    console.error("Hospital analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze repository." },
      { status: 500 }
    );
  }
}
