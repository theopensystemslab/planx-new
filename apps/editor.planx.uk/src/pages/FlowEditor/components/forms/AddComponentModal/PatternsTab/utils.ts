import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Graph } from "@planx/graph";

/**
 * Count all nodes (minus root and Answer components)
 */
export const getComponentCount = (graph: Graph) =>
  Object.entries(graph).filter(
    ([id, { type }]) => id !== "_root" && type !== ComponentType.Answer,
  ).length;

export const componentCountLabel = (count: number): string | null =>
  count >= 1 ? `${count} component${count === 1 ? "" : "s"}` : null;
