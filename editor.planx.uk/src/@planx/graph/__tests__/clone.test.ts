import { clone } from "..";

describe("cloning", () => {
  test("from root to child", () => {
    const [graph, ops] = clone("b", { toParent: "a" })({
      _root: {
        edges: ["a", "b"],
      },
      a: {},
      b: {},
    });
    expect(graph).toEqual({
      _root: {
        edges: ["a", "b"],
      },
      a: {
        edges: ["b"],
      },
      b: {},
    });
    expect(ops).toEqual([{ oi: ["b"], p: ["a", "edges"] }]);
  });

  test("from a child to root", () => {
    const [graph, ops] = clone("b", { toBefore: "a" })({
      _root: {
        edges: ["a"],
      },
      a: { edges: ["b"] },
      b: {},
    });
    expect(graph).toEqual({
      _root: {
        edges: ["b", "a"],
      },
      a: {
        edges: ["b"],
      },
      b: {},
    });
    expect(ops).toEqual([
      { ld: "a", li: "b", p: ["_root", "edges", 0] },
      { li: "a", p: ["_root", "edges", 1] },
    ]);
  });

  test.todo("to a different parent");
});

describe("error handling", () => {
  test("invalid id", () => {
    expect(() =>
      clone("x")({
        _root: {
          edges: ["a"],
        },
        a: {},
      })
    ).toThrow("id not found");
  });

  test("invalid toParent", () => {
    expect(() =>
      clone("a", { toParent: "x" })({
        _root: {
          edges: ["a"],
        },
        a: {},
      })
    ).toThrow("toParent not found");
  });

  test("invalid toBefore", () => {
    expect(() =>
      clone("b", { toBefore: "x" })({
        _root: {
          edges: ["a"],
        },
        a: {},
        b: {},
      })
    ).toThrow("toBefore does not exist in toParent");
  });

  test("cannot create cycles", () => {
    expect(() =>
      clone("a", { toParent: "b" })({
        _root: {
          edges: ["a"],
        },
        a: {
          edges: ["b"],
        },
        b: {},
      })
    ).toThrow("cycle");
  });

  test("cannot share same parent", () => {
    expect(() =>
      clone("a", { toParent: "_root" })({
        _root: {
          edges: ["a"],
        },
        a: {},
      })
    ).toThrow("same parent");
  });

  test("cannot clone sections", () => {
    expect(() =>
      clone("sectionNodeId", { toParent: "a" })({
        _root: {
          edges: ["a", "sectionNodeId"],
        },
        a: {},
        sectionNodeId: { type: 360 },
      })
    ).toThrow("cannot clone sections");
  });
});
