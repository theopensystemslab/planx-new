import { makeUnique } from "..";

let count = 0;
const deterministicId = () => `TEST_ID_${count++}`;

describe("making unique", () => {
  beforeEach(() => {
    count = 0;
  });

  test("clones and their children should become unique", () => {
    const [graph, ops] = makeUnique("clone", undefined, {
      idFn: deterministicId,
    })({
      _root: { edges: ["foo", "clone"] },
      foo: {
        edges: ["clone"],
      },
      clone: {
        edges: ["cloneChild1", "cloneChild2"],
      },
      cloneChild1: {},
      cloneChild2: {},
    });

    expect(graph).toEqual({
      _root: { edges: ["foo", "clone", "TEST_ID_0"] },
      foo: {
        edges: ["clone"],
      },
      clone: {
        edges: ["cloneChild1", "cloneChild2"],
      },
      cloneChild1: {},
      cloneChild2: {},
      TEST_ID_0: {
        edges: ["TEST_ID_1", "TEST_ID_2"],
      },
      TEST_ID_1: {},
      TEST_ID_2: {},
    });

    expect(ops).toEqual([
      { li: "TEST_ID_0", p: ["_root", "edges", 2] },
      { oi: { edges: ["TEST_ID_1", "TEST_ID_2"] }, p: ["TEST_ID_0"] },
      { oi: {}, p: ["TEST_ID_1"] },
      { oi: {}, p: ["TEST_ID_2"] },
    ]);
  });

  test("portals, node descendents (except clones) should become unique", () => {
    const [graph, ops] = makeUnique("portal", "_root", {
      idFn: deterministicId,
    })({
      _root: { edges: ["portal", "clone"] },
      portal: {
        type: 300,
        edges: ["x", "clone"],
      },
      x: {
        type: 2,
        edges: ["y"],
      },
      y: {
        edges: ["z"],
      },
      z: {},
      clone: {
        type: 1,
        edges: ["cloneChild"],
      },
      cloneChild: {},
    });

    expect(graph).toEqual({
      _root: { edges: ["portal", "clone", "TEST_ID_0"] },
      portal: {
        type: 300,
        edges: ["x", "clone"],
      },
      x: {
        type: 2,
        edges: ["y"],
      },
      y: {
        edges: ["z"],
      },
      z: {},
      clone: {
        type: 1,
        edges: ["cloneChild"],
      },
      cloneChild: {},
      TEST_ID_0: { edges: ["TEST_ID_1", "clone"], type: 300 },
      TEST_ID_1: { edges: ["TEST_ID_2"], type: 2 },
      TEST_ID_2: { edges: ["TEST_ID_3"] },
      TEST_ID_3: {},
    });

    expect(ops).toEqual([
      { li: "TEST_ID_0", p: ["_root", "edges", 2] },
      { oi: { edges: ["TEST_ID_1", "clone"], type: 300 }, p: ["TEST_ID_0"] },
      { oi: { edges: ["TEST_ID_2"], type: 2 }, p: ["TEST_ID_1"] },
      { oi: { edges: ["TEST_ID_3"] }, p: ["TEST_ID_2"] },
      { oi: {}, p: ["TEST_ID_3"] },
    ]);
  });
});
