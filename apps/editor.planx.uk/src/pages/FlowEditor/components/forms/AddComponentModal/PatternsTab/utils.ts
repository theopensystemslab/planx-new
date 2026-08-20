import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Graph } from "@planx/graph";

export interface PatternCounts {
  components: number;
  nestedFlows: number;
}

/**
 * Traverse graph to count components and nested flows
 * Traversal is required to properly account for clones
 */
export const getPatternCounts = (graph: Graph): PatternCounts => {
  let components = 0;
  let nestedFlows = 0;

  for (const node of Object.values(graph)) {
    for (const childId of node.edges ?? []) {
      const child = graph[childId];
      if (!child) continue;
      if (child.type === ComponentType.Answer) continue;

      if (child.type === ComponentType.ExternalPortal) {
        nestedFlows++;
      } else {
        components++;
      }
    }
  }

  return { components, nestedFlows };
};

export interface MosaicSquare {
  x: number;
  y: number;
  size: number;
  colorIndex: number;
}

export interface Mosaic {
  cols: number;
  rows: number;
  squares: MosaicSquare[];
}

const PALETTE_SIZE = 10;

/** Packing grid targets this cols:rows ratio, matching the preview window's aspect ratio */
const TARGET_ASPECT_RATIO = 2;

/** Deterministic string hash, used to seed the mosaic's PRNG per-pattern */
const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
};

/** Sequence generator using mulberry32 forumla to produce a pattern based on each seed */
const createRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Non-repeating, deterministic mosaic layout for a pattern */
export const getPatternMosaic = (
  seed: string,
  counts: PatternCounts,
): Mosaic => {
  const totalUnits = counts.components + counts.nestedFlows * 4;
  if (totalUnits === 0) return { cols: 0, rows: 0, squares: [] };

  // Pack nested flows within pattern as 2x2 squares
  const random = createRandom(hashString(seed));
  const itemSizes: number[] = [
    ...Array<number>(counts.nestedFlows).fill(2),
    ...Array<number>(counts.components).fill(1),
  ];
  for (let i = itemSizes.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [itemSizes[i], itemSizes[j]] = [itemSizes[j], itemSizes[i]];
  }

  // Picks any colour but the last one used
  let colorIndex = -1;
  const nextColor = (): number => {
    let next = Math.floor(random() * PALETTE_SIZE);
    while (next === colorIndex) {
      next = Math.floor(random() * PALETTE_SIZE);
    }
    colorIndex = next;
    return colorIndex;
  };

  // Pack shapes into a grid
  const tryPack = (cols: number, rows: number): MosaicSquare[] | null => {
    const occupied: boolean[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(false),
    );

    const canPlace = (x: number, y: number, size: number): boolean => {
      if (x + size > cols || y + size > rows) return false;
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
          if (occupied[y + dy][x + dx]) return false;
        }
      }
      return true;
    };

    const squares: MosaicSquare[] = [];
    for (const size of itemSizes) {
      let placed = false;
      for (let y = 0; y <= rows - size && !placed; y++) {
        for (let x = 0; x <= cols - size && !placed; x++) {
          if (!canPlace(x, y, size)) continue;
          for (let dy = 0; dy < size; dy++) {
            for (let dx = 0; dx < size; dx++) {
              occupied[y + dy][x + dx] = true;
            }
          }
          squares.push({ x, y, size, colorIndex: nextColor() });
          placed = true;
        }
      }
      if (!placed) return null;
    }
    return squares;
  };

  // Aim for a packing grid roughly 2:1 aspect ratio
  let cols = Math.max(
    1,
    Math.ceil(Math.sqrt(totalUnits * TARGET_ASPECT_RATIO)),
  );
  let rows = Math.max(1, Math.ceil(cols / TARGET_ASPECT_RATIO));
  if (counts.nestedFlows > 0) {
    cols = Math.max(cols, 2);
    rows = Math.max(rows, 2);
  }
  while (cols * rows < totalUnits) {
    cols++;
    rows = Math.max(
      counts.nestedFlows > 0 ? 2 : 1,
      Math.ceil(cols / TARGET_ASPECT_RATIO),
    );
  }

  let squares = tryPack(cols, rows);
  while (!squares) {
    cols++;
    rows = Math.max(
      counts.nestedFlows > 0 ? 2 : 1,
      Math.ceil(cols / TARGET_ASPECT_RATIO),
    );
    squares = tryPack(cols, rows);
  }

  // Trim unused rows and columns
  const usedCols = squares.reduce((max, s) => Math.max(max, s.x + s.size), 0);
  const usedRows = squares.reduce((max, s) => Math.max(max, s.y + s.size), 0);

  return { cols: usedCols, rows: usedRows, squares };
};
