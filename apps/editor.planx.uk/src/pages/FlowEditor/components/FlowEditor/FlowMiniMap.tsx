import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import React, { useCallback, useEffect, useRef, useState } from "react";

const BASE_WIDTH = 160;
const BASE_HEIGHT = 120;
const MINIMAP_PADDING = 4;

// Colours mirror floweditor.scss variables
const COLORS = {
  background: "#fafafa",
  node: { fill: "#ffffff", stroke: "#0b0c0c" },
  portal: { fill: "#0b0c0c", stroke: "#0b0c0c" },
  internalPortal: { fill: "#b5d1f7", stroke: "#2c4b88" },
  note: { fill: "#fffdb0", stroke: "#0b0c0c" },
  setvalue: { fill: "#f0f0f0", stroke: "#b1b4b6" },
  endpoint: "#0b0c0c",
  viewport: { fill: "rgba(59,130,246,0.1)", stroke: "rgba(59,130,246,0.8)" },
};

const Container = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2.5),
  right: theme.spacing(2.5),
  zIndex: theme.zIndex.appBar,
  border: `2px solid ${theme.palette.border.input}`,
  borderRadius: theme.shape.borderRadius,
  background: COLORS.background,
  opacity: 0.85,
  "&:hover": {
    opacity: 1,
  },
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  padding: 2,
  width: 32,
  height: 32,
  zIndex: 1,
  color: theme.palette.text.secondary,
  "&:hover": {
    background: "rgba(0,0,0,0.08)",
  },
  "& svg": {
    width: 20,
    height: 20,
  },
}));

const Canvas = styled("canvas")({
  display: "block",
  cursor: "crosshair",
});

function nodeColor(el: HTMLElement) {
  if (
    el.classList.contains("portal") &&
    !el.classList.contains("internal-portal") &&
    !el.classList.contains("breadcrumb")
  ) {
    return COLORS.portal;
  }
  if (
    el.classList.contains("internal-portal") ||
    el.classList.contains("breadcrumb")
  ) {
    return COLORS.internalPortal;
  }
  if (el.classList.contains("isNote")) {
    return COLORS.note;
  }
  if (el.classList.contains("type-SetValue")) {
    return COLORS.setvalue;
  }
  return COLORS.node;
}

