import {
  ComponentType as TYPES,
  NodeId,
} from "@opensystemslab/planx-core/types";
import { enablePatches, produceWithPatches } from "immer";
import { isEqual } from "lodash";
import difference from "lodash/difference";
import trim from "lodash/trim";
import zip from "lodash/zip";
import { customAlphabet } from "nanoid-good";
import en from "nanoid-good/locale/en";
import { Store } from "pages/FlowEditor/lib/store";

import { ImmerJSONPatch, OT } from "./types";

enablePatches();

interface Node {
  id?: string;
  data?: object;
  edges?: Array<string>;
  type?: number;
}

export type Child = Record<string, any>;

export type Graph = Record<string, Node>;

export const ROOT_NODE_KEY = "_root";

export const uniqueId = customAlphabet(en)(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  10,
);

const numberOfEdgesTo = (id: string, graph: Graph): number =>
  Object.values(graph).filter(({ edges = [] }) => edges.includes(id)).length;

export const isClone = (id: string, graph: Graph): boolean => {
  let count = 0;
  for (const node of Object.values(graph)) {
    if (node.edges?.includes(id)) {
      count++;
      // Return early once we know the node is a clone, no need to iterate over entire graph
      if (count > 1) return true;
    }
  }

  return false;
};

const isSomething = (x: any): boolean =>
  x !== null && x !== undefined && x !== "";

const isSectionNodeType = (id: string, graph: Graph): boolean =>
  graph[id]?.type === TYPES.Section;

const isExternalPortalNodeType = (id: string, graph: Graph): boolean =>
  graph[id]?.type === TYPES.ExternalPortal;

// Sections can only be placed directly on the center of the graph, or within the first-level of a folder that is on the center of the graph
const isValidSectionPosition = (parent: string, graph: Graph): boolean =>
  parent === ROOT_NODE_KEY ||
  (graph[parent]?.type === TYPES.InternalPortal &&
    Boolean(graph[ROOT_NODE_KEY]?.edges?.includes(parent)));

const sanitize = (x: any) => {
  if ((x && typeof x === "string") || x instanceof String) {
    return trim(x.replace(/[\u200B-\u200D\uFEFF↵]/g, ""));
  } else if ((x && typeof x === "object") || x instanceof Object) {
    return Object.entries(x).reduce((acc, [k, v]) => {
      v = sanitize(v);
      if (
        !isSomething(v) ||
        (typeof v === "object" && Object.keys(v as object).length === 0)
      ) {
        delete acc[k];
      }
      return acc;
    }, x);
  } else {
    return x;
  }
};

const convertPatchesToOps = (
  patches: ImmerJSONPatch[],
  inversePatches: ImmerJSONPatch[],
): Array<OT.Op> =>
  (zip(patches, inversePatches) as [ImmerJSONPatch, ImmerJSONPatch][]).map(
    ([fwd, bak]) => {
      const op: any = {
        p: fwd.path,
      };

      if (fwd.path[1] === "edges" && fwd.path.length > 2) {
        if (fwd.op === "add") {
          op.li = fwd.value;
        } else if (fwd.op === "replace") {
          op.ld = bak.value;
          if (bak.op === "replace") {
            op.li = fwd.value;
          } else if (bak.op === "add") {
            op.p = bak.path;
          }
        }
      } else {
        if (fwd.op === "add") {
          op.oi = fwd.value;
        } else if (fwd.op === "remove") {
          if (bak.op === "add") {
            op.od = bak.value;
          }
        } else if (fwd.op === "replace") {
          if (bak.op === "replace") {
            op.oi = fwd.value;
            op.od = bak.value;
          }
        }
      }
      return op;
    },
  );

const wrap = (
  graph: Graph,
  fn: (draft: Graph) => void,
): [Graph, Array<OT.Op>] => {
  const [result, patches, inversePatches] = produceWithPatches(graph, fn);
  return [result, convertPatchesToOps(patches, inversePatches)];
};

const isCyclicUtil = (
  src: string,
  visited: Record<string, boolean>,
  recStack: Record<string, boolean>,
  graph: Graph,
): boolean => {
  if (recStack[src]) return true;
  else if (visited[src]) return false;

  visited[src] = true;
  recStack[src] = true;

  const { edges = [] } = graph[src];
  for (const tgt of edges) {
    if (isCyclicUtil(tgt, visited, recStack, graph)) return true;
  }
  recStack[src] = false;
  return false;
};

