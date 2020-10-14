import Graph from "../graph";

let graph;

const loadGraph = () =>
  graph.load({
    _root: {
      edges: ["a"],
    },
    a: {
      edges: ["b", "c"],
    },
    b: {},
    c: {},
  });

beforeEach(() => {
  graph = new Graph();
});

describe("adding nodes", () => {
  test("add a node with children", () => {
    const ops = graph.add(
      { id: "d", text: "question", type: 100 },
      { children: [{ text: "a1" }, { text: "a2" }] }
    );

    expect(ops).toEqual([
      { p: ["_root", "edges"], li: "d" },
      {
        p: ["d"],
        oi: { data: { text: "question" }, edges: [], type: 100 },
      },
      { p: ["d", "edges"], li: "a" },
      { p: ["a"], oi: { data: { text: "a1" }, edges: [], type: 200 } },
      { p: ["d", "edges"], li: "b" },
      { p: ["b"], oi: { data: { text: "a2" }, edges: [], type: 200 } },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: {
        edges: ["d"],
      },
      a: {
        data: {
          text: "a1",
        },
        edges: [],
        type: 200,
      },
      b: {
        data: {
          text: "a2",
        },
        edges: [],
        type: 200,
      },
      d: {
        data: {
          text: "question",
        },
        edges: ["a", "b"],
        type: 100,
      },
    });
  });
});

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

describe("removing nodes", () => {
  beforeEach(loadGraph);

  test("remove a child node", () => {
    const ops = graph.remove("c");

    expect(ops).toEqual([
      { p: "c", od: {} },
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
    const ops = graph.remove("a");

    expect(ops).toEqual([
      { p: "b", od: {} },
      { p: ["a", "edges", 0], ld: "b" },
      { p: "a", od: { edges: ["c"] } },
      { p: ["_root", "edges", 0], ld: "a" },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: {
        edges: [],
      },
    });
  });
});

describe("updating a node", () => {
  test("add a field to a without affecting existing data", () => {
    graph.load({
      _root: {
        edges: ["a"],
      },
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
      _root: {
        edges: ["a"],
      },
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
      _root: {
        edges: ["a"],
      },
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
      _root: {
        edges: ["a"],
      },
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
      _root: {
        edges: ["a"],
      },
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
      _root: {
        edges: ["a"],
      },
      a: {
        data: {
          xyz: 1,
        },
        edges: ["b"],
      },
      b: {},
    });
  });
});
