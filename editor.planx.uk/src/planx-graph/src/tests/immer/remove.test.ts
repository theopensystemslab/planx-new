import produce from "immer";
import { Graph } from "./types";
// import clone from "lodash/clone"

const remove = (id: string, parent: string) => (graph = {}): Graph => {
  return produce(graph, (draft) => {
    const _remove = (id, parent) => {
      if (!draft[id]) throw new Error("id not found");
      else if (!draft[parent]) throw new Error("parent not found");

      const idx = draft[parent].edges.indexOf(id);
      if (idx >= 0) {
        draft[parent].edges.splice(idx, 1);
      } else {
        throw new Error("not found in parent");
      }
      if (draft[parent].edges.length === 0) delete draft[parent].edges;
      if (Object.keys(draft[parent]).length === 0) delete draft[parent];

      if (draft[id].edges) {
        // must be a copy, for some reason?
        [...draft[id].edges].forEach((child) => {
          _remove(child, id);
        });
      }

      delete draft[id];
    };

    _remove(id, parent);
  });
};

test("with id", () => {
  expect(
    remove(
      "a",
      "_root"
    )({
      _root: {
        edges: ["a"],
      },
      a: {
        edges: ["b", "c"],
      },
      b: {},
      c: {
        edges: ["d"],
      },
      d: {},
    })
  ).toEqual({});
});

describe("error handling", () => {
  test("invalid id", () => {
    expect(() => {
      remove("b", "_root")();
    }).toThrowError("id not found");
  });

  test("invalid parent", () => {
    expect(() => {
      remove(
        "a",
        "fpp"
      )({
        _root: {
          edges: ["a"],
        },
        a: {},
      });
    }).toThrowError("parent not found");
  });
});
