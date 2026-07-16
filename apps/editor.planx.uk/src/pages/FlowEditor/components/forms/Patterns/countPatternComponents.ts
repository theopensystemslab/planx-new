import type { Graph } from "@planx/graph";
import { ROOT_NODE_KEY } from "@planx/graph";

/** Counts every node reachable from root, once each, guarding against cycles/shared references */
export const countPatternComponents = (graph: Graph): number => {
  const visited = new Set<string>([ROOT_NODE_KEY]);
  let frontier = [ROOT_NODE_KEY];

  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const childId of graph[id]?.edges ?? []) {
        if (visited.has(childId)) continue;
        visited.add(childId);
        next.push(childId);
      }
    }
    frontier = next;
  }

  return visited.size - 1;
};
