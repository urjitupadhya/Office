"use client";

const MESSAGES: Record<string, string> = {
  RATE_LIMIT:
    "GitHub rate limit hit. Wait 60 seconds and try again, or add a GITHUB_TOKEN to your .env.local.",
  NOT_FOUND: "Repository not found. Check the URL and make sure the repo is public.",
  PRIVATE: "This repository is private. Only public repos are supported.",
  PRIVATE_REPO: "This repository is private. Only public repos are supported.",
  NO_CONTRIB: "No contributors found. The repository may be empty.",
  PARSE_ERROR: "Invalid URL. Try: https://github.com/owner/repo",
  NETWORK_ERROR: "Could not connect to the server. Check your internet connection.",
};

interface Props {
  code: string;
  onRetry: () => void;
}

export function ErrorScreen({ code, onRetry }: Props) {
  const message = MESSAGES[code] ?? `Something went wrong: ${code}`;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 16,
        padding: 40,
      }}
    >
      <p
        className="px-status error"
        style={{ fontSize: 13, textAlign: "center", maxWidth: 360 }}
      >
        {message}
      </p>
      <button className="px-btn" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
