import Graph from "../graph";

const graph = new Graph();

it("can add a node with children", () => {
  graph.add({ text: "question", type: 100 }, [{ text: "a1" }, { text: "a2" }]);

  expect(graph).toMatchSnapshot();
});

it("remove a child node", () => {
  graph.remove("c");

  expect(graph).toMatchSnapshot();
});

it("remove a node with children", () => {
  graph.remove("a");

  expect(graph).toMatchSnapshot();
});
