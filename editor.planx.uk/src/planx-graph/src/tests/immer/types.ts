import { enablePatches } from "immer";
enablePatches();

export type Graph = {
  _root?: {
    edges: Array<string>;
  };
};
