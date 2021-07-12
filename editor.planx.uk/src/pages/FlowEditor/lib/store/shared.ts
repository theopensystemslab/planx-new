import { ROOT_NODE_KEY } from "@planx/graph";
import { v4 } from "uuid";
import type { GetState, SetState } from "zustand/vanilla";

import type { Store } from ".";

type PreviewEnvironment = "editor" | "standalone";
export interface SharedStore extends Store.Store {
  breadcrumbs: Store.breadcrumbs;
  childNodesOf: (id?: Store.nodeId) => Store.node[];
  flow: Store.flow;
  id: string;
  getNode: (id: Store.nodeId) => Store.node;
  resetPreview: () => void;
  setFlow: (id: string, flow: Store.flow) => void;
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
    set({ breadcrumbs: {}, sessionId: v4() });
  },

  setFlow(id, flow) {
    set({ id, flow });
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
