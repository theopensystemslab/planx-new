import type { Graph } from "@planx/graph";

import { buildPatternGraphLayout } from "./buildPatternGraphLayout";

test("empty flow (root only) produces no nodes", () => {
  const graph: Graph = { _root: { edges: [] } };

  const layout = buildPatternGraphLayout(graph);

  expect(layout.nodes).toHaveLength(0);
  expect(layout.edges).toHaveLength(0);
});

test("counts every reachable non-root node once, across levels", () => {
  const graph: Graph = {
    _root: { edges: ["a", "b"] },
    a: { edges: ["c"] },
    b: { edges: [] },
    c: { edges: [] },
  };

  const layout = buildPatternGraphLayout(graph);

  expect(layout.nodes.map((n) => n.id).sort()).toEqual(["a", "b", "c"]);
  // Top-level nodes (direct children of root) have no drawn parent edge -
  // only the "a" -> "c" link is rendered
  expect(layout.edges).toHaveLength(1);
});

test("does not infinitely loop on a cloned/diamond reference", () => {
  const graph: Graph = {
    _root: { edges: ["a", "b"] },
    a: { edges: ["shared"] },
    b: { edges: ["shared"] },
    shared: { edges: [] },
  };

  const layout = buildPatternGraphLayout(graph);

  expect(layout.nodes.map((n) => n.id).sort()).toEqual(["a", "b", "shared"]);
  // "shared" is only linked from whichever parent reached it first
  expect(layout.edges).toHaveLength(1);
});

test("nodes are laid out top-to-bottom by level, never overlapping in y", () => {
  const graph: Graph = {
    _root: { edges: ["a"] },
    a: { edges: ["b"] },
    b: { edges: [] },
  };

  const layout = buildPatternGraphLayout(graph);
  const yById = Object.fromEntries(layout.nodes.map((n) => [n.id, n.y]));

  expect(yById.a).toBeLessThan(yById.b);
});
