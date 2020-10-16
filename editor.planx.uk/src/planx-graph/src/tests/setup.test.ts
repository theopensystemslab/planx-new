import Graph from "../graph";

export let graph;

export const loadGraph = () =>
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

test("setup", () => {
  expect(graph.toObject()).toMatchObject({ _root: {} });
});
