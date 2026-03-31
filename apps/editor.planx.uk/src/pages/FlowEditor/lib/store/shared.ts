import { CoreDomainClient } from "@opensystemslab/planx-core";
import { NodeId } from "@opensystemslab/planx-core/types";
import { ROOT_NODE_KEY } from "@planx/graph";
import { removeSessionIdSearchParam } from "utils";
import type { StateCreator } from "zustand";

import type { Store } from ".";
import { NavigationStore } from "./navigation";

type Auth = NonNullable<
  ConstructorParameters<typeof CoreDomainClient>[0]
>["auth"];

export type PreviewEnvironment = "editor" | "standalone";
export interface SharedStore extends Store.Store {
  breadcrumbs: Store.Breadcrumbs;
  childNodesOf: (id?: NodeId) => Store.Node[];
  flow: Store.Flow;
  /**
   * Flow data is lazily loaded to allow faster initial loading times
   * Component trees which rely on this data need to check the status before rendering
   */
  isFlowLoaded: boolean;
  flowSlug: string;
  flowName: string;
  flowAnalyticsLink: string | undefined;
  id: string;
  getNode: (id: NodeId) => Store.Node | undefined;
  resetPreview: () => void;
  wasVisited: (id: NodeId) => boolean;
  previewEnvironment: PreviewEnvironment;
  setPreviewEnvironment: (previewEnvironment: PreviewEnvironment) => void;
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

  isFlowLoaded: false,

  flowSlug: "",

  flowName: "",

  flowAnalyticsLink: undefined,

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
      currentCard: null,
    });

    // For public routes, additionally reload page and clear session data
    const isPublished = get().previewEnvironment === "standalone";
    const currentURL = new URL(window.location.href);
    const isPreviewOrDraft =
      currentURL.pathname.endsWith("/preview") ||
      currentURL.pathname.endsWith("/draft");
    if (isPublished || isPreviewOrDraft) {
      removeSessionIdSearchParam(get().id);
    }
  },

  wasVisited(id) {
    return new Set(
      Object.entries(get().breadcrumbs).flatMap(([id, { answers }]) => [
        id,
        ...(answers || []),
      ]),
    ).has(id);
  },

  $public(auth: Auth | undefined): CoreDomainClient {
    return new CoreDomainClient({
      targetURL: import.meta.env.VITE_APP_HASURA_URL!,
      auth: auth,
    });
  },

  /**
   * Authenticated client is re-instantiated upon user login
   */
  $client: new CoreDomainClient({
    targetURL: import.meta.env.VITE_APP_HASURA_URL!,
  }),
});
