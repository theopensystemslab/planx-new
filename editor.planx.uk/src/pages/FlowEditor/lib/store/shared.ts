import { CoreDomainClient } from "@opensystemslab/planx-core";
import { Auth } from "@opensystemslab/planx-core/dist/requests/graphql";
import { ROOT_NODE_KEY } from "@planx/graph";
import { capitalize } from "lodash";
import { removeSessionIdSearchParam } from "utils";
import type { StateCreator } from "zustand";

import type { Store } from ".";
import { NavigationStore } from "./navigation";

export type PreviewEnvironment = "editor" | "standalone";
export interface SharedStore extends Store.Store {
  breadcrumbs: Store.breadcrumbs;
  childNodesOf: (id?: Store.nodeId) => Store.node[];
  flow: Store.flow;
  flowSlug: string;
  flowName: string;
  flowAnalyticsLink: string | null;
  id: string;
  getNode: (id: Store.nodeId) => Store.node | undefined;
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
  setFlowSlug: (flowSlug: string) => void;
  setFlowNameFromSlug: (flowSlug: string) => void;
  $public: (auth?: Auth) => CoreDomainClient;
  $client: CoreDomainClient;
}

export const sharedStore: StateCreator<
  SharedStore & NavigationStore,
  [],
  [],
  SharedStore
> = (set, get) => ({
  breadcrumbs: {},

  childNodesOf(id = ROOT_NODE_KEY) {
    const { flow } = get();
    return (flow[id]?.edges || []).map((id) => ({ id, ...flow[id] }));
  },

  flow: {},

  flowSlug: "",

  flowName: "",

  flowAnalyticsLink: null,

  id: "",
  previewEnvironment: "standalone",

  setPreviewEnvironment(previewEnvironment: PreviewEnvironment) {
    set({ previewEnvironment });
  },

  getNode(id) {
    const node = get().flow[id];
    if (!node) return;
    return {
      id,
      ...node,
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
      saveToEmail: "",
    });

    removeSessionIdSearchParam();
  },

  setFlow({ id, flow, flowSlug }) {
    this.setFlowNameFromSlug(flowSlug);
    set({ id, flow, flowSlug });
    get().initNavigationStore();
  },

  wasVisited(id) {
    return new Set(
      Object.entries(get().breadcrumbs).flatMap(([id, { answers }]) => [
        id,
        ...(answers || []),
      ]),
    ).has(id);
  },

  setFlowSlug(flowSlug) {
    set({ flowSlug });
  },

  setFlowNameFromSlug(flowSlug) {
    const flowName = capitalize(flowSlug.replaceAll?.("-", " "));
    set({ flowName });
  },

  $public(auth: Auth | undefined): CoreDomainClient {
    return new CoreDomainClient({
      targetURL: process.env.REACT_APP_HASURA_URL!,
      auth: auth,
    });
  },

  /**
   * Authenticated client is re-instantiated upon user login
   */
  $client: new CoreDomainClient({
    targetURL: process.env.REACT_APP_HASURA_URL!,
  }),
});
