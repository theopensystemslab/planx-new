import type {
  IndexedNode,
  OrderedFlow,
} from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { getIndexedFlow } from "pages/FlowEditor/lib/store/utils/indexedFlow";

export const useOrderedFlow = (): OrderedFlow =>
  useStore((state) => getIndexedFlow(state.flow).ordered);

export const useIndexedNode = (id: string): IndexedNode | undefined =>
  useStore((state) => getIndexedFlow(state.flow).nodes[id]);
