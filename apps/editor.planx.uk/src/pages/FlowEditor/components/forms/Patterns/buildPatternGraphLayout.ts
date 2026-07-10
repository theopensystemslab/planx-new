import type { Graph } from "@planx/graph";
import { ROOT_NODE_KEY } from "@planx/graph";

const NODE_SIZE = 6;
const H_GAP = 6;
const V_GAP = 16;

export interface PatternGraphLayoutNode {
  id: string;
  x: number;
  y: number;
}

export interface PatternGraphLayoutEdge {
  from: PatternGraphLayoutNode;
  to: PatternGraphLayoutNode;
}

export interface PatternGraphLayout {
  nodes: PatternGraphLayoutNode[];
  edges: PatternGraphLayoutEdge[];
  width: number;
  height: number;
}

/**
 * Reduces a flow's node graph to a simplified level-by-level layout for
 * rendering a small "shape of this pattern" thumbnail - not a faithful
 * reproduction of the real editor layout.
 */
export const buildPatternGraphLayout = (graph: Graph): PatternGraphLayout => {
  const parentOf = new Map<string, string>();
  const visited = new Set<string>([ROOT_NODE_KEY]);
  const levels: string[][] = [];

  let frontier = [ROOT_NODE_KEY];
  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const childId of graph[id]?.edges ?? []) {
        if (visited.has(childId)) continue;
        visited.add(childId);
        parentOf.set(childId, id);
        next.push(childId);
      }
    }
    if (next.length) levels.push(next);
    frontier = next;
  }

  const maxLevelWidth = Math.max(0, ...levels.map((level) => level.length));
  const width = Math.max(
    NODE_SIZE,
    maxLevelWidth * (NODE_SIZE + H_GAP) - H_GAP,
  );
  const height = Math.max(
    NODE_SIZE,
    levels.length * (NODE_SIZE + V_GAP) - V_GAP,
  );

  const nodesById = new Map<string, PatternGraphLayoutNode>();
  levels.forEach((level, levelIndex) => {
    const levelWidth = level.length * (NODE_SIZE + H_GAP) - H_GAP;
    const startX = (width - levelWidth) / 2;
    const y = levelIndex * (NODE_SIZE + V_GAP) + NODE_SIZE / 2;
    level.forEach((id, i) => {
      const x = startX + i * (NODE_SIZE + H_GAP) + NODE_SIZE / 2;
      nodesById.set(id, { id, x, y });
    });
  });

  const edges: PatternGraphLayoutEdge[] = [];
  nodesById.forEach((node, id) => {
    const parentId = parentOf.get(id);
    const parentNode = parentId && nodesById.get(parentId);
    if (parentNode) edges.push({ from: parentNode, to: node });
  });

  return { nodes: [...nodesById.values()], edges, width, height };
};
