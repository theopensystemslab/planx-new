import produce from "immer";
import { Graph } from "./types";

const move = (
  id: string,
  parent: string,
  toParent: string,
  { toBefore = undefined } = {}
) => (graph = {}): Graph => {
  return produce(graph, (draft) => {
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
};

test("move", () => {
  expect(
    move(
      "b",
      "_root",
      "a"
    )({
      _root: {
        edges: ["a", "b"],
      },
      a: {},
      b: {},
    })
  ).toEqual({
    _root: {
      edges: ["a"],
    },
    a: {
      edges: ["b"],
    },
    b: {},
  });
});

test("toBefore", () => {
  expect(
    move("c", "b", "_root", { toBefore: "b" })({
      _root: {
        edges: ["a", "b"],
      },
      a: {},
      b: {
        edges: ["c"],
      },
      c: {},
    })
  ).toEqual({
    _root: {
      edges: ["a", "c", "b"],
    },
    a: {},
    b: {},
    c: {},
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
