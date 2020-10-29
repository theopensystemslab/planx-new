import { graph } from "./setup.test";

describe("making things unique", () => {
  test("clones and their children should become unique", () => {
    graph.load({
      _root: { edges: ["foo", "clone"] },
      foo: {
        edges: ["clone"],
      },
      clone: {
        edges: ["cloneChild1", "cloneChild2"],
      },
      cloneChild1: {},
      cloneChild2: {},
    });

    const ops = graph.makeUnique("clone");

    expect(ops).toMatchObject([
      { p: ["_root", "edges", 2], li: "a" },
      { p: ["a"], oi: { data: {} } },
      { p: ["a", "edges"], oi: ["b"] },
      { p: ["b"], oi: { data: {} } },
      { p: ["a", "edges", 1], li: "c" },
      { p: ["c"], oi: { data: {} } },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: { edges: ["foo", "clone", "a"] },
      foo: {
        edges: ["clone"],
      },
      clone: {
        edges: ["cloneChild1", "cloneChild2"],
      },
      cloneChild1: {},
      cloneChild2: {},
      a: {
        edges: ["b", "c"],
      },
      b: {},
      c: {},
    });
  });

  test("portals, node descendents (except clones) should become unique", () => {
    graph.load({
      _root: { edges: ["portal", "clone"] },
      portal: {
        type: 300,
        edges: ["x", "clone"],
      },
      x: {
        type: 2,
        edges: ["y"],
      },
      y: {
        edges: ["z"],
      },
      z: {},
      clone: {
        type: 1,
        edges: ["cloneChild"],
      },
      cloneChild: {},
    });

    const ops = graph.makeUnique("portal", { parent: "_root" });

    expect(ops).toMatchObject([
      {
        p: ["_root", "edges", 2],
        li: "a",
      },
      {
        p: ["a"],
        oi: {
          type: 300,
          data: {},
        },
      },
      {
        p: ["a", "edges"],
        oi: ["b"],
      },
      {
        p: ["b"],
        oi: {
          type: 2,
          data: {},
        },
      },
      {
        p: ["b", "edges"],
        oi: ["c"],
      },
      {
        p: ["c"],
        oi: {
          data: {},
        },
      },
      {
        p: ["c", "edges"],
        oi: ["d"],
      },
      {
        p: ["d"],
        oi: {
          data: {},
        },
      },
      {
        li: "clone",
        p: ["a", "edges", 2],
      },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: {
        edges: ["portal", "clone", "a"],
      },
      portal: {
        type: 300,
        edges: ["x", "clone"],
      },
      x: {
        type: 2,
        edges: ["y"],
      },
      y: {
        edges: ["z"],
      },
      z: {},
      clone: {
        type: 1,
        edges: ["cloneChild"],
      },
      cloneChild: {},
      a: {
        type: 300,
        data: {},
        edges: ["b", "clone"],
      },
      b: {
        type: 2,
        data: {},
        edges: ["c"],
      },
      c: {
        data: {},
        edges: ["d"],
      },
      d: {
        data: {},
      },
    });
  });
});
