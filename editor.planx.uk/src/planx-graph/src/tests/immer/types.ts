import { enablePatches, produceWithPatches } from "immer";
import zip from "lodash/zip";
enablePatches();

export interface Patch {
  op: "add" | "remove" | "replace";
  path: Array<string | number>;
  value?: any;
}

export interface Op {
  p: Array<string | number>;
  li?;
  ld?;
  oi?;
  od?;
}

export type Graph = {
  _root?: {
    edges: Array<string>;
  };
};

export const connections = (id, graph): number =>
  Object.values(graph).filter(({ edges = [] }) => edges.includes(id)).length;

// export const isClone = (id, graph): boolean => connections(id, graph) > 1;

const convertPatchesToOps = (patches, inversePatches) =>
  zip(patches, inversePatches).map(([fwd, bak]: [Patch, Patch]) => {
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
      }
    }
    // console.log({ fwd, bak, op });
    return op;
  });

export const wrap = (graph, fn): [Graph, Array<Op>] => {
  const [result, patches, inversePatches] = produceWithPatches(graph, fn);
  return [result, convertPatchesToOps(patches, inversePatches)];
};
