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
    graph.add(
      { id: "d", text: "question", type: 100 },
      { children: [{ text: "a1" }, { text: "a2" }] }
    );

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

  test("move a node", () => {
    graph.move("c", { fromParent: "a", toBefore: "b" });
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
});

describe("removing nodes", () => {
  beforeEach(loadGraph);

  test("remove a child node", () => {
    graph.remove("c");

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
    graph.remove("a");
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

    graph.update("a", { foo: "bar" });

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

    graph.update("a", { foo: "bar2" });

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

    graph.update("a", { foo: null });

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
