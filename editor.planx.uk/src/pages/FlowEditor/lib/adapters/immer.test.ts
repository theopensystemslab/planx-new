import { addNode, moveNode, removeNode } from "./immer";

test("move node", () => {
  const ops = moveNode({
    nodes: {
      aaa: "",
      bbb: "",
      ccc: "",
      ddd: "",
    },
    edges: [
      [null, "aaa"],
      [null, "bbb"],
      [null, "ccc"],
      [null, "ddd"],
    ],
  })(null, "ccc", {
    beforeId: "aaa",
  });

  expect(ops).toMatchInlineSnapshot(`
    Array [
      Object {
        "lm": 0,
        "p": Array [
          "edges",
          2,
        ],
      },
    ]
  `);
});

test("add node", () => {
  const ops = addNode({
    nodes: {},
    edges: [],
  })({ id: "test", foo: "bar" });
  expect(ops).toMatchInlineSnapshot(`
    Array [
      Object {
        "li": Array [
          null,
          "test",
        ],
        "p": Array [
          "edges",
          0,
        ],
      },
      Object {
        "oi": Object {
          "foo": "bar",
        },
        "p": Array [
          "nodes",
          "test",
        ],
      },
    ]
  `);
});

test("remove node", () => {
  const ops = removeNode({
    nodes: {
      aaa: "test",
    },
    edges: [[null, "aaa"]],
  })("aaa");

  expect(ops).toMatchInlineSnapshot(`
    Array [
      Object {
        "ld": "test",
        "p": Array [
          "edges",
          0,
        ],
      },
      Object {
        "od": Array [
          null,
          "aaa",
        ],
        "p": Array [
          "nodes",
          "aaa",
        ],
      },
    ]
  `);
});
