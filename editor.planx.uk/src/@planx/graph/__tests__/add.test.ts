import { add } from "..";

test("without id", () => {
  const [graph, ops] = add({ type: 100, data: { foo: "bar" } })();
  const {
    _root: {
      edges: [id],
    },
  } = graph as any;

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
    { children: [{ id: "a-a" }, { id: "a-b" }] },
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

test("with grandchildren and great-grandchildren", () => {
  const [graph, ops] = add(
    { id: "a" },
    {
      children: [
        {
          id: "a-a",
          children: [
            {
              id: "a-a-a",
              children: [
                {
                  id: "a-a-a-a",
                },
                {
                  id: "a-a-a-b",
                },
              ],
            },
          ],
        },
        { id: "a-b" },
      ],
    },
  )();

  expect(graph).toEqual({
    _root: {
      edges: ["a"],
    },
    a: {
      edges: ["a-a", "a-b"],
    },
    "a-a": {
      edges: ["a-a-a"],
    },
    "a-b": {},
    "a-a-a": {
      edges: ["a-a-a-a", "a-a-a-b"],
    },
    "a-a-a-a": {},
    "a-a-a-b": {},
  });

  expect(ops).toEqual([
    { oi: { edges: ["a"] }, p: ["_root"] },
    { oi: { edges: ["a-a", "a-b"] }, p: ["a"] },
    { oi: { edges: ["a-a-a"] }, p: ["a-a"] },
    { oi: { edges: ["a-a-a-a", "a-a-a-b"] }, p: ["a-a-a"] },
    { oi: {}, p: ["a-a-a-a"] },
    { oi: {}, p: ["a-a-a-b"] },
    { oi: {}, p: ["a-b"] },
  ]);
});

test("ignores empty values", () => {
  const [graph, ops] = add({
    id: "test",
    type: 100,
    data: {
      info: "\u200B​",
      policyRef: "​\n",
      empty: "​",
      another: "↵",
      howMeasured: undefined,
      text: "efef",
      description: " ​",
    },
  })({});
  expect(graph).toEqual({
    _root: {
      edges: ["test"],
    },
    test: {
      type: 100,
      data: {
        text: "efef",
      },
    },
  });
  expect(ops).toEqual([
    { oi: { edges: ["test"] }, p: ["_root"] },
    { oi: { data: { text: "efef" }, type: 100 }, p: ["test"] },
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
    { before: "b" },
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
    { before: "b", parent: "a" },
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

test("can add sections on the root of the graph", () => {
  const [graph, ops] = add(
    { id: "sectionNodeId", type: 360 },
    { before: "b", parent: "_root" },
  )({
    _root: { edges: ["a", "b"] },
    a: {},
    b: {},
  });
  expect(graph).toEqual({
    _root: { edges: ["a", "sectionNodeId", "b"] },
    a: {},
    b: {},
    sectionNodeId: { type: 360 },
  });
  expect(ops).toEqual([
    { ld: "b", li: "sectionNodeId", p: ["_root", "edges", 1] },
    { li: "b", p: ["_root", "edges", 2] },
    { oi: { type: 360 }, p: ["sectionNodeId"] },
  ]);
});

describe("error handling", () => {
  test("invalid parent", () => {
    expect(() => add({ id: "c" }, { parent: "x" })()).toThrow(
      "parent not found",
    );
  });

  test("id already exists", () => {
    expect(() => add({ id: "_root" })()).toThrow("id exists");

    expect(() => add({ id: "a" })({ _root: { edges: ["a"] }, a: {} })).toThrow(
      "id exists",
    );
  });

  test("invalid before item", () => {
    expect(() =>
      add(
        { id: "c" },
        { before: "x" },
      )({
        _root: { edges: ["a", "b"] },
        a: {},
        b: {},
      }),
    ).toThrow("before not found");
  });

  test("cannot add sections in positions with non-root parents", () => {
    expect(() =>
      add(
        { type: 360, data: { title: "Section 1" } },
        { parent: "b" },
      )({
        _root: { edges: ["a", "b"] },
        a: {},
        b: {},
      }),
    ).toThrow("cannot add sections on branches or in portals");
  });
});
