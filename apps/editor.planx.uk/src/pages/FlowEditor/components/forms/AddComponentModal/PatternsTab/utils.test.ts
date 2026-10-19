import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Graph } from "@planx/graph";

import { getPatternComponentTypes, getPatternCounts } from "./utils";

describe("getPatternCounts", () => {
  it("returns zeros for an empty graph", () => {
    const graph: Graph = { _root: { edges: [] } };

    expect(getPatternCounts(graph)).toEqual({ components: 0, nestedFlows: 0 });
  });

  it("counts regular components", () => {
    const graph: Graph = {
      _root: { edges: ["a", "b"] },
      a: { type: ComponentType.Question },
      b: { type: ComponentType.Notice },
    };

    expect(getPatternCounts(graph)).toEqual({ components: 2, nestedFlows: 0 });
  });

  it("excludes Answer nodes from the count", () => {
    const graph: Graph = {
      _root: { edges: ["q"] },
      q: { type: ComponentType.Question, edges: ["a1", "a2"] },
      a1: { type: ComponentType.Answer },
      a2: { type: ComponentType.Answer },
    };

    expect(getPatternCounts(graph)).toEqual({ components: 1, nestedFlows: 0 });
  });

  it("excludes Note nodes from the count", () => {
    const graph: Graph = {
      _root: { edges: ["q", "n"] },
      q: { type: ComponentType.Question },
      n: { type: ComponentType.Note },
    };

    expect(getPatternCounts(graph)).toEqual({ components: 1, nestedFlows: 0 });
  });

  it("counts ExternalPortals as nested flows", () => {
    const graph: Graph = {
      _root: { edges: ["a", "ep"] },
      a: { type: ComponentType.Question },
      ep: { type: ComponentType.ExternalPortal, data: { flowId: "xyz" } },
    };

    expect(getPatternCounts(graph)).toEqual({ components: 1, nestedFlows: 1 });
  });

  it("counts InternalPortals as components", () => {
    const graph: Graph = {
      _root: { edges: ["a", "ip"] },
      a: { type: ComponentType.Question },
      ip: { type: ComponentType.InternalPortal, edges: ["b"] },
      b: { type: ComponentType.Notice },
    };

    expect(getPatternCounts(graph)).toEqual({ components: 3, nestedFlows: 0 });
  });

  it("counts clones each time they appear in an edge array", () => {
    const graph: Graph = {
      _root: { edges: ["q1", "q2"] },
      q1: { type: ComponentType.Question, edges: ["shared"] },
      q2: { type: ComponentType.Question, edges: ["shared"] },
      shared: { type: ComponentType.Notice },
    };

    expect(getPatternCounts(graph)).toEqual({ components: 4, nestedFlows: 0 });
  });
});

describe("getPatternComponentTypes", () => {
  it("returns an empty array for an empty graph", () => {
    const graph: Graph = { _root: { edges: [] } };

    expect(getPatternComponentTypes(graph, 6)).toEqual([]);
  });

  it("returns component types in flow order, traversing through Answers", () => {
    const graph: Graph = {
      _root: { edges: ["q", "n"] },
      q: { type: ComponentType.Question, edges: ["a1", "a2"] },
      a1: { type: ComponentType.Answer, edges: ["tf"] },
      a2: { type: ComponentType.Answer },
      tf: { type: ComponentType.TextInput },
      n: { type: ComponentType.Notice },
    };

    expect(getPatternComponentTypes(graph, 6)).toEqual([
      ComponentType.Question,
      ComponentType.TextInput,
      ComponentType.Notice,
    ]);
  });

  it("excludes Notes", () => {
    const graph: Graph = {
      _root: { edges: ["n", "q"] },
      n: { type: ComponentType.Note },
      q: { type: ComponentType.Question },
    };

    expect(getPatternComponentTypes(graph, 6)).toEqual([
      ComponentType.Question,
    ]);
  });

  it("includes nested flows and internal portal contents", () => {
    const graph: Graph = {
      _root: { edges: ["ip", "ep"] },
      ip: { type: ComponentType.InternalPortal, edges: ["c"] },
      c: { type: ComponentType.Content },
      ep: { type: ComponentType.ExternalPortal, data: { flowId: "xyz" } },
    };

    expect(getPatternComponentTypes(graph, 6)).toEqual([
      ComponentType.InternalPortal,
      ComponentType.Content,
      ComponentType.ExternalPortal,
    ]);
  });

  it("stops at the given limit", () => {
    const graph: Graph = {
      _root: { edges: ["a", "b", "c"] },
      a: { type: ComponentType.Notice },
      b: { type: ComponentType.Content },
      c: { type: ComponentType.Question },
    };

    expect(getPatternComponentTypes(graph, 2)).toEqual([
      ComponentType.Notice,
      ComponentType.Content,
    ]);
  });
});
