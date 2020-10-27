import { graph } from "./setup.test";

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
      d: {
        edges: ["e", "f"],
      },
      e: {},
      f: {},
    });

    const ops = graph.move("d", {
      fromParent: "_root",
      toParent: "c",
      clone: true,
    });

    expect(ops).toEqual([
      { p: ["c", "edges"], oi: [] },
      { p: ["c", "edges", 0], li: "d" },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: {
        edges: ["a", "d"],
      },
      a: {
        edges: ["b", "c"],
      },
      b: {},
      c: { edges: ["d"] },
      d: {
        edges: ["e", "f"],
      },
      e: {},
      f: {},
    });
  });
});
