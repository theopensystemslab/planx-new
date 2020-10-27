import { graph } from "./setup.test";

test("reading nodes", () => {
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
