import { Graph, Op, wrap } from "./types";

const move = (
  id: string,
  parent: string,
  toParent: string,
  { toBefore = undefined } = {}
) => (graph = {}): [Graph, Array<Op>] =>
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

describe("different parent", () => {
  test("move", () => {
    const [graph, ops] = move(
      "b",
      "_root",
      "a"
    )({
      _root: {
        edges: ["a", "b"],
      },
      a: {},
      b: {},
    });
    expect(graph).toEqual({
      _root: {
        edges: ["a"],
      },
      a: {
        edges: ["b"],
      },
      b: {},
    });
    expect(ops).toEqual([
      { p: ["_root", "edges", 1], ld: "b" },
      { oi: ["b"], p: ["a", "edges"] },
    ]);
  });

  test("toBefore", () => {
    const [graph, ops] = move("c", "b", "_root", { toBefore: "b" })({
      _root: {
        edges: ["a", "b"],
      },
      a: {},
      b: {
        edges: ["c"],
      },
      c: {},
    });
    expect(graph).toEqual({
      _root: {
        edges: ["a", "c", "b"],
      },
      a: {},
      b: {},
      c: {},
    });
    expect(ops).toEqual([
      { ld: "b", li: "c", p: ["_root", "edges", 1] },
      { li: "b", p: ["_root", "edges", 2] },
      { od: ["c"], p: ["b", "edges"] },
    ]);
  });
});

describe("error handling", () => {
  test("invalid id", () => {
    expect(() =>
      move(
        "x",
        "_root",
        "a"
      )({
        _root: {
          edges: ["a"],
        },
        a: {},
      })
    ).toThrowError("id not found");
  });

  test("invalid parent", () => {
    expect(() =>
      move(
        "b",
        "x",
        "a"
      )({
        _root: {
          edges: ["a", "b"],
        },
        a: {},
        b: {},
      })
    ).toThrowError("parent not found");
  });

  test("invalid toParent", () => {
    expect(() =>
      move(
        "a",
        "_root",
        "x"
      )({
        _root: {
          edges: ["a"],
        },
        a: {},
      })
    ).toThrowError("toParent not found");
  });

  test("invalid toBefore", () => {
    expect(() =>
      move("a", "_root", "b", { toBefore: "foo" })({
        _root: {
          edges: ["a"],
        },
        a: {},
        b: {},
      })
    ).toThrowError("toBefore does not exist in toParent");
  });

  test("parent does not connect to id", () => {
    expect(() =>
      move(
        "b",
        "_root",
        "a"
      )({
        _root: {
          edges: ["a"],
        },
        a: {},
        b: {},
      })
    ).toThrowError("parent does not connect to id");
  });
});
