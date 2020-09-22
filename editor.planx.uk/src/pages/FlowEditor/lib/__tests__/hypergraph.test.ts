import { enablePatches, produceWithPatches } from "immer";
import colorize from "json-colorizer";

// ---- SETUP

enablePatches();

let count = 0;
const guid = () => (count++).toString();

const jlog = (json) => console.log(colorize(JSON.stringify(json, null, 2)));

// ----

type Graph = Record<string, Node>;

interface Node {
  id?: string;
  text?: string;
}

const addNode = (graph: Graph) => (
  { id = guid(), ...node }: Node,
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
  const [next, fwd, rev] = produceWithPatches(graph, (draft) => {
    const parentId = parent ? parent : "_";

    draft[parentId][">"] = draft[parentId][">"] = [];
    draft[parentId][">"].push(id);

    draft[id] = node;

    children.forEach(({ id: childId = guid(), ...child }: Node) => {
      draft[childId] = child;
      draft[id][">"] = draft[id][">"] || [];
      draft[id][">"].push(childId);
    });
  });

  jlog({ fwd, rev });

  return next;
};

it("can add node with children", () => {
  let graph: Graph = { _: {} };
  graph = addNode(graph)(
    { text: "favourite colour" },
    {
      children: [{ text: "red" }, { text: "green" }, { text: "blue" }],
    }
  );
  expect(graph).toMatchInlineSnapshot(`
    Object {
      "0": Object {
        ">": Array [
          "1",
          "2",
          "3",
        ],
        "text": "favourite colour",
      },
      "1": Object {
        "text": "red",
      },
      "2": Object {
        "text": "green",
      },
      "3": Object {
        "text": "blue",
      },
      "_": Object {
        ">": Array [
          "0",
        ],
      },
    }
  `);
});
