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

  expect(ops).toEqual([{ p: ["edges", 2], lm: 0 }]);
});

test("add node", () => {
  const ops = addNode({
    nodes: {},
    edges: [],
  })({ id: "test", foo: "bar" });
  expect(ops).toEqual([
    { oi: { foo: "bar" }, p: ["nodes", "test"] },
    { li: [null, "test"], p: ["edges", 0] },
  ]);
});

test("remove node", () => {
  const ops = removeNode({
    nodes: {
      aaa: "test",
    },
    edges: [[null, "aaa"]],
  })("aaa");

  expect(ops).toEqual([
    { od: "test", p: ["nodes", "aaa"] },
    { ld: [null, "aaa"], p: ["edges", 0] },
  ]);
});
