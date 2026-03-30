export type ParsedRepoReference = {
  owner: string;
  repo: string;
};

function sanitizeRepoName(value: string) {
  return value.replace(/\.git$/i, "").trim();
}

export function parseRepoReference(input: string): ParsedRepoReference | null {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return null;
  }

  const directMatch = trimmedInput.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/);

  if (directMatch) {
    return {
      owner: directMatch[1],
      repo: sanitizeRepoName(directMatch[2]),
    };
  }

  try {
    const url = new URL(trimmedInput.startsWith("http") ? trimmedInput : `https://${trimmedInput}`);

    if (!/(^|\.)github\.com$/i.test(url.hostname)) {
      return null;
    }

    const [owner, repo] = url.pathname.split("/").filter(Boolean);

    if (!owner || !repo) {
      return null;
    }

    return {
      owner,
      repo: sanitizeRepoName(repo),
    };
  } catch {
    return null;
  }
}