export const FlowMiniMap: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  const mapWidth = expanded ? BASE_WIDTH * 2 : BASE_WIDTH;
  const mapHeight = expanded ? BASE_HEIGHT * 2 : BASE_HEIGHT;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const h = canvas.height;

    const editor = document.getElementById("editor") as HTMLElement | null;
    const flow = document.getElementById("flow") as HTMLElement | null;
    if (!editor || !flow) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fullW = flow.offsetWidth;
    const fullH = flow.offsetHeight;
    if (fullW === 0 || fullH === 0) return;

    const availW = w - MINIMAP_PADDING * 2;
    const availH = h - MINIMAP_PADDING * 2;
    const scale = Math.min(availW / fullW, availH / fullH);

    // Centre the scaled content within the canvas
    const ox = MINIMAP_PADDING + (availW - fullW * scale) / 2;
    const oy = MINIMAP_PADDING + (availH - fullH * scale) / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, w, h);

    // getBoundingClientRect differences give position-within-flow correctly
    // regardless of how far the editor has scrolled.
    const flowRect = flow.getBoundingClientRect();

    // Cards
    const cards = flow.querySelectorAll<HTMLElement>(".card");
    cards.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const x = (rect.left - flowRect.left) * scale + ox;
      const y = (rect.top - flowRect.top) * scale + oy;
      const cw = Math.max(rect.width * scale, 2);
      const ch = Math.max(rect.height * scale, 2);

      const { fill, stroke } = nodeColor(el);
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 0.5;
      ctx.fillRect(x, y, cw, ch);
      ctx.strokeRect(x, y, cw, ch);
    });

    // Endpoints (circles)
    const endpoints = flow.querySelectorAll<HTMLElement>(".endpoint");
    endpoints.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const cx = (rect.left - flowRect.left + rect.width / 2) * scale + ox;
      const cy = (rect.top - flowRect.top + rect.height / 2) * scale + oy;
      const r = Math.max((rect.width / 2) * scale, 2);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.endpoint;
      ctx.fill();
    });

    // Viewport indicator
    const editorRect = editor.getBoundingClientRect();
    const vx = (editorRect.left - flowRect.left) * scale + ox;
    const vy = (editorRect.top - flowRect.top) * scale + oy;
    const vw = editorRect.width * scale;
    const vh = editorRect.height * scale;

    ctx.fillStyle = COLORS.viewport.fill;
    ctx.strokeStyle = COLORS.viewport.stroke;
    ctx.lineWidth = 1;
    ctx.fillRect(vx, vy, vw, vh);
    ctx.strokeRect(vx, vy, vw, vh);
  }, []);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
  }, [draw]);

  // Redraw immediately when size changes
  useEffect(() => {
    scheduleDraw();
  }, [mapWidth, mapHeight, scheduleDraw]);

  useEffect(() => {
    const editor = document.getElementById("editor") as HTMLElement | null;
    const flow = document.getElementById("flow") as HTMLElement | null;
    if (!editor) return;

    editor.addEventListener("scroll", scheduleDraw, { passive: true });

    const resizeObserver = new ResizeObserver(scheduleDraw);
    resizeObserver.observe(editor);
    if (flow) resizeObserver.observe(flow);

    const mutationObserver = flow
      ? new MutationObserver(scheduleDraw)
      : undefined;
    mutationObserver?.observe(flow!, { childList: true, subtree: true });

    scheduleDraw();

    return () => {
      editor.removeEventListener("scroll", scheduleDraw);
      resizeObserver.disconnect();
      mutationObserver?.disconnect();
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleDraw]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const editor = document.getElementById("editor") as HTMLElement | null;
      const flow = document.getElementById("flow") as HTMLElement | null;
      if (!canvas || !editor || !flow) return;

      const w = canvas.width;
      const h = canvas.height;
      const fullW = flow.offsetWidth;
      const fullH = flow.offsetHeight;
      const availW = w - MINIMAP_PADDING * 2;
      const availH = h - MINIMAP_PADDING * 2;
      const scale = Math.min(availW / fullW, availH / fullH);
      const ox = MINIMAP_PADDING + (availW - fullW * scale) / 2;
      const oy = MINIMAP_PADDING + (availH - fullH * scale) / 2;

      const canvasRect = canvas.getBoundingClientRect();
      const clickX = e.clientX - canvasRect.left;
      const clickY = e.clientY - canvasRect.top;

      const flowX = (clickX - ox) / scale;
      const flowY = (clickY - oy) / scale;

      const editorRect = editor.getBoundingClientRect();
      const flowRect = flow.getBoundingClientRect();
      const flowOffsetX = flowRect.left - editorRect.left + editor.scrollLeft;
      const flowOffsetY = flowRect.top - editorRect.top + editor.scrollTop;

      editor.scrollTo({
        left: flowOffsetX + flowX - editor.clientWidth / 2,
        top: flowOffsetY + flowY - editor.clientHeight / 2,
        behavior: "smooth",
      });
    },
    [],
  );

  return (
    <Container>
      <ToggleButton
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Collapse minimap" : "Expand minimap"}
        title={expanded ? "Collapse minimap" : "Expand minimap"}
        size="small"
      >
        {expanded ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
      </ToggleButton>
      <Canvas
        ref={canvasRef}
        width={mapWidth}
        height={mapHeight}
        onClick={handleCanvasClick}
        aria-label="Flow minimap — click to navigate"
        title="Click to navigate"
      />
    </Container>
  );
};
