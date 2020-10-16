import { graph, loadGraph } from "./setup.test";

describe("removing nodes", () => {
  test("remove a child node", () => {
    loadGraph();

    const ops = graph.remove("c");

    expect(ops).toEqual([
      { p: ["c"], od: {} },
      { p: ["a", "edges", 1], ld: "c" },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: {
        edges: ["a"],
      },
      a: {
        edges: ["b"],
      },
      b: {},
    });
  });

  test("remove a node with children", () => {
    graph.load({
      _root: {
        edges: ["a"],
      },
      a: {
        edges: ["b", "c", "d"],
      },
      b: {},
      c: {},
      d: {},
    });

    const ops = graph.remove("a");

    expect(ops).toEqual([
      { p: ["a"], od: { edges: ["b", "c", "d"] } },
      { p: ["_root", "edges", 0], ld: "a" },
      { p: ["_root", "edges"], od: [] },
      { p: ["b"], od: {} },
      { p: ["c"], od: {} },
      { p: ["d"], od: {} },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: {},
    });
  });
});
