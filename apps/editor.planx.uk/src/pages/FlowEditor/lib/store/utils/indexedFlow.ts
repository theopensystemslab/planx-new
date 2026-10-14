import { sortFlow } from "@opensystemslab/planx-core";
import type {
  FlowGraph,
  IndexedNode,
  OrderedFlow,
} from "@opensystemslab/planx-core/types";
import { logger } from "airbrake";

import type { Store } from "..";

export interface IndexedFlow {
  ordered: OrderedFlow;
  nodes: Record<string, IndexedNode>;
}

const EMPTY_INDEXED_FLOW: IndexedFlow = { ordered: [], nodes: {} };

// Each ShareDB sync creates a new flow object, so that...
//  - each version of the flow is sorted at most once, then read from the cache
//  - entries for old versions are garbage collected once nothing else references them
const cache = new WeakMap<Store.Flow, IndexedFlow>();

/**
 * Get an ordered and indexed version of the current flow
 *
 * This is derived from the current state of the flow (not stored),
 * which means it's always automatically in sync
 */
export const getIndexedFlow = (flow: Store.Flow): IndexedFlow => {
  const cached = cache.get(flow);
  if (cached) return cached;

  let indexedFlow = EMPTY_INDEXED_FLOW;
  try {
    const ordered = sortFlow(flow as FlowGraph);
    const nodes = Object.fromEntries(ordered.map((node) => [node.id, node]));
    indexedFlow = { ordered, nodes };
  } catch (error) {
    logger.notify(error);
  }

  cache.set(flow, indexedFlow);
  return indexedFlow;
};