const isCyclic = (graph: Graph): boolean => {
  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};

  Object.keys(graph).forEach((key) => {
    visited[key] = false;
    recStack[key] = false;
  });

  for (const key of Object.keys(visited)) {
    if (isCyclicUtil(key, visited, recStack, graph)) return true;
  }
  return false;
};

const _add = (
  draft: Graph,
  {
    id = uniqueId(),
    ...nodeData
  }: { id?: string; type?: number; data?: object },
  {
    children = [],
    parent,
    before = undefined,
  }: { children?: Child[]; parent: string; before?: string },
) => {
  if (!draft[parent]) throw new Error("parent not found");

  const parentNode = draft[parent];

  parentNode.edges = parentNode.edges || [];

  draft[id] = sanitize(nodeData);

  if (isSectionNodeType(id, draft) && !isValidSectionPosition(parent, draft)) {
    alert(
      "cannot add sections on branches, must be on center of main graph. close this window & try again",
    );
    throw new Error("cannot add sections on branches");
  }

  if (before) {
    const idx = parentNode.edges.indexOf(before);
    if (idx >= 0) {
      parentNode.edges.splice(idx, 0, id);
    } else throw new Error("before not found");
  } else {
    parentNode.edges.push(id);
  }

  children?.forEach((child) => {
    const { children: grandChildren = [], ...childNode } = child;
    _add(draft, childNode, { children: grandChildren, parent: id });
  });
};

type NodeDataWithId = { id?: string; type?: number; data?: object };

export type Relationships = {
  children?: Child[];
  parent?: NodeId;
  /**
   * NodeId of the older sibling of this node
   * Used to insert a new node in the correct location within it's parents' edges
   */
  before?: NodeId;
  self?: NodeId;
};

export const add =
  (
    { id = uniqueId(), ...nodeData }: NodeDataWithId,
    {
      children = [],
      parent = ROOT_NODE_KEY,
      before = undefined,
    }: Relationships = {},
  ) =>
  (graph: Graph = {}): [Graph, Array<OT.Op>] =>
    wrap(graph, (draft) => {
      draft[ROOT_NODE_KEY] = draft[ROOT_NODE_KEY] || {};
      _add(draft, { id, ...nodeData }, { children, parent, before });
    });

export const clone =
  (
    id: string,
    {
      toParent = ROOT_NODE_KEY,
      toBefore = undefined,
    }: { toParent?: string; toBefore?: string } = {},
  ) =>
  (graph: Graph = {}): [Graph, Array<OT.Op>] =>
    wrap(graph, (draft) => {
      if (!draft[id]) throw new Error("id not found");
      else if (!draft[toParent]) throw new Error("toParent not found");
      else if (draft[toParent].edges?.includes(id))
        throw new Error("cannot clone to same parent");
      else if (isSectionNodeType(id, graph))
        throw new Error("cannot clone sections");
      else if (isExternalPortalNodeType(id, graph))
        throw new Error("cannot clone nested flows");

      const toParentNode = draft[toParent];

      toParentNode.edges = toParentNode.edges || [];

      if (toBefore) {
        const idx = toParentNode.edges.indexOf(toBefore);
        if (idx >= 0) {
          toParentNode.edges.splice(idx, 0, id);
        } else {
          throw new Error("toBefore does not exist in toParent");
        }
      } else {
        toParentNode.edges.push(id);
      }

      if (isCyclic(draft)) throw new Error("cannot create cycle in graph");
    });

export const move =
  (
    id: string,
    parent: string,
    {
      toParent = undefined,
      toBefore = undefined,
    }: { toParent?: string; toBefore?: string } = {},
  ) =>
  (graph: Graph = {}): [Graph, Array<OT.Op>] =>
    wrap(graph, (draft) => {
      toParent = toParent || parent;

      if (!draft[id]) throw new Error("id not found");
      else if (!draft[parent]) throw new Error("parent not found");
      else if (!draft[toParent]) throw new Error("toParent not found");
      else if (parent !== toParent && draft[toParent].edges?.includes(id)) {
        throw new Error("cannot move to same parent");
      }

      const parentNode = draft[parent];
      parentNode.edges = parentNode.edges || [];

      if (
        isSectionNodeType(id, graph) &&
        !isValidSectionPosition(toParent, graph)
      )
        throw new Error(
          "cannot move sections onto branches, must be on center of graph",
        );

      let idx = parentNode.edges.indexOf(id);
      if (idx >= 0) {
        if (parentNode.edges.length === 1) delete draft[parent].edges;
        else parentNode.edges.splice(idx, 1);
      } else throw new Error("parent does not connect to id");

      const toParentNode = draft[toParent];
      toParentNode.edges = toParentNode.edges || [];

      if (toBefore) {
        idx = toParentNode.edges.indexOf(toBefore);
        if (idx >= 0) {
          toParentNode.edges.splice(idx, 0, id);
        } else {
          throw new Error("toBefore does not exist in toParent");
        }
      } else {
        toParentNode.edges.push(id);
      }

      if (isCyclic(draft)) throw new Error("cannot create cycle in graph");
    });

