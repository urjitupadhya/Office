import "server-only";

import type { GitHubContributor, GitHubOfficeFloor, GitHubOfficeRepo } from "../types";
import { mapContributorRoles } from "./roleMapper";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_API_TTL_MS = 60_000;
const MAX_BRANCHES = 5;
// Effectively unlimited — parallelPageFetch early-stops as soon as GitHub
// returns a partial page (<100 items), so these ceilings are never hit in practice.
const MAX_COMMIT_PAGES_PER_BRANCH = 10_000;
const MAX_CONTRIBUTOR_PAGES = 10_000;

type CacheEntry = {
  data: unknown;
  expiresAt: number;
};

type GitHubRepoPayload = {
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  html_url: string;
  private: boolean;
  stargazers_count: number;
};

type GitHubBranchPayload = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
};

type GitHubContributorPayload = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

type GitHubCommitPayload = {
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  commit: {
    author: {
      date: string | null;
    } | null;
    committer: {
      date: string | null;
    } | null;
  };
};

type BranchActivity = {
  name: string;
  sha: string;
  latestCommitAt: string | null;
};

class GitHubApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
  }
}

const responseCache = new Map<string, CacheEntry>();

/* ─── Token pool ─────────────────────────────────────────────
   Reads GITHUB_TOKEN_1 … GITHUB_TOKEN_5 from env.
   Falls back to legacy GITHUB_TOKEN for backward-compat.
   Each token owns a ~20% slice of pages and fetches in parallel. */

function loadTokenPool(): string[] {
  const slots = [
    process.env.GITHUB_TOKEN_1,
    process.env.GITHUB_TOKEN_2,
    process.env.GITHUB_TOKEN_3,
    process.env.GITHUB_TOKEN_4,
    process.env.GITHUB_TOKEN_5,
  ]
    .map((t) => t?.trim())
    .filter((t): t is string => Boolean(t));

  // Backward compat: if no numbered tokens, fall back to single token
  if (slots.length === 0) {
    const legacy = process.env.GITHUB_TOKEN?.trim();
    if (legacy) slots.push(legacy);
  }

  return slots;
}

const TOKEN_POOL: string[] = loadTokenPool();

function buildGitHubHeaders(tokenIndex = 0): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = TOKEN_POOL[tokenIndex % Math.max(TOKEN_POOL.length, 1)];
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Fetch a single URL using the specified token slot (0-indexed).
 * Results are cached by URL (token-agnostic — same data regardless of token).
 */
async function cachedGitHubJson<T>(url: string, tokenIndex = 0, ttlMs = GITHUB_API_TTL_MS): Promise<T> {
  const cacheHit = responseCache.get(url);

  if (cacheHit && cacheHit.expiresAt > Date.now()) {
    return cacheHit.data as T;
  }

  const response = await fetch(url, {
    headers: buildGitHubHeaders(tokenIndex),
    cache: "no-store",
  });

  if (response.status === 403) {
    throw new GitHubApiError("RATE_LIMIT", response.status);
  }

  if (response.status === 404) {
    throw new GitHubApiError("NOT_FOUND", response.status);
  }

  if (!response.ok) {
    throw new GitHubApiError(`GITHUB_${response.status}`, response.status);
  }

  const data = (await response.json()) as T;

  responseCache.set(url, {
    data,
    expiresAt: Date.now() + ttlMs,
  });

  return data;
}

/**
 * Split `totalPages` page indices across `TOKEN_POOL.length` workers (min 1).
 * Each worker gets a consecutive ~20% slice and fetches them in parallel.
 * Returns a flat, ordered array of all results.
 */
