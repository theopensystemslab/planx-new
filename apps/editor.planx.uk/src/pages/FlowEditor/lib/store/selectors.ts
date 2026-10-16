import type {
  IndexedNode,
  OrderedFlow,
} from "@opensystemslab/planx-core/types";

import type { SharedStore } from "./shared";
import { getIndexedFlow, type IndexedFlow } from "./utils/indexedFlow";

type FlowState = Pick<SharedStore, "flow">;

/**
 * Select the ordered and indexed version of the current flow
 */
export const selectIndexedFlow = (state: FlowState): IndexedFlow =>
  getIndexedFlow(state.flow);

/**
 * Select the nodes of the current flow, sorted top-down
 */
export const selectOrderedFlow = (state: FlowState): OrderedFlow =>
  selectIndexedFlow(state).ordered;

/**
 * Select a single node of the current flow, with its parent, section and internal portal ids
 */
export const selectIndexedNode =
  (id: string) =>
  (state: FlowState): IndexedNode | undefined =>
    selectIndexedFlow(state).nodes[id];
