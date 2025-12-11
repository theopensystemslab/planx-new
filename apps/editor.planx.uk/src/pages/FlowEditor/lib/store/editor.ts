import { gql } from "@apollo/client";
import { getPathForNode, sortFlow } from "@opensystemslab/planx-core";
import {
  ComponentType as TYPES,
  flatFlags,
  FlowGraph,
  FlowStatus,
  NodeId,
  OrderedFlow,
} from "@opensystemslab/planx-core/types";
import {
  add,
  buildGraphFromNodes,
  clone,
  isClone,
  makeUnique,
  move,
  Relationships,
  remove,
  ROOT_NODE_KEY,
  uniqueId,
  update,
} from "@planx/graph";
import { OT } from "@planx/graph/types";
import { client } from "lib/graphql";
import navigation from "lib/navigation";
import debounce from "lodash/debounce";
import { type } from "ot-json0";
import {
  ContextMenuPosition,
  ContextMenuSource,
} from "pages/FlowEditor/components/Flow/components/ContextMenu";
import { Doc } from "sharedb/lib/client";
import type { StateCreator } from "zustand";
import { persist } from "zustand/middleware";

import { FlowLayout } from "../../components/Flow";
import { getFlowDoc, subscribeToDoc } from "./../sharedb";
import { type Store } from ".";
import { NavigationStore } from "./navigation";
import type { SharedStore } from "./shared";
import { UserStore } from "./user";

let doc: Doc;

const send = (ops: Array<any>) => {
  if (ops.length > 0) {
    console.log({ ops });
    doc.submitOp(ops);
  }
};

export type FlowCardView = "grid" | "row";

export interface EditorUIStore {
  flowLayout: FlowLayout;
  showSidebar: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onLoadingComplete?: () => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setLoadingCompleteCallback: (callback: (() => void) | undefined) => void;
  flowCardView: FlowCardView;
  setFlowCardView: (view: FlowCardView) => void;
  showTags: boolean;
  toggleShowTags: () => void;
  showImages: boolean;
  toggleShowImages: () => void;
  showNotes: boolean;
  toggleShowNotes: () => void;
  showDataFields: boolean;
  toggleShowDataFields: () => void;
  showHelpText: boolean;
  toggleShowHelpText: () => void;
  previousURL?: string;
  currentURL: string;
  initURLTracking: () => void;
  openContextMenu: (
    position: ContextMenuPosition,
    relationships: Relationships,
    source: ContextMenuSource,
  ) => void;
  contextMenuRelationships: Relationships;
  contextMenuPosition: ContextMenuPosition | null;
  closeContextMenu: () => void;
  contextMenuSource: ContextMenuSource | null;
}

export const editorUIStore: StateCreator<
  SharedStore & EditorUIStore,
  [],
  [["zustand/persist", unknown]],
  EditorUIStore