const _remove = (draft: Graph, id: string, parent: string) => {
  if (!draft[id]) throw new Error("id not found");
  else if (!draft[parent]) throw new Error("parent not found");

  const parentNode = draft[parent];
  parentNode.edges = parentNode.edges || [];

  const idx = parentNode.edges.indexOf(id);
  if (idx >= 0) {
    if (parent !== ROOT_NODE_KEY && parentNode.edges.length === 1)
      delete parentNode.edges;
    else parentNode.edges.splice(idx, 1);
  } else {
    throw new Error("not found in parent");
  }

  if (parent !== ROOT_NODE_KEY && Object.keys(draft[parent]).length === 0)
    delete draft[parent];

  if (numberOfEdgesTo(id, draft) === 0) {
    const { edges } = draft[id];
    if (edges) {
      // must be a copy, for some reason?
      [...edges].forEach((child) => {
        _remove(draft, child, id);
      });
    }
    delete draft[id];
  }
};

export const remove =
  (id: string, parent: string) =>
  (graph: Graph = {}): [Graph, Array<OT.Op>] =>
    wrap(graph, (draft) => {
      _remove(draft, id, parent);
    });

const _update = (
  draft: Graph,
  id: string,
  newData: object,
  {
    children = undefined,
    removeKeyIfMissing = false,
  }: {
    children?: Child[];
    removeKeyIfMissing?: boolean;
  } = {},
) => {
  const node = draft[id];

  if (!node) throw new Error("id not found");

  if (removeKeyIfMissing) {
    if (children) {
      children = children.map((c) => ({ ...c, id: c.id || uniqueId() }));
      const newChildIds = children.map((c) => c.id);
      if (
        node.edges &&
        newChildIds.toString() !== [...(node.edges || [])].toString()
      ) {
        const addedChildrenIds = difference(newChildIds, node.edges);
        addedChildrenIds.forEach((cId) =>
          _add(
            draft,
            (children as any).find((c: Child) => c.id === cId),
            { parent: id },
          ),
        );

        const removedChildrenIds = difference(
          node.edges,
          newChildIds,
        ) as string[];
        removedChildrenIds.forEach((childId) => _remove(draft, childId, id));

        if (node.edges) {
          if (newChildIds.length === 0) delete node.edges;
          else {
            node.edges = newChildIds as string[];
          }
        }
      }

      children.forEach(({ id: childId, ...newData }) => {
        if (draft[childId]) {
          _update(draft, childId as string, newData.data || newData, {
            removeKeyIfMissing,
          });
        } else {
          _add(draft, { id: childId as string, ...newData }, { parent: id });
        }
      });
    }

    if (node.data) {
      // if a value exists in the current data, but is null, undefined or "" in the
      // new data then remove it
      Object.entries(node.data).forEach(([k, v]: [string, any]) => {
        if (v !== null && v !== undefined && !isSomething((newData as any)[k]))
          delete (node as any).data[k];
      });
    }
  }

  if (node.data) {
    Object.entries(newData).reduce((existingData, [k, v]) => {
      v = sanitize(v);

      // eslint-disable-next-line no-prototype-builtins
      const isRemoved = !isSomething(v) && existingData.hasOwnProperty(k);
      const isUpdated = isSomething(v) && !isEqual(v, (existingData as any)[k]);

      if (isRemoved) delete (existingData as any)[k];
      if (isUpdated) (existingData as any)[k] = v;

      return existingData;
    }, node.data);
  } else {
    node.data = newData;
  }
  if (Object.keys(node.data).length === 0) delete node.data;
};

export const update =
  (
    id: string,
    newData: object,
    {
      children = undefined,
      removeKeyIfMissing = false,
    }: {
      children?: Child[];
      removeKeyIfMissing?: boolean;
    } = {},
  ) =>
  (graph: Graph = {}): [Graph, Array<OT.Op>] =>
    wrap(graph, (draft) => {
      _update(draft, id, newData, {
        children,
        removeKeyIfMissing,
      });
    });

