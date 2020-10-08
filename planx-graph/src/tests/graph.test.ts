import Graph from "../graph";

const graph = new Graph();

test("add a node with children", () => {
  graph.add(
    { text: "question", type: 100 },
    { children: [{ text: "a1" }, { text: "a2" }] }
  );

  expect(graph).toMatchSnapshot();
});

test("move a node", () => {
  graph.move("c", { fromParent: "a", toBefore: "b" });

  expect(graph).toMatchSnapshot();
});

test("remove a child node", () => {
  graph.remove("c");

  expect(graph).toMatchSnapshot();
});

test("remove a node with children", () => {
  graph.remove("a");

  expect(graph).toMatchSnapshot();
});
