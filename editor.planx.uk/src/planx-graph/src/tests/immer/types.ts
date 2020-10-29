import { enablePatches } from "immer";
enablePatches();

export type Graph = {
  _root?: {
    edges: Array<string>;
  };
};

export const connections = (id, graph): number =>
  Object.values(graph).filter(({ edges = [] }) => edges.includes(id)).length;

// export const isClone = (id, graph): boolean => connections(id, graph) > 1;