export const makeUnique =
  (id: string, parent: string = ROOT_NODE_KEY, { idFn = uniqueId } = {}) =>
  (graph: Graph = {}): [Graph, Array<OT.Op>] =>
    wrap(graph, (draft) => {
      const _makeUnique = (
        id: string,
        parent: string,
        { idFn }: { idFn: () => string },
        firstCall: boolean,
      ) => {
        const { edges = [], ...nodeData } = draft[id];
        if (!firstCall && isClone(id, draft)) {
          const node = draft[parent];
          node.edges = node.edges || [];
          node.edges.push(id);
        } else {
          const newId = idFn();
          const relationships = {
            parent,
            // Only define a `before` value when adding the original node, not its edges
            ...(firstCall && { before: id }),
          };
          _add(draft, { id: newId, ...nodeData }, relationships);
          edges.forEach((tgt: string) => {
            _makeUnique(tgt, newId, { idFn }, false);
          });
        }
      };

      // Insert a new, unique, node (and all children)
      _makeUnique(id, parent, { idFn }, true);

      // Remove original cloned node (and all children)
      _remove(draft, id, parent);
    });

/**
 * Depth first sort of graph
 * XXX: Clones will only appear in first graph position
 */
const dfs = (graph: Graph) => (startId: string) => {
  const visited = new Set<string>();
  const stack = [startId];

  while (stack.length > 0) {
    const id = stack.pop()!;

    if (visited.has(id)) continue;
    visited.add(id);

    const node = graph[id];
    if (!node?.edges) continue;

    // Node edges are traversed left-to-right
    // We process our stack in last-in, first-out order
    // This means we need to iterate backwards over edges
    for (let i = node.edges.length - 1; i >= 0; i--) {
      const childId = node.edges[i];
      if (!visited.has(childId)) {
        stack.push(childId);
      }
    }
  }

  return [...visited];
};

const memoizedNodesIdsByGraph = new WeakMap<Graph, string[]>();

export const sortIdsDepthFirst =
  (graph: Graph) =>
  (nodeIds: Set<string>): Array<string> => {
    const allNodeIdsSorted = memoizedNodesIdsByGraph.has(graph)
      ? memoizedNodesIdsByGraph.get(graph)!
      : dfs(graph)(ROOT_NODE_KEY);

    memoizedNodesIdsByGraph.set(graph, allNodeIdsSorted);

    return Array.from(nodeIds).sort(
      (a, b) => allNodeIdsSorted.indexOf(a) - allNodeIdsSorted.indexOf(b),
    );
  };

/**
 * Translates a list of ShareDB operations into a human-readable change summary.
 *   See https://github.com/ottypes/json0?tab=readme-ov-file#summary-of-operations
 */
