import { mutate } from "array-move";
import { produce } from "immer";
import * as jsondiffpatch from "jsondiffpatch";
import get from "lodash/get";
import zip from "lodash/zip";

const jdiff = jsondiffpatch.create({
  objectHash: (obj: any) => JSON.stringify(obj),
  textDiff: {
    minLength: Infinity,
  },
});

const patchToOP = (flow) => ([patch, inverse]) => {
  if (Array.isArray(get(flow, patch.path.slice(0, -1)))) {
    // list
    switch (patch.op) {
      case "add":
        return { li: patch.value, p: patch.path };
      case "remove":
        return { ld: inverse.value, p: patch.path };
      case "replace":
        return { ld: inverse.value, li: patch.value, p: patch.path };
      case "move":
        const toIdx = patch.path[patch.path.length - 1];
        const from = strPathToArrPath(patch.from);
        const fromIdx = from[from.length - 1];
        if (toIdx === fromIdx) return;

        return {
          lm: toIdx,
          p: from,
        };

      default:
        throw new Error(
          `unsupported list op (${JSON.stringify(patch)} ${JSON.stringify(
            inverse
          )})`
        );
    }
  } else {
    // object
    switch (patch.op) {
      case "add":
        return { oi: patch.value, p: patch.path };
      case "remove":
        return { od: inverse.value, p: patch.path };
      case "replace":
        return { od: inverse.value, oi: patch.value, p: patch.path };
      default:
        throw new Error(`unsupported object op (${JSON.stringify(patch)})`);
    }
  }
};

const strPathToArrPath = (path) => {
  const strPath = path.split("/").slice(1);
  strPath[strPath.length - 1] =
    strPath[0] === "edges"
      ? Number(strPath[strPath.length - 1])
      : strPath[strPath.length - 1];
  return strPath;
};

const jsonPatchToJson0 = ({ path, ...patch }) => ({
  path: strPathToArrPath(path),
  ...patch,
});

export const getOps = (flow, fn) => {
  const next = produce(flow, fn);

  const delta = jdiff.diff(flow, next);

  const fwd = (jsondiffpatch.formatters as any).jsonpatch
    .format(delta)
    .map(jsonPatchToJson0);

  const rev = (jsondiffpatch.formatters as any).jsonpatch
    .format(jdiff.reverse(delta))
    .map(jsonPatchToJson0);

  const allPatches = zip(fwd, rev.reverse());

  console.log({ flow, next, delta, allPatches });

  return allPatches.map((p) => patchToOP(flow)(p)).filter(Boolean);
};

export const addNode = (flow) => ({ id, ...node }) =>
  getOps(flow, (draft) => {
    draft.nodes[id] = node;
    draft.edges.push([null, id]);
  });

export const removeNode = (flow) => (id) =>
  getOps(flow, (draft) => {
    delete draft.nodes[id];
    draft.edges.splice(0, 1);
  });

export const moveNode = (flow) => (
  src,
  tgt,
  { toSrc = null, beforeId = null }
) =>
  getOps(flow, (draft) => {
    const fromIdx = draft.edges.findIndex(([s, t]) => s === src && t === tgt);
    let toIdx = draft.edges.findIndex(
      ([s, t]) => s === toSrc && t === beforeId
    );

    if (fromIdx < toIdx) toIdx--;

    mutate(draft.edges, fromIdx, toIdx);
  });
