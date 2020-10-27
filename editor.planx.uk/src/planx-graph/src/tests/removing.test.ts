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
      { p: ["_root", "edges"], od: ["a"] },
      { p: ["b"], od: {} },
      { p: ["c"], od: {} },
      { p: ["d"], od: {} },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: {},
    });
  });

  test("removing clones", () => {
    const data = {
      _root: {
        edges: ["a", "b"],
      },
      a: {
        edges: ["c"],
      },
      b: {
        edges: ["c"],
      },
      c: {},
    };

    graph.load(data);
    const ops = graph.remove("c", { parent: "a" });

    expect(ops).toEqual([{ p: ["a", "edges"], od: ["c"] }]);

    expect(graph.toObject()).toMatchObject({
      _root: {
        edges: ["a", "b"],
      },
      a: {},
      b: {
        edges: ["c"],
      },
      c: {},
    });
  });
});
