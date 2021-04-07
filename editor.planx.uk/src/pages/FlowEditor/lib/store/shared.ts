import { ROOT_NODE_KEY } from "@planx/graph";
import produce from "immer";
import type { GetState, SetState } from "zustand/vanilla";

import type { Store } from ".";

export interface SharedStore extends Store.Store {
  breadcrumbs: Store.breadcrumbs;
  childNodesOf: (id?: Store.nodeId) => Store.node[];
  flow: Store.flow;
  id: string;
  getNode: (id: Store.nodeId) => Store.node;
  mutatePassport: (mutation: (passport: Store.passport) => void) => void;
  resetPreview: () => void;
  setFlow: (id: string, flow: Store.flow) => void;
  wasVisited: (id: Store.nodeId) => boolean;
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

  getNode(id) {
    return {
      id,
      ...get().flow[id],
    };
  },

  mutatePassport(mutation) {
    set({
      passport: produce(get().passport, mutation),
    });
  },

  resetPreview() {
    set({ breadcrumbs: {}, passport: { data: {} }, sessionId: "" });
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
