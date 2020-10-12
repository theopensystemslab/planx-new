import Graph from "../graph";

let graph;

beforeEach(() => {
  graph = new Graph();
});

test.only("reading nodes", () => {
  graph.load({
    _root: {
      edges: ["a"],
    },
    a: {
      edges: ["b"],
    },
    b: {},
  });

  expect(graph.currentNodeId).toEqual("a");
});
