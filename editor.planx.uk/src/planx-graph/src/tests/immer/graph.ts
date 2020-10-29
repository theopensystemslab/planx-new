import { enablePatches, produceWithPatches } from "immer";
import zip from "lodash/zip";
enablePatches();

interface Patch {
  op: "add" | "remove" | "replace";
  path: Array<string | number>;
  value?: any;
}

interface Op {
  p: Array<string | number>;
  li?;
  ld?;
  oi?;
  od?;
}

interface Node {
  id?: string;
  data?: object;
  edges?: Array<string>;
  type?: number;
}

type Graph = Record<string, Node>;

const connections = (id: string, graph: Graph): number =>
  Object.values(graph).filter(({ edges = [] }) => edges.includes(id)).length;

// export const isClone = (id, graph): boolean => connections(id, graph) > 1;

const convertPatchesToOps = (
  patches: Array<Patch>,
  inversePatches: Array<Patch>
): Array<Op> =>
  zip(patches, inversePatches).map(([fwd, bak]) => {
    let op: Op = {
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

const wrap = (graph: Graph, fn: (draft) => void): [Graph, Array<Op>] => {
  const [result, patches, inversePatches] = produceWithPatches(graph, fn);
  return [result, convertPatchesToOps(patches, inversePatches)];
};

export const add = (
  { id = String(Math.random()), ...nodeData },
  {
    children = [],
    parent = "_root",
    before = undefined,
  }: { children?: Array<Node>; parent?: string; before?: string } = {}
) => (graph: Graph = {}): [Graph, Array<Op>] =>
  wrap(graph, (draft) => {
    draft._root = draft._root || {};

    const _add = (
      { id, ...nodeData },
      { children = [], parent, before = undefined }
    ) => {
      if (draft[id]) throw new Error("id exists");
      else if (!draft[parent]) throw new Error("parent not found");

      draft[id] = nodeData;

      if (draft[parent].edges) {
        if (before) {
          const idx = draft[parent].edges.indexOf(before);
          if (idx >= 0) {
            draft[parent].edges.splice(idx, 0, id);
          } else throw new Error("before not found");
        } else {
          draft[parent].edges.push(id);
        }
      } else {
        draft[parent].edges = [id];
      }

      children.forEach((child) => {
        _add(child, { parent: id });
      });
    };

    _add({ id, ...nodeData }, { children, parent, before });
  });

export const move = (
  id: string,
  parent: string,
  toParent: string,
  { toBefore = undefined }: { toBefore?: string } = {}
) => (graph: Graph = {}): [Graph, Array<Op>] =>
  wrap(graph, (draft) => {
    if (!draft[id]) throw new Error("id not found");
    else if (!draft[parent]) throw new Error("parent not found");
    else if (!draft[toParent]) throw new Error("toParent not found");

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
  });

export const remove = (id: string, parent: string) => (
  graph: Graph = {}
): [Graph, Array<Op>] =>
  wrap(graph, (draft) => {
    const _remove = (id, parent) => {
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

      if (connections(id, draft) === 0) {
        if (draft[id].edges) {
          // must be a copy, for some reason?
          [...draft[id].edges].forEach((child) => {
            _remove(child, id);
          });
        }
        delete draft[id];
      }
    };

    _remove(id, parent);
  });
