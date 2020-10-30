import { add } from "./graph";

test("without id", () => {
  const [graph, ops] = add({ type: 100, data: { foo: "bar" } })();
  const {
    _root: {
      edges: [id],
    },
  } = graph;

  expect(graph).toMatchObject({
    _root: {
      edges: [id],
    },
    [id]: {
      type: 100,
      data: {
        foo: "bar",
      },
    },
  });

  expect(ops).toEqual([
    { oi: { edges: [id] }, p: ["_root"] },
    { oi: { data: { foo: "bar" }, type: 100 }, p: [id] },
  ]);
});

test("with children", () => {
  const [graph, ops] = add(
    { id: "a" },
    { children: [{ id: "a-a" }, { id: "a-b" }] }
  )();

  expect(graph).toEqual({
    _root: {
      edges: ["a"],
    },
    a: {
      edges: ["a-a", "a-b"],
    },
    "a-a": {},
    "a-b": {},
  });

  expect(ops).toEqual([
    { p: ["_root"], oi: { edges: ["a"] } },
    { p: ["a"], oi: { edges: ["a-a", "a-b"] } },
    { p: ["a-a"], oi: {} },
    { p: ["a-b"], oi: {} },
  ]);
});

test("empty graph", () => {
  const [graph, ops] = add({ id: "a" })();
  expect(graph).toEqual({
    _root: {
      edges: ["a"],
    },
    a: {},
  });
  expect(ops).toEqual([
    { oi: { edges: ["a"] }, p: ["_root"] },
    { oi: {}, p: ["a"] },
  ]);
});

test("existing graph", () => {
  const [graph, ops] = add({ id: "b" })({ _root: { edges: ["a"] }, a: {} });
  expect(graph).toEqual({
    _root: {
      edges: ["a", "b"],
    },
    a: {},
    b: {},
  });
  expect(ops).toEqual([
    { li: "b", p: ["_root", "edges", 1] },
    { p: ["b"], oi: {} },
  ]);
});

test("before item", () => {
  const [graph, ops] = add(
    { id: "c" },
    { before: "b" }
  )({
    _root: { edges: ["a", "b"] },
    a: {},
    b: {},
  });
  expect(graph).toEqual({
    _root: {
      edges: ["a", "c", "b"],
    },
    a: {},
    b: {},
    c: {},
  });
  expect(ops).toEqual([
    { ld: "b", li: "c", p: ["_root", "edges", 1] },
    { li: "b", p: ["_root", "edges", 2] },
    { p: ["c"], oi: {} },
  ]);
});

test("with parent, before item", () => {
  const [graph, ops] = add(
    { id: "c" },
    { before: "b", parent: "a" }
  )({
    _root: { edges: ["a"] },
    a: {
      edges: ["b"],
    },
    b: {},
  });
  expect(graph).toEqual({
    _root: {
      edges: ["a"],
    },
    a: {
      edges: ["c", "b"],
    },
    b: {},
    c: {},
  });
  expect(ops).toEqual([
    { ld: "b", li: "c", p: ["a", "edges", 0] },
    { li: "b", p: ["a", "edges", 1] },
    { oi: {}, p: ["c"] },
  ]);
});

describe("error handling", () => {
  test("invalid parent", () => {
    expect(() => add({ id: "c" }, { parent: "x" })()).toThrowError(
      "parent not found"
    );
  });

  test("id already exists", () => {
    expect(() => add({ id: "_root" })()).toThrowError("id exists");

    expect(() =>
      add({ id: "a" })({ _root: { edges: ["a"] }, a: {} })
    ).toThrowError("id exists");
  });

  test("invalid before item", () => {
    expect(() =>
      add(
        { id: "c" },
        { before: "x" }
      )({
        _root: { edges: ["a", "b"] },
        a: {},
        b: {},
      })
    ).toThrowError("before not found");
  });
});
