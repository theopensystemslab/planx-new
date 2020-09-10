import { mutate } from "array-move";
import { enablePatches, produceWithPatches } from "immer";
import * as jsondiffpatch from "jsondiffpatch";
import get from "lodash/get";
import zip from "lodash/zip";

enablePatches();

const jdiff = jsondiffpatch.create({
  objectHash: (obj: any) => obj.id || JSON.stringify(obj),
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
        if (patch.path[patch.path.length - 1] !== "length") {
          // regular replace
          return { ld: inverse.value, li: patch.value, p: patch.path };
        } else {
          // removing last item from array
          return { ld: inverse.value, p: patch.path.slice(0, -1).concat(0) };
        }
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
      default:
        throw new Error(`unsupported object op (${JSON.stringify(patch)})`);
    }
  }
};

const getOps = (flow, fn) => {
  const [next, patches, inverse]: any = produceWithPatches(flow, fn);
  const patchesAndInverse = zip(patches, inverse);

  let moveOps = undefined;
  // let moveOp = undefined;
  // let from = undefined;
  // let to = undefined;

  // console.log(flow.edges, next.edges);

  return (
    patchesAndInverse
      .reduce((acc, [fwd, rev]: any) => {
        const maybeArray = get(flow, fwd.path.slice(0, -1));

        if (
          Array.isArray(maybeArray) &&
          fwd.op === "replace" &&
          rev.op === "replace" &&
          fwd.path.join("") === rev.path.join("") &&
          !moveOps
        ) {
          // console.log({ fwd, rev });

          // if (moveOp === undefined) {
          //   from = fwd.path[fwd.path.length - 1];
          // } else {
          //   to = fwd.path[fwd.path.length - 1];
          // }
          // moveOp = { lm: to, p: fwd.path.slice(0, -1).concat(from) };

          const { _t, ...operations } = jdiff.diff(flow.edges, next.edges);
          if (_t && _t === "a") {
            moveOps = Object.entries(operations).reduce(
              (acc, [key, val]: any) => {
                const [, numStr] = key.match(/_(\d+)/);

                const from = Number(numStr);

                if (from >= 0 && val[2] === 3) {
                  // move operation
                  const to = val[1];

                  acc.push({ lm: to, p: fwd.path.slice(0, -1).concat(from) });
                }

                return acc;
              },
              []
            );
          }
        } else if (Array.isArray(moveOps)) {
          acc = acc.concat(moveOps);
          moveOps = undefined;
        } else {
          acc.push(patchToOP(next)([fwd, rev]));
        }

        return acc;
      }, [])
      // .concat(moveOps)
      .filter(Boolean)
  );
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
    // console.log(JSON.stringify(draft.edges));
    // const toMove = draft.edges.splice(fromIdx, 1)[0];
    // draft.edges.splice(toIdx, 0, toMove);
  });