async function parallelPageFetch<T>(
  buildUrl: (page: number) => string,
  totalPages: number,
  earlyStopPredicate: (page: T[]) => boolean, // return true to stop after this page
): Promise<T[]> {
  const poolSize = Math.max(TOKEN_POOL.length, 1);
  const allResults: T[] = [];

  // We fetch in batches of `poolSize` pages at a time (parallel per batch).
  // Stop as soon as earlyStopPredicate says the last page was partial.
  for (let batchStart = 1; batchStart <= totalPages; batchStart += poolSize) {
    const batchEnd = Math.min(batchStart + poolSize - 1, totalPages);
    const batchPages = Array.from(
      { length: batchEnd - batchStart + 1 },
      (_, i) => batchStart + i,
    );

    // Each page in this batch is fetched using its own token slot
    const batchResults = await Promise.all(
      batchPages.map((page, slotIndex) =>
        cachedGitHubJson<T[]>(buildUrl(page), slotIndex).catch(() => [] as T[]),
      ),
    );

    let shouldStop = false;
    for (const pageData of batchResults) {
      allResults.push(...pageData);
      if (earlyStopPredicate(pageData)) {
        shouldStop = true;
        break;
      }
    }

    if (shouldStop) break;
  }

  return allResults;
}

function toContributor(payload: GitHubContributorPayload): GitHubContributor {
  return {
    login: payload.login,
    avatarUrl: payload.avatar_url,
    profileUrl: payload.html_url,
    commits: payload.contributions,
    lastCommitAt: null,
    isInactive: false,
  };
}

function getCommitDate(payload: GitHubCommitPayload) {
  return payload.commit.author?.date ?? payload.commit.committer?.date ?? null;
}

function mergeLastCommitAt(current: string | null, incoming: string | null) {
  if (!current) {
    return incoming;
  }

  if (!incoming) {
    return current;
  }

  return current >= incoming ? current : incoming;
}

function mergeContributorLists(contributors: GitHubContributor[]) {
  const contributorsByLogin = new Map<string, GitHubContributor>();

  for (const contributor of contributors) {
    const current = contributorsByLogin.get(contributor.login);

    if (current) {
      current.commits += contributor.commits;
      current.lastCommitAt = mergeLastCommitAt(current.lastCommitAt, contributor.lastCommitAt);
      continue;
    }

    contributorsByLogin.set(contributor.login, { ...contributor });
  }

  return [...contributorsByLogin.values()].sort((left, right) => {
    if (right.commits !== left.commits) {
      return right.commits - left.commits;
    }

    return left.login.localeCompare(right.login);
  });
}

export async function fetchRepoMeta(owner: string, repo: string) {
  const payload = await cachedGitHubJson<GitHubRepoPayload>(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);

  return {
    owner,
    name: payload.name,
    fullName: payload.full_name,
    description: payload.description,
    defaultBranch: payload.default_branch,
    htmlUrl: payload.html_url,
    isPrivate: payload.private,
    stars: payload.stargazers_count,
  };
}

export async function fetchRepoContributors(owner: string, repo: string) {
  const pages = await parallelPageFetch<GitHubContributorPayload>(
    (page) => `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=100&page=${page}`,
    MAX_CONTRIBUTOR_PAGES,
    (pageData) => pageData.length < 100,
  );

  return mergeContributorLists(pages.map(toContributor));
}

