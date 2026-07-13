import type { Graph } from "@planx/graph";
import { describe, expect, it } from "vitest";

import {
  findContainerOf,
  repositionPlacementAfterDeletion,
  resolveNotePlacement,
  resolveNoteRenderCoordinate,
} from "./notePlacement";

// _root -> nodeA -> nodeB -> nodeC (a plain linear root-level sequence,
const linearFlow: Graph = {
  _root: { edges: ["nodeA", "nodeB", "nodeC"] },
  nodeA: { type: 8, data: { title: "Node A" } },
  nodeB: { type: 8, data: { title: "Node B" } },
  nodeC: { type: 8, data: { title: "Node C" } },
};

describe("findContainerOf", () => {
  it("finds the node whose edges contain the given id", () => {
    expect(findContainerOf(linearFlow, "nodeB")).toBe("_root");
  });

  it("returns undefined for a node with no container (e.g. _root itself)", () => {
    expect(findContainerOf(linearFlow, "_root")).toBeUndefined();
  });
});

describe("resolveNotePlacement (encode)", () => {
  it("anchors to the preceding sibling when one exists", () => {
    // note between nodeA and nodeB
    expect(resolveNotePlacement(linearFlow, "_root", "nodeB")).toEqual({
      parent: "nodeA",
    });
  });

  it("anchors to the last child when trailing (no `before` given, preceding sibling exists)", () => {
    expect(resolveNotePlacement(linearFlow, "_root", undefined)).toEqual({
      parent: "nodeC",
    });
  });

  it("falls back to container + before when there is no preceding sibling (leading position)", () => {
    expect(resolveNotePlacement(linearFlow, "_root", "nodeA")).toEqual({
      parent: "_root",
      before: "nodeA",
    });
  });

  it("falls back to container with no before when the container is empty", () => {
    const flow: Graph = { _root: {} };
    expect(resolveNotePlacement(flow, "_root", undefined)).toEqual({
      parent: "_root",
      before: undefined,
    });
  });
});

describe("resolveNoteRenderCoordinate (decode)", () => {
  it("resolves a sibling-anchored placement to (its container, the next sibling)", () => {
    expect(
      resolveNoteRenderCoordinate(linearFlow, { parent: "nodeA" }),
    ).toEqual({ container: "_root", before: "nodeB" });
  });

  it("resolves a trailing sibling anchor (last child) to (container, undefined)", () => {
    expect(
      resolveNoteRenderCoordinate(linearFlow, { parent: "nodeC" }),
    ).toEqual({ container: "_root", before: undefined });
  });

  it("resolves a container-anchored (leading) placement directly", () => {
    expect(
      resolveNoteRenderCoordinate(linearFlow, {
        parent: "_root",
        before: "nodeA",
      }),
    ).toEqual({ container: "_root", before: "nodeA" });
  });

  it("treats parent === _root as a container even with no before", () => {
    expect(
      resolveNoteRenderCoordinate(linearFlow, { parent: "_root" }),
    ).toEqual({ container: "_root", before: undefined });
  });

  it("round-trips through encode then decode back to the original gap", () => {
    const gaps: Array<{ container: string; before?: string }> = [
      { container: "_root", before: "nodeA" },
      { container: "_root", before: "nodeB" },
      { container: "_root", before: "nodeC" },
      { container: "_root", before: undefined },
    ];

    for (const gap of gaps) {
      const placement = resolveNotePlacement(
        linearFlow,
        gap.container,
        gap.before,
      );
      expect(resolveNoteRenderCoordinate(linearFlow, placement)).toEqual(gap);
    }
  });
});

describe("repositionPlacementAfterDeletion", () => {
  it("re-anchors to the surviving sibling before the deleted anchor", () => {
    // nodeB deleted; a note anchored to nodeB (i.e. after nodeB) should
    // move to being anchored after nodeA instead
    const after = {
      _root: { edges: ["nodeA", "nodeC"] },
      nodeA: linearFlow.nodeA,
      nodeC: linearFlow.nodeC,
    };

    expect(
      repositionPlacementAfterDeletion(
        linearFlow,
        after,
        "nodeB",
        new Set(["nodeB"]),
      ),
    ).toEqual({ parent: "nodeA" });
  });

  it("walks back past other siblings deleted in the same operation", () => {
    // nodeA and nodeB both deleted (e.g. a cascade); a note anchored to
    // nodeB should fall back to leading position in _root
    const after = { _root: { edges: ["nodeC"] }, nodeC: linearFlow.nodeC };

    expect(
      repositionPlacementAfterDeletion(
        linearFlow,
        after,
        "nodeB",
        new Set(["nodeA", "nodeB"]),
      ),
    ).toEqual({ parent: "_root", before: "nodeC" });
  });

  it("falls back to leading-in-container when the deleted anchor had no preceding sibling", () => {
    const after = {
      _root: { edges: ["nodeB", "nodeC"] },
      nodeB: linearFlow.nodeB,
      nodeC: linearFlow.nodeC,
    };

    expect(
      repositionPlacementAfterDeletion(
        linearFlow,
        after,
        "nodeA",
        new Set(["nodeA"]),
      ),
    ).toEqual({ parent: "_root", before: "nodeB" });
  });

  it("returns an empty-container leading placement when nothing survives", () => {
    const after = { _root: {} };

    expect(
      repositionPlacementAfterDeletion(
        linearFlow,
        after,
        "nodeA",
        new Set(["nodeA", "nodeB", "nodeC"]),
      ),
    ).toEqual({ parent: "_root", before: undefined });
  });

  it("returns null when the deleted anchor's own container was also deleted", () => {
    const flow = {
      _root: { edges: ["folder"] },
      folder: { type: 300, edges: ["child"] },
      child: { type: 8 },
    };
    const after = { _root: {} };

    expect(
      repositionPlacementAfterDeletion(
        flow,
        after,
        "child",
        new Set(["folder", "child"]),
      ),
    ).toBeNull();
  });
});
