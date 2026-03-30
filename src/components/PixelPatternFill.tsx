"use client";

import { useEffect, useRef, useState } from "react";

type PixelPatternFillProps = {
  src: string;
  backgroundSize: string;
  repeat: boolean;
  className?: string;
  scale?: number;
};

function parsePixelSize(backgroundSize: string) {
  const match = backgroundSize.match(/(\d+(?:\.\d+)?)px(?:\s+(\d+(?:\.\d+)?)px)?/);

  if (!match) {
    return null;
  }

  return {
    width: Number(match[1]),
    height: Number(match[2] ?? match[1]),
  };
}

export function PixelPatternFill({
  src,
  backgroundSize,
  repeat,
  className,
  scale = 1,
}: PixelPatternFillProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const patternScale = Number.isFinite(scale) && scale > 0 ? scale : 1;

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;

      if (!rect) {
        return;
      }

      setSize({
        width: rect.width,
        height: rect.height,
      });
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const pixelSize = parsePixelSize(backgroundSize);

  if (pixelSize) {
    const scaledPixelWidth = Math.max(pixelSize.width * patternScale, 1);
    const scaledPixelHeight = Math.max(pixelSize.height * patternScale, 1);
    const columns = repeat ? Math.max(1, Math.ceil(size.width / scaledPixelWidth) + 1) : 1;
    const rows = repeat ? Math.max(1, Math.ceil(size.height / scaledPixelHeight) + 1) : 1;

    return (
      <div
        ref={containerRef}
        className={className}
        style={{ overflow: "hidden", position: "relative", width: "100%", height: "100%" }}
      >
        {Array.from({ length: rows }).map((_, rowIndex) =>
          Array.from({ length: columns }).map((__, columnIndex) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${rowIndex}-${columnIndex}`}
              src={src}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                pointerEvents: "none",
                userSelect: "none",
                left: `${columnIndex * scaledPixelWidth}px`,
                top: `${rowIndex * scaledPixelHeight}px`,
                width: `${scaledPixelWidth}px`,
                height: `${scaledPixelHeight}px`,
                imageRendering: "pixelated",
              }}
            />
          )),
        )}
      </div>
    );
  }

  const columns = repeat ? Math.max(1, Math.ceil(size.width / Math.max(size.height, 1)) + 2) : 1;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        overflow: "hidden",
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={src}
          alt=""
          draggable={false}
          style={{
            pointerEvents: "none",
            height: "100%",
            width: "auto",
            flexShrink: 0,
            userSelect: "none",
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}
