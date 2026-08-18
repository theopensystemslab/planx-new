import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Graph } from "@planx/graph";

import { getPatternCounts } from "./utils";

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
