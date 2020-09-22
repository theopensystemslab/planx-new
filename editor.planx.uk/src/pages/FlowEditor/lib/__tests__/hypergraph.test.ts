import { enableMapSet, enablePatches, produceWithPatches } from "immer";
import colorize from "json-colorizer";

// ---- SETUP

enablePatches();
enableMapSet();

let count = 0;
const guid = () => (count++).toString();

const jlog = (json) => console.log(colorize(JSON.stringify(json, null, 2)));

// ----

type Graph = Map<string, Node>;

interface Node {
  id?: string;
  text?: string;
}

const removeNode = (graph: Graph = new Map([["_", {}]])) => (
  idToRemove: string
): Graph => {
  const [next, fwd, rev] = produceWithPatches(graph, (draft) => {
    draft.delete(idToRemove);

    draft.forEach((node, _id) => {
      if (Array.isArray(node[">"])) {
        let index;
        // using a for loop because indexOf/findIndex doesn't work with proxy
        for (let i = 0; i < node[">"].length; i++) {
          if (node[">"][i] === idToRemove) index = i;
        }
        if (index >= 0) node[">"].splice(index, 1);
      }
    });
  });

  jlog({ fwd, rev });

  return next;
};

const addNode = (graph: Graph = new Map([["_", {}]])) => (
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
): Graph => {
  const [next, fwd, rev] = produceWithPatches(graph, (draft) => {
    const parentId = parent ? parent : "_";

    if (!draft.has(parentId)) draft.set(parentId, {});
    draft.get(parentId)[">"] = draft.get(parentId)[">"] || [];

    draft.get(parentId)[">"].push(id);

    draft.set(id, node);

    children.forEach(({ id: childId = guid(), ...child }: Node) => {
      draft.set(childId, child);
      draft.get(id)[">"] = draft.get(id)[">"] || [];
      draft.get(id)[">"].push(childId);
    });
  });

  jlog({ fwd, rev });

  return next;
};

it("can add node with children", () => {
  const graph = addNode()(
    { text: "favourite colour" },
    {
      children: [{ text: "red" }, { text: "green" }, { text: "blue" }],
    }
  );
  expect(graph).toMatchInlineSnapshot(`
    Map {
      "_" => Object {
        ">": Array [
          "0",
        ],
      },
      "0" => Object {
        ">": Array [
          "1",
          "2",
          "3",
        ],
        "text": "favourite colour",
      },
      "1" => Object {
        "text": "red",
      },
      "2" => Object {
        "text": "green",
      },
      "3" => Object {
        "text": "blue",
      },
    }
  `);
});

it("can remove node", () => {
  const graph = removeNode(
    new Map([
      ["_", { ">": ["a"] }],
      ["a", { ">": ["b", "c"] }],
      ["b", {}],
      ["c", {}],
    ]) as Graph
  )("b");

  expect(graph).toMatchInlineSnapshot(`
    Map {
      "_" => Object {
        ">": Array [
          "a",
        ],
      },
      "a" => Object {
        ">": Array [
          "c",
        ],
      },
      "c" => Object {},
    }
  `);
});
