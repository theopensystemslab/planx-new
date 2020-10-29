import { connections, Graph, Op, wrap } from "./types";

const remove = (id: string, parent: string) => (
  graph = {}
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

test("with clones", () => {
  const [graph, ops] = remove(
    "a",
    "_root"
  )({
    _root: {
      edges: ["a", "clone"],
    },
    a: {
      edges: ["clone"],
    },
    clone: {},
  });
  expect(graph).toMatchObject({
    _root: {
      edges: ["clone"],
    },
    clone: {},
  });
  expect(ops).toEqual([
    { ld: "a", li: "clone", p: ["_root", "edges", 0] },
    { ld: "clone", p: ["_root", "edges", 1] },
    { od: { edges: ["clone"] }, p: ["a"] },
  ]);
});

test("with id", () => {
  const [graph, ops] = remove(
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
  });
  expect(graph).toEqual({});
  expect(ops).toEqual([
    { od: { edges: ["a"] }, p: ["_root"] },
    { od: {}, p: ["b"] },
    { od: { edges: ["b", "c"] }, p: ["a"] },
    { od: { edges: ["d"] }, p: ["c"] },
    { od: {}, p: ["d"] },
  ]);
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
