import { NextResponse } from "next/server";
import {
  fetchGitHubOfficeData,
  isGitHubApiError,
  isGitHubTokenConfigured,
} from "@githuboffice/lib/githubApi";
import { parseRepoReference } from "@githuboffice/lib/parseRepoReference";

export const dynamic = "force-dynamic";

function getStatusAndMessage(error: unknown) {
  if (isGitHubApiError(error)) {
    if (error.message === "RATE_LIMIT") {
      return {
        status: 429,
        message: "GitHub rate limit hit. Add a local GITHUB_TOKEN or wait for the limit window to reset.",
      };
    }

    if (error.message === "NOT_FOUND") {
      return {
        status: 404,
        message: "That public GitHub repo could not be found.",
      };
    }

    if (error.message === "PRIVATE_REPO") {
      return {
        status: 403,
        message: "Private repositories are not supported in the public visualizer flow.",
      };
    }

    return {
      status: error.status || 500,
      message: "GitHub returned an unexpected response while loading this office.",
    };
  }

  return {
    status: 500,
    message: error instanceof Error ? error.message : "Unable to load this GitHub office right now.",
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const repoInput = url.searchParams.get("repo");

  if (!repoInput) {
    return NextResponse.json({ error: "Missing `repo` query parameter." }, { status: 400 });
  }

  const parsedRepo = parseRepoReference(repoInput);

  if (!parsedRepo) {
    return NextResponse.json(
      { error: "Paste a GitHub repo URL like https://github.com/owner/repo." },
      { status: 400 },
    );
  }

  try {
    const officeData = await fetchGitHubOfficeData(parsedRepo.owner, parsedRepo.repo);

    if (!officeData.floors.length) {
      return NextResponse.json(
        {
          error: "No visible contributors were found for this repository yet.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ...officeData,
      fetchedAt: new Date().toISOString(),
      tokenConfigured: isGitHubTokenConfigured(),
    });
  } catch (error) {
    const { status, message } = getStatusAndMessage(error);

    return NextResponse.json({ error: message }, { status });
  }
}