export async function fetchTopBranches(owner: string, repo: string, defaultBranch: string) {
  // Always guarantee these branches appear — fetch first page only (100 branches max)
  const DEFAULT_BRANCH_NAMES = [defaultBranch, "main", "master"].filter(
    (v, i, a) => a.indexOf(v) === i, // deduplicate
  );

  const branches = await cachedGitHubJson<GitHubBranchPayload[]>(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=100`,
  );

  const branchActivity = await Promise.all(
    branches.map(async (branch) => {
      try {
        const commitPayload = await cachedGitHubJson<GitHubCommitPayload>(branch.commit.url);

        return {
          name: branch.name,
          sha: branch.commit.sha,
          latestCommitAt: getCommitDate(commitPayload),
        } satisfies BranchActivity;
      } catch {
        return {
          name: branch.name,
          sha: branch.commit.sha,
          latestCommitAt: null,
        } satisfies BranchActivity;
      }
    }),
  );

  const sorted = branchActivity.sort((left, right) => {
    const leftDate = left.latestCommitAt ?? "";
    const rightDate = right.latestCommitAt ?? "";
    if (rightDate !== leftDate) return rightDate.localeCompare(leftDate);
    return left.name.localeCompare(right.name);
  });

  const top = sorted.slice(0, MAX_BRANCHES);
  const topNames = new Set(top.map((b) => b.name));

  // Inject any missing default branches at the front
  for (const name of [...DEFAULT_BRANCH_NAMES].reverse()) {
    if (topNames.has(name)) continue;
    const found = sorted.find((b) => b.name === name);
    if (found) {
      top.unshift(found);
      topNames.add(found.name);
    }
  }

  // Re-trim to MAX_BRANCHES (default branches count towards the limit)
  return top.slice(0, MAX_BRANCHES);
}

export async function fetchBranchContributors(owner: string, repo: string, branchName: string) {
  const allCommits = await parallelPageFetch<GitHubCommitPayload>(
    (page) =>
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branchName)}&per_page=100&page=${page}`,
    MAX_COMMIT_PAGES_PER_BRANCH,
    (pageData) => pageData.length < 100,
  );

  const contributorsByLogin = new Map<string, GitHubContributor>();

  for (const commit of allCommits) {
    if (!commit.author?.login) continue;

    const lastCommitAt = getCommitDate(commit);
    const existing = contributorsByLogin.get(commit.author.login);

    if (existing) {
      existing.commits += 1;
      existing.lastCommitAt = mergeLastCommitAt(existing.lastCommitAt, lastCommitAt);
      continue;
    }

    contributorsByLogin.set(commit.author.login, {
      login: commit.author.login,
      avatarUrl: commit.author.avatar_url,
      profileUrl: commit.author.html_url,
      commits: 1,
      lastCommitAt,
      isInactive: false,
    });
  }

  return mergeContributorLists([...contributorsByLogin.values()]);
}

export async function fetchGitHubOfficeData(owner: string, repo: string): Promise<{
  repo: GitHubOfficeRepo;
  floors: GitHubOfficeFloor[];
}> {
  const repoMeta = await fetchRepoMeta(owner, repo);

  if (repoMeta.isPrivate) {
    throw new GitHubApiError("PRIVATE_REPO", 403);
  }

  const globalContributors = await fetchRepoContributors(owner, repo);
  const fallbackBranchName = repoMeta.defaultBranch || "main";
  const branches = await fetchTopBranches(owner, repo, fallbackBranchName);
  const selectedBranches = branches.length
    ? branches
    : [
        {
          name: fallbackBranchName,
          sha: fallbackBranchName,
          latestCommitAt: null,
        },
      ];

  const floors = (
    await Promise.all(
      selectedBranches.map(async (branch) => {
        const branchContributors = await fetchBranchContributors(owner, repo, branch.name).catch(() => []);
        const effectiveContributors = branchContributors.length ? branchContributors : globalContributors;

        if (!effectiveContributors.length) {
          return null;
        }

        return mapContributorRoles(
          effectiveContributors,
          branch.name,
          branchContributors.length ? "branch" : "global-fallback",
          branch.latestCommitAt,
          effectiveContributors.length, // rawTotal before cap
        );
      }),
    )
  ).filter((floor): floor is GitHubOfficeFloor => Boolean(floor));

  return {
    repo: {
      owner,
      name: repoMeta.name,
      fullName: repoMeta.fullName,
      description: repoMeta.description,
      defaultBranch: repoMeta.defaultBranch,
      htmlUrl: repoMeta.htmlUrl,
      stars: repoMeta.stars,
      branchCount: branches.length || 1,
      selectedBranchCount: floors.length,
      contributorCount: globalContributors.length,
    },
    floors,
  };
}

export function isGitHubTokenConfigured() {
  return Boolean(process.env.GITHUB_TOKEN?.trim());
}

export function isGitHubApiError(error: unknown): error is GitHubApiError {
  return error instanceof GitHubApiError;
}
