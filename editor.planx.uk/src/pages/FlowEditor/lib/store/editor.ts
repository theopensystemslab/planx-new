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
import axios from "axios";
import { client } from "lib/graphql";
import navigation from "lib/navigation";
import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import omitBy from "lodash/omitBy";
import { type } from "ot-json0";
import { ContextMenuPosition, ContextMenuSource } from "pages/FlowEditor/components/Flow/components/ContextMenu";
import { NewFlow } from "pages/Team/components/AddFlow/types";
import type { StateCreator } from "zustand";
import { persist } from "zustand/middleware";

import { FlowLayout } from "../../components/Flow";
import { connectToDB, getFlowConnection } from "./../sharedb";
import { type Store } from ".";
import type { SharedStore } from "./shared";
import { UserStore } from "./user";

let doc: any;

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
  flowCardView: FlowCardView;
  setFlowCardView: (view: FlowCardView) => void;
  showTags: boolean;
  toggleShowTags: () => void;
  showImages: boolean;
  toggleShowImages: () => void;
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

    flowCardView: "grid",

    setFlowCardView: (view: FlowCardView) => {
      set({ flowCardView: view });
    },

    showTags: true,

    toggleShowTags: () => set({ showTags: !get().showTags }),

    showImages: false,

    toggleShowImages: () => set({ showImages: !get().showImages }),

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
      showDataFields: state.showDataFields,
      showHelpText: state.showHelpText,
    }),
  }
);

interface PublishFlowResponse {
  alteredNodes: Store.Node[];
  message: string;
}

export type PublishedFlowSummary = {
  publishedAt: string;
  hasSendComponent: boolean;
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
  template: {
    team: {
      name: string;
    };
  };
}

interface CopiedPayload {
  rootId: string;
  nodes: { originalId: string; nodeData: Store.Node }[];
}

export interface EditorStore extends Store.Store {
  addNode: (node: any, relationships?: Relationships) => void;
  archiveFlow: (
    flow: FlowSummary,
  ) => Promise<{ id: string; name: string } | void>;
  connect: (src: NodeId, tgt: NodeId, object?: any) => void;
  connectTo: (id: NodeId) => Promise<void>;
  cloneNode: (id: NodeId) => void;
  getClonedNodeId: () => string | null;
  copyNode: (id: NodeId) => void;
  getCopiedNode: () => { node: Store.Node; children: Store.Node[] };
  createFlow: (newFlow: NewFlow) => Promise<string>;
  createFlowFromTemplate: (newFlow: NewFlow) => Promise<string>;
  createFlowFromCopy: (newFlow: NewFlow) => Promise<string>;
  validateAndDiffFlow: (flowId: string) => Promise<any>;
  getFlows: (teamId: number) => Promise<FlowSummary[]>;
  isClone: (id: NodeId) => boolean;
  lastPublished: (flowId: string) => Promise<string>;
  lastPublisher: (flowId: string) => Promise<string>;
  lastPublishedDate?: string;
  setLastPublishedDate: (date: string) => void;
  isFlowPublished: boolean;
  isTemplate: boolean;
  isTemplatedFrom: boolean;
  template?: {
    id: string;
    team: {
      name: string;
    };
    publishedFlows: {
      publishedAt: string;
      summary: string;
    }[];
  };
  makeUnique: (id: NodeId, parent?: NodeId) => void;
  moveFlow: (
    flowId: string,
    teamSlug: string,
    flowName: string,
  ) => Promise<any>;
  moveNode: (
    id: NodeId,
    parent?: NodeId,
    toBefore?: NodeId,
    toParent?: NodeId,
  ) => void;
  pasteClonedNode: (toParent: NodeId, toBefore?: NodeId) => void;
  /**
   * Paste a new node from the clipboard
   * Generates new IDs for all new nodes
   * Recursively inserts all nested children
   */
  pasteNode: (toParent: NodeId, toBefore?: NodeId) => void;
  publishFlow: (
    flowId: string,
    summary: string,
    templatedFlowIds?: string[],
  ) => Promise<PublishFlowResponse>;
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
  SharedStore & EditorStore & UserStore,
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

  connectTo: async (id) => {
    console.log("connecting to", id, get().id);

    doc = getFlowConnection(id);
    (window as any)["doc"] = doc;

    await connectToDB(doc);

    const cloneStateFromShareDb = () => {
      const flow = JSON.parse(JSON.stringify(doc.data));
      get().setFlow({
        id,
        flow,
        flowSlug: get().flowSlug,
        flowName: get().flowName,
      });
    };

    // set state from initial load
    cloneStateFromShareDb();

    // local operation so we can assume that multiple ops will arrive
    // almost instantaneously so wait for 100ms of 'silence' before running
    const cloneStateFromLocalOps = debounce(cloneStateFromShareDb, 100);

    // remote operation, there might be network latency so wait for 0.5s
    const cloneStateFromRemoteOps = debounce(cloneStateFromShareDb, 500);

    doc.on("op", (_op: any, isLocalOp?: boolean) =>
      isLocalOp ? cloneStateFromLocalOps() : cloneStateFromRemoteOps(),
    );
  },

