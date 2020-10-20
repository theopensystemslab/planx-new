import { graph } from "./setup.test";

describe("updating a node", () => {
  test("doesn't save empty fields", () => {
    graph.load({
      a: {
        data: {
          xyz: 1,
        },
      },
    });
    const ops = graph.update("a", { foo: "" });
    expect(ops).toEqual([]);
    expect(graph.toObject()).toMatchObject({
      a: {
        data: {
          xyz: 1,
        },
      },
    });
  });

  test("add a field to a without affecting existing data", () => {
    graph.load({
      a: {
        data: {
          xyz: 1,
        },
        edges: ["b"],
      },
      b: {},
    });

    const ops = graph.update("a", { foo: "bar" });

    expect(ops).toEqual([{ p: ["a", "data", "foo"], oi: "bar" }]);

    expect(graph.toObject()).toMatchObject({
      a: {
        data: {
          xyz: 1,
          foo: "bar",
        },
        edges: ["b"],
      },
      b: {},
    });
  });

  test("replace existing data", () => {
    graph.load({
      a: {
        data: {
          xyz: 1,
          foo: "bar",
        },
        edges: ["b"],
      },
      b: {},
    });

    const ops = graph.update("a", { foo: "bar2" });

    expect(ops).toEqual([{ p: ["a", "data", "foo"], oi: "bar2", od: "bar" }]);

    expect(graph.toObject()).toMatchObject({
      a: {
        data: {
          xyz: 1,
          foo: "bar2",
        },
        edges: ["b"],
      },
      b: {},
    });
  });

  test("remove existing data", () => {
    graph.load({
      a: {
        data: {
          xyz: 1,
          foo: "bar",
        },
        edges: ["b"],
      },
      b: {},
    });

    const ops = graph.update("a", { foo: null });

    expect(ops).toEqual([{ p: ["a", "data", "foo"], od: "bar" }]);

    expect(graph.toObject()).toMatchObject({
      a: {
        data: {
          xyz: 1,
        },
        edges: ["b"],
      },
      b: {},
    });
  });

  test("remove data if missing from newData", () => {
    graph.load({
      a: {
        data: {
          xyz: 1,
          foo: "bar",
        },
      },
    });

    const ops = graph.update(
      "a",
      { foo: "bar2" },
      { removeKeyIfMissing: true }
    );

    expect(ops).toEqual([
      { p: ["a", "data", "xyz"], od: 1 },
      { p: ["a", "data", "foo"], oi: "bar2", od: "bar" },
    ]);

    expect(graph.toObject()).toMatchObject({
      a: {
        data: {
          foo: "bar2",
        },
      },
    });
  });

  test("remove children and data if missing from newData", () => {
    graph.load({
      a: {
        data: {
          foo: "bar2",
        },
        edges: ["c", "d"],
      },
      b: {},
      c: {
        edges: ["e"],
      },
      d: {},
      e: {},
    });

    const ops = graph.update(
      "a",
      { foo: "bar2" },
      { children: [{ id: "d" }], removeKeyIfMissing: true }
    );

    expect(ops).toEqual([
      { p: ["c"], od: { edges: ["e"] } },
      { p: ["a", "edges", 0], ld: "c" },
      { p: ["e"], od: {} },
    ]);

    expect(graph.toObject()).toMatchObject({
      a: {
        data: {
          foo: "bar2",
        },
        edges: ["d"],
      },
      b: {},
      d: {},
    });
  });

  test("add children", () => {
    graph.load({
      x: {
        data: {},
        edges: ["y", "z"],
      },
      y: {},
      z: {},
    });

    const ops = graph.update(
      "x",
      {},
      { children: [{ id: "y" }, {}, { id: "z" }], removeKeyIfMissing: true }
    );

    expect(ops).toMatchObject([
      { p: ["x", "edges", 2], li: "a" },
      { p: ["a"], oi: { type: undefined, data: {} } },
      { p: ["x", "edges"], od: ["y", "z", "a"], oi: ["y", "a", "z"] },
    ]);

    expect(graph.toObject()).toMatchObject({
      x: {
        data: {},
        edges: ["y", "a", "z"],
      },
      y: {},
      z: {},
      a: {},
    });
  });

  test("reorder children", () => {
    graph.load({
      a: {
        data: {},
        edges: ["b", "c"],
      },
      b: {},
      c: {},
    });

    const ops = graph.update(
      "a",
      {},
      { children: [{ id: "c" }, { id: "b" }], removeKeyIfMissing: true }
    );

    expect(ops).toMatchObject([
      { p: ["a", "edges"], od: ["b", "c"], oi: ["c", "b"] },
    ]);

    expect(graph.toObject()).toMatchObject({
      a: {
        edges: ["c", "b"],
      },
      b: {},
      c: {},
    });
  });
});
