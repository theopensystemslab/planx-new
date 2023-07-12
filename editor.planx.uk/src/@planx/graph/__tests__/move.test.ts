import { move } from "..";

test("move within same parent", () => {
  const [graph, ops] = move("b", "_root", { toBefore: "a" })({
    _root: {
      edges: ["a", "b"],
    },
    a: {},
    b: {},
  });
  expect(graph).toEqual({
    _root: {
      edges: ["b", "a"],
    },
    a: {},
    b: {},
  });
  expect(ops).toEqual([
    { p: ["_root", "edges", 0], ld: "a", li: "b" },
    { p: ["_root", "edges", 1], ld: "b", li: "a" },
  ]);
});

test("move sections within same root parent", () => {
  const [graph, ops] = move("sectionNodeId", "_root", { toBefore: "a" })({
    _root: {
      edges: ["a", "sectionNodeId"],
    },
    a: {},
    sectionNodeId: { type: 360 },
  });
  expect(graph).toEqual({
    _root: {
      edges: ["sectionNodeId", "a"],
    },
    a: {},
    sectionNodeId: { type: 360 },
  });
  expect(ops).toEqual([
    { ld: "a", li: "sectionNodeId", p: ["_root", "edges", 0] },
    { ld: "sectionNodeId", li: "a", p: ["_root", "edges", 1] },
  ]);
});

describe("different parent", () => {
  test("move", () => {
    const [graph, ops] = move("b", "_root", { toParent: "a" })({
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
    const [graph, ops] = move("c", "b", { toParent: "_root", toBefore: "b" })({
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
      move("x", "_root", { toParent: "a" })({
        _root: {
          edges: ["a"],
        },
        a: {},
      }),
    ).toThrow("id not found");
  });

  test("invalid parent", () => {
    expect(() =>
      move("b", "x", { toParent: "a" })({
        _root: {
          edges: ["a", "b"],
        },
        a: {},
        b: {},
      }),
    ).toThrow("parent not found");
  });

  test("invalid toParent", () => {
    expect(() =>
      move("a", "_root", { toParent: "x" })({
        _root: {
          edges: ["a"],
        },
        a: {},
      }),
    ).toThrow("toParent not found");
  });

  test("invalid toBefore", () => {
    expect(() =>
      move("a", "_root", { toParent: "b", toBefore: "foo" })({
        _root: {
          edges: ["a"],
        },
        a: {},
        b: {},
      }),
    ).toThrow("toBefore does not exist in toParent");
  });

  test("parent does not connect to id", () => {
    expect(() =>
      move("b", "_root", { toParent: "a" })({
        _root: {
          edges: ["a"],
        },
        a: {},
        b: {},
      }),
    ).toThrow("parent does not connect to id");
  });

  test("cannot create cycles", () => {
    expect(() =>
      move("a", "_root", { toParent: "b" })({
        _root: {
          edges: ["a"],
        },
        a: {
          edges: ["b"],
        },
        b: {},
      }),
    ).toThrow("cycle");
  });

  test("cannot move a clone to same parent", () => {
    expect(() =>
      move("clone", "_root", { toParent: "a" })({
        _root: {
          edges: ["a", "clone"],
        },
        a: {
          edges: ["clone"],
        },
        clone: {},
      }),
    ).toThrow("same parent");
  });

  test("cannot move a section onto non-root parent", () => {
    expect(() =>
      move("sectionNodeId", "_root", { toParent: "a" })({
        _root: {
          edges: ["a", "sectionNodeId"],
        },
        a: {},
        sectionNodeId: { type: 360 },
      }),
    ).toThrow("cannot move sections onto branches, must be on center of graph");
  });
});
