import { graph, loadGraph } from "./setup.test";

describe("adding nodes", () => {
  test("nested, before another node", () => {
    loadGraph();

    const ops = graph.add({ id: "d", type: 100 }, { parent: "a", before: "c" });

    expect(ops).toEqual([
      { p: ["a", "edges", 1], li: "d" },
      { p: ["d"], oi: { type: 100, data: {} } },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: {
        edges: ["a"],
      },
      a: {
        edges: ["b", "d", "c"],
      },
      b: {},
      c: {},
      d: { type: 100 },
    });
  });

  test("ignores empty values", () => {
    graph.add({
      id: "test",
      type: 100,
      info: "\u200B​",
      policyRef: "​\n",
      empty: "​",
      another: "↵",
      howMeasured: undefined,
      text: "efef",
      description: " ​",
    });

    expect(graph.toObject()).toMatchObject({
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
  });

  test("add a node with children", () => {
    const ops = graph.add(
      {
        id: "d",
        text: "question",
        emptySoIgnore: "",
        newLineSoIgnore: "↵",
        type: 100,
      },
      { children: [{ text: "a1" }, { text: "a2" }] }
    );

    expect(ops).toEqual([
      { p: ["_root", "edges", 0], li: "d" },
      {
        p: ["d"],
        oi: { data: { text: "question" }, type: 100 },
      },
      { p: ["d", "edges"], oi: ["a"] },
      { p: ["a"], oi: { data: { text: "a1" }, type: 200 } },
      { p: ["d", "edges", 1], li: "b" },
      { p: ["b"], oi: { data: { text: "a2" }, type: 200 } },
    ]);

    expect(graph.toObject()).toMatchObject({
      _root: {
        edges: ["d"],
      },
      a: {
        data: {
          text: "a1",
        },
        type: 200,
      },
      b: {
        data: {
          text: "a2",
        },
        type: 200,
      },
      d: {
        data: {
          text: "question",
        },
        edges: ["a", "b"],
        type: 100,
      },
    });
  });
});
