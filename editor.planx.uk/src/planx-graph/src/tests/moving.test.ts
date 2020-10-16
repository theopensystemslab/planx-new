import { graph, loadGraph } from "./setup.test";

describe("moving nodes", () => {
  beforeEach(loadGraph);

  test("within same parent", () => {
    const ops = graph.move("c", { fromParent: "a", toBefore: "b" });

    expect(ops).toEqual([{ p: ["a", "edges", 1], lm: 0 }]);

    expect(graph.toObject()).toMatchObject({
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

  test("to end of same parent", () => {
    const ops = graph.move("b", { fromParent: "a" });

    expect(ops).toEqual([{ p: ["a", "edges", 0], lm: 1 }]);

    expect(graph.toObject()).toMatchObject({
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

  test("to different parent", () => {
    graph.load({
      _root: {
        edges: ["a", "d"],
      },
      a: {
        edges: ["b", "c"],
      },
      b: {},
      c: {},
      d: {},
    });

    const ops = graph.move("d", { fromParent: "_root", toParent: "b" });

    expect(ops).toEqual([
      { p: ["_root", "edges", 1], ld: "d" },
      { p: ["b", "edges"], oi: [] },
      { p: ["b", "edges", 0], li: "d" },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: {
        edges: ["a"],
      },
      a: {
        edges: ["b", "c"],
      },
      b: {
        edges: ["d"],
      },
      c: {},
      d: {},
    });
  });
});

describe("cloning nodes", () => {
  test("to different parent", () => {
    graph.load({
      _root: {
        edges: ["a", "d"],
      },
      a: {
        edges: ["b", "c"],
      },
      b: {},
      c: {},
      d: {},
    });

    const ops = graph.move("d", {
      fromParent: "_root",
      toParent: "a",
      clone: true,
    });

    expect(ops).toEqual([{ p: ["a", "edges", 2], li: "d" }]);

    expect(graph.toObject()).toMatchObject({
      _root: {
        edges: ["a", "d"],
      },
      a: {
        edges: ["b", "c", "d"],
      },
      b: {},
      c: {},
      d: {},
    });
  });
});
