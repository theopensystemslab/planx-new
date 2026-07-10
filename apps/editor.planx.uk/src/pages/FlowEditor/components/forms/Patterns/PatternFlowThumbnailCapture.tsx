import type { Graph } from "@planx/graph";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { captureFlowSnapshot } from "./captureFlowSnapshot";
import { PatternFlowClone } from "./PatternFlowClone";

const patternThumbnailCache = new Map<string, string>();

export const getCachedPatternThumbnail = (
  patternId: string,
): string | undefined => patternThumbnailCache.get(patternId);

interface PatternFlowThumbnailCaptureProps {
  patternId: string;
  graph: Graph;
  onCapture: (dataUrl: string) => void;
}

/**
 * Mounts a read-only PatternFlowClone off-screen (so the real
 * floweditor.scss lays it out identically to the live editor), then
 * measures and paints it to a canvas snapshot once layout has settled.
 * Renders nothing visible itself - it's a one-shot capture, not a
 * persistent component.
 */
export const PatternFlowThumbnailCapture: React.FC<
  PatternFlowThumbnailCaptureProps
> = ({ patternId, graph, onCapture }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [portalTarget] = useState(() => {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.left = "-10000px";
    el.style.pointerEvents = "none";
    return el;
  });

  useEffect(() => {
    document.body.appendChild(portalTarget);
    return () => {
      document.body.removeChild(portalTarget);
    };
  }, [portalTarget]);

  useEffect(() => {
    let raf2 = 0;
    // Double rAF: one to let the browser commit + lay out the just-mounted
    // clone, a second to be sure that layout has actually settled before we
    // measure it.
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const root = containerRef.current;
        if (!root) return;
        const dataUrl = captureFlowSnapshot(root, graph);
        if (dataUrl) {
          patternThumbnailCache.set(patternId, dataUrl);
          onCapture(dataUrl);
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [patternId, graph, onCapture]);

  return createPortal(
    <div ref={containerRef}>
      <PatternFlowClone graph={graph} />
    </div>,
    portalTarget,
  );
};
