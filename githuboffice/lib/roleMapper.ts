import type { GitHubContributor, GitHubOfficeFloor, OfficeStageId } from "../types";

const INACTIVE_CONTRIBUTOR_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Maximum contributors rendered in the office.
 * Beyond this the scene becomes unrenderable — we keep the best 300
 * scored by activeness + commit share + raw commit count.
 */
const MAX_RENDERED_CONTRIBUTORS = 300;

export function getStage(total: number): OfficeStageId {
  if (total <= 1) {
    return "solo";
  }

  if (total <= 6) {
    return "startup";
  }

  if (total <= 53) {
    return "medium";
  }

  return "scalable";
}

export function getTopContributorCount(total: number) {
  if (total <= 1) {
    return 0;
  }

  if (total <= 6) {
    return 1;
  }

  if (total <= 53) {
    return 4;
  }

  return 8;
}

function getCommitTimestamp(lastCommitAt: string | null) {
  if (!lastCommitAt) {
    return 0;
  }

  const parsed = Date.parse(lastCommitAt);

  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Composite score (0–1) used to rank contributors when capping.
 *
 * Weights:
 *   40% — activeness  (committed in the last 30 days → 1, otherwise 0)
 *   40% — commit share (this contributor's commits / total commits in branch)
 *   20% — commit count (log-normalised; 10 000 commits = full score)
 */
function scoreContributor(
  contributor: GitHubContributor,
  totalCommits: number,
  now: number,
): number {
  const lastTs = getCommitTimestamp(contributor.lastCommitAt);
  const isActive = lastTs > 0 && now - lastTs <= INACTIVE_CONTRIBUTOR_WINDOW_MS;

  const activenessScore = isActive ? 1 : 0;
  const commitShareScore = totalCommits > 0 ? contributor.commits / totalCommits : 0;

  const LOG_SCALE_CAP = 10_000;
  const commitCountScore = Math.min(contributor.commits, LOG_SCALE_CAP) / LOG_SCALE_CAP;

  return activenessScore * 0.4 + commitShareScore * 0.4 + commitCountScore * 0.2;
}

/**
 * Returns the top MAX_RENDERED_CONTRIBUTORS contributors ranked by score.
 * If already within limit the list is returned unchanged (no allocation).
 */
function capContributors(contributors: GitHubContributor[]): GitHubContributor[] {
  if (contributors.length <= MAX_RENDERED_CONTRIBUTORS) {
    return contributors;
  }

  const now = Date.now();
  const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0);

  return [...contributors]
    .sort((a, b) => scoreContributor(b, totalCommits, now) - scoreContributor(a, totalCommits, now))
    .slice(0, MAX_RENDERED_CONTRIBUTORS);
}

function markContributorActivity(contributors: GitHubContributor[]) {
  const now = Date.now();

  return contributors.map((contributor) => {
    const lastCommitTimestamp = getCommitTimestamp(contributor.lastCommitAt);
    const isInactive =
      lastCommitTimestamp > 0 && now - lastCommitTimestamp > INACTIVE_CONTRIBUTOR_WINDOW_MS;

    return {
      ...contributor,
      isInactive,
    };
  });
}

function sortContributors(contributors: GitHubContributor[]) {
  return [...contributors].sort((left, right) => {
    if (right.commits !== left.commits) {
      return right.commits - left.commits;
    }

    const rightTimestamp = getCommitTimestamp(right.lastCommitAt);
    const leftTimestamp = getCommitTimestamp(left.lastCommitAt);

    if (rightTimestamp !== leftTimestamp) {
      return rightTimestamp - leftTimestamp;
    }

    return left.login.localeCompare(right.login);
  });
}

export function mapContributorRoles(
  contributors: GitHubContributor[],
  branchName: string,
  source: GitHubOfficeFloor["source"],
  latestCommitAt: string | null,
  /** Raw total from the API before capping — used for the UI counter */
  rawTotal?: number,
): GitHubOfficeFloor {
  const capped = capContributors(contributors);
  const sortedContributors = sortContributors(markContributorActivity(capped));
  const total = sortedContributors.length;
  const boss = sortedContributors[0] ?? null;
  const topCount = getTopContributorCount(total);

  return {
    branchName,
    total,
    rawTotal: rawTotal ?? contributors.length,
    stage: getStage(total),
    boss,
    topContributors: sortedContributors.slice(1, 1 + topCount),
    employees: sortedContributors.slice(1 + topCount),
    source,
    latestCommitAt,
  };
}
