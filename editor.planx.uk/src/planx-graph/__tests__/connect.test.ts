import { connect } from "..";

test("connect to existing node", () => {
  const [graph, ops] = connect(
    "a",
    "b"
  )({
    _root: {
      edges: ["a", "b"],
    },
    a: {},
    b: {},
  });

  expect(graph).toMatchObject({
    _root: {
      edges: ["a", "b"],
    },
    a: {
      edges: ["b"],
    },
    b: {},
  });

  expect(ops).toEqual([{ oi: ["b"], p: ["a", "edges"] }]);
});

describe("error handling", () => {
  test("existing node doesn't exist", () => {
    expect(() =>
      connect(
        "a",
        "c"
      )({
        _root: {
          edges: ["a"],
        },
        a: {},
      })
    ).toThrowError("existing node not found");
  });

  test("already connected to existing node", () => {
    expect(() =>
      connect(
        "a",
        "b"
      )({
        _root: {
          edges: ["a"],
        },
        a: {
          edges: ["b"],
        },
        b: {},
      })
    ).toThrowError("already connected to that node");
  });
});
