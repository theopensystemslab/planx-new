import { remove } from "..";

test("with clones", () => {
  const [graph, ops] = remove(
    "a",
    "_root",
  )({
    _root: {
      edges: ["a", "clone"],
    },
    a: {
      edges: ["clone"],
    },
    clone: {},
  });
  expect(graph).toMatchObject({
    _root: {
      edges: ["clone"],
    },
    clone: {},
  });
  expect(ops).toEqual([
    { ld: "a", li: "clone", p: ["_root", "edges", 0] },
    { ld: "clone", p: ["_root", "edges", 1] },
    { od: { edges: ["clone"] }, p: ["a"] },
  ]);
});

test("final node with id", () => {
  const [graph, ops] = remove(
    "a",
    "_root",
  )({
    _root: {
      edges: ["a"],
    },
    a: {
      edges: ["b", "c"],
    },
    b: {},
    c: {
      edges: ["d"],
    },
    d: {},
  });
  // The `_root` node is never fully deleted, rather just "emptied out"
  expect(graph).toEqual({ _root: { edges: [] } });
  expect(ops).toEqual([
    { ld: "a", p: ["_root", "edges", 0] },
    { od: {}, p: ["b"] },
    { od: { edges: ["b", "c"] }, p: ["a"] },
    { od: { edges: ["d"] }, p: ["c"] },
    { od: {}, p: ["d"] },
  ]);
});

describe("error handling", () => {
  test("invalid id", () => {
    expect(() => {
      remove("b", "_root")();
    }).toThrow("id not found");
  });

  test("invalid parent", () => {
    expect(() => {
      remove(
        "a",
        "fpp",
      )({
        _root: {
          edges: ["a"],
        },
        a: {},
      });
    }).toThrow("parent not found");
  });
});
