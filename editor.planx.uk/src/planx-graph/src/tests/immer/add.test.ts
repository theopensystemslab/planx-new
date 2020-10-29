import produce from "immer";
import { Graph } from "./types";

const add = (
  { id = String(Math.random()) },
  { children = [], parent = "_root", before = undefined } = {}
) => (graph = {}): Graph => {
  return produce(graph, (draft) => {
    draft._root = draft._root || {};

    const _add = ({ id }, { children = [], parent, before = undefined }) => {
      if (draft[id]) throw new Error("id exists");
      if (!draft[parent]) throw new Error("parent not found");

      if (draft[parent].edges) {
        if (before) {
          const idx = draft[parent].edges.indexOf(before);
          if (idx >= 0) draft[parent].edges.splice(idx, 0, id);
          else throw new Error("before not found");
        } else {
          draft[parent].edges.push(id);
        }
      } else {
        draft[parent].edges = [id];
      }
      draft[id] = {};
      children.forEach((child) => _add(child, { parent: id }));
    };

    _add({ id }, { children, parent, before });
  });
};

test("without id", () => {
  const data = add({})();
  const {
    _root: {
      edges: [id],
    },
  } = data;

  expect(data).toMatchObject({
    _root: {
      edges: [id],
    },
    [id]: {},
  });
});

test("with children", () => {
  expect(
    add({ id: "a" }, { children: [{ id: "a-a" }, { id: "a-b" }] })()
  ).toMatchObject({
    _root: {
      edges: ["a"],
    },
    a: {
      edges: ["a-a", "a-b"],
    },
    "a-a": {},
    "a-b": {},
  });
});

test("empty graph", () => {
  expect(add({ id: "a" })()).toMatchObject({
    _root: {
      edges: ["a"],
    },
    a: {},
  });
});

test("existing graph", () => {
  expect(add({ id: "b" })({ _root: { edges: ["a"] }, a: {} })).toMatchObject({
    _root: {
      edges: ["a", "b"],
    },
    a: {},
    b: {},
  });
});

test("before item", () => {
  const graph = {
    _root: { edges: ["a", "b"] },
    a: {},
    b: {},
  };
  expect(add({ id: "c" }, { before: "b" })(graph)).toMatchObject({
    _root: {
      edges: ["a", "c", "b"],
    },
    a: {},
    b: {},
    c: {},
  });
});

test("with parent, before item", () => {
  const graph = {
    _root: { edges: ["a"] },
    a: {
      edges: ["b"],
    },
    b: {},
  };
  expect(add({ id: "c" }, { before: "b", parent: "a" })(graph)).toMatchObject({
    _root: {
      edges: ["a"],
    },
    a: {
      edges: ["c", "b"],
    },
    b: {},
    c: {},
  });
});

describe("error handling", () => {
  test("invalid parent", () => {
    expect(() => add({ id: "c" }, { parent: "x" })()).toThrowError(
      "parent not found"
    );
  });

  test("id already exists", () => {
    expect(() => add({ id: "_root" })()).toThrowError("id exists");

    expect(() =>
      add({ id: "a" })({ _root: { edges: ["a"] }, a: {} })
    ).toThrowError("id exists");
  });

  test("invalid before item", () => {
    const graph = {
      _root: { edges: ["a", "b"] },
      a: {},
      b: {},
    };
    expect(() => add({ id: "c" }, { before: "x" })(graph)).toThrowError(
      "before not found"
    );
  });
});
