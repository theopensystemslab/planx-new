import { TYPES } from "@planx/components/types";
import { enablePatches, produceWithPatches } from "immer";
import difference from "lodash/difference";
import trim from "lodash/trim";
import zip from "lodash/zip";
import { customAlphabet } from "nanoid-good";
import en from "nanoid-good/locale/en";

import { ImmerJSONPatch, OT } from "./types";

enablePatches();

interface Node {
  id?: string;
  data?: object;
  edges?: Array<string>;
  type?: number;
}

type Child = Record<string, any>;

export type Graph = Record<string, Node>;

export const ROOT_NODE_KEY = "_root";

const uniqueId = customAlphabet(en)(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  10
);

const numberOfEdgesTo = (id: string, graph: Graph): number =>
  Object.values(graph).filter(({ edges = [] }) => edges.includes(id)).length;

export const isClone = (id: string, graph: Graph): boolean =>
  numberOfEdgesTo(id, graph) > 1;

const isSomething = (x: any): boolean =>
  x !== null && x !== undefined && x !== "";

const isSectionNodeType = (id: string, graph: Graph): boolean =>
  graph[id]?.type === TYPES.Section;

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
  inversePatches: ImmerJSONPatch[]
): Array<OT.Op> =>
  (zip(patches, inversePatches) as [ImmerJSONPatch, ImmerJSONPatch][]).map(
    ([fwd, bak]) => {
      let op: any = {
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
    }
  );

const wrap = (
  graph: Graph,
  fn: (draft: Graph) => void
): [Graph, Array<OT.Op>] => {
  const [result, patches, inversePatches] = produceWithPatches(graph, fn);
  return [result, convertPatchesToOps(patches, inversePatches)];
};

const isCyclicUtil = (
  src: string,
  visited: Record<string, boolean>,
  recStack: Record<string, boolean>,
  graph: Graph
): boolean => {
  if (recStack[src]) return true;
  else if (visited[src]) return false;

  visited[src] = true;
  recStack[src] = true;

  const { edges = [] } = graph[src];
  for (let tgt of edges) {
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

  for (let key of Object.keys(visited)) {
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
  }: { children?: Child[]; parent: string; before?: string }
) => {
  if (draft[id]) throw new Error("id exists");
  else if (!draft[parent]) throw new Error("parent not found");

  const parentNode = draft[parent];

  parentNode.edges = parentNode.edges || [];

  draft[id] = sanitize(nodeData);

  if (isSectionNodeType(id, draft) && parent !== ROOT_NODE_KEY) {
    alert(
      "cannot add sections on branches or in portals, must be on center of main graph. close this window & try again"
    );
    throw new Error("cannot add sections on branches or in portals");
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

export const add =
  (
    {
      id = uniqueId(),
      ...nodeData
    }: { id?: string; type?: number; data?: object },
    {
      children = [],
      parent = ROOT_NODE_KEY,
      before = undefined,
    }: {
      children?: Child[];
      parent?: string;
      before?: string;
    } = {}
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
    }: { toParent?: string; toBefore?: string } = {}
  ) =>
  (graph: Graph = {}): [Graph, Array<OT.Op>] =>
    wrap(graph, (draft) => {
      if (!draft[id]) throw new Error("id not found");
      else if (!draft[toParent]) throw new Error("toParent not found");
      else if (draft[toParent].edges?.includes(id))
        throw new Error("cannot clone to same parent");
      else if (isSectionNodeType(id, graph))
        throw new Error("cannot clone sections");

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
    }: { toParent?: string; toBefore?: string } = {}
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

      if (isSectionNodeType(id, graph) && toParent !== ROOT_NODE_KEY)
        throw new Error(
          "cannot move sections onto branches, must be on center of graph"
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
    if (parentNode.edges.length === 1) delete parentNode.edges;
    else parentNode.edges.splice(idx, 1);
  } else {
    throw new Error("not found in parent");
  }

  if (Object.keys(draft[parent]).length === 0) delete draft[parent];

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
  } = {}
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
            { parent: id }
          )
        );

        const removedChildrenIds = difference(
          node.edges,
          newChildIds
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
      if (!isSomething(v)) {
        if (existingData.hasOwnProperty(k)) delete (existingData as any)[k];
      } else if (v !== (existingData as any)[k]) {
        (existingData as any)[k] = v;
      }
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
    } = {}
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
        { idFn }: { idFn: Function },
        firstCall: boolean
      ) => {
        const { edges = [], ...nodeData } = draft[id];
        if (!firstCall && isClone(id, draft)) {
          const node = draft[parent];
          node.edges = node.edges || [];
          node.edges.push(id);
        } else {
          const newId = idFn();
          _add(draft, { id: newId, ...nodeData }, { parent });
          edges.forEach((tgt: string) => {
            _makeUnique(tgt, newId, { idFn }, false);
          });
        }
      };
      _makeUnique(id, parent, { idFn }, true);
    });

/**
 * Depth first sort of graph
 * XXX: Clones will only appear in first graph position
 */
const dfs = (graph: Graph) => (startId: string) => {
  const visited = new Set([startId]);
  const crawlFrom = (id: string) => {
    if (!graph[id]) return;
    visited.add(id);
    graph[id].edges?.forEach((childId) => {
      crawlFrom(childId);
    });
  };
  crawlFrom(startId);
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
      (a, b) => allNodeIdsSorted.indexOf(a) - allNodeIdsSorted.indexOf(b)
    );
  };