> = persist(
  (set, get) => ({
    flowLayout: FlowLayout.TOP_DOWN,

    showSidebar: true,

    toggleSidebar: () => {
      set({ showSidebar: !get().showSidebar });
    },

    isLoading: false,
    loadingMessage: "Loading...",

    showLoading: (message = "Loading...") => {
      set({ isLoading: true, loadingMessage: message });
    },

    hideLoading: () => {
      set({ isLoading: false });
    },

    setLoadingCompleteCallback: (callback) =>
      set({ onLoadingComplete: callback }),

    flowCardView: "grid",

    setFlowCardView: (view: FlowCardView) => {
      set({ flowCardView: view });
    },

    showTags: true,

    toggleShowTags: () => set({ showTags: !get().showTags }),

    showImages: false,

    toggleShowImages: () => set({ showImages: !get().showImages }),

    showNotes: true,

    toggleShowNotes: () => set({ showNotes: !get().showNotes }),

    showDataFields: true,

    toggleShowDataFields: () => set({ showDataFields: !get().showDataFields }),

    showHelpText: false,

    toggleShowHelpText: () => set({ showHelpText: !get().showHelpText }),

    previousURL: undefined,

    currentURL: window.location.pathname,

    initURLTracking: () => {
      navigation.subscribe((route) => {
        const { currentURL } = get();
        if (route.url.pathname === currentURL) return;

        set((state) => ({
          previousURL: state.currentURL,
          currentURL: route.url.pathname,
        }));
      });
    },

    contextMenuPosition: null,

    contextMenuRelationships: {
      nodeId: undefined,
      parent: ROOT_NODE_KEY,
      before: undefined,
    },

    openContextMenu: (position, relationships, source) => {
      const isOpen = Boolean(get().contextMenuPosition);
      if (isOpen) return get().closeContextMenu();

      set({
        contextMenuPosition: position,
        contextMenuRelationships: relationships,
        contextMenuSource: source,
      });
    },

    closeContextMenu: () =>
      set({
        contextMenuSource: null,
        contextMenuPosition: null,
        contextMenuRelationships: {
          self: undefined,
          parent: ROOT_NODE_KEY,
          before: undefined,
        },
      }),

    contextMenuSource: null,
  }),
  {
    name: "editorUIStore",
    partialize: (state) => ({
      showSidebar: state.showSidebar,
      flowCardView: state.flowCardView,
      showTags: state.showTags,
      showImages: state.showImages,
      showNotes: state.showNotes,
      showDataFields: state.showDataFields,
      showHelpText: state.showHelpText,
    }),
  },
);

export type PublishedFlowSummary = {
  publishedAt: string;
  hasSendComponent: boolean;
  hasVisiblePayComponent: boolean;
};

export type FlowSummaryOperations = {
  createdAt: string;
  actor: {
    firstName: string;
    lastName: string;
  };
};

export interface FlowSummary {
  id: string;
  name: string;
  slug: string;
  status: FlowStatus;
  updatedAt: string;
  summary: string;
  operations: FlowSummaryOperations[];
  publishedFlows: PublishedFlowSummary[];
  templatedFrom: string | null;
  isTemplate: boolean;
  isListedOnLPS: boolean;
  template: {
    team: {
      name: string;
    };
  };
}

interface CopiedPayload {
  rootId: string;
  nodes: { originalId: string; nodeData: Store.Node }[];
  isTemplate: boolean;
}

interface CutPayload {
  rootId: string;
  parent: string;
}

export interface Template {
  id: string;
  team: {
    name: string;
  };
  publishedFlows: {
    publishedAt: string;
    summary: string;
  }[];
}

export interface EditorStore extends Store.Store {
  cutNode: (id: NodeId, parent: NodeId) => void;
  getCutNode: () => CutPayload | null;
  addNode: (node: any, relationships?: Relationships) => void;
  archiveFlow: (
    flow: FlowSummary,
  ) => Promise<{ id: string; name: string } | void>;
  connect: (src: NodeId, tgt: NodeId, object?: any) => void;
  connectToFlow: (id: NodeId) => Promise<void>;
  disconnectFromFlow: () => void;
  cloneNode: (id: NodeId) => void;
  getClonedNodeId: () => string | null;
  copyNode: (id: NodeId) => void;
  getCopiedNode: () => { node: Store.Node; children: Store.Node[] };
  getFlows: (teamId: number) => Promise<FlowSummary[]>;
  isClone: (id: NodeId) => boolean;
  lastPublished: (flowId: string) => Promise<string>;
  lastPublisher: (flowId: string) => Promise<string>;
  lastPublishedDate?: string;
  setLastPublishedDate: (date: string) => void;
  isFlowPublished: boolean;
  isTemplate: boolean;
  isTemplatedFrom: boolean;
  template?: Template;
  makeUnique: (id: NodeId, parent?: NodeId) => void;
  moveNode: (
    id: NodeId,
    parent?: NodeId,
    toBefore?: NodeId,
    toParent?: NodeId,
  ) => void;
  pasteClonedNode: (toParent: NodeId, toBefore?: NodeId) => void;
  pasteCutNode: (toParent: NodeId, toBefore?: NodeId) => void;
  /**
   * Paste a new node from the clipboard
   * Generates new IDs for all new nodes
   * Recursively inserts all nested children
   */
  pasteNode: (toParent: NodeId, toBefore?: NodeId) => void;
  removeNode: (id: NodeId, parent: NodeId) => void;
  updateNode: (node: any, relationships?: any) => void;
  undoOperation: (ops: OT.Op[]) => void;
  orderedFlow?: OrderedFlow;
  setOrderedFlow: () => void;
  externalPortals: Record<string, { name: string; href: string }>;
  addExternalPortal: (portal: {
    id: string;
    name: string;
    href: string;
  }) => void;
  getURLForNode: (nodeId: string) => string;
  getFlowSchema: () => { nodes?: string[]; options?: string[] } | undefined;
  addFlowComment: (
    flowId: string,
    actorId: number,
    comment: string,
  ) => Promise<object>;
  deleteFlowComment: (commentId: number) => Promise<object>;
}

