import type { Graph } from "@planx/graph";

import { countPatternComponents } from "./countPatternComponents";

test("empty flow (root only) counts zero components", () => {
  const graph: Graph = { _root: { edges: [] } };

  expect(countPatternComponents(graph)).toBe(0);
});

test("counts every reachable non-root node once", () => {
  const graph: Graph = {
    _root: { edges: ["a", "b"] },
    a: { edges: ["c"] },
    b: { edges: [] },
    c: { edges: [] },
  };

  expect(countPatternComponents(graph)).toBe(3);
});

test("does not double-count a cloned/diamond reference", () => {
  const graph: Graph = {
    _root: { edges: ["a", "b"] },
    a: { edges: ["shared"] },
    b: { edges: ["shared"] },
    shared: { edges: [] },
  };

  expect(countPatternComponents(graph)).toBe(3);
});
