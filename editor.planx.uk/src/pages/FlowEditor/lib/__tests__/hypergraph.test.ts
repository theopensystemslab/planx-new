import produce from "immer";

interface Node {
  id: string;
  text: string;
}

const addNode = (graph) => (
  { id, ...node }: Node,
  {
    // before = null,
    children = [],
    parent = null,
  }: {
    // before?: string;
    children?: Array<Node>;
    parent?: string;
  }
) => {
  produce(graph, () => {
    const parentId = parent ? parent : "_";

    graph[parentId][">"] = graph[parentId][">"] = [];
    graph[parentId][">"].push(id);

    graph[id] = node;

    children.forEach(({ id: childId, ...child }) => {
      graph[childId] = child;
      graph[id][">"] = graph[id][">"] || [];
      graph[id][">"].push(childId);
    });
  });
};

it("can add node", () => {
  const graph = { _: {} };
  addNode(graph)(
    { id: "favecolour", text: "favourite colour" },
    {
      children: [
        { id: "red", text: "red" },
        { id: "green", text: "green" },
        { id: "blue", text: "blue" },
      ],
    }
  );
  expect(graph).toMatchInlineSnapshot(`
    Object {
      "_": Object {
        ">": Array [
          "favecolour",
        ],
      },
      "blue": Object {
        "text": "blue",
      },
      "favecolour": Object {
        ">": Array [
          "red",
          "green",
          "blue",
        ],
        "text": "favourite colour",
      },
      "green": Object {
        "text": "green",
      },
      "red": Object {
        "text": "red",
      },
    }
  `);
});