  cloneNode(id) {
    localStorage.removeItem("copiedNode");
    localStorage.setItem("clonedNodeId", id);
  },

  getClonedNodeId: () => localStorage.getItem("clonedNodeId"),

  copyNode(id: string) {
    const { flow } = get();
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
    };
    
    try {
      localStorage.setItem("copiedNode", JSON.stringify(payload));
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        alert("Failed to copy. Please try copying a smaller branch of the graph");
      } else {
        alert(`Failed to copy - unknown error. Details: ${error}`);
      }
    }
  },

  getCopiedNode: () => {
    const payload = localStorage.getItem("copiedNode");
    if (!payload) return;

    return JSON.parse(payload);
  },

  createFlow: async (newFlow) => {
    const token = get().jwt;

    const response = await axios.post<{ id: string }>(
      `${import.meta.env.VITE_APP_API_URL}/flows/create`,
      newFlow,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.id;
  },

  createFlowFromTemplate: async ({ name, slug, sourceId, teamId }) => {
    const token = get().jwt;

    const response = await axios.post<{ id: string }>(
      `${
        import.meta.env.VITE_APP_API_URL
      }/flows/create-from-template/${sourceId}`,
      {
        teamId,
        name,
        slug,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    set({ isTemplatedFrom: true });

    return response.data.id;
  },

  createFlowFromCopy: async ({ name, slug, sourceId, teamId }) => {
    const token = get().jwt;

    const response = await axios.post<{ id: string }>(
      `${import.meta.env.VITE_APP_API_URL}/flows/${sourceId}/copy/`,
      {
        teamId,
        name,
        slug,
        insert: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.id;
  },

  validateAndDiffFlow(flowId: string) {
    const token = get().jwt;

    return axios.post(
      `${import.meta.env.VITE_APP_API_URL}/flows/${flowId}/diff`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  getFlows: async (teamId) => {
    client.cache.reset();
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
                name
              }
            }
            publishedFlows: published_flows(
              order_by: { created_at: desc }
              limit: 1
            ) {
              publishedAt: created_at
              hasSendComponent: has_send_component
            }
          }
        }
      `,
      variables: {
        teamId,
      },
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
            published_flows(order_by: { created_at: desc }, limit: 1) {
              user {
                first_name
                last_name
              }
            }
          }
        }
      `,
      variables: {
        id: flowId,
      },
    });

    const { first_name, last_name } = data.flow.published_flows[0].user;

    return first_name.concat(" ", last_name);
  },

  isFlowPublished: false,

  isTemplate: false,

  isTemplatedFrom: false,

  template: undefined,

  makeUnique: (id, parent) => {
    const [, ops] = makeUnique(id, parent)(get().flow);
    send(ops);
  },

  moveFlow(flowId: string, teamSlug: string, flowName: string) {
    const valid = get().canUserEditTeam(teamSlug);
    if (!valid) {
      alert(
        `You do not have permission to move this flow into ${teamSlug}, try again`,
      );
      return Promise.resolve();
    }

    const token = get().jwt;

    return axios
      .post(
        `${import.meta.env.VITE_APP_API_URL}/flows/${flowId}/move/${teamSlug}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => alert(res?.data?.message))
      .catch(({ response }) => {
        const { data } = response;
        if (data.error.toLowerCase().includes("uniqueness violation")) {
          alert(
            `Failed to move this flow. ${teamSlug} already has a flow with name '${flowName}'. Rename the flow and try again`,
          );
        } else {
          alert(
            "Failed to move this flow. Make sure you're entering a valid team name and try again",
          );
        }
      });
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

  pasteNode(parent: string, before?: string) {
    const copiedString = localStorage.getItem("copiedNode");
    if (!copiedString) return;

    try {
      const { rootId, nodes: copiedNodes }: CopiedPayload =
        JSON.parse(copiedString);
      if (!copiedNodes || copiedNodes.length === 0) return;

      // Keep a map of originalId: newId allowing us to insert unique nodes and maintain our edge relationships
      const idMap = new Map<string, string>();
      const newNodes: { [id: string]: Store.Node } = {};
      let newRootId: string | null = null;

      // 1. First pass: Create new nodes and build the ID map
      copiedNodes.forEach(({ originalId, nodeData }) => {
        const newId = uniqueId();
        idMap.set(originalId, newId);
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
        newNodes
      );

      // 4. Finally, insert the original pasted node, and all its nested children
      get().addNode(
        { id, ...nodeData },
        { parent, before, children }
      );
    } catch (err) {
      alert((err as Error).message);
    }
  },

  async publishFlow(
    flowId: string,
    summary: string,
    templatedFlowIds?: string[],
  ) {
    const token = get().jwt;

    const urlWithParams = (url: string, params: any) =>
      [url, new URLSearchParams(omitBy(params, isEmpty))]
        .filter(Boolean)
        .join("?");

    const { data } = await axios.post<PublishFlowResponse>(
      urlWithParams(
        `${import.meta.env.VITE_APP_API_URL}/flows/${flowId}/publish`,
        { summary, templatedFlowIds },
      ),
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    set({ isFlowPublished: true });

    return data;
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
        ? `nodes/${grandparent.id}/nodes/${parent.id}/edit`
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