export const formatOps = (graph: Graph, ops: Array<OT.Op>): string[] => {
  const output: string[] = [];

  // Only show full change description for simple props, omit complex or long ones like `moreInfo`, `fileTypes`, etc
  const allowProps: string[] = ["title", "text", "fn", "val"];

  // Create a simple lookup to overwrite most common component props to a more human-readable name
  const propsMap: Record<string, string> = {
    fn: "data field",
    val: "data field",
    info: `help text ("Why it matters")`,
    howMeasured: `help text ("How is it defined?")`,
    policyRef: `help text source links`,
    definitionImg: `help text image`,
  };

  const getComponentName = (defaultName: string, nodeType?: number): string => {
    if (nodeType) {
      // Map legacy portal node types to updated user-facing names
      if (nodeType === TYPES.InternalPortal) {
        return "Folder";
      } else if (nodeType === TYPES.ExternalPortal) {
        return "Flow";
      } else {
        return TYPES[nodeType];
      }
    } else {
      // If node type is undefined, fallback to default name
      return defaultName;
    }
  };

  // Updating a node or its properties (update = delete + insert)
  const handleUpdate = (node: Node, op: OT.Object.Replace) => {
    if (op.od?.type && op.oi?.type) {
      output.push(
        `Replaced ${getComponentName("node", op.od.type)} "${
          op.od.data?.title ||
          op.od.data?.text ||
          op.od.data?.content ||
          op.od.data?.fn ||
          op.od.data?.val ||
          op.od.data?.flowId
        }" with ${getComponentName("node", op.oi.type)} "${
          op.oi.data?.title ||
          op.oi.data?.text ||
          op.oi.data?.content ||
          op.oi.data?.fn ||
          op.oi.data?.val ||
          op.od.data?.flowId
        }"`,
      );
    } else if (op.p.includes("data")) {
      const prop = op.p?.[2] as string;
      if (allowProps.includes(prop)) {
        output.push(
          `Updated ${getComponentName("node", node?.type)} ${
            propsMap[prop] || prop
          } from "${op.od}" to "${op.oi}"`,
        );
      } else {
        output.push(
          `Updated ${getComponentName("node", node?.type)} ${
            propsMap[prop] || prop
          }`,
        );
      }
    } else if (op.p.includes("edges")) {
      output.push(
        `Updated order of ${getComponentName("graph", node?.type)} edges`,
      );
    }
  };

  // Updating the _root list (update = list insert or list delete)
  const handleRootUpdate = (op: OT.Array.Replace) => {
    if (op.p.includes("edges") && op.p.includes("_root")) {
      output.push(`Re-ordered the root graph`);
    } else if (op.p.includes("edges")) {
      output.push(`Moved node`);
    }
  };

  // Adding (inserting) a node or its properties
  const handleAdd = (node: Node, op: OT.Object.Add) => {
    if (op.oi?.type) {
      output.push(
        `Added ${getComponentName("node", op.oi.type)} "${
          op.oi.data?.title ||
          op.oi.data?.text ||
          op.oi.data?.content ||
          op.oi.data?.fn ||
          op.oi.data?.flowId
        }"`,
      );
    } else if (op.p.includes("data")) {
      const prop = op.p?.[2] as string;
      if (allowProps.includes(prop)) {
        output.push(
          `Added ${getComponentName("node", node?.type)} ${
            propsMap[prop] || prop
          } "${op.oi}"`,
        );
      } else {
        output.push(
          `Added ${getComponentName("node", node?.type)} ${
            propsMap[prop] || prop
          }`,
        );
      }
    } else if (op.p.includes("edges")) {
      const node = graph[op.oi?.[0]];
      output.push(`Added ${getComponentName("node", node?.type)} to branch`);
    }
  };

  // Removing (deleting) a node or its properties
  const handleRemove = (node: Node, op: OT.Object.Remove) => {
    if (op.od?.type) {
      output.push(
        `Removed ${getComponentName("node", op.od.type)} "${
          op.od.data?.title ||
          op.od.data?.text ||
          op.od.data?.content ||
          op.od.data?.fn ||
          op.od.data?.flowId
        }"`,
      );
    } else if (op.p.includes("data")) {
      const prop = op.p?.[2] as string;
      if (allowProps.includes(prop)) {
        output.push(
          `Removed ${getComponentName("node", node?.type)} ${
            propsMap[prop] || prop
          } "${op.od}"`,
        );
      } else {
        output.push(
          `Removed ${getComponentName("node", node?.type)} ${
            propsMap[prop] || prop
          }`,
        );
      }
    } else if (op.p.includes("edges")) {
      const node = graph[op.od?.[0]];
      output.push(
        `Removed ${getComponentName("node", node?.type)} from branch`,
      );
    }
  };

  ops.map((op) => {
    const node = graph[op.p?.[0]];
    const operationTypes = Object.keys(op);

    if (operationTypes.includes("od") && operationTypes.includes("oi")) {
      handleUpdate(node, op as OT.Object.Replace);
    } else if (operationTypes.includes("oi")) {
      handleAdd(node, op as OT.Object.Add);
    } else if (operationTypes.includes("od")) {
      handleRemove(node, op as OT.Object.Remove);
    } else if (operationTypes.includes("li") && operationTypes.includes("ld")) {
      handleRootUpdate(op as OT.Array.Replace);
    }
  });

  return output;
};

/**
 * Convert flat list of nodes to a hierarchical graph
 *
 * @description
 * Our graph is stored as a flat data structure (key:value pairs of nodeId:nodeData)
 * When we "copy" we also keep a flat structure on the clipboard
 * In order to re-insert nodes in the correct hierarchical order, we need to re-structure them hierarchically
 * This allows us to run a single `addNode()` call and keeps our "paste" operation as a single ShareDB transaction
 */
export const buildGraphFromNodes = (
  nodeId: string,
  allNodes: { [id: string]: Store.Node },
  visited = new Set<string>(),
): { id: NodeId; children: Store.Node[] } => {
  // Guard for cycles in the graph
  if (visited.has(nodeId)) {
    return { id: nodeId, ...allNodes[nodeId], children: [] };
  }
  visited.add(nodeId);

  const nodeData = allNodes[nodeId];
  const children = (nodeData.edges || []).map((childId: string) =>
    buildGraphFromNodes(childId, allNodes, visited),
  );

  // Strip our the original edges property, these are captured as children when adding a new node
  const { edges: _edges, ...restOfNodeData } = nodeData;

  return {
    id: nodeId,
    ...restOfNodeData,
    children: children,
  };
};
