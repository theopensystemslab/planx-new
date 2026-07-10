import type { Graph } from "@planx/graph";

// Colours mirror floweditor.scss variables
const COLORS = {
  background: "#fafafa",
  node: { fill: "#ffffff", stroke: "#0b0c0c", text: "#b1b4b6" },
  portal: { fill: "#0b0c0c", stroke: "#0b0c0c", text: "#ffffff" },
  internalPortal: { fill: "#b5d1f7", stroke: "#2c4b88", text: "#2c4b88" },
  connector: "#0b0c0c",
};

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 200;
const PADDING = 8;

const nodeColor = (
  el: HTMLElement,
): { fill: string; stroke: string; text: string } => {
  if (el.classList.contains("internal-portal")) return COLORS.internalPortal;
  if (el.classList.contains("portal")) return COLORS.portal;
  return COLORS.node;
};

/**
 * A `.card` element that branches (Question/Checklist/Answer) contains its
 * children's <ol> as a direct child, so its own bounding rect spans the
 * whole subtree rather than just the card itself. In that case, use the
 * rect of the header element just before the <ol> instead.
 */
const getCardRect = (card: HTMLElement): DOMRect => {
  const childOl = card.querySelector<HTMLElement>(
    ":scope > ol.options, :scope > ol.decisions",
  );
  const header = childOl?.previousElementSibling as HTMLElement | null;
  return (header ?? card).getBoundingClientRect();
};

/** Folders wrap their real .card box in an inner div; everything else is a .card itself */
const getVisualCardRect = (li: HTMLElement): DOMRect | null => {
  const card = li.classList.contains("card")
    ? li
    : li.querySelector<HTMLElement>(".card");
  return card ? getCardRect(card) : null;
};

/**
 * Measures the .card elements under `root` (a PatternFlowClone mounted
 * off-screen, laid out by the real floweditor.scss, tagged with
 * `data-node-id`) and paints a scaled-down snapshot to a canvas, returning a
 * PNG data URL. Connectors are drawn from the source graph's actual edges
 * rather than DOM adjacency, so nodes reached from multiple parents (e.g.
 * two answers converging back on the same next question) get a line from
 * every parent, not just the one that happens to contain it in the DOM.
 * Returns null if the clone hasn't produced any measurable content yet.
 */
export const captureFlowSnapshot = (
  root: HTMLElement,
  graph: Graph,
): string | null => {
  const cards = root.querySelectorAll<HTMLElement>(".card");
  if (cards.length === 0) return null;

  const rootRect = root.getBoundingClientRect();
  const fullW = rootRect.width;
  const fullH = rootRect.height;
  if (!fullW || !fullH) return null;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const availW = CANVAS_WIDTH - PADDING * 2;
  const availH = CANVAS_HEIGHT - PADDING * 2;
  const scale = Math.min(availW / fullW, availH / fullH);
  const ox = PADDING + (availW - fullW * scale) / 2;
  const oy = PADDING + (availH - fullH * scale) / 2;

  const toCanvasX = (x: number) => (x - rootRect.left) * scale + ox;
  const toCanvasY = (y: number) => (y - rootRect.top) * scale + oy;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const nodeElements = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>("[data-node-id]").forEach((el) => {
    const id = el.dataset.nodeId;
    if (id) nodeElements.set(id, el);
  });

  // Draw a connector for every real graph edge whose ends both rendered -
  // an "elbow" (down/across/down) rather than a diagonal, since a
  // reconverging node's several parents rarely share its x position
  Object.entries(graph).forEach(([parentId, node]) => {
    const parentEl = nodeElements.get(parentId);
    const parentRect = parentEl && getVisualCardRect(parentEl);
    if (!parentRect) return;

    (node.edges ?? []).forEach((childId) => {
      const childEl = nodeElements.get(childId);
      const childRect = childEl && getVisualCardRect(childEl);
      if (!childRect) return;

      const x1 = toCanvasX(parentRect.left + parentRect.width / 2);
      const y1 = toCanvasY(parentRect.bottom);
      const x2 = toCanvasX(childRect.left + childRect.width / 2);
      const y2 = toCanvasY(childRect.top);
      const midY = (y1 + y2) / 2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1, midY);
      ctx.lineTo(x2, midY);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = COLORS.connector;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  });

  cards.forEach((el) => {
    const rect = getCardRect(el);
    const x = toCanvasX(rect.left);
    const y = toCanvasY(rect.top);
    const w = Math.max(rect.width * scale, 1);
    const h = Math.max(rect.height * scale, 1);

    const { fill, stroke, text } = nodeColor(el);
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // A horizontal stroke standing in for the card's text label
    const inset = w * 0.2;
    if (w - inset * 2 > 1) {
      ctx.beginPath();
      ctx.moveTo(x + inset, y + h / 2);
      ctx.lineTo(x + w - inset, y + h / 2);
      ctx.strokeStyle = text;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  return canvas.toDataURL("image/png");
};
