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

type Graph = Record<string, Node>;

export const ROOT_NODE_KEY = "_root";

const uniqueId = customAlphabet(en)(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  10
);

const numberOfEdgesTo = (id: string, graph: Graph): number =>
  Object.values(graph).filter(({ edges = [] }) => edges.includes(id)).length;

export const isClone = (id, graph): boolean => numberOfEdgesTo(id, graph) > 1;

const isSomething = (x: any): boolean =>
  x !== null && x !== undefined && x !== "";

const sanitize = (x) => {
  if ((x && typeof x === "string") || x instanceof String) {
    return trim(x.replace(/[\u200B-\u200D\uFEFF↵]/g, ""));
  } else if ((x && typeof x === "object") || x instanceof Object) {
    return Object.entries(x).reduce((acc, [k, v]) => {
      v = sanitize(v);
      if (
        !isSomething(v) ||
        (typeof v === "object" && Object.keys(v).length === 0)
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
  patches: Array<ImmerJSONPatch>,
  inversePatches: Array<ImmerJSONPatch>
): Array<OT.Op> =>
  zip(patches, inversePatches).map(([fwd, bak]) => {
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
    // console.log({ fwd, bak, op });
    return op;
  });

const wrap = (graph: Graph, fn: (draft) => void): [Graph, Array<OT.Op>] => {
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
  draft,
  { id = uniqueId(), ...nodeData },
  { children = [], parent, before = undefined }
) => {
  if (draft[id]) throw new Error("id exists");
  else if (!draft[parent]) throw new Error("parent not found");

  draft[parent].edges = draft[parent].edges || [];

  draft[id] = sanitize(nodeData);

  if (before) {
    const idx = draft[parent].edges.indexOf(before);
    if (idx >= 0) {
      draft[parent].edges.splice(idx, 0, id);
    } else throw new Error("before not found");
  } else {
    draft[parent].edges.push(id);
  }

  children.forEach((child) => {
    _add(draft, child, { parent: id });
  });
};

export const add = (
  { id = uniqueId(), ...nodeData },
  {
    children = [],
    parent = ROOT_NODE_KEY,
    before = undefined,
  }: {
    children?: Array<Node>;
    parent?: string;
    before?: string;
  } = {}
) => (graph: Graph = {}): [Graph, Array<OT.Op>] =>
  wrap(graph, (draft) => {
    draft[ROOT_NODE_KEY] = draft[ROOT_NODE_KEY] || {};
    _add(draft, { id, ...nodeData }, { children, parent, before });
  });

export const clone = (
  id: string,
  {
    toParent = ROOT_NODE_KEY,
    toBefore = undefined,
  }: { toParent?: string; toBefore?: string } = {}
) => (graph: Graph = {}): [Graph, Array<OT.Op>] =>
  wrap(graph, (draft) => {
    if (!draft[id]) throw new Error("id not found");
    else if (!draft[toParent]) throw new Error("toParent not found");
    else if (draft[toParent].edges?.includes(id))
      throw new Error("cannot clone to same parent");

    draft[toParent].edges = draft[toParent].edges || [];

    if (toBefore) {
      const idx = draft[toParent].edges.indexOf(toBefore);
      if (idx >= 0) {
        draft[toParent].edges.splice(idx, 0, id);
      } else {
        throw new Error("toBefore does not exist in toParent");
      }
    } else {
      draft[toParent].edges.push(id);
    }

    if (isCyclic(draft)) throw new Error("cannot create cycle in graph");
  });

export const move = (
  id: string,
  parent: string,
  {
    toParent = undefined,
    toBefore = undefined,
  }: { toParent?: string; toBefore?: string } = {}
) => (graph: Graph = {}): [Graph, Array<OT.Op>] =>
  wrap(graph, (draft) => {
    toParent = toParent || parent;

    if (!draft[id]) throw new Error("id not found");
    else if (!draft[parent]) throw new Error("parent not found");
    else if (!draft[toParent]) throw new Error("toParent not found");
    else if (parent !== toParent && draft[toParent].edges?.includes(id)) {
      throw new Error("cannot move to same parent");
    }

    let idx = draft[parent].edges.indexOf(id);
    if (idx >= 0) {
      if (draft[parent].edges.length === 1) delete draft[parent].edges;
      else draft[parent].edges.splice(idx, 1);
    } else throw new Error("parent does not connect to id");

    draft[toParent].edges = draft[toParent].edges || [];

    if (toBefore) {
      idx = draft[toParent].edges.indexOf(toBefore);
      if (idx >= 0) {
        draft[toParent].edges.splice(idx, 0, id);
      } else {
        throw new Error("toBefore does not exist in toParent");
      }
    } else {
      draft[toParent].edges.push(id);
    }

    if (isCyclic(draft)) throw new Error("cannot create cycle in graph");
  });

const _remove = (draft, id, parent) => {
  if (!draft[id]) throw new Error("id not found");
  else if (!draft[parent]) throw new Error("parent not found");

  const idx = draft[parent].edges.indexOf(id);
  if (idx >= 0) {
    if (draft[parent].edges.length === 1) delete draft[parent].edges;
    else draft[parent].edges.splice(idx, 1);
  } else {
    throw new Error("not found in parent");
  }

  if (Object.keys(draft[parent]).length === 0) delete draft[parent];

  if (numberOfEdgesTo(id, draft) === 0) {
    if (draft[id].edges) {
      // must be a copy, for some reason?
      [...draft[id].edges].forEach((child) => {
        _remove(draft, child, id);
      });
    }
    delete draft[id];
  }
};

export const remove = (id: string, parent: string) => (
  graph: Graph = {}
): [Graph, Array<OT.Op>] =>
  wrap(graph, (draft) => {
    _remove(draft, id, parent);
  });

const _update = (
  draft,
  id: string,
  newData: object,
  {
    children = [],
    removeKeyIfMissing = false,
  }: { children?: Array<Node>; removeKeyIfMissing?: boolean } = {}
) => {
  const node = draft[id];
  children = children.map((c) => ({ ...c, id: c.id || uniqueId() }));

  const newChildIds = children.map((c) => c.id);

  if (removeKeyIfMissing) {
    if (newChildIds.toString() !== [...(node.edges || [])].toString()) {
      const addedChildrenIds = difference(newChildIds, node.edges);
      addedChildrenIds.forEach((cId) =>
        _add(
          draft,
          children.find((c) => c.id === cId),
          { parent: id }
        )
      );

      const removedChildrenIds = difference(node.edges, newChildIds);
      removedChildrenIds.forEach((childId) => _remove(draft, childId, id));

      if (node.edges) {
        if (newChildIds.length === 0) delete node.edges;
        else {
          node.edges = newChildIds;
        }
      }
    }

    if (node.data) {
      // if a value exists in the current data, but is null, undefined or "" in the
      // new data then remove it
      Object.entries(node.data).forEach(([k, v]) => {
        if (v !== null && v !== undefined && !isSomething(newData[k]))
          delete node.data[k];
      });
    }
  }

  if (node.data) {
    Object.entries(newData).reduce((existingData, [k, v]) => {
      v = sanitize(v);
      if (!isSomething(v)) {
        if (existingData.hasOwnProperty(k)) delete existingData[k];
      } else if (v !== existingData[k]) {
        existingData[k] = v;
      }
      return existingData;
    }, node.data);
  } else {
    node.data = newData;
  }
  if (Object.keys(node.data).length === 0) delete node.data;

  children.forEach(({ id, ...newData }) =>
    _update(draft, id, newData.data || newData)
  );
};

export const update = (
  id: string,
  newData: object,
  {
    children = [],
    removeKeyIfMissing = false,
  }: { children?: Array<Node>; removeKeyIfMissing?: boolean } = {}
) => (graph: Graph = {}): [Graph, Array<OT.Op>] =>
  wrap(graph, (draft) => {
    _update(draft, id, newData, { children, removeKeyIfMissing });
  });

export const makeUnique = (
  id: string,
  parent: string = ROOT_NODE_KEY,
  { idFn = uniqueId } = {}
) => (graph: Graph = {}): [Graph, Array<OT.Op>] =>
  wrap(graph, (draft) => {
    const _makeUnique = (
      id: string,
      parent: string,
      { idFn },
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
        edges.forEach((tgt) => {
          _makeUnique(tgt, newId, { idFn }, false);
        });
      }
    };
    _makeUnique(id, parent, { idFn }, true);
  });
