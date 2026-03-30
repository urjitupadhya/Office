"use client";

interface Props {
  lines: string[];
}

export function LoadingScreen({ lines }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 6,
        padding: 40,
      }}
    >
      {lines.map((line, i) => {
        const isLatest = i === lines.length - 1;
        return (
          <p
            key={i}
            className="px-status"
            style={{
              opacity: isLatest ? 1 : 0.4,
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            {isLatest ? "> " : "  "}
            {line}
          </p>
        );
      })}
      {/* blinking cursor */}
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 14,
          background: "var(--px-accent)",
          animation: "blink-cursor 0.8s step-end infinite",
          marginTop: 2,
        }}
      />
    </div>
  );
}