export const editorStore: StateCreator<
  SharedStore & EditorStore & UserStore & NavigationStore,
  [],
  [],
  EditorStore
> = (set, get) => ({
  addNode: (
    { id = undefined, type, data },
    { children = undefined, parent = ROOT_NODE_KEY, before = undefined } = {},
  ) => {
    const [, ops] = add(
      { id, type, data },
      { children, parent, before },
    )(get().flow);
    send(ops);
  },

  archiveFlow: async ({ id, slug }) => {
    try {
      const { data } = await client.mutate<{
        flow: { id: string; name: string };
      }>({
        mutation: gql`
          mutation updateFlow($id: uuid!, $slug: String!) {
            flow: update_flows_by_pk(
              pk_columns: { id: $id }
              _set: { deleted_at: "now()", status: offline, slug: $slug }
            ) {
              id
              name
            }
          }
        `,
        variables: {
          id,
          slug: `${slug}-archived`,
        },
      });

      return data?.flow;
    } catch (error) {
      throw Error("Failed to archive flow", { cause: error });
    }
  },

  connect: (src, tgt, { before = undefined } = {}) => {
    try {
      const [, ops] = clone(tgt, { toParent: src, toBefore: before })(
        get().flow,
      );
      send(ops);
    } catch (err: any) {
      alert(err.message);
    }
  },

  connectToFlow: async (id) => {
    doc = getFlowDoc(id);
    (window as any)["doc"] = doc;

    await subscribeToDoc(doc);

    const cloneStateFromShareDb = () => {
      const flow = JSON.parse(JSON.stringify(doc.data));
      set({ flow });
      get().initNavigationStore();
    };

    // set state from initial load
    cloneStateFromShareDb();

    // Templated flows require access to an ordered flow
    // Set this once upstream as it's an expensive operation
    const { isTemplatedFrom, setOrderedFlow } = get();
    if (isTemplatedFrom) setOrderedFlow();

    // local operation so we can assume that multiple ops will arrive
    // almost instantaneously so wait for 100ms of 'silence' before running
    const cloneStateFromLocalOps = debounce(cloneStateFromShareDb, 100);

    // remote operation, there might be network latency so wait for 0.5s
    const cloneStateFromRemoteOps = debounce(cloneStateFromShareDb, 500);

    doc.on("op", (_op: any, isLocalOp?: boolean) =>
      isLocalOp ? cloneStateFromLocalOps() : cloneStateFromRemoteOps(),
    );
  },

  disconnectFromFlow: () => {
    console.debug("[ShareDB] Disconnecting from flow:", doc?.id);
    // Clear local store cache of flow data
    set({ flow: {} });
    doc.destroy();
  },

  cloneNode(id) {
    try {
      localStorage.setItem("clonedNodeId", id);
    } finally {
      localStorage.removeItem("copiedNode");
      localStorage.removeItem("cutNode");
    }
  },

  getClonedNodeId: () => localStorage.getItem("clonedNodeId"),

  copyNode(id: string) {
    const { flow, isTemplate } = get();
    const rootNode = flow[id];
    if (!rootNode) return;

    const nodesToCopy: CopiedPayload["nodes"] = [];
    const visited = new Set<string>();

    // Recursively crawl all descendants, allowing us to "deep copy" a node and all its children
    const getDescendants = (nodeId: string) => {
      if (!nodeId || visited.has(nodeId)) return;

      visited.add(nodeId);
      const currentNode = flow[nodeId];
      if (!currentNode) return;

      nodesToCopy.push({ originalId: nodeId, nodeData: currentNode });

      currentNode.edges?.forEach((edgeId) => {
        getDescendants(edgeId);
      });
    };

    getDescendants(id);

    const payload: CopiedPayload = {
      rootId: id,
      nodes: nodesToCopy,
      isTemplate: isTemplate,
    };

    try {
      localStorage.setItem("copiedNode", JSON.stringify(payload));
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        alert(
          "Failed to copy. Please try copying a smaller branch of the graph",
        );
      } else {
        alert(`Failed to copy - unknown error. Details: ${error}`);
      }
    } finally {
      localStorage.removeItem("clonedNodeId");
      localStorage.removeItem("cutNode");
    }
  },

  cutNode(id: string, parent: string) {
    const { flow } = get();
    const rootNode = flow[id];
    if (!rootNode) return;

    const payload: CutPayload = {
      rootId: id,
      parent,
    };

    try {
      localStorage.setItem("cutNode", JSON.stringify(payload));
    } catch (error) {
      alert(`Failed to cut - unknown error. Details: ${error}`);
    } finally {
      localStorage.removeItem("copiedNode");
      localStorage.removeItem("clonedNodeId");
    }
  },

  getCopiedNode: () => {
    const payload = localStorage.getItem("copiedNode");
    if (!payload) return;

    return JSON.parse(payload);
  },

  getCutNode: () => {
    const payload = localStorage.getItem("cutNode");
    if (!payload) return;

    return JSON.parse(payload);
  },

  getFlows: async (teamId) => {
    const {
      data: { flows },
    } = await client.query<{ flows: FlowSummary[] }>({
      query: gql`
        query GetFlows($teamId: Int!) {
          flows(where: { team: { id: { _eq: $teamId } } }) {
            id
            name
            slug
            status
            summary
            updatedAt: updated_at
            isListedOnLPS: is_listed_on_lps
            operations(limit: 1, order_by: { created_at: desc }) {
              createdAt: created_at
              actor {
                firstName: first_name
                lastName: last_name
              }
            }
            templatedFrom: templated_from
            isTemplate: is_template
            template {
              team {
                id
                name
              }
            }
            publishedFlows: published_flows(
              order_by: { created_at: desc }
              limit: 1
            ) {
              publishedAt: created_at
              hasSendComponent: has_send_component
              hasVisiblePayComponent: has_pay_component
            }
          }
        }
      `,
      variables: {
        teamId,
      },
      // Flows are modified via REST API requests, not via the Apollo client
      // Always get an up to date list when showing the page
      fetchPolicy: "network-only",
    });

    return flows;
  },

  isClone: (id) => {
    return isClone(id, get().flow);
  },

  lastPublished: async (flowId: string) => {
    const { data } = await client.query({
      query: gql`
        query GetLastPublishedFlow($id: uuid!) {
          flow: flows_by_pk(id: $id) {
            published_flows(order_by: { created_at: desc }, limit: 1) {
              created_at
            }
          }
        }
      `,
      variables: {
        id: flowId,
      },
    });

    const lastPublishedDate = data.flow.published_flows[0].created_at;
    set({ lastPublishedDate });
    return lastPublishedDate;
  },

  lastPublishedDate: undefined,

  setLastPublishedDate: (date: string) => {
    set({ lastPublishedDate: date });
  },

  lastPublisher: async (flowId: string) => {
    const { data } = await client.query({
      query: gql`
        query GetLastPublisher($id: uuid!) {
          flow: flows_by_pk(id: $id) {
            publishedFlows: published_flows(
              order_by: { created_at: desc }
              limit: 1
            ) {
              user {
                firstName: first_name
                lastName: last_name
              }
            }
          }
        }
      `,
      variables: {
        id: flowId,
      },
    });

    const { firstName, lastName } = data.flow.publishedFlows[0].user;

    return firstName.concat(" ", lastName);
  },

  isFlowPublished: false,

  isTemplate: false,

  isTemplatedFrom: false,

  template: undefined,

  makeUnique: (id, parent) => {
    const [, ops] = makeUnique(id, parent)(get().flow);
    send(ops);
  },

  moveNode(
    id: string,
    parent = undefined,
    toBefore = undefined,
    toParent = undefined,
  ) {
    try {
      const [, ops] = move(id, parent as unknown as string, {
        toParent,
        toBefore,
      })(get().flow);
      send(ops);
    } catch (err: any) {
      alert(err.message);
    }
  },

  pasteClonedNode(toParent, toBefore) {
    try {
      const id = get().getClonedNodeId();
      if (id) {
        const [, ops] = clone(id, { toParent, toBefore })(get().flow);
        send(ops);
      }
    } catch (err) {
      alert((err as Error).message);
    }
  },

  pasteCutNode(toParent, toBefore) {
    const cutString = localStorage.getItem("cutNode");
    if (!cutString) return;

    try {
      const { rootId, parent }: CutPayload = JSON.parse(cutString);
      if (rootId === toBefore && parent === toParent) {
        throw new Error("Cannot move before itself");
      }
      const [, ops] = move(rootId, parent, {
        toParent,
        toBefore,
      })(get().flow);
      send(ops);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      localStorage.removeItem("cutNode");
    }
  },

  pasteNode(parent: string, before?: string) {
    const copiedString = localStorage.getItem("copiedNode");
    if (!copiedString) return;

    try {
      const {
        rootId,
        nodes: copiedNodes,
        isTemplate: copiedFromTemplate,
      }: CopiedPayload = JSON.parse(copiedString);
      if (!copiedNodes || copiedNodes.length === 0) return;

      // Keep a map of originalId: newId allowing us to insert unique nodes and maintain our edge relationships
      const idMap = new Map<string, string>();
      const newNodes: { [id: string]: Store.Node } = {};
      let newRootId: string | null = null;

      // 1. First pass: Create new nodes and build the ID map
      copiedNodes.forEach(({ originalId, nodeData }) => {
        const newId = uniqueId();
        idMap.set(originalId, newId);

        // If copied from a source template and now pasting to a non-source template, remove templated node props
        const { isTemplate: pastingToTemplate } = get();
        if (copiedFromTemplate && !pastingToTemplate) {
          delete nodeData.data?.["isTemplatedNode"];
          delete nodeData.data?.["templatedNodeInstructions"];
          delete nodeData.data?.["areTemplatedNodeInstructionsRequired"];
        }

        newNodes[newId] = structuredClone(nodeData);

        if (originalId === rootId) {
          newRootId = newId;
        }
      });

      if (!newRootId) {
        throw new Error("Root node for pasting could not be found.");
      }

      // 2. Second pass: Re-link edges using the ID map
      Object.values(newNodes).forEach((node) => {
        if (node.edges && node.edges.length > 0) {
          node.edges = node.edges
            .map((oldEdgeId) => idMap.get(oldEdgeId))
            .filter((id): id is string => !!id);
        }
      });

      // 3. Rebuild the graph structure from our flat node list
      const { id, children, ...nodeData } = buildGraphFromNodes(
        newRootId,
        newNodes,
      );

      // 4. Finally, insert the original pasted node, and all its nested children
      get().addNode({ id, ...nodeData }, { parent, before, children });
    } catch (err) {
      alert((err as Error).message);
    }
  },

  removeNode: (id, parent) => {
    const [, ops] = remove(id, parent)(get().flow);
    send(ops);
  },

  updateNode: ({ id, data }, { children = undefined } = {}) => {
    const [, ops] = update(id, data, {
      children,
      removeKeyIfMissing: true,
    })(get().flow);
    send(ops);
  },

  undoOperation: (ops: OT.Op[]) => {
    const inverseOps: OT.Op[] = type.invert(ops);
    send(inverseOps);
  },

  orderedFlow: undefined,

  setOrderedFlow: () => {
    const flow = get().flow as FlowGraph;
    const orderedFlow = sortFlow(flow);
    set({ orderedFlow });
  },

  externalPortals: {},

  addExternalPortal: ({ id, name, href }) => {
    const externalPortals = get().externalPortals;
    externalPortals[id] = { name, href };
    set({ externalPortals });
  },

  getURLForNode: (nodeId) => {
    const { orderedFlow: flow, flowSlug, teamSlug } = get();
    if (!flow) throw Error("Missing ordered flow!");

    const path = getPathForNode({ nodeId, flow });
    const internalPortals = path.filter(
      ({ type }) => type === TYPES.InternalPortal,
    );
    const [node, parent, grandparent] = path;

    // Construct the internal portal path if applicable
    const mapPortalsToURLPath = (portals: ReturnType<typeof getPathForNode>) =>
      portals
        .reverse()
        .map(({ id }) => id)
        .join(",");

    const portalPath = internalPortals.length
      ? "," + mapPortalsToURLPath(internalPortals)
      : "";

    // Determine node path based on the node type
    const nodePath =
      node.type === TYPES.Answer
        ? `nodes/${grandparent.id}/nodes/${parent.id}/edit#${node.id}`
        : `nodes/${parent.id}/nodes/${node.id}/edit`;

    const urlPath = `/${teamSlug}/${flowSlug}${portalPath}/${nodePath}`;
    return urlPath;
  },

  getFlowSchema: () => {
    const { flow } = get();
    if (!flow) return;

    const nodes: Set<string> = new Set();
    const options: Set<string> = new Set();

    Object.entries(flow).map(([_id, node]) => {
      if (node.data?.fn) {
        // Exclude Filter fn value as not exposed to editors
        if (node.data?.fn !== "flag") nodes.add(node.data.fn);
      }

      if (node.data?.val) {
        // Exclude Filter Option flag values as not exposed to editors
        const flagVals = flatFlags.map((flag) => flag.value);
        if (!flagVals.includes(node.data.val)) options.add(node.data.val);
      }
    });

    return {
      nodes: Array.from(nodes).sort(),
      options: Array.from(options).sort(),
    };
  },

  addFlowComment: async (flowId, actorId, comment) => {
    const response = await client.mutate({
      mutation: gql`
        mutation InsertFlowComment(
          $flowId: uuid!
          $actorId: Int!
          $comment: String!
        ) {
          insert_flow_comments_one(
            object: { flow_id: $flowId, actor_id: $actorId, comment: $comment }
          ) {
            id
          }
        }
      `,
      variables: {
        flowId,
        actorId,
        comment,
      },
    });
    return response;
  },

  deleteFlowComment: async (commentId) => {
    const response = await client.mutate({
      mutation: gql`
        mutation DeleteFlowComment($id: Int!) {
          delete_flow_comments_by_pk(id: $id) {
            id
          }
        }
      `,
      variables: {
        id: commentId,
      },
    });
    return response;
  },
});
