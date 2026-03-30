"use client";
import { useRef, useState, useCallback, useEffect } from "react";

const MIN = 0.35;
const MAX = 4.0;
const STEP = 1.15;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

export function useZoomPan(containerRef: React.RefObject<HTMLElement | null>) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const origin = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const step = useCallback((factor: number) => {
    setZoom((z) => clamp(z * factor, MIN, MAX));
  }, []);

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Passive: false so we can preventDefault on wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => clamp(z * (e.deltaY < 0 ? STEP : 1 / STEP), MIN, MAX));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [containerRef]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      dragging.current = true;
      setIsDragging(true);
      origin.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
      e.preventDefault();
    },
    [pan],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging.current) return;
      const dx = (e.clientX - origin.current.mx) / zoom;
      const dy = (e.clientY - origin.current.my) / zoom;
      setPan({ x: origin.current.px + dx, y: origin.current.py + dy });
    },
    [zoom],
  );

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    setIsDragging(false);
  }, []);

  const transformStyle: React.CSSProperties = {
    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
    transformOrigin: "center center",
    cursor: isDragging ? "grabbing" : zoom > 1 ? "grab" : "default",
    userSelect: "none",
    willChange: "transform",
  };

  return {
    zoom,
    transformStyle,
    handlers: { onMouseDown, onMouseMove, onMouseUp },
    onDoubleClick: reset,
    zoomIn: () => step(STEP),
    zoomOut: () => step(1 / STEP),
    reset,
  };
}
