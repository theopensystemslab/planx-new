import { ROOT_NODE_KEY } from "@planx/graph";
import { capitalize } from "lodash";
import type { GetState, SetState } from "zustand/vanilla";

import type { Store } from ".";

export type PreviewEnvironment = "editor" | "standalone";
export interface SharedStore extends Store.Store {
  breadcrumbs: Store.breadcrumbs;
  childNodesOf: (id?: Store.nodeId) => Store.node[];
  flow: Store.flow;
  flowSlug: string;
  flowName: string;
  id: string;
  getNode: (id: Store.nodeId) => Store.node;
  resetPreview: () => void;
  setFlow: ({
    id,
    flow,
    flowSlug,
  }: {
    id: string;
    flow: Store.flow;
    flowSlug: string;
  }) => void;
  wasVisited: (id: Store.nodeId) => boolean;
  previewEnvironment: PreviewEnvironment;
  setPreviewEnvironment: (previewEnvironment: PreviewEnvironment) => void;
}

export const sharedStore = (
  set: SetState<SharedStore>,
  get: GetState<SharedStore>
): SharedStore => ({
  breadcrumbs: {},

  childNodesOf(id = ROOT_NODE_KEY) {
    const { flow } = get();
    return (flow[id]?.edges || []).map((id) => ({ id, ...flow[id] }));
  },

  flow: {},

  flowSlug: "",

  flowName: "",

  id: "",
  previewEnvironment: "standalone",

  setPreviewEnvironment(previewEnvironment: PreviewEnvironment) {
    set({ previewEnvironment });
  },

  getNode(id) {
    return {
      id,
      ...get().flow[id],
    };
  },

  resetPreview() {
    set({
      cachedBreadcrumbs: {},
      breadcrumbs: {},
      sessionId: "",
      _nodesPendingEdit: [],
      restore: false,
      changedNode: undefined,
    });
  },

  setFlow({ id, flow, flowSlug }) {
    const flowName = capitalize(flowSlug.replaceAll?.("-", " "));
    set({ id, flow, flowSlug, flowName });
  },

  wasVisited(id) {
    return new Set(
      Object.entries(get().breadcrumbs).flatMap(([id, { answers }]) => [
        id,
        ...(answers || []),
      ])
    ).has(id);
  },
});
